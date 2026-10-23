-- ============================================================================
-- DRIVE CARE: CAR SERVICE BOOKING & MANAGEMENT SYSTEM
-- Comprehensive PostgreSQL Demonstration & Viva Analysis Queries
-- Database: car_service_db
-- ============================================================================
-- Purpose:
-- This SQL script provides 20 industry-standard analytical and operational 
-- queries demonstrating key relational database concepts:
-- Multi-Table INNER / LEFT JOINs, Aggregates (COUNT, SUM, AVG), GROUP BY & HAVING,
-- Subqueries, Common Table Expressions (CTEs), Window Functions (DENSE_RANK, 
-- running totals with OVER), Conditional Aggregation (CASE), and Date/Time arithmetic.
-- ============================================================================


-- ============================================================================
-- 1. TOP 10 FREQUENT CUSTOMERS
-- Concepts: INNER JOIN, GROUP BY, Aggregate COUNT, ORDER BY, LIMIT
-- Viva Note: Identifies brand-loyal repeat customers who completed multiple 
-- service bookings, useful for loyalty reward programs.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name,
    c.phone,
    c.city,
    COUNT(sb.booking_id) AS completed_visits
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
WHERE sb.booking_status = 'Completed'
GROUP BY c.customer_id, c.name, c.phone, c.city
ORDER BY completed_visits DESC, c.customer_id ASC
LIMIT 10;


-- ============================================================================
-- 2. INACTIVE CUSTOMERS (> 180 DAYS SINCE LAST COMPLETED VISIT)
-- Concepts: Aggregate MAX(), HAVING clause, Date arithmetic (CURRENT_DATE - INTERVAL)
-- Viva Note: Demonstrates how the HAVING clause filters groups after aggregation
-- to spot churned or inactive customers needing marketing re-engagement.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name,
    c.email,
    c.city,
    MAX(sb.booking_date) AS last_completed_visit,
    CURRENT_DATE - MAX(sb.booking_date) AS days_since_last_visit
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
WHERE sb.booking_status = 'Completed'
GROUP BY c.customer_id, c.name, c.email, c.city
HAVING MAX(sb.booking_date) < CURRENT_DATE - INTERVAL '180 days'
ORDER BY days_since_last_visit DESC
LIMIT 15;


-- ============================================================================
-- 3. CUSTOMERS WHO VISITED WITHIN THE LAST 30 DAYS
-- Concepts: Multi-table JOIN (3 tables), Date filtering, DISTINCT
-- Viva Note: Tracks active operational throughput in the past month.
-- ============================================================================
SELECT DISTINCT
    c.customer_id,
    c.name,
    c.phone,
    sb.booking_id,
    sb.booking_date,
    sc.service_name,
    sb.booking_status
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
JOIN service_catalog sc ON sb.service_id = sc.service_id
WHERE sb.booking_status = 'Completed'
  AND sb.booking_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY sb.booking_date DESC;


-- ============================================================================
-- 4. CUSTOMERS WITH EXACTLY ONE COMPLETED VISIT (ONE-TIME CUSTOMERS)
-- Concepts: GROUP BY, HAVING COUNT(*) = 1, MAX()
-- Viva Note: Identifies one-time trial users who have not yet booked their 
-- second service, a primary target group for retention campaigns.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name,
    c.city,
    COUNT(sb.booking_id) AS completed_visits,
    MAX(sb.booking_date) AS visit_date
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
WHERE sb.booking_status = 'Completed'
GROUP BY c.customer_id, c.name, c.city
HAVING COUNT(sb.booking_id) = 1
ORDER BY c.customer_id ASC
LIMIT 15;


-- ============================================================================
-- 5. REGISTERED CUSTOMERS WHO HAVE NEVER BOOKED A SERVICE
-- Concepts: LEFT OUTER JOIN, IS NULL check (Anti-Join pattern)
-- Viva Note: Classical DBMS anti-join technique to find orphan parent records 
-- that have no corresponding foreign-key records in service_bookings.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name,
    c.email,
    c.phone,
    c.city,
    c.created_at::DATE AS registration_date
