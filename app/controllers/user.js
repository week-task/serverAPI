/**
 * 用户表接口controller
 * @author karl.luo<360512239@qq.com>
 */
'use strict'

var moment = require('moment')
var xss = require('xss')
var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var User = mongoose.model('User')
var jsonwebtoken = require('jsonwebtoken')
import userHelper from '../dbhelper/userHelper'
import teamHelper from '../dbhelper/teamHelper'
import projectHelper from '../dbhelper/projectHelper'
import taskHelper from '../dbhelper/taskHelper'
import kokrHelper from '../dbhelper/kokrHelper'
import vokrHelper from '../dbhelper/vokrHelper'
import { secret } from '../../config/index'

/**
 * 登录逻辑
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.login = async (ctx, next) => {
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
	if (!user) {
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
		user = await userHelper.updatePrevPassword({ user: user, salt: prevSalt, password: prevPassword });
	}

	var salt = user.salt;
	var hashPassword = bcrypt.hashSync(password, salt);
	if (user.password === hashPassword) {
		// username and password are correct
		var teamInfo = {};
		if (user.role === -1) {
			teamInfo.name = '总监';
			// var initUserIntroFrozenTime = await userHelper.addUserIntroFrozenTime();
			// var fixTheBMWName = await userHelper.changeBMWName();
			// var initUserPRole = await userHelper.addUserPRoleField4User();
			// var initUserUpdated = await userHelper.addEnergyTimeField4User();
			// var initEnergy = await userHelper.addEnergyField4User();
			// var projects = await projectHelper.initOldVersionProject(user);
		} else if (user.role === 0) {
			// TODO update the task table 'year' field
			teamInfo = await teamHelper.findTeam(user.team);
		} else {
			teamInfo = await teamHelper.findTeam(user.team);
		}
		var userInfo = {
			_id: user._id,
			parent_id: user.parent,
			name: user.name,
			role: user.role,
			team: user.team,
			teamName: teamInfo.name,
			pRole: user.p_role,
			avatar: user.avatar
		};

		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: {
				user: userInfo,
				token: jsonwebtoken.sign({
					data: userInfo,
					exp: Math.floor(Date.now() / 1000) + (60 * 60 * 15) // 60 seconds * 60 minutes * 3 = 3 hour
				}, secret) + 'z|' + user.role
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
exports.addUser = async (ctx, next) => {
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
		team: team,
		avatar: '',
		email: '',
		tel: 0,
		motto: '',
		energy: 100,
		energy_desc: '',
		updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
		p_role: 0
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
		var changeUser = await userHelper.updateUserParentSelf({ id: newUser._id });
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
exports.editUser = async (ctx, next) => {
	var userId = xss(ctx.request.body.id);
	var userName = xss(ctx.request.body.name);
	var parent = xss(ctx.request.body.parent);
	var role = xss(ctx.request.body.role);
	var status = xss(ctx.request.body.status);
	var team = xss(ctx.request.body.team);
	var pRole = xss(ctx.request.body.pRole);

	var updateUser = await userHelper.editUser({ userId: userId, userName: userName, parent: parent, role: role, status: status, pRole: pRole });
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
 * 用户自己编辑
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.editUserInfo = async (ctx, next) => {
	var userId = xss(ctx.request.body.id);
	var motto = xss(ctx.request.body.motto);
	var tel = xss(ctx.request.body.tel);
	var email = xss(ctx.request.body.email);
	var intro = xss(ctx.request.body.intro);
	var team = xss(ctx.request.body.team);

	var updateUser = await userHelper.editUserInfo({ userId: userId, motto: motto, tel: tel, email: email, intro: intro });

	if (updateUser) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: updateUser,
			message: '更新资料成功'
		}
	}
};

/**
 * 离职或者删除用户
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.deleteUser = async (ctx, next) => {
	var userId = xss(ctx.request.body.id);

	// 如果是有关联的相关任务，就只能设置为离职状态
	// 如果角色为1的小组长，就不能被删除，可以通过关联任务设置为离职
	// 如果角色为2的组员，只要没有关联的任务，均可以被物理删除
	var task = await taskHelper.findTaskByUser(userId);
	// console.log(task);
	if (task.length > 0) {
		var offUser = await userHelper.deleteUser({ id: userId, options: 'off' });
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

	var relevantUser = await userHelper.findUserById({ id: userId });
	var parentUser = await userHelper.findUsersByParent({ parent: userId });

	if (relevantUser.role === 1 && parentUser.length > 1) {
		ctx.status = 500;
		ctx.body = {
			code: -1,
			data: task,
			message: '这位小组长下面还有组员，不可以删除！'
		};
		return;
	}

	var user = await userHelper.deleteUser({ id: userId, options: 'on' });
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
exports.changePassword = async (ctx, next) => {
	var userId = xss(ctx.request.body.userId);
	var password = xss(ctx.request.body.password);
	var oldPassword = xss(ctx.request.body.oldPassword);
	var user = await userHelper.findUserById({ id: userId });
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
	var passUser = await userHelper.changePassword({ userId: userId, password: hashPassword });
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
 * 获取个人详情
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.getUserInfo = async (ctx, next) => {
	var userId = xss(ctx.request.body.id);
	var existUser = await userHelper.findUserById({ id: userId });
	if (existUser) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: existUser,
			message: '获取用户成功'
		}
	}
};

/**
 * 重置密码
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.resetPass = async (ctx, next) => {
	var userId = xss(ctx.request.body.id);

	var existUser = await userHelper.findUserById({ id: userId });
	var resetpass = bcrypt.hashSync('111', existUser.salt);
	var resetPassUser = await userHelper.changePassword({ userId: userId, password: resetpass });
	if (resetPassUser) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: resetPassUser,
			message: '密码已重置'
		}
	}
};

/**
 * 获取用户列表
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.getUserList = async (ctx, next) => {
	// TODO 这里需要几个判断条件，来判断需要返回的user list
	var type = xss(ctx.request.body.type);
	var team = xss(ctx.request.body.team);
	// var queue = xss(ctx.request.body.queue);
	var parentId = xss(ctx.request.body.parentId);

	var userList;
	if (type === 'options') {
		userList = await userHelper.findUsersByTeam({ team: team, role: 1 });
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: userList,
				message: '获取成功'
			};
		}
	} else if (type === 'all') {
		userList = await userHelper.findUsersByTeam({ team: team });
		// console.log('userList,  ', userList);
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: renderUsersByTeams(userList),
				message: '获取成功'
			}
		}
	} else if (type === 'teamUsers') {
		userList = await userHelper.findUsersByTeam({ team: team });
		// console.log('userList,  ', userList);
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: renderFlatUsersByTeams(userList),
				message: '获取成功'
			}
		}
	} else if (type === 'usersEnergy') {
		userList = await userHelper.findUsersByTeam({ team: team, energy: 'energy', parentId: parentId });
		const formatUserList = formatUserData(userList);
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: formatUserList,
				message: '获取成功'
			}
		}
	} else if (type === 'pm') {
		userList = await userHelper.findUsersByTeam({ team: team, pm: 'pm' });
	} else if (type === 'userShow') {
		userList = await userHelper.findUsersByTeam({ team: team, userShow: 'userShow' });
		const formatUserInfoList = formatUserInfoData(userList);
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: formatUserInfoList,
				message: '获取成功'
			}
		}
	} else if (type = 'okr') { // added by karl on 2020-02-25 新增一个类型OKR
		var year = xss(ctx.request.body.year);
		var month = xss(ctx.request.body.month);
		var dealer = xss(ctx.request.body.dealer);
		var kokrList, vokrList;
		userList = await userHelper.findUsersByTeam({ team: team, okr: 'okr' });
		kokrList = await kokrHelper.findKokrByYearMonth({ team: team, year: year, month: month });
		vokrList = await vokrHelper.findVokrByYearMonth({ team: team, year: year, month: month, dealer: dealer });
		const formatUserOkrList = formatUserOkrData(userList, kokrList, vokrList, dealer, year, month);
		if (userList) {
			ctx.status = 200;
			ctx.body = {
				code: 0,
				data: formatUserOkrList,
				message: '获取成功'
			}
		}
	}
};

/**
 * 获取用户信息列表
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.getUserInfoList = async (ctx, next) => {

};

/**
 * 排序获取的User列表
 * @param objArr
 * @param field
 * @returns {Query|Array.<T>|*|Aggregate}
 */
