//验证user

const joi = require('joi')
/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */

// 用户名的验证规则
const username = joi.string().alphanum().min(1).max(10).required()
// 密码的验证规则
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()
// 定义 id, nickname, emial 的验证规则
const id = joi.number().integer().min(1).required()
const nickname = joi.string().required()
const email = joi.string().email().required()
// 注册和登录表单的验证规则对象
exports.reg_login_user = {
  // 表示需要对 req.body 中的数据进行验证
  body: {
    username,
    password,

  },
}
exports.reg_register_user = {
  body: {
    username,
    password,
    email,
    nickname
  },
}


exports.reg_update_userinfo = {
  body: {
    id,
    nickname,
    email,
  },
}

//更新密码
// 验证规则对象 - 重置密码
exports.reg_update_password = {
  body: {
    // 使用 password 这个规则，验证 req.body.oldPwd 的值
    oldPwd: password,
    // 使用 joi.not(joi.ref('oldPwd')).concat(password) 规则，验证 req.body.newPwd 的值
    // 解读：
    // 1. joi.ref('oldPwd') 表示 newPwd 的值必须和 oldPwd 的值保持一致
    // 2. joi.not(joi.ref('oldPwd')) 表示 newPwd 的值不能等于 oldPwd 的值
    // 3. .concat() 用于合并 joi.not(joi.ref('oldPwd')) 和 password 这两条验证规则
    newPwd: joi.not(joi.ref('oldPwd')).concat(password),
  },
}
//更新图像 base64
const avatar = joi.string().dataUri().required()

exports.reg_update_useracatar = {
  body: {
    avatar
  }
}

//随机数组
function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum);
      break;
    default:
      return 0;
      break;
  }
}
exports.randomARR = (minNum, maxNum, times = 4) => {
  let arr = []
  for (let index = 0; index < times; index++) {
    let res = randomNum(minNum, maxNum)
    arr.includes(res) ? times++ : arr.push(res)
  }
  return arr
}

//对象数组去重
exports.removeDuplicateObj = (arr, id) => {
  let obj = {};
  arr = arr.reduce((newArr, next) => {
    obj[next[id]] ? "" : (obj[next[id]] = true && newArr.push(next));
    return newArr;
  }, []);
  return arr;
};
//处理insFoodlike result 结果 返回 bool 和 存在的索引值
exports.boolx = (objs, K, val) => {
  let boolxRes = {
    bool: false,
    ind: null
  }
  if (objs.length == 0) {
    
    return{
      bool: false,
      ind: -1
    }
  }
  objs.forEach((v, i) => {
    Object.keys(v).forEach((item) => {
      if (item == K && v[item] == val) {
        boolxRes.bool = true
        boolxRes.ind = i
      }
    })
  })
  return boolxRes
}








