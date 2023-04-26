const express = require('express')
const app = express()
const port = 3007

// 导入 cors 中间件
const cors = require('cors')
//错误验证
const joi = require('joi');
// 将 cors 注册为全局中间件
app.use(cors())
//解析json
app.use(express.json())
//配置解析 `application/x-www-form-urlencoded` 格式的表单数据的中间件：
app.use(express.urlencoded({ extended: false }))

//优化 res.send() 代码
// 响应数据的中间件
app.use(function (req, res, next) {
  // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
  res.cc = function (err, status = 400) {
    res.send({
      // 状态
      status,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

//解析token中间件
const expressJwt = require('express-jwt')
const config = require('./config')
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJwt({
  secret: config.jwtSecretKey
}).unless({
  path: [/^\/api\/unlimit\//]
}))

// 导入并使用用户路由模块
const userRouter = require('./router/user')
app.use('/api/unlimit/user', userRouter)
// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
// 注意：以 /limit 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/api/limit/userinfo', userinfoRouter)

const foodRouter = require('./router/food')
app.use('/api/unlimit/food', foodRouter)

app.use('/api/unlimit/uploads/foodpic', express.static('./uploads/foodpic'))
app.use('/api/unlimit/uploads/details', express.static('./uploads/details'))
app.use('/api/unlimit/uploads/userpic', express.static('./uploads/userpic'))


// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知错误
  res.cc(err)
})

app.listen(port, () =>
  console.log(`api server running at http://127.0.0.1:3007`
  ))