/**
 * 微信统一接口类
 * 
 * @author fuqiang
 */

import { baseapi } from "./baseapi";

function forumApi(page) {
  // 继承基类
  baseapi.call(this);
  // 引入页面page类对象
  this.init(page);
}

forumApi.prototype = {
  // 方法数据
  data: {
    // 分页条数
    psize: 20,
  },

  // 接口地址
  apiURL: {
    //首页推荐和标签
    'navlist': '/globals/forum/wxindex',
    // 首页推荐瀑布流列表
    'recommendList': '/forum/feed/recommend/',
    // 帖子列表
    'threadlist': '/forum/feed/threadlist',
    // 发帖
    'publish': '/forum/detail/publish',
    // 帖子详情
    'info': '/forum/detail/info',
    // 修改帖子
    'doEdit': '/forum/detail/edit',
    // 标签对应帖子列表
    'tagforum': '/forum/tag/flist',
    // 根据id获取标签详情
    'tagbyid': '/forum/tag/info',
    //标签弹层列表
    'tagsList': '/globals/tag/search',
    //新增评论
    'addComment': '/forum/reply/add',
    //回帖列表 
    'replyList': '/forum/reply/rlist',
    //es feed列表 
    'esFeed': '/es/feed',
  },


/**
 * es feed列表
 */
  esFeed: function (page, args, callback,feedArgs) {
    var that = this;
    feedArgs = typeof (feedArgs) != 'object' ? {} : feedArgs;
    feedArgs['page'] = page;
    feedArgs['args'] = args;
    that.getURLData(that.apiURL['esFeed'], feedArgs, callback);
  },

 

  /**
   * 首页推荐和标签
   * 
   * @param [string]  页面回调方法
   */
  navList: function (callback) {
    var that = this;
    that.getURLData(that.apiURL['navlist'], {}, callback);
  },

  /**
   * 发帖图片上传
   *  @param [int]     count     [图片上传的张数]
   *  @param [string]  callback  [页面回调方法]
   *  @param [int]      nodeIndex [初始节点索引]
   * 
   */
  imgUpload: function (count, callback, nodeIndex, sourceType) {
    var that = this;
    nodeIndex = typeof (nodeIndex) == 'undefined' ? 0 : parseInt(nodeIndex);
    sourceType = typeof (sourceType) != 'object' ? ['album', 'camera'] : sourceType;

    wx.chooseImage({
      count: count, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: sourceType, // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var imgCover = res.tempFilePaths;
        if (imgCover.length > 0) {
          // 上传至服务器
          for (let k in imgCover) {
            // 本地图片路径
            var imgfile = imgCover[k];
            // 1、默认返回本地图片
            that.callback_page(callback, { code: 0, data: { id: 0, src: imgfile, nodeIndex: nodeIndex, islode: nodeIndex } }, 'local');
            // 2、上传至服务器
            that.uploadToServer(imgfile, nodeIndex, callback);
            // 节点自增
            nodeIndex++;
          }

        }
      },
    });
  },
  // 上传图片至服务器
  uploadToServer: function (imgfile, nodeIndex, callback) {
    var that = this;
    wx.uploadFile({
      url: getApp().apiHost + '/globals/photo/upload',
      filePath: imgfile,
      name: 'imgFile',
      success: function (resp) {
        if (resp.statusCode == 200) {
          resp.data = JSON.parse(resp.data);
          console.log(resp.data);
          if (typeof (nodeIndex) != 'undefined') {
            resp.data['nodeIndex'] = nodeIndex;
          }
          that.callback_page(callback, resp.data, 'server')
        } else {
          console.log('失败');
          console.log(resp.data);
        }
      },

      fail: function (e) {
        that.callback_page(callback, e, 'fail')
      }
    });
  },

  /**
   * 推荐瀑布流加载
   * 
   * @param [enum]    scroll    [翻页方向，next:下一页 | last:上一页]
   * @param [Object]  pageArgs  [翻页参数，feedTime和feedId]
   * @param [string]  callback  [页面回调方法]  
   */
  recommendList: function (args, scroll, pageArgs, callback) {
    var that = this;
    // 组装参数
    pageArgs['scroll'] = scroll;
    args = typeof (args) == 'object' ? args : {};
    args['scroll'] = scroll;
    if (typeof (pageArgs) == 'object') {
      for (let k in pageArgs) {
        args[k] = pageArgs[k];
      }
    }
    // 异步获取接口数据
    that.getURLData(that.apiURL['recommendList'], args, callback);
  },

  /**
   * 帖子列表
   *
   * @param [object]  args      [查询参数]
   * @param [enum]    scroll    [翻页方向，next:下一页 | last:上一页]
   * @param [Object]  pageArgs  [翻页参数，feedTime和feedId]
   * @param [string]  callback  [页面回调方法]
   */
  threadList: function (args, scroll, pageArgs, callback) {
    var that = this;
    // 拼接分页参数
    if (scroll) {
      args['scroll'] = scroll;
    }

    if (typeof (pageArgs) == 'object') {
      for (let k in pageArgs) {
        args[k] = pageArgs[k];
      }
    }

    that.getURLData(that.apiURL['threadlist'], args, callback);
  },

  /**
   * 发帖
   */
  publish: function (ctype, args, callback) {
    var that = this;
    console.log('long,dynamic'.indexOf(ctype))
    if ('long,dynamic'.indexOf(ctype) >= 0) {
      args['ctype'] = ctype;
      that.postURLData(that.apiURL['publish'], args, callback);
    } else {
      console.log('发帖类型参数错误');
    }
  },



  /**
 * 帖子详情
 */
  // info: function (tid, callback) {
  //   if (tid > 0) {
  //     var args = { tid: tid };
  //     that.postURLData(that.apiURL['info'], args, callback);
  //   } else {
  //     console.log('tid必须>0');
  //   }
  // },


  /**
   * 帖子详情
   */
  info: function (args, callback) {
    var that = this;
    that.postURLData(that.apiURL['info'], args, callback);
  },

  /**
   * 修改帖子
   * 
   * @param [int]     tid       [帖子id]
   * @param [Object]  args      [帖子修改内容]
   * @param [string]  callback  [页面回调方法]
   */
  doEdit: function (tid, args, callback) {
    var that = this;
    if (tid > 0) {
      args.tid = tid;
      that.postURLData(that.apiURL['doEdit'], args, callback);
    } else {
      console.log('error: parameter tid must gt 0');
    }
  },

  /**
   * 根据ID获取标签详情
   * 
   * @param [int]       tag_id    [标签id]
   * @param [callback]  callback  [页面回调方法]
   */
  getTagById: function (tag_id, callback) {
    var that = this;
    if (tag_id > 0) {
      var args = { tag_id: tag_id };
      that.getURLData(that.apiURL['tagbyid'], args, callback);
    } else {
      console.log('error: parameter tag_id must gt 0');
    }
  },

  /**
   * 根据标签获取帖子列表
   * 
   * @param [int]     tag_id    [标签id]
   * @param [Object]  args      [其它查询参数]
   * @param [enum]    scroll    [翻页方向，next:下一页 | last:上一页]
   * @param [string]  callback  [页面回调方法]
   */
  threadByTagId: function (tag_id, args, scroll, pageArgs, callback) {
    var that = this;
    if (tag_id > 0) {
      // 参数有效性及数据拼接
      args = typeof (args) != 'Object' ? {} : args;
      args.psize = that.data.psize;
      args.scroll = scroll;
      args.tag_id = tag_id;
      for (let k in pageArgs) {
        args[k] = pageArgs[k];
      }

      // 请求接口参数
      that.getURLData(that.apiURL['tagforum'], args, callback);
    } else {
      console.log('error: tag_id must gt 0');
    }
  },

  /**
   * 设为精华（接口需要修改）
   * 
   * @param [enum]    ctype     [推荐类型，详情见app.js中plats相关定义]
   * @param [int]     sourceid  [平台内容索引id]
   * @param [int]     platid    [平台id]
   * @param [string]  callback  [页面回调方法]
   */
  addDigest: function (ctype, sourceid, platid, callback) {
    var that = this;
    var args = { ctype: ctype, sourceid, platid };
    that.getURLData(that.apiURL['adddigest'], args, callback);
  },



  /**
   * 标签弹层列表
   * 
   * @param [string]  页面回调方法
   */
  tagsList: function (callback) {
    var that = this;
    that.getURLData(that.apiURL['tagsList'], {}, callback);
  },


  /**
   *新增评论
   * 
   * @param [string]  页面回调方法
   */
  addComment: function (args, callback) {
    var that = this;
    that.getURLData(that.apiURL['addComment'], args, callback);
  },




  /**
* 我的帖子列表
* 
* @param [enum]    scroll    [翻页方向，next:下一页 | last:上一页]
* @param [Object]  pageArgs  [翻页参数，feedTime和feedId]
* @param [string]  callback  [页面回调方法]
*/

  replyList: function (args, scroll, pageArgs, callback) {
    var that = this;
    // 组装参数
    pageArgs['scroll'] = scroll;
    for (let k in pageArgs) {
      args[k] = pageArgs[k];
    }
    // 异步获取接口数据
    that.postURLData(that.apiURL['replyList'], args, callback);
  },

}

module.exports.forumApi = forumApi;