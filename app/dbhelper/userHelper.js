/**
 * 用户表数据库CRUD
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var mongoose =  require('mongoose');
var User = mongoose.model('User');

/**
 * 查找所用用户
 * @return {[type]} [description]
 */
const findAllUsers = async () => {
	var query = User.find({});
	var res = [];
	await query.exec(function(err, users) {
		if (err) {
			res = [];
		} else {
			res = users;
		}
	})
	return res
}

/**
 * 查找所用用户
 * @return {[type]} [description]
 */
const findUser = async (name) => {
	var query = User.findOne({name});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}else {
			res = user
		}
	})
	return res;
};

/**
 * 增加用户
 * @param  {[User]} user [mongoose.model('User')]
 * @return {[type]}      [description]
 */
const addUser = async (user) => {
	// user = await user.save();
	// return user

	var res = {code: 0};
	await user.save().then((res) => {
		res = user;
	}).catch((err) => {
		res = err;
	});
	return res;
};

/**
 * 修改上一版用户密码加salt
 * @return {[type]} [description]
 */
const updatePrevPassword = async (params) => {
	var query = User.update({name: params.user.name}, {$set:{'password': params.password, 'salt': params.salt}});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}else {
			res = user;
		}
	});

	var user = await findUser(params.user.name);

	return user;
};

const bindTeam4User = async (params) => {
	var query = User.update({_id: params.user}, {$set:{team: params.team}});
	var res = null;
	await query.exec((err, user) => {
		if (err) {res = {};}
		else {
			res = user;
		}
	});
	return res;
};

module.exports = {
	findAllUsers,
	findUser,
	addUser,
	bindTeam4User,
	updatePrevPassword
};
