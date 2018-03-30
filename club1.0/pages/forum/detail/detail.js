// pages/forum/detail/detail.js
var app = getApp();//获取应用实例
import { forumApi } from '../../api/forumApi.js';
import { userApi } from '../../api/userApi.js';
import { tongjiApi } from '../../api/tongjiApi.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 接收页面参数/页面全局参数
    args: {
      sourceid: 0,
      platid: 0,
      // 文章类型标识（article/long/dynamic)
      ctype: '',
    },
    argsContent: {
      sourceid: 0,
      platid: 0,
      content: '',
      pid: 0,
      puid: 0
    },
    // 加载中
    loading: true,
    // 评论列表
    inputComment: '',
    imgArr: [],
    isPraise: false,
    isfollow: '',
    isdigest: '',
    userPraise: 0,
    onfavorite: false,
    commentShow: true,
    showCollet: false,
    btnColor: true,
    'replyList': { list: [], pageArgs: {}, isEnd: false },
    pid: 0,
    puid: 0,
    cardPage: true,
    // 登录弾层（默认隐藏）
    loginShow: false,
    // 用户权限
    userPowers: '',

    dotBg: false,
    nickName: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 接收页面传参
    that.data.args = options;
    // that.data.args = {
    //   sourceid: 102,
    //   platid: 9,
    //   ctype: "article",
    // },
    console.log(that.data.args);

    that.forumApi = new forumApi(that);
    that.userApi = new userApi(that);
    that.data.userInfo = that.userApi.getLoginInfo();
    console.log('-----手机手机----')
    console.log(that.data.userInfo.mobile)
    that.forumApi.info(that.data.args, 'cb_info');
    that.userApi.hasFavorites('article', that.data.args.sourceid + '_' + that.data.args.platid, 'cb_isFavorite');
    that.userApi.hasFavorites('praise', that.data.args.sourceid + '_' + that.data.args.platid, 'cb_praise');

    that.replyList('next');

    that.setPageVars();

    // pv统计
    that.tongjiApi = new tongjiApi(that);
    that.tongjiApi.addPv(options.sourceid, options.platid);


  },

  onReady: function () {
    var that = this;

  },

  onShow: function () {
    var that = this;
    console.log('args', that.data.args);

  },

  //用户是否获得点赞
  userAgree: function (e) {
    var that = this;
    // console.log(that.data.replyList.list);
    console.log(e.currentTarget.dataset.rid);
    var argsAgree = {
      sourceid: that.data.args.sourceid,
      platid: that.data.args.platid,
      rid: e.currentTarget.dataset.rid
    };
    console.log(argsAgree);
    var praise = that.userApi.userPraise(argsAgree, 'cb_userPraise');
    if (praise && typeof (praise.code) != 'undefined' && praise.code == 200 && typeof (praise.message) != 'undefined') {
      wx.showToast({
        title: praise.message,
        image: '/pages/images/warning.png',
      })
    }
  },
  cb_userPraise: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      wx.showToast({
        title: '点赞成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
      console.log(res);
      that.data.replyList = { list: [], pageArgs: {}, isEnd: false },
        that.replyList('next');
    }
  },
  //是否关注
  cb_follow: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      console.log(res.data[opt.followids])
      that.setData({
        isfollow: res.data[opt.followids]
      })
    }
  },
  addfollow: function (e) {
    //关注人
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

    that.userApi.addFollow(e.currentTarget.dataset.followid, 'cb_addfollow');

  },
  cb_addfollow: function (res, opt) {
    var that = this
    if (res.code == 0) {
      wx.showToast({
        title: '关注成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
      that.setData({
        isfollow: 1,
      })
    }
  },
  removefollow: function (e) {
    //取消关注人
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
    wx.showModal({
      content: '确定不再关注此人？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.userApi.removeFollow(e.currentTarget.dataset.followid, 'cb_removefollow');
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  cb_removefollow: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      wx.showToast({
        title: '取消成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
      that.setData({
        isfollow: 0,
      })
    }
  },

  //是否收藏
  cb_isFavorite: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      that.setData({
        onfavorite: res.data[opt.ids]
      })
    }
  },
  //是否点赞
  cb_praise: function (res, opt) {
    var that = this;
    console.log('cb_praise-----')
    console.log(res);
    if (res.code == 0 && typeof (res['data'][opt.ids]) != 'undefined') {
      that.setData({
        ispraise: res.data[opt.ids]
      })
    }
  },
  //添加精华
  adddigest: function (e) {
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

    that.userApi.addDigest(that.data.args.sourceid, that.data.args.platid, 'cb_adddigest');
    that.setData({
      cardPage: true
    })
  },
  cb_adddigest: function (res, opt) {
    console.log(res)
    console.log(opt)
    var that = this
    if (res.code == 0) {
      wx.showToast({
        title: '推荐成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
      that.setData({
        isdigest: 1,
      })
    }
  },
  //取消精华
  removedigest: function () {
    var that = this// 登录信息检测
    var loginStatus = that.userApi.checkLogin();
    if (!loginStatus.status) {
      // 已授权显示登录弹窗
      if (loginStatus.promission) {
        that.loginTips(1);
      }
      return false;
    }

    that.userApi.removeDigest(that.data.args.sourceid, that.data.args.platid, 'cb_removedigest');
    that.setData({
      cardPage: true
    })
  },
  cb_removedigest: function (res, opt) {
    console.log(res)
    console.log(opt)
    var that = this;
    if (res.code == 0) {
      wx.showToast({
        title: '取消成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
      that.setData({
        isdigest: 0,
      })
    }
  },
  // 回帖列表
  replyList: function (scroll) {
    var that = this;
    // 分页参数
    var pageArgs = {};
    console.log(that.data.args);
    console.log(scroll);
    console.log(pageArgs);
    // args, scroll, pageArgs, callback
    // 加载列表数据
    that.forumApi.replyList(that.data.args, scroll, pageArgs, 'cb_replyList');
  },
  /**
   * 回帖列表
   */
  cb_replyList: function (res, opt) {
    var that = this;
    console.log('回帖列表回帖列表回帖列表回帖列表回帖列表回帖列表')
    console.log(res)
    // 1. 接口请求结束
    that.data.floading = false;
    // 翻页类型
    var scroll = 'next';
    // if (typeof (opt.scroll) != undefined) {
    //     scroll = opt.scroll;
    // }
    // 2. 判断返回数据
    // 结果赋值
    if (res.code == 0) {
      var len = res.data.list.length;
      // 全局变量赋值
      if (len > 0) {
        // 列表赋值
        for (var i = 0; i < len; i++) {
          if (scroll == 'next') {
            that.data.replyList['list'].push(res.data['list'][i]);
          } else {
            that.data.replyList['list'].unshift(res.data['list'][i]);
          }
        }
        // 分页参数赋值
        if (len > 0) {
          // 下一页分页参数
          if (scroll == 'next' || typeof (that.data.replyList['pageArgs']['next']) == undefined) {
            that.data.replyList['pageArgs']['next'] = res.data.args['page']['next'];
          }
          // 上一页分页参数
          if (scroll == 'last' || typeof (that.data.replyList['pageArgs']['last']) == undefined) {
            that.data.replyList['pageArgs']['last'] = res.data.args['page']['last'];
          }
        }
      } else {
        that.data.replyList['isEnd'] = true;
      }
    }
    // 3. 设置模板变量
    // that.setGlobalData();
    // that.setPageVars();
    that.setData({
      replyList: that.data.replyList,
      loading: that.data.floading
    })
  },
  cb_info: function (res, opt) {
    var that = this;
    console.log('-------------------------------------')
    console.log(res.data);
    if (typeof (res.data.content) == 'undefined' || !res.data.content) {
      console.log('content is empty');
      wx.showToast({
        title: '文章已下架',
        image: '/pages/images/warning.png',
        success: function () {
          setTimeout(function () {
            wx.navigateBack();
          }, 1000);
        }
      })
      return false;
    };
    that.data.detailData = res.data;
    if (res.data.digest == 1) {
      //已经是精华了
      that.setData({
        isdigest: 1
      })
    } else {
      //不是精华帖
      that.setData({
        isdigest: 0
      })
    }
    that.userApi.hasFollows(that.data.detailData.authorid, 'cb_follow');
    for (var i = 0; i < res.data.content.length; i++) {
      if (res.data.content[i].type == 'img') {
        that.data.imgArr.push(res.data.content[i].decode.src);
      }
    }

    // 设置页面标题
    var title = res.data.title ? res.data.title : res.data.intro;
    if (title) {
      title = title.substring(0, 30);
      title += ' - ';
    }
    if (res.data.author) {
      title += res.data.author + '的' + (res.data.ctype == 'dynamic' ? '动态' : '文章');
    }
    // wx.setNavigationBarTitle({
    //   title: title,
    // });

    var pageVars = {
      detailData: that.data.detailData,
      imgArr: that.data.imgArr,
    }
    // 页面定位
    if (typeof (that.data.args.scrollView) != 'undefined' && that.data.args.scrollView) {
      pageVars['scrollY'] = true;
      pageVars['scrollView'] = that.data.args.scrollView;
    }
    that.setData(pageVars);
  },
  //图片预览
  previewImage: function (e) {
    var that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.imgArr // 需要预览的图片http链接列表  
    })
  },


  //点击到回复页
  textBind: function (e) {
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

    that.data.pid = e.currentTarget.dataset.rid;
    that.data.puid = e.currentTarget.dataset.puid;
    that.data.author = e.currentTarget.dataset.author;
    console.log(that.data);
    console.log(that.data.puid);
    var loginInfo = getApp().globalData.userInfo;
    console.log(loginInfo.id);

    if (that.data.puid != loginInfo.id) {

      if (that.data.author == undefined) {
        that.setData({
          showCollet: true,
          commentShow: false,
          replyAuthor: ''
        })
      } else {
        that.setData({
          showCollet: true,
          commentShow: false,
          replyAuthor: that.data.author
        })
      }
    }

  },


  // 显示登录弾层
  loginTips: function (isshow) {
    var that = this;
    that.data.loginShow = isshow;
    that.setData({ loginShow: that.data.loginShow });
  },

  cb_relogin: function (res, opt) {
    that.data.userInfo = res;
  },

  //从回复页到详情页
  infoMain: function () {
    var that = this;
    that.setData({
      showCollet: false,
      commentShow: true,
    })
  },
  bindinput: function (e) {
    var that = this;
    if (e.detail.value == '' || e.detail.value.trim().length == 0) {
      that.setData({
        btnColor: true
      });
    } else {
      that.setData({
        btnColor: false
      });
    }
  },
  card: function (e) {
    var that = this;
    if (that.data.cardPage == true) {
      that.setData({
        cardPage: false,
      })
    } else {
      that.setData({
        dotBg: false,
      })
    }
  },

  removebackground: function () {
    var that = this;
    that.setData({
      cardPage: true
    })
  },
  //点击发送
  formSubmit: function (e) {
    var that = this;
    console.log(e.detail.value.input.length);
    that.data.inputComment = e.detail.value.input;
    if (e.detail.value.input == '' || e.detail.value.input.trim().length == 0) {
      wx.showToast({
        title: '不能为空',
        image: '/pages/images/warning.png'
      });
      return false;
    } else if (e.detail.value.input.length>5000){
      wx.showToast({
        title: '不多于5000字',
        image: '/pages/images/warning.png'
      });
      return false;
    }
    that.data.argsContent = {
      sourceid: that.data.args.sourceid,
      platid: that.data.args.platid,
      content: that.data.inputComment,
      pid: that.data.pid,
      puid: that.data.puid,
    };
    // 按钮发送状态
    that.setData({ sending: true, sendName: '发送中', loginShow: false });
    that.forumApi.addComment(that.data.argsContent, 'cb_addComment');
  },
  //新增评论
  cb_addComment: function (res, opt) {
    var that = this;
    console.log(res)
    if (res.code == 0) {
      that.data.replyList = { list: [], pageArgs: {}, isEnd: false },
        that.replyList('next');

      // 新增回复数统计
      that.tongjiApi.addReplies(opt.sourceid, opt.platid);
      wx.showToast({
        title: '发送成功',
        image: '/pages/images/success.png'
      });

      that.setData({
        commentShow: true,
        showCollet: false,
      })
      that.setData({
        loginShow: that.data.loginShow,
        name: '',
        commentShow: true,
        showCollet: false,
        sending: false,
        sendName: ''
      });
    }
  },
  //  点赞功能
  onPraise: function () {
    //点赞
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
    that.userApi.addFavorite('praise', that.data.args.sourceid, that.data.args.platid, 'cb_onPraise');
  },
  cb_onPraise: function (res, opt) {
    var that = this;
    console.log(that.data.isPraise)
    console.log(res)
    if (res.code == 0) {
      that.data.detailData.points.agree = Number(that.data.detailData.points.agree) + 1
      wx.showToast({
        title: '点赞成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
      that.setData({
        detailData: that.data.detailData,
        ispraise: true
      });
      // 统计点赞数
      that.tongjiApi.addAgree(that.data.args.sourceid, that.data.args.platid);
    }
  },
  //添加收藏
  favorite: function () {
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

    // 添加收藏
    that.userApi.addFavorite('article', that.data.args.sourceid, that.data.args.platid, 'cb_favorite');
  },
  cb_favorite: function (res, opt) {
    var that = this;
    console.log(that.data.onfavorite)
    console.log(res)
    if (res.code == 0) {
      wx.showToast({
        title: '收藏成功',
        image: '/pages/images/success.png',
        duration: 1000
      })
      that.setData({
        onfavorite: true,
        cardPage: true
      })
    }
  },
  // 取消收藏
  removeFavorite: function () {
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

    that.userApi.removeFavorite('article', that.data.args.sourceid, that.data.args.platid, 'cb_removefavorite');
    that.setData({
      cardPage: true
    })
  },
  cb_removefavorite: function (res, opt) {
    var that = this;
    console.log(that.data.onfavorite)
    console.log(res);
    if (res.code == 0) {
      wx.showToast({
        title: '已取消',
        image: '/pages/images/success.png',
        duration: 1000
      })
      that.setData({
        onfavorite: false
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    var that = this;
    console.log(options)
    if (that.data.args.ctype == 'dynamic') {
      var dynamicIntro = that.data.detailData.intro;
      console.log(dynamicIntro);
      if (dynamicIntro.length > 22) {
        dynamicIntro = dynamicIntro.slice(0, 22) + '...';
      }
      if (that.data.detailData.imgs.length > 0) {
        return {
          title: dynamicIntro,
          path: '/pages/forum/detail/detail?sourceid=' + that.data.args.sourceid + '&platid=' + that.data.args.platid + '&ctype=' + that.data.args.ctype,
          imageUrl: that.data.detailData.imgs[0].imgurl,
          success: function (res) {
            // 新增分享统计
            that.tongjiApi.addShares(that.data.args.sourceid, that.data.args.platid);
            console.log('分享成功');
          },
          fail: function (res) {
            console.log('分享失败');
          }
        }
      } else {
        return {
          title: dynamicIntro,
          path: '/pages/forum/detail/detail?sourceid=' + that.data.args.sourceid + '&platid=' + that.data.args.platid + '&ctype=' + that.data.args.ctype,
          success: function (res) {
            // 新增分享统计
            that.tongjiApi.addShares(that.data.args.sourceid, that.data.args.platid);
            console.log('分享成功');
          },
          fail: function (res) {
            console.log('分享失败');
          }
        }
      }
    } else {
      var longTitle = that.data.detailData.title;
      console.log(longTitle);
      if (longTitle.length > 22) {
        longTitle = longTitle.slice(0, 22) + '...';
      }
      return {
        title: longTitle,
        path: '/pages/forum/detail/detail?sourceid=' + that.data.args.sourceid + '&platid=' + that.data.args.platid + '&ctype=' + that.data.args.ctype,
        imageUrl: that.data.detailData.cover,
        success: function (res) {
          // 新增分享统计
          that.tongjiApi.addShares(that.data.args.sourceid, that.data.args.platid);

          console.log('分享成功');
        },
        fail: function (res) {
          console.log('分享失败');
        }
      }
    }
  },


  //回到首页
  goIndex: function () {
    wx.switchTab({
      url: '/tabBar/forum/forum'
    })
  },


  setPageVars: function () {
    var that = this;
    console.log(that.data);
    that.setData(that.data);
  }
})