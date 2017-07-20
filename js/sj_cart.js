$('.checkAll').on('click',function(){
    if($(this).prev('input:checked').is(":checked")){
        $(this).removeClass('cb_checked').addClass('cbn_checked');
        $(this).prev().prop('checked',false);
        $(this).closest('.store_name').next('.order_content').find('.ckbox').removeClass('cb_checked').addClass('cbn_checked');
        $(this).closest('.store_name').next('.order_content').find('.ckbox').prev('input:checked').prop('checked',false);                   
    }else{
        if( $(this).closest('.store_name').next('.order_content').find('.cbn_checked').length != 0 && $(this).closest('.store_name').next('.order_content').find('.cbn_checked').length <  $(this).closest('.store_name').next('.order_content').find('.ckbox').length){
            $(this).removeClass('cb_checked').addClass('cbn_checked');
            $(this).prev().prop('checked',false);
            $(this).closest('.store_name').next('.order_content').find('.ckbox').removeClass('cb_checked').addClass('cbn_checked');
            $(this).closest('.store_name').next('.order_content').find('.ckbox').prev('input:checked').prop('checked',false);                   
        }else{
            $(this).removeClass('cbn_checked').addClass('cb_checked');
            $(this).prev().prop('checked',true);
            $(this).closest('.store_name').next('.order_content').find('.ckbox').removeClass('cbn_checked').addClass('cb_checked');
            $(this).closest('.store_name').next('.order_content').find('.ckbox').prev('input:checked').prop('checked',true);
        }           
    }
    total();
})
var rows = $('.order_content .item_content');
var stores = $('.store_name');
var select_goods_num = $('#select_goods_num');
var select_goods_price=$('#select_goods_price em');
function total(){
    var selected = 0;
    var price = 0;
    var num = 0;
    rows.each(function(i,v){
        if(rows.eq(i).find('label').hasClass('cbn_checked')){
            selected += parseInt(rows.eq(i).find('.J_ItemAmount').val());
            price += parseFloat(rows.eq(i).find('.sub_price').html());
        } 
    })
    select_goods_num.html(selected);
    select_goods_price.html(price.toFixed(2));
    if( selected >0){
        $('.del_more').addClass('active');
    }else{
        $('.del_more').removeClass('active');
    }
}
// 小计
function getSubTotal(tr){
    var tds = $(tr).find('.td');
    var price = parseFloat(tds.eq(2).find('.unit-price').html());
    var count = parseInt(tds.eq(3).find('.J_ItemAmount').val());
    var subTotal= parseFloat(price * count);
    tds.eq(4).find('.sub_price').html(subTotal.toFixed(2));
}
// 单个删除
var del_num = 0;
$('#ajax_return').on('click','.remove',function(){
    var conf = confirm('确定要删除吗？');
    var numAll = $(this).closest('.td').parent().parent().find('.item_content').length;
    var parent = $(this).parents('.cs');
    console.log(numAll);
    if(conf){
        numAll = numAll-1;
        $(this).closest('.td').parent().remove();
        if($(this).closest('.td').parent().find('label').hasClass('cbn_checked')){
           $(this).closest('.td').parent().find('label').removeClass('cbn_checked'); 
        }
          console.log( numAll);
        if( numAll == 0){
            parent.remove();
            console.log($(this).parents(".cs"));
        }
        cart_ids=$(this).closest('.td').parent().attr('cart_id');
        goodsCartDeleteByItem();
    }   
    total(); 
})
// 批量删除
$('.del_more').on('click',function(){
    if(select_goods_num.html() != 0){
        $(this).addClass('active');
        var conf = confirm('确定要删除吗？');
        if(conf){
            rows.each(function(i,v){
                if( rows.eq(i).find('label').hasClass('cbn_checked')){
                    rows.eq(i).remove();
                    rows.eq(i).find('label').removeClass('cbn_checked');                 
                }
            });
            stores.each(function(i,v){
                if( stores.eq(i).find('label').hasClass('cbn_checked')){
                    stores.eq(i).remove();
                    stores.eq(i).find('label').removeClass('cbn_checked');                 
                }
            });
        }
    }
    total();   
})
// 键盘输入事件
$('#ajax_return').on('keyup','.text-amount',function(){
    var tr = $(this).closest('.td').parent();
    var val = parseInt( $(this).val() );
    if ( isNaN(val) || val < 1){val = 1;}
    var all_num = $(this).attr('all_num');
    if(val>=all_num){
        $(this).val(all_num);
    }else{
        $(this).val(val);
    }
    getSubTotal(tr);
    total();  
})
// 删除
$.each($(".cart-con-title"), function(i,v) {
    if($(".cart-con-title").eq(i).children(".commodity").hasClass("select")){
        $(this).parent().remove();
    }
});
$('.goods_cart_list').on('click','.ckbox',function(){
        if($(this).prev('input:checked').is(":checked")){
            $(this).removeClass('cb_checked').addClass('cbn_checked');
            $(this).prev().prop('checked',false);
            if( $(this).closest('.order_content').find('.cbn_checked').length == $(this).closest('.order_content').find('input:checkbox').length){
                $(this).closest('.order_content').prev('.store_name').find('.checkAll').removeClass('cb_checked').addClass('cbn_checked');
                $(this).closest('.order_content').prev('.store_name').find('input:checked').prop('checked',false);
            }else{
                $(this).closest('.order_content').prev('.store_name').find('.checkAll').removeClass('cbn_checked').addClass('cb_checked');
                $(this).closest('.order_content').prev('.store_name').find('input:checked').prop('checked',true);
            }
   
        }else{
            $(this).removeClass('cbn_checked').addClass('cb_checked');
            $(this).prev().prop('checked',true);
            if( $(this).closest('.order_content').find('.cbn_checked').length == $(this).closest('.order_content').find('input:checkbox').length){
                $(this).closest('.order_content').prev('.store_name').find('.checkAll').removeClass('cb_checked').addClass('cbn_checked');
                $(this).closest('.order_content').prev('.store_name').find('input:checked').prop('checked',false);
            }else{
                $(this).closest('.order_content').prev('.store_name').find('.checkAll').removeClass('cbn_checked').addClass('cb_checked');
                $(this).closest('.order_content').prev('.store_name').find('input:checked').prop('checked',true);
            }  
        }
        total();
})
// 数量
$('#ajax_return').on('click','.J_Plus',function(){
    $('.J_Minus').css('cursor','pointer'); 
    var n = $(this).prev('.J_ItemAmount').val();
    n++;
    $(this).prev('.J_ItemAmount').val(n);
    var tr = $(this).closest('.td').parent();
    getSubTotal(tr);
    total();
})
$('#ajax_return').on('click','.J_Minus',function(){
    $('.J_Minus').css('cursor','pointer');
    var n = $(this).next('.J_ItemAmount').val();
    n--;
    $(this).next('.J_ItemAmount').val(n);
    if(n<2){
        $('.J_Minus').css('cursor','not-allowed');
        $(this).next('.J_ItemAmount').val(1);
    }else{
       $('.J_Minus').css('cursor','pointer'); 
    }
    var tr = $(this).closest('.td').parent();
    getSubTotal(tr);
    total();
})
$('.pay_btn').on('click',function(){
    if($('.checkAll').hasClass('.cbn_checked') || $('.ckbox').hasClass('cbn_checked')){
        if(address_id == ''){
        alert('请添加收货地址！');
        window.location.href="address.html";
        }else{
            window.location.href="order_confirm.html";
        }

    }else{
        alert('请选择要购买的商品！')
    }
})