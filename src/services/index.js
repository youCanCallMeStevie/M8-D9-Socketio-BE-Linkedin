const router = require("express").Router();
const userRoutes = require("./users");
const commentsRoutes = require("./comments");
const postRoutes = require("./posts")
const authRoutes = require("./auth");


router.use("/users", userRoutes);
router.use("/comments", commentsRoutes);
router.use("/posts", postRoutes)
router.use("/auth", authRoutes);

module.exports = router;
