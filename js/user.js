// JavaScript Document
//删除弹框
function del(r) {
	layer.confirm('确认要删除么？', {
		btn: ['确认', '取消'],
	}, function() {
		layer.msg('删除成功');
		$(r).parent().parent().remove();
		var addr_id = $(r).parent().parent().attr('data-id');
		consigneeAddressDelete(addr_id);
	}, function() {
		//取消
		layer.msg('删除失败');
	});
}
// 短信验证码
function send() {
	layer.confirm('短信验证码发送成功？', {
		btn: ['知道了'],
	}, function() {
		layer.msg('操作成功');
	});
}

//iframe层
function iframe(url,name,width,height) {
	layer.open({
		type: 2,
		title: name,
		shadeClose: false,
		shade: 0.5,
		maxmin: true, //开启最大化最小化按钮
		area: [width, height],
		content: url
	});
}

//添加成功
function addsave(url) {
	layer.confirm("添加成功", {
		btn: ['确认 '] //按钮
	}, function() {
		window.location.href = url;
	});
}
//修改成功
function editsave(url){
	layer.confirm("修改成功", {
		btn: ['确认 '] //按钮
		}, function(){
			window.location.href = url;
		}
	);
}

//返回
function returns(url){
	window.location.href = url;
}

//iframe层成功提示
function iframeResult(){
	layer.confirm("操作成功", {
		btn: ['确认 '] //按钮
		}, function(){
			var index = parent.layer.getFrameIndex(window.name); //获取窗口索引
			parent.location.reload();
			parent.layer.close(index);
		}
	);
}
function close(){
var index = parent.layer.getFrameIndex(window.name); //获取窗口索引
			parent.location.reload();
			parent.layer.close(index);
}
// 受理
function ok() {
	layer.confirm('是否确定订单？', {
		btn: ['确认', '取消'],
	}, function() {
		layer.msg('操作成功');
	}, function() {
		//取消
		layer.msg('操作失败');
	});
}
function orderCancel1(r) {
	layer.confirm('确认要取消订单吗？', {
		btn: ['确认', '取消'],
	}, function() {
		layer.msg('取消成功');
		orderCancel(); 
		 
	}, function() {
		//取消
		layer.msg('取消失败');
	});
}