const { validationResult } = require('express-validator');

/**
 * Middleware for handling express-validator validation results
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: errorMessages
    });
  }
  
  next();
};

module.exports = validate;