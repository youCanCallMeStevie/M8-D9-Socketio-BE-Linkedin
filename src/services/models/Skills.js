const {Schema, model } = require("mongoose");

const SkillSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
});

const SkillModel = model("Skills", SkillSchema);
module.exports = SkillModel;