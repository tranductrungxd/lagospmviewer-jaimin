var viewer;
var newIssueData;
var tempWirData;
var options = {
  env: 'AutodeskProduction',
  getAccessToken: getForgeToken
};
var documentId = 'urn:dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLlhfMTV4Z19TUS1ldDh3YUpfcVkxNVE_dmVyc2lvbj0x';

Autodesk.Viewing.Initializer(options, () => {
  viewer = new Autodesk.Viewing.Private.GuiViewer3D(document.getElementById('forgeViewer'));
  viewer.start();
  viewer.setOptimizeNavigation(true);
  viewer.forEachExtension(function (ext) {
    console.log("Extension ID:" + ext.id);
  });

 // viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");
  viewer.loadExtension("BIM360IssueExtension");

  Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

});

function getForgeToken(callback) {
  fetch('forge/oauth/tokenForge_2Legs').then(res => {
    res.json().then(data => {
      console.log("Token api called");
      var token = data.access_token;
      var expire = data.expires_in;
      callback(token, expire);
    });
  });
}

function getThreeLeggedToken(callback) {
  var refresh = localStorage.getItem("refreshToken");
  if(refresh != null && refresh != "" && refresh != "undefined" && typeof refresh != "undefined") {
    $.ajax({
      type: "POST",
      url: "https://developer.api.autodesk.com/authentication/v1/refreshtoken?scope=data:read%20data:write%20data:create%20data:search%20code:all%20account:read%20user-profile:read%20viewables:read",
      beforeSend: function(request) {
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      },
      data: {
        "client_id":"QsqosEk9aHS6VIdEWrfgPBiOBBqFHB5r",
        "client_secret":"IHZ6iLFuAqHMFDj5",
        "grant_type":"refresh_token",
        "refresh_token":refresh
      },
      success: function (res) {
        localStorage.setItem("refreshToken",res.refresh_token);
        localStorage.setItem("bimToken",res.access_token);
        localStorage.setItem("expire",res.expires_in);
        getThreeLeggedToken(res.access_token,res.expires_in);
      },
      error: function (e) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("bimToken");
      }
    });
  }
}

function refreshBimDocToken() {
  var refresh = localStorage.getItem("refreshToken");
  if(refresh != null && refresh != "" && refresh != "undefined" && typeof refresh != "undefined") {
    $.ajax({
      type: "POST",
      url: "https://developer.api.autodesk.com/authentication/v1/refreshtoken?scope=data:read%20data:write%20data:create%20data:search%20code:all%20account:read%20user-profile:read%20viewables:read",
      beforeSend: function(request) {
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      },
      data: {
        "client_id":"QsqosEk9aHS6VIdEWrfgPBiOBBqFHB5r",
        "client_secret":"IHZ6iLFuAqHMFDj5",
        "grant_type":"refresh_token",
        "refresh_token":refresh
      },
      success: function (res) {
        localStorage.setItem("refreshToken",res.refresh_token);
        localStorage.setItem("bimToken",res.access_token);
        localStorage.setItem("expire",res.expires_in);
      },
      error: function (e) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("bimToken");
      }
    });
  }
}

function onDocumentLoadSuccess(doc) {

  var viewables = doc.getRoot().getDefaultGeometry();
  viewer.loadDocumentNode(doc, viewables).then(i => {
    $("#guiviewer3d-toolbar").css("margin-bottom","20px");
    loginToBim360();
  });

}

async function checkToken() {
  var tkn = localStorage.getItem("refreshToken");
  if (tkn == null || tkn == "undefined" || typeof tkn === "undefined") {
    await loginToBim360();
  }  
}

function loginToBim360() {
  var tkn = localStorage.getItem("refreshToken");
  if (tkn != null && tkn != "undefined" && typeof tkn != "undefined") {
    console.log("Token found.");
    refreshBimDocToken();
  } else {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expire");
    localStorage.removeItem("bimToken");
    var url = "https://developer.api.autodesk.com//authentication/v1/authorize?"
      + "client_id=QsqosEk9aHS6VIdEWrfgPBiOBBqFHB5r&response_type=code&redirect_uri="
      + "https://lagosviewer.herokuapp.com/forge/oauth/tokenForge_3Legs&scope=data:read%20data:write%20data:create%20data:search%20code:all%20account:read%20user-profile:read%20viewables:read";
    var left = (screen.width / 2) - (650 / 2);
    var top = (screen.height / 3) - (600 / 2);
    var newWindow = window.open(url, 'Logon to your BIM360 account.', 'height=600,width=650,top=' + top + ',left=' + left);

    startCheckingLogin();
    if (window.focus) {
      newWindow.focus();
    }
  }
}

