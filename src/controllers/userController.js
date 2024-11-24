
const pool = require('../config/database');
const { logAudit } = require('../services/auditLogService');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
};

const createUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    const newUser = result.rows[0];

    // Log the action
    await logAudit({
      tableName: 'users',
      recordId: newUser.id,
      action: 'INSERT',
      newData: newUser,
      performedBy: req.user?.id || 'system', // Assuming `req.user` contains authenticated user info
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    // Fetch the old user data
    const oldDataResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const oldData = oldDataResult.rows[0];
    if (!oldData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    const updatedUser = result.rows[0];

    // Log the action
    await logAudit({
      tableName: 'users',
      recordId: id,
      action: 'UPDATE',
      oldData,
      newData: updatedUser,
      performedBy: req.user?.id || 'system',
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

module.exports = { getUsers, createUser, updateUser };
