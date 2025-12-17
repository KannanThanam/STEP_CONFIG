/**
-------------------------------------------------------------------------------------------------------------
Change History
-------------------------------------------------------------------------------------------------------------
PIM_BRA_POAtoTM_Value_Copy
-------------------------------------------------------------------------------------------------------------
Aravinth | 0.0.1 | 11/11/2024 | SS-18186 | POA to TM context-based value copy logic valid for TM
Aravinth | 0.0.2 | 04|08|2025 
Aravinth | 0.0.3|25-08-2025 | RITM7315118
Aravinth | 0.0.4|19-09-2025 | RITM7393084
Aravinth | 0.0.5 | 29-09-2025 |RITM7399501
Aravinth | 0.0.6 | 30-10-2025 

SATHIYASEELAN.S | 0.0.3| 06/10/2025 |RITM7398922-Restriction on Length for the Directions Attribute
-------------------------------------------------------------------------------------------------------------
 **/
var poaCount = 0;
var targetMarketCount = 0;
var creationDate = utilbase.getFormattedDate();
var poaCurrentStatus = "";

if (node.getObjectType().getID() == "POAObjectType") {
    warrentyDescCopyLogic(node, manager, logger);
    var ReferencedFPCID = getReferencedBy(node, manager, logger);

    var poaCountriesRaw = utilbase.getAttributeMultiLOVValuesUtils(node, "POACountries", manager, logger);
    var poaCountries = poaCountriesRaw ? poaCountriesRaw.split(",") : [];
    var poaLanguagesRaw = utilbase.getAttributeMultiLOVValuesUtils(node, "PIM_POALanguages_Artwork", manager, logger);
    var poaLanguages = poaLanguagesRaw ? poaLanguagesRaw.split(",") : [];

    var brandTypes = [
        "OPEN STOCK", "LARGE COUNT PACK BILL AS PALLET", "LARGE COUNT PACK BILL AS EACH",
        "SINGLE ITEM DISPLAY LESS THAN PALLET", "SINGLE ITEM DISPLAY PALLET",
        "SPECIAL PACK DISPLAY PALLET", "SPECIAL PACK", "SPECIAL PACK DISPLAY LESS THAN PALLET",
        "EXPORT PRODUCT ONLY"
    ];

    ReferencedFPCID.forEach(function(SourceNode) {
        if (!SourceNode.getValue("ITGTIN").getSimpleValue())
            return true;

        var FPCchildren = SourceNode.queryChildren();
        FPCchildren.forEach(function(TargetMarketId) {
            if (TargetMarketId.getObjectType().getID() != "FPC_TM")
                return true;

            var lifeCycle = String(TargetMarketId.getValue("LifeCycleStageCalc").getSimpleValue());
            var globalRegion = TargetMarketId.getValue("GlobalRegion").getSimpleValue();
            var materialSubType = TargetMarketId.getValue("MaterialSubType").getSimpleValue();
            var brandType = TargetMarketId.getValue("Brandtype").getSimpleValue();

            if (!(materialSubType && materialSubType.toUpperCase().includes("OPEN STOCK")))
                return true;
            if (["6.Inactive", "7.Historical"].includes(lifeCycle))
                return true;
            if ((globalRegion == "AMAE" || globalRegion == "AMAW") && lifeCycle == "5.Remnant/Last order")
                return true;

            if (globalRegion == "NA") {
                if (!brandTypes.includes(String(brandType)))
                    return true;
            }
            if (globalRegion == "EU") {            	
                var dueDate = TargetMarketId.getValue("DueDate").getSimpleValue();
                if (!dueDate || !artworkLib.isReadyForNextStep(dueDate)) {
                    poaCurrentStatus = "Rejected";
                    return true;
                }

                var IOPTSOSDate = TargetMarketId.getValue("IOPTSOSDate").getSimpleValue();
                var CustomizationType = TargetMarketId.getValue("CustomizationType").getSimpleValue();
                
                if (!IOPTSOSDate || CustomizationType)
                    return true;
            }

            // Update targetMarketCount for LA
            if (globalRegion == "LA"){
                targetMarketCount = 0;
            }else{
                targetMarketCount++;
            }
		
            processTargetMarket(TargetMarketId, globalRegion);

            return true;
        });
        return true;
    });
        //INC14405261    
	if (poaCurrentStatus) {
	    node.getValue("PrefillWFStatus").setSimpleValue("Rejected");
	}
}

function processTargetMarket(TargetMarketId, region) {
    var TMCountry = TargetMarketId.getValue("Country_TM").getSimpleValue();

    poaCountries.forEach(function(poaCountry) {
        if (poaCountry.length != 2 && poaCountry.length != 3 )
            return true;
            
        var LookupTableValue = lookupTableHome.getLookupTableValue("PIM_Artwork_GlobalContext", poaCountry);
        if (!LookupTableValue || LookupTableValue.length() <= 3)
            return true;

        var splitLanguages = LookupTableValue.split(",");

        splitLanguages.forEach(function(lang) {
            var langContext = (lang == "English") ? "Context1" : (lang == "French") ? "Context3" : lang;

            if (!poaLanguages.includes(String(lang)))
                return true;
            if (poaCountry != TMCountry)
                return true;

            TargetMarketId.getValue("PIM_TM_POALanguages_Artwork").setSimpleValue(LookupTableValue);

            var eligible = artworkLib.poatotmCopylogicCheck(TargetMarketId, manager, lookupTableHome, logger);
            if (!eligible)
                return true;

            if(region == "NA"){            	
            	var ValidationResult = validateAndInitiateCATM(TargetMarketId, manager, logger);
                   if (!ValidationResult)
                   return true;
            }

            var prefillStatus = TargetMarketId.getValue("PrefillWFStatus").getSimpleValue();
            var manualApproval = TargetMarketId.getValue("PIM_LastManualApprovalDate").getSimpleValue();
            if (!prefillStatus && !manualApproval) {           	
                applyContextCopyLogic(TargetMarketId, lang, region);
                TargetMarketId.getValue("PIM_atr_Task_TaskCreationDate").setSimpleValue(creationDate);
				if(TMCountry == "GB"){
					TargetMarketId.getValue("PIM_atr_Task_Language").setSimpleValue("English");      
				}else{
					TargetMarketId.getValue("PIM_atr_Task_Language").setSimpleValue(LookupTableValue);                
				}					
            } else {
                applyContextCopyLogicUpdate(TargetMarketId, lang, region);                
            }

             // POA language copy context based logic by region
            if (region == "EU" && poaCount == 0) {  
            	if(TMCountry == "GB"){
            		artworkLib.poaEnglishtoOtherContextValueUpdateUKEU(node, manager, logger)       	
            	}else{
                	artworkLib.poaEnglishtoOtherContextValueUpdateEU(node, manager, logger);
            	}
                poaCount++;
            }
            
            var wfName = artworkLib.getRegionWorkflowName(region);           
            if(!prefillStatus && !manualApproval) {
            		triggerWorkflow(TargetMarketId, node);
            }else{
	            if (artworkLib.prefillWorkflowinitiationCheck(TargetMarketId, wfName, lookupTableHome, manager, logger)) {                	
	                    triggerWorkflow(TargetMarketId, node);
	                }
            }

            // SS-22504 and link creation
            TargetMarketId.getValue("PIM_atr_Latest_POA_number").setSimpleValue(node.getValue("POANumber").getSimpleValue());
            TargetMarketId.getValue("TM_Artwork_POA_Number").setSimpleValue(" ");
            POAReferenceTMtoFPCLink(TargetMarketId, manager, logger, "FPC_to_POA");
        });
    });
}

