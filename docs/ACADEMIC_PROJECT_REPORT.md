# ACADEMIC PROJECT REPORT
## SMART AGRICULTURE AND CROP MONITORING DASHBOARD
**Project No. 60 | DevOps & Full Stack Development**  
**B.Tech IV Year I Semester | Academic Year 2026–2027**  
**Department of Computer Science and Engineering**  
**SR University, Warangal, Telangana**

---

### TABLE OF CONTENTS
1. Project Title
2. Abstract
3. Introduction
4. Problem Statement
5. Objectives
6. Scope
7. Existing System
8. Proposed System
9. Functional Requirements
10. Non-Functional Requirements
11. System Architecture
12. Technology Stack
13. Use Case Diagram
14. Database ER Diagram
15. Data Flow Diagram
16. Database Design
17. API Documentation
18. Frontend Implementation
19. Backend Implementation
20. Authentication and Authorization
21. Dashboard and Analytics
22. Report Generation
23. GitHub Repository
24. Docker Implementation
25. Kubernetes Deployment
26. CI/CD Implementation
27. Testing
28. Screenshots
29. Results
30. Limitations
31. Future Enhancements
32. Conclusion
33. References

---

### 1. PROJECT TITLE
**Smart Agriculture and Crop Monitoring Dashboard**  
Course: B.Tech IV Year I Semester — DevOps & Full Stack Development (Project No. 60)  
Institution: SR University, Warangal  

---

### 2. ABSTRACT
The agricultural domain in India faces critical bottlenecks due to fragmented field monitoring, empirical rather than data-driven irrigation practices, and absence of unified digital record-keeping across farm holdings. This project presents the design, architectural blueprint, and end-to-end implementation of the **Smart Agriculture and Crop Monitoring Dashboard**, a centralized full-stack cloud-native web platform. The system empowers farmers, agricultural officers, agronomists, and administrators to register cadastral farms, calibrate zoned agricultural plots, track phenological crop growth lifecycles, monitor root-zone soil chemistry (Moisture, Temperature, pH, NPK), schedule precision micro-irrigation runs, and aggregate farm activity expenditures. Built on a resilient stack comprising React.js, Tailwind CSS, Node.js, Express.js, and PostgreSQL, the platform incorporates automated business calculations for cultivation progress, harvest lead times, and yield variances. The infrastructure is fully containerized with Docker, deployed using declarative Kubernetes manifests, and automated via a GitHub Actions CI/CD pipeline, meeting rigorous academic and industrial software standards.

---

### 3. INTRODUCTION
Modern precision agriculture leverages digital platforms to bridge traditional agronomic practices with automated telemetry and computational decision-making. Agronomic efficiency depends heavily on timely interventions: balancing soil moisture within crop-specific allowable depletion limits, monitoring ambient temperature drift, preventing waterlogging, and optimizing fertilizer dosage. This individual academic project develops an enterprise-grade digital solution providing role-scoped access control, interactive visualization of environmental telemetry, and downloadable audit reports.

---

### 4. PROBLEM STATEMENT
Traditional farm management suffers from:
1. **Disparate Record-Keeping**: Field operations, labor expenses, and fertilizer applications are maintained manually on paper or unorganized spreadsheets, leading to data loss.
2. **Sub-optimal Water Resource Allocation**: Flood and sprinkler irrigation are scheduled empirically without quantitative telemetry regarding actual root-zone soil moisture.
3. **Delayed Agronomic Action**: Critical drops in soil moisture or pH deviations often go unnoticed until irreversible crop stress occurs.
4. **Lack of Standardized Audit Reporting**: Yield estimation, cost analysis, and regulatory agricultural auditing lack traceability and digital verification.

---

### 5. OBJECTIVES
1. Develop a responsive, role-based web portal supporting Admins, Farmers, Agri Officers, and Agronomists.
2. Enforce strict relational boundaries where plots cannot exceed parent farm holding areas.
3. Track crop phenological lifecycles with dynamic algorithms calculating progress percentage and days remaining until harvest.
4. Ingest and visualize real-time and simulated environmental telemetry (temperature, humidity, moisture, rainfall, wind speed).
5. Provide irrigation scheduling with water consumption tracking in liters.
6. Generate four mandatory university reports: Crop Monitoring, Farm Activities, Irrigation, and Yield Variance.
7. Package the full stack using multi-stage Docker containers, Kubernetes deployments, and automated CI/CD workflows.

---

