# Drive Care — Car Service Booking & Management System

A full-stack DBMS mini-project built with **PostgreSQL**, **Node.js (Express)**, and **React (Vite)** for managing car servicing appointments, customer profiles, service catalogs, and payment invoices.

---

## 🛠️ Tech Stack

- **Database:** PostgreSQL (`car_service_db`)
- **Backend:** Node.js, Express.js, `pg` (node-postgres), CORS, dotenv
- **Frontend:** React, Vite, CSS3
- **Tools:** pgAdmin 4 / psql

---

## 📁 Project Structure

```text
├── backend/
│   ├── app.js               # Express API endpoints & business logic
│   ├── db.js                # PostgreSQL connection pool configuration
│   ├── seed_500.js          # Bulk data seeder (~500 realistic records)
│   ├── .env.example         # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/                 # React UI components & views
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── demo_queries.sql     # 20 comprehensive viva demonstration queries
│   └── seed_scenarios.sql   # Idempotent scenario seed script
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema & Entities

- **`customers`**: Stores registered customer records (`customer_id`, `name`, `email`, `phone`, `city`, `created_at`).
- **`car_brands`**: Reference catalog of car manufacturers (`brand_id`, `brand_name`, `country`).
- **`cars`**: Vehicles linked to owners (`car_id`, `customer_id`, `brand_id`, `model`, `registration_number`, `manufacturing_year`, `fuel_type`).
- **`service_catalog`**: Service offerings & pricing (`service_id`, `service_name`, `description`, `base_price`, `estimated_duration`).
- **`service_bookings`**: Service appointments (`booking_id`, `customer_id`, `car_id`, `service_id`, `booking_date`, `booking_time`, `odometer_reading`, `booking_status`, `booking_price`).
- **`payments`**: Billing & payment tracking (`payment_id`, `booking_id`, `amount`, `payment_status`, `payment_method`, `payment_date`).
- **`booking_details`**: Relational view combining all 6 entities for streamlined reporting.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)

### 2. Database Setup
1. Create a PostgreSQL database named `car_service_db`:
   ```sql
   CREATE DATABASE car_service_db;
   ```
2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=car_service_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

### 3. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`.*

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📊 SQL Demonstration Queries

The `database/` directory contains:
- **`database/demo_queries.sql`**: 20 demonstration queries covering joins, aggregations, CTEs, window functions (`DENSE_RANK()`, running revenue), date arithmetic, and cohort comparisons.
- **`database/seed_scenarios.sql`**: Safe, idempotent script to inject sample records for edge scenarios (multi-car owners, cancelled bookings, future appointments).
