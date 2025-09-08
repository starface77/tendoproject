const crypto = require('crypto');
const IdempotencyKey = require('../models/IdempotencyKey');

/**
 * 🧱 Idempotency middleware
 * Предотвращает повторную обработку одного и того же запроса
 */
const buildRequestHash = (req) => {
  const payload = {
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id || req.user?._id?.toString(),
    body: req.body
  };

  const str = JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex');
};

const idempotencyMiddleware = (action = 'generic') => {
  return async (req, res, next) => {
    try {
      // Ключ из заголовка или хэш запроса как запасной вариант
      const providedKey = req.get('Idempotency-Key');
      const computedHash = buildRequestHash(req);
      const effectiveKey = providedKey || `${action}:${computedHash}`;

      // Пытаемся найти существующую запись
      const existing = await IdempotencyKey.findOne({ key: effectiveKey });

      if (existing) {
        if (existing.status === 'completed') {
          // Возвращаем ранее сохранённый ответ
          return res.status(existing.responseStatus || 200).json(existing.responseBody);
        }

        // Запрос уже обрабатывается
        return res.status(409).json({
          success: false,
          error: 'Запрос уже обрабатывается',
          code: 'IDEMPOTENT_IN_PROGRESS'
        });
      }

      // Создаём запись «в обработке»
      const keyDoc = await IdempotencyKey.create({
        key: effectiveKey,
        user: req.user?.id || req.user?._id,
        method: req.method,
        path: req.originalUrl,
        action,
        requestHash: computedHash,
        status: 'in_progress'
      });

      // Пробрасываем в контроллер
      req.idempotencyKeyDoc = keyDoc;

      // Хук на завершение ответа (на случай раннего return в контроллере)
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          if (req.idempotencyKeyDoc) {
            await IdempotencyKey.findByIdAndUpdate(req.idempotencyKeyDoc._id, {
              status: 'completed',
              responseStatus: res.statusCode,
              responseBody: body,
              updatedAt: new Date()
            });
          }
        } catch (e) {
          // Логируем, но не мешаем ответу
          console.error('Idempotency save error:', e.message);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Idempotency middleware error:', error.message);
      return res.status(500).json({ success: false, error: 'Idempotency error' });
    }
  };
};

module.exports = { idempotencyMiddleware };