function startCheckingLogin() {
  var code = null;
  let count = 0;
  let timerId = setInterval(() => {
    count++;
    code = localStorage.getItem("refreshToken");
    if (code != null && code != "" && typeof code != "undefined") {
      stopCheckingLogin(timerId, code);
    } else if (count > 60) {
      clearInterval(timerId);
    }
  }, 2000);
}

function stopCheckingLogin(timer, code) {
  clearInterval(timer);
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onLoadModelSuccess(model) {
  console.log('onLoadModelSuccess()!');
  console.log('Validate model loaded: ' + (viewer.model === model));
  console.log(model);
}

function onLoadModelError(viewerErrorCode) {
  console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}

function BIM360IssueExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
  this.viewer = viewer;
  this.panel = null;
  this.containerId = null;
  this.hubId = null;
  this.issues = null;
  this.pushPinExtensionName = 'Autodesk.BIM360.Extension.PushPin';
}

BIM360IssueExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
BIM360IssueExtension.prototype.constructor = BIM360IssueExtension;

BIM360IssueExtension.prototype.onSelectedChangedBind = function (event) {
  console.log(event);
  var label = event.value.label.text;
};

BIM360IssueExtension.prototype.onToolbarCreated = function () {
  this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  this.onToolbarCreatedBinded = null;
};

BIM360IssueExtension.prototype.createUI = function () {
  var _this = this;

  // SubToolbar
  this.subToolbar = (this.viewer.toolbar.getControl("MyAppToolbar") ?
    this.viewer.toolbar.getControl("MyAppToolbar") :
    new Autodesk.Viewing.UI.ControlGroup('MyAppToolbar'));
  this.viewer.toolbar.addControl(this.subToolbar);

  // create quality issue
  {
    var createQualityIssues = new Autodesk.Viewing.UI.Button('createQualityIssues');
    createQualityIssues.onClick = function (e) {
      var pushPinExtension = _this.viewer.getExtension(_this.pushPinExtensionName);
      if (pushPinExtension == null) {
        var extensionOptions = {
          hideRfisButton: true,
          hideFieldIssuesButton: true,
        };
        _this.viewer.loadExtension(_this.pushPinExtensionName, extensionOptions).then(function () { _this.createIssue(); });
      }
      else
        _this.createIssue(); // show issues
    };
    createQualityIssues.addClass('CreateIssuesExtensionIcon');
    createQualityIssues.setToolTip('Create Issues');
    this.subToolbar.addControl(createQualityIssues);
  }

};


BIM360IssueExtension.prototype.unload = function () {
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};


function BIM360IssuePanel(viewer, container, id, title, options) {
  this.viewer = viewer;
  Autodesk.Viewing.UI.PropertyPanel.call(this, container, id, title, options);
}
BIM360IssuePanel.prototype = Object.create(Autodesk.Viewing.UI.PropertyPanel.prototype);
BIM360IssuePanel.prototype.constructor = BIM360IssuePanel;

BIM360IssueExtension.prototype.loadIssues = function (issueId) {

  var _this = this;
  if (typeof _this.viewer == "undefined") {
    _this.viewer = viewer;
  }
  this.pushPinExtensionName = 'Autodesk.BIM360.Extension.PushPin';
  if (_this.panel == null) {
    _this.panel = new BIM360IssuePanel(_this.viewer, _this.viewer.container, 'bim360IssuePanel', 'BIM360 Issues');
  }
  _this.getIssues(issueId);
}

BIM360IssueExtension.prototype.getIssues = function (issueId) {
  var _this = this;

  _this.issues = fetchAllIssuesFromBim360(issueId);
  var pushPinExtension = _this.viewer.getExtension(_this.pushPinExtensionName);
  if (_this.panel) _this.panel.removeAllProperties();
  if (_this.issues.length > 0) {
    if (pushPinExtension == null) {
      var extensionOptions = {
        hideRfisButton: false,
        hideFieldIssuesButton: false,
      };
      _this.viewer.loadExtension(_this.pushPinExtensionName, extensionOptions).then(function () { _this.showIssues(); }); // show issues (after load extension)
    }
    else
      _this.showIssues(); // show issues
  }
  else {
    if (_this.panel) _this.panel.addProperty('No issues found', 'Use create issues button');
  }
}

