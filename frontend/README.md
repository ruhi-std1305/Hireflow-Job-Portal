# HireFlow — Job Portal

HireFlow is a full-stack web application that connects **employers** and **candidates** in one place. Employers can post and manage job listings and review applicants, while candidates can search, filter, and apply for jobs and track the status of every application — replacing the manual, email/spreadsheet-based hiring process with a single structured system.

---

## ✨ Features

- 🔐 **Authentication & Roles** — separate accounts for Candidate, Employer, and Admin
- 📋 **Job Listings** — employers can create, edit, and close job posts
- 🔍 **Search & Filter** — candidates can browse jobs by keyword, category, location, and job type
- 📄 **Apply with Resume** — candidates apply directly with a stored profile and uploaded resume
- 📊 **Application Tracking** — real-time status updates (Applied → Shortlisted → Rejected/Hired)
- 🧑‍💼 **Employer Dashboard** — overview of active listings and applicants per job
- 🛡️ **Admin Controls** — manage and moderate platform accounts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JSON Web Tokens (JWT) |
| Dev Tools | Nodemon, dotenv |
| Unit Testing | Cypress |

---

## 📁 Project Structure

```
Hireflow-Job-Portal/
├── backend/
│   ├── controllers/       # Route logic
│   ├── models/             # Mongoose schemas
│   ├── routes/              # API routes
│   ├── middleware/       # Auth & error handling
│   ├── utils/db.js           # MongoDB connection
│   ├── index.js               # Entry point
│   └── .env                    # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
└── README.md
```


---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- npm (comes with Node.js)

### 1. Clone the repository
```bash
git clone https://github.com/ruhi-std1305/Hireflow-Job-Portal.git
cd Hireflow-Job-Portal
git checkout final
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
PORT=5000
JWT_SECRET=your_jwt_secret_here
```
> ⚠️ If your password contains special characters (`@`, `#`, `%`), URL-encode them (e.g. `@` → `%40`).

Run the backend:
```bash
npm run dev
```
Server should start at `http://localhost:5000`.

### 3. Set up the frontend
```bash
cd ../frontend
npm install
npm start
```
App should open at `http://localhost:3000`.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Backend server port (default: 5000) |
| `JWT_SECRET` | Secret key used to sign auth tokens |

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/jobs` | Get all job listings |
| POST | `/api/jobs` | Create a job listing (Employer) |
| POST | `/api/applications` | Apply to a job (Candidate) |
| GET | `/api/applications/:id` | Get application status |


---

---

## 👥 Contributors

| Name | Role |
|---|---|
| [Suraia Tabassoom Ruhi] | Project Leader / Design|
| [Sumaia Tarannoom Mahi] | Frontend Developer |
| [Salsabil Tasnim] | Backend Developer |

---

## 📄 License

This project is for academic purposes as part of **CSE-3644: Software Development 2 Lab**.
