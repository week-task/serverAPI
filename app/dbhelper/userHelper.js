'use strict'

var mongoose =  require('mongoose')
var User = mongoose.model('User')

/**
 * 查找所用用户
 * @return {[type]} [description]
 */
const findAllUsers = async () => {
	var query = User.find({});
	var res = [];
	await query.exec(function(err, users) {
		console.log('users:=> ',users);
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
	user = await user.save();
	return user
};


module.exports = {
	findAllUsers,
	findUser,
	addUser
};
