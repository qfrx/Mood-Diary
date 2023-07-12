// pages/write/write.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    time:{}, //时间
    weekNumber:["一","二","三","四","五","六","日"], //周日格式
    wordContainerMarging:'20px 0  0',
    alignment:0, // 文本对齐方式
    weatherList:[], //天气数据列表
    weather:[], //天气数据
    weatherTabTransform:'50vh',//天气弹出框位置
    bgShowFlag:false, // 遮罩层开关
    weatherTabShow:false, // 天气弹窗开关
    weatherActive:0, //默认天气下标
    eventsList:[], //事件数据列表
    events:[], //事件数据
    eventsActive:[0], //事件选中下标
    eventsTabShow:false,// 事件弹窗开关
    eventsTabTransform:'70vh',
    mood:null,
    title:'', //日记标题
    textAlign:'left',//对齐方式
    placeholder:'写下今天的心情吧！',
    showChecked:false, // 是否加入待办
    checked: false, //待办状态
  },
  //返回主页
  backHome(){
    wx.redirectTo({
      url: '/pages/home/home?month=' + this.data.time.m + '&year=' + this.data.time.y
    })
  },
  // 获取天气数据
  getWeatherData:function(){
    wx.cloud.database().collection('weather')
    .doc('5987e352649a9432033372a37c620176')
    .get()
    .then(res=>{
        this.setData({
          weatherList:res.data.tianqs,
          weather:res.data.tianqs[this.data.weatherActive]
        })
    })
  },

  // 显示天气弹窗
  openWeatherTab(){
    console.log(1);
      //显示遮罩层
      this.setData({
        weatherTabTransform:0,
        weatherTabShow:false,
        bgShowFlag:true,
      })
  },

  //关闭天气弹窗
  closeWeatherTab(){
    this.setData({
      bgShowFlag:false,
      weatherTabTransform:'50vh',
    })
  },
  
  // 选择天气
  selectWeather(e){
    this.setData({
      weatherActive:e.currentTarget.dataset.weatheractiveindex,
      weather:this.data.weatherList[e.currentTarget.dataset.weatheractiveindex]
    })
    this.closeWeatherTab()
  },

  //  获取事件数据
  getEventData:function(){
    wx.cloud.database().collection('events')
    .doc('3f194111649a93810345da5c06eff630')
    .get()
    .then(res=>{
        this.setData({
          eventsList:res.data.events,
          events:[res.data.events[this.data.eventsActive[0]]]
        })
    })
  },

  // 显示天气弹窗
  openEventsTab(){
    console.log(1);
      //显示遮罩层
      this.setData({
        eventsTabTransform:0,
        eventsTabShow:false,
        bgShowFlag:true,
      })
  },
  
  //关闭天气弹窗
  closeEventsTab(){
    this.setData({
      bgShowFlag:false,
      eventsTabTransform:'70vh',
    })
  },

 // 选择事件
 selectEvents(e){
  let index = this.data.eventsActive.findIndex(item=>item==e.currentTarget.dataset.eventsactiveindex)
  let newEventsActive = this.data.eventsActive
  if (index == -1) {
    if (this.data.eventsActive.length<2) {
      newEventsActive.push(e.currentTarget.dataset.eventsactiveindex)
    }else{
      Toast('最多只能选择两个~');
      return
    }
  }else{
    if (this.data.eventsActive.length>1) {
      newEventsActive.splice(index,1)
    }else{
      Toast('至少选择一个~');
      return
    }
  }
  this.setData({
    eventsActive:newEventsActive
  })
},

// 确定事件选择
sureEventSelect(){
  let newEvents = []
  this.data.eventsActive.forEach((n)=>{
    newEvents.push(this.data.eventsList[n])
  })
  this.setData({
    events:newEvents
  })
  this.closeEventsTab()
},

