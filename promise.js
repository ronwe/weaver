fml.define('weave/promise' , ['weave/fn'] , function(require,exports){
	var fn = require('weave/fn')	
	function _promise(){
		this._clear()
		return this
		}	

	_promise.prototype = {
		constructor : _promise,
		wait : function(fnc){
			this._waits.push(fnc)
			return this
			},
		then : function(ondone , onfail){
			ondone && this._ondone.push(ondone)
			onfail && this._onfail.push(onfail)
			},
		resolve : function(){
			this._accept('resolve' , arguments)
			},
		reject : function(){
			this._accept('reject' , arguments)
			},
		_accept :function(action , data){
			if (!this._ondone.length && !this._onfail.length){
				var self = this
				window.setTimeout(function(){
					self[action].apply(self ,data)
					} , 0)
				return
				}
			if ('resolve' == action && this._waits.length){
				var fnc = this._waits.shift()
				fnc.apply(this , data )
				return
			}
			fn.map('resolve' == action ? this._ondone : this._onfail,function(fnc){
				fnc.apply(null , data)
				})
			this._clear()
			
			
			},
		_clear : function(){
			this._waits = []
			this._ondone = []
			this._onfail = []
			}
		}
	
	
	function Promise(chain){
		return (chain instanceof _promise) ? chain : new _promise
		
		}
	Promise.when = function(){
		var p = new _promise
		fns = Array.prototype.slice.call(arguments,0)
		fn.map(fns,function(fnc){
			p.wait(fnc)
			}) 
		fns[0].call(p)
		return p

		}
	return Promise
	})
