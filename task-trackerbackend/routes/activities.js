const express = require("express");
const auth = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

// Get organization activities
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
      `SELECT a.*, u.name as user_name 
       FROM activities a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.organization_id = $1 
       ORDER BY a.created_at DESC 
       LIMIT 50`,
      [organizationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
