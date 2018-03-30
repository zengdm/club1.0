
import {wxapi} from "../../../../plugins/wxapi"
import drawer from '../../../inc/drawer/drawer.js'
import xapi from "../../../../utils/xapi"
import util from "../../../../utils/util"
import { favorite } from "../../../../plugins/favorite"

var app = getApp();
Page({
  data: {
    brandData: {},
    toView: '',
    winHeight: '',
    winWidth: '',
    latitude: 0,
    longitude: 0,
    pixelRatio: '',
    brandList: [],
    bannerTab: 1,
    pageXju: 50,
    hidden: true,
    fromcache: false,
  },
  tapName: function (event) {
    console.log(event)
  },
  onLoad: function (options) {
    var that = this;
    var res = wx.getSystemInfoSync();
    that.setData({
      winHeight: res.windowHeight,
      winWidth: res.windowWidth,
      pixelRatio: res.pixelRatio,
      scrollYFlag: true,
    });
    //抽屉组件
    that.dw = new drawer(that);
    that.ul = new util(that);
    that.wxapi = new wxapi(that);
    that.fav = new favorite(that);
    // console.log(that.wxapi.getUserToken());
  },
  onReady: function () {
    var requestUrl = app.apiHost + "/app/xcx/hot-list?is_sale=1";
    var that = this;
    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      // console.log(res);

      var rdata = res.data;

      that.data.brandData = rdata.data;
      var myList = rdata.data.list;

      that.data.brandList = that.reCombine(myList);

      that.setData({//逻辑层到视图层
        brandData: that.data.brandData,
        brandList: that.data.brandList,
        num: 1 + parseInt(Math.random() * 5)
      });
      // console.log(brandList)
    })

  },
  // searchTag: function () {
  //   wx.navigateTo({
  //     url: '../searchWindow/searchWindow'
  //   })
  // },
  reCombine: function (arr) {
    var res = [], obj = {}, index = 0;
    arr.forEach(function (item) {
      // console.log(item.letter)
      if (obj.hasOwnProperty(item.letter)) {
        res[obj[item.letter]].items.push(item);
      }
      else {
        obj[item.letter] = index++;//记录索引 0 1 2
        res.push(
          {
            flag: item.letter,
            items: [item]
          }
        );
      }
    });
    return res;
  },
  clickLetter: function (event) {
    var letter = event.target.dataset.letter;
    var that = this;

    if (that.data.currentLetter === event.target.dataset.current) {
      return false;
    }
    else {
      that.setData({
        currentLetter: event.target.dataset.current
      })
    }


    that.setData({
      toView: letter
    })
  },

  scroll: function (e) {
    var that = this;

    // console.log(that.data.currentLetter);

    that.setData({
      scrollTop: e.detail.scrollTop
    })
  },


  backdraw: function (res) {
  
    console.log(res);

    // 设置模板数据
    this.setData({
      drawerSeriesData: res.list || res.data.list
    });
  },

  showDrawer: function (e) {
    var that = this;

    that.setData({
      hidden: false
    });
    console.log(e);

  

    that.dw.requestdata({
      "pbid": e.currentTarget.dataset.id
    }, !1);
    // 2. 请求数据，同时将页面绘制方法作为参数
    var data = { 
      'ppid': e.currentTarget.dataset.id ,
      'is_sale':'1'
      };
    var path = '/app/xcx/chexi/';
    that.getCacheData(path, 'backdraw', data);

    that.setData({
      hidden: true
    });

  },

  chooseList:function(e){
      var that = this;
      // that.getUserInfo();
      var pzid = e.currentTarget.dataset.pzid;
      
      that.fav.addFav('car', pzid, 0, 'cb_choose');
  },

  cb_choose: function(res, opt) {
    wx.navigateBack({
      // url: '/pages/contrast/contrast'
      url: '/pages/user/contrast/index/index'
    })
  },

  gotoSeries: function (e) {

    var that = this;

    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
      // cityId: that.data.cityIdData,
      // cityIdName: that.data.cityIdName
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      //url: '../details/details?pinyin=' + data.pinyin + '&cityId=' + data.cityId + '&cityIdName=' + data.cityIdName
      url: '../../../model/serie/serie?pinyin=' + data.pinyin
    })
  },


  carType:function(e){
    var that = this;

    console.log(e.currentTarget.dataset.id);

    var id = e.currentTarget.dataset.id;
    that.data.id = id;
    wx.request({
      url: app.apiHost + '/app/xcx/peizhi-list/?is_sale=1&cxid=' + id,
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        console.log(res)

        var rData = res.data.data;
        console.log(rData);

        that.data.typeTitle = res.data.data[0];
        that.data.carYear = rData;

        that.setData({//逻辑层到视图层
          carYear: that.data.carYear,
        });

      }
    })

    that.setData({
      hidden: false
    });
  }





});
