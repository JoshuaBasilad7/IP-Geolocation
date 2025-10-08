# IP Geolocation Challenge - PRO (Upgraded)

This package contains two folders:

- ip-geo-api (Express backend with JWT & LowDB)
- ip-geo-web (React frontend with Tailwind CDN & Leaflet map)

## Quick start (local)

1. Start backend

   cd ip-geo-api

   npm install

   npm run dev

   # API runs on http://localhost:8000

2. Start frontend

   cd ip-geo-web

   npm install

   npm start

   # App runs on http://localhost:3000

## Default credentials

- email: candidate@example.com

- password: Password123

## Notes

- The backend persists data in ip-geo-api/db.json using lowdb.

- The frontend uses Tailwind via CDN for quick styling. For production, consider installing Tailwind locally.

- The Leaflet map requires `react-leaflet` and `leaflet` installed (included in package.json). If map icons don't appear, ensure CSS link to leaflet is present (public/index.html).

## JWT

- JWT secret default: 'change_this_secret'. To override, set env var JWT_SECRET before starting the server.

Good luck!
