//用户登录
var mongoose = require('./db');

var usersSchema = mongoose.Schema({
    name: String,
    username:String,
    pwd:String,
    weibo:String,
    email:String
})
var usersModel = mongoose.model('User', usersSchema);

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
	//要存入的用户文档
	var user = {
		name:this.name,
		username:this.username,
		pwd:this.pwd,
		weibo:this.weibo,
		email:this.email
	};
	var newUser = usersModel(user);
	newUser.save(function(err, user){
        if(err){
            return callback(err);
        }
        callback(null,user);
    })
};

//获取用户数据
User.get = function(query,callback){
    usersModel.findOne(query, function (err, user) {
        if (err) {
            return callback(err);
        }
			callback(null,user);//成功，返回数据
	});
};

//修改用户数据
User.prototype.edit = function(username,type,callback){
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
    usersModel.findOneAndUpdate({username:username},user,null,function(err){
        if(err){
            return callback(err);
        }
            callback(null);
    })
};