'use strict'

const Router = require('koa-router');
const User = require('../app/controllers/user');
const Project = require('../app/controllers/project');
const Task = require('../app/controllers/task');
const Team = require('../app/controllers/team');
const Mtask = require('../app/controllers/mtask');

module.exports = function () {
	var router = new Router({
		prefix: '/weeklyreportapi'
	});
	// user 接口
	router.post('/user/add', User.addUser);
	router.post('/user/edit', User.editUser);
	router.post('/user/delete', User.deleteUser);
	router.post('/user/resetpass', User.resetPass);
	router.post('/getUserList', User.getUserList);
	router.post('/user/editpassword', User.changePassword);
	router.post('/login', User.login);
	router.post('/user/updateEnergy', User.updateEnergy4User);
	router.post('/user/updateUserInfo', User.editUserInfo);
	router.post('/user/getUserInfo', User.getUserInfo);

	// task 接口
	router.post('/task/add', Task.addTask);
	router.post('/task/edit', Task.updateTaskById);
	router.post('/task/del', Task.delTask);
	router.post('/task/unfinished', Task.unfinishedUsers);
	router.post('/isFinished', Task.checkUnfinishTask);
	router.post('/getTaskListByPeriod', Task.getTaskListByPeriod);
	router.post('/getTaskListByKeyword', Task.getTaskListByKeyword);
	router.post('/getTaskListByChanged', Task.getTaskListByChanged);
	router.post('/export', Task.exportWeeklyReport);

	// mtask 接口
	router.post('/mtask/add', Mtask.addMtask);
	router.post('/mtask/edit', Mtask.editMtask);
	router.post('/mtask/getMtaskList', Mtask.getMtaskList);

	// team 接口
	router.get('/getTeamList', Team.getTeamList);
	router.get('/getTeamLeaderList', Team.getTeamLeaderList);
	router.post('/team/add', Team.addTeam);
	router.post('/team/edit', Team.editTeam);
	router.post('/team/delete', Team.deleteTeam);
	router.post('/team/addLeader', Team.addTeamLeader);

	// project 接口
	router.post('/getProjectListByTeam', Project.getProjectOptions);
	router.post('/getProjectList', Project.getProjectList);	
	router.post('/project/add', Project.addProject);
	router.post('/project/launch', Project.launchProject);
	router.post('/project/edit', Project.editProject);
	router.post('/project/delete', Project.deleteProject);

	return router;
}