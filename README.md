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
