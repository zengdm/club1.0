/**
 * 微信统计接口类
 * 
 * @author fuqiang
 */

import { baseapi } from "./baseapi";

function tongjiApi(page) {
  // 继承基类
  baseapi.call(this);
  // 引入页面page类对象
  this.init(page);
}

tongjiApi.prototype = {
  apiURL: {
    // pv统计
    'points': '/trace/tongji/points'
  },
  // 允许的统计
  allowPoints: ['points','pv','shares','agree','replies'],
  /**
   * pv统计
   */
  addPv: function (sourceid, platid) {
    this.addPoints(sourceid, platid, 'pv');
  },
  /**
     * 点赞统计
     */
  addAgree: function (sourceid, platid) {
    this.addPoints(sourceid, platid, 'agree');
  },
  /**
     * pv统计
     */
  addShares: function (sourceid, platid) {
    this.addPoints(sourceid, platid, 'shares');
  },

  /**
   * 评论统计
   */
  addReplies: function (sourceid, platid) {
    this.addPoints(sourceid, platid, 'replies');
  },

  // 添加统计
  addPoints: function(sourceid, platid, action) {
    if (sourceid > 0) {
      var args = { sourceid: sourceid, platid: platid, action: action };
      this.getURLData(this.apiURL['points'], args, 'setGlobalPoint');
    } else {
      this.showError('sourceid不能为空');
    }
  },
  // 设置全局统计值
  setGlobalPoint: function(res, opt) {
    var pointsType = getApp().pointsType;
    if (res.code==0 && this.contains(pointsType, opt.action)) {
      getApp().appendPoints.push(opt);
    }
  },

  /**
   * 获取页面统计传值
   */
  getGlobalPoint: function() {
    var res = [];
    var i = 0;
    var points
    while (getApp().appendPoints.length) {
      res.push(getApp().appendPoints.pop());
      i++;
    }
    return res;
  }

}

module.exports.tongjiApi = tongjiApi;