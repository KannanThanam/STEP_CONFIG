 /*Bussiness rule to set the product pakaging status
 * author @Anandhi
 * If currentLifeCycle is 2 or 3 then populate Future In market
 * If currentLifecycle is 4 then populate In market
 * If currentLifeCycle is 5 then set Previous In Market
*/
var parent=curObj.getParent().getParent().getID();
var fpc=curObj.getParent();
var lifeCycleRefs;
var salesAreaReferenceType;
var lifeCycleReferenceType;
	
var approveSalesAreaArray=[];
var approveSalesArea=fpc.getValue("SalesAreaStatus").getSimpleValue();
if(approveSalesArea != null){
	approveSalesAreaArray=approveSalesArea.split("<multisep/>");
} else{
	log.info("SalesAreaStatus is Null ===== "+approveSalesArea);
}
var brandType=fpc.getValue("SalesAreaStatus").getSimpleValue();
if(curObj.getValue("GlobalRegion").getSimpleValue()=="NA"|| curObj.getValue("Country_TM").getSimpleValue()=="PH"){
	if(!(parent == "Unassigned")){
		lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
		lifeCycleRefs =curObj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
		var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
		var salesAreaRefs =curObj.getClassificationProductLinks(salesAreaReferenceType).toArray();
		for(var i=0;i<lifeCycleRefs.length;i++){
			var lifeCycleRef=lifeCycleRefs[i];
			var currLifeCycleStageValue = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
			var currLifeCycleStage=0;					
			if(currLifeCycleStageValue != null){						
				currLifeCycleStage =currLifeCycleStageValue.getID();						
			}
			if(currLifeCycleStage != 0 ){
				var targetLifeCycleSalesArea=lifeCycleRef.getClassification().getID();				
				var marketApprovalStatus=curObj.getValue("MarketingApproved").getSimpleValue();
				var econtentDate=curObj.getValue("EcontentPublicationDate").getSimpleValue();
				if(targetLifeCycleSalesArea == "US"){
					log.info("Target LifeCycle Sales Area is US");
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesArea=salesAreaRef.getClassification().getID();
						for(var k=0;k<approveSalesAreaArray.length;k++){
							if((targetSalesArea == "US60" || targetSalesArea == "USY1" || targetSalesArea == "US65") && (targetSalesArea == approveSalesAreaArray[k]) ){
								log.info("Target Sales Area is US60/USY1");
								if(currLifeCycleStage !="" && currLifeCycleStage != null ){
									if(currLifeCycleStage =="2" || currLifeCycleStage =="3"){
										log.info("Current LifeCycleStatge is 2/3");
										var FutureinMarketFlag=true;
										var groupName = salesAreaRef.getClassification().getID();
										var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
										if(groupName == "US60" ||groupName == "CA00" ){
											var externalOnlineDate=curObj.getValue("ExternalOnlineDate").getSimpleValue();
											var lifeCycleStage4 =lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
											if(lifeCycleStage4 != null && externalOnlineDate!= null){
												var replacelc4 = lifeCycleStage4.replace("-", "/");
												var stepLifeCycleStage4 = new Date(replacelc4);	
												var replace5=externalOnlineDate.replace("-", "/");
												var stepexternalOnlineDate = new Date(replace5);
												if(stepLifeCycleStage4 > stepexternalOnlineDate && stepexternalOnlineDate <= currentDate){
													log.info("Execute populateInMarketStatus Function");
													populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);				
													FutureinMarketFlag=false;
												}
											}
										}
										if(FutureinMarketFlag){
											log.info("Execute populateFutureStatus Function");
											populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
											//logger.info("Future Set"+targetSalesArea+currLifeCycleStage);										
										}	
									}
									else if(currLifeCycleStage =="4" ){
										log.info("Current LifeCycleStage is 4");
										var inMarketFlag=true;
										var groupName = salesAreaRef.getClassification().getID();
										var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
										if(groupName == "US60" ||groupName == "CA00" ){
											
											var lifeCycleStage4=curObj.getValue("ExternalOnlineDate").getSimpleValue();
											if(lifeCycleStage4 != null){
												
												var replacelc4 = lifeCycleStage4.replace("-", "/");
												var stepLifeCycleStage4 = new Date(replacelc4);	
												if(stepLifeCycleStage4 > currentDate){
													log.info("Execute populateFutureStatus Function");
													populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
													inMarketFlag=false;
													//logger.info("Furture Set")
												}
											}
										}
										if(inMarketFlag){
											log.info("Execute populateInMarketStatus Function");
											populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
											//log.info("Output:"+salesAreaRef.getValue("ProductStatus").getSimpleValue());
											}
									}
									else if(currLifeCycleStage =="5"){
										log.info("Current LifeCycleStage is 5");
										log.info("Execute populatePreviousInMarketStatus Function");
										populatePreviousInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("Previous In Market Set"+targetSalesArea+currLifeCycleStage);
									}
								}
							}
						}
					}	
				}
				else if(targetLifeCycleSalesArea == "US_CPG"){
					log.info("Target LifeCycle Sales Area is US_CGP");
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesArea=salesAreaRef.getClassification().getID();
						for(var k=0;k<approveSalesAreaArray.length;k++){
							if(targetSalesArea == "US61" && targetSalesArea == approveSalesAreaArray[k]){
								log.info("Target Sales Area is US61");
								if(currLifeCycleStage !="" && currLifeCycleStage != null ){
									if(currLifeCycleStage =="2" || currLifeCycleStage =="3"){
										log.info("Current LifeCycleStage is 2/3");
										log.info("Execute populateFutureStatus Function");
										populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										
									}
									else if(currLifeCycleStage =="4"){
										log.info("Current LifeCycleStage is 4");
										log.info("Execute populateInMarketStatus Function");
										populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										log.info("FPC Version == "+curObj.getValue("GTIN_Status_New").getSimpleValue());
										//logger.info("In Market Set"+targetSalesArea+currLifeCycleStage);
									}
									else if(currLifeCycleStage =="5"){
										log.info("Current LifeCycleStage is 5");
										log.info("Execute populatePreviousInMarketStatus Function");
										populatePreviousInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("Previous In Market Set"+targetSalesArea+currLifeCycleStage);
									}
								}
							}
						}
					}				
				}
				else if(targetLifeCycleSalesArea == "US_PROF_DENTAL"){
					log.info("Target LifeCycle Sales Area is US_PROF_DENTAL");
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesArea=salesAreaRef.getClassification().getID();
						for(var k=0;k<approveSalesAreaArray.length;k++){
							if(targetSalesArea == "US64" && targetSalesArea == approveSalesAreaArray[k]){
								if(currLifeCycleStage !="" && currLifeCycleStage != null ){
									if(currLifeCycleStage =="2" || currLifeCycleStage =="3"){
										log.info("Current LifeCycleStage is 2/3");
										log.info("Execute populateFutureStatus Function");
										populateFutureStatus(salesAreaRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("Future Set"+targetSalesArea+currLifeCycleStage);
									}
									else if(currLifeCycleStage =="4"){
										log.info("Current LifeCycleStage is 4");
										log.info("Execute populateInMarketStatus Function");
										populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("In Market Set"+targetSalesArea+currLifeCycleStage);
									}
									else if(currLifeCycleStage =="5"){
										log.info("Current LifeCycleStage is 5");
										log.info("Execute populatePreviousInMarketStatus Function");
										populatePreviousInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("Previous In Market Set"+targetSalesArea+currLifeCycleStage);
									}
								}
							}
						}
					}				
				}			
				else if(targetLifeCycleSalesArea == "CA"){
					log.info("Target LifeCycle Sales Area is CA");
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesArea=salesAreaRef.getClassification().getID();
						for(var k=0;k<approveSalesAreaArray.length;k++){
							if((targetSalesArea == "CA00" || targetSalesArea == "CA01") && targetSalesArea == approveSalesAreaArray[k]){
								log.info("Target Sales Area is CA00/CA01");
								if(currLifeCycleStage !="" && currLifeCycleStage != null ){
									if(currLifeCycleStage =="2" || currLifeCycleStage =="3"){
										log.info(" Current LifeCycleStage is 2/3");
										var FutureinMarketFlag=true;
										var groupName = salesAreaRef.getClassification().getID();
										var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
										if(groupName == "US60" ||groupName == "CA00" ){
											var externalOnlineDate=curObj.getValue("ExternalOnlineDate").getSimpleValue();
											var lifeCycleStage4 =lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
											if(lifeCycleStage4 != null && externalOnlineDate!= null){
												var replacelc4 = lifeCycleStage4.replace("-", "/");
												var stepLifeCycleStage4 = new Date(replacelc4);	
												var replace5=externalOnlineDate.replace("-", "/");
												var stepexternalOnlineDate = new Date(replace5);	
												if(stepLifeCycleStage4 > stepexternalOnlineDate && stepexternalOnlineDate <= currentDate){
													log.info("Execute populateInMarketStatus Function");
													populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);				
													FutureinMarketFlag=false;
												}
											}
										}
										if(FutureinMarketFlag){
											log.info("Execute populateFutureStatus Function");
											populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);										
										}	
									}
									else if(currLifeCycleStage =="4"){
										log.info(" Current LifeCycleStage is 4");
										var inMarketFlag=true;
										var groupName = salesAreaRef.getClassification().getID();
										var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
										if(groupName == "US60" ||groupName == "CA00" ){
											var lifeCycleStage4=curObj.getValue("ExternalOnlineDate").getSimpleValue();
											if(lifeCycleStage4 != null){
												var replacelc4 = lifeCycleStage4.replace("-", "/");
												var stepLifeCycleStage4 = new Date(replacelc4);	
												if(stepLifeCycleStage4 > currentDate){
													log.info("Execute populateFutureStatus Function");
													populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
													inMarketFlag=false;
												}
											}
										}
										if(inMarketFlag){
											log.info("Execute populateInMarketStatus Function");
											populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										}
									}
									else if(currLifeCycleStage =="5"){
										log.info(" Current LifeCycleStage is 5");
										log.info("Execute populatePreviousInMarketStatus Function");
										populatePreviousInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//log.info("Previous Set"+targetSalesArea+currLifeCycleStage);
									}
								}
							}
						}
					}				
				}
				else if(targetLifeCycleSalesArea == "PR"){
					log.info("Target LifeCycle Sales Area is PR");
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesArea=salesAreaRef.getClassification().getID();
						for(var k=0;k<approveSalesAreaArray.length;k++){
							if(targetSalesArea == "PR04" && targetSalesArea == approveSalesAreaArray[k]){
								if(currLifeCycleStage !="" && currLifeCycleStage != null ){
									if(currLifeCycleStage =="2" || currLifeCycleStage =="3"){
										log.info(" Current LifeCycleStage is 2/3");
										log.info("Execute populateFutureStatus Function");
										populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("Future Set"+targetSalesArea+currLifeCycleStage);
									}
									else if(currLifeCycleStage =="4"){
										log.info(" Current LifeCycleStage is 4");
										log.info("Execute populateInMarketStatus Function");
										populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("In Market Set"+targetSalesArea+currLifeCycleStage);
									}
									else if(currLifeCycleStage =="5"){
										log.info(" Current LifeCycleStage is 5");
										log.info("Execute populatePreviousInMarketStatus Function");
										populatePreviousInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("Previous In Market Set"+targetSalesArea+currLifeCycleStage);
									}
								}
							}
						}
					}				
				}
				else if(targetLifeCycleSalesArea == "PH"){
					log.info("Target LifeCycle Sales Area is PH");
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesArea=salesAreaRef.getClassification().getID();
						for(var k=0;k<approveSalesAreaArray.length;k++){
							if((targetSalesArea == "PH0303" || targetSalesArea == "PH0302") && targetSalesArea == approveSalesAreaArray[k]){
								if(currLifeCycleStage !="" && currLifeCycleStage != null ){
									if(currLifeCycleStage =="2" || currLifeCycleStage =="3"){
										log.info(" Current LifeCycleStage is 2/3");
										log.info("Execute populateFutureStatus Function");
										populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("Future Set"+targetSalesArea+currLifeCycleStage);
									}
									else if(currLifeCycleStage =="4"){
										log.info(" Current LifeCycleStage is 4");
										log.info("Execute populateInMarketStatus Function");
										populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										//logger.info("In Market Set"+targetSalesArea+currLifeCycleStage);
									}
									else if(currLifeCycleStage =="5"){
										log.info(" Current LifeCycleStage is 5");
										log.info("Execute populatePreviousInMarketStatus Function");
										populatePreviousInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										logger.info("Previous In Market Set"+targetSalesArea+currLifeCycleStage);
									}
								}
							}
						}
					}				
				}
			}								
		}
	}
	log.info("FPC Version == "+ curObj.getValue("GTIN_Status_New").getSimpleValue());
}
else if(curObj.getValue("GlobalRegion").getSimpleValue()=="EU" || curObj.getValue("GlobalRegion").getSimpleValue()=="AMAW" || curObj.getValue("GlobalRegion").getSimpleValue()=="AMAE"|| curObj.getValue("GlobalRegion").getSimpleValue()=="LA"){
	//log.info("Start for Global Code");
	var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
	if(!(parent == "Unassigned")){
		lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
		lifeCycleRefs =curObj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
		var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
		var salesAreaRefs =curObj.getClassificationProductLinks(salesAreaReferenceType).toArray();
		for(var i=0;i<lifeCycleRefs.length;i++){
			var lifeCycleRef=lifeCycleRefs[i];
			var currLifeCycleStageValue = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
			var currLifeCycleStage=0;					
			if(currLifeCycleStageValue != null){						
				currLifeCycleStage =currLifeCycleStageValue.getID();						
			}
			//log.info(currLifeCycleStage);
			if(currLifeCycleStage != 0 ){
				var targetLifeCycleSalesArea=lifeCycleRef.getClassification().getID();						
				var marketApprovalStatus=curObj.getValue("MarketingApproved").getSimpleValue();
				var econtentDate=curObj.getValue("EcontentPublicationDate").getSimpleValue();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesArea=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesArea.replace("_","");
					for(var k=0;k<approveSalesAreaArray.length;k++){
						//log.info(targetSalesArea+" "+approveSalesAreaArray[k]);
						if(targetSalesArea == approveSalesAreaArray[k]){
							//log.info(targetSalesArea+" "+approveSalesAreaArray[k]);
							if(currLifeCycleStage =="2" || currLifeCycleStage =="3"){
								var externalOnlineDate=curObj.getValue("ExternalOnlineDate").getSimpleValue();
								var lifeCycleStage4 =lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();									
								var FutureinMarketFlag=true;
								if(lifeCycleStage4 != null && externalOnlineDate!= null){
									//log.info("lifeCycleStage4: " +lifeCycleStage4);
									//log.info("externalOnlineDate: " +externalOnlineDate);
									var replacelc4 = lifeCycleStage4.replace("-", "/");
									var stepLifeCycleStage4 = new Date(replacelc4);	
									var replace5=externalOnlineDate.replace("-", "/");
									var stepexternalOnlineDate = new Date(replace5);	
									if(stepLifeCycleStage4 > stepexternalOnlineDate && stepexternalOnlineDate <= currentDate){
										populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);FutureinMarketFlag=false;												
										FutureinMarketFlag = false;
									}
								}
								if(FutureinMarketFlag){
									populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
									//logger.info("Future Set"+targetSalesArea+currLifeCycleStage);										
								}
							}
							else if(currLifeCycleStage =="4"){
								//log.info("currLifeCycleStage 4");
								var inMarketFlag=true;
								var groupName = salesAreaRef.getClassification().getID();
								var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
								var lifeCycleStage4=curObj.getValue("ExternalOnlineDate").getSimpleValue();
								if(lifeCycleStage4 != null){
									//log.info("lifeCycleStage4 is not null");
									var replacelc4 = lifeCycleStage4.replace("-", "/");
									var stepLifeCycleStage4 = new Date(replacelc4);	
									if(stepLifeCycleStage4 > currentDate){
										//log.info("Anusha populateFutureStatus");
										populateFutureStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
										inMarketFlag=false;												
									}
								}
								if(inMarketFlag){
									//log.info(" populateInMarketStatus");
									populateInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
								}
							}
							else if(currLifeCycleStage =="5"){
								populatePreviousInMarketStatus(salesAreaRef,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger);
								logger.info("Previous In Market Set"+targetSalesArea+currLifeCycleStage);
							}										
						}
					}
				}
			}									
		}
	}
}


function getApprovedNode(manager, node) {
    var approvedNode = manager.executeInWorkspace("Approved", function (manager) {
        var approvedObject = manager.getObjectFromOtherManager(node);
        return approvedObject;
    });
    return approvedNode;
}
function populateValuesForAttributes(manager1,contextSpecObj,gtinObj,attrGrp){
	var attributeGrpHome = manager1.getAttributeGroupHome().getAttributeGroupByID(attrGrp);
	var approvedObj = manager1.getObjectFromOtherManager(contextSpecObj);
	var attributes = attributeGrpHome.getAttributes();
	var it = attributes.iterator();
	while ( it.hasNext() ){
		var attribute = it.next();
		if(approvedObj){
			gtinObj.getValue(attribute.getID()).setSimpleValue(approvedObj.getValue(attribute.getID()).getSimpleValue());
		}
	}
}

/**
 *@Aravinth
 * Battery values copy from GTIN to Each
 **/

function copyDCValuesFromTMtoEach(node, manager, DCId, attrGrpID, targetNode, logger) {
    var tmDCAttrs = utilbase.getAttributeSetFromAttributeGroup(attrGrpID, manager, logger);
    var tmDCAttrsArray = tmDCAttrs.iterator();
    var concatValue = "";
    while (tmDCAttrsArray.hasNext()) {
        var tmDCAttrsID = tmDCAttrsArray.next().getID();
        var dataContainerID = node.getDataContainerByTypeID(DCId)
            var dataContainerIterator = dataContainerID.getDataContainers().iterator();
        while (dataContainerIterator.hasNext()) {
            var sourceDataContainer = dataContainerIterator.next();
            var dataContainerType = sourceDataContainer.getDataContainerType();
            var dataContainerObject = sourceDataContainer.getDataContainerObject();
            var attributeValue = dataContainerObject.getValue(tmDCAttrsID).getSimpleValue();
            if (attributeValue) {
                concatValue += attributeValue.concat(";")
            }

        }
        concatValue = concatValue.slice(0, -1);
        if (tmDCAttrsID == "PowerSource") {
            tmDCAttrsID = "PIM_ATR_PowerSource_DC";
        }
        if (tmDCAttrsID == "BatteriesRequired" || tmDCAttrsID == "DoestheProductContainaBattery") {
            var concatValue = utilbase.batterySingleValueUpdate(concatValue, logger)
        }
        targetNode.getValue(tmDCAttrsID).setSimpleValue(concatValue)
        concatValue = "";
    }
}

/**Added by Aravinth
 * Ing attributes value copy from TM to GTIN
 **/
function copyIngDCValuesFromTMtoEach(node, manager, DCId, attrGrpID, targetNode, logger) {
    var tmDCAttrs = utilbase.getAttributeSetFromAttributeGroup(attrGrpID, manager, logger);
    var tmDCAttrsArray = tmDCAttrs.iterator();
    var concatValue = "";
    while (tmDCAttrsArray.hasNext()) {
        var tmDCAttrsID = tmDCAttrsArray.next().getID();
        var dataContainerID = node.getDataContainerByTypeID(DCId)
            var dataContainerIterator = dataContainerID.getDataContainers().iterator();
        while (dataContainerIterator.hasNext()) {
            var sourceDataContainer = dataContainerIterator.next();
            var dataContainerType = sourceDataContainer.getDataContainerType();
            var dataContainerObject = sourceDataContainer.getDataContainerObject();
            var attributeValue = dataContainerObject.getValue(tmDCAttrsID).getSimpleValue();
            if (attributeValue) {
                var IngNameAttributeValue = dataContainerObject.getValue("PIM_ATR_ING_IngName").getSimpleValue();
                var formulacardAttributeValue = dataContainerObject.getValue("PIM_ATR_FC_Name").getSimpleValue()
                concatValue += formulacardAttributeValue+"_"+IngNameAttributeValue + ":" + attributeValue.concat("|")
            }

        }
        concatValue = concatValue.slice(0, -1);
        if (tmDCAttrsID == "PIM_ATR_ING_ActiveIngredient") {
            targetNode.getValue("ActiveIngredient_Pack").setSimpleValue(concatValue)
        }
        if (tmDCAttrsID == "PIM_ATR_FC_Name") {
            targetNode.getValue("FormulaCardGCASPH").setSimpleValue(concatValue)
        }
        if (tmDCAttrsID != "PIM_ATR_ING_ActiveIngredient") {
            targetNode.getValue(tmDCAttrsID).setSimpleValue(concatValue)
        }

        concatValue = "";
    }
}

// Added by Aravinth --> Artwork Attribute value copy

function CopyAttrValueFromTMtoEach(node, manager, eachObj, logger) {
    var contextCountry = node.getValue("Country_TM").getSimpleValue();
    var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
    var globalContext = lookupTable.getLookupTableValue("GlobalContext", contextCountry);

    var splitLanguage = globalContext.split(",");
    for (i = 0; i < splitLanguage.length; i++) {
        var LanguageValue = splitLanguage[i];
        if (LanguageValue == "English") {
            LanguageValue = "Context1";
        }
        if (LanguageValue == "French") {
            LanguageValue = "Context3"
        }
        manager.executeInContext(LanguageValue, function (demanager) {
            var currentTargetMarket = demanager.getObjectFromOtherManager(node);
            var eachObject = demanager.getObjectFromOtherManager(eachObj);
            var approvedNodePick = demanager.executeInWorkspace("Approved", function (manager1) {
                var approvedObj = manager1.getObjectFromOtherManager(currentTargetMarket);
                var eachAttributeGroupId = utilbase.getAttributeSetFromAttributeGroup("PIM_AGR_POA_TMtoTM_Copy", manager, logger);
                eachAttributeGroupId.forEach(function (EachAttributeID) {
                    var TargetMarketEditable = "TM_" + EachAttributeID.getID();
                    if (TargetMarketEditable == "TM_IsproductaliquidinDoubleSealedContainer?") {
                        TargetMarketEditable = "TM_IsproductaliquidinDoubleSealedContain";
                    }
                    if (TargetMarketEditable == "TM_IsTheProductLiquidInDoubleSealContainer?") {
                        TargetMarketEditable = "TM_IsTheProductLiquidInDoubleSealContain";
                    }
                    var tmAttrValue = approvedObj.getValue(TargetMarketEditable).getSimpleValue();
                    var afterDotRemovedValue = utilbase.removeLastDots(tmAttrValue);
				if(node.getValue("GlobalRegion").getSimpleValue() == "NA" || node.getValue("GlobalRegion").getSimpleValue() == "LA"){
                    	eachObject.getValue(EachAttributeID.getID()).setSimpleValue(afterDotRemovedValue);
				}
                    return true;
                });
                      
                	   eachObject.getValue("DiaperNappyBabyweight").setSimpleValue(approvedObj.getValue("DiaperNappyBabyweight").getSimpleValue());
                	   eachObject.getValue("DiaperNappy Size").setSimpleValue(approvedObj.getValue("DiaperNappy Size").getSimpleValue()); //Added as part of RITM6576747
                	   eachObject.getValue("KitBOM").setSimpleValue(approvedObj.getValue("KitBOM").getSimpleValue())
                //CopyDerivationAttrValueFromTMtoEach(node, manager, eachObject, approvedObj, logger);
            })

        })
    }
}

/**
 * Aravinth
 * Derivation attribute copy logic
 **/
function CopyDerivationAttrValueFromTMtoEach(node, manager, eachObject, approvedObject, logger) {
    var eachDerivationAttributeGroupId = utilbase.getAttributeSetFromAttributeGroup("PIM_AGR_POA_Derivation", manager, logger);
    eachDerivationAttributeGroupId.forEach(function (EachDerivationAttributeID) {
        var TMDerivationAttribute = "TM_" + EachDerivationAttributeID.getID();
        var tmDerivationAttrValue = approvedObject.getValue(TMDerivationAttribute).getSimpleValue();
        var afterDotRemovedDerivationValue = utilbase.removeLastDots(tmDerivationAttrValue);
        if (node.getValue("GlobalRegion").getSimpleValue() == "NA" || node.getValue("GlobalRegion").getSimpleValue() == "LA") {
            eachObject.getValue(EachDerivationAttributeID.getID()).setSimpleValue(afterDotRemovedDerivationValue);
        }
        return true;
    });
}


function populateAttributesAtPackagingLevel(currentObject,manager,newPackage,fpc,childItem,logger){
	var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	var contextCountry=currentObject.getValue("Country_TM").getSimpleValue();
	var globalContext = lookupTable.getLookupTableValue("GlobalContext",contextCountry);
	var allContext=getGlobalContext(globalContext);
	for each(var allContext1 in allContext){	
		manager.executeInContext(allContext1, function(demanager){
			var newPackageEng = demanager.getObjectFromOtherManager(newPackage);
			tmContext1Obj = demanager.getObjectFromOtherManager(currentObject);
			fpcContext1Obj = demanager.getObjectFromOtherManager(fpc);
			var approvedNodePick = demanager.executeInWorkspace("Approved", function(manager1){
				var approvedfpcObj = manager1.getObjectFromOtherManager(fpcContext1Obj);
				//FPC context specific attributes
				populateValuesForAttributes(manager1,fpcContext1Obj,newPackageEng,"Packaging_Hierarchy_FPC_Context_Specific");
				//TM context specific attributes
				populateValuesForAttributes(manager1,tmContext1Obj,newPackageEng,"Packaging_Hierarchy_TM_Context_Specific");
				
				// @Aravinth --> Artwork
                if (newPackageEng.getObjectType().getID() == "Each") {
                    CopyAttrValueFromTMtoEach(currentObject, manager, newPackageEng, logger);
					copyIngDCValuesFromTMtoEach(currentObject, manager, "PIM_FC_Data_Container", "PIM_AGR_Ingredient", newPackageEng, logger);
					copyDCValuesFromTMtoEach(currentObject, manager, "DC_Battery_Data", "PIM_AGR_Battery", newPackageEng, logger);
                }
				
				//@Aravinth --> Artwork - INC13797284
                if (newPackageEng.getObjectType().getID() == "Case") {
                    CopyAttrValueFromTMtoEach(currentObject, manager, newPackageEng, logger);
                }
			})
		})
	}
	var approvedFPCObject = getApprovedNode(manager,fpc);
	//for populating Brick id and Brick name at packaging level
	newPackage.getValue("BrickID").setSimpleValue(fpc.getParent().getID());
	newPackage.getValue("BrickName").setSimpleValue(fpc.getParent().getName());
	//For getting FPC attributes
	populateValuesForAttributes(manager,fpc,newPackage,"Packaging_Hierarchy_FPC_attributes");
	//For getting TM attributes
	populateValuesForAttributes(manager,currentObject,newPackage,"Packaging_Hierarchy_TM_Attributes");
	// @Aravinth --> Artwork
    if (newPackage.getObjectType().getID() == "Each") {
        CopyAttrValueFromTMtoEach(currentObject, manager, newPackage, logger)
		copyIngDCValuesFromTMtoEach(currentObject, manager, "PIM_FC_Data_Container", "PIM_AGR_Ingredient", newPackage, logger);
		copyDCValuesFromTMtoEach(currentObject, manager, "DC_Battery_Data", "PIM_AGR_Battery", newPackage, logger);
    }
    //@Aravinth --> Artwork - INC13797284
    if (newPackage.getObjectType().getID() == "Case") {
        CopyAttrValueFromTMtoEach(currentObject, manager, newPackage, logger);
    }
	//to populate lifeCycledates
	//var salesarea = newPackage.getValue("GTINSalesArea").getSimpleValue();
	var idArray = newPackage.getID().split("_");
	var salesarea = idArray[1];
    //SS-24166 getmethod to querymethod replacement
    //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
    var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
    //var lifeCycleRefsObj =currentObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
    var lifeCycleRefsObj = currentObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
	var lifeCycleValue;
	var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	if(salesarea != "XL0402"){
		var globalLifeCycleValue = lookupTable.getLookupTableValue("GlobalSalesAreaLU",salesarea);
	}	
	else{
		var globalLifeCycleValue =newPackage.getValue("Country_TM").getSimpleValue();
	}
	for each (lifeCycleRefObj in lifeCycleRefsObj){
		if(lifeCycleRefObj.getClassification().getID() == globalLifeCycleValue){
			//Copy the lifecycle dates to packaging level
			newPackage.getValue("LaunchAuthorization").setSimpleValue(lifeCycleRefObj.getValue("LaunchAuthorization").getSimpleValue());
			newPackage.getValue("CurrentLifecycleStage").setSimpleValue(lifeCycleRefObj.getValue("CurrentLifecycleStage").getSimpleValue());
			newPackage.getValue("LifeCycleStage1").setSimpleValue(lifeCycleRefObj.getValue("LifeCycleStage1").getSimpleValue());
			newPackage.getValue("LifeCycleStage2").setSimpleValue(lifeCycleRefObj.getValue("LifeCycleStage2").getSimpleValue());
			newPackage.getValue("LifeCycleStage3").setSimpleValue(lifeCycleRefObj.getValue("LifeCycleStage3").getSimpleValue());
			newPackage.getValue("LifeCycleStage4").setSimpleValue(lifeCycleRefObj.getValue("LifeCycleStage4").getSimpleValue());
			newPackage.getValue("LifeCycleStage5").setSimpleValue(lifeCycleRefObj.getValue("LifeCycleStage5").getSimpleValue());
			newPackage.getValue("LifeCycleStage6").setSimpleValue(lifeCycleRefObj.getValue("LifeCycleStage6").getSimpleValue());
			newPackage.getValue("LifeCycleStage7").setSimpleValue(lifeCycleRefObj.getValue("LifeCycleStage7").getSimpleValue());
			
		}
	}
	//For Populating Sales Area grouping reference attributes at Packaging level
	var packageID = newPackage.getID();
	var temp = packageID.split("_");
	var packageSalesArea = temp[1];
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaRefType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
    //var salesAreaRefs =currentObject.getClassificationProductLinks(salesAreaRefType).toArray();
    var salesAreaRefs = currentObject.queryClassificationProductLinks(salesAreaRefType).asList("20000").toArray();
	for(var k=0;k<salesAreaRefs.length;k++){
		var tmSalesIDCheck = salesAreaRefs[k].getClassification().getID();
		var splitTmSalesID=tmSalesIDCheck.split("_");
		var tmSalesID="";
		for each(var splitTmSalesID1 in splitTmSalesID){			
			tmSalesID=tmSalesID+splitTmSalesID1;
		}		
		if(tmSalesID==packageSalesArea){
			var currentReference = salesAreaRefs[k];
		}
	}
	var salesAttributeHome = manager.getAttributeGroupHome().getAttributeGroupByID("PackagingSalesAreaGroupingMetaData");
	var salesAreaAttributes = salesAttributeHome.getAttributes();
	var it = salesAreaAttributes.iterator();
	while ( it.hasNext() ){
		var attribute = it.next();
		newPackage.getValue(attribute.getID()).setSimpleValue(currentReference.getValue(attribute.getID()).getSimpleValue());
	}
	//For getting UOM Attributes
	populateValuesForAttributes(manager,childItem,newPackage,"Packaging_Hierarchy_UOM_Attributes");
	var approvedFpcObj = getApprovedNode(manager,fpc);
	//Added by Anusha as part of CR For Populating Net Weight based on BaseUoM
	var baseUom = approvedFpcObj.getValue("BaseUoM").getSimpleValue();
	var objectType = newPackage.getObjectType().getID();
	if((baseUom == "CS" && objectType == "Case") || (baseUom == "IT" && objectType == "Each") || (baseUom == "PL" && objectType == "Pallet")){
		newPackage.getValue("NetWeight_Meteric").setSimpleValue(approvedFpcObj.getValue("NetWeight_Meteric").getSimpleValue());
		newPackage.getValue("NetWeight_Imperial").setSimpleValue(approvedFpcObj.getValue("NetWeight_Imperial").getSimpleValue());
		newPackage.getValue("NetWeight_Metric_g").setSimpleValue(approvedFpcObj.getValue("NetWeight_Metric_g").getSimpleValue());
		newPackage.getValue("NetWeight_Metric_kg").setSimpleValue(approvedFpcObj.getValue("NetWeight_Metric_kg").getSimpleValue());
	}
	else{
		newPackage.getValue("NetWeight_Meteric").setSimpleValue("");
		newPackage.getValue("NetWeight_Imperial").setSimpleValue("");
		newPackage.getValue("NetWeight_Metric_g").setSimpleValue("");
		newPackage.getValue("NetWeight_Metric_kg").setSimpleValue("");
	}
 }
 /*@Author Akhil Reddy
 * populateCustomers function copies the customer id's at fpc to customer reference to PKG_TM_Reference level
*/
 function populateCustomers(newPackage,targetMarket,manager){
 	var count=0;
 	var productStatusValue = newPackage.getValue("GTINStatus").getSimpleValue();
	var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
    //SS-23684 getmethod to querymethod replacement
    //var refs =newPackage.getReferences(referenceType).toArray();
    var refs = newPackage.queryReferences(referenceType).asList("20000").toArray();
	for(var i=0; i<refs.length;i++){
		var refTargetMarket = refs[i].getTarget();
		if(targetMarket.getID()==refTargetMarket.getID()){
			if(productStatusValue!=null){
				refs[i].getValue("GTINStatus").setSimpleValue(productStatusValue);
				if(productStatusValue.match("Consumer")){
					refs[i].getValue("ConsumerMarket").setSimpleValue("Yes");
				}
				else{
					refs[i].getValue("ConsumerMarket").setSimpleValue("No");
				}
			}
		}		
	}
}
/*@Author Akhil Reddy
*To check Consumer Market eligibility
*/
function checkConsumerMarketEligibility(targetMarket,groupName,manager,logger){
	//logger.info("Start checkConsumerMarketEligibility");
	var eligibility =0;
	var country = targetMarket.getValue("Country_TM").getSimpleValue();
	var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	var context = lookupTable.getLookupTableValue("GlobalContext",country);
	var allContext=getGlobalContext(context);
	for each(var allContext1 in allContext){
		manager.executeInContext(allContext1, function(manager){
			var englishTM = manager.getObjectFromOtherManager(targetMarket);
			var eSufficiency = englishTM.getValue("eContentReadiness").getSimpleValue();
			if(eSufficiencyDateCheck(englishTM,groupName)){
				//logger.info("eligibility++");
				eligibility++;
			}
		})
	}
	if(country!="PR" && eligibility>0){
		return true;
	}
	else{
		return false;
	}
	function eSufficiencyDateCheck(node,groupName){
		if(groupName == "US61" || groupName == "CA01"){
			var firstDate = node.getValue("PGPeSufficiencyDate").getSimpleValue();
			var updateDate = node.getValue("PGPUpdateeSufficiencyDate").getSimpleValue();
			var removedDate = node.getValue("PGPRemoveDate").getSimpleValue();
		}
		else{
			var firstDate = node.getValue("eSufficiencyDate").getSimpleValue();
			var updateDate = node.getValue("UpdateeSufficiencyDate").getSimpleValue();
			var removedDate = node.getValue("RemoveDate").getSimpleValue();
		}
		if(firstDate!=null && updateDate==null && removedDate==null){
			return true;
		}
		else if(firstDate!=null && removedDate!=null && updateDate!=null){
			if(updateDate>removedDate){
				return true;
			}
		}
		else if(firstDate!=null && updateDate!=null && removedDate == null){
			return true;			
		}
		return false;
	}
	//logger.info("End checkConsumerMarketEligibility");
}
/*@Author Anandhi
 * populatefututeInMarket status in sales area reference level
*/

