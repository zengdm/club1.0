// pages/forum/inc/component/detail-comment/detail-comment.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 回复数
    replies: {
      type: Number,
      value: 0,
      // observer: function(newVal, oldVal) {
      //   console.log('parse value replies');
      //   console.log(newVal);
      //   // this.setData({replies:88});
      // }
    },
    // 点赞数
    agree: {
      type:Number,
      value: 0
    },
    // 评论列表
    replyList: {
      type: Object,
      value:[]
    }
  },

  ready: function () {
    var that = this;
    console.log('component forum-list ready');
    console.log(this.properties.replies + '/' + that.properties.replies);
    console.log(that)
  },
  attached: function() {
    console.log('attached');
    console.log(this.replies);
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

  }
})
