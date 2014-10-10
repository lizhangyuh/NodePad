//文章模块
//var mongodb = require('./db');
var configs = require('../readConfigs.js'),
    Db = require('mongodb').Db,
    connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
var pinyin = require("pinyin");

function Post(obj) {
  this.title = obj.title;
  this.post = obj.post;
  this.author = obj.username;
  this.draft = obj.draft;
  this.tags = obj.tags;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
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
	  pinyin: pinyin(this.title).join("-"),
	  time: time,
	  draft:this.draft,
	  tags:this.tags,
	  author: this.author,
	  archiveTime:date.toGMTString().split(" ")[2]+" "+date.getFullYear(),
	  post: this.post
	};

	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}
		//读取posts
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查询是否标题重复
			collection.count({pinyin:post.pinyin},function(err,total){
				if (err) {
					mongodb.close();
					return callback(err);
				};
				if (total > 0) {
					mongodb.close();
					return callback('标题重复！');
				};
				//插入数据
				collection.insert(post,{safe:true},function(err){
					mongodb.close();
					if(err){
						return callback(err);
					}
					callback(null);//成功返回null
				});
			});
		});
	});
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
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}

		//读取posts
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.count(query,function(err,total){
				if (err) {
					mongo.close();
					return callback(err);
				};
				//skip,limit用来分页查询
				if(!page){
					page = 1;
				}
				if(!limit){
					limit = 5;
				}
				//查找用户via query
				page--;
				collection.find(query,{skip:(page*limit),limit:limit}).sort({time:-1}).toArray(function(err,docs){
					mongodb.close();
			        if (err) {
			          return callback(err);//失败！返回 err
			        }
			        callback(null, docs, total);//成功！以数组形式返回查询的结果
				});
			});
		});
	});
};

//根据id删除文章
Post.del = function(id,callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}
		var _id = new require('mongodb').ObjectID(id);
		//读取posts
		db.collection('posts',function(err,collection){
			collection.remove({_id:_id},{fsync:true},function(err){
				mongodb.close();
				if(err){
					callback('删除失败！');
				}else{
					 callback(null);
				}
			});
		});
	});
};

//根据id编辑文章
Post.prototype.edit = function(id,callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
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
	  pinyin: pinyin(this.title).join("-"),
	  edittime: time,
	  draft:this.draft,
	  tags:this.tags,
	  author: this.author,
	  post: this.post
	};
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}
		var _id = new require('mongodb').ObjectID(id);
		//读取 posts 集合
	    db.collection('posts', function (err, collection) {
	      if (err) {
	        mongodb.close();
	        return callback(err);
	       }
	      //更新文章内容
	      collection.update({_id:_id}, {$set: post}, function (err) {
	        mongodb.close();
	        if (err) {
	          return callback(err);
	        }
	        callback(null);
	      });
	    });
	});
};

//查询文章属性数组，property：archiveTime（文章归档），tags（标签）
Post.getProperty = function(property ,callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		} 
		//读取 posts 集合
		db.collection('posts', function (err, collection){
			if (err){
				mongodb.close();
				return callback(err);
			}
			//获取属性数组
			collection.distinct(property,function(err,propertyArr){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null,propertyArr.sort());//返回为数组形式
			});
		});
	});
};

//根据条件获取关于页面文章
Post.getAbout = function(callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);//返回错误信息
        }

        //读取about
        db.collection('about',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne(function(err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null, docs);//成功！返回关于文章
            });
        });
    });
}

//根据id编辑关于页面
Post.prototype.editAbout = function(id,callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
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
        pinyin: pinyin(this.title).join("-"),
        edittime: time,
        post: this.post
    };
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);//返回错误信息
        }
        var _id = new require('mongodb').ObjectID(id);
        //读取 about 集合
        db.collection('about', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新关于内容
            collection.update({_id:_id}, {$set: about},{upsert:true}, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
