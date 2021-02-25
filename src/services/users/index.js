const express = require("express");
const userRoutes = express.Router();
const User = require("../../models/User");
const sendEmail = require("../../lib/utils/email");
const userParser = require("../../lib/utils/cloudinary/users");
const expRoutes = require("../experiences/index");
const edRoutes = require("../education/index");
const skillRoutes = require("../skills/index");
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env;
const { RETOKEN_SECRET } = process.env;
const puppeteer = require("puppeteer")
const fs = require("fs-extra")
const path = require("path")
const moment= require("moment")
const hbs = require("hbs")
const homeDir = require('os').homedir();
const desktopDir = `${homeDir}/Desktop`;
console.log(desktopDir);


const auth = require("../../lib/utils/privateRoutes");
const validation = require("../../lib/validation/validationMiddleware");
const valSchema = require("../../lib/validation/validationSchema");

userRoutes.use("/experiences", expRoutes);
userRoutes.use("/education", edRoutes);
userRoutes.use("/skills", skillRoutes);

//GET /api/users
//GET ALL USERS
userRoutes.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).send({ users });
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

// GET /api/users/:id 
// GET USER BY ID
userRoutes.get("/user/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      res.send(user);
    } else {
      next(error);
      console.log('something here')
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET /api/users/me
//GET MY PROFILE
userRoutes.get("/me", auth, async (req, res, next) => {
  try {
    const user = req.user;
    const currentUser = await User.findById(user.id)
      .select("-password")
      .populate({ path: "experiences skills education following followers"});
      res.status(200).send({ currentUser });
  } catch (err) {
    const error = new Error("You are not authorized to see this user");
    error.code = "400";
    next(error);
  }
});

//GET //api/users/csv
//GET ALL USERS in a cvs file
userRoutes.get("/download/csv", async (req, res, next) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=users.csv",
    });
    const users = await User.find().select("-password").csv(res);
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

//POST //api/users
//REGISTER A USER

userRoutes.post(
  "/",
  validation(valSchema.userSchema),
  async (req, res, next) => {
    try {
      const newUser = new User(req.body);
      const savedUser = await newUser.save();
      const email = await sendEmail(newUser);
      res.status(200).send({ savedUser });
    } catch (err) {
      if (err.code === 11000)
        return next(new Error(`${Object.keys(err.keyValue)} already exist"`));
      const error = new Error("It was not possible to register a new user");
      error.code = "400";
      next(error);
    }
    p;
  }
);

//POST //api/users/upload
//REGISTER A USER
userRoutes.post(
  "/upload",
  auth,
  userParser.single("image"),
  async (req, res, next) => {
    const { id } = req.user;
    try {
      const image = req.file && req.file.path; // add the single
      const editedUser = await User.findByIdAndUpdate(
        id,
        { $set: { image } },
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(200).send({ editedUser });
    } catch (err) {
      console.log(err);
      const error = new Error("It was not possible to insert the user image");
      error.code = "400";
      next(error);
    }
  }
);

//PUT /api/users/
//EDIT A USER
userRoutes.put("/", auth, async (req, res, next) => {
  const { id } = req.user;
  try {
    const editedUser = await User.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).send({ editedUser });
  } catch (err) {
    console.log(err);
    const error = new Error("It was not possible to register a new user");
    error.code = "400";
    next(error);
  }
});

//PUT /api/users/
//EDIT A USER
// userRoutes.put("/:id", async (req, res, next) => {
//   const { id } = req.params.id;
//   try {
//     const editedUser = await User.findByIdAndUpdate(id, req.body, {
//       runValidators: true,
//       new: true,
//     });
//     res.status(200).send({ editedUser });
//   } catch (err) {
//     console.log(err);
//     const error = new Error("It was not possible to register a new user");
//     error.code = "400";
//     next(error);
//   }
// });

//DELETE /api/users
//DELETE a user
userRoutes.delete("/", auth, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    res.status(200).send({ user });
  } catch (err) {
    const error = new Error("There was a problem deleting this user");
  }
});

//POST /users/follow/:followId
//POST follow a user
userRoutes.post("/follow/:followId", auth, async (req, res, next) => {
  try {
    const { followId } = req.params;
    const userId = req.user.id;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { following: followId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    const follow = await User.findByIdAndUpdate(followId, {
      $addToSet: { followers: userId },
    });
    res.status(201).send({ user });
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

//PUT //api/users/:userId/unfollow/:followId
//UNFOLLOW AN USER
userRoutes.put("/unfollow/:followId", auth, async (req, res, next) => {
  try {
    const { followId } = req.params;
    const userId = req.user.id;

    const following = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { following: followId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    const follower = await User.findByIdAndUpdate(followId, {
      $pull: { followers: userId },
    });
    res.status(201).send({ following });
  } catch (err) {
    const error = new Error("You cannot unfollow this user");
    error.code = "400";
    next(error);
  }
});

//GET //api/users
//GET ALL USERS
userRoutes.get("/:username", async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-password")
        .populate({ path: "experiences skills education following followers"});

    res.status(200).send({ user });
  } catch (err) {
    const error = new Error("There is no user with this id");
  }
});


const compile = async function(templateName,user){
  const filePath = path.join(process.cwd(),"/src/services/users/templates",`${templateName}.hbs`)
  const html = await fs.readFile(filePath,"utf-8")
  return hbs.compile(html)(user)
}

hbs.registerHelper("dateFormat",function(value,format){
  return moment(value).format(format)
})

userRoutes.get("/user/:id/cv", async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).populate({ path: "experiences skills education"}).lean()
    const browser = await puppeteer.launch()
      const page = await browser.newPage()
      const content = await compile("template",user)
      await page.setContent(content)
      await page.emulateMediaFeatures("screen")
      await page.pdf({
        path: path.join(desktopDir, `${user.username}_CV.pdf`),
        format:"A4",
        displayHeaderFooter: true,
        printBackground: true
      })
      await browser.close()
      process.exit
    if (user) {
      res.send("PDF created at "+ desktopDir + `\\${user.username}_CV.pdf`);

      // res.writeHead(200, {
      //   "Content-Type": "application/pdf",
      // "Content-Disposition": `attachment; filename=${user.username}_CV.pdf`,
      // });
    } else {
      next(error);
      console.log(error)
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = userRoutes;
