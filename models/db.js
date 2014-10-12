//数据库连接
var configs = require('../configs.json'),
    Db = require('mongodb').Db,
    connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports = new Db(configs.db,new Server(configs.host,connection.DEFAULT_PORT),{safe:true});
