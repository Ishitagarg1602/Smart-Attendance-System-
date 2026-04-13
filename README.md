# Smart Attendance System

## 🚀 What Problem We Are Solving

Traditional classroom attendance is often slow, tedious, and prone to proxy attendance ("buddy punching"). Instructors spend valuable teaching time calling out names or passing around sheets, which can be easily manipulated. 

The **Smart Attendance System** automates the attendance process using **Dynamic QR Codes** and **Geofencing**. It ensuring that a student is not only scanning the correct session code but is also **physically present** inside the classroom when doing so. This effectively eradicates proxy attendance, saves class time, and maintains accurate digital records.

---

## 💻 Tech Stack

### Frontend
- **React.js** (v18)
- **React Router v6**
- **Axios** & **React Query** (for data fetching and state management)
- **React QR Scanner** / **React QR Code** (for scanning and generation)
- **React Toastify** (notifications)

### Backend
- **Node.js** & **Express.js** (REST API)
- **MongoDB** & **Mongoose** (Database)
- **JWT (JSON Web Tokens)** & **Bcrypt.js** (Authentication & Security)
- **Haversine Formula Implementation** (Distance calculation)
- **Helmet** & **Morgan** (Security & Logging middlewares)

---

## ✨ Special Features

- **Geofenced Attendance:** Uses GPS tracking to verify a student's physical location when marking attendance. If they are not inside the classroom, the attendance is rejected.
- **Dynamic Time-Based QR Codes:** The faculty generates a QR code that **expires every 60 seconds**, preventing students from sending screenshots of the QR code to their friends outside the class.
- **High-Accuracy Haversine Calculations:** Calculates the exact spherical distance between the classroom's coordinates and the student's mobile device.
- **Device & Platform Fingerprinting:** Captures the device information during a scan as a secondary anti-proxy measure.
- **Real-Time Dashboards:** Faculty can observe attendance numbers roll in live and view comprehensive historical attendance logs.

---

## 🔢 Accuracy & Radius Specifications

- **Allowed Distance Radius:** Maximum of **`20 meters`** between the student and the classroom coordinates.
- **GPS High Accuracy Mode:** Enforced at the browser/device level using the HTML5 Geolocation API (`enableHighAccuracy: true`) targeting `< 10 meters` precision internally.
- **QR Code Expiry:** The system enforces a strict **`60-second`** TTL (Time-to-Live) on generated QR session tokens.

---

## 🛠️ Steps to Run This Project Locally

To run this project on your local machine, you will need **Node.js** and **MongoDB** installed.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Smart-Attendance-System-
```

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smart-attendance
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   QR_EXPIRY_TIME=60
   ALLOWED_GPS_RADIUS=20
   CORS_ORIGIN=http://localhost:3000
   ```
   *(Ensure MongoDB is running locally on port `27017`)*
4. Run the seed data script (optional but recommended to create mock admins/students/faculties):
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm start
   # or for development: npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder and add:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_QR_EXPIRY_TIME=60
   REACT_APP_APP_NAME=Smart Attendance System
   REACT_APP_MAX_GPS_RADIUS=20
   ```
4. Start the frontend React development server:
   ```bash
   npm start
   ```

### 4. Access the Application
- Open your browser and navigate to `http://localhost:3000`.
- To test the location-fencing accurately during development, you may need to spoof or allow location permissions on your browser.
