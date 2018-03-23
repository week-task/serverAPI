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
	var team = xss(ctx.request.body.team);
	var data = await projectHelper.findAllProjects({team: team, options: true});
	if(data && data.length > 0) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '获取成功'
		}
	} else if (data.length === 0) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '暂无项目，请小组长添加项目'
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
	var team = xss(ctx.request.body.team);
	var data = await projectHelper.findAllProjects({team: team});
	ctx.status = 200;
	ctx.body = {
		code: 0,
		data: renderProjectsByTeams(data),
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
		team: projectTeam,
		status: 0
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
 * 启动已被禁止的项目
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.launchProject = async(ctx, next) => {
	var projectId = xss(ctx.request.body.id);

	var project = await projectHelper.launchProject({id: projectId});
	if (!project) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			data: [],
			message: '启动项目出错'
		};
	} else {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: project,
			message: '启动成功'
		};
	}
};

/**
 * 编辑项目
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.editProject = async(ctx, next) => {
	var projectId = xss(ctx.request.body.id);
	var projectName = xss(ctx.request.body.name);

	var project = await projectHelper.editProject({id: projectId, name: projectName});
	if (!project) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			data: [],
			message: '编辑项目出错'
		};
	} else {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: project,
			message: '编辑成功'
		};
	}
};

/**
 * 删除项目（物理删除，但如果历史记录有相关的project，就禁用，status 0 => 1）
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.deleteProject = async(ctx, next) => {
	var projectId = xss(ctx.request.body.id);

	var project = await projectHelper.deleteProject({id: projectId});
	if (project.err) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			data: [],
			message: '删除项目出错'
		};
		return;
	} 
	if (project.project) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: project,
			message: project.rescode === 0 ? '该任务存在关联任务，已禁用':'已删除'
		};
	}
};

/**
 * 排序获取的project列表
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
function renderProjectsByTeams (data) {
	// 目标结构
	var dataMock = [{
		team: '**团队',
		selected: [],
		data: [
			{id: 1, name: '项目1'},
			{id: 2, name: '项目2'},
			{id: 3, name: '项目3'}
		]
	}];
	
	// 重新组装结构,使其能为前端服务
	var teams = [];
	var tempObj = {};
	var statusZh = {
		0: '启用',
		1: '禁用'
	};

	// get the relevant teams
	for (var i = 0, size = data.length; i < size; i++) {
		if (!tempObj[data[i].team.name]) {
			var item = {
				tid: data[i].team._id,
				team: data[i].team.name, // TODO 这里可以加入leader的信息，好在前台展示
				selected: [],
				data: []
			};
			teams.push(item);
			tempObj[data[i].team.name] = 1;
		}
	}

	// 组装成前端需要的数据结构
	for (var m = 0, mSize = data.length; m < mSize; m++) {
		var mItem = data[m];
		for (var n = 0, nSize = teams.length; n < nSize; n++) {
			var nItem = teams[n];
			if (mItem.team.name === nItem.team) {
				nItem.data.push({
					id: mItem._id,
					tid: nItem.tid, 
					name: mItem.name,
					status: mItem.status,
					statusZh: statusZh[mItem.status]
				});
			}
		}
	}

	sortByPid(teams, 'tid');

	return teams;
}