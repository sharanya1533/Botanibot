# 🌿 BotaniBot — Smart Plant Care Assistant

**Grow smarter. Care better. Stay greener.**

BotaniBot is a full-stack web application designed to simplify plant care through smart watering recommendations, weather-aware scheduling, and plant growth tracking.

The platform helps users manage their plants, understand their watering requirements, monitor weather conditions, and maintain healthier plants while avoiding unnecessary water usage.

🌐 **Live Application:** `https://botanibot-frontend.onrender.com`

⚙️ **Backend API:** https://botanibot.onrender.com

💚 **API Health Check:** https://botanibot.onrender.com/api/health

Video demo link:https://drive.google.com/file/d/1M4r4ecklrwy3ufUMDc3SCJ_Z1zSMzmS2/view?usp=sharing

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Project Vision](#-project-vision)
- [Key Features](#-key-features)
- [Target Users](#-target-users)
- [Technology Stack](#️-technology-stack)
- [System Architecture](#️-system-architecture)
- [Project Structure](#-project-structure)
- [Application Workflow](#-application-workflow)
- [API Overview](#-api-overview)
- [Database Design](#️-database-design)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Security](#-security)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🌱 About the Project

Plant care involves more than simply watering plants every day. Different plant species have different watering requirements, and environmental conditions can influence when watering is necessary.

BotaniBot brings essential plant care activities together in one convenient platform.

Users can manage their plants, explore plant care information, access watering guidance, consider weather conditions, and record plant growth over time.

The application combines a user-friendly interface with a backend API to provide a centralized plant care experience.

### Why BotaniBot?

- Makes everyday plant care more organized.
- Helps users understand plant-specific watering requirements.
- Considers weather information when planning outdoor watering.
- Provides a centralized place to manage plants.
- Encourages responsible water usage.
- Helps users maintain consistent plant care routines.

---

## 🎯 Problem Statement

Plant owners frequently struggle to determine how often their plants need watering.

Fixed watering schedules may not account for differences between plant species or changing weather conditions. Watering outdoor plants immediately before rainfall can also waste water.

BotaniBot addresses these challenges by combining plant management, watering guidance, and weather information to support more informed plant care decisions.

The goal is to make plant care more convenient, organized, and water-conscious.

---

## 💡 Project Vision

To develop an accessible plant care platform that helps people maintain healthier plants through practical recommendations, convenient management tools, and weather-aware watering decisions.

BotaniBot aims to make plant care easier for beginners and experienced plant enthusiasts alike.

---

## ✨ Key Features

### 🔐 1. User Authentication

- User registration and login.
- Password hashing for improved security.
- Token-based authentication using JSON Web Tokens (JWT).
- Authenticated API requests.

### 🌿 2. Plant Species Catalog

- Explore available plant species.
- Access relevant plant care information.
- Use species information to support watering decisions.

### 🪴 3. Plant Management

- Manage plants through a centralized interface.
- Associate plants with relevant species information.
- Organize plant care activities.

### 💧 4. Smart Watering Recommendations

- Provide watering guidance based on plant requirements.
- Help users organize their watering routines.
- Support more informed watering decisions.

### 🌦️ 5. Weather-Aware Watering

- Integrate weather information using the OpenWeather API.
- Consider forecast rainfall when planning outdoor watering.
- Support decisions that can help avoid unnecessary watering.

### 📊 6. Dashboard

- Access important plant care information in one place.
- View relevant plant management information.
- Navigate between the application's main features.

### 📔 7. Plant Growth Journal

- Record observations about plants.
- Maintain a history of plant development.
- Support consistent plant monitoring.

### ⚙️ 8. Automated Weather Updates

- Run scheduled background tasks for weather-related operations.
- Refresh relevant information periodically.
- Support weather-aware plant care workflows.

*Feature descriptions reflect the intended application functionality. Specific behavior depends on the current implementation.*

---

## 👥 Target Users

BotaniBot is designed for:

- **Home gardeners** who manage plants at home.
- **Beginners** who need help establishing watering routines.
- **Indoor plant owners** who want to organize plant care.
- **Outdoor gardeners** who want to account for weather conditions.
- **Plant enthusiasts** who want to document plant growth.
- **Busy individuals** who prefer a centralized plant management solution.

---

## 🛠️ Technology Stack

BotaniBot uses the MERN ecosystem and supporting technologies to implement its frontend, backend, authentication, and data management.

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| Vite | Frontend development and production builds |
| Tailwind CSS | Styling the interface |
| React Router | Client-side navigation |
| Axios | Communication with the backend API |
| Node.js | Backend JavaScript runtime |
| Express.js | REST API and request handling |
| MongoDB | Database, when configured for persistent storage |
| Mongoose | MongoDB object modeling |
| JWT | Token-based authentication |
| bcrypt | Password hashing |
| Zod | Input validation |
| node-cron | Scheduled background tasks |
| OpenWeather API | Weather information |
| Render | Frontend and backend deployment |

---

## 🏗️ System Architecture

BotaniBot follows a client-server architecture, separating the frontend from the backend.

```text
                    ┌───────────────────────┐
                    │         User          │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    React Frontend     │
                    │     Vite + CSS        │
                    └───────────┬───────────┘
                                │
                         HTTP / REST API
                                │
                                ▼
                    ┌───────────────────────┐
                    │    Express Backend    │
                    │       Node.js         │
                    └───────────┬───────────┘
                                │
               ┌────────────────┼────────────────┐
               │                │                │
               ▼                ▼                ▼
      ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
      │ Authentication │ │ Plant Care   │ │ Weather      │
      │ & Validation   │ │ Operations   │ │ Integration  │
      └────────────────┘ └──────┬───────┘ └──────┬───────┘
                                │                │
                                ▼                ▼
                       ┌────────────────┐ ┌──────────────┐
                       │ Configured Data│ │ OpenWeather  │
                       │ Storage        │ │ API          │
                       └────────────────┘ └──────────────┘
```

### Architecture Workflow

1. Users interact with the React frontend.
2. Axios sends requests to the Express backend.
3. The backend processes requests through its routing and middleware layers.
4. Authentication and validation are applied where required.
5. The backend accesses the configured data store.
6. Weather-related functionality obtains relevant information from the weather service.
7. The backend returns responses to the frontend.
8. The frontend displays the resulting information to users.

---

## 📂 Project Structure

The repository separates the frontend and backend applications.

```text
Botanibot/
└── greengrid/
    ├── backend/
    │   ├── config/
    │   │   ├── db.js
    │   │   └── env.js
    │   ├── controllers/
    │   ├── jobs/
    │   ├── middlewares/
    │   ├── models/
    │   ├── routes/
    │   │   └── api.routes.js
    │   ├── utils/
    │   │   └── seed.js
    │   ├── app.js
    │   ├── index.js
    │   ├── package.json
    │   ├── package-lock.json
    │   └── .env.example
    │
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   ├── package.json
    │   ├── package-lock.json
    │   └── vite.config.js
    │
    ├── .gitignore
    └── README.md
```

*The folder structure above is illustrative. Individual files may vary according to the current repository.*

---

## 🔄 Application Workflow

### User Authentication

1. The user registers or logs in.
2. The backend validates the request.
3. Password verification is performed using the configured authentication logic.
4. A JWT is issued after successful authentication.
5. The frontend attaches the token to subsequent authenticated API requests.

### Plant Management

1. The user opens the plant management interface.
2. The frontend requests the necessary information.
3. The backend processes the request.
4. The configured data store is accessed when required.
5. The frontend displays the resulting plant information.

### Weather-Aware Watering

1. Weather information is retrieved through the weather integration.
2. Relevant forecast conditions are evaluated.
3. The application uses the configured watering rules to support watering decisions.
4. Users can use the resulting information to plan plant care.

### Growth Tracking

1. The user records plant observations.
2. The application processes and stores the information when supported by the configured database.
3. The user can review available records to monitor plant development.

---

## 🔌 API Overview

The backend exposes its API under the `/api` prefix.

**Backend Base URL:**  
https://botanibot.onrender.com

### Health Check

| Property | Value |
|---|---|
| Endpoint | `/api/health` |
| Method | `GET` |
| Purpose | Check whether the backend is responding |

**Example request:**

```http
GET /api/health
```

**Expected response:**

```json
{
  "ok": true,
  "service": "greengrid-api"
}
```

The internal service identifier remains `greengrid-api` because the existing backend configuration has not been renamed.

### API Route Organization

The backend mounts its API routes through:

```js
app.use('/api', require('./routes/api.routes'));
```

This means the route definitions in `backend/routes/api.routes.js` are mounted under `/api`.

The exact endpoints and HTTP methods should be taken from the route definitions in that file.

---

## 🗄️ Database Design

BotaniBot uses Mongoose for data modeling and database interaction.

The backend supports a configurable database connection, including an in-memory database option for development or demonstration.

The application's data responsibilities include:

| Data Area | Purpose |
|---|---|
| Users | User account and authentication information |
| Plant Species | Plant species and related care information |
| Plants | Plant records managed through the application |
| Watering Activities | Information related to watering routines |
| Growth Journal | Records of plant observations and development |
| Dashboard Data | Information displayed in the dashboard |

The actual database schemas are defined in the backend's `models/` directory.

### Database Persistence

Persistent data storage depends on the database configuration used by the deployed backend.

If the application is running with an in-memory database, its data may be lost when the process restarts. A persistent MongoDB deployment should be configured when durable storage is required.

---

## 🚀 Getting Started

Follow these steps to run BotaniBot locally.

### Prerequisites

Install the following tools:

- Node.js
- npm
- Git
- MongoDB, if using a local MongoDB database
- An OpenWeather API key, if required by the weather integration

### 1. Clone the Repository

```bash
git clone https://github.com/sharanya1533/Botanibot.git
```

Navigate to the project directory:

```bash
cd Botanibot/greengrid
```

If the repository's root directory already contains the `backend` and `frontend` folders, navigate directly to that root instead.

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a local `.env` file from the example configuration.

**Windows Command Prompt:**

```cmd
copy .env.example .env
```

**macOS or Linux:**

```bash
cp .env.example .env
```

Open the `.env` file and configure the required values using the variable names supported by `backend/config/env.js`.

### 3. Start the Backend

From the backend directory, run:

```bash
node index.js
```

The backend uses the configured port. The default development port is `5107` in the current setup.

Check the health endpoint:

http://localhost:5107/api/health

### 4. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5107/api
```

This configures the frontend to communicate with the local backend.

### 5. Start the Frontend

Run:

```bash
npm run dev
```

Open the development URL printed by Vite. The current development configuration uses port `5307`.

The frontend and backend should now be available locally.

---

## 🔑 Environment Variables

Environment variables allow the application to use different configurations in development and production.

### Backend Environment

Refer to `backend/.env.example` and `backend/config/env.js` for the exact variable names supported by the application.

Depending on the configuration, backend variables may include:

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS |
| `MONGODB_URI` | MongoDB connection string, if supported and configured |
| `JWT_SECRET` | Secret used for JWT signing |
| `OPENWEATHER_API_KEY` | Weather service API key |
| `USE_MEMORY_DB` | In-memory database configuration, if supported |

Use only variables recognized by the current backend implementation.

### Frontend Environment

| Variable | Local Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5107/api` | Backend API base URL |

For production, the frontend uses:

```env
VITE_API_URL=https://botanibot.onrender.com/api
```

**Important:** Variables prefixed with `VITE_` can be included in the browser bundle. Never place private credentials, database passwords, or JWT signing secrets in frontend environment variables.

---

## ☁️ Deployment

BotaniBot's frontend and backend are deployed separately on Render.

### Frontend

The React frontend is deployed as a Render Static Site.

Typical configuration:

| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| API Environment Variable | `VITE_API_URL` |
| Production API URL | `https://botanibot.onrender.com/api` |

The root directory depends on whether the GitHub repository root contains the `frontend` directory directly or contains it inside `greengrid`.

### Backend

The backend is deployed as a Render Web Service.

**Backend URL:** https://botanibot.onrender.com

**Health Check:** https://botanibot.onrender.com/api/health

The backend's `CLIENT_ORIGIN` environment variable must match the deployed frontend's origin to allow browser requests under the current CORS configuration.

Private configuration values should be stored in Render's environment settings rather than committed to GitHub.

---

## 🔒 Security

BotaniBot uses several security-related mechanisms:

- **Password hashing:** bcrypt supports secure password storage.
- **JWT authentication:** Tokens are used for authenticated requests.
- **Input validation:** Zod validates applicable incoming data.
- **CORS configuration:** The backend restricts browser origins according to its configuration.
- **Request body limits:** Express JSON request bodies are limited to reduce oversized requests.
- **Environment variables:** Configuration values and private credentials are managed separately from source code.

Security settings should be reviewed before using the application with real users or sensitive information.

---

## 🔮 Future Enhancements

Potential future improvements include:

- 🤖 AI-assisted plant disease detection.
- 📷 Plant identification using images.
- 🔔 Customizable watering reminders.
- 📈 Visual plant growth analytics.
- 🌿 A larger plant species catalog.
- 📱 An enhanced mobile experience.
- 💧 Water usage tracking and conservation insights.
- 🌦️ More detailed location-aware weather recommendations.
- 👥 Plant collection sharing.
- 🧪 Expanded automated testing and API integration tests.

These are proposed enhancements and should not be considered implemented features unless they are present in the application.

---

## 📄 License

No license has been specified in this README.

If you plan to distribute BotaniBot as an open-source project, select an appropriate license and add a corresponding `LICENSE` file to the repository.

---

## 🌿 BotaniBot — Helping Every Plant Thrive

BotaniBot brings plant management, watering guidance, weather information, and growth tracking together to support more organized and water-conscious plant care.

**Grow smarter. Care better. Stay greener.** 💚
