const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let pool;

function createApp(databasePool) {
  const db = databasePool;

  app.get("/health", async (req, res) => {
    try {
      await db.query("SELECT 1");
      res.status(200).json({
        status: "ok",
        database: "connected"
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        database: "unavailable"
      });
    }
  });

  app.get("/", async (req, res, next) => {
    try {
      const [tasks] = await db.query(
        "SELECT id, title, description, status, created_at " +
        "FROM tasks ORDER BY id DESC"
      );

      res.render("index", {
        tasks,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  // CREATE
  app.post("/tasks", async (req, res, next) => {
    try {
      const title = String(req.body.title || "").trim();
      const description =
        String(req.body.description || "").trim();

      if (!title || title.length > 150) {
        return res.status(400).send(
          "Title is required and must be at most 150 characters."
        );
      }

      await db.execute(
        "INSERT INTO tasks (title, description, status) " +
        "VALUES (?, ?, ?)",
        [title, description, "pending"]
      );

      res.redirect("/");
    } catch (error) {
      next(error);
    }
  });

  // UPDATE
  app.post("/tasks/:id/update", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const title = String(req.body.title || "").trim();
      const description =
        String(req.body.description || "").trim();
      const status = String(req.body.status || "");

      if (
        !Number.isSafeInteger(id) ||
        id < 1 ||
        !title ||
        title.length > 150 ||
        !["pending", "in_progress", "completed"].includes(status)
      ) {
        return res.status(400).send("Invalid task data.");
      }

      const [result] = await db.execute(
        "UPDATE tasks SET title = ?, description = ?, status = ? " +
        "WHERE id = ?",
        [title, description, status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).send("Task not found.");
      }

      res.redirect("/");
    } catch (error) {
      next(error);
    }
  });

  // DELETE
  app.post("/tasks/:id/delete", async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).send("Invalid task ID.");
      }

      const [result] = await db.execute(
        "DELETE FROM tasks WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).send("Task not found.");
      }

      res.redirect("/");
    } catch (error) {
      next(error);
    }
  });

  app.use((err, req, res, next) => {
    console.error("Request failed:", err.message);
    res.status(500).send("An internal server error occurred.");
  });

  return app;
}

async function start() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "tasksdb",
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      status ENUM(
        'pending',
        'in_progress',
        'completed'
      ) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const server = createApp(pool);
  const port = Number(process.env.PORT || 3000);

  server.listen(port, "0.0.0.0", () => {
    console.log(`CRUD application listening on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  });
}

module.exports = { createApp };
