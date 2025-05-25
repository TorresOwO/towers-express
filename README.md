# Towers Express Library

A library to simplify building APIs in Node.js with Express. It allows you to define functions as endpoints, authenticate users, check permissions, upload files, and serve over HTTP and HTTPS with quick setup.

---

## ✨ Features

- 📦 Dynamic function registration as endpoints.
- 🔐 Customizable authentication and permissions.
- 📁 File upload support with `multer`.
- 🔁 Supports both GET and POST with the same endpoint.
- 🌐 Easy setup for both HTTP and HTTPS servers.
- 🚀 Built-in CORS middleware.

---

## 📦 Installation

```bash
npm install towers-express
```

> Make sure you have `express` and `multer` as dependencies.

---

## 🚀 Basic Usage

### 1. Create the server

```ts
import { TowersExpress, TowersFunctionsController } from "towers-express";

const server = new TowersExpress("/api/functions", 3000);

// Optional: Configure SSL
server.configureSSL(3443, {
  keyPath: "./ssl/key.pem",
  certPath: "./ssl/cert.pem"
});

// Start the server
server.start({
  allowOrigin: "http://localhost:5173", // CORS
  onHttpStart: () => console.log("HTTP started"),
  onHttpsStart: () => console.log("HTTPS started")
});
```

---

### 2. Register functions

```ts
TowersFunctionsController.registerFunction("helloWorld", {
  method: async (req, res) => {
    res.json({ message: "Hello world!" });
  },
});
```

---

### 3. Call functions

- **GET**: `GET /api/functions/helloWorld?name=John`
- **POST**: `POST /api/functions/helloWorld` with JSON in the body.

---

## 🛡️ Authentication and Permissions

You can define functions to authenticate users and check permissions.

```ts
// Define how to authenticate users (e.g., with token)
TowersFunctionsController.setAuthUserFunction(async (req) => {
  const token = req.headers.authorization;
  if (token === "secret") return { id: 1, name: "Admin" };
  return null;
});

// Define how to check permissions
TowersFunctionsController.setCheckRightsFunction(async (user, rights, req) => {
  if (!user || !user.id) return "Unauthorized";
  if (!user.isAdmin && rights.includes("admin")) return "Insufficient permissions";
});
```

### Register a protected function

```ts
TowersFunctionsController.registerFunction("adminOnly", {
  method: async (req, res, user) => {
    res.send(`Hello, ${user.name}, you have admin access.`);
  },
  auth: true,
  rights: ["admin"]
});
```

---

## 📤 File Uploads

The library uses `multer` to handle file uploads:

```ts
TowersFunctionsController.registerFunction("uploadFile", {
  method: async (req, res) => {
    const file = req.file; // For single file
    res.send(`Received file: ${file.originalname}`);
  },
});
```

For multiple files:

```ts
TowersFunctionsController.registerFunction("uploadFiles", {
  method: async (req, res) => {
    const files = req.files;
    res.send(`Received ${files.length} files`);
  },
  maxFiles: 5
});
```

---

## 🔍 Available APIs

### TowersExpress

| Method | Description |
|--------|-------------|
| `start(options)` | Starts the HTTP and/or HTTPS server |
| `configureSSL(port, { keyPath, certPath })` | Configure HTTPS |
| `applyMiddleware(...middlewares)` | Add custom middleware |

### TowersFunctionsController

| Method | Description |
|--------|-------------|
| `registerFunction(name, config)` | Register a new API function |
| `getFunction(name)` | Retrieve a registered function |
| `callFunction(name, req, res)` | Call a function (used internally) |
| `setAuthUserFunction(func)` | Define how to authenticate users |
| `setCheckRightsFunction(func)` | Define how to check user permissions |

---

## 📄 Full Example

```ts
const server = new TowersExpress("/api", 3000);

TowersFunctionsController.setAuthUserFunction(async req => ({ id: 1, name: "user" }));

TowersFunctionsController.registerFunction("echo", {
  method: async (req, res) => {
    res.json({ youSent: req.body });
  },
});

server.start({});
```

---

## 📃 License

MIT License
