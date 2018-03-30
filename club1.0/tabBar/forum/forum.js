// pages/forum/index/index.js
//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
/**
 * 社区首页
 * 
 */

// import { wxapi } from '../../../plugins/wxapi.js';
import { forumApi } from '../../pages/api/forumApi.js';
import { userApi } from "../../pages/api/userApi";
import { tongjiApi } from "../../pages/api/tongjiApi";


Page({

    /**
     * 页面的初始数据
     */
    // tlist.list
    data: {
        forumList:{},
        navList: [],
        hotTags: [],
        // 默认导航
        defaultNav: { navid: 0, path: '', args:'' },
        // feed流接口请求状态
        floading: true,
        swiperCurrent: 0,
        navCurrent: 0,
        sourceid: '',
        platid: '',
        title: '',
        // 页面统计传值
        points:[],
        loginInfo:'',
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.userApi = new userApi(that);
        that.forumApi = new forumApi(that);
        that.tongjiApi = new tongjiApi(that);
        // 加载首页导航和热门标签(callback) 
        that.forumApi.navList('cb_navlist');
        that.data.defaultNav.args = app.defaultNav.args
        that.data.defaultNav.path = app.defaultNav.path
        // 获取帖子列表
        that.data.nextPage = 1;
        that.setData({
          nextPage: that.data.nextPage
        })
        that.forumList(that.data.nextPage);
        
        wx.request({
            url: app.apiHost + '/app/focus/focuslist?platid=8',
            success: function (res) {
                that.data.focusImg = res.data.data;
                that.setData({//逻辑层到视图层
                    focusImg: that.data.focusImg
                });
            },
        });

    },

    onShow: function() {
      var that = this;
      // that.forumList('last');
      // 获取当前用户登录信息
      if (!that.data.loginInfo) {
        that.data.loginInfo = that.userApi.getLoginInfo();
      }

      // 获取页面统计传参
      var points = that.tongjiApi.getGlobalPoint();
      // 切换导航
      var defaultNav = that.data.defaultNav;
      var apps = getApp();
      if (defaultNav.path != apps.defaultNav.path) {
        defaultNav = apps.defaultNav;
        that.data.defaultNav = defaultNav;
        // 获取列表数据
        // that.forumList('last');
        that.forumList(1);
      }
      // 设置页面模板变量
      that.setData({ 
        loginInfo: that.data.loginInfo,
        points: points,
        defaultNav: defaultNav
      });
    },

    photoClick: function (e) {
      // 轮播图页面跳转
      var bannerimg = e.currentTarget.dataset.ext_info
      var bannerimg = e.currentTarget.dataset.ext_info
      if (bannerimg) {
        var extInfo = JSON.parse(bannerimg);
        if (extInfo.platid) {
          //资讯详情页
          wx.navigateTo({
            url: '/pages/forum/detail/detail?platid=' + extInfo.platid + '&sourceid=' + extInfo.sourceid + '&ctype=' + extInfo.ctype
          })
        } else {
          if (extInfo.navigateTo == "/tabBar/model/model" || extInfo.navigateTo == "/tabBar/user/user") {
            //tabBar页面
            wx.switchTab({
              url: extInfo.navigateTo
            });
          } else {
            //其他子页面
            wx.navigateTo({
              url: extInfo.navigateTo
            })
          }
        }
      }
    },


    /**
    * 统一设置模板全局变量
    */
    setGlobalData: function () {
        var that = this;
        // 统一设置页面模板(直接使用that.data变量报错-待解决)
        that.setData(that.data);
    },
    /*********  接口调用(start)  **********/
    /**
     *  导航切换
     * 
     */
    switchNav: function (e) {
      var that = this;
      // 1. 切换导航
      that.data.defaultNav = {
        navid: e.currentTarget.dataset.navid,
        path: e.currentTarget.dataset.path,
        args: e.currentTarget.dataset.args
      }
      // 设置全局属性
      var apps = getApp();
      for (let i in apps.defaultNav) {
        if (typeof(that.data.defaultNav[i])!='undefined') {
          apps.defaultNav[i] = that.data.defaultNav[i];
        }
      }
      
      that.setData({
        defaultNav: that.data.defaultNav
      });
      
      // 2. 第一次加载获取列表数据
      if (!that.data.forumList[that.data.defaultNav.path]['list'].length) {
        that.data.nextPage = 1
        that.setData({
          nextPage: that.data.nextPage
        })
        that.forumList(that.data.nextPage)
      }
    },

    /**
     * 分页获取feed流列表数据
     */
    forumList: function (scroll) {
      var that = this, args,nav;
        // 分页参数
      nav = that.data.defaultNav;
        // 判断是否已加载到最后
        if (typeof (that.data.forumList[nav.path]) != 'undefined' && typeof (that.data.forumList[nav.path]['isEnd']) != 'undefined' && that.data.forumList[nav.path]['isEnd']) {
          return false;
        }

        // 加载状态开始
        that.data.floading = true;
        that.setData({floading:true});
       
        if(scroll>1){
          wx.showLoading({
            title: '努力加载中',
          });
        } else {
          //在标题栏中显示加载
          wx.showNavigationBarLoading() 
        }
        args = that.data.defaultNav.args;
        that.forumApi.esFeed(scroll, args, 'cb_esFeed');    
    },
    cb_esFeed: function (res, opt) {
      var that = this;
      // console.log('-----------------------------------');
      // console.log(res)
      // console.log(opt)
      // console.log('+++++++++++++++++++++++++')
      that.data.defaultNav.args = opt.args
      if (res.code == 0) {
        var nextPage = res.data.args.nextPage

        var path = that.data.defaultNav.path;
        var len = res.data.list.length
        if (len > 0) {
          // 列表赋值
          if (!that.data.forumList[path]){
            that.data.forumList[path] = {};
          }
          if (!that.data.forumList[path]['list']){
            that.data.forumList[path]['list'] = [];
          }
          for (var i = 0; i < len; i++) {
            that.data.forumList[path]['list'].push(res.data['list'][i]);
          }
          // 记录分页数据
          if (!that.data.forumList[path]['pageRecord']){
            that.data.forumList[path]['pageRecord'] = 1;
          }
          that.data.forumList[path]['pageRecord'] = nextPage;
        
          that.data.forumList[path]['isEnd'] = false;
          that.setData({
            forumList: that.data.forumList
          })
        } else {
          that.data.forumList[path]['isEnd'] = true;
        }
      }

      //  设置模板变量
      that.data.floading = false;
      that.setData({
        defaultNav: that.data.defaultNav,
        forumList: that.data.forumList,
        floading: false
      });

      // 加载状态结束
      setTimeout(function () {
        if (opt.page == 1) {
          wx.hideNavigationBarLoading();
        } else {
          wx.hideLoading()
        }
      }, 150);
    },
    /*
     * 导航+标签回调获取
     */
    cb_navlist: function (res, opt) {
        var that = this;
        console.log(res.data.nav);
        if (res.code == 0) {
            // 导航列表
            if (typeof (res.data.nav) != 'undefined') {
                for (let k in res.data.nav) {
                    that.data.navList.push(res.data.nav[k]);
                    // 初始化列表数据
                    if (typeof (that.data.forumList[res.data.nav[k]['path']]) == 'undefined') {
                        that.data.forumList[res.data.nav[k]['path']] = { list: []};
                    }
                }
            }
            // 热门标签列表
            if (typeof (res.data.tags) != 'undefined') {
                for (let k in res.data.tags) {
                    that.data.hotTags.push(res.data.tags[k]);
                }
            }

        }

        that.setGlobalData();
    },

    onPullDownRefresh: function () {
        var that = this,path,page;
        path = that.data.defaultNav.path;
        page = that.data.forumList[path]['pageRecord'] 
        if(page == 2){
          that.forumList(1);
        }
    },
    onReachBottom: function () {
      var that = this,path,page;
      path = that.data.defaultNav.path;
      page = that.data.forumList[path]['pageRecord']
      that.forumList(page);
    },

    //跳转到标签详情页
    goTagDetail: function (e) {
        var that = this;
        var tagId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/forum/tag/detail/detail?tag_id=' + tagId
        })
    },
    //焦点图
    swiperChange: function (e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },


    onShareAppMessage: function (options) {
        var that = this;
        
        return {
            title: options.target.dataset.title,
            path: '/pages/forum/detail/detail?sourceid=' + options.target.dataset.sourceid + '&platid=' + options.target.dataset.platid + '&ctype=' + options.target.dataset.ctype,
            imageUrl: options.target.dataset.img,
            success: function (res) {
                console.log('分享成功');
            },
            fail: function (res) {
                console.log('分享失败');
            }
        }
    },

})