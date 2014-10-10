
/**
 * Module dependencies.
 */

var express = require('express');
var configs = require('./readConfigs');

configs = new configs();

//引用路由文件
var index = require('./routes');
var dashboard = require('./routes/dashboard');
var blog = require('./routes/blog');
var about = require('./routes/about');
var install = require('./routes/install');


var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
if (configs.db && configs.cookieSecret){
    app.use(express.cookieParser());
    app.use(express.session({
        secret: configs.cookieSecret,
        key:configs.db,//cookie name
        cookie: {maxAge: 1000 * 60 * 60 * 24 * 3},//3 days
        store: new MongoStore({
            db:configs.db
        })
    }));
}
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//绑定路由
index(app,express, '/');
install(app, '/install');
dashboard(app, '/dashboard');
blog(app, '/blog');
about(app, '/about');

http.createServer(app).listen(app.get('port'), function(){
    console.log('================================');
    if (configs.db && configs.host && configs.cookieSecret){
        console.log('jlBox已启动！');
        console.log('博客地址：你的域名:'+app.get('port')+'。');
    }else{
        console.log('欢迎使用jlBox！');
        console.log('请访问：你的域名:'+app.get('port')+' 完成安装。');
    }
    console.log('================================');
});
