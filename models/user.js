//用户登录
var configs = require('../readConfigs.js'),
    Db = require('mongodb').Db,
    connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

function User(user){
	this.name = user.name,
	this.username = user.username,
	this.pwd = user.pwd,
	this.weibo = user.weibo,
	this.email = user.email
}

module.exports = User;

//储存用户数据
User.prototype.save = function(callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});

	//要存入的用户文档
	var user = {
		name:this.name,
		username:this.username,
		pwd:this.pwd,
		weibo:this.weibo,
		email:this.email
	};
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}
		//读取users
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//插入数据
			collection.insert(user,{safe:true},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user[0]);//成功返回插入的数据
			});
		});
	});
};

//获取用户数据
User.get = function(query,callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}

		//读取users
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找用户via query
			collection.findOne(query,function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);//成功，返回数据
			});
		});
	});
};

//修改用户数据
User.prototype.edit = function(username,type,callback){
    var mongodb = new Db(new configs().db,new Server(new configs().host,connection.DEFAULT_PORT),{safe:true});
	//要存入的用户文档
	if(type == 'saveuser'){
        var user = {
            name:this.name,
            weibo:this.weibo,
            email:this.email
        };
    }else if(type == 'editpwd'){
        var user = {
            pwd:this.pwd
        };
    }

	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}

		//读取users
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//更新用户信息
			collection.update({username:username}, {$set: user}, function (err) {
		        mongodb.close();
		        if (err) {
		          return callback(err);
		        }
		        callback(null);
	      	});
		});
	});
};