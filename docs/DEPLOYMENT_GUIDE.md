# Deployment Guide for Teasy POS API

This guide will walk you through deploying the Teasy POS API to your Linux server (`178.128.35.119`).

## Prerequisites

You need `ssh` and `scp` installed on your local machine (Windows PowerShell usually has these).

## Step 1: Connect to the Server

Open your terminal (PowerShell or Command Prompt) and connect to the server:

```bash
ssh abubakar@178.128.35.119
```

_Enter the password: `8nJIu6GH8` when prompted._

## Step 2: Install Docker (if not installed)

Run the following commands on the server to install Docker and Docker Compose:

```bash
# Update packages
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Install Docker Compose
sudo apt-get install -y docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional, avoids using sudo for docker commands)
sudo usermod -aG docker $USER
```

_(You might need to log out and log back in for the group change to take effect)._

## Step 3: Prepare the Directory

On the server, create a directory for the app:

```bash
mkdir -p ~/teasy-pos
exit
```

_(The `exit` command will take you back to your local machine)._

## Step 4: Upload Project Files

From your **local machine** (where the project files are), run this command to copy the files to the server:

```bash
scp -r Dockerfile docker-compose.yml package.json server.js db.json "teasy devices.html" abubakar@178.128.35.119:~/teasy-pos/
```

_Enter the password: `8nJIu6GH8` again._

## Step 5: Run the Application

Log back into the server:

```bash
ssh abubakar@178.128.35.119
```

Navigate to the directory and start the app:

```bash
cd ~/teasy-pos
sudo docker-compose up -d --build
```

The application is now running in the background!

## Step 6: Verify Deployment

You can test if it's working by running this check on the server:

```bash
curl http://localhost:3000/api/devices
```

To access it from the internet, you might need to allow port 3000 on the firewall:

```bash
sudo ufw allow 3000
```

Then access it via browser or Postman at: `http://178.128.35.119:3000/`

## API Usage

> **Security Note:** All requests to `/api/pos` endpoints now require an API Key.
>
> **Header:** `x-api-key: teasy-secret-key-123`
> *(You can change this key by setting the `API_KEY` environment variable in `docker-compose.yml`)*

### 1. Add a POS Device

**Endpoint:** `POST /api/pos`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: teasy-secret-key-123`

**Body:**

```json
{
  "serial": "NEW_SERIAL_123",
  "passcode": "SecretPass"
}
```

**Example cURL:**

```bash
curl -X POST http://178.128.35.119:3000/api/pos \
     -H "Content-Type: application/json" \
     -H "x-api-key: teasy-secret-key-123" \
     -d '{"serial": "NEW_SERIAL_123", "passcode": "SecretPass"}'
```

### 2. Get Passcode by Serial

**Endpoint:** `GET /api/pos/:serial`

**Headers:**
- `x-api-key: teasy-secret-key-123`

**Example:**
```bash
curl -H "x-api-key: teasy-secret-key-123" http://178.128.35.119:3000/api/pos/NEW_SERIAL_123
```
