const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env;
const { RETOKEN_SECRET } = process.env;
const RefreshToken = require("../../../models/RefreshToken");

const generateToekn = async (user, res) => {
  const accessToken = await jwt.sign(
    { id: user._id, username: user.username },
    TOKEN_SECRET,
    {
      expiresIn: "1hr",
    }
  );
  const refreshToken = await jwt.sign(
    { id: user._id, username: user.username },
    RETOKEN_SECRET,
    {
      expiresIn: "6d",
    }
  );
  const saveReToken = new RefreshToken({ token: refreshToken });
  await saveReToken.save();

  res.cookie("token", accessToken, {
    // expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https

    httpOnly: true,
  });
  res.cookie("refreshToken", refreshToken, {
    secure: false, // set to true if your using https

    httpOnly: true,
  });
  return { accessToken, refreshToken };
};

module.exports = generateToekn;
