-- ============================================================================
-- DRIVE CARE: CAR SERVICE BOOKING & MANAGEMENT SYSTEM
-- Standalone Idempotent Scenario Seed Script
-- File: database/seed_scenarios.sql
-- Database: car_service_db
-- ============================================================================
-- Safe to execute repeatedly. Contains conditional guards (IF NOT EXISTS /
-- WHERE NOT EXISTS / ON CONFLICT) to prevent any duplicate records.
-- ============================================================================

BEGIN;

-- 1. ADD VEHICLES FOR EXISTING CUSTOMERS (CREATING MULTI-CAR OWNERS)
DO $$
BEGIN

  -- Customer 2: Priya Patel -> adds Honda City
  IF NOT EXISTS (SELECT 1 FROM cars WHERE registration_number = 'KA-05-MN-2022') THEN
    INSERT INTO cars (customer_id, brand_id, model, registration_number, manufacturing_year, fuel_type, created_at)
    VALUES (2, 6, 'City', 'KA-05-MN-2022', 2022, 'Petrol', CURRENT_TIMESTAMP - INTERVAL '180 days');
  END IF;

  -- Customer 6: Sneha Kulkarni -> adds Tata Punch
  IF NOT EXISTS (SELECT 1 FROM cars WHERE registration_number = 'MH-12-PQ-2023') THEN
    INSERT INTO cars (customer_id, brand_id, model, registration_number, manufacturing_year, fuel_type, created_at)
    VALUES (6, 3, 'Punch', 'MH-12-PQ-2023', 2023, 'CNG', CURRENT_TIMESTAMP - INTERVAL '150 days');
  END IF;

  -- Customer 9: Karthik Sundaram -> adds Hyundai Verna
  IF NOT EXISTS (SELECT 1 FROM cars WHERE registration_number = 'TN-01-AB-2021') THEN
    INSERT INTO cars (customer_id, brand_id, model, registration_number, manufacturing_year, fuel_type, created_at)
    VALUES (9, 2, 'Verna', 'TN-01-AB-2021', 2021, 'Diesel', CURRENT_TIMESTAMP - INTERVAL '200 days');
  END IF;

END $$;


-- 2. INSERT DEMO SERVICE BOOKINGS (WITH IDEMPOTENT GUARDS ON NOTES)

-- A. CANCELLED BOOKINGS (2 for customer 2, 2 for customer 6)
INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 2, 3, 3, CURRENT_DATE - INTERVAL '65 days', '10:00 AM', 28500, 'Scenario Demo: Cancelled booking - customer rescheduled', 1850.00, 'Cancelled', CURRENT_TIMESTAMP - INTERVAL '65 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Cancelled booking - customer rescheduled');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 2, 3, 5, CURRENT_DATE - INTERVAL '25 days', '02:00 PM', 29400, 'Scenario Demo: Cancelled booking - weather delay', 950.00, 'Cancelled', CURRENT_TIMESTAMP - INTERVAL '25 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Cancelled booking - weather delay');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 6, 7, 4, CURRENT_DATE - INTERVAL '40 days', '11:30 AM', 22100, 'Scenario Demo: Cancelled booking - urgent travel', 2150.00, 'Cancelled', CURRENT_TIMESTAMP - INTERVAL '40 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Cancelled booking - urgent travel');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 6, 7, 1, CURRENT_DATE - INTERVAL '12 days', '04:00 PM', 23000, 'Scenario Demo: Cancelled booking - personal conflict', 2499.00, 'Cancelled', CURRENT_TIMESTAMP - INTERVAL '12 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Cancelled booking - personal conflict');


-- B. UPCOMING APPOINTMENTS (Future dates with Confirmed/Pending status)
INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 3, 4, 1, CURRENT_DATE + INTERVAL '2 days', '09:30 AM', 31200, 'Scenario Demo: Upcoming appointment - morning slot', 2499.00, 'Confirmed', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Upcoming appointment - morning slot');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 5, 6, 2, CURRENT_DATE + INTERVAL '4 days', '10:30 AM', 45000, 'Scenario Demo: Upcoming appointment - priority maintenance', 3200.00, 'Confirmed', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Upcoming appointment - priority maintenance');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 7, 8, 8, CURRENT_DATE + INTERVAL '6 days', '01:30 PM', 18500, 'Scenario Demo: Upcoming appointment - weekend detailing', 8500.00, 'Pending', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Upcoming appointment - weekend detailing');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 9, 10, 6, CURRENT_DATE + INTERVAL '9 days', '03:00 PM', 52000, 'Scenario Demo: Upcoming appointment - battery inspection', 4800.00, 'Confirmed', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Upcoming appointment - battery inspection');


