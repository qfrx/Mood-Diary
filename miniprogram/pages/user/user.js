// pages/user/user.js
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    userPhone:'',
    user:null,
    userMessage:{},
    checked: true
  },

  //订阅提示
  addMyssaage(){
    Toast('已成功订阅~');
  },

  // 登录
  async getUserProfile(e) {
    let that = this
    wx.getUserProfile({
      desc: '用于获取用户个人信息',
      success: function (detail) {
        console.log('detail',detail);
        wx.login({
          success: res => {
            // 更改登录状态
            wx.setStorage({
              key:"code",
              data:code,
              success: function() {
                that.getUser()
              },
              fail: function() {
                console.log('写入code发生错误')
              }
            })
            //返回页面
            wx.navigateBack({
                delta: 1
            })
        
            var code = res.code; //登录凭证
            wx.cloud.callFunction({
              name: "login",
              data: {
                encryptedData: detail.encryptedData,
                iv: detail.iv,
                code: code,
                userInfo: detail.rawData
              }
            }).then(res => {
              console.log("res:",res);
              var openid = res.result.openid;
              var status = res.result.status;
              var phone = res.result.phone;
              console.log("openid: ",openid);
              console.log("status: ",status);
              console.log("phone: ",phone);
              console.log("nickName: ",detail.userInfo.nickName);
              
              if(phone==undefined){
                console.log("需要绑定手机号");
              }else{
                console.log("授权成功");
              }
           
            }).catch(res => {
              console.log("res3: ",res);
            })
          }
        });
      },
      fail: function () {
       wx.showModal({
         content: '取消授权将会影响相关服务，您确定取消授权吗？',
         success (res) {
           if (res.confirm) {
             wx.showToast({
               title: '已取消授权',
               duration: 1500
             })
           } else if (res.cancel) {
             that.getUserProfile()
           }
         }
       })
      }
    })
  },

  // 退出登录
  delLogin(){
    // 删除code
    Toast.loading({
      message: '退出中...',
      forbidClick: true,
    });
    setTimeout(()=>{
      Toast.clear()
    },1000)
    wx.removeStorage({
      key: 'code',
      success: function(res) {
        console.log(res.data);
      },
    });
    wx.removeStorageSync(
      'code'
    )

    // 用户数据初始化
    this.setData({
      user:null,
      userMessage:{},
      userPhone:{}
    })
  },

  // 获取手机号码
  async getPhoneNumber(res) {
    console.log(res)
    const errMsg = res.detail.errMsg
    if (errMsg != "getPhoneNumber:ok"){
      wx.showToast({
        title: '授权失败',
        icon: 'error'
      })
      return
    }
    const cloudId = res.detail.cloudID
    const cloudIdList = [cloudId]
    wx.showLoading({
      title: '获取中',
      mask: true
    })
    const cloudFunRes = await wx.cloud.callFunction({
      name: "getPhoneNumber",
      data: {
        cloudIdList
      }
    })
    const jsonStr = cloudFunRes.result.dataList[0].json
    const jsonData = JSON.parse(jsonStr)
    const phoneNumber = jsonData.data.phoneNumber
    this.setData({
      userPhone: phoneNumber
    })
    wx.hideLoading({
      success: (res) => {},
    })
  },

  // 获取用户信息
  getUser(){
    // loding
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });
    wx.cloud.database().collection('Account')  //固定写法
    .get()
    .then(res=>{
      if (res.data[0].des==undefined) {
        res.data[0].des = '一句话简单奥介绍自己（20个字符内）'
      }
      this.setData({
        user:res.data[0]
      })
      this.getUserMessage()
    })
  },

  // 获取用户详情
  getUserMessage(){
    wx.cloud.database().collection('userMessage')
    .where({
        user_id:this.data.user.user_id
    })
    .get()
    .then(res=>{
        if (res.data.length==0) {
          wx.cloud.database().collection('userMessage')
          .add({
            data:{
              des:'一句话简单奥介绍自己（20个字符内）',
              vip:false,
              user_id:this.data.user.user_id,
              avatarUrl:this.data.user.avatarUrl,
              nickName:this.data.user.nickName,
            }
          })
          .then(res=>{
            this.getUserMessage()
          })
          return
        }
       this.setData({
         userMessage:res.data[0]
       })
        // 设置用户id到本地
        wx.setStorage({
        key:"_id",
        data:res.data[0]._id,
        })
       Toast.clear()
    })
    .catch(err=>{
        console.log('请求失败',err)
    })
  },

  // 重置用户简介
  setDes(){
 
    // wx.cloud.database().collection('Account')  //固定写法
    // .doc(this.data._id)
    // .update({
    //   data:{
        
    //   }
    // })
  },

  // 检测登录状态
  checkLogin(){
    //检查登录状态
    wx.getStorage({
      key: 'code',
      success: res=> {
        this.getUser()
      }
    })
  },

   // 跳转vip开通页
   openVipPaage(){
    wx.navigateTo({
      url: '/pages/vip/vip',
    })
  },

  //隐私开关
  onChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ checked: detail });
  },

  // 生命周期
  onLoad(){
     this.checkLogin()
  }
})