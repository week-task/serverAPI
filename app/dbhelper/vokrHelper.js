/**
 * vokr表数据库CRUD
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var mongoose =  require('mongoose');
var Vokr = mongoose.model('Vokr');
var User = mongoose.model('User');
var Project = mongoose.model('Project');

/**
 * 查找所有Vokr
 * @return {[type]} [description]
 */
const findAllVokrs = async () => {
	var query = Vokr.find({}).populate('leader');
	var res = [];
	await query.exec(function(err, vokrs) {
		if (err) {
			res = [];
		} else {
			res = vokrs;
		}
	});
	return res
}

/**
 * 根据userId查找vokr
 * @return {[type]} [description]
 */
const findVokrByUserId = async (params) => {
  var query = Vokr.find({ creator: params.userId, year: params.year, month: params.month, team: params.team });
  var res = [];
  await query.exec(function (err, vokr) {
    if (err) {
      res = [];
    } else {
      res = vokr;
    }
  });
  return res;
};

/**
 * 根据YearMonth查找vokr
 * @return {[type]} [description]
 */
const findVokrByYearMonth = async (params) => {
  var query = Vokr.find({ team: params.team, year: params.year, month: params.month });
  var res = [];
  await query.exec(function (err, vokr) {
    if (err) {
      res = [];
    } else {
      res = vokr;
    }
  });
  return res;
};



module.exports = {
	findAllVokrs,
  findVokrByUserId,
  findVokrByYearMonth
};
