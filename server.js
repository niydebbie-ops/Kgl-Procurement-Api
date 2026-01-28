

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware to parse JSON
app.use(express.json());

// GET Route: Fetch procurement records
app.get('/kgl/procurement', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      // If file doesn't exist, return empty array
      if (err.code === 'ENOENT') {
        return res.status(200).json([]);
      }
      return res.status(500).json({ error: 'Failed to read data file' });
    }

    try {
      const records = JSON.parse(data);
      res.status(200).json(records);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON in data file' });
    }
  });
});

// POST Route: Add new procurement record
app.post('/kgl/procurement', (req, res) => {
  const newRecord = req.body;

  // Validate input
  if (!newRecord.produceName || !newRecord.tonnage || !newRecord.cost) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    let records = [];
    if (!err) {
      try {
        records = JSON.parse(data);
      } catch (parseErr) {
        return res.status(500).json({ error: 'Invalid JSON in data file' });
      }
    }

    records.push(newRecord);

    fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Failed to save record' });
      }
      res.status(201).json({ message: 'Record added successfully' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
