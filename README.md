# ThinkBack - AI-Powered Feedback Analyzer

A comprehensive feedback system designed for educational institutions. Lecturers can create feedback forms, and students provide feedback via unique links with AI-powered analytics.

## Tech Stack

- **Backend**: Django 4.2+ & Django REST Framework
- **Frontend**: React (Vite)
- **Database**: PostgreSQL
- **Auth**: JWT (SimpleJWT)
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker Desktop
- Python 3.8+
- Node.js & npm
- Git

## Quick Start (Recommended: Hybrid Setup)

Hybrid development runs database in Docker while backend/frontend run locally for fast development.

### Step 1: Initial Setup (One-time)

```bash
# Clone the repository
git clone <repo-url>
cd Think\ Back

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### Step 2: Daily Development (3 Terminals)

**Terminal 1: Start Database**
```bash
docker compose -f docker-compose.db-only.yml up
```

**Terminal 2: Start Backend**
```bash
cd backend
venv\Scripts\activate
python manage.py migrate      # First time only
python manage.py runserver 0.0.0.0:8001
```

**Terminal 3: Start Frontend**
```bash
cd frontend
npm run dev
```

Access the app at: `http://localhost:5174`

## Development Options

### Option 1: Hybrid (Recommended) 
Database in Docker, code runs locally. Best for development.
```bash
docker compose -f docker-compose.db-only.yml up
```

### Option 2: Full Docker
Everything containerized. Use for testing before push.
```bash
docker compose up --build
```

### Option 3: Full Local
Everything runs locally. Requires PostgreSQL installed.
```bash
# Install PostgreSQL locally, then create:
CREATE DATABASE thinkback_db;
CREATE USER admin WITH PASSWORD 'yourpassword123';
```

## API Documentation

### Authentication Roles
- **System Admin**: Full system access
- **University Admin**: Manages lecturers and institutional data
- **Lecturer**: Creates feedback forms and views analytics

### Auth Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register as Lecturer or Admin |
| `/api/auth/login/` | POST | Get JWT tokens |
| `/api/auth/logout/` | POST | Blacklist refresh token |
| `/api/auth/me/` | GET | Get current user (requires Bearer token) |

## Dependency Management

### Adding Backend Packages

```bash
cd backend
pip install package-name
pip freeze > requirements.txt
git add requirements.txt
git commit -m "deps: Add package-name"
```

Team members:
```bash
pip install -r requirements.txt
```

### Adding Frontend Packages

```bash
cd frontend
npm install package-name
git add package.json package-lock.json
git commit -m "deps: Add package-name"
```

Team members:
```bash
npm install
```

**Important**: Always commit `package.json`, `package-lock.json`, and `requirements.txt`. Never commit `node_modules/` or `venv/`.

## Contributing & Git Workflow

### Branch Strategy

1. **Update local branch**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit regularly**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Test in full Docker before push**
   ```bash
   docker compose up --build
   # Test your changes
   docker compose down
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Tests

Example: `git commit -m "feat: Add hero section component"`

## Team Development

### Port Assignments (Use for Hybrid/Local Setup)

| Developer | Backend | Frontend | DB Port |
|-----------|---------|----------|---------|
| Denish | 8000 | 5173 | 5432 |
| Piratheesh | 8001 | 5174 | 5433 |
| Santhosh | 8002 | 5175 | 5434 |
| Stefenish | 8003 | 5176 | 5435 |
| Sajith | 8004 | 5177 | 5436 |

### Update Your .env

Each developer customizes their `.env`:

```env
DB_NAME=thinkback_db
DB_USER=admin
DB_PASSWORD=yourpassword123
DB_HOST=localhost
DB_PORT=5432
DB_HOST_PORT=5433           # Your assigned port

BACKEND_PORT=8001           # Your assigned port
FRONTEND_PORT=5174          # Your assigned port
SECRET_KEY=your-secret-key
```

## Troubleshooting

**Backend can't connect to database?**
- Ensure `docker compose -f docker-compose.db-only.yml up` is running.
- In Hybrid mode (local Django), `DB_PORT` in `.env` must match `DB_HOST_PORT` (e.g., `5433`).
- In Full Dockerization, the backend uses internal Docker networking, so it ignores the host port mapping.

**Port already in use?**
- Update `BACKEND_PORT` and `FRONTEND_PORT` in your `.env`

**Need fresh database?**
```bash
docker compose -f docker-compose.db-only.yml down -v
docker compose -f docker-compose.db-only.yml up
```

**Migrations issues?**
```bash
python manage.py migrate
```

## License

This project is part of ThinkBack educational feedback system.
