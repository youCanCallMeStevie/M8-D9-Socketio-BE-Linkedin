const express = require("express");
const EducationModel = require("../../models/Education");
const ApiError = require("../../classes/apiError");
const educationRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const edParser = require("../../lib/utils/cloudinary/education.js");
const UserModel = require("../../models/User");
const auth = require("../../lib/utils/privateRoutes");

educationRouter.get("/", async (req, res, next) => {
  try {
    const studies = await EducationModel.find().sort([["startYear", -1]]);
    res.send(studies);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

educationRouter.get("/:educationId", async (req, res, next) => {
  const { educationId } = req.params;
  try {
    const response = await EducationModel.findById(educationId);
    if (!response) {
      throw new ApiError(404, `No education with ID ${educationId} found`);
    } else {
      res.status(200).json({ response });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

educationRouter.get("/download/csv", async (req, res, next) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=education.csv",
    });
    const studies = await EducationModel.find().csv(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

educationRouter.post(
  "/",
  auth,
  validationMiddleware(schemas.educationSchema),
  async (req, res, next) => {
    const user = req.user;
    try {
      const data = new EducationModel(req.body);
      data.userId = user.id;
      const { _id } = await data.save();
      const userModified = await UserModel.findByIdAndUpdate(user.id, {
        $push: { education: _id },
      });
      res.status(201).json({ data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

educationRouter.post(
  "/:educationId/upload",
  auth,
  edParser.single("image"),
  async (req, res, next) => {
    const { educationId } = req.params;
    const user = req.user;
    try {
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser)
        throw new ApiError(403, `Only the owner of this profile can edit`);
      const image = req.file && req.file.path;
      const data = await EducationModel.findByIdAndUpdate(
        educationId,
        {
          $set: { image },
        },
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

educationRouter.put(
  "/:educationId",
  auth,
  validationMiddleware(schemas.educationSchema),
  async (req, res, next) => {
    const { educationId } = req.params;
    const user = req.user;
    const educationToEdit = await EducationModel.findById(educationId);
    try {
      if (educationToEdit.userId != user.id)
        throw new ApiError(403, `Only the owner of this profile can edit`);
      const data = await EducationModel.findByIdAndUpdate(
        educationId,
        req.body,
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(201).json({ data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

educationRouter.delete("/:educationId", auth, async (req, res, next) => {
  const { educationId } = req.params;
  const user = req.user;
  const educationToDelete = await EducationModel.findById(educationId);
  try {
    if (educationToDelete.userId != user.id)
      throw new ApiError(403, `Only the owner of this profile can edit`);
    const education = await EducationModel.findByIdAndDelete(educationId);
    const { userId } = education;
    if (education) {
      const userModified = await UserModel.findByIdAndUpdate(userId, {
        $pull: { education: educationId },
      });
      res
        .status(201)
        .json({ educationToDelete });
    } else {
      throw new ApiError(404, `No education with ID ${educationId} found`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = educationRouter;
