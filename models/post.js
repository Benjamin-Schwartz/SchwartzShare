const mongoose = require('mongoose');
const Comment = require('./comment');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: String,
    images: [
        {
         url: String,  
         filename: String
        }
    ],
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]

});

PostSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Post', PostSchema);