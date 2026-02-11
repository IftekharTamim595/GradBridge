# Migration Notes for New Features

## Backend Migrations Required

After adding the new fields to models, run:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## New Model Fields Added

### User Model (accounts/models.py)
- Added 'external' role option

### StudentProfile Model (profiles/models.py)
- `visibility` (CharField): 'public' or 'private', default='public'
- `city` (CharField): City name
- `country` (CharField): Country name
- `latitude` (DecimalField): Optional latitude coordinate
- `longitude` (DecimalField): Optional longitude coordinate
- `available_for_hire` (BooleanField): Default=False

### AlumniProfile Model (profiles/models.py)
- `city` (CharField): City name
- `country` (CharField): Country name
- `latitude` (DecimalField): Optional latitude coordinate
- `longitude` (DecimalField): Optional longitude coordinate

## New API Endpoints

### Student Profiles
- `GET /api/profiles/students/search/` - Search students with filters
- `GET /api/profiles/students/available_for_hire/` - Get students available for hire (with location filtering)

### Alumni Profiles
- `GET /api/profiles/alumni/search/` - Search alumni with filters

## Frontend Environment Variables

Add to `.env` or environment:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Google Maps Setup

1. Get API key from Google Cloud Console
2. Enable "Maps JavaScript API"
3. Add to frontend environment variables
4. Update Hire.jsx with your API key

## Testing Checklist

- [ ] Run migrations
- [ ] Test External User registration
- [ ] Test profile visibility (public/private)
- [ ] Test location fields
- [ ] Test available_for_hire toggle
- [ ] Test search endpoints
- [ ] Test Hire page with location
- [ ] Test AI Insights panel
- [ ] Test role-based navigation
- [ ] Test messaging entry points (UI only)

## Breaking Changes

None - all changes are additive and backward compatible.
