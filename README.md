# 🌿 EcoBioPara

### Eco-Friendly & Organic Products E-Commerce Platform

EcoBioPara is a full-stack e-commerce platform designed to make discovering and purchasing eco-friendly, organic, and natural products easier. The platform provides a user-friendly shopping experience and tools for administrators to manage products, orders, and customers.

## ✨ Features

* 🛍️ **Product Catalog** — Browse products by category.
* 🔎 **Product Search** — Find products easily.
* 🛒 **Shopping Cart** — Add, update, and remove products.
* 👤 **User Authentication** — Register, log in, and manage accounts.
* 📦 **Order Management** — Place orders and track order information.
* 🛠️ **Admin Dashboard** — Manage products, customers, and orders.
* 📱 **Responsive Design** — Access the platform on desktop, tablet, and mobile.

## 🧰 Technologies Used

**Frontend**

* React
* JavaScript
* HTML5
* CSS3

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB
* Mongoose

**Tools**

* Git and GitHub
* Visual Studio Code
* npm

## 📁 Project Structure

```text
EcoBioPara/
├── frontend/
│   ├── public/
│   └── src/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
├── .gitignore
└── README.md
```

*Note: Adjust the folder structure above to match your actual project.*

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/sihamahnsal01/ecobio-para.git
cd ecobio-para
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend directory and configure the variables required by your application.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Never upload real passwords, database credentials, or secret keys to GitHub.

### 5. Start the application

Run the backend using the script configured in your backend's `package.json`, for example:

```bash
npm run dev
```

Start the frontend in a separate terminal using the script configured in its `package.json`, for example:

```bash
npm run dev
```

## 🌱 Project Goal

EcoBioPara aims to promote access to eco-friendly and natural products through a convenient, accessible, and modern online shopping experience.

## 👩‍💻 Author

**EcoBioPara Project**

GitHub: [@sihamahnsal01](https://github.com/sihamahnsal01)

## 📄 License

This project is intended for educational and development purposes. Add a license if you choose to distribute it under specific terms.

