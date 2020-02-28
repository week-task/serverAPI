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
  var query = Vokr.find({ creator: params.creator, year: params.year, month: params.month, team: params.team });
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

  var objurl;
  if (params.dealer === 'all') {
    objurl = { team: params.team, year: params.year, month: params.month }
  } else {
    objurl = { team: params.team, year: params.year, month: params.month, dealer: params.dealer }
  }
  var query = Vokr.find(objurl);
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
 * 增加vokr
 * @param  {[Task]} vokr [mongoose.model('Task')]
 * @return {[type]}      [description]
 */
const addVokr = async (vokr) => {
  vokr = await vokr.save();
  return vokr;
};

const editVokr = async (params) => {
  var query = Vokr.findByIdAndUpdate(params.id, {
    dealer: params.dealer,
    gscore: params.gscore,
    total_score: params.total_score,
    status: params.status,
    comment: params.comment,
    comment_self: params.comment_self,
    last_person: params.last_person,
    content: params.content,
    update_at: params.update_at
  });
  var res = [];
  await query.exec((err, vokr) => {
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
  findVokrByYearMonth,
  addVokr,
  editVokr
};
