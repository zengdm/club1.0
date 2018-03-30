// pages/forum/inc/component/detail-footer/detail-reply.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    commentShow: true,
    showCollet: false,
    btnColor: true,

  },

  /**
   * 组件的方法列表
   */
  methods: {

    textBind: function (e) {
      var that = this;

      that.setData({
        showCollet: true,
        commentShow: false
      })
    },

    infoMain: function () {
      var that = this;
      that.setData({
        showCollet: false,
        commentShow: true
      })
    },

    bindinput: function (e) {
      var that = this;
      if (e.detail.value == '') {
        that.setData({
          btnColor: true
        });
      } else {
        that.setData({
          btnColor: false
        });
      }
    },

    formSubmit: function (e) {
      var that = this;
      if (e.detail.value.input == '') {
        wx.showToast({
          title: '',
          image: '/pages/images/warning.png'
        });
        return false;
      } else {
        that.setData({
          commentShow: true,
          showCollet: false,
        })
      }

    },


  }
})
