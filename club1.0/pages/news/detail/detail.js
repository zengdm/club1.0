import { login } from '../../../plugins/login';
import xapi from "../../../utils/xapi";
import { favorite } from '../../../plugins/favorite';
import { wxapi } from '../../../plugins/wxapi';
import { points } from '../../../plugins/points';
import { share } from '../../../plugins/share';
//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
// import phone from '../phone/phone.js'
// import phone from '../util/phone'
// import  login  from '../../plugins/login';
// var login = require("../../plugins/login");
//  console.log(app)//可查看公共js（app.js）的方法
//  console.log(app.item)
Page({
  points: getApp().points,
  data: {
    feedid: 0,
    sourceid: 0,
    isPraise: 0,
    platid: 0,
    // 收藏的文章id数组
    favArtIds: [],
    // 文章是否收藏
    isFav: 0,
    // 点赞数
    agree: 0,
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    detailData: {},
    contentData: {},
    myData: {},
    listsData: [],
    isagree: false,
    sourceid: '',
    platid: '',

    openid: '',
    session_key: '',

    lastTime: 0,
    lastReplyId: 0,


    openid: '',
    session_key: '',

    lastTime: 0,
    lastReplyId: 0,

    authorid: '',
    author: '',
    avatar: '',

    repliesData: 0,
    commentShow: true,
    showCollet: false,
    isaddshop: false,

    verifyCodeTime: '验证',
    buttonDisable: '',
    hidden: true,
    phoneBorder: false,
    codeBorder: false,
    error: false,
    userInfo: {},
    //输入框点击获取焦点
    focus: false,
    //分享
    shareclientYstart: '',
    shareclientYmove: '',
    args: { feedid: 0, sourceid: 0, platid: 0 },
  },

  onLoad: function (options) {
    //  页面初始化  options为页面跳转所带来的参数
    var that = this;

    that.data.args.feedid = options.feedid;
    that.data.args.sourceid = options.sourceid;
    that.data.args.platid = options.platid;
    that.wxapi = new wxapi(that);
    that.data.userInfo = that.wxapi.getUserInfo();
    // 登录信息
    that.login = new login(that);
    // 文章收藏
    that.fav = new favorite(that);
    that.data.favArtIds = that.fav.getFav('article');
    that.data.favPraise = that.fav.getFav('praise');


    // 初始化点击量
    that.pointsObj = new points(that);
    that.pointsObj.clearPoints();

    //初始化分享
    that.shareObj = new share(that);

    that.setData({
      myData: options
    });
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

    that.wxapi.favList('article', 1, 50, 'cb_List');

    // that.wxapi.favList('article', that.data.pages.article, that.data.psize, 'cb_List');

    if (that.data.myData.platid) {
      //轮播图跳转资讯详情
      that.data.args.sourceid = that.data.myData.sourceid;
      that.data.args.platid = that.data.myData.platid;
      that.data.args.feedid = that.data.myData.feedid;

      that.newbanner()

    } else {
      //渲染文章详情
      that.info()
    }




  },

  cb_List: function (res, ftype) {
    var that = this;
    for (var i = 0; i < res.data.length; i++) {
      // if (!that.data.isFav && res.data[i]['feedid'] == that.data.args.feedid) {
      //   that.data.isFav = 1;
      // }
      if (!that.data.isFav && ((res.data[i]['feedid'] == that.data.args.feedid && that.data.args.feedid) || (res.data[i]['sourceid'] == that.data.args.sourceid && res.data[i]['platid'] == that.data.args.platid))) {
        that.data.isFav = 1;
      }

    }

    that.setData({
      isfav: that.data.isFav
    });
  },

  info: function () {
    //渲染文章详情
    var that = this;
    wx.request({
      url: app.apiHost + '/app/feed/finfo',
      method: "POST",
      data: {
        feedid: that.data.myData,
        // feedid: 80,
        openid: that.data.openid,
        session_key: that.data.session_key,
      },
      header: {
        'content-type': 'application/json',
      },
      complete: function (res) {
        //  console.log(res.data)
      },
      success: function (res) {
        // console.log(res)
        var rdata = res.data;
        that.data.detailData = rdata.data;
        that.data.args.sourceid = rdata.data.sourceid;
        that.data.args.platid = rdata.data.platid;
        // that.data.repliesData = rdata.data.points.replies;

        that.data.authorid = rdata.data.authorid;
        that.data.author = rdata.data.author;
        that.data.avatar = rdata.data.avatar;
        that.data.args.sourceid = rdata.data.sourceid;
        that.data.args.platid = rdata.data.platid;
        // 统计记录点赞数
        that.data.agree = that.data.detailData.points.agree;
        // 是否已点赞
        that.data.isPraise = that.fav.isFav('praise', that.data.args.sourceid, that.data.args.platid);
        // 文章是否收藏
        // that.data.isFav = that.fav.isFav('article', that.data.args.sourceid, that.data.args.platid);

        // 设置文章点击量
        if (rdata.data.points && rdata.data.points.hit_status) {
          that.pointsObj.setPoints({ pv: 1, feedid: rdata.data.feedid, sourceid: rdata.data.sourceid, platid: rdata.data.platid });
        }

        that.setData({//逻辑层到视图层
          detailData: that.data.detailData,
          repliesData: that.data.repliesData,
          // 是否收藏
          isfav: that.data.isFav,
          // 是否点赞
          ispraise: that.data.isPraise,
          // 点赞数
          agree: that.data.agree,
          author: that.data.author,
        });

        setTimeout(function () {
          that.getcontent();
        }, 1000);
      }
    });
  },
  newbanner: function () {
    //渲染文章详情
    var that = this;
    if (that.data.myData.feedid) {
      var requestUrl = app.apiHost + '/app/feed/finfo?platid=' + that.data.myData.platid + '&sourceid=' + that.data.myData.sourceid + '&feedid=' + that.data.myData.feedid;
    } else {
      var requestUrl = app.apiHost + '/app/feed/finfo?platid=' + that.data.myData.platid + '&sourceid=' + that.data.myData.sourceid;
    }
    wx.request({
      url: requestUrl,
      method: "GET",
      header: {
        'content-type': 'application/json',
      },
      complete: function (res) {
        //  console.log(res.data)
      },
      success: function (res) {
        // console.log(res)
        var rdata = res.data;
        that.data.detailData = rdata.data;

        // that.data.repliesData = rdata.data.points.replies;

        // that.data.authorid = rdata.data.authorid;
        that.data.author = rdata.data.author;
        that.data.avatar = rdata.data.avatar;
        // that.data.args.sourceid = rdata.data.sourceid;
        // that.data.args.platid = rdata.data.platid;
        // 统计记录点赞数
        // that.data.agree = that.data.detailData.agree;
        that.data.agree = rdata.data.points.agree;
        // 是否已点赞
        that.data.isPraise = that.fav.isFav('praise', that.data.args.sourceid, that.data.args.platid);
        // 文章是否收藏
        that.data.isFav = that.fav.isFav('article', that.data.args.sourceid, that.data.args.platid);

        that.setData({//逻辑层到视图层
          detailData: that.data.detailData,
          // repliesData: that.data.repliesData,
          // 是否收藏
          isfav: that.data.isFav,
          // 是否点赞
          ispraise: that.data.isPraise,
          // 点赞数
          agree: that.data.agree
        });
        //  wx.setNavigationBarTitle({
        //      title:  that.data.detailData.name
        //  })
        that.getcontent();
      }
    });
  },
  //向上滑动event.touches[0].clientY的值越来越小
  //向下滑动event.touches[0].clientY的值越来越大
  handletouchstart: function (event) {
    var that = this;
    // console.log("11111111111*--------------开始kaishi")
    // console.log(event.touches[0].clientY)
    that.data.shareclientYstart = event.touches[0].clientY

  },

  handletouchmove: function (event) {
    var that = this;

    that.data.shareclientYmove = event.touches[0].clientY;


    if (that.data.shareclientYstart > that.data.shareclientYmove) {
      //向上滑动
      console.log("向上")
      that.shareObj.showShare();

    } else {
      //向下滑动
      console.log("向下")
      that.shareObj.hideShare();
    }
  },

  // 页面停止，静止3秒
  handletouchend: function () {
    var that = this;
    that.shareObj.handletouchend();
  },

  onShareAppMessage: function (options) {
    //   console.log(that.data.args.feedid)
    var that = this;
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    if (that.data.args.feedid) {
      // 资讯分享
      return {
        title: that.data.detailData.title,
        path: '/pages/news/detail/detail?feedid=' + that.data.args.feedid,

        success: function (res) {
          console.log('分享成功');
        },
        fail: function (res) {
          console.log('分享失败');
        }
      }
    } else {
      // 轮播图资讯分享
      return {
        title: that.data.detailData.title,
        path: '/pages/news/detail/detail?platid=' + that.data.myData.platid + '&sourceid=' + that.data.myData.sourceid,
        success: function (res) {
          console.log('分享成功');
        },
        fail: function (res) {
          console.log('分享失败');
        }
      }
    }
  },
  //  点赞功能
  onPraise: function () {
    //点赞
    var that = this;
    console.log('click praise');
    var sourceid = that.data.args.sourceid;
    var platid = that.data.args.platid;
    if (that.data.isPraise) {
      // 已点赞
      console.log('already praised');
    } else {
      // 记录点赞
      that.data.isPraise = that.fav.addFav('praise', sourceid, platid);
      // 添加统计
      that.pointsObj.addPoints('praise')

      that.data.agree++;
      // 同步服务器
      wx.request({
        url: app.apiHost + '/trace/tongji/agree',
        method: "POST",
        data: {
          sourceid: sourceid,
          platid: platid
        },
        header: {
          'content-type': 'application/json',
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          console.log(res)
          var rdata = res.data;
          // 同步点赞数
          that.data.agree = rdata.data;
          wx.showToast({
            title: '点赞成功',
          })
        }
      });
    }
    that.setData({
      ispraise: that.data.isPraise,
      agree: that.data.agree
    });

    // that.wxapi.addFavroite('article', that.data.args.sourceid, that.data.args.platid);

    console.log(that.data.isPraise);
  },
  getcontent: function () {
    //渲染回帖列表
    var that = this;

    wx.request({
      url: app.apiHost + '/comment/reply/rlist',
      method: "POST",
      data: {
        sourceid: that.data.args.sourceid,
        platid: that.data.args.platid,
        psize: 4,
        lastTime: that.data.lastTime,
        lastReplyId: that.data.lastReplyId,
      },
      header: {
        'content-type': 'application/json',
      },
      complete: function (res) {
      },
      success: function (res) {
        var rdata = res.data;
        var list = that.data.listsData;
        console.log(res.data)
        that.data.contentData = rdata.data;
        that.data.listsData = rdata.data.list;
        // console.log(rdata.data.list.length)
        for (var i = 0; i < rdata.data.list.length; i++) {
          list.push(rdata.data.list[i])
        }
        if (that.data.listsData.length == 4) {
          that.data.isbottom = true;
        } else {
          that.data.isbottom = false;
        }
        that.data.lastTime = rdata.data.pageArgs.lastTime;
        that.data.lastReplyId = rdata.data.pageArgs.lastReplyId;
        that.setData({//逻辑层到视图层
          contentData: that.data.contentData,
          listsData: list,
        });
      }

    })
  },
  // 上拉加载回调接口
  onReachBottom: function () {
    var that = this;
    // 我们用total和count来控制分页，total代表已请求数据的总数，count代表每次请求的个数。
    // 上拉时需把total在原来的基础上加上count，代表从count条后的数据开始请求。
    // that.data.listsData += that.data.listsData;
    // total += count;
    if (that.data.isbottom == true) {
      // console.log("上拉")
      that.getcontent();
    }


  },

  formSubmit: function (e) {
    //评论、回帖
    var that = this;
    // console.log('form发生了submit事件，携带数据为：', e.detail.value.input)
    if (!that.wxapi.validatedMobile()) {
      return false;
    }
    var content = e.detail.value.input;
    content = that.utf16toEntities(content);
    console.log('reply content:');
    console.log(content);
    console.log(that.utf16toEntities(content));
    if (content == '') {
      wx.showToast({
        title: '评论不能为空',
        image: '../../images/warning.png'
      })
    } else {
      wx.request({
        url: app.apiHost + '/comment/reply/add',
        method: "POST",
        data: {
          sourceid: that.data.args.sourceid,
          platid: that.data.args.platid,
          content: content,
          fromplatid: 7,
          authorid: that.data.userInfo.id,
          author: that.data.userInfo.nickName,
          avatar: that.data.userInfo.avatarUrl,
          repid: 0,
        },
        header: {
          'content-type': 'application/json',
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          var da = that.data.repliesData
          var aa = 1
          // 评论数加1
          that.pointsObj.addPoints('replies');

          that.setData({//逻辑层到视图层
            repliesData: da + aa,
            name: '',
            showCollet: false,
            commentShow: true
          });
          that.getcontent();
          wx.showToast({
            title: '评论成功',
          })
        }
      })
    }
  },

  utf16toEntities: function (str) {
    var patt = /[\ud800-\udbff][\udc00-\udfff]/g;
    str = str.replace(patt, '');
    // 检测utf16字符正则 
    // str = str.replace(patt, function(char){
    //   var H, L, code; 
    //   if (char.length===2) { 
    //     H = char.charCodeAt(0);
    //     // 取出高位 
    //     L = char.charCodeAt(1); 
    //     // 取出低位
    //     code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; 
    //     // 转换算法 
    //     return "&#" + code + ";"; 
    //   } else { 
    //     return char; 
    //   } 
    // }); 
    return str;
  },

  // 统一设置模板变量
  setPageVars: function (res) {
    var that = this;
    console.log('setPageVar function data:');
    if (res) {
      // 设置全局变量用户信息
      that.data.userInfo = res;

      that.setData({
        userInfo: res,
        has_mobile: res.has_mobile
      });
    }

  },
  textBind: function (e) {
    // var has_mobile;
    var that = this;
    if (!that.data.userInfo.openid) {
      that.wxapi.reLogin('setPageVars');
      return false;
    }

    // 手机号校验
    if (!that.wxapi.validatedMobile()) {
      return false;
    }

    that.setData({
      showCollet: true,
      commentShow: false,
      focus: true
    })
  },
  infoMain: function () {
    var that = this;
    that.setData({
      showCollet: false,
      commentShow: true,
      focus: false
    })
  },
  //  文章收藏与取消

  favArticle: function () {
    var that = this;

    if (!that.data.userInfo.openid) {
      that.wxapi.reLogin('setPageVars');
      return false;
    }

    // 手机号校验
    if (!that.wxapi.validatedMobile()) {
      return false;
    }

    // 添加收藏
    var msg = '收藏成功';
    if (that.data.isFav) {
      that.fav.remFav('article', that.data.args.sourceid, that.data.args.platid);
      that.data.isFav = 0;
      // 统计->取消收藏
      that.pointsObj.downPoints('fav');
      msg = '取消收藏';
    } else {
      that.fav.addFav('article', that.data.args.sourceid, that.data.args.platid);
      // 统计->添加收藏
      that.pointsObj.addPoints('fav');
      that.data.isFav = 1;
    }
    wx.showToast({
      title: msg,
    })
    that.setData({
      isfav: that.data.isFav
    });
  },


  getCode: function () {
    var that = this;
    that.login.sendCode();
  },

  mobileInputEvent: function (e) {
    var that = this;
    // that.login.mobileInputEvent();
    // console.log(e.detail.value);
    that.data.mobile = e.detail.value;
    that.setData({
      mobile: e.detail.value,
      error: false
    })

  },

  codeInputEvent: function (e) {
    var that = this;
    that.data.verifyCode = e.detail.value;
    // console.log(e.detail.value);
    that.setData({
      verifyCode: e.detail.value
    })
  },

  phoneSubmit: function () {
    var that = this;
    that.login.phoneSubmit();
  },

  inPhone: function () {
    var that = this;
    that.login.inPhone();
  },

  outPhone: function () {
    var that = this;
    that.login.outPhone();
  },

  inCode: function () {
    var that = this;
    that.login.inCode();
  },
  outCode: function () {
    var that = this;
    that.login.outCode();
  },

  close: function () {
    var that = this;
    that.setData({
      hidden: true
    })
  },
});