FROM customers c
LEFT JOIN service_bookings sb ON c.customer_id = sb.customer_id
WHERE sb.booking_id IS NULL
ORDER BY c.customer_id ASC;


-- ============================================================================
-- 6. TOP 10 CUSTOMERS BY TOTAL PAID SPENDING (HIGH-VALUE CUSTOMERS)
-- Concepts: 3-Table INNER JOIN, Aggregate SUM(), Monetary formatting TO_CHAR()
-- Viva Note: Ranks customers by cumulative revenue contribution from completed, 
-- paid invoices to identify VIP accounts.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name,
    c.city,
    COUNT(p.payment_id) AS paid_transactions,
    ROUND(SUM(p.amount), 2) AS total_paid_amount,
    TO_CHAR(SUM(p.amount), 'FM₹99,99,999.00') AS formatted_total_spent
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
JOIN payments p ON sb.booking_id = p.booking_id
WHERE p.payment_status = 'Paid'
GROUP BY c.customer_id, c.name, c.city
ORDER BY total_paid_amount DESC
LIMIT 10;


-- ============================================================================
-- 7. TOTAL REVENUE FROM PAID PAYMENTS
-- Concepts: Single-table Aggregates (COUNT, SUM, AVG), Currency formatting
-- Viva Note: Computes executive-level financial KPIs: gross realized revenue 
-- and average invoice ticket size.
-- ============================================================================
SELECT 
    COUNT(*) AS total_paid_invoices,
    ROUND(SUM(amount), 2) AS total_revenue_numeric,
    TO_CHAR(SUM(amount), 'FM₹99,99,999.00') AS total_paid_revenue,
    ROUND(AVG(amount), 2) AS average_ticket_size
FROM payments
WHERE payment_status = 'Paid';


-- ============================================================================
-- 8. UNPAID AND PENDING PAYMENTS (OUTSTANDING RECEIVABLES)
-- Concepts: Multi-table JOIN (4 tables), IN filter, COALESCE()
-- Viva Note: Essential accounting query displaying receivables due from clients,
-- linking invoice amounts with car and service descriptions.
-- ============================================================================
SELECT 
    p.payment_id,
    p.booking_id,
    c.customer_id,
    c.name AS customer_name,
    c.phone,
    sc.service_name,
    sb.booking_date,
    sb.booking_status,
    p.amount AS pending_amount,
    p.payment_status,
    COALESCE(p.payment_method, 'Not Selected') AS payment_method
FROM payments p
JOIN service_bookings sb ON p.booking_id = sb.booking_id
JOIN customers c ON sb.customer_id = c.customer_id
JOIN service_catalog sc ON sb.service_id = sc.service_id
WHERE p.payment_status IN ('Unpaid', 'Pending')
ORDER BY sb.booking_date DESC
LIMIT 15;


-- ============================================================================
-- 9. MOST POPULAR SERVICES & REVENUE CONTRIBUTION
-- Concepts: LEFT JOIN, GROUP BY, Window Function SUM() OVER () for market share
-- Viva Note: Demonstrates how window functions compute percentage of total 
-- bookings across rows without collapsing the result set.
-- ============================================================================
SELECT 
    sc.service_id,
    sc.service_name,
    sc.base_price,
    COUNT(sb.booking_id) AS total_bookings,
    COUNT(CASE WHEN sb.booking_status = 'Completed' THEN 1 END) AS completed_bookings,
    TO_CHAR(COALESCE(SUM(CASE WHEN p.payment_status = 'Paid' THEN p.amount ELSE 0 END), 0), 'FM₹99,99,999.00') AS total_collected_revenue,
    ROUND(COUNT(sb.booking_id) * 100.0 / SUM(COUNT(sb.booking_id)) OVER (), 2) AS market_share_percentage
FROM service_catalog sc
LEFT JOIN service_bookings sb ON sc.service_id = sb.service_id
LEFT JOIN payments p ON sb.booking_id = p.booking_id
GROUP BY sc.service_id, sc.service_name, sc.base_price
ORDER BY total_bookings DESC;


