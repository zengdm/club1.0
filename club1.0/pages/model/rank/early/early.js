import xapi from "../../../../utils/xapi"
import { share } from '../../../../plugins/share';
var app = getApp();
Page({
  data: {
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    // tab切换 
    currentTab: 0, 
    order_type: 1,
    city_id: '',
    pageOffset: 0,
    pageSize: 10,
    listData: [],
    hasMoreData: true,
    // currentTabtype: 0,
    loading: false,
  

  },
  onLoad: function () {
    var that = this;
    //初始化分享
    that.shareObj = new share(that);

    // 设置分享内容
    that.shareObj.setShare('新能源车新车上市-电动邦', '/pages/model/rank/early/early');

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  onReady: function () {
    var that = this;
    that.data.city_id = app.city.cityId;
    that.getEndurance(that);
  },
  scroll: function (e) {
    var that = this;
    if (e.detail.deltaY < 0) {
      //向上滑动
      console.log("向上")
      that.shareObj.showShare();

    } else {
      //向下滑动
      console.log("向下")
      that.shareObj.hideShare();
    }
  },



  onShareAppMessage: function (options) {
    var that = this;
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return that.shareObj.getShare();
  },


  getEndurance: function (that) {

    wx.showLoading({
      title: '加载中',
    })

    if (!that.data.loading) {
      that.data.loading = true;
    var requestUrl = app.apiHost + "/app/xcx/order-car?city_id=" + that.data.city_id + "&pageOffset=" + that.data.pageOffset + "&pageSize=" + that.data.pageSize + "&order_type=" + that.data.order_type;
    // console.log(requestUrl)
    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      var rList = that.data.listData;

      var rdata = res.data.data;

      if (rdata.length < that.data.pageSize) {
        that.data.hasMoreData = false
      } else {
        console.log(that.data.pageOffset);
        that.data.hasMoreData = true;
        that.data.pageOffset = that.data.pageOffset + that.data.pageSize;
        console.log(that.data.pageOffset);
      }

      for (var i = 0; i < rdata.length; i++) {
        rList.push(rdata[i]);
      }

      console.log(rList);



      that.setData({//逻辑层到视图层
        listData: rList
      });

      that.data.loading = false
    })

    }

    // 设置过期重置
    setTimeout(function () { that.data.loading = false; }, 5000);

    setTimeout(function () {
      wx.hideLoading()
    }, 500)

  },

  scrolltolower: function () {
    var that = this;
    console.log('11111111111111111++++++++++++++++++++')

    if (that.data.hasMoreData) {
      that.getEndurance(that);
    } else {
      console.log('nononononoononono')
      wx.showToast({
        title: '好厉害，全都看完了',
      })
    }

    console.log('onReachBottom上拉加载---------------' + that.data.pageOffset)

  },
  gotoSeries: function (e) {
    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../../serie/serie?pinyin=' + data.pinyin
    })
  }
});