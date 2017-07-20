

// 创建一个函数
function getClass(classname,obj){
    // 参数有两个 一个表示取出来的类名，一个表示从对象中取出类名 
	var obj=obj||document;
	// 若传参则按参数走，若不传参则自定义为document
	if(obj.getElementsByClassName){
		// 判断是否能用此属性 若有则直接执行 
		return obj.getElementsByClassName(classname);
	}else{
		// 若没有则取出所有元素进行比较
		var arr=[];
		// 定义一个空数组用来存放所有的元素
        var alls=document.getElementsByTagName('*');
        // 取出所有元素
        for(var i=0;i<alls.length;i++){
        	// 判断如果取出来的名字等于需要的名字则直接放到数组arr之后
        	// 调用判断函数checkClass并且把checkclass的返回值赋给b
        	// checkClass();
        	var b=checkClass(alls[i].className,classname);
        	if(b){
        		arr.push(alls[i]);
        	}
        }return arr;
	}
}
// 创建一个检查类名的函数 参数有两个，一个为查找到的类名(search),
// 一个为需要查找的类名(match)
function checkClass(search,match){
	// 若找到的元素有多个类名，需要把它的类名用空格分割为数组
   var  bb=search.split(" ");
   // 将分割好的类名与需要的类名进行判断
   for(var i=0;i<bb.length;i++){
   	if(bb[i]==match){
   		return true;
   	}
   }
   return false;
}


// 获取元素节点/元素+文本节点的封装函数
// 定义type若为a则为获取元素节点，
// 若为b则为获取元素+文本节点

function getChilds(obj,type){
// 第一个参数为对象(即哪个对象下的子节点),
// 第二个参数为类型
var type=type||"a";
// 定义type，若传type则用type，若不传则默认为a
var all=obj.childNodes;
// 将obj下的全部子节点定义为all
var arr=[];
// 定义一个空数组以便后面往进放取得的值
for(var i=0;i<all.length;i++){
  // 循环取得所有的子节点
  if(type=="a"){
      if(all[i].nodeType==1){
        arr.push(all[i]);
      }
  }else if(type=="b"){
      if(all[i].nodeType==1||(all[i].nodeType==3&&all[i].nodeValue.replace
        (/^\s*|\s*$/g,""))){
        arr.push(all[i]);
      }
  
}
}
   return arr;
}

// 获取第一个子节点
function getFirst(obj){
  return getChilds(obj)[0];
}
// 获取最后一个节点
function getLast(obj){
 var nub=getChilds(obj);
 // 返回元素的最后一个 
 // 最后一个即为所有元素的长度减一
 return nub[nub.length-1];
}
 // 获取下一个兄弟节点
 function getNext(obj){ 
  // 定义obj的下一个兄弟节点为next
     var next=obj.nextSibling;
     if(next==null){
      return false;
     }
     while(next.nodeType==8||next.nodeType==3){
        // 将下一个节点赋给next
        next=next.nextSibling;
        if(next==null){
          return false
        }
    }
    return next;
 }


// 获取上一个兄弟节点
function getPrevious(obj){
  // 定义obj的下一个兄弟节点为next
     var prev=obj.previousSibling ;
     if(prev==null){
      return false;
     }
     while(prev.nodeType==8||prev.nodeType==3){
        // 将下一个节点赋给next
        prev=prev.previousSibling;
        if(prev==null){
          return false
        }
    }
    return prev;
 }

 // 添加到某个对象前,使用时直接调用不用写父元素.
 function insertBefore(obj,before){
  // 参数obj要添加的对象，before是要将obj添加到before之前
 var parent=before.parentNode;
 // 获取到before的父节点
 parent.insertBefore(obj,before);
 }


// 添加滚轮效果的封装函数
function mousewheel(obj,funUp,funDown){
   if(obj.attachEvent){
    // 在IE中，scroll为函数名
    obj.attachEvent("onmousewheel",scroll)
   }else if(obj.addEventListener){
    obj.addEventListener("mousewheel",scroll,false);
    obj.addEventListener("DOMMouSeScroll",scroll,false);
   }
   function scroll(e){
      var ev=e||window.event;
      // 获取滚轮方向赋值给d
      var d=ev.wheelDelta||detail;
      if(d==-120||d==3){
        if(funDown){
          funDown();
        }
      }else if(d==120||d==-3){
        if(funUp){
          funUp();
        }
      }
   }
}
// ajax
var $={};
  $.ajax=function(url,callback){
      var xhr=new XMLHttpRequest();
      xhr.open('get',url,true);
      xhr.send();
      xhr.addEventListener("readystatechange",function(){
      if(this.readyState!==4){
        return;
      }
      if(this.status===200||this.status===304){
        callback(this.response);
      }
    })
  }