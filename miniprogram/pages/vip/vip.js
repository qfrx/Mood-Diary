// pages/vip/vip.js
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    tabList:[], //轮播图数据
    active:0, //轮播图当前页数
    vipType:0,//会员种类
    spance:'   ',// 占位空格
  },

  // 获取轮播数据
  getSwiperData(){
      // loding
      Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });
    // 获取数据
    wx.cloud.database().collection('vipSwiper')  
    .doc('8c618ae864a7c3d9000ae87c02b4ab7f')
    .get()
    .then(res=>{
      this.setData({
        tabList:res.data.vipSwipers
      })
      Toast.clear()
    })
  },

  //选择vip种类
  selectVipType(e){
    this.setData({
      vipType:Number(e.currentTarget.dataset.vip)
    })
  },

  //返回
  goBack(){
    wx.navigateBack({
      delta: 1
    })
  },

  //轮播图切换
  changeShow(event){
    this.setData({
      active:event.detail.current
    })
  },

  //  购买vip
  payFun(){
    Toast.loading({
      message: '',
      forbidClick: true,
    });
    wx.cloud.database().collection('userMessage')
    .doc('a54a64ea64a686fa0008b95123011fcc')  
    .update({
        data:{
            vip:true
        }
    })
    .then(res=>{
        Toast.success('开通成功');
        setTimeout(()=>{
          Toast.clear()
          wx.navigateBack({
            delta: 1
        })
        },1000)
    })
  },
  
  //生命周期
  onLoad(options) {
    this.getSwiperData()
  },
})