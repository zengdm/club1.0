// pages/forum/publish/inc/component/tags/tags.js
import { forumApi } from '../../../../../api/forumApi.js';
var forumcontrols = require('../forum-controls');
Component({
  behaviors: [forumcontrols],
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
  },


  created: function () {
    console.log('111111111111');
    var that = this;
    that.forumApi = new forumApi(that);
    that.forumApi.tagsList('_cb_tagsList');
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _onBackBtn: function (e) {
      console.log("22222222222222222222222222")
      //关闭标签弹层
      var that = this;
      that._callPage('_onBackBtn', e);
    },



    //热门标签列表
    _cb_tagsList: function (res, opt) {
      var that = this;
      console.log(res.data);
      if (res.code == 0) {
        // 全局变量赋值
        that.data.tagsList = res.data;
        that.setData({
          tagsList: that.data.tagsList
        })

      }
    },


    //点击标签
    _tagsTap: function (e) {
      var that = this;
      console.log(e);
      console.log("111111112222222222222222221111111111")
      that._callPage('tagchange', e);
    },



    _bindFormSubmit: function (e) {
      var that = this;
      console.log("1133333333333331111")
      that._callPage('_bindFormSubmit', e);


      setTimeout(function () {
        that.setData({
          tvalue: ''
        });
      }, 500);

    },




  }
})
