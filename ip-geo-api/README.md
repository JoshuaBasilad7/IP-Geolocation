# ip-geo-api (Upgraded)

Node.js + Express API with JWT auth and LowDB persistence for the IP Geolocation challenge.

## Seeded user

- email: candidate@example.com
- password: Password123

## Endpoints

- POST /api/login { email, password } -> { token, user }
- GET /api/profile (auth) -> user info
- GET /api/geo/:ip? (auth) -> geo info (proxied to ipinfo.io)
- GET /api/history (auth) -> user search history
- POST /api/history (auth) { ip, data } -> add history entry
- DELETE /api/history (auth) { ids: [id1,id2] } -> delete entries

## Run

1. cd ip-geo-api
2. npm install
3. npm run dev (or npm start)
   npx nodemon --watch index.js --ignore node_modules --ignore .git --ignore .vscode --ignore db.json index.js

## Notes

- JWT secret: use env var JWT_SECRET to override default.
- db.json will be created in this folder and stores users & histories.
