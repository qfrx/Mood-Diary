// pages/state/state.js
Page({
  data: {
    tabSelect:'inc',
    incompleteList:[],
    completeList:[],
    weekNumber:["一","二","三","四","五","六","日"], //周日格式
    time:{},
    mood:{}
  },

  // 选项卡切换
  tabSelect(e){
   this.setData({
     tabSelect:e.currentTarget.dataset.select
   })
  },

  // 获取待办数据
  getIncomplete(){
    wx.cloud.database().collection('states')  
    .where({
      state:false
    })
    .orderBy('timeId','desc')
    .get()
    .then(res=>{
      this.setData({
        incompleteList:res.data
      })
      console.log(this.data.incompleteList);
    })
  },

   //查询已完成待办数据
   getComplete(){
    wx.cloud.database().collection('states')  
    .where({
      state:true
    })
    .orderBy('timeId','desc')
    .get()
    .then(res=>{
      this.setData({
        completeList:res.data
      })
    })
  },

  // 跳转编辑页
  openWritePage(e){
    this.setData({
      time:e.currentTarget.dataset.time,
      mood:e.currentTarget.dataset.mood
    })
    wx.redirectTo({
      url: '/pages/write/write?mood='+JSON.stringify(this.data.mood)+'&time=' + JSON.stringify(this.data.time),
    })
  },

  onLoad(options) {
    this.getIncomplete()
    this.getComplete()
  },
})