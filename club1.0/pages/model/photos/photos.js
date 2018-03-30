import xapi from "../../../utils/xapi"
var app = getApp();

Page({
  data: {
    currentTab: 0,
    piccxid: {},
    pzid: {},
    imgArr: [],
    pictureArr: [],
    swiperCurrent: 0,
    imgIndex: '',
    currentLetter: '',
    imgTab: 0,
    picture: {},
    pageSize: 10,
    page: 1,
    loadingLock: 0,
    tinyIndex: '',
  },
  Rightmost: function (e) {
    var that = this;
    that.loadPageImg(that.data.page);
  },


  onLoad: function (options) {
    var that = this;
    that.setData({
      piccxid: options.piccxid,
      pzid: options.pzid
    });
    console.log(options);
  },

  onReady: function () {
    var that = this;
    that.loadPageImg(that.data.page);
    // wx.setNavigationBarTitle({
    //   title: rdata.data.name
    // })
  },

  picClick: function (e) {

    var that = this;
    // console.log(1111111111111111111);
    console.log(e.target.dataset.current);
    that.data.tinyIndex = 0
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    }
    else {
      that.setData({
        currentTab: e.target.dataset.current,
        imgIndex: that.data.tinyIndex,
      })
    }
  },
  bindPic: function (e) {
    var that = this;
    console.log(e)
    that.data.tinyIndex = 0;
    that.setData({
      currentTab: e.detail.current,
      imgIndex: that.data.tinyIndex,
    });
  },

  swiperChange: function (e) {
    var that = this
    that.data.current = e.detail.current;
    // console.log('swiper.swper----' + e.detail.current);
    that.data.tinyIndex = e.detail.current;
    if (this.data.imgTab === that.data.tinyIndex) {
      return false;
    }
    else {
      that.setData({
        imgTab: that.data.tinyIndex
      })
    }
    console.log(that.data.current);
    console.log(that.data.current);
    console.log(that.data.pageSize);
    console.log(that.data.page);

    if (that.data.current == (that.data.pageSize - 1) * (that.data.page - 1) ){
      that.loadPageImg(that.data.page);
    }

    this.setData({
      swiperCurrent: that.data.tinyIndex,
      imgIndex: that.data.tinyIndex,
    });
  },

  littleClick: function (e) {
    // console.log(e)
    var that = this;
    console.log('小小自定义---' + e.target.dataset.index)
    that.data.tinyIndex = e.target.dataset.index;
    console.log(that.data.tinyIndex);

    if (this.data.imgTab === that.data.tinyIndex) {
      return false;
    }
    else {
      that.setData({
        imgTab: that.data.tinyIndex
      })
    }

    this.setData({
      imgIndex: that.data.tinyIndex,
    });
  },

  previewImage: function (e) {
    var that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.imgArr // 需要预览的图片http链接列表  
    })

  },

  loadPageImg: function (page) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var data = that.data.piccxid;
    var pzidData = that.data.pzid;
    var pagePicture = {};
    var pageOffset = (page - 1) * that.data.pageSize;
    console.log(data);
    if (data) {
      var requestUrl = app.apiHost + "/app/xcx/photo-list?cxid=" + data;
      // var requestUrl = app.apiHost + "/app/xcx/photo-list?cxid=433";
    } else {
      var requestUrl = app.apiHost + "/app/xcx/photo-list?pzid=" + pzidData;
      // var requestUrl = app.apiHost + "/app/xcx/photo-list?pzid=1048";
    }
    requestUrl += "&pageOffset=" + pageOffset + "&pageSize=" + that.data.pageSize;
    if (that.data.loadingLock == 0) {
      that.data.loadingLock = 1;
      xapi.request({
        url: requestUrl,
        data: {},
        method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      }).then(function (res) {
        // var rdata = res.data;
        pagePicture = res.data.data;
        

        var tempImgArr = [];
        for (var pk = 0; pk < pagePicture.length; pk++) {
          if (page == 1) {
            that.data.pictureArr[pk] = pagePicture[pk];
          }
          for (var ik = 0; ik < pagePicture[pk]['photo_data'].length; ik++) {
            if (page != 1) {
              that.data.pictureArr[pk]['photo_data'].push(pagePicture[pk]['photo_data'][ik]);
            }
            that.data.imgArr.push(pagePicture[pk]['photo_data'][ik]['img']);
            tempImgArr.push(pagePicture[pk]['photo_data'][ik]['img']);
          }
        }

        if (tempImgArr.length == 0) {
          return false;
        }
        console.log(that.data.pictureArr)

        that.setData({//逻辑层到视图层
          picture: that.data.pictureArr,
          imgArr: that.data.imgArr,
          pagePicture: pagePicture
        });
        that.data.loadingLock = 0;
        that.data.page += 1;
      })
    }

    setTimeout(function () {
      wx.hideLoading()
    }, 500)

  }

})