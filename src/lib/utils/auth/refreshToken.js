const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env;
const { RETOKEN_SECRET } = process.env;
const RefreshToken = require("../../../models/RefreshToken");

const refreshToken = async (req,res,next) => {
  try {
    const { refreshToken } = req.cookies;
    const token = await RefreshToken.findOne({ token: refreshToken });
    if (!refreshToken || !token) return next(new Error("Unauthorized"));
    const user = await jwt.verify(refreshToken, RETOKEN_SECRET);
    const payload = { id: user.id, username: user.username };
    const accessToken = await jwt.sign(payload, TOKEN_SECRET, {
      expiresIn: "1hr",
    });
    res.cookie("token", accessToken, {
      // expires: new Date(Date.now() + expiration),
      secure: false, // set to true if your using https
      httpOnly: true,
    });
    next()
  } catch (err) {
    console.log(err);
    const error = new Error("Unauthorized ");
    error.code = "404";
    next(error);
  }
};

module.exports = refreshToken;
