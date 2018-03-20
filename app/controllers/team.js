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
 * 获取该team leader列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getTeamLeaderList = async(ctx, next) => {
	var data = await teamHelper.findAllTeamLeaders();
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
 * 新增team leader
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addTeamLeader = async(ctx, next) => {
	// 创建leader用户
	var userName = xss(ctx.request.body.name);
	var self = xss(ctx.request.body.self);
	// 对密码进行加密
	var salt = bcrypt.genSaltSync(10);
	var hashPassword = bcrypt.hashSync('admin', salt);

	var leader = new User({
		_id: new mongoose.Types.ObjectId(),
		name: userName,
		password: hashPassword,
		salt: salt,
		role: 0,
		status: 0,
		parent: self
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
	if (user.code === 0) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: [],
			message: '新增团队leader成功'
		}
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
	var user = xss(ctx.request.body.userName);
	var self = xss(ctx.request.body.self);
	var team = new Team({
		name: teamName,
		leader: user
	});
	var res = await teamHelper.addTeam(team);
	if (res.code === 11000) {
		ctx.status = 500;
		ctx.body = {
			code: 0,
			message: '真笨,这个团队名称早就有了'
		};
		return;
	}
	if (res) {
		// 创建成果后，应该更新对应的user及其team
		var bindUser = await userHelper.bindTeam4User({user: user, team:res._id});
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: res,
			message: '新增团队成功'
		}
	}
};

/**
 * 修改team
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.editTeam = async(ctx, next) => {
	var teamId = xss(ctx.request.body.id);
	var teamName = xss(ctx.request.body.name);
	var user = xss(ctx.request.body.userName);

	// // 修改team信息，如果只是修改teamName，那就只需要更新team一张表，如果修改了团队负责人，那么连同user表下的team也要一起更改，所以这里要进行预先判断
	// var team = await teamHelper.findTeam(teamId);
	// console.log('team: ', team);
	// if (team.leader._id + '' === teamName) {

	// }

	var updateTeam = await teamHelper.editTeam({teamId: teamId, teamName: teamName, user: user});
	console.log('updateTeam ', updateTeam);
	if (updateTeam) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: updateTeam,
			message: '修改团队成功'
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