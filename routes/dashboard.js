
/*
 * GET dashboard.
 */
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Settings = require('../models/settings.js');
var init = require('../init');
var crypto = require('crypto');
var fs = require('fs');

module.exports = function(app,url) {
	//后台文章列表页面
	app.get(url, checkLogin);
	app.get(url,function(req,res){
		var limit = 10;
        init(function (settings) {
            Post.get(null, 1, limit, function (err, posts, total) {
                if (err) {
                    posts = [];
                } else {
                    res.render('dashboard/dashboard', {
                        title: '文章列表',
                        posts: posts,
                        active: 'blog',
                        page: 1,
                        total: Math.ceil(total / limit),
                        isFirst: true,
                        isLast: (1 * limit) >= total,
                        settings:settings
                    });
                }
            });
        });
	});

	//后台文章列表页面（分页）
	app.get(url+"/page/:page?", checkLogin);
	app.get(url+"/page/:page?",function(req,res){
        var limit = 10;
		if(req.params.page==undefined){
		  	var page = 1;
		}else{
			var page = parseInt(req.params.page);
		}
        init(function (settings) {
            Post.get(null, page, limit, function (err, posts, total) {
                if (err) {
                    posts = [];
                } else {
                    res.render('dashboard/dashboard', {
                        title: '文章列表',
                        posts: posts, active: 'blog',
                        page: page,
                        total: Math.ceil(total / limit),
                        isFirst: page == 1,
                        isLast: (page * limit) >= total,
                        settings:settings
                    });
                }
            });
        });
	});

	//网站设置
	app.get(url+'/settings', checkLogin);
	app.get(url+'/settings',function(req,res){
        fs.readdir('public/themes',function(err, files){
            if(err){
                req.flash('error', err);
                return res.redirect('/err');
            }
            var themes = new Array();
            files.forEach(function(file,index){
                if (file.length>4 && file.substr(0,4) == "JLT_" ){
                    themes.push(file);
                    console.log(file);
                }
            })
            init(function(settings){
                res.render('dashboard/settings',{
                    title:'设置',
                    user:req.session.user,
                    settings:settings,
                    themes:themes,
                    active:'settings'
                });
            });
        });
	});

	//保存全局设置
	app.post(url+'/settings/savesettings', checkLogin);
	app.post(url+'/settings/savesettings',function(req,res){
		var settings = new Settings({
			intro:req.body.intro,
			starttime:req.body.starttime,
			limit:req.body.limit,
            blogname:req.body.blogname,
            themes:req.body.themes
		});
		settings.save(function(err){
			if (err) {
				req.flash('error', err); 
        		return res.redirect('/err');
			}
			res.redirect('/dashboard/settings')
		});
	});

	//保存用户设置
	app.post(url+'/settings/saveuser', checkLogin);
	app.post(url+'/settings/saveuser',function(req,res){
		var user = new User({
			name:req.body.name,
			weibo:req.body.weibo,
			email:req.body.email
		});
		user.edit(req.session.user.username,'saveuser',function(err){
			if (err) {
				req.flash('error', err); 
        		return res.redirect('/err');
			}
			req.session.user.name = req.body.name;
			req.session.user.weibo = req.body.weibo;
			req.session.user.email = req.body.email;
			res.redirect('/dashboard/settings')
		});
	});

    //修改用户密码
    app.post(url+'/settings/editpwd', checkLogin);
    app.post(url+'/settings/editpwd',function(req,res){
        //密码加密
        var md5 = crypto.createHash('md5');
        var oldpwd = md5.update(req.body.oldpwd).digest('hex');

        User.get({username:req.body.username}, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/err');
            }

            //验证旧密码
            if(oldpwd != user.pwd){
                req.flash('error', '旧密码错误!');
                return res.redirect('/err');
            }
            //校验重复密码
            if(req.body.newpwd != req.body.repwd){
                req.flash('error', '两次输入的密码不一致!');
                return res.redirect('/err');
            }
            //开始保存密码
            var md5 = crypto.createHash('md5');
            var newpwd = md5.update(req.body.newpwd).digest('hex');
            var user = new User({
                pwd:newpwd
            });
            user.edit(req.session.user.username,'editpwd',function(err){
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/err');
                }

                req.flash('success', '密码修改成功！');
                return res.redirect('/err');
            });
        });
    });

  	//需登录
	function checkLogin(req, res, next) {
		if (!req.session.user) {
		  req.flash('error', '未登录!'); 
		  res.redirect('/err');
		}
		next();
	}
}