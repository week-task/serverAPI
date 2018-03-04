'use strict'

var mongoose =  require('mongoose')
var Task = mongoose.model('Task')
var User = mongoose.model('User')

/**
 * 查找所有task
 * @return {[type]} [description]
 */
const findAllTasks = async () => {
	var query = Task.find({});
	var res = [];
	await query.exec(function(err, tasks) {
		console.log('tasks:=> ',tasks);
		if (err) {
			res = [];
		} else {
			res = tasks;
		}
	})
	return res
}

/**
 * 查找相关task
 * @return {[type]} [description]
 */
const findTaskByPeriod = async (params) => {

	var query, queryInner, ausers = [], res = [], uRole = parseInt(params.userRole);
	console.log('userRole: ', params.userRole);

	if (uRole === 0) {
		query = Task.find({"period": params.period});
		await query.populate('user', 'name').populate('project').exec(function(err, tasks) {
			console.log(err + ' ,,,, ' + tasks);
			if(err) {
				res = [];
			}else {
				res = tasks;
			}
		})
	} else if (uRole === 1) {
		// query = Task.find({"period": params.period});

		query = User.find({"parent": params.userId});
		await query.exec((err, users) => {
			if (err) {
				res = [];
			} else {
				ausers = users;
			}
		});
		queryInner = Task.find({user:{$in:ausers}});
		await queryInner.populate('user', 'name').populate('project').exec((err2, tasks) => {
			console.log('query Tasks: ', tasks);
			if (err2) {res = []} else {
				res = tasks;
			}
		});
		// User.find({"parent": params.userId}, async function (err, users) {
		// 	console.log('err: ', err);
		// 	console.log('users: ', users);
		//
		// 	if (err) {return []} else {
		// 		// var auser = [];
		// 		// for (var i = 0, size = users.length; i < size; i++) {
		// 		// 	auser.push(users[i]._id);
		// 		// }
		// 		await Task.find({user:{$in:users}}).populate('user', 'name').populate('project').exec(function(err2, tasks) {
		// 			console.log('err: ', err2);
		// 			console.log('tasks: ', tasks);
		// 			if (err2) {
		// 				res = [];
		// 			} else {
		// 				res = tasks;
		// 			}
		// 		});
		// 	}
		//
		// });
	} else if (uRole === 2) {
		// User.find({"name": params.userName}, function (err, users) {
		// 	console.log('users: ', users);
		// 	if (err) {return []} else {
		// 		Task.find({"user":{$in:users}}).populate('user', 'name').populate('project').exec(function(err, tasks) {
		// 			res = tasks;
		// 		});
		// 	}
		// });

		query = User.find({"name": params.userName});
		await query.exec((err, users) => {
			if (err) {
				res = [];
			} else {
				ausers = users;
			}
		});
		queryInner = Task.find({user:{$in:ausers}});
		await queryInner.populate('user', 'name').populate('project').exec((err2, tasks) => {
			console.log('query Tasks: ', tasks);
			if (err2) {res = []} else {
				res = tasks;
			}
		});
	}
	return res;
};

/**
 * 增加task
 * @param  {[Task]} task [mongoose.model('Task')]
 * @return {[type]}      [description]
 */
const addTask = async (task) => {
	task = await task.save();
	return task
};


module.exports = {
	findAllTasks,
	findTaskByPeriod,
	addTask
};
