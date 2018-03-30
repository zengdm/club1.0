/**
 * 分享
 * 1全局分享交互规则调整：
   1.1，载入页面时，默认展开显示；
   1.2，页面向上滑动时（即向下拉数据），收起；页面向下滑动时，始终显示
   1.3，页面静止时，展开，显示3秒，3秒时间后收起
 * 
 * @author yingnan
 */
function btnshare(page) {
  var that = this;
  that.init(page);
}

btnshare.prototype = {
  
  /**
   * 初始化方法
   */
  init: function (page) {
    var that = this;
    that.page = page;
  },

  //向上滑动event.touches[0].clientY的值越来越小
  //向下滑动event.touches[0].clientY的值越来越大
  handletouchstart: function (event) {
    var that = this;
    // console.log("11111111111*--------------开始kaishi")
    // console.log(event.touches[0].clientY)
    that.data.shareclientYstart = event.touches[0].clientY

  },
  handletouchmove: function (event) {
    var that = this;
    // 清除定时任务
    clearInterval(that.interval.obj);

    var newsWidth = that.data.winWidth * 0.19;
    // console.log("11111111111*--------------过程")
    // console.log(event.touches[0].clientY)
    that.data.shareclientYmove = event.touches[0].clientY;
    if (that.data.shareclientYstart > that.data.shareclientYmove) {
      //向上滑动
      console.log("向上")
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      });
      that.animation = animation;
      // 332
      animation.translateX(0).step();
      that.setData({
        animationData: animation.export()
      })
    } else {
      //向下滑动
      console.log("向下")
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      });
      that.animation = animation;
      // 332
      animation.translateX(-newsWidth).step();
      that.setData({
        animationData: animation.export()
      })


    }
  },

  // 页面停止，静止3秒
  handletouchend: function () {
    var that = this;
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
        var newsWidth = that.data.winWidth * 0.19;
        animation.translateX(-newsWidth).step();
        that.setData({
          animationData: animation.export()
        })
      }
    }, 1000);
  },




}

module.exports.btnshare = btnshare;