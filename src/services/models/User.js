const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const mongoose_csv = require("mongoose-csv");
const AvatarGenerator = require("named-avatar-generator");
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      // select: false,
    },
    email: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    liked:[],
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skills" }],
    experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Experience" }],
    education: [{ type: mongoose.Schema.Types.ObjectId, ref: "Education" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    const error = new Error("Password not valid");
    next(error);
  }
});



UserSchema.methods.comparePass = async function (pass) {
  try {
    console.log(UserModel.password);
    console.log(UserModel.password);

    const isValid = await bcrypt.compare(pass, this.password);
    console.log(isValid);
    return isValid;
  } catch (err) {
    console.log(err);
    return false;
  }
};

UserSchema.plugin(mongoose_csv);

// UserSchema.pre("findByIdAndUpdate", function () {
//   this.setOptions({ new: true });
// });
const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
