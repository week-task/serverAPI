'use strict'

const Router = require('koa-router')
const User = require('../app/controllers/user')
const App = require('../app/controllers/app')

module.exports = function () {
	var router = new Router({
		prefix: '/api'
	})

	// user
	router.post('/u/signup', App.hasBody, User.signup)
	router.post('/u/update', App.hasBody, App.hasToken, User.update)

	// DB Interface test
	router.get('/user/getUserList', User.getUserList)
	router.post('/test/user/add', User.addUser)
	router.post('/test/user/delete', User.deleteUser)

	return router
}