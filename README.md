# build-simple-Vehicle-Rental-System-with-postgres

A simple and scalable Vehicle Rental System built with **Node.js**,
**TypeScript**, and **PostgreSQL**, following production-ready
architecture, environment variable handling, and REST API standards.

---

## 🚀 Live API URL

**LiveLink:** https://l2as2.vercel.app/api/v1/vehicles

---

## 📌 Features

### 🔒 Authentication & Security

- JWT-based authentication\
- Password hashing using bcrypt\
- Environment‑based secure configuration

### 🚗 Vehicle Rental System

- Create, read, update, delete vehicles\
- Rental management\
- PostgreSQL relational database support\
- Error handling & validation

### 🛠 Developer‑Friendly Structure

- Clean folder structure\
- TypeScript for type‑safety\
- Cloud‑ready deployment\
- Follows Apollo Level‑2 Submission Guidelines

---

## 🧰 Technology Stack

- **Node.js**\
- **Express.js**\
- **TypeScript**\
- **PostgreSQL**\
- **bcrypt**\
- **jsonwebtoken**\
- **Vercel**

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

    PORT=your_port
    DB_URL=your_postgresql_connection_string
    BCRYPT_SALT=your_bcrypt_salt_rounds
    JWT_SECRET=your_jwt_secret_token
    JWT_EXPIRE_IN=your_jwt_expiry_time

Used in configuration:

```ts
PORT: process.env.PORT,
DB_URL: process.env.DB_URL,
BCRYPT_SALT: process.env.BCRYPT_SALT,
JWT_SECRET: process.env.JWT_SECRET,
JWT_EXPIRE_IN: process.env.JWT_EXPIRE_IN,
```

---

## 🛠 Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/AbdurRahman11072/build-simple-Vehicle-Rental-System-with-postgres.git
cd build-simple-Vehicle-Rental-System-with-postgres
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup `.env`

Example:

    PORT=5000
    DB_URL=postgres://user:password@localhost:5432/vehicledb
    BCRYPT_SALT=10
    JWT_SECRET=supersecretkey
    JWT_EXPIRE_IN=1d

### 4️⃣ Run the project

#### Development

```bash
npm run dev
```

#### Production

```bash
npm run build
npm start
```

---

## 📦 Usage

### Base URL

    https://l2as2.vercel.app/api/v1

### Example Endpoint

**GET -- List All Vehicles**

    GET /vehicles

---
