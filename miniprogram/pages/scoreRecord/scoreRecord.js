// miniprogram/pages/scoreRecord/scoreRecord.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shuju:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'duiju',
      data: {
        chuanRu: app.globalData.openid
      },
      success: res => {
        //console.log('[云函数] : ', res.result)
        that.setData ({
          shuju:res.result.data
        })
        console.log(that.data.shuju)
        //app.globalData.openid = res.result
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    //that.onQuery();
    
  },
  // 查询当前用户所有的 counters
  onQuery: function () {
    const cloud = require('wx-server-sdk')
    cloud.init()
    const db = wx.cloud.database()
    const MAX_LIMIT = 100
    db.collection('Round').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  delete:function(e){
    var that = this;
    if (e.currentTarget.id) {
      wx.showModal({
        title: '提示',
        content: '删除后无法恢复，是否确认删除',
        success(res){
          if (res.confirm) {
            const db = wx.cloud.database()
            db.collection('Round').doc(e.currentTarget.id).remove({
              success: res => {
                wx.showToast({
                  title: '删除成功',
                })
                that.onLoad();
                // this.setData({
                //   counterId: '',
                //   count: null,
                // })
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '删除失败',
                })
                console.error('[数据库] [删除记录] 失败：', err)
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showToast({
        title: '无记录可删，请见创建一个记录',
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})