function applyContextCopyLogic(TargetMarketId, language, region) {
    switch (String(region)) {
        case "NA":
        case "LA":
            contextbasedCopyValue(TargetMarketId, manager, language, node, logger);
            break;
        case "EU":
            artworkLib.contextbasedCopyValueEU(node, TargetMarketId, manager, language, lookupTableHome, logger);
            break;
        case "AMAE":
        case "AMAW":
            artworkLib.contextbasedCopyValueAMA(node, TargetMarketId, manager, language, lookupTableHome, logger);
            break;
    }
    utilbase.createReference(TargetMarketId, node, "FPC_to_POA", manager, logger);
}

function applyContextCopyLogicUpdate(TargetMarketId, language, region) {

    switch (String(region)) {
        case "NA":
        case "LA":
            contextbasedCopyValueUpdates(TargetMarketId, manager, language, node, logger);
            break;
        case "EU":
            artworkLib.contextbasedCopyValueUpdatesEU(node, TargetMarketId, manager, language, lookupTableHome, logger);
            break;
        case "AMAE":
        case "AMAW":
            artworkLib.contextbasedCopyValueUpdatesAMA(node, TargetMarketId, manager, language, lookupTableHome, logger);
            break;
    }
    utilbase.createReference(TargetMarketId, node, "FPC_to_POA", manager, logger);
}


