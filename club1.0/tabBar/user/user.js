var app = getApp();
import { login } from '../../plugins/login';
import { wxapi } from '../../plugins/wxapi';
import { share } from '../../plugins/share';
import { userApi } from '../../pages/api/userApi'

Page({
    data: {
        winHeight: '',
        winWidth: '',
        winWidth: 0,
        winHeight: 0,
        // 当前登录信息
        userInfo: {},
        verifyCodeTime: '验证',
        buttonDisable: '',
        hidden: true,
        phoneBorder: false,
        codeBorder: false,
        error: false,
        //提现
        amountmoney: '',
        //分享
        shareclientYstart: '',
        shareclientYmove: '',
        // 登录弾层（默认隐藏）
        loginShow: false
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        console.log("123456789")
        var that = this;
        that.login = new login(that);
        that.wxapi = new wxapi(that);
        //初始化分享
        that.shareObj = new share(that);
        // 用户接口
        that.userApi = new userApi(that);
        // 设置分享内容
        that.shareObj.setShare('电动邦，带您一起了解新能源汽车、用好新能源车、玩好新能源汽车！', '/pages/user/self/self');

        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
        that.setData(that.data);

    },

    onReady: function () {
        var that = this;
        // 获取登录信息
        // var userInfo = that.wxapi.getUserInfo();
    },
    // setTimeout(test, 1000);
    onShow: function () {
        var that = this;
        // that.onLoad()
        // 设置用户信息
        that.data.userInfo = that.userApi.getLoginInfo();
        that.setData({ 'userInfo': that.data.userInfo, 'loginShow': false });
        that.userApi.personal(that.data.userInfo.id, 'amountmoney');
    },

    /**
     * 检测登录状态
     */
    checkLogin: function () {
        var that = this;
        // 检测授权状态
        if (!getApp().accredit) {
            that.userApi.ckPromission();
            return false;
        }
        // 当前登录信息
        var loginInfo = getApp().globalData.userInfo;
        if (!loginInfo || !loginInfo.has_mobile || !loginInfo.id || !loginInfo.token) {
            that.loginTips(1);
            return false;
        }
        return true;
    },

    _cb_login: function (res, opt) {
        var that = this;
        console.log('----cb_login')
        console.log(res);
        that.setData({ 'userInfo': res });
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

    // 显示登录弾层
    loginTips: function (isshow) {
        var that = this;
        that.data.loginShow = isshow;
        that.setData({ loginShow: that.data.loginShow });
    },
    //提现
    amountmoney: function (res, opt) {
        var that = this;
        that.data.amountmoney = res.data
        that.setData({
            amountmoney: res.data,
        });
    },
    amountmoneyto: function () {
        var that = this;
        //跳转到提现
        wx.navigateTo({
            url: '../../pages/user/amount/amount?amount=' + that.data.amountmoney.amount + '&&authorid=' + that.data.userInfo.id
        })
    },
    handletouchstart: function (event) {
        var that = this;
        that.data.shareclientYstart = event.touches[0].clientY;
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
        var that = this;
        if (options.from === 'button') {
            console.log('按钮转发');
        } else {
            console.log('右上角转发');
        }
        return that.shareObj.getShare();
    },

    getCode: function () {
        var that = this;
        that.login.sendCode();
    },

    c: function (e) {
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
        that.login.close();
    },



    _cb_setLogin: function (res, opt) {
        var that = this;
        that.data.userInfo = res;
        that.setData({ 'userInfo': that.data.userInfo });
    },

    /**
     * 修改个人资料
     */
    goprofile: function () {
        var that = this;
        // 登录信息检测
        var loginStatus = that.userApi.checkLogin();

        console.log(loginStatus);
        if (!loginStatus.status) {
            // 已授权显示登录弹窗
            if (loginStatus.promission) {
                that.loginTips(1);
            }
            return false;
        }

        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/user/profile/profile'
        })
    },



    /**
     * 我的收藏
     */
    myCollect: function (e) {
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

        //跳转到新页面，可返回
        wx.navigateTo({
            url: '/pages/user/collect/collect'
        })
    },

    /**
      * 车型对比
      */
    carContrast: function (e) {
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

        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/user/contrast/index/index'
        })
    },

    /**
     * 微信群组
     */
    wxGroup: function (e) {
        var that = this;

        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/group/list/list'
        })
    },

    /**
     * 微信客服
     */
    wxService: function (e) {
        var that = this;

        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/group/service/service'
        })
    },

    /**
     * 意见反馈
     */
    gofeedback: function () {
        var that = this;
        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/group/feedback/feedback'
        })
    },

});
