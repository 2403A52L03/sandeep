# University Evaluation Demonstration Script
## Smart Agriculture and Crop Monitoring Dashboard
**Project No. 60 | DevOps & Full Stack Development | SR University**

This guide provides a step-by-step evaluation workflow for examiners and evaluators to review all 11+ application screens, backend APIs, business logic calculations, Docker orchestration, and Kubernetes manifests.

---

## 1. Quick Startup Guide

### Option A: Local Full Stack Execution (Recommended for Instant Evaluation)
1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```
   *The backend starts at `http://localhost:5000`. If local PostgreSQL is running, it connects automatically. If not, the built-in Embedded PostgreSQL engine auto-initializes with full schema and seed data for immediate evaluation.*
   
2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Open browser at `http://localhost:5173`.*

### Option B: Docker Compose Multi-Container Orchestration
```bash
docker compose up --build
```
*Access frontend at `http://localhost:80` and backend health at `http://localhost:5000/api/health`.*

---

## 2. Evaluation Demonstration Walkthrough

### Step 1: Authentication & Role-Based Access Control (Screen 1)
- Navigate to `http://localhost:5173/login`.
- Notice the **Role Accounts Quick-Fill** panel:
  - **Lead Farmer**: `farmer@smartagri.edu` (Password: `Password@123`)
  - **Administrator**: `admin@smartagri.edu` (Password: `Password@123`)
  - **Agri Officer**: `officer@smartagri.edu` (Password: `Password@123`)
  - **Agronomist**: `agronomist@smartagri.edu` (Password: `Password@123`)
- Click **👨‍🌾 Lead Farmer** -> Click **Sign In to Dashboard**.
- Verify successful authentication and redirection to `/`.

---

### Step 2: Main Dashboard & Real-Time Analytics (Screen 2)
- Observe the **6 Top Summary Cards**:
  1. Total Farms
  2. Agri Plots
  3. Active Crops
  4. Crops Near Harvest
  5. Irrigations & Total Water Applied (in Litres)
  6. Telemetry Alerts
- Examine the **5 Interactive Recharts Visualizations**:
  1. **Crop Area Distribution** (Pie Chart with color legends)
  2. **Monthly Farm Activities & Costs** (Bar Chart with dual Y-axes for counts and ₹ expenses)
  3. **Soil Moisture & Chemistry Trends** (Line Chart tracking Moisture % and Temp)
  4. **Irrigation Consumption Volume** (Gradient Area Chart displaying water consumption)
  5. **Crop Cultivation Lifecycle Progress** (Dynamic progress bars 0–100%)
- Check the **Widgets**:
  - Crops Approaching Harvest (overdue warning badges)
  - Recent Field Operations with expenditure tags
  - Active Sensor Alerts (threshold violations)
- Click the **⚡ Simulate Telemetry** button in the top navbar.
  - Notice the instant toast notification: *"Simulated IoT Reading Generated & Logged!"*
  - The notification bell increments, and the telemetry charts reflect the new reading.

---

### Step 3: Farm Holdings Management (Screen 3)
- Navigate to **Farms** from the sidebar (`/farms`).
- Click **Register New Farm**:
  - Name: `Green Meadows Precision Plot`
  - Total Area: `18.5` Acres
  - Soil Type: `Black Clay Loam`
  - Village: `Hasanparthy`
  - District: `Warangal Urban`
- Click **Register Farm**.
- Verify that the farm appears immediately in the table.
- Click on any farm name to open the **Farm Details Page** (`/farms/:id`).
  - View cadastral overview, plot allocations, cultivated crops, and activity logs.

---

### Step 4: Plot Sector Management & Capacity Enforcement (Screen 4)
- Navigate to **Plots** (`/plots`).
- Click **Add Plot**:
  - Farm: `Sri Lakshmi Organic Farm`
  - Plot Name: `Sector D - Drip Nursery`
  - Area: `100.0` Acres (Intentionally enter area exceeding available farm area)
- Click **Create Plot**.
- **Observe Business Logic Validation**: An error is returned stating that plot area exceeds unallocated farm area!
- Correct area to `1.5` Acres and click **Create Plot** -> Successfully saved!

