
const pool = require("./db");

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Shaurya", "Dhruv", "Atharva", "Kabir", "Rudra", "Ananya", "Diya", "Gauri", "Kavya", "Myra",
  "Aadhya", "Saanvi", "Ira", "Prisha", "Pari", "Siya", "Rhea", "Avani", "Meera", "Sara",
  "Rahul", "Rohit", "Vikram", "Suresh", "Ramesh", "Deepak", "Anil", "Sunil", "Manish", "Amit",
  "Pooja", "Neha", "Priya", "Sneha", "Kiran", "Divya", "Swati", "Ritu", "Anjali", "Shweta"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Gupta", "Malhotra", "Mehta", "Bhatia", "Saxena", "Chawla", "Kapoor",
  "Joshi", "Kulkarni", "Deshmukh", "Patil", "Chavan", "Iyer", "Nair", "Menon", "Reddy", "Rao",
  "Choudhury", "Das", "Banerjee", "Chatterjee", "Bose", "Singh", "Yadav", "Mishra", "Pandey", "Tiwari"
];

const CITIES = [
  "Bangalore", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Chandigarh", "Indore", "Coimbatore", "Kochi", "Nagpur"
];

const MODELS_BY_BRAND = {
  1: ["Innova Crysta", "Fortuner", "Urban Cruiser Hyryder", "Glanza", "Camry"],
  2: ["Creta", "Venue", "i20", "Verna", "Tucson", "Alcazar"],
  3: ["Nexon", "Harrier", "Safari", "Punch", "Altroz", "Tiago"],
  4: ["XUV700", "Scorpio-N", "Thar", "XUV300", "Bolero Neo"],
  5: ["Swift", "Baleno", "Brezza", "Dzire", "Ertiga", "Grand Vitara"],
  6: ["City", "Amaze", "Elevate"],
  7: ["Seltos", "Sonet", "Carens", "EV6"],
  8: ["Taigun", "Virtus", "Tiguan"],
  9: ["Kushaq", "Slavia", "Kodiaq"],
  10: ["3 Series", "5 Series", "X1", "X3", "X5"]
};

const RTO_CODES = [
  "KA-01", "KA-02", "KA-03", "KA-04", "KA-05", "MH-01", "MH-02", "MH-12", "MH-14", "DL-01",
  "DL-04", "TS-07", "TS-09", "TN-01", "TN-09", "HR-26", "UP-32", "GJ-01", "WB-02", "KL-07"
];

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Hybrid", "Electric"];

const SERVICES_DATA = [
  { id: 1, name: "General Periodic Service", price: 2499.00 },
  { id: 2, name: "Synthetic Engine Oil & Filter Change", price: 3200.00 },
  { id: 3, name: "Brake Pad Replacement & Rotor Skimming", price: 1850.00 },
  { id: 4, name: "AC Gas Recharge & Disinfection", price: 2150.00 },
  { id: 5, name: "Wheel Alignment & Dynamic Balancing", price: 950.00 },
  { id: 6, name: "Battery Health Test & Replacement", price: 4800.00 },
  { id: 7, name: "Clutch Plate & Pressure Assembly Overhaul", price: 5800.00 },
  { id: 8, name: "Full Ceramic Coating & Interior Detailing", price: 8500.00 }
];

const NOTES_LIST = [
  "Customer reported mild squeaking during braking, full inspection requested.",
  "Scheduled 20,000 km periodic maintenance. Engine runs very smoothly.",
  "Pre-monsoon safety inspection completed with fluid top-up.",
  "Customer requested priority morning pickup slot.",
  "Check suspension alignment after long road trip.",
  "Cabin AC filter replaced and evaporator coil cleaned.",
  "Battery health checked and terminal lubrication applied.",
  "Express routine maintenance completed per manufacturer schedule."
];

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
  "01:30 PM", "02:00 PM", "02:30 PM", "03:30 PM", "04:30 PM"
];

