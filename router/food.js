const express = require('express')
const router = express.Router()
const food_handler = require('../router_handler/food')

const fs = require('fs')
const multer = require('multer')
const upload = multer({ 
    dest: 'uploads/foodpic/',
//解决中文乱码
    fileFilter(req,file,callback){
        file.originalname = Buffer.from(file.originalname,'latin1').toString('utf-8')
        callback(null,true)
    }
})
const detail = multer({
    dest: 'uploads/details/',
    fileFilter(req,file,callback){
        file.originalname = Buffer.from(file.originalname,'latin1').toString('utf-8')
        callback(null,true)
    }
})

//插入食物详细数据
router.post('/insFoodinfo',food_handler.insFoodinfo)
//插入食物图片
router.post('/insFoodpic',upload.single('picture'), food_handler.insFoodpic)

//首页轮播图图片
router.get('/getFoodSwiper',food_handler.getFoodSwiper)
//首页导航栏数据
router.get('/getFoodNav',food_handler.getFoodNav)
//首页推荐美食
router.get('/getProductData',food_handler.getProductData)
//首页热门美食
router.get('/getHotBrandData',food_handler.getHotBrandData)
//食物详情接口
router.post('/getFoodinfoData',food_handler.getFoodinfoData)
//插入多张食物图片接口
router.post('/insFoodDeatilpic',detail.array('picture',20),food_handler.insFoodDeatilpic)
//插入多张食物详情
router.post('/insFoodDeatils',food_handler.insFoodDeatils)
//获取pd_info_fooddetail 信息
router.post('/getFooddetail',food_handler.getFooddetail)
//获取食物评论
router.post('/gerFoodcomment',food_handler.gerFoodcomment)
//食物分类nav
router.get('/getFoodclassify',food_handler.getFoodclassify)
//获取食物不同分类菜单
router.post('/getSearchShowlist',food_handler.getSearchShowlist)
//用户搜索
router.post('/getUsersearchlist',food_handler.getUsersearchlist)
//菜品点赞数
router.post('/getLikenum',food_handler.getLikenum)
//收藏数
router.post('/getCollectnum',food_handler.getCollectnum)
module.exports = router

