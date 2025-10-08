const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set defaults
db.defaults({ users: [], histories: {} }).write();

// Seeder user (id: 1)
function seedUser(){
  const email = 'candidate@example.com';
  const password = 'Password123';
  const exists = db.get('users').find({ email }).value();
  if (!exists) {
    const hashed = bcrypt.hashSync(password, 10);
    const user = { id: 1, email, password: hashed, name: 'Candidate User' };
    db.get('users').push(user).write();
    console.log('Seeded user:', email, 'password:', password);
  }
}
seedUser();

// Auth helper
function generateToken(user){
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
}

function auth(req, res, next){
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'no token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = db.get('users').find({ email }).value();
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Profile
app.get('/api/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

// Geo lookup (proxy to ipinfo)
app.get('/api/geo/:ip?', auth, async (req, res) => {
  try{
    const ip = req.params.ip || '';
    const url = ip ? `https://ipinfo.io/${ip}/geo` : `https://ipinfo.io/geo`;
    const resp = await axios.get(url);
    return res.json(resp.data);
  } catch (err) {
    return res.status(500).json({ error: 'failed to lookup ip' });
  }
});

// History endpoints
// get history for user
app.get('/api/history', auth, (req, res) => {
  const uid = String(req.user.id);
  const list = db.get('histories').get(uid).value() || [];
  res.json({ history: list });
});

// add history entry { ip, data }
app.post('/api/history', auth, (req, res) => {
  const { ip, data } = req.body;
  if (!ip || !data) return res.status(400).json({ error: 'ip and data required' });
  const uid = String(req.user.id);
  const entry = { id: nanoid(), ip, data, when: new Date().toISOString() };
  const key = `histories.${uid}`;
  if (!db.has(key).value()) db.set(key, []).write();
  db.get(key).push(entry).write();
  res.json({ entry });
});

// delete multiple entries - body: { ids: [] }
app.delete('/api/history', auth, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
  const uid = String(req.user.id);
  const key = `histories.${uid}`;
  const list = db.get(key).value() || [];
  const filtered = list.filter(item => !ids.includes(item.id));
  db.set(key, filtered).write();
  res.json({ deleted: ids.length });
});

app.listen(PORT, () => console.log('API listening on http://localhost:' + PORT));