function sortAndSetInMarketWithoutCSGTIN(lifeCycleRef,productsITIM,curObj,tmReferenceType,logger,groupName,manager,phTrigger,poaReferenceType,imageReferenceType,trigger){
	var consumerInMarketArray=new Array();
	var nationalConsumerInMarketArray=new Array();
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType =manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
	var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
	var poaEnoviaReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_POA"); // PRB0119238 
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	for each(var productITIM in productsITIM){
		var tmObject;
		var productItemObject=manager.getObjectFromOtherManager(productITIM);
		if(productItemObject.getObjectType().getID()!="FPC_TM"){
            //SS-23684 getmethod to querymethod replacement
            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
			tmObject = pkgToTMRefs[0].getTarget();
		}
		else{
			tmObject=productItemObject;
		}
		var consumerCheck = checkConsumerMarketEligibility(tmObject,groupName,manager,logger);
        //SS-23684 getmethod to querymethod replacement
        //var fpcToPOARefs=tmObject.getReferences(poaReferenceType).toArray();
        var fpcToPOARefs = tmObject.queryReferences(poaReferenceType).asList("20000").toArray();
		// start of PRB0119238
		var fpcToEnoviaPOA = tmObject.queryReferences(poaEnoviaReferenceType).asList("20000").toArray();
		var fpctopoalinkavailable = 0;
	     if (fpcToPOARefs.length > 0 || fpcToEnoviaPOA.length > 0) { // End of PRB0119238
	           fpctopoalinkavailable = 1;
	     }
		if(consumerCheck && fpctopoalinkavailable==1){
			consumerInMarketArray.push(productITIM);			
		}
		else if(consumerCheck){
			if(groupName != "US61"&& groupName != "USY1" && groupName != "US65"&& groupName != "US64"&& groupName != "CA01"&& groupName != "PR04"&& groupName != "PH0302" && groupName != "US60"&& groupName != "CA00"){
				consumerInMarketArray.push(productITIM);
			}	
		}
		//Start: PRB0121352 FPC version is incorrect
		else{
			if(productItemObject.getObjectType().getID()=="FPC_TM"){
                var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					if(targetSalesArea == groupName){
						salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Not Consumer In Market");
						//logger.info("ItemProductStatus set Not Consumer In Market: ");
					}					
				}					
			}
			else if(productItemObject.getObjectType().getID()=="Each"){
				//logger.info("Inside Each");
                var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var tmObjectPublish = pkgToTMRefs[0].getTarget();
				var statusValue = "Not Consumer In Market";
				var effectedProducts = new Array();		
				productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
				effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
				for each(var effectedProduct in effectedProducts){
					effectedProduct.getValue("ItemProductStatus").setSimpleValue(statusValue);
					//logger.info("ItemProductStatus set for Each");
				}					
		        if(productItemObject.getValue("GTINStatus").getSimpleValue()=="Consumer In Market" && tmObjectPublish.getID() != curObj.getID()){
					//logger.info("phTrigger spublish: ");
					phTrigger.republish(tmObjectPublish);
				
				} 
			}
		} //End: PRB0121352 FPC version is incorrect
	}
	if(consumerInMarketArray.length == 1 && consumerInMarketArray[0].getObjectType().getID() != null){
		for each(var productITIM in productsITIM){
			var statusValue = "Consumer In Market";
			if(productITIM == consumerInMarketArray[0] ){
				var id=productITIM.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);	
				if(productItemObject.getObjectType().getID() =="FPC_TM"){
                    //SS-24166 getmethod to querymethod replacement
                    //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                    var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
						var targetSalesArea=targetSalesAreaCheck.replace("_","");
						if(targetSalesArea == groupName){
							salesAreaRef.getValue("ItemProductStatus").setSimpleValue(statusValue);
							salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
						}
					}
				}					
				else if(productItemObject.getObjectType().getID()=="Each"){
					if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer In Market"){
                        //SS-23684 getmethod to querymethod replacement
                        //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                        var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
						var pkgToTMRef =pkgToTMRefs[0];
						var tmObject1 = pkgToTMRef.getTarget();
						if(curObj.getID() != tmObject1.getID()){
							var effectedProducts = new Array();		
							productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
							effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
							for each(var effectedProduct in effectedProducts){
								updateStatus(effectedProduct,statusValue,manager,logger,trigger);
							}	
						}
						else{
                            //SS-24166 getmethod to querymethod replacement
                            //var salesAreaRefs =tmObject1.getClassificationProductLinks(salesAreaReferenceType).toArray();
                            var salesAreaRefs = tmObject1.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
							for(var j=0;j<salesAreaRefs.length;j++){
								var salesAreaRef=salesAreaRefs[j];
								var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
								var targetSalesArea=targetSalesAreaCheck.replace("_","");
								if(targetSalesArea == groupName){
									salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
									salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
									var effectedProducts = new Array();	
									effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
									for each(var effectedProduct in effectedProducts){
										effectedProduct.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
									}
								}
							}
						}									
					}
				}						
			}			
		}		
	}
	else if(consumerInMarketArray.length > 1){
		var consumerInMarketFinal=0;
		var consumerInMarketdate=0;
		var tmObject;
		var checkCustomerSpecific;
        //SS-24166 getmethod to querymethod replacement
        //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale")
        var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
		for each(var consumerInMarket in consumerInMarketArray){
			var id=consumerInMarket.getID();
			var productItemObject=manager.getProductHome().getProductByID(id);
			if(consumerInMarket.getObjectType().getID()!="FPC_TM"){
			
                //SS-23684 getmethod to querymethod replacement
                //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
			var pkgToTMRef =pkgToTMRefs[0];
				tmObject = pkgToTMRef.getTarget();
				checkCustomerSpecific=tmObject.getValue("CustomerClassificationAtTM").getSimpleValue();
			}
			else if(productItemObject.getObjectType().getID()=="FPC_TM"){
				tmObject = productItemObject;
				checkCustomerSpecific=tmObject.getValue("CustomerClassificationAtTM").getSimpleValue();
			}
			if (checkCustomerSpecific=="National"){
				nationalConsumerInMarketArray.push(consumerInMarket);
			}
		}
		if(nationalConsumerInMarketArray.length == 1 && nationalConsumerInMarketArray[0].getObjectType().getID() != null){
			for each(var productITIM in productsITIM){
				var statusValue = "Consumer In Market";
				if(productITIM == nationalConsumerInMarketArray[0] ){
					var id=productITIM.getID();
					var productItemObject=manager.getProductHome().getProductByID(id);	
					if(productItemObject.getObjectType().getID() =="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue(statusValue);
								salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
							}
						}
					}					
					else if(productItemObject.getObjectType().getID()=="Each"){
						if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer In Market"){
                            //SS-23684 getmethod to querymethod replacement
                            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
							var pkgToTMRef =pkgToTMRefs[0];
							var tmObject1 = pkgToTMRef.getTarget();
							if(curObj.getID() != tmObject1.getID()){
								var effectedProducts = new Array();		
								productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
								effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
								for each(var effectedProduct in effectedProducts){
									updateStatus(effectedProduct,statusValue,manager,logger,trigger);
								}	
							}
							else{
                                //SS-24166 getmethod to querymethod replacement
                                //var salesAreaRefs =tmObject1.getClassificationProductLinks(salesAreaReferenceType).toArray();
                                var salesAreaRefs = tmObject1.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
								for(var j=0;j<salesAreaRefs.length;j++){
									var salesAreaRef=salesAreaRefs[j];
									var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
									var targetSalesArea=targetSalesAreaCheck.replace("_","");
									if(targetSalesArea == groupName){
										salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
										salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
										var effectedProducts = new Array();	
										effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
										for each(var effectedProduct in effectedProducts){
											effectedProduct.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
										}
									}
								}
							}									
						}
					}						
				}
				else if(productITIM != nationalConsumerInMarketArray[0]){
					var id=productITIM.getID();
					var productItemObject=manager.getProductHome().getProductByID(id);
					if(productItemObject.getObjectType().getID()=="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Not Consumer In Market");
							}					
						}					
					}
					else if(productItemObject.getObjectType().getID()=="Each"){
						var statusValue = "Not Consumer In Market";
                        //SS-23684 getmethod to querymethod replacement
                        //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                        var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
						var tmObjectPublish1 = pkgToTMRefs[0].getTarget();
						productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						//Get effected products and set the status value
						var effectedProductsArray = getEffectedProducts(productItemObject,groupName,manager,logger);
						for each(var productObject in effectedProductsArray){
							productObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						}
						if(productItemObject.getValue("GTINStatus").getSimpleValue()=="Consumer In Market" && tmObjectPublish1.getID() != curObj.getID()){
							phTrigger.republish(tmObjectPublish1);
						}
					}
				}
			}
		}
		else if(nationalConsumerInMarketArray.length > 1){
			for each(var nationalConsumerInMarket in nationalConsumerInMarketArray){
				var id=nationalConsumerInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(nationalConsumerInMarket.getObjectType().getID()!="FPC_TM"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var pkgToTMRef =pkgToTMRefs[0];
					tmObject = pkgToTMRef.getTarget();
				}
				else if(productItemObject.getObjectType().getID()=="FPC_TM"){
					tmObject = productItemObject;
				}
				var lcTarget = lifeCycleRef.getClassification().getID();
                //SS-24166 getmethod to querymethod replacement
                //var itemLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                var itemLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
				for(var i=0;i<itemLifeCycleRefs.length;i++){
					var itemLifeCycleRef=itemLifeCycleRefs[i];
					var itemLifeCycleRefTarget=itemLifeCycleRef.getClassification().getID();
					if(itemLifeCycleRefTarget == lcTarget ){
						if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
							var itemLC4date=itemLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();								
						}
						else{
							var itemLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
						}
						if(consumerInMarketFinal == 0){
							consumerInMarketFinal=nationalConsumerInMarket;
							consumerInMarketdate=itemLC4date;
						}
						else{
							if(consumerInMarketdate<itemLC4date){
								consumerInMarketFinal=nationalConsumerInMarket;
								consumerInMarketdate=itemLC4date;
							}
							else if(itemLC4date==consumerInMarketdate){
								var itemFPC=productItemObject.getValue("FinishedProductCode").getSimpleValue();
								var inMarketFPC=consumerInMarketFinal.getValue("FinishedProductCode").getSimpleValue();
								if(itemFPC>inMarketFPC){
									consumerInMarketFinal=nationalConsumerInMarket;
									consumerInMarketdate=itemLC4date;
								}					
							}					
						}								
					}			
				}
			}			
		}
		else if(nationalConsumerInMarketArray.length == 0){
			for each(var consumerInMarket in consumerInMarketArray){
				var id=consumerInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(consumerInMarket.getObjectType().getID()!="FPC_TM"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
					var pkgToTMRef =pkgToTMRefs[0];
					tmObject = pkgToTMRef.getTarget();
				}
				else if(productItemObject.getObjectType().getID()=="FPC_TM"){
					tmObject = productItemObject;
				}
				var lcTarget = lifeCycleRef.getClassification().getID();
                //SS-24166 getmethod to querymethod replacement
                //var itemLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                var itemLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
				for(var i=0;i<itemLifeCycleRefs.length;i++){
					var itemLifeCycleRef=itemLifeCycleRefs[i];
					var itemLifeCycleRefTarget=itemLifeCycleRef.getClassification().getID();
					if(itemLifeCycleRefTarget == lcTarget ){
						if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
							var itemLC4date=itemLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();								
						}
						else{
							var itemLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
						}
						if(consumerInMarketFinal == 0){
							consumerInMarketFinal=consumerInMarket;
							consumerInMarketdate=itemLC4date;
						}
						else{
							if(consumerInMarketdate<itemLC4date){
								consumerInMarketFinal=consumerInMarket;
								consumerInMarketdate=itemLC4date;
							}
							else if(itemLC4date==consumerInMarketdate){
								var itemFPC=productItemObject.getValue("FinishedProductCode").getSimpleValue();
								var inMarketFPC=consumerInMarketFinal.getValue("FinishedProductCode").getSimpleValue();
								if(itemFPC>inMarketFPC){
									consumerInMarketFinal=consumerInMarket;
									consumerInMarketdate=itemLC4date;
								}					
							}					
						}								
					}			
				}
			}
		}	
		if(nationalConsumerInMarketArray.length != 1){
			for each(var consumerInMarket in consumerInMarketArray){
				var id=consumerInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(consumerInMarket==consumerInMarketFinal){
					if(productItemObject.getObjectType().getID()=="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
								salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
							}					
						}					
					}
					else if(productItemObject.getObjectType().getID()=="Each"){
						var statusValue = "Consumer In Market";
							if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer In Market"){
                            //SS-23684 getmethod to querymethod replacement
                            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
							var pkgToTMRef =pkgToTMRefs[0];
							tmObject = pkgToTMRef.getTarget();
							if(curObj.getID() != tmObject.getID()){
								var effectedProducts = new Array();		
								productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
								effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
								for each(var effectedProduct in effectedProducts){
									updateStatus(effectedProduct,statusValue,manager,logger,trigger);
								}	
							}
							else{
                                //SS-24166 getmethod to querymethod replacement
                                //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                                var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
								for(var j=0;j<salesAreaRefs.length;j++){
									var salesAreaRef=salesAreaRefs[j];
									var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
									var targetSalesArea=targetSalesAreaCheck.replace("_","");
									if(targetSalesArea == groupName){
										var effectedProducts = new Array();	
										effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
										for each(var effectedProduct in effectedProducts){
											effectedProduct.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
										}
										salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
										salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
									}
								}
							}									
						}				
					}
				}
				else{
					if(productItemObject.getObjectType().getID()=="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Not Consumer In Market");
								
							}					
						}					
					}
					else if(productItemObject.getObjectType().getID()=="Each"){
						var statusValue = "Not Consumer In Market";
                        //SS-23684 getmethod to querymethod replacement
                        //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                        var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
						var tmObjectPublish2 = pkgToTMRefs[0].getTarget();
						productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						//Get effected products and set the status value
						var effectedProductsArray = getEffectedProducts(productItemObject,groupName,manager,logger);
						for each(var productObject in effectedProductsArray){
							productObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						}
						if(productItemObject.getValue("GTINStatus").getSimpleValue()=="Consumer In Market" && tmObjectPublish2.getID() != curObj.getID()){
							phTrigger.republish(tmObjectPublish2);
						}
					}
				}
			}
			
		}				
	}
	
	var inMarketDate=0;
	var inMarket=0;
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
	var consumerInMarketDate= null;
    //SS-24166 getmethod to querymethod replacement
    //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
    var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
	for each(var productITIM in productsITIM){
		//To remove  the consumer in Market from the group
		var productITObject=manager.getObjectFromOtherManager(productITIM);
		if(productITObject.getObjectType().getID()=="FPC_TM"){
            //SS-24166 getmethod to querymethod replacement
            //var salesAreaRefs =productITObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
            var salesAreaRefs = productITObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
			for(var j=0;j<salesAreaRefs.length;j++){
				var salesAreaRef=salesAreaRefs[j];
				var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
				var targetSalesArea=targetSalesAreaCheck.replace("_","");
				if(targetSalesArea == groupName && salesAreaRef.getValue("ItemProductStatus").getSimpleValue()== "Consumer In Market"){
					var index = productsITIM.indexOf(productITIM);					
					if (index > -1) {
						if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){	var lcTarget = lifeCycleRef.getClassification().getID();
                            var lcTarget = lifeCycleRef.getClassification().getID();
                            //SS-24166 getmethod to querymethod replacement
                            //var caseLifeCycleRefs =productITObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                            var caseLifeCycleRefs = productITObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
							for each(var caseLifeCycleRef in caseLifeCycleRefs){
								var caseLifeCycleRefTarget=caseLifeCycleRef.getClassification().getID();
								if(caseLifeCycleRefTarget == lcTarget ){
									consumerInMarketDate=caseLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
								}
							}
						}
						else{
							consumerInMarketDate=productITObject.getValue("ExternalOnlineDate").getSimpleValue();
						}
						productsITIM.splice(index, 1);
					}
				}					
			}			
		}
		else{
			var packageStatus = productITObject.getValue("ItemProductStatus").getSimpleValue();
			if(packageStatus){
                //SS-23684 getmethod to querymethod replacement
                //var pkgToTMReference = productITObject.getReferences(tmReferenceType).toArray();
                var pkgToTMReference = productITObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var referenceTargetMarket = pkgToTMReference[0].getTarget();
                //SS-24166 getmethod to querymethod replacement
                //var tmSalesAreaReference = referenceTargetMarket.getClassificationProductLinks(salesAreaReferenceType).toArray();
                var tmSalesAreaReference = referenceTargetMarket.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<tmSalesAreaReference.length;j++){
					var salesAreaRef=tmSalesAreaReference[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					if(targetSalesArea == groupName){
						var salesAreaProductStatus = salesAreaRef.getValue("ProductStatus").getSimpleValue();
						// PRB0121352 FPC version is incorrect
						//if(packageStatus=="Consumer In Market" && salesAreaProductStatus == packageStatus){
						  if(packageStatus=="Consumer In Market"){
							var caseObjectIDArray = productITObject.getID().split("_");
							var fpc = caseObjectIDArray[2];
							var uomKey = "IT_"+fpc;
							var itUOMObj = manager.getNodeHome().getObjectByKey("FPC_UOM",uomKey);
							if(itUOMObj){
								if(itUOMObj.getValue("GTIN").getSimpleValue()!= null && itUOMObj.getValue("GTIN").getSimpleValue()!= ""){
                                    //SS-23684 getmethod to querymethod replacement
                                    //var pkgToTMRefs=productITObject.getReferences(tmReferenceType).toArray();
                                    var pkgToTMRefs = productITObject.queryReferences(tmReferenceType).asList("20000").toArray();
									var pkgToTMRef =pkgToTMRefs[0];
									var tmObject2 = pkgToTMRef.getTarget();
									var index = productsITIM.indexOf(productITIM);
									if (index > -1) {
										if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
											var lcTarget = lifeCycleRef.getClassification().getID();
                                            //SS-24166 getmethod to querymethod replacement
                                            //var caseLifeCycleRefs =tmObject2.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                                            var caseLifeCycleRefs = tmObject2.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
											for each(var caseLifeCycleRef in caseLifeCycleRefs){
												var caseLifeCycleRefTarget=caseLifeCycleRef.getClassification().getID();
												if(caseLifeCycleRefTarget == lcTarget ){
													consumerInMarketDate=caseLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
												}
											}
										}
										else{
											consumerInMarketDate=tmObject2.getValue("ExternalOnlineDate").getSimpleValue();
										}
										productsITIM.splice(index, 1);
									}
								}
							}
						}
					}
				}
			}
		}		
	}
	for each(var productITIM in productsITIM){
		var id=productITIM.getID();
		var productITObject=manager.getProductHome().getProductByID(id);
		if(productITObject.getObjectType().getID()!="FPC_TM"){
            //SS-23684 getmethod to querymethod replacement
            //var pkgToTMRefs=productITObject.getReferences(tmReferenceType).toArray();
            var pkgToTMRefs = productITObject.queryReferences(tmReferenceType).asList("20000").toArray();
			var pkgToTMRef =pkgToTMRefs[0];
			var tmObject = pkgToTMRef.getTarget();
		}
		else if(productITObject.getObjectType().getID()=="FPC_TM"){
			var tmObject = productITObject;
		}
		var lcTarget = lifeCycleRef.getClassification().getID();
        //SS-24166 getmethod to querymethod replacement
        //var caseLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
        var caseLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
		for(var i=0;i<caseLifeCycleRefs.length;i++){
			var caseLifeCycleRef=caseLifeCycleRefs[i];
			var caseLifeCycleRefTarget=caseLifeCycleRef.getClassification().getID();
			if(caseLifeCycleRefTarget == lcTarget ){
				if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
					var caseLC4date=caseLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();						
				}
				else{
					var caseLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
				}
				if(inMarket == 0){
					inMarket=productITIM;
					inMarketDate=caseLC4date;
				}
				else{
					if(inMarketDate<caseLC4date){
						inMarket=productITIM;
						inMarketDate=caseLC4date;
					}
					else if(caseLC4date==inMarketDate){
						var caseFPC=productITObject.getValue("FinishedProductCode").getSimpleValue();
						var inMarketFPC=inMarket.getValue("FinishedProductCode").getSimpleValue();
						if(caseFPC>inMarketFPC){
							inMarket=productITIM;
							inMarketDate=caseLC4date;
						}					
					}					
				}								
			}			
		}		
	}
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
	var inMarketDateCheck = false;
	if(consumerInMarketDate!=null){
		inMarketDateCheck = false;
	}
	else{
		inMarketDateCheck = true;
	}
	for each(var productITIM in productsITIM){
		var id=productITIM.getID();
		var productITObject=manager.getProductHome().getProductByID(id);
		if(productITIM==inMarket&&inMarketDateCheck){
			if(productITObject.getObjectType().getID()=="FPC_TM"){
                //SS-24166 getmethod to querymethod replacement
                //var salesAreaRefs =productITObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                var salesAreaRefs = productITObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					if(targetSalesArea == groupName && salesAreaRef.getValue("ItemProductStatus").getSimpleValue()!= "Consumer In Market"){
						salesAreaRef.getValue("ItemProductStatus").setSimpleValue("In Market");
						salesAreaRef.getValue("ProductStatus").setSimpleValue("In Market");
					}					
				}					
			}
			else if(productITObject.getObjectType().getID()=="Each"){
				var statusValue = "In Market";
				var validITUOM = false;
				var caseObjectIDArray = productITObject.getID().split("_");
				var fpc = caseObjectIDArray[2];
				var uomKey = "IT_"+fpc;
				var itUOMObj = manager.getNodeHome().getObjectByKey("FPC_UOM",uomKey);
				if(itUOMObj){
					if(itUOMObj.getValue("GTIN").getSimpleValue()!= null && itUOMObj.getValue("GTIN").getSimpleValue()!= ""){
						validITUOM = true;
					}
				}
				var itProductStatus = productITObject.getValue("ItemProductStatus").getSimpleValue();
				if(productITObject.getValue("ItemProductStatus").getSimpleValue()!= "Consumer In Market"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productITObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productITObject.queryReferences(tmReferenceType).asList("20000").toArray();
					var pkgToTMRef =pkgToTMRefs[0];
					var tmObject = pkgToTMRef.getTarget();
					if(curObj.getID() != tmObject.getID()){
						var effectedProducts = new Array();		
						productITObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
						effectedProducts = getEffectedProducts(productITObject,groupName,manager,logger);
						for each(var effectedProduct in effectedProducts){
							updateStatus(effectedProduct,statusValue,manager,logger,phTrigger);
						}	
					}
					else{
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
							}
						}
					}									
				}
				else if (itProductStatus == "Consumer In Market"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgTMReference = productITObject.getReferences(tmReferenceType).toArray();
                    var pkgTMReference = productITObject.queryReferences(tmReferenceType).asList("20000").toArray();
					var targetMarketObject = pkgTMReference[0].getTarget();
                    //SS-24166 getmethod to querymethod replacement
                    //var tmSalesAreaReference = referenceTargetMarket.getClassificationProductLinks(salesAreaReferenceType).toArray();
                    var tmSalesAreaReference = referenceTargetMarket.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
					for(var j=0;j<tmSalesAreaReference.length;j++){
						var salesAreaRef=tmSalesAreaReference[j];
						var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
						var targetSalesArea=targetSalesAreaCheck.replace("_","");
						if(targetSalesArea == groupName){
							var TMProductStatus = salesAreaRef.getValue("ProductStatus").getSimpleValue();
							if (TMProductStatus != itProductStatus){
                                //SS-23684 getmethod to querymethod replacement
                                //var pkgToTMRefs=productITObject.getReferences(tmReferenceType).toArray();
                                var pkgToTMRefs = productITObject.queryReferences(tmReferenceType).asList("20000").toArray();
								var pkgToTMRef =pkgToTMRefs[0];
								var tmObject = pkgToTMRef.getTarget();
								if(curObj.getID() != tmObject.getID()){
									var effectedProducts = new Array();		
									productITObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
									effectedProducts = getEffectedProducts(productITObject,groupName,manager,logger);
									for each(var effectedProduct in effectedProducts){
										updateStatus(effectedProduct,statusValue,manager,logger,phTrigger);
									}	
								}
								else{
                                    //SS-24166 getmethod to querymethod replacement
                                    //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                                    var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
									for(var j=0;j<salesAreaRefs.length;j++){
										var salesAreaRef=salesAreaRefs[j];
										var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
										var targetSalesArea=targetSalesAreaCheck.replace("_","");
										if(targetSalesArea == groupName){
											salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
										}
									}
								}
							}
						}
					}
				}
			}
		}
		else{
			if(productITObject.getObjectType().getID()=="FPC_TM"){
                //SS-24166 getmethod to querymethod replacement
                //var salesAreaRefs =productITObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                var salesAreaRefs = productITObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					//var targetSalesArea=splitTargetSalesArea[0];
					if(targetSalesArea == groupName){
						salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Shipping In Market");	
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Shipping In Market");
					}					
				}					
			}
			else if(productITObject.getObjectType().getID()=="Each"){
				var statusValue = "Shipping In Market";
                //SS-23684 getmethod to querymethod replacement
                //var pkgToTMRefs=productITObject.getReferences(tmReferenceType).toArray();
                var pkgToTMRefs = productITObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var pkgToTMRef =pkgToTMRefs[0];
				var tmObject = pkgToTMRef.getTarget();
				if(curObj.getID() != tmObject.getID()){
					var effectedProducts = new Array();	
					effectedProducts = getEffectedProducts(productITObject,groupName,manager,logger);
					for each(var effectedProduct in effectedProducts){
						updateStatus(effectedProduct,statusValue,manager,logger,phTrigger);
					}	
				}
				else{
                    //SS-24166 getmethod to querymethod replacement
                    //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                    var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
						var targetSalesArea=targetSalesAreaCheck.replace("_","");
						if(targetSalesArea == groupName){
							salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
						}
					}
				}
				productITObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
				productITObject.getValue("ProductStatus").setSimpleValue(statusValue);
			}
		}
	}
}

function populateFutureStatus(salesAreaRef1,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger){
	//Check If it is Consumer Future In Market or not and populate the values
	//Check Marketing Approved and EContent Publication Date
	//Check if Product status are modified are not
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var uomReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_UOM_Reference");
	var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
   //commented as part of SS-24338 var fcReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_FC");
	var imageReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("ProductImage");
    //SS-24166 getmethod to querymethod replacement
    //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
    var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaRefs =curObj.getClassificationProductLinks(salesAreaReferenceType).toArray();
    var salesAreaRefs = curObj.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
	var parentFPC=curObj.getParent();
    //SS-23684 getmethod to querymethod replacement
    //var fpcToPOARefs=parentFPC.getReferences(poaReferenceType).toArray();
    var fpcToPOARefs = parentFPC.queryReferences(poaReferenceType).asList("20000").toArray();
	//To find the similar products whose PIMID ends with "FIM"
	var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
	var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
	for each(var salesAreaRef in salesAreaRefs){
		if(salesAreaRef1.getClassification().getID() ==salesAreaRef.getClassification().getID()){	
			var groupNameCheck = salesAreaRef.getClassification().getID();
			var groupName=groupNameCheck.replace("_","");
            //SS-24995 getmethod to querymethod replacement
            //var children = curObj.getParent().getChildren().toArray();
            var children = curObj.getParent().queryChildren();
			var itemCheck =0;
			var caseCheck =0;
			var itemCaseArray = new Array();
            //SS-24995 getmethod to querymethod replacement
            //for each(var childObjectUOM in children) {
            children.forEach(function (childObjectUOM) {
				if(childObjectUOM.getObjectType().getID()=="FPC_UOM"){
					var uomType = childObjectUOM.getValue("PackagingUOMType").getSimpleValue();			
					if(uomType=="Each"){
						//var itemObject =childObjectUOM;
						itemCaseArray.push(childObjectUOM);
						var itemgtin=childObjectUOM.getValue("GTIN").getSimpleValue();				
						if(itemgtin != null && itemgtin != ""){
							itemCheck++;					
						}				
					}
					if(uomType=="Case"){
						var caseObject =childObjectUOM;
						var casegtin=childObjectUOM.getValue("GTIN").getSimpleValue();
						if(casegtin != null && casegtin != ""){
							caseCheck++;
						}				
					}			
				}
                return true; //added return as part of SS-24995
            });
			if(salesAreaRef.getValue("ProductStatus").getSimpleValue()== "In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Shipping In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Consumer In Market" ){
				//To find the similar products whose PIMID ends with "IM"
                //SS-24995 getmethod to querymethod replacement
                //for each(var childItem in children){
                children.forEach(function (childItem) {
                    if (childItem.getObjectType().getID() == "FPC_UOM") {
                        var gtin = childItem.getValue("GTIN").getSimpleValue();
                        //RITM6167607 getApproveStatus to getApprovalStatus replacement
                        //if(gtin != null &&  childItem.getApproveStatus() != "Not Approved"&&(childItem.getValue("PackagingUOMType").getSimpleValue()=="Case"||childItem.getValue("PackagingUOMType").getSimpleValue()=="Each")){
                        if (gtin != null && childItem.getApprovalStatus() != "Not Approved" && (childItem.getValue("PackagingUOMType").getSimpleValue() == "Case" || childItem.getValue("PackagingUOMType").getSimpleValue() == "Each")) {
							var objectID = gtin+"_"+groupName+"_"+"IM";
							var fpcCode=curObj.getValue("FinishedProductCode").getSimpleValue();
							if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Case"){
								var currentCase=gtin+"_"+groupName+"_"+fpcCode;
								var currentCaseObject=manager.getProductHome().getProductByID(currentCase);
							}
							if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
								var currentEach=gtin+"_"+groupName+"_"+fpcCode;
								var currentEachObject=manager.getProductHome().getProductByID(currentEach);
							}
							var  allProductsIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,objectID)).asList(100).toArray();
							//To get packages only with case object type
							var productsCaseIM = new Array();
							var productsITIM=new Array();
							for each(var packObject in allProductsIM){
								if(packObject.getObjectType().getID()=="Case"){
									productsCaseIM.push(packObject);
								}
							}
							for each(var packObject in allProductsIM){
								if(packObject.getObjectType().getID()=="Each"){
									productsITIM.push(packObject);
								}
							}
							if(salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Consumer In Market"){
								for each(var productITIM in productsITIM){
									var id=productITIM.getID();
									if(currentEachObject !=null && id == currentEachObject.getID()){
										var index = productsITIM.indexOf(productITIM);
										if (index > -1) {
											productsITIM.splice(index, 1);
										}
									}
								}
								if(productsITIM.length >= 1){
									sortAndSetConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj);
								}
								if(productsITIM.length >= 1 && caseCheck == 0){
									sortAndSetInMarketWithoutCSGTIN(lifeCycleRef,productsITIM,curObj,tmReferenceType,logger,groupName,manager,phTrigger,poaReferenceType,imageReferenceType,trigger);
								}								
							}
							if(salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Shipping In Market"||salesAreaRef.getValue("ProductStatus").getSimpleValue()== "In Market"){
								for each(var productCaseIM in productsCaseIM){
									var id=productCaseIM.getID();
									if(currentCaseObject !=null && id == currentCaseObject.getID()){
										var index = productsCaseIM.indexOf(productCaseIM);
										if (index > -1) {
											productsCaseIM.splice(index, 1);
										}
									}
								}
								if(productsCaseIM.length >= 1){	
									sortAndSetInMarket(lifeCycleRef,productsCaseIM,curObj,tmReferenceType,currentCaseObject,logger,groupName,manager,trigger,curObj);
								}
								else{
									if(caseCheck ==0 && productsITIM.length >= 1){
										sortAndSetInMarketWithoutCSGTIN(lifeCycleRef,productsITIM,curObj,tmReferenceType,logger,groupName,manager,phTrigger);
									}
								}								
							}					
						}
					}
                    return true; //added return as part of SS-24995
                });
			}
			if(caseCheck==1 && itemCheck==0 ){
				//No Item object is there so put as directly Future In Market
				salesAreaRef.getValue("ProductStatus").setSimpleValue("Future In Market");
			}
			for each(var childItem in itemCaseArray){
				if(childItem.getObjectType().getID()=="FPC_UOM"){
					var gtin = childItem.getValue("GTIN").getSimpleValue();						
                    //RITM6167607 getApproveStatus to getApprovalStatus replacement
                    //if(gtin != null &&  childItem.getApproveStatus() != "Not Approved"&&(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each")){
                    if (gtin != null && childItem.getApprovalStatus() != "Not Approved" && (childItem.getValue("PackagingUOMType").getSimpleValue() == "Each")) {
						var objectID = gtin+"_"+groupName+"_"+"FIM";
						var fpcCode=curObj.getValue("FinishedProductCode").getSimpleValue();
						if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
							var currentEach=gtin+"_"+groupName+"_"+fpcCode;
							var currentEachObject=manager.getProductHome().getProductByID(currentEach);
						}
						var  allProductsIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,objectID)).asList(100).toArray();
						//To get packages only with case object type
						var productsITIM=new Array();
						for each(var packObject in allProductsIM){
							if(packObject.getObjectType().getID()=="Each"){
								productsITIM.push(packObject);
							}
						}
						var objectFlag=true;
						if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
							for each(var productITIM in productsITIM){
								var id=productITIM.getID();
								if(currentEachObject !=null && id == currentEachObject.getID()){
									objectFlag=false;
								}
							}
							if(objectFlag && currentEachObject !=null){
								productsITIM.push(currentEachObject);
							}
							else if(objectFlag){
								productsITIM.push(curObj);
							}
							if(productsITIM.length >= 1){
								sortAndSetFutureConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj);
							}
						}						
					}
				}
			}
		}
	}
}

/*@Author Anandhi
 * Sort and Set Future in sales area reference level
*/
function sortAndSetFutureConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj){
	var consumerFutureInMarketArray=new Array();
	var nationalConsumerFIMArray=new Array();
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
	var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
	var poaEnoviaReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_POA"); // PRB0119238
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	for each(var productITIM in productsITIM){
		var tmObject;
		var productItemObject = manager.getObjectFromOtherManager(productITIM);
		if(productItemObject.getObjectType().getID()!="FPC_TM"){
            //SS-23684 getmethod to querymethod replacement
            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
			tmObject = pkgToTMRefs[0].getTarget();
		}else{
			tmObject=productItemObject;
		}
		var consumerCheck = checkConsumerMarketEligibility(tmObject,groupName,manager,logger);
		var marketApprovalStatus=tmObject.getValue("MarketingApproved").getSimpleValue();
		//var econtentDate=tmObject.getValue("EcontentPublicationDate").getSimpleValue();
        //SS-23684 getmethod to querymethod replacement
        //var fpcToPOARefs=tmObject.getReferences(poaReferenceType).toArray();
        var fpcToPOARefs = tmObject.queryReferences(poaReferenceType).asList("20000").toArray();
		 //Start of PRB0119238
	     var fpcToEnoviaPOA = tmObject.queryReferences(poaEnoviaReferenceType).asList("20000").toArray();
	     var fpctopoalinkavailable = 0;
	     if(fpcToPOARefs.length > 0 || fpcToEnoviaPOA.length > 0) { // End of PRB0119238
	          fpctopoalinkavailable = 1;
	     }
		if(consumerCheck && fpctopoalinkavailable==1){
			consumerFutureInMarketArray.push(productITIM);			
		}
		else if(consumerCheck && (groupName != "US61"&& groupName != "USY1" && groupName != "US65"&& groupName != "US64"&& groupName != "CA01"&& groupName != "PR04"&& groupName != "PH0302" && groupName != "US60"&& groupName != "CA00")){
			consumerFutureInMarketArray.push(productITIM);
		}
		else{
			if(productItemObject.getObjectType().getID()=="FPC_TM"){
                //SS-24166 getmethod to querymethod replacement
                //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					if(targetSalesArea == groupName){
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Future In Market");
					}					
				}					
			}
			else if(productItemObject.getObjectType().getID()=="Each"){
				var statusValue = "Future In Market";
				if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Future In Market"){
					if(curObj.getID()!= tmObject.getID()){
						var effectedProducts = new Array();		
						productItemObject.getValue("ProductStatus").setSimpleValue(statusValue);					
						effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
						for each(var effectedProduct in effectedProducts){
							updateStatus(effectedProduct,statusValue,manager,logger,trigger);
						}	
					}
					else{
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ProductStatus").setSimpleValue("Future In Market");
							}
						}
					}								
				}			
			}
		}
	}
	if(consumerFutureInMarketArray.length == 1 && consumerFutureInMarketArray[0].getObjectType().getID() != null){
		for each(var productITIM in productsITIM){
			var statusValue = "Consumer Future In Market";
			if(productITIM == consumerFutureInMarketArray[0] ){
				var id=productITIM.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);	
				if(productItemObject.getObjectType().getID() =="FPC_TM"){
                    //SS-24166 getmethod to querymethod replacement
                    //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                    var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
						var targetSalesArea=targetSalesAreaCheck.replace("_","");
						if(targetSalesArea == groupName){
							salesAreaRef.getValue("ItemProductStatus").setSimpleValue(statusValue);
							salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
						}
					}
				}					
				else if(productItemObject.getObjectType().getID()=="Each"){
					if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer Future In Market"){
                        //SS-23684 getmethod to querymethod replacement
                        //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                        var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
						var pkgToTMRef =pkgToTMRefs[0];
						var tmObject1 = pkgToTMRef.getTarget();
						if(curObj.getID() != tmObject1.getID()){
							var effectedProducts = new Array();		
							productItemObject.getValue("ProductStatus").setSimpleValue(statusValue);					
							effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
							for each(var effectedProduct in effectedProducts){
								updateStatus(effectedProduct,statusValue,manager,logger,trigger);
							}	
						}
						else{
                            //SS-24166 getmethod to querymethod replacement
                            //var salesAreaRefs =tmObject1.getClassificationProductLinks(salesAreaReferenceType).toArray();
                            var salesAreaRefs = tmObject1.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
							for(var j=0;j<salesAreaRefs.length;j++){
								var salesAreaRef=salesAreaRefs[j];
								var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
								var targetSalesArea=targetSalesAreaCheck.replace("_","");
								if(targetSalesArea == groupName){
									salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer Future In Market");
								}
							}
						}			
					}
				}						
			}			
		}		
	}
	else if(consumerFutureInMarketArray.length > 1){
		var consumerFutureInMarketFinal=0;
		var consumerFutureInMarketdate=0;
		var tmObject;
		var checkCustomerSpecific;		
        //SS-24166 getmethod to querymethod replacement
        //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
        var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
		for each(var consumerFutureInMarket in consumerFutureInMarketArray){
			
			var id=consumerFutureInMarket.getID();
			var productItemObject=manager.getProductHome().getProductByID(id);
			if(consumerFutureInMarket.getObjectType().getID()!="FPC_TM"){
                //SS-23684 getmethod to querymethod replacement
                //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
			var pkgToTMRef =pkgToTMRefs[0];
				tmObject = pkgToTMRef.getTarget();
				checkCustomerSpecific=tmObject.getValue("CustomerClassificationAtTM").getSimpleValue();
			}
			else if(productItemObject.getObjectType().getID()=="FPC_TM"){
				tmObject = productItemObject;
				checkCustomerSpecific=tmObject.getValue("CustomerClassificationAtTM").getSimpleValue();
			}
			if (checkCustomerSpecific=="National"){
				nationalConsumerFIMArray.push(consumerFutureInMarket);
				
			}
		}
		if(nationalConsumerFIMArray.length == 1 && nationalConsumerFIMArray[0].getObjectType().getID() != null){
			for each(var productITIM in productsITIM){
				var statusValue = "Consumer Future In Market";
				if(productITIM == nationalConsumerFIMArray[0] ){
					var id=productITIM.getID();
					var productItemObject=manager.getProductHome().getProductByID(id);	
					if(productItemObject.getObjectType().getID() =="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue(statusValue);
								salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
								
							}
						}
					}					
					else if(productItemObject.getObjectType().getID()=="Each"){
						if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer Future In Market"){
                            //SS-23684 getmethod to querymethod replacement
                            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
							var pkgToTMRef =pkgToTMRefs[0];
							var tmObject1 = pkgToTMRef.getTarget();
							if(curObj.getID() != tmObject1.getID()){
								var effectedProducts = new Array();		
								productItemObject.getValue("ProductStatus").setSimpleValue(statusValue);					
								effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
								for each(var effectedProduct in effectedProducts){
									updateStatus(effectedProduct,statusValue,manager,logger,trigger);
								}	
							}
							else{
                                //SS-24166 getmethod to querymethod replacement
                                //var salesAreaRefs =tmObject1.getClassificationProductLinks(salesAreaReferenceType).toArray();
                                var salesAreaRefs = tmObject1.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
								for(var j=0;j<salesAreaRefs.length;j++){
									var salesAreaRef=salesAreaRefs[j];
									var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
									var targetSalesArea=targetSalesAreaCheck.replace("_","");
									
									if(targetSalesArea == groupName){
										salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer Future In Market");
									}
								}
							}		
						}
					}						
				}
				else if(productITIM != nationalConsumerFIMArray[0]){
					var id=productITIM.getID();
					var productItemObject=manager.getProductHome().getProductByID(id);
					var statusValue = "Future In Market";
					if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Future In Market"){
						if(productItemObject.getObjectType().getID()!="FPC_TM"){
                            //SS-23684 getmethod to querymethod replacement
                            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
							var pkgToTMRef =pkgToTMRefs[0];
							tmObject = pkgToTMRef.getTarget();
							}
						else if(productItemObject.getObjectType().getID()=="FPC_TM"){
							tmObject = productItemObject;
						}
						if(curObj.getID() != tmObject.getID()){
							var effectedProducts = new Array();	
							productItemObject.getValue("ProductStatus").setSimpleValue(statusValue);					
							effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
							for each(var effectedProduct in effectedProducts){
								updateStatus(effectedProduct,statusValue,manager,logger,trigger);
							}	
						}
						else{
                            //SS-24166 getmethod to querymethod replacement
                            //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                            var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
							for(var j=0;j<salesAreaRefs.length;j++){
								var salesAreaRef=salesAreaRefs[j];
								var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
								var targetSalesArea=targetSalesAreaCheck.replace("_","");								
								if(targetSalesArea == groupName){
									salesAreaRef.getValue("ProductStatus").setSimpleValue("Future In Market");
								}
							}
						}								
					}
				}			
			}
		}
		else if(nationalConsumerFIMArray.length > 1){
			for each(var nationalConsumerFIM in nationalConsumerFIMArray){
				var id=nationalConsumerFIM.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(nationalConsumerFIM.getObjectType().getID()!="FPC_TM"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var pkgToTMRef =pkgToTMRefs[0];
					tmObject = pkgToTMRef.getTarget();
				}
				else if(productItemObject.getObjectType().getID()=="FPC_TM"){
					tmObject = productItemObject;
				}
				var lcTarget = lifeCycleRef.getClassification().getID();
                //SS-24166 getmethod to querymethod replacement
                //var itemLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                var itemLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
				for(var i=0;i<itemLifeCycleRefs.length;i++){
					var itemLifeCycleRef=itemLifeCycleRefs[i];
					var itemLifeCycleRefTarget=itemLifeCycleRef.getClassification().getID();
					if(itemLifeCycleRefTarget == lcTarget ){
						var itemLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
						if(consumerFutureInMarketFinal == 0){
							consumerFutureInMarketFinal=nationalConsumerFIM;
							consumerFutureInMarketdate=itemLC4date;
						}
						else{
							if(consumerFutureInMarketdate > itemLC4date){
								consumerFutureInMarketFinal=nationalConsumerFIM;
								consumerFutureInMarketdate=itemLC4date;
							}
							else if(itemLC4date==consumerFutureInMarketdate){
								var itemFPC=productItemObject.getValue("FinishedProductCode").getSimpleValue();
								var inMarketFPC=consumerFutureInMarketFinal.getValue("FinishedProductCode").getSimpleValue();
								if(itemFPC>inMarketFPC){
									consumerFutureInMarketFinal=nationalConsumerFIM;
									consumerFutureInMarketdate=itemLC4date;
								}					
							}					
						}								
					}			
				}
			}
		}
		else if(nationalConsumerFIMArray.length == 0){
			for each(var consumerFutureInMarket in consumerFutureInMarketArray){
				var id=consumerFutureInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(consumerFutureInMarket.getObjectType().getID()!="FPC_TM"){
				
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var pkgToTMRef =pkgToTMRefs[0];
					tmObject = pkgToTMRef.getTarget();
				}
				else if(productItemObject.getObjectType().getID()=="FPC_TM"){
					tmObject = productItemObject;
				}
				var lcTarget = lifeCycleRef.getClassification().getID();
                //SS-24166 getmethod to querymethod replacement
                //var itemLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                var itemLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
				for(var i=0;i<itemLifeCycleRefs.length;i++){
					var itemLifeCycleRef=itemLifeCycleRefs[i];
					var itemLifeCycleRefTarget=itemLifeCycleRef.getClassification().getID();
					if(itemLifeCycleRefTarget == lcTarget ){
						var itemLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
						if(consumerFutureInMarketFinal == 0){
							consumerFutureInMarketFinal=consumerFutureInMarket;
							consumerFutureInMarketdate=itemLC4date;
						}
						else{
							if(consumerFutureInMarketdate > itemLC4date){
								consumerFutureInMarketFinal=consumerFutureInMarket;
								consumerFutureInMarketdate=itemLC4date;
							}
							else if(itemLC4date==consumerFutureInMarketdate){
								var itemFPC=productItemObject.getValue("FinishedProductCode").getSimpleValue();
								var inMarketFPC=consumerFutureInMarketFinal.getValue("FinishedProductCode").getSimpleValue();
								if(itemFPC>inMarketFPC){
									consumerFutureInMarketFinal=consumerFutureInMarket;
									consumerFutureInMarketdate=itemLC4date;
								}					
							}					
						}								
					}			
				}
			}
		}
		if(nationalConsumerFIMArray.length != 1){
			for each(var consumerFutureInMarket in consumerFutureInMarketArray){
				var id=consumerFutureInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(consumerFutureInMarket.getObjectType().getID()!="FPC_TM"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var pkgToTMRef =pkgToTMRefs[0];
					tmObject = pkgToTMRef.getTarget();
				}
				else if(productItemObject.getObjectType().getID()=="FPC_TM"){
					tmObject = productItemObject;
				}
				if(consumerFutureInMarket==consumerFutureInMarketFinal){
					if(productItemObject.getObjectType().getID()=="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer Future In Market");
								salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer Future In Market");
							}					
						}					
					}
					else if(productItemObject.getObjectType().getID()=="Each"){
						if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer Future In Market"){
							if(curObj.getID() != tmObject.getID()){
								var effectedProducts = new Array();
								productItemObject.getValue("ProductStatus").setSimpleValue("Consumer Future In Market");	
								var statusValue="Consumer Future In Market";
								effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
								for each(var effectedProduct in effectedProducts){
									updateStatus(effectedProduct,statusValue,manager,logger,trigger);
								}	
							}
							else{
                                //SS-24166 getmethod to querymethod replacement
                                //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                                var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
								for(var j=0;j<salesAreaRefs.length;j++){
									var salesAreaRef=salesAreaRefs[j];
									var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
									var targetSalesArea=targetSalesAreaCheck.replace("_","");
									if(targetSalesArea == groupName){
										salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer Future In Market");
									}
								}
							}		
						}
					}
				}
				else{
					var statusValue = "Future In Market";
					if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Future In Market"){
						if(curObj.getID() != tmObject.getID()){
							var effectedProducts = new Array();		
							productItemObject.getValue("ProductStatus").setSimpleValue(statusValue);					
							effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
							for each(var effectedProduct in effectedProducts){
								updateStatus(effectedProduct,statusValue,manager,logger,trigger);
							}	
						}
						else{
                            //SS-24166 getmethod to querymethod replacement
                            //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                            var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
							for(var j=0;j<salesAreaRefs.length;j++){
								var salesAreaRef=salesAreaRefs[j];
								var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
								var targetSalesArea=targetSalesAreaCheck.replace("_","");
								if(targetSalesArea == groupName){
									salesAreaRef.getValue("ProductStatus").setSimpleValue("Future In Market");
								}
							}
						}								
					}
				}
			}
		}
	}
}


