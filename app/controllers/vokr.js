/**
 * VOKR表接口controller
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var moment = require('moment');
var xss = require('xss');
var mongoose = require('mongoose');
var Vokr = mongoose.model('Vokr');
var User = mongoose.model('User');
import userHelper from '../dbhelper/userHelper';
import vokrHelper from '../dbhelper/vokrHelper';

/**
 * 获取该team项目列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getVokrsList = async(ctx, next) => {
	var data = await vokrHelper.findAllVokrs();
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
 * 新增vokr
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addVokr = async (ctx, next) => {
  var creator = xss(ctx.request.body.creator);
  var dealer = xss(ctx.request.body.dealer);
  var year = xss(ctx.request.body.year);
  var month = xss(ctx.request.body.month);
  var gscore = ctx.request.body.gscore;
  var status = xss(ctx.request.body.status);
  var comment = xss(ctx.request.body.comment);
  var last_person = xss(ctx.request.body.last_person);
  var team = xss(ctx.request.body.team);
  var content = ctx.request.body.content;

  var vokr = new Vokr({
    _id: new mongoose.Types.ObjectId(),
    creator: creator,
    dealer: dealer,
    gscore: gscore,
    team: team,
    year: year,
    month: month,
    content: content,
    create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    update_at: moment().format("YYYY-MM-DD HH:mm:ss")
  });

  var params = {
    userId: userId,
    team: team,
    year: moment().year(),
    month: moment().month()
  }

  var data = await vokrHelper.findVokrByUserId(params);

  var res;
  if (data && data.length > 0) {
    // console.log(data)
    var editVokr = {
      id: data[0]._id,
      content: content,
      update_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    res = await vokrHelper.editVokr(editVokr);
  } else {
    res = await vokrHelper.addVokr(vokr);
  }


  if (res) {
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: res,
      message: data ? '修改月度OKR成功' : '新增月度OKR成功'
    }
  }
};