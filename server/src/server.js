import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './db.js';
import { sendMembershipNotification, sendContactNotification } from './mailer.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5001;
const IS_PROD = process.env.NODE_ENV === 'production';

const configuredSecret = (process.env.JWT_SECRET || '').trim();
if (
  IS_PROD &&
  (!configuredSecret ||
    configuredSecret === 'replace_with_secure_secret' ||
    configuredSecret.length < 32)
) {
  console.error(
    'FATAL: In production, JWT_SECRET must be set to a private secret of at least 32 characters.'
  );
  process.exit(1);
}

const JWT_SECRET = configuredSecret || crypto.randomBytes(32).toString('hex');
if (!configuredSecret) {
  console.warn(
    'WARNING: JWT_SECRET is not set in server/.env; using an ephemeral development secret.'
  );
}

const extraCorsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (extraCorsOrigins.includes('*') || extraCorsOrigins.includes(origin)) return true;
  if (
    !IS_PROD &&
    (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
  ) {
    return true;
  }
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    return (
      hostname === 'telangananeuro.com' ||
      hostname === 'www.telangananeuro.com' ||
      hostname === 'telangananeurosociety.org' ||
      hostname === 'www.telangananeurosociety.org' ||
      hostname === 'vercel.app' ||
      hostname.endsWith('.vercel.app') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
};

const normalizePhoneDigits = (val) => {
  const digits = String(val || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_MEMBERSHIP_STATUSES = new Set(['Pending', 'Approved', 'Rejected']);
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttemptsByIp = new Map();

const parsePositiveInt = (raw) => {
  if (!/^\d+$/.test(String(raw || ''))) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

// Security headers across all API responses
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
        callback(new Error('CORS_NOT_ALLOWED'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);
app.use(express.json({ limit: '2mb' }));

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing.' });

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Health Check Endpoint
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', db: 'connected', port: PORT });
  } catch (err) {
    console.error('Health check DB error:', err.message);
    return res.status(503).json({ status: 'degraded', db: 'disconnected' });
  }
});

// Public "Know Your Membership Details" Lookup Endpoint
app.get('/api/memberships/lookup', async (req, res) => {
  const rawQuery = String(req.query.q || '').trim();
  if (!rawQuery) {
    return res.status(400).json({ error: 'Please provide Membership No, Email ID, or Mobile No.' });
  }

  const normalizedEmail = rawQuery.toLowerCase();
  const phoneDigits = normalizePhoneDigits(rawQuery);

  try {
    // 1. Direct lookup in official MemberDirectory table
    const directoryMatch = await prisma.memberDirectory.findFirst({
      where: {
        OR: [
          { membershipNo: rawQuery },
          { membershipNo: rawQuery.toUpperCase() },
          { email: normalizedEmail },
          ...(phoneDigits.length >= 7
            ? [{ phone: { contains: phoneDigits } }]
            : []),
        ],
      },
    });

    if (directoryMatch) {
      return res.json({
        membershipNo: directoryMatch.membershipNo,
        name: directoryMatch.name,
        email: directoryMatch.email,
        phone: directoryMatch.phone,
        category: directoryMatch.category,
        specialty: directoryMatch.specialty,
      });
    }

    // 2. Fallback check across Secretariat-approved MembershipRequest entries
    const approvedMatch = await prisma.membershipRequest.findFirst({
      where: {
        status: 'Approved',
        OR: [
          { email: normalizedEmail },
          ...(phoneDigits.length >= 7 ? [{ phone: { contains: phoneDigits } }] : []),
        ],
      },
    });

    if (approvedMatch) {
      return res.json({
        membershipNo: `TNS-REQ-${approvedMatch.id}`,
        name: approvedMatch.name,
        email: approvedMatch.email,
        phone: approvedMatch.phone,
        category: approvedMatch.category,
        specialty: approvedMatch.specialty,
      });
    }

    return res.status(404).json({ error: 'No matching membership record found.' });
  } catch (err) {
    console.error('Membership lookup error:', err);
    return res.status(500).json({ error: 'Failed to check membership details.' });
  }
});

// Public Membership Application Endpoint
app.post('/api/memberships', async (req, res) => {
  try {
    const { name, email, phone, specialty, category, hospital, medicalCouncilNo, message } =
      req.body || {};
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPhone = String(phone || '').trim();
    const cleanSpecialty = String(specialty || '').trim();
    const cleanCategory = String(category || 'Life Member').trim() || 'Life Member';
    const cleanHospital = String(hospital || '').trim();
    const cleanCouncilNo = medicalCouncilNo ? String(medicalCouncilNo).trim() : null;
    const cleanMessage = message ? String(message).trim() : null;

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanSpecialty || !cleanHospital) {
      return res.status(400).json({ error: 'Please complete all required fields.' });
    }
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 160) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (
      cleanName.length > 120 ||
      cleanPhone.length > 30 ||
      cleanSpecialty.length > 80 ||
      cleanCategory.length > 80 ||
      cleanHospital.length > 200 ||
      (cleanCouncilNo && cleanCouncilNo.length > 80) ||
      (cleanMessage && cleanMessage.length > 4000)
    ) {
      return res.status(400).json({ error: 'One or more input fields exceed maximum length.' });
    }

    const existing = await prisma.membershipRequest.findFirst({
      where: { OR: [{ email: cleanEmail }, { phone: cleanPhone }] },
    });
    if (existing) {
      return res.status(409).json({
        error: 'A membership request with this email or phone number already exists.',
      });
    }

    const created = await prisma.membershipRequest.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        specialty: cleanSpecialty,
        category: cleanCategory,
        hospital: cleanHospital,
        medicalCouncilNo: cleanCouncilNo,
        message: cleanMessage,
      },
    });

    // Asynchronously notify info@telangananeuro.com
    sendMembershipNotification(created).catch((err) =>
      console.error('[Mailer] Membership dispatch error:', err)
    );

    return res.status(201).json(created);
  } catch (err) {
    console.error('Membership submission error:', err);
    return res.status(500).json({ error: 'Failed to submit membership application.' });
  }
});

