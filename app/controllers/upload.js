/**
 * 上传功能
 * @author karl.luo<360512239@qq.com>
 * @date 2019-04-15
 */
// import fs from 'fs';
// import path from 'path';
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const md5 = require('md5')
const fetch = require('node-fetch')
const request = require('request')
const FormStream = require('formstream')
const http = require('http')
import userHelper from '../dbhelper/userHelper'

/**
 * upload logic
 * @param {[type]}   ctx   [description]
 * @param {Function} next  [description]
 * @yield {[type]}         [description]
 */
exports.upload = async(ctx, next) => {
    // console.log('ctx file => ', ctx);
    const devReqUrl = 'http://www.fileupload.com/v1/upload/upload';
    const onlineReqUrl = 'http://upfile.inapi.ioteams.com';

    // 上传单个文件
    const file = ctx.request.files.file; // 获取上传文件
    
    // 创建可读流
    const reader = fs.createReadStream(file.path);
    // let filePath = path.join(__dirname, '../../www/upload/') + `/${file.name}`;
    // // 创建可写流
    // const upStream = fs.createWriteStream(filePath);
    // // 可读流通过管道写入可写流
    // reader.pipe(upStream);

    const currentTime = new Date().getTime();
    const fmtTime = (currentTime+'').substr(0, 10);
    // console.log('currentTime => ', currentTime);
    const form = new FormData();
    reader.name = file.name;
    reader.filename = file.name;
    form.append('upfile', reader, {
        name:file.name,
        filename: file.name
    });
    form.append('s', md5(`api_key=fe-weekreport|t=${fmtTime}6f0746407dc65b76e0480043abd41ef2`));
    form.append('api_key', 'fe-weekreport');
    form.append('t', fmtTime);

    // form.submit('http://www.fileupload.com/v1/upload/upload', (err, res) => {
    //     console.log('img api res.resume() => ', res.resume());
    //     console.log('img api res => ', res);
    // });

    let avatarUrl = '';

    await fetch(onlineReqUrl, {method: 'POST', body: form})
        .then((res)=> {
            return res.json();
        }).then((json)=> {
            json.data.path ? avatarUrl = json.data.path : '';
        }).catch((error) => {
            console.log('error=>',error);
            avatarUrl = 'error';
        })

        // console.log('userid ', ctx.state.user);
    const userAvatar = await userHelper.editUserAvatar({userId: ctx.state.user.data._id, avatarUrl: avatarUrl});
    // const formData1 = {
    //     upfile: reader,
    //     s:md5(`api_key=fe-weekreport|t=${fmtTime}6f0746407dc65b76e0480043abd41ef2`),
    //     api_key: 'fe-weekreport',
    //     t:fmtTime
    // }

    // request.post({url:'http://www.fileupload.com/v1/upload/upload', formData: formData1}, function(err, res) {
    //     if (err) {
    //         return console.error('upload failed:', err);
    //     }
    //     console.log('Upload successful!  Server responded with:', JSON.parse(res.body).data.path);
    // });

    // const form2 = FormStream();
    // // form2.file('file', file.path, file.name);
    // form2.file('upfile', reader, file.name);
    // form2.field('s', md5(`api_key=fe-weekreport|t=${fmtTime}6f0746407dc65b76e0480043abd41ef2`))
    //     .field('api_key', 'fe-weekreport')
    //     .field('t', fmtTime)

    // const req = http.request({
    //     method: 'POST',
    //     host:'www.fileupload.com',
    //     path: '/v1/upload/upload',
    //     // stream: true
    // }, (res)=>{
    //     console.log('formstream res => ', res);
    //     res.on('data', (data)=> {
    //         console.log('formstream data => ', data.toString());
    //     })
    // });

    // form2.pipe(req);
    
    if(userAvatar) {
        ctx.status = 200;
        ctx.body = {
            code: 0,
            data: {
                avatarUrl: avatarUrl
            },
            message: '新增成功'
        }
    } else {
        ctx.status = 500;
        ctx.body = {
            code: 500,
            data: [],
            message: 'failed'
        }
    }
    

    // return ctx.body = "上传成功！";
};