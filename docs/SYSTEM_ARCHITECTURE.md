# System Architecture & Technical Diagrams
## Smart Agriculture and Crop Monitoring Dashboard
**Project No. 60 | Department of Computer Science and Engineering | SR University**

---

## 1. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer ["Client Presentation Layer (Vite + React.js + Tailwind CSS)"]
        UI["Web Browser / Client UI (Port 80/5173)"]
        State["React Context & JWT State Management"]
        AxiosClient["Axios REST Interceptors"]
        Recharts["Recharts Visualization Engine"]
        UI --> State
        State --> AxiosClient
        UI --> Recharts
    end

    subgraph GatewayLayer ["Reverse Proxy & Ingress Gateway (Nginx)"]
        Nginx["Nginx Alpine Container (Port 80)"]
        StaticAssets["Static HTML/CSS/JS Assets"]
        ProxyPass["/api/ Reverse Proxy Route"]
        Nginx --> StaticAssets
        Nginx --> ProxyPass
    end

    subgraph ServiceLayer ["Application Backend Layer (Node.js & Express.js)"]
        ExpressApp["Express Application (Port 5000)"]
        SecurityMW["Helmet, CORS, RateLimiter Middleware"]
        AuthMW["JWT Auth & Role-Based Access Control (RBAC)"]
        Controllers["Module Controllers (Farms, Plots, Crops, Soil, Irrigation, Activities, Reports, Admin)"]
        CalcEngine["Agronomic Calculation & Simulation Service"]
        Swagger["OpenAPI Swagger UI (/api/docs)"]

        ExpressApp --> SecurityMW
        SecurityMW --> AuthMW
        AuthMW --> Controllers
        Controllers --> CalcEngine
        ExpressApp --> Swagger
    end

    subgraph DataLayer ["Data Persistence Layer (PostgreSQL)"]
        PG["PostgreSQL Database 16 (Port 5432)"]
        Tables["9 Normalized Relational Tables"]
        Indexes["Indexes, Foreign Keys & Constraints"]
        PVC["Kubernetes PersistentVolumeClaim (5Gi)"]
        PG --> Tables
        Tables --> Indexes
        PG --> PVC
    end

    AxiosClient --> Nginx
    ProxyPass --> ExpressApp
    Controllers --> PG
```

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ FARMS : "owns"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ SOIL_OBSERVATIONS : "records"
    USERS ||--o{ IRRIGATION_RECORDS : "schedules"
    USERS ||--o{ FARM_ACTIVITIES : "logs"

    FARMS ||--|{ PLOTS : "subdivided into"
    FARMS ||--o{ SOIL_OBSERVATIONS : "locates"
    FARMS ||--o{ ENVIRONMENTAL_READINGS : "measures"
    FARMS ||--o{ IRRIGATION_RECORDS : "irrigates"
    FARMS ||--o{ FARM_ACTIVITIES : "tracks"

    PLOTS ||--o{ CROPS : "cultivates"
    PLOTS ||--o{ SOIL_OBSERVATIONS : "samples"
    PLOTS ||--o{ ENVIRONMENTAL_READINGS : "telemetry"
    PLOTS ||--o{ IRRIGATION_RECORDS : "delivers water"
    PLOTS ||--o{ FARM_ACTIVITIES : "undergoes"

    CROPS ||--o{ SOIL_OBSERVATIONS : "monitored by"
    CROPS ||--o{ IRRIGATION_RECORDS : "watered by"
    CROPS ||--o{ FARM_ACTIVITIES : "treated by"

    USERS {
        int id PK
        string full_name
        string email UK
        string phone
        string password_hash
        string role
        boolean is_active
        timestamp created_at
    }

    FARMS {
        int id PK
        string name
        int owner_id FK
        string location
        string village
        string district
        string state
        decimal total_area
        string area_unit
        string soil_type
    }

    PLOTS {
        int id PK
        int farm_id FK
        string name
        decimal area
        string soil_type
        string irrigation_type
    }

    CROPS {
        int id PK
        int plot_id FK
        string crop_name
        string crop_category
        string variety
        date planting_date
        date expected_harvest_date
        date actual_harvest_date
        decimal cultivated_area
        decimal expected_yield
        decimal actual_yield
        string status
    }

    SOIL_OBSERVATIONS {
        int id PK
        int farm_id FK
        int plot_id FK
        int crop_id FK
        date observation_date
        decimal soil_moisture
        decimal soil_temperature
        decimal soil_ph
        decimal nitrogen
        decimal phosphorus
        decimal potassium
    }

    ENVIRONMENTAL_READINGS {
        int id PK
        int farm_id FK
        int plot_id FK
        decimal temperature
        decimal humidity
        decimal rainfall
        decimal wind_speed
        decimal soil_moisture
        string data_source
        timestamp recorded_at
    }

    IRRIGATION_RECORDS {
        int id PK
        int farm_id FK
        int plot_id FK
        int crop_id FK
        string irrigation_method
        date scheduled_date
        string start_time
        int duration_minutes
        decimal water_quantity_litres
        string status
    }

    FARM_ACTIVITIES {
        int id PK
        int farm_id FK
        int plot_id FK
        int crop_id FK
        string activity_type
        date activity_date
        decimal labour_hours
        decimal cost
        string status
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        string message
        string type
        boolean is_read
        timestamp created_at
    }
```

