/**
 * 项目经理周报表接口controller
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var moment = require('moment');
var xss = require('xss');
var mongoose = require('mongoose');
var Mtask = mongoose.model('Mtask');
import mtaskHelper from '../dbhelper/mtaskHelper';
import userHelper from '../dbhelper/userHelper';

/**
 * 新增任务
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addMtask = async(ctx, next) => {
	var userId = xss(ctx.request.body.user_id);
	var info = xss(ctx.request.body.info);
	var team = xss(ctx.request.body.team);

	var mtask = new Mtask({
		team: team,
		user: userId,
		info: info,
		period: moment().format('w'),
		update_at: moment().format("YYYY-MM-DD HH:mm:ss")
	});

	// TODO 控制p_role=1的可以进行周报更新
	// TODO 控制本期已填过项目经理周报的不允许再新建，只能编辑
	// TODO 控制往期的不能新增

	var mtaskObj = await mtaskHelper.addMtask(mtask);
	if (mtaskObj) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: mtaskObj,
			message: '保存成功'
		}
	}
}

/**
 * 编辑项目经理周报
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.editMtask = async(ctx, next) => {
	var id = xss(ctx.request.body.id);
	var userId = xss(ctx.request.body.user_id);
	var info = xss(ctx.request.body.info);
	var params = {
		id: id,
		info: info,
		update_at: moment().format("YYYY-MM-DD HH:mm:ss")
	};

	// 检查此任务是否为自己的任务,为了防止role=2的小组长篡改
	var mtaskById = await mtaskHelper.findMtaskById(id);
	if (mtaskById[0].user.toString() !== userId) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '别人的周报,不要瞎改!'
		};
		return;
	}

	// 不能更改之前的历史周报
	if (mtaskById[0].period.toString() !== moment().format('w')) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '世上没有后悔药!历史不能改变!'
		};
		return;
	}

	var data = await mtaskHelper.editMtask(params);
	if (data) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '修改成功'
		};
	} else {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: data
		};
	}
}



/**
 * 获取项目经理周报列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getMtaskList = async(ctx, next) => {
	var userId = xss(ctx.request.body.user_id);
	var period = xss(ctx.request.body.period);
	var team = xss(ctx.request.body.team);
	var year = xss(ctx.request.body.year);
	
	var users = await userHelper.findUsersByTeam({pm: 'pm', team: team});
	var mtaskList = [];
	for(var i = 0, size = users.length; i < size; i++) {
		let item = users[i];
		let eachMtask = await mtaskHelper.findMtaskByUser({
			team: team,
			period: period,
			year: year,
			userId: item._id
		});
		var userObj = await userHelper.findUserById({id: item._id});
		mtaskList.push(eachMtask[0] ? eachMtask[0] : {user: {name: userObj.name}, info: ''});
	}

	if (mtaskList) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: mtaskList,
			message: '获取成功'
		}
	}
}