const { Schema, model } = require("mongoose");
const mongoose_csv = require("mongoose-csv");

const ExperienceSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    required: false,
  }
);
ExperienceSchema.plugin(mongoose_csv);

// ExperienceSchema.static("findExperiencesWithUser", async function (id) {
//   const book = await ExperienceModel.findById(id).populate("users");
//   return book;
// });

const ExperienceModel = model("Experience", ExperienceSchema);
module.exports = ExperienceModel;
