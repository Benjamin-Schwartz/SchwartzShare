const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String
});


commentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Comment", commentSchema);