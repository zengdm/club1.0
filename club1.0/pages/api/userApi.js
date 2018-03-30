/**
 * 微信统一接口类
 * 
 * @author fuqiang
 */

import { baseapi } from "./baseapi";

function userApi(page) {
  // 继承基类
  baseapi.call(this);
  // 引入页面page类对象
  this.init(page);
  // this.ckPromission();
}

// 属性方法
userApi.prototype = {
  data: {
    // 是否已授权
    loginStatus: false,
    // 当前城市信息
    city: {},
    // 定位
    location: '',
    // 登录信息
    userInfo: {},
    // 手机号授权
    has_mobile: 'has_mobile',
    // 分页条数
    psize: 20,
    cacheValues: {},
  },

  // 缓存信息
  cacheK: {
    // 微信授权状态
    accredit: 'user_wx_accredit',
    // 位置信息
    location: 'user_city',
    // 登录信息
    login: 'user_info',
    // 手机号授权
    has_mobile: 'user_has_mobile',
    // 收藏相关
    favorites: 'user_favorites'
  },

  // 接口地址
  apiURL: {
    // 登录
    login: '/passport/clientapi/wxxcxLog',
    // 定位
    location: '/app/xcx/lng-lat/?location=',
    // 动态码请求
    verifyCode: '/passport/ark/sendVerifyCode',
    // 手机号校验
    phoneVerify: '/passport/clientapi/wxxcxMobile',
    // 个人信息
    personal: '/user/basic/personal',
    // 设置个人信息
    setpersonal: '/user/basic/setpersonal',
    // 我的帖子列表
    'myforum': '/user/forum/feedlist',
    // 关注列表
    follow: '/user/follow/ulist',
    // 添加关注
    addfollow: '/user/follow/add',
    // 取消关注
    removefollow: '/user/follow/remove',
    // 是否已关注
    hasfollows: '/user/follow/hasfollows',
    // 添加收藏
    addfavorite: '/user/favorite/add',
    // 取消收藏
    removefavorite: '/user/favorite/remove',
    // 是否已收藏
    isfavorite: '/user/favorite/iscollect',
    // 是否已收藏[批量查询]
    hasfavorites: '/user/favorite/hasfavs',
    // 收藏列表
    favoritelist: '/user/favorite/flist',
    // 收藏的id列表
    listfavids: '/user/favorite/favids',
    // 添加精华帖
    adddigest: '/user/forum/adddigest',
    // 取消精华
    removedigest: '/user/forum/removedigest',
    //意见反馈
    opinion: '/user/idea/addidea',
    //用户获得点赞
    userPraise:'/forum/reply/fagree'
  },


  interval: {
    obj:false,
    run: false,
    num:0
  },

  /**
   * 登录状态检测
   */
  checkLogin: function() {
    var res = {'status':false, 'promission':true};
    console.log(getApp().accredit);
    // 授权检测
    if (!getApp().accredit) {
      this.ckPromission();
      res['promission'] = false;
    } else {
      // 登录信息检测
      res['status'] = this.getLoginInfo() ? true : false;
    }

    return res;
  },

  /**
   * 1.0 强制检测用户授权状态
   */
  ckPromission: function () {
    var that = this;
    // that.data.accredit = wx.getStorageSync(that.cacheK.accredit);
    that.data.accredit = getApp().accredit;
    if (!that.data.accredit) {
      wx.getSetting({
        success: (res) => {
          // that.getPromission();
          if (res.authSetting['scope.userInfo']) {
            // 设置全局授权状态
            getApp().accredit = true;
            console.log('scope.userInfo access success');
          } else {
            // 设置全局授权状态
            getApp().accredit = false;
            console.log('scope.userInfo access fail');
            that.openPromission();
          }
          /*
           * res.authSetting = {
           *   "scope.userInfo": true,
           *   "scope.userLocation": true
           * }
           */
        },
        fail: function () {
          console.log('user access fail')
        }
      });
    } else if(!getApp().accredit){
      getApp().accredit = wx.getStorageSync();
    }
  },

  /**
   * 1.1 获取授权允许信息(that.data.loginStatus=[true|false])
   */
  openPromission: function () {
    var that = this;

    wx.openSetting({
      success: function (data) {
        // 标识全局授权状态
        getApp().accredit = true;
      },
      fail: function () {
        // 标识全局授权状态
        getApp().accredit = false;
      }
    });
  },

  /**
   * 1、微信用户信息授权
   * 
   * @remark app.js中调用
   */
  wxlogin: function (callback) {
    var that = this;
    var loginInfo = wx.getStorageSync(that.globalKey.login);
    if (loginInfo && typeof (loginInfo.token)!='undefined' && loginInfo.token) {
      // 赋值全局变量(app.js调用不能立刻使用getAPP())
      setTimeout(function() {
        getApp().globalData.userInfo = loginInfo;
        getApp().accredit = wx.getStorageSync(that.globalKey.accredit);
      },100);

      // 页面方法回调
      that.callback_page(callback, loginInfo, {'from':'cache'});
      return true;
    }

      wx.login({
        success: function (res) {
          wx.getUserInfo({
            success: function (user) {
              var data = {};
              data['code'] = res.code;
              data['type'] = 'xcx';
              data['encryptedData'] = user.encryptedData;
              data['iv'] = user.iv;
              data['callback'] = callback;

              // 电动邦登录
              that.postURLData(that.apiURL['login'], data, '_setLoginCache');
            }, fail: function (failRes) {
              // 拒绝授权，再次唤醒
              console.log('授权失败，唤醒授权');
            }
          })
        },
        fail: function () {
          console.log('wx login fail');
        }
      });// end wx.login
    // }
  },

  /**
   * 2.1 设置登录信息
   */
  _setLoginCache: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      if (typeof(res.data.data)!='undefined') {
        // 全局授权信息
        getApp().accredit = res.data.data;
        
        wx.setStorage({
          key: that.globalKey.accredit,
          data: res.data.data,
        });
      }
      // 记录登录信息
      if (typeof (res.data.user) != 'undefined') {
        var user = { 'mobile': '', 'has_mobile': false };
        // 授权信息
        user.data = res.data.data;
        user.token = res.data.token;
        // 过滤字段
        var fields = 'id,mobile,name,nickname,isforbid,img,sex,powers,praise_num,fans_num,follow_num,comment_num,article_num';
        for (let k in res.data.user) {
          if (fields.indexOf(k) > -1) {
            user[k] = res.data.user[k];
          }
        }
        // 手机号绑定判断
        user.has_mobile = user.mobile.length == 11 ? true : false;
        
        // 设置缓存
        wx.setStorageSync(that.globalKey.login, user);

        // 设置全局属性
        getApp().globalData.userInfo = user;
        getApp().globalData.has_mobile = user.has_mobile;

        // 页面回调
        if (typeof (opt.callback) != 'undefined') {
          that.callback_page(opt.callback, res.data.user, opt);
        }
      } else if (res.data.data) {
        var accredit = res.data.data;
        accredit['name'] = accredit.out_uname;
        accredit['img'] = accredit.out_uavatar;
        accredit['id'] = 0;
        accredit['follow_num'] = 0;
        accredit['article_num'] = 0;
        accredit['fans_num'] = 0;
        accredit['token'] = '';
        accredit['has_mobile'] = '';
        that.callback_page(opt.callback, accredit, {'from':'accredit'});
      }
      
    } else {
      that.showError(res.message);
    }
  },

  /**
   * 获取授权信息
   */
  getAccredit: function() {
    var accredit = wx.getStorageSync(this.globalKey.accredit);
    // 兼容登录用户名及头像展示
    if (accredit) {
      accredit['name'] = accredit['out_uname'];
      accredit['img'] = accredit['out_uavatar'];
    }
    return accredit; 
  },

  // 清除登录缓存
  clearLoginCache: function() {
    var that = this;
    wx.clearStorageSync(that.globalKey.login);
  },


  // 获取登录信息
  getLoginInfo: function (callback) {
    var that = this;
    var loginInfo = getApp().globalData.userInfo;
    if (!loginInfo) {
      // 从缓存中获取
      loginInfo = wx.getStorageSync(that.globalKey.login);
    }
    if (loginInfo && typeof (loginInfo.token)!='undefined' && loginInfo.token && loginInfo.has_mobile) {
      return loginInfo;
    } else {
      return false;
    }
    // var loginInfo = wx.getStorageSync(that.globalKey.login);
    // if (typeof (loginInfo.id) != 'undefined') {
    //   if (callback && typeof (callback) != 'undefined') {
    //     return that.callback_page(callback, loginInfo, { 'from': cache });
    //   } else {
    //     return loginInfo;
    //   }
    // } else {
    //   return {id:0, has_mobile:false, mobile:''};
    // }
  },

  /**
   * 个人信息 - 个人主页
   * 
   * @param [int]     authorid    [用户id]
   * @param [string]  callback    [页面回调方法]
   */
  personal: function (authorid, callback) {
    var that = this;
    var args = { authorid: authorid };
    that.postURLData(that.apiURL['personal'], args, callback);
  },

  /**
   * 从接口获取个人信息
   * 
   * @param [string]  callback    [页面回调方法]
   */
  loginApi: function (callback) {
    var that = this;
    var loginInfo = that.getLoginInfo();
    if (typeof(loginInfo.id)!='undefined' && loginInfo.id>0) {
      that.postURLData(that.apiURL['personal'], { authorid: loginInfo.id }, callback);
    }
  },

  /**
   * 设置个人信息
   * 
   * @param [Object]  args      [待更新的个人信息]
   * @param [string]  callback  [页面回调方法]
   * 
   * 请勿传参authorid和token
   */
  setUserInfo: function (args, callback) {
    var that = this;
    that.postURLData(that.apiURL['setpersonal'], args, callback);
  },

  /**
   * 用户权限判断
   */
  getPowers: function(power) {
    var loginInfo = this.getLoginInfo();
    if (typeof(loginInfo.powers)!='undefined') {
      return loginInfo.powers;
    } else {
      return '';
    }
  },


  /**
 * 我的帖子列表
 * 
 * @param [enum]    scroll    [翻页方向，next:下一页 | last:上一页]
 * @param [Object]  pageArgs  [翻页参数，feedTime和feedId]
 * @param [string]  callback  [页面回调方法]
 */

  myforum: function (scroll, pageArgs, callback) {
    var that = this;
    // 组装参数
    pageArgs['scroll'] = scroll;
    // 异步获取接口数据
    that.postURLData(that.apiURL['myforum'], pageArgs, callback);
  },


  /**
   * 我的关注列表
   * 
   * @param [int]     page      [页面]
   * @param [string]  callback  [页面回调方法]
   */
  myFollow: function (page, callback) {
    var that = this;
    var args = { follow: 1 };
    that.postURLData(that.apiURL['follow'], args, callback);
  },

  /**
   * 我的粉丝列表
   * 
   * @param [int]     page      [页面]
   * @param [string]  callback  [页面回调方法]
   */
  myFans: function (page, callback) {
    var that = this;
    var args = { follow: 2 };
    that.postURLData(that.apiURL['follow'], args, callback);
  },

  /**
   * 添加关注
   * 
   * @param [int]     follow_id     [被关注的用户id]
   * @param [string]  callback      [页面回调方法]
   * @param [object]  args          [其它查询参数,默认{}]
   */
  addFollow: function (follow_id, callback, args) {
    var that = this;
    args = typeof (args) != 'object' ? {} : args;
    args['follow_id'] = follow_id;
    that.postURLData(that.apiURL['addfollow'], args, callback);
  },

  /**
   * 取消关注
   * 
   * @param [int]     follow_id     [被关注的用户id]
   * @param [string]  callback      [页面回调方法]
   * @param [object]  args          [其它查询参数,默认{}]
   */
  removeFollow: function (follow_id, callback, args) {
    var that = this;
    args = typeof (args) != 'object' ? {} : args;
    args['follow_id'] = follow_id;
    that.postURLData(that.apiURL['removefollow'], args, callback);
  },

  /**
   * 是否已关注[批量查询]
   *
   * @param [string|object]   followids [用户id,多个用英文逗号隔开或数组格式]
   * @param [string]          callback  [页面回调方法]
   */
  hasFollows: function(followids, callback) {
    if (followids) {
      var args = { followids: followids};
      this.postURLData(this.apiURL['hasfollows'], args, callback);
    }
  },

  /**
 * 添加精华
 * 
 * @param [int]     sourceid  [平台内容索引id]
 * @param [int]     platid    [平台id]
 * @param [string]  callback      [页面回调方法]
 * @param [object]  args          [其它查询参数,默认{}]
 */
  addDigest: function (sourceid, platid, callback, args) {
    var that = this;
    args = typeof (args) != 'object' ? {} : args;
    args['sourceid'] = sourceid;
    args['platid'] = platid;

    that.postURLData(that.apiURL['adddigest'], args, callback);
  },

  /**
   * 取消精华
   * 
   * @param [int]     sourceid  [平台内容索引id]
   * @param [int]     platid    [平台id]
   * @param [string]  callback      [页面回调方法]
   * @param [object]  args          [其它查询参数,默认{}]
   */
  removeDigest: function (sourceid, platid, callback, args) {
    var that = this;
    // 查询参数
    args = typeof (args) != 'object' ? {} : args;
    args['sourceid'] = sourceid;
    args['platid'] = platid;

    that.postURLData(that.apiURL['removedigest'], args, callback);
  },

  /**
   * 添加收藏
   * 
   * @param [enum]    ftype     [推荐类型，详情见app.js中plats相关定义]
   * @param [int]     sourceid  [平台内容索引id]
   * @param [int]     platid    [平台id]
   * @param [string]  callback  [页面回调方法]
   * @param [object]  args      [其它查询参数,默认{}]
   */
  addFavorite: function (ftype, sourceid, platid, callback, args) {
    var that = this;
    // 查询参数
    args = typeof (args) != 'object' ? {} : args;
    args['ftype'] = ftype;
    args['sourceid'] = sourceid;
    args['platid'] = platid;
    // 缓存是否存在
    var isCache = that._hasCache(ftype, args);
    // 点赞只允许一次
    if (ftype == 'praise' && isCache) {
      that.callback_page(callback, {code:200, 'message':'已点赞'}, {'from':'cache'});
    } else {
      // 写入缓存
      that._addCache(ftype, args);
      // 执行操作
      that.postURLData(that.apiURL['addfavorite'], args, callback);
    }
  },

  /**
   * 添加收藏
   * 
   * @param [enum]    ftype     [推荐类型，详情见app.js中plats相关定义]
   * @param [int]     sourceid  [平台内容索引id]
   * @param [int]     platid    [平台id]
   * @param [string]  callback  [页面回调方法]
   * @param [object]  args      [其它查询参数,默认{}]
   */
  removeFavorite: function (ftype, sourceid, platid, callback, args) {
    var that = this;
    // 查询参数
    args = typeof (args) != 'object' ? {} : args;
    args['ftype'] = ftype;
    args['sourceid'] = sourceid;
    args['platid'] = platid;
    // 缓存是否存在
    var isCache = that._hasCache(ftype, args);
    if (isCache) {
      that._removeCache(ftype, args);
    }
    // 请求接口
    that.postURLData(that.apiURL['removefavorite'], args, callback);
  },

  /**
   * 是否已收藏
   *
   * @param [enum]    ftype     [推荐类型，详情见app.js中plats相关定义]
   * @param [int]     sourceid  [平台内容索引id]
   * @param [int]     platid    [平台id]
   * @param [string]  callback  [页面回调方法]
   */
  isFavorite: function (ftype, sourceid, platid, callback, args) {
    var that = this;
    // 查询参数
    args = typeof (args) != 'object' ? {} : args;
    args['ftype'] = ftype;
    args['sourceid'] = sourceid;
    args['platid'] = platid;

    that.postURLData(that.apiURL['isfavorite'], args, callback);
  },

  /**
   * 是否已收藏[批量查询]
   * 
   * @param [string]          ftype     [收藏类型]
   * @param [string|object]   ids       [文章sourceid_platid,多个用英文逗号隔开或数组格式]
   * @param [string]          callback  [页面回调方法]
   */
  hasFavorites: function(ftype, ids, callback) {
    var that = this;
    if (ftype && ids) {
        var args = { ids: ids, ftype: ftype };
        that.postURLData(that.apiURL['hasfavorites'], args, callback);
    }
  },


  /**
   * 我的收藏列表
   *
   * @param [enum]    ftype     [推荐类型，详情见app.js中plats相关定义]
   * @param [int]     page      [页码]
   * @param [string]  callback  [页面回调方法]
   */
  myFavorite: function (ftype, page, callback, psize) {
    var that = this;
    if (typeof (psize) == 'undefined' || psize < 0) {
      psize = that.data.psize;
    }
    var args = { ftype: ftype, page: page, psize: psize };
    that.postURLData(that.apiURL['favoritelist'], args, callback);
  },

  /**
   * 收藏id列表
   * @param [enum]    ftype [查询类型]
   * @param [object]  args [查询参数，sourceid/platid]
   */
  listFavIds: function (ftype, callback, psize, args) {
    var that = this;
    if (typeof (psize) == 'undefined' || psize < 0) {
      psize = that.data.psize;
    }
    if (typeof (args) != 'object') {
      args = {};
    }
    args['ftype'] = ftype;
    that.postURLData(that.apiURL['listfavids'], args, callback);
  },

  //     /**
  //    * 我的收藏列表
  //    * @param [enum]    ftype     [推荐类型，详情见app.js中plats相关定义]
  //    * @param [enum]    scroll    [翻页方向，next:下一页 | last:上一页]
  //    * @param [Object]  pageArgs  [翻页参数，feedTime和feedId]
  //    * @param [string]  callback  [页面回调方法]
  //    */

  //     myFavorite: function (ftype,scroll, pageArgs, callback) {
  //         var that = this;
  //         // 组装参数
  //         pageArgs['scroll'] = scroll;
  //         // 异步获取接口数据
  //         that.postURLData(that.apiURL['favoritelist'],ftype, pageArgs, callback);
  //     },


  /**
      * 意见反馈
      * 
      * @param [string]  comment     [反馈内容]
      * @param [string]  callback    [页面回调方法]
      */
  opinion: function (comment, callback) {
    var that = this;
    var args = { comment: comment };
    that.postURLData(that.apiURL['opinion'], args, callback);
  },

  /**
   * 执行点赞功能
   */
  doPraise: function(sourceid, platid, args, callback) {
    args = typeof (args) == 'object' ? args : {};
    args['sourceid'] = sourceid;
    args['platid'] = platid;
    if (!this._hasCache('praise', args)) {
      that._addCache('praise', args);
      that.getURLData(that.apiURL['userPraise'], args, callback);
    } else {
      return this.callback_page(callback, {code:0, message:'已点赞', data:[]}, {'from':'cache'});
    }
  },

  /**
  *用户获得点赞
  * 
  * @param [string]  页面回调方法
  */
  userPraise: function (args, callback) {
    var that = this;
    if (!this._hasCache('praise', args)) {
      that._addCache('praise', args);
      that.getURLData(that.apiURL['userPraise'], args, callback);
    } else {
      return { code: 200, 'message':'已点赞'}
    }
  },

  /*******************缓存通用方法(start)******************/
  /**
   * 缓存相关
   */
  getCacheFavorite: function(ftype) {
    var data = wx.getStorageSync(this.cacheK.favorites + '_' + ftype)
    return typeof(data)!='object'?[]:data;
  },

  // 初始化缓存值转换成string
  parseCacheVal: function(args) {
    if (!args) {
      return args;
    }

    var arr = [];
    if (typeof(args)=='object') {
      for (let k in args) {
        arr.push(args[k]);
      }
      arr = arr.join('_');
    } else {
      arr = args;
    }
    return arr;
  },

  /**
   * 操作是否已执行（收藏/点赞）
   */
  isCacheFavorite: function(ftype, args) {
    args = this.parseCacheVal(args);
    if (typeof(this.data.cacheValues[ftype])=='undefined') {
      this.data.cacheValues[ftype] = this.getCacheFavorite(ftype);
    }
    var data = this.getCacheFavorite(ftype);
    return this.contains(data, args);
  },
  /*******************缓存通用方法(end)******************/

/**
 *  手机动态码
 * 
 */
  verifyCode: function (args, callback) {
    var that = this;
    if (args) {
      that.getURLData(that.apiURL['verifyCode'], args, callback);
    } else {
      console.log('mobile is empty');
    }
  },

  /**
   * 手机号登录
   */
   phoneVerify: function (args, callback) {
    var that = this;
    var accredit = wx.getStorageSync(that.globalKey.accredit);
    if (typeof(accredit.unionId)!='undefined') {
      args['unionId'] = accredit.unionId;
    }
    that.postURLData(that.apiURL['phoneVerify'], args, callback);
  },

}

// 声明类方法
module.exports.userApi = userApi;