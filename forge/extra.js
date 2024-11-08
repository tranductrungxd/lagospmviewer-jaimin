/**
 * Author: The Jaimin
 */

 define(['durandal/app', 'jquery', 'knockout', 'bootstrap', 'visileanUtil', 'projectUtils', 'messageUtils', 'Forge3D', 'dateUtils', 'statusUtils', 'newDateRange', 'activityUtils', 'jstree'],
 function (app, $, ko, bootstrap, visileanUtil, projectUtils, messageUtils, Forge3D, dateUtils, statusUtils, newDateRange, activityUtils) {

     var viewer,comparisonViewer,comparisonModel,docComparison,projectStartDate,projectEndDate;
     var eleIds = [], elementCategories = [], elementProperties = {}, elementsPropertyValues = {}, valuesToDbid = {}, modelDocIssues = {}, ngIssueSubTypes = {}, dbWithExternal = {}, dbWithExternalPvsA = [];
     var pvsaLoaded = 0;
     var INSERT_CONSTRAIN_LOG_URL = "project/importBimIssuesAsConstraintLog";
     var mappingDataList = [], loadedUrns = [], dbWithActivity = {}, onlyDbId = [], allCompltdStatusActivityIds = [], activityGuids = [], singleModelFilteredDbs = [];
     let singleModelBulkProperties=[];
     var viewmode, count = 0;
     var globalCategory="displayCategory", globalName="displayName", globalValue="displayValue";
     var updateActivityStatus = {}, dbWithNodename = {};
     var modelA, modelB, modelVersionData;
     var initGlobalOffset = { x: 0, y: 0, z: 0 };
     var isForgeCenterToCenter = false;
     var isForgeShared = false;
     document.setBimElementsNameWithGuid = {};
     var mappedEleArr = [];
     self.choicesOfRange = ["Select Range", "weekly", "lookahead", "phase"];
     self.selectedRange = ko.observable();
     self.selectedLocation = ko.observable();
     self.selectedUser = ko.observable();
     self.allOrgs = ko.observableArray();
     self.owner = ko.observable();
     self.locationData = ko.observableArray();
     var LastView = null;
     var loadedCurrentModels = [];
     document.dateRanges = {};
     document.selectedRange = { 'start': "", 'end': "" };
     document.mainTasksList = [];
     var pageIndex = 1;
     var pageSize = 10;
     var globalNodes = [];
     var isForgeAvailable = sessionStorage.getItem("forgeViewer");
     var gSavedModelFilters = [];
     var gVisibleSavedModelFilters = [];
     var loginRoleArray = [];
     var currentUserName = null;
     
     let closeEye = `<svg version="1.0" xmlns="http: //www.w3.org/2000/svg"
                  viewBox="0 -25 162 115" class="svgEye" id="closeEye" style="float: right;width: 5%;height: 23px;">
                   <path d="m25.1 6.7-3.2 3.6 8.2 8.3 8.1 8.2-2.5 1.7C29.1 32.8 17 51 17 
                   56.6 17 61 24.7 72.9 33 81c9 9 21.5 15.9 33.5 18.5 9.8 2.2 27.3 1.7 35.8-1l5.8-1.9 9.2 9.2c5.1 5.1 9.9 
                   9.2 10.8 9.2.8 0 3-1.6 4.9-3.5l3.4-3.6L84 55.5C55.1 26.6 30.8 3 29.9 3c-.8 0-3 1.6-4.8 3.7zM64 56.2c0 5.4 2.1 9.8
                   6.3 13.5 3.9 3.4 10.6 5.8 13.5 4.9 1.2-.4 3.2.8 6.1 3.8l4.3 4.3-3.3 1.2c-4.6 1.6-13.8 1.4-19.1-.5C58.5
                   78.9 50.5 63.5 54 49l1.2-5.2 4.4 4.3c3.7 3.6 4.4 4.9 4.4 8.1zM71 11.6c-5.5 1.1-13 3.5-12.9 4.2.1.4 
                   3.1 3.5 6.8 6.9l6.7 6.3 3.9-1.1c12.1-3.4 26.7 3.3 32.5 14.8 2.7 5.4 3.9 16.3 2.2 21.2-1 2.8-.7 3.3 
                   8.1 12.1l9.2 9.2 6.6-7.1c4-4.2 8.3-10.1 
                   10.5-14.5l3.9-7.5-2.4-4.8c-8.3-17.2-24.3-31.1-42.6-36.9-6.1-2-10.6-2.7-19-2.9-6-.2-12.1-.1-13.5.1z" fill="#6c6a6a"/>
                 </svg>`;
                 
     let openEye = `<svg version="1.0" xmlns="http: //www.w3.org/2000/svg" viewBox="0 -25 162 115" 
                     class="svgEye" id="openEye" style="float: right;width: 5%;height: 23px;">
                   <path d="M67 12.6c-16.2 4.3-33.1 17-46.1 34.4-7.6 10.2-7.6 9.7-1.7 18.1 
                   6.4 9.3 21.7 24.3 29.1 28.8 28.1 16.7 57.5 12.1 82.7-12.8 7.8-7.8 
                   18-21.3 18-23.9 0-2.2-8.6-13.9-15.9-21.6-11.3-11.7-24.8-20.1-37.3-23.1-7.9-1.9-21.6-1.8-28.8.1zm26.5 
                   18.8c10.2 4.8 16.8 15.1 16.8 26.1 0 18.9-18.4 32.4-36.8 27-4.6-1.3-6.9-2.8-11.5-7.3-9.6-9.7-11.4-21.1-5.3-33.2 
                   3-5.8 10-12 15.7-13.8 6-1.9 15.7-1.4 21.1 1.2z" fill="#fff"/>
                   <path d="M74 37.1C64.3 41 58.8 51.5 61.1 61.8c3.5 16.1 22.2 22.3 34.7 11.6 7.9-6.7 9.6-19.9 
                   3.8-28.3-5.1-7.4-17.4-11.2-25.6-8z" fill="#fff"/>
                 </svg>`;

     // to launch the veiwer into #forgeViewer division in html
     function launchViewer(urn, viewMode, forgeCentering, isVersionControl, isDoc) {
         var options;
         if (isDoc) {
             options = {
                 env: 'AutodeskProduction',
                 getAccessToken: getForgeToken
             };
         } else {
             options = {
                 env: 'AutodeskProduction',
                 getAccessToken: getThreeLeggedToken
             };
         }

         Autodesk.Viewing.Initializer(options, () => {

             const div = document.getElementById('forgeViewer')
             if (viewMode == "fullView") {
                 viewer = new Autodesk.Viewing.Private.GuiViewer3D(div, { loaderExtensions: { svf: "Autodesk.MemoryLimited" }, extensions: ['SelectTaskExtension', 'VersonControlExtension', 'SearchElementExtension','ContextMenuExtension','SavedFiltersExtension'] });
             } else {
                 viewer = new Autodesk.Viewing.Private.GuiViewer3D(div, { loaderExtensions: { svf: "Autodesk.MemoryLimited" }, extensions: ['ModelSummaryExtension', 'SearchElementExtension','ContextMenuExtension','SavedFiltersExtension'] });
             }

             viewer.start();
             viewer.setOptimizeNavigation(true);
             viewer.forEachExtension(function (ext) {
                 console.log("Extension ID:" + ext.id);
             })
             docComparison=isDoc;
             gSavedModelFilters = [];
             gVisibleSavedModelFilters = [];
             mappingDataList = [], elementCategories = [], elementProperties = {}, elementsPropertyValues = {}, mappingDataList = {}, dbWithActivity = {}, eleIds = [], loadedCurrentModels = [];
             
             tree = null;

             //viewer.setTheme('light-theme'); 
             viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, onModelElementSelect);
             
             viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {
                 viewer.getObjectTree(function (objectTree) {
                     tree = objectTree;
                     var rootId = tree.getRootId()
                     var model = viewer.model;
                     var modelData = model.getData();
                     var it = modelData.instanceTree;
                     var nodeName = it.getNodeName(rootId);
                     globalNodes.push(rootId);
                     dbWithNodename[rootId] = nodeName;
                     getLeafComponentsRec(rootId, '#');
                 });
             });
             $(".loaderContainer").hide();
             var modelload_promise;
             $("#centeringDropdown").hide();
             modelload_promise = new Promise(function (resolve, reject) {
                 console.log(forgeCentering);
                 if (forgeCentering == "Origin-to-Origin") {

                     //ORIGIN TO ORIGIN
                     Autodesk.Viewing.Document.load(`urn:${urn[0].urn}`, (doc) => {

                         var viewables = doc.getRoot().getDefaultGeometry();
                         var modelOption;
                         if(!isDoc) {
                             modelOption = {
                                 keepCurrentModels: true,
                             };
                         } else {
                             modelOption = {
                                 keepCurrentModels: true,
                                 applyScaling: 'm'
                             };
                         }
                         
                         count++;
                         viewer.loadDocumentNode(doc, viewables, modelOption).then((model) => {
                             
                                 model.getExternalIdMapping(onSuccessCallbackForExternal);
                                 initGlobalOffset = model.getData().globalOffset;
                                 model._myURN = urn[0].urn;
                                 model._myGUID = urn[0].guid;
                                 
                                 loadedUrns=[];
                                 loadedUrns.push(model._myURN);
                                 if(model._myGUID=="NOGUID") {
                                     viewer.unloadExtension("SelectTaskExtension");
                                     viewer.unloadExtension("VersonControlExtension");
                                 } else if(!isDoc) {
                                     viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");
                                     viewer.loadExtension("BIM360IssueExtension");
                                 }
                                 
                                 if(!loadedCurrentModels.includes(model)) {
                                     loadedCurrentModels.push(model);
                                 }
                                 
                                 if (loadedCurrentModels.length == urn.length) {
                                     resolve();
                                     $(".loaderContainer").hide();
                                 }

                             urn.map((m) => {
                                 if (m.guid == model._myGUID) {
                                     return;
                                 }

                                     $(".loaderContainer").hide();

                                         Autodesk.Viewing.Document.load( `urn:${m.urn}`, ( doc ) => {

                                             var viewables = doc.getRoot().getDefaultGeometry();
                                             var	modelOption = {
                                                 keepCurrentModels: true,
                                                 applyScaling: 'm',
                                                 globalOffset: initGlobalOffset
                                             };
                                             
                                             viewer.loadDocumentNode( doc, viewables,modelOption ).then( ( model ) => {

                                                 if(count >= 2) {
                                                     $("#centeringDropdown").show();
                                                 }

                                                 if(count > 1 && isVersionControl) {
                                                     var extensionConfig ={}
                                                          extensionConfig.mimeType ='application/vnd.autodesk.revit'
                                                          extensionConfig.primaryModels = [viewer.getVisibleModels()[1]]
                                                          extensionConfig.diffModels = [viewer.getVisibleModels()[0]]
                                                          extensionConfig.diffMode =  'overlay' 
                                                          extensionConfig.versionA =  '2' 
                                                          extensionConfig.versionB =  '1'  
                                                     
                                                     
                                                 modelA = viewer.getVisibleModels()[1];
                                                 modelB = viewer.getVisibleModels()[0];
                                                 var removed = {};
                                                 var added = {};
                                                 var modified = {};
  
                                                 var red = new THREE.Vector4(1, 0, 0, 1);
                                                 var green = new THREE.Vector4(0, 0.5, 0, 1);
                                                 var orange = new THREE.Vector4(1, 0.6, 0.2, 1);
  
                                                 viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {
                                                     listElements(function (listA, listB) {
                                                         
                                                         viewer.clearThemingColors(modelA);
                                                         viewer.clearThemingColors(modelB);
                                                         viewer.isolate(-1);
                                                         
                                                         for (var extIdA in listA) {
                                                             if (listB[extIdA] != null) continue;
                                                             var dbIdA = listA[extIdA].dbId;
                                                             removed[extIdA] = dbIdA;
                                                             viewer.impl.visibilityManager.show(dbIdA, modelA);
                                                             viewer.setThemingColor(dbIdA, red, modelA);
                                                         }
  
                                                         for (var extIdB in listB) {
                                                             if (listA[extIdB] != null) continue;
                                                             var dbIdB = listB[extIdB].dbId
                                                             added[extIdB] = dbIdB;
                                                             viewer.impl.visibilityManager.show(dbIdB, modelB);
                                                             viewer.setThemingColor(dbIdB, green, modelB);
                                                         }
  
                                                         for (var extId in listA) {
                                                             if (typeof listB[extId] === 'undefined') continue; 
  
                                                             var dbId = listA[extId].dbId;
                                                             var propsA = listA[extId].properties;
                                                             var propsB = listB[extId].properties;
  
                                                             for (var i = 0; i < propsA.length; i++) {
                                                                 if (propsB[i] == null) continue;
                                                                 if (propsA[i].displayCategory.indexOf('__')==0) continue;
                                                                 if (propsA[i].displayValue != propsB[i].displayValue) {
                                                                     modified[extId] = dbId;
                                                                 }
                                                             }
  
                                                             if (typeof modified[extId] != 'undefined') {
                                                                 viewer.impl.visibilityManager.show(dbId, modelA);
                                                                 viewer.setThemingColor(dbId, orange, modelA);
                                                             }
                                                         }
                                                     });
                                                 });
  
                                              }
                                                 
                                             model._myURN = m.urn;
                                             model._myGUID = m.guid;
                                             loadedUrns=[];
                                             loadedUrns.push(m.urn);

                                             if(m.guid=="NOGUID") {
                                                 viewer.unloadExtension("SelectTaskExtension");
                                                 viewer.unloadExtension("VersonControlExtension");
                                             } else if(!isDoc) {
                                                 viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");
                                                 viewer.loadExtension("BIM360IssueExtension");
                                             }
                                             
                                             if( !loadedCurrentModels.includes( model ) ) {
                                                 loadedCurrentModels.push( model );
                                             }
                                             if( loadedCurrentModels.length == urn.length ) {
                                                 resolve();
                                                 $(".loaderContainer").hide();
                                             }

                                             })
                                         })
                                     })

                                 });
                                 replaceSpinner();
                             });
                             
                         }  else if (forgeCentering == "Shared Coords") {
                             isForgeShared=true;
                             let globalOffset = null;
                             urn.map((m) => {
                                 Autodesk.Viewing.Document.load(`urn:${m.urn}`, (doc) => {
                                 count++;
                                 var bubbleNode = doc.getRoot().getDefaultGeometry();
                                 var aecdata_download = new Promise((resolve, reject) => { doc.downloadAecModelData(() => resolve(doc)) });

                                 aecdata_download.then((doc) => {

                                     Autodesk.Viewing.Document.getAecModelData(bubbleNode).then((aecModelData) => {

                                         const tf = aecModelData && aecModelData.refPointTransformation; // Matrix4x3 as array[12]
                                         const refPoint = tf ? { x: tf[9], y: tf[10], z: 0.0 } : { x: 0, y: 0, z: 0 };

                                         // Check if the current globalOffset is sufficiently close to the refPoint to avoid inaccuracies.
                                         const MaxDistSqr = 4.0e6;
                                         const distSqr = globalOffset && THREE.Vector3.prototype.distanceToSquared.call(refPoint, globalOffset);

                                         if (!globalOffset || distSqr > MaxDistSqr) {
                                             globalOffset = new THREE.Vector3().copy(refPoint);
                                         }
                                         
                                         if(!globalOffset) {
                                             globalOffset = refPoint;
                                         }
                                         
                                         initGlobalOffset = globalOffset;
                                         console.log("DEBUG - Model name: " + m.name + ", refPoint: " + JSON.stringify(refPoint));
                                         var modelOption = {
                                             keepCurrentModels: true,
                                             applyRefPoint: true,
                                             applyScaling: 'm',
                                             globalOffset: globalOffset,
                                             isAEC: true,
                                         };

                                         viewer.loadDocumentNode(doc, bubbleNode, modelOption).then((model) => {

                                             if (count >= 2) {
                                                 $("#centeringDropdown").show();
                                             }
                                             if (count > 1 && isVersionControl) {
                                                 var extensionConfig = {};
                                                 extensionConfig.mimeType = 'application/vnd.autodesk.revit';
                                                 extensionConfig.primaryModels = [viewer.getVisibleModels()[1]];
                                                 extensionConfig.diffModels = [viewer.getVisibleModels()[0]];
                                                 extensionConfig.diffMode = 'overlay';
                                                 extensionConfig.versionA = '2';
                                                 extensionConfig.versionB = '1';
                                                 modelA = viewer.getVisibleModels()[1];
                                                 modelB = viewer.getVisibleModels()[0];
                                                 var removed = {};
                                                 var added = {};
                                                 var modified = {};

                                                 var red = new THREE.Vector4(1, 0, 0, 1);
                                                 var green = new THREE.Vector4(0, 0.5, 0, 1);
                                                 var orange = new THREE.Vector4(1, 0.6, 0.2, 1);

                                                 viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {
                                                     listElements(function (listA, listB) {

                                                         viewer.clearThemingColors(modelA);
                                                         viewer.clearThemingColors(modelB);
                                                         viewer.isolate(-1);

                                                         for (var extIdA in listA) {
                                                             if (listB[extIdA] != null) continue;
                                                             var dbIdA = listA[extIdA].dbId;
                                                             removed[extIdA] = dbIdA;
                                                             viewer.impl.visibilityManager.show(dbIdA, modelA);
                                                             viewer.setThemingColor(dbIdA, red, modelA);
                                                         }

                                                         for (var extIdB in listB) {
                                                             if (listA[extIdB] != null) continue;
                                                             var dbIdB = listB[extIdB].dbId
                                                             added[extIdB] = dbIdB;
                                                             viewer.impl.visibilityManager.show(dbIdB, modelB);
                                                             viewer.setThemingColor(dbIdB, green, modelB);
                                                         }

                                                         for (var extId in listA) {
                                                             if (typeof listB[extId] === 'undefined') continue; 

                                                             var dbId = listA[extId].dbId;
                                                             var propsA = listA[extId].properties;
                                                             var propsB = listB[extId].properties;

                                                             for (var i = 0; i < propsA.length; i++) {
                                                                 if (propsB[i] == null) continue;
                                                                 if (propsA[i].displayCategory.indexOf('__') == 0) continue; 
                                                                 if (propsA[i].displayValue != propsB[i].displayValue) {
                                                                     modified[extId] = dbId;
                                                                 }
                                                             }

                                                             if (typeof modified[extId] != 'undefined') {
                                                                 viewer.impl.visibilityManager.show(dbId, modelA);
                                                                 viewer.setThemingColor(dbId, orange, modelA);
                                                             }
                                                         }
                                                     });
                                                 });
                                             }

                                             //for RVTS < Revit v2018
                                             if (!aecModelData) {
                                                 var tf = model.getData().refPointTransform;

                                                 if (tf) {
                                                     var refPoint = tf ? { x: tf[9], y: tf[10], z: 0.0 } : { x: 0, y: 0, z: 0 };

                                                     const fragCount = model.getFragmentList().fragments.fragId2dbId.length;
                                                     // Offset whole model by 'refPoint'
                                                     const offset = new THREE.Vector3(refPoint.x, refPoint.y, refPoint.z);

                                                     for (let fragId = 0; fragId < fragCount; ++fragId) {
                                                         const fragProxy = viewer.impl.getFragmentProxy(model, fragId);

                                                         fragProxy.getAnimTransform();

                                                         const position = new THREE.Vector3(
                                                             fragProxy.position.x + offset.x,
                                                             fragProxy.position.y + offset.y,
                                                             fragProxy.position.z + offset.z
                                                         );

                                                         fragProxy.position = position;

                                                         fragProxy.updateAnimTransform();
                                                     }
                                                     viewer.impl.sceneUpdated(true);
                                                 }
                                             }

                                             model._myURN = m.urn;
                                             model._myGUID = m.guid;
                                             loadedUrns = [];
                                             loadedUrns.push(m.urn);
                                             if (m.guid == "NOGUID") {
                                                 viewer.unloadExtension("SelectTaskExtension");
                                                 viewer.unloadExtension("VersonControlExtension");
                                             } else if(!isDoc) {
                                                 viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");
                                                 viewer.loadExtension("BIM360IssueExtension");
                                             }
                                             if (!loadedCurrentModels.includes(model)) {
                                                 loadedCurrentModels.push(model);
                                             }
                                             if (loadedCurrentModels.length == urn.length) {
                                                 resolve();
                                                 $(".loaderContainer").hide();
                                             }
                                         });
                                     });
                                 });
                             });
                                 replaceSpinner();
                         });
                     }  else if (forgeCentering == "Center-to-Center") {
                         isForgeCenterToCenter=true;
                         urn.map((m) => {
                             Autodesk.Viewing.Document.load(`urn:${m.urn}`, (doc) => {
                                 var viewables = doc.getRoot().getDefaultGeometry();
                                 var modelOption = {
                                     keepCurrentModels: true,
                                     applyScaling: 'm'
                                 };
                                 count++;

                                 viewer.loadDocumentNode(doc, viewables, modelOption).then((model) => {

                                     if (count >= 2) {
                                         $("#centeringDropdown").show();
                                     }

                                     if (count > 1 && isVersionControl) {
                                         var extensionConfig = {};
                                         extensionConfig.mimeType = 'application/vnd.autodesk.revit';
                                         extensionConfig.primaryModels = [viewer.getVisibleModels()[1]];
                                         extensionConfig.diffModels = [viewer.getVisibleModels()[0]];
                                         extensionConfig.diffMode = 'overlay';
                                         extensionConfig.versionA = '2';
                                         extensionConfig.versionB = '1';

                                         modelA = viewer.getVisibleModels()[1];
                                         modelB = viewer.getVisibleModels()[0];
                                         var removed = {};
                                         var added = {};
                                         var modified = {};

                                         var red = new THREE.Vector4(1, 0, 0, 1);
                                         var green = new THREE.Vector4(0, 0.5, 0, 1);
                                         var orange = new THREE.Vector4(1, 0.6, 0.2, 1);

                                         viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {
                                             listElements(function (listA, listB) {
                                                 viewer.clearThemingColors(modelA);
                                                 viewer.clearThemingColors(modelB);
                                                 viewer.isolate(-1);

                                                 for (var extIdA in listA) {
                                                     if (listB[extIdA] != null) continue;
                                                     var dbIdA = listA[extIdA].dbId;
                                                     removed[extIdA] = dbIdA;
                                                     viewer.impl.visibilityManager.show(dbIdA, modelA);
                                                     viewer.setThemingColor(dbIdA, red, modelA);
                                                 }

                                                 for (var extIdB in listB) {
                                                     if (listA[extIdB] != null) continue;
                                                     var dbIdB = listB[extIdB].dbId
                                                     added[extIdB] = dbIdB;
                                                     viewer.impl.visibilityManager.show(dbIdB, modelB);
                                                     viewer.setThemingColor(dbIdB, green, modelB);
                                                 }

                                                 for (var extId in listA) {
                                                     if (typeof listB[extId] === 'undefined') continue; 

                                                     var dbId = listA[extId].dbId;
                                                     var propsA = listA[extId].properties;
                                                     var propsB = listB[extId].properties;

                                                     for (var i = 0; i < propsA.length; i++) {
                                                         if (propsB[i] == null) continue;
                                                         if (propsA[i].displayCategory.indexOf('__') == 0) continue;
                                                         if (propsA[i].displayValue != propsB[i].displayValue) {
                                                             modified[extId] = dbId;
                                                         }
                                                     }

                                                     if (typeof modified[extId] != 'undefined') {
                                                         // color on both models
                                                         viewer.impl.visibilityManager.show(dbId, modelA);
                                                         viewer.setThemingColor(dbId, orange, modelA);
                                                     }
                                                 }
                                             });
                                         });
                                     }
                                     model._myURN = m.urn;
                                     model._myGUID = m.guid;
                                     loadedUrns = [];
                                     loadedUrns.push(m.urn);
                                     if (m.guid == "NOGUID") {
                                         viewer.unloadExtension("SelectTaskExtension");
                                         viewer.unloadExtension("VersonControlExtension");
                                     } else if(!isDoc) {
                                         viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");
                                         viewer.loadExtension("BIM360IssueExtension");
                                     }
                                     if (!loadedCurrentModels.includes(model)) {
                                         loadedCurrentModels.push(model);
                                     }
                                     if (loadedCurrentModels.length == urn.length) {
                                         resolve();
                                         $(".loaderContainer").hide();
                                     }
                                 });
                             });
                             replaceSpinner();
                         });
                     }
             });
             modelload_promise.then((data) => {
                 resetAllMappingData();
             });
         });
     }
     
     // copies all the external id to db id mapping into a variable
     function onSuccessCallbackForExternal(event) {
         dbWithExternal=event;
     }
     
     var elementClickCount=0,viewerClick=0,viewerFlick=0;
     // handles model selection event from multimodel and opens linked task detail panel
     function onModelElementSelect(selectionEvent) {
         
         if(!$.isEmptyObject(comparisonViewer) && !$.isEmptyObject(selectionEvent)) {
             var selections = [];
             var e = selectionEvent.selections;
             if(!$.isEmptyObject(e) && typeof e[0].dbIdArray != "undefined" && viewerClick==0) {
                 viewerClick=1;
                 for(var i=0;i<viewer.getVisibleModels().length;i++) {
                     if(viewer.getVisibleModels()[i].getModelId() == e[0].model.getModelId()) {
                         selections.push({
                             model: comparisonViewer.getVisibleModels()[i],
                             ids: e[0].dbIdArray
                         });
                     }
                 }
             } else if(viewerClick==2) {
                 viewerClick=0;
             } else if($.isEmptyObject(e)) {
                 viewerClick=0;
                 comparisonViewer.impl.selector.setAggregateSelection(null);
             }
             
             if(e[0] && e[0].length==1) {
                 elementClickCount=1;
             }
             
             for(var i=0;i<selections.length;i++) {
                 var select = [selections[i]];
                 comparisonViewer.impl.selector.setAggregateSelection(null);
                 comparisonViewer.impl.selector.setAggregateSelection( select );
             }
         }
         
         
         if(!$.isEmptyObject(selectionEvent.selections) && selectionEvent.selections.length == 1 && !$.isEmptyObject(selectionEvent.selections[0])) {
         
             var events = selectionEvent.selections[0];
             
             elementClickCount++;
             var test = document.getElementsByTagName("HTML")[0];
             var right = typeof event != "undefined" ? (test.offsetWidth -  event.clientX) : test.offsetWidth;
             var top = typeof event != "undefined" ? (event.clientY-100) : 250;
             var height = 300;
             var width = 320;
             var actCount=0;
             var resize = "auto";
             
              if(!$.isEmptyObject(comparisonViewer)) {
                 top=160;
                 right=10;
                 resize="none";
              }
             
             if(viewMode=="splitView" && top > 200) {
                 top=100;
                 right=Math.floor(($(window).width()*60/100));
             }

             $("#LinkedTaskPanel").html("").remove();
             
             var modelGuid = events.model._myGUID; 
             if(typeof events.dbIdArray != "undefined" && events.dbIdArray.length == 1 && elementClickCount==1) {
                 events.model.getProperties(events.dbIdArray[0],function(e) {
                     if(!$.isEmptyObject(dbWithActivity[modelGuid])) {
                         var acts = Object.keys(dbWithActivity[modelGuid]).filter(function(key) {
                             if(dbWithActivity[modelGuid][key].dbId==events.dbIdArray)
                                 return dbWithActivity[modelGuid][key];
                         });
                         
                         var externalId = e.externalId;
                         var content = document.createElement('div');
                         
                         $("#linkedElementTaskList").html("");
                         if(typeof dbWithActivity[modelGuid] == "undefined" || typeof dbWithActivity[modelGuid][acts] == "undefined") {
                             
                             height=200;
                             width=250;
                             
                             var mypanel = new LinkedTaskPanel(viewer.container, 'LinkedTaskPanel', 'Linked Tasks', content, top, right, height, width, resize);
                             mypanel.setVisible(true);
                             
                             $("#linkedElementTaskList").append(`<div class="subTaskList">
                                     <p><span>No linked activities to this element.</span></p>
                                     </div>`);
                         } else {
                             
                             var mypanel = new LinkedTaskPanel(viewer.container, 'LinkedTaskPanel', 'Linked Tasks', content, top, right, height, width, resize);
                             mypanel.setVisible(true);
                             
                             var activities = dbWithActivity[modelGuid][acts].activities;
                             actCount=activities.length;
                             for(var i=0;i<activities.length;i++) {
                                 var act = activities[i];
                                 $("#linkedElementTaskList").append(`<div guid="${act.guid}" class="subTaskList ${getStatusClassForTaskRound(act.status)}">
                                         <p class="windowName"><b style="font-size:15px;">${act.name}</b><span style="float:right; font-size:15px;"><a exeId="${externalId}" modelId="${modelGuid}" actId="${act.guid}" id="newDelete_${act.guid}" class="glyphicon glyphicon-trash model-linked-popup-delete"></a></span></p>
                                         <p class="windowOwner"><i class="userCustomIcon"></i> <span style="margin: 0;position: relative;top: -5px;">${act.responsibleActorName == null ? 'Unassigned' : act.responsibleActorName}</span></p>
                                         <p class="windowLocation"><i class="locationCustomIcon"></i> <span style="margin: 0;position: relative;top: -5px;">${act.locationName == null ? 'No Location' : act.locationName}</span></p>
                                         <p class="windowStatus"><i class="statusCustomIcon"></i> <span style="margin: 0;position: relative;top: -5px;">${statusUtils.getActivityStatusText(parseInt(act.status))}</span></p>
                                         </div>`);
                                 
                                 $(`#newDelete_${act.guid}`).bind('click', function() {
                                     deleteForgeLinkElement($(this).attr("modelId"), $(this).attr("exeId"), $(this).attr("actId"));
                                 });
                                 
                             }
                         }
                         elementClickCount=0;
                         $("#LinkedTaskPanel-scroll-container").css("background-color","white");
                         $("#linkedElementTaskList").css({"color":"black","padding":"15px"});
                         $("#LinkedTaskPanel").attr("exeid",`${externalId}`);
                         $("#LinkedTaskPanel .docking-panel-title").css({
                             'color':"black",
                             'background':'white',
                             'box-shadow':'0px 2px 14px -8px rgba(120,120,120,1)',
                             '-webkit-box-shadow':'0px 2px 14px -8px rgba(120,120,120,1)',
                             '-moz-box-shadow':'0px 2px 14px -8px rgba(120,120,120,1)',
                             'border':'none',
                             'font-weight':'600'});
                         $("#LinkedTaskPanel .docking-panel-title").text(`Linked Tasks (${actCount})`);
                         $("#LinkedTaskPanel").css("border-radius","	5px");
                         $("#LinkedTaskPanel").append(`<div style="background:#e7e7e7;" class="docking-panel-footer"><div class="docking-panel-footer-resizer"></div></div>`);
                         if(!$.isEmptyObject(comparisonViewer)) {
                             $("#LinkedTaskPanel").css("position","fixed");
                         }
                     }
                 });
             } else {
                 $("#LinkedTaskPanel").remove();
                 elementClickCount=0;
             }
         } else {
             $("#LinkedTaskPanel").remove();
             elementClickCount=0;
         }
     }
     
     // fetches the properties for control + F feature to find the elements
     function getAllLeafComponentsForProperties(keyType,ind) {
         $("#elementFetchLoader").css("display","block");
         for (const [key, value] of Object.entries(singleModelBulkProperties)) {
             var propsA = value.properties;
             Object.keys(propsA).map(function(k, e) {
                 if (propsA[e][globalCategory] && propsA[e][globalCategory].indexOf('__') != 0 && propsA[e][globalCategory] == keyType) {
                     if (typeof elementProperties[keyType] !== "undefined") {
                         var attr = elementProperties[keyType];
                         if (!attr.includes(propsA[e][globalName])) {
                             attr.push(propsA[e][globalName]);
                             elementProperties[keyType] = attr;
                         }
                     } else {
                         var attr = [];
                         attr.push(propsA[e][globalName]);
                         elementProperties[propsA[e][globalCategory]] = attr;
                     }
                 }
             });
         }
         var properties = elementProperties[keyType];
          $.each(properties,function(index,item) {
                 $("#searchPropertyEle"+ind).append("<option value="+`'${item}'`+">"+item+"</option>");
          });
         $("#elementFetchLoader").css("display","none");
     }

     // fetches the values for control + F feature to find the elements
     function getAllLeafComponentsForValues(valType,ind,category) {
         $("#elementFetchLoader").css("display","block");
         for (const [key, value] of Object.entries(singleModelBulkProperties)) {
             var propsA = value.properties;
              Object.keys(propsA).filter(function(k, e) {
                 if (propsA[e][globalCategory] && propsA[e][globalCategory].indexOf('__') != 0  && propsA[e][globalCategory]==category && propsA[e][globalName] == valType) {
                     propsA[e][globalValue] = `${valType}_${propsA[e][globalValue]}`;
                     if (typeof elementsPropertyValues[valType] !== "undefined") {
                         var attr = elementsPropertyValues[valType];
                         if (!attr.includes(propsA[e][globalValue])) {
                             attr.push(propsA[e][globalValue]);
                             elementsPropertyValues[valType] = attr;
                         }
                     } else {
                         var attr = [];
                         attr.push(propsA[e][globalValue]);
                         elementsPropertyValues[propsA[e][globalName]] = attr;
                     }

                 }
             });
         }
         var values = elementsPropertyValues[valType];
          $.each(values,function(index,item) {
              var val = item.split(`${valType}_`)[1];
              $("#searchvalueEle"+ind).append("<option value="+`'${item}'`+">"+val+"</option>");
          });
         $("#elementFetchLoader").css("display","none");
     }

     // fetches the dbids for control + F feature to find the elements
     function getAllLeafComponentsForDbids(valType,category,property) {
         var valTypes = valType.split(`${property}_`)[1];
         $("#elementFetchLoader").css("display","block");
         for (const [key, value] of Object.entries(singleModelBulkProperties)) {
             var propsA = value.properties;
             var modelBdbId = value.dbId;
             Object.keys(propsA).filter(function(k, e) {
                 if (propsA[e][globalCategory] && propsA[e][globalCategory].indexOf('__') != 0 && (propsA[e][globalValue] == valTypes || propsA[e][globalValue] == valType) && propsA[e][globalCategory]==category
                         && propsA[e][globalName] == property) {
                     
                     if (typeof valuesToDbid[propsA[e][globalValue]] !== "undefined") {
                         var attr = valuesToDbid[propsA[e][globalValue]];
                         if (!attr.includes(propsA[e][globalValue])) {
                             attr.push(modelBdbId);
                             valuesToDbid[propsA[e][globalValue]] = attr;
                         }
                     } else {
                         var attr = [];
                         attr.push(modelBdbId);
                         valuesToDbid[propsA[e][globalValue]] = attr;
                     }
                 }
             });
         }
         $("#elementFetchLoader").css("display","none");
     }

     // fetches the category for control + F feature to find the elements
     function getAllLeafComponentsForCategory() {
         viewer.model.getBulkProperties(
                 singleModelFilteredDbs,
                 {
                     propFilter: false,
                     ignoreHidden: true
                 },
                 (objects) => {
                     singleModelBulkProperties=objects;
                     for (const [key, value] of Object.entries(objects)) {
                         var propsA = value.properties;
                          Object.keys(propsA).filter(function(k, e) {
                             if (propsA[e][globalCategory] && propsA[e][globalCategory].indexOf('__') != 0 && !elementCategories.includes(propsA[e][globalCategory])) {
                                 $("#searchCategoryEle0").append('<option value="' + propsA[e][globalCategory] + '">' + propsA[e][globalCategory] + '</option>');
                                 elementCategories.push(propsA[e][globalCategory]);
                             }
                          });
                     }
                     
                     $("#elementFetchLoader").css("display","none");
                 },
                 () => console.log('error')
             );
     }
     
     // finds all the leaf elements recursively 
     function getAllLeafComponents(model, callback) {
         var components = [];
         function getLeafComponentsRecursive(tree, parentId) {
             if (tree.getChildCount(parentId) > 0) {
                 tree.enumNodeChildren(parentId, function (childId) {
                     getLeafComponentsRecursive(tree, childId);
                 });
             }
             else {
                 components.push(parentId);
             }
             return components;
         }
         var instanceTree = model.getInstanceTree();
         var allLeafComponents = getLeafComponentsRecursive(instanceTree, instanceTree.nodeAccess.rootId);
         callback(allLeafComponents);
     }

     function listElements(callback) {
         getAllLeafComponents(modelA, function (modelAdbIds) {
             getAllLeafComponents(modelB, function (modelBdbIds) {
                 // this count will help wait until getProperties end all callbacks
                 var count = modelAdbIds.length + modelBdbIds.length;

                 var modelAExtIds = {};
                 modelAdbIds.forEach(function (modelAdbId) {
                     modelA.getProperties(modelAdbId, function (modelAProperty) {
                         modelAExtIds[modelAProperty.externalId] = { 'dbId': modelAdbId, 'properties': modelAProperty.properties };
                         count--;
                         if (count == 0) callback(modelAExtIds, modelBExtIds);
                     });
                 });

                 var modelBExtIds = {};
                 modelBdbIds.forEach(function (modelBdbId) {
                     modelB.getProperties(modelBdbId, function (modelBProperty) {
                         modelBExtIds[modelBProperty.externalId] = { 'dbId': modelBdbId, 'properties': modelBProperty.properties };
                         count--;
                         if (count == 0) callback(modelAExtIds, modelBExtIds);
                     });
                 });
             });
         });
     }

     // replaces the forge spinner to our visilean spinner
     function replaceSpinner() {
         var spinners = document.getElementsByClassName("forge-spinner");
         if (spinners.length == 0) return;
         var spinner = spinners[0];
         spinner.classList.remove("forge-spinner");
         spinner.classList.add('loaderContainer');
         spinner.setAttribute("id", "loaderContainer")
         spinner.style.display = "block";
         spinner.style.transform = "";
         spinner.style.opacity = "";
         spinner.innerHTML = '<div class="actionLoader"></div>';

     }

     function getLeafComponentsRec(current, parent) {
         if (tree.getChildCount(current) > 0) {
             tree.enumNodeChildren(current, function (children) {
                 getLeafComponentsRec(children, current);
             });
         } else {
             singleModelFilteredDbs.push(current);
         }
         
         var model = viewer.model;
         var modelData = model.getData();
         var it = modelData.instanceTree;
         var nodeName = it.getNodeName(current);
         if (!globalNodes.includes(current)) {
             dbWithNodename[current] = nodeName;
         }
     }

     // fill out the variables of dbids and mapping activity containing external ids
     function onSuccessCallback(data) {
         
         if (eleIds[this._myGUID] != null && typeof eleIds[this._myGUID] != "undefined") {
             var elementIds = eleIds[this._myGUID];
             for (var i = 0; i < elementIds.length; i++) {
                 var mappingdata = mappingDataList[this._myGUID].find((ele) => {
                     return ele.nodeid == elementIds[i];
                 });
                 
                 var dbid = data[elementIds[i]];
                 var nodeName = dbWithNodename[dbid];
                 if(nodeName !== "undefined" && typeof nodeName != "undefined") {
                     document.setBimElementsNameWithGuid[elementIds[i]] = nodeName;
                 }
                 
                 if (!dbWithActivity[this._myGUID]) {
                     if(!$.isEmptyObject(mappingdata)) {
                         dbWithActivity[this._myGUID] = [{ dbId: dbid, activities: mappingdata.activities }];
                     }
                     onlyDbId[this._myGUID] = [{ db: dbid, ele: elementIds[i] }];

                 } else {
                     var existingdata = dbWithActivity[this._myGUID].find((ele) => {
                         return ele.dbId == dbid;
                     });

                     if (existingdata) {
                         existingdata.activities = mappingdata.activities;
                     } else {
                         if(!$.isEmptyObject(mappingdata)) {
                             dbWithActivity[this._myGUID].push({ dbId: dbid, activities: mappingdata.activities });
                         }
                         onlyDbId[this._myGUID].push({ db: dbid, ele: elementIds[i] });
                     }
                 }
             }
         }

         if (viewmode == "splitView" && LastView == "scheduler") {
             handleLinkedElementsInScheduler(activityGuids);
         }
         viewer.modelstructure.createUI();
         var modelstruct_tree = viewer.modelstructure.tree;
         modelstruct_tree.delegates.map(function (delegate) {
             delegate.getTreeNodeLabel = function (node) {
                 var currentmodel = delegate.model;
                 var modelid = currentmodel._myGUID;
                 var dbId = this.getTreeNodeId(node);
                 if (delegate.instanceTree == null) {
                     return;
                 }
                 var res = delegate.instanceTree.getNodeName(dbId);
                 if (dbWithActivity[modelid]) {
                     dbWithActivity[modelid].map(function (dbact) {

                         if (dbact.dbId == dbId && dbact.activities != null && dbact.activities != "undefined") {

                             var taskCount = dbact.activities.length;
                             if (taskCount > 0) {
                                 res = res + " (" + taskCount + ")";
                             }
                         }
                     });
                 }
                 return res || ('Object ' + dbId);
             };
         });
         viewer.loadExtension("Autodesk.ADN.Viewing.Extension.MetaProperties");
     }

     // call this function to reset all the mapping data while updating, inserting or deleting any mapping data
     function resetAllMappingData() {
         
         dbWithActivity = {};
         onlyDbId = {};
         mappingDataList = [];

         $.each(loadedCurrentModels, function (index) {
             var mappingdataready = new Promise(function (resolve, reject) {

                 if (loadedCurrentModels[index] != null) {
                     var modelGuid = loadedCurrentModels[index]._myGUID;
                     if (typeof modelGuid != "undefined" && modelGuid != "NOGUID") {
                         var options = {
                             async: false,
                             success: function (mappingData) {
                                 var cnt = 0;
                                 $.each(mappingData, function (index, item) {
                                     cnt = cnt + 1;
                                     if (eleIds[modelGuid]) {
                                         eleIds[modelGuid].push(item.bimNodeId);
                                     } else {
                                         eleIds[modelGuid] = [item.bimNodeId];
                                     }
                                     if (mappingDataList[modelGuid]) {
                                         mappingDataList[modelGuid].push({ nodeid: item.bimNodeId, activities: item.linkedActivities });
                                     } else {
                                         mappingDataList[modelGuid] = [{ nodeid: item.bimNodeId, activities: item.linkedActivities }];
                                     }
                                     if (cnt == mappingData.length) {
                                         resolve();
                                     }
                                 });


                             },
                             error: function (error) {
                                 reject();
                                 console.log("Error while fetching mappingData");
                             }
                         };
                         visileanUtil.doApiAjaxGet("models/" + modelGuid + "/mappingData", options);
                     }
                 }
             });
             mappingdataready.then((data) => {
                 loadedCurrentModels[index].getExternalIdMapping(onSuccessCallback.bind(loadedCurrentModels[index]));
             })
                 .catch(err => console.log(err));
         });
     }

     function getForgeToken(callback) {
         visileanUtil.doApiAjaxGet('forge/auth/getForgeAuthToken', {}).then(res => {
             callback(res.accessToken, res.expiresAt);
         });
     }

     function getThreeLeggedToken(callback) {
         var refresh = sessionStorage.getItem("refreshToken");
         visileanUtil.doApiAjaxGet('forge/auth/getForgeAuthTokenTL?newToken=' + refresh, {}).then(res => {
             sessionStorage.setItem("refreshToken", res.refreshToken);
             sessionStorage.setItem("bimToken", res.accessToken);
             callback(res.accessToken, res.expiresAt);
         });
     }

     // an extension to link task with elements, all the methods inside are extension's own methods or events which are called when perticular actions are done
     class ModelSummaryExtension extends Autodesk.Viewing.Extension {
         constructor(viewer, options) {
             super(viewer, options);
             this._group = null;
             this._button = null;
             this.selected = [];
             this.selectionBuffer = [];
             this.createdLinksDataList = {};
         }

         load() {
             console.log('ModelSummaryExtension has been loaded');
             return true;
         }

         unload() {
             // Clean our UI elements if we added any
             if (this._group) {
                 this._group.removeControl(this._button);
                 if (this._group.getNumberOfControls() === 0) {
                     this.viewer.toolbar.removeControl(this._group);
                 }
             }
             console.log('ModelSummaryExtension has been unloaded');
             return true;
         }

         getAllLeafComponents(callback) {
             this.viewer.getObjectTree(function (tree) {
                 let leaves = [];
                 tree.enumNodeChildren(tree.getRootId(), function (dbId) {
                     if (tree.getChildCount(dbId) === 0) {
                         leaves.push(dbId);
                     }
                 }, true);
                 callback(leaves);
             });
         }

         onToolbarCreated() {
             // Create a new toolbar group if it doesn't exist
             this._group = this.viewer.toolbar.getControl('allMyAwesomeExtensionsToolbar');
             if (!this._group) {
                 this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
                 this.viewer.toolbar.addControl(this._group);
             }

             // Add a new button to the toolbar group
             this._button = new Autodesk.Viewing.UI.Button('ModelSummaryExtensionButton');
             this._button.onClick = (ev) => {
                 // Execute an action here
                 this.modelGuids = [];
                 this.selected = this.viewer.getAggregateSelection();
                 this.selectionBuffer = [];
                 this.selected.map((item) => {
                     var modelId = item.model._myGUID;
                     this.modelGuids.push(modelId);
                     item.selection.map((selectEle) => {
                         item.model.getProperties(selectEle, (result) => {
                             this.selectionBuffer.push({ modelguid: modelId, externalid: result.externalId });
                         })
                     });

                 });
                 this.viewer.getProperties(this.selected, (result) => console.log(result));
                 this.modelGuid = this.viewer.model._myGUID;

                 this.createLink();

             };

             this.createLink = () => {	// link activity to BIM nodes
                 var self = this;
                 if (this.selected.length == 0) {
                     app.trigger("statusMessage:new", {
                         message: messageUtils.getMessageString("bim.link.no.nodes"),
                         messageLevel: "ERROR",
                         showModal: true
                     });
                     return;
                 }

                 if (visileanUtil.currentActivity() == undefined && this.selected.length == 0) {
                     app.trigger("statusMessage:new", {
                         message: messageUtils.getMessageString("bim.link.no.selection"),
                         messageLevel: "INFO",
                         showModal: true
                     });
                     return;
                 }

                 if (visileanUtil.currentActivity() == undefined || (document.selectedTasks.length == 0)) {
                     app.trigger("statusMessage:new", {
                         message: messageUtils.getMessageString("bim.link.no.activity"),
                         messageLevel: "ERROR",
                         showModal: true
                     });
                     return;
                 }

                 messageUtils.showMessageModal({
                     message: messageUtils.getMessageString("bim.link.confirm"),
                     messageLevel: "INFO",
                     showModal: true,
                     modalOptions: [{
                         text: messageUtils.getMessageString("message.utils.ok"),
                         value: true
                     }, {
                         text: messageUtils.getMessageString("label.text.cancel"),
                         value: false
                     }]
                 }).then(function (result) {
                     if (result) {
                         self.linkActivityToBimNode();
                         $("#btnGanttLinkedTasks").attr("forgeClick", "true");
                         $("#btnGanttLinkedTasks").click();
                         setTimeout(function () {
                             $("#btnGanttLinkedTasks").removeAttr("forgeClick");
                         }, 1000);
                     }
                 });
             }

             this.linkActivityToBimNode = () => {
                 var self = this;
                 var selectionBuffer = this.selectionBuffer;
                 var createdLinksDataList = {};
                 var activities = document.selectedTasks;
                 var mappingData = [];
                 var activityGuidToLink;
                 var modelGuidFromApp = this.modelGuid;
                 if (activities.length > 0) {
                     for (var i = 0; i < activities.length; i++) {
                         activityGuidToLink = activities[i];
                         if (activityGuidToLink != undefined) {
                             $.each(this.selectionBuffer, function (ind, itm) {
                                 var singleMappingData = {
                                     modelGuid: itm.modelguid,
                                     activityGuid: activityGuidToLink,
                                     bimNodeId: itm.externalid
                                 };
                                 mappingData.push(singleMappingData);
                             });
                         }
                     }
                 } else {
                     activityGuidToLink = visileanUtil.currentActivity();
                     if (activityGuidToLink != undefined) {
                         $.each(this.selectionBuffer, function (ind, itm) {
                             var singleMappingData = {
                                 modelGuid: itm.modelguid,
                                 activityGuid: activityGuidToLink,
                                 bimNodeId: itm.externalid
                             };
                             mappingData.push(singleMappingData);
                         });
                     }
                 }
                 
                 var options = {
                     data: JSON.stringify(mappingData),
                     contentType: "application/json",
                     async: false,
                     success: function (mappingData) {
                         app.trigger("bimView:bimElementLink", mappingData);
                         app.trigger("statusMessage:new", {
                             message: messageUtils.getMessageString("bim.link.create.success"),
                             messageLevel: "SUCCESS",
                             showModal: true,
                             modalClose: false
                         });
                         self.selectionBuffer = [];
                         self.viewer.clearSelection(viewer);
                         document.selectedTasks = [];
                     },
                     error: function (jqXHR, textStatus, error) {
                         app.trigger("statusMessage:new", {
                             message: jqXHR.responseJSON.exception,
                             messageLevel: "ERROR",
                             showModal: true
                         });
                     }
                 };
                 visileanUtil.doApiAjaxPostPromise("models/" + modelGuidFromApp + "/mappingData", options).done(function (data) {
                     if (data) {
                         $.each(data, function (index, item) {
                             createdLinksDataList[item.bimNodeId] = item.linkedActivities;
                         });
                         resetAllMappingData();
                         app.trigger("unselectFromBim");
                         $("#LinkedTaskPanel").html("").remove();
                     }
                 });
             }
             this._button.setToolTip('Link Element');
             this._button.addClass('modelSummaryExtensionIcon');
             this._group.addControl(this._button);
             presentationModeInForge();
         }
     }
     
     function presentationModeInForge(){
         if(sessionStorage?.getItem("presentationMode") == 'true' ){
             $("#allMyAwesomeExtensionsToolbar, #allSelectTaskExtensionsToolbar").addClass("presentationModeClass");
         }
     }
     
     class PlannedVsActualExtension extends Autodesk.Viewing.Extension {
         constructor(viewer, options) {
             super(viewer, options);
             this._group = null;
             this._button = null;
         }

         load() {
             console.log('PlannedVsActualExtension has been loaded');
             return true;
         }
         unload() {
             if (this._group) {
                 this._group.removeControl(this._button);
                 
             }
             console.log('PlannedVsActualExtension has been unloaded');
             return true;
         }

         onToolbarCreated() {

             this._group = this.viewer.toolbar.getControl('allPlannedVsActualExtensionToolbar');
             if (!this._group) {
                 this._group = new Autodesk.Viewing.UI.ControlGroup('allPlannedVsActualExtensionToolbar');
                 this.viewer.toolbar.addControl(this._group);
             }

             this._button = new Autodesk.Viewing.UI.Button('PlannedVsActualButtonExt');
             this._button.onClick = (ev) => {
                 if(ev.target.classList.contains("hasDatepicker")) {
                 
                     $("#PlannedVsActualButtonExt .adsk-button-icon").datepicker("destroy");
                 
                 } else if(ev.target.classList.contains("adsk-button-icon")) {
                     
                     if($.isEmptyObject(projectStartDate) || $.isEmptyObject(projectEndDate))
                         setProjectStartAndEndDate();

                     var modelGuid = viewer.model._myGUID;
                     
                     $("#PlannedVsActualButtonExt .adsk-button-icon").datepicker({
                         changeYear: true,
                         changeMonth: true,
                         dateFormat : dateUtils.getJqDateFormat(),
                         maxDate : dateUtils.getFormattedDate(projectEndDate),
                         minDate : dateUtils.getFormattedDate(projectStartDate),
                         yearRange: '-30:+50',
                         onSelect: function(date){
                             $("#forgeViewer #PlannedVsActualButtonExt .adsk-button-icon").datepicker("setDate", date );
                             fillPlannedVsActualData(modelGuid,dateUtils.getLongDate(date));
                         }
                     });
                     
                     $("#forgeViewer .ui-datepicker, #forgeViewer2 .ui-datepicker").css({"display": "inline-block","padding":"10px","margin-left":"5vh"});
                 }
             };
             this._button.setToolTip('Planned Vs Actual');
             this._button.addClass('PlannedVsActualExtensionIcon');
             this._group.addControl(this._button);
         }
     }
     
     // extension for control + F feature to find out elements of any models and select them,
     // all the methods inside are extension's own methods or events which are called when perticular actions are done
     class SearchElementExtension extends Autodesk.Viewing.Extension {
         constructor(viewer, options) {
             super(viewer, options);
             this._group = null;
             this._button = null;
         }

         load() {
             console.log('SearchElementExtension has been loaded');
             return true;
         }
         unload() {
             // Clean our UI elements if we added any
             if (this._group) {
                 this._group.removeControl(this._button);
                 if (this._group.getNumberOfControls() === 0) {
                     this.viewer.toolbar.removeControl(this._group);
                 }
             }
             console.log('SearchElementExtension has been unloaded');
             return true;
         }

         onToolbarCreated() {
             // Create a new toolbar group if it doesn't exist
             this._group = this.viewer.toolbar.getControl('allSearchElementExtensionsToolbar');
             if (!this._group) {
                 this._group = new Autodesk.Viewing.UI.ControlGroup('allSearchElementExtensionsToolbar');
                 this.viewer.toolbar.addControl(this._group);
             }
             // Add a new button to the toolbar group
             this._button = new Autodesk.Viewing.UI.Button('SearchElementButton');
             this._button.onClick = (ev) => {
                 if ($("#searchElementPanel").length > 0) {
                     $("#searchElementPanel").remove();
                     $("#SearchElementButton").removeClass("active");
                     $("#SearchElementButton").addClass("inactive");
                 } else {
                     $("#SearchElementButton").removeClass("inactive");
                     $("#SearchElementButton").addClass("active");
                     var content = document.createElement('div');
                     var mypanel = new SearchElementPanel(viewer.container, 'searchElementPanel', 'Filter model elements', content);
                     mypanel.setVisible(true);
                     fillSearchElementData();
                      
                     fillUpFilterPanelData();
                 }
             };
             this._button.setToolTip('Filter model elements');
             this._button.addClass('SearchElementExtensionIcon');
             this._group.addControl(this._button);
         }
     }
     
     function autodeskViewDockingPanel(parentContainer, id, title, content, $this){
         $this.content = content;
         $this.closer = $this.getDocument().createElement("div");
         $this.closer.className = "docking-panel-close";
         Autodesk.Viewing.UI.DockingPanel.call($this, parentContainer, id, title, { shadow: false });
     }
     
     // Auto-fit to the content and don't allow resize.  Position at the coordinates given.
     function restrictContainerSize(aContainerObj, $this){
         $this.container.style.height = aContainerObj["height"];
         $this.container.style.width = aContainerObj["width"];
         $this.container.style.right = aContainerObj["right"];
         $this.container.style.top = aContainerObj["top"];
         $this.container.style.resize = aContainerObj["resize"];
         $this.container.style.left = aContainerObj["left"];
     }

     SearchElementPanel = function (parentContainer, id, title, content, x, y) {
         let $this = this;
         autodeskViewDockingPanel(parentContainer, id, title, content, $this);
         let lContainerObj = {
             height : "350px",
             width : "650px",
             right : "550px",
             top : "10px",
             resize : "auto"
         }
         restrictContainerSize(lContainerObj, $this);
     };

     SearchElementPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
     SearchElementPanel.prototype.constructor = SearchElementPanel;

     SearchElementPanel.prototype.initialize = function () {
         this.title = this.createTitleBar(this.titleLabel || this.container.id);
         this.container.appendChild(this.title);
         this.container.appendChild(this.content);
         this.container.appendChild(this.closer);
         var op = { left: false, heightAdjustment: 45, marginTop: 0 };
         this.scrollcontainer = this.createScrollContainer(op);
         var myvar = '<div id="filterElementPanel" style="padding: 20px; height:10px; color:white;"></div>';
         var html = [myvar].join('\n');
         $(this.scrollContainer).append(html);
         this.initializeCloseHandler(this.closer);
         this.initializeMoveHandlers(this.title);
     };

     // version control extension which handles and loads version on one on one
     // all the methods inside are extension's own methods or events which are called when perticular actions are done
     class VersonControlExtension extends Autodesk.Viewing.Extension {
         constructor(viewer, options) {
             super(viewer, options);
             this._group = null;
             this._button = null;
         }

         load() {
             console.log('VersonControlExtension has been loaded');
             return true;
         }

         unload() {
             // Clean our UI elements if we added any
             if (this._group) {
                 this._group.removeControl(this._button);
                 if (this._group.getNumberOfControls() === 0) {
                     this.viewer.toolbar.removeControl(this._group);
                 }
             }
             console.log('VersonControlExtension has been unloaded');
             return true;
         }

         onToolbarCreated() {
             // Create a new toolbar group if it doesn't exist
             this._group = this.viewer.toolbar.getControl('allVersionControlExtensionsToolbar');
             if (!this._group) {
                 this._group = new Autodesk.Viewing.UI.ControlGroup('allVersionControlExtensionsToolbar');
                 this.viewer.toolbar.addControl(this._group);
             }
             // Add a new button to the toolbar group
             this._button = new Autodesk.Viewing.UI.Button('VersionCheckExtensionButton');
             this._button.onClick = (ev) => {

                 if ($("#versionPanel").length > 0) {
                     $("#versionPanel").remove();
                     $("#VersionCheckExtensionButton").removeClass("active");
                     $("#VersionCheckExtensionButton").addClass("inactive");
                 } else {
                     $("#VersionCheckExtensionButton").removeClass("inactive");
                     $("#VersionCheckExtensionButton").addClass("active");
                     var content = document.createElement('div');
                     var mypanel = new VersionPanel(viewer.container, 'versionPanel', 'Compare Model Versions', content);
                     mypanel.setVisible(true);
                     getVersionInfo();
                 }
             };
             this._button.setToolTip('Compare Versions');
             this._button.addClass('VersionCheckExtensionIcon');
             this._group.addControl(this._button);
         }
     }


     VersionPanel = function (parentContainer, id, title, content, x, y) {
         let $this = this;
         autodeskViewDockingPanel(parentContainer, id, title, content, $this);
         let lContainerObj = {
             height : "350px",
             width : "650px",
             right : "550px",
             top : "10px",
             resize : "auto"
         }
         restrictContainerSize(lContainerObj, $this);
     };

     VersionPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
     VersionPanel.prototype.constructor = VersionPanel;

     VersionPanel.prototype.initialize = function () {
         this.title = this.createTitleBar(this.titleLabel || this.container.id);
         this.container.appendChild(this.title);

         this.container.appendChild(this.content);
         this.container.appendChild(this.closer);
         var op = { left: false, heightAdjustment: 45, marginTop: 0 };
         this.scrollcontainer = this.createScrollContainer(op);

         var modelid = sessionStorage.getItem("selectedVersion");
         var cButtonClass = "";
         if (modelid !== null && modelid !== "" && typeof modelid != "undefined") {
             cButtonClass = "VersionControlIconInModel selected";
         } else {
             cButtonClass = "VersionControlIconInModel";
         }
         var myvar = '<div id="versionsList" style="padding: 20px; height:10px; color:white;"><div class="row col-lg-12"><div id="versionDefault" class="col-md-5 DocumentCard">' +
             '</div><div class="col-md-1"><button id="VersionControlIconInModel" class="' + cButtonClass + '"></button></div><div class="col-md-5 DocumentCard">' +
             '<div id="versionSelect" class="DocumentCard_container"></div></div></div></div>';
         var html = [myvar].join('\n');
         $(this.scrollContainer).append(html);
         this.initializeCloseHandler(this.closer);
         this.initializeMoveHandlers(this.title);
     };
     
     class SelectTaskExtension extends Autodesk.Viewing.Extension {
         constructor(viewer, options) {
             super(viewer, options);
             this._group = null;
             this._button = null;
         }

         load() {
             console.log('SelectTaskExtensions has been loaded');
             return true;
         }
         unload() {
             // Clean our UI elements if we added any
             if (this._group) {
                 this._group.removeControl(this._button);
                 if (this._group.getNumberOfControls() === 0) {
                     this.viewer.toolbar.removeControl(this._group);
                 }
             }
             console.log('SelectTaskExtensions has been unloaded');
             return true;
         }

         onToolbarCreated() {
             // Create a new toolbar group if it doesn't exist
             this._group = this.viewer.toolbar.getControl('allSelectTaskExtensionsToolbar');
             if (!this._group) {
                 this._group = new Autodesk.Viewing.UI.ControlGroup('allSelectTaskExtensionsToolbar');
                 this.viewer.toolbar.addControl(this._group);
             }
             // Add a new button to the toolbar group
             this._button = new Autodesk.Viewing.UI.Button('SelectTaskExtensionButton');
             this._button.onClick = (ev) => {

                 document.selectedTasks = [];
                 if ($("#taskPanel").length > 0) {
                     $("#taskPanel").remove();
                     $("#SelectTaskExtensionButton").removeClass("active");
                     $("#SelectTaskExtensionButton").addClass("inactive");
                     locSelected=null;
                     orgSelected=null;
                 } else {
                     $("#SelectTaskExtensionButton").removeClass("inactive");
                     $("#SelectTaskExtensionButton").addClass("active");

                     var content = document.createElement('div');
                     var mypanel = new SimplePanel(viewer.container, 'taskPanel', 'Select Tasks', content);
                     pageIndex = 1;
                     getOrganisations(visileanUtil.currentProject());
                     getProjectLocations();
                     getParametersVal();
                     mypanel.setVisible(true);

                     var formatForDate = localStorage.getItem('dateFormatData');

                     var start = moment().startOf('week');
                     var end = moment().endOf('week');

                     $('#filterRangePickerModel').daterangepicker({
                         startDate: start,
                         endDate: end,
                         ranges: {
                             'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                             'Last Week': [moment().subtract(1,'week').startOf('week'), moment().subtract(1,'week').endOf('week')],
                             'This Week': [moment().startOf('week'), moment().endOf('week')],
                             'Next Week': [moment().add(1,'week').startOf('week'), moment().add(1,'week').endOf('week')],
                             'Next 30 Days': [moment(), moment().add(29, 'days')],
                         },
                         locale: {
                             format: formatForDate
                         }
                     }, selectedDates);
                     var sFormatted = dateUtils.getFormattedDate(start);
                     var eFormatted = dateUtils.getFormattedDate(end);
                     selectedDates(start, end);
                     $('#filterRangePickerModel span').html(`${sFormatted} - ${eFormatted}`);
                     $('#filterRangePickerModel').on('apply.daterangepicker', function (ev, picker) {
                         $('#filterRangePickerModel span').html(`${picker.startDate.format(dateUtils.getMomentDateFormat())} - ${picker.endDate.format(dateUtils.getMomentDateFormat())}`);
                     });
                 }
             };
             this._button.setToolTip('Select Tasks');
             this._button.addClass('selectTaskExtensionIcon');
             this._group.addControl(this._button);
             presentationModeInForge();
         }
     }

     SimplePanel = function (parentContainer, id, title, content, x, y) {
         let $this = this;
         autodeskViewDockingPanel(parentContainer, id, title, content, $this);
         let lContainerObj = {
             height : "400px",
             width : "650px",
             right : "50px",
             top : "100px",
             resize : "auto"
         }
         restrictContainerSize(lContainerObj, $this);
     };

     SimplePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
     SimplePanel.prototype.constructor = SimplePanel;

     SimplePanel.prototype.initialize = function () {
         this.title = this.createTitleBar(this.titleLabel || this.container.id);
         this.container.appendChild(this.title);
         this.container.appendChild(this.content);
         this.container.appendChild(this.closer);
         var op = { left: false, heightAdjustment: 45, marginTop: 0 };
         this.scrollcontainer = this.createScrollContainer(op);

             var myvar = `<div class="fixed-area-header">
                             <div class="icon_group-forge">
                                 <a class="searchRefresh-forge" title="Clear filter" onclick="return refreshTaskDataForge(true);">Clear filter</a>
                                 <a class="" name="linkTask" id="confirmAndSaveLink"><i class="glyphicon glyphicon-link"></i></a>
                                 <input class="eleFreeText" id="bimFreeText-forge" placeholder = "Enter Task Name or WBS ID" type="text">
                             </div>
                             <span class="clearfix"></span>
                             <div class="moreFilter-forge">
                                 <div class="dropdown eleLocation" title="Filter By Location">
                                     <select id="bimLocationSelect-forge"></select>
                                 </div>
                                 <div class="dropdown eleUser" title="Filter By Actor">
                                     <select id="bimUserSelect-forge"></select>
                                 </div>
                                 <div class="reasons-date-picker">
                                     <div id="filterRangePickerModel" class="date-picker datePickerForSelectTask"><i class="fa fa-calendar"></i>&nbsp;
                                         <span style="padding: 3px 8px 0px 15px; position: absolute; font-size: 11px;" id="filterdateModel" data-bind="text:labelSelectDate"></span> <i class="fa fa-caret-down"></i>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div class="searchResult-forge">
                             <div id="tasksDisplayListForge"></div>
                             <button id="loadMoreDataModelForge" class="btn btn-xs pull-right btn-primary" style="margin-top:5px; margin-right:15px; margin-bottom:10px;">Load more</button>
                         </div>`;

         var html = [myvar].join('\n');
         $(this.scrollContainer).append(html);
         this.initializeCloseHandler(this.closer);
         this.initializeMoveHandlers(this.title);
     };
     
     LinkedTaskPanel = function (parentContainer, id, title, content, x, y, h, w, resize) {
         let $this = this;
         autodeskViewDockingPanel(parentContainer, id, title, content, $this);
         let lContainerObj = {
             height : h+"px",
             width : w+"px",
             right : y+"px",
             top : x+"px",
             resize : resize
         }
         restrictContainerSize(lContainerObj, $this);
     };

     LinkedTaskPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
     LinkedTaskPanel.prototype.constructor = LinkedTaskPanel;

     LinkedTaskPanel.prototype.initialize = function () {
         this.title = this.createTitleBar(this.titleLabel || this.container.id);
         this.container.appendChild(this.title);

         this.container.appendChild(this.content);
         this.container.appendChild(this.closer);
         var op = { left: false, heightAdjustment: 45, marginTop: 0 };
         this.scrollcontainer = this.createScrollContainer(op);

         var myvar = '<div id="linkedElementTaskList" style="padding: 20px; height:10px; color:white;"></div>';
         var html = [myvar].join('\n');
         $(this.scrollContainer).append(html);
         this.initializeCloseHandler(this.closer);
         if($.isEmptyObject(comparisonViewer)) {
             this.initializeMoveHandlers(this.title);
         }
     };

     // bim360 issues extensions are to handle bim360 issues like edit or create or fetch them
     // all the methods inside are extension's own methods or events which are called when perticular actions are done
     BIM360CreateIssuePanel = function(parentContainer, id, title, content, x, y)
     {
       this.content = content;
       this.closer = this.getDocument().createElement("div");
       this.closer.className = "docking-panel-close";
      
     Autodesk.Viewing.UI.DockingPanel.call(this, parentContainer, id, title,{shadow:false});

     // Auto-fit to the content and don't allow resize.  Position at the coordinates given.
     //
     this.container.style.height = "575px";
     this.container.style.width = "350px";
     this.container.style.right =  "50px";
     this.container.style.top = "100px"; 
     this.container.style.resize = "auto";

     };

     BIM360CreateIssuePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
     BIM360CreateIssuePanel.prototype.constructor = BIM360CreateIssuePanel;
     
     BIM360CreateIssuePanel.prototype.initialize = function()
     { 
             this.title = this.createTitleBar(this.titleLabel || this.container.id);
     this.container.appendChild(this.title);

     this.container.appendChild(this.content);
     this.container.appendChild(this.closer);


     var op = {left:false,heightAdjustment:45,marginTop:0};
     this.scrollcontainer = this.createScrollContainer(op);
     
      var issueType = '<select id="issueType" class="form-control createIssueInputs"></select>';
      var issueSubType = '<select id="issueSubType" class="form-control createIssueInputs"></select>';
     
     var myvar = '<div style="padding: 5px 40px 5px 15px;"><div class="form-group"><label for="issueTitle">Title</label>'+
         '<input type="text" class="form-control createIssueInputs" id="issueTitle" aria-describedby="emailHelp" placeholder="Enter title">'+
         '<small id="titleError" style="color:red; display:none;" class="form-text text-muted">Please enter valid title.</small></div>'+
         '<div class="form-group"><label for="issueStatus">Select Status</label>'+
         '<select class="form-control createIssueInputs" id="issueStatus" ><option value="open">Open</option><option value="draft">Draft</option></select>'+
         '<small id="statusError" style="color:red; display:none;" class="form-text text-muted">Select valid status.</small></div>'+
         '<div class="form-group"><label for="issueType">Issue type</label>'+issueType+'<small id="typeError" style="color:red; display:none;" class="form-text text-muted">Select valid type.</small></div>'+
         '<div class="form-group"><label for="issueType">Issue sub type</label>'+issueSubType+'<small id="subTypeError" style="color:red; display:none;" class="form-text text-muted">Select valid sub type.</small></div>'+
         '<div class="form-group"><label for="issueDate">Due date</label>'+
         '<input type="date" class="form-control createIssueInputs createEditIssueDate" id="issueDate" aria-describedby="emailHelp"><small id="dateError" style="color:red; display:none;" class="form-text text-muted">Please enter valid due date.</small></div>'+
         '<div class="form-group"><label for="issueDesc">Description</label>'+
         '<input type="email" class="form-control createIssueInputs" id="issueDesc" aria-describedby="emailHelp" placeholder="Enter description"></div>'+
         '<center><button onClick="return createNewIssue(this);" style="width: 170px; margin-bottom: 20px;" class="forgePanelButton">Done</button></center>'
         '</div>';
         
     
     var html = [myvar].join('\n');


     $(this.scrollContainer).append(html);

     this.initializeCloseHandler(this.closer);
     this.initializeMoveHandlers(this.title);
            
     };
     
     BIM360EditIssuePanel = function(parentContainer, id, title, content, x, y)
     {
       this.content = content;
       this.closer = this.getDocument().createElement("div");
       this.closer.className = "docking-panel-close";
      
     Autodesk.Viewing.UI.DockingPanel.call(this, parentContainer, id, title,{shadow:false});

     // Auto-fit to the content and don't allow resize.  Position at the coordinates given.
     //
     this.container.style.height = "575px";
     this.container.style.width = "350px";
     this.container.style.right =  "50px";
     this.container.style.top = "100px"; 
     this.container.style.resize = "auto";

     };

     BIM360EditIssuePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
     BIM360EditIssuePanel.prototype.constructor = BIM360EditIssuePanel;
     
     BIM360EditIssuePanel.prototype.initialize = function()
     { 
             this.title = this.createTitleBar(this.titleLabel || this.container.id);
     this.container.appendChild(this.title);

     this.container.appendChild(this.content);
     this.container.appendChild(this.closer);


     var op = {left:false,heightAdjustment:45,marginTop:0};
     this.scrollcontainer = this.createScrollContainer(op);
     
      var issueType = '<select id="issueTypeEdit" class="form-control createIssueInputs"></select>';
      var issueSubType = '<select id="issueSubTypeEdit" class="form-control createIssueInputs"></select>';
     
     var myvar = '<div style="padding: 5px 40px 5px 15px;"><div class="form-group"><label for="issueTitle">Title</label>'+
         '<input type="text" class="form-control createIssueInputs" id="issueTitleEdit" aria-describedby="emailHelp" placeholder="Enter title">'+
         '<small id="titleErrorEdit" style="color:red; display:none;" class="form-text text-muted">Please enter valid title.</small></div>'+
         '<div class="form-group"><label for="issueStatus">Select Status</label>'+
         '<select class="form-control createIssueInputs" id="issueStatusEdit" ><option value="open">Open</option><option value="answered">Answered</option><option value="closed">Closed</option><option value="void">Void</option></select>'+
         '<small id="statusErrorEdit" style="color:red; display:none;" class="form-text text-muted">Select valid status.</small></div>'+
         '<div class="form-group"><label for="issueType">Issue type</label>'+issueType+'<small id="typeErrorEdit" style="color:red; display:none;" class="form-text text-muted">Select valid type.</small></div>'+
         '<div class="form-group"><label for="issueType">Issue sub type</label>'+issueSubType+'<small id="subTypeErrorEdit" style="color:red; display:none;" class="form-text text-muted">Select valid sub type.</small></div>'+
         '<div class="form-group"><label for="issueDateEdit">Due date</label>'+
         '<input type="date" class="form-control createIssueInputs createEditIssueDate" id="issueDateEdit" aria-describedby="emailHelp"><small id="dateErrorEdit" style="color:red; display:none;" class="form-text text-muted">Please enter valid due date.</small></div>'+
         '<div class="form-group"><label for="issueDescEdit">Description</label>'+
         '<input type="email" class="form-control createIssueInputs" id="issueDescEdit" aria-describedby="emailHelp" placeholder="Enter description"><input type="hidden" id="issueIdEdit" /></div>'+
         '<center><button onClick="return editIssue(this);" style="width: 170px; margin-bottom: 20px;" class="forgePanelButton">Done</button></center>'
         '</div>';
         
     
     var html = [myvar].join('\n');


     $(this.scrollContainer).append(html);

     this.initializeCloseHandler(this.closer);
     this.initializeMoveHandlers(this.title);
            
     };
     
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
             var label = event.value.label.text;
             if(typeof label != "undefined" && label != null && typeof ($("div[title='" + label +"'][class='category-name']")).offset() != "undefined") {
                  $('#bim360IssuePanel-scroll-container').animate({
                         scrollTop: ($("div[title='" + label +"'][class='category-name']")).offset().top
                  }, "slow");
             }
         };
         
         BIM360IssueExtension.prototype.load = function () {
           if (this.viewer.toolbar) {

             this.createUI();
           } else {

             this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
             this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
           }
           
           setTimeout(() => {
               var node = $("#toolbar-pushpinVis");
               $("#toolbar-pushpinFieldIssuesVis").remove();
               $("#toolbar-pushpinRfisVis").remove();
               $("#MyAppToolbar").append(node);
           }, 1000);
           
           return true;
         };

         BIM360IssueExtension.prototype.onToolbarCreated = function () {
           this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
           this.onToolbarCreatedBinded = null;
           this.createUI();
         };

         BIM360IssueExtension.prototype.createUI = function () {
           var _this = this;

           // SubToolbar
           this.subToolbar = (this.viewer.toolbar.getControl("MyAppToolbar") ?
             this.viewer.toolbar.getControl("MyAppToolbar") :
             new Autodesk.Viewing.UI.ControlGroup('MyAppToolbar'));
           this.viewer.toolbar.addControl(this.subToolbar);

           {
             var loadQualityIssues = new Autodesk.Viewing.UI.Button('loadQualityIssues');
             loadQualityIssues.onClick = function (e) {

                 if (_this.panel != null) {
                 _this.panel.setVisible(false);
               }
                 _this.panel = new BIM360IssuePanel(_this.viewer, _this.viewer.container, 'bim360IssuePanel', 'BIM360 Issues');

               _this.panel.setVisible(!_this.panel.isVisible());

               if (!_this.panel.isVisible()) return;

               _this.loadIssues();
             };
             loadQualityIssues.addClass('FetchAllIssuesExtensionIcon');
             loadQualityIssues.setToolTip('Fetch Issues');
             this.subToolbar.addControl(loadQualityIssues);
           }

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
     
         BIM360IssueExtension.prototype.loadIssues = function (containerId, urn) {

           var _this = this;
           if(typeof _this.viewer == "undefined") {
               _this.viewer = viewer;
           }
           this.pushPinExtensionName = 'Autodesk.BIM360.Extension.PushPin';
           if (_this.panel == null) {
                 _this.panel = new BIM360IssuePanel(_this.viewer, _this.viewer.container, 'bim360IssuePanel', 'BIM360 Issues');
               }
             _this.getIssues();
         }

         BIM360IssueExtension.prototype.getIssues = function () {
           var _this = this;

             _this.issues = fetchAllIssuesFromBim360();
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
               
                 if(issue.attributes.pushpin_attributes.viewer_state != null && typeof issue.attributes.pushpin_attributes.viewer_state.seedURN != "undefined" && loadedUrns.includes(issue.attributes.pushpin_attributes.viewer_state.seedURN)) {
                     var dateCreated = moment(issue.attributes.created_at);
                     var dateUpdated = moment(issue.attributes.updated_at);
                     var dueDate = moment(issue.attributes.due_date);
                     var issueStatus = issue.attributes.status.charAt(0).toUpperCase() + issue.attributes.status.slice(1);

                     if (_this.panel) {
                         var actionButtons = '<div class="issueActions"><button style="width: 18px;" id="im_'+issue.id+'" class="forgePanelButton forgeTooltip importThisIssueBtn" onClick="return importThisIssue(this);"><i class="glyphicon glyphicon-cloud-download"></i> <span class="tooltiptext">Select to Import</span></button>&nbsp;'+
                         '<button id="'+issue.id+'" onClick="return editThisIssue(this);" style="width: 18px;" class="forgePanelButton forgeTooltip">'+
                         '<input type="hidden" id="title_'+issue.id+'" value="'+issue.attributes.title+'" />'+
                         '<input type="hidden" id="status_'+issue.id+'" value="'+issue.attributes.status+'" />'+
                         '<input type="hidden" id="type_'+issue.id+'" value="'+issue.attributes.ng_issue_type_id+'" />'+
                         '<input type="hidden" id="subtype_'+issue.id+'" value="'+issue.attributes.ng_issue_subtype_id+'" />'+
                         '<input type="hidden" id="date_'+issue.id+'" value="'+issue.attributes.due_date+'" />'+
                         '<input type="hidden" id="description_'+issue.id+'" value="'+issue.attributes.description+'" />'+ 
                         '<i class="glyphicon glyphicon-edit"></i> <span class="tooltiptext">Edit Issue</span>'+
                         '</button></div>';
                         
                         _this.panel.addProperty('Actions ', actionButtons, issue.attributes.title);
                         _this.panel.addProperty('Title', issue.attributes.title, issue.attributes.title);
                         _this.panel.addProperty('Last Updated Date', dateUpdated.format('MMMM Do YYYY, h:mm a'), issue.attributes.title);
                         _this.panel.addProperty('Creation Date', dateCreated.format('MMMM Do YYYY, h:mm a'), issue.attributes.title);
                         _this.panel.addProperty('Status', issueStatus, issue.attributes.title);
                         _this.panel.addProperty('Root Cause', (issue.attributes.root_cause==null) ? "-" : issue.attributes.root_cause, issue.attributes.title);
                         _this.panel.addProperty('Location Description', (issue.attributes.location_description==null) ? "-" : issue.attributes.location_description, issue.attributes.title);
                         _this.panel.addProperty('Due Date', dueDate.format('MMMM Do YYYY, h:mm a'), issue.attributes.title);
                         _this.panel.addProperty('Description', (issue.attributes.description==null) ? "-" : issue.attributes.description, issue.attributes.title);
                         _this.panel.addProperty('Issue type', (issue.attributes.issue_type==null) ? "-" : issue.attributes.issue_type, issue.attributes.title);
                         
                     }

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
             })

           $(".issueActions").parent().removeAttr("title");
           pushPinExtension.loadItemsV2(pushpinDataArray);

         }
         
         BIM360IssueExtension.prototype.createIssue = function () {
               var _this = this;
               $("#createIssuePanel").remove();
               var content = document.createElement('div');
               var mypanel = new  BIM360CreateIssuePanel(viewer.container,'createIssuePanel','Create Issue',content);
               mypanel.setVisible(true);
               getNgIssueTypes("#issueType");
               
         }
         
     // to import bim360 issues by click import button in the issue panel
     importThisIssue = function(element){
         $(".loaderContainer").show();
         var issueId = element.id.split("_")[1];
         var constraintLogs = [];
         var issue = modelDocIssues[issueId];
         var constraintLog = getEmptyConstraint();
         constraintLog.title = issue.attributes.title;
         constraintLog.discription = issue.attributes.description;
         constraintLog.dueDate = dateUtils.getLongDate(issue.attributes.due_date);
         constraintLog.status = issue.attributes.status == "closed" ? "close" : "open";
         constraintLog.category = "External";
         constraintLog.bimdocIssueId = issueId;
         constraintLog.projectGuid = visileanUtil.currentProject();
         constraintLogs.push(constraintLog);
         
         if(constraintLogs.length > 0) {
             var projectGuid = visileanUtil.currentProject();
             var options = {
                data : JSON.stringify(constraintLogs),
                async : false,
                contentType:"application/json",
                statusCode : {
                     400 : showError,
                     404 : showError,
                     409 : showError,
                     403 : showError,
                     500 : showError
                 }
             }
         
             visileanUtil.doApiAjaxPostPromise(INSERT_CONSTRAIN_LOG_URL+"/"+projectGuid, options).done(function(response){
                 $('.importThisIssueBtn').each(function(i, obj) {
                     $(this).removeClass("selectedIssue");
                 });
                  app.trigger("statusMessage:new", {
                      message : "Issues successfully imported into VisiLean.",
                      messageLevel : "SUCCESS",
                      showModal : true
                  });
             });
         }
         $(".loaderContainer").hide();
     }
     
     editThisIssue = function(element) {
         $("#editIssuePanel").remove();
          var content = document.createElement('div');
          var mypanel = new  BIM360EditIssuePanel(viewer.container,'editIssuePanel','Edit Issue',content);
          
          mypanel.setVisible(true);
          
          $("#issueTitleEdit").val($("#title_"+element.id).val());
          var status = $("#status_"+element.id).val();
          $("#issueStatusEdit option[value='"+status+"']").attr("selected","selected");
          var type = $("#type_"+element.id).val();
          var subtype = $("#subtype_"+element.id).val();
          var date = $("#date_"+element.id).val();
          if(date != null) {
              $("#issueDateEdit").val(moment(date).utc().format('YYYY-MM-DD'));
          }

          $("#issueDescEdit").val($("#description_"+element.id).val() != null ? $("#description_"+element.id).val() : "");
          $("#issueIdEdit").val(element.id);
          
          getNgIssueTypesEdit(type,subtype);
          
     }
     
     // checkes the changes in all the fields and fires update api to autodesk to update the issue
     editIssue = function(element) {
         // hardcoded		
         var title = $("#issueTitleEdit").val();
         var status = $("#issueStatusEdit").val();
         var type = $("#issueTypeEdit").val();
         var subType = $("#issueSubTypeEdit").val();
         var date = $("#issueDateEdit").val();
         var desc = $("#issueDescEdit").val();
         var id = $("#issueIdEdit").val();
         
         if(title == "" || title == null) {
             $("#titleErrorEdit").show();
         } else if (status == "" || status == null) {
             $("#statusErrorEdit").show();
         } else if (type == "" || type == null) {
             $("#typeErrorEdit").show();
         } else if (subType == "" || subType == null) {
             $("#subTypeErrorEdit").show();
         } else if (date == "" || date == null) {
             $("#dateErrorEdit").show();
         } else {
             $("#titleErrorEdit").hide();
             $("#statusErrorEdit").hide();
             $("#typeErrorEdit").hide();
             $("#dateErrorEdit").hide();
             $("#subTypeErrorEdit").hide();
             
             var issueData = {
                 "title" : title,
                 "status" : status,
                 "type" : type,
                 "subType" : subType,
                 "date" : date,
                 "description" : desc
             };
             
             var pushPinExtension = viewer.getExtension("Autodesk.BIM360.Extension.PushPin");
             pushPinExtension.removeAllItems(); 
             $("#bim360IssuePanel").remove();
             
             $.each(issueData,function(k,v) {
                 var tempData = {};
                 if(k=="title") {
                     tempData["title"]=v;
                 } else if (k=="status") {
                     tempData["status"]=v;
                 } else if (k=="type") {
                     tempData["ng_issue_type_id"]=v;
                 } else if (k=="subType") {
                     tempData["ng_issue_subtype_id"]=v;
                 } else if (k=="date") {
                     tempData["due_date"]=v;
                 } else if (k=="description") {
                     tempData["description"]=v;
                 }
                 
                 var data = {
                           type: 'quality_issues',
                           id: id,
                           attributes: tempData
                     };
                     patchExistingIssue(data,id);
                 
             });
             BIM360IssueExtension.prototype.loadIssues();
             
              app.trigger("statusMessage:new", {
                     message : "Issue has been edited successfully.",
                     messageLevel : "SUCCESS",
                     showModal : true
              });
              
             $("#editIssuePanel").remove();
         }
         
     }
     
     // fires and api to create an issue in bim360 Docs
     createNewIssue = function(element) {
         var title = $("#issueTitle").val();
         var status = $("#issueStatus").val();
         var type = $("#issueType").val();
         var subType = $("#issueSubType").val();
         var date = $("#issueDate").val();
         var desc = $("#issueDesc").val();
         
         if(title == "" || title == null) {
             $("#titleError").show();
         } else if (status == "" || status == null) {
             $("#statusError").show();
         } else if (type == "" || type == null) {
             $("#typeError").show();
         } else if (subType == "" || subType == null) {
             $("#subTypeError").show();
         } else if (date == "" || date == null) {
             $("#dateError").show();
         } else {
             $("#titleError").hide();
             $("#statusError").hide();
             $("#typeError").hide();
             $("#dateError").hide();
             $("#subTypeError").hide();
             
             var issueData = {
                 "title" : title,
                 "status" : status,
                 "type" : type,
                 "subType" : subType,
                 "date" : date,
                 "description" : desc
             };
             
             postNewIssue(issueData);
             $("#createIssuePanel").remove();
         }
         
     }
     
     $(document).on("click","#selectAllIssue",function() {
         var text = $(this).text();
         if(text.includes("Select")) {
             $(this).text("Deselect All");
             $('.importThisIssueBtn').each(function(i, obj) {
                 if(!$(this).hasClass("selectedIssue")) {
                     $(this).addClass("selectedIssue");
                 }
             });
         } else {
             $(this).text("Select All");
             $('.importThisIssueBtn').each(function(i, obj) {
                 $(this).removeClass("selectedIssue");
             });
         }
         
     });
     
     $(document).on("click","#importIssueBtn",function() {
         var constraintLogs = [];
         $(".loaderContainer").show();
         $(".importThisIssueBtn").each(function(i, obj) {
             if($(this).hasClass("selectedIssue")) {
                 var issueId = $(this).attr("id").split("_")[1];
                 var issue = modelDocIssues[issueId];
                 var constraintLog = getEmptyConstraint();
                 constraintLog.title = issue.attributes.title;
                 constraintLog.discription = issue.attributes.description;
                 constraintLog.dueDate = dateUtils.getLongDate(issue.attributes.due_date);
                 constraintLog.status = issue.attributes.status == "closed" ? "close" : "open";
                 constraintLog.category = "External";
                 constraintLog.bimdocIssueId = issueId;
                 constraintLog.projectGuid = visileanUtil.currentProject();
                 constraintLogs.push(constraintLog);
             }
         });
         
         if(constraintLogs.length > 0) {
             var projectGuid = visileanUtil.currentProject();
             var options = {
                data : JSON.stringify(constraintLogs),
                async : false,
                contentType:"application/json",
                statusCode : {
                     400 : showError,
                     404 : showError,
                     409 : showError,
                     403 : showError,
                     500 : showError
                 }
             }
         
             visileanUtil.doApiAjaxPostPromise(INSERT_CONSTRAIN_LOG_URL+"/"+projectGuid, options).done(function(response){
                 $('.importThisIssueBtn').each(function(i, obj) {
                     $(this).removeClass("selectedIssue");
                 });
                  app.trigger("statusMessage:new", {
                      message : "Issues successfully imported into VisiLean.",
                      messageLevel : "SUCCESS",
                      showModal : true
                  });
             });
         }
         $(".loaderContainer").hide();
     });
     
     // gets issues sub types from autodesk to create an issue in bim360 docs
     function getNgIssueTypesEdit(type,subtype) {
         var containerId = sessionStorage.getItem("containerId");
         $("#issueSubEdit").find('option').remove();
         $("#issueSubTypeEdit").find('option').remove();
         
         var urls = 'https://developer.api.autodesk.com/issues/v1/containers/'+containerId+'/ng-issue-types?include=subtypes';
          $.ajax({
               type: "GET",
               beforeSend: function(request) {
                 request.setRequestHeader("Authorization", "Bearer "+sessionStorage.getItem("bimToken"));
                 request.setRequestHeader("Content-Type", "application/vnd.api+json");
               },
               url: urls,
               async: false,
               error: function(httpObj, textStatus) {    
                   
               },
               success: function(msg) {
                   if(typeof msg != "undefined" && typeof msg.results != "undefined") {
                       $("#issueTypeEdit").append("<option value=''>Select issue type</option>");
                       ngIssueSubTypes={};
                       $.each(msg.results,function(index,item) {
                           if(item.id == type) {
                               var option = "<option selected value='"+item.id+"'>"+item.title+"</option>"
                               $.each(item.subtypes,function(inx,itm){
                                   if(itm.id == subtype) {
                                       var option = "<option selected value='"+itm.id+"'>"+itm.title+"</option>";
                                   } else {
                                       var option = "<option value='"+itm.id+"'>"+itm.title+"</option>";
                                   }
                                   
                                   $("#issueSubTypeEdit").append(option);
                                   
                               })
                           } else {
                               var option = "<option value='"+item.id+"'>"+item.title+"</option>"  
                           }
                           
                           $("#issueTypeEdit").append(option);
                           
                           if(typeof item.subtypes != "undefined" && item.subtypes != null) {
                               ngIssueSubTypes[item.id]=item.subtypes;
                           }
                       });
                   }
                   }
          });
     }
     
     // gets issues types from autodesk to create an issue in bim360 docs
     function getNgIssueTypes(issueId) {
         $("#issueSub").find('option').remove();
         var containerId = sessionStorage.getItem("containerId");
         var urls = 'https://developer.api.autodesk.com/issues/v2/containers/'+containerId+'/ng-issue-types?include=subtypes';
          $.ajax({
               type: "GET",
               beforeSend: function(request) {
                 request.setRequestHeader("Authorization", "Bearer "+sessionStorage.getItem("bimToken"));
                 request.setRequestHeader("Content-Type", "application/vnd.api+json");
               },
               url: urls,
               async: false,
               error: function(httpObj, textStatus) {    
                   
               },
               success: function(msg) {
                   if(typeof msg != "undefined" && typeof msg.results != "undefined") {
                       $(issueId).append("<option value=''>Select issue type</option>");
                       ngIssueSubTypes={};
                       $.each(msg.results,function(index,item) {
                           var option = "<option value='"+item.id+"'>"+item.title+"</option>"
                           $(issueId).append(option);
                           if(typeof item.subtypes != "undefined" && item.subtypes != null) {
                               ngIssueSubTypes[item.id]=item.subtypes;
                           }
                       });
                   }
               }
          });
     }
     
     $(document).on("change","#issueType",function() {
         
         var typeId = $(this).val();
         var issueSub = ngIssueSubTypes[typeId];
         $("#issueSubType").find('option').remove();
         $("#issueSubType").append("<option value=''>Select issue sub type</option>");
         if(typeof issueSub != "undefined" && issueSub != null) {
             $.each(issueSub,function(index,item) {
                 var option = "<option value='"+item.id+"'>"+item.title+"</option>";
                 $("#issueSubType").append(option);
             });
         }
         
     });
     
     $(document).on("change","#issueTypeEdit",function() {
         
         var typeId = $(this).val();
         var issueSub = ngIssueSubTypes[typeId];
         $("#issueSubTypeEdit").find('option').remove();
         $("#issueSubTypeEdit").append("<option value=''>Select issue sub type</option>");
         if(typeof issueSub != "undefined" && issueSub != null) {
             $.each(issueSub,function(index,item) {
                 var option = "<option value='"+item.id+"'>"+item.title+"</option>";
                 $("#issueSubTypeEdit").append(option);
             });
         }
         
     });
     
     function getEmptyConstraint() {
         
         var constraintLog = {
             title : "",
             discription : "",
             dueDate : "",
             status : "",
                 priorty : "medium",
             projectGuid : "",
             category: "",
             bimdocIssueId: ""
         };                       
         return constraintLog;
     }

     function postNewIssue(issueData) {
         var pushPinExtension = viewer.getExtension("Autodesk.BIM360.Extension.PushPin");
         pushPinExtension.removeAllItems(); 
         $("#bim360IssuePanel").remove();
          pushPinExtension.pushPinManager.addEventListener('pushpin.created', function (e) {
                 pushPinExtension.pushPinManager.removeEventListener('pushpin.created', arguments.callee);
                 pushPinExtension.endCreateItem();

                 var target_urn = sessionStorage.getItem("containerUrn");
                 var starting_version = 1;
         
                var issue = pushPinExtension.getItemById(pushPinExtension.pushPinManager.pushPinList[0].itemData.id ); 
                
                 if (issue === null) return; 
                 var data = {
                   type: 'quality_issues',
                   attributes: {
                     title: issueData.title, 
                     description: issueData.description,
                     status: issueData.status,
                     due_date: issueData.date,
                     target_urn: target_urn,
                     starting_version: starting_version, 
                     ng_issue_type_id: issueData.type,
                     ng_issue_subtype_id: issueData.subType,

                     sheet_metadata: { 
                       is3D: true,
                       sheetGuid: this.viewer.model.getDocumentNode().data.guid,
                       sheetName: this.viewer.model.getDocumentNode().data.name
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
               
                  
                 var ids = sessionStorage.getItem("containerId");
                 var urls = 'https://developer.api.autodesk.com/issues/v2/containers/'+ids+'/issues'
                 $.ajax({
                       type: "POST",
                       beforeSend: function(request) {
                         request.setRequestHeader("Authorization", "Bearer "+sessionStorage.getItem("bimToken"));
                         request.setRequestHeader("Content-Type", "application/vnd.api+json");
                       },
                       url: urls,
                       async: false,
                       data: JSON.stringify({ data: data }),
                       error: function(httpObj, textStatus) {    
                           pushPinExtension.pushPinManager.removeItemById('0');
                            console.log(httpObj);
                            app.trigger("statusMessage:new", {
                                  message : messageUtils.getMessageString("issue.creation.error"),
                                  messageLevel : "ERROR",
                                  showModal : true
                              });
                            
                       },
                       success: function() {
                           app.trigger("statusMessage:new", {
                               message : messageUtils.getMessageString("issue.creation.success"),
                                  messageLevel : "SUCCESS",
                                  showModal : true
                              });
                           BIM360IssueExtension.prototype.loadIssues();
                       }
                  });

               });
                  
               // start asking for the push location
               pushPinExtension.startCreateItem({ label: issueData.title, status: 'open', type: 'issues' });
         
     }
     
     function patchExistingIssue(issueData,iid) {
     
         var data = issueData;
         var ids = sessionStorage.getItem("containerId");
         var urls = 'https://developer.api.autodesk.com/issues/v1/containers/'+ids+'/issues/'+iid
         $.ajax({
               type: "PATCH",
               beforeSend: function(request) {
                 request.setRequestHeader("Authorization", "Bearer "+sessionStorage.getItem("bimToken"));
                 request.setRequestHeader("Content-Type", "application/vnd.api+json");
                 
               },
               url: urls,
               async: false,
               data: JSON.stringify({ data: data }),
               error: function(httpObj, textStatus) {    
                  console.log("Error");
                  return;
               },
               success: function() {
                  return;
               }
          });

     }
     
     function refreshBimDocToken() {
         var token = sessionStorage.getItem("refreshToken");
         var useroptions = {
                 async : false,
                 cache : false,
             }; 
         var response = visileanUtil.doApiAjaxGet("forge/auth/refreshForgeAuthTokenThreeLegged?token="+token, useroptions);

         if(response!=null && response!="" && response.responseJSON != null && response.responseJSON!="" && response.responseJSON.accessToken!=null) {
             sessionStorage.setItem("bimToken",response.responseJSON.accessToken);
             sessionStorage.setItem("refreshToken",response.responseJSON.refreshToken);
             return response.responseJSON.accessToken;
         }
         return null;
     }
     
     function fetchAllIssuesFromBim360() {
         var accessToken = sessionStorage.getItem("bimToken");
         var issues = JSON.parse(sessionStorage.getItem("issues"));
         var returnArray=[];
         if(issues != null && typeof issues != "undefined") {
             $.each(issues,function(i,it) {
                 var url = "https://developer.api.autodesk.com/issues/v1/containers/"+it+"/issues?page[limit]=100";
                  $.ajax({
                       type: "GET",
                       beforeSend: function(request) {
                         request.setRequestHeader("Authorization", "Bearer "+accessToken);
                         request.setRequestHeader("Content-Type", "application/vnd.api+json");
                       },
                       url: url,
                       async: false,
                       error: function(httpObj, textStatus) {    
                           
                             if(httpObj.status==401) {
                                 var token = refreshBimDocToken();
                                 if(token!=null) {
                                 } else {
                                     app.trigger("statusMessage:new", {
                                          message : messageUtils.getMessageString("bim.doc.token.expire"),
                                          messageLevel : "ERROR",
                                          showModal : true
                                      });
                                 }
                             } else {
                                  app.trigger("statusMessage:new", {
                                      message : messageUtils.getMessageString("bim.doc.token.error"),
                                      messageLevel : "ERROR",
                                      showModal : true
                                  });
                             }
                       },
                       success: function(msg) {
                           
                           if(!$.isEmptyObject(msg.data)) {
                               for(var i=0;i<msg.data.length;i++) {
                                   returnArray.push(msg.data[i]);
                               }

                               $.each(returnArray,function(index,item) {
                                  modelDocIssues[item.id]=item;
                               });
                           }
                       }
                  });
             });
         }

         return returnArray;
     }
     
     
                 
     function getProjectSettings(projectGuid) {
         var options = {async:false};
         visileanUtil.doApiAjaxGetPromise("project/"+projectGuid+"/settings", options).then(function(data) {
             settings = data;
         });
         visibilitylist=settings.usersProjectVisibilityInfo;
         return settings;
         
     }
     
     $(document).on("change",".searchCategoryEle",function() {
         var ind = $(this).attr("index");
         $('#searchPropertyEle'+ind).find('option').remove();
         $('#searchElementsByDbid'+ind).find('option').remove();
         $('#searchvalueEle'+ind).find('option').remove();
         var category = $(this).val();
         
         var properties = elementProperties[category];
         $("#searchPropertyEle"+ind).append("<option value=''>select property</option>");
         if(properties == null || typeof properties == "undefined") {
             getAllLeafComponentsForProperties(category,ind);
         } else {
             $.each(properties,function(index,item) {
                 $("#searchPropertyEle"+ind).append("<option value="+`'${item}'`+">"+item+"</option>");
             });
         }
         
         
         
     });
     
     $(document).on("change",".searchPropertyEle",function() {
         var ind = $(this).attr("index");
         var properties = $(this).val();
         var values = elementsPropertyValues[properties];
         var category = $(`#searchCategoryEle${ind}`).val();
         
         $('#searchvalueEle'+ind).find('option').remove();
         
         $("#searchvalueEle"+ind).append("<option value=''>select value</option>");
         if(values == null || typeof values == "undefined") {
             getAllLeafComponentsForValues(properties,ind,category);
         } else {
             $.each(values,function(index,item) {
                  var val = item.split(`${properties}_`)[1];
                  $("#searchvalueEle"+ind).append("<option value="+`'${item}'`+">"+val+"</option>");
             });
         }
         
     });
     
     $(document).on("change",".searchvalueEle",function() {
         var vals = valuesToDbid[$(this).val()];
         var index = $(this).attr('index');
         var category = $(`#searchCategoryEle${index}`).val();
         var property = $(`#searchPropertyEle${index}`).val();
         
         if(vals == null || typeof vals == "undefined") {
             getAllLeafComponentsForDbids($(this).val(),category,property);
         }
         
     });
     
     $(document).on("click","#searchElementsByDbid",function() {
             var value=[];
             var db=[];
             var common=null;
             $(".searchvalueEle").each(function(){
                 var vals = valuesToDbid[$(this).val()];
                 
                     if(common==null) {
                         common=vals;
                         value=vals;
                     } else {
                         value=[];
                         
                         $.each(common,function(index,item) {
                             $.each(vals,function(ind,itm) {
                                 if(item==itm && !value.includes(item)) {
                                     value.push(item);
                                 }
                             })
                         })
                         common=value;
                     }
                     
                 })
                 
                  viewer.select(value);
              })
         
     
         $(document).on("click","#addSearchEleFilter",function() {
             
             var index = parseInt($(this).attr("index"));
             if(index != null && typeof index != "undefined") {
                 index++;
                 $("#mainRowForEle").append('<div class="col-md-4"><select index="'+index+'" class="searchCategoryEle" style="color:white !important;" id="searchCategoryEle'+index+'"> <option value="">Select</option></select></div>'+
                         '<div class="col-md-4"><select index="'+index+'" class="searchPropertyEle" style="color:white !important;" id="searchPropertyEle'+index+'"> <option value="">Select</option></select></div>'+
                         '<div class="col-md-4"><select index="'+index+'" class="searchvalueEle" style="color:white !important;" id="searchvalueEle'+index+'"><option value="">Select</option></select></div></div>');
                 $(this).attr("index",index);
                 $("#removeSearchEleFilter").attr("index",index);
                 $.each(elementCategories,function(ind,item) {
                     $("#searchCategoryEle"+index).append("<option value="+`'${item}'`+">"+item+"</option>");
                 });
                 if(index > 0) {
                     $("#removeSearchEleFilter").show();
                 }
             }
             
         })
         
         $(document).on("click","#removeSearchEleFilter",function() {
             var index = $(this).attr("index");
             $("#searchCategoryEle"+index).parent().remove();
             $("#searchPropertyEle"+index).parent().remove();
             $("#searchvalueEle"+index).parent().remove();
             index--;
             $(this).attr("index",index);
             $("#addSearchEleFilter").attr("index",index);
             if(index < 1) {
                 $("#removeSearchEleFilter").hide();
             }
         })
                     
     function fillSearchElementData() {
          
          if(elementCategories.length==0 || elementProperties.length==0) {
              setTimeout(() => {
                  $("#elementFetchLoader").css("display","block");
                  getAllLeafComponentsForCategory();
                      $("#elementFetchLoader").css("display","none");
              }, 500);
          } else {
              setTimeout(() => {$("#elementFetchLoader").css("display","none")},100)
          }
          
     }
     
     function fillUpFilterPanelData() {
         
         $("#filterElementPanel").append(
         '<div class="row"><div class="col-md-7"><label style="display:block;" id="elementFetchLoader">Please wait <i class="fa fa-spinner fa-spin"></i></label></div>'+
         '<div class="col-md-3"><button id="searchElementsByDbid" style="position:relative; left:30px; color:white; background-color:black; float:right;" class="btn btn-primary">Search Elements</button></div><div class="col-md-1"></div></div><hr style="margin-top: 5px">'+
         '<div id="mainRowForEle" style="border-top:none;" class="row col-lg-12 moreFilter-forge">'+
         '<div class="col-md-4"><label>Category</label> <select index="0" class="searchCategoryEle" style="color:white !important;" id="searchCategoryEle0"> <option value="">select category</option></select></div>'+
         '<div class="col-md-4"><label>Property</label><select index="0" class="searchPropertyEle" style="color:white !important;" id="searchPropertyEle0"> <option value="">select property</option></select></div>'+
         '<div class="col-md-4"><label>Value</label><select index="0" class="searchvalueEle" style="color:white !important;" id="searchvalueEle0"><option value="">select value</option></select></div></div>'+
         '<div class="row"><button id="addSearchEleFilter" index="0" class="btn btn-primary">Add +</button> '+
         '<button id="removeSearchEleFilter" index="0" class="btn btn-primary">Remove -</button></div>'
         );
          
         $.each(elementCategories,function(index,item) {
             
             $("#searchCategoryEle0").append("<option value="+`'${item}'`+">"+item+"</option>");
             
         });
     }
     
     function getVersionInfo() {
         var modelGuid = viewer.model._myGUID;
         
         var useroptions = {
                 data : {
                     modelGuid: modelGuid
                 },
                 async : false,
                 cache : false,
                 dataType : "json"
             }; 
      visileanUtil.doApiAjaxGetPromise("models/"+visileanUtil.currentProject()+"/modelVersionsOfModel", useroptions).done(function(data) {
              
             if(data != null && data != "") {
                 var compareModelSelect = '<select id="compareThisModel" class="DocumentCard_heading-select"><option>Select Version</option>';
                 var modelid = sessionStorage.getItem("selectedVersion");
                 $.each(data,function(index,item){
                     
                     if(item.isDefaultVersion == true || item.isDefaultVersion == "true") {
                         var defaultModel = '<div id="defaultVersionModel" modelId="'+item.guid+'" class="DocumentCard_container">'+
                         '<h4 class="DocumentCard_heading">Default Model</h4>'+
                         '<div class="DocumentCard_filename"><b>'+item.name+'</b></div>'+
                         '<div class="DocumentCard_datec"><span style="color:grey;">Uploaded Date :</span> '+dateUtils.getFormattedDate(item.creationTimestamp)+'</div>'+
                         '<div class="DocumentCard_datec"><span style="color:grey;">Author :</span> '+item.createrActorName+'</div>'+
                         '<div class="DocumentCard__main-container__below-thumbnail">'+
                         '<div class="DocumentCard__main-container__below-thumbnail__bottom-row"><div>'+
                         '<div class="DocumentCard__main-container__below-thumbnail__bottom-row__label"><span style="color:grey;">Version :</span> V'+item.version+'</div>'+
                         '</div></div></div></div>';
                         $("#versionDefault").append(defaultModel);
                     } else {
                         if(modelid==item.guid) {
                             compareModelSelect += '<option selected value="'+item.modelUrn+'" id="'+item.guid+'">'+item.name+'</option>';
                         } else {
                             compareModelSelect += '<option value="'+item.modelUrn+'" id="'+item.guid+'">'+item.name+'</option>';
                         }
                     }
                     
                 });
                 compareModelSelect += '</select>';
                 $("#versionSelect").append(compareModelSelect);
                 modelVersionData=data;
             }
         });
     }
     
     $(document).on("change","#compareThisModel",function() {
         var modelid = $("#compareThisModel option:selected").attr("id");
         $("#versionSelect div").remove();
         $.each(modelVersionData, function(ind,itm) {
             if(itm.guid==modelid) {
                 var modelData =  '<div class="DocumentCard_filename"><b>'+itm.name+'</b></div>'+
                                 '<div class="DocumentCard_datec"><span style="color:grey;">Uploaded Date :</span> '+dateUtils.getFormattedDate(itm.creationTimestamp)+'</div>'+
                                 '<div class="DocumentCard_datec"><span style="color:grey;">Author :</span> '+itm.createrActorName+'</div>'+
                                 '<div class="DocumentCard__main-container__below-thumbnail__bottom-row__label"><span style="color:grey;">Version :</span> V'+itm.version+'</div>';
                 $("#versionSelect").append(modelData);
             }
         });
         sessionStorage.setItem("selectedVersion",modelid);
     });
     
     function getOrganisations(guid) {
         getProjectSettings(guid);
         var actorListOptions = {
             data : {
                 sortField : 'name',
                 sortDir : 'ASC'
             },
             cache : false,
             dataType : "json",
             
         };
         
         return visileanUtil.doApiAjaxGetPromise("project/"+guid+"/organisations", actorListOptions).then(function(actorData) {
             $("#bimUserSelect-forge").append("<option value='Select User'>Select Organisation or User</option>");

             for(var c=0;c<visibilitylist.length;c++){
                 for(var a=0;a<actorData.length;a++){
                     if(actorData[a].personMembers!==undefined){
                         for(var b=0,len1=actorData[a].personMembers.length;b<len1;b++){

                             if (!actorData[a].personMembers[b] || actorData[a].personMembers[b].name == "") {
                                 actorData[a].personMembers.splice(b, 1);
                                 len1=actorData[a].personMembers.length;
                                 break;
                             }
                             
                             if(actorData[a].personMembers[b].guid==visibilitylist[c].userGuid && visibilitylist[c].visibility=="HIDDEN"){
                                 actorData[a].personMembers.splice(b,1);
                                     len1=actorData[a].personMembers.length;
                                     break;
                                 }
                             }
                             
                         }
                   }
             }
             for(var a=0;a<actorData.length;a++)
                 {
                     if(actorData[a].personMembers== undefined || actorData[a].personMembers== ""){
                         actorData.splice(a,1);
                     }
                 }

             actorData.forEach(function(org){
                 $("#bimUserSelect-forge").append("<option type=true class='locationSelectParent' value='"+org.guid+"'>"+org.name+"</option>");
                 org.personMembers.forEach(function(person){
                     $("#bimUserSelect-forge").append("<option type=false class='locationSelect' value='"+person.guid+"'>"+person.name+"</option>");
                 });
             });
         });
     }
     
     function getProjectLocations(){
         
         var options = {data: {sortField:'name', sortDir:'ASC'},
                 cache: false,
                 dataType: "json"
         };
         visileanUtil.doApiAjaxGetPromise("project/"+visileanUtil.currentProject()+"/locations", options).done(function(locations) {
             
             $("#bimLocationSelect-forge").append("<option value='Select Location'>Select Location</option>");
             
             var level = 0;
             var parentId = "";

             $.each(locations, function(index, item) {
                 
                 if(item.hasChildren)
                 {
                     if(parentId!=item.parentGuid) {
                         level=1;
                     }
                     var smalllevel = level;
                     var dot="";

                     while(smalllevel!==0) {
                         dot += ".";
                         smalllevel--;
                     }

                     level++;
                     item.name = dot + item.name;
                     var opt = `<option type=true class="locationSelectParent" value='${item.guid}'>${item.name}</option>`;
                     $("#bimLocationSelect-forge").append(opt);
                 
                 }else{
                     var smalllevel = level;
                     var dot="";

                     while(smalllevel!==0) {
                         dot += ".";
                         smalllevel--;
                     }
                     item.name = dot + item.name;
                     var opt1 = `<option type=false class="locationSelect" value='${item.guid}'>${item.name}</option>`;
                     $("#bimLocationSelect-forge").append(opt1);
                     parentId=item.parentGuid;
                 }
             });
         });
         
     }
     
     $(document).on("click",".forgeTaskListDiv",function() {
         if( $(this).attr("id") ) {

             if(document.selectedTasks.indexOf($(this).attr("id")) < 0)
             {
                 document.selectedTasks.push($(this).attr("id"));
                 $("#"+$(this).attr("id")).addClass("selectedTask");
             }else{
                 document.selectedTasks.splice(document.selectedTasks.indexOf($(this).attr("id")), 1);
                 $("#"+$(this).attr("id")).removeClass("selectedTask");
             }
                 return true;
             }
     });
     
     var locSelected =  null;
     var parentLoc = false;
     var parentOrg = false;
     $(document).on("change","#bimLocationSelect-forge",function() {
         pageIndex=1;
         $("#tasksDisplayListForge").empty();
         locSelected = $(this).val();

         parentLoc = $("#bimLocationSelect-forge").find('option:selected').attr("type"); 
         parentOrg = $("#bimUserSelect-forge").find('option:selected').attr("type"); 
         
         self.loadTaskData(orgSelected, locSelected, parentLoc, parentOrg);
     });
     
     $(document).on("change","#bimFreeText-forge",function() {
         pageIndex=1;
         $("#tasksDisplayListForge").empty();
         
         parentLoc = $("#bimLocationSelect-forge").find('option:selected').attr("type"); 
         parentOrg = $("#bimUserSelect-forge").find('option:selected').attr("type");
         
         self.loadTaskData(orgSelected, locSelected, parentLoc, parentOrg);
     });
     
     var orgSelected = null;
     $(document).on("change","#bimUserSelect-forge",function() {
         pageIndex=1;
         $("#tasksDisplayListForge").empty();
         orgSelected = $(this).val();

         parentLoc = $("#bimLocationSelect-forge").find('option:selected').attr("type"); 
         parentOrg = $("#bimUserSelect-forge").find('option:selected').attr("type");

         self.loadTaskData(orgSelected, locSelected, parentLoc, parentOrg);
     });
     
     $(document).on("click","#loadMoreDataModelForge",function() {
         pageIndex++;
         
         parentLoc = $("#bimLocationSelect-forge").find('option:selected').attr("type"); 
         parentOrg = $("#bimUserSelect-forge").find('option:selected').attr("type");
         
         self.loadTaskData(orgSelected, locSelected, parentLoc, parentOrg);
     });
     
     $(document).on("keydown","#taskSearchForge",function() {
         var unfilteredList = document.mainTasksList;
         var str = $(this).val();
             
             if(str ==="" || str == undefined || str == null){
                 refreshTaskDataForge(true);
                 return true;
             }
             var array = find(unfilteredList, str);
             if(array.length > 0){
                 $("#tasksDisplayListForge").empty();
                 $.each(array, function(item) {
                     item = array[item];
                     var elementStatus = getStatusClassForTask(item.status);
                     var actLocation = (item.activityLocation != null) ? item.activityLocation : '-NA-';
                     
                     var appendElement = '<div class="forgeTaskListDiv '+elementStatus+'" id="'+item.guid+'" value="'+item.guid+'">'+
                         '<label for="'+item.guid+'">'+item.name+'</label>'+
                         '<div class="locationsearch">'+
                          '   <i class="fa fa-map-marker" aria-hidden="true"></i> In '+
                          '   <span for="'+item.guid+'">'+actLocation+'</span></div></div>';
                     
                     $("#tasksDisplayListForge").append(appendElement);
                 
                 });
             }
     })

     function selectedDates(start, end) {
         var formatForDate = localStorage.getItem('dateFormatData');
         $('#filterRangePickerModel span').html(start.format(formatForDate) + ' - ' + end.format(formatForDate));
         var filterdate = document.getElementById("filterdateModel").textContent;
         
         if (filterdate != null && filterdate != "" && filterdate != undefined) {
             var filterdates = filterdate.split(" - ");
             var dateStart = filterdates[0];
             var dateEnd = filterdates[1];
             document.selectedRange.start = dateUtils.getLongDate($.trim(dateStart));
             document.selectedRange.end = dateUtils.getLongDate($.trim(dateEnd));
         } else {
             document.selectedRange.start = start;
             document.selectedRange.end = end;
         }
         
         pageIndex = 1;
         $("#tasksDisplayListForge").empty();
         self.loadTaskData(orgSelected, locSelected, parentLoc, parentOrg);
         $('#filterRangePickerModel').data('daterangepicker').setStartDate(start);
         $('#filterRangePickerModel').data('daterangepicker').setEndDate(end);
         return true;
     }

     $(document).on("click", "#confirmAndSaveLink", function () {
         var hideFullScreen = false;
         if ($("#toolbar-fullscreenTool div.adsk-icon-fullscreen-exit").length == 1) {
             hideFullScreen = true;
             $("#toolbar-fullscreenTool").click();
         }
         this.modelGuids = [];
         this.selectedElement = viewer.getAggregateSelection();
         var selectionBuffer = [];
         this.selectedElement.map((item) => {

             var modelId = item.model._myGUID;
             this.modelGuids.push(modelId);

             item.selection.map((selectEle) => {

                 item.model.getProperties(selectEle, (result) => {
                     selectionBuffer.push({ modelguid: modelId, externalid: result.externalId });
                 });
             });
         });

         var modelGuid = viewer.model._myGUID;
         if (this.selectedElement.length == 0) {
             app.trigger("statusMessage:new", {
                 message: messageUtils.getMessageString("bim.link.no.nodes"),
                 messageLevel: "ERROR",
                 showModal: true
             });
             return;
         }

         if (visileanUtil.currentActivity() == undefined && this.selectedElement.length == 0) {
             app.trigger("statusMessage:new", {
                 message: messageUtils.getMessageString("bim.link.no.selection"),
                 messageLevel: "INFO",
                 showModal: true
             });
             return;
         }

         if (document.selectedTasks.length == 0) {
             app.trigger("statusMessage:new", {
                 message: messageUtils.getMessageString("bim.link.no.activity"),
                 messageLevel: "ERROR",
                 showModal: true
             });
             return;
         }

         messageUtils.showMessageModal({
             message: messageUtils.getMessageString("bim.link.confirm"),
             messageLevel: "INFO",
             showModal: true,
             modalOptions: [{
                 text: messageUtils.getMessageString("message.utils.ok"),
                 value: true
             }, {
                 text: messageUtils.getMessageString("label.text.cancel"),
                 value: false
             }]
         }).then(function (result) {
             if (result) {

                 var self = this;
                 var createdLinksDataList = {};
                 var activities = document.selectedTasks;
                 var mappingData = [];
                 var activityGuidToLink;
                 var modelGuidFromApp = modelGuid;

                 if (activities.length > 0) {

                     for (var i = 0; i < activities.length; i++) {
                         activityGuidToLink = activities[i];
                         if (activityGuidToLink != undefined) {
                             $.each(selectionBuffer, function (ind, itm) {
                                 var singleMappingData = {
                                     modelGuid: itm.modelguid,
                                     activityGuid: activityGuidToLink,
                                     bimNodeId: itm.externalid
                                 };
                                 mappingData.push(singleMappingData);
                             });
                         }
                     }
                 } else {
                     activityGuidToLink = visileanUtil.currentActivity();
                     if (activityGuidToLink != undefined) {
                         $.each(selectionBuffer, function (ind, itm) {
                             var singleMappingData = {
                                 modelGuid: itm.modelguid,
                                 activityGuid: activityGuidToLink,
                                 bimNodeId: itm.externalid
                             };
                             mappingData.push(singleMappingData);
                         });
                     }
                 }

                 var options = {
                     data: JSON.stringify(mappingData),
                     contentType: "application/json",
                     async: false,
                     success: function (mappingData) {
                         app.trigger("bimView:bimElementLink", mappingData);
                         app.trigger("statusMessage:new", {
                             message: messageUtils.getMessageString("bim.link.create.success"),
                             messageLevel: "SUCCESS",
                             showModal: true,
                             modalClose: false
                         });
                         if (hideFullScreen) {
                             setTimeout(function () {
                                 $("#toolbar-fullscreenTool").click();
                             }, 700);
                         }
                         self.selectionBuffer = [];
                         viewer.clearSelection();
                         $(".forgeTaskListDiv").removeClass("selectedTask");
                     },
                     error: function (jqXHR, textStatus, error) {
                         app.trigger("statusMessage:new", {
                             message: jqXHR.responseJSON.error,
                             messageLevel: "ERROR",
                             showModal: true
                         });
                     }
                 };

                 visileanUtil.doApiAjaxPostPromise(`models/${modelGuidFromApp}/mappingData`, options)
                     .done(function (data) {
                         $("#LinkedTaskPanel").html("").remove();
                         if (data) {
                             document.selectedTasks = [];
                             resetAllMappingData();
                         }
                         app.trigger("unselectFromBim");
                     });

                 $("#btnGanttLinkedTasks").attr("forgeClick", "true");
                 $("#btnGanttLinkedTasks").click();
                 setTimeout(function () {
                     $("#btnGanttLinkedTasks").removeAttr("forgeClick");
                 }, 1000);
             }
         });
     });

     refreshTaskDataForge = function (cached) {

         if (!cached) {
             parentLoc = $("#bimLocationSelect-forge").find('option:selected').attr("type"); 
             parentOrg = $("#bimUserSelect-forge").find('option:selected').attr("type");
             self.loadTaskData(orgSelected, locSelected, parentLoc, parentOrg);
         } else {
             $("#tasksDisplayListForge").empty();
             $("#bimLocationSelect-forge").val("Select Location");
             $("#bimUserSelect-forge").val("Select User");
             $("#bimFreeText-forge").val("");
             orgSelected = null;
             locSelected = null;
             var start = moment().subtract(6, 'days');
             var end = moment();
             var sFormatted = dateUtils.getFormattedDate(start);
             var eFormatted = dateUtils.getFormattedDate(end);
             selectedDates(start, end);
             $('#filterRangePickerModel span').html(`${sFormatted} - ${eFormatted}`);
         }

     };


     // loads data into select task panel in order to link the model elements
     self.loadTaskData = function (selectedOrg, selectedLoc, locType, orgType) {
         
         locType = (locType) ? locType : false;
         orgType = (orgType) ? orgType : false;

         $(".loaderContainer").show();
         var selectedProjectGuid = visileanUtil.currentProject();
         if (selectedProjectGuid != null) {
             var recursive = true;
             var requestData = $.extend({
                 projectGuid: visileanUtil.currentProject(),
                 sortField: 'startDate',
                 sortDir: 'ASC',
                 r: recursive
             }, {
                 dateStart: dateUtils.getLongDate(document.selectedRange.start),
                 dateStartCondition: "AFTER",
                 dateEnd: dateUtils.getLongDate(document.selectedRange.end),
                 dateEndCondition: "BEFORE",
                 skip: pageIndex,
                 limit: pageSize,
                 isLocationParent: locType,
                 isUserOrganisation: orgType,
                 freeText: $("#bimFreeText-forge").val(),
                 responsibleActor: ((selectedOrg != null) && (selectedOrg != 'guid')) ? selectedOrg : null,
                 location: ((selectedLoc != null) && (selectedLoc != 'guid')) ? selectedLoc : null
             });
             var options = {
                 data: JSON.stringify(requestData),
                 dataType: 'json',
                 contentType: 'application/json'
             };
             visileanUtil.doApiAjaxPostPromise("project/activity/Model", options).then(function (tasks) {
                 var array = [];
                 $.each(tasks, function (index, item) {
                     array.push(item);
                     var elementStatus = getStatusClassForTask(item.status);
                     var actLocation = (item.activityLocation != null) ? item.activityLocation : '-NA-';
                     var responsibleActor = "Unassigned";
                     if (item.responsibleActor != null && item.responsibleActor.name != null) {
                         responsibleActor = item.responsibleActor.name;
                     }
                     var startDate = dateUtils.getFormattedDate(item.startDate);
                     var endDate = dateUtils.getFormattedDate(item.endDate);
                     var actualStartDate = "-";
                     var actualEndDate = "-";

                     if (item.actualStartDate != null && item.status > 3) {
                         actualStartDate = dateUtils.getFormattedDate(item.actualStartDate);
                     }
                     if (item.actualEndDate != null && item.status > 3) {
                         actualEndDate = dateUtils.getFormattedDate(item.actualEndDate);
                     }
                     var showExternalId = "-";
                     if (item.showExternalId != null) {
                         showExternalId = item.showExternalId;
                     }
                     $("#tasksDisplayListForge").append(
                         `<div class="forgeTaskListDiv ${elementStatus}" id="${item.guid}" value="${item.guid}">
                             <label class="openAccordion" id="collapse${item.guid}" for="${item.guid}">${item.name} <i class="fa fa-angle-down" style="font-size:19px"></i></label> 
                             <div class="locationsearch">
                                    <i class="fa fa-map-marker" aria-hidden="true"></i> In <span for="${item.guid}">${actLocation}</span>
                                </div>
                                <div id="collapse${item.guid}_open" class="panel-collapse collapse">
                                 <div class="taskInfoBox">
                                     <div class="row">
                                         <div class="col-sm-3">
                                             <label>Owner </label>
                                                 <p>${responsibleActor}</p>
                                         </div>
                                         <div class="col-sm-3">
                                             <label>Start date </label>
                                             <p>${startDate}</p>
                                         </div>
                                         <div class="col-sm-3">
                                             <label>End date </label>
                                             <p>${endDate}</p>
                                         </div>
                                         <div class="col-sm-3">
                                             <label>Actual Start date </label>
                                             <p>${actualStartDate}</p>
                                         </div>
                                         <div class="col-sm-3">
                                             <label>Actual End date </label>
                                             <p>${actualEndDate}</p>
                                         </div>
                                         <div class="col-sm-3">
                                             <label>WBS ID </label>
                                             <p>${showExternalId}</p>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>`
                     );
                 });

                 document.mainTasksList = array;
                 $(".loaderContainer").hide();
                 if (tasks.length < 10) {
                     $("#loadMoreDataModelForge").hide();
                 } else {
                     $("#loadMoreDataModelForge").show();
                 }
             });
         }
     }

     function getParametersVal() {
         var currentProjectParam = projectUtils.getProjectParameters();
         if (currentProjectParam) {
             document.lookAhedPlanVal = currentProjectParam.lookAheadPlanLength;
             document.phasePlanVal = currentProjectParam.phasePlanLength;
             document.dateRanges["weekly"] = { 'start': moment().add(1, 'weeks').startOf('isoWeek'), 'end': moment().add(1, 'weeks').endOf('isoWeek') };
             document.dateRanges["lookahead"] = { 'start': moment().add(currentProjectParam.lookAheadPlanLength - 1, 'weeks').startOf('isoWeek'), 'end': moment().add(currentProjectParam.lookAheadPlanLength + 1, 'weeks').endOf('isoWeek') };
             document.dateRanges["phase"] = { 'start': moment().add(currentProjectParam.phasePlanLength - 7, 'weeks').startOf('isoWeek'), 'end': moment().add(currentProjectParam.phasePlanLength + 4, 'weeks').endOf('isoWeek') };
             document.selectedRange.start = dateUtils.getLongDate(moment().subtract(6, 'days'));
             document.selectedRange.end = dateUtils.getLongDate(moment());
         }
     }

     getStatusClassForTask = function (status) {

         if (status == null) {
             return "status_none";
         }
         var backgroundClass;
         switch (status) {
             case 0:
                 backgroundClass = "ncTask";
                 break;
             case 1:
                 backgroundClass = "nrTask";
                 break;
             case 2:
                 backgroundClass = "rTask";
                 break;
             case 3:
                 backgroundClass = "frTask";
                 break;
             case 4:
                 backgroundClass = "sTask";
                 break;
             case 5:
                 backgroundClass = "wTask";
                 break;
             case 6:
                 backgroundClass = "stTask";
                 break;
             case 7:
                 backgroundClass = "cTask";
                 break;
             case 8:
                 backgroundClass = "rqcTask";
                 break;
             case 9:
                 backgroundClass = "qcTask";
                 break;
             default:
                 backgroundClass = "status_none";
         }
         return backgroundClass;
     }
     
     getStatusClassForTaskRound = function (status) {

         if (status == null) {
             return "";
         }
         var backgroundClass;
         switch (status) {
             case 0:
                 backgroundClass = "ncTaskRound";
                 break;
             case 1:
                 backgroundClass = "nrTaskRound";
                 break;
             case 2:
                 backgroundClass = "rTaskRound";
                 break;
             case 3:
                 backgroundClass = "frTaskRound";
                 break;
             case 4:
                 backgroundClass = "sTaskRound";
                 break;
             case 5:
                 backgroundClass = "wTaskRound";
                 break;
             case 6:
                 backgroundClass = "stTaskRound";
                 break;
             case 7:
                 backgroundClass = "cTaskRound";
                 break;
             case 8:
                 backgroundClass = "rqcTaskRound";
                 break;
             case 9:
                 backgroundClass = "qcTaskRound";
                 break;
             default:
                 backgroundClass = "";
         }
         return backgroundClass;
     }



     AutodeskNamespace("Autodesk.ADN.Viewing.Extension");


     Autodesk.ADN.Viewing.Extension.MetaProperties = function (viewer, options) {

         // base constructor
         Autodesk.Viewing.Extension.call(this, viewer, options);
         var _self = this;

         // load callback
         _self.load = function () {
             var panel = new Autodesk.ADN.Viewing.Extension.MetaPropertyPanel(viewer);
             viewer.setPropertyPanel(panel);
             console.log("Autodesk.ADN.Viewing.Extension.MetaProperties loaded");
             return true;
         };

         // unload callback
         _self.unload = function () {
             viewer.setPropertyPanel(null);
             console.log("Autodesk.ADN.Viewing.Extension.MetaProperties unloaded");
             return true;
         };

         // MetaPropertyPanel
         // Overrides native viewer property panel
         Autodesk.ADN.Viewing.Extension.MetaPropertyPanel = function (viewer) {
             var _panel = this;
             Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(_panel, viewer);
             // setNodeProperties override
             _panel.setNodeProperties = function (nodeId) {
                 Autodesk.Viewing.Extensions.ViewerPropertyPanel.
                     prototype.setNodeProperties.call(_panel, nodeId);
                 _panel.nodeId = nodeId;
             };

             // Adds new meta property to panel
             _panel.addMetaProperty = function (metaProperty, options) {

                 var element = this.tree.getElementForNode({
                     name: metaProperty.name,
                     value: metaProperty.value,
                     category: metaProperty.category
                 });

                 if (element) {
                     return false;
                 }

                 var parent = null;

                 if (metaProperty.category) {
                     parent = this.tree.getElementForNode({ name: metaProperty.category });
                     if (!parent) {
                         parent = this.tree.createElement_({
                             name: metaProperty.category,
                             type: 'category'
                         },
                             this.tree.myRootContainer, options && options.localizeCategory ? { localize: true } : null);
                     }
                 } else {
                     parent = this.tree.myRootContainer;
                 }

                 this.tree.createElement_(
                     metaProperty,
                     parent,
                     options && options.localizeProperty ? { localize: true } : null);

                 return true;
             };

             // setProperties override
             _panel.setProperties = function (properties) {

                 Autodesk.Viewing.Extensions.ViewerPropertyPanel.
                     prototype.setProperties.call(
                         _panel,
                         properties);

                 var node = _panel.currentNodeIds;
                 var node_dbact = dbWithActivity[_panel.currentModel._myGUID].find((ele) => {
                     return ele.dbId == node;
                 });

                 if (typeof node_dbact != "undefined" && node_dbact != null) {
                     node_dbact.activities.map(function (act) {

                         if (act.name != "undefined" && act.status != "undefined") {
                             var name = act.name;
                             var status = statusUtils.getActivityStatusText(parseInt(act.status));
                             var myguid = act.guid;
                             var ele;

                             onlyDbId[_panel.currentModel._myGUID].map(function (v) {
                                 if (v.db == node) {
                                     ele = v.ele;
                                 }
                             });
                             var textProp = {
                                 name: name,
                                 value: status,
                                 category: 'Linked Tasks',
                                 dataType: 'text',
                                 activityGuid: myguid,
                                 element: ele,
                             };
                             _panel.addMetaProperty(textProp);
                         }
                     })
                 }
             }

             // displayProperty override
             _panel.displayProperty = function (property, parent, options) {

                 var name = document.createElement('div');

                 var text = property.name;

                 if (options && options.localize) {
                     name.setAttribute('data-i18n', text);
                     text = Autodesk.Viewing.i18n.translate(text);
                 }

                 name.textContent = text;
                 name.title = text;
                 //name.className = 'property-name ' + property.element + '_parent';
                 name.className = `property-name ${property.element}_parent`;

                 var separator = document.createElement('div');
                 separator.className = 'separator';

                 parent.appendChild(name);
                 parent.appendChild(separator);

                 var value = null;

                 //native properties dont have a dataType
                 //display them just as text
                 if (!property.dataType) {
                     value = createTextProperty(property, parent);
                     return [name, value];
                 }

                 switch (property.dataType) {

                     case 'text':
                         value = createTextProperty(property, parent);
                         break;

                     case 'link':
                         value = createLinkProperty(property, parent);
                         break;

                     case 'img':
                         value = createImageProperty(property, parent);
                         break;

                     case 'file':
                         value = createFileProperty(property, parent);
                         break;

                     default:
                         break;
                 }
                 // Make the property name and value highlightable.
                 return [name, value];
             }

             // Creates a text property
             function createTextProperty(property, parent) {
                 var actGuid = property.activityGuid;
                 if (actGuid != "undefined" && typeof actGuid !== 'undefined') {
                     var id = guid();
                     $(parent).append(
                         `<div id="${id}" class="property-value ${actGuid}_deleteClass">
                             "${property.value}"&nbsp;
                             <a activityId="${actGuid}" elementId="${id}" class="glyphicon glyphicon-trash model-linked-popup-delete"></a>
                         </div>`);
                     return $('#' + id)[0];
                 } else {
                     var value = document.createElement('div');
                     value.textContent = property.value;
                     value.title = property.value;
                     value.className = 'property-value';
                     parent.appendChild(value);
                     return value;
                 }
             }

             // Creates a link property
             function createLinkProperty(property, parent) {
                 var id = guid();
                 $(parent).append(
                     `<div id="${id}" class="property-value">
                         <a  href="${property.href}" target="_blank"> ${property.value}</a>
                     </div>`);
                 return $('#' + id)[0];
             }

             // Creates an image property
             function createImageProperty(property, parent) {
                 var id = guid();
                 $(parent).append(
                     `<div id="${id}" class="property-value">
                         <a href="${property.href}">
                             <img src="${property.href}" width="128" height="128"> </img>
                         </a>
                     </div>`);
                 return $('#' + id)[0];
             }

             // Creates a file property
             function createFileProperty(property, parent) {
                 var id = guid();
                 $(parent).append(
                     `<div id="${id}" class="property-value">
                         <a href="${property.href}">${property.value}</a>
                     </div>`);
                 return $('#' + id)[0];
             }

             // onPropertyClick handle
             _panel.onPropertyClick = function (property, event) {
                 var self = this;
                 if (!property.dataType)
                     return;

                 switch (property.dataType) {

                     case 'text':
                         deleteForgeLinkElement(self.currentModel._myGUID, property.element, property.activityGuid);
                         break;

                     // opens link in new tab
                     case 'link':
                         window.open(property.href, '_blank');
                         break;

                     // download image or file
                     case 'img':
                     case 'file':
                         downloadURI(property.href, property.filename);
                         break;

                     default:
                         break;
                 }
             };

             // Download util
             function downloadURI(uri, name) {

                 var link = document.createElement("a");
                 link.download = name;
                 link.href = uri;
                 link.click();
             }

             // New random guid util
             function guid() {
                 var d = new Date().getTime();
                 var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
                         var r = (d + Math.random() * 16) % 16 | 0;
                         d = Math.floor(d / 16);
                         return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                     });
                 return guid;
             }
         }

         Autodesk.ADN.Viewing.Extension.MetaPropertyPanel.prototype =
             Object.create(Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype);

         Autodesk.ADN.Viewing.Extension.MetaPropertyPanel.prototype.constructor =
             Autodesk.ADN.Viewing.Extension.MetaPropertyPanel;
     };

     Autodesk.ADN.Viewing.Extension.MetaProperties.prototype =
         Object.create(Autodesk.Viewing.Extension.prototype);

     Autodesk.ADN.Viewing.Extension.MetaProperties.prototype.constructor =
         Autodesk.ADN.Viewing.Extension.MetaProperties;
     
     app.on("bim:linkDeleteFromGantt").then(linkDeleteFromGantt);
     app.on("project:presentationModeSet").then(presentationModeInForge);
     app.on("activity:statusUpdated").then(handleActivityStatusUpdated);
     app.on("activity:updated").then(handleActivityUpdated);
     app.on("activity:locationChanged").then(handleActivityLocationChanged);
     app.on("activity:responsibleActorChanged").then(handleActivityResponsibleActorChanged);
     app.on("forgeview:schedulerexit").then(function () {
         if (viewer) {
             viewer.loadExtension("ModelSummaryExtension");
             loadedCurrentModels.map((currmodel) => {
                 viewer.clearThemingColors(currmodel);
                 viewer.isolate("", currmodel);
             });
         }
     });
     
     // common method to delete an element link from database, call this from anywhere to delete mapping data
     function deleteForgeLinkElement(modelid, element, actGuid) {
         
         if ($('#presentationMode').is(':checked')) {

             $('.gantt-linked-popup').stop();
             $('.dropdown-content.delete-link-cls-area').stop();
             $('.glyphicon.glyphicon-trash.gantt-linked-popup-top-bar-delete').addClass("pointerNone");
             $('.gantt-linked-popup-element-right').addClass("pointerNone");
             $('.link-delete-icon').addClass("pointerNone");
             $('.fa.fa-remove').addClass("pointerNone");
             $('.fa.fa-link').addClass("pointerNone");
             $('.fa.gantt_button_grid.gantt_grid_edit.fa-link').addClass("pointerNone");
             $('.delete-link-hover').addClass("pointerNone");

         } else {

             messageUtils.showMessageModal({
                 message: messageUtils.getMessageString("link.delete.comfirm"),
                 messageLevel: "WARN",
                 showModal: true,
                 modalOptions: [{
                     text: messageUtils.getMessageString("message.utils.ok"),
                     value: true
                 }, {
                     text: messageUtils.getMessageString("label.text.cancel"),
                     value: false
                 }]
             }).then(function (result) {
                 if (result) {

                     var options = {
                         data: { bimNodeId: element.toString() },
                         dataType: "json",
                         async: false
                     };

                     visileanUtil.doApiAjaxGetPromise("models/mappingData/activity/" + actGuid.toString(), options).done(function (data) {

                         if (data.success) {
                             app.trigger("bim:TaskLinkDeleted");
                             resetAllMappingData();
                             
                             if($("#plannedVsActualButton").hasClass("glowingAnimation")) {
                                 for(var i=0; i<=viewer.getVisibleModels().length;i++) {
                                     if(viewer.getVisibleModels()[i]) {
                                         var modelGuid = viewer.getVisibleModels()[i]._myGUID;
                                         fillPlannedVsActualData(modelGuid,dateUtils.timestampLong(),i);
                                     }
                                 }
                             }
                             
                             $("#btnGanttLinkedTasks").attr("forgeClick", "true");
                             $("#btnGanttLinkedTasks").click();
                             setTimeout(function () {
                                 $("#btnGanttLinkedTasks").removeAttr("forgeClick");
                             }, 1000);
                             
                             $(`.${actGuid}_deleteClass`).parent().parent().remove();
                             $(`.subTaskList[guid="${actGuid}"]`).remove();
                             var linkedText = $(`#LinkedTaskPanel[exeid="${element.toString()}"]`).text() || "";
                             linkedText = linkedText.split("Linked Tasks (")[1];
                             
                             if(typeof linkedText != "undefined" && linkedText!="" && parseInt(linkedText) > 0) {
                                  linkedText = parseInt(linkedText);
                                  linkedText--;
                             }
                             
                             $("#LinkedTaskPanel .docking-panel-title").text(`Linked Tasks (${linkedText})`);
                             
                             if(typeof onlyDbId[modelid] != "undefined") {
                                 onlyDbId[modelid].map(function (v) {
                                     if (v.ele == element) {
                                         dbWithActivity[modelid].map(function (dbact) {
                                             if (dbact.dbId == v.db) {
                                                 for (const [k, act] of Object.entries(dbact.activities)) {
                                                     if (typeof act !== "undefined" && act.guid != null && act.guid == actGuid.toString()) {
                                                         dbact.activities.splice(k, 1);
                                                     }
                                                 }
                                             }
                                         });
                                     }
                                 });
                             }
                             app.trigger("statusMessage:new", {
                                 message: "Deleted",
                                 messageLevel: "SUCCESS",
                                 showModal: true,
                                 modalClose: true
                             });

                         } else {
                             app.trigger("statusMessage:new", {
                                 message: messageUtils.getMessageString("link.delete.error"),
                                 messageLevel: "ERROR",
                                 showModal: true,
                                 modalClose: true
                             });
                         }
                     });
                 }
             });
         }
     }
     
     function linkDeleteFromGantt(actGuid,elementId) {
         resetAllMappingData();
         $(`.${actGuid}_deleteClass`).parent().parent().remove();

         if(elementId == null) {
             $(`.subTaskList[guid="${actGuid}"]`).remove();
         } else {
         
             $(`#LinkedTaskPanel[exeid="${elementId.toString()}"] .subTaskList[guid="${actGuid}"]`).remove();
             var linkedText = $(`#LinkedTaskPanel[exeid="${elementId.toString()}"]`).text() || "";
             linkedText = linkedText.split("Linked Tasks (")[1];
             
             if(typeof linkedText != "undefined" && linkedText!="" && parseInt(linkedText) > 0) {
                  linkedText = parseInt(linkedText);
                  linkedText--;
             }
             $(`#LinkedTaskPanel[exeid="${elementId.toString()}"] .docking-panel-title`).text(`Linked Tasks (${linkedText})`);

         }
     }

     function handleActivityStatusUpdated(updatedActivity) {

         if (typeof viewer != "undefined" && viewer != null) {
             
             if($("#plannedVsActualButton").hasClass("glowingAnimation")) {
                 for(var i=0; i<=viewer.getVisibleModels().length;i++) {
                     if(viewer.getVisibleModels()[i]) {
                         var modelGuid = viewer.getVisibleModels()[i]._myGUID;
                         fillPlannedVsActualData(modelGuid,dateUtils.timestampLong(),i);
                     }
                 }
             }
             
             viewer.unloadExtension("Autodesk.ADN.Viewing.Extension.MetaProperties");
             let schedulerDates = visileanUtil.getSchedulerDatesForForge();
             let schedularStartDate = schedulerDates.startDate;
             let schedulerEndDate = schedulerDates.endDate;
             let updatedActStartDate = updatedActivity.startDate;
             let updatedActEndDate = updatedActivity.endDate;
             let updatedActActualStartDate = updatedActivity.actualStartDate;
             let updatedActActualEndDate = updatedActivity.actualEndDate;
             const index = activityGuids.indexOf(updatedActivity.guid);
             if (!$.isEmptyObject(schedularStartDate) && !$.isEmptyObject(schedulerEndDate) && index > -1) {
                 var status = updatedActivity.status;
                 if (status <= 3 && ((updatedActStartDate < schedularStartDate && updatedActEndDate < schedularStartDate) ||
                     (updatedActStartDate > schedulerEndDate && updatedActEndDate > schedulerEndDate))) {
                     activityGuids.splice(index, 1);
                 } else if ((status >= 4 && status < 7) && ((updatedActActualStartDate < schedularStartDate &&
                     (updatedActActualStartDate + updatedActEndDate - updatedActStartDate) < schedularStartDate) ||
                     (updatedActActualStartDate > schedulerEndDate && (updatedActActualStartDate + updatedActEndDate - updatedActStartDate) > schedulerEndDate))) {
                     activityGuids.splice(index, 1);
                 } else if (status >= 7 && ((updatedActActualStartDate < schedularStartDate && updatedActActualEndDate < schedularStartDate) ||
                     (updatedActActualStartDate > schedulerEndDate && updatedActActualEndDate > schedulerEndDate))) {
                     activityGuids.splice(index, 1);
                 }
             }

             updateActivityStatus[updatedActivity.guid] = updatedActivity.status;
             if (activityGuids && activityGuids.length > 0) {
                 handleLinkedElementsInScheduler(activityGuids);
             }
             resetAllMappingData();
             $(`.subTaskList[guid=${updatedActivity.guid}] > .windowStatus > span`).text(statusUtils.getActivityStatusText(parseInt(updatedActivity.status)));
             var elem = $(`.subTaskList[guid=${updatedActivity.guid}]`);
             elem.removeAttr("class");
             elem.attr('class',`subTaskList ${getStatusClassForTaskRound(updatedActivity.status)}`);
         }
     }
     
     function handleActivityLocationChanged(updated) {
         if(!$.isEmptyObject(viewer) && !$.isEmptyObject(updated)) {
             resetAllMappingData();
             $(`.subTaskList[guid=${updated.guid}] > .windowLocation > span`).text(updated.activityLocation);
             
         }
     }
     
     function handleActivityResponsibleActorChanged(updated) {
         if(!$.isEmptyObject(viewer) && !$.isEmptyObject(updated) && updated.actor != null && updated.activity != null) {
             resetAllMappingData();
             $(`.subTaskList[guid=${updated.activity.guid}] > .windowOwner > span`).text(updated.actor.name);
             
             if($("#plannedVsActualButton").hasClass("glowingAnimation")) {
                 for(var i=0; i<=viewer.getVisibleModels().length;i++) {
                     if(viewer.getVisibleModels()[i]) {
                         var modelGuid = viewer.getVisibleModels()[i]._myGUID;
                         fillPlannedVsActualData(modelGuid,dateUtils.timestampLong(),i);
                     }
                 }
             }
         }
     }
     
     function handleActivityUpdated(updated) {
         if(!$.isEmptyObject(viewer) && !$.isEmptyObject(updated)) {
             resetAllMappingData();
             $(`.subTaskList[guid=${updated.guid}] > .windowName > b`).text(updated.name);
             
             if($("#plannedVsActualButton").hasClass("glowingAnimation")) {
                 for(var i=0; i<=viewer.getVisibleModels().length;i++) {
                     if(viewer.getVisibleModels()[i]) {
                         var modelGuid = viewer.getVisibleModels()[i]._myGUID;
                         fillPlannedVsActualData(modelGuid,dateUtils.timestampLong(),i);
                     }
                 }
             }
         }
     }

     function getNodeIdsForActivityIds(activityIds) {
         var mappedNodeGuids = [];
         $.each(activityIds, function (ind, itm) {
             for (const [k, v] of Object.entries(dbWithActivity)) {
                 v.map(function (dbacts) {
                     dbacts.activities.map(function (activity) {
                         if (activity.guid == itm && !mappedNodeGuids.includes(itm)) {
                             mappedNodeGuids.push(itm);
                         }
                     })
                 });
             }
         });
         return mappedNodeGuids;
     }

     // filters elements and shows colored element in 4D bases on the mapping data provided by backend
     function filterModelElementsForActivityFilters(activeGuids) {
         loadedCurrentModels.map((modelobj) => {
             viewer.clearThemingColors(modelobj);
         });
         
         activityGuids = activeGuids;
         mappedEleArr = [];

         var linkedActGuids = getNodeIdsForActivityIds(activeGuids);
         if (!$.isEmptyObject(viewer) && (linkedActGuids == null || linkedActGuids.length == 0)) {
             viewer.setGhosting(true);
             document.getElementById("showTransForge").innerHTML = "Hide Transparent";
             //no activities in range
             loadedCurrentModels.map((modelobj) => {
                 var instanceTree = modelobj.getData().instanceTree
                 var rootId = instanceTree.getRootId()
                 viewer.hide(rootId, modelobj) // hiding root node will hide whole model ...
             });
             return;
         }
         
         var getNodeActivityStatus = "";
         var act4D={};
         
         for (const [k, v] of Object.entries(dbWithActivity)) {
             if (linkedActGuids.length > 0) {
                 for (var i = 0; i < linkedActGuids.length; i++) {
                     v.map(function (dbact) {
                         dbact.activities.map(function (act) {
                             if (linkedActGuids[i] == act.guid) {
                                 
                                 var statuses=[];
                                 if(typeof act4D[dbact.dbId] != "undefined") {
                                     statuses=act4D[dbact.dbId];
                                 }
                                 
                                 statuses.push(act.status);
                                 act4D[dbact.dbId]=statuses;
                                 
                                 getNodeActivityStatus = sortActivityStatusesToShowColors(statuses);
                                 
                                 var dbIdOfNode = dbact.dbId;
                                 var model_id = k;
                                 var modelobj = loadedCurrentModels.find((ele) => {
                                     return ele._myGUID == model_id;
                                 });
                                 
                                 applyColorsToModel(viewer,modelobj,getNodeActivityStatus,dbIdOfNode);

                                 if (mappedEleArr[k]) {
                                     if (!mappedEleArr[k].includes(parseInt(dbIdOfNode))) {
                                         mappedEleArr[k].push(parseInt(dbIdOfNode));
                                     }
                                 } else {
                                     mappedEleArr[k] = [parseInt(dbIdOfNode)];
                                 }
                             }
                         });
                     });
                 }
             }
         }
         
         loadedCurrentModels.map((currmodel) => {

             var showTransText = document.getElementById("showTransForge").innerHTML;
             if (showTransText == 'Show Transparent') {
                 viewer.setGhosting(false);
             } else {
                 viewer.setGhosting(true);
             }
             if (mappedEleArr[currmodel._myGUID]) {
                 viewer.isolate(mappedEleArr[currmodel._myGUID], currmodel);
             } else {
                 var instanceTree = currmodel.getData().instanceTree
                 var rootId = instanceTree.getRootId()
                 viewer.hide(rootId, currmodel)
             }
         });
     }

     $(document).on("click", "#showTransForge", function () {

         var a = $(this).text();
         if (a.includes("Show")) {
             $(this).text('Hide Transparent');
             if (LastView == "scheduler") {
                 loadedCurrentModels.map((currmodel) => {
                 })
                 viewer.setGhosting(true);
             } else {
                 viewer.impl.setSelectionColor(new THREE.Color(0.4, 0.6, 1));
             }
         } else if (a.includes("Hide")) {
             $(this).text('Show Transparent');
             if (LastView == "scheduler") {
                 viewer.setGhosting(false);
             }
         }
     });

     $(document).on("click", "#showCompletedForge", function () {
         var a = $(this).text();
         if (a.includes("Show")) {
             $(this).text('Hide Completed');
             handleLinkedElementsInScheduler(activityGuids);
         } else if (a.includes("Hide")) {
             $(this).text('Show completed');
             handleLinkedElementsInScheduler(activityGuids);
         }
     });

     function handleLinkedElementsInScheduler(activityId) {
         activityGuids = [];
         LastView = "scheduler";
         if (isForgeAvailable) {
             handleSchedulerLinks(activityId);
         }
         activityGuids = activityId;
         if (LastView == "scheduler" && isForgeAvailable === "true") {
             document.getElementById("showCompletedForge").style.display = "inline-block";
             document.getElementById("showTransForge").style.display = "inline-block";
         } else {
             document.getElementById("showCompletedForge").style.display = "none";
         }
     }

     function setCurrentActIds(actIds) {
         activityGuids = actIds;
         return;
     }

     function bottomNavigationChanged(lastView) {
         app.trigger("unselectFromBim");
         LastView = lastView;
         $("#modelVersion_form").hide();
         document.getElementById("showTransForge").style.display = "inline-block";
         document.getElementById("autodeskSigninButton").style.display = "none";
         document.getElementById("plannedVsActualButton").style.display = "none";
         if (LastView == 'scheduler' && isForgeAvailable === "true") {
             document.getElementById("showCompletedForge").style.display = "block";
             LastView = "scheduler";
             document.getElementById("showTransForge").style.display = "block";
             handleLinkedElementsInScheduler(activityGuids);
         } else {
             document.getElementById("showTransForge").style.display = "none";
             document.getElementById("showCompletedForge").style.display = "none";
         }
     }

     function handleSchedulerLinks(activityGuids) {
         var showComplete = document.getElementById("showCompletedForge");
         allCompltdStatusActivityIds = [];

         for (const [k, v] of Object.entries(dbWithActivity)) {
             v.map(function (dbact) {
                 dbact.activities.map(function (item) {
                     if (item.status == 7 || item.status == 9 ||
                         (updateActivityStatus[item.guid] && updateActivityStatus[item.guid] == 9 || updateActivityStatus[item.guid] == 7)) {
                         if ($.inArray(item.guid, allCompltdStatusActivityIds) === -1) {
                             allCompltdStatusActivityIds.push(item.guid);
                         }
                     }
                 });
             });
         }

         var completedActsFlag = (allCompltdStatusActivityIds != undefined) && (allCompltdStatusActivityIds != null) && (allCompltdStatusActivityIds.length != null)
             && (allCompltdStatusActivityIds.length > 0);

         if (activityGuids.length == 0) {
             // for no linked guids......
             //showCompleted
             if ((showComplete.innerHTML == "Hide Completed") && completedActsFlag) {
                 filterModelElementsForActivityFilters(allCompltdStatusActivityIds);
             } else {
                 filterModelElementsForActivityFilters(activityGuids);
             }

         } else if (activityGuids.length > 0) {
             // for linked guids...
             if ((showComplete.innerHTML == "Hide Completed") && completedActsFlag) {
                 var completedAndRangedGuids
                     = allCompltdStatusActivityIds.concat(activityGuids.filter((item) => allCompltdStatusActivityIds.indexOf(item) < 0));
                 filterModelElementsForActivityFilters(completedAndRangedGuids);
             } else {
                 filterModelElementsForActivityFilters(activityGuids);
             }
         }
     }

     function hideAllExtenstionWhileInScheduler() {
         $("#taskPanel").hide();
         if (viewer !== "undefined" && viewer !== null && typeof viewer != 'undefined') {
             viewer.unloadExtension("SelectTaskExtension");
         }
     }

     function handleViewModeChanged(view) {
         viewmode = view;
         if (view == 'fullView' && $('#autodeskLogoutButton:visible').length == 0) {
             document.getElementById("autodeskSigninButton").style.display = "inline-block";
             document.getElementById("plannedVsActualButton").style.display = "inline-block";
             $("#mainFilterBtn").attr("class","disabled exportDisabled");
         } else {
             $("#filterModel").show();
             $("#mainFilterBtn").removeAttr("class");
             document.getElementById("autodeskSigninButton").style.display = "none";
             document.getElementById("plannedVsActualButton").style.display = "none";
         }
         if (viewer !== "undefined" && viewer !== null && typeof viewer != 'undefined') {

             try {
                 const divElem = $('canvas')[0];
                 new ResizeObserver(() => { viewer.resize(); }).observe(divElem);
             } catch (e) {
                 console.log(e);
             }

             if (view == 'fullView') {
                 document.getElementById("showTransForge").style.display = "none";
                 document.getElementById("showCompletedForge").style.display = "none";
                 if (loadedCurrentModels.length > 1) {
                     $("#centeringDropdown").show();
                 }
                 viewer.unloadExtension("ModelSummaryExtension");
                 viewer.loadExtension("SelectTaskExtension");
                 viewer.loadExtension("VersonControlExtension");
             } else if (view == "splitView") {
                 
                 if(!$.isEmptyObject(comparisonViewer)) {
                     resizeAndShowHideEventsForPlannedVsActualOff();
                 }
                 
                 document.getElementById("showTransForge").style.display = "none";
                 $("#taskPanel").hide();
                 $("#versionPanel").hide();
                 $("#centeringDropdown").hide();

                 viewer.unloadExtension("SelectTaskExtension");
                 viewer.unloadExtension("VersonControlExtension");
                 viewer.loadExtension("ModelSummaryExtension");

                 var modelid = sessionStorage.getItem("selectedVersion");
                 if (modelid != null && modelid != "") {
                     $("#forgeModelListView").trigger("change");
                     sessionStorage.removeItem("selectedVersion");
                 }
                 if (LastView == "scheduler") {
                     handleLinkedElementsInScheduler(activityGuids);
                 }
             }

             try {
                 app.trigger("modelGuid", loadedCurrentModels[0]._myGUID);

                 $("#btnGanttLinkedTasks").attr("forgeClick", "true");
                 setTimeout(function () {
                     $("#btnGanttLinkedTasks").click();
                 }, 1000);
                 setTimeout(function () {
                     $("#btnGanttLinkedTasks").removeAttr("forgeClick");
                 }, 2000);
             } catch (e) {
                 console.log(e);
             }
         }
     }
     
     $(document).on("click",".subTaskList",function() {
         let guid = $(this).attr("guid");
         app.trigger("Activity:FocusFromForge",guid);
     });

     $(document).on("click", ".openAccordion", function (event) {
         event.stopPropagation();
         var id = $(this).attr("id");
         let accordionId = $(`#${id}_open`);
         if (accordionId.hasClass("in")) {
             $(`#${id} i`).removeClass("fa-angle-up").addClass("fa-angle-down");
             $(accordionId).removeClass("in");
         } else {
             $(`#${id} i`).removeClass("fa-angle-down").addClass("fa-angle-up");
             $(accordionId).addClass("in");
         }
     });

     function showError(xhr, errorStatus, errorObj) {
         app.trigger("statusMessage:new", {
             message: (xhr.responseJSON.exception || xhr.responseJSON.error),
             messageLevel: 'ERROR',
             showModal: true
         });
     }
     

     // initiates planned vs actual 
     $(document).on("click","#plannedVsActualButton",function() {
         
         if(!$.isEmptyObject(viewer) && !$.isEmptyObject(viewer.getVisibleModels()[0])) {
             var secondUrn = viewer.getVisibleModels()[0]._myURN;
             var totalModels = viewer.getVisibleModels().length;
             var otherSecondUrns = [];
             if(totalModels > 1) {
                 for(var i=1;i<=totalModels;i++) {

                     if(viewer.getVisibleModels()[i]) {
                         otherSecondUrns.push({ name: "Other Models", urn: viewer.getVisibleModels()[i]._myURN });
                     }
                 }
             }
             
             
             if($(this).attr("comparison") == "true") {
             
                 resizeAndShowHideEventsForPlannedVsActualOff();
                 
             } else {
                 
                 $(this).attr("comparison","true");
                 $(this).removeAttr("class").attr("class","btn-new glowingAnimation");
                 $("#modelList_form").addClass("divDisabled");

                 var options = {
                         env: 'AutodeskProduction',
                         getAccessToken: getForgeToken
                     };
                 
                 Autodesk.Viewing.Initializer(options, () => {
                     const div = document.getElementById('forgeViewer2')
                     comparisonViewer = new Autodesk.Viewing.Private.GuiViewer3D(div, { loaderExtensions: { svf: "Autodesk.MemoryLimited" }});

                     comparisonViewer.start();
                     comparisonViewer.setOptimizeNavigation(true);
                     
                     // Handling events
                     
                     if(!$.isEmptyObject(comparisonViewer)) {
                         
                          var sfilter = {
                             viewport: true
                          };

                         /* comparisonViewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, function()
                             {
                                 if(!$.isEmptyObject(comparisonViewer)) {
                                     viewer.restoreState(comparisonViewer.getState(sfilter), sfilter, true);
                                 }
                             }); 
                                     
                          viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, function()
                          {
                              if(!$.isEmptyObject(comparisonViewer)) {
                                  comparisonViewer.restoreState(viewer.getState(sfilter), sfilter, true);
                              }
                          });*/
                          
                          comparisonViewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, function()
                              {
                                  if(!$.isEmptyObject(comparisonViewer)) {
                                      var v1state = viewer.getState(sfilter);
                                      var v2state = comparisonViewer.getState(sfilter);
                                      
                                      if (!compareViewports(v1state, v2state)) {
                                          viewerFlick=2;
                                          viewer.restoreState(comparisonViewer.getState(sfilter), sfilter, true);
                                      } else if(viewerFlick=1) {
                                          viewerFlick=0;
                                      }
                                  }
                              }); 
                              
                                viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, function()
                                {
                                    if(!$.isEmptyObject(comparisonViewer)) {
                                      var v1state = viewer.getState(sfilter);
                                      var v2state = comparisonViewer.getState(sfilter);
                                      
                                      if (!compareViewports(v1state, v2state) && viewerFlick == 0) {
                                          viewerFlick=1;
                                          comparisonViewer.restoreState(viewer.getState(sfilter), sfilter, true);
                                      } else if(viewerFlick==2) {
                                          viewerFlick=0;
                                      }
                                    }
                                });

                         
                          comparisonViewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, function(event)
                           {
                             var e = event.selections;
                             if(!$.isEmptyObject(comparisonViewer) && !$.isEmptyObject(e)) {
                                 var selections = [];
                                     
                                 if(e && typeof e[0].dbIdArray != "undefined" && viewerClick==0) {	
                                     viewerClick=2;
                                     for(var i=0;i<comparisonViewer.getVisibleModels().length;i++) {
                                         
                                         if(comparisonViewer.getVisibleModels()[i].getModelId() == e[0].model.getModelId()) {
                                             selections.push({
                                                 model: viewer.getVisibleModels()[i],
                                                 ids: e[0].dbIdArray
                                             });
                                         }
                                         
                                     }	
                                 } else if (viewerClick==1) {
                                     viewerClick=0;
                                 } else if($.isEmptyObject(e)) {
                                     viewerClick=0;
                                 }
                                 
                                 for(var i=0;i<selections.length;i++) {
                                     var select = [selections[i]];
                                     viewer.impl.selector.setAggregateSelection(null);
                                     viewer.impl.selector.setAggregateSelection( select );
                                 }
                              }
                          }); 
                          
                     }
                     
                     Autodesk.Viewing.Document.load(`urn:${secondUrn}`, (doc) => {
                             var viewables = doc.getRoot().getDefaultGeometry();
                             var modelOption = null;
                             
                             if(!docComparison) {
                                 modelOption = {
                                     keepCurrentModels: true,
                                     globalOffset: initGlobalOffset
                                 };
                             } else if(isForgeCenterToCenter) {
                                 modelOption = {
                                     keepCurrentModels: true,
                                     applyScaling: 'm'
                                 };
                             } else if (isForgeShared) {
                                 modelOption = {
                                         keepCurrentModels: true,
                                         applyScaling: 'm',
                                         globalOffset: initGlobalOffset,
                                         applyRefPoint: true,
                                         isAEC: true,
                                 };
                             } else {
                                 modelOption = {
                                     keepCurrentModels: true,
                                     applyScaling: 'm',
                                     globalOffset: initGlobalOffset
                                 };
                             }

                             comparisonViewer.loadDocumentNode(doc, viewables, modelOption).then((model1) => {
                                 comparisonModel=model1;
                                 var loadCount=1;
                                 otherSecondUrns.map((m) => {
                                     allModelLoaded=false;
                                     $(".loaderContainer").hide();
                                         
                                         Autodesk.Viewing.Document.load( `urn:${m.urn}`, ( doc1 ) => {
                                             
                                             var viewables1 = doc1.getRoot().getDefaultGeometry();
                                             var modelOption1 = null;
                             
                                             if(!docComparison) {
                                                 modelOption1 = {
                                                     keepCurrentModels: true,
                                                     globalOffset: initGlobalOffset
                                                 };
                                             } else if(isForgeCenterToCenter) {
                                                 modelOption1 = {
                                                     keepCurrentModels: true,
                                                     applyScaling: 'm'
                                                 };
                                             } else if (isForgeShared) {
                                                 modelOption1 = {
                                                         keepCurrentModels: true,
                                                         applyScaling: 'm',
                                                         globalOffset: initGlobalOffset,
                                                         applyRefPoint: true,
                                                         isAEC: true,
                                                 };
                                             }  else {
                                                 modelOption1 = {
                                                     keepCurrentModels: true,
                                                     applyScaling: 'm',
                                                     globalOffset: initGlobalOffset
                                                 };
                                             }
                                             
                                         comparisonViewer.loadDocumentNode( doc1, viewables1,modelOption1 ).then( ( model ) => {
                                             loadCount++;
                                             $("#centeringDropdown").hide();

                                             model.getExternalIdMapping(onSuccessCallbackForExternalPvsA);
                                             if(loadCount==totalModels) {
                                                 resizeAndShowHideEventsForPlannedVsActualOn();
                                             }

                                         })
                                     })
                                 });

                                 setTimeout(() => {
                                     $("#forgeViewer2 .viewcubeWrapper").hide();
                                 }, 2000);

                                 if(totalModels==1) {
                                     resizeAndShowHideEventsForPlannedVsActualOn();
                                 }
                                 
                                 
                             });
                             replaceSpinner();
                         });
                 });
             }
         }
         
     });
     
     // copies external ids from another viewer for planned vs actual
     function onSuccessCallbackForExternalPvsA(event) {
         dbWithExternalPvsA.push(event);
         pvsaLoaded++;
     }
     
     function compareViewports(stateA, stateB) {
        var viewportA = stateA["viewport"] || {};
        var viewportB = stateB["viewport"] || {};
        
        if( viewportA["aspectRatio"] !== viewportB["aspectRatio"] && viewportA["distanceToOrbit"] !== viewportB["distanceToOrbit"]) {
             return false;
        }
        
        return true;
     }

     
     $(document).on('input change','#comparisionRange', function (event) {
         event.preventDefault();
         $(`#forgeViewer2 > .adsk-viewing-viewer`).css("width",`${$(this).val()}%`);
         if(parseInt($(this).val()) > 80) {
             $("#forgeViewer2 .viewcubeWrapper").show();
             $("#forgeViewer .viewcubeWrapper").hide();
             $(`.liveButtonDiv`).remove();
             $(`#forgeViewer2`).append(`<div class="liveButtonDiv"><img class="liveButton" alt="live" src="app/images/Live.gif" /></div>`);
             var panel = $(`#LinkedTaskPanel`);
             $(`#LinkedTaskPanel`).remove();
             $(`#forgeViewer2 > .adsk-viewing-viewer`).append(panel);
         } else {
             $("#forgeViewer .viewcubeWrapper").show();
             $("#forgeViewer2 .viewcubeWrapper").hide();
             $(`.liveButtonDiv`).remove();
             $(`#forgeViewer`).append(`<div class="liveButtonDiv"><img class="liveButton" alt="live" src="app/images/Live.gif" /></div>`);
             var panel = $(`#LinkedTaskPanel`);
             $(`#LinkedTaskPanel`).remove();
             $(`#forgeViewer > .adsk-viewing-viewer`).append(panel);
         }
     });
     
     // handles different events and styling of some elements for planned vs actual
     function resizeAndShowHideEventsForPlannedVsActualOff() {
         pvsaLoaded=0;
         dbWithExternalPvsA = [];
         plannedCompleteElements={};
         $("#plannedVsActualButton").attr("comparison","false");
         $("#plannedVsActualButton").removeAttr("class").attr("class","btn-new");
         
         loadedCurrentModels.map((currmodel) => {
             viewer.clearThemingColors(currmodel);
             viewer.isolate("", currmodel);
         });
         
         $(`#comparisionRange`).hide();
         $(`#forgeViewer div#guiviewer3d-toolbar`).removeClass("adsk-toolbar-vertical");
         $(`#modelList_form`).removeAttr("class");
         $(`#forgeViewer .viewcubeWrapper`).show();
         $(`#plannedVsActualSwitch`).hide();
         $(`#autodeskSigninButton`).show();
         $(`.liveButtonDiv`).remove();
         $(`.forgeInfoButtonDiv`).remove();
         
         if (loadedCurrentModels.length > 1) {
             $("#centeringDropdown").show();
         }
         
         viewer.loadExtension("SearchElementExtension");
         viewer.loadExtension("VersonControlExtension");
         viewer.loadExtension("SelectTaskExtension");
         viewer.loadExtension("Autodesk.Explode");
         viewer.loadExtension("Autodesk.Measure");
         viewer.loadExtension("Autodesk.Section");
         
         $(`#forgeViewer #toolbar-fullscreenTool`).show();
         $(`#forgeViewer #toolbar-cameraSubmenuTool`).show();
         viewer.toolbar.getControl('navTools').getControl('toolbar-cameraSubmenuTool').setVisible(true);
         $(`.adsk-control-tooltip`).css({"left":"120%","bottom":"25%","top":"unset"});
         
         if(!$.isEmptyObject(comparisonViewer) && !$.isEmptyObject(comparisonModel)) {
             comparisonViewer.unloadModel(comparisonModel);
             comparisonViewer=null;
             $("#forgeViewer2").empty();
         }
     }
     
     // handles different events and styling of some elements for planned vs actual
     function resizeAndShowHideEventsForPlannedVsActualOn() {
         
         $(".loaderContainer").show();
         
         viewer.unloadExtension("SearchElementExtension");
         viewer.unloadExtension("VersonControlExtension");
         viewer.unloadExtension("SelectTaskExtension");
         viewer.unloadExtension("Autodesk.Explode");
         viewer.unloadExtension("Autodesk.Measure");
         viewer.unloadExtension("Autodesk.Section");
         viewer.unloadExtension("Autodesk.FullScreen");
         
         $(`#plannedVsActualSwitch`).show();
         $(`#forgeViewer2 > .adsk-viewing-viewer`).css({"width":"50%","border-right":"2px solid grey"});
         $(`#comparisionRange`).show().val("50");
         $(`#forgeViewer div#guiviewer3d-toolbar, #forgeViewer2 div#guiviewer3d-toolbar`).addClass("adsk-toolbar-vertical").css({"right":"unset","left":"10px"});
         $(`#autodeskSigninButton`).hide();
         
         var element = $(`#forgeViewer2 #allPlannedVsActualExtensionToolbar`);
         $(`#forgeViewer2 #allPlannedVsActualExtensionToolbar,#forgeViewer #allPlannedVsActualExtensionToolbar`).remove();
         $(`#forgeViewer2 #guiviewer3d-toolbar,#forgeViewer #guiviewer3d-toolbar`).prepend(element);
         
         setTimeout(() => {
             $(`#forgeViewer .adsk-viewing-viewer .adsk-toolbar.adsk-toolbar-vertical .adsk-button>.toolbar-vertical-group,
                     #forgeViewer2 .adsk-viewing-viewer .adsk-toolbar.adsk-toolbar-vertical .adsk-button>.toolbar-vertical-group`).css({"right":"unset","left":"7vh"});
             
             $(`.adsk-viewing-viewer .adsk-toolbar.adsk-toolbar-vertical .adsk-button>.toolbar-vertical-group~.adsk-control-tooltip`).css({"left":"8vh","right":"unset","bottom":20});
             
             $(`#forgeViewer`).append(`<div class="liveButtonDiv"><img class="liveButton" alt="live" src="app/images/Live.gif" /></div>`);
             $(`#forgeViewer2`).append(`<div class="forgeInfoButtonDiv"><button class="btn-new forgeInfoButton" id="forgeInfoButton">Planned <i  class="fa fa-info-circle fa-2" aria-hidden="true"></i></button>
             <div class="forgeInfoContainer" id="forgeInfoContainer"><div class="row">
             <div class="col-lg-1"><span class="forgeInfoCompleteBox"></span></div><div class="col-lg-11"><label>Planned completion (to view rendered view, click on the render button)</label></div>
             <div class="col-lg-1"><span class="forgeInfoStartedBox"></span></div><div class="col-lg-11"><label>Planned in progress</label></div>
             <div class="col-lg-1"><span class="forgeInfoDotBox"></span></div><div class="col-lg-11"><label>Model elements in wireframe mode are future tasks or not linked to any tasks.</label></div></div></div></div>`);
             
             $(`.adsk-control-tooltip`).css({"left":"8vh","right":"unset","bottom":20});
             comparisonViewer.unloadExtension("Autodesk.Explode");
             comparisonViewer.unloadExtension("Autodesk.Measure");
             comparisonViewer.unloadExtension("Autodesk.Section");
             
             $(`#forgeViewer #toolbar-fullscreenTool`).hide();
             $(`#forgeViewer2 #toolbar-fullscreenTool`).hide();
             $(`#forgeViewer #toolbar-cameraSubmenuTool`).hide();
             $(`#forgeViewer2 #toolbar-cameraSubmenuTool`).remove();
             
             $(document).on("click", "#forgeInfoButton", function () {
                 var x = document.getElementById("forgeInfoContainer");
                 if (x.style.display === "none") {
                     x.style.display = "block";
                 } else {
                     x.style.display = "none";
                 }
             });
             
         },1000);
         
         setTimeout(() => {
             
             for(var i=0; i<=viewer.getVisibleModels().length;i++) {
                 if(viewer.getVisibleModels()[i]) {
                     var modelGuid = viewer.getVisibleModels()[i]._myGUID;
                     fillPlannedVsActualData(modelGuid,dateUtils.timestampLong(),i);
                 }
             }
             
             $(".viewcubeWrapper").each(function(i,evt) {
                 $(this).css({"position":"fixed","top":"20vh"});
             });
             $(".loaderContainer").hide();
         },3000);
         
         const divElem = $('canvas')[0]
         new ResizeObserver(() => { 
             var styleWidth = $(`#forgeViewer2 > .adsk-viewing-viewer`).css("width");
             $(`#forgeViewer2 > .adsk-viewing-viewer`).css("width","100%");
             comparisonViewer.resize();
             $(`#forgeViewer2 > .adsk-viewing-viewer`).css("width",styleWidth);
         }).observe(divElem);
         
         
          $("#forgeViewer2 #toolbar-zoomTool").click(function() {
             $("#forgeViewer2 #toolbar-orbitTools").show();
             $("#forgeViewer2 #toolbar-panTool").show();
             $("#forgeViewer2 #toolbar-zoomTool").show();
             $("#forgeViewer #toolbar-zoomTool").click();
             $(`#forgeViewer #toolbar-cameraSubmenuTool`).hide();
          });
          
          $("#forgeViewer2 #toolbar-panTool").click(function() {
             $("#forgeViewer2 #toolbar-orbitTools").show();
             $("#forgeViewer2 #toolbar-panTool").show();
             $("#forgeViewer2 #toolbar-zoomTool").show();
             $("#forgeViewer #toolbar-panTool").click();
             $(`#forgeViewer #toolbar-cameraSubmenuTool`).hide();
          });
          
          $("#forgeViewer2 #toolbar-orbitTools").click(function() {
             $("#forgeViewer2 #toolbar-orbitTools").show();
             $("#forgeViewer2 #toolbar-panTool").show();
             $("#forgeViewer2 #toolbar-zoomTool").show();
             $(`#forgeViewer #toolbar-cameraSubmenuTool`).hide();
          });
          
     }
     
     function setProjectStartAndEndDate() {
         visileanUtil.doApiAjaxGetPromise("project/getByGuid", {
             data : {
                 projGuid : visileanUtil.currentProject(),
                 depth : 0
             },
             dataType : 'json',
             async : false
         }).done(function(data) {
             if(!$.isEmptyObject(data)) {
                 projectStartDate = data.startDate;
                 projectEndDate = data.endDate
             }
         });
     }
     
     // fetches the planned vs actual data from backend and initiates coloring the elements in both the viewer
     function fillPlannedVsActualData(guid,date,index) {
         var projGuid = visileanUtil.currentProject();
         visileanUtil.doApiAjaxGetPromise(`model/${projGuid}/getPlannedVsActualData`, {
             data : {
                 modelGuid : guid,
                 date : date
             },
             dataType : 'json',
             async : false
         }).done(function(data) {
             setLeftViewerColors(data,index);
             setRightViewerColors(data,index);
         });
     }

     // handles the right viewer coloring based on the data provided from backend and handles the events, id #forgeViewer
     function setRightViewerColors(data,index) {
         
         if(index > 0 && ($.isEmptyObject(dbWithExternalPvsA) || pvsaLoaded < index)) {
             setTimeout(() => {
                 setRightViewerColors(data,index);
             }, 10000);
         } else {
             if(!$.isEmptyObject(viewer) && !$.isEmptyObject(viewer.getVisibleModels()[0])) {
             
                 var rightModel = viewer.getVisibleModels()[index];
                 viewer.clearThemingColors(rightModel);
                 
                 if ($.isEmptyObject(data.actualData)) {
                     viewer.setGhosting(true);
                     var instanceTree = rightModel.getData().instanceTree
                     var rootId = instanceTree.getRootId()
                     viewer.hide(rootId, rightModel) 
                     return;
                 }
                 var dbs=[]
                 if(!$.isEmptyObject(data) && !$.isEmptyObject(data.actualData)) {
                     var elementIds=data.actualData;
                     
                     Object.keys(elementIds).map(function(key, i) {
                             var dbIdOfNode = dbWithExternal[key];
                             if(index > 0) {
                                 var exe = dbWithExternalPvsA[index-1];
                                 dbIdOfNode = exe[key];
                             }
                             if(dbIdOfNode) {
                                 var sts = sortActivityStatusesToShowColors(elementIds[key]);
                                 applyColorsToModel(viewer,rightModel,sts,dbIdOfNode);
                                 dbs.push(dbIdOfNode);
                             }
                     });
 
                     var timing=1000;
                     if(index < 1) {
                         timing=3000;
                     } else if (index >= 1) {
                         timing = 6000;
                     } 

                     $(".loaderContainer").show();
                     setTimeout(() => {
                         comparisonViewer.setGhosting(true);
                         comparisonViewer.isolate(dbs, rightModel);
                         $(".loaderContainer").hide();
                     }, timing);
                     
                 }
             }
         }

     }
     
     var plannedCompleteElements={};
     // handles the right viewer coloring based on the data provided from backend and handles the events, id #forgeViewer2
     function setLeftViewerColors(data,i) {
         var plannedCompleteElementsModelWise=[]
         if(i > 0 && ($.isEmptyObject(dbWithExternalPvsA) || pvsaLoaded < i)) {
             setTimeout(() => {
                 console.log("Properties not loaded yet, Trying again." + dbWithExternalPvsA.length + " " + i + " " + pvsaLoaded);
                 setLeftViewerColors(data,i);
             }, 10000);
         } else {
             
             if(!$.isEmptyObject(comparisonViewer) && !$.isEmptyObject(comparisonViewer.getVisibleModels()[i])) {
             
                 var leftModel = comparisonViewer.getVisibleModels()[i];
                 comparisonViewer.clearThemingColors(leftModel);
                 if ($.isEmptyObject(data.plannedData)) {
                     comparisonViewer.setGhosting(true);
                     var instanceTree = leftModel.getData().instanceTree
                     var rootId = instanceTree.getRootId()
                     comparisonViewer.hide(rootId, leftModel) 
                     return;
                 }
             var dbs=[]
             if(!$.isEmptyObject(data) && !$.isEmptyObject(data.plannedData)) {
                 var elementIds=data.plannedData;

                 Object.keys(elementIds).map(function(key, index) {
                      
                         var dbIdOfNode = dbWithExternal[key];
                         if(i > 0) {
                             var exe = dbWithExternalPvsA[i-1];
                             dbIdOfNode = exe[key];
                         }
                         
                         if(dbIdOfNode) {
                             
                             if(elementIds[key] === 7) {
                                 plannedCompleteElementsModelWise.push(dbIdOfNode);
                             }

                             if($('#renderSwitch').is(":checked")) {
                                 if(elementIds[key] !== 7) {
                                     applyColorsToModel(comparisonViewer,leftModel,elementIds[key],dbIdOfNode);
                                 }
                             } else {
                                 applyColorsToModel(comparisonViewer,leftModel,elementIds[key],dbIdOfNode);
                             }
                             dbs.push(dbIdOfNode);
                         }

                         
                 });
                 
                 plannedCompleteElements[leftModel.id]=plannedCompleteElementsModelWise;

                 var timing=1000;
                 if(i < 1) {
                     timing=3000;
                 } else if (i >= 1) {
                     timing = 6000;
                 } 
                 $(".loaderContainer").show();
                 setTimeout(() => {
                     comparisonViewer.setGhosting(true);
                     comparisonViewer.isolate(dbs, leftModel);
                     $(".loaderContainer").hide();
                 }, timing);
                 
             }
         }
         }

     }
     
     // renders the orignial color of the model for only completed elements
     $(document).on("change","#renderSwitch",function() {
         if(!$.isEmptyObject(comparisonViewer)) {
             for(var j=0; j<comparisonViewer.getVisibleModels().length; j++) {
                 if(comparisonViewer.getVisibleModels()[j]) {
                     var leftModel = comparisonViewer.getVisibleModels()[j];
                     if(this.checked) {
                         var Ids = plannedCompleteElements[leftModel.id];
                         for(var i=0;i<Ids.length;i++) {
                             comparisonViewer.setThemingColor(Ids[i], null, leftModel);
                         }
                     } else {
                         var Ids = plannedCompleteElements[leftModel.id];
                         for(var i=0;i<Ids.length;i++) {
                             applyColorsToModel(comparisonViewer,leftModel,7,Ids[i]);
                         }
                     }
                 }
             }
         }
     });

     // applies color to a models based on the parametes provided
     function applyColorsToModel(applyViewer,applyModel,applyStatus,dbIdOfNode) {
          var color = {};
             if (applyStatus == 0) {
                 color["r"] = parseFloat(238 / 255);
                 color["g"] = parseFloat(220 / 255);
                 color["b"] = parseFloat(29 / 255);
             } else if (applyStatus == 1) {
                 color["r"] = parseFloat(255 / 255);
                 color["g"] = parseFloat(114 / 255);
                 color["b"] = parseFloat(97 / 255);
             } else if (applyStatus == 2) {
                 color["r"] = parseFloat(5 / 255);
                 color["g"] = parseFloat(227 / 255);
                 color["b"] = parseFloat(68 / 255);
             } else if (applyStatus == 3) {
                 color["r"] = parseFloat(175 / 255);
                 color["g"] = parseFloat(209 / 255);
                 color["b"] = parseFloat(39 / 255);
             } else if (applyStatus == 4) {
                 color["r"] = parseFloat(84 / 255);
                 color["g"] = parseFloat(27 / 255);
                 color["b"] = parseFloat(96 / 255);
             } else if (applyStatus == 5) {
                 color["r"] = parseFloat(247 / 255);
                 color["g"] = parseFloat(191 / 255);
                 color["b"] = parseFloat(63 / 255);
             } else if (applyStatus == 6) {
                 color["r"] = parseFloat(228 / 255);
                 color["g"] = parseFloat(0 / 255);
                 color["b"] = parseFloat(0 / 255);
             } else if (applyStatus == 7) {
                 color["r"] = parseFloat(4 / 255);
                 color["g"] = parseFloat(150 / 255);
                 color["b"] = parseFloat(46 / 255);
             } else if (applyStatus == 8) {
                 color["r"] = parseFloat(90 / 255);
                 color["g"] = parseFloat(85 / 255);
                 color["b"] = parseFloat(181 / 255);
             } else if (applyStatus == 9) {
                 color["r"] = parseFloat(2 / 255);
                 color["g"] = parseFloat(64 / 255);
                 color["b"] = parseFloat(9 / 255);
             } else {
                 console.log("DEBUG Color - no color for given status - node status:" + applyStatus);
             }
             
             applyViewer.setThemingColor(dbIdOfNode, new THREE.Vector4(color["r"], color["g"], color["b"], 1), applyModel, true);
     }
     
     function sortActivityStatusesToShowColors(statuses) {

         if(!$.isEmptyObject(statuses) && statuses.length > 0) {
             var returnStatus=-1;
             
               if(statuses.length == 1)
                   returnStatus = statuses[0];
               else if (statuses.includes(6))
                   returnStatus = 6;
               else if (statuses.includes(5) && !statuses.includes(6))
                   returnStatus = 5;
               else if (statuses.includes(8) && !(statuses.includes(6) || statuses.includes(5)))
                   returnStatus = 8;
               else if (statuses.every(function (e) { return e < 4; }))
                   returnStatus = getLeastStatus(statuses);
               else if (statuses.every( (val, i, arr) => val === arr[0] ))
                   returnStatus = statuses[0];
               else if (statuses.every(function (e) { return [4,7,9].includes(e); }))
                   returnStatus = Math.min.apply(Math,statuses);
               else if (statuses.every(function (e) { return (e <= 4 && statuses.includes(4)) }))
                   returnStatus = 4;
               else if (checkIfAnyElementExists(statuses,[0,1,2,3]) && checkIfAnyElementExists(statuses,[4,7,9]))
                   returnStatus = 4;
               else
                   returnStatus=0;
               
             return returnStatus;
         }
         
         return -1;
     }
     
     function getLeastStatus(statuses) {
         var status = Math.min.apply(Math,statuses);
         if(status==2 && statuses.includes(3)) {
             return 3;
         }
         return status;
     }
     
     function checkIfAnyElementExists(obj1,obj2) {
         for(var i=0; i<obj1.length; i++) {
             if(obj2.includes(obj1[i])) {
                 return true;
             }
         }
         
         return false;
     }
     
     /**Ref: https://forge.autodesk.com/blog/customize-viewer-context-menu */
     class ContextMenuExtension extends Autodesk.Viewing.Extension {
         constructor(viewer, options) {
             super(viewer, options);
     
             this.onBuildingContextMenuItem = this.onBuildingContextMenuItem.bind(this);
         }
     
         get menuId() {
             return 'MyColorContextMenu';
         }
     
         onBuildingContextMenuItem(menu, status) {
             if (status.hasSelected) {
                 menu.push({
                     title: messageUtils.getMessageString("forge.save.filter"),
                     target: () => {
                         $('#saveModelFilter').modal('toggle');
                         $("#saveFilterName").val("");
                     }
                 });
     
             }
         }
     
         load() {
             // Add my owned menu items
             this.viewer.registerContextMenuCallback(
                 this.menuId,
                 this.onBuildingContextMenuItem
             );
     
             return true;
         }
     
         unload() {
             // Remove all menu items added from this extension
             this.viewer.unregisterContextMenuCallback(this.menuId);
     
             return true;
         }
     }
     
     /**
         save filter model drop down event icon handling
      */
     $(document).on("click", ".openAccordionFilter", function(event) {
         event.stopPropagation();
         var id = $(this).attr("id");
         let accordionId = $(`#${id}_open`);
         if (accordionId.hasClass("in")) {
             $(this).removeClass("fa-caret-down").addClass("fa-caret-right");
            // $(`#${id} i`).removeClass("fa-caret-down").addClass("fa-caret-right");
             $(accordionId).removeClass("in");
         } else {
               $(this).removeClass("fa-caret-right").addClass("fa-caret-down");
             //$(`#${id} i`).removeClass("fa-caret-right").addClass("fa-caret-down");
             $(accordionId).addClass("in");
         }
     });
     
     /**tootlbar save button */
     class SavedFiltersExtension extends Autodesk.Viewing.Extension {
         constructor(viewer, options) {
             super(viewer, options);
             this._group = null;
             this._button = null;
         }
     
         load() {
             console.log('SavedFiltersExtension has been loaded');
             return true;
         }
         unload() {
             // Clean our UI elements if we added any
             if (this._group) {
                 this._group.removeControl(this._button);
                 if (this._group.getNumberOfControls() === 0) {
                     this.viewer.toolbar.removeControl(this._group);
                 }
             }
             console.log('SavedFiltersExtension has been unloaded');
             return true;
         }
     
         onToolbarCreated() {
             // Create a new toolbar group if it doesn't exist
             this._group = this.viewer.toolbar.getControl('savedFiltersExtensionToolbar');
             if (!this._group) {
                 this._group = new Autodesk.Viewing.UI.ControlGroup('savedFiltersExtensionToolbar');
                 this.viewer.toolbar.addControl(this._group);
             }
             // Add a new button to the toolbar group
             this._button = new Autodesk.Viewing.UI.Button('savedFiltersExtensionButton');
             this._button.onClick = (ev) => {
     
                 console.log("load save button")
                 if ($.isEmptyObject(gVisibleSavedModelFilters) && gVisibleSavedModelFilters.length == 0) {
                     fetchVisibleModelsAllSavedFilters();
                 }
     
                 if ($("#savedFilterPanel").length > 0) {
                     $("#savedFilterPanel").remove();
                     $("#savedFiltersExtensionButton").removeClass("active");
                     $("#savedFiltersExtensionButton").addClass("inactive");
                 } else {
                     $("#savedFiltersExtensionButton").removeClass("inactive");
                     $("#savedFiltersExtensionButton").addClass("active");
     
                     var content = document.createElement('div');
                     var mypanel = new SavedFilterPanel(viewer.container, 'savedFilterPanel', messageUtils.getMessageString("forge.saved.filter.title"), content);
                     pageIndex = 1;
     
                     mypanel.setVisible(true);
     
                     let options = $("#forgeModelListView option:selected");
                     let savedFilters = jQuery.extend(true, [], gVisibleSavedModelFilters);
                     let usedElement = [];
                     let visibility = "visible";
     
                     if ($.isEmptyObject(loginRoleArray) && loginRoleArray.length == 0) {
                         getRoleForPerson();
                     }
     
                     if (currentUserName == null) {
                         getLoggedInUserInfo();
                     }
     
                     if (!loginRoleArray.includes("ROLE_PROJECT_ADMIN") && currentUserName != "system administrator") {
                         visibility = "hidden";
                     }
     
                     $("#savedFilterDisplayListForge").empty();
     
                     let list = `<div>`;
                     for (var i = 0; i < options.length; i++) {
     
                         list += `<div class="forgeFilterRow" value="${options[i].id}">
                                     <i id="collapse${options[i].id}" class="openAccordionFilter fa fa-caret-right" style="font-size:19px; padding: 0px 0px 8px 3px;position: absolute;"></i>
                                     <label class="forgeFilterNameLabel" style="padding-left: 23px;">${options[i].label}</label>
                                     <span id="${options[i].id}" class="modelEyeClick">${closeEye}</span>`;
     
                         let count = 0;
                         list += `<div id="collapse${options[i].id}_open" class="panel-collapse collapse">`;
                         savedFilters.forEach(function(item) {
                             if (item.modelGuids.length == 1 && options[i].id == item.modelGuids && !usedElement.includes(item.guid)) {
                                 count++;
                                 console.log("id: " + $("#" + options[i].id));
                                 list += `<div class="forgeFilterRow">
                                             <label class="forgeFilterNameLabel" id="${item.guid}" style="padding-left: 40px;" value="${item.guid}">${item.modelFilterName} (${item.dbIdsCount})</label>
                                             <span id="${item.guid}" class="eyeClick">${closeEye}</span>
                                             <span id="${item.guid}" class="fa fa-trash-o" style="font-size: 20px;color: red;float: right;padding: 4px 4px 4px 4px; visibility: ${visibility};"></span>
                                             </div>`;
                                 usedElement.push(item.guid);
                             }
                         });
     
                         if (count != 0) {
                             list += `</div></div>`;
                         } else {
                             let message = messageUtils.getMessageString("forge.filter.noData");
                             list += `<div class="forgeFilterRow">
                                             <label style="padding-left: 40px;">${message}</label>
                                             </div></div></div>`;
                         }
                     }
     
                     savedFilters.forEach(function(item) {
                         if (!usedElement.includes(item.guid)) {
                             list += `<div class="forgeFilterRow" id="${item.guid}" value="${item.guid}" style="padding-left: 25px;">
                                         <label class="forgeFilterNameLabel">${item.modelFilterName} (${item.dbIdsCount})</label>
                                         <span id="${item.guid}" class="eyeClick">${closeEye}</span>
                                         <span id="${item.guid}" class="fa fa-trash-o" style="font-size: 20px;color: red;float: right;padding: 4px 4px 4px 4px;visibility: ${visibility};"></span>
                                     </div>`;
                         }
                     });
     
                     list += `</div>`;
     
                     $("#savedFilterDisplayListForge").append(list);
     
                 }
             };
             this._button.setToolTip('Save Your Filters');
             this._button.addClass('savedFiltersExtensionIcon');
             this._group.addControl(this._button);
         }
     }
     
     SavedFilterPanel = function(parentContainer, id, title, content, x, y) {
         let $this = this;
         autodeskViewDockingPanel(parentContainer, id, title, content, $this);
         let lContainerObj = {
             height: "400px",
             width: "500px",
             left: "50px",
             top: "100px",
             resize: "auto"
         }
         restrictContainerSize(lContainerObj, $this);
     };
     
     SavedFilterPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
     SavedFilterPanel.prototype.constructor = SavedFilterPanel;
     
     SavedFilterPanel.prototype.initialize = function() {
         this.title = this.createTitleBar(this.titleLabel || this.container.id);
         this.container.appendChild(this.title);
         this.container.appendChild(this.content);
         this.container.appendChild(this.closer);
         var op = {
             right: false,
             heightAdjustment: 45,
             marginTop: 0
         };
         this.scrollcontainer = this.createScrollContainer(op);
     
         let searchLabel = messageUtils.getMessageString("label.text.search");
     
         var myvar = `<div class="fixed-area-header">
                                 <div class="icon_group-forge">
                                     <span class="glyphicon glyphicon-search"></span>
                                     <input class="eleFreeText" id="searchFilter" style="margin-left: 10px; width: 90%;" placeholder = "${searchLabel}" type="search">
                                 </div>
                                 <span class="clearfix"></span>
                             </div>
                             <div class="searchResult-forge">
                                 <div id="savedFilterDisplayListForge"></div>
                             </div>`;
     
         var html = [myvar].join('\n');
         $(this.scrollContainer).append(html);
         this.initializeCloseHandler(this.closer);
         this.initializeMoveHandlers(this.title);
     };
     
     
     /**remove selected active class when model close button click */
     $(document).on("click", "#savedFilterPanel > .docking-panel-close", function() {
     
         if ($('#savedFiltersExtensionButton').hasClass('active')) {
             $("#savedFiltersExtensionButton").removeClass("active");
             $("#savedFiltersExtensionButton").addClass("inactive");
             filterSelections = [];
         } else {
             $("#savedFiltersExtensionButton").removeClass("inactive");
             $("#savedFiltersExtensionButton").addClass("active");
         }
     });
     
     /**validate filter name should not empty */
     $(document).on("keyup", "#saveFilterName", function() {
         //Reference the Button.
         var btnSave = $("#saveModelFilterBtn");
     
         //Verify the TextBox value.
         if ($(this).val().trim() != "") {
             //Enable the TextBox when TextBox has value.
             btnSave.removeAttr("disabled");
         } else {
             //Disable the TextBox when TextBox is empty.
             btnSave.attr("disabled", "disabled");
         }
     });
     
     /**search filter in filter model box on type text */
     $(document).on("keyup", "#searchFilter", function(event) {
         var g = $(this).val().toLowerCase();
         $(".forgeFilterRow label").each(function() {
             var s = $(this).text().toLowerCase();
             $(this).closest('.forgeFilterRow')[s.indexOf(g) !== -1 ? 'show' : 'hide']();
         })
     });
     
     /**
         click on filters eye icon visible dbIds in model 
      */
     var filterSelections = [];
     $(document).on("click", ".eyeClick", function(event) {
         event.stopPropagation();
         let id = $(this).attr("id");
         let svgId = $(this).children("svg").attr("id");
         let dbIds = [];
     
         for (let i = 0; i < gVisibleSavedModelFilters.length; i++) {
             if (id == gVisibleSavedModelFilters[i].guid) {
                 dbIds = gVisibleSavedModelFilters[i].dbIds;
                 break;
             }
         }

         if (svgId == "closeEye") {
             
             for (var i = 0; i < viewer.getVisibleModels().length; i++) {
                 if(filterSelections.hasOwnProperty(viewer.getVisibleModels()[i].id)) {
                     var olddbs = dbIds.concat(filterSelections[viewer.getVisibleModels()[i].id].ids);
                     filterSelections[viewer.getVisibleModels()[i].id] = {
                             model: viewer.getVisibleModels()[i],
                             ids: olddbs
                     };
                 } else {
                     filterSelections[viewer.getVisibleModels()[i].id] = {
                             model: viewer.getVisibleModels()[i],
                             ids: dbIds
                     };
                 }
             }
             
             $(this).empty();
             $(this).append(`${openEye}`);
             $(this).prev(".forgeFilterNameLabel").css({
                 "color": "white"
             });

             Object.values(filterSelections).forEach(val => viewer.impl.selector.setAggregateSelection([val]));
             
         } else {
             $(this).empty();
             $(this).append(`${closeEye}`);
             $(this).prev(".forgeFilterNameLabel").css({
                 "color": "#6c6a6a"
             });
             
             for(var i=0; i<viewer.getVisibleModels().length; i++) {
                 var olddbs = filterSelections[viewer.getVisibleModels()[i].id].ids;
                 for(var j=0; j<dbIds.length; j++) {
                     const index = olddbs.indexOf(dbIds[j]);
                     if (index > -1) {
                         olddbs.splice(index, 1);
                     }
                 }
                 
                 filterSelections[viewer.getVisibleModels()[i].id] = {
                         model: viewer.getVisibleModels()[i],
                         ids: olddbs
                 };
             }
             
             Object.values(filterSelections).forEach(val => viewer.impl.selector.setAggregateSelection([val]));
         }
     });
     
     /**
         click on model eye icon visible dbIds in model 
      */
     $(document).on("click", ".modelEyeClick", function(event) {
         event.stopPropagation();
         var modelId = $(this).attr("id");
         let svgId = $(this).children("svg").attr("id");
     
         if (svgId == "closeEye") {
             $(this).empty();
             $(this).append(`${openEye}`);
             $(this).prev(".forgeFilterNameLabel").css({
                 "color": "white"
             });
             
             $(`#collapse${modelId}_open > .forgeFilterRow`).each(function() {
                 if($(this).children(".eyeClick").children("svg").attr("id") == "closeEye") {
                     $(this).children(".eyeClick").click();
                 }
             });
             
         } else {
             $(this).empty();
             $(this).append(`${closeEye}`);
             $(this).prev(".forgeFilterNameLabel").css({
                 "color": "#6c6a6a"
             });
             
             $(`#collapse${modelId}_open > .forgeFilterRow`).each(function() {
                 if($(this).children(".eyeClick").children("svg").attr("id") == "openEye") {
                     $(this).children(".eyeClick").click();
                 }
             });

         }
     });
     
     /**
         click on delete icon delete saved Filters
      */
     $(document).on("click", ".fa-trash-o", function(event) {
         event.stopPropagation();
         let id = $(this).attr("id");
     
         let filterGuid, filterName;
     
         for (let i = 0; i < gVisibleSavedModelFilters.length; i++) {
             if (id == gVisibleSavedModelFilters[i].guid) {
                 filterGuid = gVisibleSavedModelFilters[i].guid;
                 filterName = gVisibleSavedModelFilters[i].modelFilterName;
                 break;
             }
         }
     
         deleteModelSavedFilters(filterGuid, filterName);
     });
     
     /**save Filter In db */
     $(document).on("click", "#saveModelFilterBtn", function() {
     
         let filterName = $("#saveFilterName").val();
         let filterModelIds = [];
         let projectGuid = visileanUtil.currentProject();
         let dbIds = [];
         filterSelections = [];
     
         if ($.isEmptyObject(gSavedModelFilters) && gSavedModelFilters.length == 0) {
             fetchModelsAllSavedFilters();
         }
     
         if (!$.isEmptyObject(gSavedModelFilters) && gSavedModelFilters != null) {
             let success = true;
             for (let i = 0; i < gSavedModelFilters.length; i++) {
                 if (gSavedModelFilters[i].modelFilterName.toLowerCase() === filterName.toLowerCase()) {
                     app.trigger("statusMessage:new", {
                         message: messageUtils.getMessageString("forge.save.filter.name.error").format([filterName]),
                         messageLevel: "ERROR",
                         showModal: true,
                     });
                     success = false;
                     break;
                 }
             }
             if (success == false)
                 return false;
     
         }
     
         let selectedModelsItems = viewer.getAggregateSelection();
         selectedModelsItems.forEach(function(item) {
     
             if (!filterModelIds.includes(item.model._myGUID)) {
                 filterModelIds.push(item.model._myGUID);
             }
     
             item.selection.forEach(function(i) {
                 if (!dbIds.includes(i)) {
                     dbIds.push(i);
                 }
             })
         });
     
         var options = {
             data: JSON.stringify({
                 projectGuid: projectGuid,
                 modelGuids: filterModelIds,
                 modelFilterName: filterName,
                 dbIds: dbIds,
                 dbIdsCount: dbIds.length
             }),
             contentType: 'application/json',
             dataType: "json",
             cache: false,
             async: false,
             success: function(data) {
                 app.trigger("statusMessage:new", {
                     message: messageUtils.getMessageString("forge.save.filter.sucess").format([filterName]),
                     messageLevel: "SUCCESS",
                     showModal: true,
                 });
             },
             error: function(jqXHR, textStatus, error) {
                 $('#saveModelFilter').modal('hide');
                 $("#saveFilterName").val("");
                 app.trigger("statusMessage:new", {
                     message: messageUtils.getMessageString("forge.save.filter.fail").format([filterName]),
                     messageLevel: "ERROR",
                     showModal: true
                 });
             }
         };
         visileanUtil.doApiAjaxPostPromise("models/saveModelElementFilters", options).done(function(data) {
             if (!$.isEmptyObject(data) && data != null) {
                 $("#saveFilterName").val("");
                 $('#saveModelFilter').modal('hide');
                 gSavedModelFilters = [];
                 gSavedModelFilters = data.result;
                 fetchVisibleModelsAllSavedFilters();
                 resetSavedFilterList();
             }
         });
     
     
     });
     
     /**get all saved Filters */
     function fetchModelsAllSavedFilters() {
         var options = {
             data: {
                 projectGuid: visileanUtil.currentProject()
             },
             dataType: "json",
             cache: false,
             async: false
         };
         visileanUtil.doApiAjaxGetPromise("models/getProjectModelSavedFilters", options).done(function(data) {
             gSavedModelFilters = [];
             gSavedModelFilters = data.result;
         });
     }
     
     /**get all visible saved Filters */
     function fetchVisibleModelsAllSavedFilters() {
     
         let modelGuids = [];
     
         for (var i = 0; i < viewer.getVisibleModels().length; i++) {
             modelGuids.push(viewer.getVisibleModels()[i]._myGUID);
         }
     
         var options = {
             data: JSON.stringify({
                 projectGuid: visileanUtil.currentProject(),
                 modelGuids: modelGuids
             }),
             contentType: 'application/json',
             dataType: "json",
             cache: false,
             async: false
         };
         visileanUtil.doApiAjaxPostPromise("models/getProjectVisibleModelSavedFilters", options).done(function(data) {
             gVisibleSavedModelFilters = [];
             gVisibleSavedModelFilters = data.result;
         });
     }
     
     /**delete saved filter */
     function deleteModelSavedFilters(filterGuid, filterName) {
     
         messageUtils.showMessageModal({
             message: messageUtils.getMessageString("forge.save.filter.delete").format([filterName]),
             messageLevel: "INFO",
             showModal: true,
             modalOptions: [{
                 text: messageUtils.getMessageString("label.text.yes"),
                 value: true
             }, {
                 text: messageUtils.getMessageString("label.text.cancel"),
                 value: false
             }]
     
         }).then(function(result) {
             if (result) {
                 var options = {
                     data: {
                         projectGuid: visileanUtil.currentProject(),
                         filterGuid: filterGuid
                     },
                     async: false,
                     cache: false,
                     dataType: "json",
                     success: function(data) {
                         app.trigger("statusMessage:new", {
                             message: messageUtils.getMessageString("forge.delete.filter.sucess").format([filterName]),
                             messageLevel: "SUCCESS",
                             showModal: true,
                         });
                     },
                     error: function(jqXHR, textStatus, error) {
                         app.trigger("statusMessage:new", {
                             message: messageUtils.getMessageString("forge.delete.filter.fail").format([filterName]),
                             messageLevel: "ERROR",
                             showModal: true
                         });
                     }
                 };
                 visileanUtil.doApiAjaxDeletePromise("models/deleteModelSavedFilter", options).done(function(data) {
                     if (!$.isEmptyObject(data) && data != null) {
                         gSavedModelFilters = [];
                         gSavedModelFilters = data.result;
                         fetchVisibleModelsAllSavedFilters();
                         resetSavedFilterList();
                     }
                 });
             }
         });
     }
     
     function resetSavedFilterList() {
         if ($.isEmptyObject(gVisibleSavedModelFilters) && gVisibleSavedModelFilters.length == 0) {
             fetchVisibleModelsAllSavedFilters();
         }
     
         let options = $("#forgeModelListView option:selected");
         let savedFilters = jQuery.extend(true, [], gVisibleSavedModelFilters);
         let usedElement = [];
         let visibility = "visible";
     
         if ($.isEmptyObject(loginRoleArray) && loginRoleArray.length == 0) {
             getRoleForPerson();
         }
     
         if (currentUserName == null) {
             getLoggedInUserInfo();
         }
     
         if (!loginRoleArray.includes("ROLE_PROJECT_ADMIN") && currentUserName != "system administrator") {
             visibility = "hidden";
         }
     
         $("#savedFilterDisplayListForge").empty();
     
         let list = `<div>`;
         for (var i = 0; i < options.length; i++) {
     
             list += `<div class="forgeFilterRow" value="${options[i].id}">
                                 <i id="collapse${options[i].id}" class="openAccordionFilter fa fa-caret-right" style="font-size:19px; padding: 0px 0px 8px 3px;position: absolute;"></i>
                                 <label class="forgeFilterNameLabel" style="padding-left: 23px;">${options[i].label}</label>
                                 <span id="${options[i].id}" class="modelEyeClick">${closeEye}</span>`;
     
             let count = 0;
             list += `<div id="collapse${options[i].id}_open" class="panel-collapse collapse">`;
             savedFilters.forEach(function(item) {
                 if (item.modelGuids.length == 1 && options[i].id == item.modelGuids && !usedElement.includes(item.guid)) {
                     count++;
                     console.log("id: " + $("#" + options[i].id));
                     list += `<div class="forgeFilterRow">
                                     <label class="forgeFilterNameLabel" id="${item.guid}" style="padding-left: 40px;" value="${item.guid}">${item.modelFilterName} (${item.dbIdsCount})</label>
                                     <span id="${item.guid}" class="eyeClick">${closeEye}</span>
                                     <span id="${item.guid}" class="fa fa-trash-o" style="font-size: 20px;color: red;float: right;padding: 4px 4px 4px 4px; visibility: ${visibility};"></span>
                                     </div>`;
                     usedElement.push(item.guid);
                 }
             });
     
             if (count != 0) {
                 list += `</div></div>`;
             } else {
                 let message = messageUtils.getMessageString("forge.filter.noData");
                 list += `<div class="forgeFilterRow">
                                     <label style="padding-left: 40px;">${message}</label>
                                 </div></div></div>`;
             }
         }
     
         savedFilters.forEach(function(item) {
             if (!usedElement.includes(item.guid)) {
                 list += `<div class="forgeFilterRow" id="${item.guid}" value="${item.guid}" style="padding-left: 25px;">
                                 <label class="forgeFilterNameLabel">${item.modelFilterName} (${item.dbIdsCount})</label>
                                     <span id="${item.guid}" class="eyeClick">${closeEye}</span>
                                     <span id="${item.guid}" class="fa fa-trash-o" style="font-size: 20px;color: red;float: right;padding: 4px 4px 4px 4px; visibility: ${visibility};"></span>
                                 </div>`;
             }
         });
     
         list += `</div>`;
     
         $("#savedFilterDisplayListForge").append(list);
     }
     
     function getLoggedInUserInfo() {
         var usrData = visileanUtil.getCurrentLoggedInUserInfo();
         currentUserName = (usrData != undefined && usrData.hasOwnProperty("name") && usrData.name != null) ? usrData.name : null;
     }
     
     function getRoleForPerson() {
         var role = projectUtils.getCurrentUserRoleArray();
         loginRoleArray = [];
         if (!$.isEmptyObject(role)) {
             loginRoleArray.push(...role);
         }
     }
     
     
     Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.ADN.Viewing.Extension.MetaProperties', Autodesk.ADN.Viewing.Extension.MetaProperties);
     Autodesk.Viewing.theExtensionManager.registerExtension('SearchElementExtension', SearchElementExtension);
     Autodesk.Viewing.theExtensionManager.registerExtension('VersonControlExtension', VersonControlExtension);
     Autodesk.Viewing.theExtensionManager.registerExtension('SelectTaskExtension', SelectTaskExtension);
     Autodesk.Viewing.theExtensionManager.registerExtension('ModelSummaryExtension', ModelSummaryExtension);
     Autodesk.Viewing.theExtensionManager.registerExtension('BIM360IssueExtension', BIM360IssueExtension);
     Autodesk.Viewing.theExtensionManager.registerExtension('PlannedVsActualExtension', PlannedVsActualExtension);
     Autodesk.Viewing.theExtensionManager.registerExtension('ContextMenuExtension', ContextMenuExtension);
     Autodesk.Viewing.theExtensionManager.registerExtension('SavedFiltersExtension', SavedFiltersExtension);
 
     var ForgeViewer = {
         launchViewer:launchViewer,
         bottomNavigationChanged:bottomNavigationChanged,
         handleLinkedElementsInScheduler:handleLinkedElementsInScheduler,
         handleViewModeChanged:handleViewModeChanged,
         hideAllExtenstionWhileInScheduler:hideAllExtenstionWhileInScheduler,
         setCurrentActIds:setCurrentActIds,
         linkDeleteFromGantt:linkDeleteFromGantt,
         resizeAndShowHideEventsForPlannedVsActualOff:resizeAndShowHideEventsForPlannedVsActualOff
     };
     return ForgeViewer;
 });