jQuery.support.cors = true;
// 头部搜索
$('.option_s').on('click',function(){
	$('#ul').toggleClass('none');
})
$('#ul').on('click','.li',function(){
	$('#ul').removeClass('none');
	$('.li').removeClass('active');
	$(this).addClass('active');
	$('.option_s').text($(this).text());
})
$('#search_btn').on('click',function(){
	var val = $('.search_box').find('input').val();
	var text = $('.option_s').text();
	if( val == ''){alert('请输入关键字进行搜索');}
	if( text == "商品" && val != ''){window.location.href="goods_list.html";}
	if( text == "品牌" && val != ''){window.location.href="brand_list.html";}
})
/*获取商品一级分类列表接口goodsCategoryOneList
key	String	秘钥key	Y	timestamp	Int(11)	时间戳	Y	sign	String	签名	Y*/
goodsCategoryOneList();
function goodsCategoryOneList(){
	var timestamp = Date.parse(new Date());
    var values=['timestamp'];
    var data={'timestamp':timestamp};
    var sign = doSign(values,data);
    $.ajax({
	    type : "post",
	    url : url+'goodsCategoryOneList', 
	    data:{'timestamp':timestamp,'key':key,'sign':sign}, 
	    dataType : "json",
	    success : function(data){
	    	console.log(data);
	      if( data.status == 1){
	          $.each(data.data,function(i,v){
                  $('<li><a href="men_index.html?cat_id='+v.id+'">'+v.name+'</a></li>').appendTo($('.nav1'))
	          })
	          $('.nav1').on('click','li',function(){
	          	console.log(nav1);
	          	$('.nav1').find('li').removeClass('active');
	          	$(this).toggleClass('active');
	          })
	      } 
	    },
	    error: function (a, b, c) {}  
  })

}