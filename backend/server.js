const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const DB_FILE = process.env.DB_FILE || "./data/app.db";
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to SQLite database");
});

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Checklist table
      db.run(`
        CREATE TABLE IF NOT EXISTS checklist (
          id INTEGER PRIMARY KEY,
          checkItem TEXT,
          status TEXT,
          comment TEXT
        )
      `, (err) => {
        if (err) console.error("Error creating checklist table:", err);
      });

      // Flight info table
      db.run(`
        CREATE TABLE IF NOT EXISTS flight_info (
          id INTEGER PRIMARY KEY,
          flightNumber TEXT,
          flightDate TEXT,
          filedBy TEXT,
          filingTime TEXT,
          departureLocation TEXT,
          departureTime TEXT,
          arrivalLocation TEXT,
          arrivalTime TEXT
        )
      `, (err) => {
        if (err) console.error("Error creating flight_info table:", err);
      });

      // Seed checklist data if empty
      db.get("SELECT COUNT(*) as count FROM checklist", (err, row) => {
        if (err) {
          console.error("Error checking checklist:", err);
          return;
        }
        if (row && row.count === 0) {
          const checklistData = [
            { checkItem: "455454", status: "pending", comment: "" },
            { checkItem: "WDS", status: "done", comment: "ok" },
            { checkItem: "", status: "pending", comment: "" },
            { checkItem: "", status: "completed", comment: "" }
          ];
          checklistData.forEach((item) => {
            db.run(
              "INSERT INTO checklist (checkItem, status, comment) VALUES (?, ?, ?)",
              [item.checkItem, item.status, item.comment],
              (err) => {
                if (err) console.error("Error inserting checklist:", err);
              }
            );
          });
        }
      });

      // Seed flight info data if empty
      db.get("SELECT COUNT(*) as count FROM flight_info", (err, row) => {
        if (err) {
          console.error("Error checking flight_info:", err);
          return;
        }
        if (row && row.count === 0) {
          const flightData = [
            {
              flightNumber: "AA1234",
              flightDate: "2025-11-17",
              filedBy: "John Smith",
              filingTime: "08:30",
              departureLocation: "JFK",
              departureTime: "10:15",
              arrivalLocation: "LAX",
              arrivalTime: "13:45"
            },
            {
              flightNumber: "UA5678",
              flightDate: "2025-11-17",
              filedBy: "Sarah Johnson",
              filingTime: "07:45",
              departureLocation: "ORD",
              departureTime: "09:30",
              arrivalLocation: "SFO",
              arrivalTime: "11:50"
            },
            {
              flightNumber: "DL9012",
              flightDate: "2025-11-17",
              filedBy: "Mike Davis",
              filingTime: "09:00",
              departureLocation: "ATL",
              departureTime: "11:20",
              arrivalLocation: "MIA",
              arrivalTime: "13:15"
            }
          ];
          flightData.forEach((flight) => {
            db.run(
              `INSERT INTO flight_info (flightNumber, flightDate, filedBy, filingTime, departureLocation, departureTime, arrivalLocation, arrivalTime)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                flight.flightNumber,
                flight.flightDate,
                flight.filedBy,
                flight.filingTime,
                flight.departureLocation,
                flight.departureTime,
                flight.arrivalLocation,
                flight.arrivalTime
              ],
              (err) => {
                if (err) console.error("Error inserting flight:", err);
              }
            );
          });
        }
      });

      resolve();
    });
  });
}

initializeDatabase();

/* ------------------ CRUD API -------------------- */

// GET all checklist items
app.get("/api/checklist", (req, res) => {
  const { flightNumber } = req.query;

  if (!flightNumber) {
    return res.status(400).json({ error: "flightNumber required" });
  }

  db.all(
    `SELECT checkItem, status, comment FROM checklist WHERE flightNumber = ?`,
    [flightNumber],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json(rows);
    }
  );
});

// CREATE checklist item
app.post("/api/checklist", (req, res) => {
  const checkItem = req.body.checkItem || req.body.check;
  const { status, comment } = req.body;
  db.run(
    "INSERT INTO checklist (checkItem, status, comment) VALUES (?, ?, ?)",
    [checkItem, status, comment],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, check: checkItem, checkItem, status, comment });
    }
  );
});

// UPDATE checklist item
app.put("/api/checklist/:id", (req, res) => {
  const checkItem = req.body.checkItem || req.body.check;
  const { status, comment } = req.body;
  const id = Number(req.params.id);
  db.run(
    "UPDATE checklist SET checkItem = ?, status = ?, comment = ? WHERE id = ?",
    [checkItem, status, comment, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM checklist WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Item not found" });
        res.json({ ...row, check: row.checkItem });
      });
    }
  );
});

// DELETE checklist item
app.delete("/api/checklist/:id", (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM checklist WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// GET flight info (filter by flightNumber if provided)
app.get("/api/flight-info", (req, res) => {
  const { flightNumber } = req.query;
  
  let query = "SELECT * FROM flight_info";
  let params = [];
  
  if (flightNumber) {
    query += " WHERE flightNumber = ?";
    params.push(flightNumber);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Map flightDate back to date for backward compatibility
    const mappedRows = rows.map(row => ({
      ...row,
      date: row.flightDate
    }));
    res.json(mappedRows);
  });
});

// UPDATE/CREATE flight info (upsert - replaces all flights or updates specific one)
app.put("/api/flight-info", (req, res) => {
  const flights = Array.isArray(req.body) ? req.body : [req.body];
  let completed = 0;
  let errored = false;
  if (flights.length === 0) return res.json([]);

  flights.forEach((flight) => {
    const flightDate = flight.flightDate || flight.date;
    const sysdate = new Date().toISOString();

    const finishOne = () => {
      if (errored) return;
      completed++;
      if (completed === flights.length) res.json(flights);
    };

    const insertFlight = () => {
      db.run(
        `INSERT INTO flight_info (flightNumber, flightDate, filedBy, filingTime, departureLocation, departureTime, arrivalLocation, arrivalTime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          flight.flightNumber,
          flightDate || sysdate,
          flight.filedBy,
          flight.filingTime,
          flight.departureLocation,
          flight.departureTime,
          flight.arrivalLocation,
          flight.arrivalTime
        ],
        (err) => {
          if (err && !errored) {
            errored = true;
            console.error("Error inserting flight:", err);
            return res.status(500).json({ error: err.message });
          }
          finishOne();
        }
      );
    };

    // If flightNumber provided, check for existing record and update; otherwise insert
    if (flight.flightNumber) {
      db.get("SELECT id FROM flight_info WHERE flightNumber = ?", [flight.flightNumber], (err, row) => {
        if (err && !errored) {
          errored = true;
          console.error("Error checking flight:", err);
          return res.status(500).json({ error: err.message });
        }

        if (row) {
          db.run(
            `UPDATE flight_info
             SET flightNumber = ?, flightDate = ?, filedBy = ?, filingTime = ?, departureLocation = ?, departureTime = ?, arrivalLocation = ?, arrivalTime = ?
             WHERE id = ?`,
            [
              flight.flightNumber,
              flightDate || sysdate,
              flight.filedBy,
              flight.filingTime,
              flight.departureLocation,
              flight.departureTime,
              flight.arrivalLocation,
              flight.arrivalTime,
              row.id
            ],
            (err) => {
              if (err && !errored) {
                errored = true;
                console.error("Error updating flight:", err);
                return res.status(500).json({ error: err.message });
              }
              finishOne();
            }
          );
        } else {
          insertFlight();
        }
      });
    } else {
      // No flightNumber to check against, just insert
      insertFlight();
    }
  });
});

