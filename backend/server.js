/**
 * File: backend/server.js
 * Basic Express server setup for the backend with database connection verification.
 */

// Load environment variables from .env file
require('dotenv').config({ path: '../.env' });

// Import necessary modules
const express = require('express');
const pool = require('./src/db');
const cors = require('cors');
const app = express();
const path = require('path');
const fs = require('fs');
const auth = require('./src/middleware/auth');

// Import route handlers
const studentRoutes = require('./src/routes/students');
const courseRoutes = require('./src/routes/courses');
const authRoutes = require('./src/routes/auth');

/**
 * Checks the connection to the PostgreSQL database and returns a status object.
 * This is a read-only check and does not run the setup script.
 */
async function checkDbConnection() {
    try {
        // Run a query to  verify connection
        const result = await pool.query('SELECT COUNT(*) FROM users;');
        return {
            status: 'OK',
            message: `Connected successfully. Database contains ${result.rows[0].count} users.`,
        };
    } catch (error) {
        // If connection or query fails
        return {
            status: 'ERROR',
            message: `Connection failed: ${error.message}. Try running 'npm run db:setup' to initialize the database.`,
        };
    }
}

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(auth);

// Enable CORS for all routes (to allow requests from frontend for development)
app.use(cors());

// Health checks
app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true, ts: new Date().toISOString() });
});
app.get("/api/ready", (_req, res) => {
    res.status(200).json({ ready: true });
});

// API routes (if more are added, just follow the format below)
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);

// Serve React app
function resolveFrontendDist() {
    const candidates = [
        process.env.FRONTEND_DIST,
        path.resolve(process.cwd(), "frontend_dist"),
        path.resolve(__dirname, "../frontend_dist"),
        path.resolve(__dirname, "../../frontend_dist"),
    ].filter(Boolean);

    for (const p of candidates) {
        try {
            if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
                return p;
            }
        } catch (_) {}
    }
    return null;
}

const distPath = resolveFrontendDist();
if (distPath) {
    app.use(express.static(distPath));

    // Any non-API route should return the SPA index.html
    app.get(/^(?!\/api\/).+/, (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });

    console.log(`[server] Serving frontend from: ${distPath}`);
} else {
    console.warn("[server] FRONTEND_DIST not set and no frontend_dist folder found - not serving frontend");
    // Simple root message
    app.get("/", (_req, res) => {
        res
            .status(200)
            .send("Backend server is running. Frontend not found.");
    });
}

// Handle 404 for unknown API routes
app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "Not found" });
    }
    return next();
})

app.use((err, _req, res, _next) => {
    console.error("[server] Error handler caught error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// Start server

// use port from environment or default to 3000
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
    console.log(`[server] Server is running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
function shutdown(sig) {
    console.log(`[server] Caught signal ${sig}. Shutting down gracefully...`);
    server.close(() => {
        console.log("[server] HTTP server closed.");
        process.exit(0);
    });
    // Force shutdown after 10 seconds
    setTimeout(() => process.exit(1), 10000).unref();
}
["SIGINT", "SIGTERM"].forEach((s) => process.on(s, () => shutdown(s)));

// For testing purposes
module.exports = app;