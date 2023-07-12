// pages/home/home.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
Page({
  data:{
    monthList:[], // 月数据
    yearList:[], // 年数据
    defaultIconList:[], // 表情
    btnRouteY:'180deg', // 关闭按钮旋转角度
    tabContentTransition:'0vh',// 表情弹出框动画数据
    tabShow:true, //表情弹出框显示开关
    monthShow:true, //显示月/年日历
    mood:null, // 心情
    time:{}, //日期
    now:{}, //当前日期
    vipFlag:true,// vip悬浮窗开关
    show:false

  },

  // 选择日期进行书写
  selectOpenWritePage(e){
    let y = this.data.monthList.year
    let m = this.data.monthList.month
    let d = e.currentTarget.dataset.day
    let w = new Date(`${y}-${m}-${d}`).getDay()
    //没有数据时
    if (e.currentTarget.dataset.mood == undefined) {
      this.setData({
        time:{y,m,d,w},
        tabContentTransition:'0',
        tabShow:false
      })
      setTimeout(()=>{
        this.setData({
          btnRouteY:'225deg',
        })
      },300)
    }else{
      // 已经有数据是
      this.setData({
        time:{y,m,d,w},
      })
      wx.redirectTo({
        url: '/pages/write/write?mood='+JSON.stringify(e.currentTarget.dataset.mood)+'&time=' + JSON.stringify(this.data.time),
      })
      // wx.navigateTo({
      //   url: '/pages/write/write?mood='+JSON.stringify(e.currentTarget.dataset.mood)+'&time=' + JSON.stringify(this.data.time),
      // })
    }

  },

  // 选择表情跳转写日记
  openWritePage(e){
    //关闭弹窗
    this.setData({
      tabShow:'true'
    })
    //跳转
    wx.redirectTo({
      url: '/pages/write/write?mood='+JSON.stringify(e.currentTarget.dataset.mood)+'&time=' + JSON.stringify(this.data.time),
    })
  },

  // 弹出层关闭按钮点击事件
  btnClickClose(){
    this.setData({
      tabContentTransition:'55vh',
      btnRouteY:'180deg'
    })
    setTimeout(()=>{
      this.setData({
        tabShow:true
      })
    },300)
  },

  // 弹出层打开按钮点击事件
  btnClickOpen(){
    // 获取当前日期
    const now = new Date
    let y =  now.getUTCFullYear()
    let m = now.getUTCMonth() + 1
    let d = now.getDate()
    let w = now.getDay()
    this.setData({
      tabContentTransition:'0',
      tabShow:false,
      time:{y,m,d,w}
    })
    setTimeout(()=>{
      this.setData({
        btnRouteY:'225deg',
      })
    },300)
  },

  // 跳转用户页
  toUserPage:function () {
    wx.navigateTo({
      url: '/pages/user/user',
    })
  },

  //跳转小宇宙页
  toWordPage:function(){
     //检查等绿状态
     wx.getStorage({
      key: 'code',
      success: function(res) {
        wx.navigateTo({
          url: '/pages/word/word',
        })
      },
      fail: function() {
        // 弹出登录确认框
        Dialog.confirm({
          title: '提示',
          message: '检查到您尚未登录，登录后开启本功能',
        })
          .then(() => {
            wx.navigateTo({
              url: '/pages/user/user',
            })
          })
          .catch(() => {
          });
      }
    })
  },

  // 跳转待办页
  goStatePage(){
      //检查等绿状态
      wx.getStorage({
        key: 'code',
        success: function(res) {
          wx.navigateTo({
            url: '/pages/state/state',
          })
        },
        fail: function() {
          // 弹出登录确认框
          Dialog.confirm({
            title: '提示',
            message: '检查到您尚未登录，登录后开启本功能',
          })
            .then(() => {
              wx.navigateTo({
                url: '/pages/user/user',
              })
            })
            .catch(() => {
            });
        }
      })
  },

  //获取月数据
  getNowMonthData(year,month){
    wx.cloud.database().collection('calendar')
    .where({
        year:year,
        month:month
    })
    .get()
    .then(res=>{
        this.setData({
          monthList:res.data[0]
        })
    })
  },

  // 获取年数据
  getYearData:function(e){
    Toast.loading({
      message: '加载中...',
      forbidClick: true
    });
    wx.cloud.database().collection('calendar')
    .orderBy('month', 'asc')
    .where({
        year:e.currentTarget.dataset.year
    })
    .get()
    .then(res=>{
        Toast.clear()
        this.setData({
          yearList:res.data,
          monthShow:false
        })
    })
  },

  // 在年日历选择月份跳转
  goMonthCalendar(e){
    let year = e.currentTarget.dataset.year
    let month = e.currentTarget.dataset.month
    this.getNowMonthData(year,month)
    this.setData({
      monthShow:true
    })
  },

  // 添加每年的数据
  getDays(nowYear) {
    let nowTime = new Date// 当前日期
    let y =  nowTime.getUTCFullYear() // 当前年
    // 判断是否为当前年
    if (nowYear === y) { 
      let m = nowTime.getUTCMonth() + 1 // 当前月
      let mArr = []  // 当前年份已达的月数
      for (let index = 0; index < m; index++) {
        mArr.push(index + 1)
      }
      // 数据库查询是否有当前时间的数据
      wx.cloud.database().collection('calendar') 
      .where({
        year:nowYear
      })
      .get()
      .then(res=>{
          if (res.data.length < m) {
            res.data.forEach((n,i)=>{
              let num = mArr.findIndex(item => item == n.month)
              mArr.splice(num,1)
            })
            mArr.forEach((n,i)=>{
                // 调用云函数获取当月天数
                wx.cloud.callFunction({
                  name: 'calendar', 
                  data:{year:nowYear,month:n}, //传参
                  success:(res) =>{
                    var monthData = [] //月分详细数据
                    for (let day = 0; day < res.result.dayNums; day++) {
                      monthData.push(
                        {"day":day+1,"text":{}}
                        )
                    }
                    // 添加缺少的月份数据
                    wx.cloud.database().collection('calendar')
                    .add({
                        data:{
                            year:nowYear,
                            month:res.result.month,
                            time:res.result.time,
                            data:monthData
                        }
                    })
                    .then(res=>{
                      // 刷新页面
                      //  this.onLoad()
                    })
                  }
                })
            })
          }
      })
    }else{
        // 数据库查询是否有当前时间的数据
        wx.cloud.database().collection('calendar') 
        .where({
          year:nowYear
        })
        .get()
        .then(res=>{
            if (res.data.length === 0) {
              let mArr = [1,2,3,4,5,6,7,8,9,10,11,12]
              mArr.forEach((n,i)=>{
                  // 调用云函数获取当月天数
                  wx.cloud.callFunction({
                    name: 'calendar', 
                    data:{year:nowYear,month:n}, //传参
                    success:(res) =>{
                      var monthData = [] //月分详细数据
                      for (let day = 0; day < res.result.dayNums; day++) {
                        monthData.push(
                          {"day":day+1,"text":{}}
                          )
                      }
                      // 项数据库中添加缺少的月份数据
                      wx.cloud.database().collection('calendar')
                      .add({
                          data:{
                              year:nowYear,
                              month:res.result.month,
                              time:res.result.time,
                              data:monthData
                          }
                      })
                      .then(res=>{
                        // 刷新页面
                          // this.onLoad()
                      })
                    }
                  })
              })
            }
        })
    }
  },

  // 获取表情数据
  getmoodsData(){
    wx.cloud.database().collection('defaulticon')  //固定写法
    .doc('d460268e649c1b8b000848ac4677b4ac')
    .get()
    .then(res=>{
        this.setData({
          defaultIconList:res.data.defaultIcon
        })
    })
  },

  // 获取当前时间
  getNowTime(){
    let now = new Date
    let nowYear = now.getUTCFullYear() 
    let nowMonth = now.getUTCMonth() + 1
    let nowDay = now.getDate()
    this.setData({
      now:{year:nowYear,month:nowMonth,day:nowDay}
    })
  },

  // 关闭vip悬浮窗
  closeFloatingWindow(){
    this.setData({
      vipFlag:false
    })
  },

  // 跳转vip开通页
  openVipPaage(){
    wx.navigateTo({
      url: '/pages/vip/vip',
    })
  },

  // 跳转canvas页
  goCanvasPage(){
    let that = this
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });
    //检查登录状态
    wx.getStorage({
      key: 'code',
      success: function(res) {
        // 已经登录状态，开始检测vip状态
        //获取用户id
        wx.getStorage({
          key: '_id',
          success: res=> {
            //  查询用户信息
              wx.cloud.database().collection('userMessage')
                .doc(res.data)
                .get()
                .then(res=>{
                if (res.data.vip) { //vip用户
                  Toast.clear()
                    wx.navigateTo({
                      url: '/pages/canvas/canvas?time=' +  JSON.stringify(that.data.time),
                    })
                }else{
                  //弹出开通广告
                  Toast.clear()
                  Dialog.confirm({
                    title: '提示',
                    message: '该功能为vip用户专属功能，是否舔砖vip开通页面？',
                  })
                    .then(() => {
                      wx.navigateTo({
                        url: '/pages/vip/vip',
                      })
                    })
                    .catch(() => {
                      
                    });
                }
              })
              .catch(err=>{
                  console.log('请求失败',err,'+++++++++++++++')
              })
          },
        })
      },
      fail: function() {
        // 弹出登录确认框
        Dialog.confirm({
          title: '提示',
          message: '检查到您尚未登录，登录后开启本功能',
        })
          .then(() => {
            wx.navigateTo({
              url: '/pages/user/user',
            })
          })
          .catch(() => {
          });
      }
    })

  },

  // 生命周期
  onLoad(options) {
    this.getNowTime()
    this.getDays(this.data.now.year)
    if (options.year == undefined) {
      this.getNowMonthData(this.data.now.year,this.data.now.month)
    }else{
      this.getNowMonthData(Number(options.year),Number(options.month))
    }
    this.getmoodsData()
  },
  // onReady(){
  //   this.getNowTime()
  //   this.getDays(this.data.now.year)
  // }
})




