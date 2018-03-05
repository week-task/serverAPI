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
 * 根据ID查找task
 * @return {[type]} [description]
 */
const findTaskById = async (id) => {
	var query = Task.find({_id: id});
	var res = [];
	await query.exec(function(err, tasks) {
		// console.log('tasks:=> ',tasks);
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
	// console.log('userRole: ', params.userRole);

	if (uRole === 0) {
		query = Task.find({"period": params.period});
		await query.populate('user', 'name').populate('project').exec(function(err, tasks) {
			// console.log(err + ' ,,,, ' + tasks);
			if(err) {
				res = [];
			}else {
				res = tasks;
			}
		})
	} else {
		// query = Task.find({"period": params.period});

		if (uRole === 1) {
			query = User.find({"parent": params.userId});
		} else {
			query = User.find({"name": params.userName});
		}
		await query.exec((err, users) => {
			if (err) { res = []; }
			else {
				ausers = users;
			}
		});
		queryInner = Task.find({user:{$in:ausers}, period: params.period});
		await queryInner.populate('user', 'name').populate('project').exec((err2, tasks) => {
			// console.log('query Tasks: ', tasks);
			if (err2) {res = []}
			else {
				res = tasks;
			}
		});
	}
	// else if (uRole === 2) {
	//
	// 	query = User.find({"name": params.userName});
	// 	await query.exec((err, users) => {
	// 		if (err) { res = []; }
	// 		else {
	// 			ausers = users;
	// 		}
	// 	});
	// 	queryInner = Task.find({user:{$in:ausers}, period: params.period});
	// 	await queryInner.populate('user', 'name').populate('project').exec((err2, tasks) => {
	// 		console.log('query Tasks: ', tasks);
	// 		if (err2) {res = []}
	// 		else {
	// 			res = tasks;
	// 		}
	// 	});
	// }
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

/**
 * 编辑task
 * @param  {[Task]} task [mongoose.model('Task')]
 * @return {[type]}      [description]
 */
const editTask = async (params) => {
	var query = Task.findByIdAndUpdate(params.id, {
		name:params.name,
		project:params.project,
		progress:params.progress,
		status:params.status,
		remark:params.remark,
		update_at:params.update_at,
	});
	var res = [];
	await query.exec((err, task) => {
		// console.log(err + ' ===== ' + task);
		if (err) {
			res = [];
		} else {
			res = task;
		}
	});
	return res;
};

/**
 * 删除task
 * @param  {[Task]} task [mongoose.model('Task')]
 * @return {[type]}      [description]
 */
const delTask = async (id) => {
	var query = Task.remove({_id: id});
	var res = undefined;
	await query.exec((err, task) => {
		// console.log(err + ' ===== ' + task);
		if (err) {
			res = err;
		} else {
			res = 'success';
		}
	});
	return res;
};


module.exports = {
	findAllTasks,
	findTaskById,
	findTaskByPeriod,
	addTask,
	editTask,
	delTask
};
