// SearchApprovalAction_Inbound

/*Business rule for Base Sufficiency check of FPC or Target Market
	The code uses the following Library functions to check sufficiency and returns true if all conditions are met
	Author @ Pravallika G
	Edited by Anusha to check base Sufficiency for Target Markets*/

//Added by Anusha on Sep 3 2021 to remove the BaseSufficiencyCheck_US_CA_PR from Base Sufficiency Event Processor Rule
//logger.info("BEGIN: SearchApprovalAction_Inbound "+currentObject.getID());
/*Modified by ANBAZHAGAN.K - 30/8/24 SS-23684 getReference to QueryReferences replacement*/
/*
-------------------------------------------------------------------------------------------------------------
Change History
-------------------------------------------------------------------------------------------------------------
SearchApprovalAction_Inbound
-------------------------------------------------------------------------------------------------------------
@Sanchita Sardar | 1.0.0 | 05/09/2024 | SS-23358:PMDM - AMA - PH Pricing Decommission - Base Sufficiency Changes
@ALFRED.KA| 1.0.2| 26/11/2024| [SS-24763] PMDM - EU - Regulatory Attributes
-------------------------------------------------------------------------------------------------------------
*/
var objectType = currentObject.getObjectType();
var usFlag=0;
var caFlag = 0;
var prFlag=0;
var phFlag=0;
var amaFlag=0;var laFlag=0; var euFlag=0;var amaKRFlag=0;

