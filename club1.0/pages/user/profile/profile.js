// pages/user/profile/profile.js

//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
import { userApi } from '../../api/userApi.js';
import { wxapi } from '../../../plugins/wxapi';
// 更改头像
// 手机的宽度
var windowWRPX = 750
// 拖动时候的 pageX
var pageX = 0
// 拖动时候的 p
var pageY = 0

var pixelRatio = wx.getSystemInfoSync().pixelRatio

// 调整大小时候的 pageX
var sizeConfPageX = 0
// 调整大小时候的 pageY
var sizeConfPageY = 0

var initDragCutW = 0
var initDragCutL = 0
var initDragCutH = 0
var initDragCutT = 0

// 移动时 手势位移与 实际元素位移的比
var dragScaleP = 2
// 更改头像


Page({

    /**
     * 页面的初始数据
     */
    data: {
        array: ['保密', '男', '女'],
        date: '',
        region: ['北京市', '北京市', ''],
        mobileReal: '',
        args: { img: '', sex: '', birthday: '', self_desc: '' },
        // btnColor: true,

        //修改头像
        isShowImg: true,
        imageSrc: '',
        returnImage: '',
        isShowImg: false,
        // 初始化的宽高
        cropperInitW: windowWRPX,
        cropperInitH: windowWRPX,
        // 动态的宽高
        cropperW: windowWRPX,
        cropperH: windowWRPX,
        // 动态的left top值
        cropperL: 0,
        cropperT: 0,

        // 图片缩放值
        scaleP: 0,
        imageW: 0,
        imageH: 0,

        // 裁剪框 宽高
        cutW: 0,
        cutH: 0,
        cutL: 0,
        cutT: 0,
        userInfo: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        // that.wxapi = new wxapi(that);
        // 获取登录信息
        // that.data.userInfo = that.wxapi.getUserInfo();
        that.userApi = new userApi(that);
        // 获取个人信息 
        that.userApi.loginApi('cb_getLoginInfo');
        console.log(that.data.array);
        // that.setData({
        //     userInfo: that.data.userInfo,
        //     isShowImg: true,
        // });
        // console.log("1111111111111111111111111111111111111111111111111111111111111111111111")
        // console.log(that.data.userInfo)
        // console.log("1111111111111111111111111111111111111111111111111111111111111111111111")
    },
    // 性别选择
    bindPickerChange: function (e) {
        // console.log('picker发送选择改变，携带值为', e.detail.value)
        var that = this;
        that.data.args.sex = e.detail.value
        // that.data.btnColor = false;
        that.setData({
            index: that.data.args.sex,
            // btnColor: false
        })
    },
    // 年龄选择
    bindDateChange: function (e) {
        var that = this;
        that.data.args.birthday = e.detail.value
        // that.data.btnColor = false;
        that.setData({
            'userList.birthday': e.detail.value,
            // btnColor: false
        })
    },
    //城市选择
    bindRegionChange: function (e) {
        var that = this
        // that.data.btnColor = false;
        that.setData({
            region: e.detail.value,
            // btnColor: false
        })
    },
    //获取个人信息
    cb_getLoginInfo: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            that.data.userList = res.data;
            console.log(that.data.userList);
            if (res.data.img) {
                console.log("+++++++++++++++++++++++66666666666666666666")
                that.userApi.getAccredit('cb_getAccreditInfo');
                console.log("+++++++++++++++++++++++66666666666666666666")
            }
        }
        var mobileReal = that.data.userList.mobile.slice(0, 3) + '***' + that.data.userList.mobile.slice(7, 11)
        that.setData({
            userList: that.data.userList,
            mobileReal: mobileReal
        });
    },
    cb_getAccreditInfo: function (res, opt) {

        console.log("+++++++++++++++++++++++66666666666666666666")
        console.log(res)
        console.log("+++++++++++++++++++++++66666666666666666666")

    },
    //设置个人信息
    cb_setUserInfo: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            wx.showToast({
                title: '修改成功',
                image: '/pages/images/success.png',
                duration: 2000
            })
            console.log(res.data);
            setTimeout(function () {
                wx.navigateBack({
                    delta: 1
                })
            }, 2000);
          
        }
    },
    bindText: function (e) {
        var that = this;
        var textval = e.detail.value;
        var textvalold = textval.trim();
        // if (textvalold == '') {
            // that.setData({
            //     btnColor: true
            // });
        // } else {
            that.data.args.self_desc = textval
            // that.data.btnColor = false;
            // that.setData({
            //     btnColor: false
            // });
        // }
    },
    bindSave: function () {
        var that = this;
        console.log(that.data.args);
        //设置个人信息
        // if (that.data.btnColor == false) {
            //发布按钮是否置灰
            that.userApi.setUserInfo(that.data.args, 'cb_setUserInfo');
        // }


    },
    //更换头像
    changephoto: function () {
        var that = this;
        console.log("更换头像");
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                //   var tempFilePaths = res.tempFilePaths
                console.log("1111111111111111111111111111111111")
                console.log(res.tempFilePaths[0])
                console.log("1111111111111111111111111111111111")
                that.data.imageSrc = res.tempFilePaths[0]
                that.setData({
                    imageSrc: that.data.imageSrc
                })
                that.cutphoto()
            }
        })
    },
    cutphoto: function () {
        var that = this;
        console.log("选定照片")
        wx.getImageInfo({
            src: that.data.imageSrc,
            success: function success(res) {

                var innerAspectRadio = res.width / res.height;
                // 根据图片的宽高显示不同的效果   保证图片可以正常显示
                if (innerAspectRadio >= 1) {
                    that.setData({
                        cropperW: windowWRPX,
                        cropperH: windowWRPX / innerAspectRadio,
                        // 初始化left right
                        cropperL: Math.ceil((windowWRPX - windowWRPX) / 2),
                        cropperT: Math.ceil((windowWRPX - windowWRPX / innerAspectRadio) / 2),
                        // 裁剪框  宽高  
                        cutW: windowWRPX - 200,
                        cutH: windowWRPX / innerAspectRadio - 200,
                        cutL: Math.ceil((windowWRPX - windowWRPX + 200) / 2),
                        cutT: Math.ceil((windowWRPX / innerAspectRadio - (windowWRPX / innerAspectRadio - 200)) / 2),
                        // 图片缩放值
                        scaleP: res.width * pixelRatio / windowWRPX,
                        // 图片原始宽度 rpx
                        imageW: res.width * pixelRatio,
                        imageH: res.height * pixelRatio
                    })
                } else {
                    that.setData({
                        cropperW: windowWRPX * innerAspectRadio,
                        cropperH: windowWRPX,
                        // 初始化left right
                        cropperL: Math.ceil((windowWRPX - windowWRPX * innerAspectRadio) / 2),
                        cropperT: Math.ceil((windowWRPX - windowWRPX) / 2),
                        // 裁剪框的宽高
                        cutW: windowWRPX * innerAspectRadio - 50,
                        cutH: 200,
                        cutL: Math.ceil((windowWRPX * innerAspectRadio - (windowWRPX * innerAspectRadio - 50)) / 2),
                        cutT: Math.ceil((windowWRPX - 200) / 2),
                        // 图片缩放值
                        scaleP: res.width * pixelRatio / windowWRPX,
                        // 图片原始宽度 rpx
                        imageW: res.width * pixelRatio,
                        imageH: res.height * pixelRatio
                    })
                }
                that.setData({
                    isShowImg: true
                })
                wx.hideLoading()
            }
        })

    },
    // 拖动时候触发的touchStart事件
    contentStartMove(e) {
        pageX = e.touches[0].pageX
        pageY = e.touches[0].pageY
    },
    // 拖动时候触发的touchMove事件
    contentMoveing(e) {
        var that = this
        // that.data.cutL + (e.touches[0].pageX - pageX)
        // console.log(e.touches[0].pageX)
        // console.log(e.touches[0].pageX - pageX)
        var dragLengthX = (pageX - e.touches[0].pageX) * dragScaleP
        var dragLengthY = (pageY - e.touches[0].pageY) * dragScaleP
        var minX = Math.max(that.data.cutL - (dragLengthX), 0)
        var minY = Math.max(that.data.cutT - (dragLengthY), 0)
        var maxX = that.data.cropperW - that.data.cutW
        var maxY = that.data.cropperH - that.data.cutH
        this.setData({
            cutL: Math.min(maxX, minX),
            cutT: Math.min(maxY, minY),
        })
        console.log(`${maxX} ----- ${minX}`)
        pageX = e.touches[0].pageX
        pageY = e.touches[0].pageY
    },
    // 获取图片
    getImageInfo() {
        var that = this
        wx.showLoading({
            title: '图片生成中...',
        })
        const ctx = wx.createCanvasContext('myCanvas')
        ctx.drawImage(that.data.imageSrc)
        ctx.draw()
        setTimeout(function () { that.callback() }, 1000);
    },
    callback: function () {
        var that = this;
        console.log("裁剪")
        // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题
        var canvasW = that.data.cutW / that.data.cropperW * that.data.imageW / pixelRatio
        var canvasH = that.data.cutH / that.data.cropperH * that.data.imageH / pixelRatio
        var canvasL = that.data.cutL / that.data.cropperW * that.data.imageW / pixelRatio
        var canvasT = that.data.cutT / that.data.cropperH * that.data.imageH / pixelRatio
        // console.log(`canvasW:${canvasW} --- canvasH: ${canvasH} --- canvasL: ${canvasL} --- canvasT: ${canvasT} -------- that.data.imageW: ${that.data.imageW}  ------- that.data.imageH: ${that.data.imageH}`)
        wx.canvasToTempFilePath({
            x: canvasL,
            y: canvasT,
            width: canvasW,
            height: canvasH,
            destWidth: canvasW,
            destHeight: canvasH,
            canvasId: 'myCanvas',
            success: function (res) {
                wx.hideLoading()
                // 成功获得地址的地方
                that.data.userList.img = res.tempFilePath;
                that.setData({
                    userList: that.data.userList,
                    imageSrc: false
                });
                wx.uploadFile({
                    url: 'http://item.diandong.com/globals/photo/upload',
                    filePath: res.tempFilePath,
                    name: 'imgFile',
                    success: function (resp) {
                        if (resp.statusCode == 200) {
                            resp.data = JSON.parse(resp.data);
                            console.log(resp.data.data.src)
                            that.data.args.img = resp.data.data.src;
                            that.data.btnColor = false;
                            that.setData({
                                btnColor: false
                            });

                        } else {
                            console.log('失败');
                            console.log(resp);
                        }
                    },
                });

                //   that.setData({
                //       imageSrc: res.tempFilePath
                //   })
                //   wx.previewImage({
                //       current: '', // 当前显示图片的http链接
                //       urls: [res.tempFilePath] // 需要预览的图片http链接列表
                //   })
            }
        })

    },

    // 设置大小的时候触发的touchStart事件
    dragStart(e) {
        var that = this
        sizeConfPageX = e.touches[0].pageX
        sizeConfPageY = e.touches[0].pageY
        initDragCutW = that.data.cutW
        initDragCutL = that.data.cutL
        initDragCutT = that.data.cutT
        initDragCutH = that.data.cutH
    },

    // 设置大小的时候触发的touchMove事件
    dragMove(e) {
        var that = this
        var dragType = e.target.dataset.drag
        switch (dragType) {
            case 'right':
                var dragLength = (sizeConfPageX - e.touches[0].pageX) * dragScaleP
                if (initDragCutW >= dragLength) {
                    // 如果 移动小于0 说明是在往下啦  放大裁剪的高度  这样一来 图片的高度  最大 等于 图片的top值加 当前图片的高度  否则就说明超出界限
                    if (dragLength < 0 && that.data.cropperW > initDragCutL + that.data.cutW) {
                        this.setData({
                            cutW: initDragCutW - dragLength
                        })
                    }
                    // 如果是移动 大于0  说明在缩小  只需要缩小的距离小于原本裁剪的高度就ok
                    if (dragLength > 0) {
                        this.setData({
                            cutW: initDragCutW - dragLength
                        })
                    }
                    else {
                        return
                    }
                } else {
                    return
                }
                break;
            case 'left':
                var dragLength = (dragLength = sizeConfPageX - e.touches[0].pageX) * dragScaleP
                console.log(dragLength)
                if (initDragCutW >= dragLength && initDragCutL > dragLength) {
                    if (dragLength < 0 && Math.abs(dragLength) >= initDragCutW) return
                    this.setData({
                        cutL: initDragCutL - dragLength,
                        cutW: initDragCutW + dragLength
                    })
                } else {
                    return;
                }
                break;
            case 'top':
                var dragLength = (sizeConfPageY - e.touches[0].pageY) * dragScaleP
                if (initDragCutH >= dragLength && initDragCutT > dragLength) {
                    if (dragLength < 0 && Math.abs(dragLength) >= initDragCutH) return
                    this.setData({
                        cutT: initDragCutT - dragLength,
                        cutH: initDragCutH + dragLength
                    })
                } else {
                    return;
                }
                break;
            case 'bottom':
                var dragLength = (sizeConfPageY - e.touches[0].pageY) * dragScaleP
                // console.log(that.data.cropperH > that.data.cutT + that.data.cutH)
                console.log(dragLength)
                console.log(initDragCutH >= dragLength)
                console.log(that.data.cropperH > initDragCutT + that.data.cutH)
                // 必须是 dragLength 向上缩小的时候必须小于原本的高度
                if (initDragCutH >= dragLength) {
                    // 如果 移动小于0 说明是在往下啦  放大裁剪的高度  这样一来 图片的高度  最大 等于 图片的top值加 当前图片的高度  否则就说明超出界限
                    if (dragLength < 0 && that.data.cropperH > initDragCutT + that.data.cutH) {
                        this.setData({
                            cutH: initDragCutH - dragLength
                        })
                    }
                    // 如果是移动 大于0  说明在缩小  只需要缩小的距离小于原本裁剪的高度就ok
                    if (dragLength > 0) {
                        this.setData({
                            cutH: initDragCutH - dragLength
                        })
                    }
                    else {
                        return
                    }
                } else {
                    return
                }
                break;
            case 'rightBottom':
                var dragLengthX = (sizeConfPageX - e.touches[0].pageX) * dragScaleP
                var dragLengthY = (sizeConfPageY - e.touches[0].pageY) * dragScaleP
                if (initDragCutH >= dragLengthY && initDragCutW >= dragLengthX) {
                    // bottom 方向的变化
                    if ((dragLengthY < 0 && that.data.cropperH > initDragCutT + that.data.cutH) || (dragLengthY > 0)) {
                        this.setData({
                            cutH: initDragCutH - dragLengthY
                        })
                    }

                    // right 方向的变化
                    if ((dragLengthX < 0 && that.data.cropperW > initDragCutL + that.data.cutW) || (dragLengthX > 0)) {
                        this.setData({
                            cutW: initDragCutW - dragLengthX
                        })
                    }
                    else {
                        return
                    }
                } else {
                    return
                }
                break;
            default:
                break;
        }
    },

})