/*@Author Anandhi
 * populate InMarket status in sales area reference level
*/
function populateInMarketStatus(salesAreaRef1,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger){
	log.info("Start populateInMarketStatus");
	//To check if FPC contains Case UOM or not
    var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
    var fpc = curObj.getParent();
    
    var allChildren = fpc.queryChildren();
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
   //commented as part of SS-24338 var fcReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_FC");
	var imageReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("ProductImage");
    
    var fpcToPOARefs = fpc.queryReferences(poaReferenceType).asList("20000").toArray();
    
    var salesAreaRefs = curObj.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
	//To find the similar products whose PIMID ends with "IM"
	var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
	var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
	for each(var salesAreaRef in salesAreaRefs){
		if(salesAreaRef1.getClassification().getID() ==salesAreaRef.getClassification().getID()){	
			var groupNameCheck = salesAreaRef.getClassification().getID();
			var groupName=groupNameCheck.replace("_","");
            
            var children = curObj.getParent().queryChildren();
            if (salesAreaRef.getValue("ProductStatus").getSimpleValue() == "Consumer Future In Market") {
                log.info("Previosuly it was Futute In market or in consumer Future  in market , remove from packaging hierarchy");
                
                var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
                //To find the similar products whose PIMID ends with "FIM"
                var singlehome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
                var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
                //SS-24995 getmethod to querymethod replacement
                //var children = curObj.getParent().getChildren().toArray();
                var children = curObj.getParent().queryChildren();
                var itemCheck = 0;
                var caseCheck = 0;
                //declared variables outside as part of SS-24995
                var itemObject;
                var caseObject;
                //for each(var childObjectUOM in children) {
                children.forEach(function (childObjectUOM) {
                    if (childObjectUOM.getObjectType().getID() == "FPC_UOM") {
                        var uomType = childObjectUOM.getValue("PackagingUOMType").getSimpleValue();
                        if (uomType == "Each") {
                            //var itemObject =childObjectUOM;
                            itemObject = childObjectUOM; //commented above line and added this line as part of SS-24995
                            var itemgtin = childObjectUOM.getValue("GTIN").getSimpleValue();
                            if (itemgtin != null && itemgtin != "") {
                                itemCheck++;
                            }
                        }
                        if (uomType == "Case") {
                            //var caseObject =childObjectUOM;
                            caseObject = childObjectUOM; //commented above line and added this line as part of SS-24995
                            var casegtin = childObjectUOM.getValue("GTIN").getSimpleValue();
                            if (casegtin != null && casegtin != "") {
                                caseCheck++;
                            }
                        }
                    }
                    return true; //added return as part of SS-24995
                });
				var itemCaseArray = new Array();
				itemCaseArray.push(itemObject);
				if(caseCheck==1 && itemCheck==0 ){
					//No Item object is there so put as directly Future In Market
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Future In Market");
				}
				for each(var childItem in itemCaseArray){
					if(childItem.getObjectType().getID()=="FPC_UOM"){
						var gtin = childItem.getValue("GTIN").getSimpleValue();						
                        //RITM6167607 getApproveStatus to getApprovalStatus replacement
                        //if(gtin != null &&  childItem.getApproveStatus() != "Not Approved"&&(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each")){
                        if (gtin != null && childItem.getApprovalStatus() != "Not Approved" && (childItem.getValue("PackagingUOMType").getSimpleValue() == "Each")) {
							var objectID = gtin+"_"+groupName+"_"+"FIM";
							var fpcCode=curObj.getValue("FinishedProductCode").getSimpleValue();
							if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
								var currentEach=gtin+"_"+groupName+"_"+fpcCode;
								var currentEachObject=manager.getProductHome().getProductByID(currentEach);
							}
							var  allProductsIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,objectID)).asList(100).toArray();
							//To get packages only with case object type
							var productsITIM=new Array();
							for each(var packObject in allProductsIM){
								if(packObject.getObjectType().getID()=="Each"){
									productsITIM.push(packObject);
								}
							}
							for each(var productITIM in productsITIM){
								var id=productITIM.getID();
								if(currentEachObject !=null && id == currentEachObject.getID()){
									var index = productsITIM.indexOf(productITIM);
									if (index > -1) {
										productsITIM.splice(index, 1);
									}
								}
							}
							if(productsITIM.length >= 1){
								log.info("Execute sortAndSetFutureConsumerInMarket (populateInMarketStatus)");
								sortAndSetFutureConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj);
							}					
						}
					}
				}		
			}
			var itemCheck =0;
			var caseCheck =0;
			var caseObject;
            var itemObject;
            //for each(var childObjectUOM in children) {
            children.forEach(function (childObjectUOM) {
				if(childObjectUOM.getObjectType().getID()=="FPC_UOM"){
					var uomType = childObjectUOM.getValue("PackagingUOMType").getSimpleValue();
					var gtinValue = childObjectUOM.getValue("GTIN").getSimpleValue();
					if(gtinValue!= null && gtinValue!= ""){
						if(uomType=="Case"){
							caseObject =childObjectUOM;
							caseCheck++;
						}
						else if(uomType=="Each"){
							itemObject =childObjectUOM;
							itemCheck++;
						}
					}
				}
                return true; //added return as part of SS-24995
            });
			/*if(itemCheck!=1||caseCheck!=1){
				return false;
			}*/
			var itemCaseArray = new Array();
			if(itemObject){
				itemCaseArray.push(itemObject);
			}
			if(caseObject){
				itemCaseArray.push(caseObject);
			}
			for each(var childItem in itemCaseArray){
				if(childItem.getObjectType().getID()=="FPC_UOM"){
					var gtin = childItem.getValue("GTIN").getSimpleValue();						
                    //RITM6167607 getApproveStatus to getApprovalStatus replacement
                    //if(gtin != null &&  childItem.getApproveStatus() != "Not Approved"&&(childItem.getValue("PackagingUOMType").getSimpleValue()=="Case"||childItem.getValue("PackagingUOMType").getSimpleValue()=="Each")){
                    if (gtin != null && childItem.getApprovalStatus() != "Not Approved" && (childItem.getValue("PackagingUOMType").getSimpleValue() == "Case" || childItem.getValue("PackagingUOMType").getSimpleValue() == "Each")) {
						var objectID = gtin+"_"+groupName+"_"+"IM";
						var fpcCode=curObj.getValue("FinishedProductCode").getSimpleValue();
						if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Case"){
							var currentCase=gtin+"_"+groupName+"_"+fpcCode;
							var currentCaseObject=manager.getProductHome().getProductByID(currentCase);
						}
						if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
							var currentEach=gtin+"_"+groupName+"_"+fpcCode;
							var currentEachObject=manager.getProductHome().getProductByID(currentEach);
						}
						var  allProductsIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,objectID)).asList(100).toArray();
						//To get packages only with case object type
						var productsCaseIM = new Array();
						var productsITIM=new Array();
						for each(var packObject in allProductsIM){
							if(packObject.getObjectType().getID()=="Case"){
								productsCaseIM.push(packObject);
							}
						}
						for each(var packObject in allProductsIM){
							if(packObject.getObjectType().getID()=="Each"){
								productsITIM.push(packObject);
							}
						}
						var objectFlag=true;
						if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
							for each(var productITIM in productsITIM){
								var id=productITIM.getID();
								if(currentEachObject !=null && id == currentEachObject.getID()){
									objectFlag=false;
								}
							}
							if(objectFlag && currentEachObject !=null){
								productsITIM.push(currentEachObject);
							}
							else if(objectFlag){
								productsITIM.push(curObj);
							}
							if(productsITIM.length >= 1){
								var groupNameCheck = salesAreaRef.getClassification().getID();
								var groupName=groupNameCheck.replace("_","");
								if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
									var lifeCycleStage4=lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
								}
								else {
									var lifeCycleStage4=curObj.getValue("ExternalOnlineDate").getSimpleValue();
								}								
								var brand =fpc.getValue("Brandtype").getSimpleValue();
								var productUsage=fpc.getValue("ProductUsage_FWIPIndicator").getSimpleValue();
								var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
								var lifeCycleStage5=lifeCycleRef.getValue("LifeCycleStage5").getSimpleValue();								
								if(lifeCycleStage4 != null && lifeCycleStage5 != null &&  productUsage != "Final Work In Process" && (brand != "FEEDER CODE" || brand != "EXPORT PRODUCT ONLY" || brand != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" || brand != "SAMPLE-INTERPLANT CODE (NOT PRICED)" || brand != "CANCELLED CODE")) {
									var replacelc4 = lifeCycleStage4.replace("-", "/");
									var stepLifeCycleStage4 = new Date(replacelc4);
									var replacelc5 = lifeCycleStage5.replace("-", "/");
									var stepLifeCycleStage5 = new Date(replacelc5);
									if(stepLifeCycleStage4 <= currentDate && stepLifeCycleStage5 >= currentDate && caseCheck!=0){
										log.info("Execute sortAndSetConsumerInMarket (populateInMarketStatus)");
										sortAndSetConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj);
									}
									else if(stepLifeCycleStage4 <= currentDate && stepLifeCycleStage5 >= currentDate){
										log.info("Execute sortAndSetInMarketWithoutCSGTIN (populateInMarketStatus)");
										sortAndSetInMarketWithoutCSGTIN(lifeCycleRef,productsITIM,curObj,tmReferenceType,logger,groupName,manager,phTrigger,poaReferenceType,imageReferenceType,trigger);
									}									
								}				
							}
						}
						var objectFlag=true;
						if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Case"){
							for each(var productCaseIM in productsCaseIM){
								var id=productCaseIM.getID();
								var productCaseObject=manager.getProductHome().getProductByID(id);
								if(currentCaseObject !=null && id == currentCaseObject.getID()){
									objectFlag=false;
								}
							}
							if(objectFlag && currentCaseObject !=null){
								productsCaseIM.push(currentCaseObject);
							}
							else if(objectFlag){
								productsCaseIM.push(curObj);
							}
							if(productsCaseIM.length >= 1){	
								var groupNameCheck = salesAreaRef.getClassification().getID();
								var groupName=groupNameCheck.replace("_","");
								if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
									var lifeCycleStage4=lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
								}
								else {
									var lifeCycleStage4=curObj.getValue("ExternalOnlineDate").getSimpleValue();
								}
								var brand =fpc.getValue("Brandtype").getSimpleValue();
								var productUsage=fpc.getValue("ProductUsage_FWIPIndicator").getSimpleValue();
								var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
								var lifeCycleStage5=lifeCycleRef.getValue("LifeCycleStage5").getSimpleValue();
								if(lifeCycleStage4 != null && lifeCycleStage5 != null &&  productUsage != "Final Work In Process" && (brand != "FEEDER CODE" || brand != "EXPORT PRODUCT ONLY" || brand != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" || brand != "SAMPLE-INTERPLANT CODE (NOT PRICED)" || brand != "CANCELLED CODE")) {
									var replacelc4 = lifeCycleStage4.replace("-", "/");
									var stepLifeCycleStage4 = new Date(replacelc4);
									var replacelc5 = lifeCycleStage5.replace("-", "/");
									var stepLifeCycleStage5 = new Date(replacelc5);
									if(stepLifeCycleStage4 <= currentDate && stepLifeCycleStage5 >= currentDate){
										log.info("Execute sortAndSetInMarket (populateInMarketStatus)");
										sortAndSetInMarket(lifeCycleRef,productsCaseIM,curObj,tmReferenceType,currentCaseObject,logger,groupName,manager,trigger,curObj);
									}						
								}
							}
						}
					}
				}
			}
		}
	}
}

/*@Author Anandhi
 * populate Consumer InMarket status in comparing all Item GTIN
*/
function sortAndSetConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj){
	log.info("started sortAndSetConsumerInMarket");
	var consumerInMarketArray=new Array();
	var nationalConsumerInMarketArray=new Array();
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
	var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
	var poaEnoviaReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_POA"); // PRB0119238
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	//logger.info("productsITIM: " +productsITIM);
	for each(var productITIM in productsITIM){
		//logger.info(productITIM);
		var tmObject;
		var productItemObject=manager.getObjectFromOtherManager(productITIM);
		if(productItemObject.getObjectType().getID()!="FPC_TM"){
            //SS-23684 getmethod to querymethod replacement
            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
			tmObject = pkgToTMRefs[0].getTarget();
		}
		else{
			tmObject=productItemObject;
		}
		var consumerCheck = checkConsumerMarketEligibility(tmObject,groupName,manager,logger);
		var marketApprovalStatus=tmObject.getValue("MarketingApproved").getSimpleValue();
		//var econtentDate=tmObject.getValue("EcontentPublicationDate").getSimpleValue();
        //SS-23684 getmethod to querymethod replacement
        //var fpcToPOARefs=tmObject.getReferences(poaReferenceType).toArray();
        var fpcToPOARefs = tmObject.queryReferences(poaReferenceType).asList("20000").toArray();
		// Start of PRB0119238
         var fpcToEnoviaPOA = tmObject.queryReferences(poaEnoviaReferenceType).asList("20000").toArray();
         var fpctopoalinkavailable = 0;
         if(fpcToPOARefs.length > 0 || fpcToEnoviaPOA.length > 0) { // End of PRB0119238
             fpctopoalinkavailable = 1;
         }
		//logger.info("fpctopoalinkavailable: " +fpctopoalinkavailable);
		if(consumerCheck && fpctopoalinkavailable==1){
			consumerInMarketArray.push(productITIM);
		}
		else if(consumerCheck){
			if(groupName != "US61"&& groupName != "USY1" && groupName != "US65"&& groupName != "US64"&& groupName != "CA01"&& groupName != "PR04"&& groupName != "PH0302" && groupName != "US60"&& groupName != "CA00"){
				consumerInMarketArray.push(productITIM);
			}	
		}
		else{
			if(productItemObject.getObjectType().getID()=="FPC_TM"){
                //SS-24166 getmethod to querymethod replacement
                //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					if(targetSalesArea == groupName){
						salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Not Consumer In Market");
						//logger.info("ItemProductStatus set Not Consumer In Market: ");
					}					
				}					
			}
			else if(productItemObject.getObjectType().getID()=="Each"){
				//logger.info("Inside Each");
                //SS-23684 getmethod to querymethod replacement
                //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var tmObjectPublish = pkgToTMRefs[0].getTarget();
				var statusValue = "Not Consumer In Market";
				var effectedProducts = new Array();		
				productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
				effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
				for each(var effectedProduct in effectedProducts){
					effectedProduct.getValue("ItemProductStatus").setSimpleValue(statusValue);
					//logger.info("ItemProductStatus set for Each");
				}

				if(productItemObject.getValue("GTINStatus").getSimpleValue()=="Consumer In Market" && tmObjectPublish.getID() != curObj.getID()){
					//logger.info("phTrigger spublish: ");
					phTrigger.republish(tmObjectPublish);
				}
			}
		}
	}
	//logger.info("consumerInMarketArray: " +consumerInMarketArray);
	if(consumerInMarketArray.length == 1 && consumerInMarketArray[0].getObjectType().getID() != null){
	logger.info("consumerInMarketArray.length == 1 ");
		for each(var productITIM in productsITIM){
			var statusValue = "Consumer In Market";
			if(productITIM == consumerInMarketArray[0] ){
				//logger.info("productITIM == consumerInMarketArray[0]: ");
				//logger.info("productITIM: " +productITIM);
			//	logger.info("consumerInMarketArray[0]: " +consumerInMarketArray[0]);
			
				var id=productITIM.getID();
				//logger.info("id: " +id);
				var productItemObject=manager.getProductHome().getProductByID(id);	
				if(productItemObject.getObjectType().getID() =="FPC_TM"){
					logger.info("productItemObject and object is TM: " +productItemObject);
                    //SS-24166 getmethod to querymethod replacement
                    //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                    var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						//logger.info("salesAreaRef: " +salesAreaRef);
						var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
						//logger.info("targetSalesAreaCheck: " +targetSalesAreaCheck);
						var targetSalesArea=targetSalesAreaCheck.replace("_","");
						//logger.info("targetSalesArea: " +targetSalesArea);
						//logger.info("groupName: " +groupName);
						if(targetSalesArea == groupName){
							salesAreaRef.getValue("ItemProductStatus").setSimpleValue(statusValue);
							salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
							//logger.info("ProductStatus set: ");
						}
					}
				}					
				else if(productItemObject.getObjectType().getID()=="Each"){
					//logger.info("productItemObject and object is Each: " +productItemObject);
					log.info("Product Status == " +productItemObject.getValue("ProductStatus").getSimpleValue());
					if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer In Market"){
						log.info("Product Status is not Consumer In Market")
                        //SS-23684 getmethod to querymethod replacement
                        //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                        var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
						var pkgToTMRef =pkgToTMRefs[0];
						var tmObject1 = pkgToTMRef.getTarget();
						if(curObj.getID() != tmObject1.getID()){
							var effectedProducts = new Array();		
							productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
							effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
							for each(var effectedProduct in effectedProducts){
								log.info("Execute updateStatus Function");
								updateStatus(effectedProduct,statusValue,manager,logger,trigger);
							}	
						}
						else{
                            //SS-24166 getmethod to querymethod replacement
                            //var salesAreaRefs =tmObject1.getClassificationProductLinks(salesAreaReferenceType).toArray();
                            var salesAreaRefs = tmObject1.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
							for(var j=0;j<salesAreaRefs.length;j++){
								var salesAreaRef=salesAreaRefs[j];
								var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
								var targetSalesArea=targetSalesAreaCheck.replace("_","");
								if(targetSalesArea == groupName){
									salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
									salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
									var effectedProducts = new Array();	
									effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
									for each(var effectedProduct in effectedProducts){
										effectedProduct.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
									}
								}
							}
						}									
					}
				}						
			}			
		}		
	}
	else if(consumerInMarketArray.length > 1){
	//logger.info("consumerInMarketArray.length > 1 ");
		var consumerInMarketFinal=0;
		var consumerInMarketdate=0;
		var tmObject;
		var checkCustomerSpecific;
        //SS-24166 getmethod to querymethod replacement
        //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
        var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
		for each(var consumerInMarket in consumerInMarketArray){
			var id=consumerInMarket.getID();
			var productItemObject=manager.getProductHome().getProductByID(id);
			if(consumerInMarket.getObjectType().getID()!="FPC_TM"){
			
                //SS-23684 getmethod to querymethod replacement
                //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
			var pkgToTMRef =pkgToTMRefs[0];
				tmObject = pkgToTMRef.getTarget();
				checkCustomerSpecific=tmObject.getValue("CustomerClassificationAtTM").getSimpleValue();
			}
			else if(productItemObject.getObjectType().getID()=="FPC_TM"){
				tmObject = productItemObject;
				checkCustomerSpecific=tmObject.getValue("CustomerClassificationAtTM").getSimpleValue();
			}
			if (checkCustomerSpecific=="National"){
				nationalConsumerInMarketArray.push(consumerInMarket);
			}
		}
		if(nationalConsumerInMarketArray.length == 1 && nationalConsumerInMarketArray[0].getObjectType().getID() != null){
			for each(var productITIM in productsITIM){
				var statusValue = "Consumer In Market";
				if(productITIM == nationalConsumerInMarketArray[0] ){
					var id=productITIM.getID();
					var productItemObject=manager.getProductHome().getProductByID(id);	
					if(productItemObject.getObjectType().getID() =="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue(statusValue);
								salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
							}
						}
					}					
					else if(productItemObject.getObjectType().getID()=="Each"){
						if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer In Market"){
                            //SS-23684 getmethod to querymethod replacement
                            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
							var pkgToTMRef =pkgToTMRefs[0];
							var tmObject1 = pkgToTMRef.getTarget();
							if(curObj.getID() != tmObject1.getID()){
								var effectedProducts = new Array();		
								productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
								effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
								for each(var effectedProduct in effectedProducts){
									updateStatus(effectedProduct,statusValue,manager,logger,trigger);
								}	
							}
							else{
                                //SS-24166 getmethod to querymethod replacement
                                //var salesAreaRefs =tmObject1.getClassificationProductLinks(salesAreaReferenceType).toArray();
                                var salesAreaRefs = tmObject1.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
								for(var j=0;j<salesAreaRefs.length;j++){
									var salesAreaRef=salesAreaRefs[j];
									var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
									var targetSalesArea=targetSalesAreaCheck.replace("_","");
									if(targetSalesArea == groupName){
										salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
										salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
										var effectedProducts = new Array();	
										effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
										for each(var effectedProduct in effectedProducts){
											effectedProduct.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
										}
									}
								}
							}									
						}
					}						
				}
				else if(productITIM != nationalConsumerInMarketArray[0]){
					var id=productITIM.getID();
					var productItemObject=manager.getProductHome().getProductByID(id);
					if(productItemObject.getObjectType().getID()=="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Not Consumer In Market");
							}					
						}					
					}
					else if(productItemObject.getObjectType().getID()=="Each"){
						var statusValue = "Not Consumer In Market";
                        //SS-23684 getmethod to querymethod replacement
                        //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                        var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
						var tmObjectPublish1 = pkgToTMRefs[0].getTarget();
						productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						//Get effected products and set the status value
						var effectedProductsArray = getEffectedProducts(productItemObject,groupName,manager,logger);
						for each(var productObject in effectedProductsArray){
							productObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						}
						if(productItemObject.getValue("GTINStatus").getSimpleValue()=="Consumer In Market" && tmObjectPublish1.getID() != curObj.getID()){
							phTrigger.republish(tmObjectPublish1);
						}
					}
				}
			}
		}
		else if(nationalConsumerInMarketArray.length > 1){
			for each(var nationalConsumerInMarket in nationalConsumerInMarketArray){
				var id=nationalConsumerInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(nationalConsumerInMarket.getObjectType().getID()!="FPC_TM"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var pkgToTMRef =pkgToTMRefs[0];
					tmObject = pkgToTMRef.getTarget();
				}
				else if(productItemObject.getObjectType().getID()=="FPC_TM"){
					tmObject = productItemObject;
				}
				var lcTarget = lifeCycleRef.getClassification().getID();
                //SS-24166 getmethod to querymethod replacement
                //var itemLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                var itemLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
				for(var i=0;i<itemLifeCycleRefs.length;i++){
					var itemLifeCycleRef=itemLifeCycleRefs[i];
					var itemLifeCycleRefTarget=itemLifeCycleRef.getClassification().getID();
					if(itemLifeCycleRefTarget == lcTarget ){
						if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
							var itemLC4date=itemLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();								
						}
						else{
							var itemLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
						}
						if(consumerInMarketFinal == 0){
							consumerInMarketFinal=nationalConsumerInMarket;
							consumerInMarketdate=itemLC4date;
						}
						else{
							if(consumerInMarketdate<itemLC4date){
								consumerInMarketFinal=nationalConsumerInMarket;
								consumerInMarketdate=itemLC4date;
							}
							else if(itemLC4date==consumerInMarketdate){
								var itemFPC=productItemObject.getValue("FinishedProductCode").getSimpleValue();
								var inMarketFPC=consumerInMarketFinal.getValue("FinishedProductCode").getSimpleValue();
								if(itemFPC>inMarketFPC){
									consumerInMarketFinal=nationalConsumerInMarket;
									consumerInMarketdate=itemLC4date;
								}					
							}					
						}								
					}			
				}
				//logger.info(consumerInMarketFinal + " check " +consumerInMarketdate);
			}			
		}
		else if(nationalConsumerInMarketArray.length == 0){
			for each(var consumerInMarket in consumerInMarketArray){
				var id=consumerInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(consumerInMarket.getObjectType().getID()!="FPC_TM"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
					var pkgToTMRef =pkgToTMRefs[0];
					tmObject = pkgToTMRef.getTarget();
				}
				else if(productItemObject.getObjectType().getID()=="FPC_TM"){
					tmObject = productItemObject;
				}
				var lcTarget = lifeCycleRef.getClassification().getID();
                //SS-24166 getmethod to querymethod replacement
                //var itemLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                var itemLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
				for(var i=0;i<itemLifeCycleRefs.length;i++){
					var itemLifeCycleRef=itemLifeCycleRefs[i];
					var itemLifeCycleRefTarget=itemLifeCycleRef.getClassification().getID();
					if(itemLifeCycleRefTarget == lcTarget ){
						if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
							var itemLC4date=itemLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();								
						}
						else{
							var itemLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
						}
						if(consumerInMarketFinal == 0){
							consumerInMarketFinal=consumerInMarket;
							consumerInMarketdate=itemLC4date;
						}
						else{
							if(consumerInMarketdate<itemLC4date){
								consumerInMarketFinal=consumerInMarket;
								consumerInMarketdate=itemLC4date;
							}
							else if(itemLC4date==consumerInMarketdate){
								var itemFPC=productItemObject.getValue("FinishedProductCode").getSimpleValue();
								var inMarketFPC=consumerInMarketFinal.getValue("FinishedProductCode").getSimpleValue();
								if(itemFPC>inMarketFPC){
									consumerInMarketFinal=consumerInMarket;
									consumerInMarketdate=itemLC4date;
								}					
							}					
						}								
					}			
				}
			}
		}	
		if(nationalConsumerInMarketArray.length != 1){
			for each(var consumerInMarket in consumerInMarketArray){
				var id=consumerInMarket.getID();
				var productItemObject=manager.getProductHome().getProductByID(id);
				if(consumerInMarket==consumerInMarketFinal){
					if(productItemObject.getObjectType().getID()=="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
								salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
							}					
						}					
					}
					else if(productItemObject.getObjectType().getID()=="Each"){
						var statusValue = "Consumer In Market";
						logger.info(productItemObject);
							if(productItemObject.getValue("ProductStatus").getSimpleValue() != "Consumer In Market"){
                            //SS-23684 getmethod to querymethod replacement
                            //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                            var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
							var pkgToTMRef =pkgToTMRefs[0];
							tmObject = pkgToTMRef.getTarget();
							if(curObj.getID() != tmObject.getID()){
								logger.info(curObj.getID() + " check " +tmObject.getID());
								var effectedProducts = new Array();		
								productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);					
								effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
								for each(var effectedProduct in effectedProducts){
									updateStatus(effectedProduct,statusValue,manager,logger,trigger);
								}	
							}
							else{
                                //SS-24166 getmethod to querymethod replacement
                                //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                                var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
								for(var j=0;j<salesAreaRefs.length;j++){
									var salesAreaRef=salesAreaRefs[j];
									var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
									var targetSalesArea=targetSalesAreaCheck.replace("_","");
									if(targetSalesArea == groupName){
										var effectedProducts = new Array();	
										effectedProducts = getEffectedProducts(productItemObject,groupName,manager,logger);
										for each(var effectedProduct in effectedProducts){
											effectedProduct.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
										}
										salesAreaRef.getValue("ProductStatus").setSimpleValue("Consumer In Market");
										salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Consumer In Market");
									}
								}
							}									
						}				
					}
				}
				else{
					if(productItemObject.getObjectType().getID()=="FPC_TM"){
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =productItemObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = productItemObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ItemProductStatus").setSimpleValue("Not Consumer In Market");
								
							}					
						}					
					}
					else if(productItemObject.getObjectType().getID()=="Each"){
						var statusValue = "Not Consumer In Market";
                        //SS-23684 getmethod to querymethod replacement
                        //var pkgToTMRefs=productItemObject.getReferences(tmReferenceType).toArray();
                        var pkgToTMRefs = productItemObject.queryReferences(tmReferenceType).asList("20000").toArray();
						var tmObjectPublish2 = pkgToTMRefs[0].getTarget();
						productItemObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						//Get effected products and set the status value
						var effectedProductsArray = getEffectedProducts(productItemObject,groupName,manager,logger);
						for each(var productObject in effectedProductsArray){
							productObject.getValue("ItemProductStatus").setSimpleValue(statusValue);
						}
						if(productItemObject.getValue("GTINStatus").getSimpleValue()=="Consumer In Market" && tmObjectPublish2.getID() != curObj.getID()){
							logger.info(tmObjectPublish2);
							phTrigger.republish(tmObjectPublish2);
						}
					}
				}
			}
			
		}				
	}
	//logger.info("end sortAndSetConsumerInMarket: ");
}

