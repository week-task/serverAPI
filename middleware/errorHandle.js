/**
 * Created by luolinjia on 2018/3/4.
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