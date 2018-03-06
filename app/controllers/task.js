'use strict'

var moment = require('moment')
var xss = require('xss')
var mongoose = require('mongoose')
var Task = mongoose.model('Task')
var jsonwebtoken = require('jsonwebtoken')
var xlsx = require('../util/export')
import TaskHelper from '../dbhelper/TaskHelper'

moment().format();

/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getTaskList = async(ctx, next) => {
	var data = await TaskHelper.findAllTasks();
	ctx.body = {
		code: 0,
		data: data,
		message: '获取成功'
	}
}
exports.addTask = async(ctx, next) => {
	var TaskName = xss(ctx.request.body.name);
	var UserId = xss(ctx.request.body.user_id);
	var ProjectId = xss(ctx.request.body.project_id);
	var Progress = xss(ctx.request.body.progress);
	var Status = xss(ctx.request.body.status);
	var Remark = xss(ctx.request.body.remark);
	var task = new Task({
		name: TaskName,
		user: UserId,
		project: ProjectId,
		progress: Progress,
		status: Status,
		remark: Remark,
		period: moment().format('w'),
		create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
		update_at: moment().format("YYYY-MM-DD HH:mm:ss")
	});

	// 检查新增的任务是不是存在
	var isExistTask = await TaskHelper.isExistTask({name: TaskName, userId: UserId, period: moment().format('w')});

	if (isExistTask.length > 0) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '该任务名称已存在!'
		}
		return;
	}

	var task2 = await TaskHelper.addTask(task);
	if (task2) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: task2,
			message: '保存成功'
		}
	}
}

/**
 * 检查上一期未完成列表,并做本期copy处理
 * @param ctx
 * @param next
 */
exports.checkUnfinishTask = async(ctx, next) => {
	var userId = xss(ctx.request.body.user_id);
	var dataNo = 0;

	var nowWeekOfYear = moment().format('w');

	var preData = await TaskHelper.checkUnfinishTask({period: nowWeekOfYear, userId: userId});
	// console.log('preData: => ', preData);

	// for 循环一条一条对未完成的task列表进行检查
	for (var i = 0, iSize = preData.length; i < iSize; i++) {
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
			// console.log('taskItem ', taskItem);
			let saveUnfinishToNew = await TaskHelper.addTask(taskItem);
			// console.log('saveUnfinishToNew ', saveUnfinishToNew);
			if (saveUnfinishToNew) {
				dataNo += 1;
			}
		}
	}


	if (dataNo === 0) {
		ctx.status = 200;
		ctx.body = {
			code: -1,
			message: '已自动同步上期未完成任务 ' + dataNo + ' 条'
		}
	} else {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			message: '已自动同步上期未完成任务 ' + dataNo + ' 条'
		}
	}




	// //如果已经做了check并且已经保存到最新的一期,就不做后面的操作了
	// if (isCheckAndSave) {
	// 	return;
	// }
	//
	//
	// var saveUnfinishTask = [];
	// for (var x = 0, xSize = preData.length; x < xSize; x++) {
	// 	saveUnfinishTask.push({
	// 		name: preData[x].name,
	// 		user: preData[x].user,
	// 		project: preData[x].project,
	// 		progress: preData[x].progress,
	// 		status: preData[x].status,
	// 		remark: preData[x].remark,
	// 		period: nowWeekOfYear,
	// 		create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
	// 		update_at: moment().format("YYYY-MM-DD HH:mm:ss"),
	// 	});
	// }
	// console.log('saveUnfinishTask ', saveUnfinishTask);
	//
	// var saveUnfinishArr = await TaskHelper.saveUnfinishTask(saveUnfinishTask);
	// console.log('saveUnfinishArr ', saveUnfinishArr);
	// if (saveUnfinishArr && saveUnfinishArr.length > 0) {
	// 	isInsertData = true;
	//
	// }

}

exports.getTaskListByPeriod = async(ctx, next) => {
	var period = xss(ctx.request.body.period);
	var userId = xss(ctx.request.body.userid);
	var userName = xss(ctx.request.body.username);
	var userRole = xss(ctx.request.body.userrole);

	var params = {
		period: period,
		userId: userId,
		userName: userName,
		userRole: userRole
	};



	var data = await TaskHelper.findTaskByPeriod(params);
	// console.log('tasklistbyperiod => ', data);
	// 重新组装结构,使其能为前端服务
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
			// console.log('mItem ', mItem);
			// console.log('nItem ', nItem);
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

	ctx.body = {
		code: 0,
		data: projects,
		message: '获取成功'
	}
}
/**
 * 编辑task
 * @param ctx
 * @param next
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

	var taskById = await TaskHelper.findTaskById(id);
	if (taskById[0].user.toString() !== userId) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '别人的任务,不要瞎改!'
		};
		return;
	}

	if (taskById[0].period.toString() !== moment().format('w')) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '世上没有后悔药!历史不能改变!'
		};
		return;
	}

	var data = await TaskHelper.editTask(params);
	// console.log('edit done  => ', data);
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
 * 删除task
 * @param ctx
 * @param next
 */
exports.delTask = async(ctx, next) => {
	var id = xss(ctx.request.body.id);
	var userId = xss(ctx.request.body.user_id);

	var taskById = await TaskHelper.findTaskById(id);
	if (taskById[0].user.toString() !== userId) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			message: '别人的任务,不要瞎删!'
		};
		return;
	}

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
 * 导出周报,格式为excel
 * @param ctx
 * @param next
 */
exports.exportWeeklyReport = async (ctx, next) => {
	var data = [];
	var fileName = await xlsx.exportExcel(data);
	console.log('callback excel ', fileName);
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
}