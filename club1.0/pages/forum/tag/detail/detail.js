// pages/forum/tag/detail/detail.js

import { forumApi } from '../../../api/forumApi.js';
import { userApi } from '../../../api/userApi.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    args: {
      tag_id: 0,
      // 导航标识，info:标签简介|last:最新帖|digest:精华帖
      nav: 'digest'
    },
    loading: true,
    // 标签简介
    taginfo: {
      //   'tag_img_url': 'http://i2.dd-img.com/assets/image/1481890625-911d24607e55e31e-270w-337h.jpg'
      'tag_img_url': ''
    },
    // 列表内容
    thread: {
      'last': { list: [], pageArgs: {}, isEnd: false },
      'digest': { list: [], pageArgs: {}, isEnd: false }
    },
    // 用户登录信息
    loginInfo: '',

    isfollow: false,
    // 登录弾层（默认隐藏）
    loginShow: false
  },

  // 设置页面变量
  setPageVars: function () {
    var that = this;
    that.setData(that.data);
  },

  /*********  页面生命周期方法(start)  **********/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    // 接收页面传参
    that.data.args.tag_id = options.tag_id > 0 ? options.tag_id : 9;
    that.data.args.nav = options.nav == undefined ? 'last' : options.nav;
    // 创建帖子对象
    that.forumApi = new forumApi(that);
    that.userApi = new userApi(that);
    // 获取当前登录信息
    that.data.loginInfo = that.userApi.getLoginInfo();
    // 标签收藏状态
    that.userApi.isFavorite('tag', that.data.args.tag_id, '10', 'cb_istagfollow');
    // 获取标签详情
    that.forumApi.getTagById(that.data.args.tag_id, 'cb_taginfo');


    // 获取帖子列表
    that.threadList('next');

    // 设置页面模板变量
    that.setPageVars();
  },


  // 显示登录弾层
  loginTips: function (isshow) {
    var that = this;
    that.data.loginShow = isshow;
    that.setData({ loginShow: that.data.loginShow });
  },

  tagfollow: function () {
    //关注帖子
    console.log("关注帖子话题")
    var that = this;
    // 登录信息检测
    var loginStatus = that.userApi.checkLogin();
    if (!loginStatus.status) {
      // 已授权显示登录弹窗
      if (loginStatus.promission) {
        that.loginTips(1);
      }
      return false;
    }
    that.userApi.addFavorite('tag', that.data.args.tag_id, '10', 'cb_tagfollow');
 

  },
  cb_istagfollow: function (res, opt) {
    var that = this;
    console.log("------------------------------")
    console.log(res)
    console.log("------------------------------")
    if (res.code == 0) {
      if (res.data == false) {
        //没有关注
        console.log("没有关注")
      } else {
        //关注了true
        console.log("关注")
        that.setData({
          isfollow: true,
          loginShow:false
        })
      }
    }

  },
  cb_tagfollow: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      wx.showToast({
        title: '关注成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
    }
    that.setData({
      isfollow: true
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
    console.log('页面相关事件处理函数--监听用户下拉动作');
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.setData({ loginShow: false});
    that.threadList('last');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    that.threadList('next');
  },


  /*********  页面生命周期方法(end)  **********/


  /*********  接口调用(start)  **********/

  /**
   * 标签详情回调
   */
  cb_taginfo: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      that.data.taginfo = res.data;
      wx.setNavigationBarTitle({
        title: res.data.tag_name
      });
    } else {
      console.log('error: cb_taginfo callback result error');
      console.log(res);
    }

    // 设置页面变量
    that.setPageVars();
  },

  /**
   * 帖子列表
   */
  threadList: function (scroll) {
    var that = this;
    // 当前导航
    var nav = that.data.args.nav;

    // 判断是否已加载到最后
    if (typeof (that.data.thread[nav]) != 'undefined' && typeof (that.data.thread[nav]['isEnd']) != 'undefined' && that.data.thread[nav]['isEnd']) {
      return false;
    }

    // 加载状态开始
    that.floading = true;
    if (scroll == 'next') {
      wx.showLoading({
        title: '努力加载中',
      });
    } else {
      //在标题栏中显示加载
      wx.showNavigationBarLoading()
    }

    // 查询参数
    var args = { tagid: that.data.args.tag_id, nav: nav };
    if (nav=='digest') {
      args['digest'] = 1;
    }
    // 分页参数
    var pageArgs = {};
    if (typeof (that.data.thread[nav]['pageArgs'][scroll]) == 'object') {
      pageArgs = that.data.thread[nav]['pageArgs'][scroll];
    }
    
    // 请求接口，回调页面方法
    that.forumApi.threadList(args, scroll, pageArgs, 'cb_threadlist');
  },

  /**
   * 回调 - 帖子列表
   */
  cb_threadlist: function (res, opt) {
    var that = this;
    // 当前请求接口nav属性
    var nav = 'last';
    if (typeof (opt.nav) != 'undefined' && nav != opt.nav) {
      nav = opt.nav;
    }

    // 翻页类型
    var scroll = 'next';
    if (typeof (opt.scroll) != undefined && nav != opt.scroll) {
      scroll = opt.scroll;
    }

    // 结果赋值
    if (res.code == 0) {
      var len = res.data.list.length;
      // 全局变量赋值
      if (len > 0) {
        if (scroll=='next') {
          /*** 下一页 ***/
          // 列表赋值
          for (var i = 0; i < len; i++) {
              that.data.thread[nav]['list'].push(res.data['list'][i]);
          }
          // 分页参数
          if (scroll == 'next' || typeof (that.data.thread[nav]['pageArgs']['next']) == undefined) {
            that.data.thread[nav]['pageArgs']['next'] = res.data.args['page']['next'];
          }
        } else {
          /*** 下拉刷新 ***/
          that.data.thread[nav]['list'] = res.data.list;
          that.data.thread[nav]['pageArgs'] = res.data.page.args;
        }
      } else {
        that.data.thread[nav]['isEnd'] = true;
      }
    }

    // 加载状态结束
    that.floading = false;
    if (opt.scroll == 'last') {
      wx.hideNavigationBarLoading();
    } else {
      wx.hideLoading()
    }

    //  设置模板变量
    that.setPageVars();
  },
  /********** 接口回调页面方法(end)  **********/

  /********** 监听事件(start)  **********/
  /**
   * 监听页面导航切换（简介、最新、精华）
   */
  _bindNav: function (e) {
    var that = this;
    that.setData({ loginShow: false });
    // console.log(e);
    // // 记录导航切换
    that.data.args.nav = e.currentTarget.dataset.current;
    console.log(that.data.args.nav);

    //第一次切换导航，获取列表数据(非简介)
    if (that.data.args.nav != 'info' && !that.data.thread[that.data.args.nav]['isEnd'] && !that.data.thread[that.data.args.nav]['list'].length) {
      this.threadList('next');
    }

    that.setPageVars();
  },



  /********** 监听事件(end)  **********/


  //分享
  onShareAppMessage: function (options) {
    console.log('分享----------------')
    console.log(options)

    var that = this;

    if (options.from === 'button') {
      console.log('按钮转发');
      if (options.target.dataset.ctype == 'dynamic') {
        var dynamicIntro = options.target.dataset.intro;
        console.log(dynamicIntro);
        if (dynamicIntro.length > 22) {
          dynamicIntro = dynamicIntro.slice(0, 22) + '...';
        }
        return {
          title: dynamicIntro,
          path: '/pages/forum/detail/detail?sourceid=' + options.target.dataset.sourceid + '&platid=' + options.target.dataset.platid + '&ctype=' + options.target.dataset.ctype,
          imageUrl: options.target.dataset.imgs,
          success: function (res) {
            console.log('分享成功');
          },
          fail: function (res) {
            console.log('分享失败');
          }
        }

      } else {
        var longTitle = options.target.dataset.title;
        console.log(longTitle);
        if (longTitle.length > 22) {
          longTitle = longTitle.slice(0, 22) + '...';
        }
        return {
          title: longTitle,
          path: '/pages/forum/detail/detail?sourceid=' + options.target.dataset.sourceid + '&platid=' + options.target.dataset.platid + '&ctype=' + options.target.dataset.ctype,
          imageUrl: options.target.dataset.imgs,
          success: function (res) {
            console.log('分享成功');
          },
          fail: function (res) {
            console.log('分享失败');
          }
        }
      }

    } else {
      console.log('右上角转发');
      console.log(that.data.taginfo.tag_id)
      return {
        title: that.data.taginfo.tag_name,
        path: '/pages/forum/tag/detail/detail?tag_id=' + that.data.taginfo.tag_id,
        success: function (res) {
          console.log('分享成功');
        },
        fail: function (res) {
          console.log('分享失败');
        }
      }
    }

  },

})