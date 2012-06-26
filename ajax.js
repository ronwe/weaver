fml.define('core/ajax' ,['core/fn'] , function(require , exports){
	var fn = require('core/fn')
	var jsonp_callId = new Date

	var newXHR = window.ActiveXObject ? function(){
			return new window.ActiveXObject( "Microsoft.XMLHTTP" )
		}:function(){
			return new window.XMLHttpRequest()
			}
	/*
	*url string
	*data object  optional
	*callback function
	*method string get|post|jsonp
	*data_type string text|json|head
	*options object timeout|nocache
	*/
	function ajax(options){
		var method = (options.method || 'GET').toUpperCase(),
			async = (undefined == typeof options.async) ? true : options.async,
			onError = options.onerror,
			callBack = options.callback,
			data_type = (options.data_type || 'text').toUpperCase(),
			headers = options.headers || [],
			data = options.data || null

		function _appendUrl(url , append){
			return (url.indexOf('?')<0? '?':'&') + append
			}	
		if (data) {
			data = fn.http_build_query(data)
			if ('POST' != method ) options.url += _appendUrl(options.url , data)
			}

		if ('JSONP' == method || 'SCRIPT' == method){
			var l = document.createElement('script')
			l.type = 'text/javascript'
			l.onerror = l.onload = l.onreadystatechange = function() {
					var state = this.readyState
					if (!state || 'loaded' == state || 'complete' == state) 
						head.removeChild(l)
				}
			if (callBack) {
				var callBackId = '_' + jsonp_callId++

				options.url += _appendUrl(options.url , '_callback='+callBackId)
				
				window[callBackId] = function(){
					callBack.apply(null ,arguments);
					//delete window[callBackId]
					}
				}

			var head = document.head  || document.getElementsByTagName('head')[0] || document.documentElement
			l.src = options.url
			head.appendChild(l)
			return
			}

		var xhr = new newXHR
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200) {
				if (callBack) {
					if ('HEAD' == data_type) {
						var headers = xhr.getAllResponseHeaders().split("\n")
						var result = {}
						var i = 0;
						fn.map(headers , function(head){
							head = head.split(':')
							var h_k = head[0].trim() ,
								h_v = head[1]; 
							if (! h_k ) return
							result[h_k] = h_v.trim()
							})
					}else {
						var result = xhr.responseText
						if ('JSON' == data_type) result = JSON.parse(result)
					}
					callBack(result)
				}
			}else if(onError)
				onError(res);
				
			}  
		
		if ('POST' == method ) 
			headers["Content-Type"] = "application/x-www-form-urlencoded"
		else
			data = null

		xhr.open(method, options.url, async)  
		if (options.headers){
			fn.each(option.headers , function(head_content , head_key){
				 xhr.setRequestHeader(head_key , head_content)   
				})
			}
		xhr.send(data)  

		if (options.timeout) {
			window.setTimeout(function(){
				xhr.abort()
				onError && onError(false)
				} , options.timeout)
			}
		}	
		

	function wrapAjax(method , args){
		var args = Array.prototype.slice.call( args , 0)
				
		if (fn.is_func(args[1])) args.splice(1 , 0 , null)

		ajax({ 'url' : args[0] ,
			   'data' :  args[1] ,
			   'callback' : args[2] ,
			   'method' : method , 
			   'data_type' : args[3]})	
		
		}
	ajax.post = function(url , data ,callback ,response_type){
		wrapAjax('post' , arguments)
		}
	ajax.get = function(){
		wrapAjax('get' , arguments)
		}
	ajax.jsonp = function(){
		wrapAjax('jsonp' , arguments)
		}
	ajax.script = function(){
		wrapAjax('script' , arguments)
		}

	return ajax
	
	})
