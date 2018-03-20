/**
 * team表数据库CRUD
 * @author karl.luo<luolinjia@cmiot.chinamobile.com>
 */
'use strict';

var mongoose =  require('mongoose');
var Team = mongoose.model('Team');
var User = mongoose.model('User');

/**
 * 查找所有team
 * @return {[type]} [description]
 */
const findAllTeams = async () => {
	var query = Team.find({}).populate('leader');
	var res = [];
	await query.exec(function(err, teams) {
		if (err) {
			res = [];
		} else {
			res = teams;
		}
	});
	return res
}

/**
 * 查找所有team leader
 * @return {[type]} [description]
 */
const findAllTeamLeaders = async () => {
	var query = User.find({role: 0, team: undefined});
	var res = [];
	await query.exec(function(err, users) {
		if (err) {
			res = [];
		} else {
			res = users;
		}
	});
	return res;
}

/**
 * 查找相关team
 * @return {[type]} [description]
 */
const findTeam = async (id) => {
	var query = Team.findOne({_id:id}).populate('leader');
	var res = null;
	await query.exec(function(err, team) {
		if(err) {
			res = {}
		}else {
			res = team
		}
	});
	return res;
};

/**
 * 增加team
 * @param  {[Team]} team [mongoose.model('Team')]
 * @return {[type]}      [description]
 */
const addTeam = async (team) => {
	var res = {code: 0};
	await team.save().then((re) => {
		res = re;
	}).catch((err) => {
		res = err;
	});
	return res;
};

/**
 * 编辑task
 * @param  {[Task]} task [mongoose.model('Task')]
 * @return {[type]}      [description]
 */
const editTeam = async (params) => {

	var prevTeam = await findTeam(params.teamId);

	// unbind team和leader
	var unbindQuery = User.update({_id: prevTeam.leader._id}, {$unset: {team:1}});
	await unbindQuery.exec((err, user) => {
		console.log('xx ', err);
		console.log('xx ', user);
		// if (err) {res=[];}
		// else {res=team;}
	});

	var query = Team.findByIdAndUpdate(params.teamId, {
		name:params.teamName,
		leader:params.user
	});
	var res = [];
	await query.exec((err, team) => {
		if (err) {
			res = [];
		} else {
			res = team;
		}
	});

	// bind team和leader
	var bindQuery = User.update({_id:params.user}, {$set: {team: params.teamId}});
	await bindQuery.exec((err, user) => {
		console.log('xx1 ', err);
		console.log('xx1 ', user);
	});
	return res;
};

module.exports = {
	findAllTeams,
	findAllTeamLeaders,
	findTeam,
	addTeam,
	editTeam
};
