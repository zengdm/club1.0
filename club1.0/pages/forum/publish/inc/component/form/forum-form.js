// pages/forum/publish/inc/component/form/form.js
var forumcontrols = require('../forum-controls');
Component({
  behaviors: [forumcontrols],
  /**
   * 组件的属性列表
   */
  properties: {
    contents: {
      type: Object
    }
  },
  created: function() {
    var that = this;
    console.log('forum-form created');
    // console.log(that.properties.contents); // 不能使用
  },
  ready: function() {
    var that = this;
    console.log('forum-form ready');
    // 可以使用
    console.log(that.properties.contents); // 使用
    that.data.list = that.properties.contents;
  },
  // 组件关系定义
  relations: {
    '../bar/forum-bar': {
      type: 'child', // 关联的目标节点应为子节点
      linked: function (target) {
        console.log('add');
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

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getAllLi: function () {
      // 使用getRelationNodes可以获得nodes数组，包含所有已关联的custom-li，且是有序的
      var nodes = this.getRelationNodes('path/to/custom-li')
    },
    
  }
})
