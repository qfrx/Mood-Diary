// pages/userDes/userDes.js
import Toast from '@vant/weapp/toast/toast';

Page({

  data: {
    des:"", //简介value,
    id:'',
    user_id:''
  },

  // 输入事件
  writeFn(e){
    this.setData({
      des:e.detail.value
    })
  },

  //提交
  submit(){
    if (this.data.des != '' && this.data.des) {
      // loding
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
      });
      // 修改数据
      wx.cloud.database().collection('userMessage')
        .doc(this.data.id)
        .update({
          data:{
            des:this.data.des
          }
        })
        .then(res=>{
            Toast.clear()
            wx.redirectTo({
              url: '/pages/user/user'
            })
            wx.navigateBack({
              delta: 1
           })
        })
        .catch(err=>{
            console.log('请求失败',err)
        })
     
    }
  },

  onLoad(options) {
    if (this.data.des != '' && this.data.des != '一句话简单奥介绍自己（20个字符内）') {
      this.setData({
        des:options.des
      })
    }
    this.setData({
      id:options._id,
      user_id:options.user_id
    })
  },

  
})