// POA to Target Market context based value copy logic
function contextbasedCopyValue(targetNode, manager, LanguageValue, sourceNode, Logger) {
    if (LanguageValue == "English") {
        LanguageValue = "Context1";
    }
    if (LanguageValue == "French") {
        LanguageValue = "Context3";
    }
    if (targetNode.getValue("Country_TM").getSimpleValue() == "CA") {
        LanguageValue = "Context1";
    }
    manager.executeInContext(LanguageValue, function(demanager) {
        var contextObject = demanager.getObjectFromOtherManager(targetNode);
        var POAId = demanager.getObjectFromOtherManager(sourceNode);

        //SS-23656 && // SS-23937
        var assemblyInstructions = POAId.getValue("AssemblyInstructions").getSimpleValue();
        var WarningInformation = POAId.getValue("WarningInformation").getSimpleValue();
        var productUse = POAId.getValue("ProductUse").getSimpleValue();
        var consumerCareStatement = POAId.getValue("ConsumerCareStatement").getSimpleValue()
        var distributionStatement = POAId.getValue("DistributionStatement").getSimpleValue()
        var importerStatement = POAId.getValue("ImporterStatement").getSimpleValue()
        var nutritionFacts = POAId.getValue("NutritionFacts").getSimpleValue()
        var warrantyDescription = POAId.getValue("WarrantyDescription").getSimpleValue();
        var consumerGuarantee = POAId.getValue("ConsumerGuarantee").getSimpleValue();
        var DrugIdentificationNumber = POAId.getValue("DrugIdentificationNumber").getSimpleValue()
        var naturalHealthNumber = POAId.getValue("NaturalHealthProductsNumber").getSimpleValue()

        if (assemblyInstructions != null) {
            POAId.getValue("AssemblyRequired").setLOVValueByID("Y");
        } else {
            POAId.getValue("AssemblyRequired").setLOVValueByID("N");
        }
        if (DrugIdentificationNumber) {
            if (DrugIdentificationNumber.contains("DIN")) {
                var inputString = "" + DrugIdentificationNumber + "";
                var DrugIdentificationNumberFilter = fetchNumbersAfterPrefix(inputString, "DIN ")
                POAId.getValue("DrugIdentificationNumber").setSimpleValue(DrugIdentificationNumberFilter)
            } else if (!DrugIdentificationNumber) {
                POAId.getValue("DrugIdentificationNumber").setSimpleValue("")
            }
        }

        if (naturalHealthNumber) {
            if (naturalHealthNumber.contains("NPN")) {
                var inputString = "" + naturalHealthNumber + "";
                var naturalHealthNumberFilter = fetchNumbersAfterPrefix(inputString, "NPN ")
                POAId.getValue("NaturalHealthProductsNumber").setSimpleValue(naturalHealthNumberFilter)
            } else if (!naturalHealthNumber) {
                POAId.getValue("NaturalHealthProductsNumber").setSimpleValue("")
            }
        }

        POAId.getValue("Warnings").setSimpleValue(WarningInformation);
        var DrugFacts = POAId.getValue("DrugFacts").getSimpleValue();
        if (DrugFacts != null && DrugFacts != "") { //Defect3873
            POAId.getValue("DrugFactQuestions?").setSimpleValue(consumerCareStatement)
        }
        //SS-24418
        if (distributionStatement) {
            POAId.getValue("ConsumerCareReturnAddress").setSimpleValue(distributionStatement)
        } else if (importerStatement) {
            POAId.getValue("ConsumerCareReturnAddress").setSimpleValue(importerStatement)
        }

        if (nutritionFacts) {
            if (nutritionFacts.contains("Nutrition")) {
                POAId.getValue("PanelType").setSimpleValue("Nutrient")
            } else if (nutritionFacts.contains("Supplement")) {
                POAId.getValue("PanelType").setSimpleValue("Supplement")
            }
        }

        //SS-23650
        POAId.getValue("NumberofBlades").setSimpleValue(contextObject.getValue("TM_NumberofBlades").getSimpleValue());
        POAId.getValue("MadeIn1").setSimpleValue(POAId.getValue("MadeIn").getSimpleValue());

        // set value for IndicationUses attribute
        POAId.getValue("IndicationsUses").setSimpleValue(productUse)
        if (productUse == null) {
            POAId.getValue("IndicationsUses").setSimpleValue("N/A")
        }

        //SS-26231
        var UsageInstructionsTemp = artworkLib.NADirectionsPrefixRemoval(POAId, lookupTableHome, "UsageInstructions", manager, logger)
        var PreparationInstructionsTemp = artworkLib.NADirectionsPrefixRemoval(POAId, lookupTableHome, "PreparationInstructions", manager, logger)
        var AssemblyInstructionsTemp = artworkLib.NADirectionsPrefixRemoval(POAId, lookupTableHome, "AssemblyInstructions", manager, logger)

        // set direction attribute value
         //RITM7398922- Start
        if (UsageInstructionsTemp != null && UsageInstructionsTemp != "N/A" && UsageInstructionsTemp != "" &&UsageInstructionsTemp.length() <= 6000) {
            POAId.getValue("Directions").setSimpleValue(UsageInstructionsTemp);
        } else if (UsageInstructionsTemp == null || UsageInstructionsTemp == "N/A" || UsageInstructionsTemp == "" || UsageInstructionsTemp.length() >6000) {
            if (PreparationInstructionsTemp != null && PreparationInstructionsTemp != "N/A" && PreparationInstructionsTemp != "" && PreparationInstructionsTemp.length() <=6000) {
                POAId.getValue("Directions").setSimpleValue(PreparationInstructionsTemp)
            } else if( AssemblyInstructionsTemp && AssemblyInstructionsTemp.length() <=6000) {            	
                POAId.getValue("Directions").setSimpleValue(AssemblyInstructionsTemp);
            }else if (!AssemblyInstructionsTemp){
            	  POAId.getValue("Directions").setSimpleValue(AssemblyInstructionsTemp);
            }
        }//RITM7398922- End

        //SS-25740
        if (contextObject.getValue("GlobalRegion").getSimpleValue() == "LA") {
            LAPrefixRemoval(POAId, "Warnings", logger);
            LAPrefixRemoval(POAId, "Directions", logger);
        }
        // SS-25978 & SS-25984
        if (contextObject.getValue("GlobalRegion").getSimpleValue() == "NA") {
            //SS-25966
            AddEndingPeriodToDirections(POAId, logger);
            NAWarningsPrefixRemoval(POAId, logger);
            //SS-26020
            artworkLib.setDrugFactsQuestions(POAId, lookupTableHome, manager, logger);
        }
        //SS-25698
        tmManufacturersAddressValueSet(POAId, contextObject, manager, logger);
        //SS-25692
        var globalRegion = contextObject.getValue("GlobalRegion").getSimpleValue();
        if (globalRegion == "NA" || globalRegion == "LA") {
            if (targetMarketCount == 1) {
                var ingValue = IngredientValueDerivation(POAId, contextObject, manager, logger);
                POAId.getValue("Ingredients").setSimpleValue(ingValue);
            }
        }
        //SS-25972
        var ActiveIngredientValue = POAId.getValue("ActiveIngredients").getSimpleValue();
        if (ActiveIngredientValue) {
            var activeIngredientPrefixRemoval = ingredientPrefixRemoval(POAId, contextObject, "ActiveIngredients", ActiveIngredientValue, logger);
            POAId.getValue("ActiveIngredients").setSimpleValue(activeIngredientPrefixRemoval);
        }

        //SS-26520 && SS-26505
        artworkLib.FreeFromStatementValueSet(POAId, contextObject, logger);

        var TMCountryId = node.getValue("Country_TM").getSimpleValue();
        var POAAttributeGroupId = utilbase.getAttributeSetFromAttributeGroup("PIM_AGR_POA_BR_ATTRGRP", manager, logger);
        POAAttributeGroupId.forEach(function(POAAttributeID) {
            var TargetMarketEditable = "TM_" + POAAttributeID.getID();
            var TargetMarketReadOnly = "TM_" + POAAttributeID.getID() + "_RO";

            if (TargetMarketReadOnly == "TM_AdditionalProductVariantInformation_RO") TargetMarketReadOnly = "TM_AdditionalProductVariantInforma_RO";
            if (TargetMarketReadOnly == "TM_IsTheProductLiquidInDoubleSealContainer?_RO") TargetMarketReadOnly = "TM_IsTheProductLiquidInDoubleSealCont_RO";
            if (TargetMarketReadOnly == "TM_EnvironmentalStatements_ConsumerItem_RO") TargetMarketReadOnly = "TM_EnvironmentalStatements_Consumer_RO";
            if (TargetMarketEditable == "TM_IsTheProductLiquidInDoubleSealContainer?") TargetMarketEditable = "TM_IsTheProductLiquidInDoubleSealContain";
            
            var POAAttrValue = POAId.getValue(POAAttributeID.getID()).getSimpleValue();
            if (contextObject.getValue(TargetMarketReadOnly).getSimpleValue() == null) {
                //Editable attributes
                var tmAttrValueContext = contextObject.getValue(TargetMarketEditable).getSimpleValue();
                if (POAAttrValue) {
                    var attrHomeId = manager.getAttributeHome().getAttributeByID(TargetMarketEditable);
                    var isLOVAtt = attrHomeId.hasLOV();
                    if ((tmAttrValueContext != null) && (tmAttrValueContext != POAAttrValue) && (POAAttrValue != "N/A") && (!isLOVAtt)) {
                        if (tmAttrValueContext.indexOf(POAAttrValue) == -1) {
                            if (tmAttrValueContext == "N/A") {
                                var concatValueTmEdit = POAAttrValue;
                            } else {
                                var concatValueTmEdit = tmAttrValueContext + " | " + POAAttrValue;
                            }
                            //   contextObject.getValue(TargetMarketEditable).setSimpleValue(concatValueTmEdit);
                        } else {
                            //  contextObject.getValue(TargetMarketEditable).setSimpleValue(POAAttrValue);
                        }

                    } else {
                        //contextObject.getValue(TargetMarketEditable).setSimpleValue(POAAttrValue);
                    }
                    //  contextObject.getValue(TargetMarketReadOnly).setSimpleValue(POAAttrValue);
                }
            }
            return true;
        });
        derivationAttributeValueSet(contextObject, POAId, manager, logger);
        //artworkLib.PopulateNAforBlank(contextObject, POAId, "PIM_AGR_POA_PopulateNAforBlank", "PIM_AGR_PopulateNAforBlank", lookupTableHome, manager, logger) //SS-25243
        artworkLib.ConsumerCareReturnAddress(contextObject, POAId, logger); //SS-26240
    });
}

