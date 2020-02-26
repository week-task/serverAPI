/**
 * VOKR表接口controller
 * @author karl.luo<360512239@qq.com>
 */
'use strict';

var moment = require('moment');
var xss = require('xss');
var mongoose = require('mongoose');
var Kokr = mongoose.model('Kokr');
var User = mongoose.model('User');
import userHelper from '../dbhelper/userHelper';
import kokrHelper from '../dbhelper/kokrHelper';

/**
 * 新增kokr
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addKokr = async (ctx, next) => {
  var userId = xss(ctx.request.body.userId);
  var team = xss(ctx.request.body.team);
  var content = ctx.request.body.content;

  var kokr = new Kokr({
    _id: new mongoose.Types.ObjectId(),
    creator: userId,
    team: team,
    year: moment().year(),
    month: parseInt(moment().month()) + 1,
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

  var data = await kokrHelper.findKokrByUserId(params);

  var res;
  if (data && data.length > 0) {
    // console.log(data)
    var editKokr = {
      id: data[0]._id,
      content: content,
      update_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    res = await kokrHelper.editKokr(editKokr);
  } else {
    res = await kokrHelper.addKokr(kokr);
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

/**
 * 根据userId、year和month查询kokr
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getOkrByUserId = async (ctx, next) => {
  var userId = xss(ctx.request.body.userId);
  var year = xss(ctx.request.body.year);
  var month = xss(ctx.request.body.month);
  var team = xss(ctx.request.body.team);

  var params = {
    userId: userId,
    year: year,
    month: month,
    team: team
  };
  var data = await kokrHelper.findKokrByUserId(params);
  console.log('get ddd', data)
  // var plans = renderPlans(data);
  ctx.body = {
    code: 0,
    data: data,
    message: '获取OKR成功'
  }
};

/**
 * 根据year和month查询kokr List
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getKokrListByYearMonth = async (ctx, next) => {
  var year = xss(ctx.request.body.year);
  var month = xss(ctx.request.body.month);
  var team = xss(ctx.request.body.team);

  var params = {
    team: team,
    year: year,
    month: month
  };
  var data = await kokrHelper.findKokrByYearMonth(params);
  // var plans = renderPlans(data);
  ctx.body = {
    code: 0,
    data: data,
    message: '获取OKR LIST成功'
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
