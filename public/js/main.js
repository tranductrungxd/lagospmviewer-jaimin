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

$(document).on("change","#projects",function() {
	if($(this).val() == "snags") {
		location.href = "https://shrouded-ridge-44534.herokuapp.com/issues";
	}
})