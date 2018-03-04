'use strict'

var moment = require('moment')
var xss = require('xss')
var mongoose = require('mongoose')
var Task = mongoose.model('Task')
var jsonwebtoken = require('jsonwebtoken')
import TaskHelper from '../dbhelper/TaskHelper'

moment().format();

/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getTaskList = async(ctx, next) => {
	var data = await TaskHelper.findAllTasks();
	ctx.body = {
		code: 0,
		data: data,
		message: '获取成功'
	}
}
exports.addTask = async(ctx, next) => {
	var TaskName = xss(ctx.request.body.name);
	var UserId = xss(ctx.request.body.user_id);
	var ProjectId = xss(ctx.request.body.project_id);
	var Progress = xss(ctx.request.body.progress);
	var Status = xss(ctx.request.body.status);
	var Remark = xss(ctx.request.body.remark);
	var task = new Task({
		name: TaskName,
		user_id: UserId,
		project_id: ProjectId,
		progress: Progress,
		status: Status,
		remark: Remark,
		period: moment().format('w'),
		create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
		update_at: moment().format("YYYY-MM-DD HH:mm:ss")
	});
	console.log('Task: => ', task);
	var task2 = await TaskHelper.addTask(task);
	if (task2) {
		ctx.body = {
			code: 0,
			data: task2,
			message: '保存成功'
		}
	}
}