/*@Author Anandhi
 * populate InMarket and Shipping In Market status in comparing all Case GTIN
*/
function sortAndSetInMarket(lifeCycleRef,productsCaseIM,curObj,tmReferenceType,currentCaseObject,logger,groupName,manager,trigger,curObj){
	logger.info("Start sortAndSetInMarket");
	logger.info("productsCaseIM == "+productsCaseIM);
	var inMarketDate=0;
	var inMarket=0;
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
    var consumerInMarketDate = null;
    //SS-24166 getmethod to querymethod replacement
    //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
    var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
	//logger.info("productsCaseIM 1 : "+productsCaseIM);
	//logger.info("groupName : "+groupName);
	for each(var productCaseIM in productsCaseIM){
		//To remove  the consumer in Market from the group
		//logger.info("productCaseIM : "+productCaseIM);
		var productCaseObject=manager.getObjectFromOtherManager(productCaseIM);
		if(productCaseObject.getObjectType().getID()=="FPC_TM"){
			logger.info("if loop 1: 2901");
            //SS-24166 getmethod to querymethod replacement
            //var salesAreaRefs =productCaseObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
            var salesAreaRefs = productCaseObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
			for(var j=0;j<salesAreaRefs.length;j++){
				var salesAreaRef=salesAreaRefs[j];
				var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
				var targetSalesArea=targetSalesAreaCheck.replace("_","");
				if(targetSalesArea == groupName && salesAreaRef.getValue("ItemProductStatus").getSimpleValue()== "Consumer In Market"){
					//logger.info("ItemProductStatus = Consumer In Market: ");
					var index = productsCaseIM.indexOf(productCaseIM);					
					if (index > -1) {
						if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){	var lcTarget = lifeCycleRef.getClassification().getID();
                            var lcTarget = lifeCycleRef.getClassification().getID();

                            //SS-24166 getmethod to querymethod replacement
                            //var caseLifeCycleRefs =productCaseObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                            var caseLifeCycleRefs = productCaseObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
							for each(var caseLifeCycleRef in caseLifeCycleRefs){
								var caseLifeCycleRefTarget=caseLifeCycleRef.getClassification().getID();
								if(caseLifeCycleRefTarget == lcTarget ){
									consumerInMarketDate=caseLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
								}
							}
						}
						else{
							consumerInMarketDate=productCaseObject.getValue("ExternalOnlineDate").getSimpleValue();
						}
						//logger.info("productsCaseIM before Splice : "+productsCaseIM);
						productsCaseIM.splice(index, 1);
					}
				}					
			}			
		}
		else{
			logger.info("else loop 1: 2936");
			var packageStatus = productCaseObject.getValue("ItemProductStatus").getSimpleValue();
			if(packageStatus){
				logger.info("else loop 1: 2939");
			//	logger.info("packageStatus: " +packageStatus);
				if(packageStatus=="Consumer In Market"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productCaseObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productCaseObject.queryReferences(tmReferenceType).asList("20000").toArray();
					var pkgToTMRef =pkgToTMRefs[0];
					var tmObject2 = pkgToTMRef.getTarget();
					var index = productsCaseIM.indexOf(productCaseIM);
					if (index > -1) {
						if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
							var lcTarget = lifeCycleRef.getClassification().getID();
                            //SS-24166 getmethod to querymethod replacement
                            //var caseLifeCycleRefs =tmObject2.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                            var caseLifeCycleRefs = tmObject2.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
							for each(var caseLifeCycleRef in caseLifeCycleRefs){
								var caseLifeCycleRefTarget=caseLifeCycleRef.getClassification().getID();
								if(caseLifeCycleRefTarget == lcTarget ){
									consumerInMarketDate=caseLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
								}
							}
						}
						else{
							consumerInMarketDate=tmObject2.getValue("ExternalOnlineDate").getSimpleValue();
						}
						productsCaseIM.splice(index, 1);
					}
				}
			}
		}		
	}
	//logger.info("productsCaseIM 2 : " +productsCaseIM);
	for each(var productCaseIM in productsCaseIM){
		var id=productCaseIM.getID();
	//	logger.info("id : " +id);
		var productCaseObject=manager.getProductHome().getProductByID(id);
		if(productCaseObject.getObjectType().getID()!="FPC_TM"){
            //SS-23684 getmethod to querymethod replacement
            //var pkgToTMRefs=productCaseObject.getReferences(tmReferenceType).toArray();
            var pkgToTMRefs = productCaseObject.queryReferences(tmReferenceType).asList("20000").toArray();
			var pkgToTMRef =pkgToTMRefs[0];
			var tmObject = pkgToTMRef.getTarget();
		}
		else if(productCaseObject.getObjectType().getID()=="FPC_TM"){
			var tmObject = productCaseObject;
		}
		
		var lcTarget = lifeCycleRef.getClassification().getID();
        //SS-24166 getmethod to querymethod replacement
        //var caseLifeCycleRefs =tmObject.getClassificationProductLinks(lifeCycleReferenceType).toArray();
        var caseLifeCycleRefs = tmObject.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
		for(var i=0;i<caseLifeCycleRefs.length;i++){
			var caseLifeCycleRef=caseLifeCycleRefs[i];
			var caseLifeCycleRefTarget=caseLifeCycleRef.getClassification().getID();
			if(caseLifeCycleRefTarget == lcTarget ){
				if(groupName == "US61"|| groupName == "USY1"||groupName == "US65"|| groupName == "US64"|| groupName == "CA01"|| groupName == "PR04"|| groupName == "PH0302"){
					var caseLC4date=caseLifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();						
				}
				else{
					var caseLC4date=tmObject.getValue("ExternalOnlineDate").getSimpleValue();
					//logger.info("caseLC4date : " +caseLC4date);
				}
				if(inMarket == 0){
					inMarket=productCaseIM;
					inMarketDate=caseLC4date;
				}
				else{
					if(inMarketDate<caseLC4date){
						inMarket=productCaseIM;
						inMarketDate=caseLC4date;
					}
					else if(caseLC4date==inMarketDate){
						var caseFPC=productCaseObject.getValue("FinishedProductCode").getSimpleValue();
						var inMarketFPC=inMarket.getValue("FinishedProductCode").getSimpleValue();
						if(caseFPC>inMarketFPC){
							inMarket=productCaseIM;
							inMarketDate=caseLC4date;
						}					
					}					
				}								
			}			
		}		
	}
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
	var inMarketDateCheck = false;
	if(consumerInMarketDate!=null){
		inMarketDateCheck = false;
	
	}else{
		inMarketDateCheck = true;
	}
	//logger.info("inMarket : 3031 = " +inMarket);
	//logger.info("inMarketDateCheck : " +inMarketDateCheck);
	for each(var productCaseIM in productsCaseIM){
		var id=productCaseIM.getID();
		var productCaseObject=manager.getProductHome().getProductByID(id);
		if(productCaseIM==inMarket&&inMarketDateCheck){
			logger.info("productCaseIM==inMarket : 3035");
			if(productCaseObject.getObjectType().getID()=="FPC_TM"){
                //SS-24166 getmethod to querymethod replacement
                //var salesAreaRefs =productCaseObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                var salesAreaRefs = productCaseObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					if(targetSalesArea == groupName && salesAreaRef.getValue("ItemProductStatus").getSimpleValue()!= "Consumer In Market"){
						salesAreaRef.getValue("CaseProductStatus").setSimpleValue("In Market");
						salesAreaRef.getValue("ProductStatus").setSimpleValue("In Market");
					}					
				}					
			}
			else if(productCaseObject.getObjectType().getID()=="Case"){
				var statusValue = "In Market";
				if(productCaseObject.getValue("ItemProductStatus").getSimpleValue()!= "Consumer In Market"){
                    //SS-23684 getmethod to querymethod replacement
                    //var pkgToTMRefs=productCaseObject.getReferences(tmReferenceType).toArray();
                    var pkgToTMRefs = productCaseObject.queryReferences(tmReferenceType).asList("20000").toArray();
                    var pkgToTMRef = pkgToTMRefs[0];
					var tmObject = pkgToTMRef.getTarget();
					if(curObj.getID() != tmObject.getID()){
						var effectedProducts = new Array();		
						productCaseObject.getValue("CaseProductStatus").setSimpleValue(statusValue);					
						effectedProducts = getEffectedProducts(productCaseObject,groupName,manager,logger);
						for each(var effectedProduct in effectedProducts){
							log.info("Execute updateStatus Function");
							updateStatus(effectedProduct,statusValue,manager,logger,trigger);
						}	
					}
					else{
                        //SS-24166 getmethod to querymethod replacement
                        //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                        var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
						for(var j=0;j<salesAreaRefs.length;j++){
							var salesAreaRef=salesAreaRefs[j];
							var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
							var targetSalesArea=targetSalesAreaCheck.replace("_","");
							if(targetSalesArea == groupName){
								salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
							}
						}
					}									
				}
			}
		}
		else{
			logger.info("else loop: 3084");
			//logger.info("productCaseObject: " +productCaseObject);
			if(productCaseObject.getObjectType().getID()=="FPC_TM"){
                //SS-24166 getmethod to querymethod replacement
                //var salesAreaRefs =productCaseObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                var salesAreaRefs = productCaseObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
				for(var j=0;j<salesAreaRefs.length;j++){
					var salesAreaRef=salesAreaRefs[j];
					var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
					var targetSalesArea=targetSalesAreaCheck.replace("_","");
					//var targetSalesArea=splitTargetSalesArea[0];
					if(targetSalesArea == groupName){
						salesAreaRef.getValue("CaseProductStatus").setSimpleValue("Shipping In Market");	
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Shipping In Market");
					}					
				}					
			}
			else if(productCaseObject.getObjectType().getID()=="Case"){
				logger.info("else loop 1: 3105");
				var statusValue = "Shipping In Market";
                //SS-23684 getmethod to querymethod replacement
                //var pkgToTMRefs=productCaseObject.getReferences(tmReferenceType).toArray();
                var pkgToTMRefs = productCaseObject.queryReferences(tmReferenceType).asList("20000").toArray();
				var pkgToTMRef =pkgToTMRefs[0];
				var tmObject = pkgToTMRef.getTarget();
				if(curObj.getID() != tmObject.getID()){
					logger.info("else loop 1: 3113");
					var effectedProducts = new Array();	
					effectedProducts = getEffectedProducts(productCaseObject,groupName,manager,logger);
					
					for each(var effectedProduct in effectedProducts){
						log.info("Execute updateStatus Function 2");
						updateStatus(effectedProduct,statusValue,manager,logger,trigger);
					}	
				}
				else{
                    //SS-24166 getmethod to querymethod replacement
                    //var salesAreaRefs =tmObject.getClassificationProductLinks(salesAreaReferenceType).toArray();
                    var salesAreaRefs = tmObject.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
					for(var j=0;j<salesAreaRefs.length;j++){
						var salesAreaRef=salesAreaRefs[j];
						var targetSalesAreaCheck=salesAreaRef.getClassification().getID();
						var targetSalesArea=targetSalesAreaCheck.replace("_","");
						if(targetSalesArea == groupName){
							salesAreaRef.getValue("ProductStatus").setSimpleValue(statusValue);
						}
					}
				}
				productCaseObject.getValue("CaseProductStatus").setSimpleValue(statusValue);
				productCaseObject.getValue("ProductStatus").setSimpleValue(statusValue);
			}
		}
	}
	//logger.info("End sortAndSetInMarket");
}
/*@Author Akhil
 *  Update Product status with the given status
*/
function updateStatus(productIM,productStatusValue,manager,logger,trigger){
	log.info("Started updateStatus Function");
	var triggerArray = [];
	var lookupTableHome = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	var totalPackingItems=[];
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var uomReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_UOM_Reference");
	var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
	 //commented as part of SS-24338 var fcReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_FC");
	var imageReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("ProductImage");
	var allUomReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_AllUOM_Reference");
    //SS-23684 getmethod to querymethod replacement
    //var targetMarkets = productIM.getReferences(tmReferenceType).toArray();
    var targetMarkets = productIM.queryReferences(tmReferenceType).asList("20000").toArray();
	var currentObject = targetMarkets[0].getTarget();
    //SS-23684 getmethod to querymethod replacement
    //var uomLinked = productIM.getReferences(uomReferenceType).toArray();
    var uomLinked = productIM.queryReferences(uomReferenceType).asList("20000").toArray();
	var childItem = uomLinked[0].getTarget();
	var fpc=currentObject.getParent();
	if(productStatusValue=="In Market" || productStatusValue=="Consumer In Market" || productStatusValue=="Shipping In Market"){
		productStatus="IM";
	}
	else if(productStatusValue=="Future In Market" || productStatusValue=="Consumer Future In Market"){
		productStatus="FIM";
	}
	else if(productStatusValue=="Previous In Market" || productStatusValue=="Previous Consumer In Market"){
		productStatus="PIM";
	}
	var pimIDValue = productIM.getID()
	var idArray = pimIDValue.split("_");
	var gtin = idArray[0];
	var groupName = idArray[1];
	var partialID = gtin+"_"+groupName+"_"+productStatus;
	productIM.getValue("PIMIDAttribute").setSimpleValue(partialID);
	//Setting status at Target Market sales area status
    //SS-24166 getmethod to querymethod replacement
    //var ref = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var ref = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
    //SS-24166 getmethod to querymethod replacement
    //var salesAreaRefs =currentObject.getClassificationProductLinks(ref).toArray();
    var salesAreaRefs = currentObject.queryClassificationProductLinks(ref).asList("20000").toArray();
	if(groupName.startsWith("XL0402")){
		groupName=groupName+"_"+currentObject.getValue("Country_TM").getSimpleValue();
	}
	for each(var currSalesRef in salesAreaRefs){
		if(currSalesRef.getClassification().getID()==groupName){
			currSalesRef.getValue("ProductStatus").setSimpleValue(productStatusValue);
		}
	}
	//To populate CLM Dates
	var approveCLMDates = populateCLMDatesForGTIN(productIM,productStatusValue,logger,manager);
	//To store the previous status of the Package for content order
	if(productIM.getValue("GTINStatus").getSimpleValue()!= productStatusValue){
		productIM.getValue("PreviousGTINStatus").setSimpleValue(productIM.getValue("GTINStatus").getSimpleValue());
	}
	//For populating ItemPIMIDAttribute
	var pimID = productIM.getID();
	var pimIDArray = pimID.split("_");
	var itGtin10 = productIM.getValue("ITGTIN_10digits").getSimpleValue();
	var csGtin10 = productIM.getValue("CaseGTIN_10digits").getSimpleValue();
	var gtin = pimIDArray[0];
	var groupName = pimIDArray[1];
	if(productIM.getObjectType().getID() == "Each"){
		var partialGtinID = itGtin10+"_"+groupName+"_"+productStatus;
		productIM.getValue("ItemPIMIDAttribute").setSimpleValue(partialGtinID);
	}
	else if(productIM.getObjectType().getID() == "Case"){
		var partialGtinID = csGtin10+"_"+groupName+"_"+productStatus;
		productIM.getValue("ItemPIMIDAttribute").setSimpleValue(partialGtinID);		
	}
	else{
		productIM.getValue("ItemPIMIDAttribute").setSimpleValue("");
	}
	//Handle in all Context.
	var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	var contextCountry=productIM.getValue("Country_TM").getSimpleValue();
	var context = lookupTable.getLookupTableValue("GlobalContext",contextCountry);
	var allContext=getGlobalContext(context);
	productIM.setName(currentObject.getValue("SAPBasicDescription").getSimpleValue());
	//Step1 Populate PIM duplicate check attribute														
	productIM.getValue("GTINStatus").setSimpleValue(productStatusValue);
	productIM.getValue("ItemProductStatus").setSimpleValue(productStatusValue);
	productIM.getValue("CaseProductStatus").setSimpleValue(productStatusValue);
	productIM.getValue("ProductStatus").setSimpleValue(productStatusValue);
	populateCustomers(productIM,currentObject,manager);
	calculateAttributes(manager,productIM,log,trigger);
	totalPackingItems.push(productIM);
	log.info("totalPackingItems == " +totalPackingItems);
	for(var i=0;i<totalPackingItems.length;i++){
		//to populate Produc_Status_New at TM level
		populateProductStatusNewAtTM(totalPackingItems[i],logger,manager,trigger);
		//To populate GTIN_Status_New at packaging reference level
		populateGTINStatusNew(totalPackingItems[i],logger,manager);
		//To populate Product_Status_New at Packaging level
		toPopulateProductStatusNewAtPacks(totalPackingItems[i],logger,manager,trigger);
		for each(var allContext1 in allContext){
			manager.executeInContext(allContext1, function(manager){
				var gtinEnglish = manager.getObjectFromOtherManager(totalPackingItems[i]);
				gtinEnglish.approve();
			});
		}
		/*if(totalPackingItems[i].getObjectType().getID()=="Case"){
			if(totalPackingItems[i].getValue("MaterialSubType").getSimpleValue() == "DISPLAY" || totalPackingItems[i].getValue("MaterialSubType").getSimpleValue() == "Display"){
				trigger.republish(totalPackingItems[i]);
			}			
		}
		else if(totalPackingItems[i].getObjectType().getID()=="Each"){
			if(totalPackingItems[i].getValue("MaterialSubType").getSimpleValue() != "DISPLAY" && totalPackingItems[i].getValue("MaterialSubType").getSimpleValue() != "Display"){
				trigger.republish(totalPackingItems[i]);
			}
		}*/
	}
	var attsArray = ["InMarket","UpdateInMarket","FutureInMarket","UpdateFutureInMarket","ConsumerFutureInMarket",
					"UpdateConsumerFutureInMarket","PreviousInMarket","UpdatePreviousInMarket","PreviousInMarket","UpdatePreviousInMarket",
					"PGPInMarket","PGPUpdateInMarket","PGPFutureInMarket","PGPUpdateFutureInMarket","PGPConsumerFutureInMarket",
					"PGPUpdateConsumerFutureInMarket","PGPPreviousInMarket","PGPUpdatePreviousInMarket"];
	if(approveCLMDates != null){
		approval.approveAttributesOnNode(attsArray,approveCLMDates,null,manager,log);
	}
}
/*@Author Akhil
 * populate status in all GTIN's like Case,Pallet,Item and all.
*/
function getEffectedProducts(productIM,groupName,manager,logger){
	var returnProducts = new Array();
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
    //SS-23684 getmethod to querymethod replacement
    //var tmRefsArray = productIM.getReferences(tmReferenceType).toArray();
    var tmRefsArray = productIM.queryReferences(tmReferenceType).asList("20000").toArray();
    var targetMarket = tmRefsArray[0].getTarget();
    var fpcCode = targetMarket.getValue("FinishedProductCode").getSimpleValue();
    //SS-24995 getmethod to querymethod replacement
    //var childs = targetMarket.getParent().getChildren().toArray();
    var childs = targetMarket.getParent().queryChildren();
    //for each(var childObj in childs) {
    childs.forEach(function (childObj) {
		if(childObj.getObjectType().getID()=="FPC_UOM"){
			var gtinValue = childObj.getValue("GTIN").getSimpleValue();
			if(gtinValue){
				var packID = gtinValue+"_"+groupName+"_"+fpcCode;
				var packObj = manager.getProductHome().getProductByID(packID);
				if(packObj){
					returnProducts.push(packObj);
				}
			}
		}
        return true; //added return as part of SS-24995
    });
	//log.info("getEffectedProducts == "+returnProducts);
	return returnProducts;
	//log.info("getEffectedProducts == "+returnProducts);
}
/*@Author Anandhi
 * populate PreviousInMarket status in sales area reference level
*/
function populatePreviousInMarketStatus(salesAreaRef1,lifeCycleRef,econtentDate,marketApprovalStatus,curObj,manager,logger,trigger,phTrigger){
    //var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
    //SS-24166 getmethod to querymethod replacement
    //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
    var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");

    //SS-24166 getmethod to querymethod replacement
    //var salesAreaRefs =curObj.getClassificationProductLinks(salesAreaReferenceType).toArray();
    var salesAreaRefs = curObj.queryClassificationProductLinks(salesAreaReferenceType).asList("20000").toArray();
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var uomReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_UOM_Reference");
	var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
	var poaEnoviaReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_POA"); //PRB0119238
	 //commented as part of SS-24338 var fcReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_FC");
	var imageReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("ProductImage");
	var consumerCheck = checkConsumerMarketEligibility(curObj,groupName,manager,logger);
	var parentFPC=curObj.getParent();
    //SS-23684 getmethod to querymethod replacement
    //var fpcToPOARefs=parentFPC.getReferences(poaReferenceType).toArray();
    var fpcToPOARefs = parentFPC.queryReferences(poaReferenceType).asList("20000").toArray();
	//Start of PRB0119238
    var fpcToEnoviaPOA = parentFPC.queryReferences(poaEnoviaReferenceType).asList("20000").toArray();
    var fpctopoalinkavailable = 0;
    if (fpcToPOARefs.length > 0 || fpcToEnoviaPOA.length > 0) { // End of PRB0119238
        fpctopoalinkavailable = 1;
    }
	for each(var salesAreaRef in salesAreaRefs){
		if(salesAreaRef1.getClassification().getID() ==salesAreaRef.getClassification().getID()){			
			if(salesAreaRef.getValue("ProductStatus").getSimpleValue()== null || salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Previous In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Previous Consumer In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Shipping In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Future In Market"){
				if(consumerCheck && fpctopoalinkavailable==1){
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous Consumer In Market");
					log.info("Product Status 1 (populatePreviousInMarketStatus) == "+salesAreaRef.getValue("ProductStatus").getSimpleValue());
				}
				else if(consumerCheck){
					var groupName  = salesAreaRef.getClassification().getID();
					if(groupName != "US61"&& groupName != "USY1" && groupName != "US65"&& groupName != "US64"&& groupName != "CA01"&& groupName != "PR04"&& groupName != "PH0302" && groupName != "US60"&& groupName != "CA00"){
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous Consumer In Market");
						log.info("Product Status 2 (populatePreviousInMarketStatus) == "+salesAreaRef.getValue("ProductStatus").getSimpleValue());
					}
					else{
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous In Market");
						log.info("Product Status 3 (populatePreviousInMarketStatus) == "+salesAreaRef.getValue("ProductStatus").getSimpleValue());
					}
				}
				else{
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous In Market");
					log.info("Product Status 4 (populatePreviousInMarketStatus) == "+salesAreaRef.getValue("ProductStatus").getSimpleValue());
				}
			}
			else if(salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Consumer Future In Market"){
				log.info("Previosuly it was Futute In market or in consumer Future  in market , remove from packaging hierarchy");
                //SS-24166 getmethod to querymethod replacement
                //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
                var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
                //To find the similar products whose PIMID ends with "FIM"
                var singlehome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
                var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
                var groupNameCheck = salesAreaRef.getClassification().getID();
                var groupName = groupNameCheck.replace("_", "");

                //SS-24995 getmethod to querymethod replacement
                //var children = curObj.getParent().getChildren().toArray();
                var children = curObj.getParent().queryChildren();
                var itemCheck = 0;
                var caseCheck = 0;
                var itemObject;
                //for each(var childObjectUOM in children) {
                children.forEach(function (childObjectUOM) {
					if(childObjectUOM.getObjectType().getID()=="FPC_UOM"){
						var uomType = childObjectUOM.getValue("PackagingUOMType").getSimpleValue();			
						if(uomType=="Each"){
						     itemObject =childObjectUOM;
							var itemgtin=childObjectUOM.getValue("GTIN").getSimpleValue();				
							if(itemgtin != null && itemgtin != ""){
								itemCheck++;					
							}				
						}
						if(uomType=="Case"){
							var caseObject =childObjectUOM;
							var casegtin=childObjectUOM.getValue("GTIN").getSimpleValue();
							if(casegtin != null && casegtin != ""){
								caseCheck++;
							}				
						}			
					}
                    return true; //added return as part of SS-24995
                });
				var itemCaseArray = new Array();
				itemCaseArray.push(itemObject);
				if(caseCheck==1 && itemCheck==0 ){
					//No Item object is there so put as directly Future In Market
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Future In Market");
					log.info("Product Status 5 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
				}
				for each(var childItem in itemCaseArray){
					if(childItem.getObjectType().getID()=="FPC_UOM"){
						var gtin = childItem.getValue("GTIN").getSimpleValue();						
                        //RITM6167607 getApproveStatus to getApprovalStatus replacement
                        //if(gtin != null &&  childItem.getApproveStatus() != "Not Approved"&&(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each")){
                        if (gtin != null && childItem.getApprovalStatus() != "Not Approved" && (childItem.getValue("PackagingUOMType").getSimpleValue() == "Each")) {
							var objectID = gtin+"_"+groupName+"_"+"FIM";
							var fpcCode=curObj.getValue("FinishedProductCode").getSimpleValue();
							if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
								var currentEach=gtin+"_"+groupName+"_"+fpcCode;
								var currentEachObject=manager.getProductHome().getProductByID(currentEach);
							}
							var  allProductsIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,objectID)).asList(100).toArray();
							//To get packages only with case object type					
							var productsITIM=new Array();					
							for each(var packObject in allProductsIM){
								if(packObject.getObjectType().getID()=="Each"){
									productsITIM.push(packObject);
								}
							}
							for each(var productITIM in productsITIM){
								var id=productITIM.getID();						
								if(currentEachObject !=null && id == currentEachObject.getID()){
									var index = productsITIM.indexOf(productITIM);
									if (index > -1) {
										productsITIM.splice(index, 1);
									}
								}
							}
							if(productsITIM.length >= 1){
								log.info("Execute sortAndSetFutureConsumerInMarket (populatePreviousInMarketStatus) Function");
								sortAndSetFutureConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj);
							}					
						}
					}
				}
				if(consumerCheck && fpctopoalinkavailable==1){
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous Consumer In Market");
					log.info("Product Status 6 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
				}
				else if(consumerCheck){
					var groupName  = salesAreaRef.getClassification().getID();
					if(groupName != "US61"&& groupName != "USY1" && groupName != "US65"&& groupName != "US64"&& groupName != "CA01"&& groupName != "PR04"&& groupName != "PH0302" && groupName != "US60"&& groupName != "CA00"){
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous Consumer In Market");
						log.info("Product Status 7 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
					}
					else{
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous In Market");
						log.info("Product Status 8 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
					}
				}
				else{
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous In Market");
					log.info("Product Status 9 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
				}
			}	
			else if(salesAreaRef.getValue("ProductStatus").getSimpleValue()== "In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Consumer In Market" ){
				log.info("Previosuly it was in market or in consumer in market");
				//To find the similar products whose PIMID ends with "IM"
				var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
				var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
				var groupNameCheck  = salesAreaRef.getClassification().getID();
				var groupName=groupNameCheck.replace("_","");
                //SS-24995 getmethod to querymethod replacement
                //var children = curObj.getParent().getChildren().toArray();
                var children = curObj.getParent().queryChildren();
                //for each(var childItem in children) {
                children.forEach(function (childItem) {
					if(childItem.getObjectType().getID()=="FPC_UOM"){
						var gtin = childItem.getValue("GTIN").getSimpleValue();						
                        //RITM6167607 getApproveStatus to getApprovalStatus replacement
                        //if(gtin != null &&  childItem.getApproveStatus() != "Not Approved"&&(childItem.getValue("PackagingUOMType").getSimpleValue()=="Case"||childItem.getValue("PackagingUOMType").getSimpleValue()=="Each")){
                        if (gtin != null && childItem.getApprovalStatus() != "Not Approved" && (childItem.getValue("PackagingUOMType").getSimpleValue() == "Case" || childItem.getValue("PackagingUOMType").getSimpleValue() == "Each")) {
							var objectID = gtin+"_"+groupName+"_"+"IM";
							var fpcCode=curObj.getValue("FinishedProductCode").getSimpleValue();
							if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Case"){
								var currentCase=gtin+"_"+groupName+"_"+fpcCode;
								var currentCaseObject=manager.getProductHome().getProductByID(currentCase);
							}
							if(childItem.getValue("PackagingUOMType").getSimpleValue()=="Each"){
								var currentEach=gtin+"_"+groupName+"_"+fpcCode;
								var currentEachObject=manager.getProductHome().getProductByID(currentEach);
							}
							var  allProductsIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,objectID)).asList(100).toArray();
							//To get packages only with case object type
							var productsCaseIM = new Array();
							var productsITIM=new Array();
							for each(var packObject in allProductsIM){
								if(packObject.getObjectType().getID()=="Case"){
									productsCaseIM.push(packObject);
								}
							}
							for each(var packObject in allProductsIM){
								if(packObject.getObjectType().getID()=="Each"){
									productsITIM.push(packObject);
								}
							}
							if(salesAreaRef.getValue("ProductStatus").getSimpleValue()== "Consumer In Market"){
								for each(var productITIM in productsITIM){
									var id=productITIM.getID();
									if(currentEachObject !=null && id == currentEachObject.getID()){
										var index = productsITIM.indexOf(productITIM);
										if (index > -1) {
											productsITIM.splice(index, 1);
										}
									}
								}
								if(productsITIM.length >= 1){
									log.info("Execute sortAndSetConsumerInMarket (populatePreviousInMarketStatus) Function");
									sortAndSetConsumerInMarket(productsITIM,logger,poaReferenceType,imageReferenceType,lifeCycleRef,groupName,manager,trigger,phTrigger,curObj);		
								}						
							}
                            if (salesAreaRef.getValue("ProductStatus").getSimpleValue() == "Shipping In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue() == "In Market" || salesAreaRef.getValue("ProductStatus").getSimpleValue() == "Consumer In Market") {

								for each(var productCaseIM in productsCaseIM){
									var id=productCaseIM.getID();
									if(currentCaseObject !=null && id == currentCaseObject.getID()){
										var index = productsCaseIM.indexOf(productCaseIM);
										if (index > -1) {
											productsCaseIM.splice(index, 1);
										}
									}
								}
								if(productsCaseIM.length >= 1){	
									log.info("Execute sortAndSetInMarket (populatePreviousInMarketStatus) Function");
									sortAndSetInMarket(lifeCycleRef,productsCaseIM,curObj,tmReferenceType,currentCaseObject,logger,groupName,manager,trigger,curObj);
								}	
							}
						}
					}
                    return true; //added return as part of SS-24995
                });
				if(consumerCheck && fpctopoalinkavailable==1){
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous Consumer In Market");
				}
				else if(consumerCheck){
					var groupName  = salesAreaRef.getClassification().getID();
					if(groupName != "US61"&& groupName != "USY1" && groupName != "US65"&& groupName != "US64"&& groupName != "CA01"&& groupName != "PR04"&& groupName != "PH0302" && groupName != "US60"&& groupName != "CA00"){
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous Consumer In Market");
						log.info("Product Status 10 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
					}
					else{
						salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous In Market");
						log.info("Product Status 11 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
					}
				}
				else{
					salesAreaRef.getValue("ProductStatus").setSimpleValue("Previous In Market");
					log.info("Product Status 12 (populatePreviousInMarketStatus) == " +salesAreaRef.getValue("ProductStatus").getSimpleValue());
				}
			}	
		}
	}
}
/*@Author Anusha
 * populate References at packaging  level
*/
function referenceHandling(sourceObj,manager,packagingHirarchyObj,ReferenceType,refID){
	var refToBeCreated = new java.util.LinkedList();
	var refExisting = new java.util.LinkedList();
	var additionalRefs = new Array();
    //SS-23684 getmethod to querymethod replacement
    //var tmRefs = packagingHirarchyObj.getReferences(ReferenceType).toArray();
    var tmRefs = packagingHirarchyObj.queryReferences(ReferenceType).asList("20000").toArray();
	for each (tmRef in tmRefs){
		refExisting.push(tmRef.getTarget());
	}
	//log.info(refExisting);
    //SS-23684 getmethod to querymethod replacement
    //var refs = sourceObj.getReferences(ReferenceType).toArray();
    var refs = sourceObj.queryReferences(ReferenceType).asList("20000").toArray();
	for(var l=0;l<refs.length;l++){
		var ref = refs[l];
		refItem = ref.getTarget();
		refToBeCreated.push(refItem);
		additionalRefs.push(refItem);																					
	}
	if(refID == "FPC_to_POA"){
		var ReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_POA");
	}
	//Deletion of unwanted References
    //SS-23684 getmethod to querymethod replacement
    //var objRefs = packagingHirarchyObj.getReferences(ReferenceType).toArray();
    var objRefs = packagingHirarchyObj.queryReferences(ReferenceType).asList("20000").toArray();
	for each(objRef in objRefs){
		if(!(refToBeCreated.contains(objRef.getTarget()))){
			objRef.delete();
		}
	}
	//Creation of References
	for each (var ref in additionalRefs){
		if(!(refExisting.contains(ref))){
			packagingHirarchyObj.createReference(ref,refID);
		}
	}
}
/*@Author Anandhi
 * populate References at packaging  level
*/
//removed fcReferenceType from arguments as part of SS-24338
function populateReferencesAtPackagingLevel(tm,fpc,packagingHirarchyObj,poaReferenceType,imageReferenceType,manager,allUomReferenceType,logger){
	//logger.info("Inside This Function populateReferencesAtPackagingLevel");	
	var sdsReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("TM_to_SDS");
	var promotionalRefType = manager.getReferenceTypeHome().getReferenceTypeByID("TMtoPromotionalEvent");
	var approvedFpcObj = getApprovedNode(manager,fpc); 
	if(approvedFpcObj){
		//Formula Card reference
		//commented as part of SS-24338 referenceHandling(approvedFpcObj, manager, packagingHirarchyObj, fcReferenceType, "FPC_to_FC");
		referenceHandling(approvedFpcObj,manager,packagingHirarchyObj,poaReferenceType,"FPC_to_POA");
		referenceHandling(approvedFpcObj,manager,packagingHirarchyObj,poaReferenceType,"FPCToPOA");
	}
	//Asset reference
	var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	var contextCountry=packagingHirarchyObj.getValue("Country_TM").getSimpleValue();
	var context = lookupTable.getLookupTableValue("GlobalContext",contextCountry);
	if(context){
		var contextArray =[];
		var tempcontext;
		if(context.indexOf(",")>0){
			var contextSplit = context.split(",");
			for each(var language in contextSplit){
				if(language.match(" ")){
					var language = language.replace(" ", "");
				}
				if(language=="English"){
					tempcontext = "Context1";
				}
				else if(language=="French"){
					tempcontext = "Context3";
				}
				else{
					tempcontext = language;
				}
				contextArray.push(tempcontext);				
			}
		}
		else{
			if(context=="English"){
				tempcontext = "Context1";
			}
			else if(context=="French"){
				tempcontext = "Context3";
			}
			else{
				tempcontext = context;
			}
			contextArray.push(tempcontext);		
		}
	}
				
	for each(var context in contextArray){
		//logger.info("Execute PH in Line muber 2145"+context+ " "+packagingHirarchyObj);
		manager.executeInContext(context, function(demanager) {
			targetMarketMain=demanager.getObjectFromOtherManager(tm);
			packagingHirarchyObjEnglish = demanager.getObjectFromOtherManager(packagingHirarchyObj);
			referenceHandling(targetMarketMain,manager,packagingHirarchyObjEnglish,imageReferenceType,"ProductImage");
			//To create references present in Approved space and copy meatadata from approved space
			demanager.executeInWorkspace("Approved", function(manager1){
				var approvedTMCont1Obj=manager1.getObjectFromOtherManager(targetMarketMain);
				if(approvedTMCont1Obj){
                    //SS-23684 getmethod to querymethod replacement
                    //var refs =approvedTMCont1Obj.getReferences(imageReferenceType).toArray();
                    var refs = approvedTMCont1Obj.queryReferences(imageReferenceType).asList("20000").toArray();
					for(var l=0;l<refs.length;l++){
						var ref = refs[l];
						refItem = ref.getTarget();
						var refFlag=true;
						var packrefs=packagingHirarchyObjEnglish.getReferences(imageReferenceType).toArray();
						
                        //SS-23684 getmethod to querymethod replacement
                        //var packrefs=packagingHirarchyObjEnglish.getReferences(imageReferenceType).toArray();
                        var packrefs = packagingHirarchyObjEnglish.queryReferences(imageReferenceType).asList("20000").toArray();
						inner1:for each(var packref in packrefs){
			
							if(packref.getTarget().getValue("AssetID").getSimpleValue() == refItem.getValue("AssetID").getSimpleValue()){
								refFlag=false;							
								packref.getValue("AssetUsage").setSimpleValue(removeNull(ref.getValue("AssetUsage").getSimpleValue()));
								packref.getValue("AssetSequence").setSimpleValue(removeNull(ref.getValue("AssetSequence").getSimpleValue()));
								packref.getValue("ValidityEndDate").setSimpleValue(removeNull(ref.getValue("ValidityEndDate").getSimpleValue()));
								packref.getValue("ValidityStartDate").setSimpleValue(removeNull(ref.getValue("ValidityStartDate").getSimpleValue()));
								packref.getValue("ValidityStartDate").setSimpleValue(removeNull(ref.getValue("ValidityStartDate").getSimpleValue()));
								packref.getValue("AssetPreCurationStatus").setSimpleValue(removeNull(ref.getValue("AssetPreCurationStatus").getSimpleValue()));
								//Commented as part of SS-25074
								//packref.getValue("BrandbankMediaType").setSimpleValue(removeNull(ref.getValue("BrandbankMediaType").getSimpleValue()));
								//added part of SS-25685
                                		assetLib.setBrandBankMediaType(approvedTMCont1Obj, packref, removeNull(ref.getValue("BrandbankMediaType").getSimpleValue()));
                                        packref.getValue("AssetCurationStatus").setSimpleValue(removeNull(ref.getValue("AssetCurationStatus").getSimpleValue()));
								packref.getValue("CustomerAssetDesignation_Reference").setSimpleValue(removeNull(ref.getValue("CustomerAssetDesignation_Reference").getSimpleValue()));
								break inner1;
								
							}
						}
					}
				}
			})
			//SDS Refernce
			referenceHandling(targetMarketMain,manager,packagingHirarchyObjEnglish,sdsReferenceType,"TM_to_SDS");
		})		
	}	
	//Promotional Event references
	var approvedTMObj = getApprovedNode(manager, tm);
	if(approvedTMObj){
		referenceHandling(approvedTMObj,manager,packagingHirarchyObj,promotionalRefType,"TMtoPromotionalEvent");
	}
	/*	Anandhi
	UOM All References
	*/
	var uomRefCreated = new java.util.LinkedList();
	var uomRefExisting = new java.util.LinkedList();
    //SS-23684 getmethod to querymethod replacement
    //var packrefs=packagingHirarchyObj.getReferences(allUomReferenceType).toArray();
    var packrefs = packagingHirarchyObjEnglish.queryReferences(allUomReferenceType).asList("20000").toArray();
	for each(var packref in packrefs){
		uomRefExisting.push(packref.getTarget());
	}
	var approvedFPCObj = getApprovedNode(manager, fpc);
	if(approvedFPCObj){
        //SS-24995 getmethod to querymethod replacement
        //var children = approvedFPCObj.getChildren().toArray();
        var children = approvedFPCObj.queryChildren();
        //for (var i = 0; i < children.length; i++) {
        children.forEach(function (childItem) {
            //var childItem = children[i];
			if(childItem.getObjectType().getID()=="FPC_UOM"){
				uomRefCreated.push(childItem);
				if(!(uomRefExisting.contains(childItem))){
					packagingHirarchyObj.createReference(childItem,"PKG_AllUOM_Reference");										
				}
            }
            return true; //added return as part of SS-24995
        });

        //SS-23684 getmethod to querymethod replacement
        //var packrefs = packagingHirarchyObj.getReferences(allUomReferenceType).toArray();
        var packrefs = packagingHirarchyObj.queryReferences(allUomReferenceType).asList("20000").toArray();
		for each(var packRef in packrefs){
			if(!(uomRefCreated.contains(packRef.getTarget()))){
				packRef.delete();
			}
		}
		//Reference Creation of Price 
		var priceRefCreated = new java.util.LinkedList();
		var priceRefExisting = new java.util.LinkedList();
		var fpmpriceRefCreated = new java.util.LinkedList();
		var fpmpriceRefExisting = new java.util.LinkedList();
		var fpmPriceReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("GTINToFPMPrice");
		var priceReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("GTINToPrice");
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = packagingHirarchyObj.getReferences(fpmPriceReferenceType).toArray();
        var packrefs = packagingHirarchyObj.queryReferences(fpmPriceReferenceType).forEach(function (ref) {
            fpmpriceRefExisting.push(ref.getTarget());
            return true;
        });
        /*
		for each(var packref in packrefs){
			fpmpriceRefExisting.push(packref.getTarget());
		}
         */

        //SS-23684 getmethod to querymethod replacement
        //var packrefs = packagingHirarchyObj.getReferences(priceReferenceType).toArray();
        var packrefs = packagingHirarchyObj.queryReferences(priceReferenceType).forEach(function (ref) {
            priceRefExisting.push(ref.getTarget());
            return true;
        });
        /*
        for each(var packref in packrefs){
        priceRefExisting.push(packref.getTarget());
        }
         */
		var packageID = packagingHirarchyObj.getID();		
		var splitArray = packageID.split("_");
		var packSaleaArea = splitArray[1];
        //SS-24995 getmethod to querymethod replacement
        //var childObjects = fpc.getChildren().toArray();
        var childObjects = fpc.queryChildren();
        //for (var p = 0; p < childObjects.length; p++) {
        childObjects.forEach(function (p) {
            var objectType = p.getObjectType().getID(); //SS-24995 changed childObjects[p] to p
            if (objectType == "FPC_FuturePrice" || objectType == "FPC_Price") {
                var priceFlag = p.getValue("PriceFlag").getSimpleValue(); //SS-24995 changed childObjects[p] to p
                if (priceFlag != "X") {
                    var priceObjectId = p.getID(); //SS-24995 changed childObjects[p] to p
					var priceObject = manager.getProductHome().getProductByID(priceObjectId);
					if(priceObject){
						var priceSalesArea = priceObject.getValue("PriceSalesOrg").getSimpleValue();
						if(packSaleaArea==priceSalesArea){
							if(objectType=="FPC_FuturePrice"){
								if(priceSalesArea == "PH0303" || priceSalesArea == "PH0302"){
									var priceType = priceObject.getValue("PriceType").getSimpleValue();
									if(priceType == "FPM"){
										fpmpriceRefCreated.push(priceObject);
										if(!(fpmpriceRefExisting.contains(priceObject))){
											packagingHirarchyObj.createReference(priceObject,"GTINToFPMPrice");
										}
									}
									else{
										priceRefCreated.push(priceObject);
										if(!(priceRefExisting.contains(priceObject))){
											packagingHirarchyObj.createReference(priceObject,"GTINToPrice");
										}
									}
								}
								else{
									var priceReleaseDate = priceObject.getValue("PriceReleaseDate").getSimpleValue();
									var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
									if(!(priceReleaseDate == null)){
										var replaceString = priceReleaseDate.replace("-", "/");
										var stepdate = new Date(replaceString);
										if(stepdate<=currentDate){							
											var priceType = priceObject.getValue("PriceType").getSimpleValue();
											if(priceType == "FPM" || priceType == "Suggested RETAIL Price (Low)" || priceType == "Suggested RETAIL Price (High)" || priceType == "Suggested MERCH Price (Low)" || priceType == "Suggested MERCH Price (High)" || priceType == "Single Item FPM Window"){
												fpmpriceRefCreated.push(priceObject);
												if(!(fpmpriceRefExisting.contains(priceObject))){
													packagingHirarchyObj.createReference(priceObject,"GTINToFPMPrice");
												}
											}
											else{
												priceRefCreated.push(priceObject);
												if(!(priceRefExisting.contains(priceObject))){
													packagingHirarchyObj.createReference(priceObject,"GTINToPrice");
												}
											}
										}		
									}
								}	
							}
							else if(objectType=="FPC_Price"){
								var priceType = priceObject.getValue("PriceType").getSimpleValue();
								if(priceType == "FPM" || priceType == "Suggested RETAIL Price (Low)" || priceType == "Suggested RETAIL Price (High)" || priceType == "Suggested MERCH Price (Low)" || priceType == "Suggested MERCH Price (High)" || priceType == "Single Item FPM Window"){
									fpmpriceRefCreated.push(priceObject);
									if(!(fpmpriceRefExisting.contains(priceObject))){
										packagingHirarchyObj.createReference(priceObject,"GTINToFPMPrice");
									}
								}
								else{
									priceRefCreated.push(priceObject);
									if(!(priceRefExisting.contains(priceObject))){
										packagingHirarchyObj.createReference(priceObject,"GTINToPrice");
									}
								}
							}		
						}
					}
				}
			}
            return true; //added return as part of SS-24995
        });
        //Deletion of Price Refernces
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = packagingHirarchyObj.getReferences(priceReferenceType).toArray();
        var packrefs = packagingHirarchyObj.queryReferences(priceReferenceType).asList("20000").toArray();
        for each(var packRef in packrefs) {
            if (!(priceRefCreated.contains(packRef.getTarget()))) {
                packRef.delete();
            }
        }
        //Deletion of FPM Price References
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = packagingHirarchyObj.getReferences(fpmPriceReferenceType).toArray();
        var packrefs = packagingHirarchyObj.queryReferences(fpmPriceReferenceType).asList("20000").toArray();
		for each(var packRef in packrefs){
			if(!(fpmpriceRefCreated.contains(packRef.getTarget()))){
				packRef.delete();
			}
		}
	}
}
/**@Author Akhil Reddy
 * populatePOAAttributes function populates values of POA attributes to PAckaging Hierarchy level
 */
