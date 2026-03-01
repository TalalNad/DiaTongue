import io
import os
import cv2
import numpy as np
from PIL import Image

import torch
import timm
import joblib
import albumentations as A
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp
import pandas as pd

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel

# -----------------------
# Config
# -----------------------
SEG_CKPT = os.getenv("SEG_CKPT", "models/tongue_unetpp_effb3_best.pt")
CLF_CKPT = os.getenv("CLF_CKPT", "models/best_classifier_finetuned.pth")
CLIN_PIPE = os.getenv("CLIN_PIPE", "models/clinical_xgboost_pipeline.joblib")
FUSION_JOBLIB = os.getenv("FUSION_JOBLIB", "models/fusion_logreg.joblib")

SEG_SIZE = 512
OUT_SIZE = 224

DIABETES_INDEX = int(os.getenv("DIABETES_INDEX", "1"))
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

# Albumentations transform (remove unsupported args to avoid warning)
infer_transform = A.Compose([
    A.LongestMaxSize(max_size=SEG_SIZE),
    A.PadIfNeeded(SEG_SIZE, SEG_SIZE, border_mode=cv2.BORDER_CONSTANT, position="center"),
    A.Normalize(),
    ToTensorV2()
])

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

    # Segmentation
    seg_model = smp.UnetPlusPlus(
        encoder_name="timm-efficientnet-b0",
        encoder_weights=None,
        in_channels=3,
        classes=1
    ).to(device)
    seg_model.load_state_dict(torch.load(SEG_CKPT, map_location=device))
    seg_model.eval()

    # Classifier
    clf_model = timm.create_model("tf_efficientnet_b0", pretrained=False, num_classes=2).to(device)
    clf_model.load_state_dict(torch.load(CLF_CKPT, map_location=device))
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

def _letterbox_params(orig_h, orig_w, size):
    scale = min(size / float(orig_h), size / float(orig_w))
    new_h = int(round(orig_h * scale))
    new_w = int(round(orig_w * scale))
    pad_h = size - new_h
    pad_w = size - new_w
    top = pad_h // 2
    bottom = pad_h - top
    left = pad_w // 2
    right = pad_w - left
    return (top, bottom, left, right)

def _mask_to_original(mask_512, orig_h, orig_w, size=512):
    top, bottom, left, right = _letterbox_params(orig_h, orig_w, size)
    h, w = mask_512.shape

    y0 = top
    y1 = h - bottom if bottom > 0 else h
    x0 = left
    x1 = w - right if right > 0 else w

    cropped = mask_512[y0:y1, x0:x1]
    resized = cv2.resize(cropped, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
    return (resized > 0.5).astype("uint8")

def _gray_world_white_balance(bgr: np.ndarray) -> np.ndarray:
    img = bgr.astype(np.float32)
    b, g, r = cv2.split(img)
    mean_b, mean_g, mean_r = b.mean(), g.mean(), r.mean()
    mean_gray = (mean_b + mean_g + mean_r) / 3.0 + 1e-6
    b *= mean_gray / (mean_b + 1e-6)
    g *= mean_gray / (mean_g + 1e-6)
    r *= mean_gray / (mean_r + 1e-6)
    wb = cv2.merge([b, g, r])
    return np.clip(wb, 0, 255).astype(np.uint8)

def _preprocess_for_classifier(orig_bgr: np.ndarray, mask01: np.ndarray, out_size=224):
    ys, xs = np.where(mask01 > 0)
    if len(ys) == 0 or len(xs) == 0:
        raise HTTPException(status_code=422, detail="No tongue detected (empty mask).")

    pad = 10
    h, w = orig_bgr.shape[:2]
    y0 = max(int(ys.min()) - pad, 0)
    y1 = min(int(ys.max()) + pad + 1, h)
    x0 = max(int(xs.min()) - pad, 0)
    x1 = min(int(xs.max()) + pad + 1, w)

    crop_bgr = orig_bgr[y0:y1, x0:x1].copy()
    crop_mask = mask01[y0:y1, x0:x1].astype(np.uint8)

    kernel = np.ones((3, 3), np.uint8)
    crop_mask = cv2.morphologyEx(crop_mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    crop_bgr[crop_mask == 0] = 0

    wb = _gray_world_white_balance(crop_bgr)

    lab = cv2.cvtColor(wb, cv2.COLOR_BGR2LAB)
    L, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    L2 = clahe.apply(L)
    lab2 = cv2.merge([L2, a, b])
    bgr_eq = cv2.cvtColor(lab2, cv2.COLOR_LAB2BGR)

    return cv2.resize(bgr_eq, (out_size, out_size), interpolation=cv2.INTER_AREA)

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
    mask_512 = (probs > 0.5).astype("float32")

    mask_orig = _mask_to_original(mask_512, orig_h, orig_w, size=SEG_SIZE)
    tongue_224_bgr = _preprocess_for_classifier(bgr, mask_orig, out_size=OUT_SIZE)

    tongue_224_rgb = cv2.cvtColor(tongue_224_bgr, cv2.COLOR_BGR2RGB)
    t = torch.from_numpy(tongue_224_rgb).float() / 255.0
    t = t.permute(2, 0, 1).unsqueeze(0).to(device)

    mean = torch.tensor([0.485, 0.456, 0.406], device=device).view(1, 3, 1, 1)
    std  = torch.tensor([0.229, 0.224, 0.225], device=device).view(1, 3, 1, 1)
    t = (t - mean) / std

    out = clf_model(t)
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

    # Fusion
    if not MODELS_READY_FUSION:
        load_fusion_model()

    X = np.array([[p_clin, p_img]], dtype=float)
    p_fused = float(fusion_model.predict_proba(X)[:, 1][0])

    return {"p_fused": p_fused, "p_img": p_img, "p_clin": p_clin}