/**
 * Created by luolinjia on 2018/3/6.
 */
const fs = require('fs');
const xlsx = require('better-xlsx');
const moment = require('moment');

function exportXlsx (data) {

	console.log('export data', data);

	const file = new xlsx.File();
	const sheet = file.addSheet('sheet1');
	const header = sheet.addRow();
	header.setHeightCM(0.8);
	const headers = ['任务', '状态', '进度', '负责人', '备注'];
	for (let i = 0; i < headers.length; i++) {
		const hc = header.addCell();
		hc.value = headers[i];
		hc.style.align.v = 'center';
		hc.style.font.color = 'ff000000';
		hc.style.fill.bgColor = 'ff3399ff';
	}

	for (let i = 0, iSize = data.length; i < iSize; i++) {
		let iRow = sheet.addRow();
		iRow.setHeightCM(0.8);
		let iCell = iRow.addCell();
		iCell.value = data[i].project;
		iCell.hMerge = 4;
		iCell.style.font.color = 'ff0099ff';
		for (let j = 0, jSize = data[i].data.length; j < jSize; j++) {
			let item = data[i].data[j];
			let jRow = sheet.addRow();
			jRow.setHeightCM(0.8);
			let jCell1 = jRow.addCell();
			let jCell2 = jRow.addCell();
			let jCell3 = jRow.addCell();
			let jCell4 = jRow.addCell();
			let jCell5 = jRow.addCell();
			jCell1.value = item.name;
			jCell2.value = item.statusZh;
			jCell3.value = item.progressPercent;
			jCell4.value = item.username;
			jCell5.value = item.remark;
		}
	}

	//ColStyle
	const col1 = sheet.col(0);
	const col2 = sheet.col(1);
	const col3 = sheet.col(2);
	const col4 = sheet.col(3);
	const col5 = sheet.col(4);
	col1.width = 36;
	col2.width = 8;
	col3.width = 8;
	col4.width = 8;
	col5.width = 20;

	return new Promise((resolve, reject) => {
		file
			.saveAs()
			.pipe(fs.createWriteStream('www/exportFile/第' + moment().format('w') + '周' + moment().format('YYYY-MM-DD HH:mm:s') + '周报.xlsx'))
			.on('err', (err) => {
				reject(err);
			})
			.on('finish', () => {
				resolve('exportFile/第' + moment().format('w') + '周' + moment().format('YYYY-MM-DD HH:mm:s') + '周报.xlsx');
			})
	});
}
module.exports = {exportExcel: exportXlsx};