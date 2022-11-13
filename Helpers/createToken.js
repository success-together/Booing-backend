const jwt = require("jsonwebtoken");

const createToken = {
  // activation: (payload) => {
  //   return jwt.sign(payload, process.env.ACTIVATION_TOKEN, { expiresIn: "10m" });
  // },
  signinToken : (payload)=> {
    return jwt.sign(payload, process.env.SIGNIN_TOKEN, { expiresIn: "24h"});
  },
  // refresh : (payload) => {
  //   return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "24h"});
  // },
  // access: (payload) => {
  //   return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
  // },
};

module.exports = createToken;