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
exports.getVokrsList = async (ctx, next) => {
  var data = await vokrHelper.findAllVokrs();
  if (data && data.length > 0) {
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
  var gscore = xss(ctx.request.body.gscore);
  var total_score = xss(ctx.request.body.total_score);
  var grade = xss(ctx.request.body.grade);
  var status = xss(ctx.request.body.status);
  var comment = xss(ctx.request.body.comment);
  var comment_self = xss(ctx.request.body.comment_self);
  var last_person = xss(ctx.request.body.last_person);
  var team = xss(ctx.request.body.team);
  var content = ctx.request.body.content;

  var params = {
    creator: creator,
    team: team,
    year: year,
    month: month
  }

  var data = await vokrHelper.findVokrByUserId(params);

  var res;
  if (data && data.length > 0) {
    // console.log(data)
    var editVokr = {
      id: data[0]._id,
      dealer: dealer,
      gscore: parseInt(gscore),
      total_score: parseFloat(total_score),
      grade: grade,
      status: status,
      comment: comment,
      comment_self: comment_self,
      last_person: last_person,
      content: content,
      update_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    res = await vokrHelper.editVokr(editVokr);
  } else {
    var vokr = new Vokr({
      _id: new mongoose.Types.ObjectId(),
      creator: last_person,
      dealer: last_person,
      gscore: parseInt(gscore),
      total_score: parseFloat(total_score),
      grade: grade,
      team: team,
      year: year,
      month: month,
      status: status,
      comment: comment,
      comment_self: comment_self,
      last_person: last_person,
      content: content,
      create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      update_at: moment().format("YYYY-MM-DD HH:mm:ss")
    });

    res = await vokrHelper.addVokr(vokr);
  }


  if (res) {
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: res,
      message: (data && data.length > 0) ? `修改${year}年${month}月OKR VALUE成功` : `新增${year}年${month}月OKR VALUE成功`
    }
  }
};

/**
 * 根据userId、year和month查询vokr
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getValueOkrByUserId = async (ctx, next) => {
  var creator = xss(ctx.request.body.creator);
  var year = xss(ctx.request.body.year);
  var month = xss(ctx.request.body.month);
  var team = xss(ctx.request.body.team);

  var params = {
    creator: creator,
    year: year,
    month: month,
    team: team
  };
  var data = await vokrHelper.findVokrByUserId(params);
  console.log('get ddd', data)
  // var plans = renderPlans(data);
  ctx.body = {
    code: 0,
    data: data,
    message: '获取OKR成功'
  }
};

/**
 *
 * @param data
 */
function renderPlans (data) {
  const kindZh = {
    '1': '工作目标',
    '2': '额外目标'
  };

  let plans = {
    userId: data.creator._id,
    content: []
  }

  for (let i = 0, size = data.content.length; i < size; i++) {
    let item = data.content[i]
    plans.content.push({
      kind: item.kind,
      kindZh: kindZh[item.kind],
      title: item.title,
      percent: item.percent,
      desc: item.desc
    })
  }
  sortByPid(plans.content, 'kind');

  return plans;
}


/**
 * kokr 排序
 * @param objArr
 * @param field
 * @returns {Array.<T>|void|Query|Aggregate|*}
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
