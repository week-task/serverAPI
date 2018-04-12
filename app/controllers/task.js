/**
 * 任务表接口controller
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var moment = require('moment');
var xss = require('xss');
var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var xlsx = require('../util/export');
import TaskHelper from '../dbhelper/taskHelper';
import userHelper from '../dbhelper/userHelper';

/**
 * 新增任务
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addTask = async(ctx, next) => {
	var taskName = xss(ctx.request.body.name);
	var userId = xss(ctx.request.body.user_id);
	var projectId = xss(ctx.request.body.project_id);
	var progress = xss(ctx.request.body.progress);
	var status = xss(ctx.request.body.status);
	var remark = xss(ctx.request.body.remark);	
	var task = new Task({
		name: taskName,
		user: userId,
		project: projectId,
		progress: progress,
		status: status,
		remark: remark,
		period: moment().format('w'),
		create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
		update_at: moment().format("YYYY-MM-DD HH:mm:ss")
	});

	// 检查新增的任务是不是存在
	var isExistTask = await TaskHelper.isExistTask({name: taskName, userId: userId, period: moment().format('w')});

	if (isExistTask.length > 0) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '该任务名称已存在!'
		};
		return;
	}

	var taskObj = await TaskHelper.addTask(task);
	if (taskObj) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: taskObj,
			message: '保存成功'
		}
	}
}

/**
 * 检查上一期未完成列表,并做本期copy处理
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.checkUnfinishTask = async(ctx, next) => {
	var userId = xss(ctx.request.body.user_id);
	var dataNo = 0;
	var nowWeekOfYear = moment().format('w');

	var preData = await TaskHelper.checkUnfinishTask({period: nowWeekOfYear, userId: userId});
	// for 循环一条一条对未完成的task列表进行检查
	for (let i = 0, iSize = preData.length; i < iSize; i++) {
		let item = preData[i];
		let isExistTask = await TaskHelper.isExistTask({period: nowWeekOfYear, userId: userId, name: item.name});
		// 如果在最新的一期已经存在该任务,就不用管了,
		if (isExistTask.length > 0) {
			console.log('最新一期已存在该任务');
			continue;
		} else if (isExistTask.length === 0) { // 如果最新的一期没有该未完成的任务,就新增到最新一期
			let taskItem = new Task({
				name: item.name,
				user: item.user,
				project: item.project,
				progress: item.progress,
				status: item.status,
				remark: item.remark,
				period: nowWeekOfYear,
				create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
				update_at: moment().format("YYYY-MM-DD HH:mm:ss")
			});
			let saveUnfinishToNew = await TaskHelper.addTask(taskItem);
			if (saveUnfinishToNew) {
				dataNo += 1;
			}
		}
	}

	ctx.status = 200;
	ctx.body = {
		code: dataNo === 0 ? -1 : 0,
		message: '已自动同步上期未完成任务 ' + dataNo + ' 条'
	};

	// if (dataNo === 0) {
	// 	ctx.status = 200;
	// 	ctx.body = {
	// 		code: -1,
	// 		message: '已自动同步上期未完成任务 ' + dataNo + ' 条'
	// 	}
	// } else {
	// 	ctx.status = 200;
	// 	ctx.body = {
	// 		code: 0,
	// 		message: '已自动同步上期未完成任务 ' + dataNo + ' 条'
	// 	}
	// }
};

/**
 * 通过period获取任务列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getTaskListByPeriod = async(ctx, next) => {
	var period = xss(ctx.request.body.period);
	var userId = xss(ctx.request.body.userid);
	var userName = xss(ctx.request.body.username);
	var userRole = xss(ctx.request.body.userrole);
	var team = xss(ctx.request.body.team);

	var params = {
		period: period,
		userId: userId,
		userName: userName,
		userRole: userRole,
		team: team
	};
	var data = await TaskHelper.findTaskByPeriod(params);
	var projects = renderProjects(data);
	ctx.body = {
		code: 0,
		data: projects,
		message: '获取成功'
	}
};

/**
 * 编辑任务
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.updateTaskById = async(ctx, next) => {
	var id = xss(ctx.request.body.id);
	var taskName = xss(ctx.request.body.name);
	var userId = xss(ctx.request.body.user_id);
	var projectId = xss(ctx.request.body.project_id);
	var progress = xss(ctx.request.body.progress);
	var status = xss(ctx.request.body.status);
	var remark = xss(ctx.request.body.remark);
	var params = {
		id: id,
		name: taskName,
		project: projectId,
		progress: progress,
		status: status,
		remark: remark,
		update_at: moment().format("YYYY-MM-DD HH:mm:ss")
	};

	// 检查此任务是否为自己的任务,为了防止role=2的小组长篡改
	var taskById = await TaskHelper.findTaskById(id);
	if (taskById[0].user.toString() !== userId) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '别人的任务,不要瞎改!'
		};
		return;
	}

	// 不能更改之前的历史周报
	if (taskById[0].period.toString() !== moment().format('w')) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '世上没有后悔药!历史不能改变!'
		};
		return;
	}

	var data = await TaskHelper.editTask(params);
	if (data) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '修改成功'
		};
	} else {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: data
		};
	}
}

/**
 * 删除任务
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.delTask = async(ctx, next) => {
	var id = xss(ctx.request.body.id);
	var userId = xss(ctx.request.body.user_id);

	// 不可以删除别人的任务,此项检查主要是防止小组长篡改
	var taskById = await TaskHelper.findTaskById(id);
	if (taskById[0].user.toString() !== userId) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '别人的任务,不要瞎删!'
		};
		return;
	}

	// 历史记录不可以删除
	if (taskById[0].period.toString() !== moment().format('w')) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '世上没有后悔药!历史不能改变!'
		};
		return;
	}

	var data = await TaskHelper.delTask(id);
	if (data === 'success') {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '删除成功'
		};
	} else {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: data
		};
	}
}

/**
 * 排序获取的task列表
 * @param objArr
 * @param field
 * @returns {Query|Array.<T>|*|Aggregate}
 */
