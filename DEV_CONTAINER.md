# Travel Journal - Dev Container Setup

This project includes a complete dev container configuration that solves the React dependency conflicts and provides a seamless development experience.

## What's Fixed

✅ **React Dependency Conflicts Resolved**
- Replaced React Scripts with Vite for better dependency management
- Eliminated AJV version conflicts that prevented React from starting
- Cleaner, faster build process with modern tooling

✅ **Complete Dev Container Environment**
- Pre-configured VS Code dev container with all necessary extensions
- Node.js 18 LTS for optimal compatibility
- Port forwarding for both frontend (3000) and backend (5000)
- Automatic dependency installation

## Quick Start with Dev Container

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [VS Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PL2407LZCC/Copilot_kokeilu2_travelJournal.git
   cd Copilot_kokeilu2_travelJournal
   ```

2. **Open in VS Code:**
   ```bash
   code .
   ```

3. **Open in Dev Container:**
   - Press `F1` or `Ctrl+Shift+P`
   - Type "Dev Containers: Reopen in Container"
   - Press Enter

4. **Wait for setup to complete** (first time takes 2-3 minutes)

5. **Start development:**
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend (React):** http://localhost:3000
- **Backend (Express):** http://localhost:5000

## Alternative: Docker Compose

If you prefer Docker Compose:

```bash
cd .devcontainer
docker-compose up --build
```

## What's Included

### Development Tools
- **Vite** - Fast React development server (replaces React Scripts)
- **TypeScript** support
- **ESLint** and **Prettier** for code quality
- **Nodemon** for backend auto-reload

### VS Code Extensions
- TypeScript support
- Prettier formatting
- ESLint linting
- Auto rename tag
- JSON support

### Environment Variables
- `CHOKIDAR_USEPOLLING=true` - For file watching in containers
- `WATCHPACK_POLLING=true` - For webpack polling
- `GENERATE_SOURCEMAP=false` - Faster builds

## Architecture

```
┌─────────────────────────────────────────┐
│           Dev Container                 │
│  ┌─────────────────┐ ┌─────────────────┐│
│  │   Frontend      │ │    Backend      ││
│  │   (Vite/React)  │ │   (Express.js)  ││
│  │   Port 3000     │ │   Port 5000     ││
│  └─────────────────┘ └─────────────────┘│
│           Node.js 18 LTS                │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Port Conflicts
If you get "port already in use" errors:
```bash
# Kill processes using the ports
fuser -k 3000/tcp 5000/tcp
# Or restart the dev container
```

### Dependency Issues
The dev container automatically handles all dependency conflicts. If you encounter issues:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Vite vs React Scripts
This project now uses Vite instead of React Scripts for:
- ✅ Faster development server
- ✅ Better dependency resolution
- ✅ Modern tooling
- ✅ No AJV conflicts

## Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start only frontend (Vite)
npm run client:dev

# Start only backend (Express)
npm run server:dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Next Steps

1. The React dependency conflicts are now completely resolved
2. Full-stack development works seamlessly in the dev container
3. Both frontend and backend can be developed simultaneously
4. All VS Code extensions and settings are pre-configured

Ready to code! 🚀