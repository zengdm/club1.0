// forumcontrols.js
module.exports = Behavior({
  behaviors: [],
  properties: {
    // contents: Array
  },
  // 关联的目标节点应为祖先节点
  relations: {
    './bar/bar': {
      type: 'ancestor',
    }
  },
  data: {
    inputValue:''

  },
  // 组件生命周期函数，在组件实例进入页面节点树时执行
  attached: function () { },
  // 组件生命周期函数，在组件实例被从页面节点树移除时执行
  detached: function () {
    console.log('detached 	组件生命周期函数，在组件实例被从页面节点树移除时执行4444')
  },
  methods: {
    /**
     *  页面方法传值调用
     */
    _callPage: function (pageEvent, event) {
      console.log('component controls call page function:' + pageEvent);
        console.log("4444444444444444444")
      /*** 触发事件的选项 ***/
      // bubbles:事件是否冒泡
      // composed:事件是否可以穿越组件边界，为false时，事件将只能在引用组件的节点树上触发，不进入其他任何组件内部
      // capturePhase:事件是否拥有捕获阶段
      var myEventOption = { bubbles: false, composed: true, capturePhase: true };
      // barevent和页面模板监听时间bind:barevent对应
      this.triggerEvent(pageEvent, event, myEventOption);
      
    },

    contents: function (res) {
      console.log(res);
    },
    /**
     * 点击事件
     */
    _onTap: function (e) {
      // log输出
      console.log('controls event:');
      console.log(e);

      // 调取页面模板事件barevent（bind:barevent)
      this._callPage('barevent', e);
    },

    /**
     * 文本框输入监听事件
     */
    _bindinput: function (e) {
      // 调取页面模板事件deleteEvent（bind:deleteEvent)
      this._callPage('input', e);
      this.setData({
        inputValue: e.detail.value
      })
    },
    _bindtap: function (e) {
        // 调取页面模板事件deleteEvent（bind:deleteEvent)
        this._callPage('tap', e);
    },
    _addImage: function () {

    },
    _changeSort: function () {

    },
    _onDelete:function(e){
      // 调取页面模板事件deleteEvent（bind:deleteEvent)
      this._callPage('deleteEvent', e);
    },
    _onBackBtn: function (e) {
        //SUN
        console.log(e)
        //关闭标签弹层
        // var that = this;
        // that.setData({
        //     tagsPage: true
        // });
    },

   
  }
})