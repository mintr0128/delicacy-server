const db = require('../db/index')
const fs = require('fs')
const multer = require('multer')
const reg_fun = require('../reg/user')
const { log } = require('console')
const { resolve } = require('path')
const { promises } = require('dns')
const geoip = require('geoip-lite')
const os = require('os')

exports.insFoodinfo = (req, res) => {
    const sql = 'insert into pd_info_foods set ?'
    const { name, describe, zhuliao, fuliao, taste, spendtime, diffcu, auth, f_id, g_id, picture } = req.body
    db.query(sql, { name, describe, zhuliao, fuliao, taste, spendtime, diffcu, auth, f_id, g_id, picture }, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows !== 1) return res.cc('插入食物数据失败！')
        res.cc('插入食物数据成功', 200)
    })
}
exports.insFoodpic = (req, res) => {
    try {
        fs.renameSync(req.file.path, `uploads/foodpic/${req.file.originalname}`)
        let { path } = req.file;
        path = `http://127.0.0.1:3007/api/unlimit/uploads/foodpic/${req.file.originalname}`
        let fliedata = { ...req.file, path }
        const insFoodsql = `update pd_info_foods set picture= ? where id= ? `
        //console.log(fliedata);
        //     db.query(insFoodsql,[fliedata.path,req.body.id],(err,results)=>{
        //     if (err) return res.cc(err)
        //     if (results.affectedRows !== 1) return res.cc('插入图片失败！')
        //     res.send({
        //         status: 200,
        //         message:'插入图片成功！',
        //         data:fliedata
        //     })
        //    })
        res.send({
            status: 200,
            message: '插入图片成功！',
            data: fliedata
        })
    } catch (error) {
        res.cc(error)
    }
}
exports.getFoodSwiper = (req, res) => {
    const dataid = [9, 117, 118]
    const sql = `SELECT * FROM app_db.pd_info_goods where id in (${dataid[0]},${dataid[1]},${dataid[2]})`
    db.query(sql, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        res.send({
            status: '200',
            message: '获取轮播图数据成功！',
            data: results
        })
    })
}
exports.getFoodNav = (req, res) => {
    const dataid = [114, 115, 116, 117, 118, 119, 120, 121, 123]
    const sql = `SELECT * FROM app_db.pd_info_goods where id in (${dataid[0]},${dataid[1]},${dataid[2]},${dataid[3]},${dataid[4]},${dataid[5]},${dataid[6]},${dataid[7]},${dataid[8]})`
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        // console.log(results);
        const sqlStr = `SELECT id,pd_info_foods.name,pd_info_foods.describe,pd_info_foods.zhuliao,taste,picture,f_id,g_id FROM app_db.pd_info_foods`
        db.query(sqlStr, (err, datarrr) => {
            if (err) return res.cc(err)
            let children = dataid.map((item, index) => {
                let arr1 = dataid.map(v => {
                    return dataResbyid(datarrr, v, 'f_id')
                })
                let arr2 = dataid.map(v => {
                    return dataResbyid(datarrr, v, 'g_id')
                })
                return arr1[index].concat(arr2[index])
            })
            let foodNav = dataid.map((item, index) => {
                results[index].children = children[index]
                return results[index]
            })

            res.send({
                status: 200,
                message: '获取首页导航栏数据成功！',
                data: foodNav
            })
        })
    })
}
//返回数组对象name_id相同的值 
function dataResbyid(arr, id, name_id) {
    let res = arr.filter((item, index) => {
        return item[name_id] == id
    })
    return res
}
exports.getProductData = (req, res) => {
    let arrId = reg_fun.randomARR(17, 190)
    const sql = `SELECT * FROM app_db.pd_info_foods where id in (${arrId[0]},${arrId[1]},${arrId[2]},${arrId[3]});`
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: '200',
            message: '获取首页推荐美食数据成功！',
            result: results
        })
    })
}
// function randomNum(minNum, maxNum) {
//     switch (arguments.length) {
//         case 1:
//             return parseInt(Math.random() * minNum + 1);
//             break;
//         case 2:
//             return parseInt(Math.random() * (maxNum - minNum + 1) + minNum);
//             break;
//         default:
//             return 0;
//             break;
//     }
// }
// //随机数组 (最小，最大，数量)
// function randomARR(minNum, maxNum, times = 4) {
//     let arr = []
//     for (let index = 0; index < times; index++) {
//         let res = randomNum(minNum, maxNum)
//         arr.includes(res)?times++: arr.push(res)
//     }
//     return arr
// }
exports.getHotBrandData = (req, res) => {
    let arr = [10, 27, 35, 46, 56, 65, 74, 81, 93, 105]
    const sql = `SELECT pd_info_foods.id,pd_info_foods.name,pd_info_foods.describe,pd_info_foods.picture FROM app_db.pd_info_foods where id in (${arr[0]},${arr[1]},${arr[2]},${arr[3]},${arr[4]},${arr[5]},${arr[6]},${arr[7]},${arr[8]},${arr[9]});`
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: '200',
            message: '获取首页热门美食数据成功！',
            result: results
        })
    })
}
exports.getFoodinfoData = (req, res) => {
    const sql = `SELECT * FROM app_db.pd_info_foods where id = ?`
    const { id } = req.body
    db.query(sql, id, (err, result) => {
        if (err) return res.cc(err)
        let { zhuliao, fuliao, auth, picture } = result[0]
        zhuliao = zhuliao.split('、')
        fuliao = fuliao.split('、')
        auth = auth.split('、')[0].toString()

        picture = reg_fun.changePicUrl(picture)
        res.send({
            status: '200',
            message: '获取美食详情数据成功！',
            result: {
                ...result[0],
                zhuliao: zhuliao,
                fuliao: fuliao,
                auth: auth,
                picture: picture
            }
        })
    })

}
exports.insFoodDeatilpic = (req, res) => {
    try {
        const files = req.files;
        const arrfiles = [];
        for (const i in files) {
            let file = files[i]
            fs.renameSync(file.path, `uploads/details/${file.originalname}`)
            file.path = `http://127.0.0.1:3007/api/unlimit/uploads/details/${file.originalname}`
            arrfiles.push(file)
        }
        res.send({
            status: 200,
            message: '插入多个图片成功！',
            data: arrfiles
        })
    } catch (error) {
        res.cc(error)
    }
}
exports.insFoodDeatils = (req, res) => {
    const sql = 'insert into app_db.pd_info_fooddetail set ?'
    const { picture, detail, u_id, f_id, namedetail, like, collect, comment } = req.body
    db.query(sql, { picture, detail, u_id, f_id, namedetail, like, collect, comment }, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows !== 1) return res.cc('插入食物详情数据成功！')
        res.cc('插入食物详情数据成功', 200)
    })
}
exports.getFooddetail = (req, res) => {
    const sql = `SELECT * FROM app_db.pd_info_fooddetail where f_id = ?;`
    const { f_id } = req.body
    db.query(sql, f_id, (err, results) => {
        if (err) return res.cc(err)
        try {
            let { picture, detail } = results[0]
            picture = picture.split('*'),
                picture = reg_fun.changePicUrl(picture)
            detail = detail.split('*'),
                results = {
                    ...results[0],
                    picture: picture,
                    detail: detail,
                    picl: picture.length,
                    detl: detail.length,
                    isequPicDetLength: picture.length === detail.length ? true : false
                }
            res.send({
                status: '200',
                message: '获取食物详情描述数据成功！',
                result: results
            })
        } catch (error) {
            res.send({
                status: '400',
                message: '暂无制作流程数据，请联系管理员插入数据！',

            })
        }

    })
}
exports.gerFoodcomment = (req, res) => {
    const sql = 'SELECT * FROM app_db.pd_comment where f_id = ?'
    db.query(sql, req.body.f_id, (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: '200',
            message: '获取食物评论数据成功！',
            result: results
        })
    })
}
exports.getFoodclassify = (req, res) => {
    const dataListId = [1, 2, 3, 5, 7, 8, 11]
    const isAA = [1, 2, 3, 4, 5, 9, 11, 21, 22, 103, 104, 105, 106, 114, 115, 116, 117, 122, 123, 64, 6, 7, 8, 50, 120, 112, 121, 39, 40, 118, 124, 119]
    const sql = `SELECT * FROM app_db.pd_info_goods where c_id in (1, 2, 3, 5, 7, 8, 11);`
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        let childrens = dataListId.map((v) => {
            return results.filter((item) => {
                return item['c_id'] == v
            })
        })
        let classifyLisy = [];
        for (const i of dataListId) {
            for (const j of results) {
                if (j.c_id == i) {
                    classifyLisy.push({
                        id: j.id,
                        describe: j.describe,
                        c_id: j.c_id
                    })
                    break
                }
            }
        }

        classifyLisy = classifyLisy.map((item, i) => {
            classifyLisy[i].childrens = childrens[i]
            return classifyLisy[i]
        })

        res.send({
            status: "200",
            message: '获取食物搜索数据成功！',
            result: classifyLisy
        })
    })
}
//异步push promise
function PROMISECOMMENT(v) {
    return new Promise((resolve, reject) => {
        const sqlStr = `SELECT * FROM app_db.pd_comment where f_id=${v};`
        db.query(sqlStr, (err, resultsss) => {
            resolve({
                id: v,
                length: resultsss.length
            })
        })
    })

}
exports.getSearchShowlist = (req, res) => {
    const { id, name } = req.body
    const sql = `SELECT pd_info_foods.id,pd_info_foods.name,pd_info_foods.picture,pd_info_foods.f_id,pd_info_foods.g_id 
    FROM app_db.pd_info_foods 
    where pd_info_foods.f_id=${id} or pd_info_foods.g_id =${id};`
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        let newarrByid = results.map(v => {
            return v.id
        })
        let promisecomment = []
        newarrByid.forEach((v, i) => {
            promisecomment.push(PROMISECOMMENT(v))
        })
        Promise.all(promisecomment).then((val) => {
            results.forEach((v, i) => {
                v.comml = val[i]
            })
            res.send({
                status: 200,
                message: '获取食物分类菜单成功！',
                name: name,
                result: results,
            })
        }).catch(err => {
            res.cc(err)
        })
    })
}
exports.getUsersearchlist = (req, res) => {
    const { keyward } = req.body
    const sql = `SELECT pd_info_foods.id,pd_info_foods.name,pd_info_foods.picture,pd_info_foods.f_id,pd_info_foods.g_id
    FROM app_db.pd_info_foods 
    where name  like '%${keyward}%';`
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        let newarrByid = results.map(v => {
            return v.id
        })
        let promisecomment = []
        newarrByid.forEach((v, i) => {
            promisecomment.push(PROMISECOMMENT(v))
        })
        Promise.all(promisecomment).then((val) => {
            results.forEach((v, i) => {
                v.comml = val[i]
            })
            res.send({
                status: '200',
                message: '获取用户搜索菜单成功！',
                name: keyward,
                result: results,
            })
        }).catch(err => {
            res.cc(err)
        })


    })
}
exports.getLikenum = (req, res) => {
    const { namedetail, u_id } = req.body
    // const  ips =  req.headers['x-forwarded-for']
    //    const  ips =  '192.168.1.76'
    //     setTimeout(()=>{
    //         console.log('ip:',ips);
    //         console.log('ipPretty',geoip.pretty(ips));
    //         console.log('ipLookup',geoip.lookup(ips));
    //     },1000)

    const sql = ` SELECT * FROM app_db.pd_info_fooddetail where namedetail = '${namedetail}';`
    db.query(sql, (err, results) => {
        if (err || results.length != 1) {
            return res.cc('err')
        }
        let checkList = []
        if (results[0].u_id == 'null') {
            checkList = []
        } else {

            checkList = JSON.parse(results[0].u_id)

        }
        let boolres = reg_fun.boolx(checkList, 'u_id', u_id)

        res.send({
            status: 200,
            message: '获取点赞量成功！',
            result: {
                num: checkList.length,
                isuserId: boolres.bool
            }
        })
    })
}
exports.getCollectnum = (req, res) => {
    const { namedetail, u_id } = req.body
    const sql = ` SELECT * FROM app_db.pd_info_fooddetail where namedetail = '${namedetail}';`
    db.query(sql, (err, result) => {
        if (err || result.length != 1) {
            return res.cc('err')
        }
        let checkList = []
        if (result[0].coll_cont == 'null' || result[0].coll_cont == null || typeof result[0].coll_cont === 'undefined') {
            checkList = []
        } else {
            checkList = JSON.parse(result[0].coll_cont)
        }
        let boolres = reg_fun.boolx(checkList, 'u_id', u_id)

        res.send({
            status: 200,
            message: '获取收藏量成功！',
            result: {
                num: checkList.length,
                isuserId: boolres.bool
            }
        })
    })
}