/* FPC_TM Validation */
if(objectType.getID() == "FPC_TM"){
	var parentFpcParent = currentObject.getParent().getParent().getID();	
	if(parentFpcParent != "Unassigned" && parentFpcParent != "ArchivedProducts"){
		//Added by Anusha to Trigger to Search Processor if there is change in any Attribute
		var baseSufficiencyBefore = currentObject.getValue("BaseSufficiencyMet").getSimpleValue();
		var gtinStatusNewBefore = currentObject.getValue("GTIN_Status_New").getSimpleValue();
		var productStatusNewBefore = currentObject.getValue("Product_Status_New").getSimpleValue();
		//SS-23684 getmethod to querymethod replacement
		//var nationalClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("FPCtoNationalProducts");
		var nationalClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("FPCtoNationalProducts");
		//SS-23684 getmethod to querymethod replacement
		//var tmCustomerClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TMtoCSProducts");
		var tmCustomerClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TMtoCSProducts");
		//SS-23684 getmethod to querymethod replacement
		//var refType=currentObject.getClassificationProductLinks(nationalClassificationType).toArray();
		var refType = currentObject.queryClassificationProductLinks(nationalClassificationType).asList("2000").toArray()
		
		//SS-23684 getmethod to querymethod replacement
		//var refTypetm=currentObject.getClassificationProductLinks(tmCustomerClassificationType).toArray();
		var refTypetm = currentObject.queryClassificationProductLinks(tmCustomerClassificationType).asList("2000").toArray()
		
		var nationalRefLengthBefore = refType.length;
		var customerRefLengthBefore = refTypetm.length;		
		var country=currentObject.getValue("Country_TM").getSimpleValue();
		var globalRegion = currentObject.getValue("GlobalRegion").getSimpleValue();
		var Brandtype = currentObject.getValue("Brandtype").getSimpleValue();
		var currentDate=new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());		
		//Sufficiency check for CA Target Market
		if(country == "CA"){			
			var checkLifeCycleStage2 = wlib.checkLifeCycleStage2(currentObject,manager,logger);			
			if(checkLifeCycleStage2.length>0){
				var checkCASpecificAttributes = wlib.checkCASpecificAttributes(currentObject,manager)
				if(checkCASpecificAttributes){
					var checkUOMAttributes = wlib.checkUOMAttributes(currentObject,manager)
					if(checkUOMAttributes){
						var checkFeederITGTIN = wlib.checkFeederITGTIN(currentObject,manager)
						if(checkFeederITGTIN){
							var CheckDateStart = wlib.checkDateStart(currentObject,manager,checkLifeCycleStage2,logger,trigger,phtrigger,phTrigger);
							if(CheckDateStart){
								if(Brandtype != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && Brandtype != "SAMPLE-INTERPLANT CODE (NOT PRICED)"){
									caFlag++;
									currentObject.getValue("BaseSufficiencyMet").setSimpleValue("Yes");
									DueDate(currentObject,manager,logger);
									PopulatePGPBaseSufficiency(currentObject);
								}
							}	
						}																			        								
					}	
				}			
			}
			if(caFlag==0){
				excecuteSufficiencyFailedContion(currentObject);
			}
		}
		//Suficiency check for US Target Market
		else if(country == "US"){
			var checkLifeCycleStage2 = wlib.checkLifeCycleStage2(currentObject,manager,logger);
			if(checkLifeCycleStage2.length>0){
				
				var checkUOMAttributes = wlib.checkUOMAttributes(currentObject,manager)
				if(checkUOMAttributes){
					var checkLaunchAuthorization = wlib.checkLaunchAuthorization(currentObject,manager)
					if(checkLaunchAuthorization){
						var checkFeederITGTIN = wlib.checkFeederITGTIN(currentObject,manager)
						if(checkFeederITGTIN){
							var CheckDateStart = wlib.checkDateStart(currentObject,manager,checkLifeCycleStage2,logger,trigger,phtrigger,phTrigger);
							if(CheckDateStart){
								log.info("Kannan In 3")
								if(Brandtype != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && Brandtype != "SAMPLE-INTERPLANT CODE (NOT PRICED)"){
									usFlag++;
									currentObject.getValue("BaseSufficiencyMet").setSimpleValue("Yes");
									DueDate(currentObject,manager,logger);
									PopulatePGPBaseSufficiency(currentObject);
								}
							}
						}							
					}			
				}
				
			}
			if(usFlag==0){
				log.info("Kannan In 3")
				excecuteSufficiencyFailedContion(currentObject);
			}
		}
		//Suficiency check for PR Target Market
		else if(country == "PR"){	
			var checkLifeCycleStage2 = wlib.checkLifeCycleStage2(currentObject,manager,logger);
			if(checkLifeCycleStage2.length>0){
				var checkUOMAttributes = wlib.checkUOMAttributes(currentObject,manager)
				if(checkUOMAttributes){
					var checkFeederITGTIN = wlib.checkFeederITGTIN(currentObject,manager)
					if(checkFeederITGTIN){
						var CheckDateStart = wlib.checkDateStart(currentObject,manager,checkLifeCycleStage2,logger,trigger,phtrigger,phTrigger);
						if(CheckDateStart){
							if (Brandtype != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && Brandtype != "SAMPLE-INTERPLANT CODE (NOT PRICED)"){
								prFlag++;
								currentObject.getValue("BaseSufficiencyMet").setSimpleValue("Yes");
							}
						}	
					}																	        								
					
				}			
			}
			if(prFlag==0){
				excecuteSufficiencyFailedContion(currentObject);
			}
		}
		else if(country == "PH"){
			var checkLifeCycleStage2 = wlib.checkLifeCycleStage2(currentObject,manager,logger);
			if(checkLifeCycleStage2.length>0){
				var checkLaunchAuthorization = wlib.checkLaunchAuthorization(currentObject,manager)
				if(checkLaunchAuthorization){
					var checkPHUOMAttributes = wlib.checkUOMAttributes(currentObject,manager)
					if(checkPHUOMAttributes){						
					 //PRB0117269-Added function checkDateStartForGlobal to set sales area for PH
	                        var checkDateStartGlobal = wlib.checkDateStartForGlobal(currentObject, manager, checkLifeCycleStage2, logger, trigger, phtrigger, phTrigger, amaWTrigger, la1Trigger, la2Trigger, eu1Trigger, eu2Trigger);
	                        if (checkDateStartGlobal) {
	                            phFlag++;
	                            currentObject.getValue("BaseSufficiencyMet").setSimpleValue("Yes");
	                        }
					}																	        								
					
				}			
			}
			if(phFlag==0){
				excecuteSufficiencyFailedContion(currentObject);
			}
		}
		else if(globalRegion=="AMAE" ||globalRegion=="AMAW" ){
				var checkLifeCycleStage2 = wlib.checkLifeCycleStage2(currentObject,manager,logger);
				if(checkLifeCycleStage2.length>0){							
					var checkLaunchAuthorization = wlib.checkLaunchAuthorization(currentObject,manager)
					if(checkLaunchAuthorization){
						var checkFeederITGTIN = wlib.checkFeederITGTIN(currentObject,manager)
						if(checkFeederITGTIN){
							var checkUOMAttributes = wlib.checkUOMAttributes(currentObject,manager)
							if(checkUOMAttributes){
								var checkDateStartGlobal = wlib.checkDateStartForGlobal(currentObject,manager,checkLifeCycleStage2,logger,trigger,phtrigger,phTrigger,amaWTrigger,la1Trigger,la2Trigger,eu1Trigger,eu2Trigger);
								if(checkDateStartGlobal){
									amaFlag++;
									currentObject.getValue("BaseSufficiencyMet").setSimpleValue("Yes");
								}
							}
						}
					}
				}
				if(amaFlag==0){
					excecuteSufficiencyFailedContionForGlobal(currentObject);
				}
			}
		else if(globalRegion=="EU"){
			var checkLifeCycleStage2 = wlib.checkLifeCycleStage2(currentObject,manager,logger);
			if(checkLifeCycleStage2.length>0){
				var checkLaunchAuthorization = wlib.checkLaunchAuthorization(currentObject,manager)
				if(checkLaunchAuthorization){
					var checkFeederITGTIN = wlib.checkFeederITGTIN(currentObject,manager)
					if(checkFeederITGTIN){
						var checkUOMAttributes = wlib.checkUOMAttributes(currentObject,manager)
						if(checkUOMAttributes){
							var checkGlobalSalesArea = checkGlobalGenericSalesArea(currentObject,manager)
							if(checkGlobalSalesArea){
								var checkDateStartGlobal = wlib.checkDateStartForGlobal(currentObject,manager,checkLifeCycleStage2,logger,trigger,phtrigger,phTrigger,amaWTrigger,la1Trigger,la2Trigger,eu1Trigger,eu2Trigger);
								if(checkDateStartGlobal){
									if (Brandtype != "NON-SHIPPING BRAND CODE REQUIRED BY OSB" && Brandtype != "SAMPLE-INTERPLANT CODE (NOT PRICED)"){
										euFlag++;
										currentObject.getValue("BaseSufficiencyMet").setSimpleValue("Yes");
									}
								}
							}
						}
					}
				}
			}
			if(euFlag==0){
				excecuteSufficiencyFailedContionForGlobal(currentObject);
			}
		}
		else if(globalRegion=="LA"){
			var checkLifeCycleStage2 = wlib.checkLifeCycleStage2(currentObject,manager,logger);
			if(checkLifeCycleStage2.length>0){
				var checkLaunchAuthorization = wlib.checkLaunchAuthorization(currentObject,manager)
				if(checkLaunchAuthorization){
					var checkFeederITGTIN = wlib.checkFeederITGTIN(currentObject,manager)
					if(checkFeederITGTIN){
						var checkUOMAttributes = wlib.checkUOMAttributes(currentObject,manager)
						if(checkUOMAttributes){
							var notForSaleFlag= currentObject.getValue("NotForSaleFlag").getSimpleValue();
							var IOPTFirstUpdate=currentObject.getValue("IOPTFirstUpdate").getSimpleValue(); 
							  //logger.info(notForSaleFlag+" "+IOPTFirstUpdate);
							  if(IOPTFirstUpdate == "Yes" && notForSaleFlag!="Yes"){
								var checkDateStartGlobal = wlib.checkDateStartForGlobal(currentObject,manager,checkLifeCycleStage2,logger,trigger,phtrigger,phTrigger,amaWTrigger,la1Trigger,la2Trigger,eu1Trigger,eu2Trigger);
								if(checkDateStartGlobal){
									laFlag++;
									currentObject.getValue("BaseSufficiencyMet").setSimpleValue("Yes");
								}
							  }
							
						}
					}
				}
			}
			if(laFlag==0){
				excecuteSufficiencyFailedContionForGlobal(currentObject);
			}
		}
		
		//Added by Anusha to Trigger to Search Processor if there is change in any Attribute
		var baseSufficiencyAfter = currentObject.getValue("BaseSufficiencyMet").getSimpleValue();
		var gtinStatusNewAfter = currentObject.getValue("GTIN_Status_New").getSimpleValue();
		var productStatusNewAfter = currentObject.getValue("Product_Status_New").getSimpleValue();
		
		//SS-23684 getmethod to querymethod replacement
		//var nationalClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("FPCtoNationalProducts");
		var nationalClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("FPCtoNationalProducts");
		
		//SS-23684 getmethod to querymethod replacement
		//var tmCustomerClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TMtoCSProducts");
		var tmCustomerClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TMtoCSProducts");
		
		//SS-23684 getmethod to querymethod replacement
		//var refType=currentObject.getClassificationProductLinks(nationalClassificationType).toArray();
		var refType = currentObject.queryClassificationProductLinks(nationalClassificationType).asList("2000").toArray()
		
		//SS-23684 getmethod to querymethod replacement
		//var refTypetm=currentObject.getClassificationProductLinks(tmCustomerClassificationType).toArray();
		var refTypetm = currentObject.queryClassificationProductLinks(tmCustomerClassificationType).asList("2000").toArray()
		
		var nationalRefLengthAfter = refType.length;
		var customerRefLengthAfter = refTypetm.length;
		
		if(!((baseSufficiencyBefore == baseSufficiencyAfter)&&(gtinStatusNewBefore == gtinStatusNewAfter)&&(nationalRefLengthBefore == nationalRefLengthAfter)&&(customerRefLengthBefore == customerRefLengthAfter)&&(productStatusNewBefore == productStatusNewAfter))){
           // logger.info("REPUBLISH: SearchApprovalAction_Inbound to SearchProcessor for "+currentObject.getID());
			trigger.republish(currentObject);
			bsLib.triggerNodeForProcessor(currentObject, trigger, "FilterForSearchProcessor", currentObject, logger, "SearchApprovalAction_Inbound");
		}
	}
	else if(parentFpcParent == "Unassigned" || parentFpcParent == "ArchivedProducts"){
		excecuteSufficiencyFailedContionForGlobal(currentObject);
		
	}
	/*Added by Anusha to Approve Marketing Attributes 
	For Products which is already enriched and submitted in Marketing WF and was not base Sufficient previously and now approving those attributes when attaining Base Sufficiency
	*/
	var baseSufficiency = currentObject.getValue("BaseSufficiencyMet").getSimpleValue();
	if(baseSufficiency == "Yes"){
		var contextCountry = currentObject.getValue("Country_TM").getSimpleValue();
		var globalRegion = currentObject.getValue("GlobalRegion").getSimpleValue();
		var tmMarketingApprvalFlag = currentObject.getValue("TMMarketingApprvalFlag").getSimpleValue();
		var context = lookupTable.getLookupTableValue("GlobalContext",contextCountry);
		var allContext = approval.getGlobalContext(context);
		for each(var allContext1 in allContext){
			var approved = false;
			manager.executeInContext(allContext1,function(manager){
				var contextObj = manager.getObjectFromOtherManager(currentObject);
				if (globalRegion == "EU" && (contextObj.getValue("AgataApproved").getSimpleValue()=="Yes")){
					if(tmMarketingApprvalFlag == "Yes"){
						approved = true;
					}
				}
				if((globalRegion == "AMAE" || globalRegion == "AMAW" || globalRegion == "LA") && (contextObj.getValue("BradSrApproved").getSimpleValue()=="Yes")){
					if(tmMarketingApprvalFlag == "Yes"){
						approved = true;
					}
				}
			});
			
			if(globalRegion == "NA" && (allContext1 == "Context1")){
				if(tmMarketingApprvalFlag == "Yes"){
					approved = true;
				}
			}
			
			try {
				approval.approveAttsInGivenContext(currentObject,manager,"AttributesForApproval","Context1");
				approval.approveAttsInGivenContext(currentObject,manager,"AttributesForApproval","Context3");
				if(approved == true){
					var aprrovalarray=["SmartlabelReadiness", "SLSufficiencyDate","eCopyReDistributionUpdate","ReasonForChange","TimeStampForChange","eSufficiencyDate","eContentSufficiencyMet","eContentReadiness","RemoveDate","UpdateeSufficiencyDate","DueDate","PGPeContentSufficiency","PGPeSufficiencyDate","PGPUpdateeSufficiencyDate","PGPRemoveDate","TM_MarketSubbrand","TM_FlavorScent"];
					approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part1",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part2",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"MKT_BraunAttributes",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"TMSustainalbilityAttributes",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Hierarchy",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"MarketingCLMAttributesApproval",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"MarketingPHAttributes",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"MarketingEnrichmentStateTaskAttributes",allContext1);
					approval.approveAttsInGivenContext(currentObject,manager,"AssetEnrichmentStateTaskAttributes",allContext1);
					approval.approveAttsInGivenContext(currentObject, manager, "GeneralProductSafetyRegulation", allContext1); //Added as part of SS-24763
					approval.approveAttributesOnNode(aprrovalarray,currentObject,allContext1,manager,logger);
				}
			}catch (e){
				logger.warning("SearchApprovalAction_Inbound: currentObject="+currentObject.getID()+" : APPROVAL FAILED: " + e);
				throw(e);
			}
			
		}
		currentObject.getValue("TMMarketingApprvalFlag").setSimpleValue("");
		
		//For CA FR context alone below code:
		var frFlag = currentObject.getValue("FRTMMarketingApprovalFlag").getSimpleValue();
		var approved = false;
		if(globalRegion == "NA"){
			if(contextCountry == "CA"){
				if(frFlag == "Yes"){
					approved = true;
				}
			}
		}
		
		if(approved == true){
			var aprrovalarray=["SmartlabelReadiness", "SLSufficiencyDate","eCopyReDistributionUpdate","ReasonForChange","TimeStampForChange","eSufficiencyDate","eContentSufficiencyMet","eContentReadiness","RemoveDate","UpdateeSufficiencyDate","DueDate","PGPeContentSufficiency","PGPeSufficiencyDate","PGPUpdateeSufficiencyDate","PGPRemoveDate"];
			try {
				approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part1","Context3");
				approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part2","Context3");
				approval.approveAttsInGivenContext(currentObject,manager,"MKT_BraunAttributes","Context3");
				approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Hierarchy","Context3");
				approval.approveAttsInGivenContext(currentObject,manager,"MarketingCLMAttributesApproval","Context3");
				approval.approveAttributesOnNode(aprrovalarray,currentObject,"Context3",manager,logger);
				currentObject.getValue("FRTMMarketingApprovalFlag").setSimpleValue("");
			} catch (e) {
				logger.warning("SearchApprovalAction_Inbound: currentObject="+currentObject.getID()+" : APPROVAL FAILED: (2) " + e);
				throw(e);
			}
		}
	}
	/*var baseSufficiency = currentObject.getValue("BaseSufficiencyMet").getSimpleValue();
	if(baseSufficiency == "Yes"){
		var contextCountry = currentObject.getValue("Country_TM").getSimpleValue();
		//if(contextCountry == "US" || contextCountry == "CA" || contextCountry =="PR"){
			var context = lookupTable.getLookupTableValue("GlobalContext",contextCountry);
			var allContext = approval.getGlobalContext(context);
			for each(var allContext1 in allContext){
				try {
					approval.approveAttsInGivenContext(currentObject,manager,"AttributesForApproval","Context1");
					approval.approveAttsInGivenContext(currentObject,manager,"AttributesForApproval","Context3");
					var flag = currentObject.getValue("TMMarketingApprvalFlag").getSimpleValue();
					if(flag && (flag != "") && (flag != null)) {
						var attsArray = ["TM_MarketSubbrand","TM_FlavorScent"];
						var aprrovalarray=["SmartlabelReadiness", "SLSufficiencyDate","eCopyReDistributionUpdate","ReasonForChange","TimeStampForChange","eSufficiencyDate","eContentSufficiencyMet","eContentReadiness","RemoveDate","UpdateeSufficiencyDate","DueDate","PGPeContentSufficiency","PGPeSufficiencyDate","PGPUpdateeSufficiencyDate","PGPRemoveDate"];
						approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part1",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part2",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"MKT_BraunAttributes",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"TMSustainalbilityAttributes",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Hierarchy",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"MarketingCLMAttributesApproval",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"MarketingPHAttributes",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"MarketingEnrichmentStateTaskAttributes",allContext1);
						approval.approveAttsInGivenContext(currentObject,manager,"AssetEnrichmentStateTaskAttributes",allContext1);
						approval.approveAttributesOnNode(attsArray,currentObject,allContext1,manager,log);
						approval.approveAttributesOnNode(aprrovalarray,currentObject,allContext1,manager,logger);
						currentObject.getValue("TMMarketingApprvalFlag").setSimpleValue("");
					}
				} catch (e) {
					logger.warning("SearchApprovalAction_Inbound: currentObject="+currentObject.getID()+" : APPROVAL FAILED: " + e);
					throw(e);
				}
			}
			
			var frFlag = currentObject.getValue("FRTMMarketingApprovalFlag").getSimpleValue();
			if(frFlag && (frFlag != "") && (frFlag != null)){
				var aprrovalarray=["SmartlabelReadiness", "SLSufficiencyDate","eCopyReDistributionUpdate","ReasonForChange","TimeStampForChange","eSufficiencyDate","eContentSufficiencyMet","eContentReadiness","RemoveDate","UpdateeSufficiencyDate","DueDate","PGPeContentSufficiency","PGPeSufficiencyDate","PGPUpdateeSufficiencyDate","PGPRemoveDate"];
				try {
					approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part1","Context3");
					approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Part2","Context3");
					approval.approveAttsInGivenContext(currentObject,manager,"MKT_BraunAttributes","Context3");
					approval.approveAttsInGivenContext(currentObject,manager,"Marketing_Hierarchy","Context3");
					approval.approveAttsInGivenContext(currentObject,manager,"MarketingCLMAttributesApproval","Context3");
					approval.approveAttributesOnNode(aprrovalarray,currentObject,"Context3",manager,logger);
					currentObject.getValue("FRTMMarketingApprovalFlag").setSimpleValue("");
				} catch (e) {
					logger.warning("SearchApprovalAction_Inbound: currentObject="+currentObject.getID()+" : APPROVAL FAILED: (2) " + e);
					throw(e);
				}
			}
		//}
	}*/
}
function excecuteSufficiencyFailedContion(targetMarket){
	var pushPhList = new java.util.LinkedList();
	//Base sufficiency has not been met
	//1. Empty the SalesAreaStatusTM attribute
	//2. Remove Packaging hierarchy linked to TM
	//3. Remove TM from Brenda's view
	//To empty the SalesAreaStatusTM attribute at TM level and SalesAreaStatus at FPC level
	targetMarket.getValue("BaseSufficiencyMet").setSimpleValue("No");
	targetMarket.getValue("PGPBaseSufficiency").setSimpleValue("No");
	log.info("Base Sufficiency Met: "+targetMarket.getValue("BaseSufficiencyMet").getSimplevalue());
	//Added by Anusha to store the Removed Sales Area value in TM Level
	var salesAreaRemovedList = new java.util.LinkedList();
	var removedSalesAreaValue=targetMarket.getValue("Sales_Area_Removed_Status").getSimpleValue();
	if(removedSalesAreaValue){
		var removedSalesAreaArray=removedSalesAreaValue.split("<multisep/>");
		for each(var removed in removedSalesAreaArray){
			if(!(salesAreaRemovedList.contains(removed))){
				salesAreaRemovedList.push(removed);
			}
		}
	}		
	var salesAreaTM = targetMarket.getValue("SalesAreaStatusTM").getSimpleValue();
	if(salesAreaTM){
		var salesAreaTMArray = salesAreaTM.split("<multisep/>");
		for each(var removedSales in salesAreaTMArray){
			if(!(salesAreaRemovedList.contains(removedSales))){
				targetMarket.getValue("Sales_Area_Removed_Status").addValue(removedSales);
				salesAreaRemovedList.push(removedSales);
			}
		}
	}
	// TO remove the values of GTIN Status from GTIN_Status_New and Product_Status_New
	
	//SS-23684 getmethod to querymethod replacement
	//var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
	var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
	//SS-23684 getmethod to querymethod replacement
	//var lifeCycleRefs =targetMarket.getClassificationProductLinks(lifeCycleReferenceType).toArray();
	var lifeCycleRefs = targetMarket.queryClassificationProductLinks(lifeCycleReferenceType).asList("2000").toArray()
		
	for(var b=0; b<lifeCycleRefs.length; b++){
		var lifeCycleRef = lifeCycleRefs[b];
		var lifeCycleRefID = lifeCycleRef.getClassification().getID();
		if((lifeCycleRefID == "CA")||(lifeCycleRefID == "US")||(lifeCycleRefID == "PR")|| (lifeCycleRefID == "US_CPG")){
			var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
			if(currentLifeCycleStageLOV){
				var currentLifeCycleStage = currentLifeCycleStageLOV.getID();				
			}
		}
	}	
	var salesAreaStatusRemoved= targetMarket.getValue("Sales_Area_Removed_Status").getSimpleValue();
	if(salesAreaStatusRemoved){
		var onceflag =false;
		if(((salesAreaStatusRemoved.match("CA00")||salesAreaStatusRemoved.match("US60"))||(salesAreaStatusRemoved.match("PR04")) || (salesAreaStatusRemoved.match("PH0303")))){
			if((currentLifeCycleStage == "1")||(currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")||(currentLifeCycleStage == "4")||(currentLifeCycleStage == "5") ){
				//targetMarket.getValue("Product_Status_New").setValue("Unreleased");
				packLib.populateGTINStatusNewAtTM(targetMarket,manager,log);
				onceflag= true;
			}
			targetMarket.getValue("GTIN_Status_New").deleteCurrent();
		}
		if(salesAreaStatusRemoved.match("CA01")||salesAreaStatusRemoved.match("US61")){
			if((currentLifeCycleStage == "1")||(currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")||(currentLifeCycleStage == "4")||(currentLifeCycleStage == "5") ){
				//targetMarket.getValue("Product_Status_New").setValue("Unreleased");
				if(onceflag ==false){
					packLib.populateGTINStatusNewAtTM(targetMarket,manager,log);
				}
			}
			targetMarket.getValue("PGP_GTIN_Status_New").deleteCurrent();
		}
	}
	
		var valueBeforeDeleting = targetMarket.getValue("SalesAreaStatusTM").getSimpleValue();
		if(valueBeforeDeleting!=null&&valueBeforeDeleting!=""){
			targetMarket.getValue("SalesAreaStatusTM").deleteCurrent();
			if(!(pushPhList.contains(targetMarket))){
				pushPhList.push(targetMarket);
			}
		}
		var valuesArray = new Array();
		var FPC = targetMarket.getParent();
		var values = FPC.getValue("SalesAreaStatus").getValues();
		var countryName =  targetMarket.getValue("Country_TM").getSimpleValue();
		var itr = values.iterator();
		while(itr.hasNext()){
			var notInUseValue=itr.next();
			if((notInUseValue.getValue()).startsWith(countryName)){
				valuesArray.push(notInUseValue.getValue());
			}
		}
		
		for each(var removedSalesAreaValueFPC in valuesArray){
			var values = FPC.getValue("SalesAreaStatus").getValues();
			var itr = values.iterator();
			while(itr.hasNext()){
				var notInUseValue=itr.next();
				if(notInUseValue.getValue()==removedSalesAreaValueFPC){
					notInUseValue.deleteCurrent();	
				}
			}
		}
			//To delete Not in use Packaging hierarchy 
		var packArray = new java.util.LinkedList();
		var fpcCode  = targetMarket.getValue("FinishedProductCode").getSimpleValue();
		//SS - 23684 getReferencedByProducts to queryReferencedBy
		//var refs = targetMarket.getReferencedByProducts().toArray();
		var refs = targetMarket.queryReferencedBy(com.stibo.core.domain.Product,null).asList("10000").toArray();
            
		for each(var packRef in refs){
			var pack = packRef.getSource();
			if(pack.getID().match(fpcCode)){
				if(!(packArray.contains(pack))){
					packArray.push(pack);
				}				
			}
		}
		var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
		var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
		var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
		var searchIdArray = ["PIM", "IM" ,"FIM"];
		for(var y=0;y < packArray.size(); y++){
			var packObject = packArray.get(y);
			var temp = packObject.getID().split("_");
			var gtin = temp[0];
			var groupName = temp[1];					
			for(var a=0; a<searchIdArray.length; a++){
				var searchId = gtin+"_"+groupName+"_"+searchIdArray[a];
				var  allObj = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,searchId)).asList(100).toArray();
				for each (var obj in allObj){
					if(obj.getID() != packObject.getID()){
						//SS-23684 getmethod to querymethod replacement
						// var tmRefs =packObject.getReferences(tmReferenceType).toArray();
						var tmRefs = packObject.queryReferences(tmReferenceType).asList("2000").toArray();
						var tmRef = tmRefs[0].getTarget();
						if(tmRef.getObjectType().getID() == "FPC_TM"){
							if(!(pushPhList.contains(tmRef))){
								pushPhList.push(tmRef);
							}
						}
					}
				}						
			}
			
			//SS-23684 getmethod to querymethod replacement
			//var classificationType1 =manager.getLinkTypeHome().getClassificationProductLinkTypeByID("PackagingtoTMSpecific");
			var classificationType1 = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("PackagingtoTMSpecific");
			
			//SS-23684 getmethod to querymethod replacement
			//var classificationType2 =manager.getLinkTypeHome().getClassificationProductLinkTypeByID("FPC_To_Customer");
			var classificationType2 = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("FPC_To_Customer");
			
			//SS-23684 getmethod to querymethod replacement
			//var refs1 = packObject.getClassificationProductLinks(classificationType1).toArray();
			var refs1 = packObject.queryClassificationProductLinks(classificationType1).asList("2000").toArray()
			
			//SS-23684 getmethod to querymethod replacement
			//var refs2 = packObject.getClassificationProductLinks(classificationType2).toArray();
			var refs2 = packObject.queryClassificationProductLinks(classificationType2).asList("2000").toArray()
	
			var ref1LengthBefore = refs1.length;
			var ref2LengthBefore = refs2.length;
			for each(var reference1 in refs1){
				reference1.delete();
			}
			for each(var reference2 in refs2){
				reference2.delete();				
			}
			packObject.getValue("PIMIDAttribute").deleteCurrent();
			packObject.getValue("ItemPIMIDAttribute").deleteCurrent();
			packObject.getValue("ProductStatus").deleteCurrent();
			packObject.getValue("GTIN_Status_New").deleteCurrent();
			packObject.getValue("PGP_GTIN_Status_New").deleteCurrent();
			packObject.getValue("GTINStatus").deleteCurrent();
			
			//SS-23684 getmethod to querymethod replacement
			//var refs1After = packObject.getClassificationProductLinks(classificationType1).toArray();
			var refs1After = packObject.queryClassificationProductLinks(classificationType1).asList("2000").toArray()
	
			//SS-23684 getmethod to querymethod replacement
			//var refs2After = packObject.getClassificationProductLinks(classificationType2).toArray();
			var refs2After = packObject.queryClassificationProductLinks(classificationType2).asList("2000").toArray()
	
			var ref1LengthAfter = refs1After.length;
			var ref2LengthAfter = refs2After.length;
			if((ref1LengthBefore != ref1LengthAfter) || (ref2LengthBefore != ref2LengthAfter)){
              //  logger.info("REPUBLISH: SearchApprovalAction_Inbound to SearchProcessor for "+packObject.getID());
				trigger.republish(packObject);
				bsLib.triggerNodeForProcessor(currentObject, trigger, "FilterForSearchProcessor", packObject, logger, "SearchApprovalAction_Inbound");
			}
		}
		for( var tmObj in Iterator(pushPhList)){
			var PHTriggerCheck = tmObj.getValue("PHProcessorTriggerFlag").getSimpleValue();
			if(PHTriggerCheck == "" || PHTriggerCheck == null){
				var countryPH = tmObj.getValue("Country_TM").getSimpleValue();
				if(countryPH == "US" || countryPH == "CA" || countryPH == "PR"){
                   // logger.info("REPUBLISH "+countryPH+": SearchApprovalAction_Inbound to PHEventProcessor for "+tmObj.getID()+" currentObject="+currentObject.getID());
					phTrigger.republish(tmObj);
					bsLib.triggerNodeForProcessor(currentObject, phTrigger, "PHEventProcessor", tmObj, logger,
								"SearchApprovalAction_Inbound for "+tmObj.getID()+" currentObject="+currentObject.getID());
				}
				else if(countryPH == "PH"){
                   // logger.info("REPUBLISH PH: SearchApprovalAction_Inbound to PHEventProcessor for "+tmObj.getID()+" currentObject="+currentObject.getID());
					phtrigger.republish(tmObj);
					bsLib.triggerNodeForProcessor(currentObject, phtrigger, "AMAPHEventProcessor", tmObj, logger,
								"SearchApprovalAction_Inbound for "+tmObj.getID()+" currentObject="+currentObject.getID());
				}
			}
			else if(PHTriggerCheck == "G11 Update" || PHTriggerCheck == "IOPT Update"){
				tmObj.getValue("PHProcessorTriggerFlag").setSimpleValue("eSufficiency or BaseSufficiency Changes");
			}
		}
		//To remove Target Market from appproved products by deleting the Approved National product references
		
		//SS-23684 getmethod to querymethod replacement
		//var tmCustomerClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TMtoCSProducts");
		var tmCustomerClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TMtoCSProducts");
		
		//SS-23684 getmethod to querymethod replacement
		//var nationalClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("FPCtoNationalProducts");
		var nationalClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("FPCtoNationalProducts");
		
		//SS-23684 getmethod to querymethod replacement
		//var custSpecificTMRefs = targetMarket.getClassificationProductLinks(tmCustomerClassificationType).toArray();
		var custSpecificTMRefs = targetMarket.queryClassificationProductLinks(tmCustomerClassificationType).asList("2000").toArray()
		
		//SS-23684 getmethod to querymethod replacement
		//var nationalTMRefs = targetMarket.getClassificationProductLinks(nationalClassificationType).toArray();
		var nationalTMRefs = targetMarket.queryClassificationProductLinks(nationalClassificationType).asList("2000").toArray()
	
		//To remove Approved National product references
		for each(var approvedRef in nationalTMRefs){
			var classificationID = approvedRef.getClassification().getID();
			if(classificationID.startsWith("National_Products_")){
				approvedRef.delete();
			}
		}
		
}
/*if((usFlag!=0)||(caFlag!=0)||(prFlag!=0)||(phFlag !=0) || (amaFlag !=0) || (laFlag !=0) || (euFlag !=0) || (amaKRFlag !=0)){

	return true;
}
else if(usFlag==0 && caFlag==0 && prFlag==0 && phFlag ==0 && amaFlag ==0 && laFlag ==0 && euFlag ==0 && amaKRFlag ==0){
	
	return false;
}
*/
function DueDate(curObj,manager,log){
	var objectType = curObj.getObjectType();
	var flag=0;
	var firstBaseSufficientMetDates = [];
	if((objectType.getID() == "FPC_TM")){
		var parentFPC =curObj.getParent();	
		var country=curObj.getValue("Country_TM").getSimpleValue();
		if(country == "US"){
			
			//SS-23684 getmethod to querymethod replacement
			//var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
			var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
		
			//SS-23684 getmethod to querymethod replacement
			//var lifeCycleRefs =curObj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
			var lifeCycleRefs = curObj.queryClassificationProductLinks(lifeCycleReferenceType).asList("2000").toArray()
			
			//SS-23684 getmethod to querymethod replacement
			//var salesAreagroupingRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
			var salesAreagroupingRefType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
		
			//SS-23684 getmethod to querymethod replacement
			//var salesAreagroupingRef =curObj.getClassificationProductLinks(salesAreagroupingRefType).toArray();
			var salesAreagroupingRef = curObj.queryClassificationProductLinks(salesAreagroupingRefType).asList("2000").toArray()
	
			if(lifeCycleRefs.length > 0){
				for(var j=0;j<lifeCycleRefs.length;j++){
					var lifeCycleRef = lifeCycleRefs[j];
					var lifeCycleRefItem = lifeCycleRef.getClassification();
					var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
					if(salesArea!=null){
						var salesAreaArray = salesArea.split("<multisep/>");
						for(var k=0;k<salesAreaArray.length;k++){
							if(salesAreaArray[k]=="US60_01"){
								flag=1;
							}
						}
					}
					var firstBaseSufficientMetDate = null;
					if(salesAreagroupingRef.length > 0){
						for(var jh=0;jh<salesAreagroupingRef.length;jh++){
							var salesAreagroupingRe = salesAreagroupingRef[jh];
								if(salesAreagroupingRe.getValue("FirstBaseSufficiencydate").getSimpleValue()!=null){
							firstBaseSufficientMetDates.push(salesAreagroupingRe.getValue("FirstBaseSufficiencydate").getSimpleValue());
							}
						}
						firstBaseSufficientMetDate = firstBaseSufficientMetDates[0];
						for(var h=1;h<firstBaseSufficientMetDates.length;h++){
							if(firstBaseSufficientMetDates[h]<firstBaseSufficientMetDate){
							firstBaseSufficientMetDate = firstBaseSufficientMetDates[h];
							}
						}
					}
					
					if(flag ==1){
						
						var lifeCycleStage4 = lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
							var externalOnlineDate = curObj.getValue("ExternalOnlineDate").getSimpleValue();
							var basesufficiencymet = curObj.getValue("BaseSufficiencyMet").getSimpleValue();
							var externalOnlineDateDueDate=curObj.getValue("ExternalOnlineDate_DueDate").getSimpleValue();
							
							if(externalOnlineDateDueDate == null || externalOnlineDateDueDate == ""){	
								if(externalOnlineDate!=null){
								curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(externalOnlineDate);
								}
								else{
									curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(lifeCycleStage4);
								}
							}
							else{
								
								if(externalOnlineDate!=null && externalOnlineDate != externalOnlineDateDueDate){	
									curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(externalOnlineDate);
								}
								else if(externalOnlineDate==null &&lifeCycleStage4 != externalOnlineDateDueDate){
									curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(lifeCycleStage4);
								}
							}						
						var externalOnlineDateDueDateChange = curObj.getValue("ExternalOnlineDate_DueDate").getSimpleValue();
						if(externalOnlineDateDueDateChange){
							var replaceString = externalOnlineDateDueDateChange.replace("-", "/");
							var stepdate = new Date(replaceString);
							var dueDate120 = new Date(stepdate);
							dueDate120.setDate(stepdate.getDate()-120);
							var ISOString120 = dueDate120.toISOString();
							var ISODate120 = ISOString120.substring(0, 10);	
							var dueDate70 = new Date(stepdate);
							dueDate70.setDate(stepdate.getDate()-70);
							var ISOString70 = dueDate70.toISOString();
							var ISODate70 = ISOString70.substring(0, 10);
							var dueDate45 = new Date(stepdate);
							dueDate45.setDate(stepdate.getDate()-45);
							var ISOString45 = dueDate45.toISOString();
							var ISODate45 = ISOString45.substring(0, 10);
							var dueDate80 = new Date(stepdate);
							dueDate80.setDate(stepdate.getDate()-80);
							var ISOString80 = dueDate80.toISOString();
							var ISODate80 = ISOString80.substring(0, 10);	
						
						var yesorno = DueDateUpdate(curObj,manager,log,externalOnlineDateDueDateChange,basesufficiencymet,firstBaseSufficientMetDate,lifeCycleStage4);
						var ItemGTIN = curObj.getValue("ITGTIN").getSimpleValue();
						if(ItemGTIN){
							if(yesorno == "no"){
								var customer = curObj.getValue("CustomerClassificationAtTM").getSimpleValue();
								if(customer!=null){
									var customerSplit = customer.split("<multisep/>");
									var customerflag=false;
									var flagcheck=0;
										for(var m = 0;m<customerSplit.length;m++){
											if(customerSplit[m]!="BJS" && customerSplit[m]!="COSC" && customerSplit[m]!="SAMS"  && customerSplit[m]!="COST"){
												flagcheck++;
											}
										}
										if(flagcheck==0){
											customerflag=true;
										}
									/*if(customerflag){							
										curObj.getValue("DueDate").setSimpleValue(ISODate80);
										parentFPC.getValue("DueDateUS").setSimpleValue(ISODate80);
										var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();
									}
									else{
										var category = curObj.getValue("Category").getSimpleValue();
									     var subSector = curObj.getValue("SubSector").getSimpleValue();
										if(category=="AP/DO & Body Spray" || category=="Personal Cleansing" || subSector == "Fabric Care" || subSector == "Baby Care" || subSector == "Oral Care" || subSector == "Home Care" || subSector == "Personal Health Care" || subSector == "Feminine Care" || subSector == "Hair Care" || subSector == "Appliances"){
											curObj.getValue("DueDate").setSimpleValue(ISODate70);
											parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate70);
											var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();
										}
										else{
											curObj.getValue("DueDate").setSimpleValue(ISODate120);
											parentFPC.getValue("DueDateUS").setSimpleValue(ISODate120);
											var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();	
										}
									}*/
									if(customerflag){
										curObj.getValue("DueDate").setSimpleValue(ISODate80);
										parentFPC.getValue("DueDateUS").setSimpleValue(ISODate80);
										var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();
									}
									else{
										curObj.getValue("DueDate").setSimpleValue(ISODate70);
									    parentFPC.getValue("DueDateUS").setSimpleValue(ISODate70);
										var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();
									}
								}
								else{
									curObj.getValue("DueDate").setSimpleValue(ISODate70);
									parentFPC.getValue("DueDateUS").setSimpleValue(ISODate70);
									var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();	
								}
								/*else{
									var category = curObj.getValue("Category").getSimpleValue();
									var subSector = curObj.getValue("SubSector").getSimpleValue();
									
									if(category=="AP/DO & Body Spray" || category=="Personal Cleansing" || subSector == "Fabric Care" || subSector == "Baby Care" || subSector == "Oral Care" || subSector == "Home Care" || subSector == "Personal Health Care" || subSector == "Feminine Care" || subSector == "Hair Care" || subSector == "Appliances"){
										curObj.getValue("DueDate").setSimpleValue(ISODate70);
										parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate70);
										var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();
									}
									else{
										curObj.getValue("DueDate").setSimpleValue(ISODate120);
										parentFPC.getValue("DueDateUS").setSimpleValue(ISODate120);
										var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();	
									}
								}*/
							}
							else{
								
								curObj.getValue("DueDate").setSimpleValue(ISODate45);
								parentFPC.getValue("DueDateUS").setSimpleValue(ISODate45);
								var duedateUS = parentFPC.getValue("DueDateUS").getSimpleValue();				
							}
						}
						}
						flag=0;
					}
					
				}
			}
		}
		if(country == "CA"){
			
			//SS-23684 getmethod to querymethod replacement
			//var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
			var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
			
			//SS-23684 getmethod to querymethod replacement
			//var lifeCycleRefs =curObj.getClassificationProductLinks(lifeCycleReferenceType).toArray();
			var lifeCycleRefs = curObj.queryClassificationProductLinks(lifeCycleReferenceType).asList("2000").toArray()
			
			//SS-23684 getmethod to querymethod replacement
			//var salesAreagroupingRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
			var salesAreagroupingRefType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
			
			//SS-23684 getmethod to querymethod replacement
			//var salesAreagroupingRef =curObj.getClassificationProductLinks(salesAreagroupingRefType).toArray();
			var salesAreagroupingRef = curObj.queryClassificationProductLinks(salesAreagroupingRefType).asList("2000").toArray()
	
			if(lifeCycleRefs.length > 0){
				for(var j=0;j<lifeCycleRefs.length;j++){
					var lifeCycleRef = lifeCycleRefs[j];
					var lifeCycleRefItem = lifeCycleRef.getClassification();
					var salesArea = lifeCycleRef.getValue("SalesArea").getSimpleValue();
					if(salesArea!=null){
						var salesAreaArray = salesArea.split("<multisep/>");
						for(var k=0;k<salesAreaArray.length;k++){
							if(salesAreaArray[k]=="CA00_01"){
								flag=1;
							}
						}
					}
					var firstBaseSufficientMetDate = null;
					if(salesAreagroupingRef.length > 0){
						for(var jh=0;jh<salesAreagroupingRef.length;jh++){
							var salesAreagroupingRe = salesAreagroupingRef[jh];
								if(salesAreagroupingRe.getValue("FirstBaseSufficiencydate").getSimpleValue()!=null){
							firstBaseSufficientMetDates.push(salesAreagroupingRe.getValue("FirstBaseSufficiencydate").getSimpleValue());
							}
						}
						firstBaseSufficientMetDate = firstBaseSufficientMetDates[0];
						for(var h=1;h<firstBaseSufficientMetDates.length;h++){
							if(firstBaseSufficientMetDates[h]<firstBaseSufficientMetDate){
							firstBaseSufficientMetDate = firstBaseSufficientMetDates[h];
							}
						}
					}
					
					if(flag ==1){
						
						var lifeCycleStage4 = lifeCycleRef.getValue("LifeCycleStage4").getSimpleValue();
							var externalOnlineDate = curObj.getValue("ExternalOnlineDate").getSimpleValue();
							var basesufficiencymet = curObj.getValue("BaseSufficiencyMet").getSimpleValue();
							var externalOnlineDateDueDate=curObj.getValue("ExternalOnlineDate_DueDate").getSimpleValue();
							
							if(externalOnlineDateDueDate == null || externalOnlineDateDueDate == ""){	
								if(externalOnlineDate!=null){
								curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(externalOnlineDate);
								}
								else{
									curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(lifeCycleStage4);
								}
							}
							else{
								
								if(externalOnlineDate!=null && externalOnlineDate != externalOnlineDateDueDate){	
									curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(externalOnlineDate);
								}
								else if(externalOnlineDate==null &&lifeCycleStage4 != externalOnlineDateDueDate){
									curObj.getValue("ExternalOnlineDate_DueDate").setSimpleValue(lifeCycleStage4);
								}
							}					
						var externalOnlineDateDueDateChange = curObj.getValue("ExternalOnlineDate_DueDate").getSimpleValue();
						if(externalOnlineDateDueDateChange){
							var replaceString = externalOnlineDateDueDateChange.replace("-", "/");
							var stepdate = new Date(replaceString);
							var dueDate120 = new Date(stepdate);
							dueDate120.setDate(stepdate.getDate()-120);
							var ISOString120 = dueDate120.toISOString();
							var ISODate120 = ISOString120.substring(0, 10);	
							var dueDate70 = new Date(stepdate);
							dueDate70.setDate(stepdate.getDate()-70);
							var ISOString70 = dueDate70.toISOString();
							var ISODate70 = ISOString70.substring(0, 10);	
							var dueDate45 = new Date(stepdate);
							dueDate45.setDate(stepdate.getDate()-45);
							var ISOString45 = dueDate45.toISOString();
							var ISODate45 = ISOString45.substring(0, 10);
							var dueDate80 = new Date(stepdate);
							dueDate80.setDate(stepdate.getDate()-80);
							var ISOString80 = dueDate80.toISOString();
							var ISODate80 = ISOString80.substring(0, 10);	
						
						var yesorno = DueDateUpdate(curObj,manager,log,externalOnlineDateDueDateChange,basesufficiencymet,firstBaseSufficientMetDate,lifeCycleStage4);
						var ItemGTIN = curObj.getValue("ITGTIN").getSimpleValue();
						if(ItemGTIN){
							if(yesorno == "no"){
								var customer = curObj.getValue("CustomerClassificationAtTM").getSimpleValue();
								
									if(customer!=null){
										var customerSplit = customer.split("<multisep/>");
										var customerflag=false;
										var flagcheck=0;
											for(var m = 0;m<customerSplit.length;m++){
												if(customerSplit[m]!="BJS" && customerSplit[m]!="COSC" && customerSplit[m]!="SAMS"  && customerSplit[m]!="COST"){
													flagcheck++;
												}
											}
											if(flagcheck==0){
												customerflag=true;
											}
										/*if(customerflag){								
											curObj.getValue("DueDate").setSimpleValue(ISODate80);
											parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate80);
											var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();
										}
										else{
											var category = curObj.getValue("Category").getSimpleValue();
											var subSector = curObj.getValue("SubSector").getSimpleValue();
											
											if(category=="AP/DO & Body Spray" || category=="Personal Cleansing" || subSector == "Fabric Care" || subSector == "Baby Care" || subSector == "Oral Care" || subSector == "Home Care" || subSector == "Personal Health Care" || subSector == "Feminine Care" || subSector == "Hair Care" || subSector == "Appliances"){
												curObj.getValue("DueDate").setSimpleValue(ISODate70);
												parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate70);
												var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();
											}
											else{
												curObj.getValue("DueDate").setSimpleValue(ISODate120);
												parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate120);
												var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();			
											}
										}*/
										if(customerflag){
											curObj.getValue("DueDate").setSimpleValue(ISODate80);
											parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate80);
											var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();
										}
										else{
											curObj.getValue("DueDate").setSimpleValue(ISODate70);
											parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate70);
											var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();
										}
									}
									else{
										curObj.getValue("DueDate").setSimpleValue(ISODate70);
										parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate70);
										var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();	
									}
									/*else{
										var category = curObj.getValue("Category").getSimpleValue();
										var subSector = curObj.getValue("SubSector").getSimpleValue();
										if(category=="AP/DO & Body Spray" || category=="Personal Cleansing" || subSector == "Fabric Care" || subSector == "Baby Care" || subSector == "Oral Care" || subSector == "Home Care" || subSector == "Personal Health Care" || subSector == "Feminine Care" || subSector == "Hair Care" || subSector == "Appliances"){
											curObj.getValue("DueDate").setSimpleValue(ISODate70);
											parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate70);
											var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();
										}
										else{
											curObj.getValue("DueDate").setSimpleValue(ISODate120);
											parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate120);
											var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();		
										}
									}*/
								
							}
							else{
								
								curObj.getValue("DueDate").setSimpleValue(ISODate45);
								parentFPC.getValue("DueDateCAN").setSimpleValue(ISODate45);
								var duedateUS = parentFPC.getValue("DueDateCAN").getSimpleValue();				
							}
						}
						}
						flag=0;
					}
						
				}
			}
		
		
		}
	
		var attsArray=["DueDate"];
		try {
			approval.approveAttributesOnNode(attsArray,curObj,"Context1",manager,log);
			approval.approveAttributesOnNode(attsArray,curObj,"Context3",manager,log);
		} catch (e) {
			logger.warning("SearchApprovalAction_Inbound: curObj="+curObj.getID()+" : APPROVAL FAILED: " + e);
			throw(e);
		}
	}
}
/**Function to set DueDate for Target Markets with similar GTIN 
*@Author Hari
*/
function DueDateUpdate(tmobject,manager,log,externalOnlineDateDueDateChange,basesufficiencymet,firstBaseSufficientMetDate,lifeCycleStage4){
	var yesorno = "yes";
    var currentCountry = tmobject.getValue("Country_TM").getSimpleValue();
	var fpc =  tmobject.getParent();
	var currentGTIN=fpc.getValue("ITGTIN").getSimpleValue();
	var firstBaseSufficientMetDatescurrent=[];
	var  similarGTINProducts;
	var counter = 0;
	var tmcounter = 0;
	
	if(currentGTIN){
		var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
		var gtinAttribute = manager.getAttributeHome().getAttributeByID("GTIN");
		var  similarGTINProducts = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,gtinAttribute,currentGTIN)).asList(100).toArray();
		var similarUOMs=new Array();
		for each(var uomObject in similarGTINProducts ){
			if(uomObject.getObjectType().getID()=="FPC_UOM"){
				if(uomObject.getValue("PackagingType").getSimpleValue()=="IT"){
					if(uomObject.getValue("FinishedProductCode").getSimpleValue()!=tmobject.getValue("FinishedProductCode").getSimpleValue()){
						similarUOMs.push(uomObject);
					}
				}
			}
		}
		
		if(similarUOMs.length == 0){
			yesorno  = "no";
		}
		if(similarUOMs.length>0){
			for each(var uomFound in similarUOMs){
				var uom1 = uomFound;
				var targetMarkets = uom1.getParent().getChildren().toArray();
				var similarTM = null;
				var noTmFlag=true;
				for each(var tm in targetMarkets){
					if(tm.getObjectType().getID()=="FPC_TM"){
						if(tm.getValue("Country_TM").getSimpleValue()==currentCountry){
							var validTMflag = false;
							noTmFlag=false;
							similarTM=tm;
							if(similarTM.getParent().getParent().getID()!="ArchivedProducts" && similarTM.getParent().getParent().getID()!="Unassigned"){
							
							//SS-23684 getmethod to querymethod replacement
							//var lifeCycleReferenceType1 = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
							var lifeCycleReferenceType1 = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
							
							//SS-23684 getmethod to querymethod replacement
							//var lifeCycleRefs1 =similarTM.getClassificationProductLinks(lifeCycleReferenceType1).toArray();
							var lifeCycleRefs1 = similarTM.queryClassificationProductLinks(lifeCycleReferenceType1).asList("2000").toArray();
	
							var lifeCycleStage4current = null;
							if(lifeCycleRefs1.length > 0){
								for(var bj=0;bj<lifeCycleRefs1.length;bj++){
									var lifeCycleRef1 = lifeCycleRefs1[bj];
									var lifeCycleRefItem1 = lifeCycleRef1.getClassification();
									var salesArea1 = lifeCycleRef1.getValue("SalesArea").getSimpleValue();
									if(salesArea1!=null){
										var salesAreaArray1 = salesArea1.split("<multisep/>");
										for(var bk=0;bk<salesAreaArray1.length;bk++){
											if(salesAreaArray1[bk]=="US60_01" || salesAreaArray1[bk]=="CA00_01" || salesAreaArray1[bk]=="PH03_03"){
												lifeCycleStage4current = lifeCycleRef1.getValue("LifeCycleStage4").getSimpleValue();
												validTMflag=true;
											}
										}
									}
								}
							}
							
							if(validTMflag){
								var currentparent = similarTM.getParent();
								tmcounter++;
								var externalOnlineDateCurrent= similarTM.getValue("ExternalOnlineDate").getSimpleValue();
								if(externalOnlineDateCurrent != null){
									similarTM.getValue("ExternalOnlineDate_DueDate").setSimpleValue(externalOnlineDateCurrent);
								}
								else if(lifeCycleStage4current != null){	
									similarTM.getValue("ExternalOnlineDate_DueDate").setSimpleValue(lifeCycleStage4current);
								}
								var externalOnlineDateDueDateChangecurrent = similarTM.getValue("ExternalOnlineDate_DueDate").getSimpleValue();	
								var replaceStringcurrent = externalOnlineDateDueDateChangecurrent.replace("-", "/");
								var stepdatecurrent = new Date(replaceStringcurrent);	
								var dueDate45current = new Date(stepdatecurrent);
								dueDate45current.setDate(stepdatecurrent.getDate()-45);
								var ISOString45current = dueDate45current.toISOString();
								var ISODate45current = ISOString45current.substring(0, 10);
								var basesufficiencymetcurrent = similarTM.getValue("BaseSufficiencyMet").getSimpleValue();
								
								//SS-23684 getmethod to querymethod replacement
								//var salesAreagroupingRefType1 = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
								var salesAreagroupingRefType1 = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
								
								//SS-23684 getmethod to querymethod replacement
								//var salesAreagroupingRef =similarTM.getClassificationProductLinks(salesAreagroupingRefType1).toArray();
								var salesAreagroupingRef = similarTM.queryClassificationProductLinks(salesAreagroupingRefType1).asList("2000").toArray();
								var firstBaseSufficientMetDatecurrent = null;
								if(salesAreagroupingRef.length > 0){
									for(var aj=0;aj<salesAreagroupingRef.length;aj++){
										var salesAreagroupingRe = salesAreagroupingRef[aj];
										if(salesAreagroupingRe.getValue("FirstBaseSufficiencydate").getSimpleValue()!=null){
										firstBaseSufficientMetDatescurrent.push(salesAreagroupingRe.getValue("FirstBaseSufficiencydate").getSimpleValue());
									}
									}
									if(firstBaseSufficientMetDatescurrent[0] != null){
									 firstBaseSufficientMetDatecurrent = firstBaseSufficientMetDatescurrent[0];
									 }
									for(var ah=0;ah<firstBaseSufficientMetDatescurrent.length;ah++){
										
										if(firstBaseSufficientMetDatescurrent[ah]<firstBaseSufficientMetDatecurrent){
										firstBaseSufficientMetDatecurrent = firstBaseSufficientMetDatescurrent[ah];
										}
									}
								}
								if(externalOnlineDateDueDateChange!=null){
									if(firstBaseSufficientMetDatecurrent > firstBaseSufficientMetDate || firstBaseSufficientMetDatecurrent== null){
										counter++;
										if(basesufficiencymet!=null){
											if(basesufficiencymet.equals("Yes")){
												tm.getValue("DueDate").setSimpleValue(ISODate45current);
												if(currentCountry == "CA"){
													currentparent.getValue("DueDateCAN").setSimpleValue(ISODate45current);		
												}
												else if(currentCountry == "US"){
													currentparent.getValue("DueDateUS").setSimpleValue(ISODate45current);		
												}
                                               // logger.info("REPUBLISH: SearchApprovalAction_Inbound to SearchProcessor for similarTM="+similarTM.getID()+", currentObject="+currentObject.getID());
												trigger.republish(similarTM);
												bsLib.triggerNodeForProcessor(currentObject, trigger, "FilterForSearchProcessor", similarTM, logger,
															"SearchApprovalAction_Inbound for similarTM="+similarTM.getID()+" currentObject="+currentObject.getID());
												var attsArray=["DueDate"];
												var attsArray=["DueDate"];
												try {
													approval.approveAttributesOnNode(attsArray,similarTM,"Context1",manager,log);
													approval.approveAttributesOnNode(attsArray,similarTM,"Context3",manager,log);
												} catch (e) {
													logger.warning("SearchApprovalAction_Inbound: similarTM="+similarTM.getID()+" : APPROVAL FAILED: " + e);
													throw(e);
												}
											}
										}
									}
									else if((firstBaseSufficientMetDatecurrent == firstBaseSufficientMetDate) && (lifeCycleStage4current > lifeCycleStage4)){
										counter++;
										if(basesufficiencymet!=null){
											if(basesufficiencymet.equals("Yes")){
												tm.getValue("DueDate").setSimpleValue(ISODate45current);	
												if(currentCountry == "CA"){
													currentparent.getValue("DueDateCAN").setSimpleValue(ISODate45current);		
												}
												else if(currentCountry == "US"){
													currentparent.getValue("DueDateUS").setSimpleValue(ISODate45current);		
												}
                                               // logger.info("REPUBLISH: SearchApprovalAction_Inbound to SearchProcessor for similarTM (2)="+similarTM.getID()+", currentObject="+currentObject.getID());
												trigger.republish(similarTM);
												bsLib.triggerNodeForProcessor(currentObject, trigger, "FilterForSearchProcessor", similarTM, logger,
															"SearchApprovalAction_Inbound for similarTM (2) ="+similarTM.getID()+" currentObject="+currentObject.getID());
												var attsArray=["DueDate"];
													try {
													approval.approveAttributesOnNode(attsArray,similarTM,"Context1",manager,log);
													approval.approveAttributesOnNode(attsArray,similarTM,"Context3",manager,log);
												} catch (e) {
													logger.warning("SearchApprovalAction_Inbound: similarTM="+similarTM.getID()+" : APPROVAL FAILED: (2) " + e);
													throw(e);
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
				
				if(noTmFlag){
					
				}
			}
				if(counter == tmcounter){
					yesorno  = "no";
				}
		}	
	}
	return yesorno;
}
function checkGlobalGenericSalesArea(obj,manager){
	var objectType = obj.getObjectType();
	var salesAreaflagcheck = 0;

	if(objectType.getID() == "FPC_TM"){
		
		//SS-23684 getmethod to querymethod replacement
		//var salesAreaReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Sales_Area_Grouping");
		var salesAreaReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("Sales_Area_Grouping");
		
		//SS-23684 getmethod to querymethod replacement
		//var salesAreaRefs =obj.getClassificationProductLinks(salesAreaReferenceType).toArray();
		var salesAreaRefs = obj.queryClassificationProductLinks(salesAreaReferenceType).asList("2000").toArray();
		for(var i=0;i<salesAreaRefs.length;i++){
			var salesAreaRef = salesAreaRefs[i];
			salesAreaRefItem = salesAreaRef.getClassification();
			var salesAreaRefStyleID = salesAreaRefItem.getID();

			checkSalesAreaFromLookuptable = lookupTable.getLookupTableValue("Global_Generic_SaleaArea_Check",salesAreaRefStyleID);
			if(checkSalesAreaFromLookuptable!="Yes"){
				salesAreaflagcheck++;
			}
			
		}
	}
	if(salesAreaflagcheck==0){
		return false;
	}
	else{
		return true;
	}
}
function excecuteSufficiencyFailedContionForGlobal(targetMarket){
	var pushPhList = new java.util.LinkedList();
	//Base sufficiency has not been met
	//1. Empty the SalesAreaStatusTM attribute
	//2. Remove Packaging hierarchy linked to TM
	//3. Remove TM from Brenda's view
	//To empty the SalesAreaStatusTM attribute at TM level and SalesAreaStatus at FPC level
	targetMarket.getValue("BaseSufficiencyMet").setSimpleValue("No");
	//Added by Anusha to store the Removed Sales Area value in TM Level
	var salesAreaRemovedList = new java.util.LinkedList();
	var removedSalesAreaValue=targetMarket.getValue("Sales_Area_Removed_Status").getSimpleValue();
	if(removedSalesAreaValue){
		var removedSalesAreaArray=removedSalesAreaValue.split("<multisep/>");
		for each(var removed in removedSalesAreaArray){
			if(!(salesAreaRemovedList.contains(removed))){
				salesAreaRemovedList.push(removed);
			}
		}
	}	
	var salesAreaTM = targetMarket.getValue("SalesAreaStatusTM").getSimpleValue();
	if(salesAreaTM){
		var salesAreaTMArray = salesAreaTM.split("<multisep/>");
		for each(var removedSales in salesAreaTMArray){
			if(!(salesAreaRemovedList.contains(removedSales))){
				targetMarket.getValue("Sales_Area_Removed_Status").addValue(removedSales);
				salesAreaRemovedList.push(removedSales);
			}
		}
	}
	// TO remove the values of GTIN Status from GTIN_Status_New and Product_Status_New
	
	//SS-23684 getmethod to querymethod replacement
	//var lifeCycleReferenceType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TM_to_LifecycleCountryofSale");
	var lifeCycleReferenceType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TM_to_LifecycleCountryofSale");
		
	//SS-23684 getmethod to querymethod replacement
	//var lifeCycleRefs =targetMarket.getClassificationProductLinks(lifeCycleReferenceType).toArray();
	var lifeCycleRefs = targetMarket.queryClassificationProductLinks(lifeCycleReferenceType).asList("2000").toArray();
		
	for(var b=0; b<lifeCycleRefs.length; b++){
		var lifeCycleRef = lifeCycleRefs[b];
		var lifeCycleRefID = lifeCycleRef.getClassification().getID();
		var currentLifeCycleStageLOV = lifeCycleRef.getValue("CurrentLifecycleStage").getLOVValue();
		if(currentLifeCycleStageLOV){
			var currentLifeCycleStage = currentLifeCycleStageLOV.getID();
		}
	}	
	var salesAreaStatusRemoved= targetMarket.getValue("Sales_Area_Removed_Status").getSimpleValue();
	if(salesAreaStatusRemoved){
		if((currentLifeCycleStage == "1")||(currentLifeCycleStage == "2")||(currentLifeCycleStage == "3")||(currentLifeCycleStage == "4")||(currentLifeCycleStage == "5") ){
			//targetMarket.getValue("Product_Status_New").setValue("Unreleased");
			packLib.populateGTINStatusNewAtTM(targetMarket,manager,log);
		}
		targetMarket.getValue("GTIN_Status_New").deleteCurrent();
	}
	
	var valueBeforeDeleting = targetMarket.getValue("SalesAreaStatusTM").getSimpleValue();
	if(valueBeforeDeleting!=null&&valueBeforeDeleting!=""){
		targetMarket.getValue("SalesAreaStatusTM").deleteCurrent();
		if(!(pushPhList.contains(targetMarket))){
			pushPhList.push(targetMarket);
		}
	}
	var valuesArray = new Array();
	var FPC = targetMarket.getParent();
	var values = FPC.getValue("SalesAreaStatus").getValues();
	var countryName =  targetMarket.getValue("Country_TM").getSimpleValue();
	var itr = values.iterator();
	while(itr.hasNext()){
		var notInUseValue=itr.next();
		if((notInUseValue.getValue()).startsWith(countryName)){
			valuesArray.push(notInUseValue.getValue());
		}
	}
	
	for each(var removedSalesAreaValueFPC in valuesArray){
		var values = FPC.getValue("SalesAreaStatus").getValues();
		var itr = values.iterator();
		while(itr.hasNext()){
			var notInUseValue=itr.next();
			if(notInUseValue.getValue()==removedSalesAreaValueFPC){
				notInUseValue.deleteCurrent();	
			}
		}
	}
	//To delete Not in use Packaging hierarchy 
	var packArray = new java.util.LinkedList();
	var fpcCode  = targetMarket.getValue("FinishedProductCode").getSimpleValue();
	//SS - 23684 getReferencedByProducts to queryReferencedBy
	//var refs = targetMarket.getReferencedByProducts().toArray();
	var refs = targetMarket.queryReferencedBy(com.stibo.core.domain.Product,null).asList("10000").toArray();
        
	for each(var packRef in refs){
		var pack = packRef.getSource();
		if(pack.getID().match(fpcCode)){
			if(!(packArray.contains(pack))){
				packArray.push(pack);
			}				
		}
	}
	var singlehome=manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
	var pimIDAttribute = manager.getAttributeHome().getAttributeByID("PIMIDAttribute");
	var tmReferenceType=manager.getReferenceTypeHome().getReferenceTypeByID("PKG_TM_Reference");
	var searchIdArray = ["PIM", "IM" ,"FIM"];
	for(var y=0;y < packArray.size(); y++){
		var packObject = packArray.get(y);
		var temp = packObject.getID().split("_");
		var gtin = temp[0];
		var groupName = temp[1];					
		for(var a=0; a<searchIdArray.length; a++){
			var searchId = gtin+"_"+groupName+"_"+searchIdArray[a];
			var  allObj = singlehome.querySingleAttribute(new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(com.stibo.core.domain.Product,pimIDAttribute,searchId)).asList(100).toArray();
			for each (var obj in allObj){
				if(obj.getID() != packObject.getID()){
					//SS-23684 getmethod to querymethod replacement
					// var tmRefs =packObject.getReferences(tmReferenceType).toArray();
					var tmRefs = packObject.queryReferences(tmReferenceType).asList("2000").toArray();	
					var tmRef = tmRefs[0].getTarget();
					if(tmRef.getObjectType().getID() == "FPC_TM"){
						if(!(pushPhList.contains(tmRef))){
							pushPhList.push(tmRef);
						}
					}
				}
			}						
		}
		
		//SS-23684 getmethod to querymethod replacement
		//var classificationType1 =manager.getLinkTypeHome().getClassificationProductLinkTypeByID("PackagingtoTMSpecific");
		var classificationType1 = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("PackagingtoTMSpecific");
	
		//SS-23684 getmethod to querymethod replacement
		//var classificationType2 =manager.getLinkTypeHome().getClassificationProductLinkTypeByID("FPC_To_Customer");
		var classificationType2 = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("FPC_To_Customer");
		
		//SS-23684 getmethod to querymethod replacement
		//var refs1 = packObject.getClassificationProductLinks(classificationType1).toArray();
		var refs1 = packObject.queryClassificationProductLinks(classificationType1).asList("2000").toArray();
		
		//SS-23684 getmethod to querymethod replacement
		//var refs2 = packObject.getClassificationProductLinks(classificationType2).toArray();
		var refs2 = packObject.queryClassificationProductLinks(classificationType2).asList("2000").toArray();
		
		var ref1LengthBefore = refs1.length;
		var ref2LengthBefore = refs2.length;
		for each(var reference1 in refs1){
			reference1.delete();
		}
		for each(var reference2 in refs2){
			reference2.delete();				
		}
		packObject.getValue("PIMIDAttribute").deleteCurrent();
		packObject.getValue("ItemPIMIDAttribute").deleteCurrent();
		packObject.getValue("ProductStatus").deleteCurrent();
		packObject.getValue("GTIN_Status_New").deleteCurrent();
		packObject.getValue("GTINStatus").deleteCurrent();
		
		//SS-23684 getmethod to querymethod replacement
		//var refs1After = packObject.getClassificationProductLinks(classificationType1).toArray();
		var refs1After = packObject.queryClassificationProductLinks(classificationType1).asList("2000").toArray();
		
		//SS-23684 getmethod to querymethod replacement
		//var refs2After = packObject.getClassificationProductLinks(classificationType2).toArray();
		var refs2After = packObject.queryClassificationProductLinks(classificationType2).asList("2000").toArray();
		var ref1LengthAfter = refs1After.length;
		var ref2LengthAfter = refs2After.length;
      //  logger.info("REPUBLISH: SearchApprovalAction_Inbound to SearchProcessor for packObject="+packObject.getID()+", currentObject="+currentObject.getID());
		trigger.republish(packObject);
		bsLib.triggerNodeForProcessor(currentObject, trigger, "FilterForSearchProcessor", packObject, logger,
															"SearchApprovalAction_Inbound for packObject="+packObject.getID()+" currentObject="+currentObject.getID());
	}
	for( var tmObj in Iterator(pushPhList)){
		var PHTriggerCheck = tmObj.getValue("PHProcessorTriggerFlag").getSimpleValue();
		if(PHTriggerCheck == "" || PHTriggerCheck == null){
			var country = tmObj.getValue("Country_TM").getSimpleValue();
			var lookupTableHome = manager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
			var regionCheck = lookupTableHome.getLookupTableValue("GlobalRegionSplit",country);
           // logger.info("REPUBLISH: SearchApprovalAction_Inbound for region "+regionCheck +"for tmObj=" +tmObj.getID()+", currentObject="+currentObject.getID());
			if(regionCheck == "NA"){
				phTrigger.republish(tmObj);
				bsLib.triggerNodeForProcessor(currentObject, phTrigger, "PHEventProcessor", tmObj, logger,
															"SearchApprovalAction_Inbound for tmObj="+tmObj.getID()+" currentObject="+currentObject.getID());
			}
			else if(regionCheck == "AMAE"){
				phtrigger.republish(tmObj);
				bsLib.triggerNodeForProcessor(currentObject, phtrigger, "AMAPHEventProcessor", tmObj, logger,
															"SearchApprovalAction_Inbound for tmObj="+tmObj.getID()+" currentObject="+currentObject.getID());
			}
			else if(regionCheck == "AMAW"){
				amaWTrigger.republish(tmObj);
				bsLib.triggerNodeForProcessor(currentObject, amaWTrigger, "AMAWPHEventProcessor", tmObj, logger,
															"SearchApprovalAction_Inbound for tmObj="+tmObj.getID()+" currentObject="+currentObject.getID());
			}
			else if(regionCheck == "LA1"){
				la1Trigger.republish(tmObj);
				bsLib.triggerNodeForProcessor(currentObject, la1Trigger, "LAPHEventProcessor", tmObj, logger,
															"SearchApprovalAction_Inbound for tmObj="+tmObj.getID()+" currentObject="+currentObject.getID());
			}
			else if(regionCheck == "LA2"){
				la2Trigger.republish(tmObj);
				bsLib.triggerNodeForProcessor(currentObject, la2Trigger, "LA2PHEventProcessor", tmObj, logger,
															"SearchApprovalAction_Inbound for tmObj="+tmObj.getID()+" currentObject="+currentObject.getID());
			}
			else if(regionCheck == "EU1"){
				eu1Trigger.republish(tmObj);
				bsLib.triggerNodeForProcessor(currentObject, eu1Trigger, "EUPHEventProcessor", tmObj, logger,
															"SearchApprovalAction_Inbound for tmObj="+tmObj.getID()+" currentObject="+currentObject.getID());
			}
			else if(regionCheck == "EU2"){
				eu2Trigger.republish(tmObj);
				bsLib.triggerNodeForProcessor(currentObject, eu2Trigger, "EU2PHEventProcessor", tmObj, logger,
            												"SearchApprovalAction_Inbound for tmObj="+tmObj.getID()+" currentObject="+currentObject.getID());
			}
		}
		else if(PHTriggerCheck == "G11 Update" || PHTriggerCheck == "IOPT Update"){
			tmObj.getValue("PHProcessorTriggerFlag").setSimpleValue("eSufficiency or BaseSufficiency Changes");
		}
	}
	//To remove Target Market from appproved products by deleting the Approved National product references
	
	//SS-23684 getmethod to querymethod replacement
	//var tmCustomerClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("TMtoCSProducts");
	var tmCustomerClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("TMtoCSProducts");
	
	//SS-23684 getmethod to querymethod replacement
	//var nationalClassificationType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("FPCtoNationalProducts");
	var nationalClassificationType = manager.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID("FPCtoNationalProducts");
	
	//SS-23684 getmethod to querymethod replacement
	//var custSpecificTMRefs = targetMarket.getClassificationProductLinks(tmCustomerClassificationType).toArray();
	var custSpecificTMRefs = targetMarket.queryClassificationProductLinks(tmCustomerClassificationType).asList("2000").toArray();
	
	//SS-23684 getmethod to querymethod replacement
	//var nationalTMRefs = targetMarket.getClassificationProductLinks(nationalClassificationType).toArray();
	var nationalTMRefs = targetMarket.queryClassificationProductLinks(nationalClassificationType).asList("2000").toArray();
	//To remove Approved National product references
	for each(var approvedRef in nationalTMRefs){
		var classificationID = approvedRef.getClassification().getID();
		if(classificationID.startsWith("National_Products_")){
			approvedRef.delete();
		}
	}
}
function PopulatePGPBaseSufficiency(obj){
	var baseMetSalesArea=obj.getValue("SalesAreaStatusTM").getSimpleValue();
	var salesAreaMetArray = new Array();
	if(baseMetSalesArea!=null && baseMetSalesArea!=""){
		salesAreaMetArray = baseMetSalesArea.split("<multisep/>");
	}
	for each(var met in salesAreaMetArray){
		if(met=="CA01" || met=="US61") {
			obj.getValue("PGPBaseSufficiency").setSimpleValue("Yes");
		}
	}
}
//logger.info("END: SearchApprovalAction_Inbound "+currentObject.getID());
