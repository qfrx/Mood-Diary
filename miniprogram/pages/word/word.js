// pages/word/word.js
import Toast from '@vant/weapp/toast/toast';

Page({

  data: {
    likeList:[],//喜欢列表
    wordList:[],//word数据
 
    sliceUid(str){
      str = '用户——' + str.slice(14,21)
      return str
    },
  },

  // 获取小世界数据
  getWordListData(){
    // lading
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });
    wx.cloud.database().collection('wordList')  
    .doc('1f2fb90464a6b9f4000e166b1875e9c7')
    .get()
    .then(res=>{
       this.setData({
        wordList:res.data.data,
        LikeWordList:res.data.data
       })
       this.starLike()
       Toast.clear()
    })
  },

  // 喜欢
  likeFn(e){   
    let index = this.data.likeList.findIndex(item=>item == e.currentTarget.dataset.likeindex)
    let newWordList = this.data.wordList
    let likeList = this.data.likeList
 
    if (index==-1) {
      likeList.push(e.currentTarget.dataset.likeindex)
      newWordList[e.currentTarget.dataset.likeindex].like = true
    }else{
      newWordList[likeList[index]].like = false
      likeList.splice(index,1)
    }
    this.setData({
      wordList:newWordList
    })
  },

  // 初始化喜欢数据
  starLike(){
    let value = wx.getStorageSync('likeList')
    if (value) {
      this.setData({
        likeList:value
      })
    }
  
    let oldWordList = this.data.wordList
    this.data.likeList.forEach((n,i)=>{
      oldWordList[n].like = true
    })
    this.setData({
      wordList:oldWordList
    })
  },

  onLoad(options) {
    this.getWordListData()
  },

  //更新本地喜欢数据
  onUnload(){
    wx.setStorageSync('likeList', this.data.likeList)
  }
})