-- ============================================================================
-- 10. MOST POPULAR CAR BRANDS FOR SERVICING
-- Concepts: Multi-table LEFT JOIN, COUNT(DISTINCT), Window Function
-- Viva Note: Distinguishes between unique cars registered per brand vs total 
-- workshop visits generated by that brand.
-- ============================================================================
SELECT 
    cb.brand_id,
    cb.brand_name,
    cb.country,
    COUNT(DISTINCT cr.car_id) AS registered_vehicles,
    COUNT(sb.booking_id) AS total_service_visits,
    ROUND(COUNT(sb.booking_id) * 100.0 / NULLIF(SUM(COUNT(sb.booking_id)) OVER (), 0), 2) AS visit_share_pct
FROM car_brands cb
LEFT JOIN cars cr ON cb.brand_id = cr.brand_id
LEFT JOIN service_bookings sb ON cr.car_id = sb.car_id
GROUP BY cb.brand_id, cb.brand_name, cb.country
ORDER BY total_service_visits DESC;


-- ============================================================================
-- 11. MONTHLY BOOKING COUNTS FOR THE PREVIOUS 12 MONTHS
-- Concepts: DATE_TRUNC(), TO_CHAR(), Conditional Aggregation (CASE WHEN)
-- Viva Note: Displays time-series workload trends by breaking bookings down 
-- by status (Completed, Cancelled, Pending) per calendar month.
-- ============================================================================
SELECT 
    TO_CHAR(DATE_TRUNC('month', booking_date), 'YYYY-MM') AS booking_month,
    COUNT(*) AS total_bookings,
    COUNT(CASE WHEN booking_status = 'Completed' THEN 1 END) AS completed_bookings,
    COUNT(CASE WHEN booking_status = 'Cancelled' THEN 1 END) AS cancelled_bookings,
    COUNT(CASE WHEN booking_status IN ('Pending', 'Confirmed') THEN 1 END) AS pending_or_confirmed
FROM service_bookings
WHERE booking_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', booking_date)
ORDER BY booking_month ASC;


-- ============================================================================
-- 12. CUSTOMERS WHO OWN MULTIPLE CARS
-- Concepts: INNER JOIN (3 tables), GROUP BY, HAVING COUNT() > 1, STRING_AGG()
-- Viva Note: STRING_AGG() concatenates multiple vehicle records into a 
-- human-readable list for each multi-car family or fleet owner.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name,
    c.phone,
    c.city,
    COUNT(cr.car_id) AS total_cars_owned,
    STRING_AGG(cb.brand_name || ' ' || cr.model || ' (' || cr.registration_number || ')', ', ' ORDER BY cr.car_id) AS vehicles_owned
FROM customers c
JOIN cars cr ON c.customer_id = cr.customer_id
JOIN car_brands cb ON cr.brand_id = cb.brand_id
GROUP BY c.customer_id, c.name, c.phone, c.city
HAVING COUNT(cr.car_id) > 1
ORDER BY total_cars_owned DESC, c.customer_id ASC;


-- ============================================================================
-- 13. LAST COMPLETED VISIT AND TOTAL COMPLETED VISITS PER CUSTOMER
-- Concepts: GROUP BY, COUNT(), MAX(date), Date difference arithmetic
-- Viva Note: Builds a customer profile summary showing total lifetime visits 
-- alongside recency (days elapsed since last service).
-- ============================================================================
SELECT 
    c.customer_id,
    c.name AS customer_name,
    c.city,
    COUNT(sb.booking_id) AS total_completed_visits,
    MAX(sb.booking_date) AS last_completed_visit_date,
    CURRENT_DATE - MAX(sb.booking_date) AS days_since_last_visit
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
WHERE sb.booking_status = 'Completed'
GROUP BY c.customer_id, c.name, c.city
ORDER BY total_completed_visits DESC, last_completed_visit_date DESC
LIMIT 20;


