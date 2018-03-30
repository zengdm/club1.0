function share(page){
  var that = this;
  that.init(page);
}

share.prototype = {
  // 定时任务
  interval: { obj: '', num: 0 },
  // 分享属性
  shares: { title: '', path: '', imageUrl:''},

  // 初始化方法
  init: function (page) {
    var that = this;
    that.page = page;
  },

  /**
   * 设置分享内容
   */
  setShare: function (title, path, imageUrl) {
    var that = this;
    that.shares.title = title;
    that.shares.path = path;
    that.shares.imageUrl = imageUrl;
  },

  /**
   * 获取分享内容
   */
  getShare: function() {
    var that = this;
    return {
      title: that.shares.title,
      path: that.shares.path,
      imageUrl: that.shares.imageUrl,
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },

  showShare:function(){
    var that = this;
    // console.log('showShare showShare showShare');
    clearInterval(that.interval.obj);
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    that.animation = animation;
    // 332
    animation.translateX(0).step();
    that.page.setData({
      animationData: animation.export()
    })
  },

  hideShare:function(){
    var that = this;
    // console.log('hideShare hideShare hideShare');
    clearInterval(that.interval.obj);
    var newsWidth = that.page.data.winWidth * 0.19;
    // console.log(newsWidth);
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    that.animation = animation;
    // 332
    animation.translateX(-newsWidth).step();
    that.page.setData({
      animationData: animation.export()
    })
  },

  

  // 页面停止，静止3秒
  handletouchend: function () {
    var that = this;
    // 清除定时任务
    that.interval.num = 0;
    clearInterval(that.interval.obj);

    that.interval.obj = setInterval(function () {
      that.interval.num++;
      console.log("end seconds:" + that.interval.num);
      if (that.interval.num > 2) {
        that.interval.num = 0;
        clearInterval(that.interval.obj);

        // 隐藏分享
        var animation = wx.createAnimation({
          duration: 300,
          timingFunction: "linear",
          delay: 0
        });
        that.animation = animation;
        // 332
        var newsWidth = that.page.data.winWidth * 0.19;
        animation.translateX(-newsWidth).step();
        that.page.setData({
          animationData: animation.export()
        })
      }
    }, 1000);
  },



}

module.exports.share = share;