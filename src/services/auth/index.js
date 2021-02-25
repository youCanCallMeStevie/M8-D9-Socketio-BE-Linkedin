const express = require('express')
const authRoutes = express.Router()
const User = require("../../models/User");
const generateToken = require("../../lib/utils/auth/generateToken");
const refreshToken = require("../../lib/utils/auth/refreshToken");
const logout = require("../../lib/utils/auth/logout");
const validation = require("../../lib/validation/validationMiddleware");
const valSchema = require("../../lib/validation/validationSchema");




//POST  / api/auth/login;
//LOGIN
authRoutes.post(
  "/login",
  validation(valSchema.loginSchema),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return next(Error("It was not possible to login "));

      const validPass = await user.comparePass(password);
      if (validPass) {
        const { accessToken, refreshToken } = await generateToken(user, res);
        res.send({
          accessToken,
          refreshToken,
          expiresIn: Date.now() + 3600000,
        });
      } else next(new Error("Username or password is wrong"));
    } catch (err) {
      console.log(err);
      const error = new Error("It was not possible to login ");
      error.code = "400";
      next(error);
    }
  }
);

//POST / / api /auth/renewToken;
//RENEW TOKEN
authRoutes.post("/renewToken", refreshToken, async (req, res, next) => {
  try {
    res.status(200).json(" credential renewed");
  } catch (err) {
    console.log(err);
    const error = new Error("Unauthorized");
    error.code = "404";
    next(error);
  }
});

//POST / / api / auth / logout;
//LOGOUT
authRoutes.post("/logout", logout, async (req, res, next) => {
  try {
    res.status(200).send("logged out");
  } catch (err) {
    console.log(err);
    const error = new Error("Unauthorized ");
    error.code = "404";
    next(error);
  }
});

module.exports = authRoutes