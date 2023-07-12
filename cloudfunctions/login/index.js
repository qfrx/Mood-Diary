// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const request = require('request')
const db = cloud.database()
// 云函数入口函数
let user_id;
let user_uid;
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let code = event.code;//获取小程序传来的code
  let encryptedData = event.encryptedData;//获取小程序传来的encryptedData
  let iv = event.iv;//获取小程序传来的iv
  let userInfo = JSON.parse(event.userInfo) //获取个人信息
  let appid = "wx8d17f8cb67f33cd9";//小程序后台管理的appid
  let secret = "ec630b92686212048981f58b4f535f08";//小程序后台管理的secret
  let grant_type = "authorization_code";// 授权
  let url = "https://api.weixin.qq.com/sns/jscode2session?grant_type="+grant_type+"&appid="+appid+"&secret="+secret+"&js_code="+code;
  const stat = await new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let _data = JSON.parse(body)
        let UserCount = 0;
        user_id = _data.openid
        user_uid = _data.unionid
        db.collection('Account').where({
          user_id: _data.openid // 填入当前用户 openid
        }).count().then(res => {
          UserCount = res.total;
          if(UserCount == 0){/* 插入当前列表 */
            db.collection('Account').add({
              data: {
                user_id: _data.openid,
                nickName: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                gender: userInfo.gender,
                phone: ''
              }
            })
            .then(res => {
              resolve("Insert success!");
            })
            .catch(res => {
              reject("Insert fail!");
            })
          }else if(UserCount == 1){/* 更新当前列表 */
            db.collection('Account').where({
              user_id: _data.openid // 填入当前用户 openid
            }).update({
              data: {
                nickName: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                gender: userInfo.gender
              }
            })
            .then(res => {
              resolve("Update success!");
            }).catch(res => {
              reject("Update fail!");
            })
          }else if(UserCount > 1){/* 删除所有此id的并且重新添加 */
            db.collection('Account').where({
              user_id: _data.openid // 填入当前用户 openid
            }).remove()
            .then(res => {
              db.collection('Account').add({
                data: {
                  user_id: _data.openid,
                  nickName: userInfo.nickName,
                  avatarUrl: userInfo.avatarUrl,
                  gender: userInfo.gender,
                  phone: ''
                }
              })
              resolve("Remove and insert success!");
            }).catch(res => {
              reject("Remove fail!");
            })
          }
        })
      }
    })
  })

  const CurrentPhoneObject = await db.collection('Account').where({
    user_id: user_id // 填入当前用户 openid
  }).get()
  const CurrentPhone = CurrentPhoneObject.data[0].phone
  console.log("CurrentPhone: ",CurrentPhone);
  console.log("stat: ",stat);
  console.log("user_id: ",user_id);
  console.log("user_uid: ",user_uid);
  return {
    status: stat,
    CurrentPhone: CurrentPhone,
    openid: user_id,
    unionid: user_uid
  }
}