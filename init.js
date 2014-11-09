//加载数据库中的全局设置
var Settings = require('./models/settings.js');
var User = require('./models/user.js');

module.exports = function(callback){
	Settings.get(function(err,settings){
		if (err) {
			console.log(err);
		};
        //获取博主信息
        User.get({}, function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/err');
            }
            return callback(settings,user);
        });
	});
}

//合并对象方法
var extend = function(o,n,override){
    for(var p in n){
        if(n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override)){
            o[p]=n[p];
        }
    }
};
