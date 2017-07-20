// 创建一个函数，第一个值代表要获取的对象，
// 第二个值代表是否给对象赋值
function getInner(obj,value){
	// 判断是否能用textConten
    if(obj.textContent){
    	// 如果能用，判断是否传值，如果为空
    	// 则直接获取值，否则赋值
    	if(value==undefined){
    		return obj.textContent
    	}else{
    		obj.textContent=value;
    	}
    	// 如果不能用textConten则用innerText
    }else{
    	// 判断是否传值，如果为空
    	// 则直接获取值，否则赋值
    	if(value==undefined){
    		return obj.innerText
    	}else{
    		obj.innerText=value;
    	}
    }
}
// 可以直接获取嵌用和外部样式的属性
// 定义一个函数，第一个值表示对象，第二个表示属性
function getStyle(obj,style){
	if(obj.currentStyle){
		return obj.currentStyle[style]
	}else{
		return getComputedStyle(obj,null)[style];
	}
}


// 第一个参数表示要取的东西，第二个参数表示要
// 取得范围(在某个对像下取)
function $(search,obj){//search是一个字符串
	// 如果有对象就用对象获取，若没有就用document中获取
	var obj=obj||document;
	// 判断取出来的东西首个字符是什么，
	// 若是#，则用document下的id获取
	if(typeof(search)=="string"){
		if(search.charAt(0)=="#"){
		return document.getElementById(search.substr(1));
		// 若是“.”，则调用函数getClass获取
	}else if(search.charAt(0)=="."){
		return getClass(search.substr(1),obj);
		// 若都不是则用标签名获取
	}else{
		return obj.getElementsByTagName(search);
	}

	}else if(typeof(search)=="function"){
		window.onload=function(){
			search();
		}
	}
	
}




// 事件绑定的兼容性函数
function addEvent(obj,event,fn){
	
    if(obj.addEventListener){
    	
            obj.addEventListener(event,fn,false);
    }else{
    		obj.attachEvent("on"+event,fn);
    	}
    }

// 事件删除的兼容性函数
function removeEvent(obj,event,fn){
	
    if(obj.removeEventListener){
    	
            obj.removeEventListener(event,fn,false);
    }else{
    		obj.detachEvent("on"+event,fn);
    	}
    }


// 获取滚动条元素位置的封装函数
function getScrollTop(){     
    var scrollTop=0;     
    if(document.documentElement&&document.documentElement.scrollTop){     
        scrollTop=document.documentElement.scrollTop;     
    }else if(document.body){     
        scrollTop=document.body.scrollTop;     
    }     
    return scrollTop;     
} 