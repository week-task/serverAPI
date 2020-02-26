/**
 * kokr表数据库CRUD
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var mongoose = require('mongoose');
var Kokr = mongoose.model('Kokr');
var User = mongoose.model('User');
var Project = mongoose.model('Project');

/**
 * 查找所有Kokr
 * @return {[type]} [description]
 */
const findAllKokrs = async () => {
  var query = Kokr.find({}).populate('leader');
  var res = [];
  await query.exec(function (err, kokrs) {
    if (err) {
      res = [];
    } else {
      res = kokrs;
    }
  });
  return res
};


/**
 * 根据userId查找kokr
 * @return {[type]} [description]
 */
const findKokrByUserId = async (params) => {
  var query = Kokr.find({ creator: params.userId, year: params.year, month: params.month, team: params.team });
  var res = [];
  await query.exec(function (err, kokr) {
    if (err) {
      res = [];
    } else {
      res = kokr;
    }
  });
  return res;
};

/**
 * 根据YearMonth查找kokr
 * @return {[type]} [description]
 */
const findKokrByYearMonth = async (params) => {
  var query = Kokr.find({ team: params.team, year: params.year, month: params.month });
  var res = [];
  await query.exec(function (err, kokr) {
    if (err) {
      res = [];
    } else {
      res = kokr;
    }
  });
  return res;
};

/**
 * 增加kokr
 * @param  {[Task]} kokr [mongoose.model('Task')]
 * @return {[type]}      [description]
 */
const addKokr = async (kokr) => {
  kokr = await kokr.save();
  return kokr;
};


const editKokr = async (params) => {
  var query = Kokr.findByIdAndUpdate(params.id, {
    content: params.content,
    update_at: params.update_at
  });
  var res = [];
  await query.exec((err, kokr) => {
    if (err) {
      res = [];
    } else {
      res = kokr;
    }
  });
  return res;
};


module.exports = {
  findAllKokrs,
  addKokr,
  editKokr,
  findKokrByUserId,
  findKokrByYearMonth
};
