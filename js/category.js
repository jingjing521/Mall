
/*所有商品分类列表接口goodsCategoryAllList
key	String	秘钥key	Y	
timestamp	Int(11)	时间戳	Y	
sign	String	签名	Y	
 */
function goodsCategoryAllList(){
	var timestamp = Date.parse(new Date());
    var values=['timestamp'];
    var data={'timestamp':timestamp};
    var sign = doSign(values,data);
    $.ajax({
	    type : "post",
	    url : url+'goodsCategoryAllList', 
	    data:{'timestamp':timestamp,'key':key,'sign':sign}, 
	    dataType : "json",
	    timeout:15000,
	    beforeSend:function(XMLHttpRequest){
	          //alert('远程调用开始...');
	          $("#loading").html("<img src='images/loading.gif' />");
	    },
	    success : function(data){
		    if( data.status == 1){
		    	console.log(data);
		    	$("#loading").css('height','100%');
		    	$("#loading").empty();
	            $.each(data.data,function(i,v){
	              	$('<div class="floor floor-load"><div class="floor-inner comWidth"><div class="floor-head"><span>'+v.name+'</span><img src="images/gtit.png" alt="" class="tit_img"></div><div class="floor-body"><div class="floor-body-inner clearfix"><div class="cate-second"></div></div></div></div>').appendTo($('.floor_list'))
	              	$.each(v.tmenu,function(x,y){
	              		$('<div class="cate-second-temp"><a class="cate-img blink-img" href="goods_list.html" target="_blank"><img src="'+y.logourl+'" class="" height="80" width="70" style="display: inline;"></a><div class="cate-list-fix"><div class="cate-list-title"><a class="ani" href="javascript:void" target="_blank">'+y.name+'</a></div><div class="cate-list-mores"><div class="cate-fix"></div></div></div></div>').appendTo($('.floor').eq(i).find('.cate-second'))
	              		$.each(y.sub_menu,function(m,n){
		              		$('<a href="goods_list.html?cat_id='+n.id+'&name='+n.name+'" target="_blank">'+n.name+'</a>').appendTo($('.floor').eq(i).find('.cate-second-temp').eq(x).find('.cate-fix'))
		              	})
	              	})
	            })
	            // 侧导航
	            $.each(data.data,function(a,b){
	               $('<li class="nav-item"><a class="nav-link" href="javascript:;"><span class="nav-link-text">'+b.name+'</span></a></li>').appendTo($('.nav-list'))
	               $('.nav-list li:first-child').addClass('active');    
	            })
	            var floor = $('.floor');
				var oNav = $('.nav-list');//导航壳
			    var aNav = oNav.find('.nav-item');//导航
			    var sign=true;//这个开关用来控制点击小框时直接跳转而不会滚动		   
			    $(window).scroll(function(){ 
			        if(!sign) {return;}        
			        var winH = $(window).height();//可视窗口高度
			        var iTop = $(window).scrollTop();//鼠标滚动的距离		     
			        if(iTop>=50){
			         //鼠标滑动式改变  
			             floor.each(function(){
			                if(winH+iTop - $(this).offset().top>winH/2){
			                    aNav.removeClass('active');
			                    aNav.eq($(this).index()).addClass('active');
			                }
			             })
			         }	        
			    })
			    //点击回到当前楼层
			    $('.nav-list').on('click','li',function(){
			        sign=false;
			        $('.nav-list li').removeClass('active');
			        $(this).addClass('active');
			        var t = floor.eq($(this).index()).offset().top; 
			        $('body,html').animate({"scrollTop":t},500,function(){
			            sign=true
			        });
			        return false;
			    })
		    } 
		}
    })
}
/*品牌列表接口shopAllList
key	String	秘钥key	Y	
timestamp	Int(11)	时间戳	Y	
sign	String	签名	Y	
*/
function shopAllList(){
	var timestamp = Date.parse(new Date());
    var values=['timestamp'];
    var data={'timestamp':timestamp};
    var sign = doSign(values,data);
    $.ajax({
	    type : "post",
	    url : url+'shopAllList', 
	    data:{'timestamp':timestamp,'key':key,'sign':sign}, 
	    dataType : "json",
	    success : function(data){
	        if( data.status == 1){
	        	console.log(data);
	      	    var pts = data.data.pt;
	      	    $.each(pts,function(i,v){
                    $('<div class="floor floor-load"><div class="floor-inner comWidth"><div class="floor-head"><span>'+v.name+'</span><img src="images/gtit.png" alt="" class="tit_img"></div><div class="floor-body"><div class="limits clearfix"></div></div></div></div>').appendTo($('#floorList'))
                    $.each(v.companylist,function(x,y){
                    	console.log(y)
                       $('<div class="brand"><a class="brand-link" href="store_stails.html?shop_id='+y.shop_id+'&formpage=2" title="" target="_blank"><div class="brand-photo"><img class="" src="'+y.logo+'" style="display: inline;"></div><div class="brand-info"><div class="brand-name" style="color: #000">'+y.name+'</div></div></a></div>').appendTo($('.floor').eq(i).find('.limits'))
                    })
	      	    })
	      	    $.each(pts,function(a,b){
                     $('<li class="nav-item  nav-women"><a class="nav-link" href="javascript:;"><span class="nav-link-text">'+b.name+'</span></a></li>').appendTo($('.nav-list'))
	      	    });
	      	    $(".brand:nth-child(4n)").css("margin-right","0");
	      	    $(function(){
				    $(window).scroll(function() {
				        var currTop = $(window).scrollTop();
				        if (currTop >= 700) { 
				            $(".aside").addClass('aside_fixed')
				        }else{
				            $(".aside").removeClass('aside_fixed')
				        }
				    });
			    })
			    var floor = $('.floor');
				var oNav = $('.nav-list');//导航壳
			    var aNav = oNav.find('.nav-item');//导航
			    var sign=true;//这个开关用来控制点击小框时直接跳转而不会滚动 
			    $(window).scroll(function(){ 
			        if(!sign){return;}        
			        var winH = $(window).height();//可视窗口高度
			        var iTop = $(window).scrollTop();//鼠标滚动的距离
			        if(iTop>=80){
			         //鼠标滑动式改变  
			             floor.each(function(){
			                if(winH+iTop - $(this).offset().top>winH/2){
			                    aNav.removeClass('active');
			                    aNav.eq($(this).index()).addClass('active');
			                }
			             })
			         }else{
			         	 aNav.removeClass('active');
			         }       
			    })
			    //点击回到当前楼层
			    $('.nav-list').on('click','li',function(){
			        sign=false;
			        $('.nav-list li').removeClass('active');
			        $(this).addClass('active');
			        var t = floor.eq($(this).index()).offset().top; 
			        $('body,html').animate({"scrollTop":t},500,function(){
			            sign=true
			        });
			        return false;
			    })
	        } 
	    },
	    error: function (a, b, c) {}  
  })
}
/*更多品牌列表接口
shopAllListMore
cat_id	Int(11)	分类id	Y	0为精选 商品分类id
page	Int(11)	页数	N	
key	String	秘钥key	Y	
timestamp	Int(11)	时间戳	Y	
sign	String	签名	Y	*/
function shopAllListMore(cat_id,page){
	var fromtype = 'pc';
	var timestamp = Date.parse(new Date());
    var values=['timestamp','cat_id','fromtype'];
    var data={'timestamp':timestamp,'fromtype':fromtype,'cat_id':cat_id};
    var sign = doSign(values,data);
    $.ajax({
	    type : "post",
	    url : url+'shopAllListMore', 
	    data:{'timestamp':timestamp,'fromtype':fromtype,'cat_id':cat_id,'key':key,'sign':sign}, 
	    dataType : "json",
	    success : function(data){
	    	console.log(data);
	        if( data.status == 1){
	        	$.each(data.data,function(i,v){
	        		$('<li class="logo-item"><a href="store_stails.html?shop_id='+v.shop_id+'&formpage=2" target="_blank" class="logo-item-link" data-track="done" style="z-index: 8;"><span class="logo-item-img"><img class="" src="'+v.logo+'"></span></a></li>').appendTo($('#brandLogoList'));
	        	})   
	        }else{
	        	$('#search_letter').css('display','none');
	        	$('.brand-category').css('display','none');
	        }
	    },
	    error: function (a, b, c) {}  
  })
}
