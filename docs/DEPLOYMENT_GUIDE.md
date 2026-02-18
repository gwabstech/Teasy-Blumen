# Teasy POS Deployment Guide

This guide provides simple, step-by-step instructions for deploying your local Teasy POS server to the production server.

### 1. Prerequisite: Stop Local Server (If Running)
If you have `npm start` running locally, stop it using `Ctrl + C`.

---

### 2. Connect and Prepare Server (Local Machine)
First, make sure the project directory exists on the server. Run this in your terminal:

```bash
ssh abubakar@178.128.35.119
```
*Password: `8nJIu6GH8`*

Once logged in, run:
```bash
mkdir -p ~/teasy-pos
exit
```

---

### 3. Upload Files (THE CRITICAL STEP)
**Run this from your local project folder (where `package.json` is).**

#### Option A: Is this the VERY FIRST time? (Include Database)
Use this only if the server is empty. It uploads your local `db.json`.

```bash
scp -r Dockerfile docker-compose.yml package.json server.js db.json docs "teasy devices.html" abubakar@178.128.35.119:~/teasy-pos/
```
*Password: `8nJIu6GH8`*

#### Option B: Is this an UPDATE? (PROTECT Database)
Use this if the app is already live and has data. **It safeguards your production database.**

```bash
scp -r Dockerfile docker-compose.yml package.json server.js docs "teasy devices.html" abubakar@178.128.35.119:~/teasy-pos/
```
*Password: `8nJIu6GH8`*

---

### 4. Start the Application on Server
Log back into the server:

```bash
ssh abubakar@178.128.35.119
```
*Password: `8nJIu6GH8`*

On the server, run these commands to restart the app:

```bash
cd ~/teasy-pos

# Stop existing version (if any)
sudo docker-compose down

# Build and start new version
sudo docker-compose up -d --build
```

---

### 5. Verify & Done!
Check if it's working by running this command on the server:

```bash
curl http://localhost:3000/api/devices
```
You should see a JSON response.

**Public URLs:**
- **API Base:** `http://178.128.35.119:3000/`
- **Documentation:** `http://178.128.35.119:3000/api-docs`

**That's it! You are live.**
