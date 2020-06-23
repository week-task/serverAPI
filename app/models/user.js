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
var UserSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: {
		unique: true,
		type: String
	},
	password: String,
	salt: String, // 存储password加密规则
	role: Number,
	p_role: Number, // 项目经理角色，0代表非项目经理，1代表项目经理
	parent: String,
	project: String,
	team: String,
	status: Number, // 这个状态可以定义这个人是否还在职：0代表正常状态，1代表离职
	energy: Number, // 总的energy默认为100，如果参与项目越多，energy值越少
	energy_desc: String, // 描述个人最近状态，由小leader填写
	// create_at: String,
	updated_at: String, // 最后更新时间 
	avatar: String,  // 头像地址
	motto: String,  // 签名、座右铭
	tel: Number, // 电话
	email: String, // 邮件
	intro: String, // 自我介绍
  workNo: String, //
  workContent: String,
	frozen_time: Number, // 冻结的请假时间
	all_time: Number // 所有的请假时间
},{collection:'user'});

/**
 * 定义模型User
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数User 数据库中的集合名称, 不存在会创建.
var User = mongoose.model('User', UserSchema);

module.exports = User;