BIM360IssueExtension.prototype.showIssues = function () {
  var _this = this;

  //remove the list of last time
  var pushPinExtension = _this.viewer.getExtension(_this.pushPinExtensionName);
  pushPinExtension.removeAllItems();
  pushPinExtension.showAll();

  pushPinExtension.addEventListener("pushpin.selected", this.onSelectedChangedBind);

  var pushpinDataArray = [];
  $("#bim360IssuePanel-scroll-container > .treeview").prepend("<button id='importIssueBtn' class='forgePanelButton importIssueBtn'>Import selected</button><button id='selectAllIssue' class='forgePanelButton selectAllIssueBtn'>Select All</button>");
  _this.issues.forEach(function (issue) {

    if (issue.attributes.pushpin_attributes.viewer_state != null && typeof issue.attributes.pushpin_attributes.viewer_state.seedURN != "undefined") {
      var dateCreated = issue.attributes.created_at;
      var dateUpdated = issue.attributes.updated_at;
      var dueDate = issue.attributes.due_date;
      var issueStatus = issue.attributes.status.charAt(0).toUpperCase() + issue.attributes.status.slice(1);
      console.log("boom " + issue);
      var issueAttributes = issue.attributes;
      var pushpinAttributes = issue.attributes.pushpin_attributes;
      if (pushpinAttributes) {
        issue.type = issue.type.replace('quality_', '');

        pushpinDataArray.push({
          id: issue.id,
          label: issue.attributes.title,
          status: issue.type && issueAttributes.status.indexOf(issue.type) === -1 ? `${issue.type}-${issueAttributes.status}` : issueAttributes.status,
          position: pushpinAttributes.location,
          type: issue.type,
          objectId: pushpinAttributes.object_id,
          viewerState: pushpinAttributes.viewer_state
        });
      }
    }

    pushPinExtension.loadItemsV2(pushpinDataArray);
    viewer.restoreState(pushpinAttributes.viewer_state);
    pushPinExtension.pushPinManager.selectOne(issue.id);

  })

 

}

BIM360IssueExtension.prototype.createIssue = function () {
  var _this = this;
  $("#createIssuePanel").remove();
  var content = document.createElement('div');
  var mypanel = new BIM360CreateIssuePanel(viewer.container, 'createIssuePanel', 'Create Issue', content);
  mypanel.setVisible(true);
  getNgIssueTypes("#issueType");

}


function fetchAllIssuesFromBim360(issueId) {
  var accessToken = localStorage.getItem("bimToken");
  var returnArray = [];
  var it = "e79b1aa1-aeb6-40c7-9508-c35e4c7ec6c2";
  var url = "https://developer.api.autodesk.com/issues/v1/containers/"+it+"/quality-issues/"+issueId;
  $.ajax({
    type: "GET",
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + accessToken);
      request.setRequestHeader("Content-Type", "application/vnd.api+json");
    },
    url: url,
    async: false,
    error: function (httpObj, textStatus) {
      if (httpObj.status == 401) {
        var token = refreshBimDocToken();
        if(localStorage.getItem("refreshToken") != "undefined" && localStorage.getItem("refreshToken") != null) {
          fetchAllIssuesFromBim360(issueId);
        }
      }
    },
    success: function (msg) {

      if (!$.isEmptyObject(msg.data)) {
        returnArray.push(msg.data);
      }
     // animateIssue(msg);
    }
  });

  return returnArray;
}

