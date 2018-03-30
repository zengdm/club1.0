// pages/user/personal/personal.js
/**
 * 个人主页
 */
var app = getApp();
// import { login } from '../../../plugins/login';
// import { wxapi } from '../../../plugins/wxapi';
// import { share } from '../../../plugins/share';
import { userApi } from '../../api/userApi.js';
import { forumApi } from '../../api/forumApi';

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 页面参数
        args: {
            authorid: 0,       // 当前个人主页用户ID
            isSelf: false,   // 是否为本人主页
            // 是否显示头部信息
            ishead: true
        },

        verifyCodeTime: '验证',
        buttonDisable: '',
        hidden: true,
        phoneBorder: false,
        codeBorder: false,
        error: false,
        //分享
        shareclientYstart: '',
        shareclientYmove: '',
        // 当前登录用户信息
        userInfo: {},
        // 统计信息
        count: {
            article: 0,  // 收藏的文章
            follow: 0,   // 关注
            fans: 0      // 粉丝
        },
        // feed流接口请求状态
        floading: true,
        // feed流列表数据
        // tlist: [],
        'myforum': { list: [], pageArgs: {}, isEnd: false },
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        var that = this;
        that.userApi = new userApi(that);
        that.forumApi = new forumApi(that);
        that.data.userInfo = that.userApi.getLoginInfo();

        wx.showLoading({
            title: '加载中',
        })
        // 1. 创建接口对象
        // that.wxapi = new wxapi(that);
        // 2. 接收参数
        if (options) {
          if (options.authorid) {
            that.data.args.authorid = options.authorid;
          }
          if (typeof(options.ishead)!='undefined') {
            that.data.args.ishead = options.ishead;
          }
        }
        console.log('personal', that.data.args);
        
        // 4. 获取feed流列表
        that.myforum('next');
        // 设置模板变量
        that.setGlobalData();
        console.log(that.data.myforum);
        var title = '他的主页';
        if (that.data.userInfo.id == that.data.args.authorid){
            if (that.data.args.ishead>0) {
              title = '我的主页';
            } else {
              title = '我的文章';
            }
        }
        //设置导航title
        wx.setNavigationBarTitle({
          title: title
        })
          
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

    myforum: function (scroll) {
        var that = this;
        // 分页参数
        var pageArgs = {};
        if (typeof (that.data.myforum['pageArgs'][scroll])!='undefined') {
          pageArgs = that.data.myforum['pageArgs'][scroll];
        }

        // 加载状态开始
        that.data.floading = true;
        that.setData({ floading: true });
        if (scroll == 'next') {
            wx.showLoading({
                title: '努力加载中',
            });
        } else {
            //在标题栏中显示加载
            wx.showNavigationBarLoading()
        }
        console.log('pageArgs', pageArgs);

        var args = { authorid: that.data.args.authorid, scroll:scroll};
        // 加载列表数据
        that.forumApi.threadList(args, scroll, pageArgs, 'cb_myforum');

    },
    /**
   * feed流列表回调
   */
    cb_myforum: function (res, opt) {
        var that = this;
        // 1. 接口请求结束
        that.data.floading = false;
        setTimeout(function () {
            wx.hideLoading()
        }, 300)
        // 翻页类型
        var scroll = opt.scroll;
        // if (typeof (opt.scroll) != undefined) {
        //     scroll = opt.scroll;
        // }
        // 2. 判断返回数据
        // 结果赋值
        if (res.code == 0) {
            var len = res.data.list.length;
            if (len > 0) {
              // 列表赋值
              if (scroll == 'next') {
                // 追加列表数据
                for (var i = 0; i < len; i++) {
                  that.data.myforum['list'].push(res.data['list'][i]);
                }
                console.log('', that.data.myforum);
                // 记录分页数据
                if (scroll == 'next' || typeof (that.data.myforum['pageArgs']['next']) == 'undefined') {
                  that.data.myforum['pageArgs']['next'] = res.data.args['page']['next'];
                }
              } else {
                console.log('last page', res.data)
                // 下拉刷新
                that.data.myforum['list'] = res.data.list;
                that.data.myforum['pageArgs'] = res.data.args.page;
              }
              that.data.myforum['isEnd'] = false;
            } else {
              that.data.myforum['isEnd'] = true;
            }
        }

        // 3. 设置模板变量
        that.setGlobalData();
    },
    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
    onPullDownRefresh: function () {
        console.log('页面相关事件处理函数--监听用户下拉动作111111111111111');
        var that = this;
        // that.data.myforum.list = [];
        // that.data.myforum.pageArgs = {};
        // that.data.myforum.isEnd = false;
        that.myforum('last');
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log('页面上拉触底事件的处理函数');
        var that = this;
        that.myforum('next');
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;

    },

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
        console.log(that.data.args.authorid)
        return {
          title: '我在电动邦为新能源汽车打Call',
          path: '/pages/user/personal/personal?authorid=' + that.data.args.authorid,
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