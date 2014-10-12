//公共设置
var mongodb = require('./db');

function Settings(params) {
  this.blogname = params.blogname;
  this.intro = params.intro;
  this.starttime = params.starttime;
  this.theme = params.themes;
  this.limit = params.limit
}

module.exports = Settings;

//获取全局设置
Settings.get = function(callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}
		//读取settings
		db.collection('settings',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne(function(err, settings){
				mongodb.close();
				if (err) {
					return callback(err);
				};
				callback(null,settings);
			});
		});
	});
};

//保存全局设置
Settings.prototype.save = function(callback){
	var settings = this;
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);//返回错误信息
		}
		//读取settings
		db.collection('settings',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({starttime:settings.starttime},{$set:settings},{upsert:true},function(err, settings){
				mongodb.close();
				if (err) {
					return callback(err);
				};
				callback(null);
			});
		});
	});
};
