# 🏥 CareSync - Patient Appointment Booking Platform

Welcome to **CareSync**, a modern full-stack patient appointment booking and clinic management system. This application is built using the **MERN** stack (MongoDB, Express, React, Node.js) with **Zustand** for state management, **Chakra UI** for premium responsive styling, and **Custom Data Structures & Algorithms (DSA)** to optimize real-time operations.

CareSync is designed with **student-level clarity** in the code structure (clear, logical comments, no over-engineered logic) but maintains **industry-level design** (proper schema relationships, robust authentication, state management, and structured API layers).

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **MongoDB** (running locally on `mongodb://localhost:27017` or configured via MongoDB Atlas)

---

## 🛠️ Installation & Setup

We have configured a monorepo setup so you can install all dependencies and run both servers with simple unified commands!

### 1. Install Dependencies
From the **root directory** (`patient/`), run the following command to automatically install dependencies for the root, backend, and client:
```bash
npm run install-all
```

### 2. Configure Environment Variables
We have created a template file at `backend/.env`. You can modify it if needed, or leave it as is for default local execution:
- Default PORT: `5000`
- Default MONGO_URI: `mongodb://localhost:27017/patient_booking`
- Default JWT_SECRET: `super_secret_jwt_token_key_change_me_in_production`

### 3. Run the Application
Start both the **Express backend server** and the **Vite React client** concurrently with a single command from the root folder:
```bash
npm run dev
```
- **Frontend URL**: `http://localhost:3000`
- **Backend API URL**: `http://localhost:5000`

---

## 📦 Directory Structure

```
patient/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Connection Configuration
│   ├── middleware/
│   │   └── auth.js               # JWT Protection Authentication Middleware
│   ├── models/
│   │   ├── User.js               # User Schema (Patient / Doctor)
│   │   ├── DoctorProfile.js      # Doctor Specialty, Experience, & Slots Array
│   │   └── Appointment.js        # Appointment Schema (Patient-Doctor mappings)
│   ├── controllers/
│   │   ├── authController.js     # User Registration and Session Login
│   │   ├── doctorController.js   # Slot management and profile updating
│   │   └── appointmentController.js # Slot booking and status approval/rejection
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth Routing definitions
│   │   ├── doctorRoutes.js       # /api/doctors Routing definitions
│   │   └── appointmentRoutes.js  # /api/appointments Routing definitions
│   ├── .env                      # Server Configurations
│   ├── package.json              # Backend Dependencies
│   └── server.js                 # Backend Server Entrypoint
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Premium responsive Navigation Bar
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Sign-in portal
│   │   │   ├── Register.jsx      # Sign-up page (Roles selector)
│   │   │   ├── PatientDashboard.jsx # Doctor browsing, searching, and slot booking
│   │   │   └── DoctorDashboard.jsx # Slot creation, daily schedules, & approvals
│   │   ├── store/
│   │   │   ├── authStore.js      # Zustand Authentication State Store
│   │   │   ├── doctorStore.js    # Zustand Doctor Profile & Slots Store
│   │   │   └── appointmentStore.js # Zustand Bookings & Histories Store
│   │   ├── utils/
│   │   │   ├── api.js            # Axios Client Instance with JWT Interceptors
│   │   │   └── algorithms.js     # Custom Trie search, HashMaps, and MergeSort
│   │   ├── App.jsx               # Client Root Navigation & View Controller
│   │   ├── index.css             # Style Reset overrides
│   │   └── main.jsx              # React Entrypoint with Chakra UI Provider
│   ├── index.html                # Vite Main Template
│   ├── package.json              # Client Dependencies
│   └── vite.config.js            # Vite Port (3000) & API Proxy (5000) Config
├── package.json                  # Root Monorepo Scripts
└── README.md                     # Documentation
```

---

## ⚡ Algorithms & Data Structures (DSA) Optimizations

To address loading and fetching bottlenecks as requested, we avoided slow inline loops and built custom implementations of:

### 1. 🌲 Prefix Trie (For Doctor & Specialty Searches)
- **Where**: `client/src/utils/algorithms.js` -> `DoctorTrie`
- **Why**: Standard array `filter` searches check all items ($O(N)$) using string matches on every keypress. The Prefix Trie parses names and specialties into individual prefix branches.
- **Complexity**: Search completes in $O(L)$ time, where $L$ is the length of the search term, making typing filters instantly smooth even if the clinic grows to thousands of doctors.

### 2. 🗺️ HashMap Schedule Grouping (For Daily Calendars)
- **Where**: `client/src/utils/algorithms.js` -> `indexAppointmentsByDate`
- **Why**: In clinic portals, doctors click through different calendar dates to inspect schedules. Searching through thousands of bookings on each click is slow.
- **Complexity**: Upon receiving appointments from the backend, we run an indexing pass that groups them into a Hash Map keyed by the date (`YYYY-MM-DD`). Looking up any selected date is now a $O(1)$ constant time lookup.

### 3. 🥞 Stable Merge Sort (For Chronological Listings)
- **Where**: `client/src/utils/algorithms.js` -> `mergeSort`
- **Why**: Native JavaScript sorts are not guaranteed to be stable and are opaque. We implemented a custom **Merge Sort** to order doctors by years of experience or sort appointments chronologically.
- **Complexity**: $O(N \log N)$ sorting guarantees consistent and fast rendering of sorted listings.

---

## 👥 User Workflows

### Patient Workflow:
1. **Register/Login** as a **Patient**.
2. **Search** for doctors in real-time by their name or specialty (powered by the Trie search).
3. **Sort** listings based on experience (asc/desc) utilizing the Merge Sort.
4. Select a doctor to see their available slots in a popup.
5. Click any slot to request a booking (automatically updates the status to `pending`).
6. View active booking status updates (`pending`, `approved`, or `rejected`) in the history sidebar.

### Doctor Workflow:
1. **Register/Login** as a **Doctor**.
2. Set up your specialty, experience years, and bio under the **Professional Profile** card.
3. Define your slot availabilities by choosing a **Date** and **Time** (Duplicate slots are rejected).
4. Inspect your daily schedules instantly by choosing any date on the calendar (HashMap optimized lookup).
5. Review **Pending Booking Requests** to either **Approve** or **Reject** the appointment. Rejections automatically liberate the timing slot back to the public pool so others can book it!
