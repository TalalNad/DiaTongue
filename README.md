# 🩺 DiaTongue
This is the DiaTongue mobile App.
AI-Powered Tongue Image & Clinical Data Diabetes Risk Assessment

DiaTongue is a full-stack AI healthcare application that estimates diabetes risk using:
	•	🖼️ Tongue image analysis (CNN model)
	•	📊 Clinical data prediction model
	•	🔬 Fusion model combining both predictions
	•	📄 Automated downloadable PDF clinical reports

The system integrates React Native (Expo), Node.js/Express, MongoDB Atlas, and FastAPI AI services into a unified intelligent diagnostic workflow.

⸻

🚀 Features

🔐 Authentication
	•	Secure user registration & login
	•	JWT-based authentication
	•	Secure token storage using Expo SecureStore

📷 Tongue Scan
	•	Capture image via camera
	•	Upload image from gallery
	•	Sends image to FastAPI image model
	•	Retrieves prediction score

📊 Clinical Risk Assessment
	•	Uses stored clinical data:
	•	Age
	•	BMI
	•	Gender
	•	Smoking history
	•	Hypertension
	•	Heart disease
	•	Sends structured data to clinical ML model

🔬 Fusion Prediction
	•	Combines:
	•	Image model output
	•	Clinical model output
	•	Produces final diabetes risk score
	•	Stores all results in MongoDB

📜 History Screen
	•	Displays:
	•	Risk level (Low / Medium / High)
	•	Final confidence %
	•	Image score
	•	Clinical score
	•	Timestamp
	•	Pull-to-refresh supported

📄 PDF Report Generation
	•	Downloadable professional clinical report
	•	Includes:
	•	Patient details
	•	Clinical metrics
	•	Image prediction %
	•	Clinical prediction %
	•	Final fused diabetes risk %
	•	Formal medical interpretation
	•	Timestamp & report ID
	•	Shareable via device share sheet

🏗️ System Architecture
Mobile App (React Native / Expo)
            │
            ▼
Node.js + Express Backend
            │
            ├── MongoDB Atlas (Users + Predictions)
            │
            └── FastAPI AI Services
                    ├── Image Model (CNN)
                    ├── Clinical Model
                    └── Fusion Model

🧠 AI Workflow
	1.	User uploads tongue image.
	2.	Backend:
	•	Retrieves user clinical data from MongoDB.
	•	Sends image → Image Prediction Model.
	•	Sends clinical data → Clinical Model.
	3.	Receives:
	•	p_img
	•	p_clin
	4.	Sends both → Fusion Model.
	5.	Receives:
	•	p_fused
	6.	Stores prediction in MongoDB.
	7.	Returns final result to frontend.

⸻

🛠️ Tech Stack

📱 Frontend
	•	React Native (Expo)
	•	Expo Router
	•	Expo Image Picker
	•	Expo Secure Store
	•	Expo Sharing
	•	Expo FileSystem

🖥️ Backend
	•	Node.js
	•	Express.js
	•	JWT Authentication
	•	MongoDB (Mongoose)

🤖 AI Services
	•	FastAPI
	•	Python
	•	CNN Image Model
	•	Clinical ML Model
	•	Fusion Model

⸻

📂 Project Structure

Backend
backend/
│
├── controllers/
│   ├── auth.controller.js
│   ├── predict.controller.js
│   ├── scan.controller.js
│
├── routes/
│   ├── auth.routes.js
│   ├── predict.routes.js
│   ├── scan.routes.js
│
├── models/
│   ├── User.js
│   ├── Prediction.js
│
├── middleware/
│   ├── auth.middleware.js
│
└── app.js
Frontend
frontend/
│
├── app/
│   ├── (tabs)/
│   │   ├── home.js
│   │   ├── scan.js
│   │   ├── history.js
│   │   ├── profile.js
│   │   └── chat.js
│
├── src/
│   └── config/
│       └── api.js
⚙️ Installation & Setup

1️⃣ Clone Repository
git clone https://github.com/yourusername/diatongue.git
cd diatongue

2️⃣ Backend Setup
cd backend
npm install

Start server:
npm run dev

3️⃣ FastAPI AI Service
cd ai_service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

4️⃣ Frontend Setup
cd frontend
npm install
npx expo start

📄 Report Content

The generated clinical report includes:
	•	Patient Information
	•	Clinical Variables
	•	Image Model Prediction
	•	Clinical Model Prediction
	•	Fusion Model Final Risk %
	•	Risk Classification
	•	Medical Disclaimer
	•	Generated Timestamp
	•	Unique Scan ID

⸻

🔒 Security Considerations
	•	JWT Authentication
	•	Protected routes via middleware
	•	Token stored securely (Expo SecureStore)
	•	Backend validation before AI requests

⸻

⚠️ Medical Disclaimer

DiaTongue is an AI-assisted screening tool and is not a substitute for professional medical diagnosis. Always consult a licensed healthcare provider for medical advice.

⸻

📈 Future Improvements
	•	Model explainability (Grad-CAM visualization)
	•	Risk trend analytics
	•	Cloud storage for reports
	•	Doctor dashboard
	•	Multi-disease prediction
	•	Notification reminders


⸻

🌟 Why DiaTongue?

DiaTongue bridges traditional clinical screening and computer vision to create a multimodal AI health diagnostic system — fast, accessible, and intelligent.

It demonstrates:
	•	Full-stack system design
	•	AI model integration
	•	Medical-grade report generation
	•	Real-world mobile deployment
	•	Secure backend architecture
