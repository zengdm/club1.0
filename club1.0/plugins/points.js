/**
 * 点击量统计接口
 * 
 * @author fuqiang
 */
function points(page) {
  var that = this;
  that.init(page);
}

points.prototype = {
  // 统计量初始字段
  points: getApp().points,

  // 构造方法
  init: function (page) {
    var that = this;
    that.page = page;

  },

  /**
   * 获取点击量
   */
  getPoints: function(tag) {
    if (tag) {
      if (typeof(getApp().points[tag])!='undefined') {
        return getApp().points[tag];
      } else {
        return 0;
      }
    } else {
      return getApp().points;
    }
  },

  /**
   * 清除点击量
   */
  clearPoints: function(tag) {
    var that = this;
    if (tag) {
      if (typeof (that.points[tag]) != 'undefined') {
        that.points[tag] = 0;
      }
    } else {
      for (let k in that.points) {
        that.points[k] = 0;
      }
    }
    that.setPoints(that.points);
  },

  /**
   * 新增统计
   */
  addPoints: function (tag) {
    var that = this;
    if (typeof (that.points[tag]) != 'undefined') {
      that.points[tag] = that.points[tag] + 1;
    }

    // 设置全局点击量
    that.setPoints(that.points);
  },

  /**
   * 统计减一
   */
  downPoints: function (tag) {
    var that = this;
    if (typeof (that.points[tag]) != 'undefined') {
      that.points[tag] = that.points[tag] - 1;
    }

    // 设置全局点击量
    that.setPoints(that.points);
  },
  /**
   * 设置点击量
   */
  setPoints: function(points) {
    var that = this;
    if (points) {
      for (let k in points) {
        getApp().points[k] = points[k];
      }
    }
    return getApp().points;
  },


}

module.exports.points = points;