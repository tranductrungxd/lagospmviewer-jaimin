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
	$('[data-toggle="tooltip"]').tooltip()
  })