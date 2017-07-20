jQuery.support.cors = true;
$('#submit').on('click',function(){
    if($('#phone').val() == ''){
   	    $('#errorTip').css('display','block');
   	    $('#errorTip').text('请输入手机号/邮箱');
   	    return false;
   	}else{
   		 goLogin();
   	}
});
$('#phone').on('focus',function(){
	$('#errorTip').css('display','none');
})
$('#password').on('focus',function(){
	$('#errorTip').css('display','none');
});
// 登陆接口 goLogin
function goLogin(){
    var timestamp = Date.parse(new Date());
    var phone = $('#phone').val();
    var user_pass = md5($('#password').val());
    var values=['timestamp','phone','user_pass'];
    var data={'timestamp':timestamp,'phone':phone,'user_pass':user_pass};
    var sign = doSign(values,data);
    $.ajax({
        type : "post",
        url : url+'goLogin', 
        data:{'timestamp':timestamp,'phone':phone,'user_pass':user_pass,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
          if( data.status == 1){
            console.log(data);
            var id = data.data.id;
            var address_id = data.data.address_id;
            // 本地存储用户id
            if(window.localStorage){
              localStorage.setItem('userId',id);
              localStorage.setItem('address_id',address_id);

            }else{
              setCookie('userId',id);
              setCookie('address_id',address_id)
            }
            window.location.href='index.html?id='+id;
          }else{
            $('#errorTip').css('display','block');
            $('#errorTip').text(data.data);
          }
        }  
    })
}
// $('#phone').blur(function(){
//     var patt = new RegExp('@');
//     if($(this).val()==''){
//         $(this).addClass('border_red');
//         $('#errorTip').css('display','block');
//         $('#errorTip').text('请输入手机号/邮箱');
//     }else{
//         if(patt.test($(this).val())){
//             if($(this).val().search(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/)==-1){
//                 $(this).addClass('border_red');
//                 $('#errorTip').css('display','block');
//                 $('#errorTip').text('请输入正确的email格式');
//             }else{                 
//                 $(this).removeClass('border_red');
//                 $('#errorTip').css('display','none');
//                 $(this).addClass('success');
//                 ok4=true;
//             }  
//         }else{
//             var regx = /^(13[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(18[0-9]{9})|(15[0-9]{9})$/;
//             if($(this).val().length < 11 || !regx.test($(this).val())||$(this).val().length > 11){ 
//                 $(this).addClass('border_red');
//                 $('#errorTip').css('display','block');
//                 $('#errorTip').text('请输入正确的手机号码');
//             }else{
//                 $(this).removeClass('border_red');
//                 $('#errorTip').css('display','none');
//                 $(this).addClass('success');
//                 ok4=true; 
//             }
//         }
//     }       
// });