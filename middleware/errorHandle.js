/**
 * koa-jwt拦截验证错误function
 * @author karl.luo<360512239@qq.com>
 */
const errorHandle = function (ctx, next) {
	return next().catch(function (err) {
		if (err.status === 401) {
			ctx.status = 401;
			ctx.body = {
				error: err.originalError ? err.originalError.message : err.message,
			};
		} else {
			throw err;
		}
	});
}

module.exports = errorHandle;