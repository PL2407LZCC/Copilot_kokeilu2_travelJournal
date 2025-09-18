# Travel Journal App - Project Structure

This document describes the folder structure for the travel journal application.

## Overview

This project follows a modern full-stack web application structure with a React frontend and Node.js/Express backend.

## Directory Structure

### Frontend (Client-Side)
```
src/
├── components/          # Reusable React components (buttons, forms, cards, etc.)
├── pages/              # Page-level components (Home, TripDetails, Profile, etc.)
├── hooks/              # Custom React hooks for shared logic
├── utils/              # Utility functions and helpers
├── services/           # API services and data fetching logic
├── contexts/           # React contexts for global state management
├── types/              # TypeScript type definitions
└── assets/             # Static assets
    ├── images/         # Image files (photos, illustrations)
    ├── icons/          # Icon files (SVG, PNG icons)
    └── styles/         # CSS/SCSS stylesheets
```

### Backend (Server-Side)
```
server/
├── routes/             # Express.js route definitions
├── models/             # Database models and schemas
├── controllers/        # Route handlers and business logic
├── middleware/         # Express middleware (auth, validation, etc.)
└── config/             # Server configuration files
```

### Database
```
database/
├── migrations/         # Database schema migration scripts
└── seeds/             # Database seed data for development/testing
```

### Testing
```
tests/
├── unit/              # Unit tests for individual components/functions
├── integration/       # Integration tests for API endpoints
└── e2e/               # End-to-end tests for user workflows
```

### Development & Deployment
```
scripts/               # Build scripts and development utilities
deployment/
├── docker/            # Docker configuration files
└── kubernetes/        # Kubernetes deployment configurations
.github/
└── workflows/         # GitHub Actions CI/CD workflows
docs/                  # Project documentation
```

### Static Files
```
public/                # Static files served directly by the web server
```

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

## Technology Stack

- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express.js
- **Development**: Concurrently, Nodemon
- **Deployment**: Docker, Kubernetes (optional)
- **CI/CD**: GitHub Actions

This structure provides a solid foundation for building a scalable travel journal application.