//POA to TargetMarket Copy updates
function contextbasedCopyValueUpdates(targetNode, manager, LanguageValue, sourceNode, Logger) {
    var concatValue = "";
    var concatValueNA_LA = "";
    var concatValueAMA = "";
    var concatValueEU = "";
    var concatValueNA_LAEo = "";
    var concatValueAMAEo = "";
    var concatValueEUEo = "";
    var concatValueLAEo = "";
    var concatValueLA = "";
    var flagRegion;

    if (LanguageValue == "English") {
        LanguageValue = "Context1";
    }
    if (LanguageValue == "French") {
        LanguageValue = "Context1";
    }
    if (targetNode.getValue("Country_TM").getSimpleValue() == "CA") {
        LanguageValue = "Context1";
    }

    manager.executeInContext(LanguageValue, function(demanager) {
        var contextObject = demanager.getObjectFromOtherManager(targetNode);
        var POAId = demanager.getObjectFromOtherManager(sourceNode);
        var TMCountryId = targetNode.getValue("Country_TM").getSimpleValue();

        //SS-23656 && // SS-23937
        var assemblyInstructions = POAId.getValue("AssemblyInstructions").getSimpleValue();
        var WarningInformation = POAId.getValue("WarningInformation").getSimpleValue();
        var productUse = POAId.getValue("ProductUse").getSimpleValue()
        var consumerCareStatement = POAId.getValue("ConsumerCareStatement").getSimpleValue()
        var distributionStatement = POAId.getValue("DistributionStatement").getSimpleValue()
        var importerStatement = POAId.getValue("ImporterStatement").getSimpleValue()
        var nutritionFacts = POAId.getValue("NutritionFacts").getSimpleValue()
        var DrugIdentificationNumber = POAId.getValue("DrugIdentificationNumber").getSimpleValue()
        var naturalHealthNumber = POAId.getValue("NaturalHealthProductsNumber").getSimpleValue()

        if (assemblyInstructions != null) {
            POAId.getValue("AssemblyRequired").setLOVValueByID("Y");
        } else {
            POAId.getValue("AssemblyRequired").setLOVValueByID("N");
        }

        POAId.getValue("Warnings").setSimpleValue(WarningInformation);
        var DrugFacts = POAId.getValue("DrugFacts").getSimpleValue();
        if (DrugFacts != null && DrugFacts != "") { //Defect3873
            POAId.getValue("DrugFactQuestions?").setSimpleValue(consumerCareStatement)
        }
        //SS-24418
        if (distributionStatement) {
            POAId.getValue("ConsumerCareReturnAddress").setSimpleValue(distributionStatement)
        } else if (importerStatement) {
            POAId.getValue("ConsumerCareReturnAddress").setSimpleValue(importerStatement)
        }

        if (nutritionFacts) {
            if (nutritionFacts.contains("Nutrition")) {
                POAId.getValue("PanelType").setSimpleValue("Nutrient")
            } else if (nutritionFacts.contains("Supplement")) {
                POAId.getValue("PanelType").setSimpleValue("Supplement")
            }
        }

        if (DrugIdentificationNumber) {
            if (DrugIdentificationNumber.contains("DIN")) {
                var inputString = "" + DrugIdentificationNumber + "";
                var DrugIdentificationNumberFilter = fetchNumbersAfterPrefix(inputString, "DIN ")
                POAId.getValue("DrugIdentificationNumber").setSimpleValue(DrugIdentificationNumberFilter)
            } else if (!DrugIdentificationNumber) {
                POAId.getValue("DrugIdentificationNumber").setSimpleValue("")
            }
        }

        if (naturalHealthNumber) {
            if (naturalHealthNumber.contains("NPN")) {
                var inputString = "" + naturalHealthNumber + "";
                var naturalHealthNumberFilter = fetchNumbersAfterPrefix(inputString, "NPN ")
                POAId.getValue("NaturalHealthProductsNumber").setSimpleValue(naturalHealthNumberFilter)
            } else if (!naturalHealthNumber) {
                POAId.getValue("NaturalHealthProductsNumber").setSimpleValue("")
            }
        }

        //SS-23650
        POAId.getValue("NumberofBlades").setSimpleValue(contextObject.getValue("TM_NumberofBlades").getSimpleValue());
        POAId.getValue("MadeIn1").setSimpleValue(POAId.getValue("MadeIn").getSimpleValue());

        // set value for IndicationUses attribute
        POAId.getValue("IndicationsUses").setSimpleValue(productUse)
        if (productUse == null) {
            POAId.getValue("IndicationsUses").setSimpleValue("N/A")
        }

        //SS-26231 - set direction attribute value
        var UsageInstructionsTemp = artworkLib.NADirectionsPrefixRemoval(POAId, lookupTableHome, "UsageInstructions", manager, logger)
        var PreparationInstructionsTemp = artworkLib.NADirectionsPrefixRemoval(POAId, lookupTableHome, "PreparationInstructions", manager, logger)
        var AssemblyInstructionsTemp = artworkLib.NADirectionsPrefixRemoval(POAId, lookupTableHome, "AssemblyInstructions", manager, logger)

         //RITM7398922- Start
        if (UsageInstructionsTemp != null && UsageInstructionsTemp != "N/A" && UsageInstructionsTemp != "" &&UsageInstructionsTemp.length() <= 6000) {
            POAId.getValue("Directions").setSimpleValue(UsageInstructionsTemp);
        } else if (UsageInstructionsTemp == null || UsageInstructionsTemp == "N/A" || UsageInstructionsTemp == "" || UsageInstructionsTemp.length() >6000) {
            if (PreparationInstructionsTemp != null && PreparationInstructionsTemp != "N/A" && PreparationInstructionsTemp != "" && PreparationInstructionsTemp.length() <=6000) {
                POAId.getValue("Directions").setSimpleValue(PreparationInstructionsTemp)
            } else if( AssemblyInstructionsTemp && AssemblyInstructionsTemp.length() <=6000) {            	
                POAId.getValue("Directions").setSimpleValue(AssemblyInstructionsTemp);
            }else if (!AssemblyInstructionsTemp){
            	  POAId.getValue("Directions").setSimpleValue(AssemblyInstructionsTemp);
            }
        }//RITM7398922- End
        
        //SS-25698
        tmManufacturersAddressValueSet(POAId, contextObject, manager, logger);
        //SS-25740
        if (contextObject.getValue("GlobalRegion").getSimpleValue() == "LA") {
            LAPrefixRemoval(POAId, "Warnings", logger);
            LAPrefixRemoval(POAId, "Directions", logger);
        }

        // SS-25978 & SS-25984
        if (contextObject.getValue("GlobalRegion").getSimpleValue() == "NA") {
            //SS-25966
            AddEndingPeriodToDirections(POAId, logger);
            NAWarningsPrefixRemoval(POAId, logger);
            //SS-26020
            artworkLib.setDrugFactsQuestions(POAId, lookupTableHome, manager, logger)
        }

        //SS-25692
        var globalRegion = contextObject.getValue("GlobalRegion").getSimpleValue();
        if (globalRegion == "NA" || globalRegion == "LA") {
            if (targetMarketCount == 1) {
                var ingValue = IngredientValueDerivation(POAId, contextObject, manager, logger);
                POAId.getValue("Ingredients").setSimpleValue(ingValue);
            }
        }
        //SS-25972
        var ActiveIngredientValue = POAId.getValue("ActiveIngredients").getSimpleValue();
        if (ActiveIngredientValue) {
            var activeIngredientPrefixRemoval = ingredientPrefixRemoval(POAId, contextObject, "ActiveIngredients", ActiveIngredientValue, logger);
            POAId.getValue("ActiveIngredients").setSimpleValue(activeIngredientPrefixRemoval);
        }

        //SS-26520 && SS-26505
        artworkLib.FreeFromStatementValueSet(POAId, contextObject, logger);

        var POAAttributeGroupId = utilbase.getAttributeSetFromAttributeGroup("PIM_AGR_POA_BR_ATTRGRP", manager, logger);
        POAAttributeGroupId.forEach(function(POAAttributeID) {
            var TargetMarketEditable = "TM_" + POAAttributeID.getID();
            var TargetMarketReadOnly = "TM_" + POAAttributeID.getID() + "_RO";
            
            if (TargetMarketReadOnly == "TM_AdditionalProductVariantInformation_RO") TargetMarketReadOnly = "TM_AdditionalProductVariantInforma_RO";
            if (TargetMarketReadOnly == "TM_IsTheProductLiquidInDoubleSealContainer?_RO") TargetMarketReadOnly = "TM_IsTheProductLiquidInDoubleSealCont_RO";
            if (TargetMarketReadOnly == "TM_EnvironmentalStatements_ConsumerItem_RO") TargetMarketReadOnly = "TM_EnvironmentalStatements_Consumer_RO";
            if (TargetMarketEditable == "TM_IsTheProductLiquidInDoubleSealContainer?") TargetMarketEditable = "TM_IsTheProductLiquidInDoubleSealContain";

            var POAAttrValue = POAId.getValue(POAAttributeID.getID()).getSimpleValue();
            if (POAAttrValue != null) {
                //SS-22901
                var attributeNodeEo = manager.getAttributeHome().getAttributeByID(TargetMarketEditable);
                var checkNALAEo = attributeRegionCheck(node, manager, attributeNodeEo.getID(), "PIM_AGR_TM_EO_HarryLA_NA", logger, flagRegion);
                var checkLAEo = attributeRegionCheck(node, manager, attributeNodeEo.getID(), "PIM_AGR_TM_EO_HarryLA", logger, flagRegion);

                var tmAttrValueContext = contextObject.getValue(TargetMarketEditable).getSimpleValue();
                var tmAttrValueContextRO = contextObject.getValue(TargetMarketReadOnly).getSimpleValue();
                var attrHomeId = manager.getAttributeHome().getAttributeByID(TargetMarketEditable);
                var isLOVAtt = attrHomeId.hasLOV();
                if (!isLOVAtt) {
                    //Editable attributes
                    if ((tmAttrValueContext != null) && (tmAttrValueContext != POAAttrValue) && (POAAttrValue != "N/A")) {
                        if (tmAttrValueContext.indexOf(POAAttrValue) == -1) {
                            if (tmAttrValueContext == "N/A") {
                                var concatValueTmEdit = POAAttrValue;
                            } else {
                                var concatValueTmEdit = tmAttrValueContext + " | " + POAAttrValue;
                            }
                            //contextObject.getValue(TargetMarketEditable).setSimpleValue(concatValueTmEdit);
                            if (checkNALAEo == "Passed") {
                                concatValueNA_LAEo += attributeNodeEo.getName().concat(";")
                            }
                            if (checkLAEo == "Passed") {
                                concatValueLAEo += attributeNodeEo.getName().concat(";")
                            }
                        }
                    }
                    //readonly attributes
                    if ((tmAttrValueContextRO != null) && (tmAttrValueContextRO != POAAttrValue) && (POAAttrValue != "N/A")) {
                        if (tmAttrValueContextRO.indexOf(POAAttrValue) == -1) {
                            if (tmAttrValueContextRO == "N/A") {
                                var concatValueTmRO = POAAttrValue;
                            } else {
                                var concatValueTmRO = tmAttrValueContextRO + " | " + POAAttrValue;
                            }
                            //  contextObject.getValue(TargetMarketReadOnly).setSimpleValue(concatValueTmRO);
                        }

                    }
                } else {
                    // contextObject.getValue(TargetMarketEditable).setSimpleValue(POAAttrValue);
                    // contextObject.getValue(TargetMarketReadOnly).setSimpleValue(POAAttrValue);
                }
                if (tmAttrValueContext == null || tmAttrValueContext == "N/A") {
                    //RITM7398922 start
	              if(TargetMarketEditable == "TM_Directions" && POAAttrValue.length() <=6000){
	          		contextObject.getValue(TargetMarketEditable).setSimpleValue(POAAttrValue);
				 }else{
					contextObject.getValue(TargetMarketEditable).setSimpleValue(POAAttrValue);
				 }//RITM7398922 End
				 
                    if (checkNALAEo == "Passed") {
                        concatValueNA_LAEo += attributeNodeEo.getName().concat(";")
                    }
                    if (checkLAEo == "Passed") {
                        concatValueLAEo += attributeNodeEo.getName().concat(";")
                    }
                }
                if (tmAttrValueContextRO == null || tmAttrValueContextRO == "N/A") {
                    //contextObject.getValue(TargetMarketReadOnly).setSimpleValue(POAAttrValue);
                }

                return true;
            }

        });

        concatValue = concatValue.slice(0, -1);
        concatValueNA_LA = concatValueNA_LAEo.slice(0, -1);
        concatValueLA = concatValueLAEo.slice(0, -1);

        contextObject.getValue("PIM_atr_LatestPOAUpdatedAttrName_NA/LA").setSimpleValue(concatValueNA_LA);
        contextObject.getValue("PIM_atr_LatestPOAUpdatedAttrName_LA").setSimpleValue(concatValueLA);
        contextObject.getValue("PIM_atr_LatestPOAUpdatedAttrName").setSimpleValue(concatValue);

        derivationAttributeValueSet(contextObject, POAId, manager, logger);
        //artworkLib.PopulateNAforBlank(contextObject, POAId, "PIM_AGR_POA_PopulateNAforBlank", "PIM_AGR_PopulateNAforBlank", lookupTableHome, manager, logger) //SS-25243
        artworkLib.ConsumerCareReturnAddress(contextObject, POAId, logger); //SS-26240
    });

}

