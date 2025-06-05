# EV Charging Station Full-Stack App

## 🔧 Tech Stack
- **Backend:** Node.js, Express, MongoDB, JWT Authentication
- **Frontend:** Vue.js, Axios, OpenStreetMap
- **Deployment:** Vercel (Frontend), Render (Backend)

## 🗂 Folder Structure
- `/backend` – Backend API code
- `/frontend` – Frontend UI code

## 🚀 Live Demo
- Frontend: https://ev-station-nu.vercel.app/
- Backend: https://ev-station-3whi.onrender.com

## 🔐 Sample Test Credentials

- Use these to log in after signup or directly for testing protected routes:

- ```bash
  Username: testuser
  Password: password123

## 📦 Getting Started

# Backend
    cd backend
    npm install
    npm start

# Frontend
    cd frontend
    npm install
    npm run dev
## 📝 Features
### 👤 Authentication (JWT)

- User Signup & Login
- Protected API routes for managing chargers

### ⚡ Charging Station Management

- Add new station
- View all stations
- Edit or Delete station
- Filters: Status, Power Output, Connector Type

### 🗺️ Map View
- Integrated OpenStreetMap
- Displays charger location via markers
- Clickable markers to view details


## 📦 Backend Setup (/backend)
    cd backend
    npm install
## Create a .env file
    PORT=5000
    MONGO_URI=your_mongo_connection_string
    JWT_SECRET=your_jwt_secret_key
 ## ▶️ Run the backend
     npm start


  ## Frontend Setup (/frontend)
     cd frontend
     npm install

  ## ⚙️ Set API Base URL
  - create a .env.development file in frontend folder
  - Update the Axios base URL to your backend in your API file ()
    ```env   
       VUE_APP_BACKEND_URL=http://localhost:5000/api (for local server)
       or
       VUE_APP_BACKEND_URL=https://ev-station-3whi.onrender.com (hosted )

  ## ▶️ Run the frontend
      npm run dev

    




