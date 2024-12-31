// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

// Team Schema
const teamSchema = new mongoose.Schema({
  course: { 
    type: String, 
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  section: { type: String, required: true },
  description: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Team = mongoose.model('Team', teamSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.patch('/api/users/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    Object.keys(updates).forEach(key => req.user[key] = updates[key]);
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/api/teams', auth, async (req, res) => {
  try {
    const team = new Team({
      ...req.body,
      creator: req.user._id
    });
    await team.save();
    res.status(201).send(team);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate('creator', 'name email description')
      .populate('members', 'name email description')
      .populate('requests', 'name email description');
    res.send(teams);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/teams/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) throw new Error('Team not found');
    if (!team.requests.includes(req.user._id)) {
      team.requests.push(req.user._id);
      await team.save();
    }
    res.send(team);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/api/teams/:id/respond', auth, async (req, res) => {
  try {
    const { userId, approved } = req.body;
    const team = await Team.findOne({ _id: req.params.id, creator: req.user._id });
    if (!team) throw new Error('Team not found');
    
    team.requests = team.requests.filter(id => id.toString() !== userId);
    if (approved) {
      team.members.push(userId);
    }
    await team.save();
    res.send(team);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete('/api/teams/:id', auth, async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({ 
      _id: req.params.id, 
      creator: req.user._id 
    });
    if (!team) throw new Error('Team not found');
    res.send(team);
  } catch (error) {
    res.status(400).send(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));