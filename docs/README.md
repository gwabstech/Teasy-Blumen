# Teasy - Blumen POS (local dev)

This workspace now includes a minimal Node/Express server to serve POS device data via a simple authenticated API. The goal is to avoid embedding raw device data in the client HTML so it isn't trivially visible in DevTools source code.

Quick start (Windows PowerShell):

```powershell
cd "c:\Users\hp\Desktop\blumen\teasy Pos"
npm install
npm start
```

- Open `http://localhost:3000/teasy devices.html` in your browser.
- Login using username `blumen` and password `123456` to view the full device list.
- Unauthenticated users may still search a single serial number (the API allows exact-serial lookups without auth).

Notes:
- This is a development server. For production, use secure storage, HTTPS, proper session handling, and remove plain credentials.
- Network responses are visible in DevTools -> Network. Keeping data off the client HTML prevents casual viewing of raw data in `View Source`, but determined users can still inspect network requests. For full protection, enforce server-side access controls and transport-level security.

## Deployment & Usage

This section describes ways to run the server in development and production, how to test the API, and options for packaging.

### Local (development)

1. Ensure Node.js (LTS) is installed.
2. From PowerShell in the project directory:

```powershell
cd "c:\Users\hp\Desktop\blumen\teasy Pos"
npm install
npm start
```

3. Open the site in your browser:

```
http://localhost:3000/teasy%20devices.html
```

### Environment variables

- `PORT` — optional. Defaults to `3000`. Example (PowerShell):

```powershell
$env:PORT = '4000'; npm start
```

### API endpoints

- `POST /api/login` — body: `{ "username": "blumen", "password": "123456" }` returns `{ token }` on success.
- `GET /api/devices?serial=<serial>` — exact-serial search (no auth required).
- `GET /api/devices` — returns full list; requires header `Authorization: Bearer <token>`.

### Quick API tests (PowerShell)

Login and save token:

```powershell
$res = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/login -Body (@{ username = 'blumen'; password = '123456' } | ConvertTo-Json) -ContentType 'application/json'
$token = $res.token
```

Search by serial (no auth required):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/devices?serial=P260300035084"
```

Get full list (use token from login):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/devices -Headers @{ Authorization = "Bearer $token" }
```

### Running in production

Basic recommendations for production deployment:

- Use a process manager such as `pm2` or systemd to run the Node process and restart on failures.
- Place a reverse proxy (Nginx, Apache, or an edge load balancer) in front to handle TLS (HTTPS) and static caching.
- Do not keep plaintext credentials in code. Use environment variables and hashed passwords stored securely.
- Add rate-limiting, logging, and monitoring.

Example using `pm2` (install globally):

```powershell
# install pm2 globally (requires npm available)
npm i -g pm2
npm start # or pm2 start server.js --name teasy-pos
```

### Docker (optional)

Create a `Dockerfile` in the project root (example):

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node","server.js"]
```

Build & run:

```powershell
# build
docker build -t teasy-pos .
# run
docker run -p 3000:3000 teasy-pos
```

### Packaging as a single executable (Windows)

You can produce a standalone executable using `pkg`:

```powershell
npm i -g pkg
pkg server.js --targets node18-win-x64 --output teasy-server.exe
```

Notes: the packaged binary bundles Node and your app; test the produced exe locally. `pkg` has limitations (native modules, dynamic requires) — test thoroughly.

### Security notes

- Serving data from an API removes raw data from the HTML source, but responses can still be inspected in DevTools → Network. For stronger protection:
	- Use HTTPS; require auth for all endpoints if appropriate.
	- Use JWTs with expirations or server sessions, store tokens securely.
	- Hash passwords with a secure algorithm (bcrypt, argon2) and store outside the repo.
	- Consider rate limits and IP whitelisting for sensitive endpoints.

### Next steps / testing

- Run the server locally (instructions above) and perform the PowerShell tests to verify login, search, and full-list behavior.
- If you want, I can: set up JWT with expiry, add hashed password storage, or create a Docker Compose file to run the service and expose it behind a simple reverse proxy.
