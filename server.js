const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
require("dns").setDefaultResultOrder("ipv4first");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
    origin: "*"
}));

app.use(express.json({ limit: "10mb" }));

/* =========================
   DATABASE CONNECTION
========================= */

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing!");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "Backend running successfully 🚀"
    });
});

/* =========================
   GET ALL CLIENTS
========================= */

app.get("/clients", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT * FROM clients
            ORDER BY id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("GET CLIENTS ERROR:", error);
        res.status(500).json({
            error: "Failed to fetch clients",
            details: error.message
        });
    }
});

/* =========================
   CREATE CLIENT (FULL JSON SAFE)
========================= */

app.post("/clients", async (req, res) => {

    try {

        const {
            name,
            caseNumber,
            caseFlow,
            investigation,
            psir,
            probation,
            finalReport,
            termination
        } = req.body;

        if (!name || !caseNumber) {
            return res.status(400).json({
                error: "name and caseNumber are required"
            });
        }

        const result = await pool.query(`
            INSERT INTO clients (
                name,
                caseNumber,
                caseFlow,
                investigation,
                psir,
                probation,
                finalReport,
                termination
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
        `, [
            name,
            caseNumber,
            caseFlow ? JSON.stringify(caseFlow) : null,
            investigation ? JSON.stringify(investigation) : null,
            psir ? JSON.stringify(psir) : null,
            probation ? JSON.stringify(probation) : null,
            finalReport ? JSON.stringify(finalReport) : null,
            termination ? JSON.stringify(termination) : null
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("POST CLIENT ERROR:", error);

        res.status(500).json({
            error: "Failed to save client",
            details: error.message
        });
    }
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});