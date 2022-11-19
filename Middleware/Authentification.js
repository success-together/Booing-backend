const jwt = require("jsonwebtoken");

const Authentification = (req, res, next) => {
  try {
    // check ac token
    const token = req.header("token");
    if (!token) return res.status(401).json({ msg: "Authentification failed! No Token found.", success: false });

    // validate
    jwt.verify(token, process.env.SIGNIN_TOKEN, (err, user) => {
      if (err) return res.status(401).json({ msg: "Authentification failed! Invalid Token." });
      // success
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(401).json({ msg: err.message, success: false });
  }
};

module.exports = Authentification;