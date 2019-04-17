/**
 * APP程序主入口
 * @author karl.luo<360512239@qq.com>
 * @Date 2018-03-01
 */
'use strict';

// 数据库连接配置 =====================================================================>
const mongoose = require('mongoose');
const MONGO_HOST = process.env.IOT_MONGO_HOST || 'localhost';
const mongoOptions = {
	user: 'weektask',
	pass: 'weektask_123'
};

const db = 'mongodb://localhost:27017/weekTask';// 连接本地mongoDB
// const db = 'mongodb://172.19.3.65:27017/weekTask';// 连接开发机mongoDB
// const db = 'mongodb://'+ MONGO_HOST +'/weekTask';// 连接线上mongoDB

mongoose.Promise = require('bluebird');
var dbInfo = mongoose.connect(db);
// var dbInfo = mongoose.connect(db, mongoOptions); //连接线上mongodb,有参数用户名和密码

dbInfo.connection.on('error', function (err) {
	console.log('链接失败: ', err);
});
dbInfo.connection.on('open', function () {
	console.log('数据库连接成功!');
});


// 数据库文件model的require =====================================================================>
const fs = require('fs');
const path = require('path');

/**
 * 获取数据库表对应的js对象所在的路径
 * @type {[type]}
 */
const models_path = path.join(__dirname, '/app/models')

/**
 * 已递归的形式，读取models文件夹下的js模型文件，并require
 * @param  {[type]} modelPath [description]
 * @return {[type]}           [description]
 */
var walk = function (modelPath) {
	fs
		.readdirSync(modelPath)
		.forEach(function (file) {
			var filePath = path.join(modelPath, '/' + file)
			var stat = fs.statSync(filePath)

			if (stat.isFile()) {
				if (/(.*)\.(js|coffee)/.test(file)) {
					require(filePath)
				}
			}
			else if (stat.isDirectory()) {
				walk(filePath)
			}
		})
};
walk(models_path);

// koa引入,其它常规模块的引入 =====================================================================>
require('babel-register');
const Koa = require('koa');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const jwt = require('koa-jwt');
const errorHandle = require('./middleware/errorHandle');
const app = new Koa();
const secret = require('./config/index').secret;

app.use(errorHandle);
// 加入koa-jwt token机制
app.use(jwt({secret,}).unless({path: [/\/login/, /\/export/]}));
app.use(koaBody({
	multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}));
app.use(logger());
app.use(session(app));
app.use(require('koa-static')(__dirname + '/www/dist/spa-mat'));
app.use(require('koa-static')(__dirname + '/www'));
app.use(bodyParser());
app.use(cors());

/**
 * 使用路由转发请求
 * @type {[type]}
 */
const router = require('./config/router')();

app
	.use(router.routes())
	.use(router.allowedMethods());

app.listen(22230);
console.log('app started at port 22230...');