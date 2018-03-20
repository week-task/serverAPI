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
const findTeam = async (name) => {
	var query = Team.findOne({name});
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


module.exports = {
	findAllTeams,
	findAllTeamLeaders,
	findTeam,
	addTeam
};