$(document).on("click", "#addWIR", function () {
  checkToken();
  toastr.info('Go ahead and select the model element.');
  //$("#myModal").toggle("modal");
  var pushPinExtension = viewer.getExtension("Autodesk.BIM360.Extension.PushPin");
   //pushPinExtension.removeAllItems(); 
    pushPinExtension.pushPinManager.addEventListener('pushpin.created', function (e) {
          pushPinExtension.pushPinManager.removeEventListener('pushpin.created', arguments.callee);
          pushPinExtension.endCreateItem();
           
          var issue = pushPinExtension.getItemById(pushPinExtension.pushPinManager.pushPinList[0].itemData.id ); 
       
           if (issue === null) return; 
           newIssueData = {
             type: 'quality_issues',
             attributes: {
               title: "", 
               status: "open",
               target_urn: "",
               ng_issue_type_id: "ac26c7c5-95e1-49c6-9898-536a65f41c27",
               ng_issue_subtype_id: "458b5a31-5052-4417-a415-db05c7c9e05f",
               sheet_metadata: { 
                 is3D: true,
                 sheetGuid: "c53bae93-9d1d-4f27-9577-892b41b7e414-00a6d1b3",
                 sheetName: "{3D}",
               },
               pushpin_attributes: { 
                 attributes_version : 2,
                 type: 'TwoDVectorPushpin', 
                 object_id: issue.objectId, 
                 location: issue.position, 
                 viewer_state: issue.viewerState 
               },
             }
          };
           $("#myModal").toggle("modal");
           $(':input','#wirForm')
           .not(':button, :submit, :reset, :hidden')
           .val('')
           .removeAttr('checked')
           .removeAttr('selected');
       });     
   pushPinExtension.startCreateItem({ label: "New", status: 'open', type: 'issues' });

});

BIM360CreateIssuePanel = function (parentContainer, id, title, content, x, y) {
  this.content = content;
  this.closer = this.getDocument().createElement("div");
  this.closer.className = "docking-panel-close";

  Autodesk.Viewing.UI.DockingPanel.call(this, parentContainer, id, title, { shadow: false });

  // Auto-fit to the content and don't allow resize.  Position at the coordinates given.
  //
  this.container.style.height = "575px";
  this.container.style.width = "350px";
  this.container.style.right = "50px";
  this.container.style.top = "100px";
  this.container.style.resize = "auto";

};

BIM360CreateIssuePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
BIM360CreateIssuePanel.prototype.constructor = BIM360CreateIssuePanel;

BIM360CreateIssuePanel.prototype.initialize = function () {
  this.title = this.createTitleBar(this.titleLabel || this.container.id);
  this.container.appendChild(this.title);

  this.container.appendChild(this.content);
  this.container.appendChild(this.closer);


  var op = { left: false, heightAdjustment: 45, marginTop: 0 };
  this.scrollcontainer = this.createScrollContainer(op);

  var issueType = '<select id="issueType" class="form-control createIssueInputs"></select>';
  var issueSubType = '<select id="issueSubType" class="form-control createIssueInputs"></select>';

  var myvar = '<div style="padding: 5px 40px 5px 15px;"><div class="form-group"><label for="issueTitle">Title</label>' +
    '<input type="text" class="form-control createIssueInputs" id="issueTitle" aria-describedby="emailHelp" placeholder="Enter title">' +
    '<small id="titleError" style="color:red; display:none;" class="form-text text-muted">Please enter valid title.</small></div>' +
    '<div class="form-group"><label for="issueStatus">Select Status</label>' +
    '<select class="form-control createIssueInputs" id="issueStatus" ><option value="open">Open</option><option value="draft">Draft</option></select>' +
    '<small id="statusError" style="color:red; display:none;" class="form-text text-muted">Select valid status.</small></div>' +
    '<div class="form-group"><label for="issueType">Issue type</label>' + issueType + '<small id="typeError" style="color:red; display:none;" class="form-text text-muted">Select valid type.</small></div>' +
    '<div class="form-group"><label for="issueType">Issue sub type</label>' + issueSubType + '<small id="subTypeError" style="color:red; display:none;" class="form-text text-muted">Select valid sub type.</small></div>' +
    '<div class="form-group"><label for="issueDate">Due date</label>' +
    '<input type="date" class="form-control createIssueInputs createEditIssueDate" id="issueDate" aria-describedby="emailHelp"><small id="dateError" style="color:red; display:none;" class="form-text text-muted">Please enter valid due date.</small></div>' +
    '<div class="form-group"><label for="issueDesc">Description</label>' +
    '<input type="email" class="form-control createIssueInputs" id="issueDesc" aria-describedby="emailHelp" placeholder="Enter description"></div>' +
    '<center><button onClick="return createNewIssue(this);" style="width: 170px; margin-bottom: 20px;" class="forgePanelButton">Done</button></center>'
  '</div>';


  var html = [myvar].join('\n');


  $(this.scrollContainer).append(html);

  this.initializeCloseHandler(this.closer);
  this.initializeMoveHandlers(this.title);

};

Autodesk.Viewing.theExtensionManager.registerExtension('BIM360IssueExtension', BIM360IssueExtension);

