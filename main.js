
function Render() {
  this.$html = $('html');
  this.$body = $('body');
  this.$tablist = $('.tablist').size() >0 ? $('.tablist') : $('<div class="tablist"><div class="tablist-main"></div><div class="tablist-handle"></div></div>');
  this.width = 320;
  this.template = ''+
    '<ul>' +
    '  <% tabs.forEach(function(tab) { %>' +
    '    <li id="tli-<%= tab.id %>" data-tab-id="<%= tab.id %>" class="<%= (tab.highlighted ? "active" : "") %>">'+
    '      <span class="tli-icon"><img src="<%= tab.favIconUrl %>"/></span>' +
    '      <a class="tli-title" href="javascript:void(0);"><%= tab.title %></a>' +
    '      <div class="tli-tools">' +
    '        <a class="tli-fav-tab" data-action="fav" href="javascript:void(0);">★</a>' +
    '        <a class="tli-remove-tab" data-action="remove" href="javascript:void(0);">×</a>' +
    '     </div>' +
    '    </li>' +
    '  <% }); %>' +
    '</ul>';
    
  this.init();
}

Render.prototype = {
  
  /**
   * 初始化
   */
  init: function() {
    
    var _this = this;
    
    this.$tablist
    .on('click', 'li', function(event) {
      var tabId = this.getAttribute('data-tab-id');
      var tab = _this.getTabById(tabId);
      
      _this.sendMsg('highlight', tab);
    })
    .on('click', '.tli-tools a', function(event) {
      var tabId = $(this).parents('li:first').attr('data-tab-id');
      var tab = _this.getTabById(tabId);
      var action = _this.detectAction(this);
      
      switch (action) {
        
        case 'remove':
        case 'delete':
        case 'del':
        case 'close':
          _this.sendMsg(action, tab);
          event.stopPropagation();
          break;
          
        default:
          _this.sendMsg('highlight', tab);
        
      }
    })
    .on('mousedown', '.tablist-handle', function(event) {
      
      var left = event.pageX;
      var originWidth = _this.$tablist.width();
      
      $(document)
        .on('mousemove.resizeTablist', function(e) {
          var offset = e.pageX;
          var width = originWidth - (left-offset);
          _this.resize(width);
        })
        .on('mouseup.resizeTablist', function(e) {
          $(document).off('.resizeTablist');
        });
      
    });
    
    key('⌘+alt, ctrl+r', function(event, handler){
      event.preventDefault();
      if (this.visibled) {
        this.hide();
      } else {
        this.show();
      }
      return false;
    }.bind(_this));
  },
  
  show: function() {
    this.resize(this.width);
    this.$tablist.addClass('animate');
    this.$tablist.addClass('show');
    this.visibled = true;
  },
  
  hide: function() {
    setTimeout(function(){
      this.resize(0, true);
    }.bind(this), 500);
    this.$tablist.addClass('animate');
    this.$tablist.removeClass('show');
    this.visibled = false;
  },
  
  resize: function(width, once) {
    if (typeof width === 'number') {
      if (once !== true) {
        this.width = width;
      }
      this.$tablist.removeClass('animate').css({
        width: width
      });
      this.$html.css('marginLeft', width);
    }
  },
  
  /**
   * 获取Action
   */
  detectAction: function (elem) {
    return (elem && typeof elem.getAttribute === 'function') ? elem.getAttribute('data-action') : 'none';
  },
  
  /**
   * 根据ID获取Tab信息
   */
  getTabById : function (tabId) {
    var result;
    this.tabs.forEach(function(tab) {
      if (tab.id == tabId) {
        result = tab;
      }
    });
    return result;
  },
  
  /**
   * 消息处理器
   */
  reciveMsg : function (request, sender, sendResponse) {
    var _this = this;
    
    switch (request.type) {
      case 'list':
      case 'tabs':
        $(function(){
          this.render(request.data);
        }.bind(_this));
        break;
        
      default:
        console.log('Recived unhandle message: '+ JSON.stringify(request) + '; Sender: '+ sender);
    }
  },
  
  /**
   * 发送消息
   */
  sendMsg : function (type, data) {
    chrome.extension.sendMessage({type: type, data:data});
  },

  
  render: function(tabs) {
    this.tabs = tabs || [];
    var compile = _.template(this.template);
    var html = compile({tabs: tabs});
    
    this.hide();
    this.$tablist.find('.tablist-main').html(html);
    this.$tablist.appendTo('body');
  }
};

var render = new Render();
chrome.extension.onMessage.addListener(render.reciveMsg.bind(render));


