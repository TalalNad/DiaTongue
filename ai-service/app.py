import io
import traceback
import os
import sys
import cv2
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import joblib
import albumentations as A
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp
import pandas as pd
from torchvision.models import swin_t

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel

# -----------------------
# Config
# -----------------------
SEG_CKPT = os.getenv("SEG_CKPT", "models/best_unetplusplus_efficientnetb0.pth")
CLF_CKPT = os.getenv("CLF_CKPT", "models/swin_tiny_best_finetuned.pth")
CLIN_PIPE = os.getenv("CLIN_PIPE", "models/clinical_xgboost_pipeline.joblib")
FUSION_JOBLIB = os.getenv("FUSION_JOBLIB", "models/weighted_fusion_model.joblib")

SEG_SIZE = 256
OUT_SIZE = 224

DIABETES_INDEX = int(os.getenv("DIABETES_INDEX", "0"))
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI(title="Tongue T2DM API")

# -----------------------
# Globals
# -----------------------
seg_model = None
clf_model = None
clin_pipe = None
fusion_model = None
MODELS_READY_IMG = False
MODELS_READY_CLIN = False
MODELS_READY_FUSION = False

infer_transform = A.Compose([
    A.Resize(SEG_SIZE, SEG_SIZE),
    A.Normalize(),
    ToTensorV2()
])


class WeightedFusionModel:
    def __init__(self, clinical_weight=0.5, image_weight=0.5, threshold=0.5):
        self.clinical_weight = clinical_weight
        self.image_weight = image_weight
        self.threshold = threshold

    def predict_proba(self, clinical_prob, image_prob=None):
        if image_prob is None:
            probs = np.asarray(clinical_prob, dtype=float)
            if probs.ndim != 2 or probs.shape[1] != 2:
                raise ValueError("Expected two columns: clinical_prob and image_prob")
            clinical_prob = probs[:, 0]
            image_prob = probs[:, 1]
            fused_prob = self._fuse(clinical_prob, image_prob)
            return np.column_stack([1.0 - fused_prob, fused_prob])

        return self._fuse(clinical_prob, image_prob)

    def predict(self, clinical_prob, image_prob=None):
        probs = self.predict_proba(clinical_prob, image_prob)
        if image_prob is None:
            probs = probs[:, 1]
        return (np.asarray(probs) >= self.threshold).astype(int)

    def _fuse(self, clinical_prob, image_prob):
        clinical_prob = np.asarray(clinical_prob, dtype=float)
        image_prob = np.asarray(image_prob, dtype=float)
        return self.clinical_weight * clinical_prob + self.image_weight * image_prob


setattr(sys.modules["__main__"], "WeightedFusionModel", WeightedFusionModel)

@app.get("/health")
def health():
    return {
        "ok": True,
        "device": str(device),
        "img_models_loaded": MODELS_READY_IMG,
        "clin_loaded": MODELS_READY_CLIN,
        "fusion_loaded": MODELS_READY_FUSION,
    }

def load_image_models():
    global seg_model, clf_model, MODELS_READY_IMG
    if MODELS_READY_IMG:
        return

    seg_model = smp.UnetPlusPlus(
        encoder_name="efficientnet-b0",
        encoder_weights=None,
        in_channels=3,
        classes=1,
        activation=None
    ).to(device)
    seg_model.load_state_dict(torch.load(SEG_CKPT, map_location=device))
    seg_model.eval()

    clf_model = swin_t(weights=None)
    clf_model.head = nn.Linear(clf_model.head.in_features, 1)
    clf_model.load_state_dict(torch.load(CLF_CKPT, map_location=device))
    clf_model = clf_model.to(device)
    clf_model.eval()

    MODELS_READY_IMG = True

