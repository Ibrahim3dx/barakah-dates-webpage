
# Barakah Dates Webpage

This repository contains both the **frontend** (React, Vite, TypeScript) and the **backend API** (Laravel) for the Barakah Dates web application.

---

## Project Structure

- `frontend/` — React + Vite + TypeScript app
- `backend-api/` — Laravel REST API
- `public/` — Static assets for frontend
- `.env` — Frontend environment config

---

## Frontend Setup

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Getting Started
```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd barakah-dates-webpage/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Edit `.env` in the root directory:
```
VITE_BACKEND_URL=https://api.albarakadates.com
```

---

## Backend Setup (Laravel API)

See [`backend-api/DEPLOYMENT_GUIDE.md`](backend-api/DEPLOYMENT_GUIDE.md) for full deployment instructions (including cPanel).

### Local Development
```sh
cd backend-api
composer install
cp .env.example .env # or create your own .env
php artisan key:generate
php artisan migrate
php artisan serve
```

---

## Technologies Used

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Backend:**
- Laravel
- MySQL

---

## Deployment

### Frontend
- Deploy using Vercel, Netlify, or any static hosting provider
- Or use Lovable: [Lovable Project](https://lovable.dev/projects/ba7c1598-a438-458f-a49f-a02f40b8b822)

### Backend
- See [`backend-api/DEPLOYMENT_GUIDE.md`](backend-api/DEPLOYMENT_GUIDE.md)

