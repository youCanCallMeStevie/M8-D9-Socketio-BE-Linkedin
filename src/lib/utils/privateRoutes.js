const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  //I check if the header contains a token
  let token = req.cookies.token;

  //if there is no token, I deny the access
  if (!token) {
    const error = new Error("Access Denied");
    error.code = 401;
    next(error);
  } else {
    try {
      //I grab the info from the toekn and i put them in a request which will be sent to the route handler
      const verifiedUser = await jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = verifiedUser;
      next();
    } catch (err) {
      console.log(err);
      const error = new Error("Invalid Token");
      error.code = 400;
      next(error);
    }
  }
};
module.exports = auth;
