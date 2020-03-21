'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * kokr = key month okr, 月度okr的目标
 * @type {mongoose}
 */
var KokrSchema = new Schema({
	_id: Schema.Types.ObjectId, // ID
	creator: {type: Schema.Types.ObjectId, ref: 'User'}, // key的创建者,也就是填报人
  team: {type: Schema.Types.ObjectId, ref: 'Team'},
	year: String, // 填报的周期年份
	month: String, // 填报的月份
	content: [
		{
		  time: String,
			kind: String,
			percent: Number,
			title: String,
			desc: String
			// score: Number
		}
	],
	// kind: String, // 填报的类型: 1->正常考核的内容 2->加分项:比如写自己的除工作方面的一些进步
	// percent: String, // 每个key的百分比,一个填报周期里,percent的总额不得多于100
	// desc: String, // 填报具体的key内容的一些补充描述
	create_at: String,
	update_at: String
},{collection:'kokr'});

/**
 * 定义模型Kokr
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数User 数据库中的集合名称, 不存在会创建.
var Kokr = mongoose.model('Kokr', KokrSchema);

module.exports = Kokr;