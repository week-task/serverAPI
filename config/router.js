'use strict'

const Router = require('koa-router')
const User = require('../app/controllers/user')
const Project = require('../app/controllers/project')
const App = require('../app/controllers/app')

module.exports = function () {
	var router = new Router({
		prefix: '/api'
	});

	router.get('/user/getUserList', User.getUserList);
	router.post('/user/add', User.addUser);
	router.post('/login', User.login);

	router.get('/getProjectList', Project.getProjectList);
	router.post('/project/add', Project.addProject);

	return router
}