def load_clin_model():
    global clin_pipe, MODELS_READY_CLIN
    if MODELS_READY_CLIN:
        return
    try:
        clin_pipe = joblib.load(CLIN_PIPE)
        MODELS_READY_CLIN = True
    except Exception as e:
        # Keep server alive; only clinical endpoints fail
        raise HTTPException(
            status_code=500,
            detail=f"Clinical model failed to load. Likely scikit-learn version mismatch. Error: {repr(e)}"
        )

def load_fusion_model():
    global fusion_model, MODELS_READY_FUSION
    if MODELS_READY_FUSION:
        return
    try:
        fusion_model = joblib.load(FUSION_JOBLIB)
        MODELS_READY_FUSION = True
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion model failed to load: {repr(e)}")

# -----------------------
# Helpers
# -----------------------
def _read_image_to_bgr(file_bytes: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    rgb = np.array(img)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

def _mask_to_original(mask: np.ndarray, orig_h: int, orig_w: int) -> np.ndarray:
    resized = cv2.resize(mask.astype("uint8"), (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
    return (resized > 0).astype("uint8")

def _clean_mask(mask01: np.ndarray) -> np.ndarray:
    mask = (mask01 > 0).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)

    if num_labels > 1:
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        mask = (labels == largest).astype(np.uint8)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    return mask

def _crop_tongue(image_rgb: np.ndarray, mask01: np.ndarray, padding_ratio=0.08):
    ys, xs = np.where(mask01 > 0)
    if len(ys) == 0 or len(xs) == 0:
        raise HTTPException(status_code=422, detail="No tongue detected (empty mask).")

    x1, x2 = int(xs.min()), int(xs.max())
    y1, y2 = int(ys.min()), int(ys.max())
    h, w = image_rgb.shape[:2]

    pad_x = int((x2 - x1 + 1) * padding_ratio)
    pad_y = int((y2 - y1 + 1) * padding_ratio)

    x1 = max(0, x1 - pad_x)
    x2 = min(w - 1, x2 + pad_x)
    y1 = max(0, y1 - pad_y)
    y2 = min(h - 1, y2 + pad_y)

    return image_rgb[y1:y2 + 1, x1:x2 + 1], mask01[y1:y2 + 1, x1:x2 + 1]

def _gray_world_white_balance(image_rgb: np.ndarray, strength=0.4) -> np.ndarray:
    image = image_rgb.astype(np.float32)
    non_black = np.any(image > 0, axis=-1)

    if not np.any(non_black):
        return image_rgb

    mean_rgb = image[non_black].mean(axis=0)
    gray = mean_rgb.mean()
    scale = gray / (mean_rgb + 1e-8)

    corrected = image.copy()
    corrected[..., 0] *= 1 + strength * (scale[0] - 1)
    corrected[..., 1] *= 1 + strength * (scale[1] - 1)
    corrected[..., 2] *= 1 + strength * (scale[2] - 1)
    corrected = np.clip(corrected, 0, 255).astype(np.uint8)
    corrected[~non_black] = 0
    return corrected

def _resize_and_pad(image_rgb: np.ndarray, size=224) -> np.ndarray:
    h, w = image_rgb.shape[:2]
    scale = size / max(h, w)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))

    resized = cv2.resize(image_rgb, (new_w, new_h))
    canvas = np.zeros((size, size, 3), dtype=np.uint8)
    x0 = (size - new_w) // 2
    y0 = (size - new_h) // 2
    canvas[y0:y0 + new_h, x0:x0 + new_w] = resized
    return canvas

def _preprocess_for_classifier(orig_bgr: np.ndarray, mask01: np.ndarray, out_size=224):
    image_rgb = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2RGB)
    mask = _clean_mask(mask01)

    cropped_image, cropped_mask = _crop_tongue(image_rgb, mask)
    segmented = cropped_image.copy()
    segmented[cropped_mask == 0] = 0

    balanced = _gray_world_white_balance(segmented)
    return _resize_and_pad(balanced, size=out_size)

