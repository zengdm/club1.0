import { SelectInterval } from '../../../../plugins/selectInterval';
var app = getApp();

Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    myData: {},
    jgListdata: [],
    isTo: false,
    kong: -1,
    jgvalData: '',
    xhvalData: '',
    lxvalData: '',
    lbvalData: '',
    driveparaData: '',
    priceparaData: '',
    enduranceparaData: '',
    carTypeparaData: '',
    search_id: '',
    choosepricepara: '',
    choosedriveparalen: '',
    chooseenduranceparalen: '',
    choosecarTypeparalen: '',
    carsnumber: '',
    // show:0,
    currentTab: 0,
    currentbox: true,
    currentkong: -1,
    ajaxData: '',
    isjg: false,
    islx: false,
    isxh: false,
    islb: false,
    page: 0,
    pageSize: 10,
    pageOffset: 0,
    orderfield: "price",
    orderseq: "desc",
    MoreData: true,
  },
  touchStart: function () {
    var that = this;
    that.setData({
      show: that.data.kong,
      showmask: -1
    })
  },
  touchMove: function () {
    var that = this;
    that.setData({
      show: that.data.kong,
      showmask: -1
    })
  },
  touchEnd: function () {
    var that = this;
    that.setData({
      show: that.data.kong,
      showmask: -1
    })
  },
  js_touchstartone(e) {
    this.selectInterval.move(e.changedTouches[0].x, e.changedTouches[0].y);
    console.log("滑动开始")
  },
  js_touchmoveone(e) {
    this.selectInterval.meter(e.changedTouches[0].x);
    console.log("滑动进行中")
  },
  js_touchendone(e) {
    var that = this;
    that.selectInterval.texthints((min, max) => {

      if (max == null) {
        max = 99999;
      }
      console.log(min, max);
      that.data.jgvalData = min + ',' + max;
      // wx.setStorage({
      //   key: "choosepricepara",
      //   data: that.data.jgvalData
      // });
      that.searchapi()
      that.data.isTo = true;
      console.log(that.data.jgvalData)
      that.searchId();
    });
  },
  onLoad: function (options) {
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.selectInterval = new SelectInterval({
      canvasId: 'canvasone',
      canvasHeight: 140,
      Xaxis: { left: 30, right: 315 },
      scale: [0, 10, 20, 30, 40, 50, 60],
      Yaxis: [90, 2],
      bothEndsNear: 60,
      // decimalPoint:10,
      // rightSliderStop:true,
      showTitle: {
        name: '万',
        size: 17,
        positionX: 180,
        positionY: 32
      },
      scaleIn: {
        name: '',
        size: 22,
        valueY: 195,
        pointY: 195
      },
      colour: {
        title: '#33adff',
        colorBar: ['#e5e5e5', '#33adff'],
        roundColor: ['#ffffff', '#e5e5e5'],
        scale: ['#000000', '#ffffff']
      },
      selectedInterval: {
        min: 0,
        max: 50
      },
      round: {
        radius: 10,
        edgeLine: 2
      },
      image: {
        url: '../../../images/picker.png',
        width: 32,
        height: 42
      },
      followValue: {
        color: '#ffffff',
        size: 14,
        leftY: 128,
        rightY: 128
      }
    });

    that.setData({
      myData: options
    });
    console.log(that.data.myData.pricepara)
    if (that.data.myData.pricepara == "undefined" || that.data.myData.pricepara == "0,99999") {
      that.setData({
        isjg: true
      });
    } else {
      wx.getStorage({
        key: 'choosepricepara',
        success: function (res) {
          console.log(res.data)
          that.data.choosepricepara = res.data;
            that.setData({
              choosepricepara: that.data.choosepricepara,
              isjg: false
            });
        }
      })
    };
    if (that.data.myData.drivepara === "undefined") {
      that.setData({
        islx: true
      });
    } else {
      wx.getStorage({
        key: 'choosedriveparalen',
        success: function (res) {
          console.log(res.data)
          that.data.choosedriveparalen = res.data
          that.setData({
            driveparaDatalen: that.data.choosedriveparalen,
            islx: false
          });
        }
      })
    }
    if (that.data.myData.endurancepara === "undefined") {
      that.setData({
        isxh: true
      });
    } else {
      wx.getStorage({
        key: 'chooseenduranceparalen',
        success: function (res) {
          that.data.chooseenduranceparalen = res.data
          that.setData({
            enduranceparaDatalen: that.data.chooseenduranceparalen,
            isxh: false
          });
        }
      })
    }
    if (that.data.myData.carTypepara === "undefined") {
      that.setData({
        islb: true
      });
    } else {
      wx.getStorage({
        key: 'choosecarTypeparalen',
        success: function (res) {
          that.data.choosecarTypeparalen = res.data
          that.setData({
            choosecarTypeparalen: that.data.choosecarTypeparalen,
            islb: false
          });
        }
      })
    }

    that.data.jgvalData = that.data.myData.pricepara;
    that.data.xhvalData = that.data.myData.endurancepara;
    that.data.lxvalData = that.data.myData.drivepara;
    that.data.lbvalData = that.data.myData.carTypepara;
    console.log("that.data.myData")
    console.log(that.data.myData)
    that.setData({
      carsnumber: that.data.myData.carsnumber,
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    // that.save();

  },
  onReady: function () {
    var that = this;
    wx.getStorage({
      key: 'choosedrivepara',
      success: function (res) {
        that.data.driveparaData = res.data
        that.setData({
          driveparaData: that.data.driveparaData,
        });
      }
    })
    wx.getStorage({
      key: 'chooseendurancepara',
      success: function (res) {
        that.data.enduranceparaData = res.data
        that.setData({
          enduranceparaData: that.data.enduranceparaData,
        });
      }
    })
    wx.getStorage({
      key: 'choosecarTypepara',
      success: function (res) {
        that.data.carTypeparaData = res.data
        that.setData({
          carTypeparaData: that.data.carTypeparaData,
        });
      }
    })
    that.searchId();
  },
  searchId: function () {
    var that = this;

    wx.showLoading({
      title: '加载中',
    })
    // that.data.page = 1
    that.data.page++;
    console.log(that.data.page)
    that.data.pageOffset = (that.data.page - 1) * that.data.pageSize;
    console.log(that.data.pageOffset)
    wx.request({
      url: app.apiHost + "/app/xcx/search-new?count=0&pricepara=" + that.data.jgvalData + "&drivepara=" + that.data.lxvalData + "&endurancepara=" + that.data.xhvalData + "&carTypepara=" + that.data.lbvalData + "&pageOffset=" + that.data.pageOffset + "&pageSize=" + that.data.pageSize + "&orderfield=" + that.data.orderfield + "&orderseq=" + that.data.orderseq,
      // url:'http://item.diandong.com/app/xcx/search-new?count=0&pricepara=undefined&drivepara=undefined&endurancepara=100,200&carTypepara=undefined&pageOffset=0&pageSize=10&orderfield=price&orderseq=desc',
      // data: datas,
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        var rList = that.data.jgListdata;
        console.log(res)
        // that.data.jgListdata = res.data.data;
        var rdata = res.data.data;

        for (var i = 0; i < rdata.length; i++) {
          rList.push(rdata[i]);
        }
        // console.log(rdata)

        if (rdata.length < that.data.pageSize) {
          // console.log("111111111")
          that.data.MoreData = false

        } else {
          // console.log("3.333333333")
          that.data.MoreData = true;
          // that.data.pageOffset = that.data.pageOffset + that.data.pageSize;

        }
        console.log("that.data.pageOffset---------------------------------------------------")
        // console.log(that.data.pageOffset)
        // console.log(that.data.pageSize)
        // console.log(that.data.pageOffset + '+' + that.data.pageSize)



        that.setData({
          jgListdata: rList,
        });
      }
    })

    setTimeout(function () {
      wx.hideLoading()
    }, 500)


  },
  headmenu: function (e) {
    //二级列表显示隐藏

    var that = this;
    if (this.data.show === e.target.dataset.index) {
      that.setData({
        show: that.data.kong,
        showmask: -1
      })
    } else {
      that.setData({
        show: e.target.dataset.index,
        showmask: 1
      })
    }
  },
  getmask: function () {
    var that = this;
    that.setData({
      show: that.data.kong,
      showmask: -1
    })
  },
  swichNav1: function (e) {
    //tab切换
    var that = this;
    var current = e.target.dataset.current;
    if (this.data.currentTab1 == current) {
      console.log("价格降序")
      that.data.orderfield = "price",
        that.data.orderseq = "desc",
        that.data.pageOffset = 0,
        that.data.page = 0,
        that.data.jgListdata = [],
        that.setData({
          currentTab1: that.data.currentkong
        })
    }
    else {
      console.log("价格升序")
      that.data.orderfield = "price",
        that.data.orderseq = "asc",
        that.data.pageOffset = 0,
        that.data.page = 0,
        that.data.jgListdata = [],
        that.setData({
          currentTab1: current
        })
    }
    that.searchId();
  },
  swichNav2: function () {
    var that = this;
    console.log("续航降序")
    that.data.currentbox = false;
    that.data.orderfield = "endurance",
      that.data.orderseq = "desc",
      that.data.pageOffset = 0,
      that.data.page = 0,
      that.data.jgListdata = [],
      that.setData({
        currentbox: that.data.currentbox
      })
    that.searchId();
  },
  swichNav3: function () {
    var that = this;
    console.log("价格降序")
    that.data.currentbox = true;
    that.data.orderfield = "price",
      that.data.orderseq = "desc",
      that.data.pageOffset = 0,
      that.data.page = 0,
      that.data.jgListdata = [],
      that.setData({
        currentbox: that.data.currentbox
      })
    that.searchId();
  },
  swichNav4: function (e) {
    //tab切换
    var that = this;
    var currents = e.target.dataset.currents;
    if (this.data.currentTab1 == currents) {
      console.log("续航降序")
      that.data.orderfield = "endurance",
        that.data.orderseq = "desc",
        that.data.pageOffset = 0,
        that.data.page = 0,
        that.data.jgListdata = [],
        that.setData({
          currentTab1: that.data.currentkong
        })
    }
    else {
      console.log("续航升序")
      that.data.orderfield = "endurance",
        that.data.orderseq = "asc",
        that.data.pageOffset = 0,
        that.data.page = 0,
        that.data.jgListdata = [],
        that.setData({
          currentTab1: currents
        })
    }
    that.searchId();
  },
  active: function (e) {
    //续航
    var that = this;
    var index = parseInt(e.currentTarget.dataset.current);
    var type = that.data.enduranceparaData[index].type;
    var items = that.data.enduranceparaData;
    if (type == 'circle') {
      //未选中时
      items[index].type = 'success';
    } else {
      items[index].type = 'circle';
    }
    // 写回经点击修改后的数组
    this.setData({
      enduranceparaData: items
    });
    // 遍历拿到已经勾选的值
    var checkedValues = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type == 'success') {
        checkedValues.push(items[i].val);
      }
    }
    wx.setStorage({
      key: "chooseenduranceparalen",
      data: checkedValues.length
    });
    console.log(checkedValues)
    that.data.xhvalData = checkedValues.join("|");
    that.searchapi()
    that.data.pageOffset = 0,
      that.data.page = 0,
      that.data.jgListdata = [],
      that.searchId();

  },
  choose: function (e) {
    //类别
    var that = this;
    var index = parseInt(e.currentTarget.dataset.current);
    var type = that.data.carTypeparaData[index].type;
    var items = that.data.carTypeparaData;
    if (type == 'circle_car') {
      //未选中时
      items[index].type = 'success_car';
    } else {
      items[index].type = 'circle_car';
    }
    // 写回经点击修改后的数组
    this.setData({
      carTypeparaData: items
    });
    // 遍历拿到已经勾选的值
    var checkedValues = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type == 'success_car') {
        checkedValues.push(items[i].val);
      }
    }
    wx.setStorage({
      key: "choosecarTypeparalen",
      data: checkedValues.length
    });
    console.log(checkedValues)
    that.data.lbvalData = checkedValues.join("|");
    that.searchapi();
    that.data.pageOffset = 0,
      that.data.page = 0,
      that.data.jgListdata = [],
      that.searchId();

  },
  activess: function (e) {
    //类型
    var that = this;

    var index = parseInt(e.currentTarget.dataset.current);
    var type = that.data.driveparaData[index].type;
    var items = that.data.driveparaData;
    if (type == 'circle') {
      //未选中时
      items[index].type = 'success';
    } else {
      items[index].type = 'circle';
    }
    // 写回经点击修改后的数组
    this.setData({
      driveparaData: items
    });
    // 遍历拿到已经勾选的值
    var checkedValues = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type == 'success') {
        checkedValues.push(items[i].val);
      }
    }
    wx.setStorage({
      key: "choosedriveparalen",
      data: checkedValues.length
    });
    that.data.lxvalData = checkedValues.join(",");
    console.log(that.data.lxvalData)
    that.searchapi();
    that.data.pageOffset = 0,
      that.data.page = 0,
      that.data.jgListdata = [],
      that.searchId();
  },
  onReachBottom: function () {
    var that = this;
    console.log('onReachBottom上拉加载---------------')
    if (that.data.MoreData == true) {

      that.searchId();
      console.log('111111111111---------')
    }


  },
  searchapi: function (e) {
    var that = this;
    if (that.data.jgvalData == '' | that.data.jgvalData == "50") {
      that.data.jgvalData = "undefined";
    };
    if (that.data.lxvalData == '') {
      that.data.lxvalData = "undefined";
    };
    if (that.data.xhvalData == '') {
      that.data.xhvalData = "undefined";
    };
    if (that.data.lbvalData == '') {
      that.data.lbvalData = "undefined";
    };

    var datas = {
      pricepara: that.data.jgvalData,
      drivepara: that.data.lxvalData,
      endurancepara: that.data.xhvalData,
      carTypepara: that.data.lbvalData,
    }
    console.log(datas)
    wx.request({
      url: app.apiHost + '/app/xcx/search-new?count=1',
      data: datas,
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
      },
      success: function (res) {
        console.log(res)
        that.setData({
          carsnumber: res.data.data.totalRows
        });
      }
    })
  },
  getsubmit: function () {
    // console.log("queding")
    var that = this;
    if (that.data.jgvalData == "undefined") {
      that.setData({
        isjg: true
      });
    } else {
      console.log("6777777777777777")
      wx.getStorage({
        key: 'choosepricepara',
        success: function (res) {
          console.log(res.data)
          that.data.choosepricepara = res.data
          that.setData({
            choosepricepara: that.data.choosepricepara,
            isjg: false
          });
        }
      })
    };
    if (that.data.lxvalData === "undefined") {
      that.setData({
        islx: true
      });
    } else {
      wx.getStorage({
        key: 'choosedriveparalen',
        success: function (res) {
          that.data.choosedriveparalen = res.data
          that.setData({
            driveparaDatalen: that.data.choosedriveparalen,
            islx: false
          });
        }
      })
    }
    if (that.data.xhvalData === "undefined") {
      that.setData({
        isxh: true
      });
    } else {
      wx.getStorage({
        key: 'chooseenduranceparalen',
        success: function (res) {
          that.data.chooseenduranceparalen = res.data
          that.setData({
            enduranceparaDatalen: that.data.chooseenduranceparalen,
            isxh: false
          });
        }
      })
    }
    if (that.data.lbvalData === "undefined") {
      that.setData({
        islb: true
      });
    } else {
      wx.getStorage({
        key: 'choosecarTypeparalen',
        success: function (res) {
          that.data.choosecarTypeparalen = res.data
          that.setData({
            choosecarTypeparalen: that.data.choosecarTypeparalen,
            islb: false
          });
        }
      })
    }
    that.data.pageOffset = 0,
      that.data.page = 0,
      that.data.jgListdata = [],
      that.searchId();
    that.setData({
      show: that.data.kong,
      showmask: -1
    })
  },
  getreset: function () {
    // console.log("buxian")
    var that = this;
    that.data.pageOffset = 0,
      that.data.page = 0,
      that.data.jgListdata = [],
      that.onReady();
    that.setData({
      show: that.data.kong,
      showmask: -1
    })
  },
  gotoSeries: function (e) {
    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../../serie/serie?pinyin=' + data.pinyin
    })
  },

});
