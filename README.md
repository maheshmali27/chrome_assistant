# Personal Assistant

Personal Assistant is a browser extension paired with a Node.js backend API for saving, organizing, and syncing bookmarks with a clean productivity-focused workflow.

## Overview

This repository contains two main parts:

- **Extension** — a React + Vite browser extension UI with popup screens, a floating action button, passcode lock, and bookmark management.
- **Backend** — an Express + TypeScript API with authentication, bookmark storage, folder support, history tracking, and SQLite persistence via Sequelize.

## Features

- Secure user authentication
- Passcode lock inside the extension
- Save bookmarks from the popup or page overlay
- Organize bookmarks into folders
- Favorite, reorder, update, and delete bookmarks
- Bookmark history tracking
- Auto-sync and manual sync support
- Floating button injected into web pages for quick actions

## Repository Structure

```text
.
├── backend/     # Express + TypeScript API
└── extension/   # Browser extension built with React + Vite
```

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- Sequelize
- SQLite
- JWT authentication

### Extension

- React
- TypeScript
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3

## Prerequisites

Make sure you have the following installed:

- **Node.js** 18+
- **npm** 10+
- A Chromium-based browser such as Chrome or Edge

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd PersonalAssistant/code
```

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
NODE_ENV=development
SERVER_IP=127.0.0.1
SERVER_PORT=3000
JWT_SECRET=replace_with_a_secure_secret
JWT_ISSUER=personal-assistant
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
DB_NAME=database.sqlite
```

Run database migrations and seed data:

```bash
npm run migrate
npm run seed
```

Start the backend in development mode:

```bash
npm run dev
```

The API will run at:

```text
http://127.0.0.1:3000/api/v1
```

## Extension Setup

Open a new terminal:

```bash
cd extension
npm install
npm run build
```

For active development with rebuilds on change:

```bash
npm run dev
```

## Load the Extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the generated build folder from the extension project

## Available Scripts

### Backend

```bash
npm run dev       # Start development server
npm run build     # Build backend
npm run start     # Start built server
npm run lint      # Lint source files
npm run lint:fix  # Fix lint issues
npm run migrate   # Run Sequelize migrations
npm run seed      # Seed initial data
```

### Extension

```bash
npm run build     # Production build
npm run dev       # Watch mode for extension development
npm run preview   # Preview Vite build
```

## API Areas

The backend exposes endpoints for:

- Authentication
- User profile
- Bookmarks
- Bookmark folders

Base path:

```text
/api/v1
```

## Notes

- The extension currently points to the local backend at `http://localhost:3000/api/v1`.
- Make sure the backend is running before testing extension features.
- If you change the backend host or port, update the extension API configuration accordingly.

## Future Improvements

- Cloud deployment support
- Multi-browser packaging
- Search and filtering enhancements
- Better analytics and productivity tools

## Contributing

Contributions, fixes, and improvements are welcome. Feel free to fork the project and open a pull request.
