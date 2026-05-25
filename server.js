const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
    res.send("Backend running successfully 🚀");
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
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   CREATE CLIENT (FULL DATA READY)
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
            caseFlow,
            investigation,
            psir,
            probation,
            finalReport,
            termination
        ]);

        res.json(result.rows[0]);

    } catch (error) {
        console.error("POST CLIENT ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});