//初始化富文本组件
  onEditorReady(){
    var that=this
    // 初始化一个实例
    wx.createSelectorQuery().select('#editor').context(res=>{
      that.oneEditor=res.context
      // console.log(res.context,'+++++++++++++++++++++++')
    }).exec()
  },

  // 插入图片
  insertImage(){
    var that=this
    wx.chooseMedia({
      count:1,
      mediaType:['image'],
      sourceType:['album', 'camera'],
      success(res){
        let url=res.tempFiles[0].tempFilePath
          that.oneEditor.insertImage({
            src:url,
            extClass:"image",
            alt:"图片加载错误",
            width:"50%",
          })
      }
    })
  },

  // 改变对齐方式
  changeAlign(){
    var that=this
    let align = this.data.textAlign
    if (align=='left') {
      this.setData({
        textAlign:'center'
      })
    }else if(align=='center'){
      this.setData({
        textAlign:'right'
      })
    }else if(align=='right'){
      this.setData({
        textAlign:'left'
      })
    }
    that.oneEditor.format('align', this.data.textAlign )
  },

  //插入时间 
  setTime(){
    let now = new Date
    let h = now.getHours()
    let m = now.getMinutes()
    let s = now.getSeconds()
    let time = `[${h<10?'0' + h:h}:${m<10?'0' + m:m}:${s<10?'0' + s:s}]`
    this.oneEditor.insertText({
      'text':'\n\n' + time
    })
  },

  // 清空内容
  clear(){
    this.oneEditor.clear()
  },

  // 添加待办
  addState(){
    this.setData({
      showChecked:!this.data.showChecked,
      checked:false
    })
  },

  //待办状态
  onChange(event) {
    this.setData({
      checked: event.detail,
    });
  },

  // 添加待办数据
  addStateData(){
    wx.cloud.database().collection('states')
    .add({
      data:{
        state:this.data.checked,
        timeId:Date.parse(new Date()),
        mood:this.data.mood,
        events:this.data.events,
        weather:this.data.weather,
        time:this.data.time
      }
    })
  },

  // 删除待办数据
  removeStateDate(){
    let _id = ''
    // 查询是否已存在
    wx.cloud.database().collection('states')
    .where({
      time:this.data.time
    })
    .get()
    .then((res)=>{
      if (res.data.length>0) {
        _id = res.data[0]._id
      //  更新
        wx.cloud.database().collection('states')
        .doc(_id)
        .remove()
      }
    })
  },

  // 更新待办数据
  updataStateData(){
    let _id = ''
    // 查询是否已存在
    wx.cloud.database().collection('states')
    .where({
      time:this.data.time
    })
    .get()
    .then((res)=>{
      if (res.data.length>0) {
        _id = res.data[0]._id
      //  更新
        wx.cloud.database().collection('states')
        .doc(_id)
        .update({
          data:{
            state:this.data.checked,
            timeId:Date.parse(new Date()),
            mood:this.data.mood,
            events:this.data.events,
            weather:this.data.weather
          }
        })
      }else if(res.data.length==0){
        this.addStateData()
      }
    })
  },

  // 富文本编辑器聚焦
  editorFocus(){
    this.setData({
      wordContainerMarging:'20px 0 20vh'
    })
  },

  // 富文本编辑器失去焦点
  editorblur(){
    this.setData({
      wordContainerMarging:'20px 0 0'
    })
  },

  // 提交
  formSubmit(){
    //loading
    Toast.loading({
      message: '保存中...',
      forbidClick: true,
    });
    // 获取富文本编辑器html
    let text = ''
    this.oneEditor.getContents({
      success(res){
        text = res.html
      }
    })
    //查询当前日期数据
    wx.cloud.database().collection('calendar')
    .where({
      year:this.data.time.y,
      month:this.data.time.m
    })
    .get()
    //成功时执行
    .then(res=>{
      let d = this.data.time.d 
      let newData = res.data[0].data
      if (this.data.showChecked) {
        newData.splice(d-1,1,{day:d,text:{
          html:text,
          title:this.data.title,
          events:this.data.events,
          time:this.data.time,
          weather:this.data.weather,
          mood:this.data.mood,
          state:this.data.checked
        }})
        // 更新待办数据
        this.updataStateData()
      }else{
        newData.splice(d-1,1,{day:d,text:{
          html:text,
          title:this.data.title,
          events:this.data.events,
          time:this.data.time,
          weather:this.data.weather,
          mood:this.data.mood
        }})
        // 删除待办数据
        this.removeStateDate()
      }
      //更新数据
      wx.cloud.database().collection('calendar')
      .doc(res.data[0]._id)
      .update({
        data:{
          data:newData
        },
        success:res=>{
          Toast.clear()
          wx.redirectTo({
            url: '/pages/home/home?month=' + this.data.time.m + '&year=' + this.data.time.y
          })
        //   wx.navigateBack({
        //     delta: 1
        // })
        }
      })
    })
},

  //检查登录状态
  checkLogin(){ 
    let that = this
      wx.getStorage({
      key: 'code',
      // 已经登录
      success: function(res) {
      that.formSubmit()
      },
      fail: function() {
        // 未登录弹出登录确认框
        Dialog.confirm({
          title: '提示',
          message: '检查到您尚未登录，登录后开启本功能',
        })
          .then(() => {
            console.log('确认');
            wx.navigateTo({
              url: '/pages/user/user',
            })
          })
          .catch(() => {
            console.log('取消');
          });
        }
      })
  },

  // 初始化渲染
  star(){
    wx.cloud.database().collection('calendar')
    .where({
      year:this.data.time.y,
      month:this.data.time.m
    })
    .get()
    .then(res=>{
      let result = res.data[0].data[this.data.time.d-1].text
        if (Object.keys(result).length!==0) {
          this.oneEditor.setContents({
            'html':result.html
          })
          this.setData({
            events:result.events,
            mood:result.mood,
            title:result.title,
            weather:result.weather,
            time:result.time
          })
          if (result.state != undefined) {
            this.setData({
              showChecked:true,
              checked:result.state
            })
          }
        }
    })
  },

  //生命周期
  onLoad(options) {
    this.getWeatherData(),
    this.getEventData(),
    //获取传的入表情
    this.setData({
      mood:JSON.parse(options.mood),
      time:JSON.parse(options.time)
    })
   
  },
  onReady(){
    this.star()
  }
})