const express = require('express');
const jwt = require('jsonwebtoken');
const { addClient, removeClient } = require('../services/realtimeService');

const router = express.Router();

const resolveToken = (req) => {
  if (req.query.token) {
    return req.query.token;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

router.get('/me', (req, res) => {
  try {
    const token = resolveToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is required for stream' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = String(decoded.id);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    addClient(userId, res);

    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ userId, connectedAt: new Date().toISOString() })}\n\n`);

    const keepAlive = setInterval(() => {
      res.write(`event: ping\n`);
      res.write(`data: ${JSON.stringify({ ts: Date.now() })}\n\n`);
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      removeClient(userId, res);
      res.end();
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token for stream' });
  }
});

module.exports = router;
