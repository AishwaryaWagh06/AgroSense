import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';
import pool, { initDb } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

await initDb();

app.use('/api', authRoutes);

app.get('/api/profile', requireAuth, async (req, res)=>{
  try{
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id=?', [req.user.sub]);
    if(!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.json(rows[0]);
  }catch(err){
    console.error(err); return res.status(500).json({ error: 'Server error' });
  }
});

// Serve static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
  console.log(`Auth server running on http://localhost:${PORT}`);
});


