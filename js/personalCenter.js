jQuery.support.cors = true;
// 获取用户信息  getSelfInfos
/*
性别 1男 2女
是否是商家 0否 1是
 */
// 我的皓哥
function getSelfInfos(){
  var timestamp = Date.parse(new Date());
  var values=['timestamp','user_id'];
  var data={'timestamp':timestamp,'user_id':user_id};
  var sign = doSign(values,data);
  $.ajax({
    type : "post",
    url : url+'getSelfInfos', 
    data:{'timestamp':timestamp,'user_id':user_id,'key':key,'sign':sign}, 
    dataType : "json",
    success : function(data){
      if( data.status == 1){
        console.log(data);
        var user_nicename = data.data.user_nicename;
        var avatar = data.data.avatar;
        var score  = data.data.score;
        var is_company = data.data.is_company;
        if(is_company == 0){$('#is_company').css('display','none')}
        else{$('#is_company').css('display','block')}
        $('.integration').find('em').text(score);
        $('.stroe_des').find('h3').text(user_nicename);
        if(avatar == ''){$('.author_img').find('img').attr('src','images/avatar.jpg');
        }else{$('.author_img').find('img').attr('src',avatar);}
        $('.unpay_count').text(data.data.unpay_count);
        $('.unsend_count').text(data.data.unsend_count);
        $('.unrecevied_count').text(data.data.unrecevied_count);

      } 
    }  
  })
}
// 个人中心
function getSelfInfos1(){
  var timestamp = Date.parse(new Date());
  var values=['timestamp','user_id'];
  var data={'timestamp':timestamp,'user_id':user_id};
  var sign = doSign(values,data);
  $.ajax({
    type : "post",
    url : url+'getSelfInfos', 
    data:{'timestamp':timestamp,'user_id':user_id,'key':key,'sign':sign}, 
    dataType : "json",
    success : function(data){
      if( data.status == 1){
        var user_nicename = data.data.user_nicename;
        var avatar = data.data.avatar;
        var score  = data.data.score;
        var email = data.data.user_email;
        var sex = data.data.sex;
        if( sex == 1){$('#men').addClass('active')}
        else{$('#women').addClass('active')}
        $('#nickname').val(user_nicename);
        $('#email').val(email);      
      } 
    }  
  })
}
// 头像上传
// 修改用户信息接口 modifySelfInfos
function modifySelfInfos(){
    var timestamp = Date.parse(new Date());
    var user_nicename = $('#nickname').val();
    var sex_val = $('.sex.active').text();
    var sex = ''; 
    if( sex_val == '男'){sex = 1}else{sex = 2}
    var avatar = '';
    var values=['timestamp','user_id','user_nicename','sex'];
    var data={'timestamp':timestamp,'user_id':user_id,'user_nicename':user_nicename,'sex':sex};
    var sign = doSign(values,data);
    $.ajax({
        type : "post",
        url : url+'modifySelfInfos', 
        data:{'timestamp':timestamp,'user_id':user_id,'user_nicename':user_nicename,'sex':sex,'avatar':avatar,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
          console.log(data);
            if( data.status == 1){
               console.log(data);
               window.location.href = 'personalCenter.html';
            }
        }  
    })
}
/** 意见反馈 
feedbackByUser
user_id Int 用户id  Y 
content String  意见内容  Y 
platform  Int 平台  Y 1 安卓 2ios 3web 4 微信
key String  秘钥key Y 
timestamp Int(11) 时间戳 Y 
sign  String  签名  Y 
*/
function feedbackByUser(){
  var timestamp = Date.parse(new Date());
  var content = $('#advice_content').val();
  var platform = 3;
  var values=['timestamp','user_id','content','platform'];
  var data={'timestamp':timestamp,'user_id':user_id,'content':content,'platform':platform};
  var sign = doSign(values,data);
  console.log(content);
  console.log(user_id);
  console.log(timestamp);
  $.ajax({
        type : "post",
        url : url+'feedbackByUser', 
        data:{'timestamp':timestamp,'user_id':user_id,'content':content,'platform':platform,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
          console.log(data);
          if( data.status == 1){
            console.log(data);
            }
        }  
    })
}
/*
  添加收货地址接口consigneeAddressAdd
  user_id  Int 用户id  Y
  phone String  电话  Y
  consignee String  收货人 Y
  province  Int 省id Y
  city  Int 市id Y
  district  Int 区县id  Y
  address String  详细地址  Y
  zipcode String  邮编  Y
  key String  秘钥key Y
  timestamp Int(11) 时间戳 Y
  sign  String  签名  Y
 */
function consigneeAddressAdd(){
  var timestamp = Date.parse(new Date());
  var phone =$('#phone').val();
  var consignee = $('#consignee').val();
  var province = $('#Province').find('i').attr('pro_id');
  var city = $('#City').find('i').attr('pro_id');
  var district = $('#Area').find('i').attr('pro_id');
  var address = $('#address1').val();
  console.log(address);
  var zipcode = $('#zipcode').val();
  console.log('user_id:'+user_id);
  console.log('phone:'+phone);
  console.log('consignee:'+consignee);
  console.log('province:'+province);
  console.log('city:'+city);
  console.log('district:'+district);
  console.log('address:'+address);
  console.log('zipcode:'+zipcode);

  var values=['timestamp','user_id','phone','consignee','province','city','district','address','zipcode'];
  var data={'timestamp':timestamp,'user_id':user_id,'phone':phone,'consignee':consignee,'province':province,'city':city,'district':district,'address':address,'zipcode':zipcode};
  var sign = doSign(values,data);
  $.ajax({
        type : "post",
        url : url+'consigneeAddressAdd', 
        data:{'timestamp':timestamp,'user_id':user_id,'phone':phone,'consignee':consignee,'province':province,'city':city,'district':district,'address':address,'zipcode':zipcode,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
          console.log(data);
          if( data.status == 1){
              window.location.href = 'address.html';
            }
        }  
    })
}

