fml.define('weave/event',['weave/fn','weave/data','weave/query'] , function(require , exports){

	var fn = require('weave/fn'),
		eventData = require('weave/data'); 
	function wrapEvent(e){
		if (!e.target) e.target = window.event.srcElement || document;
		
		}

	function unWrapBind(elem , type , fnc){
		if (!fnc) {
			eventData.removeData(elem , type);
		}else {
			var fnStack = eventData.getData(elem , type);
			var fn_id = fn.indexOf(fnStack , fnc);
			if (fn_id>-1) fnStack.splice(fn_id,1)
		}
		
		}
	function wrapBind(elem , type , fnc){
		var fnStack = eventData.getData(elem, type);

		if (0 == fnStack.length) {
			var callback = function(evt){
				//var fnStack = eventData.getData(elem , type);
				fn.map(fnStack , function(fn_item){
					fn_item.call(elem , evt);
					});
				}

			bind(elem , type , callback);
		}
		fnStack.push(fnc);
		
		}	
	function bind (elem , type , callback){
		if (elem.addEventListener)
			elem.addEventListener(type , callback , false);
		else
			elem.attachEvent("on" + type, callback);
		}

	return {
		'click' : function(callback){ return this.bind('click' , callback);},
		'trigger' : function(type) {
			this.each(function(elem){
				if (document.createEventObject) {
					 var evt = document.createEventObject();
					 elem.fireEvent('on'+ type,evt)

				}else{
					var evt = document.createEvent("MouseEvents");
					 evt.initMouseEvent(type, true, true, window,
						  0, 0, 0, 0, 0, false, false, false, false, 0, null);
					elem.dispatchEvent(evt);
					}
				});

			
			},
		'unbind' : function(type , fnc){
			this.each(function(elem){
				unWrapBind(elem , type , fnc);
				});
			
			},
		'bind' : function(type , fnc){
			if (!fnc || !type) return this;
			this.each(function(elem){
				wrapBind(elem , type , fnc);
				});
			return this;
			},
		'once' : function(type , fnc){
			var objThis = this;
			this.bind(type , function(){
				fnc.call(this);
				objThis.unbind(type , arguments.callee);
				});
			return this;
			},
		'on' : function(elemExp , type , fnc){
			var objThis = this;
			var is = require('weave/query').judge ;
			var bindFn;
			
			if (arguments.length < 3) {
				fnc = arguments[1]; 
				type = arguments[0] ; 
				elemExp = 'on';

				wrapBind(document , type , bindFn = function(e){
					wrapEvent(e); 
					objThis.each(function(ele){
						if (ele == e.target) {
							fnc.call(ele,e);
							return false;
							}
						});
					
					});
			}else{
				this.bind(type ,bindFn = function(e){
					wrapEvent(e); 
					if (is(elemExp , e.target)) {
						objThis.stopPropagation(e);
						fnc.call(e.target,e);
						};
					
					});
				}
			var fnOn = eventData.getData(fnc);
			fnOn[elemExp] = bindFn;

			return this;	
			},
		// off( 'click' , function) off('click')
		// off('xxx' , 'click' )  off('xxx' , 'click' , function)
		'off' : function(){
			if  (arguments.length == 1 ||  fn.is_func(arguments[1])) {
				var type = arguments[0],
					fnc = arguments[1];
				
				if (fnc) fnc = eventData.getData(fnc , 'on');
				unWrapBind(document , type , fnc);
			}else {
				var type = arguments[1],
					fnc = arguments[2];
				if (fnc) fnc = eventData.getData(fnc , arguments[0]);
				this.unbind(type , fnc);
				}
			
			},
		'stopPropagation': function(evt){
			if (evt && evt.stopPropagation) evt.stopPropagation();
			else window.event.cancelBubble = true;
			}
		};		
	});
