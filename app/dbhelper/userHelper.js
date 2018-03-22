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
 * 查找用户
 * @return {[type]} [description]
 */
const findUserById = async (params) => {
	var query = User.findOne({_id: params.id});
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
 * 修改密码
 * @return {[type]} [description]
 */
const changePassword = async (params) => {
	var query = User.update({_id: params.userId}, {$set:{'password': params.password}});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}
	});
	res = await findUserById({id: params.userId});
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

const addStatus4User = async (userId) => {
	var query = User.update({_id: userId}, {$set:{status: 0}});
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
	findUserById,
	addUser,
	bindTeam4User,
	changePassword,
	updatePrevPassword,
	addStatus4User
};
