# GradBridge - Smart Alumni-Student Collaboration Platform

A production-ready platform connecting university students with alumni for mentorship, referrals, and career development. Built with Django REST Framework and React.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Limitations](#limitations)
- [Future Scope](#future-scope)

## Overview

GradBridge is a career-readiness platform that facilitates structured collaboration between students and alumni. The system enables:

- **Students** to build comprehensive profiles, showcase projects, and request mentorship/referrals
- **Alumni** to discover talented students, provide mentorship, and generate recommendation letters
- **Admins** to monitor platform engagement and skill trends

The platform uses AI/ML for resume parsing, skill extraction, project-role matching, and recommendation letter generation.

## Architecture

### Backend Architecture

```
backend/
├── config/              # Django project settings
├── accounts/            # User authentication & authorization
├── profiles/            # Student & Alumni profiles
├── projects/            # Student project management
├── mentorship/          # Mentorship & referral system
├── analytics/           # Analytics & reporting
└── ml_engine/           # ML/AI services
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts (Auth)
│   ├── pages/           # Page components
│   └── App.jsx          # Main app component
```

### Database Design

The system uses PostgreSQL with the following core entities:

- **User**: Authentication and role management
- **StudentProfile**: Student information, skills, resume
- **AlumniProfile**: Alumni professional information
- **Project**: Student project portfolio
- **Skill**: Tag-based skill system
- **MentorshipRequest**: Student-alumni mentorship connections
- **ReferralRequest**: Referral requests with recommendation letters
- **Message**: Chat messages between users

See [Database Schema](#database-schema) for detailed ER diagram.

## Technology Stack

### Backend
- **Python 3.10+**
- **Django 4.2.7**: Web framework
- **Django REST Framework 3.14.0**: REST API framework
- **PostgreSQL**: Relational database
- **SimpleJWT**: JWT authentication
- **spaCy**: NLP for resume parsing
- **scikit-learn**: ML algorithms (TF-IDF, cosine similarity)

### Frontend
- **React 18.2**: UI library
- **React Router 6.20**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS 3.3**: Styling
- **Recharts 2.10**: Data visualization

## Features

### Student Features
- Profile management with education, skills, and resume upload
- Project portfolio with tech stack and links
- Profile strength meter (calculated score)
- Skill gap suggestions
- Mentorship request system
- Referral request system
- Real-time chat with alumni

### Alumni Features
- Advanced student search (by skills, batch, projects)
- AI-generated student summaries
- Mentorship approval workflow
- Referral approval with AI-assisted recommendation letters
- Analytics dashboard (students mentored, referrals made, top skills)

### Admin Features
- User moderation
- Skill trend analytics
- Engagement metrics
- Platform usage statistics

### ML/AI Features
- **Resume Parsing**: Extract text and skills from PDF resumes
- **Resume Scoring**: Calculate relevance score for target roles
- **Project-Role Matching**: Match student projects to job roles using TF-IDF
- **Recommendation Letter Generation**: AI-assisted, editable recommendation letters
- **Student Summaries**: Concise summaries for alumni review

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- pip and npm

### Backend Setup

1. **Clone and navigate to backend:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. **Set up database:**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

6. **Run development server:**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## Database Schema

### Entity Relationship Diagram (Text Description)

```
User (1) ────< (1) StudentProfile
User (1) ────< (1) AlumniProfile

StudentProfile (1) ────< (N) Project
StudentProfile (N) ────< (N) Skill (Many-to-Many)
AlumniProfile (N) ────< (N) Skill (Many-to-Many)

StudentProfile (1) ────< (N) MentorshipRequest ────> (N) AlumniProfile
StudentProfile (1) ────< (N) ReferralRequest ────> (N) AlumniProfile

MentorshipRequest (1) ────< (N) Message
User (1) ────< (N) Message (as sender)
User (1) ────< (N) Message (as receiver)

StudentProfile (1) ────< (N) SkillGap ────> (1) Skill
```

### Key Relationships

- **User** has one **StudentProfile** OR one **AlumniProfile** (role-based)
- **StudentProfile** has many **Projects**
- **Skills** are shared between **StudentProfile** and **AlumniProfile** (many-to-many)
- **MentorshipRequest** connects one **StudentProfile** to one **AlumniProfile**
- **ReferralRequest** connects one **StudentProfile** to one **AlumniProfile** with recommendation letter
- **Message** belongs to a **MentorshipRequest** and has sender/receiver **Users**

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user details

### Profile Endpoints

- `GET /api/profiles/students/` - List student profiles
- `GET /api/profiles/students/{id}/` - Get student profile
- `PATCH /api/profiles/students/{id}/` - Update student profile
- `GET /api/profiles/alumni/` - List alumni profiles
- `GET /api/profiles/alumni/{id}/` - Get alumni profile
- `PATCH /api/profiles/alumni/{id}/` - Update alumni profile
- `GET /api/profiles/skills/` - List all skills

### Project Endpoints

- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project
- `PATCH /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project

### Mentorship Endpoints

- `GET /api/mentorship/mentorship-requests/` - List mentorship requests
- `POST /api/mentorship/mentorship-requests/` - Create mentorship request
- `POST /api/mentorship/mentorship-requests/{id}/accept/` - Accept request
- `POST /api/mentorship/mentorship-requests/{id}/reject/` - Reject request
- `GET /api/mentorship/referral-requests/` - List referral requests
- `POST /api/mentorship/referral-requests/` - Create referral request
- `POST /api/mentorship/referral-requests/{id}/accept/` - Accept and generate letter
- `GET /api/mentorship/messages/` - List messages

### Analytics Endpoints

- `GET /api/analytics/dashboard/` - Dashboard statistics (admin)
- `GET /api/analytics/skill-trends/` - Skill trend analytics (admin)
- `GET /api/analytics/engagement/` - Engagement metrics (admin)
- `GET /api/analytics/alumni/` - Alumni analytics

### ML Engine Endpoints

- `POST /api/ml/parse-resume/` - Parse resume and extract skills
- `POST /api/ml/student-summary/` - Generate student summary
- `POST /api/ml/match-projects/` - Match projects to role
- `POST /api/ml/resume-score/` - Calculate resume score

## Design Decisions

### Backend Design

1. **Modular Django Apps**: Each feature is a separate app for maintainability
2. **DRF ViewSets**: Used ViewSets for consistent CRUD operations
3. **JWT Authentication**: SimpleJWT for stateless authentication
4. **Role-Based Permissions**: Custom permission classes for Student/Alumni/Admin
5. **Django ORM Only**: No raw SQL for maintainability and portability
6. **File Upload Handling**: Pillow for image processing, PyPDF2 for PDF parsing

### Frontend Design

1. **Functional Components**: React hooks for state management
2. **Context API**: AuthContext for global authentication state
3. **Private Routes**: Role-based route protection
4. **Tailwind CSS**: Utility-first CSS for rapid development
5. **Axios Interceptors**: Centralized API error handling

### ML/AI Design

1. **Rule-Based NLP**: Keyword matching for skill extraction (explainable)
2. **TF-IDF Vectorization**: For project-role matching (transparent algorithm)
3. **Template-Based Generation**: Recommendation letters use templates with AI-assisted content
4. **No Black-Box Models**: All algorithms are explainable for academic defense

### Database Design

1. **Normalized Schema**: Proper foreign keys and indexing
2. **Many-to-Many Relationships**: Skills shared between students and alumni
3. **One-to-One Relationships**: User to Profile (role-based)
4. **Indexed Fields**: Frequently queried fields are indexed

## Limitations

1. **Resume Parsing**: Currently uses simple keyword matching; advanced NLP could improve accuracy
2. **Real-Time Chat**: Basic message system; WebSocket implementation needed for real-time updates
3. **File Storage**: Local file storage; cloud storage (S3) recommended for production
4. **ML Models**: Basic algorithms; could be enhanced with deep learning for better matching
5. **Email Notifications**: Not implemented; should be added for production
6. **Search Functionality**: Basic search; full-text search (PostgreSQL) could improve results

## Future Scope

### Short-Term Enhancements
- Email notification system
- File upload to cloud storage (AWS S3)
- Advanced search with filters
- Real-time chat with WebSockets
- Email verification for user accounts

### Medium-Term Enhancements
- Advanced ML models for better matching
- Integration with LinkedIn API
- Video call scheduling for mentorship
- Analytics dashboard for students
- Mobile app (React Native)

### Long-Term Enhancements
- Multi-university support
- Industry partnerships
- Advanced recommendation engine
- Career path prediction
- Integration with job boards

## Academic Framing

This project is designed as a **career-readiness system** that:

1. **Structures** the student-alumni ecosystem
2. **Measures** profile strength and engagement
3. **Facilitates** mentorship and referral workflows
4. **Provides** data-driven insights for career development

The system uses **explainable AI** techniques suitable for academic defense, focusing on transparency and interpretability rather than black-box models.

## License

This project is developed for academic purposes as a final year university project.

## Contact

For questions or issues, please refer to the project documentation or contact the development team.
