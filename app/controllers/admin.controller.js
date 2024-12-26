const bcrypt = require("bcrypt");

const admins = [
  {
    id: 1,
    email: "admin@email.com",
    password: "$2b$10$msHXRzflRpjXWrfabOVWyev6vsW8MTZWv6qmh2s8wLbNibuc9eCSO", // Hashed password
  },
];

exports.login = (req, res) => {
  const { email, password } = req.body;
  const admin = admins.find((a) => a.email === email);
  if (!admin) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  bcrypt.compare(password, admin.password, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!result) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    req.session.admin = { id: admin.id, email: admin.email };
    return res.status(200).json({ message: "Admin login successful!", admin: req.session.admin });
  });
};

exports.checkLogin = (req, res) => {
  const admin = req.session.admin || null;
  if (admin) {
    return res.status(200).json({ isLoggedIn: true, admin });
  } else {
    return res.status(401).json({ isLoggedIn: false });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  return res.status(200).json({ message: "Admin logged out successfully" });
};