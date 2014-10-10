
/*
 * GET about page.
 */
var Post = require('../models/post.js');
var markdown = require("markdown").markdown;
var init = require('../init');
    
module.exports = function(app,url) {
    //去掉url前斜杠
    var active = url.replace(/\//g,'');
  	//关于页面
  	app.get('/about',function(req,res){
        init(function(settings) {
            Post.getAbout(function (err, about) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/err');
                }
                //解析 markdown 为 html
                if (about) {
                    about.post = markdown.toHTML(about.post);
                }
                res.render('about', {
                    title: '关于',
                    active: active,
                    about: about,
                    user: req.session.user,
                    settings:settings
                })
            });
        });
  	});

    //编辑关于页面
    app.get(url+'/edit', checkLogin);
    app.get(url+'/edit',function(req,res){
        init(function (settings) {
            Post.getAbout(function (err, about) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/err');
                }

                res.render('edit_about', {
                    title: '编辑关于页面',
                    about: about,
                    active: active,
                    settings:settings
                });
            });
        });
    });

    //关于页面保存
    app.post(url+'/edit', checkLogin);
    app.post(url+'/edit',function(req,res){
        var obj = req.body;
        obj.isabout = "1";
        var post = new Post(obj);
        post.editAbout(req.body.id,function(err){
            if (err) {
                req.flash('error', err);
                return res.redirect('/err');
            }
            res.redirect('/dashboard');//发表成功跳转到主页
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
};