-- ============================================================================
-- 14. CUSTOMERS WITH UPCOMING APPOINTMENTS
-- Concepts: Multi-table JOIN (5 tables), Future Date comparison (>= CURRENT_DATE)
-- Viva Note: Operational query for workshop supervisors to prepare staff, 
-- spare parts, and service bays for scheduled future appointments.
-- ============================================================================
SELECT 
    sb.booking_id,
    c.customer_id,
    c.name AS customer_name,
    c.phone,
    cb.brand_name || ' ' || cr.model AS vehicle,
    cr.registration_number,
    sc.service_name,
    sb.booking_date,
    sb.booking_time,
    sb.booking_status,
    p.payment_status
FROM service_bookings sb
JOIN customers c ON sb.customer_id = c.customer_id
JOIN cars cr ON sb.car_id = cr.car_id
JOIN car_brands cb ON cr.brand_id = cb.brand_id
JOIN service_catalog sc ON sb.service_id = sc.service_id
LEFT JOIN payments p ON sb.booking_id = p.booking_id
WHERE sb.booking_date >= CURRENT_DATE
  AND sb.booking_status IN ('Pending', 'Confirmed')
ORDER BY sb.booking_date ASC, sb.booking_time ASC;


-- ============================================================================
-- 15. AVERAGE SPENDING PER CUSTOMER
-- Concepts: Common Table Expression (CTE), LEFT JOIN, Conditional Aggregates
-- Viva Note: Compares two critical business metrics: average spend across 
-- all registered users vs average spend among active paying customers.
-- ============================================================================
WITH customer_spending AS (
    SELECT 
        c.customer_id,
        COALESCE(SUM(p.amount), 0) AS total_spent
    FROM customers c
    LEFT JOIN service_bookings sb ON c.customer_id = sb.customer_id
    LEFT JOIN payments p ON sb.booking_id = p.booking_id AND p.payment_status = 'Paid'
    GROUP BY c.customer_id
)
SELECT 
    COUNT(*) AS total_registered_customers,
    COUNT(CASE WHEN total_spent > 0 THEN 1 END) AS paying_customers,
    ROUND(AVG(total_spent), 2) AS avg_spending_all_registered_customers,
    ROUND(AVG(CASE WHEN total_spent > 0 THEN total_spent END), 2) AS avg_spending_per_paying_customer
FROM customer_spending;


-- ============================================================================
-- 16. CUSTOMERS WITH MULTIPLE CANCELLED BOOKINGS
-- Concepts: INNER JOIN, HAVING COUNT() > 1, STRING_AGG()
-- Viva Note: Helps customer service managers spot friction, service slot 
-- conflicts, or chronic cancellation patterns requiring investigation.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name,
    c.phone,
    c.city,
    COUNT(sb.booking_id) AS cancelled_bookings_count,
    STRING_AGG('Booking #' || sb.booking_id || ' (' || sb.booking_date::TEXT || ')', '; ') AS cancelled_records
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
WHERE sb.booking_status = 'Cancelled'
GROUP BY c.customer_id, c.name, c.phone, c.city
HAVING COUNT(sb.booking_id) > 1
ORDER BY cancelled_bookings_count DESC;