### 6. SCOPE
- **In-Scope**: Web-based farm registration, plot subdivisions, crop cultivation, soil observations, simulated telemetry streams, irrigation schedules, activity logging, 4 audit reports with CSV/Print export, JWT auth, RBAC, Docker Compose, Kubernetes manifests, and Jest test suites.
- **Out-of-Scope (Future)**: Physical IoT embedded sensor manufacturing, satellite multi-spectral raster processing, and live SMS cellular gateway integration.

---

### 7. EXISTING SYSTEM
Existing systems are characterized by:
- Isolated mobile apps focusing only on commodity market pricing or static weather forecasts.
- Proprietary high-cost farm enterprise software unsuited for small-to-medium regional farms in Telangana.
- Lack of integrated role-based collaboration between farm owners, government agricultural extension officers, and academic agronomists.

---

### 8. PROPOSED SYSTEM
The proposed platform introduces:
- A centralized web platform featuring a Forest Green aesthetic adhering to accessibility guidelines.
- Dynamic mathematical engines for crop growth indexing and overdue harvest identification.
- Dual-mode database layer supporting standard PostgreSQL and embedded in-memory fallback for immediate zero-dependency evaluation.
- Full containerization with health checks, liveness/readiness probes, and resource constraints.

---

### 9. FUNCTIONAL REQUIREMENTS
1. **User Authentication**: Secure registration (defaulting to Farmer role), bcrypt password hashing, and JWT token issuance.
2. **Farm Management**: CRUD operations on farms with acreage units (Acres, Hectares, Guntas), soil types, and geographic coordinates.
3. **Plot Division**: Subdivision of farms with relational area validation.
4. **Crop Lifecycle**: Phenological stage tracking (`Planned`, `Planted`, `Growing`, `Flowering`, `Maturing`, `Ready for Harvest`, `Harvested`, `Failed`).
5. **Soil & Environmental Monitoring**: Telemetry tracking with configurable agronomic threshold alerts.
6. **Irrigation Management**: Schedule tracking across Drip, Sprinkler, Surface, and Manual methods.
7. **Farm Activities**: Activity logging with labor hours and cost aggregation.
8. **Mandatory Reporting**: 4 standardized reports supporting CSV export and print preview.
9. **User Administration**: Administrative management of roles and account activation states.

---

### 10. NON-FUNCTIONAL REQUIREMENTS
- **Security**: OWASP compliance, Helmet security headers, CORS origin restrictions, parameterized SQL queries preventing SQL injection, and rate limiting (300 req/15min API, 30 req/15min auth).
- **Performance**: API response times under 150ms for indexed relational queries; client bundle compiled under 250kB gzipped.
- **Reliability & Availability**: Kubernetes multi-replica deployments with automated self-healing and zero downtime rolling updates.
- **Portability**: Runs identically on local developer machines, Docker Compose, and Kubernetes clusters.

---

### 11. SYSTEM ARCHITECTURE
The system adopts a 3-tier decoupled architecture:
1. **Presentation Layer**: React 18 SPA built with Vite, Tailwind CSS, Lucide React, and Recharts.
2. **Application Layer**: Express.js REST API providing centralized error handling, JWT verification, and RBAC middleware.
3. **Persistence Layer**: PostgreSQL 16 with normalized relational schema, primary/foreign key constraints, and performance indexes.

*(Refer to `docs/SYSTEM_ARCHITECTURE.md` for complete architectural and data flow diagrams)*

---

### 12. TECHNOLOGY STACK
- **Frontend**: React 18, Vite 5, JavaScript (ES6+), Tailwind CSS 3, React Router DOM 6, Axios, Recharts 2, Lucide Icons.
- **Backend**: Node.js 20 LTS, Express.js 4, pg 8.12, bcryptjs 2.4, jsonwebtoken 9.0, helmet 7, cors, express-rate-limit, swagger-ui-express.
- **Database**: PostgreSQL 16 Relational Database Management System.
- **DevOps**: Git, Docker 26, Docker Compose v2, Kubernetes (k8s 1.28+), GitHub Actions CI/CD.
- **Testing**: Jest 29, Supertest 7.

---

### 13. USE CASE DIAGRAM
Details interactions for all four actors:
- **Farmer**: Registers own farms, configures plots, registers crops, logs daily soil observations, schedules irrigation, records field activities, exports reports.
- **Admin**: System-wide oversight, user management, activation toggling, global reporting.
- **Agriculture Officer**: Regional farm inspection, compliance monitoring, and reporting.
- **Agronomist**: Specialized soil testing, crop progress diagnosis, and fertilizer dosage advice.

