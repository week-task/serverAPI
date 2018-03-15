/**
 * 项目表接口controller
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var xss = require('xss');
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
import projectHelper from '../dbhelper/projectHelper';

/**
 * 获取项目列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getProjectList = async(ctx, next) => {
	var data = await projectHelper.findAllProjects();
	ctx.status = 200;
	ctx.body = {
		code: 0,
		data: data,
		message: '获取成功'
	}
};
/**
 * 新增项目
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addProject = async(ctx, next) => {
	var projectName = xss(ctx.request.body.name);
	var projectTeam = xss(ctx.request.body.team);
	var project = new Project({
		_id: new mongoose.Types.ObjectId(),
		name: projectName,
		team: projectTeam
	});
	var res = await projectHelper.addProject(project);
	if (res.code === 11000) {
		ctx.status = 500;
		ctx.body = {
			code: 0,
			message: '真笨,这个项目名称早就有了'
		};
		return;
	}
	if (res.code === 0) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: [],
			message: '新增项目成功'
		}
	}
};