function animateIssue(issue) {
  viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");
  var pushPinExtension = viewer.getExtension("Autodesk.BIM360.Extension.PushPin");

  issue = issue.data;
  console.log(issue);
  const issueAttributes = issue.attributes;
  const pushpinAttributes = issue.attributes.pushpin_attributes;

      if (pushpinAttributes) {
        const location = pushpinAttributes.location;
        const position = new THREE.Vector3(location.x, location.y, location.z);
        const item = {
          id: issue.id,
          label: issueAttributes.identifier,
          status:
            issue.type && issueAttributes.status.indexOf(issue.type) === -1
              ? `${issue.type}-${issueAttributes.status}`
              : issueAttributes.status,
          position,
          type: issue.type,
          objectId: pushpinAttributes.object_id,
        };
        console.log(pushpinAttributes.viewer_state);
        pushPinExtension.loadItemsV2(item);
        viewer.restoreState(pushpinAttributes.viewer_state);
        pushPinExtension.pushPinManager.selectOne(issue.id);
      }
}

$(document).on('click', "#saveWir", function () {
  $("#loader").show();
  $('input[type=checkbox]').each(function () {
    if ($(this).is(':checked')) {
      $(this).val(1);
    } else {
      $(this).val(0);
    }
  });

  var seqid = 'WIR';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 10; i++ ) {
      seqid += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  $.getJSON( "/getLatestIdWir", function(latest) {
    
    var newid;

    if(latest!=null && latest!="undefined") {
      newid=parseInt(latest)+2001;
    } else {
      newid = $("#structure").val();
    }
    
    newIssueData.attributes.title = newid;
    var urls = 'https://developer.api.autodesk.com/issues/v1/containers/e79b1aa1-aeb6-40c7-9508-c35e4c7ec6c2/quality-issues'

    $.ajax({
      type: "POST",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("bimToken"));
        request.setRequestHeader("Content-Type", "application/vnd.api+json");
      },
      url: urls,
      async: false,
      data: JSON.stringify({ data: newIssueData }),
      error: function (httpObj, textStatus) {
        console.log(httpObj);
      },
      success: function (res) {
        if(res!="undefined" && !$.isEmptyObject(res.data) && res.data.id != "undefined") {
          $("#issueid").val(res.data.id);
          $("#seqid").val(seqid);
        }
        console.log("issue created successfully. " + res.data.id);
      }
    });

    $("#wirForm").submit();

    });

});

$("form").on("submit", function (e) {

  var dataString = $(this).serialize();
  $('input[type=checkbox]').each(function () {
    if (!$(this).is(':checked') && $(this).attr("name") !== undefined) {
      dataString += "&" + $(this).attr("name") + "=0";
    }
  });

  $.ajax({
    type: "POST",
    url: "wirs",
    data: dataString,
    success: function () {
      $("#loader").hide();
      location.reload();
    },
    error: function (e) {
      console.log(e);
      $("#loader").hide();
    }
  });
  e.preventDefault();
});

$(document).on("click", ".mainWir", function() {
  
  $(".mainWir").each(function() {
    $(this).removeClass("selected");
  });

  $(".css-1xar93x").each(function() {
    $(this).removeClass("selectedContent");
  });

  $(".wirNumber").each(function() {
    $(this).removeClass("selectedContent");
  });

  $(this).addClass("selected");
  $("#"+$(this).attr("id") +" .css-1xar93x").addClass("selectedContent");
  $("#"+$(this).attr("id") +" .wirNumber").addClass("selectedContent");

  var id = $('#issueClick', this).attr("issue");

  if(id==null || id=="") {
    console.log("No issue linked to the WIR.")
  } else {
    BIM360IssueExtension.prototype.loadIssues(id);
  }

})

$(document).on("click","#issueClick",function() {
  checkToken();

  $("#loader").show();
  tempWirData = {};

  var id = $(this).attr("issue");
  var wirid = $(this).attr("wirid");
  
  loadIssueDetailPanel(wirid);
  
  if(id==null || id=="") {
    console.log("No issue linked to the WIR.")
  } else {
    BIM360IssueExtension.prototype.loadIssues(id);
  }
  $("#loader").hide();
});

function loadIssueDetailPanel(wirid) {

  $.ajax({
    type: "GET",
    url: "getWir?id="+wirid,
    success: function (data) {
      processDetails(data[0]);
    },
    error: function (e) {
      console.log(e);
      $("#loader").hide();
    }
  });

  $("#middlePanel").css("width","calc(82% - 307px)");
	$("#rightPanel").show();
  viewer.resize();

}

