# Teasy POS API Guide

This documentation provides details on all endpoints, authentication methods, and example requests/responses.

## Base URL

- **Local:** `http://localhost:3000`
- **Production:** `http://178.128.35.119:3000`

---

## Authentication

### 1. User Bearer Token (for `/api/devices`)
- **Header:** `Authorization: Bearer <token>`
- **Obtained via:** `/api/login`

### 2. API Key (for `/api/pos`)
- **Header:** `x-api-key: <your-api-key>`
- **Default Key:** `teasy-secret-key-123` (Change this in production via ENV `API_KEY`)

---

## Endpoints

### 1. Login (User Authentication)
Authenticates a user and returns a Bearer token.

**Endpoint:** `POST /api/login`
**Auth:** None (Public)

#### Request Body:
```json
{
  "username": "blumen",
  "password": "YOUR_PASSWORD"
}
```

#### Success Response (200 OK):
```json
{
  "token": "a1b2c3d4e5f6g7h8"
}
```

#### Error Response (401 Unauthorized):
```json
{
  "message": "invalid credentials"
}
```

---

### 2. Get All Devices
Retrieves a list of all devices. Requires authentication.

**Endpoint:** `GET /api/devices`
**Auth:** Bearer Token

#### Request Header:
```http
Authorization: Bearer a1b2c3d4e5f6g7h8
```

#### Success Response (200 OK):
```json
[
  {
    "POS Serial": "P260300035084",
    "Passcode": "205202",
    "Agent First Name": "BLUMEN TECHNOLOGIES LTD",
    "Current Balance": "0"
  },
  ...
]
```

#### Error Response (401 Unauthorized):
```json
{
  "message": "invalid or expired token"
}
```

---

### 3. Search Device by Serial (Public)
Checks if a device exists by exact serial number match.

**Endpoint:** `GET /api/devices?serial=<POS_SERIAL>`
**Auth:** None (Public)

#### Example Request:
`GET /api/devices?serial=P260300035084`

#### Success Response (200 OK):
```json
[
  {
    "POS Serial": "P260300035084",
    "Passcode": "205202",
    "Agent First Name": "BLUMEN TECHNOLOGIES LTD",
    "Current Balance": "0"
  }
]
```
*(Returns an empty array `[]` if not found)*

---

### 4. Create POS Device (Secure)
Adds a new POS device to the system.

**Endpoint:** `POST /api/pos`
**Auth:** API Key

#### Request Header:
```http
x-api-key: teasy-secret-key-123
Content-Type: application/json
```

#### Request Body:
```json
{
  "serial": "NEW_POS_SERIAL_001",
  "passcode": "Secret123"
}
```

#### Success Response (200 OK):
```json
{
  "message": "Device added successfully",
  "device": {
    "POS Serial": "NEW_POS_SERIAL_001",
    "Passcode": "Secret123",
    "Agent First Name": "ADDED VIA API",
    "Current Balance": "0"
  }
}
```

#### Error Responses:
- **400 Bad Request:** Missing serial or passcode.
- **401 Unauthorized:** Invalid or missing API Key.
- **409 Conflict:** Device with this serial already exists.

---

### 5. Get POS Passcode (Secure)
Retrieves the passcode for a specific serial number.

**Endpoint:** `GET /api/pos/:serial`
**Auth:** API Key

#### Request Header:
```http
x-api-key: teasy-secret-key-123
```

#### Example Request:
`GET /api/pos/NEW_POS_SERIAL_001`

#### Success Response (200 OK):
```json
{
  "serial": "NEW_POS_SERIAL_001",
  "passcode": "Secret123"
}
```

#### Error Responses:
- **401 Unauthorized:** Invalid or missing API Key.
- **404 Not Found:** Device not found.
