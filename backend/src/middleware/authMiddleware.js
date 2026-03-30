const jwt = require("jsonwebtoken");

const SECRET = "segredo_super";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id || decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};