'use strict'

var mongoose =  require('mongoose')
var Task = mongoose.model('Task')

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
const findTask = async (name) => {
	var query = Task.findOne({name});
	var res = null;
	await query.exec(function(err, task) {
		if(err) {
			res = {}
		}else {
			res = task
		}
	})
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
	findTask,
	addTask
};
