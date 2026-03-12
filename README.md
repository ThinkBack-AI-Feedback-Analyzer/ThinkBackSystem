# ThinkBack - AI-Powered Feedback Analyzer

This project is a feedback system designed for educational institutions. Lecturers can create forms, and students can provide feedback via unique links.

##  Tech Stack

- **Backend**: Django 4.2+ & Django Rest Framework
- **Frontend**: React (Vite)
- **Database**: PostgreSQL
- **Auth**: JWT (SimpleJWT)
- **Containerization**: Docker & Docker Compose

##  Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 2. Environment Setup
Create a `.env` file in the root directory and add the following:

```env
DB_NAME=thinkback_db
DB_USER=admin
DB_PASSWORD=yourpassword123
SECRET_KEY=your-django-secret-key-here
```

### 3. Launch the Application
Run the following command to build and start the containers:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Django Admin**: [http://localhost:8000/admin](http://localhost:8000/admin)

### 4. Database Migrations
While the containers are running, apply the initial database schema:

```bash
docker compose exec backend python manage.py makemigrations users
docker compose exec backend python manage.py migrate
```


### 5. Create a Superuser(only for database access)
To access the Django Admin panel, create an administrative account:

```bash
docker compose exec backend python manage.py createsuperuser
```

---

## 🔑 Authentication Roles

- **System Admin**: Full access to the system.
- **University Admin**: Manages lecturers and data for a specific institution.
- **Lecturer**: Creates feedback forms and views analytics.

## 📡 API Endpoints (Auth)

- `POST /api/auth/register/` - Register as a Lecturer or Admin.
- `POST /api/auth/login/` - Obtain JWT Access/Refresh tokens.
- `POST /api/auth/logout/` - Blacklist refresh token.
- `GET /api/auth/me/` - Get current user profile (Requires Bearer Token).







---

##  Git using Strategy

To keep the project organized, please follow this Git workflow:

### 1. Update your local develop branch
Always start by making sure your local `develop` branch is up to date:
```bash
git checkout develop
git pull origin develop
```

### 2. Create a feature branch
Create a new branch for your specific task (e.g., `feature/backend-auth` or `feature/frontend-ui`):
```bash
git checkout -b feature/your-feature-name
```

### 3. Commit your work
Stage and commit your changes with a descriptive message:
```bash
git add .
git commit -m "Feature: add registration logic to backend"
```

### 4. Create a Pull Request (PR)
When your feature is complete, push it to GitHub and create a PR:
- **Base branch**: `develop` (Merge INTO this)
- **Compare branch**: `feature/your-feature-name` (Your work)

---