function getReferencedBy(node, manager, logger) {
    var results = [];
    var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("FPCToPOA");
    var referenceList = node.getReferencedBy();
    var referenceIterator = referenceList.iterator();
    while (referenceIterator.hasNext()) {
        var POA_FPCref = referenceIterator.next().getSource();
        results.push(POA_FPCref)
    }
    return results;
}

function triggerWorkflow(node, targetNode) {
    var instance = node.getWorkflowInstanceByID("PIM_WF_PREFILL");
    if (!(node.isInWorkflow("PIM_WF_PREFILL"))) {
        node.startWorkflowByID("PIM_WF_PREFILL", "Initiated in to Prefill enrichment workflow");
    }else{
		if(targetNode.getValue("PrefillWFStatus").getSimpleValue() != "MovetoOnHold"){
			artworkLib.postProcessingUpdate(node, lookupTableHome, manager, logger);
    	     }
	}
}

// attribute region check
function attributeRegionCheck(node, manager, attrName, attrGrp, logger, flagRegion) {
    var regionAttrGrp = utilbase.getAttributeSetFromAttributeGroup(attrGrp, manager, logger); //PIM_AGR_TM_EO_Harry_AMA
    var regionAttrsArray = regionAttrGrp.iterator();
    while (regionAttrsArray.hasNext()) {
        var regionAttrID = regionAttrsArray.next();
        regionAttrID = regionAttrID.getID();
        if (regionAttrID == attrName) {
            flagRegion = "Passed";
        }
    }
    return flagRegion;
}

