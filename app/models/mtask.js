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
var MtaskSchema = new Schema({
	team: String,
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	// pm_project: {type: Schema.Types.ObjectId, ref: 'Pmproject'},
	period: String, // task属于周报哪个期数
	update_at: String,
	info: String //填写的具体周报信息
},{collection:'mtask'});

/**
 * 定义模型Team
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数User 数据库中的集合名称, 不存在会创建.
var Mtask = mongoose.model('Mtask', MtaskSchema);

module.exports = Mtask;