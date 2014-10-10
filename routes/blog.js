
/*
 * GET blog.
 */
var Post = require('../models/post.js');
var markdown = require("markdown").markdown;
var User = require('../models/user.js');
var init = require('../init');
var formidable = require('formidable');
var configs = require('../readConfigs.js');
var fs = require('fs');

module.exports = function(app,url) {
    //去掉url前斜杠
    var active = url.replace(/\//g,'');
    //博客首页
    app.get(url,function(req,res){
        init(function(settings){
            Post.get({draft:"0"},1,settings.limit,function(err,posts,total){
                if(err){
                    posts = [];
                }else{
                    //加载归档数组
                    Post.getProperty("archiveTime",function(err,archiveTimes){
                        if (err) {
                            req.flash('error',err);
                            return res.redirect('/err');
                        };
                        //加载标签数组
                        Post.getProperty("tags",function(err,tags) {
                            if (err) {
                                req.flash('error', err);
                                return res.redirect('/err');
                            }
                            //过滤markdown格式
                            posts.forEach(function (post) {
                                post.post = post.post.replace(/\![^\)]*\)|\s{2,}|\`|\[|\][^\)]*\)|\*/g, '\r\n');
                            });
                            res.render('blog', {
                                title: '博客',
                                active:active,
                                posts: posts,
                                user: req.session.user,
                                total: total,
                                page: 1,
                                isFirst: true,
                                isLast: settings.limit >= total,
                                archiveTimes: archiveTimes,
                                tags:tags,
                                settings: settings
                            });
                        });
                    });
                }
            });
        });
    });

    //博客首页（分页）
    app.get(url+'/page/:page?',function(req,res){
        if(!req.params.page){
            var page = 1;
        }
        init(function(settings){
            Post.get({draft:"0"},req.params.page,settings.limit,function(err,posts,total){
                if(err){
                    posts = [];
                }else{
                    //加载归档数组
                    Post.getProperty("archiveTime",function(err,archiveTimes){
                        if (err) {
                            req.flash('error',err);
                            return res.redirect('/err');
                        };
                        //加载标签数组
                        Post.getProperty("tags",function(err,tags) {
                            if (err) {
                                req.flash('error', err);
                                return res.redirect('/err');
                            }
                            //过滤markdown格式
                            posts.forEach(function (post) {
                                post.post = post.post.replace(/\![^\)]*\)|\s{2,}|\`|\[|\][^\)]*\)|\*/g, '\r\n');
                            });
                            res.render('blog', {
                                title: '博客',
                                active:active,
                                posts: posts,
                                user: req.session.user,
                                total: total,
                                page: parseInt(req.params.page),
                                archiveTimes: archiveTimes,
                                tags:tags,
                                isFirst: req.params.page == 1,
                                isLast: (req.params.page * settings.limit) >= total,
                                settings: settings
                            });
                        });
                    });
                }
            });
        });
    });

    //文章页面
    app.get(url+'/post/:pinyin',function(req,res){
        if(req.params.pinyin){
            init(function(settings) {
                Post.get({pinyin: req.params.pinyin}, null, null, function (err, posts) {
                    if (err) {
                        req.flash('error', '没有此文章，或已删除！');
                        res.redirect('/err');
                    } else {
                        //加载归档数组
                        Post.getProperty("archiveTime", function (err, archiveTimes) {
                            if (err) {
                                req.flash('error', err);
                                return res.redirect('/err');
                            }
                            ;
                            //加载标签数组
                            Post.getProperty("tags", function (err, tags) {
                                if (err) {
                                    req.flash('error', err);
                                    return res.redirect('/err');
                                }
                                //获取作者信息
                                User.get({username: posts[0].author}, function (err, user) {
                                    if (err) {
                                        req.flash('error', err);
                                        return res.redirect('/err');
                                    }
                                    //解析 markdown 为 html
                                    posts.forEach(function (post) {
                                        post.post = markdown.toHTML(post.post);
                                    });
                                    res.render('post', {
                                        title: posts[0].title,
                                        active: active,
                                        post: posts[0],
                                        user: req.session.user,
                                        author: user,
                                        archiveTimes: archiveTimes,
                                        tags: tags,
                                        settings:settings
                                    });
                                });
                            });
                        });
                    }
                });
            });
        }else{
            req.flash('error','参数错误！');
            res.redirect('/err');
        }
    });

    //发布文章页面
    app.get(url+'/publish', checkLogin);
    app.get(url+'/publish',function(req,res){
        res.render('publish_post', {
            title: '发布文章',
            active:active,
            user: req.session.user
        });
    });

    //发布文章
    app.post(url+'/post', checkLogin);
    app.post(url+'/post', function (req, res) {
        var obj = req.body;
        obj.tags = req.body.tags.split(",");
        var post = new Post(obj);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/err');
            }
            res.redirect('/dashboard');//发表成功跳转到主页
        });
    });

    //编辑文章页面
    app.get(url+'/edit/:id', checkLogin);
    app.get(url+'/edit/:id',function(req,res){
        if(req.params.id){
            var _id = new require('mongodb').ObjectID(req.params.id);
            Post.get({_id:_id},null,null,function(err,posts){
                if(err){
                    req.flash('error','没有此文章，或已删除！');
                    res.redirect('/err');
                }else{
                    posts[0].tags = posts[0].tags ? posts[0].tags.join(",") : '';
                    res.render('edit_post', {
                        title: '[编辑]' + posts[0].title,
                        post: posts[0],
                        active:active,
                        user: req.session.user
                    });
                }
            });
        }else{
            req.flash('error','参数错误！');
            res.redirect('/err');
        }
    });

    //编辑文章
    app.post(url+'/update', checkLogin);
    app.post(url+'/update', function (req, res) {
        var obj = req.body;
        obj.tags = req.body.tags.split(",");
        var post = new Post(obj);
        post.edit(req.body.id,function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/err');
            }
            res.redirect('/dashboard');//发表成功跳转到主页
        });
    });

    //根据id删除文章
    app.get(url+'/del/:id', checkLogin);
    app.get(url+'/del/:id', function (req, res) {
        if(req.params.id) {
            Post.del(req.params.id,function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/err');
                }
                res.redirect('/dashboard');
            });
        }else{
            req.flash('error', "无法找到要删除的文章！");
            return res.redirect('/err');
        };
    });

    //文章归档页面（分页）
    app.get(url+'/archives/:archive/:page?',function(req,res){
        //查询条件
        if (!req.params.archive) {
            return res.redirect('/blog');
        };
        if(!req.params.page){
            var page = 1;
        }else{
            var page = req.params.page;
        }
        var archive = req.params.archive.replace(/%20/g, " ");
        init(function(settings){
            Post.get({archiveTime:archive,draft:"0"},page,settings.limit,function(err,posts,total){
                if(err){
                    posts = [];
                }else{
                    //加载归档数组
                    Post.getProperty("archiveTime",function(err,archiveTimes){
                        if (err) {
                            req.flash('error',err);
                            return res.redirect('/err');
                        };
                        //加载标签数组
                        Post.getProperty("tags",function(err,tags) {
                            if (err) {
                                req.flash('error', err);
                                return res.redirect('/err');
                            }
                            //过滤markdown格式
                            posts.forEach(function (post) {
                                post.post = post.post.replace(/\![^\)]*\)|\s{2,}|\`|\[|\][^\)]*\)|\*/g, '\r\n');
                            });
                            res.render('archives', {
                                title: '文章归档',
                                active:active,
                                posts: posts,
                                user: req.session.user,
                                total: total,
                                page: parseInt(page),
                                archiveTimes: archiveTimes,
                                tags:tags,
                                archive: archive,
                                isFirst: page == 1,
                                isLast: (page * settings.limit) >= total,
                                settings: settings
                            });
                        });
                    });
                }
            });
        });
    });

//标签页面（分页）
    app.get(url+'/tags/:tag/:page?',function(req,res){
        //查询条件
        if (!req.params.tag) {
            return res.redirect('/blog');
        };
        if(!req.params.page){
            var page = 1;
        }else{
            var page = req.params.page;
        }
        var tag = req.params.tag;
        init(function(settings){
            Post.get({tags:tag,draft:"0"},page,settings.limit,function(err,posts,total){
                if(err){
                    posts = [];
                }else{
                    //加载归档数组
                    Post.getProperty("archiveTime",function(err,archiveTimes){
                        if (err) {
                            req.flash('error',err);
                            return res.redirect('/err');
                        };
                        //加载标签数组
                        Post.getProperty("tags",function(err,tags) {
                            if (err) {
                                req.flash('error', err);
                                return res.redirect('/err');
                            }
                            //过滤markdown格式
                            posts.forEach(function (post) {
                                post.post = post.post.replace(/\![^\)]*\)|\s{2,}|\`|\[|\][^\)]*\)|\*/g, '\r\n');
                            });
                            res.render('tags', {
                                title: tag + '标签下的文章',
                                active:active,
                                posts: posts,
                                user: req.session.user,
                                total: total,
                                page: parseInt(page),
                                archiveTimes: archiveTimes,
                                tags:tags,
                                tag: tag,
                                isFirst: page == 1,
                                isLast: (page * settings.limit) >= total,
                                settings: settings
                            });
                        });
                    });
                }
            });
        });
    });

    //上传图片
    app.post(url+'/upload',function(req, res) {
        // parse a file upload
        var form = new formidable.IncomingForm(),files=[],fields=[],docs=[];
        console.log('start upload');

        //存放目录
        form.uploadDir = 'tmp/';
        var ms = '';
        form.on('field', function(field, value) {
            console.log(field, value);
            fields.push([field, value]);
        }).on('file', function(field, file) {
            console.log(field, file);
            files.push([field, file]);
            docs.push(file);

            var types = file.name.split('.');
            var date = new Date();
            ms = Date.parse(date);
            console.log(file.path);
            fs.renameSync(file.path, "public/images/files" + ms + '_'+file.name);
        }).on('end', function() {
            console.log('-> upload done');
            res.writeHead(200, {
                'content-type': 'text/plain'
            });
            var out={Resopnse:{
                'result-code':0,
                timeStamp:new Date()
            },
                files:docs,
                time:ms
            };
            var sout=JSON.stringify(out);

            res.end(sout);

        });
        form.on('aborted', function() {
        });
        form.parse(req, function(err, fields, files) {
            err && console.log('formidabel error : ' + err);

            console.log('parsing done');
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