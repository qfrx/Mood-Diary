// pages/canvas/canvas.js
import Notify from '@vant/weapp/notify/notify';
Page({
  data: {
    time:null, //传过来的事件
    active:0, //工具选择
    biankIconsList:[], //轮廓数据
    blankActive:0, //轮廓喜选择
    srcMapList:[], //背景src数据
    colorList:[],// 颜色数据
    bgActive:0, //背景色选中
    isOver:false, //是否有绘画内容
    colorActive:23, //默认画笔颜色
  
    pen: 3,
    color: '#000',
    canvas: '',
    ctx: '',
    first: true,
    width:300,
    height:300,
    bgImg:'https://uniapp.top/tupian/diary/biank/XUvCozv7SsZx4f989d0a70456418a4c2869ec5c47d52.png',

    resultUrl:'' //绘制结果
  },

//js-fun 画线
start(e) {
  if (this.data.first) {
    // this.clearClick();
    this.setData({
      first: false
    })
  }
  //画笔粗细
  this.data.ctx.lineWidth = this.data.pen
  // 画笔颜色
  if (this.data.active==4) {
    console.log(11111111);
    this.data.ctx.fillStyle = '#' + this.data.colorList[this.data.bgActive]
    this.data.ctx.strokeStyle = '#' + this.data.colorList[this.data.bgActive]
  }else{
    this.data.ctx.fillStyle = this.data.color
    this.data.ctx.strokeStyle = this.data.color
  }
  this.data.ctx.beginPath(); // 开始创建一个路径，如果不调用该方法，最后无法清除画布
  this.data.ctx.moveTo(e.changedTouches[0].x, e.changedTouches[0].y) // 把路径移动到画布中的指定点，不创建线条。用 stroke 方法来画线条
},
move(e) {
  if (this.data.active==3 || this.data.active==4) {
    this.data.ctx.lineTo(e.changedTouches[0].x, e.changedTouches[0].y) // 增加一个新点，然后创建一条从上次指定点到目标点的线。用 stroke 方法来画线条
    this.data.ctx.stroke()
    this.setData({
      isOver:true
    })
  }else{
    Notify('当前未在绘画模式下，请选择正确模式');
  }
},

// 初始化Canvas
createCanvas() {
  const query = wx.createSelectorQuery();
  query.select('#canvas').fields({
    node: true,
    size: true
  }).exec((res) => {
    const canvas = res[0].node;
    const ctx = canvas.getContext('2d');
    canvas.width = this.data.width; // 画布宽度
    canvas.height = this.data.height; // 画布高度
    //ctx.scale(pr, pr); // 缩放比
    ctx.lineGap = 'round'; //圆
    ctx.lineJoin = 'round'; //圆
    ctx.lineWidth = this.data.pen; // 字体粗细
    // ctx.font = '40px Arial'; // 字体大小，
    ctx.fillStyle = this.data.color; //设置字体颜色
    ctx.strokeStyle = this.data.color; //线条边框颜色
    //ctx.fillText('签名区', res[0].width, res[0].height)
    this.setData({
      ctx,
      canvas
    })
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.beginPath();
    const bg = canvas.createImage();
    bg.src = this.data.bgImg;
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, 300, 300)
    }
    this.setData({
      isOver:false
    })
  })
},

//清除画布
clearClick() {
  this.data.ctx.clearRect(0, 0, this.data.width, this.data.height);
  // clearRect(线条位置x,线条位置y,画宽,画高)
  console.log(1111111111);
},

// 保存图片
setpic(){
  let that = this
  wx.canvasToTempFilePath({
    canvasId: "canvas",
    canvas: that.data.canvas,
    fileType: 'png', //jpg 、png
    width: 300, //指定画布区域
    height: 300, //指定画布区域
    x: 0, //指定画布区域的左上角横坐标
    y: 0, //指定画布区域的左上角纵坐标
    success(res) {
      // console.log("图片地址", res.tempFilePath);
      that.setData({
        resultUrl:res.tempFilePath
      })
      // console.log(JSON.stringify(that.data.resultUrl),that.data.time);
      wx.redirectTo({
        url: '/pages/write/write?mood='+ JSON.stringify({'url':that.data.resultUrl}) +'&time=' + that.data.time,
      })
    },
    fail(res){
      console.log(res,'-------------------------');
    }
    
  })
},


  // 返回
  goBack(){
    wx.navigateBack({
      delta: 1
  })
  },

  // 工具栏选择
  select(e){
    if (this.data.active == 3 && e.currentTarget.dataset.activenum == 3) {
      this.setData({
        active:4
      })
    }else{
      this.setData({
        active:Number(e.currentTarget.dataset.activenum)
      })
    }
    //清空画布
    if (this.data.active == 5) {
      this.createCanvas()
    }
  },

  //获取轮廓数据
  getBiankIconsData(){
    wx.cloud.database().collection('biankIcons')
    .doc('6bbbb51464a906000043eaf82548651d') 
    .get()
    .then(res=>{
       this.setData({
        biankIconsList:res.data.biankIcons
       })
        // console.log(this.data.biankIconsList)
    })
    .catch(err=>{
        console.log('请求失败',err)
    })
  },

  //轮廓选择
  blankSelect(e){
    this.setData({
      blankActive:e.currentTarget.dataset.blank
    })
  },

   //获取srcMap数据
   getSrcMapData(){
    wx.cloud.database().collection('srcMap')
    .doc('bd17e56864a9071a0041ca0d1545ae5e') 
    .get()
    .then(res=>{
       this.setData({
        srcMapList:res.data.srcMap
       })
        // console.log(this.data.srcMapList['0B1E689'],'+++++++++++++++++++++++++++++' )
    })
    .catch(err=>{
        console.log('请求失败',err)
    })
  },
  
 //获取colorList数据
 getColorListData(){
  wx.cloud.database().collection('colorList')
  .doc('0cf33a1964a9076600050b4814a2934c') 
  .get()
  .then(res=>{
     this.setData({
      colorList:res.data.colorList
     })
      // console.log(this.data.colorList)
  })
  .catch(err=>{
      console.log('请求失败',err)
  })
},

// 背景色选择
selectBackground(e){
  this.setData({
    bgActive:e.currentTarget.dataset.bg,
    bgImg:e.currentTarget.dataset.bgimg
  })
  this.createCanvas()
},

// 粗细调节
onChange(event) {
  wx.showToast({
    icon: 'none',
    title: `当前值：${event.detail/10}`,
  });
  this.setData({
    pen:event.detail/10
  })
  // this.createCanvas()
},

//颜色选择
selectColor(e){
  this.setData({
    colorActive:e.currentTarget.dataset.coloractive,
    color:'#' + this.data.colorList[e.currentTarget.dataset.coloractive]
  })
},

// 生命周期
onLoad(options) {
  this.getBiankIconsData()
  this.getSrcMapData()
  this.getColorListData()
  this.createCanvas()
  this.setData({
    time:options.time
  })
}

})