// POANumber Value Set
function POAReferenceTMtoFPCLink(node, manager, logger, ReferencedId) {
    var concatValue = " ";
    var referenceObject = manager.getReferenceTypeHome().getReferenceTypeByID(ReferencedId); //FPC_to_POA
    var referenceNode = node.queryReferences(referenceObject).asList(100);
    referenceNode.forEach(function(referenceNodeTM) {
        var sourceNode = referenceNodeTM.getTarget().getValue("POANumber").getSimpleValue();
        if (sourceNode != "undefined") {
            concatValue += sourceNode.concat(";")
        }
    });
    node.getValue("TM_Artwork_POA_Number").setSimpleValue(concatValue.slice(0, -1))
}

//CA TargetMarket valudation
function validateAndInitiateCATM(node, manager, logger) {
    var result = true;
    var nodeCountry = node.getValue("Country_TM").getSimpleValue();
    if (nodeCountry == "CA") {
        var currentTMParent = node.getParent();
        var FPCchild = currentTMParent.queryChildren();
        FPCchild.forEach(function(TargetMarketId) {
            if ("FPC_TM" == TargetMarketId.getObjectType().getID()) {
                var tmCountryId = TargetMarketId.getValue("Country_TM").getSimpleValue();
                if (tmCountryId == "US") {
                    if (TargetMarketId.getValue("LifeCycleStageCalc").getSimpleValue() == "6.Inactive" ||
                        TargetMarketId.getValue("LifeCycleStageCalc").getSimpleValue() == "7.Historical") {
                        result = true;
                    } else {
                        result = false;
                    }
                }
            }
            return true;

        });
    }
    return result;
}

// value defaulting function
function derivationAttributeValueSet(node, POAId, manager, logger) {
    var usageInstructions = node.getValue("TM_UsageInstructions").getSimpleValue()
    var preparationInstructions = node.getValue("TM_PreparationInstructions").getSimpleValue()
    var assemblyInstructions = node.getValue("TM_AssemblyInstructions").getSimpleValue()
    var drugFacts = node.getValue("TM_DrugFacts").getSimpleValue()
    var consumerCareStatement = node.getValue("TM_ConsumerCareStatement").getSimpleValue()
    var productUse = node.getValue("ProductUse").getSimpleValue()
    var warrantyDescription = POAId.getValue("PIM_atr_WarrantyDescription_Flag").getSimpleValue();
    var consumerGuarantee = POAId.getValue("ConsumerGuarantee").getSimpleValue();
    var DrugIdentificationNumberTM = POAId.getValue("TM_DrugIdentificationNumber").getSimpleValue()
    // default 0
    node.getValue("TM_ChokingHazardWarning").setSimpleValue("0");
    if (consumerGuarantee) {
        var concatwarrentyDesc = warrantyDescription + " " + consumerGuarantee;
        if (warrantyDescription) {
            if (concatwarrentyDesc.indexOf(warrantyDescription) == -1) {
                POAId.getValue("WarrantyDescription").setSimpleValue(concatwarrentyDesc.replace("null", ""))
            }
        } else {
            POAId.getValue("WarrantyDescription").setSimpleValue(concatwarrentyDesc.replace("null", ""))
        }
    }

    // Default No for MultiPack attribute
    node.getValue("TM_Multipack").setLOVValueByID("N")

    //Default IstheItemSIOC? attribute value
    var productDesc = node.getValue("ProductDescription").getSimpleValue();
    if (productDesc) {
        if (productDesc.contains("SIOC")) {
            node.getValue("TM_IstheItemSIOC?").setLOVValueByID("Y")
        } else {
            node.getValue("TM_IstheItemSIOC?").setLOVValueByID("N")
        }
    }

    //SS-23650
    var ConsumerBenefit2 = node.getValue("ConsumerBenefit2").getSimpleValue();
    var category = node.getValue("Category").getSimpleValue();
    if (category == "Male Premium BladeRazor System" || category == "Female Disposable Razor" || category == "Male Disposable Razor" || category == "Fem Premium BladeRazor System") {
        if (!isNaN(ConsumerBenefit2)) {
            node.getValue("TM_NumberofBlades").setSimpleValue(ConsumerBenefit2);
        }
    } else {
        node.getValue("TM_NumberofBlades").setSimpleValue("");
    }

}

//set TM to POA
function warrentyDescCopyLogic(sourceNode, manager, logger) {
    var poaCountries = utilbase.getAttributeMultiLOVValuesUtils(node, "POACountries", manager, logger);
    poaCountries.split(",").forEach(function(POACountry) {
        if (POACountry.length == "2") {
            var LookupTableValue = lookupTableHome.getLookupTableValue("PIM_Artwork_GlobalContext", POACountry);
            if (LookupTableValue) {
                if ("3" < LookupTableValue.length()) {
                    var splitLanguage = LookupTableValue.split(",");
                    for (i = 0; i < splitLanguage.length; i++) {
                        var LanguageValue = splitLanguage[i];
                        var LanguageCheck = splitLanguage[i];
                        if (LanguageValue == "English") {
                            LanguageValue = "Context1";
                        }
                        if (LanguageValue == "French") {
                            LanguageValue = "Context3"
                        }
                        manager.executeInContext(LanguageValue, function(demanager) {
                            var contextObject = demanager.getObjectFromOtherManager(node);
                            var warrantyDescription = contextObject.getValue("WarrantyDescription").getSimpleValue();
                            var warrantyDescriptionflag = contextObject.getValue("PIM_atr_WarrantyDescription_Flag").getSimpleValue();
                            if (warrantyDescription && warrantyDescriptionflag) {
                                if (warrantyDescription.indexOf(warrantyDescriptionflag) == -1) {
                                    // if (warrantyDescription) {
                                    contextObject.getValue("PIM_atr_WarrantyDescription_Flag").setSimpleValue(warrantyDescription);
                                } else {
                                    // do nothing
                                }
                                //}
                            }
                            if (warrantyDescription == null) {
                                contextObject.getValue("PIM_atr_WarrantyDescription_Flag").setSimpleValue("")
                            } else if (warrantyDescriptionflag == null) {

                                contextObject.getValue("PIM_atr_WarrantyDescription_Flag").setSimpleValue(warrantyDescription);
                            }
                        })
                    }
                }
            }
        }
    })
}

