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
const findTaskByPeriod = async (period) => {
	var query = Task.find({"period": period});
	var res = [];
	await query.populate(['user_id','project_id']).exec(function(err, tasks) {
		console.log(err + ' ,,,, ' + tasks);
		if(err) {
			res = []
		}else {
			res = tasks
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
	findTaskByPeriod,
	addTask
};