const STATUSES = ["Completed", "Completed", "Completed", "Pending", "In Progress"];
// Valid payment methods allowed by CHECK constraint: 'UPI', 'Card', 'Cash', 'Net Banking'
const VALID_PAY_METHODS = ["UPI", "Card", "Cash", "Net Banking"];

async function seed() {
  console.log("Starting bulk insertion of 500 records (no null values)...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert 500 Customers
    console.log("Inserting 500 customers...");
    const customerIds = [];
    for (let i = 1; i <= 500; i++) {
      const fName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
      const name = `${fName} ${lName}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i + 2000}@drivemail.com`;
      const phone = `98${String(10000000 + i * 17).slice(0, 8)}`;
      const city = CITIES[i % CITIES.length];

      const res = await client.query(
        `INSERT INTO customers (name, email, phone, city, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP - INTERVAL '${500 - i} days')
         RETURNING customer_id`,
        [name, email, phone, city]
      );
      customerIds.push(res.rows[0].customer_id);
    }

    // 2. Insert 500 Cars
    console.log("Inserting 500 cars...");
    const carIds = [];
    for (let i = 0; i < 500; i++) {
      const custId = customerIds[i];
      const brandId = (i % 10) + 1; // 1 to 10
      const modelList = MODELS_BY_BRAND[brandId];
      const model = modelList[i % modelList.length];
      const rto = RTO_CODES[i % RTO_CODES.length];
      const alpha = String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((i * 7) % 26));
      const num = String(1000 + (i * 13) % 8999);
      const regNo = `${rto}-${alpha}-${num}`;
      const year = 2018 + (i % 7); // 2018 to 2024
      const fuel = FUEL_TYPES[i % FUEL_TYPES.length];

      const res = await client.query(
        `INSERT INTO cars (customer_id, brand_id, model, registration_number, manufacturing_year, fuel_type, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP - INTERVAL '${500 - i} days')
         RETURNING car_id`,
        [custId, brandId, model, regNo, year, fuel]
      );
      carIds.push(res.rows[0].car_id);
    }

    // 3. Insert 500 Service Bookings and 500 Payments
    console.log("Inserting 500 service bookings and payments...");
    for (let i = 0; i < 500; i++) {
      const custId = customerIds[i];
      const carId = carIds[i];
      const srv = SERVICES_DATA[i % SERVICES_DATA.length];
      const time = TIME_SLOTS[i % TIME_SLOTS.length];
      const odo = 12000 + (i * 320) % 95000;
      const note = NOTES_LIST[i % NOTES_LIST.length];
      const status = STATUSES[i % STATUSES.length];
      const price = srv.price;

      const daysAgo = 500 - i;
      const bRes = await client.query(
        `INSERT INTO service_bookings (
          customer_id, car_id, service_id, booking_date, booking_time,
          odometer_reading, notes, booking_price, booking_status, created_at
        )
        VALUES (
          $1, $2, $3,
          CURRENT_DATE - INTERVAL '${daysAgo} days',
          $4, $5, $6, $7, $8,
          CURRENT_TIMESTAMP - INTERVAL '${daysAgo} days'
        )
        RETURNING booking_id`,
        [custId, carId, srv.id, time, odo, note, price, status]
      );
      const bookingId = bRes.rows[0].booking_id;

      // Payments: Use valid methods ('UPI', 'Card', 'Cash', 'Net Banking') - NO NULL VALUES
      const payStatus = (status === "Completed") ? "Paid" : "Unpaid";
      const payMethod = VALID_PAY_METHODS[i % VALID_PAY_METHODS.length];
      
      await client.query(
        `INSERT INTO payments (
          booking_id, amount, payment_status, payment_method, payment_date, created_at
        )
        VALUES (
          $1, $2, $3, $4,
          CURRENT_TIMESTAMP - INTERVAL '${daysAgo} days',
          CURRENT_TIMESTAMP - INTERVAL '${daysAgo} days'
        )`,
        [bookingId, price, payStatus, payMethod]
      );
    }

    await client.query("COMMIT");
    console.log("SUCCESS! Exactly 500 records inserted into customers, cars, service_bookings, and payments with ZERO null values!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("SEEDING ERROR:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
