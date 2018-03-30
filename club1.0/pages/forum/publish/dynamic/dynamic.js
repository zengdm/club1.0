// pages/forum/publish/dynamic/dynamic.js
//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
import { forumApi } from '../../../api/forumApi.js';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        photoArr: [],
        tagsPage: false,
        btnColor: true,
        textLen:0,
        args: {
            'type': 'dynamic',
            content: [
                {
                    "type": "text",
                    "decode": {
                        "alt": ""
                    }
                },
            ],
            tagids: []
        },
        nodeIndex: 0,
        uploadIng: true,
        pubDisabled:false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.forumApi = new forumApi(that);
        that.setGlobalData();
        console.log(options)
        if (options.sourceType) {
            var nodeIndex = that.data.nodeIndex;
            var count = 9 - nodeIndex;
            var sourceType = options.sourceType;
            that.forumApi.imgUpload(count, 'cb_uploadImg', nodeIndex, sourceType)
        }
    },
    /**
  * 统一设置模板全局变量
  */
    setGlobalData: function () {
        var that = this;
        // 模板统一赋值
        that.setData(that.data);
        // console.log(that.data);
    },
    uploadIages: function () {
        //添加图片
        var that = this;
        var nodeIndex = that.data.nodeIndex;
        console.log("-------------------------------------")
        console.log(nodeIndex)
        var count = 9 - nodeIndex;
        if (count <= 9) {
            console.log("9张以内")
            that.forumApi.imgUpload(count, 'cb_uploadImg', nodeIndex)
        } else {
            console.log("9张以外")
            that.setData({
                uploadIng: false
            });
        }
        console.log("-------------------------------------")
    },
    cb_uploadImg: function (res, opt) {
        //   opt = [server|local]
        //   res:
        //     nodeIndex：节点位置
        //     id：图片id,本地0
        //     img_url:fdsfds
        var that = this;
        if (typeof (res.data.src) != 'undefined') {
            // that.data.photoArr = res.data;
            if (res.data.id > 0) {
                var imgurl = { "type": "img", "decode": { "src": res.data.src, "id": res.data.id } };
                that.data.args.content.push(imgurl)
                var contentlen = that.data.args.content.length;
                var nowindexs = contentlen - 2;
                that.data.photoArr[nowindexs].islode = -1;
                console.log("1111111111111111111111111111111111111111111")
                console.log(that.data.args.content)
                console.log(that.data.photoArr)
                console.log(contentlen)
                console.log(nowindexs)
                that.setData({
                    photoArr: that.data.photoArr,
                })

                console.log("1111111111111111111111111111111111111111111")



                if (contentlen >= 10) {
                    console.log("大于等于10")
                    that.setData({
                        uploadIng: false
                    });
                }
            } else {
                that.data.photoArr.push(res.data);
                console.log(that.data.photoArr)
                var photoArrlen = that.data.photoArr.length;
                that.data.nodeIndex = photoArrlen;
                console.log("--------------------------")
                console.log(that.data.nodeIndex)
                console.log("--------------------------")
                if (photoArrlen >= 9) {
                    that.setData({
                        uploadIng: false
                    });
                }
                that.setData({
                    photoArr: that.data.photoArr,
                    btnColor: false
                })
            }
        }
    },
    deleteIage: function (e) {
        //删除图片
        var that = this;
        var dataid = e.currentTarget.dataset.nodeindex;
        // that.data.args.content
        var arr = that.data.photoArr;
        var contentarr = that.data.args.content;
        var newArrcontentarr = [];
        var newArr = [];
        for (var i in arr) {
            var item = arr[i];
            if (i != dataid) {
                newArr.push(item);
            }
        }
        var cdataid = dataid + 1
        for (var j in contentarr) {
            var item = contentarr[j];
            if (j != cdataid) {
                newArrcontentarr.push(item);
            }
        }
        that.data.args.content = newArrcontentarr;
        that.data.nodeIndex = newArr.length;
        if (newArr.length == 0) {
            that.setData({
                btnColor: true
            })
        }
        this.setData({
            photoArr: newArr,
            uploadIng: true
        });
    },
    tagsDelete: function (e) {
        //删除关联标签
        var that = this;
        var tagsId = e.currentTarget.dataset.id;
        var tagsItem = that.data.args.tagids;
        var newTagsItem = [];
        for (var i in tagsItem) {
            var item = tagsItem[i];
            if (i != tagsId) {
                newTagsItem.push(item);
            }
        }
        that.data.args.tagids = newTagsItem
        that.setData({
            args: that.data.args
        });
    },
    publishBtn: function () {
        //发布动态
        var that = this;
        console.log('222222222');
        console.log(that.data.args);
        if (that.data.btnColor == false && that.data.textLen <= 5000) {
            //发布按钮是否置灰
          that.setData({
            pubDisabled: true,
          });
          that.forumApi.publish('dynamic', that.data.args, 'cb_publish');
        } else if (that.data.textLen > 5000){
          wx.showToast({
            title: '不多于5000字',
            duration: 2000,
            image: '/pages/images/warning.png'
          });
        }
    },
    cb_publish: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            wx.showToast({
                title: '发帖成功',
                image: '/pages/images/success.png',
                duration: 2000
            });
            // 设置导航
            var defaultNav = { navid: 0, path: 'club' };
            getApp().defaultNav = defaultNav;
            // 切换tabBar页面
            setTimeout(function () {
                wx.switchTab({
                    url: '/tabBar/forum/forum'
                });
                that.setData({
                  pubDisabled: false,
                })
            }, 2000);
        } else {
            wx.showToast({
                title: '发帖失败',
                duration: 2000,
                image: '/pages/images/warning.png'
            });
            that.setData({
              pubDisabled: false,
            })
        }
    },
    removepublish: function () {
        //取消发布
        wx.navigateBack({
            delta: 1
        })
    },
    tagsBtn: function () {
        //添加标签，打开弹层
        var that = this;
        that.setData({
            tagsPage: true,
            textStyle: 'display:none;'
        });
    },
    _onBackBtn: function () {
        //关闭标签弹层
        var that = this;
        that.setData({
            tagsPage: false,
            textStyle: ''
        });
    },


    _bindTagChange: function (e) {
        var that = this;

        var types = true;
        for (var i = 0; i < that.data.args.tagids.length; i++) {
            if (that.data.args.tagids[i].tag_id == e.detail.currentTarget.dataset.id) {
                types = false;
            }
        }
        if (types) {
            that.data.args.tagids.push({
                tag_id: e.detail.currentTarget.dataset.id,
                tag_name: e.detail.currentTarget.dataset.name
            });
            console.log(that.data.args.tagids);
            that.setData({
                tagsPage: false,
                args: that.data.args,
                textStyle: '',
            });
        } else {
            wx.showToast({
                title: e.detail.currentTarget.dataset.name + '已存在',
                image: '/pages/images/warning.png'
            });
        }

    },
    // //关联标签列表
    // _bindTagChange: function (e) {
    //     var that = this;
    //     that.data.args.tagids.push({
    //         tag_id: e.detail.currentTarget.dataset.id,
    //         tag_name: e.detail.currentTarget.dataset.name
    //     })
    //     that.setData({
    //         tagsPage: true,
    //         args: that.data.args,
    //         textStyle:'',
    //     });
    // },

    //新增标签
    _bindFormSubmit: function (e) {
        var that = this;
        var is_repet = true;
        var repet_num = 0;
        var oldNum = 0;

        // console.log(e.detail.detail.value.input);
        var tagsValue = e.detail.detail.value.input;
        if (tagsValue == '') {
            wx.showToast({
                title: '请填写标签',
                image: '/pages/images/warning.png'
            });
            return false
        }
        var tagsNewValue = new Array();
        var spaceArray = new Array();
        tagsValue = tagsValue.trim();
        tagsValue = tagsValue.replace(/，/ig, ',');
        if (tagsValue.indexOf(",") != -1) {
            tagsNewValue = tagsValue.split(",")
            for (var i = 0; i < tagsNewValue.length; i++) {
                if (tagsNewValue[i].indexOf(" ") != -1) {
                    spaceArray = tagsNewValue[i].trim().split(" ");
                    for (var j = 0; j < spaceArray.length; j++) {
                        tagsNewValue.push(spaceArray[j]);
                    }
                    tagsNewValue.splice(i, 1);
                }
            }
        } else if (tagsValue.indexOf(" ") != -1) {
            tagsNewValue = tagsValue.split(" ");
        } else {
            tagsNewValue.push(tagsValue);
        }

        //去除空项
        for (var i = 0; i < tagsNewValue.length; i++) {
            if (tagsNewValue[i].trim().length == 0 || tagsNewValue[i] == null) {
                tagsNewValue.splice(i, 1);
            }
        }

        oldNum = that.data.args.tagids.length;
        for (var i = 0; i < tagsNewValue.length; i++) {
            is_repet = true;
            for (var j = 0; j < that.data.args.tagids.length; j++) {
                if (tagsNewValue[i].trim() == that.data.args.tagids[j].tag_name) {
                    is_repet = false;
                    repet_num = repet_num + 1;
                }
            }

            if (is_repet) {
                if (tagsNewValue[i].trim().length != 0 && tagsNewValue[i] != null) {
                    that.data.args.tagids.push({
                        tag_id: 0,
                        tag_name: tagsNewValue[i].trim()
                    })
                }
            }

        }

        if (repet_num == tagsNewValue.length && oldNum != 0) {
            wx.showToast({
                title: '标签已存在',
                image: '/pages/images/warning.png'
            });
        } else {
            console.log('555555555555555555')
            that.setData({
                tagsPage: false,
                args: that.data.args
            });
        }

    },
    // _bindFormSubmit: function (e) {
    //      //新增标签
    //     var that = this;
    //     var tagsValue = e.detail.detail.value.input;
    //     var tagsNewValue = new Array();
    //     var spaceArray = new Array();
    //     tagsValue = tagsValue.trim();
    //     tagsValue = tagsValue.replace(/，/ig, ',');
    //     if (tagsValue.indexOf(",") != -1) {
    //         tagsNewValue = tagsValue.split(",")
    //         for (var i = 0; i < tagsNewValue.length; i++) {
    //             if (tagsNewValue[i].indexOf(" ") != -1) {
    //                 spaceArray = tagsNewValue[i].trim().split(" ");
    //                 for (var j = 0; j < spaceArray.length; j++) {
    //                     tagsNewValue.push(spaceArray[j]);
    //                 }
    //                 tagsNewValue.splice(i, 1);
    //             }
    //         }
    //     } else if (tagsValue.indexOf(" ") != -1) {
    //         tagsNewValue = tagsValue.split(" ")
    //     } else {
    //         tagsNewValue.push(tagsValue)
    //     }
    //     for (var i = 0; i < tagsNewValue.length; i++) {
    //         if (tagsNewValue[i].trim().length != 0 && tagsNewValue[i] != null) {
    //             that.data.args.tagids.push({
    //                 tag_id: 0,
    //                 tag_name: tagsNewValue[i].trim()
    //             })
    //         }
    //     }
    //     that.data.tagsPage = false;
    //     // that._setData();
    //       that.setData({
    //         tagsPage: true,
    //         args: that.data.args
    //     });
    // },
    bindinput: function (e) {
        //textarea值获取
        var that = this;
        var textval = e.detail.value;
        that.data.textLen = textval.length;
        var textvalold = textval.trim();
        if (textvalold == '') {
            that.setData({
                btnColor: true
            });
        } else {
            that.data.args.content[0].decode.alt = textval
            that.setData({
                btnColor: false
            });
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})