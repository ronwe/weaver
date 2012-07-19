fml.define('weave/weave', ['weave/query','weave/event' , 'weave/html','weave/promise' , 'weave/fn','weave/ajax'],
	function(require , exports){
		var selector = require('weave/query')
		var query = selector.search,
			html = require('weave/html'),
			event = require('weave/event'),
			fn = require('weave/fn')
		var WP = wrapper.prototype,
			undefined = undefined
		function wrapper(path , doc){
			//this.stack = [];

			if (!path) return this
			var stack; 
			if (fn.is_string(path) ){
				//todo if <div></div> create it
				if (/<.*?>/.test(path)){
					stack = this.create(path)
				}else stack = query(path , doc) 
			}else {
				//is weaver object or dom object 
				if (fn.is_html(path) ) stack = selector.cols2Arr(path)
				else stack = path.getAll()
			}
				
			return _mkStack( stack ,this)
			}	
		WP.each = function(fnc){
			for (var i = 0 ; i < this.length ; i++){
				if (false === fnc.call(this,this[i])) break
				}
			return this	
			}
		/*dom filter*/
		WP.create = selector.create
		WP.find = function(path){
			var ret = [] 
			fn.map(this.stack , function(elem){
				ret = ret.concat(query(path , elem)) 	
				})
			return _mkStack( ret)
			}

		WP.not = function(path){
			return this.is(path , true)
			}
		WP.is = function(path , isnot){
			var ret = [] ,
				is = !isnot
			var queryJudge = selector.judge
			this.each( function(elem){
				if (! (is ^ queryJudge(path , elem)) ) ret.push(elem)
				})
			return _mkStack( ret)
			}

		WP.eq = function(index , slicelen){
			 return _mkStack( fn.slice(this.getAll(),index , slicelen) )
			 }
		WP.next = function (prev){
			var elem = this.get(0)
			if (!elem) return this 
			return _mkStack( selector.getNext(elem , prev ))
			}
		WP.prev = function (){
			return this.next(true)	
			}
		WP.childs = function (rule){
			return _mkStack(  selector.getChilds(this.getAll() , rule))

			}
		// parent() parent(2) parent('.a')
		WP.parent = function (param){
			var level = 1
			if (param > 0) {
				level = param
				param = null
				}
			
			var ret = this.getAll()
			while (level-- > 0){
				ret = selector.getParent(ret , param)
			}
			return _mkStack( ret)
			}
		WP.get = function (index){
			  return this[index]
			  }
		/**/
		//WP = html;
		fn.extend(WP , html)
		fn.extend(WP , event)
		
		
		html = null
		event = null
		WP.toString = WP.getAll = function(){
			var ret = []
			for(var i = 0 ; i < this.length ; i++) ret.push(this[i])
			return ret
			}
		function _mkStack(stack , thisObj){
			if (!thisObj) thisObj = new wrapper
				
			if (!stack ) stack = []
			else if(!fn.is_array(stack)) stack = [stack]
			fn.map(stack,function(item , key){
				thisObj[key] = item
				})
			thisObj.length = stack.length
			return thisObj	
			}

		function weaver(path , doc){
			return new wrapper(path , doc)
		}
		//fn.extend(weaver , fn);
		weaver.fn = fn
		weaver.ajax = require('weave/ajax')
		weaver.promise = require('weave/promise')
		return weaver
	})
