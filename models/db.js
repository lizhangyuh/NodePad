//数据库连接
var mongoose = require('mongoose');
var configs = require('../configs.json');

module.exports = mongoose.connect('mongodb://'+configs.host+'/'+configs.db);

