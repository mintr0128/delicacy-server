const db = require('../db/index')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
const config = require('../config')
const { json } = require('express')
const { number } = require('joi')
const reg_fun = require('../reg/user')
const fs = require('fs')
//获取用户信息
exports.getuserinfo = (req, res) => {
    const sqlStr = `select id, username, nickname, email, status,user_pic  from ev_users where id=?`
    db.query(sqlStr, req.user.id, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.length !== 1) {
            return res.cc('获取用户信息失败！')
        }
        res.send({
            status: 200,
            message: '获取用户信息成功！',
            data: results[0]
        })
    })

}
//更新用户信息
exports.updateUserinfo = (req, res) => {
    const sql = `update ev_users set ? where id=?`
    // console.log(req.body);
    db.query(sql, [req.body, req.body.id], (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows !== 1) return res.cc('更新用户信息失败！')
        res.cc('更新用户信息成功！', 200)
    })
}
exports.logout = (req, res) => {
    const sqlStr = `SELECT * FROM ev_users where id=?`
    db.query(sqlStr, req.user.id, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        res.cc('退出登录成功！', 200)
    })
}
//重置密码    //旧密码，新密码2个参数
exports.updateUserPassword = (req, res) => {
    const sql = `select * from ev_users where id=?`
    db.query(sql, req.user.id, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.length !== 1) {
            return res.cc('用户不存在')
        }
        const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
        if (!compareResult) {
            return res.cc('密码有误')
        }
        const updatePwdsql = `update ev_users set password=? where id=?`
        const newPwd = bcrypt.hashSync(req.body.newPwd, 10)
        db.query(updatePwdsql, [newPwd, req.user.id], (err, results) => {
            if (err) {
                return res.cc(err)
            }
            if (results.affectedRows !== 1) {
                return res.cc('更新密码失败')
            }
            res.cc('密码更新成功!', 200)
        })
    })
}
//更新图像 "data:image/png;base64,VE9PTUFOWVNFQ1JFVFM="
exports.updateUserAvatar = (req, res) => {

    const sql = 'update ev_users set user_pic=? where id=?'

    db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
        if (err) {
            return res.cc(err)
        }
        // if (results.affectedRows!==1) {
        //     return res.cc('更新图像失败！')
        // }
        res.cc('更换头像成功', 200)
    })
}
exports.insComment = (req, res) => {
    const sql = 'insert into app_db.pd_comment set ?'
    const { u_id, f_id, content, isComm, times, username } = req.body
    db.query(sql, { u_id, f_id, isComm, content, times, username }, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows !== 1) {
            return res.cc('评论失败，请稍后在试！')
        }
        res.cc('评论成功！', 200)
    })
}
//处理insFoodlike result 结果 返回 bool 和 存在的索引值
// function boolx(objs, K, val) {
//     let boolxRes = {
//         bool: false,
//         ind: null
//     }
//     objs.forEach((v, i) => {
//         Object.keys(v).forEach((item) => {
//             if (item == K && v[item] == val) {
//                 boolxRes.bool = true
//                 boolxRes.ind = i
//             }
//         })
//     })
//     return boolxRes
// }
exports.insFoodlike = (req, res) => {
    let { namedetail, u_id, id, f_id, type } = req.body
    const sql1 = ` SELECT * FROM app_db.pd_info_fooddetail  where namedetail = '${namedetail}';`
    db.query(sql1, (err, result) => {
        if (err || result.length != 1) {
            return res.cc('err')
        }
        let pusData = {
            id,
            namedetail,
            u_id,
            f_id,
            type
        }
        //新增或者删除
        let addORdelete = true
        //处理查询的结果
        let checkList = []
        if (result[0].u_id == 'null' || result[0].u_id == null || typeof result[0].u_id === 'undefined') {
            checkList = []
        } else {
            checkList = JSON.parse(result[0].u_id)
        }
        let boolres = reg_fun.boolx(checkList, 'u_id', u_id)
        let like = null
        if (boolres.bool) {
            checkList.splice(boolres.ind, 1)
            addORdelete = false
            like = checkList.length
            // return res.cc('请勿重复点赞')
        }
        let uidList = []
        if (addORdelete) {
            if (typeof checkList === 'undefined' || checkList == 'null' || !checkList || checkList.length == 0) {
                uidList.push(pusData)
                checkList = uidList
                like = 1
            } else {
                checkList.push(pusData)
                like = checkList.length
            }
        }
      //  console.log(checkList);
        const sql2 = `update app_db.pd_info_fooddetail set pd_info_fooddetail.u_id = ? ,pd_info_fooddetail.like = ? where namedetail = '${namedetail}';`
        db.query(sql2, [JSON.stringify(checkList), like], (err, results) => {
            if (err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('点赞失败！')
            if (addORdelete) {
                res.send({
                    status: 200,
                    message: "点赞成功！",
                })
            } else {
                res.send({
                    status: 200,
                    message: "取消点赞！",
                })
            }
        })
    })
}

exports.insFoodCollect = (req, res) => {
    let { namedetail, u_id, id, f_id, type } = req.body
    const sql1 = ` SELECT * FROM app_db.pd_info_fooddetail  where namedetail = '${namedetail}';`
    db.query(sql1, (err, result) => {
        if (err || result.length != 1) {
            return res.cc('err')
        }
        let pusData = {
            id,
            namedetail,
            u_id,
            f_id,
            type
        }
        //新增或者删除
        let addORdelete = true
        //处理查询的结果
        let checkList = []
        if (result[0].coll_cont == 'null' || result[0].coll_cont == null || typeof result[0].coll_cont === 'undefined') {
            checkList = []
        } else {
            checkList = JSON.parse(result[0].coll_cont)
        }

        let boolres = reg_fun.boolx(checkList, 'u_id', u_id)
        let like = null
        if (boolres.bool) {
            checkList.splice(boolres.ind, 1)
            addORdelete = false
            like = checkList.length
        }
        let uidList = []
        if (addORdelete) {
            if (typeof checkList === 'undefined' || checkList == 'null' || !checkList || checkList.length == 0) {
                uidList.push(pusData)
                checkList = uidList
                like = 1
            } else {
                checkList.push(pusData)
                like = checkList.length
            }
        }

        const sql2 = `update app_db.pd_info_fooddetail set pd_info_fooddetail.coll_cont = ? ,pd_info_fooddetail.collect = ? where namedetail = '${namedetail}';`
        db.query(sql2, [JSON.stringify(checkList), like], (err, results) => {
            if (err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('收藏失败！')
            if (addORdelete) {
                res.send({
                    status: 200,
                    message: "收藏成功！",
                })
            } else {
                res.send({
                    status: 200,
                    message: "取消收藏！",
                })
            }
        })
    })
}

exports.insUserPic = (req, res) => {
    try {
        fs.renameSync(req.file.path, `uploads/userpic/${req.file.originalname}`)
        let { path } = req.file;
        path = `http://127.0.0.1:3007/api/unlimit/uploads/userpic/${req.file.originalname}`
        let fliedata = { ...req.file, path }
        const insFoodsql = `update app_db.ev_users set  ev_users.user_pic = '${fliedata.path}' where id = ${req.body.id}`
        db.query(insFoodsql, (err, results) => {
            if (err) {
                return res.cc(err)
            }
            if (results.affectedRows !== 1) {
                return res.cc('更新图像失败！')
            }
            res.send({
                status: 200,
                message: '插入图片成功！',
                data: fliedata
            })

        })


    } catch (error) {
        res.cc(error)
    }
}