/*我的收货地址接口 consigneeAddressByUser
user_id Int 用户id  Y 
key String  秘钥key Y timestamp Int(11) 时间戳 Y sign  String  签名  Y 
*/
function consigneeAddressByUser(){
  var timestamp = Date.parse(new Date());
  var values=['timestamp','user_id'];
  var data={'timestamp':timestamp,'user_id':user_id};
  var sign = doSign(values,data);
  $.ajax({
        type : "post",
        url : url+'consigneeAddressByUser', 
        data:{'timestamp':timestamp,'user_id':user_id,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
          if( data.status == 1){
            $('<form class="layui-form"><table class="site-table table-hover"><thead style="background:#FFF;"><tr><th>选择</th><th>收货人</th><th>所在地区</th><th>详细地址</th><th>手机</th><th>操作</th></tr></thead><tbody></tbody></table></form>').appendTo($('.layui-field-box'))
            $.each(data.data,function(i,v){
              $('<tr data-id="'+v.id+'"><td class="opt"></td><td>'+v.consignee+'</td><td>'+v.province_name+'</td><td>'+v.province_name+v.city_name+v.district_name+v.address+'</td><td>'+v.phone+'</td><td><a href="address_add.html">修改</a><a href="#" onclick="del(this)">删除</a></td></tr>').appendTo($('tbody'));
            })
          }else{
            $('<p class="tip">'+data.data+'</p>').appendTo($('.layui-field-box'));
            $('.address_save').css('display','none');
          }
        }  
    })
}
/*删除收货地址接口consigneeAddressDelete
user_id Int 用户id  Y 
addr_id Int 地址id  Y 
key String  秘钥key Y 
timestamp Int(11) 时间戳 Y 
sign  String  签名  Y  
 */
function consigneeAddressDelete(addr_id){
  var timestamp = Date.parse(new Date());
  var values=['timestamp','user_id','addr_id'];
  var data={'timestamp':timestamp,'user_id':user_id,'addr_id':addr_id};
  var sign = doSign(values,data);
  $.ajax({
        type : "post",
        url : url+'consigneeAddressDelete', 
        data:{'timestamp':timestamp,'user_id':user_id,'addr_id':addr_id,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
           console.log(data);
          if( data.status == 1){}
        }  
    })
}
/**
 * 编辑收货地址接口
  consigneeAddressEdit
  user_id  Int 用户id
  addr_id Int 地址id
  phone String  电话
  consignee String  收货人
  province  Int 省id
  city  Int 市id
  district  Int 区县id
  address String  详细地址
  zipcode String  邮编
  key String  秘钥key
  timestamp Int(11) 时间戳
  sign  String  签名
 */
function consigneeAddressEdit(){
  var timestamp = Date.parse(new Date());
  var values=['timestamp','user_id','addr_id','phone','consignee','province','city','district','address','zipcode'];
  var data={'timestamp':timestamp,'user_id':user_id,'addr_id':addr_id,'phone':phone,'consignee':consignee,'province':province,'city':city,'district':district,'address':address,'zipcode':zipcode};
  var sign = doSign(values,data);
  $.ajax({
        type : "post",
        url : url+'consigneeAddressEdit', 
        data:{'timestamp':timestamp,'user_id':user_id,'addr_id':addr_id,'phone':phone,'consignee':consignee,'province':province,'city':city,'district':district,'address':address,'zipcode':zipcode,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
           console.log(data);
          if( data.status == 1){
            console.log(data);
            }
        }  
    })
}
/*修改用户密码接口
接口名
updatePwd
说明
参数
参数  类型  说明  是否必须  取值范围
user_id Int 用户id  Y 
oldpwd  String  旧密码 Y 
newpwd  String  新密码 Y 
key String  秘钥key Y 
timestamp Int(11) 时间戳 Y 
sign  String  签名  Y */
function updatePwd(){
  var oldpwd = md5($('#oldpwd').val());
  var newpwd = md5($('#newpwd').val());
  var timestamp = Date.parse(new Date());
  var values=['timestamp','user_id','oldpwd','newpwd'];
  var data={'timestamp':timestamp,'user_id':user_id,'oldpwd':oldpwd,'newpwd':newpwd};
  var sign = doSign(values,data);
  $.ajax({
        type : "post",
        url : url+'updatePwd', 
        data:{'timestamp':timestamp,'user_id':user_id,'oldpwd':oldpwd,'newpwd':newpwd,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
           console.log(data);
          if( data.status == 1){
            console.log(data);
            }
        }  
    })
}
/*
绑定新手机号接口
bindNewPhone
user_id Int 用户id  Y
phone String  手机号 Y
yzm String  验证码 Y
key String  秘钥key Y
timestamp Int(11) 时间戳 Y
sign  String  签名  Y
 */
function bindNewPhone(){
  var oldpwd = md5($('#oldpwd').val());
  var newpwd = md5($('#newpwd').val());
  var timestamp = Date.parse(new Date());
  var values=['timestamp','user_id','oldpwd','newpwd'];
  var data={'timestamp':timestamp,'user_id':user_id,'oldpwd':oldpwd,'newpwd':newpwd};
  var sign = doSign(values,data);
  $.ajax({
        type : "post",
        url : url+'bindNewPhone', 
        data:{'timestamp':timestamp,'user_id':user_id,'oldpwd':oldpwd,'newpwd':newpwd,'key':key,'sign':sign}, 
        dataType : "json",
        success : function(data){
           console.log(data);
          if( data.status == 1){
            console.log(data);
            }
        }  
    })
}