jQuery.support.cors = true;
/*
获取验证码 getVerifyCode
type    String  类型  Y   
（1:注册2:找回密码3:验证原手机号4：绑定新手机号 ）
phone   String  电话号码/邮箱 Y   
key String  秘钥key   Y   
timestamp   Int(11) 时间戳 Y   
sign    String  签名  Y 
*/
var validCode=true; 
$('#getCode').on('click',function(){
    var phone = $('#phone').val();
    if(phone == ''){
        $('#errorTip').css('display','block');
        $('#errorTip').text('请输入手机号/邮箱');
        return false;
    }else{
        var r = this;
        var timestamp = Date.parse(new Date());
        var values=['timestamp','phone','type'];
        var data={'timestamp':timestamp,'phone':phone,'type':1};
        var sign = doSign(values,data);
        $.ajax({
            type : "post",
            url : url+'getVerifyCode', 
            data:{'type':1,'timestamp':timestamp,'phone':phone,'key':key,'sign':sign}, 
            dataType : "json",
            success : function(data){
                if( data.status == 1){
                    timeDowm(r);
                    console.log(data);         
                }else{
                    $('#errorTip').css('display','block');
                    $('#errorTip').text(data.data);
                }
            }  
        })
    }
})
function timeDowm(r){
    var time=60;
    var code=$(r);
    if (validCode) {
        validCode=false;
        code.addClass("msgs1");
        var t=setInterval(function(){
            time--;
            code.html(time+"秒");
            if (time==0) {
                clearInterval(t);
                code.html("重新获取");
                validCode=true;
                code.removeClass("msgs1");
            }
        },1000)
    }
}
// 表单验证
var ok1=false;
var ok2=false;
var ok3=false;
var ok4=false;
$('#nickname').blur(function(){
    if($(this).val().length >= 3 && $(this).val().length <=12 && $(this).val()!=''){
        $(this).removeClass('border_red');
        $('#errorTip').css('display','none');
        $('#errorTip').text('用户名应该为3-12位之间');
        $('#nickname').addClass('success');
        ok1=true;
    }else{
        $(this).addClass('border_red');
        $('#errorTip').css('display','block');
        $('#errorTip').text('用户名应该为3-12位之间');
    }                   
});
//验证密码
$('#password1').blur(function(){
    if($(this).val().length >= 6 && $(this).val().length <=20 && $(this).val()!=''){
        $(this).removeClass('border_red');
        $('#errorTip').css('display','none');
        $('#errorTip').text('输入6-12位数字或字母组合');
        $('#password1').addClass('success');
        ok2=true;
    }else{
        $(this).addClass('border_red');
        $('#errorTip').css('display','block');
        $('#errorTip').text('输入6-12位数字或字母组合');
    }                     
}); 
//验证确认密码
$('#password2').blur(function(){
    if($(this).val().length >= 6 && $(this).val().length <=20 && $(this).val()!='' && $(this).val() == $('#password1').val()){
        $(this).removeClass('border_red');
        $('#errorTip').css('display','none');
        $('#password2').addClass('success');
        ok3=true;
    }else{
        $(this).addClass('border_red');
        $('#errorTip').css('display','block');
        $('#errorTip').text('输入的确认密码要和上面的密码一致');
    }                     
}); 
//验证邮箱
$('#phone').blur(function(){
    var patt = new RegExp('@');
    if($(this).val()==''){
        $(this).addClass('border_red');
        $('#errorTip').css('display','block');
        $('#errorTip').text('请输入手机号/邮箱');
    }else{
        if(patt.test($(this).val())){
            if($(this).val().search(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/)==-1){
                $(this).addClass('border_red');
                $('#errorTip').css('display','block');
                $('#errorTip').text('请输入正确的email格式');
            }else{                 
                $(this).removeClass('border_red');
                $('#errorTip').css('display','none');
                $(this).addClass('success');
                ok4=true;
            }  
        }else{
            var regx = /^(13[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(18[0-9]{9})|(15[0-9]{9})$/;
            if($(this).val().length < 11 || !regx.test($(this).val())||$(this).val().length > 11){ 
                $(this).addClass('border_red');
                $('#errorTip').css('display','block');
                $('#errorTip').text('请输入正确的手机号码');
            }else{
                $(this).removeClass('border_red');
                $('#errorTip').css('display','none');
                $(this).addClass('success');
                ok4=true; 
            }
        }
    }       
});
$('#phone').on('click',function(){$('#errorTip').css('display','none');$(this).removeClass('border_red');});
$('#nickname').on('click',function(){$('#errorTip').css('display','none');$(this).removeClass('border_red');});
$('#code').on('click',function(){$('#errorTip').css('display','none');$(this).removeClass('border_red');});
$('#password2').on('click',function(){$('#errorTip').css('display','none');$(this).removeClass('border_red');});
$('#password1').on('click',function(){ $('#errorTip').css('display','none');$(this).removeClass('border_red');});
$('.item.agreement').on('click',function(){ $(this).toggleClass('active');$('#errorTip').css('display','none');});
//提交按钮,所有验证通过方可提交 
$('#submit').click(function(){
    if(ok1 && ok2 && ok3 && ok4){
        goRegister();
    }else{
        if($('#phone').val() == ''){
            $('#errorTip').css('display','block');
            $('#errorTip').text('请输入手机号/邮箱');
            return false;
        }
    }
});
// 用户注册
function goRegister(){
    var timestamp = Date.parse(new Date());
    var phone = $('#phone').val();
    var user_nicename = $('#nickname').val();
    var user_pass = md5($('#password1').val());
    var yzm = $('#code').val();
    var values=['timestamp','phone','user_nicename','user_pass','yzm'];
    var data={'timestamp':timestamp,'phone':phone,'user_nicename':user_nicename,'user_pass':user_pass,'yzm':yzm};
    var sign = doSign(values,data);
    $.ajax({
        type : "post",
        url : url+'goRegister', 
        data:{'timestamp':timestamp,'phone':phone,'user_nicename':user_nicename,'user_pass':user_pass,'yzm':yzm,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
            console.log(data);
            if( data.status == 1){
                console.log(data);
                window.location.href="login.html";
            }else{
                $('#errorTip').css('display','block');
                $('#errorTip').text(data.data);
            }
        }  
    })
}
// 注册协议
var box = $('.agreement').find('a');
goSinglePage(box,4);
