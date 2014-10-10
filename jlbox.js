/*主程序
    安装命令：node jlbox [数据库名称] [数据库地址] [cookie密钥]
    运行命令：node jlBox
 */
var fs = require('fs');
var Settings = require('./models/settings.js');
var exec = require('child_process').exec,
    child;
var argvs = {};

var data=fs.readFileSync('configs.json','utf-8');

if(!data){
    if(!process.argv[2]){return console.log('请输入数据库名称！');}
    if(!process.argv[3]){return console.log('请输入数据库地址！');}
    if(!process.argv[4]){return console.log('请输入数cookie密钥！');}

    argvs.db = process.argv[2];
    argvs.host = process.argv[3];
    argvs.cookieSecret = process.argv[4];

    console.log('创建数据库配置......');
    fs.writeFile('configs.json',JSON.stringify(argvs, null, 4),function(err) {
        if (err) {
            if (err) throw err;
        }

        console.log('Done!');
        console.log('初始化全局设置......');
        //初始化全局设置
        var date = new Date();
        var settings = new Settings({
            intro:'欢迎使用jlBox博客',
            blogname:'一个jlBox博客',
            starttime:date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) ,
            limit:5
        });
        settings.save(function(err) {
            if (err) {
                return console.log('安装失败，创建全局设置不成功~');
            }
            console.log('Done!');
            console.log('安装完成!正在启动程序......');
            child = exec('node app.js',
                function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log(error);
                    }
                }
            );
            console.log('================================');
            console.log('jlBox已启动！');
        });
    });
}else{
    child = exec('node app.js',
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log(error);
            }
        }
    );
    console.log('================================');
    console.log('jlBox已启动！');
}