---

## 3. Use Case Diagram

```mermaid
graph LR
    Farmer((Farmer))
    Admin((Administrator))
    Officer((Agri Officer))
    Agronomist((Agronomist))

    subgraph SmartAgriPlatform ["Smart Agriculture & Crop Monitoring Platform"]
        UC1[Authenticate & Manage Profile]
        UC2[Register Farms & Configure Boundaries]
        UC3[Divide Farms into Agricultural Plots]
        UC4[Cultivate Crops & Track Phenological Stages]
        UC5[Record & Monitor Soil Chemistry]
        UC6[Schedule Micro-Irrigation Cycles]
        UC7[Log Farm Activities & Calculate Input Costs]
        UC8[View Interactive Visual Analytics & Trends]
        UC9[Trigger Environmental Telemetry Simulation]
        UC10[Generate & Export Mandatory Audit Reports]
        UC11[Manage User Accounts & RBAC Permissions]
    end

    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    Farmer --> UC6
    Farmer --> UC7
    Farmer --> UC8
    Farmer --> UC9
    Farmer --> UC10

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11

    Officer --> UC1
    Officer --> UC2
    Officer --> UC3
    Officer --> UC4
    Officer --> UC5
    Officer --> UC6
    Officer --> UC7
    Officer --> UC8
    Officer --> UC9
    Officer --> UC10

    Agronomist --> UC1
    Agronomist --> UC4
    Agronomist --> UC5
    Agronomist --> UC8
    Agronomist --> UC9
    Agronomist --> UC10
```

---

## 4. Data Flow Diagram (Level 1)

```mermaid
flowchart TD
    User([Stakeholder User]) -->|1. Credentials| AuthEngine[Auth & RBAC Handler]
    AuthEngine -->|2. Issue JWT| User
    
    User -->|3. Farm & Plot Form Data| PlotEngine[Cadastral & Area Validation]
    PlotEngine -->|Validate Plot Area <= Farm Total Area| DB[(PostgreSQL Database)]
    
    User -->|4. Crop Planting & Harvest Dates| CropEngine[Crop Lifecycle Manager]
    CropEngine -->|Compute Cultivation Duration & Progress %| DB
    
    Sensors[(Telemetry Nodes / Simulation)] -->|5. Diurnal Telemetry Stream| SensorEngine[Monitoring & Alert Ingestion]
    SensorEngine -->|Evaluate Threshold Alerts| DB
    SensorEngine -->|Notify Critical Drift| User
    
    User -->|6. Water Schedules & Activity Costs| FieldEngine[Irrigation & Labor Manager]
    FieldEngine -->|Accumulate Water Litres & Expenditure| DB
    
    DB -->|7. Multi-table Aggregations| ReportEngine[Reporting & Analytics Engine]
    ReportEngine -->|8. Formatted Data & Trends| VisualUI[Charts, KPI Widgets, Print/CSV Views]
    VisualUI --> User
```
