<div align="center">

# 🔄 TradeTogether

### E-Commerce + Barter Platform

**A modern full-featured platform that empowers users to buy, sell, trade, and engage in community-driven commerce.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=render)](https://tradetogether-frontend.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Made with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[🚀 Live Demo](https://tradetogether-frontend.onrender.com) · [🐛 Report Bug](https://github.com/Nishant28-sh/TradeTogether/issues) · [✨ Request Feature](https://github.com/Nishant28-sh/TradeTogether/issues)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#️-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📌 About the Project

**TradeTogether** reimagines online commerce by combining traditional buying/selling with a **community-driven barter system**. Users can list products, chat in real time with buyers or traders, earn points and badges through gamification, and participate in community events — all within a secure, modern interface.

Built as a full-stack MERN application, TradeTogether demonstrates real-world features like JWT authentication, real-time communication via Socket.io, and a complete admin control panel.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🛍️ **Product Listings & Search** | Dynamic search and filtering across live product listings |
| 🔐 **Secure Authentication** | JWT-based login/signup with protected routes |
| 👤 **User Profiles & Wishlist** | Personalized profiles with saved/wishlisted items |
| 💬 **Real-time Chat** | Instant messaging between users powered by Socket.io |
| 🔄 **Barter & Trading System** | Propose and negotiate product-for-product trades |
| 🏆 **Gamification** | Points, badges, and challenges to drive engagement |
| 📢 **Community Events** | Announcements and community-wide events |
| 📦 **Admin Dashboard** | Full control over products, users, and platform activity |

---

## 🧑‍💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, Tailwind CSS, CSS Modules |
| **Backend** | Node.js, Express.js, MongoDB |
| **Realtime** | Socket.io |
| **Auth** | JWT (JSON Web Token) |
| **Deployment** | Render (Frontend & Backend) |

---

## 🗂️ Project Structure

```
TradeTogether/
├── backend/              # Node.js/Express + MongoDB API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
└── Frontend/
    └── my-app/           # React.js + Tailwind CSS Frontend
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   └── App.js
        └── public/
```

---

## 🏁 Getting Started

Follow these steps to run TradeTogether locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or Atlas)
- npm or yarn

### Installation

Clone the repository:

```bash
git clone https://github.com/Nishant28-sh/TradeTogether.git
cd TradeTogether
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../Frontend/my-app
npm install
```

### Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

Create a `.env` file inside `Frontend/my-app/`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Running Locally

Start the backend server:

```bash
cd backend
npm run dev
```

Start the frontend (in a new terminal):

```bash
cd Frontend/my-app
npm start
```

The app will be available at `http://localhost:3000`.

---

## 🌐 Deployment

TradeTogether is deployed on **Render**, with the frontend and backend hosted as separate services and connected via environment variables.

- **Live App:** [tradetogether-frontend.onrender.com](https://tradetogether-frontend.onrender.com)
- **Backend API:** Hosted on Render, integrated with the frontend through `REACT_APP_API_URL`

---

## 🗺️ Roadmap

- [ ] Payment gateway integration
- [ ] Advanced trade-matching algorithm
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Multi-language support

See the [open issues](https://github.com/Nishant28-sh/TradeTogether/issues) for a full list of proposed features and known issues.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn and build. Any contributions are **greatly appreciated**.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

**Nishant Sharma**

[![GitHub](https://img.shields.io/badge/GitHub-Nishant28--sh-181717?style=flat-square&logo=github)](https://github.com/Nishant28-sh)

<div align="center">

⭐ If you found this project interesting, consider giving it a star!

</div>
