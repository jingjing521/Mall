var user_id = '';//用户id
var address_id = '';//地址id
if(window.localStorage){
    user_id = localStorage.getItem('userId');
}else{
    user_id = getCookie('userId');
}
if(window.localStorage){
    address_id = localStorage.getItem('address_id');
}else{
    address_id = getCookie('address_id');
}
$(function(){
	var ione = $(".one"),
		ithe = $(".the"),
		itwo = $(".two img"),
		tthe = $(".the img");
	var arr = ["images/dd1.jpg","img/2.jpg","img/3.jpg"];
	var oarr = ["images/dd11.jpg","img/222.jpg","img/333.jpg"];
	itwo.each(function(i){
		$(this).click(function(){
			$(".one img").attr("src",arr[i])
			tthe.attr("src",oarr[i])
			itwo.removeClass("active")
			$(this).addClass("active")
		})
		ione.mousemove(function(a){
			var evt = a || window.event
			ithe.css('display','block')
			var ot = evt.clientY-($(".one").offset().top- $(document).scrollTop())-87;
			var ol = evt.clientX-($(".one").offset().left- $(document).scrollLeft())-87;
			if(ol<=0){
				ol = 0;
			}
			if(ot<=0){
				ot = 0;
			}
			if(ol>=240){
				ol=240
			}
			if(ot>=240){
				ot=240
			}
			$("span").css({'left':ol,'top':ot})
			var ott = ot/400*800
			var oll = ol/400*800
			tthe.css({'left':-oll,'top':-ott})
		})
		ione.mouseout(function(){
			ithe.css('display','none')
		})
		
	})
	
	
	
	
});
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

$('.option_s').on('click',function(){
	$('#ul').toggleClass('none');
})
$('#ul').on('click','.li',function(){
	$('#ul').removeClass('none');
	$('.li').removeClass('active');
	$(this).addClass('active');
	$('.option_s').text($(this).text());
})
	
// 头部搜索
$('#search_btn').on('click',function(){
	var val = $('.search_box').find('input').val();
	console.log(val);
	var text = $('.option_s').text();
	console.log(text);
	if( val == ''){alert('请输入关键字进行搜索');}
	if( text == "商品" && val != ''){window.location.href="goods_list.html";}
	if( text == "品牌" && val != ''){window.location.href="brand_list.html";}
})

// 地址
var url ='http://qcap.hangtuosoft.com/index.php?g=app&m=index&a=index&op=';
var upload_url ='http://qcap.hangtuosoft.com/';
var key ="idf5nsi5t0qbemwo12hztbftm53tbv6pht";
// 签名
function doSign(values,data){
    values.sort();
    var str="";
    for(var i in values) {
	   	str+=values[i]+'='+data[values[i]] +'&';       
    }
   str = str.substr(0,str.length-1);
   var key ="idf5nsi5t0qbemwo12hztbftm53tbv6pht";
   var value="idf5nsi5t0qbemwo124213198as";
   var str1 = value+str+'&key='+key+value;
   var sign = (md5(str1)).toUpperCase();
   return sign;
}
// 解析地址
function parseUrl(){
    var url=location.href;
    var i=url.indexOf('?');
    if(i==-1)return;
    var querystr=url.substr(i+1);
    var arr1=querystr.split('&');
    var arr2=new Object();
    for  (i in arr1){
        var ta=arr1[i].split('=');
        arr2[ta[0]]=ta[1];
    }
    return arr2;
}
/*getVerifyCode 获取验证码
1:注册2:找回密码3:验证原手机号4：绑定新手机号
*/
function getVerifyCode(phone,type){
	var timestamp = Date.parse(new Date());
    var values=['timestamp','phone','type'];
    var data={'timestamp':timestamp,'phone':phone,'type':type};
    var sign = doSign(values,data);
    $.ajax({
        type : "post",
        url : url+'getVerifyCode', 
        data:{'type':type,'timestamp':timestamp,'phone':phone,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
        	console.log(data);	
            if( data.status == 1){  
            }else{
            	$('#errorTip').css('display','block');
                $('#errorTip').text(data.data);
            }
        }  
    })
}
/*goSinglePage 单页管理
type	Int	类型	Y	1积分说明2售后帮助3使用帮助4注册协议5服务协议
key	String	秘钥key	Y	
timestamp	Int(11)	时间戳	Y	
sign	String	签名	Y	
 */
function goSinglePage(box,type){
	var timestamp = Date.parse(new Date());
    var values=['timestamp','type'];
    var data={'timestamp':timestamp,'type':type};
    var sign = doSign(values,data);
    $.ajax({
        type : "post",
        url : url+'goSinglePage', 
        data:{'type':type,'timestamp':timestamp,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
            if( data.status == 1){
                box.attr('href',data.data)
            }
        }  
    })
}
/*cookie本地存储*/
function setCookie(name,value){
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function getCookie(name){
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
}
function delCookie(name){
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval=getCookie(name);
	if(cval!=null)
	document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
 




