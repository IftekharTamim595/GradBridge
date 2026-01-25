# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (optional - create some skills)
python manage.py shell
# In shell:
# from profiles.models import Skill
# Skill.objects.create(name='Python', category='programming')
# Skill.objects.create(name='React', category='web')
# Skill.objects.create(name='Django', category='web')
# Skill.objects.create(name='PostgreSQL', category='database')
# exit()

# Run server
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## Database Setup

### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### Create Database

```sql
CREATE DATABASE gradbridge;
CREATE USER gradbridge_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gradbridge TO gradbridge_user;
\q
```

Update `.env` file:
```
DB_NAME=gradbridge
DB_USER=gradbridge_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## Testing the System

### 1. Create Test Users

1. Register as a Student:
   - Go to http://localhost:3000/register
   - Select "Student" role
   - Fill in details and register

2. Register as an Alumni:
   - Register with "Alumni" role
   - Fill in professional details

3. Create Admin User:
   - Use Django admin: http://localhost:8000/admin
   - Or use `python manage.py createsuperuser`

### 2. Test Student Features

1. Login as student
2. Complete profile (add education, skills, upload resume)
3. Add projects
4. Request mentorship from an alumni
5. Check profile strength meter

### 3. Test Alumni Features

1. Login as alumni
2. Complete alumni profile
3. Search for students
4. View student summaries
5. Accept/reject mentorship requests
6. Generate recommendation letters

### 4. Test Admin Features

1. Login as admin
2. View dashboard analytics
3. Check skill trends
4. View engagement metrics

## Common Issues

### Issue: Database Connection Error

**Solution:**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U gradbridge_user -d gradbridge`

### Issue: Migration Errors

**Solution:**
```bash
python manage.py makemigrations
python manage.py migrate --run-syncdb
```

### Issue: CORS Errors

**Solution:**
- Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`
- Ensure frontend URL is included

### Issue: JWT Token Errors

**Solution:**
- Clear browser localStorage
- Re-login to get new tokens
- Check `SECRET_KEY` in `.env`

### Issue: File Upload Errors

**Solution:**
- Ensure `media/` directory exists in backend
- Check file size limits in settings
- Verify file permissions

## Production Deployment

### Backend (Render/Railway)

1. Set environment variables:
   - `SECRET_KEY`
   - `DEBUG=False`
   - Database credentials
   - `ALLOWED_HOSTS`

2. Build command:
   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

3. Start command:
   ```bash
   gunicorn config.wsgi:application
   ```

### Frontend (Vercel/Netlify)

1. Build command:
   ```bash
   npm run build
   ```

2. Output directory: `dist`

3. Environment variables:
   - `VITE_API_URL` (backend URL)

### Database (Cloud)

- Use managed PostgreSQL (Render, Railway, or AWS RDS)
- Update `DB_HOST` in backend `.env`

## Additional Notes

- For production, use environment variables for all secrets
- Set up proper logging
- Configure email backend for notifications
- Use cloud storage (S3) for file uploads
- Enable HTTPS
- Set up monitoring and error tracking