function fetchNumbersAfterPrefix(inputString, prefix) {
    var startIndex = inputString.indexOf(prefix);
    if (startIndex === -1) {
        return [];
    }
    var result = "";
    var index = startIndex + prefix.length;
    while (index < inputString.length) {
        var char1 = inputString[index];

        if (/[a-zA-Z]/.test(char1)) {
            break;
        }
        if (/\d/.test(char1)) {
            result += char1.concat();
        }

        index++;
    }

    return result;
}

//FPC object Type
//Data Container value copy from FPC to TM
if (node.getObjectType().getID() == "FPC") {
    InvalidBatteryDataContainerCleanUp(node, manager, logger)
    var childArray = node.queryChildren();
    childArray.forEach(function(childFpc) {
        if (childFpc.getObjectType().getID() == "FPC_TM") {
            createandcopyDCValuesfromFPCtoTM(childFpc, manager, logger)
        }
        return true;
    })
}

function createandcopyDCValuesfromFPCtoTM(node, manager, logger) {
    utilbase.clearDataContainers(node, manager, "DC_Battery_Data", logger);
    var fpc = node.getParent()
    var dataContainerID = fpc.getDataContainerByTypeID("DC_Battery_Data")
    var dataContainerIterator = dataContainerID.getDataContainers().iterator();
    while (dataContainerIterator.hasNext()) {
        var sourceDataContainer = dataContainerIterator.next();
        var dataContainerType = sourceDataContainer.getDataContainerType();
        var dataContainerObject = sourceDataContainer.getDataContainerObject();
        var validDCAttributes = dataContainerType.getValidDescriptionAttributes().toArray();
        var dataContainerKeyValue = dataContainerObject.getValue("PIM_atr_Battery_Name_Key").getSimpleValue();
        var targetDataContainer = utilbase.createDataContainerObjectWithKey(node, "DC_Battery_Data", "PIM_atr_Battery_Name_Key", dataContainerKeyValue, manager, logger)
        //var targetDataContainer = utilbase.createDataContainerObjectWithoutKey(node, "DC_Battery_Data", manager, logger)
        validDCAttributes.forEach(function(attribute) {
            var attributeID = attribute.getID();
            var attributeValue = dataContainerObject.getValue(attributeID).getSimpleValue();
            if (attributeValue) {
                targetDataContainer.getValue(attributeID).setSimpleValue(attributeValue);
            }

        });

    }
}

// remove Invalid datacontainer row clean up
function InvalidBatteryDataContainerCleanUp(node, manager, logger) {
    var dataContainerID = node.getDataContainerByTypeID("DC_Battery_Data")
    var dataContainerIterator = dataContainerID.getDataContainers().iterator();
    while (dataContainerIterator.hasNext()) {
        var sourceDataContainer = dataContainerIterator.next();
        var dataContainerType = sourceDataContainer.getDataContainerType();
        var dataContainerObject = sourceDataContainer.getDataContainerObject();
        var attributeValue = dataContainerObject.getValue("PowerSource").getSimpleValue();
        if (attributeValue == null || attributeValue == "Not Powered" || attributeValue == "Rollup" || attributeValue == "Plug-in") {
            sourceDataContainer.deleteLocal()
        }
    }
}


// SS-24769 & //SS-25698
function tmManufacturersAddressValueSet(sourceNode, targetNode, manager, logger) {
    var ManufacturingSiteAddress = sourceNode.getValue("ManufacturingSiteAddress").getSimpleValue();
    var DistributionStatement = sourceNode.getValue("DistributionStatement").getSimpleValue();
    var ManufacturerStatement = sourceNode.getValue("ManufacturerStatement").getSimpleValue();
    if (targetNode.getValue("SubSector").getSimpleValue() == "Oral Care") {
        if (targetNode.getValue("Category").getSimpleValue() == "Power Oral Care") {
            if (ManufacturerStatement != "" && ManufacturerStatement != null) {
                var concatValue = ManufacturerStatement + "\n" + DistributionStatement;
                sourceNode.getValue("ManufacturersAddress").setSimpleValue(concatValue.replace("null", ""));
            } else if (ManufacturingSiteAddress != null) {
                var concatValue = ManufacturingSiteAddress + "\n" + DistributionStatement;
                if (concatValue != null && concatValue != "") {
                    sourceNode.getValue("ManufacturersAddress").setSimpleValue(concatValue.replace("null", ""));
                }
            } else if (DistributionStatement != null) {
                sourceNode.getValue("ManufacturersAddress").setSimpleValue(DistributionStatement.replace("null", ""));
            }
        } else {
            if (DistributionStatement != "" && DistributionStatement != null) {
                sourceNode.getValue("ManufacturersAddress").setSimpleValue(DistributionStatement);
            }
        }
    } else {
        if (ManufacturerStatement != "" && ManufacturerStatement != null) {
            sourceNode.getValue("ManufacturersAddress").setSimpleValue(ManufacturerStatement);
        } else if (ManufacturingSiteAddress != null) {
            sourceNode.getValue("ManufacturersAddress").setSimpleValue(ManufacturingSiteAddress);
        }
    }
}

