/**
 * 收藏功能
 * 
 * @remark
 *  收藏 [文章 | 点赞 |  | 车系 | 车型]
 *  字段说的明：
 *    ftype: 收藏类型  article:文章收藏   praise:文章点赞  car:车型对比   serie:车系收藏
 * 
 * @author fuqiang
 */
import { wxapi } from "wxapi";

function favorite(page) {
  this.init(page);
}

favorite.prototype = {
  data: {
    pageCallFunc:'',
    interval: {obj:'', num:0}
  },
  /**
   * 初始化方法
   */
  init: function(page) {
    // 获取cache
    var that = this;
    that.wxapi = new wxapi(that);
    that.page = page;
    that.preKey = 'favorites_';
  },

  /**
   * 页面统一回调方法
   */
  callback_page: function(res, opt) {
    var that = this;
    if (that.data.pageCallFunc && typeof (that.page[that.data.pageCallFunc]) == 'function') {
      console.log('fav callback function:' + that.data.pageCallFunc);
      if (opt && typeof(opt)!='undefined') {
        that.page[that.data.pageCallFunc](res, opt);
      } else {
        that.page[that.data.pageCallFunc](res);
      }
    }
  },

  /**
   * 添加收藏
   * @param enum  ftype   收藏类型[serie|article];
   * @param int   id      索引id
   * @param int   platid  平台id
   */
  addFav: function(ftype, id, platid, callback) {
    if (!id) {
      return false;
    }
    var that = this;
    var sourceid = id+'_'+platid;
    var ids = that.getFav(ftype);
    that.data.pageCallFunc = callback;
    
    var id_len = ids.length;
    // 判断是否增加
    var isfav = false;
    if (id_len && that.contains(ids, sourceid)) {
      isfav = true;
    } else {
      isfav = false;
    }
    // 添加收藏
    if (!isfav) {
      ids.push(sourceid);
    }
    
    var favids = ids.join(',');

    try {
      wx.setStorageSync(that.getCacheKey(ftype), favids);
      // 异步服务器删除收藏
      if (that.wxapi.getLoginToken()) {
        that.data.pageCallFunc = callback;
        that.wxapi.addFavorite(ftype, id, platid, 'callback_page');
      } else {
        that.callback_page(1, 'addFav');
      }
      
      console.log('favorite success');
      return true;
    } catch (e) {
      console.log('favorite fail');
      return false;
    }
  },

  /**
   * 删除收藏
   * 
   * @参数同上
   */
  remFav: function(ftype, id, platid, callback) {
    var that = this;
    var sourceid = id+'_'+platid;
    var ids = that.getFav(ftype);
    var id_len = ids.length;
    var favids = [];
    that.data.pageCallFunc = callback;
    if (id_len>0 && that.contains(ids, sourceid)) {
      for (var i=0;i<id_len;i++) {
        if (ids[i]!=sourceid) {
          favids.push(ids[i]);
        }
      }
    }
    
    favids = favids.join(',');
    try {
      wx.setStorageSync(that.getCacheKey(ftype), favids);

      // 异步服务器删除收藏
      if (that.wxapi.getLoginToken()) {
        that.data.pageCallFunc = callback;
        that.wxapi.remFav(ftype, id, platid, 'callback_page');
      } else {
        if (callback) {
          that.callback_page(1, 'remFav');
        }
      }
      return true;
    } catch (e) {
      console.log('favorite del fail');
      return false;
    }
    
  },

  /**
   * 判断是否已收藏
   * 
   * @param enum  ftype 收藏类型，详见顶部
   * @param int   id    索引id
   * @param int   plat  扩展辅助索引id(如文章平台id)
   */
  isFav: function(ftype, id, platid) {
    var that = this;
    // 缓存数据
    var ids = that.getFav(ftype);
    var id_len = ids.length;
    
    // 收藏id标识
    var sourceid = that.getVal(id, platid);
    var isfav = false;
    if (id_len && that.contains(ids, sourceid)) {
      isfav = true;
    }
    
    return isfav;
  },

  favList: function(ftype, page, psize, callback) {
    var that = this;
    // 记录当前回调方法
    that.data.pageCallFunc = callback;
    // 登录信息
    if (that.wxapi.getLoginToken()) {
      // 登录状态，获取对比车型
      that.wxapi.favList(ftype, page, psize, 'callback_page');
    } else if(ftype=='car') {
      // 非登录状态
      var carIds = that.getFav(ftype);
      
      if (carIds.length>0) {
        var ids = [];
        for (let i in carIds) {
          var s = carIds[i].split('_');
          ids.push(s[0]);
        }
        if (ids.length>0) {
          that.wxapi.listCarByIds(ids, 'callback_page');
        } else {
          that.callback_page({data:[]}, 'favlist');
        }
        
      } else {
        that.callback_page({data:[]}, 'favlist');
      }
    } else {
      that.callback_page({data:[]}, 'favlist');
    }
  },
  // 此方法已无用
  callbackCar: function(data, ftype) {
    var that = this;
    if (that.data.pageCallFunc) {
      that.page[that.data.pageCallFunc](data);

        that.data.pageCallFunc = '';
    }
  },

  /**
   * 根据类型获取收藏列表
   * 
   * @param ftype 收藏类型，详见顶部说明
   */
  getFav: function(ftype) {
    var that = this;
    var f = wx.getStorageSync(that.getCacheKey(ftype));
    
    if (f) {
      // 反转数组
      f = f.split(',').reverse();
    } else {
      f = [];
    }
    return f;
  },

  // 组合数据存储值
  getVal: function(id, platid) {
    return id+'_'+platid;
  },

  // 获取缓存key
  getCacheKey: function(ftype) {
    var that = this;
    return that.preKey+ftype;
  }, 
  // 数组包含检测方法
  contains: function (arr, obj) {
    // if (typeof (arr) != object) {
    //   return false;
    // }

    var len = arr.length;
    while (len--) {
      if (arr[len] === obj) {
        return true;
      }
    }
    return false;
  },

}

// 声明方法
module.exports = {
  favorite:favorite,
}