function populatePOAAttributes(totalPackingItem,currentObject,manager){
	//Entering English context
	var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	var contextCountry=currentObject.getValue("Country_TM").getSimpleValue();
	var globalContext = lookupTable.getLookupTableValue("GlobalContext",contextCountry);
	var globalRegion = currentObject.getValue("GlobalRegion").getSimpleValue();
	//NA region restriction added by Aravinth --> Part of Artwork
    if(globalRegion != "NA" && globalRegion != "LA"){
	var allContext=getGlobalContext(globalContext);
	for each(var allContext1 in allContext){	
		manager.executeInContext(allContext1, function(manager){
			var packagingEnglish = manager.getObjectFromOtherManager(totalPackingItem);
			var poaReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
                //SS-23684 getmethod to querymethod replacement
                //var poaReferences = packagingEnglish.getReferences(poaReferenceType).toArray();
                var poaReferences = packagingEnglish.queryReferences(poaReferenceType).asList("20000").toArray();
			var TMReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
                //SS-23684 getmethod to querymethod replacement
                //var TMReferences = packagingEnglish.getReferences(TMReferenceType).toArray();
                var TMReferences = packagingEnglish.queryReferences(TMReferenceType).asList("20000").toArray();
			var poaAttributeHome = manager.getAttributeGroupHome().getAttributeGroupByID("PackagingHierarchyPOAAttributes");
			var poaAttributes = poaAttributeHome.getAttributes();
			var TMObject= TMReferences[0].getTarget();			
			var it = poaAttributes.iterator();
			while ( it.hasNext() ){
				var attribute = it.next();
				var attributeID = attribute.getID();
				var attr = "TM_"+attributeID;
				if(attributeID=="IsTheProductLiquidInDoubleSealContainer?"){
					packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(TMObject.getValue("TM_IsTheProductLiquidInDoubleSealContain").getSimpleValue()));
				}
				else if(artworkAttributeCheck(attr,"POATMDuplicateAttributes",manager)){
					packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(TMObject.getValue(attr).getSimpleValue()));
				}
				//Added by Kevin as part of SS-24763
                	if (globalRegion == "EU") {
                		if (attributeID == "ManufacturersAddress") {
                			packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(TMObject.getValue("TM_ManufacturersAddress").getSimpleValue()));
                		} else if (attributeID == "NetContentStatement") {
                			packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(TMObject.getValue("TM_NetContentStatement").getSimpleValue()));
                		}
                	}
                	//
				for(var j=0;j<poaReferences.length;j++){
					var poaObject = poaReferences[j].getTarget();						
					if(attributeID!="Package_ChokingHazardWarning"&&attributeID!="Package_Multipack"&&attributeID!="Package_DoesProducthaveaWarranty"&&attributeID!="Package_NumberofBlades"&&attributeID!="Package_NumberofSpeedsModes"&&attributeID!="Package_SheetCountinITPerRoll"&&attributeID!="Package_POA_ID"&&attributeID!="Package_POANumber"&&attributeID!="Package_Mustbe18YearsorOldertoPurchase?"&&attributeID!="Package_IsliquidinDoubleSealedContainer?"&&attributeID!="IsTheProductLiquidInDoubleSealContainer?"&&attributeID!="IstheItemSIOC?"){
						if(artworkAttributeCheck(attributeID,"POAAttributesFromEnnovia",manager)){
							packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue(attribute.getID()).getSimpleValue()));
						}
					}
					else if(attributeID=="Package_ChokingHazardWarning"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("ChokingHazardWarning").getSimpleValue()));
					}
					else if(attributeID=="Package_Multipack"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("Multipack").getSimpleValue()));
					}
					else if(attributeID=="Package_DoesProducthaveaWarranty"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("DoesProducthaveaWarranty").getSimpleValue()));
					}
					else if(attributeID=="Package_NumberofBlades"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("NumberofBlades").getSimpleValue()));
					}
					else if(attributeID=="Package_NumberofSpeedsModes"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("NumberofSpeedsModes").getSimpleValue()));
					}
					else if(attributeID=="Package_SheetCountinITPerRoll"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("SheetCountinITPerRoll").getSimpleValue()));
					}
					else if(attributeID=="Package_POANumber"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("POANumber").getSimpleValue()));
					}
					else if(attributeID=="Package_POA_ID"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getID()));
					}
					else if(attributeID=="Package_Mustbe18YearsorOldertoPurchase?"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("Mustbe18YearsorOldertoPurchase?").getSimpleValue()));
					}
					else if(attributeID=="Package_IsliquidinDoubleSealedContainer?"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("IsproductaliquidinDoubleSealedContainer?").getSimpleValue()));
					}
					else if(attributeID=="IstheItemSIOC?"){
						packagingEnglish.getValue(attribute.getID()).setSimpleValue(removeNull(poaObject.getValue("ShipsinOwnContainer").getSimpleValue()));
					}
				}				
			}		
		})
	}
	}
 }
function removeNull(attributeValue){	
 	if(attributeValue==null){
 		return "";
 	}
 	else{
 		return attributeValue;
 	}
 	
 }
function artworkAttributeCheck(attributeID,attributeGroupID,manager){
	var attributeHome=manager.getAttributeGroupHome().getAttributeGroupByID(attributeGroupID);
	var attributes=attributeHome.getAttributes();
	var iterate = attributes.iterator();
	while ( iterate.hasNext() ){
		var attr = iterate.next();
		var attrID = attr.getID();
		if (attributeID==attrID){
			return true;
		}
	}
 }
