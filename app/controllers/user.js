/**
 * 用户表接口controller
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var User = mongoose.model('User')
var jsonwebtoken = require('jsonwebtoken')
import userHelper from '../dbhelper/userHelper'
import {secret} from '../../config/index'

/**
 * 登录逻辑
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.login = async(ctx, next) => {
	var userName = xss(ctx.request.body.username);
	var password = xss(ctx.request.body.password);

	if (userName === '' || password === '') {
		ctx.status = 200;
		ctx.body = {
			code: -1,
			message: '用户名或密码不能为空!'
		};
		return;
	}

	var user = await userHelper.findUser(userName);
	console.log('user ',user);
	// console.log('user: ', user);
	if(!user) {
		ctx.status = 401;
		ctx.body = {
			code: -1,
			message: '根本就没这个人'
		};
		return;
	} 

	if (user.password === '111') {
		// 如果用户的密码是111，说明是v1.0.0版本的用户，此时要用salt重新加一次密，并存入salt
		var prevSalt = bcrypt.genSaltSync(10);
		var prevPassword = bcrypt.hashSync('111', prevSalt);
		user = await userHelper.updatePrevPassword({user: user, salt: prevSalt, password: prevPassword});
		console.log('user add salt => ',user);
	}

	var salt = user.salt;
	var hashPassword = bcrypt.hashSync(password, salt);
	console.log('pass: ', hashPassword);
	if (bcrypt.compareSync(password, hashPassword)) {
		console.log(user);
		console.log(user.team);

		// username and password are correct
		var userInfo = {
			_id: user._id,
			parent_id: user.parent,
			name: user.name,
			role: user.role,
			team: user.team,
			project: user.project
		};
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: {
				user: userInfo,
				token: jsonwebtoken.sign({
					data: userInfo,
					exp: Math.floor(Date.now() / 1000) + (60 * 30) // 60 seconds * 30 minutes = 0.5 hour
				}, secret)
			},
			message: '登录成功!'
		};
	} else {
		// password is wrong
		ctx.status = 500;
		ctx.body = {
			code: 500,
			data: [],
			message: '密码都记不住了吗?'
		};
	}

};

/**
 * 新增用户
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.addUser = async(ctx, next) => {
	var userName = xss(ctx.request.body.name);
	var password = xss(ctx.request.body.password);
	var project = xss(ctx.request.body.project);
	var parent = xss(ctx.request.body.parent);
	var role = xss(ctx.request.body.role);
	var user = new User({
		_id: new mongoose.Types.ObjectId(),
		name: userName,
		password: password,
		role: role,
		parent: parent,
		project: project
	});
	var user2 = await userHelper.addUser(user);
	if (user2) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '新增成功'
		}
	}
}