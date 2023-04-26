const express = require('express')
const router = express.Router()
const user_handler = require('../router_handler/user')
const fs = require('fs')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const { reg_login_user,reg_register_user } = require('../reg/user')

// 注册新用户
router.post('/reguser',expressJoi(reg_register_user),user_handler.regUser )

// 登录
router.post('/login', expressJoi(reg_login_user),user_handler.login)
// router.post('/upload',(req,res)=>{
//     res.send('ok')
// })

//https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
//  dest 属性，这将告诉 Multer 将上传文件保存在哪
// .single(fieldname) 接受一个以 fieldname 命名的文件。这个文件的信息保存在 req.file
//    fs.renameSync   重命名
//
//头像上传测试
router.post('/profilesing', upload.single('avatar'), function (req, res, next) {
    // req.file 是 `avatar` 文件的信息
    // req.body 将具有文本域数据，如果存在的话
    //console.log(req.file);
    fs.renameSync(req.file.path,`uploads/${req.file.originalname}`)
    res.send(req.file)
  })

router.post('/profileMore',upload.array('images',10),(req,res)=>{
  //req.file是 `images` 文件的信息
    const files = req.files;
    const arrfiles = [];
    for (const i in files) {
      let file = files[i]
      fs.renameSync(file.path,`uploads/${file.originalname}`)
      file.path = `uploads/${file.originalname}`
      arrfiles.push(file)
    }
    //console.log(files);
    res.send(arrfiles)
})
//上传多个图片 https://blog.csdn.net/qq_15980721/article/details/104210528
router.get('/profileimg',(req,res)=>{
  console.log(req.body);
  //  req.query.url? res.download(`uploads/${req.query.url}`):res.send({
  //   success:'false'
  // })
  console.log(`uploads/${req.body.url}`);
  if (req.body.url) {
      res.download(`uploads/${req.body.url}`)
  }else{
    res.send(err)
  }
 
 
})


module.exports = router