/**
  * @Author Akhil Reddy
  * function populatePackagingAdditionalAttributes iterates PackagingAdditionalAttributes attribute group
  * 
  */
 function populatePackagingAdditionalAttributes(totalPackingItem,currentObject,manager){
    //SS-24995 getmethod to querymethod replacement
    //var childrenObjects = currentObject.getParent().getChildren().toArray();
    var childrenObjects = currentObject.getParent().queryChildren();
    //count = childrenObjects.length;
    var country = currentObject.getValue("Country_TM").getSimpleValue();
    ////SS-24995 Add caseObject, itemObject declaration and delete "var" inside loop
    var caseObject;
    var itemObject;
    //for (var k = 0; k < childrenObjects.length; k++) {
    childrenObjects.forEach(function (k) {
		//For getting the Case Object and Item object under FPC
        if (k.getObjectType().getID() == "FPC_UOM") {
            var uomType = k.getValue("PackagingUOMType").getSimpleValue();
            if (uomType == "Case") {
                caseObject = k; //SS-24995 removed var declaration
            }
            if (uomType == "Each") {
                itemObject = k; //SS-24995 removed var declaration
            }
        }
        return true; //added return as part of SS-24995
    });
	if(itemObject){		
		if(country=="US" || country=="PR"){
			totalPackingItem.getValue("PackageHeight").setSimpleValue(itemObject.getValue("Height_Imperial").getSimpleValue());
			totalPackingItem.getValue("PackageHeightUOM").setSimpleValue(itemObject.getValue("Height_Imperial_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageHeightUOMValue").setSimpleValue(itemObject.getValue("Height_Imperial_Value").getSimpleValue());
			totalPackingItem.getValue("PackageLength/Depth").setSimpleValue(itemObject.getValue("Length_Imperial").getSimpleValue());
			totalPackingItem.getValue("PackageLength/DepthUOM").setSimpleValue(itemObject.getValue("Length_Imperial_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageLength/DepthValue").setSimpleValue(itemObject.getValue("Length_Imperial_Value").getSimpleValue());
			totalPackingItem.getValue("PackageWidth").setSimpleValue(itemObject.getValue("Width_Imperial").getSimpleValue());
			totalPackingItem.getValue("PackageWidthUOM").setSimpleValue(itemObject.getValue("Width_Imperial_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageWidthValue").setSimpleValue(itemObject.getValue("Width_Imperial_Value").getSimpleValue());
			totalPackingItem.getValue("PackageWeight").setSimpleValue(itemObject.getValue("GrossWeight_Imperial").getSimpleValue());
			totalPackingItem.getValue("PackageWeightUOM").setSimpleValue(itemObject.getValue("GrossWeight_Imperial_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageWeightValue").setSimpleValue(itemObject.getValue("GrossWeight_Imperial_Value").getSimpleValue());
		}
		else{
			totalPackingItem.getValue("PackageHeight").setSimpleValue(itemObject.getValue("Height_Meteric").getSimpleValue());
			totalPackingItem.getValue("PackageHeightUOM").setSimpleValue(itemObject.getValue("Height_Metric_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageHeightUOMValue").setSimpleValue(itemObject.getValue("Height_Metric_Value").getSimpleValue());
			totalPackingItem.getValue("PackageLength/Depth").setSimpleValue(itemObject.getValue("Length_Meteric").getSimpleValue());
			totalPackingItem.getValue("PackageLength/DepthUOM").setSimpleValue(itemObject.getValue("Length_Metric_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageLength/DepthValue").setSimpleValue(itemObject.getValue("Length_Metric_Value").getSimpleValue());
			totalPackingItem.getValue("PackageWidth").setSimpleValue(itemObject.getValue("Width_Meteric").getSimpleValue());
			totalPackingItem.getValue("PackageWidthUOM").setSimpleValue(itemObject.getValue("Width_Metric_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageWidthValue").setSimpleValue(itemObject.getValue("Width_Metric_Value").getSimpleValue());
			totalPackingItem.getValue("PackageWeight").setSimpleValue(itemObject.getValue("GrossWeight_Meteric").getSimpleValue());
			totalPackingItem.getValue("PackageWeightUOM").setSimpleValue(itemObject.getValue("GrossWeight_Metric_UOM").getSimpleValue());
			totalPackingItem.getValue("PackageWeightValue").setSimpleValue(itemObject.getValue("GrossWeight_Metric_Value").getSimpleValue());
			//Added by Anusha for PDS Export Configuration Purpose
			if(country == "PH"){
				totalPackingItem.getValue("PackageWeight_Kg").setSimpleValue(itemObject.getValue("GrossWeight_Metric_kg").getSimpleValue());
				totalPackingItem.getValue("PackageLength_cm").setSimpleValue(itemObject.getValue("Length_Metric_cm").getSimpleValue());
				totalPackingItem.getValue("PackageWidth_cm").setSimpleValue(itemObject.getValue("Width_Metric_cm").getSimpleValue());
				totalPackingItem.getValue("PackageHeigth_cm").setSimpleValue(itemObject.getValue("Height_Metric_cm").getSimpleValue());
				var PhWeight = seperator(itemObject.getValue("GrossWeight_Metric_kg").getSimpleValue(),log, manager);
				var PhHeight = seperator(itemObject.getValue("Height_Metric_cm").getSimpleValue(),log, manager);
				var PhWidth = seperator(itemObject.getValue("Width_Metric_cm").getSimpleValue(),log, manager);				
				var PhLength = seperator(itemObject.getValue("Length_Metric_cm").getSimpleValue(),log, manager);
				var completeness = +PhWeight + +PhHeight + +PhWidth + +PhLength;
				if(completeness){
					if(completeness % 1 == 0){
						var finalValue = parseInt(completeness);
					}
					else if(completeness.toString().split(".")[1]>8){
						var finalValue = parseFloat(completeness).toFixed(8);
						finalValue = parseFloat(parseFloat(finalValue).toFixed(15));
					}
					else if(completeness.toString().split(".")[1]<9){		
						var finalValue = completeness;
						finalValue = parseFloat(parseFloat(finalValue).toFixed(15));	
					}
					totalPackingItem.getValue("Completeness_Package").setSimpleValue(finalValue);
				}
				else{
					totalPackingItem.getValue("Completeness_Package").setSimpleValue("");
				}
			}
		}
	}
	if(caseObject){
		if(country=="US" || country=="PR"){
			totalPackingItem.getValue("Ship/OuterCaseHeight").setSimpleValue(caseObject.getValue("Height_Imperial").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseHeightValue").setSimpleValue(caseObject.getValue("Height_Imperial_Value").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseHeightUOM").setSimpleValue(caseObject.getValue("Height_Imperial_UOM").getSimpleValue());
			totalPackingItem.getValue("Ship / OuterCaseLength/Depth").setSimpleValue(caseObject.getValue("Length_Imperial").getSimpleValue());
			totalPackingItem.getValue("Ship / OuterCaseLength/DepthValue").setSimpleValue(caseObject.getValue("Length_Imperial_Value").getSimpleValue());
			totalPackingItem.getValue("Ship / OuterCaseLength/DepthUOM").setSimpleValue(caseObject.getValue("Length_Imperial_UOM").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWidth").setSimpleValue(caseObject.getValue("Width_Imperial").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWidthValue").setSimpleValue(caseObject.getValue("Width_Imperial_Value").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWidthUOM").setSimpleValue(caseObject.getValue("Width_Imperial_UOM").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWeight").setSimpleValue(caseObject.getValue("GrossWeight_Imperial").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWeightValue").setSimpleValue(caseObject.getValue("GrossWeight_Imperial_Value").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWeightUOM").setSimpleValue(caseObject.getValue("GrossWeight_Imperial_UOM").getSimpleValue());
		}
		else{
			totalPackingItem.getValue("Ship/OuterCaseHeight").setSimpleValue(caseObject.getValue("Height_Meteric").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseHeightValue").setSimpleValue(caseObject.getValue("Height_Metric_Value").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseHeightUOM").setSimpleValue(caseObject.getValue("Height_Metric_UOM").getSimpleValue());
			totalPackingItem.getValue("Ship / OuterCaseLength/Depth").setSimpleValue(caseObject.getValue("Length_Meteric").getSimpleValue());
			totalPackingItem.getValue("Ship / OuterCaseLength/DepthValue").setSimpleValue(caseObject.getValue("Length_Metric_Value").getSimpleValue());
			totalPackingItem.getValue("Ship / OuterCaseLength/DepthUOM").setSimpleValue(caseObject.getValue("Length_Metric_UOM").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWidth").setSimpleValue(caseObject.getValue("Width_Meteric").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWidthValue").setSimpleValue(caseObject.getValue("Width_Metric_Value").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWidthUOM").setSimpleValue(caseObject.getValue("Width_Metric_UOM").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWeight").setSimpleValue(caseObject.getValue("GrossWeight_Meteric").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWeightValue").setSimpleValue(caseObject.getValue("GrossWeight_Metric_Value").getSimpleValue());
			totalPackingItem.getValue("Ship/OuterCaseWeightUOM").setSimpleValue(caseObject.getValue("GrossWeight_Metric_UOM").getSimpleValue());
		}			
	}
 	var attributeHome = manager.getAttributeGroupHome().getAttributeGroupByID("PackagingAdditionalAttributes");
	var additionalAttributes = attributeHome.getAttributes();
	var it = additionalAttributes.iterator();
	while ( it.hasNext() ){
		var attribute = it.next();
		var attributeID = attribute.getID();
		if(attributeID=="ParentVersion"){
			totalPackingItem.getValue("ParentVersion").setSimpleValue(currentObject.getValue("MarketingCopyFrom").getSimpleValue());
		}
		if(attributeID=="Producttype"){
			totalPackingItem.getValue("Producttype").setSimpleValue(currentObject.getParent().getValue("Brandtype").getSimpleValue());
		}
		if(attributeID=="eCopyReady"){				
			var eCopyStatus = currentObject.getValue("eCopyReDistributionUpdate").getSimpleValue();
			if(eCopyStatus!=null&&eCopyStatus!=""){
				//totalPackingItem.getValue("eCopyReady").setSimpleValue("Yes");
			}
			else{
				//totalPackingItem.getValue("eCopyReady").setSimpleValue("No");
			}				
		}
	}
 }
function seperator(value,log, manager){
	var valueReturn = "";
	if(value){
		var valueSeperator = value.match(/[a-zA-Z]+|[0-9^.]+/g);
		valueReturn = valueSeperator[0];
	}
	return valueReturn;
}
 /*@Author Anandhi
 * populate FormulaCard Attributes at packaging  level
 *//*
 *Aravinth --> Part of Artwork we commented below function
  */
/*function fc(ph,manager,log){
	var fcReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FPC_to_FC");
	var ingReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("FC_to_Ing");
	var ingtoingReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("Ing_to_Ing");
	var allFormulaCards =ph.getReferences(fcReferenceType).toArray();
	var formulaCardId;
	var formulaCardGCAS;
	var gcsString=new Array();
	var fcIDString=new Array();
	var ingID = new Array();
	var ingName =new Array();
	for each(var card in allFormulaCards){
		var fcObject = card.getTarget();
		//for setting FormulaCardGCAS and FormulaCardID
		gcsString.push(fcObject.getValue("FormulaCardGCAS").getSimpleValue());
		fcIDString.push(fcObject.getID());
		//for getting Ingredient id and names
		var allIng =fcObject.getReferences(ingReferenceType).toArray();
		var tempIngId =new Array();
		var tempIngName = new Array();
		for each(var ing in allIng){
			var allSubIng =ing.getTarget().getReferences(ingtoingReferenceType).toArray();
			var ingredientID = ing.getTarget().getID();
			var ingredientName = ing.getTarget().getName();
			//Assuming ingredient has only one ing linked
			if(allSubIng.length>0){
				ingredientID = ingredientID+"@"+allSubIng[0].getTarget().getID();
				ingredientName = ingredientName+"@"+allSubIng[0].getTarget().getName();
			}
			tempIngId.push(ingredientID);
			tempIngName.push(ingredientName);
		}
		ingID.push(tempIngId.join("|"));
		ingName.push(tempIngName.join("|"));
	}
	ph.getValue("FormulaCardGCASPH").setSimpleValue(gcsString.join("&"));
	ph.getValue("FormulaCardID").setSimpleValue(fcIDString.join("&"));
	ph.getValue("IngredientID").setSimpleValue(ingID.join("&"));
	ph.getValue("IngredientName").setSimpleValue(ingName.join("&"));
	var fcAttributeHome = manager.getAttributeGroupHome().getAttributeGroupByID("PackagingHierarchyFCAttributes");
	var fcAttributes = fcAttributeHome.getAttributes();
	var it = fcAttributes.iterator();
	while ( it.hasNext() ){
		var attributeValueArray = new Array();
		var attribute = it.next();
		var attrValue=ph.getValue(attribute.getID()).getSimpleValue();
		for each(var card in allFormulaCards){
			var fcObject = card.getTarget();
			var valueFromIngArray = new Array();
			var allIng =fcObject.getReferences(ingReferenceType).toArray();
			for each(var ing in allIng){
				var ingObject = ing.getTarget();
				var valueStored = ing.getValue(attribute.getID()).getSimpleValue();
				if(valueStored!=null && valueStored!=""){
					valueStored = ingObject.getName()+":"+valueStored;
					//Assuming Ing may have only one ing linked to it
					var allSubIng =ingObject.getReferences(ingtoingReferenceType).toArray();
					if(allSubIng.length>0){
						var subIng = allSubIng[0].getTarget();
						var subIngValue = allSubIng[0].getValue(attribute.getID()).getSimpleValue();
						if(subIngValue!=null && subIngValue!=""){
							valueStored = valueStored+"@"+subIng.getName()+":"+subIngValue;
						}
					}
				}
				else{
					//Value of attribute at ingredient level is null
					//So check value at sub ingre dient level
					var allSubIng =ingObject.getReferences(ingtoingReferenceType).toArray();
					if(allSubIng.length>0){
						var subIng = allSubIng[0].getTarget();
						var subIngValue = allSubIng[0].getValue(attribute.getID()).getSimpleValue();
						if(subIngValue!=null && subIngValue!=""){
							var valueStored = subIng.getName()+":"+subIngValue;
						}
					}
				}
				if(valueStored!=null&&valueStored!=""){
					valueFromIngArray.push(valueStored);
				}
			}
			if(valueFromIngArray.length>0){
				attributeValueArray.push(valueFromIngArray.join("|"));
			}
		}
		if(attributeValueArray.length > 0){
			if(attribute.getID()!="ActiveIngredient"){
				ph.getValue(attribute.getID()).setSimpleValue(attributeValueArray.join("&"));
			}
			else if(attribute.getID()=="ActiveIngredient"){
				ph.getValue("ActiveIngredient_Pack").setSimpleValue(attributeValueArray.join("&"));
			}
		}
	}
}*/
 /*@Author Anandhi
 * populate allTMReferences  at packaging  level
*/
function allTMReference(totalPackingItem,log,manager){
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var allTmRefType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_AllTM_Reference");
	var totalPackingItemSplit = totalPackingItem.getID().split("_");
	var gtin = totalPackingItemSplit[0]; 
	var groupName=totalPackingItemSplit[1];
	var allSimilarProducts = new Array();
	var partialIMID = gtin+"_"+groupName+"_"+'IM';
	var partialFIMID = gtin+"_"+groupName+"_"+'FIM';
	var partialPIMID=	gtin+"_"+groupName+"_"+'PIM';
	
	var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
	var currentId=totalPackingItem.getValue("PIMIDAttribute").getSimpleValue();
	if(currentId.endsWith('_IM') || currentId.endsWith('_FIM')){
		
		//Check for packages with same IM TM
		var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
		var  productsIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,partialIMID)).asList(100).toArray();
		//Check for packages with same FIM TM
		
		var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
		var  productsFIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,partialFIMID)).asList(100).toArray();
		allSimilarProducts=productsIM.concat(productsFIM);
		
		//Delete all the existing targetmarket in all TM
        //SS-23684 getmethod to querymethod replacement
        //var allTmRefs =totalPackingItem.getReferences(allTmRefType).toArray();
        var allTmRefs = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
		for(var k=0;k<allTmRefs.length;k++){
			allTmRefs[k].delete();				
		}
		
		//Copy other packaging with the currentObject alltm reference
		for each(var productIM in productsIM){
			var id=productIM.getID();
			var object=manager.getProductHome().getProductByID(id);
            //SS-23684 getmethod to querymethod replacement
            //var imRefs =object.getReferences(tmReferenceType).toArray();
            var imRefs = object.queryReferences(tmReferenceType).asList("20000").toArray();
			for(var l=0;l<imRefs.length;l++){
				var ref = imRefs[l];
				var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
				var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
				var status=ref.getValue("GTINStatus").getSimpleValue();
				var refItem = ref.getTarget();
				var refFlag=true;
                //SS-23684 getmethod to querymethod replacement
                //var packrefs=totalPackingItem.getReferences(allTmRefType).toArray();
                var packrefs = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == refItem.getID()){
						refFlag=false;
					}
				}
				if(refFlag){		
					var ref = totalPackingItem.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of in market to current obj
					ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
					ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
					ref.getValue("GTINStatus").setSimpleValue(status);
							
				}							
			}
		}
		for each(var productFIM in productsFIM){			
			var id=productFIM.getID();
			var object=manager.getProductHome().getProductByID(id);
            //SS-23684 getmethod to querymethod replacement
            //var imRefs =object.getReferences(tmReferenceType).toArray();
            var imRefs = object.queryReferences(tmReferenceType).asList("20000").toArray();
			for(var l=0;l<imRefs.length;l++){
				var ref = imRefs[l];
				var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
				var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
				var status=ref.getValue("GTINStatus").getSimpleValue();
				var refItem = ref.getTarget();
				
				var refFlag=true;
                //SS-23684 getmethod to querymethod replacement
                //var packrefs=totalPackingItem.getReferences(allTmRefType).toArray();
                var packrefs = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == refItem.getID()){
						refFlag=false;
					}
				}
				if(refFlag){		
					var ref = totalPackingItem.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of Future in market to current obj
					ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
					ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
					ref.getValue("GTINStatus").setSimpleValue(status);							
				}							
			}
		}
		
		//Copy the currentObject to itself in all targetmarket Reference
        //SS-23684 getmethod to querymethod replacement
        //var currentRefs =totalPackingItem.getReferences(tmReferenceType).toArray();
        var currentRefs = totalPackingItem.queryReferences(tmReferenceType).asList("20000").toArray();
		for(var l=0;l<currentRefs.length;l++){
			var ref = currentRefs[l];			
			var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
			var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
			var status=ref.getValue("GTINStatus").getSimpleValue();	
			var refItem = ref.getTarget();	
			
			var refFlag=true;
            //SS-23684 getmethod to querymethod replacement
            //var packrefs=totalPackingItem.getReferences(allTmRefType).toArray();
            var packrefs = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
			for each(var packref in packrefs){
				if(packref.getTarget().getID() == refItem.getID()){
					refFlag=false;
				}
			}
			if(refFlag){		
				var ref = totalPackingItem.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of current obj to itself in all TM's reference 
				ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
				ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
				ref.getValue("GTINStatus").setSimpleValue(status);
			}		
		}
		//Copy the currentObject to other All TM references
        //SS-23684 getmethod to querymethod replacement
        //var currentRefs =totalPackingItem.getReferences(tmReferenceType).toArray();
        var currentRefs = totalPackingItem.queryReferences(tmReferenceType).asList("20000").toArray();
		for each(var productIM in productsIM){
			var id=productIM.getID();
			var object=manager.getProductHome().getProductByID(id);
			for(var l=0;l<currentRefs.length;l++){
				var ref = currentRefs[l];				
				var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
				var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
				var status=ref.getValue("GTINStatus").getSimpleValue();
				var refItem = ref.getTarget();	
				
				var refFlag=true;
                //SS-23684 getmethod to querymethod replacement
                //var packrefs=object.getReferences(allTmRefType).toArray();
                var packrefs = object.queryReferences(allTmRefType).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == refItem.getID()){
						refFlag=false;
						//updating the metadata attributes
						packref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
						packref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
						packref.getValue("GTINStatus").setSimpleValue(status);
					}
				}
				if(refFlag){		
					var ref = object.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of current obj to In market objects in all TM's reference 
					ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
					ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
					ref.getValue("GTINStatus").setSimpleValue(status);
							
				}			
			}	
		}
        //SS-23684 getmethod to querymethod replacement
        //var currentRefs =totalPackingItem.getReferences(tmReferenceType).toArray();
        var currentRefs = totalPackingItem.queryReferences(tmReferenceType).asList("20000").toArray();
		for each(var productFIM in productsFIM){
			var id=productFIM.getID();
			var object=manager.getProductHome().getProductByID(id);
			for(var l=0;l<currentRefs.length;l++){
				var ref = currentRefs[l];
				var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
				var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
				var status=ref.getValue("GTINStatus").getSimpleValue();		
				var refItem = ref.getTarget();
				
				var refFlag=true;
                //SS-23684 getmethod to querymethod replacement
                //var packrefs=object.getReferences(allTmRefType).toArray();
                var packrefs = object.queryReferences(allTmRefType).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == refItem.getID()){
						refFlag=false;
						//updating the metadata attributes
						packref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
						packref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
						packref.getValue("GTINStatus").setSimpleValue(status);
					}
				}
				if(refFlag){		
					var ref = object.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of current obj to Future In market objects in all TM's reference 
					ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
					ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
					ref.getValue("GTINStatus").setSimpleValue(status);
				}		
			}	
		}
	}
	else{		
		//Check for packages with same PIM TM
		var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
		var  productsPIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,partialPIMID)).asList(100).toArray();
		allSimilarProducts = productsPIM;
		//Delete all the existing targetmarket in all TM
        //SS-23684 getmethod to querymethod replacement
        //var allTmRefs =totalPackingItem.getReferences(allTmRefType).toArray();
        var allTmRefs = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
		for(var k=0;k<allTmRefs.length;k++){
			allTmRefs[k].delete();				
		}
		
		//Copy the currentObject to itself in all targetmarket Reference
        //SS-23684 getmethod to querymethod replacement
        //var currentRefs =totalPackingItem.getReferences(tmReferenceType).toArray();
        var currentRefs = totalPackingItem.queryReferences(tmReferenceType).asList("20000").toArray();
		for(var l=0;l<currentRefs.length;l++){
			var ref = currentRefs[l];			
			var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
			var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
			var status=ref.getValue("GTINStatus").getSimpleValue();	
			var refItem = ref.getTarget();	
			var refFlag=true;
            //SS-23684 getmethod to querymethod replacement
            //var packrefs=totalPackingItem.getReferences(allTmRefType).toArray();
            var packrefs = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
			for each(var packref in packrefs){
				if(packref.getTarget().getID() == refItem.getID()){
					refFlag=false;
				}
			}
			if(refFlag){		
				var ref = totalPackingItem.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of current obj to itself in all TM's reference 
				ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
				ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
				ref.getValue("GTINStatus").setSimpleValue(status);
			}		
		}
		//Copy from Previous In Market to currentObject
		for each(var productPIM in productsPIM){
			var id=productPIM.getID();
			var object=manager.getProductHome().getProductByID(id);
            //SS-23684 getmethod to querymethod replacement
            //var imRefs =object.getReferences(tmReferenceType).toArray();
            var imRefs = object.queryReferences(tmReferenceType).asList("20000").toArray();
			for(var l=0;l<imRefs.length;l++){
				var ref = imRefs[l];
				var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
				var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
				var status=ref.getValue("GTINStatus").getSimpleValue();
				var refItem = ref.getTarget();
				
				var refFlag=true;
                //SS-23684 getmethod to querymethod replacement
                //var packrefs=totalPackingItem.getReferences(allTmRefType).toArray();
                var packrefs = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == refItem.getID()){
						refFlag=false;
					}
				}
				if(refFlag){		
					var ref = totalPackingItem.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of PIM  to current object in all TM's reference 
					ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
					ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
					ref.getValue("GTINStatus").setSimpleValue(status);
				}								
			}
		}
		//Copy Currentobject to Previous IN Market
        //SS-23684 getmethod to querymethod replacement
        //var currentRefs =totalPackingItem.getReferences(tmReferenceType).toArray();
        var currentRefs = totalPackingItem.queryReferences(tmReferenceType).asList("20000").toArray();
		for each(var productPIM in productsPIM){
			var id=productPIM.getID();
			var object=manager.getProductHome().getProductByID(id);
			for(var l=0;l<currentRefs.length;l++){
				var ref = currentRefs[l];
				var consumerMarket=ref.getValue("ConsumerMarket").getSimpleValue();
				var customerSpecific=ref.getValue("CustomerSpecific").getSimpleValue();
				var status=ref.getValue("GTINStatus").getSimpleValue();		
				var refItem = ref.getTarget();
				
				var refFlag=true;
                //SS-23684 getmethod to querymethod replacement
                //var packrefs=object.getReferences(allTmRefType).toArray();
                var packrefs = object.queryReferences(allTmRefType).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == refItem.getID()){
						refFlag=false;
						//updating the metadata attributes
						packref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
						packref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
						packref.getValue("GTINStatus").setSimpleValue(status);
					}
				}
				if(refFlag){		
					var ref = object.createReference(refItem,"PKG_AllTM_Reference");	//Linking TM's of current obj to Previous In market objects in all TM's reference 
					ref.getValue("ConsumerMarket").setSimpleValue(consumerMarket);
					ref.getValue("CustomerSpecific").setSimpleValue(customerSpecific);
					ref.getValue("GTINStatus").setSimpleValue(status);
				}		
			}	
		}		
	}
	//To  populate representative targetmarket
	for each(var similarItem in allSimilarProducts){
		representativeTM(similarItem,log,manager);
	}
 }
 /*@Author Anandhi
 * populate childReferences  at packaging  level
*/
function childReferences(totalPackingItem,log,manager){
	var caseToChildList = new java.util.LinkedList();
	var palletToChildList = new java.util.LinkedList();
	var shrinkWrapToChildList = new java.util.LinkedList();
	var innerPackToChildList = new java.util.LinkedList();
	
	var childReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("Case_to_Child");
	var childReferenceType2=manager.getReferenceTypeHome().getReferenceTypeByID("Pallet_to_Child");
	var childReferenceType3=manager.getReferenceTypeHome().getReferenceTypeByID("ShrinkWrap_to_Child");
	var childReferenceType4=manager.getReferenceTypeHome().getReferenceTypeByID("InnerPack_to_Child");
	if(totalPackingItem.getObjectType().getID()=="Case"){		
        //SS-23684 getmethod to querymethod replacement
        //var refs = totalPackingItem.getReferences(childReferenceType).toArray();
        var refs = totalPackingItem.queryReferences(childReferenceType).asList("20000").toArray();
		for each (ref in refs){
			caseToChildList.push(ref.getTarget());
		}
		var caseName = totalPackingItem.getID().split("_");
		var caseSalesArea = caseName[1]; 
		var fpcCode=caseName[2];
		var fpcObj=manager.getNodeHome().getObjectByKey("FinishedProductCode",fpcCode);
        //SS-24995 getmethod to querymethod replacement
        //var children = fpcObj.getChildren().toArray();
        var children = fpcObj.queryChildren();
        //SS-24995 Add declaration of itGTIN and remove "var" inside loop
        var itGTIN;
        //for (var a = 0; a < children.length; a++) {
        children.forEach(function (childObj) {
            //var childObj = children[a];
			if(childObj.getObjectType().getID() =="FPC_UOM"){
				var uomName = 	childObj.getName();
				var uomType = uomName.split("_");
				if(uomType[0] == "IT"){
					var itGTIN = childObj.getValue("GTIN").getSimpleValue();
				}
			}	
            return true; //added return as part of SS-24995
        });
		var eachObjectID=itGTIN+'_'+caseSalesArea+'_'+fpcCode;	
		var eachPackagingHirarchyObj =manager.getProductHome().getProductByID(eachObjectID);			
		if(eachPackagingHirarchyObj){
			//Each Packaging ITem is available
			// change has been made as part of PRB0102244
			var objType = eachPackagingHirarchyObj.getObjectType().getID();
			if((!(caseToChildList.contains(eachPackagingHirarchyObj)))&& (objType == "Each" || objType == "InnerPack" || objType == "ShrinkWrap")){				
				var ref = totalPackingItem.createReference(eachPackagingHirarchyObj,"Case_to_Child");
				var itemCountInCase = totalPackingItem.getValue("ItemCountInCase").getSimpleValue();
				ref.getValue("Pkg_Ref_Quantity").setSimpleValue(itemCountInCase);
			}
			else{
                //SS-23684 getmethod to querymethod replacement
                //var packrefs = totalPackingItem.getReferences(childReferenceType).toArray();
                var packrefs = totalPackingItem.queryReferences(childReferenceType).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == eachPackagingHirarchyObj.getID()){
						var itemCountInCase = totalPackingItem.getValue("ItemCountInCase").getSimpleValue();
						if(packref.getValue("Pkg_Ref_Quantity").getSimpleValue()!=itemCountInCase){
							packref.getValue("Pkg_Ref_Quantity").setSimpleValue(itemCountInCase);
						}
					}
				}
			}					
		}
		//Deletion of other Reference other than Each obj
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = totalPackingItem.getReferences(childReferenceType).toArray();
        var packrefs = totalPackingItem.queryReferences(childReferenceType).asList("20000").toArray();
		for each(var packref in packrefs){
			if(packref.getTarget() && eachPackagingHirarchyObj){
			if(packref.getTarget().getID() != eachPackagingHirarchyObj.getID()){
				packref.delete();
			}
			}
		}	
	}
	else if(totalPackingItem.getObjectType().getID()=="Pallet"){
        //SS-23684 getmethod to querymethod replacement
        //var refs =totalPackingItem.getReferences(childReferenceType2).toArray();
        var refs = totalPackingItem.queryReferences(childReferenceType2).asList("20000").toArray();
		for each (ref in refs){
			palletToChildList.push(ref.getTarget());
		}
		var caseName = totalPackingItem.getID().split("_");
		var caseSalesArea = caseName[1]; 
		var fpcCode=caseName[2];
		var fpcObj=manager.getNodeHome().getObjectByKey("FinishedProductCode",fpcCode);
        //SS-24995 getmethod to querymethod replacement
        //var children = fpcObj.getChildren().toArray();
        var children = fpcObj.queryChildren();
        //for (var a = 0; a < children.length; a++) {
        children.forEach(function (childObj) {
            //var childObj = children[a];
			if(childObj.getObjectType().getID() =="FPC_UOM"){
				var uomName = 	childObj.getName();
				var uomType = uomName.split("_");
				if(uomType[0] == "CS"){
					var caseGTIN = childObj.getValue("GTIN").getSimpleValue();
				}
			}	
            return true; //added return as part of SS-24995
        });
		var caseObjectID=caseGTIN+'_'+caseSalesArea+'_'+fpcCode;			
		var casePackagingHirarchyObj =manager.getProductHome().getProductByID(caseObjectID);			
		if(casePackagingHirarchyObj){
			//Case Packaging ITem is available
			if(!(palletToChildList.contains(casePackagingHirarchyObj))){	
				var ref = totalPackingItem.createReference(casePackagingHirarchyObj,"Pallet_to_Child");
				var baseUom=totalPackingItem.getValue("BaseUoM").getSimpleValue();
				if(baseUom == "CS"){
					var quantity = totalPackingItem.getValue("Numerator").getSimpleValue();
					ref.getValue("Pkg_Ref_Quantity").setSimpleValue(quantity);
				}
			}
			else{
                //SS-23684 getmethod to querymethod replacement
                //var packrefs =totalPackingItem.getReferences(childReferenceType2).toArray();
                var packrefs = totalPackingItem.queryReferences(childReferenceType2).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == casePackagingHirarchyObj.getID()){
						var baseUom=totalPackingItem.getValue("BaseUoM").getSimpleValue();
						if(baseUom == "CS"){
							var quantity = totalPackingItem.getValue("Numerator").getSimpleValue();
							if(packref.getValue("Pkg_Ref_Quantity").getSimpleValue()!=quantity){
								packref.getValue("Pkg_Ref_Quantity").setSimpleValue(quantity);
							}
						}
					}
				}
			}
		}
		//Deletion of other Reference other than case obj
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = totalPackingItem.getReferences(childReferenceType2).toArray();
        var packrefs = totalPackingItem.queryReferences(childReferenceType2).asList("20000").toArray();
		for each(var packref in packrefs){
			if(packref.getTarget().getID() != casePackagingHirarchyObj.getID()){
				packref.delete();
			}
		}		
	}
	else if(totalPackingItem.getObjectType().getID()=="ShrinkWrap"){
        //SS-23684 getmethod to querymethod replacement
        //var refs =totalPackingItem.getReferences(childReferenceType3).toArray();
        var refs = totalPackingItem.queryReferences(childReferenceType3).asList("20000").toArray();
		for each (ref in refs){
			shrinkWrapToChildList.push(ref.getTarget());
		}
		var caseName = totalPackingItem.getID().split("_");
		var caseSalesArea = caseName[1]; 
		var fpcCode=caseName[2];
		var fpcObj=manager.getNodeHome().getObjectByKey("FinishedProductCode",fpcCode);
        //SS-24995 getmethod to querymethod replacement
        //var children = fpcObj.getChildren().toArray();
        var children = fpcObj.queryChildren();
        //for (var a = 0; a < children.length; a++) {
        children.forEach(function (childObj) {
            //var childObj = children[a];
			if(childObj.getObjectType().getID() =="FPC_UOM"){
				var uomName = 	childObj.getName();
				var uomType = uomName.split("_");
				if(uomType[0] == "IT"){
					var itGTIN = childObj.getValue("GTIN").getSimpleValue();
				}
			}	
            return true; //added return as part of SS-24995
        });
		var eachObjectID=itGTIN+'_'+caseSalesArea+'_'+fpcCode;				
		var eachPackagingHirarchyObj =manager.getProductHome().getProductByID(eachObjectID);			
		if(eachPackagingHirarchyObj){
			//Case Packaging ITem is available
			if(!(shrinkWrapToChildList.contains(eachPackagingHirarchyObj))){	
				var ref = totalPackingItem.createReference(eachPackagingHirarchyObj,"ShrinkWrap_to_Child");
				var baseUom=totalPackingItem.getValue("BaseUoM").getSimpleValue();				
				var quantity = totalPackingItem.getValue("Numerator").getSimpleValue();
				ref.getValue("Pkg_Ref_Quantity").setSimpleValue(quantity);
			}
			else{
                //SS-23684 getmethod to querymethod replacement
                //var packrefs = totalPackingItem.getReferences(childReferenceType3).toArray();
                var packrefs = totalPackingItem.queryReferences(childReferenceType3).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == eachPackagingHirarchyObj.getID()){
						var quantity = totalPackingItem.getValue("Numerator").getSimpleValue();
						if(packref.getValue("Pkg_Ref_Quantity").getSimpleValue()!=quantity){
							packref.getValue("Pkg_Ref_Quantity").setSimpleValue(quantity);
						}							
					}
				}
			}
		}
		//Deletion of other Reference other than Each obj
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = totalPackingItem.getReferences(childReferenceType3).toArray();
        var packrefs = totalPackingItem.queryReferences(childReferenceType3).asList("20000").toArray();
		for each(var packref in packrefs){
			if(packref.getTarget().getID() != eachPackagingHirarchyObj.getID()){
				packref.delete();
			}
		}		
	}
	else if(totalPackingItem.getObjectType().getID()=="InnerPack"){
        //SS-23684 getmethod to querymethod replacement
        //var refs =totalPackingItem.getReferences(childReferenceType4).toArray();
        var refs = totalPackingItem.queryReferences(childReferenceType4).asList("20000").toArray();
		for each (ref in refs){
			innerPackToChildList.push(ref.getTarget());
		}
		var caseName = totalPackingItem.getID().split("_");
		var caseSalesArea = caseName[1]; 
		var fpcCode=caseName[2];
		var fpcObj=manager.getNodeHome().getObjectByKey("FinishedProductCode",fpcCode);
        //SS-24995 getmethod to querymethod replacement
        //var children = fpcObj.getChildren().toArray();
        var children = fpcObj.queryChildren();
        //for (var a = 0; a < children.length; a++) {
        children.forEach(function (childObj) {
            //var childObj = children[a];
			if(childObj.getObjectType().getID() =="FPC_UOM"){
				var uomName = 	childObj.getName();
				var uomType = uomName.split("_");
				if(uomType[0] == "IT"){
					var itGTIN = childObj.getValue("GTIN").getSimpleValue();
				}
			}	
            return true; //added return as part of SS-24995
        });
		var eachObjectID=itGTIN+'_'+caseSalesArea+'_'+fpcCode;
		var eachPackagingHirarchyObj =manager.getProductHome().getProductByID(eachObjectID);			
		if(eachPackagingHirarchyObj){
			//Case Packaging ITem is available
			if(!(innerPackToChildList.contains(eachPackagingHirarchyObj))){	
				var ref = totalPackingItem.createReference(eachPackagingHirarchyObj,"InnerPack_to_Child");
				var baseUom=totalPackingItem.getValue("BaseUoM").getSimpleValue();
				var quantity = totalPackingItem.getValue("Numerator").getSimpleValue();
				ref.getValue("Pkg_Ref_Quantity").setSimpleValue(quantity);	
			}
			else{
                //SS-23684 getmethod to querymethod replacement
                //var packrefs = totalPackingItem.getReferences(childReferenceType4).toArray();
                var packrefs = totalPackingItem.queryReferences(childReferenceType4).asList("20000").toArray();
				for each(var packref in packrefs){
					if(packref.getTarget().getID() == eachPackagingHirarchyObj.getID()){
						var quantity = totalPackingItem.getValue("Numerator").getSimpleValue();
						if(packref.getValue("Pkg_Ref_Quantity").getSimpleValue()!=quantity){
							packref.getValue("Pkg_Ref_Quantity").setSimpleValue(quantity);
						}							
					}
				}
			}
		}
		//Deletion of other Reference other than Each obj
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = totalPackingItem.getReferences(childReferenceType4).toArray();
        var packrefs = totalPackingItem.queryReferences(childReferenceType4).asList("20000").toArray();
		for each(var packref in packrefs){
			if(packref.getTarget().getID() != eachPackagingHirarchyObj.getID()){
				packref.delete();
			}
		}		
	}
}
 /*@Author Anandhi
 * populate representativeTM  at packaging  level
*/
function representativeTM(totalPackingItem,log,manager){
	var allTmRefType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_AllTM_Reference");	
	//For populating Rep TargetMarket
    //SS-23684 getmethod to querymethod replacement
    //var tmRefArray = totalPackingItem.getReferences(allTmRefType).toArray();
    var tmRefArray = totalPackingItem.queryReferences(allTmRefType).asList("20000").toArray();
	for(var c=0;c<tmRefArray.length;c++){
		var tmCode = tmRefArray[c].getTarget().getValue("FinishedProductCode").getSimpleValue();
		var packageCode = totalPackingItem.getValue("FinishedProductCode").getSimpleValue();
		if(tmCode==packageCode){
			tmRefArray[c].getValue("RepresentativeTargetMarket").setSimpleValue("Yes");
		}
		else{
			tmRefArray[c].getValue("RepresentativeTargetMarket").setSimpleValue("No");
		}
	}
}
 /*@Author Anandhi
 * delete References   at packaging  level
*/
//removed fcReferenceType from arguments as part of SS-24338
function deleteReferencesPackagingHierarchy(uomReferenceType,poaReferenceType,fcReferenceType,imageReferenceType,packagingHirarchyObj,log,manager){
	var referenceTypes=[];
	//referenceTypes.push(uomReferenceType);
	referenceTypes.push(poaReferenceType);
	 //commented as part of SS-24338  referenceTypes.push(fcReferenceType);
	var sdsReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("TM_to_SDS");
	//Delete the refernces one by one
	for each (referenceType in referenceTypes){
        //SS-23684 getmethod to querymethod replacement
        //var refs =packagingHirarchyObj.getReferences(referenceType).toArray();
        var refs = packagingHirarchyObj.queryReferences(referenceType).asList("20000").toArray();
		for each (ref in refs){
			ref.delete();
		}																						
	}
	manager.executeInContext("Context1", function(manager){
		var packagingHirarchyObjEng = manager.getObjectFromOtherManager(packagingHirarchyObj);
        //SS-23684 getmethod to querymethod replacement
        //var refs =packagingHirarchyObjEng.getReferences(imageReferenceType).toArray();
        var refs = packagingHirarchyObjEng.queryReferences(imageReferenceType).asList("20000").toArray();
		for each (ref in refs){
			ref.delete();
		}
        //SS-23684 getmethod to querymethod replacement
        //var sdsRefs =	packagingHirarchyObjEng.getReferences(sdsReferenceType).toArray();
        var sdsRefs = packagingHirarchyObjEng.queryReferences(sdsReferenceType).asList("20000").toArray();
		for each (ref in sdsRefs){
			ref.delete();
		}																			
	})
	manager.executeInContext("Context3", function(manager){		
		var packagingHirarchyObjFre = manager.getObjectFromOtherManager(packagingHirarchyObj);		
        //SS-23684 getmethod to querymethod replacement
        //var refs =packagingHirarchyObjFre.getReferences(imageReferenceType).toArray();
        var refs = packagingHirarchyObjFre.queryReferences(imageReferenceType).asList("20000").toArray();
		for each (ref in refs){
			ref.delete();
		}
        //SS-23684 getmethod to querymethod replacement
        //var sdsRefs =	packagingHirarchyObjFre.getReferences(sdsReferenceType).toArray();
        var sdsRefs = packagingHirarchyObjFre.queryReferences(sdsReferenceType).asList("20000").toArray();
		for each (ref in sdsRefs){
			ref.delete();
		}																					
	})	
	//Promotional Event references
	var promotionalRefType = manager.getReferenceTypeHome().getReferenceTypeByID("TMtoPromotionalEvent");
    //SS-23684 getmethod to querymethod replacement
    //var promotionalRefs = packagingHirarchyObj.getReferences(promotionalRefType).toArray();
    var promotionalRefs = packagingHirarchyObj.queryReferences(promotionalRefType).asList("20000").toArray();
	for each(var proRef in promotionalRefs){
		proRef.delete();
	}
}
 /*@Author Anandhi
 * add national and customer pkg  References   at packaging  level
*/
function createPKGReferences(currentObject,log,manager,lookupTableHome){
	var objType = currentObject.getObjectType().getID();
	var parentObjType = currentObject.getParent().getObjectType().getID();
	//SS-24166 getmethod to querymethod replacement
	//var nationalClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("PackagingtoTMSpecific");
	var nationalClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("PackagingtoTMSpecific");
    var TmReference = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference"); 
	//SS-24166 getmethod to querymethod replacement
	//var customerClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("FPC_To_Customer");
	var customerClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("FPC_To_Customer");
	var contextCountry =currentObject.getValue("Country_TM").getSimpleValue();
	var TMSpecificPackagingGlobal=lookupTableHome.getLookupTableValue("GlobalTMSpecificPackaging",contextCountry);
	var nationalProdCountry=manager.getClassificationHome().getClassificationByID(TMSpecificPackagingGlobal);
	var triggerFlag = "No";
	var customerProdList = new java.util.LinkedList();
	var existingCustomerRefList = new java.util.LinkedList();
	var nationalProdList = new java.util.LinkedList();
	var nationalProductFlag = true;
	var customerNumberList = new java.util.LinkedList();
	var customerCodeList = new java.util.LinkedList();
	if(parentObjType == "PackagingRoot"){
		var custSpecificAttrFlag = true;
		var existingCustomerNumbersList = new java.util.LinkedList();
		var customerNumberCreationList = new java.util.LinkedList();
		var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
        //SS-23684 getmethod to querymethod replacement
        //var refs = currentObject.getReferences(referenceType).toArray();
        var refs = currentObject.queryReferences(referenceType).asList("20000").toArray();
		if(refs.length>0){
			var tmRef = refs[0];
			var customerSpecificValues = tmRef.getValue("CustomerSpecific").getSimpleValue();
			if(customerSpecificValues!= null && customerSpecificValues != ""){
				var valuesArray = customerSpecificValues.split("<multisep/>");
				for(var a=0; a<valuesArray.length; a++){
					var value = valuesArray[a];
					existingCustomerNumbersList.push(value);
				}
			}
		}		
		var pkgCountry = currentObject.getValue("Country_TM").getSimpleValue();
		var customerCode = currentObject.getValue("CustomerClassification").getSimpleValue();
		var customerClassificationAtTm = currentObject.getValue("CustomerClassificationAtTM").getSimpleValue();
		//Deleting all references
        //SS-24166 getmethod to querymethod replacement
        //var nationalTMRefs=currentObject.getClassificationProductLinks(nationalClassificationType).toArray();
        var nationalTMRefs = currentObject.queryClassificationProductLinks(nationalClassificationType).asList("20000").toArray();

        //SS-24166 getmethod to querymethod replacement
        //var customerReference=currentObject.getClassificationProductLinks(customerClassificationType).toArray();
        var customerReference = currentObject.queryClassificationProductLinks(customerClassificationType).asList("20000").toArray();
		for each(var customerRef in customerReference){
			var customerTMRef = customerRef.getClassification();			
			existingCustomerRefList.push(customerTMRef);
		}
		for each(var nationalRef in nationalTMRefs){
			var nationalTMRef = nationalRef.getClassification();
			nationalProdList.push(nationalTMRef);
		}
		//currentObject.getValue("CustomerClassificationAtTM").deleteCurrent();
		var brendaFlag = brendaVisibility(currentObject, manager, log);
		if(brendaFlag){
			var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
            //SS-23684 getmethod to querymethod replacement
            //var refs = currentObject.getReferences(referenceType).toArray();
            var refs = currentObject.queryReferences(referenceType).asList("20000").toArray();
			if (refs.length>0){
				var tmRef = refs[0].getTarget();
				var customerClassificationValue = tmRef.getValue("CustomerClassificationAtTM").getSimpleValue();
				if (customerClassificationValue == "National"){
					if(currentObject.getValue("CustomerClassificationAtTM").getSimpleValue() != "National"){
						currentObject.getValue("CustomerClassificationAtTM").deleteCurrent();
						currentObject.getValue("CustomerClassificationAtTM").addValue("National");	
						triggerFlag = "Yes";					
					}
					if(!(nationalProdList.contains(nationalProdCountry))){
						for each(var nationalRef in nationalTMRefs){
							nationalRef.delete();
						}
						currentObject.createClassificationProductLink(nationalProdCountry,nationalClassificationType);	
						triggerFlag = "Yes";				
					}
					if (customerReference.length>0){
						for (var k = 0; k<customerReference.length;k++){
							customerReference[k].delete();
							triggerFlag = "Yes";
						}
					}
				}
				else if (customerClassificationValue == "" || customerClassificationValue == null){
					currentObject.getValue("CustomerClassificationAtTM").deleteCurrent();
					triggerFlag = "Yes";
					if(customerReference.length>0){
						for(var k=0;k<customerReference.length;k++){
							customerReference[k].delete();
						}
					}
					if (nationalTMRefs.length>0){
						for(var p=0;p<nationalTMRefs.length;p++){
							nationalTMRefs[p].delete();
						}
					}
					var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
                    //SS-23684 getmethod to querymethod replacement
                    //var refs = currentObject.getReferences(referenceType).toArray();
                    var refs = currentObject.queryReferences(referenceType).asList("20000").toArray();
					if(refs.length>0){
						var tmRef = refs[0];
						var customerSpecificValues = tmRef.getValue("CustomerSpecific").getSimpleValue();
						if (customerSpecificValues != "" && customerSpecificValues != null){
							tmRef.getValue("CustomerSpecific").deleteCurrent();
						}
					}
				}
				else{
					var customerCodeList = new java.util.LinkedList();
					var customerCodeStringArray = new java.util.LinkedList();
					var custCodeStringArray = [];
					var customerClassificationArray = [];
					var custClassAtPkg = currentObject.getValue("CustomerClassificationAtTM").getSimpleValue();
					if(custClassAtPkg){
						var custClasArray = custClassAtPkg.split("<multisep/>");
						for(var n=0; n<custClasArray.length; n++){
							var custClasArrayValue = custClasArray[n];
							customerCodeList.push(custClasArrayValue);
						}								
					}
					if (customerClassificationValue){
						var custClassificationArray = customerClassificationValue.split("<multisep/>");
						for (var v=0; v<custClassificationArray.length; v++){
							var custClassificationArrayValue = custClassificationArray[v];
							customerClassificationArray.push(custClassificationArrayValue);
						}
					}
					for(var j=0;j<customerClassificationArray.length;j++){
						var customerCodestring = customerClassificationArray[j];
						var customerID = lookupTableHome.getLookupTableValue("CustomerCodeMap",customerCodestring);
						if(customerID){
							if (customerID != "Non Visibility Flags"){
								var list = customerID.split(";");
								for (var i = 0; i < list.length; i++){
									var id=list[i];
									var index=id.indexOf("|");
									if(index>0){
										var customerNumber = id.slice(0,index);
										if(!(customerNumberList.contains(customerNumber))){
											customerNumberList.push(customerNumber);
										}
										var salesOrg = id.slice(index+1,customerID.length());
									}
									else{
										var customerNumber = id;
										if(!(customerNumberList.contains(customerNumber))){
											customerNumberList.push(customerNumber);
										}
										var salesOrg = "";					
									}
									var custClassification = manager.getClassificationHome().getClassificationByID(customerNumber);
									if(salesOrg == pkgCountry){
										if(!(customerNumberCreationList.contains(customerNumber))){
											customerNumberCreationList.push(customerNumber);
											if(custClassification!=null){
												if(!(customerCodeStringArray.contains(customerCodestring))){
													customerCodeStringArray.push(customerCodestring);
													custCodeStringArray.push(customerCodestring);
												}
												if(!(existingCustomerRefList.contains(custClassification))){
													currentObject.createClassificationProductLink(custClassification,customerClassificationType);
													existingCustomerRefList.push(custClassification);
													triggerFlag = "Yes";
												}
											}
										}
										if(!(customerCodeStringArray.contains(customerCodestring))){
											customerCodeStringArray.push(customerCodestring);
											custCodeStringArray.push(customerCodestring);
										}
									}
								}
							}
						}
					}
                    //SS-24166 getmethod to querymethod replacement
                    //var customerReferenceCheck = currentObject.getClassificationProductLinks(customerClassificationType).toArray();
                    var customerReferenceCheck = currentObject.queryClassificationProductLinks(customerClassificationType).asList("20000").toArray();
					for each(var customerRefCheck in customerReferenceCheck){
						var customerTMRefCheckID = customerRefCheck.getClassification().getID();
						if(!(customerNumberCreationList.contains(customerTMRefCheckID))){
							//Reference Needs to be deleted
							customerRefCheck.delete();
							triggerFlag = "Yes";
						}
					}
					var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
                    //SS-23684 getmethod to querymethod replacement
                    //var refs = currentObject.getReferences(referenceType).toArray();
                    var refs = currentObject.queryReferences(referenceType).asList("20000").toArray();
					if(refs.length>0){
						var tmRef = refs[0];
						var customerSpecificValues = tmRef.getValue("CustomerSpecific").getSimpleValue();
						if(customerSpecificValues!= null && customerSpecificValues != ""){
							var values = tmRef.getValue("CustomerSpecific").getValues();
							var itr = values.iterator();
							while(itr.hasNext()){
								var notInUseValue=itr.next();
								var custNoCheck = notInUseValue.getValue();
								if(!(customerNumberCreationList.contains(custNoCheck))){
									notInUseValue.deleteCurrent();								
								}
							}
						}
						for(var x=0; x<customerNumberCreationList.size(); x++){
							var custNo = customerNumberCreationList.get(x);
							if(!(existingCustomerNumbersList.contains(custNo))){						
								refs[0].getValue("CustomerSpecific").addValue(custNo);
							}
						}
						var checkValue = refs[0].getValue("CustomerSpecific").getSimpleValue();
						if(checkValue!= null && checkValue != ""){
							custSpecificAttrFlag = false;
						}
					}
					var flg = false;
					if (customerCodeList.size() != customerCodeStringArray.size()){
						flg = true;
					}
					for each (var customerCodeStr in custCodeStringArray){
						if(!(customerCodeList.contains(customerCodeStr))){
							flg = true;
						}
					}
					if(flg){
						currentObject.getValue("CustomerClassificationAtTM").deleteCurrent();
						for each (var custCodeStr in custCodeStringArray){
							currentObject.getValue("CustomerClassificationAtTM").addValue(custCodeStr);
						}
						triggerFlag = "Yes";
					}
                    //SS-24166 getmethod to querymethod replacement
                    //var nationalTMRefs = currentObject.getClassificationProductLinks(nationalClassificationType).toArray();
                    var nationalTMRefs = currentObject.queryClassificationProductLinks(nationalClassificationType).asList("20000").toArray();
					for(var p=0;p<nationalTMRefs.length;p++){
						nationalTMRefs[p].delete();
						triggerFlag = "Yes";
					}
				}
			}
		}
		else{
			if(currentObject.getValue("ProductStatus").getSimpleValue()!= null && currentObject.getValue("ProductStatus").getSimpleValue()!= ""){
				currentObject.getValue("ProductStatus").deleteCurrent();
				triggerFlag = "Yes";
			}
			if(currentObject.getValue("GTIN_Status_New").getSimpleValue()!= null && currentObject.getValue("GTIN_Status_New").getSimpleValue()!= ""){
				currentObject.getValue("GTIN_Status_New").deleteCurrent();
				triggerFlag = "Yes";
			}
			if(currentObject.getValue("PGP_GTIN_Status_New").getSimpleValue()!= null && currentObject.getValue("PGP_GTIN_Status_New").getSimpleValue()!= ""){
				currentObject.getValue("PGP_GTIN_Status_New").deleteCurrent();
				triggerFlag = "Yes";
			}
			if(currentObject.getValue("GTINStatus").getSimpleValue()!= null && currentObject.getValue("GTINStatus").getSimpleValue()!= ""){
				currentObject.getValue("GTINStatus").deleteCurrent();
				triggerFlag = "Yes";
			}
            //SS-24166 getmethod to querymethod replacement
            //var nationalTMRefs = currentObject.getClassificationProductLinks(nationalClassificationType).toArray();
            var nationalTMRefs = currentObject.queryClassificationProductLinks(nationalClassificationType).asList("20000").toArray();

            //SS-24166 getmethod to querymethod replacement
            //var customerReference = currentObject.getClassificationProductLinks(customerClassificationType).toArray();
            var customerReference = currentObject.queryClassificationProductLinks(customerClassificationType).asList("20000").toArray();
			for(var k=0;k<customerReference.length;k++){
				customerReference[k].delete();
				triggerFlag = "Yes";
			}
			for(var p=0;p<nationalTMRefs.length;p++){
				nationalTMRefs[p].delete();
				triggerFlag = "Yes";
			}
		}
		if(custSpecificAttrFlag){
			currentObject.getValue("CustomerSpecific").setSimpleValue("No");
		}
		else{
			currentObject.getValue("CustomerSpecific").setSimpleValue("Yes");
		}
	}
	return triggerFlag;
}
/*Author @ Anusha
Function to return flag whether the GTIN should be visible to Brenda
*/
function brendaVisibility (currentObject, manager, log){
	var currentDate = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
	var visibilityFlag = true;
	var lifeCycle = currentObject.getValue("CurrentLifecycleStage").getLOVValue();
	if(lifeCycle){
	var lifeCycleStage = lifeCycle.getID();
		if(lifeCycleStage == "6" || lifeCycleStage == "7"){
			visibilityFlag = false;
		}
		else if(lifeCycleStage == "5"){
			var lifeCycle5Date = currentObject.getValue("LifeCycleStage5").getSimpleValue();
			var replaceDate = lifeCycle5Date.replace("-", "/");
			var lc5Date = new Date(replaceDate);
			if(lc5Date){
				var sixMonthDate = new Date(lc5Date);
	         	sixMonthDate.setDate(lc5Date.getDate()+365);
				if(!((lc5Date <= currentDate) && (currentDate <= sixMonthDate))){
					visibilityFlag = false;
				}
			} 
		}
	}
	return visibilityFlag;
}
function populateProductStatusNewAtTM(totalPackingItem,log,manager,trigger){
	log.info("Started populateProductStatusNewAtTM Function");
 	var packID = totalPackingItem.getID();
	var splitID = packID.split("_");
	var salesArea = splitID[1];
	var concatenateDateTime = dateTime(manager);
	var checkDate = concatenateDateTime.split(" ");
	var currentDate = checkDate[0];                                                     
	var flag =false;
	var flagCheck=false;
	var PGP_Flag = false;
	if(salesArea != "US61"&& salesArea != "USY1"&& salesArea != "US65"&& salesArea != "US64"&& salesArea != "CA01"&& salesArea != "PR04"&& salesArea != "PH0302"){	
		var currentStatus = totalPackingItem.getValue("ProductStatus").getSimpleValue();
		var tmrefType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
        //SS-23684 getmethod to querymethod replacement
        //var tms = totalPackingItem.getReferences(tmrefType).toArray();
        var tms = totalPackingItem.queryReferences(tmrefType).asList("20000").toArray();
		if(tms.length>0){
			var targetMarket = tms[0].getTarget();
			//Setting GTIN_Status_New at targetMarket level
			var gtinStatusNewBefore = targetMarket.getValue("GTIN_Status_New").getSimpleValue();
			var productStatusNewBefore = targetMarket.getValue("Product_Status_New").getSimpleValue();
			targetMarket.getValue("GTIN_Status_New").setSimpleValue(getStatusToBeSet(totalPackingItem.getValue("ProductStatus").getSimpleValue()));
			populateGTINStatusNewAtTM(targetMarket, manager, log);
			var gtinStatusNewAfter = targetMarket.getValue("GTIN_Status_New").getSimpleValue();
			var productStatusNewAfter = targetMarket.getValue("Product_Status_New").getSimpleValue();
			var EOD=targetMarket.getValue("ExternalOnlineDate").getSimpleValue();
			if(gtinStatusNewBefore != gtinStatusNewAfter){
				//trigger.republish(targetMarket);
				//flagCheck=true;
				if (gtinStatusNewAfter == "2.Consumer In Market" || gtinStatusNewAfter == "5.Consumer Future In Market" ){
					if(EOD != currentDate){
						targetMarket.getValue("eCopyReDistributionUpdate").setSimpleValue(concatenateDateTime);
						approveRedistribution(targetMarket, log, manager);
						flag=true;
					}				
				}
			}
		}
	}
	//Modified for PGP FPC Version Population
	if(salesArea == "US61" || salesArea == "CA01"){
		var currentStatus = totalPackingItem.getValue("ProductStatus").getSimpleValue();
		var tmrefType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
        //SS-23684 getmethod to querymethod replacement
        //var tms = totalPackingItem.getReferences(tmrefType).toArray();
        var tms = totalPackingItem.queryReferences(tmrefType).asList("20000").toArray();
		if(tms.length>0){
			PGP_Flag = true;
			var targetMarket = tms[0].getTarget();
			var pgpGtinStatusNewBefore = targetMarket.getValue("PGP_GTIN_Status_New").getSimpleValue();
			targetMarket.getValue("PGP_GTIN_Status_New").setSimpleValue(getStatusToBeSet(totalPackingItem.getValue("ProductStatus").getSimpleValue()));
			var pgpGtinStatusNewAfter = targetMarket.getValue("PGP_GTIN_Status_New").getSimpleValue();
			var EOD=targetMarket.getValue("ExternalOnlineDate").getSimpleValue();
			/*if((pgpGtinStatusNewBefore != pgpGtinStatusNewAfter) || flagCheck == true){
				trigger.republish(targetMarket);
			}*/
			//Commented start as part of UAt fix SS-24184
            /*if (pgpGtinStatusNewBefore != pgpGtinStatusNewAfter) {
                //trigger.republish(targetMarket);
                //flagCheck=true;
                if ((pgpGtinStatusNewAfter == "2.Consumer In Market" || pgpGtinStatusNewAfter == "5.Consumer Future In Market") && flag != true) {
                    if (EOD != currentDate) {
                        targetMarket.getValue("eCopyReDistributionUpdate").setSimpleValue(concatenateDateTime);
                        approveRedistribution(targetMarket, log, manager);
                    }
                }
            }*/
			//Commented end as part of UAt fix SS-24184
		}
	}
	if(PGP_Flag){
		var tmrefType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
        //SS-23684 getmethod to querymethod replacement
        //var tms = totalPackingItem.getReferences(tmrefType).toArray();
        var tms = totalPackingItem.queryReferences(tmrefType).asList("20000").toArray();
		if(tms.length>0){
			//SS - 23684 getReferencedByProducts to queryReferencedBy
			//var refObjects = tms[0].getTarget().getReferencedBy().toArray();
			var refObjects = tms[0].getTarget().queryReferencedBy(null).asList("10000").toArray();		
			for(var z=0;z<refObjects.length;z++){
				var refByID = refObjects[z].getReferenceType();
				if(refByID == "PKG_TM_Reference") {
					var gtinObject = refObjects[z].getSource();
					gtinObject.getValue("PGP_GTIN_Status_New").setSimpleValue(tms[0].getTarget().getValue("PGP_GTIN_Status_New").getSimpleValue());
				}
			}
		}	
	}
}

