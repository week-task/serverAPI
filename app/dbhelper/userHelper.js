/**
 * 用户表数据库CRUD
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var mongoose =  require('mongoose');
var User = mongoose.model('User');
var Task = mongoose.model('Task');

/**
 * 查找所用用户
 * @return {[type]} [description]
 */
const findAllUsers = async () => {
	var query = User.find({});
	var res = [];
	await query.exec(function(err, users) {
		if (err) {
			res = [];
		} else {
			res = users;
		}
	})
	return res
}

/**
 * 查找该team下所有users
 * @return {[type]} [description]
 */
const findUsersByTeam = async (params) => {
	var query;
	if (params.role) {
		query = User.find({team: params.team, role: params.role, status: 0});
	} else if (params.energy) {
		if (params.parentId) {
			query = User.find({team: params.team, role:{$in:[1,2]}, status: 0, parent: params.parentId});
		}else {
			query = User.find({team: params.team, role:{$in:[1,2]}, status: 0});
		}
	} else if (params.pm) {
		query = User.find({team: params.team, p_role: 1, role:{$in:[1,2]}, status: 0});
	} else if (params.userShow) {
		query = User.find({team: params.team, role:{$in:[0,1,2]}, status: 0});
	} else if (params.okr) {
    query = User.find({team: params.team, role:{$in:[1,2]}, status: 0});
  } else {
		query = User.find({team: params.team});
	}
	
	var res = [];
	await query.exec(function(err, users) {
		if (err) {
			res = [];
		} else {
			res = users;
		}
	})
	return res
}

/**
 * 查找该parent下所有users
 * @return {[type]} [description]
 */
const findUsersByParent = async (params) => {
	var query = User.find({parent: params.parent});
	
	var res = [];
	await query.exec(function(err, users) {
		if (err) {
			res = [];
		} else {
			res = users;
		}
	})
	return res
}

/**
 * 查找用户
 * @return {[type]} [description]
 */
const findUserById = async (params) => {
	var query = User.findOne({_id: params.id});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}else {
			res = user
		}
	})
	return res;
};

/**
 * 查找所用用户
 * @return {[type]} [description]
 */
const findUser = async (name) => {
	var query = User.findOne({name});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}else {
			res = user
		}
	})
	return res;
};

/**
 * 增加用户
 * @param  {[User]} user [mongoose.model('User')]
 * @return {[type]}      [description]
 */
const addUser = async (user) => {
	var res = {code: 0};
	await user.save().then((user) => {
		res = {code: 0, user: user};
	}).catch((err) => {
		res = err;
	});
	return res;
};

const editUser = async (params) => {
	// 判断角色 1->2 用户下级是否还有组员：是否存在多个相同的parent
	// 通过传入的用户判断，拿到该用户的id，去匹配user里面的parent，如果大于1，就认定有下级组员，就不可以修改

	var isReadyUser = await findUserById({id: params.userId});
	if (isReadyUser.role === 1 && params.role === '2') {
		var existUsers = await findUsersByParent({parent: isReadyUser.parent});
		if (existUsers.length > 1) {
			return {code: 500};
		}
	} 

	var query = User.update({_id: params.userId}, {$set:{
		name:params.userName,
		parent: params.parent,
		role: params.role,
		status: params.status,
		p_role: params.pRole
	}});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});

	if (params.role === '1') {
		await updateUserParentSelf({id: params.userId});
	}
	
	return res;
};

/**
 * DIY个人资料
 * @param {Object} params 
 */
const editUserInfo = async (params) => {

	var query = User.update({_id: params.userId}, {$set:{
		motto:params.motto,
		tel: params.tel,
		email: params.email,
		intro: params.intro
	}});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});
	
	return res;
};

/**
 * 上传头像功能
 * @param {Object} params 
 */
const editUserAvatar = async (params) => {

	var query = User.update({_id: params.userId}, {$set:{
		avatar: params.avatarUrl
	}});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});
	
	return res;
};

/**
 * 离职或删除用户
 * @param {Object} params 
 */
const deleteUser = async (params) => {
	var query, res = {};
	if (params.options === 'off') {
		query = User.update({_id: params.id}, {$set:{status: 1}});
		res.rescode = 0; // 离职
	} else if (params.options === 'on') {
		query = User.remove({_id: params.id});
		res.rescode = 1; // 物理删除
	}
	await query.exec((err, user) => {
		if (err) {
			res.err = err;
		} else {
			res.user = user;
		}
	});
	return res;
};

