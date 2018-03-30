import { SelectInterval } from '../../../../plugins/selectInterval';
import util from "../../../../utils/util"
var app = getApp();
Page({
  data: {
    driveparaData: {},
    priceparaData: {},
    enduranceparaData: {},
    carTypeparaData: {},
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    jgvalData: '',
    xhvalData: '',
    lxvalData: '',
    lbvalData: '',
    ztvalData: '',
    cityIdData: '1101',
    carsnumber: '',
    search_id: '',
    isTo: false,
    kong: -1,
    chooseData: '',
    totalRowsData:'',

  },
  js_touchstart(e) {
    this.selectInterval.move(e.changedTouches[0].x, e.changedTouches[0].y);
    // console.log("滑动开始")
  },
  js_touchmove(e) {
    this.selectInterval.meter(e.changedTouches[0].x);
    // console.log("滑动进行中")
  },
  js_touchend(e) {
    var that = this;
    that.selectInterval.texthints((min, max) => {
      if (max == null) {
        max = 99999;
      }
      // console.log(min, max);
      that.data.jgvalData = min + ',' + max;

      that.searchapi()
      that.data.isTo = true;
      // console.log(that.data.isTo)
    });
  },

  onLoad: function () {
    var that = this;
    that.ul = new util(that);
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.selectInterval = new SelectInterval({
      canvasId: 'canvas',
      canvasHeight: 155,
      Xaxis: { left:30, right: 315 },
      scale: [0, 10, 20, 30, 40, 50, 60],
      Yaxis: [90, 2],
      bothEndsNear: 60,
      // decimalPoint:10,
      // rightSliderStop:true,
      showTitle: {
        name: '万',
        size: 17,
        positionX: 100,
        positionY: 32
      },
      scaleIn: {
        name: '',
        size: 18,
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
  },
  onReady: function () {
    var that = this;
    var path = '/app/xcx/search';
    that.getCacheData(path, 'backChoose');
    // that.save();
  },
  reset: function () {
    //重置
    var that = this;
    that.selectInterval = new SelectInterval({
      canvasId: 'canvas',
      canvasHeight: 155,
      Xaxis: { left: 30, right: 315 },
      scale: [0, 10, 20, 30, 40, 50, 60],
      Yaxis: [90, 2],
      bothEndsNear:60,
      // decimalPoint:10,
      // rightSliderStop:true,
      showTitle: {
        name: '万',
        size: 17,
        positionX: 100,
        positionY: 32
      },
      scaleIn: {
        name: '',
        size: 18,
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
    var path = '/app/xcx/search';
    that.getCacheData(path, 'backChoose');
  },
  backChoose: function (res) {
    var that = this;
    
    that.data.driveparaData = res.drivepara || res.data.drivepara;
    that.data.priceparaData = res.pricepara || res.data.pricepara;
    that.data.enduranceparaData = res.endurancepara || res.data.endurancepara;
    that.data.carTypeparaData = res.carTypepara || res.data.carTypepara;
    that.data.carsnumber = 0;
    if (res.count || res.data.count) {
      that.data.carsnumber = res.count || res.data.count;
    }
    that.setData({//逻辑层到视图层
      driveparaData: that.data.driveparaData,
      priceparaData: that.data.priceparaData,
      enduranceparaData: that.data.enduranceparaData,
      carTypeparaData: that.data.carTypeparaData,
      carsnumber: that.data.carsnumber,
    });
    wx.setStorage({
      key: "choosedrivepara",
      data: that.data.driveparaData
    });
    wx.setStorage({
      key: "chooseendurancepara",
      data: that.data.enduranceparaData
    });
    wx.setStorage({
      key: "choosecarTypepara",
      data: that.data.carTypeparaData
    });
  },
  swichNav: function (e) {
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
    wx.setStorage({
      key: "choosedrivepara",
      data: items
    })
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
    // console.log(checkedValues.length)
    that.data.lxvalData = checkedValues.join(",");
    // console.log(that.data.lxvalData)
    that.searchapi()
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
    wx.setStorage({
      key: "chooseendurancepara",
      data: items
    })
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
    // console.log(checkedValues)
    that.data.xhvalData = checkedValues.join("|");
    that.searchapi()
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
    wx.setStorage({
      key: "choosecarTypepara",
      data: items
    })
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
    that.data.lbvalData = checkedValues.join(",");
    that.searchapi()
  },
  searchapi: function (e) {
    var that = this;
    if (that.data.jgvalData == '') {
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
      count: 1,
      pricepara: that.data.jgvalData,
      drivepara: that.data.lxvalData,
      endurancepara: that.data.xhvalData,
      carTypepara: that.data.lbvalData,
    };
    that.data.chooseData = datas;
    // console.log(datas)
    wx.request({
      url: app.apiHost + '/app/xcx/search-new',
      data: datas,
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
      },
      success: function (res) {
        // console.log(datas)
        // console.log(res)
        that.data.carsnumber = res.data.data.totalRows;
        // console.log(res.data.data.totalRows);
        // that.data.totalRowsData = res.data.data.totalRows;
       


        // if (that.data.totalRowsData == 0) {
        //   that.setData({//逻辑层到视图层
        //     btnforbid: 0,
        //   });
        // }else{
        //   that.setData({//逻辑层到视图层
        //     btnforbid:-1,
        //   });
        // }

        that.setData({//逻辑层到视图层
          carsnumber: that.data.carsnumber,
        });
      }
    })
  },
  // 消失
  result: function () {
    var that = this;
    if (that.data.jgvalData == '') {
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
    
    if (that.data.carsnumber > 0) {
      // that.setData({//逻辑层到视图层
      //   btnforbid: 0,
      // });
      // that.setData({//逻辑层到视图层
      //   btnforbid: -1,
      // });
      wx.redirectTo({
        url: '../list/list?pricepara=' + that.data.jgvalData +
        '&drivepara=' + that.data.lxvalData +
        '&endurancepara=' + that.data.xhvalData +
        '&carTypepara=' + that.data.lbvalData +
        '&carsnumber=' + that.data.carsnumber,
      })
    }
    
  },

});
