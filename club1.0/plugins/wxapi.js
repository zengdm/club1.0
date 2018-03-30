/**
 * 微信统一接口类
 * 
 * @author fuqiang
 */
function wxapi(page) {
  var that = this;
  that.init(page);
}

wxapi.prototype = {
  /**
   * 接口地址
   */
  apiUrl: {
    login: '/passport/clientapi/wxxcxLog',
    location: '/app/xcx/lng-lat/?location=',
    carArgs: '/app/xcx/peizhi-detail?pzid=',
    carByIds: '/product/peizhi/peizhi-list-by-pzid?pzid=',
    addFav: '/passport/ark/addUserCore',
    favList: '/passport/ark/',
    delFav: '/passport/ark/delUserCore',
    serieByBrandId: '/app/xcx/chexi/?ppid=',
    // 手机号
    phoneVerify: '/passport/clientapi/wxxcxMobile',
    hotCar: '/product/chexi/hot-list',
    brandList:'/product/pinpai/word-list',
    // 手机动态码
    verifyCode: '/passport/ark/sendVerifyCode',
    serieByPinyin: '/app/xcx/detail/',
    groupDetail: '/app/wechat/group-detail',
    feedlist: '/app/feed/flist',
  },
  // 需要安全校验的接口
  authorize: {
    
  },

  data: {
    cacheK: {
      // 位置信息
      location: 'city',
      // 登录信息
      login: 'user_info',
      // 手机号授权
      has_mobile: 'has_mobile'
    },
    // 收藏类型
    ftypes: 'article|praise|reply|car|serie|',
    city: {},
    has_mobile: false,
    userInfo: {},
  },
  /**
   * 初始化方法
   */
  init: function (page) {
    var that = this;
    that.page = page;
  },

  /****** 用户相关接口 ******/
  /**
   * 获取登录信息
   */
  getUserInfo: function () {
    var that = this;
    try {
      that.data.userInfo = wx.getStorageSync(that.data.cacheK.login);
    } catch (e) {

    }
    return that.data.userInfo;
  },

  getLoginToken: function () {
    var that = this;
    var user = that.getUserInfo();
    if (user && user.token) {
      return user.token;
    } else {
      return false;
    }
  },

  /**
   * 手机号是否校验, 自动出现弹窗
   */
  validatedMobile: function () {
    var that = this;
    var user = that.getUserInfo();
    var validated = false;
    if (user.has_mobile && user.has_mobile != 'undefined') {
      validated = user.has_mobile ? true : false;
    }

    // 手机号登录校验
    if (!validated && typeof that.page.setData == "function") {
      that.page.setData({
        hidden: validated
      });
    } else {
      console.log('validated success: mobile=' + user.has_mobile);
    }


    return validated;
  },

  /**
   * 授权登录
   */
  wxlogin: function (callback) {
    var that = this;
    if (that.getLoginToken()) {
      that.callback_page(callback, that.getUserInfo());
    }
    //调用登录接口
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          success: function (user) {
            getApp().globalData.userInfo = user.userInfo;

            // 微信授权信息登录电动邦账号
            that.authorize(res.code, user, callback);
          }, fail: function (failRes) {
            // 拒绝授权，再次唤醒
            console.log('唤醒授权');
          }
        })
      },
      fail: function () {
        console.log('login fail');
      }
    })
    // getApp().getUserInfo();


  },


  /**
   * 重新登录授权
   */
  reLogin: function (callback) {
    var that = this;
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 授权状态[true|false]
          that.data.accredit = res.authSetting['scope.userInfo'];
          // 重新授权成功
          if (that.data.accredit) {
            that.wxlogin(callback);
          }
        } else if (that.data.accredit) {
          that.data.accredit = res.authSetting['scope.userInfo'];
          that.setData({
            accredit: that.data.accredit
          })
        }
      }
    })
  },

  authorize: function (code, user, callback) {
    var that = this;
    // 优先读取缓存
    if (code && user.encryptedData && user.iv) {
      wx.request({
        url: getApp().apiHost + that.apiUrl.login,
        method: "POST",
        data: {
          code: code,
          type: 'xcx',
          encryptedData: user.encryptedData,
          iv: user.iv,
          appkey: 'dev001'
        },
        header: {
          'content-type': 'application/json',
        },
        complete: function (res) {
          // console.log(res)
        },
        success: function (res) {
          console.log('authoriaze success');
        //   console.log(res)
          // 设置全局变量
          if (res.data.code == 0) {
            // 数据兼容(未注册账号)
            if (!res.data.data.user) {
              res.data.data.user = {};
              res.data.data.user.id = 0;
              res.data.data.has_mobile = false;
            } else if(res.data.data.user.name) {
              user.userInfo.nickName = res.data.data.user.name;
            }
            
            user.userInfo.has_mobile = res.data.data.has_mobile;
            // user.userInfo.session_key = res.data.data.session_key;
            user.userInfo.token = res.data.data.token;
            user.userInfo.unionId = res.data.data.data.unionId,
            user.userInfo.openid = res.data.data.data.openid,
            user.userInfo.id = res.data.data.user.id,
            
            // 记录登录缓存
            that.setLogin(user.userInfo);
            
            // 设置手机号绑定状态
            that.setMobileValidated(user.userInfo.has_mobile);


            // 设置登录信息至模板
            if (callback) {
              that.callback_page(callback, user.userInfo);
            } else if (typeof (that.page.setData) == 'function') {
              console.log('set template vars');
              that.page.setData({
                userInfo: user.userInfo
              });
            }
          } // end if
        }, // end wx.request.success
        fail: function () {
          // 记录登录缓存
          that.setLogin(user.userInfo);
          console.log('authorize fail')
        }
      }) //end wx.request
    }
  },

  /**
   * 手机号登录
   */
  phoneLogin: function (mobile, verifyCode, callback) {
    var that = this;
    // 授权信息判断
    var userInfo = that.getUserInfo();
    if (!userInfo.unionId) {
      that.reLogin();
      return false;
    }

    // 字段校验
    // if (!mobile || !verifyCode.length) {
    //   wx.showToast({
    //     title: '不能为空！',
    //   });
    //   return false;
    // }

    if (!mobile) {
      wx.showToast({
        title: '手机号不能为空！',
        image: '/pages/images/warning.png'
      });
      return false;
    }

    var regMobile = /^1\d{10}$/;
    if (!regMobile.test(mobile)) {
      wx.showToast({
        title: '手机号有误！',
        image: '/pages/images/error.png',
      })
      return false;
    }

    if (!verifyCode) {
      wx.showToast({
        title: '动态码不能为空！',
        image: '/pages/images/warning.png'
      });
      return false;
    }

    // 手机号登录请求
    wx.request({
      url: getApp().apiHost + that.apiUrl.phoneVerify,
      method: "POST",
      data: {
        mobile: mobile,
        verifyCode: verifyCode,
        unionId: userInfo.unionId,
      },
      header: {
        'content-type': 'application/json',
      },
      complete: function (res) {
        // console.log(res)
      },
      success: function (res) {
        if (res.data.code == 3001) {
          wx.showToast({
            title: '动态码错误！',
            image: '/pages/images/error.png',
          })
          return false
        } else {

          // 重新设置登录信息缓存
          userInfo['token'] = res.data.data.token;
          userInfo['has_mobile'] = res.data.data.has_mobile;
          that.setLogin(userInfo);

          // 更新手机号校验
          that.setMobileValidated(res.data.data.has_mobile);

          // 方法回调
          if (callback) {
            that.callback_page(callback, userInfo, 'phoneLogin');
          }
        } // end if res.data.code

      }
    })
  },

  /**
   *  手机动态码
   * 
   */
  sendVerifyCode: function(mobile, callback) {
    var that = this;
    if (mobile) {
      that.getURLData('verifyCode', {mobile:mobile}, callback);
    } else {
      console.log('mobile is empty');
    }
  },

  setLogin: function (userInfo) {
    var that = this;
    // 用户登录信息
    wx.setStorage({
      key: that.data.cacheK.login,
      data: userInfo
    }) // end wx.setStorage
  },

  // 设置手机号校验状态
  setMobileValidated: function (has_mobile) {
    var that = this;
    // 用户登录信息
    wx.setStorage({
      key: that.data.cacheK.has_mobile,
      data: has_mobile
    })
  },

  /**
   * 设置登录用户信息模板变量（准备废弃）
   * 
   */
  setPageVars: function (userInfo) {
    var that = this;
    var has_mobile = false;
    if (userInfo.has_mobile) {
      has_mobile = userInfo.has_mobile;
    }
    that.page.setData({
      userInfo: userInfo,
      has_mobile: has_mobile
    })
  },

  /**
   * 位置授权
   */
  getLocation: function (callback) {
    var that = this;
    // 位置缓存信息
    var locationC = wx.getStorageSync(that.data.cacheK.location);
    if (!locationC) {
      location = getApp().city;
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          location.latitude = res.latitude
          location.longitude = res.longitude
          location.speed = res.speed
          location.accuracy = res.accuracy
          
          //调用后台API，获取地址信息
          wx.request({
            url: getApp().apiHost + that.apiUrl.location + location.latitude + ',' + location.longitude,
            success: function (res) {
              var data = res.data.data;
              if (data.cityid && data.city) {
                location.cityId = data.cityid;
                location.cityName = data.city;
              } else {
                location.cityId = getApp().city.cityId;
                location.cityName = getApp().city.cityName;
              }
              
              // 写缓存
              location.datafrom = 'wxapi';
              wx.setStorageSync(that.data.cacheK.location, location);
              
              // 页面回调
              that.callback_page(callback, location, 'city');


            },
            fail: function (e) {
              // 拒绝默认北京
              wx.setStorageSync(that.data.cacheK.location, location);
            },
            complete: function (e) { }
          });
        },
        fail: function(){
          wx.setStorageSync(that.data.cacheK.location, location);
        }
      });
    } else {
      // 页面回调
      that.callback_page(callback, locationC, 'city');
      console.log('location data from cache');
    }
    
    return location;
  },


  /************* 通用方法(start) ************/
  /**
   * 页面统一回调方法
   */
  callback_page: function (func, res, opt) {
    var that = this;
    if (func && typeof (that.page[func]) == 'function') {
      console.log('wxapi callback function: ' + func + ' success');
      if (opt && typeof (opt) != 'undefined') {
        that.page[func](res, opt);
      } else {
        that.page[func](res);
      }
    }
  },

  /**
   * GET方式请求接口数据
   * 
   * @param enum    tag       [接口标识，详情本类全局变量apiUrl]
   * @param array   args      [json数据，空为'[]']
   * @param string  callback  [页面回调方法名称]
   * 
   */
  getURLData: function (tag, args, callback) {
    var that = this;

    // 接口配置判断
    if (that.apiUrl[tag]) {
      // 统一调用异步接口
      that.curlData('get', that.apiUrl[tag], args, callback);

    } else {
      console.log('get error url tag, please check your url tag from wxapi apiUrl vars');
    }
  },

  /**
   * POST方式请求接口数据
   * 
   * @param enum    tag       [接口标识，详情本类全局变量apiUrl]
   * @param array   args      [json数据，空为'[]']
   * @param string  callback  [页面回调方法名称]
   * 
   */
  postURLData: function (tag, args, callback) {
    var that = this;

    // 接口配置判断
    if (that.apiUrl[tag]) {
      // 接口拼接
      if (that.authorize[tag]) {
        var userInfo = that.getUserInfo();
        if (userInfo.token && userInfo.unionId) {
          args['token'] = userInfo.token;
          args['unionId'] = userInfo.unionId;
        }
      }
      // 统一调用异步接口
      that.curlData('get', that.apiUrl[tag], args, callback);

    } else {
      console.log('post error url tag, please check your url tag from wxapi apiUrl vars');
    }
  },

  //  异步接口调用
  curlData: function (rtype, path, rdata, callback) {
    // 统一转化成小写
    rtype = rtype.toLowerCase();
    
    if (rtype == 'post' || rtype == 'get') {
      var that = this;

      // http请求
      wx.request({
        url: getApp().apiHost + path,
        method: rtype,
        data: rdata,
        header: {
          'content-type': 'application/json'
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          // 页面方法回调
          that.callback_page(callback, res.data, 'success');
        } // end wx.request.success
      }); // end wx.request

    } // end if (rtype=='post'||rtype=='get')
    else {
      console.log('request method error');
    } // end if else
  },
  /************* 通用方法(end) ************/



  /**
   * 瀑布流推荐列表
   */
  feedList: function(args, callback) {
    var that = this;
    that.getURLData('feedlist', args, callback);
  },

  /**
   * 添加收藏
   * @param enum ftype  收藏类型
   *          article:文章收藏
   *          praise:文章点赞
   *          reply: 文章回帖
   *          car: 车型对比
   *          serie: 车系收藏
   * @param int sourceid  收藏索引id
   */
  addFavorite: function (ftype, sourceid, platid, callback) {
    var that = this;
    var res = false;
    var loginToken = that.getLoginToken();
    console.log(that.data.ftypes.indexOf(ftype) >= 0);
    if (that.data.ftypes.indexOf(ftype) >= 0 && sourceid > 0 && loginToken) {
      wx.request({
        url: getApp().apiHost + that.apiUrl.addFav,
        method: "post",
        data: {
          ftype: ftype,
          platid: platid,
          sourceid: sourceid,
          token: loginToken
        },
        header: {
          'content-type': 'application/json'
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          if (callback) {
            that.callback_page(callback, res.data, 'addFav');
          }
        }
      });
      res = true;
    } else {
      console.log('favorite args error');
    }

    return res;
  },

  /**
   * 删除收藏
   * 
   */
  remFav: function (ftype, sourceid, platid, callback) {
    var that = this;
    var res = false;
    var loginToken = that.getLoginToken();

    if (that.data.ftypes.indexOf(ftype) >= 0 && sourceid && loginToken) {
      wx.request({
        url: getApp().apiHost + that.apiUrl.delFav,
        method: "get",
        data: {
          ftype: ftype,
          platid: platid,
          sourceid: sourceid,
          token: loginToken
        },
        header: {
          'content-type': 'application/json'
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          if (callback) {
            that.callback_page(callback, res.data, 'remFav');
          }
          console.log(res.data)
        }
      });
      res = true;
    };
  },

  /**
   * 收藏列表
   * 
   * @param enum ftype  收藏类型
   *          article:文章收藏
   *          praise:文章点赞
   *          reply: 文章回帖
   *          car: 车型对比
   *          serie: 车系收藏
   */
  favList: function (ftype, page, psize, callback) {
    var that = this;
    page = page > 1 ? parseInt(page) : 1;
    psize = psize > 1 ? parseInt(psize) : 10;

    var loginToken = that.getLoginToken();
    console.log(loginToken);
    if (that.data.ftypes.indexOf(ftype) >= 0 && loginToken) {
      wx.request({
        url: getApp().apiHost + that.apiUrl.favList + ftype + 'List',
        method: "post",
        data: {
          ftype: ftype,
          page: page,
          psize: psize,
          token: loginToken
        },
        header: {
          'content-type': 'application/json'
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          var cb_data = res.data;
          if (callback && that.page[callback]) {
            that.page[callback](cb_data, ftype);
          } else {
            that.page.setData({
              favDataList: cb_data
            });
          }
        }
      });
    } else {

      console.log('favorite args error');
    }
  },

  /**
   * 车型配置接口
   */
  carArgs: function (pzids, callback) {
    if (!pzids) {
      return false;
    }
    var that = this;
    //pzids = typeof(pzids)==object?pzids:pzids.join(',');
    wx.request({
      url: getApp().apiHost + that.apiUrl.carArgs + pzids,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        that.page.data.detailpeizhi = res.data.data;
        if (callback && typeof (that.page[callback]) == 'function') {
          that.page[callback](res.data.data);
        } else {
          that.page.setData({//逻辑层到视图层
            carParams: that.page.data.detailpeizhi
          });
        }
      }
    })
  },

  /**
   * 根据多个车型id获取车型列表，多个ID用英文逗号隔开
   */
  listCarByIds: function (carIds, callback) {
    var that = this;

    if (!carIds) {
      return array();
    }
    var requestUrl = getApp().apiHost + that.apiUrl.carByIds + carIds;
    wx.request({
      url: requestUrl,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        var cars = res.data.data;
        console.log(cars);
        if (callback) {
          that.page[callback](res.data);
        } else {
          that.page.setData({
            'carList': res.data.data
          });
        }
      }
    })
  },

  /**
   * 车系列表（根据品牌ID)
   */
  serieByBrandId: function (ppid, callback) {
    var that = this;

    if (!ppid) {
      return array();
    }
    var requestUrl = getApp().apiHost + that.apiUrl.serieByBrandId + ppid;
    wx.request({
      url: requestUrl,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        var cars = res.data.data;
        if (callback) {
          that.page[callback](res.data.data);
        } else {
          that.page.setData({
            'carList': res.data.data
          });
        }
      }
    })
  },


  /**
   * 根据
   */
  serieByPinyin: function(pinyin, args, callback) {
    if (pinyin) {
      var that = this;
      // 拼接参数
      args['pinyin'] = pinyin;
      that.getURLData('serieByPinyin', args, callback);
    } else {
      console.log('serieByPinyin function not find pinyin');
    }
  },

  /**
   * 群组详情
   */
  groupDetail: function(id, callback) {
    var that = this;
    if (id>0) {
      that.getURLData('groupDetail', {id:id}, callback);
    } else {
      return false;
    }
  },


  
}

module.exports.wxapi = wxapi;