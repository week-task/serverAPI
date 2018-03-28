/**
 * 用户表接口controller
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var User = mongoose.model('User')
var jsonwebtoken = require('jsonwebtoken')
import userHelper from '../dbhelper/userHelper'
import teamHelper from '../dbhelper/teamHelper'
import projectHelper from '../dbhelper/projectHelper'
import taskHelper from '../dbhelper/taskHelper'
import {secret} from '../../config/index'

/**
 * 登录逻辑
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.login = async(ctx, next) => {
	var userName = xss(ctx.request.body.username);
	var password = xss(ctx.request.body.password);

	if (userName === '' || password === '') {
		ctx.status = 200;
		ctx.body = {
			code: -1,
			message: '用户名或密码不能为空!'
		};
		return;
	}

	var user = await userHelper.findUser(userName);
	if(!user) {
		ctx.status = 401;
		ctx.body = {
			code: -1,
			message: '根本就没这个人'
		};
		return;
	} 

	if (user.status && user.status === 1) {
		ctx.status = 401;
		ctx.body = {
			code: -1,
			message: '您已离职'
		};
		return;
	}
	
	if (user.status === null || user.status === undefined) {
		await userHelper.addStatus4User(user._id);
	}

	if (user.password === '111' || user.password === 'asdf') {
		// 如果用户的密码是111，说明是v1.0.0版本的用户，此时要用salt重新加一次密，并存入salt
		var prevSalt = bcrypt.genSaltSync(10);
		var prevPassword = bcrypt.hashSync(user.password, prevSalt);
		user = await userHelper.updatePrevPassword({user: user, salt: prevSalt, password: prevPassword});
	}

	var salt = user.salt;
	var hashPassword = bcrypt.hashSync(password, salt);
	if (user.password === hashPassword) {
		// username and password are correct
		var teamInfo = {};
		if (user.role === -1) {
			teamInfo.name = '总监';
			// var projects = await projectHelper.initOldVersionProject(user);
		} else {
			teamInfo = await teamHelper.findTeam(user.team);
		}
		var userInfo = {
			_id: user._id,
			parent_id: user.parent,
			name: user.name,
			role: user.role,
			team: user.team,
			teamName: teamInfo.name
		};
		
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: {
				user: userInfo,
				token: jsonwebtoken.sign({
					data: userInfo,
					exp: Math.floor(Date.now() / 1000) + (60 * 60 * 15) // 60 seconds * 60 minutes * 3 = 3 hour
				}, secret)
			},
			message: '登录成功!'
		};
	} else {
		// password is wrong
		ctx.status = 500;
		ctx.body = {
			code: 500,
			data: [],
			message: '密码都记不住了吗?'
		};
	}

};

/**
 * 新增用户
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.addUser = async(ctx, next) => {
	var userName = xss(ctx.request.body.name);
	// var password = xss(ctx.request.body.password);
	var project = xss(ctx.request.body.project);
	var parent = xss(ctx.request.body.parent);
	var role = xss(ctx.request.body.role);
	var status = xss(ctx.request.body.status);
	var team = xss(ctx.request.body.team);
	
	// 对密码进行加密
	var salt = bcrypt.genSaltSync(10);
	var hashPassword = bcrypt.hashSync('111', salt);

	var userObj = new User({
		_id: new mongoose.Types.ObjectId(),
		name: userName,
		password: hashPassword,
		salt: salt,
		role: role,
		status: status,
		parent: parent,
		team: team
	});

	var user = new User(userObj);
	var newUser = await userHelper.addUser(user);
	// console.log('newUser', newUser);
	if (newUser.code === 11000) {
		ctx.status = 500;
		ctx.body = {
			code: 0,
			message: '真笨,已经有这么个人了'
		};
		return;
	}
	
	if (newUser && newUser.role === 1) {
		var changeUser = await userHelper.updateUserParentSelf({id: newUser._id});
		// console.log('changeUser ', changeUser);
		if (!changeUser) {
			ctx.status = 500;
			ctx.body = {
				code: -1,
				data: [],
				message: '新增小组长失败'
			}
			return;
		}
	}
	ctx.status = 200;
	ctx.body = {
		code: 0,
		data: newUser,
		message: '新增成功'
	}
}

/**
 * 用户编辑
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.editUser = async(ctx, next) => {
	var userId = xss(ctx.request.body.id);
	var userName = xss(ctx.request.body.name);
	var parent = xss(ctx.request.body.parent);
	var role = xss(ctx.request.body.role);
	var status = xss(ctx.request.body.status);
	var team = xss(ctx.request.body.team);

	var updateUser = await userHelper.editUser({userId: userId, userName: userName, parent: parent, role: role, status: status});
	if (updateUser.code === 500) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			data: [],
			message: '该小组长还存在组员，不可以变更角色！'
		};
		return;
	} 
	if (updateUser) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: updateUser,
			message: '修改用户成功'
		}
	}
};

/**
 * 离职或者删除用户
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.deleteUser = async(ctx, next) => {
	var userId = xss(ctx.request.body.id);

	// 如果是有关联的相关任务，就只能设置为离职状态
	// 如果角色为1的小组长，就不能被删除，可以通过关联任务设置为离职
	// 如果角色为2的组员，只要没有关联的任务，均可以被物理删除
	var task = await taskHelper.findTaskByUser(userId);
	console.log(task);
	if (task.length > 0) {
		var offUser = await userHelper.deleteUser({id: userId, options: 'off'});
		if (offUser.rescode === 0) {
			ctx.status = 500;
			ctx.body = {
				code: -1,
				data: task,
				message: '这个人关联历史任务，不可以删除，将变更为离职状态！'
			};
			return;
		}
	}

	var relevantUser = await userHelper.findUserById({id: userId});
	var parentUser = await userHelper.findUsersByParent({parent: userId});

	if (relevantUser.role === 1 && parentUser.length > 1) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			data: task,
			message: '这位小组长下面还有组员，不可以删除！'
		};
		return;
	}

	var user = await userHelper.deleteUser({id: userId, options: 'on'});
	if (user.rescode === 1) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: [],
			message: '删除成功'
		};
	}
};

/**
 * 修改密码
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.changePassword = async(ctx, next) => {
	var userId = xss(ctx.request.body.userId);
	var password = xss(ctx.request.body.password);
	var oldPassword = xss(ctx.request.body.oldPassword);
	var user = await userHelper.findUserById({id:userId});
	var salt = user.salt;

	var oldHashPassword = bcrypt.hashSync(oldPassword, salt);

	if (oldHashPassword !== user.password) {
		ctx.status = 500;
		ctx.body = {
			code: 0,
			data: [],
			message: '原密码对不上，不能修改！'
		};
		return;
	}

	var hashPassword = bcrypt.hashSync(password, salt);
	var passUser = await userHelper.changePassword({userId: userId, password: hashPassword});
	if (passUser) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: passUser,
			message: '密码已修改'
		}
	}
};

/**
 * 获取用户列表
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.getUserList = async(ctx, next) => {
	// TODO 这里需要几个判断条件，来判断需要返回的user list
	var type = xss(ctx.request.body.type);
	var team = xss(ctx.request.body.team);

	var userList;
	if (type === 'options') {
		userList = await userHelper.findUsersByTeam({team: team, role: 1});
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: userList,
				message: '获取成功'
			};
		}
	} else if (type ==='all') {
		userList = await userHelper.findUsersByTeam({team: team});
		// console.log('userList,  ', userList);
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: renderUsersByTeams(userList),
				message: '获取成功'
			}
		}
	}
};

/**
 * 排序获取的User列表
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
function renderUsersByTeams (data) {
	// 目标结构
	var dataMock = [{
		user: '**小组长',
		selected: [],
		data: [
			{id: 1, name: '项目1'},
			{id: 2, name: '项目2'},
			{id: 3, name: '项目3'}
		]
	}];
	
	// 重新组装结构,使其能为前端服务
	var users = [];
	// var tempObj = {};
	var statusZh = {
		0: '在职',
		1: '离职'
	};
	var roleZh = {
		0: '团队负责人',
		1: '小组长',
		2: '组员',
	};

	// get the relevant users
	for (var i = 0, size = data.length; i < size; i++) {
		if (data[i].role === 1) {
			var item = {
				uid: data[i]._id,
				user: data[i].name, 
				selected: [],
				data: []
			};
			users.push(item);
		}
	}

	// 组装成前端需要的数据结构
	for (var m = 0, mSize = users.length; m < mSize; m++) { // 小组长
		var mItem = users[m];
		for (var n = 0, nSize = data.length; n < nSize; n++) { // 循环users，匹配对应的parent
			var nItem = data[n];
			// console.log('nItem ----------------------------> ', nItem)
			// console.log('nItem.parent === mItem.uid  ', nItem.parent === mItem.uid);
			// console.log('mongoose.Types.ObjectId(nItem.parent) === mItem.uid  ', mongoose.Types.ObjectId(nItem.parent) === mItem.uid);
			// console.log('nItem.parent === mItem.uid.toString()  ', nItem.parent === mItem.uid.toString());
			// console.log('nItem._id !== mItem.uid  ', nItem._id !== mItem.uid);
			if (nItem.parent === mItem.uid.toString()) {
				// console.log('nItem ==========================> ', nItem)
				mItem.data.push({
					id: nItem._id,
					name: nItem.name,
					status: nItem.status,
					statusZh: statusZh[nItem.status],
					role: nItem.role,
					roleZh: roleZh[nItem.role],
					team: nItem.team,
					parent: nItem.parent
				});
			} else {
				// console.log('mItem => ', mItem)
				// console.log('nItem => ', nItem)
				// console.log('nItem.parent => ', nItem.parent)
				// console.log('mItem.uid => ', mItem.uid)
				// console.log('nItem._id => ', nItem._id)
				// console.log('mItem.uid => ', mItem.uid)
				// console.log('typeof nItem.parent => ', typeof nItem.parent)
				// console.log('typeof nItem.parent => ', typeof mongoose.Types.ObjectId(nItem.parent))
				// console.log('typeof mItem.uid => ', typeof mItem.uid)
				// console.log('typeof nItem._id => ', typeof nItem._id)
				// console.log('typeof mItem.uid => ', typeof mItem.uid)
			}
		}
	}

	sortByPid(users, 'uid');

	return users;
}