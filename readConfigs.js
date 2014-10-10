//读取configs.json中的数据库设置

var fs = require('fs');

function Getdb(){
    var data=fs.readFileSync('configs.json','utf-8');
    data = JSON.parse(data);
    this.db = data.db;
    this.host =data.host;
    this.cookieSecret =data.cookieSecret;
}

module.exports = Getdb;