@torch.no_grad()
def _predict_p_img(bgr: np.ndarray) -> float:
    if not MODELS_READY_IMG:
        load_image_models()

    orig_h, orig_w = bgr.shape[:2]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

    aug = infer_transform(image=rgb)
    x = aug["image"].unsqueeze(0).to(device)

    logits = seg_model(x)
    probs = torch.sigmoid(logits)[0, 0].detach().cpu().numpy()
    mask_256 = (probs > 0.5).astype("float32")

    mask_orig = _mask_to_original(mask_256, orig_h, orig_w)
    tongue_224_rgb = _preprocess_for_classifier(bgr, mask_orig, out_size=OUT_SIZE)

    t = torch.from_numpy(tongue_224_rgb).float() / 255.0
    t = t.permute(2, 0, 1).unsqueeze(0).to(device)

    mean = torch.tensor([0.485, 0.456, 0.406], device=device).view(1, 3, 1, 1)
    std  = torch.tensor([0.229, 0.224, 0.225], device=device).view(1, 3, 1, 1)
    t = (t - mean) / std

    out = clf_model(t)
    if out.shape[-1] == 1:
        return float(torch.sigmoid(out).reshape(-1)[0].item())

    p = torch.softmax(out, dim=1)[0]
    return float(p[DIABETES_INDEX].item())

def _predict_p_clin(clin_dict: dict) -> float:
    if not MODELS_READY_CLIN:
        load_clin_model()

    df = pd.DataFrame([{
        "age": clin_dict["age"],
        "bmi": clin_dict["bmi"],
        "hypertension": clin_dict["hypertension"],
        "heart_disease": clin_dict["heart_disease"],
        "gender": str(clin_dict["gender"]).strip().lower(),
        "smoking_history": str(clin_dict["smoking_history"]).strip().lower(),
    }])
    return float(clin_pipe.predict_proba(df)[:, 1][0])

def _predict_p_fused(p_clin: float, p_img: float) -> float:
    if not MODELS_READY_FUSION:
        load_fusion_model()

    if isinstance(fusion_model, WeightedFusionModel):
        p_fused = fusion_model.predict_proba([p_clin], [p_img])
        return float(np.asarray(p_fused, dtype=float).reshape(-1)[0])

    X = np.array([[p_clin, p_img]], dtype=float)
    p_fused = fusion_model.predict_proba(X)
    p_fused = np.asarray(p_fused, dtype=float)

    if p_fused.ndim == 2 and p_fused.shape[1] > 1:
        return float(p_fused[:, 1][0])

    return float(p_fused.reshape(-1)[0])

# -----------------------
# Endpoints
# -----------------------
class ClinicalJSON(BaseModel):
    age: float
    bmi: float
    hypertension: int
    heart_disease: int
    gender: str
    smoking_history: str

@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    img_bytes = await file.read()
    bgr = _read_image_to_bgr(img_bytes)
    p_img = _predict_p_img(bgr)
    return {"p_img": p_img}

@app.post("/predict/clinical")
async def predict_clinical(clin: ClinicalJSON):
    p_clin = _predict_p_clin(clin.model_dump())
    return {"p_clin": p_clin}

@app.post("/predict/fusion")
async def predict_fusion(
    file: UploadFile = File(...),
    age: float = Form(...),
    bmi: float = Form(...),
    hypertension: int = Form(...),
    heart_disease: int = Form(...),
    gender: str = Form(...),
    smoking_history: str = Form(...)
):
    # Image
    img_bytes = await file.read()
    bgr = _read_image_to_bgr(img_bytes)
    p_img = _predict_p_img(bgr)

    # Clinical
    clin_dict = {
        "age": age,
        "bmi": bmi,
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "gender": gender,
        "smoking_history": smoking_history,
    }
    p_clin = _predict_p_clin(clin_dict)

    p_fused = _predict_p_fused(p_clin, p_img)

    return {"p_fused": p_fused, "p_img": p_img, "p_clin": p_clin}
