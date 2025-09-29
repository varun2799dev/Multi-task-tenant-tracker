const express = require("express");
const auth = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

// Create project
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, organization_id } = req.body;
    const userId = req.user.id;

    // Check if user belongs to organization
    const memberCheck = await db.query(
      "SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2",
      [organization_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not a member of this organization" });
    }

    const result = await db.query(
      "INSERT INTO projects (name, description, organization_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, organization_id, userId]
    );

    // Log activity
    await db.query(
      "INSERT INTO activities (organization_id, user_id, action, description) VALUES ($1, $2, $3, $4)",
      [organization_id, userId, "project_created", `Created project "${name}"`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get organization's projects
router.get("/organization/:organizationId", auth, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;

    // Check if user belongs to organization
    const memberCheck = await db.query(
      "SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2",
      [organizationId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not a member of this organization" });
    }

    const result = await db.query(
      "SELECT * FROM projects WHERE organization_id = $1 ORDER BY created_at DESC",
      [organizationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
