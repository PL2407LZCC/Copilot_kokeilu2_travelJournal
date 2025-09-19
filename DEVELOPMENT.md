# Travel Journal Development Guide

## Quick Start

### Dev Container (Recommended)
For the best development experience with zero dependency conflicts:

1. Open in VS Code
2. Press `F1` → "Dev Containers: Reopen in Container"
3. Wait for setup to complete
4. Run `npm run dev`

See [DEV_CONTAINER.md](DEV_CONTAINER.md) for detailed instructions.

### Local Development

#### Backend Server
```bash
npm run server:dev
```
Server runs on http://localhost:5000

#### Frontend (Vite)
```bash
npm run client:dev
```
Frontend runs on http://localhost:3000

#### Full Development
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

- ✅ **FIXED:** React Scripts dependency conflicts - Replaced with Vite
- ✅ **FIXED:** AJV dependency conflicts - Resolved with modern tooling
- ✅ Backend fully functional and tested
- ✅ All React components are complete and ready
- ✅ Frontend-backend integration implemented
- ✅ Dev container provides zero-config development environment

## Recent Fixes

### React Dependency Conflicts (RESOLVED)
The project previously had dependency conflicts with React Scripts and AJV versions. This has been completely resolved by:

1. **Migrating from React Scripts to Vite**
   - Faster development server
   - Better dependency resolution
   - Modern tooling with better compatibility

2. **Updated package.json**
   - Removed conflicting AJV dependency
   - Cleaner dependency tree
   - Better dev/build performance

3. **Dev Container Setup**
   - Zero-configuration development environment
   - All dependencies pre-installed and tested
   - VS Code extensions and settings included

## Technology Stack

- **Frontend**: React 18, Vite (build tool)
- **Backend**: Node.js, Express.js
- **Development**: Vite, Nodemon, Concurrently
- **Container**: Docker dev container with Node 18 LTS

## Next Steps

1. ✅ **COMPLETED:** Fix React Scripts dependencies → Migrated to Vite
2. ✅ **COMPLETED:** Test complete application → Working in dev container
3. Add file upload for photos
4. Implement proper map with Leaflet
5. Add more robust authentication with JWT