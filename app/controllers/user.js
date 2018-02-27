'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var uuid = require('uuid')
// var userHelper = require('../dbhelper/userHelper')
import userHelper from '../dbhelper/userHelper'

/**
 * 注册新用户
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.signup = async(ctx, next) => {
	var phoneNumber = xss(ctx.request.body.phoneNumber.trim())
	var user = await User.findOne({
		phoneNumber: phoneNumber
	}).exec()
	console.log(user)

	var verifyCode = Math.floor(Math.random() * 10000 + 1)
	console.log(phoneNumber)
	if (!user) {
		var accessToken = uuid.v4()

		user = new User({
			name:''
		})
	}
	else {
		user.verifyCode = verifyCode
	}

	try {
		user = await user.save()
		ctx.body = {
			success: true
		}
	}
	catch (e) {
		ctx.body = {
			success: false
		}

		return next
	}

}

/**
 * 更新用户信息操作
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.update = async(ctx, next) => {
	var body = ctx.request.body
	var user = ctx.session.user
	var fields = 'avatar,gender,age,nickname,breed'.split(',')

	fields.forEach(function (field) {
		if (body[field]) {
			user[field] = xss(body[field].trim())
		}
	})

	user = await user.save()

	ctx.body = {
		success: true,
		data: {
			nickname: user.nickname,
			accessToken: user.accessToken,
			avatar: user.avatar,
			age: user.age,
			breed: user.breed,
			gender: user.gender,
			_id: user._id
		}
	}
}


/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getUserList = async(ctx, next) => {
	var data = await userHelper.findAllUsers()
	// var obj = await userHelper.findByPhoneNumber({phoneNumber : '13525584568'})
	// console.log('obj=====================================>'+obj)

	ctx.body = {
		success: true,
		data
	}
}
exports.addUser = async(ctx, next) => {
	var user = new User({
		nickname: '测试用户',
		avatar: 'http://ip.example.com/u/xxx.png',
		phoneNumber: xss('13800138000'),
		verifyCode: '5896',
		accessToken: uuid.v4()
	})
	var user2 = await userHelper.addUser(user)
	if (user2) {
		ctx.body = {
			success: true,
			data: user2
		}
	}
}
exports.deleteUser = async(ctx, next) => {
	const phoneNumber = xss(ctx.request.body.phoneNumber.trim())
	console.log(phoneNumber)
	var data = await userHelper.deleteUser({phoneNumber})
	ctx.body = {
		success: true,
		data
	}
}