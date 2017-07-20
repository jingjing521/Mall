//分享
$('.share_icon').hover(function(){
        $('.share_list').css('display','block');
    },function(){
        $('.share_list').css('display','none');
    });

$('#catPerPos').on('click','.multi-option-item',function(){
	$('#catPerPos .multi-option-item').removeClass('active');
	$(this).addClass('active');
})
$('#catPerPos1').on('click','.multi-option-item',function(){
	$('#catPerPos1 .multi-option-item').removeClass('active');
	$(this).addClass('active');
})
// 商品介绍
$(function(){
var h = $('.goods_detail').offset().top;
$(window).scroll(function() {
	    var currTop = $(window).scrollTop();
	    if (currTop >=h) { 
	        $(".M-detailTop").addClass('M-detailTopFixed');
	        $(".dt-cart").css('display','block');
	    }else{
	    	$(".M-detailTop").removeClass('M-detailTopFixed');
	    	$(".dt-cart").css('display','none')
	    }
    });
    var oNav = $('.tt');//导航壳
    var aNav = oNav.find('li');//导航
    var aDiv = $('.three .content1');//楼层
    var sign=true;//这个开关用来控制点击小框时直接跳转而不会滚动
    $(window).scroll(function(){	
        if(!sign){return;}	   	 
		 var winH = $(window).height();//可视窗口高度
		 var iTop = $(window).scrollTop();//鼠标滚动的距离
		 if(iTop >= 530){
		 //鼠标滑动式改变	
			aDiv.each(function(){
			 	if(winH+iTop - $(this).offset().top>winH/2){
			 		aNav.removeClass('selected');
			 		aNav.eq($(this).index()).addClass('selected');
			 	}
			})
		 }
	})
	// 描点链接跳转
     $('.dt-list').on('click','li',function(){
     	$('.dt-list li').removeClass('selected');
     	$(this).addClass('selected');

    })

// var h = $('.goods_detail').offset().top;
// console.log(h);
// $(window).scroll(function() {
// 	    var currTop = $(window).scrollTop();
// 	    if (currTop >=700) { 
// 	        $(".M-detailTop").addClass('M-detailTopFixed')
// 	    }else{
// 	    	$(".M-detailTop").removeClass('M-detailTopFixed')
// 	    }
//     });
//     var oNav = $('.tt');//导航壳
//     var aNav = oNav.find('li');//导航
//     var aDiv = $('.three .content');//楼层
//     var sign=true;//这个开关用来控制点击小框时直接跳转而不会滚动
//     $(window).scroll(function(){

//         if(!sign){return;}	   	 
// 		 var winH = $(window).height();//可视窗口高度
// 		 var iTop = $(window).scrollTop();//鼠标滚动的距离
// 		 if(iTop >= 700){
// 		 	$('#time').css('display','inline-block');
// 		 	$('#J-topbar-addBtn').css('display','inline-block');
// 		 //鼠标滑动式改变	
// 			aDiv.each(function(){
// 			 	if(winH+iTop - $(this).offset().top>winH/2){
// 			 		aNav.removeClass('selected');
// 			 		aNav.eq($(this).index()).addClass('selected');
// 			 	}
// 			})
// 		 }else{
// 		 	$('#time').css('display','none');
// 		 	$('#J-topbar-addBtn').css('display','none');
// 		 }
// 	})
	 
//      $('.dt-list').on('click','li',function(){
//      	sign=false;
//         $('.dt-list li').removeClass('selected');
//       	$(this).addClass('selected');
//       	var t = aDiv.eq($(this).index()).offset().top;
//       	$("html, body").animate({
// 	      scrollTop: t
// 	    }, 500, function(){sign=true});
// 	    return false;
//     })

})
function timeS(num){
	return ('0'+num).slice(-2);
}
function FreshTime(){
	//这两个是后台返回的时间戳，为了便于测试把开始时间变成当前本地的时间
	var attr_s = 1483327380;
	var attr_e = 1485487620;	
	var startTime = new Date().getTime();
	var endTime = parseInt(attr_e*1000);
	var differTime = endTime - startTime; //两时间差
	var d = parseInt(differTime/(24*60*60*1000));
	var h = parseInt(differTime/(60*60*1000)%24);
	var m = parseInt(differTime/(60*1000)%60);
	var s = parseInt(differTime/1000%60);
	var t_html = "剩余："+d+"天"+timeS(h)+"时"+timeS(m)+"分"+timeS(s)+"秒";
	$("#time").html(t_html);
	if(differTime<=0){
		$("#time").html('活动已结束');
		clearInterval(timer);
	}
}
FreshTime();
var timer = setInterval(FreshTime, 1000);