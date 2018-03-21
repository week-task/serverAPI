'use strict'

const Router = require('koa-router');
const User = require('../app/controllers/user');
const Project = require('../app/controllers/project');
const Task = require('../app/controllers/task');
const Team = require('../app/controllers/team');

module.exports = function () {
	var router = new Router({
		prefix: '/weeklyreportapi'
	});
	// user 接口
	router.post('/user/add', User.addUser);
	router.post('/login', User.login);

	// task 接口
	router.post('/task/add', Task.addTask);
	router.post('/task/edit', Task.updateTaskById);
	router.post('/task/del', Task.delTask);
	router.post('/isFinished', Task.checkUnfinishTask);
	router.post('/getTaskListByPeriod', Task.getTaskListByPeriod);
	router.post('/export', Task.exportWeeklyReport);

	// team 接口
	router.get('/getTeamList', Team.getTeamList);
	router.get('/getTeamLeaderList', Team.getTeamLeaderList);
	router.post('/team/add', Team.addTeam);
	router.post('/team/edit', Team.editTeam);
	router.post('/team/delete', Team.deleteTeam);
	router.post('/team/addLeader', Team.addTeamLeader);

	// project 接口
	router.post('/getProjectListByTeam', Project.getProjectOptions);
	router.get('/getProjectList', Project.getProjectList);	
	router.post('/project/add', Project.addProject);
	router.post('/project/edit', Project.editProject);
	router.post('/project/delete', Project.deleteProject);

	return router;
}