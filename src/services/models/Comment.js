const {Schema} = require("mongoose");
const mongoose = require("mongoose");

const CommentModel = new Schema({
    text: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false
    },
    userId: {
        type: String,
        required: true,
      },
    postId: {
        type: String,
        reqiured: true
    },
    replies: {
        type: [
            {
                text: {
                    type: String,
                    required: true,
                },
                img: {
                    type: String,
                    required: false
                },
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "users",
                    required: true
                },
            },
            { timestamps: true }
        ],
        default: []
    }
}, 
{
    timestamps: true
}
);

//schema exported as a model
module.exports = mongoose.model("Comment", CommentModel);