function processDetails(data) {

  tempWirData=data;

  $("#detailStructure").val(data.structure);
  $("#detailTypeStructure").val(data.type_of_stucture);
  $("#detailStructure").val(data.structure);
  $("#detailDate").val(data.date_of_inspection);
  $("#detailTime").val(data.time_of_inspection);

  if(data.inspection_type=="sbe" ) {
    $("#detailInspection").val("Sand Blast Cleaning of Rebars");
  } else if(data.inspection_type=="swd" ) {
    $("#detailInspection").val("Sea Wall Deligence");
  } else if(data.inspection_type=="tc" ){ 
    $("#detailInspection").val("Thermal Control");
  } else if(data.inspection_type=="sw" ){ 
    $("#detailInspection").val("Shotcrete Works");
  } else if(data.inspection_type=="sri" ){
    $("#detailInspection").val("Still Reinforcement Installation");
  } 

  $("#thumId").attr("wirid",data.wirid);

}

function processChecklist(data,wirid) {
  $.ajax({
    type: "GET",
    url: "getWirChecklist?id="+wirid+"&type="+data.inspection_type,
    success: function (datas) {
      var list = datas[0];
      
      $("#myModalRead").modal("show");

      $('.inspDet').each(function(i, obj) {
          if("a"+data.inspection_type==$(this).attr("id")) {
            $(this).show();
          } else {
            $(this).hide();
          }
      });
      
        $(':input','#readModal')
           .not(':button, :submit, :reset, :hidden')
           .val('')
           .removeAttr('checked')
           .removeAttr('selected');
      
      $("#dateOfTestingRead").val(data.date_of_inspection);
      $("#timeOfTestingRead").val(data.time_of_inspection);
      $("#locationOfTestingRead").val(data.location);
      $("#structureRead").val(data.structure);
      $("#typeOfStructureRead").val(data.type_of_stucture);
      $("#rdNoRead").val(data.ref_draw_no);
      $("#statementRefRead").val(data.method_sta_ref_no);
      data.consent_proceed == 1 ? $("#consentRead").attr("checked","checked") : $("#consentRead").removeAttr("checked");
      data.consent_proceed_comment == 1 ? $("#yesConsentRead").attr("checked","checked") : $("#yesConsentRead").removeAttr("checked");
      data.no_consent == 1 ? $("#noConsentRead").attr("checked","checked") : $("#noConsentRead").removeAttr("checked");
      data.rev_not_req == 1 ? $("#reviewNotRead").attr("checked","checked") : $("#reviewNotRead").removeAttr("checked");
      $("#inspectionTypeRead").val(data.inspection_type);

      // checklist
      if(data.inspection_type=="sbe") {
        $.each(list,function(k,v) {
          
          $("#asbe input[type=checkbox]").each(function() {
            if($(this).attr("id")==k && v==1) {
              $(this).attr("checked","checked");
            }
          });

          $("#asbe input[type=text]").each(function() {
            if($(this).attr("id")==k && v!="") {
              $(this).val(v);
            }
          });

          $("#asbe input[type=date]").each(function() {
            if(k=="so_date_site" && $(this).attr("id")=="sitedateso" && v!="") {
              $(this).val(list.so_date_site);
            } else if(k=="so_date_qc" && $(this).attr("id")=="qcdateso" && v!="") {
              $(this).val(list.so_date_qc);
            } else if(k=="so_date_eng" && $(this).attr("id")=="engedateso" && v!="") {
              $(this).val(list.so_date_eng);
            }
          });

        });

      } else if(data.inspection_type=="swd") {
        $.each(list,function(k,v) {

          $("#aswd input[type=checkbox]").each(function() {
            if($(this).attr("id")==k && v==1) {
              $(this).attr("checked","checked");
            }
          });

          $("#aswd input[type=text]").each(function() {
            if($(this).attr("id")==k && v!="") {
              $(this).val(v);
            }
          });

          $("#aswd input[type=date]").each(function() {
            if(k=="so_date_site" && $(this).attr("id")=="sitedateso1" && v!="") {
              $(this).val(list.so_date_site);
            } else if(k=="so_date_qc" && $(this).attr("id")=="qcdateso1" && v!="") {
              $(this).val(list.so_date_qc);
            } else if(k=="so_date_eng" && $(this).attr("id")=="engedateso1" && v!="") {
              $(this).val(list.so_date_eng);
            }
          });
        });
      }
    },
    error: function (e) {
      console.log(e);
      $("#loader").hide();
    }
  });
}

