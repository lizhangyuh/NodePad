/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var init = require('../init');
var configs = require('../configs.json');
var Post = require('../models/post.js');
var markdown = require("markdown").markdown;

module.exports = function (app, url) {
    //去掉url前斜杠
    var active = url.replace(/\//g, '');
    //首页
    app.get(url, function (req, res) {
        //检查是否已经存在用户
        User.get(null, function (err, user) {
            if (!user) {
                return res.redirect('/reg');//返回注册页
            }
            init(function (settings) {
                Post.get({draft: "0"}, 1, settings.limit, function (err, posts, total) {
                    if (err) {
                        posts = [];
                    } else {
                        //过滤markdown格式
                        posts.forEach(function (post) {
                            post.textpost = post.post.replace(/\![^\)]*\)|\s{2,}|\`|\[|\][^\)]*\)|\*|\>/g, '\r\n');
                            post.post = markdown.toHTML(post.post);
                        });

                        res.render(settings.theme + '/index',
                            {
                                title: '主页',
                                active: active,
                                user: req.session.user,
                                posts: posts,
                                settings: settings
                            });
                    }
                });
            });
        });
    });

    //注册页
    app.get('/reg', function (req, res) {
        //检查是否已经存在用户
        User.get(null, function (err, user) {
            if (user) {
                return res.redirect('/login');
            }
            init(function (settings) {
                res.render(settings.theme+'/reg', {title: '注册',settings:settings})
            });
        });
    });

    //执行注册
    app.post('/reg', function (req, res) {
        //检查是否已经存在用户
        User.get(null, function (err, user) {
            if (user) {
                req.flash('error', '用户已存在!');
                return res.redirect('/err');
            }
            var username = req.body.username;
            var password = req.body.password;
            var repassword = req.body.repassword;
            //检验用户两次输入的密码是否一致
            if (repassword != password) {
                req.flash('error', '两次输入的密码不一致!');
                return res.redirect('/err');
            }
            //密码加密
            var md5 = crypto.createHash('md5');
            password = md5.update(password).digest('hex');
            //生成新用户数据
            var newUser = new User({
                username: username,
                name: req.body.name,
                pwd: password,
                email: req.body.email,
                weibo: req.body.weibo
            });
            //新增用户
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/err');//注册失败
                }

                var Post = require('../models/post.js');
                //新建第一篇博文
                var post = new Post({
                    title:'我的第一篇博文',
                    post:'欢迎使用NodePad，这是一个使用Markdown写作的小巧的开源博客框架，支持自定义主题哦~希望你能喜欢！',
                    username:username,
                    draft:'0',
                    tags:'jlBox'
                });
                post.save(function (err) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/err');
                    }
                    res.redirect('/login');//注册成功后跳转登录页面
                });
            });
        });
    });

    //登录页
    app.get('/login', checkNotLogin);
    app.get('/login', function (req, res) {
        //检查是否已经存在用户
        User.get(null, function (err, user) {
            if (!user) {
                return res.redirect('/reg');//返回注册页
            }
            init(function (settings) {
                res.render(settings.theme + '/login', {title: '登录',settings:settings});
            });
        });
    });

    //执行登录
    app.post('/login', function (req, res) {
        User.get({username: req.body.username}, function (err, user) {
            if (!user) {
                req.flash('error', '用户名不存在！');
                return res.redirect('/err');
            }
            //密码加密
            var md5 = crypto.createHash('md5');
            var password = md5.update(req.body.password).digest('hex');
            if (password == user.pwd) {
                req.session.user = user;
                res.redirect('/dashboard');
            } else {
                req.flash('error', '密码错误！');
                res.redirect('/err');
            }
        });
    });

    //退出登录
    app.get('/logout', function (req, res) {
        req.session.user = null;
        res.redirect('/');
    });

    //错误信息页
    app.get('/err', function (req, res) {
        init(function (settings) {
            res.render(settings.theme + '/err',
                {
                    title: '提示',
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString(),
                    user: req.session.user,
                    settings:settings
                });
        });
    });

    //需未登录
    function checkNotLogin(req, res, next) {

        if (req.session.user) {
            // req.flash('err', '已登录!');
            res.redirect('back');
        }
        return next();
    }
};