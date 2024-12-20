const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS middleware for Angular app
app.use(cors({
  origin: 'http://localhost:4200',  // Angular's default port
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization'
}));

app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://taunkkomal6022:GKmqtsJfuAHV1p9w@cluster0.nu0xln1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Policy Schema
const childSchema = new mongoose.Schema({
  name: String,
  dob: String,
  age: Number,
  gender: String
});

const policySchema = new mongoose.Schema({
  agentName: String,
  policyNumber: String,
  policyStartDate: String,
  policyEndDate: String,
  policyType: String,
  holderName: String,
  holderDob: String,
  holderAge: Number,
  holderGender: String,
  spouseName: String,
  spouseDob: String,
  spouseAge: Number,
  spouseGender: String,
  children: [childSchema]
});

const Policy = mongoose.model('Policy', policySchema);

// Serve static files from Angular build folder
app.use(express.static(path.join(__dirname, './dist/policy')));

// Route for all API requests
app.get('/api/getpolicies', async (req, res) => {
  try {
    const policies = await Policy.find();
    res.status(200).json(policies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve policies', details: err });
  }
});

// Route for saving new policies
app.post('/api/postpolicies', async (req, res) => {
  try {
    const policy = new Policy(req.body);
    const savedPolicy = await policy.save();
    res.status(201).json(savedPolicy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save policy', details: err });
  }
});

// Get policy by ID
app.get('/api/policy/:id', async (req, res) => {
  const policyId = req.params.id;
  try {
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.status(200).json(policy);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching policy', details: err });
  }
});

// Wildcard route for Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/policy/browser/index.html'));
});
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
