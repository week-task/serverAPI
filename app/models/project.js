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
var ProjectSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: {
		unique: true,
		type: String
	},
	team: {type: Schema.Types.ObjectId, ref: 'Team'},
	status: Number // 0:正常使用状态，1:已删除，这里是逻辑删除
	// create_at: Date,
	// updated_at: Date
},{collection:'project'});

// Defines a pre hook for the document.
// ProjectSchema.pre('save', function (next) {
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
 * 定义模型Project
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数Project 数据库中的集合名称, 不存在会创建.
var Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;