$(document).on("click","#thumId",function() {

  var wirid = $(this).attr("wirid");
  if(!$.isEmptyObject(tempWirData)) {
    processChecklist(tempWirData,wirid);
  } else {
    $.ajax({
      type: "GET",
      url: "getWir?id="+wirid,
      success: function (data) {
        tempWirData=data[0];
        processChecklist(tempWirData,wirid);
      },
      error: function (e) {
        console.log(e);
        $("#loader").hide();
      }
    });
  }
})

 window.onresize = function() {
  var can = $("canvas")[0];
  can.width = screen.width;
  can.height = screen.height;
  can.style.width = screen.width+"px";
  can.style.height = screen.height+"px";
  viewer.resize();
}

$(document).on('click',"#closeDetail",function() {
	$("#middlePanel").css("width","calc(100% - 307px)");
	$("#rightPanel").hide();
  viewer.resize();
});

function createIssueFromLPM(wirid, url) {
  toastr.info('Link Activated. Select the element in the model.');
  var pushPinExtension = viewer.getExtension("Autodesk.BIM360.Extension.PushPin");
   //pushPinExtension.removeAllItems(); 
    pushPinExtension.pushPinManager.addEventListener('pushpin.created', function (e) {
          pushPinExtension.pushPinManager.removeEventListener('pushpin.created', arguments.callee);
          pushPinExtension.endCreateItem();
           
          var issue = pushPinExtension.getItemById(pushPinExtension.pushPinManager.pushPinList[0].itemData.id ); 
       
           if (issue === null) return; 
           newIssueData = {
             type: 'quality_issues',
             attributes: {
               title: "", 
               status: "open",
               target_urn: "",
               ng_issue_type_id: "ac26c7c5-95e1-49c6-9898-536a65f41c27",
               ng_issue_subtype_id: "458b5a31-5052-4417-a415-db05c7c9e05f",
               sheet_metadata: { 
                 is3D: true,
                 sheetGuid: "c53bae93-9d1d-4f27-9577-892b41b7e414-00a6d1b3",
                 sheetName: "{3D}",
               },
               pushpin_attributes: { 
                 attributes_version : 2,
                 type: 'TwoDVectorPushpin', 
                 object_id: issue.objectId, 
                 location: issue.position, 
                 viewer_state: issue.viewerState 
               },
             }
          };

          
          newIssueData.attributes.title = parseInt(wirid)+2000;
          var urls = 'https://developer.api.autodesk.com/issues/v1/containers/e79b1aa1-aeb6-40c7-9508-c35e4c7ec6c2/quality-issues'
      
          $.ajax({
            type: "POST",
            beforeSend: function (request) {
              request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("bimToken"));
              request.setRequestHeader("Content-Type", "application/vnd.api+json");
            },
            url: urls,
            async: false,
            data: JSON.stringify({ data: newIssueData }),
            error: function (httpObj, textStatus) {
              console.log(httpObj);
            },
            success: function (res) {
              if(res!="undefined" && !$.isEmptyObject(res.data) && res.data.id != "undefined") {
                $("#issueid").val(res.data.id);
                $("#seqid").val(seqid);
              }
              console.log("issue created successfully. " + res.data.id);
              updateWirIdWithIssueId(wirid,res.data.id);
            }
          });

       });     
   pushPinExtension.startCreateItem({ label: "New", status: 'open', type: 'issues' });
}

function updateWirIdWithIssueId(wirid,issueId) {
  $.ajax({
    type: "POST",
    url: "updateWir?wirid="+wirid+"&issueid="+issueId,
    success: function () {
      $("#loader").hide();
      window.location.href="https://lagosviewer.herokuapp.com";
    },
    error: function (e) {
      console.log(e);
      $("#loader").hide();
    }
  });
}

//https://shrouded-ridge-44534.herokuapp.com/api/forge/oauth/callback
//http://localhost:80/Lagos/Home/autodeskRedirect

/* 
git add .
git commit -am "make it better"
git push heroku master
git push ordigin master

show whole photo thumbnail of WIR in right panel
export pdf faster
srink the design of form for export
reponsive form

*/