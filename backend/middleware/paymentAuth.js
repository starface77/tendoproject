const { Buffer } = require('buffer');
const crypto = require('crypto');

/**
 * 🔐 Payme (Paycom) Webhook Auth Middleware
 * Проверяет заголовок Authorization: Basic base64("Paycom:<SECRET>")
 */
const verifyPaymeBasicAuth = (req, res, next) => {
  try {
    const secret = process.env.PAYME_SECRET_KEY;

    if (!secret) {
      // Если секрет не задан — отклоняем запрос для безопасности
      return res.status(500).json({ success: false, error: 'Payme secret not configured' });
    }

    const auth = req.get('authorization') || req.get('Authorization');
    if (!auth || !auth.startsWith('Basic ')) {
      return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
    }

    const expected = 'Basic ' + Buffer.from(`Paycom:${secret}`).toString('base64');

    // Безопасное сравнение в постоянном времени
    const a = Buffer.from(auth);
    const b = Buffer.from(expected);
    const isMatch = a.length === b.length && crypto.timingSafeEqual ? crypto.timingSafeEqual(a, b) : auth === expected;

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    next();
  } catch (error) {
    console.error('Payme auth middleware error:', error.message);
    return res.status(500).json({ success: false, error: 'Auth middleware error' });
  }
};

module.exports = { verifyPaymeBasicAuth };


