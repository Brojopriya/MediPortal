# 🏥 MediPortal

MediPortal is a web-based application developed as part of the **Web Engineering course**.  
The project follows a **full-stack architecture** using modern web technologies.

---

## 🚀 Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL
- Sequelize (ORM)

### Tools
- Git & GitHub
- VS Code
- npm

---

## 📂 Project Structure

MediPortal/
│
├── frontend/ # React frontend
├── backend/ # Node.js + Express backend
│ ├── models/ # Sequelize models
│ ├── routes/ # API routes
│ ├── controllers/ # Controllers
│ ├── config/ # DB configuration
│ └── package.json
└── README.md # This file



---

## ⚙️ Step 1: Prerequisites

Before starting, make sure you have installed:

- Node.js (v16+ recommended)
- npm
- MySQL
- Git
- VS Code (optional, for editing)

---

## 🖥️ Step 2: Clone the Repository

```bash
git clone <your-github-repo-link>
cd MediPortal

## 🗄️ Step 3: Database Setup (MySQL)

Start MySQL server

Create a new database:

CREATE DATABASE mediportal;


Configure your database in:

backend/config/config.json


or .env file if used

used

🔧 Step 4: Install Dependencies
Backend
cd backend
npm install

Frontend

Open a new terminal:

cd frontend
npm install



🌐 Step 5: Run Backend Server
cd backend
npm start


Optional (if Sequelize migrations needed):

npx sequelize db:migrate


✅ Backend URL:

http://localhost:5000

🌐 Step 6: Run Frontend (React)

Open a new terminal:

cd frontend
npm start


✅ Frontend URL:

http://localhost:3000

🔄 Step 7: Run Order

Always run in this order:

Start MySQL

Start Backend

Start Frontend

🛠️ Step 8: Common Problems & Fixes

Port already in use

killall node


Database connection error

Make sure MySQL is running

Check username/password in config

API not working

Make sure frontend API URLs point to backend:

http://localhost:5000

💾 Step 9: Git Commands
Check status
git status

Add files
git add .

Commit changes
git commit -m "Your message here"

Push to GitHub
git push origin main


✅ Git workflow summary: add → commit → push

✨ Features

Full-stack architecture

RESTful APIs

Sequelize database integration

React-based frontend UI

Easy to run locally

