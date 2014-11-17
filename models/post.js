//文章模块
var mongoose = require('./db');
var pinyin = require('pinyin');
var markdown = require("markdown").markdown;

var postsSchema = mongoose.Schema({
    title: String,
    pinyin:String,
    time:{date:Date,minute:String},
    edittime:{date:Date,minute:String},
    post:String,
    firstimg:String,
    author:String,
    draft:String,
    tags:Array,
    archiveTime:String,
    comments:Array,
    pv:Number
})

var aboutSchema = mongoose.Schema({
    title:String,
    pinyin:String,
    edittime:{date:Date,minute:String},
    post:String
})

var postsModel = mongoose.model('Post', postsSchema);
var aboutModel = mongoose.model('About', aboutSchema);

function Post(obj) {
  this.title = obj.title;
  this.post = obj.post;
  this.author = obj.username;
  this.draft = obj.draft;
  this.tags = obj.tags
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback){
    var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
	  date: date,
	  // year : date.getFullYear(),
	  // month : date.getFullYear() + "-" + (date.getMonth() + 1),
	  // day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
	  minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
	  date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
	}
	//要存入数据库的文档
	var post = {
	  title: this.title,
	  pinyin: pinyin(this.title,{style: pinyin.STYLE_NORMAL}).join("-"),
	  time: time,
      edittime:time,
	  draft:this.draft,
	  tags:this.tags,
	  author: this.author,
	  archiveTime:date.toGMTString().split(" ")[2]+" "+date.getFullYear(),
	  post: this.post,
      firstimg:markdown.toHTML(this.post).match(/(src="[^"]*)"/g),
      pv:0
	};

    var apost = new postsModel(post);
    postsModel.findOne({pinyin:post.pinyin},function(err,post){
        if (err){
            return callback(err);
        }
        if(post){
            return callback('标题重复！');
        }else{
            apost.save(function(err){
               if(err){
                   return callback('保存失败！');
               }
               callback(null);
            });
        }
    })
};

//根据条件获取文章数据
/*
query{
	pinyin:标题拼音
}
page:开始查询的位置
limit：每页显示的数量
*/
Post.get = function(query,page,limit,callback){

    postsModel.count(query,function(err, total){
        if(err){
            return callback(err);
        }

        //skip,limit用来分页查询
        if(!page){
            page = 1;
        }
        if(!limit){
            limit = 5;
        }
        //查找用户via query
        page--;
        postsModel.find(query).skip(page*limit).limit(limit).sort({time:'desc'}).find(function(err, posts){
            if(err){
                return callback(err);
            }
            //获得文章第一张图片
//            posts.forEach(function (post) {
//                post.firstimg = markdown.toHTML(post.post).match(/(src="[^"]*)"/g);
//            });
            callback(null,posts,total);
        });
    });
};

//根据条件修改文章pv
/*
 query{
 pinyin:标题拼音
 }
*/
Post.count = function(query,callback){

    postsModel.where(query).update({ $inc: { "pv": 1 }}, function(err){
        if(err){
            console.log(err);
            return callback(err);
        }
        callback(null);
    });
};


//根据id删除文章
Post.del = function(id,callback){
    var _id = new require('mongodb').ObjectID(id);
    postsModel.remove({_id:_id},function(err){
        if(err){
            return callback(err);
        }
        callback(null);
    });
};

//根据id编辑文章
Post.prototype.edit = function(id,callback){
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
	  date: date,
	  // year : date.getFullYear(),
	  // month : date.getFullYear() + "-" + (date.getMonth() + 1),
	  // day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
	  minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
	  date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	//要存入数据库的文档
	var post = {
	  title: this.title,
	  pinyin: pinyin(this.title,{style: pinyin.STYLE_NORMAL}).join("-"),
	  edittime: time,
	  draft:this.draft,
	  tags:this.tags,
	  author: this.author,
	  post: this.post,
      firstimg:markdown.toHTML(this.post).match(/(src="[^"]*)"/g)
	};
    var _id = new require('mongodb').ObjectID(id);

    postsModel.findOneAndUpdate({_id:_id},post,null,function(err){
        if(err){
            return callback(err);
        }
        callback(null);
    });
};

//查询文章属性数组，property：archiveTime（文章归档），tags（标签）
Post.getProperty = function(property ,callback){
    postsModel.distinct(property, function(err,propertyArr ){
        if (err) {
            return callback(err);
        }
        callback(null,propertyArr.sort());//返回为数组形式
    });
};

//获取关于页面文章
Post.getAbout = function(callback){
    aboutModel.findOne(function(err, about){
        if (err) {
            return callback(err);//失败！返回 err
        }
        callback(null, about);//成功！返回关于文章
    })
}

//根据id编辑关于页面
Post.prototype.editAbout = function(id,callback){
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        // year : date.getFullYear(),
        // month : date.getFullYear() + "-" + (date.getMonth() + 1),
        // day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var about = {
        title: this.title,
        pinyin: pinyin(this.title,{style: pinyin.STYLE_NORMAL}).join("-"),
        edittime: time,
        post: this.post
    };
    var _id = new require('mongodb').ObjectID(id);

    aboutModel.findOneAndUpdate({_id:_id},about,{upsert:true},function(err){
        if(err){
            return callback(err);
        }
        callback(null);
    })
};
