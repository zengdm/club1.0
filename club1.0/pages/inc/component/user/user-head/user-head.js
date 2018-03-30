// pages/user/inc/component/user-head/user-head.js
import { userApi } from '../../../../api//userApi';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    authorid: {
      type:Number,
      value:0,
      observer: function(newVal, oldVal) {
        console.log('user-head authorid:'+newVal);
        this._getPersonal();
      }
    },
    ishead: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 当前登录信息
    userInfo: {follow_num:0, article_num:0, fans_num:0},
    isSelf: false
  },

  //组件生命周期函数，在组件实例进入页面节点树时执行，注意此时不能调用 setData
  created: function () {
    var that = this;
    that.userApi = new userApi(that);
  },

  //组件生命周期函数，在组件布局完成后执行
  ready: function () {
    var that = this;
    // 默认获取当前用户信息
    var loginInfo = that.userApi.getLoginInfo();
    if (!loginInfo || !loginInfo.token) {
      loginInfo = that.userApi.getAccredit();
    }
    that.setData({userInfo:loginInfo});
  },
  
  /**
   * 组件的方法列表
   */
  methods: {



    // 获取个人信息
    _getPersonal: function() {
      console.log('getPersonal:'+this.properties.authorid);
      if (this.properties.authorid) {
        this.userApi.personal(this.properties.authorid, '_cb_gePersonal');
      } else {

      }
    },

    getpersonal:function(e){
      var that  =this;
      var headImg = that.data.userInfo.img.split(',');
      if (!headImg.length) {
        return false;
      }
      
      wx.previewImage({
        urls: [headImg[0]] // 需要预览的图片http链接列表
      })
    },

    // 个人信息回调
    _cb_gePersonal: function(res, opt) {
      if (res.code==0) {
        this.data.userInfo = res.data;
        // 判断是否为自己
        var loginInfo = this.userApi.getLoginInfo();
        if (typeof(loginInfo.id)!='undefined' && loginInfo.id==opt.authorid) {
          this.data.isSelf = true;
          console.log("自己")
        }else{
            console.log("别人")
            this.setData({
                isuserInfoid:1
            })
        }
      }
      console.log('personal info');
      console.log(this.data.userInfo);
      this.setData({userInfo: this.data.userInfo, isSelf:this.data.isSelf});
    },

    //跳转至个人主页
    _personal: function (e) {
      //跳转个人主页
      var that = this;
      var authorid = e.currentTarget.dataset.id;
      // 页面跳转
      if (authorid > 0) {
        wx.navigateTo({
          url: '/pages/user/personal/personal?authorid=' + authorid+'&ishead=0'
        })
      }
    },

    //跳转至粉丝页面
    goFans: function (e) {
      var that = this;
      var authorid = e.currentTarget.dataset.id;
      //跳转到新页面，可返回
      if (authorid > 0 && this.data.isSelf) {
        wx.navigateTo({
          url: '/pages/user/fans/fans'
        })
      }
    },

    //跳转至关注页面
    goFollow: function (e) {
      var that = this;
      var authorid = e.currentTarget.dataset.id;
      //跳转到新页面，可返回
      if (authorid > 0 && this.data.isSelf) {
        wx.navigateTo({
          url: '/pages/user/follow/follow'
        })
      }
    },

    /**
     * 点击用户头像再次授权
     * 
     */
    redelegation: function (e) {
      var that = this;
      // 检测授权状态
      that.userApi.ckPromission();
      // 微信授权登录,方法回调
      that.userApi.wxlogin('_cb_reLogin');
    },

    // 登录信息回调
    _cb_reLogin: function(res, opt) {
      console.log('_cb_relogin');
      console.log(res);
      this.setData({userInfo:res});
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

  }
})
