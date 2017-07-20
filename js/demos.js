$(function(){

		$(window).scroll(function() {
		    var currTop = $(window).scrollTop();
		    if (currTop >= 780) { 
		        $(".left").addClass('changeheight')
		    }else{
		    	$(".left").removeClass('changeheight')
		    }
		});
  // 楼层跳转
           var h = $('.first1').height();
           var oNav = $('.left');//导航壳
		   var aNav = oNav.find('li');//导航
		   var aDiv = $('.two .container');//楼层
		   var sign=true;//这个开关用来控制点击小框时直接跳转而不会滚动
		   $(window).scroll(function(){	
		   if(!sign){
              return;
            }	   	 
				 var winH = $(window).height();//可视窗口高度
				 var iTop = $(window).scrollTop();//鼠标滚动的距离
				 console.log(winH,iTop)				 
				 if(iTop>=h){
				 //鼠标滑动式改变	
					 aDiv.each(function(){
					 	if(winH+iTop - $(this).offset().top>winH/2){
					 		aNav.removeClass('curr');
					 		aNav.eq($(this).index()).addClass('curr');
					 	}
					 })
				 }
			})
			//点击回到当前楼层
			$('.left').on('click','li',function(){
				sign=false;
				$('.left li').removeClass('curr');
				$(this).addClass('curr');
				var t = aDiv.eq($(this).index()).offset().top; 
				$('body,html').animate({"scrollTop":t},500,function(){
					sign=true
				});
			 
				return false;
			})

	})

// 首页 --图片轮播
function play(){
	var oBox = document.getElementById('box');
	var oPrev = getByClass(oBox,'prev')[0];
	var oNext = getByClass(oBox,'next')[0];
	var oBigUl = getByClass(oBox,'bigUl')[0];
	var aLiBig = oBigUl.getElementsByTagName('li');
	var oNumUl = getByClass(oBox,'numberUl')[0];
	var aLiNumber = oNumUl.getElementsByTagName('li');
	var nowZindex = 1;
	var now = 0;
	function tab(){
		for(var i=0; i<aLiNumber.length; i++){
		    aLiNumber[i].className = '';
	    }
		aLiNumber[now].className = 'night';	  
		aLiBig[now].style.zIndex = nowZindex++;
		aLiBig[now].style.opacity = 0;
		startMove(aLiBig[now],'opacity',100);
	} 
	for(var i=0; i<aLiNumber.length; i++){
		aLiNumber[i].index = i;
		aLiNumber[i].onclick = function(){
			if(this.index==now)return;
			now = this.index;
			tab();
		  }
	  }
	oNext.onmouseover = oPrev.onmouseover = oBigUl.onmouseover = function(){
		startMove(oPrev,'opacity',100);
		startMove(oNext,'opacity',100)
	}
	oNext.onmouseout = oPrev.onmouseout = oBigUl.onmouseout = function(){
		startMove(oPrev,'opacity',0);
		startMove(oNext,'opacity',0)
	}
	oPrev.onclick = function(){
		now--
		if(now==-1){now=aLiNumber.length-1;}
		tab();
    }
	oNext.onclick = function(){
		now++
		if(now==aLiNumber.length){ now=0;}
		tab();
	}
	var timer = setInterval(oNext.onclick,3000)
	oBox.onmouseover = function(){clearInterval(timer)}
	oBox.onmouseout = function(){timer = setInterval(oNext.onclick,3000)}
}