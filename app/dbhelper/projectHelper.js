/**
 * 项目表数据库CRUD
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var mongoose =  require('mongoose');
var Project = mongoose.model('Project');
var Task = mongoose.model('Task');

/**
 * 查找所有项目
 * @return {[type]} [description]
 */
const findAllProjects = async (params) => {
	var query;
	if (params.options) {
		query = Project.find({team:params.team, status: 0}).populate('team');
	} else {
		query = Project.find({team:params.team}).populate('team');
	}
	var res = [];
	await query.exec(function(err, projects) {
		if (err) {
			res = [];
		} else {
			res = projects;
		}
	});
	return res
}

/**
 * 查找相关项目
 * @return {[type]} [description]
 */
const findProject = async (name) => {
	var query = Project.findOne({name});
	var res = null;
	await query.exec(function(err, project) {
		if(err) {
			res = {}
		}else {
			res = project
		}
	});
	return res;
};

/**
 * 增加项目
 * @param  {[Project]} project [mongoose.model('Project')]
 * @return {[type]}      [description]
 */
const addProject = async (project) => {
	var res = {code: 0};
	await project.save().then((res) => {}).catch((err) => {
		res = err;
	});
	return res;
};

/**
 * 编辑项目名称
 * @param {*} params String
 * @return {[Project]}
 */
const editProject = async (params) => {
	var query = Project.findByIdAndUpdate(params.id, {
		name:params.name
	});
	var res = [];
	await query.exec((err, project) => {
		if (err) {
			res = [];
		} else {
			res = project;
		}
	});
	return res;
};

/**
 * 启动项目，更改状态{status 1 => 0}
 * @param {*} params String
 * @return {[Project]}
 */
const launchProject = async (params) => {
	var query = Project.findByIdAndUpdate(params.id, {
		status:0
	});
	var res = [];
	await query.exec((err, project) => {
		if (err) {
			res = [];
		} else {
			res = project;
		}
	});
	return res;
};

/**
 * 删除项目（物理删除，但如果历史记录有相关的project，就禁用，status 0 => 1）
 * @param {*} params String
 * @return {[Project]}
 */
const deleteProject = async (params) => {
	// 判断在task里面是否存在project，如果存在，状态就为禁用，不存在，就直接删除
	var existProjectQuery = Task.find({project: params.id});
	var taskList = [];
	await existProjectQuery.exec((err, task) => {
		if (err) { taskList = [];}
		else {
			taskList = task;
		}
	});
	var query, res = {};
	if (taskList.length > 0) {
		query = Project.update({_id: params.id}, {$set:{status: 1}});
		res.rescode = 0; // 禁用
	} else if (taskList.length === 0) {
		query = Project.remove({_id: params.id});
		res.rescode = 1; // 物理删除
	}
	await query.exec((err, project) => {
		if (err) {
			res.err = err;
		} else {
			res.project = project;
		}
	});
	return res;
};

/**
 * 新增老版本的项目字段所属team以及status（status 0）
 * @param {*} params String
 * @return {[Project]}
 */
const initOldVersionProject = async (params) => {
	var query = Project.update({},{$set: {status:0, team:params.team}}, {multi: 1});
	var res = [];
	await query.exec((err, project) => {
		if (err) {
			res = [];
		} else {
			res = project;
		}
	});
	return res;
};

module.exports = {
	findAllProjects,
	findProject,
	addProject,
	launchProject,
	editProject,
	deleteProject,
	initOldVersionProject
};
