import xapi from "../../../utils/xapi"
import { favorite } from "../../../plugins/favorite";
// import { wxapi } from "../../../plugins/wxapi";
import { userApi } from '../../api/userApi.js';

var app = getApp();
Page({
  data: {
    // tab切换选中
    currentTab:0,
    // 收藏的车系
    serieIds:[],
    // 收藏的文章
    artIds:[],
    // 列表数据
    res: {article:[], serie:[]},
    // 列表分页条数
    psize: 99,
    // 文章当前分页
    pages: {article:1, serie:1},
    // 列表是否已到尾页
    more: {article: true, serie:true},
    // 是否加载中
    loading: false,


    //列表
    'tlist': [],
    // feed流接口请求状态
    floading: true,
    swiperCurrent: 0,
    navCurrent: 0,
  },
  onLoad: function () {
    var that = this;
    // 收藏信息
    that.fav            = new favorite(that);
    that.data.serieIds  = that.fav.getFav('serie');
    that.data.artIds    = that.fav.getFav('article');
    // 接口类
    // that.wxapi = new wxapi(that);
    that.setGlobalData();
    // 加载列表数据
    // that.wxapi.feedList('feedlist', 'cb_forumlist');
    //收藏文章
    that.userApi = new userApi(that);
    // 加载收藏车系列表 
    that.userApi.myFavorite('serie', '1', 'cb_mySerie');
    // 加载收藏文章列表 
    that.userApi.myFavorite('article', '1', 'cb_myFavorite');

  },
  onReady: function () {
    var that = this;

    // 收藏的车系列表

    // that.wxapi.favList('serie', 1, that.data.psize, 'cb_serie');

    // that.wxapi.favList('serie', that.data.pages.serie, that.data.psize, 'cb_List');

    // // 收藏的文章列表（延迟加载)
    // setTimeout(function(){
    //   that.wxapi.favList('article', that.data.pages.article, that.data.psize, 'cb_List');
    // }, 1000);
    


    // 设置屏幕
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);

        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.screenHeight-60
        });
      }
    });

  },

  cb_mySerie:function(res,opt){
    var that = this;

    if (res.code == 0) {
      // 全局变量赋值
      that.data.serie = res.data;
      console.log(that.data.serie)
    }

    that.setData({
      serie:that.data.serie
    })
  },


  cb_myFavorite:function(res,opt){
    var that = this;

    //  接口请求结束
    that.data.floading = false;
    console.log(res);


    if (res.code == 0) {
      // 全局变量赋值
      that.data.tlist = res.data;
      console.log(that.data.tlist)
    }

    that.setData({
    tlist:that.data.tlist
    })
  },
  

  cb_forumlist: function (res, opt) {
      var that = this;

      //  接口请求结束
      that.data.floading = false;


      if (res.code == 0) {
          // 全局变量赋值
          that.data.tlist = res.data;
          console.log(that.data.tlist)
      }


      //  设置模板变量
      that.setGlobalData(); 
  },
  /**
* 统一设置模板全局变量
*/
  setGlobalData: function () {

      var that = this;
      // 获取全局数据变量
      var globalData = {};
      for (let k in that.data) {
          globalData[k] = that.data[k];
      }
      console.log(globalData)

      // 统一设置页面模板(直接使用that.data变量报错-待解决)
      that.setData({
          globalData: globalData
      });
  },

  onShow:function(){
    var that = this;

    // 收藏的车系列表

    // that.wxapi.favList('serie', 1, that.data.psize, 'cb_serie');

    // that.wxapi.favList('serie', that.data.pages.serie, that.data.psize, 'cb_List');

    // 收藏的文章列表（延迟加载)
    // setTimeout(function () {
    //   that.wxapi.favList('article', that.data.pages.article, that.data.psize, 'cb_List');
    // }, 200);

  },
  /**
   * 列表回调
   * that.res.data['serie']: 车系列表数据
   * that.res.data['article']: 文章列表数据
   *            
   */
  cb_List: function(res, ftype) {
    var that = this;
    // 重置请求(可再次请求下一页)
    that.data.loading = false;

    // 清除数据
    that.data.res[ftype] = [];

    if (res.code==0) {
      // 追加列表数据
      var len = res.data.length;
      for (var i=0; i<len; i++) {
        that.data.res[ftype].push(res.data[i]);
      }
      // 返回数据量
      var len = that.data.res[ftype].length;

      // 是否尾页
      if (len<that.data.psize || !len) {
        that.data.more[ftype] = false;
      }

      // 设置模板变量
      var tData = {morePage:that.data.more};
      tData[ftype] = that.data.res[ftype];
      that.setData(tData);
      // var serielen = that.data.res['serie'].length;
      // var articlelen = that.data.res['article'].length;
      // if (serielen == 0){
      //   // console.log("555555555555555555555555555555")
      // }else{
      //   that.setData({
      //     // resData: that.data.res,
      //     serie: that.data.res.serie,
      //     morePage: that.data.more,
      //   })
      // }
      // if (articlelen == 0) {
      //   // console.log("555555555555555555555555555555")
      // } else {
      //   that.setData({
      //     // resData: that.data.res,
      //     article: that.data.res.article,
      //     morePage: that.data.more,
      //   })
      // }

   


    
    } else {
      // 提示错误消息
    }

    // console.log('callback cb_serie--------------------------------------------');
    // console.log(res);
  },

  parseSerie: function(data) {
    // console.log('callback serielist');
    // console.log(data);
  },

  getEndurance: function (that) {
   
    var requestUrl = app.apiHost + "/passport/ark/"+cType;

    console.log(requestUrl)

    xapi.request({
      url: requestUrl,
      method: "POST",
      data: {
        token: that.data.token
      },
      header: {
        'content-type': 'application/json',
      },
    }).then(function (res) {
      // console.log("5555555555555555555555");
      //   console.log(res);


    })
  },

  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  swichNav: function (e) {
    var that = this;
    console.log("e.target.dataset.current");
    console.log(e.target.dataset.current);
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    }
    else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }

    if (e.target.dataset.current == 0){
      // 车系
      // that.getEndurance();
    }else{
      // 文章

    }

  },
  gotoSeries: function (e) {
    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
      cxid: e.currentTarget.id,
      cityId:1101
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../../model/serie/serie?pinyin=' + data.pinyin
    })
  },

  goNews:function(e){
    console.log(e);
  },


  itemClick: function (e) {
    var that = this;
    if (e.currentTarget.dataset.feedid) {
      var data = {
        feedid: e.currentTarget.dataset.feedid,
        platid: e.currentTarget.dataset.platid,
        sourceid: e.currentTarget.dataset.sourceid,
      };

      wx.navigateTo({
        url: '../../news/detail/detail?feedid=' + data.feedid + '&sourceid=' + data.sourceid + '&platid=' + data.platid
      })
    } else {
      var data = {
        platid: e.currentTarget.dataset.platid,
        sourceid: e.currentTarget.dataset.sourceid,
      };

      wx.navigateTo({
        url: '../../news/detail/detail?platid=' + data.platid + '&sourceid=' + data.sourceid
      })
    }


  },


  scrollArt: function(e) {
    console.log(e.detail.scrollTop);
  }, 
  /**
   * 加载更多
   */
  loadMore: function(e) {
    var that = this;
    // 加载类型 article:文章  serie:车系
    var ftype = e.currentTarget.dataset.ftype;
    // 是否已到尾页（cb_List方法设置)
    if (!that.data.more[ftype]) {
      return false;
    }

    // 加载更多
    // if (!that.data.loading) {
    //   that.data.loading = true;
    //   that.data.pages[ftype]++;
    //   that.wxapi.favList('article', that.data.pages[ftype], that.data.psize, 'cb_'+ftype);

    //   // 过期重置
    //   setTimeout(function() {that.data.loading = false}, 5000);
    // }
  }
});
