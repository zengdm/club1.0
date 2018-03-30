import { wxapi } from "./wxapi"

function login(form){
  this.init(form);
}

login.prototype={
  init: function (form) {
    var that = this;
    that.wxapi = new wxapi(that); 
    that.form = form;
  },
  sendCode:function(phone) {
    var that = this;
    if (that.form.data.buttonDisable) return false;

    var mobile = that.form.data.mobile;
    
    var regMobile = /^1\d{10}$/;
    if (!regMobile.test(mobile)) {
      that.form.setData({
        error:true
      })
      wx.showToast({
        title: '手机号有误！',
        image: '/pages/images/error.png',
      })
      return false;
    }

    var c = 60;
    var intervalId = setInterval(function () {
      c = c - 1;
      that.form.setData({
        verifyCodeTime: c + 's',
        buttonDisable: true
      })
      if (c == 0) {
        clearInterval(intervalId);
        that.form.setData({
          verifyCodeTime: '重新验证',
          buttonDisable: false
        })
      }
    }, 1000)

    // 发起验证码
    that.wxapi.sendVerifyCode(mobile, 'cb_verifyCode');


    /*
    wx.request({
      url: 'https://passport.diandong.com/ark/sendVerifyCode',
      method: "GET",
      data: {
        mobile: mobile
      },
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        console.log(res)
      }
    })

    console.log('send code' + phone);
    */
  },

  // 验证码回调方法
  cb_verifyCode: function(res, opt) {
    console.log('get mobile verify code');
    console.log(res);
  },

  mobileInputEvent: function (e) {
    var that = this;
  },


  phoneSubmit: function (e) {
    // console.log(e);
    var that = this;
   
    // try {
    //   var value = wx.getStorageSync('key')
    //   if (value) {
    //     that.form.data.unionId = value.unionId;
    //   }
    // } catch (e) {
    //   // Do something when catch error
    // }
    // console.log(that.form.data.unionId)
    var mobile = that.form.data.mobile;
    var verifyCode = that.form.data.verifyCode;
    // 授权信息
    var user = that.wxapi.getUserInfo();
    var unionId = '';
    if (user.unionId) {
      unionId = user.unionId;
    }
    // var unionId = that.form.data.unionId;
    
    // 手机号登录
    that.wxapi.phoneLogin(mobile, verifyCode, 'cb_phoneLogin');
  },

  // 手机号登录回调方法,返回用户信息
  cb_phoneLogin: function(res, opt) {
    var that = this;
    // console.log(' cb_fdsafdsa');
    that.form.setData({
      hidden: true,
    })
  },

  inPhone: function () {
    var that = this;
    that.form.setData({
      phoneBorder: true,
        error: false
      
    })
  },

  outPhone: function () {
    var that = this;
    that.form.setData({
      phoneBorder: false
    })
  },

  inCode: function () {
    var that = this;
    that.form.setData({
      codeBorder: true
    })
  },

  outCode: function () {
    var that = this;
    that.form.setData({
      codeBorder: false
    })
  },

  close:function(){
    var that = this;
    that.form.setData({
      hidden: true
    })
  },



};

module.exports.login = login;

// function phone3(){
//   console.log('phone3');
// }

// function sendCode(phone) {
//   console.log('send code to '+phone);
// }

// module.exports={
//   phone3:phone3,
//   sendCode:sendCode
// }