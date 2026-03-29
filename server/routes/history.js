const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/history - Get generation history
router.get('/', (req, res) => {
  const history = store.getHistory();
  res.json(history);
});

module.exports = router;
