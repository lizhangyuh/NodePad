/*主程序
    安装命令：node jlbox [数据库名称] [数据库地址] [cookie密钥]
    运行命令：node jlbox
 */

var spawn = require('child_process').spawn;

    console.log('欢迎使用NodePad！');

    var fs = require('fs');
    var data;
    var argvs = {};

    //判断是否已安装
    if(fs.existsSync('configs.json')){
        var data=fs.readFileSync('configs.json',{encoding:'utf-8'});
    }else{
        var data = null;
    }
    if(!data){
        console.log('    ');
        console.log('你尚未安装NodePad，现在开始安装！');
        if(!process.argv[2]){return console.log('请输入数据库名称！');}
        if(!process.argv[3]){return console.log('请输入数据库地址！');}
        if(!process.argv[4]){return console.log('请输入数cookie密钥！');}

        argvs.db = process.argv[2];
        argvs.host = process.argv[3];
        argvs.cookieSecret = process.argv[4];

        //检查modules
        console.log('开始下载modules，这可能需要几分钟............');
        var install = spawn('npm',['install']);
        install.stdout.on('data', function (data) {
            console.log('安装信息: ' + data);
        });

        install.stderr.on('data', function (data) {
            console.log('错误信息: ' + data);
        });

        install.on('close', function (code) {

            console.log('所有modules已安装！');

            //数据库配置写入configs.json
            console.log('    ');
            console.log('创建数据库配置..................');
            fs.writeFile('./configs.json',JSON.stringify(argvs, null, 4),{flag:'w'},function(err) {
                if (err) {
                    // 删除配置文件
                    fs.unlinkSync('configs.json');
                    console.log('配置文件已删除！');
                    throw err;
                }

                console.log('Done!');

                //初始化全局设置,存入数据库
                console.log('初始化全局设置..................');
                var Settings = require('./models/settings.js');

                var date = new Date();
                var settings = new Settings({
                    intro:'欢迎使用 NodePad 博客',
                    blogname:'NodePad',
                    subtitle:'一个简单好用的轻博客',
                    themes:'NPT_JerryLee_1.0',
                    starttime:date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) ,
                    limit:5
                });

                settings.create(function(err) {
                    if (err) {
                        // 删除配置文件
                        fs.unlinkSync('configs.json');
                        console.log('配置文件已删除！');

                        return console.log('安装失败，创建全局设置不成功.');
                    }
                    console.log('Done!');
                    console.log('安装完成!正在启动程序......');
                    start();
                    console.log('================================');
                    console.log('NodePad启动中......');
                });
            });
        });

    }else {
        start();
        console.log('================================');
        console.log('NodePad启动中......');
    }

    function start(){
        var run = spawn('node',['app.js']);
        run.stdout.on('data', function (data) {
            console.log('输出信息: ' + data);
        });

        run.stderr.on('data', function (data) {
            console.log('错误信息: ' + data);
        });

        run.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    }








