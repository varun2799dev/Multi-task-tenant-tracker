const express = require("express");
const auth = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

// Create task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, project_id, status } = req.body;
    const userId = req.user.id;

    // Get project and organization info
    const projectResult = await db.query(
      `SELECT p.*, o.id as organization_id 
       FROM projects p 
       JOIN organizations o ON p.organization_id = o.id 
       WHERE p.id = $1`,
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectResult.rows[0];

    // Check if user belongs to organization
    const memberCheck = await db.query(
      "SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2",
      [project.organization_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not a member of this organization" });
    }

    const result = await db.query(
      "INSERT INTO tasks (title, description, project_id, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, project_id, status || "todo", userId]
    );

    // Log activity
    await db.query(
      "INSERT INTO activities (organization_id, user_id, action, description) VALUES ($1, $2, $3, $4)",
      [
        project.organization_id,
        userId,
        "task_created",
        `Created task "${title}" in project "${project.name}"`,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get project's tasks
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Get project and organization info
    const projectResult = await db.query(
      `SELECT p.*, o.id as organization_id 
       FROM projects p 
       JOIN organizations o ON p.organization_id = o.id 
       WHERE p.id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectResult.rows[0];

    // Check if user belongs to organization
    const memberCheck = await db.query(
      "SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2",
      [project.organization_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not a member of this organization" });
    }

    const result = await db.query(
      `SELECT t.*, u.name as created_by_name 
       FROM tasks t 
       JOIN users u ON t.created_by = u.id 
       WHERE t.project_id = $1 
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update task status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Get task with project and organization info
    const taskResult = await db.query(
      `SELECT t.*, p.name as project_name, p.organization_id 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       WHERE t.id = $1`,
      [id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskResult.rows[0];

    // Check if user belongs to organization
    const memberCheck = await db.query(
      "SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2",
      [task.organization_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not a member of this organization" });
    }

    const result = await db.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    // Log activity
    await db.query(
      "INSERT INTO activities (organization_id, user_id, action, description) VALUES ($1, $2, $3, $4)",
      [
        task.organization_id,
        userId,
        "task_updated",
        `Updated task "${task.title}" to ${status}`,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
