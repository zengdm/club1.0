// pages/forum/publish/inc/component/bar/forum-bar.js
var forumcontrols = require('../forum-controls');
Component({
  behaviors: [forumcontrols],
  // 关联的目标节点应为祖先节点
  relations: {
    '../form/forum-form': {
      type: 'parent', // 关联的目标节点应为父节点
      linked: function (target) {
        // 每次被插入到custom-ul时执行，target是custom-ul节点实例对象，触发在attached生命周期之后
      },
      linkChanged: function (target) {
        // 每次被移动后执行，target是custom-ul节点实例对象，触发在moved生命周期之后
      },
      unlinked: function (target) {
        // 每次被移除时执行，target是custom-ul节点实例对象，触发在detached生命周期之后
      }
    },
    '../bar/forum-image': {
      type: 'child', // 关联的目标节点应为子节点
      linked: function (target) {
        // 每次有custom-li被插入时执行，target是该节点实例对象，触发在该节点attached生命周期之后
      },
      linkChanged: function (target) {
        // 每次有custom-li被移动后执行，target是该节点实例对象，触发在该节点moved生命周期之后
      },
      unlinked: function (target) {
        // 每次有custom-li被移除时执行，target是该节点实例对象，触发在该节点detached生命周期之后
      }
    },
    '../bar/forum-text': {
      type: 'child', // 关联的目标节点应为子节点
      linked: function (target) {
        // 每次有custom-li被插入时执行，target是该节点实例对象，触发在该节点attached生命周期之后
      },
      linkChanged: function (target) {
        // 每次有custom-li被移动后执行，target是该节点实例对象，触发在该节点moved生命周期之后
      },
      unlinked: function (target) {
        // 每次有custom-li被移除时执行，target是该节点实例对象，触发在该节点detached生命周期之后
      }
    }
  },
  // 在组件定义时的选项中启用多slot支持
  options: {
    multipleSlots: true
  },

  /**
   * 组件的属性列表
   */
  properties: {
    content: {
      type:Object
    },
    id: {
      type:Number
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
    // 背景颜色
    bgcolor: {
      normal: '',
      longpress: ''
    },
    // 状态
    opt: 'normal',
    // 移动状态判断
    move: {
      longpress: false,

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 设置工具栏组件模板数据
    _setBarData: function () {
      var that = this;
      that.setData({
        bgcolor: that.data.bgcolor,
        opt: that.data.opt
      });
    },
    /**
     * 长按触发事件
     * 
     */
    _onLongPress: function (e) {
      console.log('component bar long press');
      console.log(e);
      var that = this;
      that.data.move.longpress = true;

      that.data.opt = 'longpress';
      that._setBarData();
    },
    /**
     * 触发拖拽事件
     */
    _onMove: function (e) {
      var that = this;
      // 非长按拖拽不记录
      if (!that.data.move.longpress) {
        return false;
      }
      console.log('component bar long press move ');

      // 触发页面模板事件drag
      that._callPage('drag', e);
    },
    _onMoveEnd: function (e) {
      var that = this;
      // 取消长按事件触发
      that.data.move.longpress = false;
      that.data.opt = 'normal';
      that._setBarData();
      that._callPage('moveend', e);
    },

  }
})