/**
 * 修改密码
 * @return {[type]} [description]
 */
const changePassword = async (params) => {
	var query = User.update({_id: params.userId}, {$set:{'password': params.password}});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}
	});
	res = await findUserById({id: params.userId});
	return res;
};

/**
 * 修改上一版用户密码加salt
 * @return {[type]} [description]
 */
const updatePrevPassword = async (params) => {
	var query = User.update({name: params.user.name}, {$set:{'password': params.password, 'salt': params.salt}});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}else {
			res = user;
		}
	});

	var user = await findUser(params.user.name);

	return user;
};

/**
 * 初始化team相关的User
 * @return {[type]} [description]
 */
const bindTeam4User = async (params) => {
	var query;
	if (params.user === '0') {
		query = User.update({},{$set: {status:0, team:params.team}}, {multi: 1});
	} else {
		query = User.update({_id: params.user}, {$set:{team: params.team}});
	}
	
	var res = null;
	await query.exec((err, user) => {
		if (err) {res = {};}
		else {
			res = user;
		}
	});
	return res;
};

const addStatus4User = async (userId) => {
	var query = User.update({_id: userId}, {$set:{status: 0}});
	var res = null;
	await query.exec((err, user) => {
		if (err) {res = {};}
		else {
			res = user;
		}
	});
	return res;
};

const updateUserParentSelf = async (params) => {
	// console.log('update user id ', params.id);
	var query = User.update({_id: params.id}, {$set:{parent: params.id}});
	var res = null;
	await query.exec((err, user) => {
		if (err) {
			// console.log('err', err);
			res = {};
		} else {
			// console.log('user', user);
			res = user;
		}
	});
	return res;
}

/**
 * 新增老版本的用户字段energy（默认：100）
 * @param {*} params String
 * @return {[User]}
 */
const addEnergyField4User = async (params) => {
	var query = User.update({},{$set: {energy:100, energy_desc: ''}}, {multi: 1});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});
	return res;
};

/**
 * 新增老版本的用户字段user updated_at, avatar, motto
 * @param {*} params String
 * @return {[User]}
 */
const addEnergyTimeField4User = async (params) => {
	var query = User.update({},{$set: {updated_at:'', avatar: '', motto: '', tel: '', email: ''}}, {multi: 1});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});
	return res;
};

/**
 * 新增老版本的用户字段user p_role
 * @param {*} params String
 * @return {[User]}
 */
const addUserPRoleField4User = async (params) => {
	var query = User.update({},{$set: {p_role: 0}}, {multi: 1});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});
	return res;
};

/**
 * 新增老版本的用户字段intro, frozen_time, all_time
 * @param {*} params String
 * @return {[User]}
 */
const addUserIntroFrozenTime = async (params) => {
	var query = User.update({},{$set: {intro: '', frozen_time: 0, all_time: 0}}, {multi: 1});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});
	return res;
};

/**
 * 更新成员的能量值
 * @param {*} params String
 * @return {[User]}
 */
const updateEnergy4User = async (params) => {
	var query = User.update({_id: params.userId}, {$set:{'energy': params.userEnergy, 'energy_desc': params.userEnergyDesc, 'updated_at': params.updatedAt}});
	var res = null;
	await query.exec(function(err, user) {
		if(err) {
			res = {}
		}
	});
	res = await findUserById({id: params.userId});
	return res;
};

/**
 * 变更ADMIN=>李孟君
 * @param {*} params String
 * @return {[User]}
 */
const changeBMWName = async (params) => {
	var query = User.update({name: 'admin'}, {$set:{'name': '李孟君'}});
	var res = [];
	await query.exec((err, user) => {
		if (err) {
			res = [];
		} else {
			res = user;
		}
	});
	
	return res;
};

module.exports = {
	findAllUsers,
	findUser,
	findUserById,
	findUsersByTeam,
	addUser,
	editUser,
	editUserInfo,
	deleteUser,
	bindTeam4User,
	changePassword,
	updatePrevPassword,
	addStatus4User,
	updateUserParentSelf,
	findUsersByParent,
	addEnergyField4User,
	updateEnergy4User,
	addEnergyTimeField4User,
	addUserPRoleField4User,
	addUserIntroFrozenTime,
	changeBMWName,
	editUserAvatar
};
