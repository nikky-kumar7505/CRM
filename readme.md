# 🟢 Sales CRM – Full Stack Application

A role-based Sales CRM built with **React (Vite)**, **Node.js**, **Express**, and **MongoDB**.  


Manages Leads, Deals, Meetings, Users, and Notifications with secure JWT authentication.

---

## 🚀 Tech Stack

### Frontend
- React.js (Vite)
- React Router DOM v6
- Axios (with interceptors)
- React Context API (Auth)
- Pure CSS
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Role-Based Access Control

---

## 👥 Roles

- Admin
- Sales Manager
- Lead Qualifier
- Sales Closer

Access is strictly controlled based on role.

---

## 📦 Features

- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ Lead Management (assign, call logs, stages)
- ✅ Deal Pipeline Management
- ✅ Meeting Scheduling
- ✅ Notification System (auto + polling)
- ✅ Dashboard Stats (role filtered)
- ✅ User Management (Admin only)
- ✅ Protected Routes (Frontend + Backend)

---

## 📁 Project Structure
client/ → React Frontend (Port 5173)
server/ → Express Backend (Port 5001)

text


---

## ⚙️ Environment Variables

### Backend (.env)
PORT=5001
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

text


### Frontend (.env)
VITE_API_URL=http://localhost:5001/api

text


---

## ▶️ Run Locally

### Start Backend
```bash
cd server
npm install
npm run dev
Start Frontend
Bash

cd client
npm install
npm run dev
Frontend: http://localhost:5173
Backend: http://localhost:5001

🔐 Auth Flow
Login → JWT token stored in localStorage
Axios attaches token automatically
401 response → auto logout
Role checks enforced in backend middleware + frontend UI
🔔 Notifications
Triggered on lead creation, assignment, and pass-to-closer
Frontend polls every 30 seconds
Unread badge with live count
📄 License
Internal CRM Project – Proprietary Use.


