Setup & Run
===========

1) Install Node.js 18+ and MySQL.

2) Create a copy of environment variables (optional; defaults provided):
   - Create a file named .env next to server.js with:
     DB_HOST=localhost
     DB_USER=root
     DB_PASS=
     DB_NAME=myapp
     PORT=4000
     JWT_SECRET=change_me_strong_secret
     JWT_EXPIRES_IN=1h

3) Open terminal in auth-app and run:
   npm install
   npm run dev

4) Open http://localhost:4000 in your browser.

Notes
-----
- The server auto-creates the database (myapp) and table (users) if missing.
- Passwords are hashed with bcrypt. JWT expires based on JWT_EXPIRES_IN.
- API:
  POST /api/register  {name,email,password}
  POST /api/login     {email,password} → {token}
  GET  /api/profile   Authorization: Bearer <token>


