const mongoose = require("mongoose");
const schema = mongoose.Schema;

const RefreshTokenSchema = new schema({
    token: String
});

module.exports = mongoose.model("refreshTokens", RefreshTokenSchema);
