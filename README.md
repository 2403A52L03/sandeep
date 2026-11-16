# 🌱 Smart Agriculture and Crop Monitoring Dashboard
### Project No. 60 | DevOps & Full Stack Development
**B.Tech IV Year I Semester | Academic Year 2026–2027**  
**Department of Computer Science & Engineering | SR University, Warangal**

[![CI/CD Pipeline](https://github.com/sru-devops/project-60-smart-agriculture/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/sru-devops/project-60-smart-agriculture)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-blue.svg)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326ce5.svg)](https://kubernetes.io/)

---

## 📌 Executive Summary
The **Smart Agriculture and Crop Monitoring Dashboard** is an enterprise-grade full-stack web application designed to digitalize agricultural management for farmers, agricultural extension officers, agronomists, and academic researchers. 

The platform provides end-to-end management of cadastral farms, plot divisions, crop phenological growth tracking, root-zone soil observations (Moisture, Temp, pH, NPK), simulated/IoT microclimate telemetry streams, precision irrigation schedules, and farm activity expenditures.

---

## 🚀 Key Features & Capabilities

- **11+ Production Screens**:
  1. **Authentication**: Login & registration with JWT, role restrictions, and evaluation quick-fill buttons.
  2. **Main Dashboard**: 6 KPI cards, 5 interactive Recharts visualizations (Pie, Bar, Line, Area, Progress), alert feeds, and quick telemetry simulation.
  3. **Farm Management**: CRUD operations with cadastral acreage, location, and dedicated Farm Details page.
  4. **Plot Management**: Subdivide farms with relational capacity boundary enforcement.
  5. **Crop Management**: Phenological stages (`Planned` through `Harvested`), dynamic cultivation progress %, and harvest countdowns.
  6. **Soil & Environmental Monitoring**: Track soil chemistry and diurnal microclimate readings with agronomic threshold alerts.
  7. **Irrigation Management**: Schedule water delivery, track water volume in liters, and monitor completion status.
  8. **Farm Activities**: Activity logging with labor hours and ₹ cost aggregation.
  9. **Mandatory Agricultural Reports**: Crop Monitoring, Farm Activity, Irrigation, and Yield Reports with CSV and Print (PDF) export.
  10. **User Management**: Administrative user provisioning, activation toggles, and role assignments.
  11. **Profile & Settings**: Security credentials update, alert thresholds, and preferences.

- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full platform oversight, user administration, and global audit reports.
  - **Farmer**: Manage registered farms, plots, crops, irrigation, activities, and observations.
  - **Agriculture Officer**: Regional farm inspection, compliance monitoring, and advisory.
  - **Agronomist**: Specialized soil testing, crop progress diagnosis, and fertilizer recommendations.

- **DevOps & Cloud-Native Architecture**:
  - Multi-stage Dockerfiles for backend and frontend.
  - Docker Compose multi-container local stack with health checks and volume persistence.
  - 12 Production Kubernetes manifests (Namespace, Secrets, ConfigMaps, PVC, Deployments, Services).
  - GitHub Actions CI/CD pipeline covering automated testing, linting, and container builds.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router DOM 6, Axios, Recharts 2, Lucide React |
| **Backend** | Node.js 20, Express.js 4, REST API Architecture, JWT, bcryptjs, Helmet, CORS, Rate Limiting |
| **Database** | PostgreSQL 16 (with `pg` driver, `schema.sql`, `seed.sql`, and embedded fallback support) |
| **Testing** | Jest 29, Supertest 7 |
| **DevOps** | Docker, Docker Compose, Kubernetes, GitHub Actions CI/CD |

---

## 🔑 Demonstration Role Accounts

All sample accounts are pre-seeded in the database with password `Password@123`:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Administrator** | `admin@smartagri.edu` | `Password@123` | Full administrative access, User management, Global reports |
| **Lead Farmer** | `farmer@smartagri.edu` | `Password@123` | Farm ownership, Crop cultivation, Irrigation, Activities |
| **Agri Officer** | `officer@smartagri.edu` | `Password@123` | Regional farm advisory, inspection, reporting |
| **Agronomist** | `agronomist@smartagri.edu` | `Password@123` | Soil observations, Crop diagnosis, Yield analytics |

*(Quick-fill buttons are provided on the Login screen for 1-click university demonstration)*

---

## 💻 Local Execution Instructions

### Prerequisites
- Node.js v18 or v20+
- npm v9+

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`.*  
*Health Check: `http://localhost:5000/api/health`*  
*Swagger API Docs: `http://localhost:5000/api/docs`*  
*(Note: If local PostgreSQL server is active, it connects immediately. If not running, the built-in Embedded PostgreSQL engine automatically initializes with all tables and realistic demo seed data).*

### 2. Start the Frontend Client Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🐳 Docker Execution Instructions

Ensure Docker and Docker Compose are installed.

### 1. Build and Start Full Containerized Stack
```bash
docker compose up --build
```
- **Frontend Web UI**: `http://localhost:80`
- **Backend REST API**: `http://localhost:5000`
- **PostgreSQL Database**: `localhost:5432`

### 2. Stop Containers
```bash
docker compose down
```

### 3. Stop Containers and Reset Persistent Data Volume
```bash
docker compose down -v
```

---

## ☸️ Kubernetes Deployment Instructions

Deploy the complete application to a local cluster (Minikube, Kind, or K3s):

### 1. Apply Kubernetes Manifests
```bash
kubectl apply -f k8s/
```

### 2. Verify Deployments, Pods, and Services
```bash
kubectl get pods -n smart-agri
kubectl get services -n smart-agri
kubectl get pvc -n smart-agri
```

### 3. Port-Forward Frontend Service for Local Access
```bash
kubectl port-forward -n smart-agri service/frontend-service 8080:80
```
*Access frontend in your browser at `http://localhost:8080`.*

---

## 🧪 Automated Testing

Run the automated test suite covering authentication, RBAC, farm capacity validation, crop lifecycle calculations, and report generation:

```bash
cd backend
npm test
```

### Test Suite Summary:
- `tests/auth.test.js`: User registration, login, JWT verification, role defaults, self-escalation prevention.
- `tests/farm.test.js`: Farm creation, role scoping, plot area constraint enforcement.
- `tests/crop.test.js`: Crop registration, harvest date logic, dynamic growth progress % calculations.
- `tests/reports.test.js`: Numeric aggregations and schema completeness for all 4 mandatory reports.

---

## 📋 GitHub Push Instructions

Initialize and publish the clean project repository to GitHub:

```bash
git init
git add .
git commit -m "feat: complete smart agriculture and crop monitoring dashboard (Project No. 60)"
git branch -M main
git remote add origin https://github.com/<your-username>/smart-agri-dashboard.git
git push -u origin main
```

---

## 📚 Technical Documentation Directory

- **Academic Project Report**: [`docs/ACADEMIC_PROJECT_REPORT.md`](file:///c:/Users/HARSHAVARDHAN/OneDrive/Desktop/sandeep/docs/ACADEMIC_PROJECT_REPORT.md) *(All 33 required academic sections)*
- **System Architecture & Diagrams**: [`docs/SYSTEM_ARCHITECTURE.md`](file:///c:/Users/HARSHAVARDHAN/OneDrive/Desktop/sandeep/docs/SYSTEM_ARCHITECTURE.md) *(Mermaid diagrams for Architecture, ER, Use Case, and DFD)*
- **Demonstration Walkthrough Script**: [`docs/DEMONSTRATION_SCRIPT.md`](file:///c:/Users/HARSHAVARDHAN/OneDrive/Desktop/sandeep/docs/DEMONSTRATION_SCRIPT.md) *(Step-by-step evaluator instructions)*

---

## 👨‍🎓 Project Credits & Academic Metadata
- **Project**: Smart Agriculture and Crop Monitoring Dashboard (Project No. 60)
- **Degree**: Bachelor of Technology (B.Tech)
- **Year & Semester**: IV Year I Semester
- **Academic Year**: 2026–2027
- **Course**: DevOps & Full Stack Development
- **Institution**: SR University, Warangal, Telangana

