'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 定义一个模式(相当于传统意义的表结构)
 * 每个模式映射mongoDB的一个集合，
 * 它定义（只是定义，不是实现）这个集合里面文档的结构，就是定义这个文档有什么字段，字段类型是什么，字段默认值是什么等。
 * 除了定义结构外，还定义文档的实例方法，静态模型方法，复合索引，中间件等
 * @type {mongoose}
 */
var TaskSchema = new Schema({
	name: String,
	user_id: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	project_id: {type: Schema.Types.ObjectId, ref: 'Project', required: true},
	progress: Number,
	status: String,
	remark: String,
	period: String, // task属于周报哪个期数
	create_at: String,
	update_at: String
},{collection:'task'});

// Defines a pre hook for the document.
// TaskSchema.pre('save', function (next) {
// 	var currentDate = new Date();
// 	this.updated_at = currentDate;
//
// 	if(!this.create_at) {
// 		this.create_at = currentDate;
// 	}
//
// 	next();
// });


/**
 * 定义模型Task
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数Task 数据库中的集合名称, 不存在会创建.
var Task = mongoose.model('Task', TaskSchema);

module.exports = Task;

/**
 * nodejs中文社区这篇帖子对mongoose的用法总结的不错：https://cnodejs.org/topic/548e54d157fd3ae46b233502
 */