/**Function to populate GTIN_Status_New at packaging reference level and packaging level
*@Author Akhil Reddy
*/
function populateGTINStatusNew(totalPackingItem,log,manager){
	log .info("Started populateGTINStatusNew Function with "+totalPackingItem);
	var date = new Date();
	var ISOString = date.toISOString();
	var ISODate = ISOString.substring(0, 10);
	var ISOTime = ISOString.substring(11,19);
	var concatenateDateTime = ISODate +" "+ ISOTime;
	var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
	var contextCountry=totalPackingItem.getValue("Country_TM").getSimpleValue();
	var context = lookupTable.getLookupTableValue("GlobalContext",contextCountry);
	var allContext=getGlobalContext(context);
	var brendaVisiblityFlag = brendaVisibility(totalPackingItem, manager, log);
	var tmrefType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var allTMRefType = manager.getReferenceTypeHome().getReferenceTypeByID("PKG_AllTM_Reference");
    //SS-23684 getmethod to querymethod replacement
    //var tmRefs = totalPackingItem.getReferences(tmrefType).toArray();
    var tmRefs = totalPackingItem.queryReferences(tmrefType).asList("20000").toArray();
	if(tmRefs.length>0){
		log.info("Line No: 5305");
		log.info("tmref = "+tmrefType);
		log.info("Status ="+tmRefs[0].getValue("GTINStatus").getSimpleValue());
		tmRefs[0].getValue("GTIN_Status_New").setSimpleValue(getStatusToBeSet(tmRefs[0].getValue("GTINStatus").getSimpleValue()));
		log.info("Status ="+tmRefs[0].getValue("GTIN_Status_New").getSimpleValue());
		//added start as part of SS-22778 UAT fix
		var eCopyReDistributionUpdateatTM = tmRefs[0].getTarget().getValue("eCopyReDistributionUpdate").getSimpleValue();
		//added end as part of SS-22778 UAT fix
		var packID = totalPackingItem.getID();
		var splitID = packID.split("_");
		var salesArea = splitID[1];
		if(salesArea=="CA01" || salesArea=="US61"){
			var baseMetSalesArea=tmRefs[0].getTarget().getValue("SalesAreaStatusTM").getSimpleValue();
			var salesAreaMetArray = new Array();
			if(baseMetSalesArea!=null && baseMetSalesArea!=""){
				salesAreaMetArray = baseMetSalesArea.split("<multisep/>");
			}
			for each(var met in salesAreaMetArray){
				if(met=="CA01" || met=="US61") {
					tmRefs[0].getValue("PGP_GTIN_Status_New").setSimpleValue(getStatusToBeSet(tmRefs[0].getValue("GTINStatus").getSimpleValue()));
				}
			}
		}
		var GTINStatusBefore = totalPackingItem.getValue("GTIN_Status_New").getSimpleValue();
		var PGPGTINStatusBefore = totalPackingItem.getValue("PGP_GTIN_Status_New").getSimpleValue();
		log.info("Brenad Flag ="+brendaVisiblityFlag);
		if(brendaVisiblityFlag){
			totalPackingItem.getValue("GTIN_Status_New").setSimpleValue(getStatusToBeSet(tmRefs[0].getValue("GTINStatus").getSimpleValue()));
		}
		else{
			totalPackingItem.getValue("GTIN_Status_New").deleteCurrent();
			totalPackingItem.getValue("PGP_GTIN_Status_New").deleteCurrent();
		}
		var GTINStatusAfter = totalPackingItem.getValue("GTIN_Status_New").getSimpleValue();
		var PGPGTINStatusAfter = totalPackingItem.getValue("PGP_GTIN_Status_New").getSimpleValue();
		var EOD = totalPackingItem.getValue("ExternalOnlineDate").getSimpleValue();
        //replaced OR as AND condition as part of SS-22778 UAT fix
        if (salesArea != "US61" && salesArea != "CA01") {
            if (GTINStatusBefore != GTINStatusAfter) {
                if ((GTINStatusAfter == "2.Consumer In Market" || GTINStatusAfter == "5.Consumer Future In Market") && (EOD != ISODate)) {
                    for each(var allContext1 in allContext) {
                        manager.executeInContext(allContext1, function (manager) {
                            var totalPackingItem1 = manager.getObjectFromOtherManager(totalPackingItem);
							//added as part of SS-22778 UAT fix
							//eCopyReDistributionUpdateatTM value taken from Tm and set at GTIN
                            totalPackingItem1.getValue("eCopyReDistributionUpdate").setSimpleValue(eCopyReDistributionUpdateatTM);
                            approveRedistribution(totalPackingItem1, log, manager);
                        })
                    }
                }
            }
        }
        //Commented start as part of UAt fix SS-24184 
		/*else {
            if (PGPGTINStatusBefore != PGPGTINStatusAfter) {
                if ((PGPGTINStatusAfter == "2.Consumer In Market" || PGPGTINStatusAfter == "5.Consumer Future In Market") && (EOD != ISODate)) {
                    for each(var allContext1 in allContext) {
                        manager.executeInContext(allContext1, function (manager) {
                            var totalPackingItem1 = manager.getObjectFromOtherManager(totalPackingItem);
							//added as part of SS-22778 UAT fix
							//eCopyReDistributionUpdateatTM value taken from Tm and set at GTIN
                            totalPackingItem1.getValue("eCopyReDistributionUpdate").setSimpleValue(eCopyReDistributionUpdateatTM);
                            approveRedistribution(totalPackingItem1, log, manager);
                        })
                    }
                }
            }
        }*/
		//Commented end as part of UAt fix SS-24184
	}
    //SS-23684 getmethod to querymethod replacement
    //var allTmRefs = totalPackingItem.getReferences(allTMRefType).toArray();
    var allTmRefs = totalPackingItem.queryReferences(allTMRefType).asList("20000").toArray();
	for each(var tmRef in allTmRefs){
		tmRef.getValue("GTIN_Status_New").setSimpleValue(getStatusToBeSet(tmRef.getValue("GTINStatus").getSimpleValue()));
		var packID = totalPackingItem.getID();
		var splitID = packID.split("_");
		var salesArea = splitID[1];
		if(salesArea=="CA01" || salesArea=="US61"){
			var baseMetSalesArea=tmRef.getTarget().getValue("SalesAreaStatusTM").getSimpleValue();
			var salesAreaMetArray = new Array();
			if(baseMetSalesArea!=null && baseMetSalesArea!=""){
				salesAreaMetArray = baseMetSalesArea.split("<multisep/>");
			}
			for each(var met in salesAreaMetArray){
				if(met=="CA01" || met=="US61") {
					tmRef.getValue("PGP_GTIN_Status_New").setSimpleValue(getStatusToBeSet(tmRef.getValue("GTINStatus").getSimpleValue()));
				}
			}
		}
	}
}
function getStatusToBeSet(value){
	if(value){
		if(value=="In Market")
			return "1.In Market";
		else if(value=="Consumer In Market")
			return "2.Consumer In Market";
		else if(value=="Shipping In Market")
			return "3.Shipping In Market";
		else if(value=="Future In Market")
			return "4.Future In Market";
		else if(value=="Consumer Future In Market")
			return "5.Consumer Future In Market";
		else if(value=="Previous In Market")
			return "6.Previous In Market";
		else if(value=="Previous Consumer In Market")
			return "7.Previous Consumer In Market";
	}
	else{
		return "";
	}
}
/*
* GTIN to GTIN Reference Creation
*@Author Sujesh Ravichandran
*/
function populateGTINtoGTINRef(packagingHirarchyObj,manager,log){
	var currID = packagingHirarchyObj.getID().split("_");
	createGTINComponentReferences(packagingHirarchyObj);
	var currID = packagingHirarchyObj.getID().split("_");
	var currentSalesArea = currID[1];
	var currObjType = packagingHirarchyObj.getObjectType().getID();
	var pkgTMReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var tmComponentsRefType =manager.getLinkTypeHome().getReferenceTypeByID("TM_Component");
	//log.info(packagingHirarchyObj.getID());
    //SS-23684 getmethod to querymethod replacement
    //var tmRefs = packagingHirarchyObj.getReferences(pkgTMReferenceType).toArray();
    var tmRefs = packagingHirarchyObj.queryReferences(pkgTMReferenceType).asList("20000").toArray();
	var currentTM = tmRefs[0].getTarget();
	var packArray = [];
	//SS - 23684 getReferencedByProducts to queryReferencedBy
	//var refByProducts = currentTM.getReferencedByProducts().toArray();
	var refByProducts = currentTM.queryReferencedBy(null).asList("10000").toArray();		
	for each(var refBy in refByProducts){
		var refTm = refBy.getSource();
		if(refTm.getObjectType().getID()=="FPC_TM"){
			//SS - 23684 getReferencedByProducts to queryReferencedBy
			//var refGTINs = refTm.getReferencedByProducts().toArray();
			var refGTINs = refTm.queryReferencedBy(null).asList("10000").toArray();
			for each(var GTIN_Ref in refGTINs){
				var gtinObj = GTIN_Ref.getSource();
				var flag = 0;
				if(gtinObj.getParent().getID()=="PackagingRoot"){
					var refID = gtinObj.getID().split("_");
					var refSalesArea = refID[1];
					var refObjType = gtinObj.getObjectType().getID();
					if(currentSalesArea == refSalesArea && currObjType == refObjType){
						for each(var item in packArray){
							if(item==gtinObj.getID()){
								flag++;
							}
						}
						if(flag==0){
							createGTINComponentReferences(gtinObj);
							packArray.push(gtinObj.getID());
						}
					}
				}
			}
		}
	}
	function createGTINComponentReferences(packagingHirarchyObj){
		var pkgTMReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
		var gtinComponent=manager.getReferenceTypeHome().getReferenceTypeByID("GTIN_Component");
        //SS-23684 getmethod to querymethod replacement
        //var pkgTMRef = packagingHirarchyObj.getReferences(pkgTMReferenceType).toArray();
        var pkgTMRef = packagingHirarchyObj.queryReferences(pkgTMReferenceType).asList("20000").toArray();
		var srcPkgObjType=packagingHirarchyObj.getObjectType().getID();
		var gtinSalesArea=packagingHirarchyObj.getID().split("_");	
		var srcPkgObjSalesArea=gtinSalesArea[1];
		var srcPkgType=packagingHirarchyObj.getValue("PackagingType").getSimpleValue();
        //SS-23684 getmethod to querymethod replacement
        //var refs =packagingHirarchyObj.getReferences(gtinComponent).toArray();
        var refs = packagingHirarchyObj.queryReferences(gtinComponent).asList("20000").toArray();
		var existingGtinRefs = new java.util.LinkedList();
		var gtinsToBeCreated = new java.util.LinkedList();
		for each (var ref in refs){
			existingGtinRefs.push(ref.getTarget());
		}
		for(var k=0;k<pkgTMRef.length;k++){
			var objectType = pkgTMRef[k].getTarget().getObjectType().getID();
			if(objectType=="FPC_TM"){
				var srcTMObj = pkgTMRef[k].getTarget();
				var tmComponentsRefType =manager.getLinkTypeHome().getReferenceTypeByID("TM_Component");
                //SS-23684 getmethod to querymethod replacement
                //var destTMRefArrObj = srcTMObj.getReferences(tmComponentsRefType).toArray();
                var destTMRefArrObj = srcTMObj.queryReferences(tmComponentsRefType).asList("20000").toArray();
				for(var x=0;x<destTMRefArrObj.length; x++){
					var destTMObj = destTMRefArrObj[x].getTarget();
					var childUoM = destTMRefArrObj[x].getValue("ChildUoM").getSimpleValue();
					var childQuantity = destTMRefArrObj[x].getValue("ChildQuantity").getSimpleValue();
					if(destTMObj.getObjectType().getID()=="FPC_TM"){
						//SS - 23684 getReferencedByProducts to queryReferencedBy
						//var refBys = destTMObj.getReferencedBy().toArray();
						var refBys = destTMObj.queryReferencedBy(null).asList("10000").toArray();
						for(var i=0;i<refBys.length;i++){
							var refByTypeID = refBys[i].getReferenceType();
							if (refByTypeID == "PKG_TM_Reference"){
								var refByObj = refBys[i].getSource();
								var refByObjSalesAreaArr=refByObj.getID().split("_");
								if(refByObj.getObjectType().getID()==srcPkgObjType && srcPkgObjSalesArea==refByObjSalesAreaArr[1]){
									if(srcPkgType==refByObj.getValue("PackagingType").getSimpleValue()){
										gtinsToBeCreated.push(refByObj);
										if(!(existingGtinRefs.contains(refByObj))){
											var newRef = packagingHirarchyObj.createReference(refByObj,"GTIN_Component");
											newRef.getValue("ChildUoM").setSimpleValue(childUoM);
											newRef.getValue("ChildQuantity").setSimpleValue(childQuantity);
										}
										else{
                                            //SS-23684 getmethod to querymethod replacement
                                            //var gtinComponenets = packagingHirarchyObj.getReferences(gtinComponent).toArray();
                                            var gtinComponenets = packagingHirarchyObj.queryReferences(gtinComponent).asList("20000").toArray();
											for each(var gtinRef in gtinComponenets){
												if(gtinRef.getTarget().getID() == refByObj.getID()){
													if(gtinRef.getValue("ChildUoM").getSimpleValue() != childUoM){
														gtinRef.getValue("ChildUoM").setSimpleValue(childUoM);
													}
													if(gtinRef.getValue("ChildQuantity").getSimpleValue() != childQuantity){
														gtinRef.getValue("ChildQuantity").setSimpleValue(childQuantity);
													}
												}
											}
										}
									}
								}							
							}
						}
					}				
				}				
			}
		}
		//Deletion of other Reference that are not required
        //SS-23684 getmethod to querymethod replacement
        //var packrefs = packagingHirarchyObj.getReferences(gtinComponent).toArray();
        var packrefs = packagingHirarchyObj.queryReferences(gtinComponent).asList("20000").toArray();
		for each(var packref in packrefs){
			if(!(gtinsToBeCreated.contains(packref.getTarget()))){
				packref.delete();
			}
		}
		var existingGtinRefs = new java.util.LinkedList();
		var gtinsToBeCreated = new java.util.LinkedList();
	}	
}
function populateCLMDatesForGTIN(gtinProduct,productStatusValue,log,manager){
	var gtinID = gtinProduct.getID();
	var tempArray = gtinID.split("_");
	var salesArea = tempArray[1];
	var targetMarket = null;
	var attributeArray = ["FutureInMarket","UpdateFutureInMarket","ConsumerFutureInMarket","UpdateConsumerFutureInMarket","InMarket","UpdateInMarket",
						 "ConsumerInMarket","UpdateConsumerInMarket","PreviousConsumerInMarket","UpdatePreviousConsumerInMarket","PreviousInMarket","UpdatePreviousInMarket"];
	var pgpAttributeArray = ["PGPFutureInMarket","PGPUpdateFutureInMarket","PGPConsumerFutureInMarket","PGPUpdateConsumerFutureInMarket","PGPInMarket","PGPUpdateInMarket",
						  "PGPConsumerInMarket","PGPUpdateConsumerInMarket","PGPPreviousConsumerInMarket","PGPUpdatePreviousConsumerInMarket","PGPPreviousInMarket","PGPUpdatePreviousInMarket"];
	if(salesArea=="CA00"||salesArea=="US60"||salesArea=="PR04" || salesArea == "PH0303" || salesArea == "US61" || salesArea == "CA01" ){
		var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
        //SS-23684 getmethod to querymethod replacement
        //var tmArray = gtinProduct.getReferences(tmReferenceType).toArray();
        var tmArray = gtinProduct.queryReferences(tmReferenceType).asList("20000").toArray();
		var targetMarket = tmArray[0].getTarget();
	}
	var ISODateAndTime = dateTime(manager);
	if(salesArea=="CA00"||salesArea=="US60"||salesArea=="PR04" || salesArea == "PH0303" ){
		var attributeID = getAttributeIDFromStatus(productStatusValue);
		var updateAttributeID = "Update"+attributeID;
		AttributeSetting(attributeArray,attributeID,updateAttributeID);
	}
	else if( salesArea == "US61" || salesArea == "CA01" ){
		var attributeID = "PGP"+getAttributeIDFromStatus(productStatusValue);
		var updateAttributeID = attributeID.replace("PGP","PGPUpdate");
		AttributeSetting(pgpAttributeArray,attributeID,updateAttributeID);
	}
	var ISODateAndTime = dateTime(manager);
	var attributeID = getAttributeIDFromStatus(productStatusValue);
	for each (var attr in attributeArray){
		if(attr == attributeID){
			var firstDateValue =  gtinProduct.getValue(attributeID).getSimpleValue();
			if(firstDateValue==null||firstDateValue==""){
				//First Date is empty so populate only first date
				gtinProduct.getValue(attributeID).setSimpleValue(ISODateAndTime);
				if(targetMarket!=null){
					targetMarket.getValue(attributeID).setSimpleValue(ISODateAndTime);
				}
			}
			else{
				//First date is populated
				//Check for the status
				var updateAttributeID = "Update"+attributeID;
				var updateAttribute = manager.getAttributeHome().getAttributeByID(updateAttributeID);
				if(updateAttribute){
					var previousStatus = gtinProduct.getValue("GTINStatus").getSimpleValue();
					if(previousStatus){
						if(previousStatus!=productStatusValue){
							//Status has been updated 
							gtinProduct.getValue(updateAttributeID).setSimpleValue(ISODateAndTime);
							if(targetMarket!=null){
								targetMarket.getValue(updateAttributeID).setSimpleValue(ISODateAndTime);
							}
						}
					}
				}
			}
		}
	}
	return targetMarket;
	function getAttributeIDFromStatus(productStatusValue){
		//Store the Corresponding attribute ID's in this function
		//var returnID = null;
		//log.info("productStatusValue RS Before: " +productStatusValue);
		if(productStatusValue.match(" ")){
			var productStatusValueString=productStatusValue.toString();
			var productStatusArray=productStatusValueString.split(" ");
			//var ArrayLen=productStatusArray.length-1;
			var productStatusValueID="";
			for(var i=0;i<productStatusArray.length;i++){
		     productStatusValueID+=productStatusArray[i];
			}
		}
		//log.info("productStatusValueTrimmed RS: " +productStatusValueID);
		return productStatusValueID;
	}
	function AttributeSetting(attrArray,attributeID,updateAttributeID){
		for each (var attr in attrArray){
			if (attr == attributeID){
				var firstDateValue =  gtinProduct.getValue(attributeID).getSimpleValue();
				if(firstDateValue==null||firstDateValue==""){
					//First Date is empty so populate only first date
					gtinProduct.getValue(attributeID).setSimpleValue(ISODateAndTime);
					if(targetMarket!=null){
						targetMarket.getValue(attributeID).setSimpleValue(ISODateAndTime);
					}
				}
				else{
					//First date is populated
					//Check for the status
					var updateAttribute = manager.getAttributeHome().getAttributeByID(updateAttributeID);
					if(updateAttribute){
						var previousStatus = gtinProduct.getValue("GTINStatus").getSimpleValue();
						if(previousStatus){
							if(previousStatus!=productStatusValue){
								//Status has been updated 
								gtinProduct.getValue(updateAttributeID).setSimpleValue(ISODateAndTime);
								if(targetMarket!=null){
									targetMarket.getValue(updateAttributeID).setSimpleValue(ISODateAndTime);
								}
							}
						}
					}
				}
			}
		}
	}
}

/*//Function to populate the value of "Product_Status_New" at GTIN Level
//Author @ Anusha*/

function toPopulateProductStatusNewAtPacks(obj,log,manager,trigger){
	/*var objType = node.getParent().getObjectType().getID();
	if(objType == "PackagingRoot"){
		var productStatusNew = node.getValue("Product_Status_New").getSimpleValue();
		var productStatus = node.getValue("ProductStatus").getSimpleValue();
		//node.getValue("Product_Status_New").deleteCurrent();
		var currentLifeCycleStageLOV = node.getValue("CurrentLifecycleStage").getLOVValue();
		if(currentLifeCycleStageLOV){
			var currentLifeCycleStage = currentLifeCycleStageLOV.getID();
			if(currentLifeCycleStage == "1"){
				node.getValue("Product_Status_New").setSimpleValue("Unreleased");
			}
			else if((currentLifeCycleStage == "6")||(currentLifeCycleStage == "7")){
				node.getValue("Product_Status_New").setSimpleValue("Inactive");
			}
			else if((currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")|| (currentLifeCycleStage == "4")||(currentLifeCycleStage == "5")){
				if((productStatus == "Consumer In Market") || (productStatus == "In Market")){
					node.getValue("Product_Status_New").setSimpleValue("Representative");
				}
				else if ((productStatus == "Shipping In Market")){
					node.getValue("Product_Status_New").setSimpleValue("Alternative");
				}
				else if((productStatus == "Previous Consumer In Market") || (productStatus == "Previous In Market")) {
					node.getValue("Product_Status_New").setSimpleValue("Past Last Order Date");
				}
				else if((productStatus == "Consumer Future In Market") || (productStatus == "Future In Market")) {
					node.getValue("Product_Status_New").setSimpleValue("New");
				}
				else{
					node.getValue("Product_Status_New").setSimpleValue("");
				}					
			}
		}		
	}*/
	// Modified with respect to CR-095
	
	var objectType = obj.getObjectType();
	var country=obj.getValue("Country_TM").getSimpleValue();
	if(country=="US" || country=="CA" || country=="PR"){
		if(obj.getParent().getID()=="PackagingRoot"){
			var objectType=obj.getObjectType().getID();
			var pimIDAttr=obj.getValue("PIMIDAttribute").getSimpleValue();
			var brand=obj.getValue("Brandtype").getSimpleValue();
			var country = obj.getValue("Country_TM").getSimpleValue();
			var currentLifeCycleStage = obj.getValue("CurrentLifecycleStage").getLOVValue();
			if(pimIDAttr!= null && pimIDAttr!= ""  && obj.getValue("BaseSufficiencyMet").getSimpleValue()=="Yes"){
				if(brand=="FEEDER CODE"){ //Condition 5
					obj.getValue("Product_Status_New").setSimpleValue("Feeder");
				}
				else if(brand == "NON-SHIPPING BRAND CODE REQUIRED BY OSB" || brand == "SAMPLE-INTERPLANT CODE (NOT PRICED)"){ // Condition 1,2
					obj.getValue("Product_Status_New").setSimpleValue("Unreleased");
				}
				else{
					if((currentLifeCycleStage.getID() == "2")||(currentLifeCycleStage.getID() == "3")){ //Condition 6
						obj.getValue("Product_Status_New").setSimpleValue("New");
					}
					else if(currentLifeCycleStage.getID() == "5"){
						obj.getValue("Product_Status_New").setSimpleValue("Past Last order date"); //Condition 8
					}
					else if(currentLifeCycleStage.getID() == "4"){
						var CSgtinAttr = manager.getAttributeHome().getAttributeByID("CaseGTIN");
						var CSgtinValue = obj.getValue("CaseGTIN").getSimpleValue();
						var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
						var productsPIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,CSgtinAttr,CSgtinValue)).asList(100).toArray();
						var objectArray=[];
						var LC4DateArray=[];
						var customerArray=[];
						//objectArray.push(obj);
						
						for each(var object in productsPIM){
							if(object.getParent().getID()=="PackagingRoot"){
								if (object.getObjectType().getID()==objectType && object.getValue("Country_TM").getSimpleValue() == country){
									//logger.info("object" + object);	
									var objSplit = object.getID().split("_");
									var salesAreaCheck = objSplit[1];
									var brandObj=object.getValue("Brandtype").getSimpleValue();
									if(brandObj != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && brandObj != "SAMPLE-INTERPLANT CODE (NOT PRICED)" && brandObj!="FEEDER CODE" ){
										if(salesAreaCheck == "CA00" || salesAreaCheck == "US60" || salesAreaCheck == "PR04"){
											if(object.getValue("BaseSufficiencyMet").getSimpleValue()=="Yes" && object.getValue("PIMIDAttribute").getSimpleValue()!=null && object.getValue("PIMIDAttribute").getSimpleValue()!="" && object.getValue("CurrentLifecycleStage").getLOVValue().getID()=="4"){
												objectArray.push(object);
											}
										}
										else{
											object.getValue("Product_Status_New").setSimpleValue("Alternative");
											//logger.info("3901");
										}
									}
								}
							}
						}
						if(objectArray.length==1){
							objectArray[0].getValue("Product_Status_New").setSimpleValue("Representative");
							//logger.info("in");
						}
						else{
							
							for each(ob in objectArray){
								var customerClassification=ob.getValue("CustomerClassificationAtTM").getSimpleValue();
								var LC4Date = ob.getValue("LifeCycleStage4").getSimpleValue();
								LC4DateArray.push(LC4Date);
								customerArray.push(customerClassification);
							}
							if(SameCheck(LC4DateArray) && SameCheck(customerArray)){ //Condition 21F, 21G
								highestFPCToBeRepresentative(objectArray,null);
							}
							else if(!SameCheck(LC4DateArray) && SameCheck(customerArray)){ 
								var latestDate = LC4DateArray[0];
								for each (var date in LC4DateArray){
									if(date> latestDate){
										latestDate=date;
									}
								}
								var indexArray=[];
								for (var i=0;i<LC4DateArray.length;i++){
									if (LC4DateArray[i]==latestDate){
										indexArray.push(i);
									}
								}
								if(indexArray.length==1){ // Condition 21C, 21D
									var index=LC4DateArray.indexOf(latestDate);
									log.info(index + " " + latestDate + " " + objectArray[i]);
									for (var i=0;i<objectArray.length;i++){
										if (i==index){
											objectArray[i].getValue("Product_Status_New").setSimpleValue("Representative");
											log.info("INC Check :" + objectArray[i]);
										}
										else{
											objectArray[i].getValue("Product_Status_New").setSimpleValue("Alternative");
											log.info("Check " + objectArray[i]);
										}
									}
								}
								else{   // Condition 21K
									highestFPCToBeRepresentative(objectArray,indexArray);
								}
							}
							else if(!SameCheck(customerArray)){
								if(SameCheck(LC4DateArray)){
									var customerArraystring=customerArray.toString();
									if(!(customerArraystring.match("National"))){
										highestFPCToBeRepresentative(objectArray,null);
									}
									else{
										var indexArray=[];
										for(var j=0;j<objectArray.length;j++){
											var custClassification=objectArray[j].getValue("CustomerClassificationAtTM").getSimpleValue();
											if(custClassification=="National"){
												indexArray.push(j);
											}
											else{
												objectArray[j].getValue("Product_Status_New").setSimpleValue("Alternative");
												
											}
										}
										if(indexArray.length==1){ //Condition 21E
											var repPdt=objectArray[indexArray[0]];
											for each(var pdt in objectArray){
												if(pdt.getID()==repPdt.getID()){
													pdt.getValue("Product_Status_New").setSimpleValue("Representative");
												}
												else{
													pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
													
												}
											}
										}
										else{ //Condition 21J
											highestFPCToBeRepresentative(objectArray,indexArray);
										}
									}
								}
								else{
									var customerArraystring=customerArray.toString();
									if(!(customerArraystring.match("National"))){
										var latestDate = LC4DateArray[0];
										for each (var date in LC4DateArray){
											if(date> latestDate){
												latestDate=date;
											}
										}
										var indexArray=[];
										for (var i=0;i<LC4DateArray.length;i++){
											if (LC4DateArray[i]==latestDate){
												indexArray.push(i);
											}
										}
										if(indexArray.length==1){ // Condition 21C, 21D
											var index=LC4DateArray.indexOf(latestDate);
											for (var i=0;i<objectArray.length;i++){
												if (i==index){
													objectArray[i].getValue("Product_Status_New").setSimpleValue("Representative");
												}
												else{
													objectArray[i].getValue("Product_Status_New").setSimpleValue("Alternative");
													//logger.info("4009");
												}
											}
										}
										else{   // Condition 21K
											highestFPCToBeRepresentative(objectArray,indexArray);
										}
									}
									else{
										var NationalIDArray=[];
										for(var j=0;j<objectArray.length;j++){
											var custClassification=objectArray[j].getValue("CustomerClassificationAtTM").getSimpleValue();
											if(custClassification=="National"){
												NationalIDArray.push(objectArray[j]);
											}
											else{
												objectArray[j].getValue("Product_Status_New").setSimpleValue("Alternative");
												//logger.info("4026");
											}
										}
										if(NationalIDArray.length==1){ //Condition 21E
											NationalIDArray[0].getValue("Product_Status_New").setSimpleValue("Representative");
										}
										else{
											var dateArrayNational=[];
											for each(var p in NationalIDArray){
												var LC4Date = p.getValue("LifeCycleStage4").getSimpleValue();
												dateArrayNational.push(LC4Date);
											}
											var latestDate = dateArrayNational[0];
											for each (var date in dateArrayNational){
												if(date> latestDate){
													latestDate=date;
												}
											}
											var indexArraylatestDate=[];
											for (var i=0;i<dateArrayNational.length;i++){
												if (dateArrayNational[i]==latestDate){
													indexArraylatestDate.push(i);
												}
											}
											if(indexArraylatestDate.length==1){
												var repPDT=NationalIDArray[indexArraylatestDate[0]];
												for each(var pdt in NationalIDArray){
													if(pdt.getID()==repPDT.getID()){
														pdt.getValue("Product_Status_New").setSimpleValue("Representative");
													}
													else{
														pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
														//logger.info("4058");
													}
												}
											}
											else{
												var highestFpcCode=0;
												for each (var index in indexArraylatestDate){
													var code=NationalIDArray[index].getValue("FinishedProductCode").getSimpleValue();
													if(code>highestFpcCode){
														highestFpcCode = code;
													}
												}
												for each(var pdt in NationalIDArray){
													var finishedpdtcode = pdt.getValue("FinishedProductCode").getSimpleValue();
													if(finishedpdtcode==highestFpcCode){
														pdt.getValue("Product_Status_New").setSimpleValue("Representative");
													}
													else{
														pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
															//logger.info("4058");
													}
												}
												highestFPCToBeRepresentative(NationalIDArray,indexArraylatestDate);
											}
										}
									}
								}
							}
						}
						/*for each(var obts in objectArray){
							if(obts.getValue("FinishedProductCode").getSimpleValue()!=obj.getValue("FinishedProductCode").getSimpleValue()){
								//obts.approve();
								if(obts.getObjectType().getID()=="Case"){
									if(obts.getValue("MaterialSubType").getSimpleValue() == "DISPLAY" || obts.getValue("MaterialSubType").getSimpleValue() == "Display"){
										trigger.republish(obts);
									}			
								}
								else if(obts.getObjectType().getID()=="Each"){
									if(obts.getValue("MaterialSubType").getSimpleValue() != "DISPLAY" && obts.getValue("MaterialSubType").getSimpleValue() != "Display"){
										trigger.republish(obts);
									}
								}
							}
						}*/
					}
				}
			}
		}
	}
}


