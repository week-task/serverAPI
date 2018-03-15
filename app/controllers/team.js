/**
 * TEAM表接口controller
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var xss = require('xss');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Team = mongoose.model('Team');
var User = mongoose.model('User');
import teamHelper from '../dbhelper/teamHelper';
import userHelper from '../dbhelper/userHelper';

/**
 * 获取该team项目列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getTeamList = async(ctx, next) => {
	// TODO 需要传入用户role参数，非-1的角色不可以查询
	var data = await teamHelper.findAllTeams();
	if(data && data.length > 0) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: data,
			message: '获取成功'
		};
	} else {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: [],
			message: '没有数据'
		};
	}
};


/**
 * 新增team
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addTeam = async(ctx, next) => {
	var teamName = xss(ctx.request.body.name);
	// 创建leader用户
	var userName = xss(ctx.request.body.username);
	var parent = xss(ctx.request.body.parent);
	// 对密码进行加密
	var salt = bcrypt.genSaltSync(10);
	var hashPassword = bcrypt.hashSync(111, salt);

	var leader = new User({
		_id: new mongoose.Types.ObjectId(),
		name: userName,
		password: hashPassword,
		role: 0,
		parent: parent
	});
	var user = await userHelper.addUser(leader);

	if (user.code === 11000) {
		ctx.status = 500;
		ctx.body = {
			code: 0,
			message: '真笨,已经有这么个人了'
		};
		return;
	}

	var team = new Team({
		name: projectName,
		leader: username
	});
	var res = await teamHelper.addProject(project);
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
 * 排序获取的team列表
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
					name: mItem.name 
				});
			}
		}
	}

	sortByPid(teams, 'tid');

	return teams;
}