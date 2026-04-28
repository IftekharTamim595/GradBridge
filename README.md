# GradBridge

**Connecting Students and Alumni for Mentorship, Career Growth, and Collaboration**

GradBridge is a modern web platform that bridges the gap between university students and alumni, fostering meaningful connections for mentorship, job referrals, networking, and career development.

---

## 🚀 Features

### For Students
- **Profile Management**: Showcase skills, projects, certifications, and resume
- **Advanced Alumni Search**: Explore the alumni directory with dynamic filtering by name, company, and skills, respecting public/private profile visibility
- **Mentorship Tracking**: Send structured mentorship requests to alumni and track their status
- **Real-time Messaging & Email**: Direct communication with alumni and peers, accompanied by automated email notifications
- **AI Resume Insights**: Upload your resume to receive an AI-generated profile score, skill gap analysis, and tailored improvement suggestions powered by OpenRouter API
- **Job Board**: Access exclusive job postings from approved recruiters and apply directly

### For Alumni
- **Give Back**: Accept or decline mentorship requests, mentor students, and share career insights
- **Talent Discovery**: Find and recruit talented students for job opportunities
- **Professional Networking**: Connect with fellow alumni and students
- **Privacy Controls & Visibility**: Granular control over profile visibility, showcasing current role, expertise, and availability for mentorship only as desired

### For Recruiters (External Users)
- **Recruitment Hub**: Dedicated portal for approved recruiters to post job opportunities and manage applications
- **Student Search**: Discover talented students for hiring
- **Direct Messaging**: Connect with potential candidates
- **Approval Workflow**: Secure role-based access requiring admin approval for recruiter accounts

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.1.5
- **API**: Django REST Framework
- **Authentication**: SimpleJWT (JWT-based auth)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Real-time**: Django Channels (WebSocket support for chat)
- **AI Integration**: OpenRouter API for LLM-powered resume analysis
- **Email Service**: Automated email notifications
- **OAuth**: Google OAuth 2.0 via `dj-rest-auth` and `allauth`
- **Static Files**: WhiteNoise
- **Server**: Gunicorn (production)

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS (Modern, responsive UI)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API

---

## 📦 Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git
- PostgreSQL (optional, for production)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GradBridge/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Database (optional, defaults to SQLite)
   DATABASE_URL=postgresql://user:password@localhost:5432/gradbridge
   
   # Google OAuth
   GOOGLE_OAUTH_CLIENT_ID=your-client-id
   GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
   GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/google/callback
   
   # AI API
   OPENROUTER_API_KEY=your-openrouter-api-key
   
   # CORS
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

---

## 🏗️ Project Structure

```
GradBridge/
├── backend/
│   ├── accounts/          # User authentication & registration
│   ├── ai_insights/       # AI-powered resume analysis
│   ├── analytics/         # Analytics endpoints
│   ├── chat/              # Real-time messaging
│   ├── community/         # Community platform
│   ├── jobs/              # Job board and applications
│   ├── mentorship/        # Mentorship requests & tracking
│   ├── ml_engine/         # Machine learning services
│   ├── notifications/     # Notification system
│   ├── profiles/          # Student/Alumni profile management
│   ├── projects/          # Project portfolio management
│   ├── search/            # Advanced alumni search & filtering
│   ├── utils/             # Email services and helpers
│   ├── config/            # Django settings
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API client & utilities
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context (Auth, Modal, Chat)
│   │   ├── data/          # Static data (skills, etc.)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helper functions
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## 🔐 Authentication

GradBridge uses **JWT (JSON Web Tokens)** for secure authentication:

- **Email/Password Login**: Traditional authentication with JWT tokens
- **Google OAuth 2.0**: Social login integration for seamless onboarding
- **Token Storage**: Access tokens stored in `localStorage` with automatic refresh
- **Protected Routes**: Frontend routes protected via `PrivateRoute` component
- **API Security**: All protected endpoints require `Authorization: Bearer <token>` header

### Token Flow
1. User logs in (email/password or Google OAuth)
2. Backend returns JWT access & refresh tokens
3. Frontend stores tokens in `localStorage`
4. Axios interceptor attaches token to all API requests
5. Backend validates token on each protected endpoint
6. On 401 error, user is auto-logged out and redirected to login

---

## 🚀 Deployment

### Backend Deployment (Railway/Heroku/VPS)

1. **Set environment variables** (production)
2. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```
3. **Run migrations**
   ```bash
   python manage.py migrate
   ```
4. **Start with Gunicorn**
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build the app**
   ```bash
   npm run build
   ```
2. **Deploy `dist/` folder** to your hosting platform
3. **Set environment variables** in hosting dashboard

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 📝 API Documentation

Key API endpoints:

### Authentication
- `POST /api/auth/login/` - Email/password login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/google/` - Google OAuth login
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/logout/` - Logout

### Profiles & Search
- `GET /api/profiles/students/me/` - Get student profile
- `PATCH /api/profiles/students/me/` - Update student profile
- `GET /api/profiles/alumni/me/` - Get alumni profile
- `GET /api/search/alumni/` - Search and filter alumni

### Mentorship & AI
- `POST /api/mentorship/request/` - Send mentorship request
- `POST /api/ai_insights/resume/` - Upload and analyze resume

### Jobs
- `GET /api/jobs/` - List job postings
- `POST /api/jobs/` - Create a job posting (Recruiter only)

### Chat
- `GET /api/chat/conversations/` - List conversations
- `GET /api/chat/messages/<conversation_id>/` - Get messages
- WebSocket: `ws://localhost:8000/ws/chat/<conversation_id>/`

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/mark_all_read/` - Mark all as read

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Developed with ❤️ by the GradBridge Team

---

## 📧 Contact

For questions or support, please contact [tamimbhuiyan890@gmail.com]

---

## 🙏 Acknowledgments

- Thanks to all contributors and testers
- Built with Django, React, and modern web technologies
- Inspired by the need to connect students with alumni mentors
