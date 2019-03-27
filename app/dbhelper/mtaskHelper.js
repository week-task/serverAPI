/**
 * 项目经理周报表表数据库CRUD
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var mongoose =  require('mongoose');
var Mtask = mongoose.model('Mtask');
var User = mongoose.model('User');
import userHelper from '../dbhelper/userHelper';

/**
 * 增加mtask
 * @param  {[Mtask]} mtask [mongoose.model('Mtask')]
 * @return {[type]}      [description]
 */
const addMtask = async (mtask) => {
	mtask = await mtask.save();
	return mtask;
};

const findMtaskByUser = async (params) => {
	var regYear = new RegExp(params.year, 'i');
	var query = Mtask.find({team: params.team, user: params.userId, period: params.period, update_at:{$regex: regYear}});
	var res = {};
	await query.populate('user', 'name').exec(function(err, mtasks) {
		if (err) {
			res = {};
		} else {
			res = mtasks;
		}
	})
	return res;
};

/**
 * 编辑mtask
 * @param  {[Task]} mtask [mongoose.model('Mtask')]
 * @return {[type]}      [description]
 */
const editMtask = async (params) => {
	var query = Mtask.findByIdAndUpdate(params.id, {
		info:params.info,
		update_at:params.update_at,
	});
	var res = [];
	await query.exec((err, mtask) => {
		if (err) {
			res = [];
		} else {
			res = mtask;
		}
	});
	return res;
};

/**
 * 根据ID查找mtask
 * @return {[type]} [description]
 */
const findMtaskById = async (id) => {
	var query = Mtask.find({_id: id});
	var res = [];
	await query.exec(function(err, mtask) {
		if (err) {
			res = [];
		} else {
			res = mtask;
		}
	});
	return res;
};

/**
 * 增获取mtask列表
 * @param  {[Mtask]} mtask [mongoose.model('Mtask')]
 * @return {[type]}      [description]
 */
const getMtaskList = async (params) => {
	var query, queryInner, ausers = [], res = [], uRole = parseInt(params.userRole);
	var regYear = new RegExp(params.year, 'i');

	query = User.find({team: params.team, p_role: 1});
	// 查出项目经理用户数组,方便查询相关任务
	await query.exec((err, users) => {
		if (err) { ausers = []; }
		else {
			ausers = users;
		}
	});

	queryInner = MTask.find({user:{$in:ausers}, team: params.team, period: params.period, updated_at:{$regex: regYear}});

	await queryInner.exec((err2, tasks) => {
		if (err2) {res = []}
		else {
			res = tasks;
		}
	});
	return res;
};

module.exports = {
	addMtask,
	editMtask,
	findMtaskById,
	findMtaskByUser,
	getMtaskList
};
