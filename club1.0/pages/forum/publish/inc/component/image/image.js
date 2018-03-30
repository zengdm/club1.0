// pages/forum/publish/inc/component/image/image.js
var forumcontrols = require('../forum-controls');
Component({

  behaviors: [forumcontrols],
  // 关联的目标节点应为祖先节点
  relations: {
    '../form/forum-bar': {
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
    }
  },
  /**
   * 组件的属性列表(该组件模板可直接使用src和remark变量)
   */
  properties: {
    src: {
      type: String
    },
    value: String,
    hasDel: {
      type: Boolean,
      value: true
    },
    islode: {
      type: String
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
      _onchangeimg:function(e){
          this._callPage('_onchangeimg', e);
      }
  }
})
