/**
 * Created by luolinjia on 2018/3/6.
 */
const fs = require('fs');
const xlsx = require('better-xlsx');

function exportXlsx (data) {

	var file = new xlsx.File();
	var sheet = file.addSheet('测试');

	return new Promise((resolve, reject) => {
		file
			.saveAs()
			.pipe(fs.createWriteStream('www/exportFile/testexport.xlsx'))
			.on('err', (err) => {
				reject(err);
			})
			.on('finish', () => {
				resolve('exportFile/testexport.xlsx');
			})
	});
}
module.exports = {exportExcel: exportXlsx};