-- C. COMPLETED FREQUENT VISITS (Across past 12 months for top-10 frequent customer cohort)
INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 1, 1, 2, CURRENT_DATE - INTERVAL '15 days', '11:00 AM', 42000, 'Scenario Demo: Frequent visit - periodic synthetic oil', 3200.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '15 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - periodic synthetic oil');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 7, 8, 3, CURRENT_DATE - INTERVAL '35 days', '10:00 AM', 17800, 'Scenario Demo: Frequent visit - brake pad replacement', 1850.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '35 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - brake pad replacement');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 8, 9, 4, CURRENT_DATE - INTERVAL '50 days', '02:30 PM', 38900, 'Scenario Demo: Frequent visit - AC disinfection', 2150.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '50 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - AC disinfection');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 2, 3, 1, CURRENT_DATE - INTERVAL '70 days', '09:00 AM', 27000, 'Scenario Demo: Frequent visit - 20k general service', 2499.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '70 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - 20k general service');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 3, 4, 5, CURRENT_DATE - INTERVAL '85 days', '01:00 PM', 29000, 'Scenario Demo: Frequent visit - dynamic wheel balancing', 950.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '85 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - dynamic wheel balancing');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 5, 6, 7, CURRENT_DATE - INTERVAL '105 days', '11:00 AM', 41500, 'Scenario Demo: Frequent visit - clutch assembly overhaul', 5800.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '105 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - clutch assembly overhaul');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 6, 7, 2, CURRENT_DATE - INTERVAL '120 days', '03:30 PM', 20500, 'Scenario Demo: Frequent visit - full synthetic oil swap', 3200.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '120 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - full synthetic oil swap');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 9, 10, 8, CURRENT_DATE - INTERVAL '140 days', '10:00 AM', 49000, 'Scenario Demo: Frequent visit - ceramic coating treatment', 8500.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '140 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - ceramic coating treatment');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 10, 11, 1, CURRENT_DATE - INTERVAL '160 days', '10:30 AM', 33000, 'Scenario Demo: Frequent visit - periodic general service', 2499.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '160 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - periodic general service');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 11, 12, 3, CURRENT_DATE - INTERVAL '175 days', '02:00 PM', 26000, 'Scenario Demo: Frequent visit - brake pad skimming', 1850.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '175 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - brake pad skimming');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 12, 13, 6, CURRENT_DATE - INTERVAL '195 days', '11:30 AM', 39000, 'Scenario Demo: Frequent visit - battery replacement', 4800.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '195 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - battery replacement');

INSERT INTO service_bookings (customer_id, car_id, service_id, booking_date, booking_time, odometer_reading, notes, booking_price, booking_status, created_at)
SELECT 13, 14, 4, CURRENT_DATE - INTERVAL '210 days', '04:00 PM', 19500, 'Scenario Demo: Frequent visit - AC cooling maintenance', 2150.00, 'Completed', CURRENT_TIMESTAMP - INTERVAL '210 days'
WHERE NOT EXISTS (SELECT 1 FROM service_bookings WHERE notes = 'Scenario Demo: Frequent visit - AC cooling maintenance');


-- 3. INSERT MATCHING PAYMENTS FOR ALL NEW BOOKINGS

-- Cancelled Bookings -> 'Refunded'
INSERT INTO payments (booking_id, amount, payment_status, payment_method, payment_date, created_at)
SELECT b.booking_id, b.booking_price, 'Refunded', 'UPI', b.created_at, b.created_at
FROM service_bookings b
WHERE b.notes LIKE 'Scenario Demo: Cancelled booking%'
ON CONFLICT (booking_id) DO NOTHING;

-- Upcoming Appointments -> 'Unpaid'
INSERT INTO payments (booking_id, amount, payment_status, payment_method, payment_date, created_at)
SELECT b.booking_id, b.booking_price, 'Unpaid', 'UPI', NULL, b.created_at
FROM service_bookings b
WHERE b.notes LIKE 'Scenario Demo: Upcoming appointment%'
ON CONFLICT (booking_id) DO NOTHING;

-- Completed Frequent Visits -> 'Paid'
INSERT INTO payments (booking_id, amount, payment_status, payment_method, payment_date, created_at)
SELECT b.booking_id, b.booking_price, 'Paid', 'UPI', b.created_at, b.created_at
FROM service_bookings b
WHERE b.notes LIKE 'Scenario Demo: Frequent visit%'
ON CONFLICT (booking_id) DO NOTHING;

-- 4. ENSURE FUTURE APPOINTMENT FOR BOOKING #21 IS PENDING (NOT COMPLETED)
UPDATE service_bookings
SET booking_status = 'Pending'
WHERE booking_id = 21 AND booking_status = 'Completed';

UPDATE payments
SET payment_status = 'Unpaid', payment_date = NULL
WHERE booking_id = 21 AND payment_status = 'Paid';

COMMIT;

-- ============================================================================
-- END OF SCRIPT: seed_scenarios.sql
-- ============================================================================