//SS-24769
function IngredientValueDerivation(sourceNode, targetNode, manager, logger) {
    var poaIngredientConacatValue = "";
    var poaIngredientValue = sourceNode.getValue("Ingredients").getSimpleValue();
    if (hasLineBreak(poaIngredientValue) == true) {
        poaIngredientValue = "";
    }

    var poaInActiveIngredientValue = sourceNode.getValue("InactiveIngredientsDeclaration").getSimpleValue();
    var poaActiveIngredientValue = sourceNode.getValue("ActiveIngredients").getSimpleValue();
    if (poaIngredientValue) {
        var prefixRemovedPoaIngredientValue = ingredientPrefixRemoval(sourceNode, targetNode, "Ingredients", poaIngredientValue, logger);
    }
    if (poaInActiveIngredientValue) {
        var prefixRemovedpoaInActiveIngredientValue = ingredientPrefixRemoval(sourceNode, targetNode, "InactiveIngredientsDeclaration", poaInActiveIngredientValue, logger);
    }

    if ((poaIngredientValue != null && poaIngredientValue != "N/A") && (poaActiveIngredientValue != null && poaActiveIngredientValue != "N/A") && (poaInActiveIngredientValue != null && poaInActiveIngredientValue != "N/A")) {
        poaIngredientConacatValue = poaActiveIngredientValue + "\n" + poaInActiveIngredientValue + "\n" + poaIngredientValue;
    } else if ((poaIngredientValue != null && poaIngredientValue != "N/A") && (poaActiveIngredientValue != null && poaActiveIngredientValue != "N/A")) {
        poaIngredientConacatValue = poaActiveIngredientValue + "\n" + poaIngredientValue;
    } else if ((poaIngredientValue != null && poaIngredientValue != "N/A") && (poaInActiveIngredientValue != null && poaInActiveIngredientValue != "N/A")) {
        poaIngredientConacatValue = prefixRemovedpoaInActiveIngredientValue + "\n" + prefixRemovedPoaIngredientValue;
    } else if ((poaActiveIngredientValue != null && poaActiveIngredientValue != "N/A") && (poaInActiveIngredientValue != null && poaInActiveIngredientValue != "N/A")) {
        poaIngredientConacatValue = poaActiveIngredientValue + "\n" + poaInActiveIngredientValue;
    } else if ((poaActiveIngredientValue != null && poaActiveIngredientValue != "N/A")) {
        poaIngredientConacatValue = poaActiveIngredientValue;
    } else if ((poaInActiveIngredientValue != null && poaInActiveIngredientValue != "N/A")) {
        poaIngredientConacatValue = prefixRemovedpoaInActiveIngredientValue;
    } else if ((poaIngredientValue != null && poaIngredientValue != "N/A")) {
        poaIngredientConacatValue = prefixRemovedPoaIngredientValue;
    } else {
        //nothing to do
    }

    return poaIngredientConacatValue;
}

function hasLineBreak(value) {
    return /[\r\n]/.test(value);
}

// Ingredient Attribute NA Prefix removal function (SS-25600)
function ingredientPrefixRemoval(sourceNode, targetNode, attrID, attrValue, logger) {
    var trimval = "";
    var flag = false;
    var globalRegion = targetNode.getValue("GlobalRegion").getSimpleValue();
    var lookupTableValues = "";

    if (attrID == "ActiveIngredients") {
        lookupTableValues = lookupTableHome.getLookupTableValue("PIM_LCL_Artwork_PrefixRemoval", "ActiveIngredientNA");
    } else {
        if (globalRegion == "NA") {
            lookupTableValues = lookupTableHome.getLookupTableValue("PIM_LCL_Artwork_PrefixRemoval", "IngredientsNA");
        } else if (globalRegion == "LA") {
            lookupTableValues = lookupTableHome.getLookupTableValue("PIM_LCL_Artwork_PrefixRemoval", "IngredientsLA");
        }
    }
    var value = lookupTableValues.split(";");
    for (var i = 0; i < value.length; i++) {
        var Prefix = value[i];
        var PrefixLen = Prefix.length();

        if (attrValue.length() > PrefixLen) {
            var Substringval = attrValue.toLowerCase().substring(0, PrefixLen);
            if ((attrValue.toLowerCase().indexOf(Prefix.toLowerCase()) == 0) && (Substringval.toLowerCase() == Prefix.toLowerCase()) && !flag) {
                var IngredientUpdt = attrValue.replace(attrValue.substring(0, PrefixLen), "");
                trimval = IngredientUpdt.trim();
                flag = true;
            }
        }
    }
    if (!flag) {
        trimval = attrValue;
    }

    return trimval;
}

// Waining & direction Attribute LA Prefix removal function (SS-25740)
function LAPrefixRemoval(sourceNode, attribute, logger) {
    var flag = false;
    attrValue = sourceNode.getValue(attribute).getSimpleValue();
    if (attrValue) {
        var lookupTableValues = lookupTableHome.getLookupTableValue("PIM_LCL_Artwork_PrefixRemoval", attribute + "LA");
        var value = lookupTableValues.split(";");
        for (i = 0; i < value.length; i++) {
            var Prefix = value[i];
            var PrefixLen = Prefix.length();
            if (attrValue.length() > PrefixLen) {
                var Substringval = attrValue.toLowerCase().substring(0, PrefixLen);
                if ((attrValue.toLowerCase().indexOf(Prefix.toLowerCase()) != -1) && (Substringval == Prefix.toLowerCase()) && !flag) {
                    var WarningsUpdt = attrValue.replace(attrValue.substring(0, PrefixLen), "");
                    var trimval = WarningsUpdt.trim();
                    sourceNode.getValue(attribute).setSimpleValue(trimval);
                    flag = true;
                }
            }
        }
    }

}

// Warnings NA Attribute - Prefix removal function (SS-25984)
function NAWarningsPrefixRemoval(sourceNode, logger) {
    var attrValue = sourceNode.getValue("Warnings").getSimpleValue();
    if (attrValue) {
        var lookupTableValues = lookupTableHome.getLookupTableValue("PIM_LCL_Artwork_PrefixRemoval", "WarningsNA");
        var value = lookupTableValues.split(";");
        for (i = 0; i < value.length; i++) {
            var Prefix = value[i];
            var PrefixLen = Prefix.length();
            if (attrValue.length() > PrefixLen) {
                var Substringval = attrValue.toLowerCase().substring(0, PrefixLen);
                if ((attrValue.toLowerCase().indexOf(Prefix.toLowerCase()) != -1) && (Substringval == Prefix.toLowerCase())) {
                    var WarningsUpdt = attrValue.replace(attrValue.substring(0, PrefixLen), "");
                    var trimval = WarningsUpdt.trim();
                    sourceNode.getValue("Warnings").setSimpleValue(trimval);

                }
            }
        }

        updatedvalue = artworkLib.descriptionPhraseRemoval(sourceNode.getValue("Warnings").getSimpleValue(), "WarningsNAdescription", lookupTableHome, manager, logger); //SS-26519
        sourceNode.getValue("Warnings").setSimpleValue(updatedvalue);
    }
}

//SS-25966
function AddEndingPeriodToDirections(sourceNode, logger) {
    var attrValue = sourceNode.getValue("Directions").getSimpleValue();
    if (attrValue) {
        attrValuetrim = attrValue.trim();
        var attrLen = attrValuetrim.length();
        var stringVal = attrValuetrim.substring(0, attrLen);
        var lastCharacter = attrValuetrim.substring(attrLen - 1, attrLen);
        if (lastCharacter != "?" && lastCharacter != "!" && lastCharacter != ".") {
            stringVal = stringVal + ".";
        }
        stringVal = artworkLib.descriptionPhraseRemoval(stringVal, "DirectionsNAdescription", lookupTableHome, manager, logger); //SS-26519
        stringVal=String(stringVal);//RITM7398922
         if(stringVal.length <=6000){
           sourceNode.getValue("Directions").setSimpleValue(stringVal);//RITM7398922
        }
    }
}
