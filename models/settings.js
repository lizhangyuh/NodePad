//公共设置
var mongoose = require('./db');

var settingsSchema = mongoose.Schema({
    blogname:String,
    intro:String,
    starttime:String,
    theme:String,
    limit:Number
})
var settingsModel = mongoose.model('Settings', settingsSchema);

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
	settingsModel.findOne(function(err, settings){
        if (err) {
            return callback(err);
        };
        callback(null,settings);
    })
};

//保存全局设置
Settings.prototype.save = function(callback){
	var newSettings = this;

    settingsModel.findOneAndUpdate({starttime:newSettings.starttime},newSettings,{upsert:true},function(err){
        if (err) {
            console.log(err);
            return callback("保存失败！");
        };
        callback(null);
    });
};