---

### Step 5: Crop Lifecycle & Phenological Calculations (Screen 5)
- Navigate to **Crops** (`/crops`).
- Notice the automatically computed dynamic fields:
  - **Growth Progress %**: Formula `(Elapsed Days / Total Duration) × 100`, bounded strictly between 0% and 100%.
  - **Harvest Target**: Displays remaining days or overdue status (e.g. *"22 days remaining"* or *"Overdue"*).
- Click **Register Crop**:
  - Plot: `Plot A - North Ridge`
  - Crop Name: `Biofortified Maize`
  - Category: `Cereals`
  - Variety: `Pioneer 3302`
  - Planting Date: Current date
  - Expected Harvest Date: 90 days from now
  - Cultivated Area: `2.0` Acres
- Save and observe the dynamic growth bar update.

---

### Step 6: Soil & Environmental Telemetry Monitoring (Screen 6)
- Navigate to **Soil Monitoring** (`/monitoring/soil`).
- Toggle between **Soil Observations** and **Sensor Streams**.
- Click **Record Observation**:
  - Soil Moisture: `28.0%` (Sub-threshold moisture level)
  - Soil pH: `6.4`
  - Nitrogen / Phosphorus / Potassium: `210 / 40 / 175`
- Observe the alert trigger highlighting critically low moisture requiring irrigation.
- Review the **Telemetry Time-Series Trends** line chart.
- Note the prominent notice: *"Demo / Simulated Data Notice: Environmental telemetry is generated via calibrated diurnal simulation models and stored directly in PostgreSQL."*

---

### Step 7: Irrigation Scheduling & Water Tracking (Screen 7)
- Navigate to **Irrigation** (`/irrigation`).
- Observe the total water volume banner (`e.g. 24,500 Litres`).
- Click **Complete** on any scheduled irrigation record.
  - Notice the status badge dynamically transitions from `Scheduled` to `Completed`.
  - The water volume is immediately aggregated into total consumption.

---

### Step 8: Farm Activities & Expenditure (Screen 8)
- Navigate to **Farm Activities** (`/activities`).
- Filter by activity type (e.g. `Fertilization`, `Weeding`, `Harvesting`).
- Verify the total expenditure metric card dynamically calculates `Total Cost (INR ₹)` and `Total Labour Hours`.

---

### Step 9: Mandatory Agricultural Reports & Export (Screen 9)
- Navigate to **Reports** (`/reports`).
- Review the **4 Mandatory University Evaluation Reports**:
  1. **Report A: Crop-wise Monitoring Report** (Crop name, Farm, Plot, Planting date, Status, Moisture, Temp, Growth progress).
  2. **Report B: Farm Activity Report** (Farm name, Activity type, Date, Crop, Labour hours, Cost, Status).
  3. **Report C: Irrigation Report** (Farm, Plot, Crop, Method, Date, Water quantity, Duration, Status).
  4. **Report D: Yield & Production Report** (Farm, Plot, Crop, Cultivated area, Expected yield, Actual yield, Production difference with surplus/deficit tags).
- Test **Export CSV**: Click `Export CSV` -> downloads structured `.csv` file.
- Test **Print Report (PDF)**: Click `Print Report` -> launches print-preview with customized media CSS hiding navigation elements.

---

### Step 10: Role-Based Access Control & User Administration (Screen 10)
- Log out and log in as **Administrator** (`admin@smartagri.edu` / `Password@123`).
- Notice the **User Management** menu item in the sidebar (hidden from Farmers).
- Navigate to **User Management** (`/admin/users`).
- Test activating/deactivating a user and assigning roles (Admin, Farmer, Officer, Agronomist).

---

### Step 11: Verification of Automated Tests & Health Checks
- Open terminal and run:
  ```bash
  cd backend
  npm test
  ```
  *Result: 4 test suites pass, 18 unit/integration tests pass with 100% success rate.*
- Open Swagger API documentation:
  `http://localhost:5000/api/docs`
- Check Health Endpoint:
  `http://localhost:5000/api/health` -> Returns `HTTP 200 { "status": "ONLINE" }`.

