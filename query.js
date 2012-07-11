fml.define('weave/query',['weave/fn'],function(require , exports){
	var AP = Array.prototype;
	var fn = require('weave/fn');
	/* #id .class a b a>b 
	getElementsByClassName *
	getElementsByTagName *
	getElementsByName
	getElementById
	*/
	var collects = [];
	var idReg = /\#([\w\_\-]+)/,
		clsReg = /\.([\w\_\-]+)/,
		attrReg = /\[([^\]]+)\]/;

	function selector(path , doc){
		path = path.trim();
		var rules = path.split(' ') ;

		//find a id if consist one
		var idClt,clsClt , tagClt;
		fn.map(rules , function(rule){
			if (idReg.test(rule) ) {
				idClt = rule; 
			 }else if(clsReg.test(rule)){
				 clsClt = rule;
				 }
			});
		
		var firstClt = idClt || clsClt || rules[0];
		var ret = findSec (firstClt , doc ,'>');
		var rulePart = getRuleInPart(rules , firstClt);
		//if (! isRawParent(rulePart.ahead , ret) ) return [];
		if (! getParent(ret , rulePart.ahead ) ) return [];
		
		//console.log('now' , ret , rulePart.after);
		if (rulePart.after.length) ret = getAfter(ret ,  rulePart.after);
		//console.log('after' ,ret);
		return ret;	
		}
	function getAfter(node , rules ){
		var rule = rules.shift();
		if (!rule) return node;

		var ret = [];
		fn.map(node , function(node_item){
			var ret_af = findSec (rule , node_item ,'>');
			//console.log('=> ',rule  ,node_item , ret_af);
			if (ret_af && ret_af.length)	ret = ret.concat(ret_af);

			});
		if (rules.length) ret = getAfter(ret , rules);

		return ret;
			
		}
	function getRuleInPart(rules , firstClt){
		var parent_rule = [],first_rule_id = false,
			child_rule = [];
		fn.map(rules , function(rule_i,i){
				if ( rule_i== firstClt){
					first_rule_id = i;
				}else{
					if (false ===first_rule_id)  parent_rule.unshift(rule_i);
					else child_rule.push(rule_i);
				}
			});
		return {'ahead' :parent_rule , 'after' : child_rule};
		}
		
		
	function findSec(rule , col, symbol){
		if (!rule || !col) return false;

		rule = rule.split(symbol);
		var collect_sec = getElements(rule[0] , col); 
		
		var symFn = {'>' : getChilds}[symbol];
		fn.map(rule, function (ri , i){
			if (i) collect_sec = symFn(collect_sec , ri);
			});
			
		
		return collect_sec;	
		}
	function getParent(child , rules){
		//judgeRule
		if (fn.is_array(child)) child = child[0];
		if (!child) return;
		if (!fn.is_array(rules)) rules = [rules];
		fn.each(rules , function(rule){
			while (child = child.parentNode){
				if (!child || child == document) return child = false;
				if (!rule || judgeRule(rule,child)) return;
				
				}
			return ;
			
			});
		return child;
		}

	function getChilds(col , rule){
		var ret = [];
		fn.map(col ,function(item){
			fn.each(item.childNodes , function(child){
				if (1 == child.nodeType && (!rule || judgeRule(rule , child))) ret.push(child); 
				});
			});
		return ret;
		}
	function getElements(rule , col){
		// 支持伪类 support Pseudo-classes http://stylechen.com/javascript-selector.html
		if (rule.indexOf(':')){
			var pseudo = rule.split(':');
			rule = pseudo.shift();
			if (!pseudo.length) pseudo = null;
			}
		var element;
		var id,cls;
		if ( id = rule.match(idReg) ){
			element = document.getElementById(id[1]);
			if (element && !judgeRule(rule , element )) element = null;
		}else if ( cls = rule.match(clsReg) ){
			if (fn.is_array(col) ){
				///TODOconsole.log('byclass todo', col);
			}else{
				element = col.getElementsByClassName(cls[1]);
			}
		}else{
			//byClassName byTagName
			if (col && undefined == col.length)
				element = col.getElementsByTagName(rule);	
				//console.log('....' , col,rule,element , htmlCols2Arr(element));
			}

		return htmlCols2Arr(element , pseudo) || [];

		}
	/*node method*/
	function getNext(htmle, prev){
		htmle = prev ? htmle.previousSibling : htmle.nextSibling;
		if (1 != htmle.nodeType ) htmle = getNext(htmle , prev);
		return htmle;
			}
	function getFirstChild(htmle){
		if (fn.is_array(htmle)) htmle = htmle[0];
		htmle = htmle.firstChild;
		if (3 ==  htmle.nodeType) htmle = getNext(htmle);
		return htmle;
		}
	function getLastChild(htmle){
		if (fn.is_array(htmle)) htmle = htmle[0];
		htmle = htmle.lastChild;	
		if (3 ==  htmle.nodeType) htmle = getNext(htmle , true);
		return htmle;
			}
	function getAllChilds(htmle){
		var childs = htmle.childNodes ,
			j = childs.length;
		var ret = [];
		fn.each(childs , function(child){
			if (1 == child.nodeType  )  ret.push(child);
			});
		return ret;
		
		}
	/*node method
	* @return true|false|htmlelement
	*/
	function pseudoFilter(htmle , pseudo ,htmls){
		if (!pseudo || !pseudo.length) return;	
		var j = pseudo.length;
		for (var i=0;i<j;i++){
			switch (pseudo[i]){
				case 'first-child':
					if (htmls){
						var htmls_count = htmls.length;
						for (var i = 0 ; i < htmls_count;i++)
							if (1 == htmls[i].nodeType) return htmls[i];
						}
					return   getFirstChild(htmle.parentNode)  ;
					break;
				case 'last-child':
					if (htmls){
						for (var i = htmls.length-1;i >=0 ;i--)
							if (1 == htmls[i].nodeType) return htmls[i];
						}
					return getLastChild(htmle.parentNode);
					break;
				case 'checked':
					if (!htmle.checked)  return false;
					break;
				}
			}
		return true;
		}

	function htmlCols2Arr(htmls , pseudo){
		var ret = [];
		if (!htmls) return ;
		//console.log(htmls , typeof htmls);
		if (undefined == htmls.length && htmls.nodeType == 1) return [htmls];
		
		
		var htmls_count = htmls.length;
		for (var i = 0 ;i < htmls_count; i++){
			var htmle = htmls[i];
			if ( htmle.nodeType == 1) {
				if (!pseudo) ret.push(htmle);
				else {
					var psedudo_result = pseudoFilter(htmle , pseudo ,htmls);
					if (false !== psedudo_result){
						if (true === psedudo_result) ret.push(htmle);
						else ret.push(psedudo_result);
						break;
						}
					}
				}
			}
		return ret;
		}
	/*
	*tag#id tag.class tag~[attr]
	*/
	function judgeRule(rule , element ){
		if (!element) return false;
		var secs = rule.replace(/([\#\.\[])/g , '|$1').split('|');
		var ret = true;
		fn.map(secs ,function(sec){
			if ('' == sec) return;
			switch (sec.charAt(0)){
				case '#':
					if (element.id != sec.substr(1) ) return ret = false;
					break;
				case '.':
					if (-1 == element.className.indexOf(sec.substr(1))) return ret = false;			
					break;
				case '[':
					sec = sec.substr(1, sec.length-2).split('=');	
					var attr = element.getAttribute(sec[0]);
					if (null == attr) return ret = false;
					if (sec[1] && attr!= sec[1]) return ret = false;	
					break;
				default:
					if (element.tagName != sec.toUpperCase()) return ret = false;
				}
			
			});

		return ret;
	};
	function create(html){
		 var wpnl = document.createElement('div');
		 wpnl.innerHTML = html;
		 wpnl = wpnl.childNodes;
		 return htmlCols2Arr(wpnl);
	 };
		
	var cssSupport = !!document.querySelectorAll;
	cssSupport = false;
	exports.cols2Arr = function(htmls){
		return htmlCols2Arr(htmls);
		};
	exports.judge = judgeRule;
	exports.getParent = getParent;
	exports.getChilds = getChilds;
	exports.getNext = getNext;
	exports.create = create;
	exports.search = function(path , doc){
		var doc = doc||document;
		collects = [];
		return cssSupport ? AP.slice.call(doc.querySelectorAll(path)) : selector(path , doc);	
		
		}
});
