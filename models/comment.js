var mongoose = require('./db');

function Comment(obj) {
    this.pinyin = obj.pinyin;
    this.comment = obj.comment
}

var postsSchema = mongoose.Schema({
    pinyin: String,
    comments:[{name:String,content:String,time:String}]
},{collection:'posts'});

var postsModel = mongoose.model('Comment', postsSchema);

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
    var pinyin = this.pinyin;
    var comment = this.comment;
    postsModel.findOne({pinyin:pinyin},function(err, post){
        if(err){
            return callback(err);
        }
        post.comments = post.comments.push(comment);
        postsModel.findOneAndUpdate({pinyin:pinyin},{comments:post.comments},null,function(err){
            if(err){
                console.log(err);
                return callback(err);
            }
                callback(null);
        });
    });
}