---

### 14. DATABASE ER DIAGRAM
The schema comprises 9 tables:
`users`, `farms`, `plots`, `crops`, `soil_observations`, `environmental_readings`, `irrigation_records`, `farm_activities`, and `notifications`.

---

### 15. DATA FLOW DIAGRAM (DFD)
- **Level 0 (Context Level)**: Stakeholders exchange credentials, farm inputs, and telemetry requests; platform returns KPI analytics, alerts, and audit reports.
- **Level 1**: Segregates processes into Auth Management, Cadastral & Plot Validation, Crop Lifecycle Computing, Telemetry Ingestion, and Report Aggregation.

---

### 16. DATABASE DESIGN
Relational specifications include:
- Foreign Keys with `ON DELETE CASCADE` on child plots and crops when a farm is deleted.
- `CHECK (total_area > 0)` and `CHECK (area > 0)` ensuring physical validity.
- `CHECK (soil_moisture >= 0 AND soil_moisture <= 100)` ensuring valid percentage ranges.
- B-Tree indexes on `email`, `owner_id`, `farm_id`, `plot_id`, `crop_id`, and `scheduled_date`.

---

### 17. API DOCUMENTATION
Interactive OpenAPI Swagger 3.0 documentation is served at `/api/docs`.
Key endpoints:
- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- `GET/POST /api/farms`, `GET/PUT/DELETE /api/farms/:id`
- `GET/POST /api/plots`, `GET/PUT/DELETE /api/plots/:id`
- `GET/POST /api/crops`, `GET/PUT/DELETE /api/crops/:id`
- `GET/POST /api/monitoring/soil`, `GET /api/monitoring/environment`
- `POST /api/monitoring/environment/simulate`
- `GET/POST /api/irrigation`, `PUT /api/irrigation/:id`
- `GET/POST /api/activities`, `PUT /api/activities/:id`
- `GET /api/dashboard/summary`, `GET /api/dashboard/crop-distribution`
- `GET /api/reports/crop-monitoring`, `GET /api/reports/farm-activities`, `GET /api/reports/irrigation`, `GET /api/reports/yield`
- `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`

---

### 18. FRONTEND IMPLEMENTATION
- Modular component hierarchy with reusable UI elements (`StatCard`, `PageHeader`, `DataTable`, `Modal`, `ConfirmDialog`, `StatusBadge`).
- Reactive Context API maintaining JWT authentication state across browser refreshes.
- Print stylesheets (`@media print`) stripping navigation panels for crisp PDF generation.

---

### 19. BACKEND IMPLEMENTATION
- Layered Express structure isolating controllers, routes, validators, and database drivers.
- Dynamic calculation services calculating progress percentages and harvest day differences on retrieval without stale database polling.

---

### 20. AUTHENTICATION AND AUTHORIZATION
- Passwords hashed using bcrypt with 10 salt rounds.
- JWT signed with HMAC-SHA256 containing user ID, email, and role.
- RBAC middleware (`authorizeRoles`) strictly enforced at the API route layer.

---

### 21. DASHBOARD AND ANALYTICS
- 6 Summary Cards for instant operational metrics.
- 5 Recharts data visualizations:
  1. Pie Chart: Crop acreage distribution.
  2. Bar Chart: Monthly activities and expenditure in ₹.
  3. Line Chart: Soil moisture and temperature trends.
  4. Area Chart: Cumulative irrigation delivery in Liters.
  5. Progress Chart: Vegetative lifecycle percentages.

---

### 22. REPORT GENERATION
All four mandatory university reports:
1. **Crop-wise Monitoring Report**: Detailed phenological stage, soil moisture, and progress.
2. **Farm Activity Report**: Task breakdown, labor hours, and financial costs.
3. **Irrigation Report**: Delivery method, duration, and water quantity in Liters.
4. **Yield / Production Report**: Cultivated acreage, expected yield, actual yield, and net production difference.

---

### 23. GITHUB REPOSITORY
Repository structure:
```
sandeep/
├── backend/            # Express.js REST API & Database migrations
├── frontend/           # React + Tailwind CSS client application
├── k8s/                # 12 Production Kubernetes manifests
├── docs/               # Technical and Academic documentation
├── .github/workflows/  # CI/CD pipeline definition
├── docker-compose.yml  # Multi-container local orchestration
└── README.md           # Engineering documentation
```

---

