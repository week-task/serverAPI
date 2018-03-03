'use strict'

var mongoose =  require('mongoose')
var Project = mongoose.model('Project')

/**
 * 查找所有项目
 * @return {[type]} [description]
 */
const findAllProjects = async () => {
	var query = Project.find({});
	var res = [];
	await query.exec(function(err, projects) {
		console.log('projects:=> ',projects);
		if (err) {
			res = [];
		} else {
			res = projects;
		}
	})
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
	})
	return res;
};

/**
 * 增加项目
 * @param  {[Project]} project [mongoose.model('Project')]
 * @return {[type]}      [description]
 */
const addProject = async (project) => {
	project = await project.save();
	return project
};


module.exports = {
	findAllProjects,
	findProject,
	addProject
};
