const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const sessions = new Map();

if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public'),{
  index:false
}));

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createSession(user) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: Date.now()
  });
  return token;
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, cookie) => {
    const [key, ...rest] = cookie.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function getCurrentUser(req) {
  const cookies = parseCookies(req);
  const token = cookies.opticode_session;
  if (!token) return null;
  return sessions.get(token) || null;
}

function requireAuth(req, res, next) {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }
  req.user = user;
  next();
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function estimateComplexity(code) {
  const nestedLoops = /(for|while)[\s\S]*?(for|while)/.test(code);
  const loops = countMatches(code, /\b(for|while)\b/g);
  const recursion = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{[\s\S]*?\b\1\s*\(/.test(code);

  if (nestedLoops) return 'O(n²) approx';
  if (recursion) return 'Recursive / depends on logic';
  if (loops > 0) return 'O(n) approx';
  return 'O(1) approx';
}

function optimizeCode(code, language) {
  let optimized = code;

  optimized = optimized
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  if (language === 'javascript' || language === 'java' || language === 'cpp' || language === 'c') {
    optimized = optimized
      .replace(/if\s*\(([^)]+)\s*==\s*true\)/g, 'if ($1)')
      .replace(/if\s*\(([^)]+)\s*==\s*false\)/g, 'if (!$1)');
  }

  if (language === 'python') {
    optimized = optimized.replace(/==\s*True/g, '').replace(/==\s*False/g, ' is False');
  }

  return optimized;
}

function analyzeCode(code, language) {
  const issues = [];
  const suggestions = [];

  const totalLines = code.split('\n').length;
  const blankLines = countMatches(code, /^\s*$/gm);
  const comments = countMatches(code, /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/)/gm);
  const loops = countMatches(code, /\b(for|while)\b/g);
  const conditionals = countMatches(code, /\b(if|else if|switch)\b/g);
  const functions = countMatches(code, /\b(function|def|void|int|float|double|String|public|private|static)\b/g);
  const duplicateSemicolons = countMatches(code, /;;+/g);
  const longLines = code.split('\n').filter(line => line.length > 100).length;
  const consoleLogs = countMatches(code, /(console\.log|System\.out\.println|printf\s*\()/g);
  const unusedVariablesApprox = countMatches(code, /\b(temp|dummy|unused|test)\b/g);

  if (loops >= 2 && /(for|while)[\s\S]*?(for|while)/.test(code)) {
    issues.push('Nested loops detected. This may slow down performance for large inputs.');
    suggestions.push('Try using hashing, maps, sets, or precomputed values to reduce nested iteration.');
  }

  if (longLines > 0) {
    issues.push(`${longLines} long line(s) found. Readability may be reduced.`);
    suggestions.push('Break long statements into smaller readable steps.');
  }

  if (duplicateSemicolons > 0) {
    issues.push('Unnecessary semicolons detected.');
    suggestions.push('Remove extra semicolons to keep code clean.');
  }

  if (consoleLogs > 2) {
    issues.push('Multiple debug print statements found.');
    suggestions.push('Remove unnecessary debug output before final submission.');
  }

  if (unusedVariablesApprox > 0) {
    issues.push('Variable names like temp/dummy/unused suggest possible unused or unclear variables.');
    suggestions.push('Rename variables meaningfully and remove those not required.');
  }

  if (blankLines > totalLines * 0.3) {
    issues.push('Too many blank lines detected.');
    suggestions.push('Reduce extra spacing for cleaner formatting.');
  }

  if (!comments) {
    suggestions.push('Add short comments to explain important logic blocks.');
  }

  if (!issues.length) {
    issues.push('No major issues detected by the basic analyzer.');
    suggestions.push('Your code looks fairly clean. Consider improving naming, modularity, and comments.');
  }

  let score = 100;
  score -= loops > 2 ? 10 : 0;
  score -= longLines * 3;
  score -= duplicateSemicolons * 5;
  score -= consoleLogs > 2 ? 8 : 0;
  score -= blankLines > totalLines * 0.3 ? 5 : 0;
  score -= unusedVariablesApprox * 4;
  score = Math.max(55, Math.min(100, score));

  return {
    score,
    issues,
    suggestions,
    metrics: {
      language,
      totalLines,
      blankLines,
      comments,
      loops,
      conditionals,
      functions,
      estimatedComplexity: estimateComplexity(code)
    },
    optimizedCode: optimizeCode(code, language)
  };
}

app.get('/', (req, res) => {
  const user = getCurrentUser(req);
  res.sendFile(path.join(__dirname, 'public', user ? 'app.html' : 'login.html'));
});

app.get('/api/auth/me', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const users = readUsers();
  const normalizedEmail = String(email).trim().toLowerCase();
  const exists = users.find(user => user.email === normalizedEmail);
  if (exists) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password)
  };
  users.push(user);
  writeUsers(users);

  const token = createSession(user);
  res.setHeader('Set-Cookie', `opticode_session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
  res.status(201).json({ message: 'Registration successful.', user: { name: user.name, email: user.email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = readUsers();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = users.find(item => item.email === normalizedEmail);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createSession(user);
  res.setHeader('Set-Cookie', `opticode_session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
  res.json({ message: 'Login successful.', user: { name: user.name, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  const cookies = parseCookies(req);
  if (cookies.opticode_session) {
    sessions.delete(cookies.opticode_session);
  }
  res.setHeader('Set-Cookie', 'opticode_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.json({ message: 'Logged out successfully.' });
});

app.post('/api/analyze', requireAuth, (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required.' });
  }

  const result = analyzeCode(code, language);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`OptiCode server running at http://localhost:${PORT}`);
});