### 24. DOCKER IMPLEMENTATION
- **Backend Dockerfile**: Multi-stage Node.js 20 Alpine image utilizing `dumb-init` and non-root execution (`appuser`).
- **Frontend Dockerfile**: Multi-stage build running Vite compile, served via Nginx Alpine on port 80.
- **Docker Compose**: Orchestrates `postgres`, `backend`, and `frontend` with automated health checks and persistent volume storage.

---

### 25. KUBERNETES DEPLOYMENT
Provides 12 dedicated manifests:
- Dedicated `smart-agri` Namespace.
- Secret and ConfigMaps for PostgreSQL and Backend.
- PersistentVolumeClaim (`postgres-pvc`) requesting 5Gi storage.
- Deployments with resource requests (`100m CPU`, `128Mi RAM`) and limits (`500m CPU`, `512Mi RAM`).
- Liveness and Readiness HTTP/command probes.
- NodePort service exposing frontend on port `30080`.

---

### 26. CI/CD IMPLEMENTATION
GitHub Actions workflow `.github/workflows/ci-cd.yml` automates:
1. Repository checkout.
2. Node.js 20 environment initialization with npm dependency caching.
3. Postgres test service startup.
4. Database initialization and migration verification (`npm run db:init`).
5. Backend Jest unit and integration test suite execution.
6. Frontend production compilation via Vite (`npm run build`).
7. Docker image build verification for both backend and frontend.

---

### 27. TESTING
- 4 Jest test suites comprising 18 automated unit and integration tests:
  - `auth.test.js`: Validates login, registration, role defaults, password hashing, and token verification.
  - `farm.test.js`: Validates farm CRUD, owner scoping, and plot area boundary enforcement.
  - `crop.test.js`: Validates crop registration, date logic, and dynamic growth calculations.
  - `reports.test.js`: Validates data completeness and numeric aggregations across all 4 reports.
- **Test Results**: 100% pass rate (18 of 18 passing).

---

### 28. SCREENSHOTS & UI VERIFICATION
The application includes 11 fully functional screens:
1. Login & Registration Screen with role quick-fill buttons.
2. Main Operations Dashboard with 6 KPI cards, 5 charts, and alert widgets.
3. Farm Holdings Management Screen & Farm Details Page.
4. Agricultural Plot Management Screen with capacity validation.
5. Crop Cultivation Management Screen & Crop Details Page.
6. Soil & Environmental Telemetry Monitoring with simulation trigger.
7. Irrigation Management Screen with status completion toggles.
8. Farm Activities & Labor Expense Tracking Screen.
9. Agricultural Reports & Analytics Screen with CSV and PDF export.
10. User Management Screen (Admin-only).
11. Profile & System Settings Screen.

---

### 29. RESULTS
The platform demonstrates that precision agricultural monitoring can be delivered efficiently via modern web standards. Real database testing proved that calculations for crop growth, overdue harvest detection, and area boundary constraints prevent real-world data corruption and support agronomic decision-making.

---

### 30. LIMITATIONS
- Telemetry readings operate in demonstration simulation mode without physical RS485/Modbus hardware nodes connected.
- Weather forecasts are simulated rather than connected to live India Meteorological Department (IMD) radar feeds.

---

### 31. FUTURE ENHANCEMENTS
- Integration of LoRaWAN telemetry base stations for 15km rural sensor range.
- Satellite NDVI (Normalized Difference Vegetation Index) spectral imagery analysis.
- Multi-lingual regional localization (Telugu and Hindi language support).
- Automated solenoid valve activation via MQTT IoT microcontrollers.

---

### 32. CONCLUSION
The **Smart Agriculture and Crop Monitoring Dashboard** satisfies all official requirements for Project No. 60 under the B.Tech IV Year I Semester evaluation rubric at SR University. The project synthesizes modern full-stack engineering, rigorous database architecture, cloud-native containerization, Kubernetes declarative orchestration, automated testing, and comprehensive documentation.

---

### 33. REFERENCES
1. Pressman, R. S., *Software Engineering: A Practitioner's Approach*, 9th Edition, McGraw-Hill, 2020.
2. Silberschatz, A., Korth, H. F., & Sudarshan, S., *Database System Concepts*, 7th Edition, McGraw-Hill, 2019.
3. React Documentation: Official React 18 Guides and Best Practices, https://react.dev.
4. PostgreSQL Global Development Group: PostgreSQL 16 Documentation, https://www.postgresql.org/docs/16/.
5. Kubernetes Authors: Production Kubernetes Documentation, https://kubernetes.io/docs/.
