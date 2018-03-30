import xapi from "../../../utils/xapi"

var app = getApp();
Page({
  data: {
    toView: '',
    winHeight: '',
    winWidth: '',
    pinyin:{},
    // 当前城市
    city:{},
  },
  // searchTag: function () {
  //   wx.navigateTo({
  //     url: '../searchWindow/searchWindow'
  //   })
  // },

  
  onLoad: function (options) {
    var that = this;
    var res = wx.getSystemInfoSync();

    var pinyin = options.pinyin;

    that.data.pinyin = options.pinyin;
    // console.log(that.data.pinyin);

    that.setData({
      winHeight: res.windowHeight,
      winWidth: res.windowWidth,
    });
    
  },

  setCity: function() {
    var that = this;
    that.setData({
      cityId: that.data.city.cityId,
      cityName: that.data.city.cityName
    });
  },

  onReady: function () {
    var that = this;
    wx.getStorage({
      //获取当前城市
        key: 'city',
        success: function (getres) {
          that.data.city = getres.data;
          that.setCity();
          // that.setData({//逻辑层到视图层
          //   cityId: getres.data.cityId,
          //   cityName: getres.data.cityName
          // });
        }
      })

    var requestUrl = app.apiHost + "/app/xcx/city-list";
   
    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      var rdata = res.data.data;
      // console.log(rdata);

      that.data.cityLetter = res.data.data;

      that.data.letterList = that.reCombine(rdata);
      that.setData({//逻辑层到视图层
        cityLetter: that.data.cityLetter,
        letterList: that.data.letterList,
      });
    })
  },
  cityClick: function (event) {
    var that = this;

    // var pinyin = that.data.pinyin
    console.log(event.currentTarget);
    var cityName = event.currentTarget.dataset.cityname;
    var cityId = event.currentTarget.dataset.cityid;
    that.data.city = {cityId:cityId, cityName:cityName};
    that.setCity();

    wx.setStorage({
      key: 'city',
      data: {
        cityId: cityId,
        cityName: cityName
      }
    })
    wx.navigateBack()

  },


  reCombine: function (arr) {
    var res = [], obj = {}, index = 0;
    arr.forEach(function (item) {
      
        // console.log(item.zimu,item);
        if (obj.hasOwnProperty(item.zimu)) {
          res[obj[item.zimu]].items.push(item);
        }
        else {
          obj[item.zimu] = index++;//记录索引 0 1 2
          res.push(
            {
              flag: item.zimu,
              items: [item]
            }
          );
        }
      
      
    });
    return res;
  },

  clickLetter: function (event) {
    var letter = event.target.dataset.letter;
    var that = this;
    console.log(that.data.currentLetter);

    if (that.data.currentLetter === event.target.dataset.current) {
      return false;
    }
    else {
      that.setData({
        currentLetter: event.target.dataset.current
      })
    }


    that.setData({
      toView: letter
    })
  },
 
});