/*
To POpulate Product_Status_New in Target Market Level
*/
function populateGTINStatusNewAtTM(obj, manager, log){
	//log.info("Start 3691");
	/*var curObjType = curObj.getObjectType().getID();
	if(curObjType == "FPC_TM"){
		var productStatusNew = curObj.getValue("Product_Status_New").getSimpleValue();
		curObj.getValue("Product_Status_New").deleteCurrent();
		var productStatus;
		var salesAreaGroupingRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
		var salesAreaRefs = curObj.getClassificationProductLinks(salesAreaGroupingRefType).toArray();
		for each (var salesRef in salesAreaRefs){
			var salesAreaID = salesRef.getClassification().getID();
			if((salesAreaID == "US60") || (salesAreaID == "CA00") || (salesAreaID == "PR04") || (salesAreaID =="PH0303")){
				productStatus = salesRef.getValue("ProductStatus").getSimpleValue();
			}			
			else if(salesAreaID != "US61"&& salesAreaID != "USY1"&& salesAreaID != "US65"&& salesAreaID != "US64"&& salesAreaID != "CA01"&& salesAreaID != "PR04"&& salesAreaID != "PH0302"){									
				productStatus = salesRef.getValue("ProductStatus").getSimpleValue();
			}
		}
		var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
		var lifeCycleRefs =curObj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
		for(var b=0; b<lifeCycleRefs.length; b++){
			var lifeCycleRef = lifeCycleRefs[b];
			var lifeCycleRefID = lifeCycleRef.getClassification().getID();
			if(lifeCycleRefID == curObj.getValue("Country_TM").getSimpleValue()){
				var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
				if(currentLifeCycleStageLOV){					
					var currentLifeCycleStage = currentLifeCycleStageLOV.getID();					
					if(currentLifeCycleStage == "1"){
						curObj.getValue("Product_Status_New").setSimpleValue("Unreleased");
					}
					else if((currentLifeCycleStage == "6")||(currentLifeCycleStage == "7")){
						curObj.getValue("Product_Status_New").setSimpleValue("Inactive");
					}
					else if((currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")|| (currentLifeCycleStage == "4")||(currentLifeCycleStage == "5")){
						var salesAreaStatusTM = curObj.getValue("SalesAreaStatusTM").getSimpleValue();
						if(salesAreaStatusTM){
							var salesAreaStatus = salesAreaStatusTM.replace("<multisep/>",",");
							salesAreaTM = salesAreaStatus.split(",");
							for each(var sales in salesAreaTM){
								var lookupTable = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);							
								var globalSalesAreaPDS = lookupTable.getLookupTableValue("GlobalPDSSalesArea",sales);
								if(globalSalesAreaPDS =="Yes"){
									if((productStatus == "Consumer In Market") || (productStatus == "In Market")){
										curObj.getValue("Product_Status_New").setSimpleValue("Representative");
									}
									else if ((productStatus == "Shipping In Market")){
										curObj.getValue("Product_Status_New").setSimpleValue("Alternative");
									}
									else if((productStatus == "Previous Consumer In Market") || (productStatus == "Previous In Market")) {
										curObj.getValue("Product_Status_New").setSimpleValue("Past Last Order Date");
									}
									else if((productStatus == "Consumer Future In Market") || (productStatus == "Future In Market")) {
										curObj.getValue("Product_Status_New").setSimpleValue("New");
									}
								}
							}
						}
						else{
							curObj.getValue("Product_Status_New").setSimpleValue("Unreleased");
						}
					}
				}
			}
		}	
	}*/
	// Modified with respect to CR-095
	var objectType = obj.getObjectType();
	if(objectType.getID() == "FPC_TM"){
		var country=obj.getValue("Country_TM").getSimpleValue();
		if(country=="US" || country=="CA" || country=="PR"){
			var retailflag = false;
			var professionalFlag = false;
			var brand=obj.getValue("Brandtype").getSimpleValue();
			var baseSuffMet=obj.getValue("BaseSufficiencyMet").getSimpleValue();
            //SS-24166 getmethod to querymethod replacement
            //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
            var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");

            //SS-24166 getmethod to querymethod replacement
            //var lifeCycleRefs =obj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
            var lifeCycleRefs = obj.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
			for each(var lifeCycleRef in lifeCycleRefs){
				var sales = lifeCycleRef.getValue("SalesArea").getSimpleValue();
				if(sales!=null && sales!=""){
					if(sales.match("CA01") || sales.match("US61")){
						professionalFlag = true;
					}
					if(sales.match("CA00") || sales.match("US60") || sales.match("PR04")){
						retailflag = true;
					}
				}
			}
			if (baseSuffMet=="No"){
				if(brand == "NON-SHIPPING BRAND CODE REQUIRED BY OSB" || brand == "SAMPLE-INTERPLANT CODE (NOT PRICED)"){ // Condition 1,2
					obj.getValue("Product_Status_New").setSimpleValue("Unreleased");
				}
				else if(brand=="FEEDER CODE"){ //Condition 5
					obj.getValue("Product_Status_New").setSimpleValue("Feeder");
				}
				else if(lifeCycleRefs.length > 0){
					for(var b=0; b<lifeCycleRefs.length; b++){
						var lifeCycleRef = lifeCycleRefs[b];
						var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
						var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
						if(currentLifeCycleStageLOV!=null && currentLifeCycleStageLOV!=""){
							var currentLifeCycleStage = currentLifeCycleStageLOV.getID();
							if(salesArea!=null){
								var salesAreaArray = salesArea.split("<multisep/>");
								for(var k=0;k<salesAreaArray.length;k++){
									var sales = salesAreaArray[k].split("_");
                                    if(sales[0]=="CA00" || sales[0]=="US60" || sales[0]=="PR04") {
										if((currentLifeCycleStage == "1")||(currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")||(currentLifeCycleStage == "4")||(currentLifeCycleStage == "5") ){ // Condition 3,4
											obj.getValue("Product_Status_New").setSimpleValue("Unreleased");
										}
										else if((currentLifeCycleStage == "6")||(currentLifeCycleStage == "7")){ // Condition 9
											obj.getValue("Product_Status_New").setSimpleValue("Inactive");
										}

							     if(obj.getValue("Product_Status_New").getSimpleValue() == "Unreleased")
								{
                                        // SS-26341 to assign Product status as "Representative" or "Alternative" for FPC which share same CaseGTIN
									   var CSgtinAttr = manager.getAttributeHome().getAttributeByID("CaseGTIN");
                                                var FPC = obj.getParent();
                                                var CSgtinValue = FPC.getValue("CaseGTIN").getSimpleValue();												
                                                var singlehome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
                                                var productsPIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product, CSgtinAttr, CSgtinValue)).asList(100).toArray();
                                                var onlyLC4TM;
                                                var LC4TMArray = [];
                                                var LC4DateArray = [];
                                                var customerArray = [];                                               
												
                                                for each(var fpcObj in productsPIM) {
                                                    if (fpcObj.getObjectType().getID() == "FPC" ) {
                                                        var fpcCode = fpcObj.getValue("FinishedProductCode").getSimpleValue();
                                                        var targetKey = country + "_" + fpcCode;																									
                                                        var tmObj = manager.getNodeHome().getObjectByKey("TargetMarket", targetKey);																												
                                                        if (tmObj != null && tmObj.getID()!= obj.getID()) {
                                                            var baseSuff = tmObj.getValue("BaseSufficiencyMet").getSimpleValue();                                                           															
                                                            var refArray = tmObj.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
                                                            if (refArray.length > 0) {
                                                                for (var b = 0; b < refArray.length; b++) {
                                                                    var lifeCycleRef = refArray[b];
                                                                    var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
                                                                    var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
                                                                    if (currentLifeCycleStageLOV != null && currentLifeCycleStageLOV != "") {
                                                                        var currentLifeCycleStage = currentLifeCycleStageLOV.getID();
                                                                        if (salesArea != null && salesArea != "") {
                                                                            var salesAreaArray = salesArea.split("<multisep/>");
                                                                            for (var t = 0; t < salesAreaArray.length; t++) {
                                                                                var sales = salesAreaArray[t].split("_");
                                                                                if (sales[0] == "CA00" || sales[0] == "US60" || sales[0] == "PR04") {
                                                                                    var brandOb = tmObj.getValue("Brandtype").getSimpleValue();
                                                                                    if (currentLifeCycleStage == "4" && baseSuff == "Yes" && brandOb != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && brandOb != "SAMPLE-INTERPLANT CODE (NOT PRICED)" && brandOb != "FEEDER CODE") {
                                                                                        onlyLC4TM = tmObj;
                                                                                        if (LC4TMArray.indexOf(tmObj) == -1) {
                                                                                            LC4TMArray.push(tmObj);																																												
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
												
                                                if (LC4TMArray.length == 1) { //Condition 20B
                                                    LC4TMArray[0].getValue("Product_Status_New").setSimpleValue("Representative");													
                                                } 
												else {
                                                    for each(var tm in LC4TMArray) {
                                                        var customerClassification = tm.getValue("CustomerClassificationAtTM").getSimpleValue();														
                                                        //SS-24166 getmethod to querymethod replacement
                                                        //var refArr =tm.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                                                        var refArr = tm.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
                                                        for (var i = 0; i < refArr.length; i++) {
                                                            var lifeCycleRef = refArr[i];
                                                            var LC4Date = lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
                                                        }
                                                        LC4DateArray.push(LC4Date);
                                                        customerArray.push(customerClassification);
                                                    }
                                                    if (SameCheck(LC4DateArray) && SameCheck(customerArray)) { //Condition 21F, 21G
                                                        highestFPCToBeRepresentative(LC4TMArray, null);														
                                                    } else if (!SameCheck(LC4DateArray) && SameCheck(customerArray)) {
                                                        var latestDate = LC4DateArray[0];
                                                        for each(var date in LC4DateArray) {
                                                            if (date > latestDate) {
                                                                latestDate = date;
                                                            }
                                                        }
                                                        var indexArray = [];
                                                        for (var i = 0; i < LC4DateArray.length; i++) {
                                                            if (LC4DateArray[i] == latestDate) {
                                                                indexArray.push(i);
                                                            }
                                                        }
                                                        if (indexArray.length == 1) { // Condition 21C, 21D
                                                            var index = LC4DateArray.indexOf(latestDate);
                                                            for (var i = 0; i < LC4TMArray.length; i++) {
                                                                if (i == index) {
                                                                    LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Representative");																	
                                                                } else {
                                                                    LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Alternative");																	
                                                                }
                                                            }
                                                        } else { // Condition 21K
                                                            highestFPCToBeRepresentative(LC4TMArray, indexArray);
                                                        }
                                                    } else if (!SameCheck(customerArray)) {
                                                        if (SameCheck(LC4DateArray)) {															
                                                            var customerArraystring = customerArray.toString();
                                                            if (!(customerArraystring.match("National"))) {
                                                                highestFPCToBeRepresentative(LC4TMArray, null);
                                                            } else {
                                                                var indexArray = [];
                                                                for (var j = 0; j < LC4TMArray.length; j++) {
                                                                    var custClassification = LC4TMArray[j].getValue("CustomerClassificationAtTM").getSimpleValue();
                                                                    if (custClassification == "National") {
                                                                        indexArray.push(j);
                                                                    } else {
                                                                        LC4TMArray[j].getValue("Product_Status_New").setSimpleValue("Alternative");
                                                                    }
                                                                }
                                                                if (indexArray.length == 1) { //Condition 21E
                                                                    var repPdt = LC4TMArray[indexArray[0]];
                                                                    for each(var pdt in LC4TMArray) {
                                                                        if (pdt.getID() == repPdt.getID()) {
                                                                            pdt.getValue("Product_Status_New").setSimpleValue("Representative");
                                                                        } else {
                                                                            pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
                                                                        }
                                                                    }
                                                                } else { //Condition 21J
                                                                    highestFPCToBeRepresentative(LC4TMArray, indexArray);
                                                                }
                                                            }
                                                        } else {															
                                                            var customerArraystring = customerArray.toString();
                                                            if (!(customerArraystring.match("National"))) {																
                                                                var latestDate = LC4DateArray[0];
                                                                for each(var date in LC4DateArray) {
                                                                    if (date > latestDate) {
                                                                        latestDate = date;
                                                                    }
                                                                }
                                                                var indexArray = [];
                                                                for (var i = 0; i < LC4DateArray.length; i++) {
                                                                    if (LC4DateArray[i] == latestDate) {
                                                                        indexArray.push(i);
                                                                    }
                                                                }
                                                                if (indexArray.length == 1) { // Condition 21C, 21D
                                                                    var index = LC4DateArray.indexOf(latestDate);
                                                                    for (var i = 0; i < LC4TMArray.length; i++) {
                                                                        if (i == index) {
                                                                            LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Representative");																			
                                                                        } else {
                                                                            LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Alternative");																			
                                                                        }
                                                                    }
                                                                } else { // Condition 21K
                                                                    highestFPCToBeRepresentative(LC4TMArray, indexArray);
                                                                }
                                                            } else {																
                                                                var NationalIDArray = [];
                                                                for (var j = 0; j < LC4TMArray.length; j++) {
                                                                    var custClassification = LC4TMArray[j].getValue("CustomerClassificationAtTM").getSimpleValue();
                                                                    if (custClassification == "National") {
                                                                        NationalIDArray.push(LC4TMArray[j]);
                                                                    } else {
                                                                        LC4TMArray[j].getValue("Product_Status_New").setSimpleValue("Alternative");
                                                                    }
                                                                }
                                                                if (NationalIDArray.length == 1) { //Condition 21E
                                                                    NationalIDArray[0].getValue("Product_Status_New").setSimpleValue("Representative");
                                                                } else {
                                                                    var dateArrayNational = [];
                                                                    for each(var p in NationalIDArray) {

                                                                        //SS-24166 getmethod to querymethod replacement
                                                                        //var refArrTy =p.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                                                                        var refArrTy = p.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
                                                                        for (var i = 0; i < refArrTy.length; i++) {
                                                                            var lifeCycleRef = refArrTy[i];
                                                                            var LC4Date = lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
                                                                        }
                                                                        dateArrayNational.push(LC4Date);
                                                                    }
                                                                    var latestDate = dateArrayNational[0];
                                                                    for each(var date in dateArrayNational) {
                                                                        if (date > latestDate) {
                                                                            latestDate = date;
                                                                        }
                                                                    }
                                                                    var indexArraylatestDate = [];
                                                                    for (var i = 0; i < dateArrayNational.length; i++) {
                                                                        if (dateArrayNational[i] == latestDate) {
                                                                            indexArraylatestDate.push(i);
                                                                        }
                                                                    }
                                                                    if (indexArraylatestDate.length == 1) {
                                                                        var repPDT = NationalIDArray[indexArraylatestDate[0]];
                                                                        for each(var pdt in NationalIDArray) {
                                                                            if (pdt.getID() == repPDT.getID()) {
                                                                                pdt.getValue("Product_Status_New").setSimpleValue("Representative");
                                                                            } else {
                                                                                pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
                                                                            }
                                                                        }
                                                                    } else {
                                                                        highestFPCToBeRepresentative(NationalIDArray, indexArraylatestDate);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
								}
									}
								}
							}
						}
					}
				}
			}
			else{
				if(brand=="FEEDER CODE"){ //Condition 5
					obj.getValue("Product_Status_New").setSimpleValue("Feeder");
				}
				else if(brand == "NON-SHIPPING BRAND CODE REQUIRED BY OSB" || brand == "SAMPLE-INTERPLANT CODE (NOT PRICED)"){ // Condition 1,2
					obj.getValue("Product_Status_New").setSimpleValue("Unreleased");
				}
				else{
					if(lifeCycleRefs.length > 0){
						for(var b=0; b<lifeCycleRefs.length; b++){
							var lifeCycleRef = lifeCycleRefs[b];
							var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
							var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
							if(currentLifeCycleStageLOV!=null && currentLifeCycleStageLOV!=""){
								var currentLifeCycleStage = currentLifeCycleStageLOV.getID();
								if(salesArea!=null && salesArea!=""){
									var salesAreaArray = salesArea.split("<multisep/>");
									for(var t=0;t<salesAreaArray.length;t++){
										var sales = salesAreaArray[t].split("_");										
										if(sales[0]=="CA00" || sales[0]=="US60" || sales[0]=="PR04") {
											if((currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")){ //Condition 6
												obj.getValue("Product_Status_New").setSimpleValue("New");
											}
											else if((currentLifeCycleStage == "5")){
												obj.getValue("Product_Status_New").setSimpleValue("Past Last order date"); //Condition 8
											}
											else if((currentLifeCycleStage == "4")){ //Condition 7
												var CSgtinAttr = manager.getAttributeHome().getAttributeByID("CaseGTIN");
												var FPC = obj.getParent();
												var CSgtinValue = FPC.getValue("CaseGTIN").getSimpleValue();
												var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
												var productsPIM = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,CSgtinAttr,CSgtinValue)).asList(100).toArray();
												var onlyLC4TM;
												var LC4TMArray=[];
												var LC4DateArray=[];
												var customerArray=[];
												LC4TMArray.push(obj);
												for each(var fpcObj in productsPIM){
													if(fpcObj.getObjectType().getID()=="FPC"){
														var fpcCode = fpcObj.getValue("FinishedProductCode").getSimpleValue();
														var targetKey = country+"_"+fpcCode;
														var tmObj=manager.getNodeHome().getObjectByKey("TargetMarket",targetKey);
														if(tmObj!=null){
															var baseSuff= tmObj.getValue("BaseSufficiencyMet").getSimpleValue();
                                                            //SS-24166 getmethod to querymethod replacement
                                                            //var refArray =tmObj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                                                            var refArray = tmObj.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
															if(refArray.length > 0){
																for(var b=0; b<refArray.length; b++){
																	var lifeCycleRef = refArray[b];
																	var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
																	var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
																	if(currentLifeCycleStageLOV!=null && currentLifeCycleStageLOV!=""){
																		var currentLifeCycleStage = currentLifeCycleStageLOV.getID();
																		if(salesArea!=null && salesArea!="" ){
																			var salesAreaArray = salesArea.split("<multisep/>");
																			for(var t=0;t<salesAreaArray.length;t++){
																				var sales = salesAreaArray[t].split("_");
																				if(sales[0]=="CA00" || sales[0]=="US60" || sales[0]=="PR04") {
																					var brandOb = tmObj.getValue("Brandtype").getSimpleValue();
																					if(currentLifeCycleStage == "4" && baseSuff=="Yes"&& brandOb != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && brandOb != "SAMPLE-INTERPLANT CODE (NOT PRICED)" && brandOb!="FEEDER CODE"){ 
																						onlyLC4TM=tmObj;
																						if(LC4TMArray.indexOf(tmObj)==-1){
																							LC4TMArray.push(tmObj);
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
												if (LC4TMArray.length==1){ //Condition 20B
													LC4TMArray[0].getValue("Product_Status_New").setSimpleValue("Representative");
												}
												else{
													for each(var tm in LC4TMArray){
														var customerClassification=tm.getValue("CustomerClassificationAtTM").getSimpleValue();
                                                        //SS-24166 getmethod to querymethod replacement
                                                        //var refArr =tm.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                                                        var refArr = tm.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
														for(var i=0;i<refArr.length;i++){
															var lifeCycleRef = refArr[i];
															var LC4Date = lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
														}
														LC4DateArray.push(LC4Date);
														customerArray.push(customerClassification);
													}
													if(SameCheck(LC4DateArray) && SameCheck(customerArray)){ //Condition 21F, 21G
														highestFPCToBeRepresentative(LC4TMArray,null);
													}
													else if(!SameCheck(LC4DateArray) && SameCheck(customerArray)){ 
														var latestDate = LC4DateArray[0];
														for each (var date in LC4DateArray){
															if(date> latestDate){
																latestDate=date;
															}
														}
														var indexArray=[];
														for (var i=0;i<LC4DateArray.length;i++){
															if (LC4DateArray[i]==latestDate){
																indexArray.push(i);
															}
														}
														if(indexArray.length==1){ // Condition 21C, 21D
															var index=LC4DateArray.indexOf(latestDate);
															for (var i=0;i<LC4TMArray.length;i++){
																if (i==index){
																	LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Representative");
																}
																else{
																	LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Alternative");
																}
															}
														}
														else{   // Condition 21K
															highestFPCToBeRepresentative(LC4TMArray,indexArray);
														}
													}
													else if(!SameCheck(customerArray)){
														if(SameCheck(LC4DateArray)){
															var customerArraystring=customerArray.toString();
															if(!(customerArraystring.match("National"))){
																highestFPCToBeRepresentative(LC4TMArray,null);
															}
															else{
																var indexArray=[];
																for(var j=0;j<LC4TMArray.length;j++){
																	var custClassification=LC4TMArray[j].getValue("CustomerClassificationAtTM").getSimpleValue();
																	if(custClassification=="National"){
																		indexArray.push(j);
																	}
																	else{
																		LC4TMArray[j].getValue("Product_Status_New").setSimpleValue("Alternative");
																	}
																}
																if(indexArray.length==1){ //Condition 21E
																	var repPdt=LC4TMArray[indexArray[0]];
																	for each(var pdt in LC4TMArray){
																		if(pdt.getID()==repPdt.getID()){
																			pdt.getValue("Product_Status_New").setSimpleValue("Representative");
																		}
																		else{
																			pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
																		}
																	}
																}
																else{ //Condition 21J
																	highestFPCToBeRepresentative(LC4TMArray,indexArray);
																}
															}
														}
														else{
															var customerArraystring=customerArray.toString();
															if(!(customerArraystring.match("National"))){
																var latestDate = LC4DateArray[0];
																for each (var date in LC4DateArray){
																	if(date> latestDate){
																		latestDate=date;
																	}
																}
																var indexArray=[];
																for (var i=0;i<LC4DateArray.length;i++){
																	if (LC4DateArray[i]==latestDate){
																		indexArray.push(i);
																	}
																}
																if(indexArray.length==1){ // Condition 21C, 21D
																	var index=LC4DateArray.indexOf(latestDate);
																	for (var i=0;i<LC4TMArray.length;i++){
																		if (i==index){
																			LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Representative");
																		}
																		else{
																			LC4TMArray[i].getValue("Product_Status_New").setSimpleValue("Alternative");
																		}
																	}
																}
																else{   // Condition 21K
																	highestFPCToBeRepresentative(LC4TMArray,indexArray);
																}
															}
															else{
																var NationalIDArray=[];
																for(var j=0;j<LC4TMArray.length;j++){
																	var custClassification=LC4TMArray[j].getValue("CustomerClassificationAtTM").getSimpleValue();
																	if(custClassification=="National"){
																		NationalIDArray.push(LC4TMArray[j]);
																	}
																	else{
																		LC4TMArray[j].getValue("Product_Status_New").setSimpleValue("Alternative");
																	}
																}
																if(NationalIDArray.length==1){ //Condition 21E
																	NationalIDArray[0].getValue("Product_Status_New").setSimpleValue("Representative");
																}
																else{
																	var dateArrayNational=[];
																	for each(var p in NationalIDArray){
                                                                        //SS-24166 getmethod to querymethod replacement
                                                                        //var refArrTy =p.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                                                                        var refArrTy = p.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
																		for(var i=0;i<refArrTy.length;i++){
																			var lifeCycleRef = refArrTy[i];
																			var LC4Date = lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
																		}
																		dateArrayNational.push(LC4Date);
																	}
																	var latestDate = dateArrayNational[0];
																	for each (var date in dateArrayNational){
																		if(date> latestDate){
																			latestDate=date;
																		}
																	}
																	var indexArraylatestDate=[];
																	for (var i=0;i<dateArrayNational.length;i++){
																		if (dateArrayNational[i]==latestDate){
																			indexArraylatestDate.push(i);
																		}
																	}
																	if(indexArraylatestDate.length==1){
																		var repPDT=NationalIDArray[indexArraylatestDate[0]];
																		for each(var pdt in NationalIDArray){
																			if(pdt.getID()==repPDT.getID()){
																				pdt.getValue("Product_Status_New").setSimpleValue("Representative");
																			}
																			else{
																					pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
																				}
																			}
																	}
																	else{
																		highestFPCToBeRepresentative(NationalIDArray,indexArraylatestDate);
																	}
																}
															}
														}
													}
												}	
											}
										}
									}
								}
							}
						}
					}
				}
			}			
			if(retailflag == false){
				var setFlag = false;
                //SS-24166 getmethod to querymethod replacement
                //var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
                var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");

                //SS-24166 getmethod to querymethod replacement
                //var lifeCycleRefs =obj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
                var lifeCycleRefs = obj.queryClassificationProductLinks(lifeCycleReferenceType).asList("20000").toArray();
				if ( country == "US" || country == "CA"){
					if(lifeCycleRefs.length > 0){
						for(var b=0; b<lifeCycleRefs.length; b++){
							var lifeCycleRef = lifeCycleRefs[b];
							var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
							if(salesArea!= null && salesArea!= ""){
								if(professionalFlag && (salesArea.match("US61") || salesArea.match("CA01"))){
									setLogicForProductStatus(manager,obj, lifeCycleRefs, log);
									setFlag = true;
								}
							}
						}
						if(setFlag == false){
							for(var b=0; b<lifeCycleRefs.length; b++){
								var lifeCycleRef = lifeCycleRefs[b];
								var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
								if(salesArea!= null && salesArea!= ""){
									setLogicForProductStatus(manager,obj, lifeCycleRefs, log);
								}
							}
						}
					}
				}
			}
		}
	}
}




//Modified by Anusha for Performance Improvement
function calculateAttributes(manager,currentTM,log,trigger){
	var triggerArray = [];
	var Country = currentTM.getValue("Country_TM").getSimpleValue();
    //SS-24166 getmethod to querymethod replacement
    //var SalesAreaGrouping = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
    var SalesAreaGrouping = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");

    //SS-24166 getmethod to querymethod replacement
    //var SalesAreaRefs =currentTM.getClassificationProductLinks(SalesAreaGrouping).toArray();
    var SalesAreaRefs = currentTM.queryClassificationProductLinks(SalesAreaGrouping).asList("20000").toArray();
   
	//SS - 23684 getReferencedByProducts to queryReferencedBy
	// var refBys = currentTM.getReferencedBy().toArray();
	var refBys = currentTM.queryReferencedBy(null).asList("10000").toArray();
	for(var b=0; b<refBys.length; b++){
		var refByTypeID = refBys[b].getReferenceType();
		if (refByTypeID == "PKG_TM_Reference"){
			var usFlag=0; var caFlag = 0; var prFlag = 0;
			var pkgCurrent = refBys[b].getSource();	
			var pkgID = pkgCurrent.getID();
			var pkgSplit = pkgID.split("_");
			var salesOrg = pkgSplit[1];
			var ITPriceBracket8 = pkgCurrent.getValue("ITPriceBracket8").getSimpleValue();
			var CSPriceBracket8 = pkgCurrent.getValue("CSPriceBracket8").getSimpleValue();
			var ITPriceNat_HE_E02 = pkgCurrent.getValue("ITPriceNat_HE_E02").getSimpleValue();
			var CSPriceNat_HE_E02 = pkgCurrent.getValue("CSPriceNat_HE_E02").getSimpleValue();
			var ITPriceLOCL = pkgCurrent.getValue("ITPriceLOCL").getSimpleValue();
			var CSPriceLOCL = pkgCurrent.getValue("CSPriceLOCL").getSimpleValue();
			var fpmPKGReference = manager.getReferenceTypeHome().getReferenceTypeByID("GTINToFPMPrice");
            //SS-23684 getmethod to querymethod replacement
            //var fpmPKGReferenceArray =pkgCurrent.getReferences(fpmPKGReference).toArray();
            var fpmPKGReferenceArray = pkgCurrent.queryReferences(fpmPKGReference).asList("20000").toArray();
            var pricePKGReference = manager.getReferenceTypeHome().getReferenceTypeByID("GTINToPrice");

            //SS-23684 getmethod to querymethod replacement
            //var pricePKGReferenceArray =pkgCurrent.getReferences(pricePKGReference).toArray();
            var pricePKGReferenceArray = pkgCurrent.queryReferences(pricePKGReference).asList("20000").toArray();
			var allReferenceArray = fpmPKGReferenceArray.concat(pricePKGReferenceArray);
			for(var k=0;k<allReferenceArray.length;k++){
				var currentPriceRef = allReferenceArray[k];
				var currentPrice = currentPriceRef.getTarget();
				var objectTypeOfPrice = currentPrice.getObjectType().getID();
				if(objectTypeOfPrice=="FPC_Price"){
					var priceFlag = currentPrice.getValue("PriceFlag").getSimpleValue();
					if(priceFlag != "X"){
						var priceSalesOrg = currentPrice.getValue("PriceSalesOrg").getSimpleValue();
						var priceBracket = currentPrice.getValue("PriceBrackets").getSimpleValue();
						var priceList = currentPrice.getValue("PriceList").getSimpleValue();
						var customerNumber = currentPrice.getValue("CustomerNumber").getSimpleValue();
						var condition = currentPrice.getValue("Condition").getSimpleValue();
						if(Country == "US"){
							if(salesOrg == priceSalesOrg && salesOrg == "US60"){
								if(priceBracket=="008" && priceList == "01"){
									var usItemPrice = currentPrice.getValue("ItemPrice").getSimpleValue();
									var usCasePrice = currentPrice.getValue("CasePrice").getSimpleValue();			
									pkgCurrent.getValue("ITPriceBracket8").setSimpleValue(usItemPrice);
									pkgCurrent.getValue("CSPriceBracket8").setSimpleValue(usCasePrice);
									usFlag++;
								}
							}
							else if(salesOrg == priceSalesOrg && salesOrg == "US61"){
								if(priceBracket=="008" && priceList == "20"){
									var usItemPrice = currentPrice.getValue("ItemPrice").getSimpleValue();
									var usCasePrice = currentPrice.getValue("CasePrice").getSimpleValue();
									pkgCurrent.getValue("ITPriceBracket8").setSimpleValue(usItemPrice);
									pkgCurrent.getValue("CSPriceBracket8").setSimpleValue(usCasePrice);
									usFlag++;
								}
							}
						}
						else if(Country == "CA"){
							if(salesOrg == priceSalesOrg){
								if(priceBracket=="E02" && (!(customerNumber))){
									var caItemPrice = currentPrice.getValue("ItemPrice").getSimpleValue();
									var caCasePrice = currentPrice.getValue("CasePrice").getSimpleValue();
									pkgCurrent.getValue("ITPriceNat_HE_E02").setSimpleValue(caItemPrice);
									pkgCurrent.getValue("CSPriceNat_HE_E02").setSimpleValue(caCasePrice);
									caFlag++;
								}
							}
						}
						else if(Country == "PR"){
							if(salesOrg == priceSalesOrg){
								if(priceList=="60" && condition=="LOCL"){
									var prItemPrice = currentPrice.getValue("ItemPrice").getSimpleValue();
									var prCasePrice = currentPrice.getValue("CasePrice").getSimpleValue();
									pkgCurrent.getValue("ITPriceLOCL").setSimpleValue(prItemPrice);
									pkgCurrent.getValue("CSPriceLOCL").setSimpleValue(prCasePrice);
									prFlag++;
								}
							}
						}
					}
				}
			}
			if(usFlag==0){
				pkgCurrent.getValue("ITPriceBracket8").setSimpleValue("");
				pkgCurrent.getValue("CSPriceBracket8").setSimpleValue("");
			}
			if(caFlag==0){
				pkgCurrent.getValue("ITPriceNat_HE_E02").setSimpleValue("");
				pkgCurrent.getValue("CSPriceNat_HE_E02").setSimpleValue("");			
			}
			if(prFlag==0){
				pkgCurrent.getValue("ITPriceLOCL").setSimpleValue("");
				pkgCurrent.getValue("CSPriceLOCL").setSimpleValue("");
			}
			var ITPriceBracket8After = pkgCurrent.getValue("ITPriceBracket8").getSimpleValue();
			var CSPriceBracket8After = pkgCurrent.getValue("CSPriceBracket8").getSimpleValue();
			var ITPriceNat_HE_E02After = pkgCurrent.getValue("ITPriceNat_HE_E02").getSimpleValue();
			var CSPriceNat_HE_E02After = pkgCurrent.getValue("CSPriceNat_HE_E02").getSimpleValue();
			var ITPriceLOCLAfter = pkgCurrent.getValue("ITPriceLOCL").getSimpleValue();
			var CSPriceLOCLAfter = pkgCurrent.getValue("CSPriceLOCL").getSimpleValue();
			//Triggering to Facet Processor
			if((ITPriceBracket8 != ITPriceBracket8After)||(CSPriceBracket8 != CSPriceBracket8After)||(ITPriceNat_HE_E02!=ITPriceNat_HE_E02After)||(CSPriceNat_HE_E02!=CSPriceNat_HE_E02After)||(ITPriceLOCL!=ITPriceLOCLAfter)||(CSPriceLOCL!=CSPriceLOCLAfter)){
				var materialSubType = pkgCurrent.getValue("MaterialSubType").getSimpleValue()
				if(pkgCurrent.getObjectType().getID() == "Each" && materialSubType!= "Display" && materialSubType!="DISPLAY"){
					triggerArray.push(pkgCurrent);
				}
				else if(pkgCurrent.getObjectType().getID() == "Case" && (materialSubType == "Display" || materialSubType == "DISPLAY")){
					triggerArray.push(pkgCurrent);
				}
			}
		}
	}
	return triggerArray;
}

function getGlobalContext(context){	
	if(context){
		var allContext =[];
		var tempcontext;
		if(context.indexOf(",")>0){
			var contextSplit = context.split(",");
			for each(var language in contextSplit){
				if(language.match(" ")){
					var language = language.replace(" ", "");
				}
				if(language=="English"){
					tempcontext = "Context1";
				}
				else if(language=="French"){
					tempcontext = "Context3";
				}
				else{
					tempcontext = language;
				}
				allContext.push(tempcontext);				
			}
		}
		else{
			if(context=="English"){
				tempcontext = "Context1";
			}
			else if(context=="French"){
				tempcontext = "Context3";
			}
			else{
				tempcontext = context;
			}
			allContext.push(tempcontext);		
		}
	}				
	return allContext;
}

function dateTime (manager){
	var date = new Date();
	var ISOString = date.toISOString();
	var ISODate = ISOString.substring(0, 10);
	var ISOTime = ISOString.substring(11,19);
	var concatenateDateTime = ISODate +" "+ ISOTime;
	return concatenateDateTime;
}
//Function Added by Anusha for PDS Scope in Each Object Level
function allGTINReferencePDSScope(manager, gtinObj, log, lookupTable){
	var conte = manager.getCurrentContext().getID();
	var gtinID = gtinObj.getID();
	var splitID = gtinID.split("_");
	var gtin = splitID[0];
	var pimIdAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
	var marketArray = ["IM","FIM","PIM"];
	var singlehome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
	var currentGtin = gtinObj.getID();
	var allsimilarGtinIds = new java.util.LinkedList();
	var consumerGtins = new java.util.LinkedList();
	var futureConsumerGtins = new java.util.LinkedList();
	var futureConsumerGtinArray = new Array();
	var consumerGtinArray = new Array();
	var nonConsumerGtinArray = new Array();
	var existingPdsScopeFCIM = false;
	var existingPdsScopeCIM = false;
	var nonConsumerGtins = new java.util.LinkedList();
	var country = gtinObj.getValue("Country_TM").getSimpleValue();
	var salesAreas = lookupTable.getLookupTableValue("GlobalPDSScope",country);
	if(salesAreas!= null && salesAreas!= country){
		if(salesAreas.indexOf(",")>0){
			var salesAreaSplit = salesAreas.split(",");
			for each(var salesArea in salesAreaSplit){
				var salesArea = salesArea.replace("_","");
				for each(var market in marketArray){
					var searchValue = gtin+"_"+salesArea+"_"+market;
					var  similarGTINs = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIdAttribute,searchValue)).asList(100).toArray();
					for each(var similarItem in similarGTINs){
						if(similarItem.getObjectType().getID() == "Each"){
							var newGtinID = similarItem.getID();
							var gtinStatusNew = similarItem.getValue("GTIN_Status_New").getSimpleValue();
							if(gtinStatusNew == "2.Consumer In Market"){
								if(!(consumerGtins.contains(newGtinID))){
									consumerGtins.push(newGtinID);
									consumerGtinArray.push(newGtinID);
								}
								if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
									existingPdsScopeCIM = true;
								}
							}
							else if(gtinStatusNew == "5.Consumer Future In Market"){
								if(!(futureConsumerGtins.contains(newGtinID))){
									futureConsumerGtins.push(newGtinID);
									futureConsumerGtinArray.push(newGtinID);
								}
								if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
									existingPdsScopeFCIM = true;
								}
							}
							else{
								if(!(nonConsumerGtins.contains(newGtinID))){
									nonConsumerGtins.push(newGtinID);
									nonConsumerGtinArray.push(newGtinID);
								}
							}
						}
					}
				}
			}
		}
		else{
			var salesArea = salesAreas;
			var salesArea = salesArea.replace("_","");
			for each(var market in marketArray){
				var searchValue = gtin+"_"+salesArea+"_"+market;
				var  similarGTINs = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIdAttribute,searchValue)).asList(100).toArray();
				for each(var similarItem in similarGTINs){
					if(similarItem.getObjectType().getID() == "Each"){
						var newGtinID = similarItem.getID();
						var gtinStatusNew = similarItem.getValue("GTIN_Status_New").getSimpleValue();
						if(gtinStatusNew == "2.Consumer In Market"){
							if(!(consumerGtins.contains(newGtinID))){
								consumerGtins.push(newGtinID);
								consumerGtinArray.push(newGtinID);
							}
							if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
								existingPdsScopeCIM = true;
							}
						}
						else if(gtinStatusNew == "5.Consumer Future In Market"){
							if(!(futureConsumerGtins.contains(newGtinID))){
								futureConsumerGtins.push(newGtinID);
								futureConsumerGtinArray.push(newGtinID);
							}
							if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
								existingPdsScopeFCIM = true;
							}
						}
						else{
							if(!(nonConsumerGtins.contains(newGtinID))){
								nonConsumerGtins.push(newGtinID);
								nonConsumerGtinArray.push(newGtinID);
							}
						}
					}
				}
			}
		}
		//If we already have PDS Scope Product, then don't change that
		if(consumerGtinArray.length>0){
			if(!(existingPdsScopeCIM)){
				var pdsScopeProduct = consumerGtinArray[0];
				var gtinPdsScope = manager.getProductHome().getProductByID(pdsScopeProduct);
				gtinPdsScope.getValue("PDSScope").setSimpleValue("Yes");
				for each(var gtin in consumerGtinArray){
					if(gtin != pdsScopeProduct){
						var otherGtin = manager.getProductHome().getProductByID(gtin);
						otherGtin.getValue("PDSScope").setSimpleValue("No");
						try{
							otherGtin.approve();	
						}
						catch(e){
							logger.warning(" approval is failed with message "+ otherGtin.getID()+ e);
							throw(e);
						}
					}
				}
			}
		}
		if(futureConsumerGtinArray.length>0){
			if(!(existingPdsScopeFCIM)){
				var pdsScopeProduct = futureConsumerGtinArray[0];
				var gtinPdsScope = manager.getProductHome().getProductByID(pdsScopeProduct);
				gtinPdsScope.getValue("PDSScope").setSimpleValue("Yes");
				for each(var gtin in futureConsumerGtinArray){
					if(gtin != pdsScopeProduct){
						var otherGtin = manager.getProductHome().getProductByID(gtin);
						otherGtin.getValue("PDSScope").setSimpleValue("No");
						try{
							otherGtin.approve();	
						}
						catch(e){
							logger.warning(" approval is failed with message "+ otherGtin.getID()+ e);
							throw(e);
						}
					}
				}
			}
		}
		for each(var gtin in nonConsumerGtinArray){
			var otherGtin = manager.getProductHome().getProductByID(gtin);
			otherGtin.getValue("PDSScope").setSimpleValue("No");
			try{
				otherGtin.approve();	
			}
			catch(e){
				logger.warning(" approval is failed with message "+ otherGtin.getID()+ e);
				throw(e);
			}			
		}
	}
}
//Function Added by Anusha for PDS Scope in Each Object Level
function allGTINReferencePDSScope(manager, gtinObj, log, lookupTable){
	var conte = manager.getCurrentContext().getID();
	var gtinID = gtinObj.getID();
	var splitID = gtinID.split("_");
	var gtin = splitID[0];
	var pimIdAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
	var marketArray = ["IM","FIM","PIM"];
	var singlehome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
	var currentGtin = gtinObj.getID();
	var allsimilarGtinIds = new java.util.LinkedList();
	var consumerGtins = new java.util.LinkedList();
	var futureConsumerGtins = new java.util.LinkedList();
	var futureConsumerGtinArray = new Array();
	var consumerGtinArray = new Array();
	var nonConsumerGtinArray = new Array();
	var existingPdsScopeFCIM = false;
	var existingPdsScopeCIM = false;
	var nonConsumerGtins = new java.util.LinkedList();
	var country = gtinObj.getValue("Country_TM").getSimpleValue();
	var salesAreas = lookupTable.getLookupTableValue("GlobalPDSScope",country);
	if(salesAreas!= null && salesAreas!= country){
		if(salesAreas.indexOf(",")>0){
			var salesAreaSplit = salesAreas.split(",");
			for each(var salesArea in salesAreaSplit){
				var salesArea = salesArea.replace("_","");
				for each(var market in marketArray){
					var searchValue = gtin+"_"+salesArea+"_"+market;
					var  similarGTINs = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIdAttribute,searchValue)).asList(100).toArray();
					for each(var similarItem in similarGTINs){
						if(similarItem.getObjectType().getID() == "Each"){
							var newGtinID = similarItem.getID();
							var gtinStatusNew = similarItem.getValue("GTIN_Status_New").getSimpleValue();
							if(gtinStatusNew == "2.Consumer In Market"){
								if(!(consumerGtins.contains(newGtinID))){
									consumerGtins.push(newGtinID);
									consumerGtinArray.push(newGtinID);
									
								}
								if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
									existingPdsScopeCIM = true;
									
								}
							}
							else if(gtinStatusNew == "5.Consumer Future In Market"){
								if(!(futureConsumerGtins.contains(newGtinID))){
									futureConsumerGtins.push(newGtinID);
									futureConsumerGtinArray.push(newGtinID);
								}
								if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
									existingPdsScopeFCIM = true;
								}
							}
							else{
								if(!(nonConsumerGtins.contains(newGtinID))){
									nonConsumerGtins.push(newGtinID);
									nonConsumerGtinArray.push(newGtinID);
								}
							}
						}
					}
				}
			}
		}
		else{
			var salesArea = salesAreas;
			var salesArea = salesArea.replace("_","");
			for each(var market in marketArray){
				var searchValue = gtin+"_"+salesArea+"_"+market;
				var  similarGTINs = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIdAttribute,searchValue)).asList(100).toArray();
				for each(var similarItem in similarGTINs){
					if(similarItem.getObjectType().getID() == "Each"){
						var newGtinID = similarItem.getID();
						var gtinStatusNew = similarItem.getValue("GTIN_Status_New").getSimpleValue();
						if(gtinStatusNew == "2.Consumer In Market"){
							if(!(consumerGtins.contains(newGtinID))){
								consumerGtins.push(newGtinID);
								consumerGtinArray.push(newGtinID);
							}
							if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
								existingPdsScopeCIM = true;
							}
						}
						else if(gtinStatusNew == "5.Consumer Future In Market"){
							if(!(futureConsumerGtins.contains(newGtinID))){
								futureConsumerGtins.push(newGtinID);
								futureConsumerGtinArray.push(newGtinID);
							}
							if(similarItem.getValue("PDSScope").getSimpleValue() == "Yes"){
								existingPdsScopeFCIM = true;
							}
						}
						else{
							if(!(nonConsumerGtins.contains(newGtinID))){
								nonConsumerGtins.push(newGtinID);
								nonConsumerGtinArray.push(newGtinID);
							}
						}
					}
				}
			}
		}
		//If we already have PDS Scope Product, then don't change that
		if(consumerGtinArray.length>0){
			if(!(existingPdsScopeCIM)){
				var pdsScopeProduct = consumerGtinArray[0];
				var gtinPdsScope = manager.getProductHome().getProductByID(pdsScopeProduct);
				//log.info("in");
				gtinPdsScope.getValue("PDSScope").setSimpleValue("Yes");
				for each(var gtin in consumerGtinArray){
					if(gtin != pdsScopeProduct){
						var otherGtin = manager.getProductHome().getProductByID(gtin);
						otherGtin.getValue("PDSScope").setSimpleValue("No");
						/*try{
							otherGtin.approve();	
						}
						catch(e){
							logger.warning(" approval is failed with message "+ otherGtin.getID()+ e);
							throw(e);
						}*/
					}
				}
			}
		}
		if(futureConsumerGtinArray.length>0){
			if(!(existingPdsScopeFCIM)){
				var pdsScopeProduct = futureConsumerGtinArray[0];
				var gtinPdsScope = manager.getProductHome().getProductByID(pdsScopeProduct);
				gtinPdsScope.getValue("PDSScope").setSimpleValue("Yes");
				for each(var gtin in futureConsumerGtinArray){
					if(gtin != pdsScopeProduct){
						var otherGtin = manager.getProductHome().getProductByID(gtin);
						otherGtin.getValue("PDSScope").setSimpleValue("No");
						/*try{
							otherGtin.approve();	
						}
						catch(e){
							logger.warning(" approval is failed with message "+ otherGtin.getID()+ e);
							throw(e);
						}*/
					}
				}
			}
		}
		for each(var gtin in nonConsumerGtinArray){
			var otherGtin = manager.getProductHome().getProductByID(gtin);
			otherGtin.getValue("PDSScope").setSimpleValue("No");
			/*try{
				otherGtin.approve();	
			}
			catch(e){
				logger.warning(" approval is failed with message "+ otherGtin.getID()+ e);
				throw(e);
			}*/			
		}
	}
}
// Function checking for duplicates in an array
function SameCheck(array1){
	var first=array1[0];
	for (var i=1;i<array1.length;i++){
		if(array1[i] !=first){
			return false;
		}
	}
	return true;
}

// Function to check for highest FPC and sets Produc_Status_New as Representative and others as Alternative
function highestFPCToBeRepresentative(array1,array2){
	var highestFpcCode=0;
	if(array2==null){
		for each (var pdt in array1){
			var code=pdt.getValue("FinishedProductCode").getSimpleValue();
			if(code>highestFpcCode){
				highestFpcCode = code;
			}
		}
	}
	else{
		for each (var index in array2){
			var code=array1[index].getValue("FinishedProductCode").getSimpleValue();
			if(code>highestFpcCode){
				highestFpcCode = code;
			}
		}
	}
	for each(var pdt in array1){
		var finishedpdtcode = pdt.getValue("FinishedProductCode").getSimpleValue();
		if(finishedpdtcode==highestFpcCode){
			pdt.getValue("Product_Status_New").setSimpleValue("Representative");
		}
		else{
			pdt.getValue("Product_Status_New").setSimpleValue("Alternative");
		}
	}
}

function setLogicForProductStatus(manager,obj,lifeCycleRefs, log){
	var brand=obj.getValue("Brandtype").getSimpleValue();
	if(brand != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && brand != "SAMPLE-INTERPLANT CODE (NOT PRICED)" && brand!="FEEDER CODE" ){
		var baseSuffMet=obj.getValue("BaseSufficiencyMet").getSimpleValue();
		if(lifeCycleRefs.length > 0){
			for(var b=0; b<lifeCycleRefs.length; b++){
				var lifeCycleRef = lifeCycleRefs[b];
				var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
				if(salesArea!= null && salesArea!= ""){
					var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
					if(currentLifeCycleStageLOV!=null && currentLifeCycleStageLOV!=""){
						var currentLifeCycleStage = currentLifeCycleStageLOV.getID();
						if(baseSuffMet == "Yes"){
							if((currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")){ 
								obj.getValue("Product_Status_New").setSimpleValue("New");
							}
							else if((currentLifeCycleStage == "5")){
								obj.getValue("Product_Status_New").setSimpleValue("Past Last order date");
							}
							else if((currentLifeCycleStage == "4")){ //Condition 7
								obj.getValue("Product_Status_New").setSimpleValue("Alternative");
							}
						}
						else{
							if((currentLifeCycleStage == "1")||(currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")||(currentLifeCycleStage == "4")||(currentLifeCycleStage == "5") ){ // Condition 3,4
								obj.getValue("Product_Status_New").setSimpleValue("Unreleased");
							}
							else if((currentLifeCycleStage == "6")||(currentLifeCycleStage == "7")){ // Condition 9
								obj.getValue("Product_Status_New").setSimpleValue("Inactive");
							}
						}
					}
				}
			}
		}
	}
}

//Function to Populate Value for Asset Publication Readiness Attribute

function asset_Publication_Readiness(manager,log,curObj){
	var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductImage");
	var objType = curObj.getObjectType().getID();
	if(objType == "Each"){
        //SS-23684 getmethod to querymethod replacement
        //var assetArray = curObj.getReferences(referenceType).toArray();
        var assetArray = curObj.queryReferences(referenceType).asList("20000").toArray();
		if(assetArray.length>0){
			for(var i=0;i<assetArray.length;i++){
				var assetObject = assetArray[i].getTarget();
				var curationStatus = assetArray[i].getValue("AssetPreCurationStatus").getSimpleValue();
				var asset_Sequence = assetArray[i].getValue("AssetSequence").getSimpleValue();
				var customerAssetDesignation = assetArray[i].getValue("CustomerAssetDesignation_Reference").getSimpleValue();          	
				var length;
				if(curationStatus == "Curation Done" && asset_Sequence != null){
					if(customerAssetDesignation != null){
						var customerAssetDesArray = customerAssetDesignation.split("<multisep/>");
						length = customerAssetDesArray.length;
						if(length == 1){
							assetArray[i].getValue("Asset_Publication_Readiness").setSimpleValue("Yes" + " " + "(" + customerAssetDesignation + ")");
							//log.info(assetArray[i].getValue("Asset_Publication_Readiness").getSimpleValue());
						}
						else if(length > 1){
							var cutomdata = customerAssetDesignation;
							var assetReadiness = cutomdata.replaceAll("<multisep/>",'-');
							var Customervalue = "Yes" + " " + "(" + assetReadiness + ")";
							assetArray[i].getValue("Asset_Publication_Readiness").setSimpleValue(Customervalue);
							//log.info(assetArray[i].getValue("Asset_Publication_Readiness").getSimpleValue());
						}
					}
					else{
						assetArray[i].getValue("Asset_Publication_Readiness").setSimpleValue("Yes");
						//log.info(assetArray[i].getValue("Asset_Publication_Readiness").getSimpleValue());
					}
				}
				else{
					assetArray[i].getValue("Asset_Publication_Readiness").setSimpleValue(null);
				}
			}
		}
	}

}
function setCurrentBaseFPMItemPriceInGTIN(gtinObj,manager,log){
	var country = gtinObj.getValue("Country_TM").getSimpleValue();
	if( country == "US"){
		var pricRefType=manager.getReferenceTypeHome().getReferenceTypeByID("GTINToFPMPrice");
        //SS-23684 getmethod to querymethod replacement
        //var priceRefs = gtinObj.getReferences(pricRefType).toArray();
        var priceRefs = gtinObj.queryReferences(pricRefType).asList("20000").toArray();
		for(var i=0; i<priceRefs.length; i++){
			var priceObj = priceRefs[i].getTarget();
			if( priceObj.getObjectType().getID() == "FPC_Price"){
				var priceTypeGTIN = priceObj.getValue("PriceType").getSimpleValue();
						if (priceTypeGTIN == "FPM"){
							gtinObj.getValue("CurrentBaseFPMItemPrice").setSimpleValue(priceObj.getValue("ItemPrice").getSimpleValue());
			     }
                                                }
		}
	}
}


/*
Function to approve eCopyReDistributionUpdate attribute update at TM/GTIN level
 */
function approveRedistribution(currentObject, log, manager) {
    var getNonApprovedObjs = currentObject.getNonApprovedObjects();
    var nonApprovedObjSet = new java.util.HashSet();
    var ittr = getNonApprovedObjs.iterator();
    while (ittr.hasNext()) {
        var objPart = ittr.next();
        if ((objPart instanceof com.stibo.core.domain.partobject.ValuePartObject)) {
            var objPartID = objPart.getAttributeID();
            var eCopyReDistributionUpdate = manager.getAttributeHome().getAttributeByID("eCopyReDistributionUpdate");
            if (eCopyReDistributionUpdate.getID() == objPartID) {
                nonApprovedObjSet.add(objPart);
            }
        }
    }
    approval.partialApprove(manager, currentObject, nonApprovedObjSet);
}
