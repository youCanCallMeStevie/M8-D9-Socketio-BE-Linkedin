const Joi = require("joi");
const schemas = {
  userSchema: Joi.object().keys({
    name: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    bio: Joi.string(),
    title: Joi.string().min(6).required(),
    area: Joi.string().required(),
  }),
  loginSchema: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),
  commentSchema: Joi.object().keys({
    _id: Joi.string(),
    text: Joi.string().required(),
    userId: Joi.string(),
    postId: Joi.string().required(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
  experienceSchema: Joi.object().keys({
    _id: Joi.string(),
    role: Joi.string().required(),
    company: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date(),
    area: Joi.string().required(),
    image: Joi.string(),
    userId: Joi.string(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
  educationSchema: Joi.object().keys({
    _id: Joi.string(),
    school: Joi.string().required(),
    degree: Joi.string().required(),
    fieldOfStudy: Joi.string().required(),
    startYear: Joi.number().required(),
    endYear: Joi.number().required(),
    activtiesSocieties: Joi.string(),
    description: Joi.string().required(),
    image: Joi.string(),
    userId: Joi.string(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
  PostSchema: Joi.object().keys({
    _id: Joi.string(),
text: Joi.string().required(),
    image:Joi.string(),
    comments:Joi.string(),
    userId: Joi.string(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),

  }),
  skillSchema: Joi.object().keys({
    _id: Joi.string(),
    text: Joi.string().required(),
    userId: Joi.string(),
  }),
};

module.exports = schemas;
