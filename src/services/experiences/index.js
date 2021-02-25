const express = require("express");
const ExperienceModel = require("../../models/experiences");
const ApiError = require("../../classes/apiError");
const experiencesRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const expParser = require("../../lib/utils/cloudinary/experiences");
const UserModel = require("../../models/User");
const auth = require("../../lib/utils/privateRoutes");

experiencesRouter.get("/", async (req, res, next) => {
  try {
    const experiences = await ExperienceModel.find().sort([["startDate", -1]]);
    res.send(experiences);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.get("/:experienceId", async (req, res, next) => {
  const { experienceId } = req.params;
  try {
    const response = await ExperienceModel.findById(experienceId);
    if (!response) {
      throw new ApiError(404, `No experience with ID ${experienceId} found`);
    } else {
      res.status(200).json({ response });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.get("/download/csv", async (req, res, next) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=experience.csv",
    });
    const users = await User.find().select("-password").csv(res);
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

experiencesRouter.post(
  "/",
  auth,
  validationMiddleware(schemas.experienceSchema),
  async (req, res, next) => {
    const user = req.user;
    try {
      const  data = new ExperienceModel(req.body);
       data.userId = user.id;
      const { _id } = await  data.save();
      const userModified = await UserModel.findByIdAndUpdate(user.id, {
        $push: { experiences: _id },
      });
      res.status(201).json({ data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

experiencesRouter.post(
  "/:experienceId/upload",
  auth,
  expParser.single("image"),
  async (req, res, next) => {
    const { experienceId } = req.params;
    const user = req.user;
    try {
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser)
        throw new ApiError(403, `Only the owner of this profile can edit`);
      const image = req.file && req.file.path;
      const data = await ExperienceModel.findByIdAndUpdate(
        experienceId,
        { $set: { image } },
        {
          runValidators: true,
          new: true,
        }
      );
      res
        .status(201)
        .json({ data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

experiencesRouter.put(
  "/:experienceId",
  auth,
  validationMiddleware(schemas.experienceSchema),
  async (req, res, next) => {
    console.log("req.body", req.body)
    console.log("req.params", req.params)

    const { experienceId } = req.params;
    const user = req.user;
    const experienceToEdit = await ExperienceModel.findById(experienceId);

    try {
      if (experienceToEdit.userId != user.id)
        throw new ApiError(403, `Only the owner of this profile can edit`);
      const data = await ExperienceModel.findByIdAndUpdate(
        experienceId,
        req.body,
        {
          runValidators: true,
          new: true,
        }
      );
      res
        .status(201)
        .json({ data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

experiencesRouter.delete("/:experienceId", auth, async (req, res, next) => {
  const { experienceId } = req.params;
  const user = req.user;
  const experienceToDelete = await ExperienceModel.findById(experienceId);
  try {
    if (experienceToDelete.userId != user.id)
      throw new ApiError(403, `Only the owner of this profile can edit`);
    const experience = await ExperienceModel.findByIdAndDelete(experienceId);
    const { userId } = experience;
    if (experience) {
      const userModified = await UserModel.findByIdAndUpdate(userId, {
        $pull: { experiences: experienceId },
      });
      res
        .status(201)
        .json({ experienceToDelete });
    } else {
      throw new ApiError(404, `No experience with ID ${experienceId} found`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = experiencesRouter;
