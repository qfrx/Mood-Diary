// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  let days = new Date(event.year,event.month,0);
  let result = days.getDate()
  return {
    dayNums:result,
    year:event.year,
    month:event.month,
    time:Number(String(event.year) + String(event.month))
  }
}