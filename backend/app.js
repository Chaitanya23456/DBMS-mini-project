
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Drive Care API is running" });
});

// Test PostgreSQL connection
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    res.json({
      connected: true,
      database: result.rows[0].database,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// -------------------------------------------------------------
// CUSTOMER PORTAL AUTH / LOOKUP
// -------------------------------------------------------------
app.post("/api/customer/login", async (req, res) => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone?.trim()) {
    return res.status(400).json({ error: "Please enter your registered email or phone." });
  }

  const query = emailOrPhone.trim().toLowerCase();
  try {
    const result = await pool.query(
      `SELECT * FROM customers 
       WHERE LOWER(email) = $1 OR phone = $2 
       LIMIT 1`,
      [query, query]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No customer account found with that email or phone number." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get individual customer's full profile: details, vehicles, and bookings
app.get("/api/customer/my-data/:customerId", async (req, res) => {
  const customerId = Number(req.params.customerId);
  if (!customerId) {
    return res.status(400).json({ error: "Invalid customer ID." });
  }

  try {
    const [customerRes, carsRes, bookingsRes] = await Promise.all([
      pool.query(`SELECT * FROM customers WHERE customer_id = $1`, [customerId]),
      pool.query(`
        SELECT c.*, b.brand_name
        FROM cars c
        JOIN car_brands b ON b.brand_id = c.brand_id
        WHERE c.customer_id = $1
        ORDER BY c.car_id DESC
      `, [customerId]),
      pool.query(`
        SELECT 
          sb.*,
          c.registration_number AS registration_no,
          c.model,
          b.brand_name,
          sc.service_name,
          p.payment_status,
          p.payment_method,
          p.amount AS payment_amount
        FROM service_bookings sb
        JOIN cars c ON c.car_id = sb.car_id
        JOIN car_brands b ON b.brand_id = c.brand_id
        JOIN service_catalog sc ON sc.service_id = sb.service_id
        LEFT JOIN payments p ON p.booking_id = sb.booking_id
        WHERE sb.customer_id = $1
        ORDER BY sb.booking_id DESC
      `, [customerId]),
    ]);

    if (customerRes.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found." });
    }

    res.json({
      customer: customerRes.rows[0],
      cars: carsRes.rows,
      bookings: bookingsRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// GENERAL / COMPANY STAFF ENDPOINTS
// -------------------------------------------------------------

// Get all customers (company only)
app.get("/api/customers", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY customer_id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register customer
app.post("/api/customers", async (req, res) => {
  const { full_name, email, phone, city } = req.body;

  if (!full_name?.trim() || !email?.trim()) {
    return res.status(400).json({
      error: "Customer name and email are required.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, city)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        full_name.trim(),
        email.trim(),
        phone || null,
        city || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get car brands
app.get("/api/brands", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM car_brands ORDER BY brand_name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get service catalog
app.get("/api/services", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM service_catalog ORDER BY service_name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cars with customer and brand details
app.get("/api/cars", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        c.registration_number AS registration_no,
        cu.name AS full_name,
        b.brand_name
      FROM cars c
      JOIN customers cu ON cu.customer_id = c.customer_id
      JOIN car_brands b ON b.brand_id = c.brand_id
      ORDER BY c.car_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a car
app.post("/api/cars", async (req, res) => {
  const {
    customer_id,
    brand_id,
    model,
    registration_no,
    manufacture_year,
    fuel_type,
  } = req.body;

  if (
    !customer_id ||
    !brand_id ||
    !model?.trim() ||
    !registration_no?.trim() ||
    !manufacture_year ||
    !fuel_type
  ) {
    return res.status(400).json({
      error: "Please complete all car fields.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cars (
        customer_id, brand_id, model, registration_number,
        manufacturing_year, fuel_type
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        Number(customer_id),
        Number(brand_id),
        model.trim(),
        registration_no.trim().toUpperCase(),
        Number(manufacture_year),
        fuel_type,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get bookings with related information
app.get("/api/bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sb.*,
        cu.name AS full_name,
        c.registration_number AS registration_no,
        c.model,
        b.brand_name,
        sc.service_name
      FROM service_bookings sb
      JOIN cars c ON c.car_id = sb.car_id
      JOIN customers cu ON cu.customer_id = sb.customer_id
      JOIN car_brands b ON b.brand_id = c.brand_id
      JOIN service_catalog sc ON sc.service_id = sb.service_id
      ORDER BY sb.booking_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking and its payment in one transaction
app.post("/api/bookings", async (req, res) => {
  const {
    car_id,
    service_id,
    booking_date,
    booking_time,
    odometer_km,
    customer_notes,
  } = req.body;

  if (!car_id || !service_id || !booking_date || !booking_time) {
    return res.status(400).json({
      error: "Car, service, date, and time are required.",
    });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Verify that the car exists and get its customer_id
    const car = await client.query(
      "SELECT car_id, customer_id FROM cars WHERE car_id = $1",
      [Number(car_id)]
    );

    if (car.rowCount === 0) {
      throw new Error("Selected car was not found.");
    }

    const customer_id = car.rows[0].customer_id;

    // Get the price from PostgreSQL, not from the browser
    const service = await client.query(
      `SELECT service_id, base_price
       FROM service_catalog
       WHERE service_id = $1`,
      [Number(service_id)]
    );

    if (service.rowCount === 0) {
      throw new Error("Selected service was not found.");
    }

    const price = service.rows[0].base_price;

    const booking = await client.query(
      `INSERT INTO service_bookings (
        customer_id, car_id, service_id, booking_date, booking_time,
        booking_status, odometer_reading, notes, booking_price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        customer_id,
        Number(car_id),
        Number(service_id),
        booking_date,
        booking_time,
        "Pending",
        odometer_km === "" || odometer_km == null
          ? null
          : Number(odometer_km),
        customer_notes || null,
        price,
      ]
    );

    // One payment record for this booking
    await client.query(
      `INSERT INTO payments (booking_id, amount, payment_status)
       VALUES ($1, $2, $3)`,
      [booking.rows[0].booking_id, price, "Unpaid"]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Booking created successfully.",
      booking: booking.rows[0],
    });
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    console.error(err.message);
    res.status(400).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Update booking status (e.g. from Pending to In Progress / Completed / Cancelled)
app.put("/api/bookings/:id/status", async (req, res) => {
  const bookingId = Number(req.params.id);
  const { status, payment_status } = req.body;

  if (!bookingId || !status) {
    return res.status(400).json({ error: "Booking ID and new status are required." });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const bookingRes = await client.query(
      `UPDATE service_bookings 
       SET booking_status = $1 
       WHERE booking_id = $2 
       RETURNING *`,
      [status, bookingId]
    );

    if (bookingRes.rowCount === 0) {
      throw new Error("Booking not found.");
    }

    // If marked Completed, also optionally mark payment as Paid
    if (status === "Completed" || payment_status) {
      const pStatus = payment_status || (status === "Completed" ? "Paid" : "Unpaid");
      await client.query(
        `UPDATE payments 
         SET payment_status = $1, payment_date = CURRENT_TIMESTAMP 
         WHERE booking_id = $2`,
        [pStatus, bookingId]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: `Booking #${bookingId} status updated to ${status}.`,
      booking: bookingRes.rows[0],
    });
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch (e) {}
    }
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Combined records for company portal
app.get("/api/records", async (req, res) => {
  try {
    const [customers, cars, bookings] = await Promise.all([
      pool.query(`
        SELECT * FROM customers
        ORDER BY customer_id DESC
      `),
      pool.query(`
        SELECT c.*, c.registration_number AS registration_no, cu.name AS full_name, b.brand_name
        FROM cars c
        JOIN customers cu ON cu.customer_id = c.customer_id
        JOIN car_brands b ON b.brand_id = c.brand_id
        ORDER BY c.car_id DESC
      `),
      pool.query(`
        SELECT
          sb.*,
          cu.name AS full_name,
          c.registration_number AS registration_no,
          c.model,
          b.brand_name,
          sc.service_name
        FROM service_bookings sb
        JOIN cars c ON c.car_id = sb.car_id
        JOIN customers cu ON cu.customer_id = sb.customer_id
        JOIN car_brands b ON b.brand_id = c.brand_id
        JOIN service_catalog sc ON sc.service_id = sb.service_id
        ORDER BY sb.booking_id DESC
      `),
    ]);

    res.json({
      customers: customers.rows,
      cars: cars.rows,
      bookings: bookings.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Drive Care API running at http://localhost:${PORT}`);
});
