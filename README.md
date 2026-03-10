cat > README.md << 'EOF'
# 🌍 GeoVision Dashboard

[![Angular](https://img.shields.io/badge/Angular-19.2.1-red?logo=angular)](https://angular.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A full-stack Earth Observation and Remote Sensing Dashboard built with Angular and FastAPI. Monitor satellites, vegetation indices (NDVI), weather patterns, and manage geographic locations in real-time.

## 🚀 **Live Demo**

- **Frontend Application**: [https://geovision-dashboard.vercel.app](https://geovision-dashboard.vercel.app)
- **Backend API**: [https://geovision-backend.vercel.app](https://geovision-backend.vercel.app)
- **API Documentation**: [https://geovision-backend.vercel.app/docs](https://geovision-backend.vercel.app/docs)

## 📋 **Table of Contents**
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Development Setup](#-local-development-setup)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## ✨ **Features**

### 🛰️ **Satellite Tracking**
- Real-time satellite position monitoring
- Pass predictions for any location
- Active satellite catalog (ISS, Sentinel, Landsat, NOAA)
- Interactive world map with satellite markers

### 🌿 **NDVI Analysis**
- Vegetation Health Index visualization
- Color-coded NDVI maps (dense vegetation to barren land)
- Time series analysis for vegetation changes
- Regional vegetation statistics

### ☁️ **Weather Dashboard**
- Current weather conditions with 5-day forecast
- Temperature, humidity, wind speed, pressure
- Interactive weather maps
- Location-based weather search

### 📍 **Location Management**
- Save and manage favorite locations
- Quick access to satellite passes for saved locations
- Location-based NDVI and weather data
- CRUD operations for location management

### 🔐 **Authentication**
- JWT-based authentication
- Role-based access control
- Secure login/register system
- Protected routes with AuthGuard

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework**: Angular 21
- **UI Library**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Maps**: Leaflet
- **Charts**: Chart.js / ng2-charts
- **HTTP Client**: Angular HttpClient
- **Authentication**: JWT with Angular Interceptor

### **Backend**
- **Framework**: FastAPI (Python)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT with passlib
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **API Docs**: Swagger UI / ReDoc
- **External APIs**: OpenWeatherMap (optional)

### **DevOps**
- **Version Control**: Git & GitHub
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Vercel Serverless Functions
- **Database Hosting**: Neon / Supabase / Render

## 📁 **Project Structure**
geovision-dashboard/
├── backend/ # FastAPI Backend
│ ├── app/
│ │ ├── init.py
│ │ ├── main.py # Main FastAPI application
│ │ ├── database.py # Database configuration
│ │ ├── models.py # SQLAlchemy models
│ │ ├── auth/ # Authentication module
│ │ ├── satellites/ # Satellite tracking module
│ │ ├── indices/ # NDVI/vegetation indices
│ │ ├── weather/ # Weather module
│ │ └── geospatial/ # Geospatial utilities
│ ├── requirements.txt # Python dependencies
│ └── .env # Environment variables
├── frontend/ # Angular Frontend
│ ├── src/
│ │ ├── app/
│ │ │ ├── dashboard/ # Main dashboard
│ │ │ ├── satellite-tracker/ # Satellite tracking
│ │ │ ├── ndvi-viewer/ # NDVI visualization
│ │ │ ├── weather/ # Weather dashboard
│ │ │ ├── saved-locations/ # Location management
│ │ │ ├── login/ # Authentication
│ │ │ ├── services/ # API services
│ │ │ └── guards/ # Auth guards
│ │ ├── environments/ # Environment configs
│ │ └── assets/ # Static assets
│ ├── angular.json
│ ├── package.json
│ └── vercel.json # Vercel deployment config
├── api/ # Vercel serverless functions
│ └── index.py # Backend entry point for Vercel
├── vercel.json # Root Vercel configuration
├── requirements.txt # Production requirements
├── LICENSE # MIT License
└── README.md # This file

text

## 📋 **Prerequisites**

- **Node.js** 18+ and npm 9+
- **Python** 3.9+
- **Angular CLI** 17+ (`npm install -g @angular/cli`)
- **Git** for version control

## 🔧 **Local Development Setup**

### **Backend Setup**

```bash
# Clone the repository
git clone https://github.com/zafariabbas68/GeoVision-Dashboard.git
cd GeoVision-Dashboard/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your configuration
cat > .env << EOF
DATABASE_URL=sqlite:///./geovision.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENWEATHER_API_KEY=your-api-key-here
EOF

# Start the backend server
uvicorn app.main:app --reload --port 8000
The backend will be available at:

API: http://localhost:8000
Docs: http://localhost:8000/docs
Frontend Setup

bash
# In a new terminal, navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start the development server
ng serve --port 4200
The frontend will be available at: http://localhost:4200

Login with: admin / admin123

🚀 Deployment

Frontend Deployment (Vercel)

bash
# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel

# Or connect your GitHub repository at https://vercel.com
Backend Deployment (Vercel)

bash
# From project root, create API handler
mkdir -p api
cp backend/app/main.py api/index.py  # (adjusted for serverless)

# Deploy to Vercel
vercel
🌐 API Endpoints

Method	Endpoint	Description
GET	/	Root endpoint with API info
GET	/api/health	Health check
GET	/api/satellites	Get satellite data
GET	/api/ndvi/{location}	Get NDVI for location
GET	/api/weather/{city}	Get weather data
POST	/api/auth/login	User login
POST	/api/auth/register	Register new user
GET	/api/auth/me	Get current user info
GET	/api/locations	Get saved locations
POST	/api/locations	Save new location
🔐 Environment Variables

Backend (.env)

text
DATABASE_URL=postgresql://user:password@host:5432/geovision
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENWEATHER_API_KEY=your-api-key
Frontend (environments/)

typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.vercel.app/api'
};
📸 Screenshots

Dashboard	Satellite Tracker	NDVI Viewer
https://via.placeholder.com/300x200	https://via.placeholder.com/300x200	https://via.placeholder.com/300x200
🤝 Contributing

Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author

Ghulam Abbas Zafari

GitHub: @zafariabbas68
Email: ghulamabbas.zafari@mail.polimi.it
LinkedIn: [Your LinkedIn Profile]
Personal Website: https://personal-website-gaz.onrender.com
🙏 Acknowledgments

Angular Team for the amazing framework
FastAPI for the excellent Python framework
Vercel for free hosting
Leaflet for open-source maps
OpenStreetMap for map data
NASA for satellite data APIs
⭐ Star this repository if you find it useful!
