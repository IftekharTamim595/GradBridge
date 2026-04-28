# GradBridge

GradBridge is a comprehensive platform designed to bridge the gap between students, alumni, and recruiters. It facilitates professional networking, career growth, and mentorship by providing a centralized space for students to showcase their skills, alumni to share their experiences, and recruiters to find top talent.

## Target Users
- **Students:** Can build rich profiles (projects, skills, certifications), get AI-powered resume feedback, find jobs, and request mentorship from alumni.
- **Alumni:** Can create professional profiles, set privacy preferences, mentor students, and share industry insights.
- **Recruiters:** Can discover verified talent, post job opportunities, and connect directly with candidates.

---

## Core Features

- **Comprehensive User Profiles:** Dedicated profiles for Students and Alumni, featuring projects, certifications, work experience, and profile completeness tracking.
- **Alumni Directory & Search:** "Explore Alumni" feature allowing students to search for alumni by name, company, and skills, with support for public/private profile visibility.
- **AI Resume Insights:** Students can upload their resumes to receive an AI-generated profile score, skill gap analysis, and tailored improvement suggestions.
- **Mentorship System:** Students can send mentorship requests to alumni, who can accept or decline them, fostering professional guidance.
- **Job Board & Recruitment:** Dedicated jobs portal where approved recruiters can post opportunities and students can apply.
- **Real-Time Messaging & Email:** Built-in chat system for direct communication and automated email notifications for important updates (e.g., mentorship requests, recruiter approvals).
- **Privacy Controls:** Alumni have granular control over their profile visibility and can choose what information is displayed publicly.

---

## Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (Modern, responsive UI)
- **Routing:** React Router DOM

### Backend
- **Framework:** Django & Django REST Framework (DRF)
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** SQLite (Development) / PostgreSQL (Production ready)
- **AI Integration:** OpenRouter API for LLM-powered resume analysis

---

## System Highlights

- **Smart Resume Scoring:** Leverages AI to provide actionable feedback on student resumes, ensuring they are industry-ready.
- **Secure Role-Based Access:** Distinct experiences and permissions for students, alumni, and recruiters, with an approval workflow for recruiter accounts.
- **Privacy-First Design:** Strict visibility controls ensure that user data is only shared based on explicit preferences.
- **Modern UI/UX:** A clean, professional, and intuitive interface with seamless navigation and responsive design.

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your database credentials, email configuration, and OpenRouter API key.
5. Apply migrations and run the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Set `VITE_API_BASE_URL` to your local Django server URL.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Usage

1. **Onboarding:** Users register and select their role (Student, Alumni, or Recruiter). Recruiters must wait for admin approval.
2. **Profile Completion:** Students and alumni fill out their professional details, skills, and upload resumes.
3. **Networking:** Students navigate to the "Explore Alumni" page to find mentors and send connection requests.
4. **Career Development:** Students use the AI Insights tool to analyze their resumes and apply for jobs posted by approved recruiters.

---

## Future Improvements

- **Alumni-Hosted Events:** Capability for alumni to host virtual events, webinars, or hackathons directly on the platform.
- **Advanced Matchmaking:** AI-driven recommendations connecting students with the most relevant alumni mentors or job postings.
- **Community Forums:** Discussion boards for topic-based professional conversations.
- **In-App Analytics:** Dashboards for recruiters to track job posting engagement and applicant statistics.
