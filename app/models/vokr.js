'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * vokr = value month okr, 月度okr的结果
 * @type {mongoose}
 */
var VokrSchema = new Schema({
	_id: Schema.Types.ObjectId, // ID
	creator: {type: Schema.Types.ObjectId, ref: 'User'}, // key的创建者,也就是填报人
	// 组员提交成功 -> 流转到小组长,该字段变成小组长
	// 小组长审核通过 -> 流转到TL,该字段变成TL
	// 小组长驳回 -> 流转到组员,该字段变成组员,也就是creator
	dealer: {type: Schema.Types.ObjectId, ref: 'User'}, // 流转到每一步的人
  team: {type: Schema.Types.ObjectId, ref: 'Team'},
	year: String, // 填报的周期年份
	month: String, // 填报的月份
	content: [
		{
			kind: String,
      title: String,
			percent: Number,
			desc: String,
			score: Number
		}
	],
	// kind: String, // 填报的类型: 1->正常考核的内容 2->加分项:比如写自己的除工作方面的一些进步
	// percent: String, // 每个key的百分比,一个填报周期里,percent的总额不得多于100
	// desc: String, // 填报具体的key内容的一些补充描述
	// score: Number, // 每个key的自评分数
	gscore: Number, // 每个key的小组长分数,占比30%,此字段暂时不用
  total_score: Number, // 每个人算的总分数
  grade: String,
	// 1 -> 初始状态,组员指定下月计划并填写value,此时dealer为组员本人
	// 2 -> 初评完成,组员对自己当月计划进行评分,此时dealer为小组长
	// 10 -> 小组长审核通过,小组长审核评分通过,认可权重和分数,此时dealer为TL
	// 11 -> 小组长审核驳回,小组长不任何,此时dealer为组员本人
  // 12 -> 小组长写自己的任务,此时dealer为小组长本人
  // 13 -> 小组长写自己的任务,此时dealer为TL
	// 20 -> TL审核通过
	// 21 -> TL审核驳回
	status: String, // key的状态
  comment: String, // 评价
  comment_self: String, // 自评
  // likes: Number, // 后期可以通过点赞的方式来综合评价一个人的ABCDE
  last_person: {type: Schema.Types.ObjectId, ref: 'User'}, // 最后更新的同事
  create_at: String,
	update_at: String
},{collection:'vokr'});

/**
 * 定义模型Vokr
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数Vokr 数据库中的集合名称, 不存在会创建.
var Vokr = mongoose.model('Vokr', VokrSchema);

module.exports = Vokr;