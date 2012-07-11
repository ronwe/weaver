fml.define('weave/html',['weave/fn'],function(require){
	var fn = require('weave/fn');
	
	return {
		prepend : function(htmle){
			var obj = this,
				html_orgin;
			if (fn.is_string(htmle)){
				html_orgin = htmle;
			}else{
				obj = this.eq(0);
				if (fn.is_html(htmle)) htmle = [htmle];
			}

			obj.each( function (elem){
				if (html_orgin)  htmle = obj.create(html_orgin);

				fn.reach(htmle , function(htmle_new){
					elem.insertBefore(htmle_new , elem.firstChild);
					});
				});	
			return this;
			},
		append : function(htmle ) {
			if (fn.is_string(htmle)){
				this.each( function(item){
					item.innerHTML += fn.is_string(htmle);
				});
			}else {
				var elem = this.eq(-1).get(0);

				if (elem) {
					htmle = fn.is_html(htmle) ? [htmle] : htmle.getAll();
					fn.map(htmle , function(item){
						elem.appendChild(item);	
					});
				}
			}
				
			return this;
			},
		val : function(v){
			if (!v) return this.stack.length ? this.stack[0].value : '';
			return this.each(function(item){
				item.value = v;	
				})
			},
		attr : function(attrName , attrVal){
			if (fn.is_object(attrName)) 	attrVal = false;
				
			if (undefined === attrVal ) return this.stack.length ? this.stack[0].getAttribute(attrName) : '';
			return this.each(function(item){
				if (false === attrVal) {
					fn.each(attrName , function(_attrVal, _attrName){
						item.setAttribute(_attrName , _attrVal);	
						});
				}else{
					item.setAttribute(attrName , attrVal);	
				}
				})
			},
		width : function(v){
			if (v) return this.css('width' , v);	
			return this.offset('width');		
			},
		height : function(v){
			if (v) return this.css('height' , v);	
			return this.offset('height');		
			},
		pos : function(){
			var elem = this.stack[0];
			if (!elem) return {};
			if(!elem.getBoundingClientRect){
				  var x_ = y_ = 0;
				  while(elem.offsetParent){
					  x_ += elem.offsetLeft;
					  y_ += elem.offsetTop;
					  elem = elem.offsetParent;
				  }
				  x_ += elem.offsetLeft;
				  y_ += elem.offsetTop;
				  return {left :x_,top :y_}
			  }else{
				  var body = document.compatMode == 'CSS1Compat' ? document.documentElement : document.body;
				  var rect = elem.getBoundingClientRect()
				  return {left :rect.left|0 + body.scrollLeft,top :rect.top|0 + body.scrollTop};
			  }
			},
		offset : function(key ){
			var elem = this.stack[0];
			if (key)  return elem ? null : elem[ {'width':'offsetWidth' , 'height':'offsetHeight'}[key] ];
			if (!elem ) return {};	
			var ret = {
				'left' : elem.offsetLeft,
				'top' :  elem.offsetTop
				}
			return ret;
			
			},
		css : function(styleName , styleVal , overRide){
			if (fn.is_object(styleName)) 	styleVal = false;
			if (undefined === styleVal) {
				if (!this.stack.length) return '';
				var elem = this.stack[0];
				return elem.currentStyle ? 
				   elem.currentStyle[styleName]
				   :window.getComputedStyle(elem,null).getPropertyValue(styleName);
				}
			if (overRide){
				this.each(function(item){
					item.style.cssText = '';
					});
				}
			return this.each(function(item){
				if (false === styleVal) {
					fn.each(styleName , function(styleVal, _styleName){
						item.style[_styleName] =   _styleVal;	
						});
				}else{
					item.style[styleName] = styleVal;	
				}
				})
			
			},
		html : function(v){
			if (!v) return this.stack.length ? this.stack[0].innerHTML : '';
			return this.each(function(item){
				item.innerHTML = v;	
				})
			},
		remove : function(){
			if (!this.stack.length ) return;
			fn.reach(this.stack , function(item){
					item.parentNode.removeChild(item) ;	
				})
			},
		toggle : function(showOrHide){
			return this.each(function(item){
				if (undefined === showOrHide) showOrHide = item.style.display == 'none';
				item.style.display = showOrHide ? 'block' :'none';
				});
			
			},
		hide : function(){
			return this.toggle(false);
			},
		show : function(){
			return this.toggle(true);
			}
	}
	
});