-- ============================================================================
-- 17. MONTHLY REVENUE TREND & CUMULATIVE RUNNING TOTAL
-- Concepts: Window Function SUM() OVER (ORDER BY ...), Running Total, TO_CHAR()
-- Viva Note: Uses an analytical window function to compute month-by-month revenue
-- plus an accumulating running total across the entire lifetime of the business.
-- ============================================================================
SELECT 
    TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') AS revenue_month,
    COUNT(payment_id) AS paid_transactions,
    ROUND(SUM(amount), 2) AS total_monthly_revenue,
    TO_CHAR(SUM(amount), 'FM₹99,99,999.00') AS formatted_monthly_revenue,
    ROUND(AVG(amount), 2) AS avg_transaction_value,
    ROUND(SUM(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', payment_date)), 2) AS cumulative_running_revenue
FROM payments
WHERE payment_status = 'Paid' AND payment_date IS NOT NULL
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY revenue_month ASC;


-- ============================================================================
-- 18. RANK CUSTOMERS BY NUMBER OF COMPLETED VISITS (WINDOW FUNCTION)
-- Concepts: DENSE_RANK() OVER (ORDER BY ...), Window Function
-- Viva Note: Unlike standard RANK(), DENSE_RANK() does not leave gaps between 
-- rank positions when ties occur, providing a clean customer leaderboard.
-- ============================================================================
SELECT 
    c.customer_id,
    c.name AS customer_name,
    c.city,
    COUNT(sb.booking_id) AS completed_visits,
    DENSE_RANK() OVER (ORDER BY COUNT(sb.booking_id) DESC) AS visit_rank
FROM customers c
JOIN service_bookings sb ON c.customer_id = sb.customer_id
WHERE sb.booking_status = 'Completed'
GROUP BY c.customer_id, c.name, c.city
ORDER BY visit_rank ASC, c.customer_id ASC
LIMIT 15;


-- ============================================================================
-- 19. REPEAT CUSTOMER PERCENTAGE (RETENTION RATE)
-- Concepts: CTE, Conditional Aggregates (CASE WHEN), Mathematical percentage
-- Viva Note: Key DBMS analytics metric showing workshop customer retention:
-- (Customers with > 1 completed visit / Total customers with service history) * 100.
-- ============================================================================
WITH booking_summary AS (
    SELECT 
        customer_id,
        COUNT(CASE WHEN booking_status = 'Completed' THEN 1 END) AS completed_visits
    FROM service_bookings
    GROUP BY customer_id
)
SELECT 
    COUNT(*) AS total_customers_with_history,
    COUNT(CASE WHEN completed_visits = 1 THEN 1 END) AS one_time_customers,
    COUNT(CASE WHEN completed_visits > 1 THEN 1 END) AS repeat_customers,
    ROUND(COUNT(CASE WHEN completed_visits > 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS repeat_customer_percentage
FROM booking_summary
WHERE completed_visits > 0;


-- ============================================================================
-- 20. COHORT COMPARISON: FREQUENT CUSTOMERS VS INACTIVE CUSTOMERS
-- Concepts: Multiple CTEs, CASE categorization, Multi-level Aggregation
-- Viva Note: Advanced analytical query segmenting the customer base into 
-- distinct behavioral cohorts and comparing their average visits and financial spend.
-- ============================================================================
WITH customer_activity AS (
    SELECT 
        c.customer_id,
        c.name,
        COUNT(CASE WHEN sb.booking_status = 'Completed' THEN 1 END) AS total_completed,
        MAX(CASE WHEN sb.booking_status = 'Completed' THEN sb.booking_date END) AS last_visit_date,
        COALESCE(SUM(CASE WHEN p.payment_status = 'Paid' THEN p.amount ELSE 0 END), 0) AS total_paid
    FROM customers c
    JOIN service_bookings sb ON c.customer_id = sb.customer_id
    LEFT JOIN payments p ON sb.booking_id = p.booking_id
    GROUP BY c.customer_id, c.name
),
cohorts AS (
    SELECT 
        customer_id,
        name,
        total_completed,
        last_visit_date,
        total_paid,
        CASE 
            WHEN total_completed >= 2 THEN 'Frequent Customer (>= 2 visits)'
            WHEN last_visit_date < CURRENT_DATE - INTERVAL '180 days' THEN 'Inactive Customer (> 180 days ago)'
            ELSE 'Regular / Recent Customer'
        END AS customer_cohort
    FROM customer_activity
)
SELECT 
    customer_cohort,
    COUNT(*) AS total_customers_in_cohort,
    ROUND(AVG(total_completed), 1) AS avg_completed_visits,
    ROUND(AVG(total_paid), 2) AS avg_revenue_per_customer,
    TO_CHAR(SUM(total_paid), 'FM₹99,99,999.00') AS cohort_total_revenue
FROM cohorts
WHERE customer_cohort IN ('Frequent Customer (>= 2 visits)', 'Inactive Customer (> 180 days ago)')
GROUP BY customer_cohort
ORDER BY total_customers_in_cohort DESC;

-- ============================================================================
-- END OF SCRIPT: demo_queries.sql
-- ============================================================================
