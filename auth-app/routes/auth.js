import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

router.post('/register', async (req, res) => {
  try{
    const { name, email, password } = req.body || {};
    if(!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    const [rows] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if(rows.length) return res.status(409).json({ error: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, password_hash]);
    return res.status(201).json({ id: result.insertId, name, email });
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try{
    const { email, password } = req.body || {};
    if(!email || !password) return res.status(400).json({ error: 'email and password required' });
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
    if(!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token });
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;


