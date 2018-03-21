/**
 * 项目表数据库CRUD
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var mongoose =  require('mongoose');
var Project = mongoose.model('Project');

/**
 * 查找所有项目
 * @return {[type]} [description]
 */
const findAllProjects = async (params) => {
	var query;
	if (params.team) {
		query = Project.find({'team':params.team, 'status': 0}).populate('team');
	} else {
		// TODO 需要把查询出来的team对象里面的leader属性关联user表进行查询，得到username
		query = Project.find({}).populate('team');
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
 * 删除项目（逻辑删除，status 0 => 1）
 * @param {*} params String
 * @return {[Project]}
 */
const deleteProject = async (params) => {
	var query = Project.update({_id: params.id}, {$set:{status: 1}});
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
	editProject,
	deleteProject
};
