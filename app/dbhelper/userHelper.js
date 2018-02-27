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


module.exports = {
	findAllUsers
};
