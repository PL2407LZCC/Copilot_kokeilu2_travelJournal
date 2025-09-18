# Travel Journal Development Guide

## Quick Start

### Backend Server
```bash
npm run server:dev
```
Server runs on http://localhost:5000

### Full Development (when React is fixed)
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Journal
- `GET /api/journal` - Get all journal entries
- `POST /api/journal` - Create new journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry

### Countries
- `GET /api/countries` - Get all countries (cached from REST Countries API)
- `GET /api/countries/:code` - Get specific country details

## Demo Login
- Username: `demo`
- Password: `demo`

## Testing Backend

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo"}'
```

### Create Journal Entry
```bash
curl -X POST http://localhost:5000/api/journal \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"FIN","countryName":"Finland","entry":"Great trip!","visitStatus":"visited"}'
```

### Get Journal Entries
```bash
curl http://localhost:5000/api/journal
```

## Frontend Components

The React application includes:
- **App.js** - Main application component
- **Header.js** - Navigation and authentication
- **WorldMap.js** - Interactive country selection
- **CountryPanel.js** - Country details and journal entry
- **AuthModal.js** - Login/registration modal
- **AuthContext.js** - Authentication state management

## Known Issues

- React Scripts dependency conflicts prevent `npm run client:dev`
- Backend fully functional and tested
- All React components are complete and ready
- Frontend-backend integration implemented

## Next Steps

1. Fix React Scripts dependencies
2. Test complete application
3. Add file upload for photos
4. Implement proper map with Leaflet
5. Add more robust authentication with JWT