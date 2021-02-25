const RefreshToken = require("../../../models/RefreshToken");

module.exports = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const token = RefreshToken.findOneAndDelete({ token: refreshToken });
    res.clearCookie("refreshToekn");
    res.clearCookie("token");
    next();
  } catch (err) {
    const error = new Error("It was not possible to logout");
    error.code = 400;
    next(error);
  }
};