app.post("/api/save-all", (req, res) => {
  const { flightInfo, checklist } = req.body;

  if (!flightInfo.flightNumber) {
    return res.status(400).json({ error: "Flight Number is required" });
  }

  db.serialize(() => {

    // 1️⃣ UPSERT FLIGHT INFO
    db.run(
      `
      INSERT INTO flight_info (
        flightNumber, flightDate, filedBy, filingTime,
        departureLocation, departureTime, arrivalLocation, arrivalTime
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(flightNumber)
      DO UPDATE SET
        flightDate = excluded.flightDate,
        filedBy = excluded.filedBy,
        filingTime = excluded.filingTime,
        departureLocation = excluded.departureLocation,
        departureTime = excluded.departureTime,
        arrivalLocation = excluded.arrivalLocation,
        arrivalTime = excluded.arrivalTime
      `,
      [
        flightInfo.flightNumber,
        flightInfo.date,
        flightInfo.filedBy,
        flightInfo.filingTime,
        flightInfo.departureLocation,
        flightInfo.departureTime,
        flightInfo.arrivalLocation,
        flightInfo.arrivalTime
      ]
    );

    // 2️⃣ DELETE PREVIOUS CHECKLIST FOR THIS FLIGHT
    db.run(
      `DELETE FROM checklist WHERE flightNumber = ?`,
      [flightInfo.flightNumber]
    );

    // 3️⃣ INSERT NEW CHECKLIST ROWS
    const stmt = db.prepare(`
      INSERT INTO checklist (checkItem, status, comment, flightNumber)
      VALUES (?, ?, ?, ?)
    `);

    checklist.forEach((item) => {
      stmt.run(item.checkItem, item.status, item.comment, flightInfo.flightNumber);
    });

    stmt.finalize();

    res.json({ success: true });
  });
});

app.delete("/api/delete-flight", (req, res) => {
  const { flightNumber } = req.query;

  if (!flightNumber) {
    return res.status(400).json({ error: "flightNumber is required" });
  }

  db.serialize(() => {
    db.run(`DELETE FROM checklist WHERE flightNumber = ?`, [flightNumber]);
    db.run(`DELETE FROM flight_info WHERE flightNumber = ?`, [flightNumber]);
  });

  res.json({ success: true });
});


const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
