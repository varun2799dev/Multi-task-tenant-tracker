const express = require("express");
const auth = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

// Create organization
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      "INSERT INTO organizations (name, created_by) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );

    const organization = result.rows[0];

    // Add creator as admin
    await db.query(
      "INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)",
      [organization.id, userId, "admin"]
    );

    // Log activity
    await db.query(
      "INSERT INTO activities (organization_id, user_id, action, description) VALUES ($1, $2, $3, $4)",
      [
        organization.id,
        userId,
        "organization_created",
        `Created organization "${name}"`,
      ]
    );

    res.status(201).json(organization);
  } catch (error) {
    console.error("Create organization error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's organizations
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT o.*, om.role 
       FROM organizations o 
       JOIN organization_members om ON o.id = om.organization_id 
       WHERE om.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get organizations error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Join organization
router.post("/:id/join", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    // Check if organization exists
    const orgResult = await db.query(
      "SELECT name FROM organizations WHERE id = $1",
      [id]
    );
    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if already member
    const existingMember = await db.query(
      "SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: "Already a member" });
    }

    // Add as member
    await db.query(
      "INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)",
      [id, userId, "member"]
    );

    // Log activity
    await db.query(
      "INSERT INTO activities (organization_id, user_id, action, description) VALUES ($1, $2, $3, $4)",
      [
        id,
        userId,
        "member_joined",
        `Joined organization "${orgResult.rows[0].name}"`,
      ]
    );

    res.json({ message: "Joined organization successfully" });
  } catch (error) {
    console.error("Join organization error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
