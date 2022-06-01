$(document).on("change","#inspectionType",function() {
	
	$('.inspDet').each(function(i, obj) {
    	$(this).hide();
	});

	if($(this).val()!=0) {
	  $("#"+$(this).val()).show();
	}
});

$(document).on("click","#modalCancel",function() {
    $("#myModal").toggle("modal");
});

$(function () {
	$('[data-toggle="tooltip"]').tooltip({
        placement: 'bottom'
    })
});

// $(".jss13").hover(function(){
// 	var id = $(this).attr("wirid");
// 	console.log(id);
//     $("#return"+id).show();
// },function(){
// 	console.log("hide" + id);
//     var id = $(this).attr("wirid");
//     $("#return"+id).hide();
// });