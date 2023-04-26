//导入数据库操作模块
const db = require('../db/index')
const bcrypt = require('bcryptjs')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
const config = require('../config')
//注册新用户
exports.regUser = (req, res) => {
    //获取用户信息
    const userinfo = req.body
    let {username,password,email,nickname} = req.body
    const sqlStr = `SELECT * FROM ev_users where username=?`
    db.query(sqlStr, username, (err, results) => {
        //sql查询失败
        if (err) {
            return res.cc(err)
        }
        //用户名是否被占用
        if (results.length > 0) {
            return res.cc('用户名已存在，请更换其他用户名!', 402)
        }
        //用户名可用
        //密码加密
        password = bcrypt.hashSync(password, 10)
        const insSql = 'insert into ev_users set ?'
        db.query(insSql, {username,password,email, nickname}, (err, results) => {
            // 执行 SQL 语句失败
            if (err) return res.cc(err)
            // SQL 语句执行成功，但影响行数不为 1
            if (results.affectedRows !== 1) {
                return res.send('注册用户失败，请稍后再试！', 403)
            }
            res.cc('注册成功！', 200)
        })
    })
}
//登录
exports.login = (req, res) => {
    const userinfo = req.body
    
    const sqlStr = `SELECT * FROM ev_users where username=?`
    db.query(sqlStr, userinfo.username, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.length !== 1) {
            return res.cc('登录失败', 405)
        }
        //判断密码是否正确
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compareResult) {
            return res.cc('密码不正确！')
        }
        //生产token字符串，去除密码，头像敏感信息
        const user = { ...results[0], password: '', user_pic: '' }
        //jwt.sign(1,2,3) 1.加密对象；2.加密密钥；3.配置对象expiresIn-token有效期
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {
            expiresIn: config.expiresIn
        })

        // console.log(tokenStr);
        //console.log(results);
        res.send({
            status: 200,
            message: '登录成功！',
            token: 'Bearer ' + tokenStr,
        })
    })

}