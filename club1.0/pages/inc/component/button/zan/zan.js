// pages/inc/component/button/zan.js.js
// import { userApi } from '../../../../api/userApi';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 组建类型
    action: {
      type: String,
      value: 'praise',
      observer: function(newVal, oldVal) {
        // 类型容错，默认点赞-praise
        if (typeof (this.data.icons[newVal])=='undefined') {
          newVal = 'praise';
          this.setData({action: newVal});
        }
      }
    },
    // 组件宽*高
    width: {
      type: Number,
      value: 0
    },
    height: {
      type: Number,
      value:0
    },
    // 总点赞数
    value: {
      type: Number,
      value:0
    },

    // 参数
    args: {
      type: Object,
      value: { sourceid: 0, platid: 0 },
      observer: function (newVal, oldVal) {
        // 过滤有效参数
        var filters = 'sourceid,platid,rid,pid,action';
        if (newVal && typeof (newVal) == 'object') {
          newVal['action'] = this.properties.action;
          for (let k in newVal) {
            if (filters.indexOf(k) < 0) {
              delete newVal[k];
            }
          }
        }
      }
    },
    // 是否禁用点击事件
    clickable: {
      type: Boolean,
      value: true
    },
    // 已点击状态
    clicked: {
      type: Boolean,
      value: false
    },
    // 处理状态
    loading: {
      type: Boolean,
      value: false
    },
    /*** 图标相关 ***/
    icon_size: {
      type: Number,
      value: 28
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    icons: {
      // 点赞
      'praise': {
        'icon_img': getApp().imgHost + '/assets/image/1514369527-e226cbf2a01d4cf8-40w-40h.png',
        'icon_img_clicked': getApp().imgHost + '/assets/image/1514369528-5c0505c546041d14-40w-40h.png',
      },
      // 收藏
      'favorite': {
        'icon_img': getApp().imgHost + '/assets/image/1514369528-1aaaae1f5958d9b1-40w-40h.png',
        'icon_img_clicked': getApp().imgHost + '/assets/image/1514369528-6ee4473bffd31e9d-40w-40h.png',
      },
      // 回帖图标
      'replies': {
        'icon_img': getApp().imgHost + '/assets/image/1514368699-526927919e37c1d2-28w-28h.png',
        'icon_img_clicked': getApp().imgHost + '/assets/image/1514368699-526927919e37c1d2-28w-28h.png'
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getApi: function() {
      if (typeof(this.userApi)=='undefined') {
        this.userApi = getApp().userApi;
        this.userApi.page = this;
      }
      return this.userApi;
    },
    // 执行点击事件
    _clickEvent: function(e) {
      // 判断是否拥有点击事件
      if (!this.properties.clickable) {
        return false;
      }

      // 参数有效性校验
      var args = this.properties.args;
      if (args && typeof(args.sourceid)!='undefined' && typeof(args.platid)!='undefined') {
        // 调用收藏类型接口
        var res = this._getApi().addFavorite(this.properties.action, args.sourceid, args.platid, '_cb_clickEvent');

      } else {
        wx.showToast({
          title: '缺少必要传参',
          image: '/pages/images/warning.png',
        });
      }
    },

    // 事件回调方法
    _cb_clickEvent: function(res, opt) {
      if (res.code==0) {
        var title = '操作成功';
        switch (this.properties.action) {
          case 'praise':
            title = '点赞成功';
            break;
          default:
            title = res.message;
        }
        wx.showToast({
          title: title,
          image: '/pages/images/success.png',
        });
      } else {
        wx.showToast({
          // title: res.message,
          title: '已点赞',
          image: '/pages/images/warning.png',
        })
      }

      /*** 通知页面事件 ***/
      // barevent和页面模板监听时间bind:barevent对应
      var myEventOption = { bubbles: false, composed: true, capturePhase: true };
      // 组建回传参数
      res['args'] = this.properties.args;
      this.triggerEvent('contact', res, myEventOption);
    }
  }
})
