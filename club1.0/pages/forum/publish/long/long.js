// pages/forum/publish/long/long.js
//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
import { forumApi } from '../../../api/forumApi.js';
Page({
  /***页面的初始数据*/
  data: {
    // 默认添加文本（text|image）
    'type': 'text',
    // 内容节点格式
    contents: [],
    // 内容长度
    contentLen: 0,
    //图片上传的路径
    imgPath: [],
    sortPage: false,
    tagsPage: false,
    tagName: '',
    tagNames: [],
    imgCover: [],
    imgText: '',
    nodeImg: '',
    nowindex: '',
    tagsInput: '',
    nodechangeIndex: '',
    imgHidden: false,
    pubDisabled:false,
    args: {
      'type': 'long',
      title: '',
      sub_title: '',
      cover: '',
      summary: '',
      intro: '',
      content: [],
      tagids: []
    },

    test: { a: 1 },

    optionsListData: [],
    // 当前滚动节点信息
    movableViewPosition: {
      x: 0,
      y: 0,
      className: "none",
      data: {}
    },
    // 滚动位置设置
    scrollPosition: {
      // everyOptionCell: 65,
      // 每个单元高度
      everyOptionCell: 58,
      // 距离顶部高度
      top: 58,
      // 滚动到顶部高度
      scrollTop: 0,
      // Y轴是否滚动
      scrollY: true,
      // 视图范围滚动高度
      scrollViewHeight: 1000,
      // 视图范围滚动宽度
      scrollViewWidth: 375,
      // 窗体视图高度
      windowViewHeight: 1000,
    },
    selectItemInfo: {
      sName: "",
      sDtSecCode: "",
      sCode: "",
      selectIndex: -1,
      selectPosition: 0,
    },
  },
  // 新增节点变量
  node: {
    // 节点索引
    index: 0,
    //操作类型(add:新增, del:删除, sort:排序, move:移动)
    opt: '',
    move: {
      // 拖拽过程中上次触发clientY
      beforeClientY: 0,
      // 移动方向
      direction: '',
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    console.log(that.data.args.content);
    // 初始化
    that.data.contents.push({
      'type': 'text',
      decode: {
        alt: ''
      }
    });
    that.forumApi = new forumApi(that);
    // 设置测试数据
    that._setData({
      contents: that.data.contents
    })
  },



  /**
    * scroll-view滚动时触发
    */
  bindscroll: function (event) {
    var that = this;
    var scrollTop = event.detail.scrollTop;
    that.setData({
      'scrollPosition.scrollTop': scrollTop
    })
  },

  /**
   * 滑动事件
   */
  draggleTouch: function (event) {
    var that = this;
    var touchType = event.type;
    // console.log(event);
    switch (touchType) {
      case "touchstart":
        that.scrollTouchStart(event);
        break;
      case "touchmove":
        that.scrollTouchMove(event);
        break;
      case "touchend":
        that.scrollTouchEnd(event);
        break;
    }
  },

  /**
   * 排序 - 根据移动位置获取节点信息
   * 
   * @return 
   *      {
   *        sDtSecCode: 排序前节点索引id,
   *        selectClass: 选中样式,
   *        selectPosition: y轴位移高度,
   *        type: 类型(text/image)
   *      }
   */
  getPositionDomByXY: function (potions) {
    var that = this;
    var y = potions.y - that.data.scrollPosition.top + that.data.scrollPosition.scrollTop;

    var optionsListData = that.data.optionsListData;
    var everyOptionCell = that.data.scrollPosition.everyOptionCell;
    for (var i = 0, j = optionsListData.length; i < j; i++) {
      if (y >= i * everyOptionCell && y < (i + 1) * everyOptionCell) {
        return optionsListData[i];
      }
    }
    return optionsListData[0];
  },

  /**
   * 排序 - 监听选中
   * 
   * @return movableViewPosition {
   *                    x: 当前节点x轴,
   *                    y: 当前节点y轴,
   *                    className: 当前节点选中样式,
   *                    data: 当前节点内容信息
   *                  }
   */
  scrollTouchStart: function (event) {
    var that = this;
    /*** 根据移动位置, 获取选中节点信息 ***/
    var movableViewPosition = {
      x: event.changedTouches[0].pageX,
      y: event.changedTouches[0].pageY,
      className: '',
    }
    // 当前节点移动信息
    movableViewPosition['data'] = that.getPositionDomByXY(movableViewPosition);
    //movable-area滑块位置处理, 默认上移半个位置
    movableViewPosition['y'] = movableViewPosition.y - that.data.scrollPosition.top - that.data.scrollPosition.everyOptionCell / 2;
    movableViewPosition['x'] = 0;

    /*** 根据原始位置(sDtSecCode)获取当前节点信息getOptionInfo ***/
    var secCode = movableViewPosition.data.sDtSecCode;
    // 当前节点信息
    var secInfo = that.getOptionInfo(secCode);
    // Y轴位置
    secInfo.selectPosition = event.changedTouches[0].clientY;
    // 选中样式
    secInfo.selectClass = "dragSelected";
    // 设置当前节点选中状态
    that.data.optionsListData[secInfo.selectIndex]['selectClass'] = "dragSelected";

    that.setData({
      // 节点移动位置信息
      movableViewPosition,
      // 选中节点信息
      selectItemInfo: secInfo,
      // 列表数据,更新选中样式
      optionsListData: that.data.optionsListData,
      'scrollPosition.scrollY': false,
      'scrollPosition.selectIndex': secInfo.selectIndex,
    });


  },

  /**
   * 排序 - 监听移动
   */
  scrollTouchMove: function (event) {
    var that = this;
    // 全局单元格配置信息
    var everyOptionCell = that.data.scrollPosition.everyOptionCell;
    // 排序列表数据
    var optionsListData = that.data.optionsListData;
    // 当前移动节点信息
    var selectItemInfo = that.data.selectItemInfo;
    // Y轴位置
    var selectPosition = selectItemInfo.selectPosition;
    // 当前节点索引
    var selectIndex = selectItemInfo.selectIndex;
    // Y轴移动位置
    var moveDistance = event.changedTouches[0].clientY;

    //movable-area滑块位置处理
    var movableViewPosition = {
      x: 0,
      y: event.changedTouches[0].pageY - that.data.scrollPosition.top - that.data.scrollPosition.everyOptionCell / 2,
      className: '',
      data: that.data.movableViewPosition.data
    };
    var movableY = event.changedTouches[0].pageY - that.data.scrollPosition.top - that.data.scrollPosition.everyOptionCell / 2;


    if (moveDistance - selectPosition > 0 && selectIndex < optionsListData.length - 1) {
      if (optionsListData[selectIndex].sDtSecCode == selectItemInfo.sDtSecCode) {
        optionsListData.splice(selectIndex, 1);
        optionsListData.splice(++selectIndex, 0, selectItemInfo);
        selectPosition += everyOptionCell;
      }
    }

    if (moveDistance - selectPosition < 0 && selectIndex > 0) {
      if (optionsListData[selectIndex].sDtSecCode == selectItemInfo.sDtSecCode) {
        optionsListData.splice(selectIndex, 1);
        optionsListData.splice(--selectIndex, 0, selectItemInfo);
        selectPosition -= everyOptionCell;
      }
    }

    that.setData({
      // 当前选中节点移动位置
      movableViewPosition,
      // 排序列表
      optionsListData: optionsListData,
      // 选中节点Y轴位置信息
      'selectItemInfo.selectPosition': selectPosition,
      // 选中节点当前索引id
      'selectItemInfo.selectIndex': selectIndex,
    });
  },


  /**
   * 排序 - 拖拽结束
   */
  scrollTouchEnd: function (event) {
    var that = this;
    var optionsListData = that.optionsDataTranlate(that.data.optionsListData, "");
    that.setData({
      optionsListData: optionsListData,
      'scrollPosition.scrollY': true,
      'movableViewPosition.className': "none"
    })
  },

  optionsDataTranlate: function (optionsList, selectClass) {
    for (var i = 0, j = optionsList.length; i < j; i++) {
      optionsList[i]['selectClass'] = selectClass;
    }
    return optionsList;
  },


  /**
   * 排序 - 设置当前节点选中，返回节点信息
   */
  getOptionInfo: function (code) {
    var that = this;
    for (var i = 0, j = that.data.optionsListData.length; i < j; i++) {
      var optionData = that.data.optionsListData[i];
      if (optionData.sDtSecCode == code) {
        optionData.selectIndex = i;
        return optionData;
      }
    }
    return {};
  },


  /**
   * 排序 - 按钮 - 完成排序，返回页面
   */
  sortSuccBtn: function () {
    var that = this;
    // 过滤内容
    var filters = 'sDtSecCode,selectClass,selectIndex,selectPosition';
    var contents = [];
    for (let k in that.data.optionsListData) {
      for (let j in that.data.optionsListData[k]) {
        if (filters.indexOf(j) < 0) {
          if (typeof (contents[k]) == 'undefined') {
            contents[k] = {};
          }
          contents[k][j] = that.data.optionsListData[k][j];
        }
      }
    }
    // 清空内容数据
    that.setData({ contents: [] });
    // 重新赋值
    that.setData({
      sortPage: false,
      contents: contents
    });
  },


  //点击排序
  sortBtn: function () {
    var that = this;

    var systemInfo = wx.getSystemInfoSync();
    var optionsList = that.data.contents;
    for (var i = 0; i < optionsList.length; i++) {
      optionsList[i]['sDtSecCode'] = i
    }
    // 配置列表选中样式-无
    that.data.optionsListData = that.optionsDataTranlate(optionsList, "");

    var scrollViewHeight = systemInfo.windowHeight - 58;
    var scrollViewWidth = systemInfo.windowWidth;
    that.data.sortPage = true;
    that.setData({
      sortPage: that.data.sortPage,
      optionsListData: that.data.optionsListData,
      'scrollPosition.scrollViewWidth': scrollViewWidth,
      'scrollPosition.scrollViewHeight': scrollViewHeight,
      'scrollPosition.windowViewHeight': systemInfo.windowHeight,
    })
  },




  //点击发布触发
  bindPublish: function (e) {
    var that = this;
    var content = new Array();
    that.data.args.content = that.data.contents;

    console.log(that.data.args.content);

    if (!that.data.args.cover) {
      wx.showToast({
        title: '封面图不能为空',
        image: '/pages/images/warning.png'
      });
      return false;
    }
    if (!that.data.args.title) {
      wx.showToast({
        title: '标题不能为空',
        image: '/pages/images/warning.png'
      });
      return false;
    }

    var argsType = false;
    for (var i = 0; i < that.data.args.content.length; i++) {
      if (that.data.args.content[i].type == "text" && that.data.args.content[i].decode.alt) {
        argsType = true;
      }
    }
    console.log(that.data.contentsLen);

    if (!argsType) {
      wx.showToast({
        title: '文章内容不能为空',
        image: '/pages/images/warning.png'
      });
      return false;
    }

    if (that.data.contentsLen > 5000){
      wx.showToast({
        title: '不多于5000字',
        duration: 2000,
        image: '/pages/images/warning.png'
      });
      return false;
    }

    // 发帖 
    // for (var i = 0; i < that.data.args.content.length; i++) {
    //   if (that.data.args.content[i].decode.alt.length != 0) {
    //     content.push(that.data.args.content[i])
    //   }
    // }
    // that.data.args.content = content
    console.log(that.data.args);
    that.setData({
      pubDisabled:true,
    })
    that.forumApi.publish('long', that.data.args, 'cb_publish');

  },

  //发帖
  cb_publish: function (res, opt) {
    var that = this;
    console.log(res);
    if (res.code == 0) {
      wx.showToast({
        title: '发帖成功',
        image: '/pages/images/success.png',
        duration: 2000
      });

      
      // 设置导航
      var defaultNav = { navid: 0, path: 'club' };
      getApp().defaultNav = defaultNav;

      setTimeout(function () {
        wx.switchTab({
          url: '/tabBar/forum/forum'
        });

        that.setData({
          pubDisabled: false,
        })
      }, 2000);

    } else {
      wx.showToast({
        title: '发帖失败',
        duration: 2000,
        image: '/pages/images/warning.png'
      })
      that.setData({
        pubDisabled: false,
      })
    }
  },







  //文章标题
  bindTitle: function (e) {
    var that = this;
    that.data.args.title = e.detail.value
  },
  /**
   * 监听文章内容，不做模板变量赋值
   */
  _bindTextinput: function (e) {
    var that = this;
    // 节点索引id
    var index = e.currentTarget.id;
    console.log(that.data.contents[index].type)
    if (typeof (that.data.contents[index]) != undefined) {
      // if (that.data.contents[index].type == 'text') {
      //   that.data.contents[index]['decode']['text'] = e.detail.detail.value;
      // } else {
      that.data.contents[index]['decode']['alt'] = e.detail.detail.value;
      // }
    } else {
      console.log('error: 未找到节点')
    }
    console.log(that.data.contents);
    var contentsLen = 0;
    for (var i = 0; i < that.data.contents.length;i++){
      // console.log(parseInt(that.data.contents[i].decode.alt.length));
      contentsLen += parseInt(that.data.contents[i].decode.alt.length);
    }
    // console.log(contentsLen);
    that.data.contentsLen = contentsLen;

   
  },

  tagsBtn: function () {
    var that = this;

    that.data.tagsPage = true;

    that._setData();
  },
  _onBackBtn: function () {
    var that = this;

    that.data.tagsPage = false;

    that._setData();
  },
  cb_imgUpload: function (res, opt) {
    var that = this;
    console.log(res);
    if (typeof (res.code) == 'undefined') {
      res = JSON.parse(res);
    }
    if (typeof (res.data.src) != 'undefined') {
      that.data.args.cover = res.data;
      if (res.data.id > 0) {
      } else {
        that._setData();
      }
    }
    console.log(that.data.args.cover);
  },
  // 添加封面图
  coverImage: function () {
    var that = this;
    that.forumApi.imgUpload('1', 'cb_imgUpload');
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**  
   * 统一设置模板变量
   */
  _setData: function () {
    var that = this;
    // var contents = that.data.splice('contents', 1);
    console.log('page node length');
    console.log('setData---', that.data);
    // 内容长度
    that.data.contentLen = that.data.contents.length;

    // 模板统一赋值
    that.setData(that.data);
    console.log('set page vars:');
    console.log(that.data);
    // 清除本次节点数据
    that._clearNode();
  },
  // 2.1 清除节点
  _clearNode: function () {
    var that = this;
    that.node.index = 0;
    that.node.opt = '';
  },
  // 2.0 添加节点
  _addNode: function (data, index) {
    var that = this;
    var contents = [];
    var isOpt = false;
    console.log('page _addNode data:');
    console.log(index);
    console.log(data);
    for (let k in that.data.contents) {
      contents.push(that.data.contents[k]);
      // 新增节点
      if (k == index) {
        isOpt = true;
        contents.push(data);
        console.log('insert after node:' + index);
      }
    }
    if (!isOpt) {
      console.log('push node');
      contents.push(data);
    }
    // 重新赋值
    that.data.contents = contents;
    console.log(that.data.contents);
    // 设置模板统一变量
    that._setData();
    return isOpt;
  },
  /**
   * 1.0 组件监听方法(添加/排序事件入口) 
   */
  _barEvent: function (e) {
    console.log('page _bar Event:' + e.detail.target.id);
    console.log(e);
    var that = this;
    // 索引id
    that.node.index = e.target.id;
    console.log(that.node.index)
    // 动作类型
    var opt = e.detail.target.id;
    that.node.opt = opt != 'sort' ? 'add' : 'sort';
    switch (e.detail.target.id) {
      case 'image':
        that._addImage(e.detail);
        break;
      case 'text':
        that._addText(e.detail);
        break;
      case 'sort':
        that._changeSort(e.detail);
        break;
    }
  },
  // 1.1 添加文字
  _addText: function (e) {
    var that = this;
    var content = { 'type': 'text', decode: { 'alt': '' } };
    console.log(that.node.index);
    that._addNode(content, that.node.index);
    that._setData();
    console.log('page add text event');
  },
  cb_imgUploadNode: function (res, opt, isEdit) {
    var that = this;
    isEdit = typeof (isEdit) != 'undefined' ? isEdit : 0;
    console.log('cb_imguploadNode')
    console.log(res);
    // if (typeof (res.code) == 'undefined') {
    //   res = JSON.parse(res);
    //   console.log(res.data);
    // }
    console.log('opt');
    console.log(opt);
    if (typeof (res.data.src) != 'undefined') {
      that.data.nodeImg = res.data;
      if (res.data.id > 0) {
        console.log(res.data)
        console.log('网络');
        if (typeof (res.nodeIndex) != 'undefined') {
          var nodeIndex = res.nodeIndex;
          if (typeof (that.data.contents[nodeIndex]) != 'undefined' && that.data.contents[nodeIndex]['type'] == 'img') {
            for (let k in res.data) {
              if (typeof (that.data.contents[nodeIndex]['decode'][k]) != 'undefined') {
                that.data.contents[nodeIndex]['decode'][k] = res.data[k];
                that.data.contents[nodeIndex]['decode'][k] = res.data[k];
                console.log("11111111111111111111111111")
                console.log(that.data.contents[nodeIndex]['decode'][k])
                console.log("11111111111111111111111111")
              }
            }
          }
        }


      } else {

        var node = {
          'type': 'img',
          decode: res.data,
        };
        node.decode['alt'] = '';
        console.log(that.data.nodeImg);
        // 添加图片节点
        that._addNode(node, that.node.index);


        that._setData();


      }
    }
    console.log(that.data.contents);
    var nowindexs = Number(that.data.nowindex) + 1
    console.log(nowindexs);

    if (that.data.contents[nowindexs].decode.id > 0) {
      that.data.contents[nowindexs].decode.islode = -1;
    }
    that.setData({
      contents: that.data.contents
    }


    );
    console.log(that.data.nodeImg);
    console.log('contents:');
    console.log(that.data.contents);
  },
  // 1.2 添加图片
  _addImage: function (e) {
    var that = this;
    console.log('upload img:');
    console.log(e);
    var nodeIndex = parseInt(that.node.index) + 1;
    that.forumApi.imgUpload('1', 'cb_imgUploadNode', nodeIndex);
  },
  // 1.3 改变排序
  _changeSort: function (e) {
    console.log('page change sort event');
  },
  // 2.1 清除节点
  _clearNode: function () {
    var that = this;
    that.node.index = 0;
    that.node.opt = '';
  },
  // 2.0 添加节点
  _addNode: function (data, index) {
    console.log("----------------------------------------------------------------------")
    var that = this;
    var contents = [];
    var isOpt = false;

    console.log('page _addNode data:');
    that.data.nowindex = index
    console.log(index);
    console.log(data.decode.islode);

    // for (let k in that.data.contents) {
    //   contents.push(that.data.contents[k]);
    //   // 新增节点
    //   if (k == index) {
    //     isOpt = true;
    //     contents.push(data);
    //     console.log('insert after node:' + index);
    //   }
    // }
    console.log(that.data.contents);
    that.data.contents.splice(++index, 0, data);

    console.log(that.data.contents);
    if (!isOpt) {




      console.log('push node');
      contents.push(data);



    }

    // 重新赋值
    // that.data.contents = contents;
    console.log(that.data.contents);

    // 设置模板统一变量
    that._setData();
    console.log("----------------------------------------------------------------------")
    return isOpt;

  },
  /**
   * 3.0 拖拽移动事件
   */
  _onMoveEvent: function (e) {
    var that = this;
    console.log('page move event');
    console.log(e);
    // 记录拖拽坐标that.node.move.preClientY, 判断拖拽方向that.node.move.direction
    var clientY = e.detail.touches[0]['clientY'];
    if (that.node.move.preClientY) {
      if (that.node.move.preClientY > clientY) {
        that.node.move.direction = 'top';
      } else {
        that.node.move.direction = 'bottom';
      }
    }
    // 记录拖拽过程中，本次事件触发clientY
    that.node.move.preClientY = clientY;
    console.log('移动方向:' + that.node.move.direction + ' | clientY:' + clientY);
  },
  /**
   * 3.1 拖拽停止事件
   */
  _onMoveEndEvent: function (e) {
    console.log('page move end event');
    var that = this;
    that.node.move.direction = '';
    that.node.move.preClientY = 0;
  },
  /**
   *  删除
   */
  _deleteEvent: function (e) {
    var that = this;
    var dataId = e.currentTarget.id;
    var contentsItem = that.data.contents;
    var newContentsItem = [];
    console.log(that.data.contents)
    for (var i in contentsItem) {
      var item = contentsItem[i];
      if (i != dataId) {
        newContentsItem.push(item);
      }
    }
    console.log(newContentsItem)
    that.setData({
      contents: newContentsItem
    });
  },

  _bindTagChange: function (e) {
    var that = this;

    var types = true;
    for (var i = 0; i < that.data.args.tagids.length; i++) {
      if (that.data.args.tagids[i].tag_id == e.detail.currentTarget.dataset.id) {
        types = false;
      }
    }
    if (types) {
      that.data.args.tagids.push({
        tag_id: e.detail.currentTarget.dataset.id,
        tag_name: e.detail.currentTarget.dataset.name
      });
      console.log(that.data.args.tagids);
      that.data.tagsPage = false;
      that._setData();

    } else {
      wx.showToast({
        title: e.detail.currentTarget.dataset.name + '已存在',
        image: '/pages/images/warning.png'
      });
    }

  },

  contains: function (arr, val) {
    if (typeof (arr) != 'object') {
      return false;
    } else {
      var i = arr.length;
      while (i--) {
        if (arr[i] === val) {
          return true;
        }
      }
      return false;
    }
  },


  //新增标签
  _bindFormSubmit: function (e) {
    var that = this;
    var is_repet = true;
    var repet_num = 0;
    var oldNum = 0;

    // console.log(e.detail.detail.value.input);
    var tagsValue = e.detail.detail.value.input;
    if (tagsValue == '') {
      wx.showToast({
        title: '请填写标签',
        image: '/pages/images/warning.png'
      });
      return false
    }
    var tagsNewValue = new Array();
    var spaceArray = new Array();
    tagsValue = tagsValue.trim();
    tagsValue = tagsValue.replace(/，/ig, ',');
    if (tagsValue.indexOf(",") != -1) {
      tagsNewValue = tagsValue.split(",")
      for (var i = 0; i < tagsNewValue.length; i++) {
        if (tagsNewValue[i].indexOf(" ") != -1) {
          spaceArray = tagsNewValue[i].trim().split(" ");
          for (var j = 0; j < spaceArray.length; j++) {
            tagsNewValue.push(spaceArray[j]);
          }
          tagsNewValue.splice(i, 1);
        }
      }
    } else if (tagsValue.indexOf(" ") != -1) {
      tagsNewValue = tagsValue.split(" ");
    } else {
      tagsNewValue.push(tagsValue);
    }

    //去除空项
    for (var i = 0; i < tagsNewValue.length; i++) {
      if (tagsNewValue[i].trim().length == 0 || tagsNewValue[i] == null) {
        tagsNewValue.splice(i, 1);
      }
    }

    oldNum = that.data.args.tagids.length;
    for (var i = 0; i < tagsNewValue.length; i++) {
      is_repet = true;
      for (var j = 0; j < that.data.args.tagids.length; j++) {
        if (tagsNewValue[i].trim() == that.data.args.tagids[j].tag_name) {
          is_repet = false;
          repet_num = repet_num + 1;
        }
      }

      if (is_repet) {
        if (tagsNewValue[i].trim().length != 0 && tagsNewValue[i] != null) {
          that.data.args.tagids.push({
            tag_id: 0,
            tag_name: tagsNewValue[i].trim()
          })
        }
      }

    }

    if (repet_num == tagsNewValue.length && oldNum != 0) {
      wx.showToast({
        title: '标签已存在',
        image: '/pages/images/warning.png'
      });
    } else {
      that.data.tagsPage = false;
    }

    // console.log(that.data.args.tagids);
    that._setData();
  },
  /**
   * 删除标签
   */
  tagsDelete: function (e) {
    var that = this;
    var tagsId = e.currentTarget.dataset.id;
    var tagsItem = that.data.args.tagids;
    var newTagsItem = [];
    console.log(tagsId)
    for (var i in tagsItem) {
      var item = tagsItem[i];
      if (i != tagsId) {
        newTagsItem.push(item);
      }
    }
    console.log(newTagsItem)
    that.data.args.tagids = newTagsItem
    that._setData();
  },
  _onchangeimg: function (e) {
    var that = this;
    console.log(e.target.id)
    that.data.nodechangeIndex = e.target.id;
    var nodeIndex = parseInt(that.node.index);
    console.log(e.target.id)
    // that.forumApi.imgUpload('1', 'cb_imgUploadNode_edit', e.target.id);
    that.forumApi.imgUpload('1', 'cb_imgUploadchange', e.target.id);
  },
  // cb_imgUploadNode_edit(res, opt) {
  //     var that = this;
  //     that.cb_imgUploadNode_edit(res, opt, 1);
  // }
  cb_imgUploadchange: function (res, opt) {
    var that = this;
    if (res.data.id > 0) {
      // console.log(res)
      // console.log(opt)
      // console.log(that.data.nodechangeIndex)
      var contents = that.data.contents;
      var nodechangeIndex = that.data.nodechangeIndex;
      contents[nodechangeIndex] = { "type": "img", "decode": res.data };
      // console.log(that.data.contents)
      that._setData();

    } else {

      console.log("-----------------------------------------")


      console.log("-----------------------------------------")
    }
  },

})