'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var Project = mongoose.model('Project')
var jsonwebtoken = require('jsonwebtoken')
import projectHelper from '../dbhelper/projectHelper'

/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getProjectList = async(ctx, next) => {
	var data = await projectHelper.findAllProjects();
	ctx.body = {
		code: 0,
		data: data,
		message: '获取成功'
	}
}
exports.addProject = async(ctx, next) => {
	var projectName = xss(ctx.request.body.name);
	var project = new Project({
		name: projectName
	});
	var project2 = await projectHelper.addProject(project);
	if (project2) {
		ctx.body = {
			success: true,
			data: project2
		}
	}
}