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

$(document).on("click","#modalCancelRead",function() {
    $("#myModalRead").modal("toggle");
});

$(function () {
	$('[data-toggle="tooltip"]').tooltip({
        placement: 'bottom'
    })
});

$(document).on("click","#exportPdf",function() {

	var HTML_Width = $("#readModal").width();
    var HTML_Height = $("#readModal").height();
    var top_left_margin = 15;
    var PDF_Width = HTML_Width + (top_left_margin * 2);
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    var canvas_image_width = HTML_Width;
    var canvas_image_height = HTML_Height;

    var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;

    html2canvas($("#readModal")[0]).then(function (canvas) {
        var imgData = canvas.toDataURL("image/jpeg", 1.0);
        var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
        for (var i = 1; i <= totalPDFPages; i++) { 
            pdf.addPage(PDF_Width, PDF_Height);
            pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*4),canvas_image_width,canvas_image_height);
        }
        pdf.save("WorkInspectionRequests.pdf");
    });

});

$(document).on('click','.removeWir',function() {

    $("#loader").show();

    var wirid = $(this).attr("wirid");
    var type = $(this).attr("itype");

    $.ajax({
        type: "GET",
        async: false,
        url: "removeWir?id="+wirid+"&type="+type,
        success: function (data) {
          $("#box"+wirid).remove();
          $("#hr"+wirid).remove();
          $("#loader").hide();
        },
        error: function (e) {
          console.log(e);
          $("#loader").hide();
        }
      });

});
