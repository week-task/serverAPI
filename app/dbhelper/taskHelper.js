/**
 * 任务表数据库CRUD
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var mongoose =  require('mongoose');
var Task = mongoose.model('Task');
var User = mongoose.model('User');

/**
 * 查找所有task
 * @return {[type]} [description]
 */
const findAllTasks = async () => {
	var query = Task.find({});
	var res = [];
	await query.exec(function(err, tasks) {
		if (err) {
			res = [];
		} else {
			res = tasks;
		}
	});
	return res;
};

/**
 * 根据ID查找task
 * @return {[type]} [description]
 */
const findTaskById = async (id) => {
	var query = Task.find({_id: id});
	var res = [];
	await query.exec(function(err, tasks) {
		if (err) {
			res = [];
		} else {
			res = tasks;
		}
	});
	return res;
};

/**
 * 根据用户查找task
 * @return {[type]} [description]
 */
const findTaskByUser = async (id) => {
	var query = Task.find({user: id});
	var res = [];
	await query.exec(function(err, tasks) {
		if (err) {
			res = [];
		} else {
			res = tasks;
		}
	});
	return res;
};

/**
 * 通过period,status,user查询上一期未完成的任务
 * @param params
 * @returns {Array}
 */
const checkUnfinishTask = async (params) => {
	var query = Task.find({period: parseInt(params.period) - 1, status: {$ne: 2}, user: params.userId});
	var res = [];
	await query.exec((err, tasks) => {
		if (err) {
			res = [];
		} else {
			res = tasks;
		}
	});
	return res;
};

/**
 * 通过period,status,user查询本期已经存在的未完成任务
 * @param params
 * @returns {Array}
 */
const isExistTask = async (params) => {
	var query = Task.find({name: params.name, period: params.period, user: params.userId});
	var res = [];
	await query.exec((err, tasks) => {
		if (err) {
			res = [];
		} else {
			res = tasks;
		}
	});
	return res;
};

/**
 * 查找相关task,根据用户的角色不一样进行对应的查找
 * @return {[type]} [description]
 */
const findTaskByPeriod = async (params) => {
	var query, queryInner, ausers = [], res = [], uRole = parseInt(params.userRole);

	// role = -1是super管理员的情况, 根据不同的具体情况做定论，因为为-1的角色，不会直接展示所有的task，必然是根据不同的team和团队来进行展示的，也就是会传入不同的team，那-1这种情况就不必再重复
	//role = 0 是team管理员的情况,根据team
	//  if (uRole === 0) { // edit on 2018-05-09:v1.2.4 所有人都可以看到该team所有的项目情况
		query = User.find({"team": params.team});
		// 查出用户数组,方便查询相关任务
		await query.exec((err, users) => {
			if (err) { ausers = []; }
			else {
				ausers = users;
			}
		});
		// console.log('ausers => ', ausers);
		// console.log('params => ', params);
		queryInner = Task.find({user:{$in:ausers}, period: params.period});
		await queryInner.populate('user', 'name').populate('project').exec((err2, tasks) => {
			if (err2) {res = []}
			else {
				res = tasks;
			}
		});
	// edit on 2018-05-09:v1.2.4 所有人都可以看到该team所有的项目情况
	// } else {
	// 	if (uRole === 1) { //如果是小组长,就通过parent来查找
	// 		query = User.find({"parent": params.userId});
	// 	} else { //如果是本人,就匹配名字
	// 		query = User.find({"name": params.userName});
	// 	}
	// 	// 查出用户数组,方便查询相关任务
	// 	await query.exec((err, users) => {
	// 		if (err) { res = []; }
	// 		else {
	// 			ausers = users;
	// 		}
	// 	});
	// 	//根据用户数组,可以分用户角色查询出不同的task列表,如果是小组长,查询出来的是他本人和他下面的组员所有信息
	// 	//如果是本人,就$in里面只有自己的信息,查询出来自己的相关列表
	// 	queryInner = Task.find({user:{$in:ausers}, period: params.period});
	// 	await queryInner.populate('user', 'name').populate('project').exec((err2, tasks) => {
	// 		if (err2) {res = []}
	// 		else {
	// 			res = tasks;
	// 		}
	// 	});
	// }
	return res;
};

/**
 * 搜索关键字查询task
 * @return {[type]} [description]
 */
const findTaskByKeyword = async (params) => {
	var query, queryInner, ausers = [], res = [];
	var keyword = new RegExp(params.keyword, 'i');
	query = User.find({'team': params.team, $or:[{'name': keyword}]});
	// 查出用户数组,方便查询相关任务
	await query.exec((err, users) => {
		if (err) { ausers = []; }
		else {
			ausers = users;
		}
	});

	// console.log('ausers => ', ausers);
	// console.log('params => ', params);
	// if (ausers.length > 0) {
	// 	queryInner = Task.find({user:{$in:ausers}, period: params.period});
	// } else {
	// 	queryInner = Task.find({$or:[{name: keyword}], period: params.period});
	// }
	
	queryInner = Task.find({$or:[{name: keyword},{user:{$in:ausers}}], period: params.period});

	await queryInner.populate('user', 'name').populate('project').exec((err2, tasks) => {
		if (err2) {res = []}
		else {
			res = tasks;
		}
	});
	return res;
};

/**
 * 本期完成周报人
 * @param {*} params 参数对象
 * @returns {[users]}
 */
const finishedUsers = async (params) => {
	var res, ausers = [];
	var query = User.find({"team": params.team});
	// 查出用户数组,方便查询相关任务
	await query.exec((err, users) => {
		if (err) { res = []; }
		else {
			ausers = users;
		}
	});
	var queryInner = Task.find({user:{$in:ausers}, period: params.period});
	await queryInner.distinct('user').populate('user').populate('project').exec((err2, tasks) => {
		if (err2) {res = []}
		else {
			res = tasks;
		}
	});
	return res;
};

/**
 * 增加task
 * @param  {[Task]} task [mongoose.model('Task')]
 * @return {[type]}      [description]
 */
const addTask = async (task) => {
	task = await task.save();
	return task;
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
	findTaskByUser,
	findTaskById,
	findTaskByPeriod,
	findTaskByKeyword,
	isExistTask,
	checkUnfinishTask,
	finishedUsers,
	addTask,
	editTask,
	delTask
};
