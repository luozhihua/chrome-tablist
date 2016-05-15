function Tablist (tabId) {
  this.tabId = tabId;
  chrome.extension.onMessage.addListener(this.reciveMsg.bind(this));
}

Tablist.prototype = {
  /**
   * 发送消息
   */
  sendMsg : function (type, msg) {
    chrome.tabs.sendMessage(this.tabId, {type: type, data: msg });
  },
  
  /**
   * 接受消息
   */
  reciveMsg : function(request, sender, sendResponse) {
    
    switch (request.type) {
      case 'highlight':
      case 'active':
      case 'select':
        this.highlightTab(request.data);
        break;
      
      case 'create':
      case 'new':
      case 'plus':
        this.createTab(request.data);
        break;
      
      case 'remove':
      case 'delete':
      case 'del':
      case 'close':
        this.removeTab(request.data);
        break;
        
      default:
        console.log('Recived unhandle message: '+ JSON.stringify(request) + '; Sender: '+ sender);
    }
  },
  
  /**
   * 显示Tab
   */
  highlightTab : function (tab) {
    chrome.tabs.highlight({tabs: tab.index});
  },
  
  /**
   * 移除Tab
   */
  removeTab : function (tab) {
    chrome.tabs.remove({tabs: tab.id});
  },
  
  /**
   * 创建Tab
   */
  createTab: function (options) {
    
    var opt = {};
    
    if (options.url) { opt.url = options.url;  }
    if (options.index) { opt.index = options.index;  }
    if (options.active) { opt.active = options.active;  }
    if (options.openerTabId) { opt.openerTabId = options.openerTabId;  }
    if (options.selected) { opt.selected = options.selected;  }
    
    chrome.tabs.highlight(opt);
  },
  
  render: function() {
    var _this = this;
    
    chrome.tabs.getAllInWindow(function(tabs) {
      _this.sendMsg('list', tabs);
    });
  }
};

chrome.tabs.onActivated.addListener(function (tabId, winId) {
  new Tablist(tabId).render();
});

chrome.tabs.onHighlighted.addListener(function (highlightInfo) {
  var ids = highlightInfo.tabIds;
  
  if (ids) {
    ids.forEach(function(tabId) {
      new Tablist(tabId).render();
    });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status !== 'loading') return false;
  new Tablist(tabId).render();
});