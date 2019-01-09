// miniprogram/pages/fenshu/fenshu.js
const app = getApp()
var util = require('../../utils/util.js'); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mask: false, //得分页面
    setting: false, //设置页面
    countdown: false,
    redscore: 0, //当前红队得分
    bluescore: 0, //当前蓝队得分
    redRoundScore: "红队", //回合制红队胜利得分
    blueRoundScore: "蓝队", //回合制蓝队胜利得分
    formxianshi:false,//修改姓名显示
    ball: 0, //哪方发球
    SortNumber: 0, //序号
    GameOver: false, //游戏结束
    palce: true, //场地
    placeControl: true, //计分牌自动交换
    ballControl: true, //换发球自动提示
    placeControlManual: true, //计分牌手动交换
    pointControl: true, //局赛点自动提示
    timeoutControl: true, //暂停倒计时
    grabSevenControl: false, //决胜局抢7
    soundControl: true, //语音自动播放
    towelControl: true, //局赛点自动提示
    rebl: false,
    lastId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.showModal({
      title: '记得横屏使用哦~',
      showCancel:false
    })
    // if (options.isover == "false") { //判断得分缓存
    //   that.setData({
    //     redscore: wx.getStorageSync("redscore") == "" ? 0 : wx.getStorageSync("redscore"),
    //     bluescore: wx.getStorageSync("bluescore") == "" ? 0 : wx.getStorageSync("bluescore"),
    //   })
    // }
    // wx.request({ //获得玩家姓名
    //   url: App.AppData.href + 'GameInfo/getGamePlayer',
    //   data: {
    //     GameFiledId: options.GameFiledId
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function (res) {
    //     that.setData({
    //       redname: res.data[0].PlayerName,
    //       bluename: res.data[1].PlayerName,
    //     })
    //   }
    // })
    //that.getGameFiled(options.GameFiledId);
    //取宽高
    that.getmathscorewh();
    //数据库cunters添加
      const db = wx.cloud.database()
      db.collection('Round').add({
        data: {
          name: {
            red_name: '红队',
            blue_name: '蓝队'
          },
          time:{
            begin_time: util.formatTime(new Date()),
            end_time:null
        },
        score:{
          blue_score: that.data.bluescore,
          red_score: that.data.redscore
        }
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          that.setData({
            lastId: res._id
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '新增记录失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    
  },
  //触摸开始
  touchStart: function(e) {
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    this.setData({
      startx: x,
      starty: y
    })
  },
  //触摸结束
  touchEnd: function(e) {
    var that = this;
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    if (y - that.data.starty < 0) {
      if (e.currentTarget.dataset.red == "true") {
        that.redAddClick();
      } else
        that.blueAddClick();
    } else if (y - this.data.starty > 0) {
      if (e.currentTarget.dataset.red == "true")
        that.redReduceClick();
      else
        that.blueReduceClick();
    }
  },
  //加分动画
  animationup: function(redorblue) {
    var that = this;
    if (redorblue == "red") {
      //动画
      that.redanimation.top(-that.data.scoreheight).step();
      that.redanimationjia.top(0).step();
      that.redanimation.top(0).step({
        duration: 0
      });
      that.redanimationjia.top(that.data.scoreheight).step({
        duration: 0
      });
      that.setData({
        redanimation: that.redanimation.export(),
        redanimationjia: that.redanimationjia.export(),
      })
    } else {
      that.blueanimation.top(-that.data.scoreheight).step();
      that.blueanimationjia.top(0).step();
      that.blueanimation.top(0).step({
        duration: 0
      });
      that.blueanimationjia.top(that.data.scoreheight).step({
        duration: 0
      });
      that.setData({
        blueanimation: that.blueanimation.export(),
        blueanimationjia: that.blueanimationjia.export(),
      })
    }
  },
  //减分动画
  animationdown: function(redorblue) {
    var that = this;

    if (redorblue == "red") {
      //动画
      that.redanimation.top(that.data.scoreheight).step();
      that.redanimationjian.top(0).step();
      that.redanimation.top(0).step({
        duration: 0
      });
      that.redanimationjian.top(-that.data.scoreheight).step({
        duration: 0
      });
      that.setData({
        redanimation: that.redanimation.export(),
        redanimationjian: that.redanimationjian.export(),
      })
    } else {
      that.blueanimation.top(that.data.scoreheight).step();
      that.blueanimationjian.top(0).step();
      that.blueanimation.top(0).step({
        duration: 0
      });
      that.blueanimationjian.top(-that.data.scoreheight).step({
        duration: 0
      });
      that.setData({
        blueanimation: that.blueanimation.export(),
        blueanimationjian: that.blueanimationjian.export(),
      })
    }
  },
  //红方每次加1分
  redAddClick: function() {
    var that = this;
    this.getEndscore("red");
    // if (this.data.GameOver) //判断游戏结束情况
    //   return;
    //this.grabSeven();抢七函数
    //不限分，Sco为0时
    // if (this.data.Sco != 0) {
    //   if (this.data.bluescore >= this.data.Sco - 1 && this.data.redscore >= this.data.Sco - 1) { //得分都大于等于规定，更改规则：一方比另一边分数多2，才可获胜
    //     if (this.data.redscore - this.data.bluescore >= 2) { //刚好等于两分,大比分+1
    //       this.getEnd("red");
    //     } else if (this.data.redscore - this.data.bluescore < 2 && this.data.redscore - this.data.bluescore > -2) { //小于两分，小比分+1
    //       this.getEndscore("red");
    //       console.log("小比分+1函数");
    //     } else if (this.data.redscore - this.data.bluescore == -2) {
    //       this.getEnd("blue");
    //     }
    //   } else { //得分都<于规定
    //     if (this.data.Sco <= this.data.redscore) { //满足大比分得分条件，大比分+1
    //       this.getEnd("red");
    //     } else if (this.data.Sco == this.data.bluescore) {
    //       this.getEnd("blue");
    //     } else { //不满足大比分得分条件，小比分+1
    //       this.getEndscore("red");
    //       console.log("小比分+1函数");
    //     }
    //   }
    //   setTimeout(function() {
    //     console.log("赛点");
    //     //that.getMatchpointMin() 
    //   }, that.data.timelong); //判断红局点、赛点
    // } else
    //   this.getEndscore("red");
    // console.log("小比分+1函数");
    // setTimeout(function() {
    //   console.log("加分发球");
    //   //that.ballchangeadds();

    // }, that.data.timelong);

  },
  //红方每次减1分
  redReduceClick: function() {
    var that = this;
    if (that.data.redscore > 0) {
      that.animationdown("red");
      setTimeout(function() {
        if (that.data.redscore > 0) {
          that.data.redscore--;
          that.setData({
            redscore: that.data.redscore
          })
          wx.setStorage({
            key: 'redscore',
            data: that.data.redscore,
          })
          //that.broadCast(true);
          // if (that.data.Sco != 0)
          //   //that.getMatchpointMin();
          //   console.log("赛点");
          // that.ballchangedowns();
        }
      }, that.data.timelong)
    }
  },
  //蓝方每次加1分
  blueAddClick: function() {
    var that = this;
    that.getEndscore("blue");
    // if (that.data.GameOver)
    //   return;
    //that.grabSeven();

    // if (that.data.Sco != 0) {
    //   if (that.data.bluescore >= that.data.Sco - 1 && that.data.redscore >= that.data.Sco - 1) { //得分都大于规定，更改规则：一方比另一边分数多2
    //     if (that.data.bluescore - that.data.redscore >= 2) {
    //       that.getEnd("blue");
    //     } else if (that.data.bluescore - that.data.redscore < 2 && that.data.bluescore - that.data.redscore > -2) {
    //       that.getEndscore("blue");
    //       console.log("小比分+1函数")
    //     } else if (that.data.bluescore - that.data.redscore == -2) {
    //       that.getEnd("red");
    //     }
    //   } else { //得分都<于规定
    //     if (that.data.Sco <= that.data.bluescore) {
    //       that.getEnd("blue");
    //     } else if (that.data.Sco == that.data.redscore) {
    //       that.getEnd("red");
    //     } else {
    //       that.getEndscore("blue");
    //       console.log("小比分+1函数");
    //     }
    //   }
    //   setTimeout(function() {
    //     //that.getMatchpointMin()
    //     console.log("赛点");
    //   }, that.data.timelong);
    // } else
    //   that.getEndscore("blue");
    // console.log("小比分+1函数");

    // setTimeout(function() {
    //   that.ballchangeadds();
    //   console.log("加分发球")
    // }, that.data.timelong);
  },
  //蓝方每次减1分
  blueReduceClick: function() {
    var that = this;
    if (that.data.bluescore > 0) {
      that.animationdown("blue");
      setTimeout(function() {
        if (that.data.bluescore > 0) {
          that.data.bluescore--;
          that.setData({
            bluescore: that.data.bluescore
          })
          wx.setStorage({
            key: 'bluescore',
            data: that.data.bluescore,
          })
          //that.broadCast(true);
          // if (that.data.Sco != 0)

          //   that.getMatchpointMin();
          //   console.log("赛点");
          // that.ballchangedowns();
        }
      }, that.data.timelong)
    }
  },
  //小比分+1
  getEndscore: function(redorblue) {
    var that = this;
    that.animationup(redorblue);
    setTimeout(function() {
      if (redorblue == "red") {
        that.data.redscore++;
        that.setData({
          redscore: that.data.redscore
        })
        wx.setStorage({
          key: 'redscore',
          data: that.data.redscore,
        })
        //that.broadCast(true);语音播放

      } else {
        that.data.bluescore++;
        that.setData({
          bluescore: that.data.bluescore
        })
        wx.setStorage({
          key: 'bluescore',
          data: that.data.bluescore,
        })
        //that.broadCast(true);
      }
    }, that.data.timelong)
  },
  //取宽和高
  getmathscorewh: function() {
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.score').boundingClientRect(function(rect) {
      that.setData({
        scoreheight: rect.height,
        scorewidth: rect.width
      })
    }).exec();
    query.select('.match').boundingClientRect(function(rect) {
      that.setData({
        matchheight: rect.height,
        matchwidth: rect.width
      })
    }).exec();
  },
  //减分发球
  ballchangedowns: function() {
    var redscore = this.data.redscore;
    var bluescore = this.data.bluescore;
    if (redscore >= this.data.Sco - 1 && bluescore >= this.data.Sco - 1 && this.data.Sco != 0) {
      this.setData({ //得分都大于this.data.Sco - 1：球切换
        ball: this.data.ball == 1 ? 0 : 1
      })
    } else {
      if ((redscore + bluescore) % 2 != 0) { //得分增加时单：球切换
        this.setData({
          ball: this.data.ball == 0 ? 1 : 0
        })
      }
    }
  },
  //切换场地
  bindplace: function(e) {
    this.setData({
      palce: !this.data.palce
    })
  },
  //修改名字
  changeName:function(e){
    var page =this;
    page.setData({
      formxianshi:true
    })
  },
  //关闭名字框
  closename:function(e){
    var page = this;
    page.setData({
      formxianshi: false
    })
  },
  //提交修改名字
  formSubmit:function(res){
    var page = this;
    page.setData({
      redRoundScore:res.detail.value.redname,
      blueRoundScore:res.detail.value.bluename,
      formxianshi: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

    this.setData({
      timelong: 300
    })
    this.redanimation = wx.createAnimation({
      duration: this.data.timelong
    });
    this.redanimationjia = wx.createAnimation({
      duration: this.data.timelong
    });
    this.redanimationjian = wx.createAnimation({
      duration: this.data.timelong
    });
    this.blueanimation = wx.createAnimation({
      duration: this.data.timelong
    });
    this.blueanimationjia = wx.createAnimation({
      duration: this.data.timelong
    });
    this.blueanimationjian = wx.createAnimation({
      duration: this.data.timelong
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    var that = this;
    const db = wx.cloud.database()
    db.collection('Round').doc(that.data.lastId).update({
      // data 传入需要局部更新的数据
      data: {
        name:{
          red_name: that.data.redRoundScore,
          blue_name: that.data.blueRoundScore
        },
        time: {
          end_time: util.formatTime(new Date())
        },
        score: {
          blue_score: that.data.bluescore,
          red_score: that.data.redscore
        }
      },
      success(res) {
        console.log('更新成功',res)
      },
      fail(res){
        console.log('更新失败',res)
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})