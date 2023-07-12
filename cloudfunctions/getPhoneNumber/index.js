// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
 
// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const appid = wxContext.APPID
  const unionid = wxContext.UNIONID
  const enc = wxContext.ENV
  const cloudIdList = event.cloudIdList
  try {
    const result = await cloud.openapi.cloudbase.getOpenData({
      openid: openid,
      cloudidList: cloudIdList
    })
    
    const jsonStr = result.dataList[0].json
    const jsonData = JSON.parse(jsonStr)
    const phoneNumber = jsonData.data.phoneNumber
    console.log("phoneNumber: ",phoneNumber)
 
    return result
  } catch (err) {
    return err 
  }
}