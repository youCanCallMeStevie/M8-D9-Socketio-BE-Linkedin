const express = require("express");
const router = express.Router();
const ApiError = require("../../classes/apiError");
const CommentsModel = require("../../models/Comment.js");
const commentParser = require("../../lib/utils/cloudinary/comments");
const q2m = require("query-to-mongo");
const mongoose = require("mongoose");
const auth = require("../../lib/utils/privateRoutes");
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");

// /comments/:
// post new comment
router.post(
  "/",
  auth,
  validationMiddleware(schemas.commentSchema),
  async (req, res, next) => {
    try {
      const user = req.user;
      const newComment = new CommentsModel(req.body);
      newComment.userId = user.id;
      const { _id } = await newComment.save();
      res.status(201).send({ id: _id });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// /comments/:pid
// retrieve all comments
router.get("/:postId", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await CommentsModel.countDocuments(query.criteria);
    const comment = await CommentsModel.find(
      query.criteria && { postId: req.params.postId },
      query.options.fields
    )
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit);
    res.send({ links: query.links("/comments", total), comment });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// /comments/:id
// retrieve that specific comment
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const comment = await CommentsModel.findById(id);
    if (comment) {
      res.send(comment);
    } else {
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// /comments/:id
// update that specific comment
router.put(
  "/:id",
  auth,
  validationMiddleware(schemas.commentSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const commentToEdit = await CommentsModel.findById(id);

    try {
      if (commentToEdit.userId != user.id)
        throw new ApiError(403, `Only the owner of this profile can edit`);
      const updatedExpereince = await CommentsModel.findByIdAndUpdate(
        id,
        req.body,
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(201).json({ data: `Comment with ID ${id} edited` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//   try {
//     const user = req.user.id;
//     const commentToUpdate = await CommentsModel.findById(req.params.id);
//     if (commentToUpdate.user[0] == user) {
//       try {
//         const comment = await CommentsModel.findByIdAndUpdate(
//           req.params.id,
//           req.body,
//           {
//             runValidators: true,
//             new: true,
//           }
//         );
//         console.log("COMMENT:::::", comment.user[0]);
//         if (comment) {
//           res.send(comment);
//         } else {
//           const error = new Error(`comment with id ${req.params.id} not found`);
//           error.httpStatusCode = 404;
//           next(error);
//         }
//       } catch (error) {
//         next(error);
//       }
//     } else {
//       const error = new Error(
//         "only the author of the comment can update his/her comment"
//       );
//       error.httpStatusCode = 403;
//       next(error);
//     }
//   } catch (error) {
//     console.log(error);
//     next(error)
//   }
// });

// /comments/:id
// delete that specific comment
router.delete("/:id/", auth, async (req, res, next) => {
  try {
    const user = req.user;
    const commmentToDelete = await CommentsModel.findById(req.params.id);
    if (commmentToDelete.userId == user.id) {
      try {
        const comment = await CommentsModel.findByIdAndDelete(req.params.id);
        if (comment) {
          res.send(req.params.id);
        } else {
          const error = new Error(`comment with id ${req.params.id} not found`);
          error.httpStatusCode = 404;
          next(error);
        }
      } catch (error) {
        const er = new Error(`Something went wrong`);
        er.httpStatusCode = 400;
        next(er);
      }
    } else {
      const er = new Error(
        `only the author of the comment or the author can delete the comment`
      );
      er.httpStatusCode = 403;
      next(er);
    }
  } catch (error) {
    const e = new Error(
      `only the author of the comment or the author can delete the comment`
    );
    e.httpStatusCode = 403;
    next(e);
  }
});

// /comments/:id/upload
// comment with image
router.post(
  "/:id/upload",
  commentParser.single("image"),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const image = req.file && req.file.path;
      const updateComment = await CommentsModel.findByIdAndUpdate(
        id,
        {
          $set: { image },
        },
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(201).json({ data: `Photo added to comment with ID ${id}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// /comments/:id/replies GET
// retrieve all replies
router.get("/:id/replies", async (req, res, next) => {
  try {
    const { replies } = await CommentsModel.findById(req.params.id);
    res.status(200).send(replies);
  } catch (error) {
    const err = new Error("Something went wrong with GET.");
    err.httpStatusCode = 400;
    next(err);
  }
});

// /comments/:id/replies POST
// post reply
router.post(
  "/:id/replies",
  auth,
  validationMiddleware(schemas.commentSchema),
  async (req, res, next) => {
    try {
      const replyAuthorId = req.user;
      const replyText = req.body.text;

      const replyToInsert = {
        text: replyText,
        userId: replyAuthorId.id,
      };

      console.log("REPLY TO INSERT:::::::", replyToInsert);
      if (replyAuthorId.id) {
        const updatedComment = await CommentsModel.findByIdAndUpdate(
          req.params.id,
          {
            $push: {
              replies: replyToInsert,
            },
          },
          {
            runValidators: true,
            new: true,
          }
        );
        res.status(201).send(updatedComment);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//   /comments/:cid/replies/:rid
// update reply
router.put(
  "/:cid/replies/:rid",
  auth,
  validationMiddleware(schemas.commentSchema),
  async (req, res, next) => {
    try {
      const user = req.user.id;
      const { replies } = await CommentsModel.findById(req.params.cid, {
        _id: 0,
        replies: {
          $elemMatch: {
            _id: req.params.rid,
          },
        },
      });

      console.log("reply user id:::::::::::", replies[0].user[0]);

      if (replies && replies.length > 0 && user == replies[0].user[0]) {
        const replyToUpdate = { ...replies[0].toObject(), ...req.body };
        console.log("reply to update:::::::", replyToUpdate);
        try {
          const modifiedReply = await CommentsModel.findOneAndUpdate(
            {
              _id: mongoose.Types.ObjectId(req.params.cid),
              "replies._id": mongoose.Types.ObjectId(req.params.rid),
            },
            { $set: { "replies.$": replyToUpdate } },
            {
              runValidators: true,
              new: true,
            }
          );
        } catch (e) {
          console.log(e);
        }
        res.status(200).send("reply modified successfully!");
      } else {
        const error = new Error(
          "Couldnt update reply with id=",
          req.params.rid
        );
        next(error);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// /comments/:cid/replies/:rid
// delete reply
router.delete("/:cid/replies/:rid", auth, async (req, res, next) => {
  try {
    const user = req.user;
    const { replies } = await CommentsModel.findById(req.params.cid, {
      _id: 0,
      replies: {
        $elemMatch: {
          _id: req.params.rid,
        },
      },
    });
    console.log("REPLIES::::::::::::", replies);

    if (replies[0].userId == user.id) {
      try {
        const modifiedReply = await CommentsModel.findByIdAndUpdate(
          req.params.cid,
          {
            $pull: {
              replies: { _id: req.params.rid },
            },
          }
        );
        res.status(200).send(modifiedReply);
      } catch (error) {
        const err = new Error("Couldnt delete reply!");
        next(err);
      }
    } else {
      const err = new Error(
        "Only the author of the reply can delete the reply!"
      );
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// /comments/:cid/replies/:rid/upload
// upload img as a reply
router.post(
  "/:cid/replies/:rid/upload",
  commentParser.single("image"),
  async (req, res, next) => {
    try {
      const { replies } = await CommentsModel.findById(req.params.cid, {
        _id: 0,
        replies: {
          $elemMatch: {
            _id: req.params.rid,
          },
        },
      });

      console.log("reply user id:::::::::::", replies);

      try {
        const img = req.file && req.file.path;
        const replyToUpdate = { ...replies[0].toObject(), img };
        console.log("reply to update:::::::", replyToUpdate);
        const modifiedReply = await CommentsModel.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.params.cid),
            "replies._id": mongoose.Types.ObjectId(req.params.rid),
          },
          { $set: { "replies.$": replyToUpdate } }
        );
      } catch (e) {
        console.log(e);
      }
      res.status(200).send("reply modified successfully!");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = router;