function sortByPid (objArr, field) {

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
			{ id: 1, name: '项目1' },
			{ id: 2, name: '项目2' },
			{ id: 3, name: '项目3' }
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
	var pRoleZh = {
		0: '成员',
		1: '项目经理'
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
			if (nItem.parent === mItem.uid.toString()) {
				mItem.data.push({
					id: nItem._id,
					name: nItem.name,
					status: nItem.status,
					statusZh: statusZh[nItem.status],
					role: nItem.role,
					roleZh: roleZh[nItem.role],
					team: nItem.team,
					parent: nItem.parent,
					pRole: nItem.p_role,
					pRoleZh: pRoleZh[nItem.p_role]
				});
			}
		}
	}

	sortByPid(users, 'uid');

	return users;
}

/**
 * 从user表读出,封装成前端需要的user list
 * @param data
 * @returns {Array}
 */
function renderFlatUsersByTeams (data) {
	// 目标结构
	var dataMock = [{
		user: '人员扁平化',
		selected: [],
		data: [
			{ id: 1, name: '项目1' },
			{ id: 2, name: '项目2' },
			{ id: 3, name: '项目3' }
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
	var pRoleZh = {
		0: '成员',
		1: '项目经理'
	};

	// get the relevant users

	var formatOuter = {
		user: '人员扁平化',
		selected: [],
		data: []
	};
	users.push(formatOuter);

	// 组装扁平化需要的数据
	for (var i = 0, size = data.length; i < size; i++) {
		var item = data[i];
		users[0].data.push({
			id: item._id,
			name: item.name,
			status: item.status,
			statusZh: statusZh[item.status],
			role: item.role,
			roleZh: roleZh[item.role],
			team: item.team,
			parent: item.parent,
			pRole: item.p_role,
			pRoleZh: pRoleZh[item.p_role]
		})
	}

	sortByPid(users[0].data, 'id');

	return users;
}

/**
 * 从user表读出,封装成前端需要的user list
 * @param data
 * @returns {Array}
 */
function formatUserData (data) {
	var reData = [];
	for (var i = 0, size = data.length; i < size; i++) {
		var item = data[i];
		if (item.energy > 70 && item.energy <= 100) {
			item['color'] = 'positive';
			// } else if (item.energy > 60 && item.energy <= 80) {
			// 	item['color'] = 'green-3';
		} else if (item.energy > 40 && item.energy <= 70) {
			item['color'] = 'warning';
			// } else if (item.energy > 20 && item.energy <= 40) {
			// 	item['color'] = 'red-3';
		} else if (item.energy >= 0 && item.energy <= 40) {
			item['color'] = 'negative';
		} else if (item.energy == undefined) {
			item['color'] = 'negative';
			item.energy = 0;
		}

		reData.push({
			color: item['color'],
			_id: item._id,
			energy: item.energy,
			energy_desc: item.energy_desc,
			name: item.name,
			parent: item.parent,
			role: item.role,
			status: item.status,
			team: item.team,
			updated_at: item.updated_at,
			avatar: item.avatar,
			motto: item.motto,
			email: item.email,
			tel: item.tel
		});
	}
	return reData;
}

/**
 * 从user表读出,封装成前端需要的user info list
 * @param data
 * @returns {Array}
 */
function formatUserInfoData (data) {
	var reData = [];
	for (var i = 0, size = data.length; i < size; i++) {
		var item = data[i];
		if (item.energy > 70 && item.energy <= 100) {
			item['color'] = 'positive';
			item['work_status'] = 'free...';
		} else if (item.energy > 40 && item.energy <= 70) {
			item['color'] = 'warning';
			item['work_status'] = 'normal...';
		} else if (item.energy >= 0 && item.energy <= 40) {
			item['color'] = 'negative';
			item['work_status'] = 'busy...';
		} else if (item.energy == undefined) {
			item['color'] = 'negative';
			item['work_status'] = 'busy...';
			item.energy = 0;
		}
		reData.push({
			id: item._id,
			avatar: item.avatar,
			name: item.name,
			motto: item.motto,
			tel: item.tel,
			email: item.email,
			intro: item.intro,
			energy: item.energy,
			energy_desc: item.energy_desc,
			color: item.color,
			status: item.work_status,
			role: item.role
		});
	}
	return reData;
}

/**
 * 从user表读出,封装成前端需要的user okr list
 * @param data
 * @returns {Array}
 */
function formatUserOkrData (userData, kokrData, vokrData, dealer, year, month) {
	var reData = [];

	for (var i = 0, size = userData.length; i < size; i++) {
		var item = userData[i];
    reData.push({
			id: item._id,
			avatar: item.avatar,
			name: item.name,
			motto: item.motto,
			tel: item.tel,
			email: item.email,
			intro: item.intro,
			energy: item.energy,
			energy_desc: item.energy_desc,
			status: item.work_status,
			role: item.role,
      team: item.team,
      parent: item.parent,
      kokrData: {},
      vokrData: {}
		});
  }
  // if (!(year === '2020' && month === '2') && (!kokrData || kokrData.length <= 0)) {
  //   return reData;
  // }
  for (var m = 0, sizeM = reData.length; m < sizeM; m++) {
		var itemM = reData[m];
    if (kokrData && kokrData.length > 0) {
      for (var j = 0, sizeJ = kokrData.length; j < sizeJ; j++) {
        var itemJ = kokrData[j];
        if (itemM.id.toString() === itemJ.creator.toString()) {
          reData[m]['kokrData'] = itemJ;
        }
      }
    }
    if (vokrData && vokrData.length > 0) {
      for (var k = 0, sizeK = vokrData.length; k < sizeK; k++) {
        var itemK = vokrData[k];
        if (itemM.id.toString() === itemK.creator.toString()) {
          reData[m]['vokrData'] = itemK;
        }
      }
    }
	}

	return reData;
}

/**
 * 更新成员能量值
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.updateEnergy4User = async (ctx, next) => {
	var userId = xss(ctx.request.body.id);
	// 接收的是工作百分比，所以传入数据库，要用100 - energy
	var userEnergy = xss(ctx.request.body.energy);
	var userEnergyDesc = xss(ctx.request.body.energyDesc);

	var updateUser = await userHelper.updateEnergy4User({ userId: userId, userEnergy: 100 - parseInt(userEnergy), userEnergyDesc: userEnergyDesc, updatedAt: moment().format("YYYY-MM-DD HH:mm:ss") });
	if (updateUser) {
		ctx.status = 200;
		ctx.body = {
			code: 0,
			data: updateUser,
			message: '修改能量值成功'
		}
	}
};
