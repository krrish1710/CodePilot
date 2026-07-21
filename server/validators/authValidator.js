const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!isNonEmptyString(email) || !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "A valid email is required" });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Strict string checks here matter for more than just UX: without them,
  // an object like { "$gt": "" } for email/password is truthy and would
  // reach User.findOne({ email }) as a raw Mongo query operator - a
  // classic NoSQL-injection auth bypass.
  if (!isNonEmptyString(email) || typeof password !== "string" || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  next();
};

exports.validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== "string" || !currentPassword) {
    return res
      .status(400)
      .json({ message: "Current and new password are required" });
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  next();
};
