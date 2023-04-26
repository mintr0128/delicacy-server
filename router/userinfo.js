// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()
const userinfo_handler= require('../router_handler/userinfo')

const expressJoi = require('@escook/express-joi')
const {reg_update_userinfo,reg_update_password,reg_update_useracatar} = require('../reg/user')

const multer = require('multer')
const upload = multer({ 
    dest: 'uploads/userpic/',
//解决中文乱码
    fileFilter(req,file,callback){
        file.originalname = Buffer.from(file.originalname,'latin1').toString('utf-8')
        callback(null,true)
    }
})

// 获取用户的基本信息
router.get('/getuserinfo', userinfo_handler.getuserinfo)
// 退出登录
router.get('/logout',userinfo_handler.logout)
//更新用户的基本信息
router.post('/updateUserinfo',expressJoi(reg_update_userinfo),userinfo_handler.updateUserinfo)
//更新密码
router.post('/updateUserPassword',expressJoi(reg_update_password),userinfo_handler.updateUserPassword)
//更新图像
router.post('/updateUserAvatar',expressJoi(reg_update_useracatar),userinfo_handler.updateUserAvatar)
//插入评论
router.post('/insComment',userinfo_handler.insComment)
//用户点赞
router.post('/insFoodlike',userinfo_handler.insFoodlike)
router.post('/insFoodCollect',userinfo_handler.insFoodCollect)
//上传用户图像
router.post('/insUserPic',upload.single('user_pic'),userinfo_handler.insUserPic)
// 向外共享路由对象
module.exports = router