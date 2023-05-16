const db = require('../db/index')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
const config = require('../config')
const { json } = require('express')
const { number, object } = require('joi')
const reg_fun = require('../reg/user')
const fs = require('fs')
const { promises } = require('dns')
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
function filterArr(res, key1, key2, id) {
    let resarr = []
    res.forEach(v => {
        let paresRes = JSON.parse(v[key1])
        if (Array.isArray(paresRes)) {
            paresRes.forEach(item => {
                if (item[key2] == id) {
                    resarr.push(v)
                }
            })
        }
    })
    return resarr
}
function PROMISEFOOD(v) {
    return new Promise((resolve, reject) => {
        const sqlStr = `SELECT * FROM app_db.pd_info_foods where id  =${v};`
        db.query(sqlStr, (err, resultsss) => {
            resolve({
                ids: v,
                names: resultsss[0].name,
                zhuliao: resultsss[0].zhuliao,
                taste: resultsss[0].taste,
                auth: resultsss[0].auth,
                foodpicture: resultsss[0].picture
            })
        })
    })

}
exports.getLikeFood = (req, res) => {
    let sqlStr = `SELECT * FROM app_db.pd_info_fooddetail;`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        let resARRS = filterArr(results, 'u_id', 'u_id', req.user.id)
        let foodmap = []
        resARRS.forEach(v => {
            foodmap.push(PROMISEFOOD(v.f_id))
        })
        Promise.all(foodmap).then((val) => {
            if (val.length == resARRS.length) {
                let finalarr = resARRS.map((item, index) => {
                    return Object.assign(resARRS[index], val[index])
                })
                res.send({
                    status: 200,
                    message: '获取个人点赞信息成功！',
                    results: finalarr
                })
            }
        }).catch(() => {
            res.send({
                status: 200,
                message: '获取个人点赞信息成功！',
                results: resARRS
            })
        })

    })

}

exports.getCollectFood = (req, res) => {
    let sqlStr = `SELECT * FROM app_db.pd_info_fooddetail;`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        let resARRS = filterArr(results, 'coll_cont', 'u_id', req.user.id)
        let foodmap = []
        resARRS.forEach(v => {
            foodmap.push(PROMISEFOOD(v.f_id))
        })
        Promise.all(foodmap).then((val) => {
            if (val.length == resARRS.length) {
                let finalarr = resARRS.map((item, index) => {
                    return Object.assign(resARRS[index], val[index])
                })
                res.send({
                    status: 200,
                    message: '获取个人收藏信息成功！',
                    results: finalarr
                })
            }
        }).catch(() => {
            res.send({
                status: 200,
                message: '获取个人收藏信息成功！',
                results: resARRS
            })
        })
    })
}

exports.getuserComment = (req, res) => {
    const sqlStr = `SELECT * FROM app_db.pd_comment where pd_comment.u_id = ${req.user.id};`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        let foodmap = []
        results.forEach(v => {
            foodmap.push(PROMISEFOOD(v.f_id))
        })
        Promise.all(foodmap).then((val) => {
            if (val.length == results.length) {
                let finalarr = results.map((item, index) => {
                    return Object.assign(results[index], val[index])
                })
                res.send({
                    status: 200,
                    message: '获取个人留言信息成功！',
                    results: finalarr
                })
            }
        }).catch(() => {
            res.send({
                status: 200,
                message: '获取个人留言信息成功！',
                results: results
            })
        })
    })
}

exports.getAdminallfood = (req, res) => {
    const sqlStr = 'SELECT * FROM app_db.pd_info_foods;'
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (req.user.id != 1) {
            return res.cc('没有权限！')
        }
        res.send({
            status: 200,
            message: '获取食谱列表信息成功！',
            results: results
        })
    })
}

exports.deleteAdminallfood = (req, res) => {
    const sqlStr = `delete from  app_db.pd_info_foods  where id = ${req.body.id}`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows !== 1) return res.cc('删除菜品失败！')
        res.send({
            status: 200,
            message: '删除菜品成功！',
        })
    })
}

exports.getAdminalluser = (req, res) => {
    const sqlStr = `SELECT app_db.ev_users.id,app_db.ev_users.username,app_db.ev_users.nickname,app_db.ev_users.user_pic,app_db.ev_users.email  FROM app_db.ev_users;`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (req.user.id != 1) {
            return res.cc('没有权限！')
        }
        results.forEach((v, i) => {
            if (v.id == 1) {
                results.splice(i, 1)
            }
        })
        res.send({
            status: 200,
            message: '获取用户列表信息成功！',
            results: results
        })
    })
}
exports.deleteAdminalluser = (req, res) => {
    const sqlStr = `delete from  app_db.ev_users  where id = ${req.body.id}`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows !== 1) return res.cc('删除用户失败！')
        res.send({
            status: 200,
            message: '删除用户成功！',
        })
    })
}

exports.getAdminallComment = (req, res) => {
    const sqlStr = `SELECT * FROM app_db.pd_comment;`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (req.user.id != 1) {
            return res.cc('没有权限！')
        }
        let foodmap = []
        results.forEach(v => {
            foodmap.push(PROMISEFOOD(v.f_id))
        })
        Promise.all(foodmap).then((val) => {
            if (val.length == results.length) {
                let finalarr = results.map((item, index) => {
                    return Object.assign(results[index], val[index])
                })
                res.send({
                    status: 200,
                    message: '获取留言列表成功！',
                    results: finalarr
                })
            }
        }).catch(() => {
            res.send({
                status: 200,
                message: '获取留言列表成功！',
                results: results
            })
        })
    })
}

exports.deleteAdminallComment = (req, res) => {
    const sqlStr = `delete from  app_db.pd_comment  where id = ${req.body.id}`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows !== 1) return res.cc('删除留言失败！')
        res.send({
            status: 200,
            message: '删除留言成功！',
        })
    })
}

exports.getAdminFoodClassify = (req, res) => {
    const sqlStr = `SELECT * FROM app_db.pd_info_goods;`
    db.query(sqlStr, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (req.user.id != 1) {
            return res.cc('没有权限！')
        }
        res.send({
            status: 200,
            message: '获取二级分类列表成功！',
            results: results
        })
    })
}
exports.canInsertFoodMethod = (req, res) => {
    const sql1 = `SELECT app_db.pd_info_foods.id,app_db.pd_info_foods.name FROM app_db.pd_info_foods;`
    db.query(sql1, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (req.user.id != 1) {
            return res.cc('没有权限！')
        }
        const sql2 = `SELECT app_db.pd_info_fooddetail.id,app_db.pd_info_fooddetail.namedetail,app_db.pd_info_fooddetail.f_id FROM app_db.pd_info_fooddetail;`
        db.query(sql2, (err, resl) => {
            if (err) {
                return res.cc(err)
            }
            //数组差集 results-resl
            let canInsFood =  results.filter(x => !resl.find(y => x.id == y.f_id))
            res.send({
                status: 200,
                message: '获取增添方法列表成功！',
                results: canInsFood, 
            })
        })
    })
}