function sortByPid(objArr, field) {

	// 指定排序的比较函数
	const compare = (property) => {
		return (obj1, obj2) => {
			var value1 = obj1[property];
			var value2 = obj2[property];
			return value1 - value2;     // 升序
		}
	};

	return objArr.sort(compare(field));
}

/**
 * 从task表读出,封装成前端和excel需要的task列表
 * @param data
 * @returns {Array}
 */
function renderProjects (data) {
	// 重新组装结构,使其能为前端和excel服务
	var projects = [];
	var tempObj = {};
	var statusZh = {
		'0': '开发中',
		'1': '已提测',
		'2': '已上线'
	};

	// get the relevant projects
	for (var i = 0, size = data.length; i < size; i++) {
		if (!tempObj[data[i].project.name]) {
			var item = {
				pid: data[i].project._id,
				project: data[i].project.name,
				selected: [],
				data: []
			};
			projects.push(item);
			tempObj[data[i].project.name] = 1;
		}
	}
	// 组装成前端需要的数据结构
	for (var m = 0, mSize = data.length; m < mSize; m++) {
		var mItem = data[m];
		for (var n = 0, nSize = projects.length; n < nSize; n++) {
			var nItem = projects[n];
			if (mItem.project.name === nItem.project) {
				nItem.data.push({
					id: mItem._id,
					name: mItem.name,
					user: mItem.user,
					username: mItem.user.name,
					project: mItem.project,
					progress: mItem.progress,
					progressPercent: mItem.progress + '%',
					status: mItem.status,
					statusZh: statusZh[mItem.status],
					remark: mItem.remark,
					period: mItem.period,
					create_at: mItem.create_at,
					update_at: mItem.update_at
				});
			}
		}
	}

	sortByPid(projects, 'pid');

	return projects;
}

/**
 * 判断出当期没有完成周报的用户
 * @param ctx
 * @param next
 */
exports.unfinishedUsers = async (ctx, next) => {
	var team = xss(ctx.request.body.team);
	var period = xss(ctx.request.body.period);

	// 首先查找出该team下的所有组员
	var allUsers = await userHelper.findUsersByTeam({team: team});
	// 根据period查询出该期task已经有哪些人已经填写过，然后这里要先判断是否存在新的任务，一旦有，说明填写过，如果没有，
	var finishedUsers = await TaskHelper.finishedUsers({team: team, period: period});
	// console.log('finishedUsers: ', finishedUsers);

	finishedUsers.map((value, index, array) => {
		finishedUsers[index] = {_id: value};
	});

	var map = {};
	[...allUsers, ...finishedUsers].map((item, index) => {
		// if (!map[item._id] && index < allUsers.length) {
		// 	map[item._id] = index;
		// } else {
		// 	delete map[item._id];
		// }
		map[item._id] = !map[item._id] && index < allUsers.length ? item : false
	});
	var ret = [], retUsers = [];
	Object.keys(map).filter(key => {
		map[key] && map[key].role > 0 && map[key].status === 0 && ret.push(map[key].name);
		// map[key] && retUsers.push(map[key]);

		// if (map[key] && map[key].role > 0 && map[key].status === 0) {
		// 	retUsers.push(map[key]);
		// 	ret.push(map[key].name);
		// }

	});

	ctx.status = 200;
	ctx.body = {
		code: 0,
		data: ret,
		message: '第' + period + '期周报未填写的人员：' + ret.join(', ')
	};

	// TODO 就判断task状态、进度、备注、所属项目是否跟上期一致
	// 如果一致，说明只是登录了，并没有更新任务，
	//如果不一致，说明已经有任务进行了修改，算完成了周报
};

/**
 * 导出周报,格式为excel
 * @param ctx
 * @param next
 */
exports.exportWeeklyReport = async (ctx, next) => {

	var period = xss(ctx.request.body.period);
	var team = xss(ctx.request.body.team);
	var preData = await TaskHelper.findTaskByPeriod({userRole: 0, period: period, team: team});
	if (preData && preData.length === 0) {
		ctx.status = 500;
		ctx.body = {
			code: -2,
			message: '第' + period + '期周报暂无数据'
		};
		return;
	}

	var data = renderProjects(preData);
	var fileName = await xlsx.exportExcel(data, period);
	// console.log('callback excel ', fileName);
	if(fileName) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: {
				url: fileName
			},
			message: '获取成功'
		}
	} else {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '导出文件拉取失败'
		}
	}
};