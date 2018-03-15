/**
 * 项目表接口controller
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var xss = require('xss');
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
import projectHelper from '../dbhelper/projectHelper';

/**
 * 获取该team项目列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getProjectOptions = async(ctx, next) => {
	console.log('coming')
	var team = xss(ctx.request.body.team);
	var data = await projectHelper.findAllProjects({team: team});
	console.log(data);
	if(data && data.length > 0) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '获取成功'
		}
	}
};

/**
 * 获取项目列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getProjectList = async(ctx, next) => {
	var data = await projectHelper.findAllProjects({});
	ctx.status = 200;
	ctx.body = {
		code: 0,
		data: data,
		message: '获取成功'
	}
};


/**
 * 新增项目
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addProject = async(ctx, next) => {
	var projectName = xss(ctx.request.body.name);
	var projectTeam = xss(ctx.request.body.team);
	var project = new Project({
		_id: new mongoose.Types.ObjectId(),
		name: projectName,
		team: projectTeam
	});
	var res = await projectHelper.addProject(project);
	if (res.code === 11000) {
		ctx.status = 500;
		ctx.body = {
			code: 0,
			message: '真笨,这个项目名称早就有了'
		};
		return;
	}
	if (res.code === 0) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: [],
			message: '新增项目成功'
		}
	}
};

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
 * 从project表读出,封装成前端需要的project list
 * @param data
 * @returns {Array}
 */
function renderProjects (data) {
	
	
	// 重新组装结构,使其能为前端服务
	var projects = [];
	var tempObj = {};

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