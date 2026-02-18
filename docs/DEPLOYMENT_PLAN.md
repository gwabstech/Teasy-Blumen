# Deployment Plan for Teasy POS API

This document outlines the steps to deploy the finalized Teasy POS API to the production server.

## 1. Pre-Deployment Checklist
- [ ] **Docker Hub Image**: Ensure the latest image is built and pushed (if using Docker Hub method).
- [ ] **Server Access**: Verify SSH access to `178.128.35.119`.
- [ ] **Environment Variables**: Confirm `API_KEY` is set correctly in `docker-compose.yml` (default: `GwabsTeasy123456`).
- [ ] **Data Backup**: Ensure `db.json` on the server is backed up if it contains critical data.

## 2. Deployment Steps (Remote Build Method)

### Step 1: Update Codebase on Server
**IMPORTANT:** Do not copy `db.json` if you want to keep existing production data.

From your local machine, run (excludes `db.json`):
```bash
scp -r Dockerfile docker-compose.yml package.json server.js docs "teasy devices.html" abubakar@178.128.35.119:~/teasy-pos/
```

### Step 2: Restart Service on Server
SSH into the server:
```bash
ssh abubakar@178.128.35.119
```

Run the following commands:
```bash
cd ~/teasy-pos
sudo docker-compose down
sudo docker-compose up -d --build
```

### Step 3: Verify Deployment
Run a health check:
```bash
curl http://localhost:3000/api/devices
```

## 3. Post-Deployment Verification
- **Swagger Docs**: Visit `http://178.128.35.119:3000/api-docs`
- **Test Endpoint**: Try `GET /api/pos/:serial` with the API Key using Postman or Curl.

## 4. Rollback Plan
If issues arise:
1. Revert changes in `server.js` or `docker-compose.yml` locally.
2. Re-upload files using `scp`.
3. Restart containers using `docker-compose up -d --build`.
