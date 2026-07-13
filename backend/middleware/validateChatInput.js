const validateChatInput = (req, res, next) => {
  const { message } = req.body;

  if (message === undefined || message === null) {
    return res.status(400).json({
      success: false,
      message: 'Message field is required.'
    });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Message must be a text string.'
    });
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot be empty.'
    });
  }

  if (trimmedMessage.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot exceed 500 characters to prevent API overload.'
    });
  }

  // Pass sanitized string to next middleware/handler
  req.body.message = trimmedMessage;
  next();
};

module.exports = validateChatInput;
