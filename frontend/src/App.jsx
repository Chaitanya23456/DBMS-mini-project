
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

/* ── SVG icons ───────────────────────────────────────────────────── */
const Icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  logOut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

/* ── Staff navigation items ────────────────────────────────────────── */
const STAFF_NAV = [
  { id: "dashboard",       label: "Overview",          icon: Icons.home },
  { id: "assign-mechanic", label: "Assign Mechanic",   icon: Icons.wrench },
  { id: "records",         label: "All Master Records",icon: Icons.table },
];

/* ── Customer navigation items ─────────────────────────────────────── */
const CUSTOMER_NAV = [
  { id: "my-profile",  label: "My Profile",      icon: Icons.user },
  { id: "my-vehicles", label: "My Vehicles",     icon: Icons.car },
  { id: "add-car",     label: "Add Vehicle",     icon: Icons.plus },
  { id: "my-bookings", label: "Service History", icon: Icons.calendar },
  { id: "new-booking", label: "Book a Service",  icon: Icons.wrench },
];

/* ── Status badge ─────────────────────────────────────────────────── */
function StatusBadge({ value }) {
  const map = {
    pending:   "badge-yellow",
    completed: "badge-green",
    cancelled: "badge-red",
    unpaid:    "badge-orange",
    paid:      "badge-green",
  };
  const cls = map[(value || "").toLowerCase()] || "badge-gray";
  return <span className={`badge ${cls}`}>{value}</span>;
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function App() {
  // Mode: "choose" | "staff" | "customer-login" | "customer-portal"
  const [role, setRole] = useState("choose"); 
  const [activeTab, setActiveTab] = useState("dashboard");

  // Company / Staff State
  const [customers, setCustomers] = useState([]);
  const [cars, setCars]           = useState([]);
  const [brands, setBrands]       = useState([]);
  const [services, setServices]   = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [records, setRecords]     = useState({ customers: [], cars: [], bookings: [], mechanics: [] });
  const [selectedMechanicMap, setSelectedMechanicMap] = useState({});
  const [mechanicFilter, setMechanicFilter] = useState("unassigned");
  const [mechanicSearch, setMechanicSearch] = useState("");

  // Customer Portal State
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  const [customerData, setCustomerData] = useState({ customer: null, cars: [], bookings: [] });
  const [selectedCarForBooking, setSelectedCarForBooking] = useState("");
  const [loginInput, setLoginInput] = useState("");

  // Common UI State
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Staff Data
  const loadStaffData = useCallback(async () => {
    setLoading(true);
    try {
      const [cList, carList, bList, sList, recs, mList] = await Promise.all([
        request("/customers"),
        request("/cars"),
        request("/brands"),
        request("/services"),
        request("/records"),
        request("/mechanics"),
      ]);
      setCustomers(cList);
      setCars(carList);
      setBrands(bList);
      setServices(sList);
      setRecords(recs);
      setMechanics(mList);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Customer Profile & History (and brands for adding a car)
  const loadCustomerData = useCallback(async (customerId) => {
    setLoading(true);
    try {
      const [myData, sList, bList] = await Promise.all([
        request(`/customer/my-data/${customerId}`),
        request("/services"),
        request("/brands"),
      ]);
      setCustomerData(myData);
      setServices(sList);
      setBrands(bList);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // When switching to staff mode
  const enterStaffMode = () => {
    setRole("staff");
    setActiveTab("dashboard");
    loadStaffData();
  };

  // Handle Customer Login
  async function handleCustomerLogin(e) {
    e.preventDefault();
    if (!loginInput.trim()) return;

    setSubmitting(true);
    try {
      const cust = await request("/customer/login", {
        method: "POST",
        body: JSON.stringify({ emailOrPhone: loginInput.trim() }),
      });
      setLoggedInCustomer(cust);
      setRole("customer-portal");
      setActiveTab("my-profile");
      await loadCustomerData(cust.customer_id);
      showToast("success", `Welcome back, ${cust.name}!`);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Customer adding a new car
  async function handleCustomerAddCar(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    body.customer_id = loggedInCustomer.customer_id; // automatically bind to current customer

    setSubmitting(true);
    try {
      const newCar = await request("/cars", {
        method: "POST",
        body: JSON.stringify(body),
      });
      form.reset();
      showToast("success", "Vehicle registered successfully!");
      await loadCustomerData(loggedInCustomer.customer_id);
      // Automatically preselect this car and take them to book a service!
      setSelectedCarForBooking(String(newCar.car_id));
      setActiveTab("new-booking");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Staff Form Submissions
  async function handleStaffSubmit(e, endpoint) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);
    try {
      await request(endpoint, { method: "POST", body: JSON.stringify(body) });
      form.reset();
      showToast("success", "Saved successfully!");
      await loadStaffData();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Staff updating booking status (e.g. Completed, In Progress, Cancelled)
  async function handleUpdateBookingStatus(bookingId, newStatus) {
    try {
      await request(`/bookings/${bookingId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      showToast("success", `Booking #${bookingId} marked as ${newStatus}!`);
      await loadStaffData();
    } catch (err) {
      showToast("error", err.message);
    }
  }

  // Handle Staff assigning or unassigning a mechanic
  async function handleAssignMechanic(bookingId, mechanicId) {
    setSubmitting(true);
    try {
      const res = await request(`/bookings/${bookingId}/assign-mechanic`, {
        method: "PUT",
        body: JSON.stringify({ mechanic_id: mechanicId }),
      });
      showToast("success", res.message || "Mechanic assignment updated successfully!");
      // clear temporary selection for this booking
      setSelectedMechanicMap(prev => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
      await loadStaffData();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Quick Assign Form Submission
  async function handleAssignFormSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const bookingId = formData.get("booking_id");
    const mechanicId = formData.get("mechanic_id");

    if (!bookingId) {
      showToast("error", "Please select a booking to assign.");
      return;
    }
    if (!mechanicId) {
      showToast("error", "Please select a mechanic.");
      return;
    }

    await handleAssignMechanic(bookingId, mechanicId);
    form.reset();
  }

  // Handle Customer Service Booking
  async function handleCustomerBooking(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);
    try {
      await request("/bookings", { method: "POST", body: JSON.stringify(body) });
      form.reset();
      showToast("success", "Service booked successfully!");
      await loadCustomerData(loggedInCustomer.customer_id);
      setActiveTab("my-bookings");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     PORTAL ROLE SELECTION SCREEN
     ════════════════════════════════════════════════════════════════════ */
  if (role === "choose") {
    return (
      <div className="login-screen">
        <div className="login-card role-picker">
          <div className="login-brand">
            <span className="brand-icon-lg">{Icons.car}</span>
            <h1>Drive Care</h1>
            <p>Multi-Brand Automotive Service System</p>
          </div>

          <p className="role-prompt">Please select how you want to log in:</p>

          <div className="role-options">
            <button className="role-btn role-company" onClick={enterStaffMode}>
              <div className="role-btn-icon">{Icons.shield}</div>
              <div className="role-btn-text">
                <strong>Company Portal</strong>
                <span>Staff & Management Dashboard (Full Access)</span>
              </div>
            </button>

            <button 
              className="role-btn role-customer" 
              onClick={() => setRole("customer-login")}
            >
              <div className="role-btn-icon">{Icons.user}</div>
              <div className="role-btn-text">
                <strong>Customer Portal</strong>
                <span>View My Vehicles, Add Car & Book Services</span>
              </div>
            </button>
          </div>

          <div className="portal-footer">
            <span>Powered by PostgreSQL Database</span>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     CUSTOMER LOGIN SCREEN
     ════════════════════════════════════════════════════════════════════ */
  if (role === "customer-login") {
    return (
      <div className="login-screen">
        <div className="login-card">
          <button className="btn-back" onClick={() => setRole("choose")}>
            ← Back to Portal Select
          </button>
          <div className="login-brand">
            <span className="brand-icon-lg">{Icons.user}</span>
            <h2>Customer Sign In</h2>
            <p>Access only your registered vehicles and bookings</p>
          </div>

          {toast && (
            <div className={`toast-inline toast-${toast.type}`}>
              {toast.msg}
            </div>
          )}

          <form onSubmit={handleCustomerLogin} className="login-form">
            <Field label="Registered Email or Phone Number">
              <input
                type="text"
                placeholder="e.g. aarav.sharma@gmail.com or 9845012345"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                required
              />
            </Field>

            <button type="submit" className="btn-primary btn-block" disabled={submitting}>
              {submitting ? "Signing in..." : "View My Records"}
            </button>
          </form>

          <div className="login-help">
            <p className="help-text">
              <strong>Need a test account?</strong> Try:
            </p>
            <code>aarav.sharma@gmail.com</code> or <code>priya.patel@yahoo.com</code>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     CUSTOMER PORTAL INTERFACE
     ════════════════════════════════════════════════════════════════════ */
  if (role === "customer-portal") {
    const cust = customerData.customer || loggedInCustomer;
    return (
      <div className="layout">
        {/* Customer Sidebar */}
        <aside className={`sidebar customer-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand">
            <span className="brand-icon">{Icons.car}</span>
            <div>
              <div className="brand-name">Drive Care</div>
              <div className="brand-sub">Customer Area</div>
            </div>
          </div>

          <div className="user-pill">
            <div className="user-avatar">{cust?.name ? cust.name[0] : "C"}</div>
            <div className="user-info">
              <div className="user-name">{cust?.name}</div>
              <div className="user-meta">{cust?.city || "Customer"}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {CUSTOMER_NAV.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`nav-item ${activeTab === id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button 
              className="btn-logout" 
              onClick={() => {
                setLoggedInCustomer(null);
                setRole("choose");
              }}
            >
              <span className="btn-icon">{Icons.logOut}</span>
              Sign Out
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="main-wrap">
          <header className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>
              <span /><span /><span />
            </button>
            <div className="topbar-title">
              {CUSTOMER_NAV.find(n => n.id === activeTab)?.label}
            </div>
            <button 
              className="btn-refresh" 
              onClick={() => loadCustomerData(cust.customer_id)}
            >
              <span className="btn-icon">{Icons.refresh}</span> Refresh
            </button>
          </header>

          {toast && (
            <div className={`toast toast-${toast.type}`}>
              {toast.msg}
            </div>
          )}

          <main className="content">
            {loading ? (
              <div className="loading-wrap">
                <div className="spinner" />
                <p>Loading your profile...</p>
              </div>
            ) : (
              <>
                {/* Tab: My Profile */}
                {activeTab === "my-profile" && (
                  <div className="cust-tab">
                    <div className="page-header">
                      <div>
                        <h1 className="page-title">Personal Details</h1>
                        <p className="page-sub">Only you can view these details.</p>
                      </div>
                    </div>

                    <div className="cust-overview-grid">
                      <div className="info-card">
                        <h3 className="card-heading">Contact Information</h3>
                        <div className="info-list">
                          <div className="info-row">
                            <span className="info-label">Full Name:</span>
                            <span className="info-val">{cust?.name}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Email Address:</span>
                            <span className="info-val">{cust?.email}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Phone:</span>
                            <span className="info-val">{cust?.phone || "Not recorded"}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Registered City:</span>
                            <span className="info-val">{cust?.city || "Not recorded"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="info-card summary-highlight">
                        <h3 className="card-heading">Vehicle & Booking Summary</h3>
                        <div className="summary-boxes">
                          <div className="sum-box">
                            <span className="sum-num">{customerData.cars.length}</span>
                            <span className="sum-lbl">My Vehicles</span>
                          </div>
                          <div className="sum-box">
                            <span className="sum-num">{customerData.bookings.length}</span>
                            <span className="sum-lbl">Total Bookings</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                          <button 
                            className="btn-primary" 
                            style={{ flex: 1 }}
                            onClick={() => setActiveTab("add-car")}
                          >
                            + Add New Car
                          </button>
                          <button 
                            className="btn-refresh" 
                            style={{ flex: 1, justifyContent: "center" }}
                            onClick={() => setActiveTab("new-booking")}
                          >
                            Book Service
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: My Vehicles */}
                {activeTab === "my-vehicles" && (
                  <div className="cust-tab">
                    <div className="page-header">
                      <div>
                        <h1 className="page-title">My Registered Vehicles</h1>
                        <p className="page-sub">Cars associated with your profile.</p>
                      </div>
                      <button className="btn-primary" onClick={() => setActiveTab("add-car")}>
                        + Add New Car
                      </button>
                    </div>

                    {customerData.cars.length === 0 ? (
                      <div className="empty-box">
                        <p>No vehicles registered under your account yet.</p>
                        <button 
                          className="btn-primary" 
                          style={{ marginTop: "14px" }}
                          onClick={() => setActiveTab("add-car")}
                        >
                          + Add Your First Vehicle
                        </button>
                      </div>
                    ) : (
                      <div className="cars-grid">
                        {customerData.cars.map(c => (
                          <div key={c.car_id} className="car-card">
                            <div className="car-card-header">
                              <span className="car-brand-name">{c.brand_name}</span>
                              <code className="reg-no">{c.registration_number}</code>
                            </div>
                            <div className="car-model-title">{c.model}</div>
                            <div className="car-details">
                              <span>Model Year: <strong>{c.manufacturing_year}</strong></span>
                              <span>Fuel: <strong className="fuel-tag">{c.fuel_type}</strong></span>
                            </div>
                            <button 
                              className="btn-link"
                              onClick={() => {
                                setSelectedCarForBooking(String(c.car_id));
                                setActiveTab("new-booking");
                              }}
                            >
                              + Book Service for this car
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Add Vehicle */}
                {activeTab === "add-car" && (
                  <div className="cust-tab">
                    <div className="page-header">
                      <div>
                        <h1 className="page-title">Register Your Vehicle</h1>
                        <p className="page-sub">Add a car to your account to book maintenance and repair services.</p>
                      </div>
                    </div>

                    <div className="form-card">
                      <form onSubmit={handleCustomerAddCar} className="form-grid">
                        <Field label="Brand / Manufacturer *">
                          <select name="brand_id" required defaultValue="">
                            <option value="">Select vehicle brand...</option>
                            {brands.map(b => (
                              <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Model *">
                          <input name="model" required placeholder="e.g. Swift, City, Nexon, Creta" />
                        </Field>

                        <Field label="Registration Number (Number Plate) *">
                          <input name="registration_no" placeholder="e.g. KA-01-AB-1234" required />
                        </Field>

                        <Field label="Manufacture Year *">
                          <input 
                            name="manufacture_year" 
                            type="number" 
                            min="1980" 
                            max={new Date().getFullYear() + 1} 
                            required 
                            placeholder="2021" 
                          />
                        </Field>

                        <Field label="Fuel Type *">
                          <select name="fuel_type" required defaultValue="">
                            <option value="">Select fuel type...</option>
                            {["Petrol", "Diesel", "CNG", "Hybrid", "Electric"].map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </Field>

                        <div className="form-actions">
                          <button className="btn-primary" type="submit" disabled={submitting}>
                            {submitting ? "Adding..." : "Register Car & Proceed to Service Booking"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Tab: My Bookings */}
                {activeTab === "my-bookings" && (
                  <div className="cust-tab">
                    <div className="page-header">
                      <div>
                        <h1 className="page-title">My Service History</h1>
                        <p className="page-sub">All past and pending service requests for your cars.</p>
                      </div>
                      <button className="btn-primary" onClick={() => setActiveTab("new-booking")}>
                        + Book New Service
                      </button>
                    </div>

                    <div className="home-card">
                      {customerData.bookings.length === 0 ? (
                        <div className="empty-box">
                          <p>You have not booked any services yet.</p>
                          <button 
                            className="btn-primary" 
                            style={{ marginTop: "14px" }}
                            onClick={() => setActiveTab("new-booking")}
                          >
                            Book Your First Service
                          </button>
                        </div>
                      ) : (
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Booking #</th>
                                <th>Vehicle</th>
                                <th>Service</th>
                                <th>Date & Time</th>
                                <th>Assigned Mechanic</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customerData.bookings.map(b => (
                                <tr key={b.booking_id}>
                                  <td className="td-id">#{b.booking_id}</td>
                                  <td>
                                    <strong>{b.brand_name} {b.model}</strong>
                                    <br />
                                    <code className="reg-no">{b.registration_no}</code>
                                  </td>
                                  <td>{b.service_name}</td>
                                  <td>
                                    {String(b.booking_date).slice(0, 10)}
                                    <br />
                                    <small className="muted">{b.booking_time}</small>
                                  </td>
                                  <td>
                                    {b.mechanic_name ? (
                                      <div className="mechanic-info-cell">
                                        <span className="mechanic-name-tag">{b.mechanic_name}</span>
                                        <span className="mechanic-spec-tag">{b.mechanic_specialization}</span>
                                      </div>
                                    ) : (
                                      <span className="badge badge-yellow">Assigned soon</span>
                                    )}
                                  </td>
                                  <td><StatusBadge value={b.booking_status} /></td>
                                  <td><StatusBadge value={b.payment_status || "Unpaid"} /></td>
                                  <td className="td-price">₹{Number(b.booking_price).toLocaleString("en-IN")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Book a Service */}
                {activeTab === "new-booking" && (
                  <div className="cust-tab">
                    <div className="page-header">
                      <div>
                        <h1 className="page-title">Book a Service</h1>
                        <p className="page-sub">Choose one of your registered cars and select a service package.</p>
                      </div>
                      <button className="btn-refresh" onClick={() => setActiveTab("add-car")}>
                        + Add Another Car
                      </button>
                    </div>

                    <div className="form-card">
                      {customerData.cars.length === 0 ? (
                        <div className="empty-box">
                          <p>You need to register your car first before booking a service.</p>
                          <button 
                            className="btn-primary" 
                            style={{ marginTop: "14px" }}
                            onClick={() => setActiveTab("add-car")}
                          >
                            Register Car Now
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleCustomerBooking} className="form-grid">
                          <Field label="Select Your Car *">
                            <select 
                              name="car_id" 
                              required 
                              value={selectedCarForBooking || (customerData.cars[0]?.car_id ? String(customerData.cars[0].car_id) : "")}
                              onChange={(e) => setSelectedCarForBooking(e.target.value)}
                            >
                              {customerData.cars.map(c => (
                                <option key={c.car_id} value={c.car_id}>
                                  {c.brand_name} {c.model} ({c.registration_number})
                                </option>
                              ))}
                            </select>
                          </Field>

                          <Field label="Select Service Package *">
                            <select name="service_id" required defaultValue="">
                              <option value="">Choose service...</option>
                              {services.map(s => (
                                <option key={s.service_id} value={s.service_id}>
                                  {s.service_name} — ₹{s.base_price} ({s.estimated_duration || "1-2 Hours"})
                                </option>
                              ))}
                            </select>
                          </Field>

                          <Field label="Preferred Date *">
                            <input
                              name="booking_date"
                              type="date"
                              min={new Date().toLocaleDateString("en-CA")}
                              required
                            />
                          </Field>

                          <Field label="Preferred Time Slot *">
                            <input name="booking_time" type="time" required />
                          </Field>

                          <Field label="Current Odometer (km)">
                            <input name="odometer_km" type="number" min="0" placeholder="e.g. 35000" />
                          </Field>

                          <Field label="Special Requests / Notes">
                            <textarea name="customer_notes" rows="3" placeholder="Explain any problem you noticed..." />
                          </Field>

                          <div className="form-actions">
                            <button className="btn-primary" type="submit" disabled={submitting}>
                              {submitting ? "Booking..." : "Confirm My Service Booking"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

          <footer className="app-footer">
            Drive Care Customer Portal · Secure Customer Session
          </footer>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     COMPANY / STAFF PORTAL (RESTRICTED FOR INTERNAL PEOPLE)
     ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="layout">
      {/* Staff Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">{Icons.shield}</span>
          <div>
            <div className="brand-name">Drive Care</div>
            <div className="brand-sub">Company Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {STAFF_NAV.map(({ id, label, icon }) => {
            const unassignedCount = records.bookings ? records.bookings.filter(b => !b.mechanic_id).length : 0;
            return (
              <button
                key={id}
                className={`nav-item ${activeTab === id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {id === "assign-mechanic" && unassignedCount > 0 && (
                  <span className="badge badge-orange" style={{ fontSize: "0.72rem", padding: "2px 7px" }}>
                    {unassignedCount} new
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => setRole("choose")}>
            <span className="btn-icon">{Icons.logOut}</span>
            Switch Portal
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="main-wrap">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>
            <span /><span /><span />
          </button>
          <div className="topbar-title">
            <span className="admin-badge">Staff Only</span>{" "}
            {activeTab === "assign-mechanic" ? "Assign Mechanic for New Bookings" : STAFF_NAV.find(n => n.id === activeTab)?.label}
          </div>
          <button className="btn-refresh" onClick={loadStaffData}>
            <span className="btn-icon">{Icons.refresh}</span> Refresh All
          </button>
        </header>

        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.msg}
          </div>
        )}

        <main className="content">
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <p>Fetching company master records...</p>
            </div>
          ) : (
            <>
              {/* STAFF: DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="page-home">
                  <div className="page-header">
                    <div>
                      <h1 className="page-title">Executive Dashboard</h1>
                      <p className="page-sub">Centralized company operations, total customers and active work orders.</p>
                    </div>
                  </div>

                  <div className="stat-grid">
                    <div className="stat-card">
                      <div className="stat-icon stat-blue">{Icons.users}</div>
                      <div>
                        <div className="stat-num">{customers.length}</div>
                        <div className="stat-label">Total Customers</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon stat-indigo">{Icons.car}</div>
                      <div>
                        <div className="stat-num">{cars.length}</div>
                        <div className="stat-label">Registered Vehicles</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon stat-violet">{Icons.calendar}</div>
                      <div>
                        <div className="stat-num">{records.bookings.length}</div>
                        <div className="stat-label">Service Bookings</div>
                      </div>
                    </div>
                  </div>

                  <div className="home-card">
                    <h2 className="section-title">Latest Customer Service Requests</h2>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>#</th><th>Customer</th><th>Car</th><th>Service</th><th>Date</th><th>Mechanic</th><th>Status</th><th>Price</th><th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.bookings.slice(0, 7).map(b => (
                            <tr key={b.booking_id}>
                              <td className="td-id">#{b.booking_id}</td>
                              <td className="td-bold">{b.full_name}</td>
                              <td><code className="reg-no">{b.registration_no}</code></td>
                              <td>{b.service_name}</td>
                              <td>{String(b.booking_date).slice(0, 10)}</td>
                              <td>
                                {b.mechanic_name ? (
                                  <span className="mechanic-name-tag">{b.mechanic_name}</span>
                                ) : (
                                  <button
                                    className="badge badge-orange"
                                    style={{ border: "none", cursor: "pointer" }}
                                    onClick={() => setActiveTab("assign-mechanic")}
                                    title="Click to Assign Mechanic"
                                  >
                                    + Assign
                                  </button>
                                )}
                              </td>
                              <td><StatusBadge value={b.booking_status} /></td>
                              <td className="td-price">₹{Number(b.booking_price).toLocaleString("en-IN")}</td>
                              <td>
                                {b.booking_status === "Pending" ? (
                                  <div className="action-btn-group">
                                    <button 
                                      className="btn-action-done" 
                                      onClick={() => handleUpdateBookingStatus(b.booking_id, "Completed")}
                                      title="Mark Service as Completed"
                                    >
                                      ✓ Complete
                                    </button>
                                    <button 
                                      className="btn-action-cancel" 
                                      onClick={() => handleUpdateBookingStatus(b.booking_id, "Cancelled")}
                                      title="Cancel Booking"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <span className="td-done-text">✓ Closed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* STAFF: ASSIGN MECHANIC FOR NEW BOOKINGS */}
              {activeTab === "assign-mechanic" && (() => {
                const allBookings = records.bookings || [];
                const unassignedBookings = allBookings.filter(b => !b.mechanic_id);
                const assignedBookings = allBookings.filter(b => !!b.mechanic_id);

                let filteredBookings = allBookings;
                if (mechanicFilter === "unassigned") {
                  filteredBookings = unassignedBookings;
                } else if (mechanicFilter === "assigned") {
                  filteredBookings = assignedBookings;
                }

                if (mechanicSearch.trim()) {
                  const q = mechanicSearch.toLowerCase();
                  filteredBookings = filteredBookings.filter(b => 
                    String(b.booking_id).includes(q) ||
                    (b.full_name && b.full_name.toLowerCase().includes(q)) ||
                    (b.registration_no && b.registration_no.toLowerCase().includes(q)) ||
                    (b.service_name && b.service_name.toLowerCase().includes(q)) ||
                    (b.mechanic_name && b.mechanic_name.toLowerCase().includes(q)) ||
                    (b.model && b.model.toLowerCase().includes(q))
                  );
                }

                return (
                  <div className="mechanic-page">
                    <div className="page-header">
                      <div>
                        <h1 className="page-title">Assign Mechanic for New Bookings</h1>
                        <p className="page-sub">
                          Allocate qualified workshop mechanics to new and pending customer appointments.
                        </p>
                      </div>
                    </div>

                    {/* Summary KPI Cards */}
                    <div className="stat-grid" style={{ marginBottom: "24px" }}>
                      <div className="stat-card" onClick={() => setMechanicFilter("unassigned")} style={{ cursor: "pointer" }}>
                        <div className="stat-icon stat-orange">{Icons.wrench}</div>
                        <div>
                          <div className="stat-num">{unassignedBookings.length}</div>
                          <div className="stat-label">Needs Mechanic (New)</div>
                        </div>
                      </div>

                      <div className="stat-card" onClick={() => setMechanicFilter("assigned")} style={{ cursor: "pointer" }}>
                        <div className="stat-icon stat-blue">{Icons.calendar}</div>
                        <div>
                          <div className="stat-num">{assignedBookings.length}</div>
                          <div className="stat-label">Mechanics Assigned</div>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon stat-green">{Icons.users}</div>
                        <div>
                          <div className="stat-num">{mechanics.length}</div>
                          <div className="stat-label">Qualified Mechanics</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Direct Assignment Card */}
                    <div className="form-card" style={{ marginBottom: "28px" }}>
                      <div style={{ marginBottom: "16px" }}>
                        <h2 className="section-title" style={{ margin: 0, fontSize: "1.1rem" }}>
                          Quick Assign Workshop Mechanic
                        </h2>
                        <p className="page-sub" style={{ margin: "4px 0 0" }}>
                          Select any booking and assign an expert technician in one click.
                        </p>
                      </div>

                      <form onSubmit={handleAssignFormSubmit} className="form-grid">
                        <Field label="Select Booking *">
                          <select name="booking_id" required defaultValue="">
                            <option value="">Select a booking to assign...</option>
                            {unassignedBookings.length > 0 && (
                              <optgroup label="⚠️ New / Unassigned Bookings">
                                {unassignedBookings.map(b => (
                                  <option key={b.booking_id} value={b.booking_id}>
                                    #{b.booking_id} · {b.full_name} · {b.registration_no} ({b.service_name}) - {String(b.booking_date).slice(0, 10)}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {assignedBookings.length > 0 && (
                              <optgroup label="✓ Already Assigned (Reassign)">
                                {assignedBookings.slice(0, 30).map(b => (
                                  <option key={b.booking_id} value={b.booking_id}>
                                    #{b.booking_id} · {b.full_name} · {b.registration_no} [Curr: {b.mechanic_name}]
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </Field>

                        <Field label="Select Workshop Mechanic *">
                          <select name="mechanic_id" required defaultValue="">
                            <option value="">Select a mechanic...</option>
                            {mechanics.map(m => (
                              <option key={m.mechanic_id} value={m.mechanic_id}>
                                {m.name} — {m.specialization} ({m.experience_years} yrs exp, {m.shift})
                              </option>
                            ))}
                          </select>
                        </Field>

                        <div className="form-actions">
                          <button className="btn-primary" type="submit" disabled={submitting}>
                            {submitting ? "Assigning..." : "Assign Mechanic to Booking"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Interactive Table with Filter Tabs & Search */}
                    <div className="home-card">
                      <div className="filter-bar">
                        <div className="filter-tabs">
                          <button
                            className={`filter-pill ${mechanicFilter === "unassigned" ? "active" : ""}`}
                            onClick={() => setMechanicFilter("unassigned")}
                          >
                            Needs Mechanic
                            <span className="filter-pill-badge">{unassignedBookings.length}</span>
                          </button>
                          <button
                            className={`filter-pill ${mechanicFilter === "assigned" ? "active" : ""}`}
                            onClick={() => setMechanicFilter("assigned")}
                          >
                            Assigned Bookings
                            <span className="filter-pill-badge">{assignedBookings.length}</span>
                          </button>
                          <button
                            className={`filter-pill ${mechanicFilter === "all" ? "active" : ""}`}
                            onClick={() => setMechanicFilter("all")}
                          >
                            All Bookings
                            <span className="filter-pill-badge">{allBookings.length}</span>
                          </button>
                        </div>

                        <div className="search-box">
                          <input
                            type="text"
                            placeholder="Search by customer, car, or booking ID..."
                            value={mechanicSearch}
                            onChange={e => setMechanicSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      {filteredBookings.length === 0 ? (
                        <div className="empty-box" style={{ padding: "40px 20px" }}>
                          <p>
                            {mechanicFilter === "unassigned"
                              ? "🎉 All current bookings have mechanics assigned!"
                              : "No matching bookings found."}
                          </p>
                          {mechanicFilter === "unassigned" && (
                            <button 
                              className="btn-primary" 
                              style={{ marginTop: "12px" }}
                              onClick={() => setMechanicFilter("all")}
                            >
                              View All Bookings
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Booking #</th>
                                <th>Customer</th>
                                <th>Vehicle</th>
                                <th>Service</th>
                                <th>Scheduled Slot</th>
                                <th>Status</th>
                                <th>Current Mechanic</th>
                                <th>Assign / Change Mechanic</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBookings.map(b => {
                                const currentSelected = selectedMechanicMap[b.booking_id] ?? (b.mechanic_id ? String(b.mechanic_id) : "");
                                return (
                                  <tr key={b.booking_id}>
                                    <td className="td-id">#{b.booking_id}</td>
                                    <td>
                                      <span className="td-bold">{b.full_name}</span>
                                      {b.customer_phone && (
                                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                          {b.customer_phone}
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                      <strong>{b.brand_name} {b.model}</strong>
                                      <br />
                                      <code className="reg-no">{b.registration_no}</code>
                                    </td>
                                    <td>
                                      <div>{b.service_name}</div>
                                      <small className="muted">₹{Number(b.booking_price).toLocaleString("en-IN")}</small>
                                    </td>
                                    <td>
                                      {String(b.booking_date).slice(0, 10)}
                                      <br />
                                      <small className="muted">{b.booking_time}</small>
                                    </td>
                                    <td><StatusBadge value={b.booking_status} /></td>
                                    <td>
                                      {b.mechanic_name ? (
                                        <div className="mechanic-info-cell">
                                          <span className="mechanic-name-tag">{b.mechanic_name}</span>
                                          <span className="mechanic-spec-tag">{b.mechanic_specialization}</span>
                                        </div>
                                      ) : (
                                        <span className="badge badge-orange">⚠️ Needs Mechanic</span>
                                      )}
                                    </td>
                                    <td>
                                      <div className="mechanic-assign-inline">
                                        <select
                                          className="select-inline-mechanic"
                                          value={currentSelected}
                                          onChange={e => setSelectedMechanicMap(prev => ({
                                            ...prev,
                                            [b.booking_id]: e.target.value
                                          }))}
                                        >
                                          <option value="">Choose mechanic...</option>
                                          {mechanics.map(m => (
                                            <option key={m.mechanic_id} value={m.mechanic_id}>
                                              {m.name} ({m.specialization.split("&")[0].trim()})
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          className="btn-assign-sm"
                                          disabled={submitting || !currentSelected || currentSelected === String(b.mechanic_id)}
                                          onClick={() => handleAssignMechanic(b.booking_id, currentSelected)}
                                          title="Save Mechanic Assignment"
                                        >
                                          {b.mechanic_id ? "Update" : "Assign"}
                                        </button>
                                        {b.mechanic_id && (
                                          <button
                                            className="btn-unassign-sm"
                                            disabled={submitting}
                                            onClick={() => handleAssignMechanic(b.booking_id, null)}
                                            title="Unassign mechanic"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* STAFF: MASTER RECORDS */}
              {activeTab === "records" && (
                <div className="records-page">
                  <div className="page-header">
                    <div>
                      <h1 className="page-title">Company Master Database</h1>
                      <p className="page-sub">Restricted internal view across all customers and transactions.</p>
                    </div>
                  </div>

                  {/* Customers table */}
                  <div className="records-section">
                    <div className="records-section-header">
                      <span className="records-icon records-blue">{Icons.users}</span>
                      <h2 className="records-section-title">All Registered Customers</h2>
                      <span className="records-count">{records.customers.length}</span>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th></tr>
                        </thead>
                        <tbody>
                          {records.customers.map(c => (
                            <tr key={c.customer_id}>
                              <td className="td-id">#{c.customer_id}</td>
                              <td className="td-bold">{c.name}</td>
                              <td>{c.email}</td>
                              <td>{c.phone || "—"}</td>
                              <td>{c.city || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cars table */}
                  <div className="records-section">
                    <div className="records-section-header">
                      <span className="records-icon records-indigo">{Icons.car}</span>
                      <h2 className="records-section-title">All Customer Vehicles</h2>
                      <span className="records-count">{records.cars.length}</span>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Registration</th><th>Customer</th><th>Brand</th><th>Model</th><th>Year</th><th>Fuel</th></tr>
                        </thead>
                        <tbody>
                          {records.cars.map(c => (
                            <tr key={c.car_id}>
                              <td><code className="reg-no">{c.registration_no}</code></td>
                              <td className="td-bold">{c.full_name}</td>
                              <td>{c.brand_name}</td>
                              <td>{c.model}</td>
                              <td>{c.manufacturing_year}</td>
                              <td><span className="fuel-tag">{c.fuel_type}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bookings table */}
                  <div className="records-section">
                    <div className="records-section-header">
                      <span className="records-icon records-violet">{Icons.calendar}</span>
                      <h2 className="records-section-title">All Service Bookings</h2>
                      <span className="records-count">{records.bookings.length}</span>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>#</th><th>Customer</th><th>Registration</th><th>Service</th><th>Date</th><th>Mechanic</th><th>Status</th><th>Price</th><th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.bookings.map(b => (
                            <tr key={b.booking_id}>
                              <td className="td-id">#{b.booking_id}</td>
                              <td className="td-bold">{b.full_name}</td>
                              <td><code className="reg-no">{b.registration_no}</code></td>
                              <td>{b.service_name}</td>
                              <td>{String(b.booking_date).slice(0, 10)}</td>
                              <td>
                                {b.mechanic_name ? (
                                  <div className="mechanic-info-cell">
                                    <span className="mechanic-name-tag">{b.mechanic_name}</span>
                                    <span className="mechanic-spec-tag">{b.mechanic_specialization}</span>
                                  </div>
                                ) : (
                                  <button 
                                    className="badge badge-orange"
                                    style={{ border: "none", cursor: "pointer" }}
                                    onClick={() => setActiveTab("assign-mechanic")}
                                    title="Click to Assign Mechanic"
                                  >
                                    + Assign
                                  </button>
                                )}
                              </td>
                              <td><StatusBadge value={b.booking_status} /></td>
                              <td className="td-price">₹{Number(b.booking_price).toLocaleString("en-IN")}</td>
                              <td>
                                {b.booking_status === "Pending" ? (
                                  <div className="action-btn-group">
                                    <button 
                                      className="btn-action-done" 
                                      onClick={() => handleUpdateBookingStatus(b.booking_id, "Completed")}
                                      title="Mark Service as Completed"
                                    >
                                      ✓ Complete
                                    </button>
                                    <button 
                                      className="btn-action-cancel" 
                                      onClick={() => handleUpdateBookingStatus(b.booking_id, "Cancelled")}
                                      title="Cancel Booking"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <span className="td-done-text">✓ Closed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Workshop Mechanics Table */}
                  <div className="records-section">
                    <div className="records-section-header">
                      <span className="records-icon records-blue">{Icons.wrench}</span>
                      <h2 className="records-section-title">All Workshop Mechanics</h2>
                      <span className="records-count">{mechanics.length}</span>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th><th>Mechanic Name</th><th>Specialization</th><th>Contact Phone</th><th>Experience</th><th>Shift</th><th>Availability</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mechanics.map(m => (
                            <tr key={m.mechanic_id}>
                              <td className="td-id">#{m.mechanic_id}</td>
                              <td className="td-bold">{m.name}</td>
                              <td><span className="fuel-tag">{m.specialization}</span></td>
                              <td>{m.phone}</td>
                              <td>{m.experience_years} Years</td>
                              <td><span className="shift-tag">{m.shift}</span></td>
                              <td>
                                <span className={`badge ${m.is_available ? "badge-green" : "badge-gray"}`}>
                                  {m.is_available ? "Available" : "On Leave"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="app-footer">
          Drive Care Enterprise Operations · Internal Portal
        </footer>
      </div>
    </div>
  );
}
