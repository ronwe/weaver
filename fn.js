fml.define('weave/fn' ,[] , function(){
		var AP = Array.prototype;
		var SP = String.prototype;
		/*
		 * method : stringify(obj);
		 * return : json string
		 * source : https://gist.github.com/754454
		 */
		if (!window.JSON){
			window.JSON = { 
				stringify : function (obj) {
					var t = typeof (obj);
					if (t != "object" || obj === null) {
						if (t == "string") obj = '"' + obj + '"';
						return String(obj);
					} else {
						var n, v, json = [], arr = (obj && obj.constructor == Array);
						var self = arguments.callee;
						for (n in obj) {
							v = obj[n];
							t = typeof(v);
							if (obj.hasOwnProperty(n)) {
								if (t == "string") v = '"' + v + '"'; 
								else if (t == "object" && v !== null) v = self(v);
								json.push((arr ? "" : '"' + n + '":') + String(v));
								}
							}
						return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
						}
					},
				parse : function(str){
					return eval('(' + str + ')');
					}
				}
			}
		/*fix prototype*/
		if (!('trim' in SP)) {
			String.prototype.trim = function(){
				return this.replace(/^\s+/g,'').replace(/\s+$/g ,'') ;
			}
		}
		
		function _detectType(param , type){
			return Object.prototype.toString.call(param) == "[object "+type+"]";
			
			}
		var _export = {
			is_func : function(func) {
				return _detectType(func , "Function");
				},
			is_number : function(param){
				return _detectType(func , "Number");
				},
			is_string : function(str) {
				return _detectType(str , "String");
				},
			is_array : function(arr) {
				return _detectType(arr , "Array");
				},
			is_object : function(arr) {
				return _detectType(arr ,  "Object");
				},
			is_html : function(dom,is_collects){
				var tag = is_collects ? 'HTMLCollection' : 'HTML';
				return Object.prototype.toString.call(dom).indexOf(tag) > 0;
				},
			http_build_query : function(params){
				var qs = [];
				for (var k in params)
					qs.push(encodeURIComponent(k) + '=' + encodeURIComponent( params[k] ));
				return qs.join('&');
				},
			object_keys:Object.keys || function(arr){
				var ret = [];
				for (var k in arr) {
					if (arr.hasOwnProperty) ret.push(k);
				}
				return ret;
				},
			slice: function(arr , index , slicelen){
			   if (index < 0 ) index += arr.length;
			   if (!slicelen ) slicelen = 0 === slicelen ? arr.length: 1;
			   slicelen += index;
			   return arr.slice(index , slicelen);
				
				},
			clone : function(arr , indeep){
				if (this.is_array(arr) ) return arr.concat();
				if (this.is_object(arr) ) {
					if (undefined === indeep) indeep = true;
					var ret = {};
					for (var k in arr) {
						if (arr.hasOwnProperty) {
							ret[k] = (indeep && this.is_object(arr[k])) ? this.clone(arr[k]) : arr[k];
						}
					}
					return ret;
					}
				
				
				},
			extend : function(target , ext){
				for (var k in ext) target[k] = ext[k];
				return target;

				},
			reach : function(list , call){
				for (var i = list.length-1 ; i>=0 ; i--){
					if (false === call(list[i],i)) break;
					}
				
				},
			each : function(list , call){
				if (this.is_array(list) ) {
					var list_len = list.length;
					for(var i= 0 ;i< list_len;i++) {
						if (false === call(list[i],i)) break;
						}
				}else{
					for (var k in list){
						if ( false === call(list[k] ,k)) break;
						}	
					}
				},
			forEach : AP.forEach?function(list,call ,scope){
				  list.forEach(call , scope);
				}: function(list , call ,scope){
					var list_len = list.length;
					for(var i= 0 ;i< list_len;i++)
						call.call(scope , list[i],i , list)
				},
			indexOf : AP.indexOf ? function(arr , arr_search){
					return arr.indexOf(arr_search);
				} :function(arr , arr_search){
					for (var i = 0 , j = arr.length ; i < j ;i++){
						if (arr[i] === arr_search) return i;	
						}
					return -1;
				}
			}	

		_export.map = AP.map?function(list,call){
				list.map(call);
				}: _export.each
		return _export;

});
