//加载数据库中的全局设置
var Settings = require('./models/settings.js');

module.exports = function(callback){
	Settings.get(function(err,settings){
		if (err) {
			console.log(err);
		};
		return callback(settings);
	});
}
