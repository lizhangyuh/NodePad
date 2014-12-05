
/**
 * Module dependencies.
 */

var express = require('express');
var methodOverride = require('method-override');
var configs = require('./configs.json');

//引用路由文件
var index = require('./routes');
var dashboard = require('./routes/dashboard');
var blog = require('./routes/blog');
var about = require('./routes/about');

var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'public/themes'));
app.set('view engine', 'ejs');
app.use(flash());
//app.use(express.favicon());
app.use(express.favicon(path.join(__dirname,'/public/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(methodOverride());
if (configs.db && configs.cookieSecret){
    app.use(express.cookieParser());
    app.use(express.session({
        secret: configs.cookieSecret,
        key:configs.db,//cookie name
        cookie: {maxAge: 1000 * 60 * 60 * 24 * 3},//3 days
        store: new MongoStore({
            db:configs.db,
            host:configs.host
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
index(app, '/');
dashboard(app, '/dashboard');
blog(app, '/blog');
about(app, '/about');

http.createServer(app).listen(app.get('port'), function(){
    console.log('NodePad启动成功！端口:'+app.get('port'));
});