// Public Contact Enquiry Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanSubject = String(subject || '').trim();
    const cleanMessage = String(message || '').trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return res.status(400).json({ error: 'Please complete all required fields.' });
    }
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 160) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (
      cleanName.length > 120 ||
      (cleanPhone && cleanPhone.length > 30) ||
      cleanSubject.length > 200 ||
      cleanMessage.length > 4000
    ) {
      return res.status(400).json({ error: 'One or more input fields exceed maximum length.' });
    }

    const created = await prisma.contactEnquiry.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
      },
    });

    // Asynchronously notify info@telangananeuro.com
    sendContactNotification({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
    }).catch((err) => console.error('[Mailer] Contact dispatch error:', err));

    return res.status(201).json({ message: 'Enquiry recorded successfully.', id: created.id });
  } catch (err) {
    console.error('Contact enquiry error:', err);
    return res.status(500).json({ error: 'Failed to submit contact enquiry.' });
  }
});

// Admin Login (with sliding-window rate limiting)
app.post('/api/admin/login', async (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = loginAttemptsByIp.get(ip);

  if (bucket && now - bucket.windowStart < LOGIN_WINDOW_MS && bucket.count >= LOGIN_MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'Too many failed login attempts. Please try again after 15 minutes.',
    });
  }

  const recordFailure = () => {
    const existing = loginAttemptsByIp.get(ip);
    if (!existing || now - existing.windowStart >= LOGIN_WINDOW_MS) {
      loginAttemptsByIp.set(ip, { count: 1, windowStart: now });
    } else {
      existing.count += 1;
    }
  };

  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      recordFailure();
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      recordFailure();
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    loginAttemptsByIp.delete(ip);
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ token, username: admin.username, role: admin.role });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Authentication service error.' });
  }
});

// Protected Admin Routes
app.get('/api/admin/memberships', authenticateAdmin, async (req, res) => {
  const search = (req.query.search || '').trim();
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { hospital: { contains: search } },
          ],
        }
      : {};
    const list = await prisma.membershipRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error loading membership requests.' });
  }
});

app.put('/api/admin/memberships/:id/status', authenticateAdmin, async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  const status = String(req.body?.status || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'Invalid membership request ID.' });
  }
  if (!ALLOWED_MEMBERSHIP_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Status must be Pending, Approved, or Rejected.' });
  }
  try {
    const updated = await prisma.membershipRequest.update({
      where: { id },
      data: { status },
    });
    return res.json(updated);
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Membership request not found.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

app.get('/api/admin/members-directory', authenticateAdmin, async (req, res) => {
  const search = (req.query.search || '').trim();
  try {
    const where = search
      ? {
          OR: [
            { membershipNo: { contains: search } },
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { city: { contains: search } },
          ],
        }
      : {};
    const list = await prisma.memberDirectory.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error loading member directory records.' });
  }
});

app.delete('/api/admin/members-directory/:id', authenticateAdmin, async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid directory member ID.' });
  }
  try {
    await prisma.memberDirectory.delete({
      where: { id },
    });
    return res.json({ deleted: true });
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Directory member not found.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Failed to remove member directory record.' });
  }
});

app.post('/api/admin/members-directory/import', authenticateAdmin, async (req, res) => {
  const records = Array.isArray(req.body?.members) ? req.body.members : [];
  if (records.length === 0) {
    return res.status(400).json({ error: 'Provide a non-empty "members" array.' });
  }
  if (records.length > 5000) {
    return res.status(400).json({ error: 'Batch size cannot exceed 5,000 records per request.' });
  }

  let upserted = 0;
  try {
    for (const row of records) {
      const membershipNo = String(row.membershipNo || '').trim();
      const name = String(row.name || '').trim();
      if (!membershipNo || !name) continue;

      await prisma.memberDirectory.upsert({
        where: { membershipNo },
        update: {
          name,
          email: row.email ? String(row.email).toLowerCase().trim() : null,
          phone: row.phone ? String(row.phone).trim() : null,
          category: row.category ? String(row.category).trim() : null,
          specialty: row.specialty ? String(row.specialty).trim() : null,
          city: row.city ? String(row.city).trim() : null,
        },
        create: {
          membershipNo,
          name,
          email: row.email ? String(row.email).toLowerCase().trim() : null,
          phone: row.phone ? String(row.phone).trim() : null,
          category: row.category ? String(row.category).trim() : null,
          specialty: row.specialty ? String(row.specialty).trim() : null,
          city: row.city ? String(row.city).trim() : null,
        },
      });
      upserted++;
    }
    return res.json({ imported: upserted });
  } catch (err) {
    console.error('Directory bulk import error:', err);
    return res.status(500).json({ error: 'Failed to import member directory records.' });
  }
});

app.get('/api/admin/enquiries', authenticateAdmin, async (req, res) => {
  const search = (req.query.search || '').trim();
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { subject: { contains: search } },
          ],
        }
      : {};
    const list = await prisma.contactEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error loading contact enquiries.' });
  }
});

// Global error handler — ensures clean JSON errors without exposing stack traces
app.use((err, _req, res, next) => {
  if (err?.message === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({ error: 'Origin not allowed by CORS policy.' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON request body.' });
  }
  if (err) {
    console.error('Unhandled API error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
  return next();
});

app.listen(PORT, () => {
  console.log(`TNS Association API running on port ${PORT}`);
});
