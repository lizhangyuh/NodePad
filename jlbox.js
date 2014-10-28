/*主程序
    安装命令：node jlbox [数据库名称] [数据库地址] [cookie密钥]
    运行命令：node jlbox
 */

var exec = require('child_process').exec;

    console.log('欢迎使用jlBox！');

    var fs = require('fs');
    var data=fs.readFileSync('configs.json','utf-8');
    var argvs = {};

    //判断是否已安装
    if(!data){
        console.log('    ');
        console.log('你尚未安装jlBox，现在开始安装！');
        if(!process.argv[2]){return console.log('请输入数据库名称！');}
        if(!process.argv[3]){return console.log('请输入数据库地址！');}
        if(!process.argv[4]){return console.log('请输入数cookie密钥！');}

        argvs.db = process.argv[2];
        argvs.host = process.argv[3];
        argvs.cookieSecret = process.argv[4];

        //检查modules
        console.log('开始下载modules，这可能需要几分钟............');
        exec('npm install',function (error, stdout, stderr) {
            console.log(stdout);
            if(stderr){
                console.log('stderr: ' + stderr);
            }
            if (error !== null) {
                console.log(error);
            }
            console.log('所有modules已安装！');

            //数据库配置写入configs.json
            console.log('    ');
            console.log('创建数据库配置..................');
            fs.writeFile('configs.json',JSON.stringify(argvs, null, 4),function(err) {
                if (err) {
                    if (err) throw err;
                }

                console.log('Done!');

                //初始化全局设置,存入数据库
                console.log('初始化全局设置..................');
                var Settings = require('./models/settings.js');

                var date = new Date();
                var settings = new Settings({
                    intro:'欢迎使用jlBox博客',
                    blogname:'一个jlBox博客',
                    themes:'JLT_JerryLee_1.0',
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
                    start();
                    console.log('================================');
                    console.log('jlBox已启动！');
                });
            });
        });
    }else {
        start();
        console.log('================================');
        console.log('jlBox已启动！');
    }

    function start(){
        exec('node app.js',
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log(error);
                }
            }
        );
    }








