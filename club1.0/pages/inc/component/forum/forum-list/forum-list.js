// pages/forum/inc/component/forum-list/forum-list.js
// var forumcontrols = require('../../../publish/inc/component/forum-controls');
import { userApi } from '../../../../api/userApi';
/**
 * 帖子列表公共模板
 * 
 */

Component({
  // 组件支持多slot
  options: {
    // multipleSlots: false // 在组件定义时的选项中启用多slot支持
  },
  /**forfo
   * 组件的属性列表
   */
  properties: {
    points: {
      type: Object,
      value: [],
      observer: function (newVal, oldVal) {
        this._pointsChange(newVal);
      }
    },
    // 帖子列表数据
    tlist: {
      type: Object,  // 字段类型
      value: [0, 1],
      // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
      observer: function (newVal, oldVal) {

        if (typeof (newVal.list)!='undefined' && newVal.list.length > 0) {
          // console.log('+++++++++++++++++++++++++++++++++');
          // console.log(newVal.list);
          // 需检验收藏文章id/用户是否已关注
          this.data.favorites = { sourceIds: [], followIds: [] };
          for (let k in newVal['list']) {
            var digest = typeof (newVal['list'][k]['digest']) != 'undefined' ? newVal['list'][k]['digest'] : 0;
            var sourceid = newVal['list'][k]['sourceid'];
            var platid = newVal['list'][k]['platid'];
            var favKey = sourceid + '_' + platid;
            // 收藏状态
            if (typeof (this.data.menus.favorite[favKey]) == 'undefined') {
              this.data.menus.favorite[favKey] = 0;
              // 记录判断需是否收藏的id
              this.data.favorites.sourceIds.push(favKey);
            }
            // 精华
            if (typeof (this.data.menus.digest[favKey]) == 'undefined') {
              this.data.menus.digest[favKey] = digest;
            }
            // 关注
            var authorid = newVal['list'][k]['authorid'];
            if (typeof (this.data.menus.follow[authorid + '_0']) == 'undefined') {
              this.data.menus.follow[authorid + '_0'] = 1;
              // 记录判断需关注的用户id
              if (authorid > 0) {
                this.data.favorites.followIds.push(authorid);
              }
            }
          }
        }
        
        this._hasFavoretes();
        this._hasFollows();

        this.setData({ 'menus': this.data.menus});
      }
    },
    index: {
      type:String,
      defalut:'',
    },
    // 登录用户信息(判断手机号登录窗)
    loginInfo: {
      type: Object,
      value: false,
      observer: function (newVal, oldVal) {
        if (newVal && typeof(newVal.powers)!='undefined') {
          if (!this.data.isDigest) {
            this.data.isDigest = newVal.powers.indexOf('jinghua') > -1 ? 1 : 0;
            this.setData({'isDigest': this.data.isDigest});
          }
        }
      }
    },

    // 是否为网站编辑(拥有[推荐精华]权限)
    isEditor: {
      type: Boolean,
      value: false
    },
    isPraise: {
      type: Object,
      value: {}
    },
    // 是否显示菜单
    menuShow: {
      type: Boolean,
      value: true
    },
    // 是否显示首页
    goIndex: {
      type: Boolean,
      value: false
    },
    // 是否显示收藏
    isFav: {
      type: Boolean,
      value: true
    },
    // 是否显示关注
    isFollow: {
      type: Boolean,
      value: true
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 弾层收藏按钮操作
    menus: { favorite: {}, digest: {}, follow: {}, praise:{} },
    tips: {},
    // 弾层定时任务
    tipsInterval: null,
    favorites: {
      // 需检测的收藏文章sourceid_platid是否已收藏
      sourceIds: [],
      // 需检测的用户id是否已关注
      followIds: []
    },
    // 登录弾层（默认隐藏）
    loginShow: false
  },
  // 卡片底部弹层显示

  ready: function () {

  },
  //组件生命周期函数，在组件实例进入页面节点树时执行，注意此时不能调用 setData
  created: function () {
    var that = this;
    that.userApi = new userApi(that);

  },


  /**
   * 组件的方法列表
   */
  methods: {

    /**
 *  页面方法传值调用
 */
    _callPage: function (pageEvent, event) {
      /*** 触发事件的选项 ***/
      // bubbles:事件是否冒泡
      // composed:事件是否可以穿越组件边界，为false时，事件将只能在引用组件的节点树上触发，不进入其他任何组件内部
      // capturePhase:事件是否拥有捕获阶段
      var myEventOption = { bubbles: false, composed: true, capturePhase: true };
      // barevent和页面模板监听时间bind:barevent对应
      this.triggerEvent(pageEvent, event, myEventOption);
    },
    // 显示登录弾层
    loginTips: function (isshow) {
      var that = this;
      that.data.loginShow = isshow;
      that.setData({ loginShow: that.data.loginShow });
    },

    /**
     * 资讯详情跳转
     */
    itemClick: function (e) {
        //详情页
        var that = this;
        // 弾层隐藏
        that._hideTips();
        // 页面参数
        var args = {
            'sourceid': e.currentTarget.dataset.sourceid,
            'platid': e.currentTarget.dataset.platid,
            'ctype': e.currentTarget.dataset.ctype
        };
        // 页面跳转
        wx.navigateTo({
            url: '/pages/forum/detail/detail?platid=' + args.platid + '&sourceid=' + args.sourceid + '&ctype=' + args.ctype
        });
        return true;
    },

    _personal: function (e) {
      //跳转个人主页
      var that = this;
      var authorid = e.currentTarget.dataset.id;
      // 弾层隐藏
      that._hideTips();
      // 页面跳转
      if (authorid > 0) {
        wx.navigateTo({
          url: '/pages/user/personal/personal?authorid=' + authorid
        })
      }

    },
    _onUpmore: function (e) {
      //卡片 弹层统一隐藏
      var that = this;
      var data = {
        sourceid: e.currentTarget.dataset.sourceid,
        platid: e.currentTarget.dataset.platid,
        key: e.currentTarget.dataset.key,
      };

      // 显示卡片底部弾层
      if (typeof (that.data.tips[data.key]) && that.data.tips[data.key]>0) {
        that._hideTips(data.key);
      } else {
        that._showTips(data.key);
      }
    },

    /**
     * 显示卡片底部菜单
     */
    _showTips: function (nodeIndex) {
      var that = this;
      that.data.tips = {};
      that.data.tips[nodeIndex] = 1;
      that.setData({ tips: that.data.tips });
    },
    /**
     * 隐藏卡片底部菜单
     */
    _hideTips: function () {
      var that = this;
      that.data.tips = {};

      that.setData({ tips: {} });
    },

    /**
     * 卡片底部 - [评论]点击事件
     */
    _replyEvent: function(e) {
      var that = this;
      var data = {
        sourceid: e.currentTarget.dataset.sourceid,
        platid: e.currentTarget.dataset.platid,
        ctype: e.currentTarget.dataset.ctype
      };

      wx.navigateTo({
        url: '/pages/forum/detail/detail?sourceid=' + data.sourceid + '&platid=' + data.platid + '&ctype=' + data.ctype +'&scrollView=replylist',
      })
    },

    /**
     * 点赞事件监听
     */
    _onPraise: function (e) {
      var res = e.detail;
      if (typeof(res.code)!='undefined') {
        if (res.code == 0) {
          // 点赞成功
          var points = [];
          if (res.args.action=='praise') {
            res.args['action'] = 'agree';
          }
          points.push(res.args);
          this._pointsChange(points);
        }
      }
      return false;
      //卡片点赞
      var that = this;
      // 登录状态检测
      var loginStatus = that.userApi.checkLogin();
      if (!loginStatus.status || !loginStatus.promission) {
        if (loginStatus.promission) {
          wx.showToast({
            title: '请登录',
            image: '/pages/images/warning.png',
          });
        }
        return false;
      }

      // 处理加载状态
      wx.hideLoading();
      wx.showLoading({
        title: '处理中',
      });
      var args = {
        sourceid: e.currentTarget.dataset.sourceid,
        platid: e.currentTarget.dataset.platid,
        ctype: e.currentTarget.dataset.ctype
      }
      that.userApi.addFavorite('praise', args.sourceid, args.platid, 'cb_onPraise');
    },

    /**
     * 点赞回调
     */
    cb_onPraise: function(res, opt) {
      wx.hideLoading();
      if (res.code==0) {
        wx.showToast({
          title: '点赞成功',
        });
      } else {
        wx.showToast({
          title: '已点赞',
        })
      }
    },

    _bindfav: function (e) {
      var that = this;

      // 登录信息检测
      var loginStatus = that.userApi.checkLogin();
      if (!loginStatus || !loginStatus.status) {
        // 已授权显示登录弹窗
        if (loginStatus.promission) {
          that.loginTips(1);
        }
        return false;
      }

      var data = e.currentTarget.dataset;
      // 节点key(for-index)
      var nodeIndex = data.key;
      if (typeof (data.opt) != 'undefined') {
        var args = { nodeIndex: nodeIndex, opt: data.opt, sourceid: data.sourceid, platid: data.platid };
        switch (data.opt) {
          case 'favorite':
            // 收藏
            that.userApi.addFavorite('article', data.sourceid, data.platid, '_cb_favorite', args);
            break;
          case 'removefavorite':
            // 取消收藏
            that.userApi.removeFavorite('article', data.sourceid, data.platid, '_cb_favorite', args);
            break;
          case 'follow':
            // 关注
            that.userApi.addFollow(data.authorid, '_cb_favorite', args);
            break;
          case 'removefollow':
            // 取消关注
            that.userApi.removeFollow(data.authorid, '_cb_favorite', args);
            break;
          case 'digest':
            // 设置精华
            that.userApi.addDigest(data.sourceid, data.platid, '_cb_favorite', args);
            break;
          case 'removedigest':
            // 取消精华
            that.userApi.removeDigest(data.sourceid, data.platid, '_cb_favorite', args);
            break;
        }
      }

      // 200ms自动关闭弾层
      clearInterval(that.data.tipsInterval);
      that.data.tipsInterval = setInterval(function () {
        that._hideTips();
        clearInterval(that.data.tipsInterval);
      }, 100);
    },

    _cb_favorite: function (res, opt) {
      var that = this;
      // 菜单名称
      var menu = '';
      // 收藏状态 0:不显示菜单  1:没有收藏   2:已收藏
      var status = 1;
      if (res.code == 0 || res.code == 200) {
        var message = '操作成功';
        switch (opt.opt) {
          case 'favorite':
            message = '收藏成功';
            that._setMenus('favorite', opt.sourceid, opt.platid, 1);
            break;
          case 'removefavorite':
            message = '已取消';
            that._setMenus('favorite', opt.sourceid, opt.platid, 0);
            break;
          case 'digest':
            message = '推荐成功';
            that._setMenus('digest', opt.sourceid, opt.platid, 1);
            break;
          case 'removedigest':
            message = '取消成功';
            that._setMenus('digest', opt.sourceid, opt.platid, 0);
            break;
          case 'follow':
            message = '已关注';
            that._setMenus('follow', opt.follow_id, 0, 1);
            break;
          case 'removefollow':
            message = '取消成功';
            that._setMenus('follow', opt.follow_id, 0, 0);
            break;
        }
        wx.showToast({
          title: message,
          image: '/pages/images/success.png',
        })
      } else {
        wx.showToast({
          title: typeof (res.message) != 'undefined' ? res.message : '请求异常',
          image: '/pages/images/warning.png'
        });
      }
      // 隐藏卡片底部弾层
      that._hideTips();
    },

    /**
     * 判断手否已收藏
     */
    _hasFavoretes: function () {
      if (this.data.favorites.sourceIds.length > 0) {
        this.userApi.hasFavorites('article', this.data.favorites.sourceIds, '_cb_hasFavorites');
      }
    },

    _hasFollows: function () {
      if (this.data.favorites.followIds.length > 0) {
        this.userApi.hasFollows(this.data.favorites.followIds, '_cb_hasFollows');
      }
    },

    _cb_hasFollows: function (res, opt) {
      if (res.code == 0) {
        for (let sourceid in res.data) {
          if (typeof (this.data.menus.follow[sourceid + '_0']) != 'undefined') {
            this.data.menus.follow[sourceid + '_0'] = res.data[sourceid];
          }
        }
      }
      // 清除已查询数据
      this.data.favorites.followIds = [];

      this.setData({
        menus: this.data.menus
      })
    },

    _cb_hasFavorites: function (res, opt) {
      if (res.code == 0) {
        for (let sourceid in res.data) {
          if (typeof (this.data.menus.favorite[sourceid]) != 'undefined') {
            this.data.menus.favorite[sourceid] = res.data[sourceid];
          }
        }
      }
      // 清除已查询数据
      this.data.favorites.sourceIds = [];

      this.setData({
        menus: this.data.menus
      })
    },

    /**
     * 回到首页
     */
    _goIndex: function () {
      wx.switchTab({
        url: '/tabBar/forum/forum',
      })
    },


    /**
     * 设置菜单状态
     */
    _setMenus: function (ftype, sourceid, platid, status) {
      var that = this;
      var key = sourceid + '_' + platid;
      if (typeof (that.data.menus[ftype]) != 'undefined' && typeof (that.data.menus[ftype][key]) != 'undefined') {
        // 设置模板变量
        that.data.menus[ftype][key] = status;
        that.setData({ 'menus': that.data.menus });
      }
    },
    // 统计值变动
    _pointsChange: function (points) {
      if (points.length > 0) {
        var keys = '';
        for (let a in points) {
          // 除pv变更外，其它变更同时更新至列表feed流
          if (!keys && points['action'] != 'pv') {
            keys = points[a].sourceid + '_' + points[a].platid;
          }
        }
        if (keys) {
          var pk, sourceid, platid;
          for (let k in this.properties.tlist.list) {
            sourceid = this.properties.tlist.list[k]['sourceid'];
            platid = this.properties.tlist.list[k]['platid'];
            pk = sourceid + '_' + platid;
            if (pk == keys && typeof (this.properties.tlist.list[k]['points']) != 'undefined') {
              for (let j in points) {
                if (this.properties.tlist.list[k]['points'][points[j]['action']]) {
                  this.properties.tlist.list[k]['points'][points[j]['action']]++;
                }
              }
            }
          }
          this.setData({ tlist: this.properties.tlist })
        }

      }
    }
  }
})
