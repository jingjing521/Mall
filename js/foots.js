$('<div class="inner"><div class="flist"><h4>关于我们</h4><div><a href="foor.html?id=7" target="_blank">公司简介</a></div><div><a href="foor.html?id=8" target="_blank">联系我们</a></div></div><div class="flist" id="links"><h4>友情链接</h4></div><div class="flist"><h4>新手指南</h4><div><a href="foor.html?id=9" target="_blank">账户注册</a></div><div><a href="foor.html?id=10" target="_blank">购物流程</a></div></div><div class="flist"><h4>支付方式</h4><div><a href="foor.html?id=11" target="_blank">在线支付</a></div></div><div class="flist"><h4>售后服务</h4><div><a href="foor.html?id=12" target="_blank">售后帮助</a></div></div><div class="flist"><h4>帮助</h4><div><a href="foor.html?id=13" target="_blank">找回密码</a></div><div><a href="foor.html?id=14" target="_blank">隐私说明</a></div></div><div class="flist service"><img class="qrcode wechat_code_img " src="images/code11.png" alt=""><h4 style="color: #666;font-size: 15px;">扫描关注微商城</h4></div><div class="flist last" style="float:left;"><img class="qrcode app_code_img" src="images/code11.png"><h4 style="color: #666;font-size: 15px;">手机APP下载</h4>	</div></div><div class="record">Copyright 2007-2108 xxx.com All rights Reserved 京ICP备00001号 公安网安备110112119号  出版物经营许可证新出发京批第直110120号&nbsp;</div>').appendTo($('#com-foot'))
var height = $(window).height();
var height1 = $('#com-foot').height();
var height2 = $('#header').height();
var h = height-height1-height2-110-50;
$('.indexMain').css('min-height',h);
// getLinksList --友情链接
getLinksList();
function getLinksList(){
    var timestamp = Date.parse(new Date());
    var values=['timestamp'];
    var data={'timestamp':timestamp};
    var sign = doSign(values,data);
    $.ajax({
        type : "post",
        url : url+'getLinksList', 
        data:{'timestamp':timestamp,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
            if( data.status == 1){ 
                console.log(data);
            	$.each(data.data,function(i,v){
            		$('<div><a href="'+v.link_url+'">'+v.link_name+'</a></div>').appendTo($('#links'))
            	});
                var app_code_img = data.extra.app_code_img;
                var wechat_code_img = data.extra.wechat_code_img;
                $('.app_code_img').attr('src',app_code_img);
                $('.wechat_code_img').attr('src',wechat_code_img);
                $('.record').text(data.extra.copyright);

            } 
        }
    })
}
// 头部
$(' <div class="inner comWidth clearfix"><ul class="leftArea clearfix"><li><a href="register.html">注册</a> </li><li><a href="login.html">登录</a> </li></ul><ul class="rightArea clearfix"><li class="drop cart-wrapper"><a class="my-cart"><em class=""></em>购物车</a></li><li><a href="javascript:void(0)" class="collect"><em class="order"></em>收藏夹</a></li><li class="drop"><a href="javascript:void(0)" id="help">帮助中心<em class="arrow"></em></a></li><li class="auth_status"><a href="javascript:void(0)" class="last">商家入驻</a></li></ul></div>').appendTo($('#com-topbar'))

