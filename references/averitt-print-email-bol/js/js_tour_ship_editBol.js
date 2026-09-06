var editBolTour = new Tour({
    name : "editBol",
    skipHiddenElements : true,
    debug : false,
    steps : [
        // TEMPLATE NAME
        {
            element : "#template-name",
            title : "Template Name",
            content : "Enter the name for your template here.",
            placement : "top",
            backdrop : true,
        },

        // SHIPPING INFORMATION
        {
            element : "#shipping-information",
            title : "Shipping Information",
            content : "Enter Shipper and Consignee contact information here.",
            placement : "top",
            backdrop : true,
        },
        {
            element : "#shipper",
            title : "Shipper",
            content : "The actual location from which the freight is being picked up.",
            placement : "top",
            backdrop : true,
        },
        {
            element : "#shipperImports",
            title : "Import from...",
            content : "<strong>Address Book:</strong> select this option to import the information that has been saved in your address book."
                    + "<br><br><strong>Registered Accounts:</strong> select this option to import the information from registered accounts.",
            placement : "top",
            backdrop : true,
        },
        {
            element : "#blind",
            title : "Blind Shipment",
            content : "A blind shipment is where the shipper name provided does not reflect the information of the actual party. Please review the shipping terms.",
            placement : "top",
            backdrop : true,
        },
        {
            element : "#consignee",
            title : "Consignee",
            content : "The party to whom the shipment is being delivered.",
            placement : "left",
            backdrop : true,
        },
        {
            element : "#consigneeImports",
            title : "Import from...",
            content : "<strong>Address Book:</strong> select this option to import the information that has been saved in your address book."
                    + "<br><br><strong>Registered Accounts:</strong> select this option to import the information from registered accounts.",
            placement : "left",
            backdrop : true,
        },
        {
            element : "#consave",
            title : "Add To Address Book",
            content : "If you do not already have this location in your address book, you can click here to add the information for future use.",
            placement : "left"
        },

        // BILL TO
        {
            element : "#bill-to",
            title : "Bill To",
            content : "If a 3rd Party is paying for the freight, then enter their information here.",
            placement : "top",
            backdrop : true
        },
        {
            element : "#billToImports",
            title : "Import from...",
            content : "<strong>Address Book:</strong> select this option to import the information that has been saved in your address book."
                    + "<br><br><strong>Registered Accounts:</strong> select this option to import the information from registered accounts.",
            placement : "top",
            backdrop : true
        },
        {
            element : "#consave2",
            title : "Add To Address Book",
            content : "If you do not already have this location in your address book, you can click here to add the information for future use.",
            placement : "right"
        },

        // SHIPMENT INFORMATION
        {
            element : "#shipment-information",
            title : "Shipment Information",
            content : "Shipment Information",
            placement : "top",
            backdrop : true
        },
        {
            element : "#bol-number",
            title : "BOL Number",
            content : "A BOL number is a shipper reference number, and can consist of any combination of letters or numbers. This is something that you create to identify the shipment and not something given by Averitt Express. This must be completed before you can submit this Shipment.",
            placement : "top",
            backdrop : true,
        },
        {
            element : "#po-number",
            title : "PO Number",
            content : "Optional field where you can indicate your PO number, if you have one.",
            placement : "top",
            backdrop : true,
        },
        {
            element : "#delivery-date",
            title : "Must Deliver On or Before",
            content : "If the shipment is subject to a Must Arrive By Date (MABD), indicate it here. Please note that selecting a date here in no way guarantees a standard shipment.",
            placement : "left",
            backdrop : true,
        },
        {
            element : "#freight-charges",
            title : "Freight Charges",
            content : "<strong>Prepaid:</strong> Paid by the Shipper or Third Party Bill-to<br><br><strong>Collect:</strong> Paid by the Consignee",
            placement : "left",
            backdrop : true,
        },
        {
            element : "#LPRadio",
            title : "LP-AVRT Shipment",
            content : "Does your shipment qualify as a Local Pallet Program shipment?",
            placement : "top",
            backdrop : true,
        },

        // STANDARD LTL GUARANTEE
        {
            element : "#standard-guarantee-container",
            title : "Standard LTL Guarantee",
            content : "If you would like to have this be a Standard LTL Guaranteed Shipment then "
                    + "please select the checkbox in this area. For more details on our Standard LTL "
                    + "Guaranteed options, see our "
                    + "<a href='https://www.averitt.com/ltl/expedited' target='_blank'>Expedited page</a>.",
            placement : "top",
            backdrop : true
        },

        // Over Length Shipment
        {
            element : "#over-length-fieldset",
            title : "Over Length Shipment",
            content : "Information about the size of the shipment.",
            placement : "top",
            backdrop : true
        },

        // ACCESSORIALS
        {
            element : "#accessorials",
            title : "Accessorials",
            content : "Additional services required for your delivery. Accessorials are subject to additional charges based on your account’s pricing.",
            placement : "top",
            backdrop : true
        },
        {
            element : "#arrival-notify",
            title : "Arrival Notify",
            content : "A notice, verbal or written, furnished to the consignee upon the arrival of the shipment.",
            placement : "top"
        },
        {
            element : "#convention-center-delivery-charge",
            title : "Convention Center Delivery Charge",
            content : "A delivery made to a convention center, amusement park, trade show, craft show, traveling show, chautauquas, fairs, carnivals, exhibitions, expositions, furniture shows or such venues.",
            placement : "top"
        },
        {
            element : "#inside-delivery",
            title : "Inside Delivery",
            content : "A delivery made away from the immediate adjacent unloading locations.",
            placement : "top"
        },
        {
            element : "#construction-site-delivery",
            title : "Construction Site Delivery",
            content : "A delivery made to a construction site. Construction sites include areas where building, excavating, erecting, construction and road building is carried on.",
            placement : "top"
        },
        {
            element : "#liftgate",
            title : "Liftgate",
            content : "A shipment requiring hydraulic lifting or lowering device to accomplish delivery when the destination service center does not have equipment. Charges will be equal to amount AVRT pays for purchasing service from a third party.",
            placement : "top"
        },
        {
            element : "#residential-delivery",
            title : "Residential Delivery",
            content : "A delivery made to a residential location. This includes private residences, apartments, churches, schools, camps, condominiums, country clubs, estates, farms, mini-storage warehouses, rectories, convents and other such locations.",
            placement : "left"
        },
        {
            element : "#non-commercial-pickup-delivery",
            title : "Non-Commercial Pickup/Delivery",
            content : "Pick up or delivery service provided at schools, churches, camps, country clubs, estates, farms, mini-storage warehouses, rectories, convents, prisons, military bases and other such locations.",
            placement : "left"
        },
        {
            element : "#security-inspection-pickup-delivery",
            title : "Security Inspection",
            content : "When the carrier is required by the shipper and/or consignee to go through a security inspection process in order to perform pickup or delivery in locations such as, but not limited to airports, chemical plants, military bases, ports, prisons, and other public or private facilities.",
            placement : "left"
        },
        {
            element : "#additional_cargo_liability",
            title : "Additional Cargo Liability",
            content : "Check to request additional cargo liability insurance and also specify the required amount of additional coverage.",
            placement : "left"
        },
        
        // RATE QUOTE INFORMATION
        {
            element : "#rate-quote-info-div",
            title : "Rate Quote Information",
            content : "If you have been given a rate quote, please enter that here. (Examples: SP124789, VOL1291092, 16384930)",
            placement : "top",
            backdrop : true
        },

        // ITEMS TO SHIP
        {
            element : "#items-to-ship",
            title : "Items To Ship",
            content : "Shipment Details",
            placement : "top",
            backdrop : true
        },
        {
            element : "#hazmat",
            title : "Hazmat",
            content : "Select 'Yes' if this line item is a hazardous material. Selecting 'Yes' will reveal a field such that the corresponding UN Number can be entered. Once the UN Number is entered you will be presented with a list of hazardeous materials and you will be required to pick the item that best describes your line item being shipped.",
            placement : "top",
        },
        {
            element : "#pieces",
            title : "Pieces",
            content : "This is the number of individual pieces actually being shipped.",
            placement : "top",
        },
        {
            element : "#unit-and-type",
            title : "Unit and Type",
            content : "Enter the number and type of packaging (typical packaging includes cartons, skids and drums).",
            placement : "top",
        },
        {
            element : "#class",
            title : "Class",
            content : "A number that identifies the approximate size, value and difficulty of transporting each particular type of product. The class is needed to determine a price. You will need to know width, height, depth and weight for your shipment. The system estimates a class determined by the measurements you enter.",
            placement : "top",
        },
        {
            element : "#nmfc",
            title : "NMFC",
            content : "Enter the specific item number according to the National Motor Freight Classification.",
            placement : "top",
        },
        {
            element : "#sub",
            title : "Sub",
            content : "Enter the sub category of the NMFC #.",
            placement : "top",
        },
        {
            element : "#weight",
            title : "Weight",
            content : "Enter the weight of the item(s).",
            placement : "top",
        },
        {
            element : "#length",
            title : "Length",
            content : "Enter the length of the item(s) in inches.",
            placement : "top",
        },
        {
            element : "#width",
            title : "Width",
            content : "Enter the width of the item(s) in inches.",
            placement : "top",
        },
        {
            element : "#height",
            title : "Height",
            content : "Enter the height of the item(s) in inches.",
            placement : "top",
        },
        {
            element : "#density",
            title : "Density",
            content : "Density is calculated when tabbing out of dimension fields, if all dimensions have values.",
            placement : "top",
        },
        {
            element : "#js-desc-group-0",
            // element : $('[id^=js-desc-group-]:first'),
            title : "Description",
            content : "Enter a description of the item(s).",
            placement : "top",
        },
        {
            element : "#un-number",
            onShow : function () {
                var checkBox = $('[id^=lhazflag-]:first');
                var hazmatGroup = $('[id^=hazmat-group-]:first');

                if (checkBox[0].checked == false) {
                    hazmatGroup.css('display', 'block');
                }
            },
            onHide : function () {
                var checkBox = $('[id^=lhazflag-]:first');
                var hazmatGroup = $('[id^=hazmat-group-]:first');

                if (checkBox[0].checked == false) {
                    hazmatGroup.css('display', 'none');
                }
            },
            title : "UN Number",
            content : "After entering this number the package and hazard class and the description will be populated automatically. If there is more than one choice a drop down box will be given. If an N.O.S. description is required, a box will be provided. This number can be only composed of alpha-numerics beginning with UN or NA (e.g. UN1234). The hazardous material description will be formatted according to regulations for printing on the bill of lading.",
            placement : "top",
            skipOverride : true,
        },
        {
            element : "#limquant",
            onShow : function () {
                var checkBox = $('[id^=lhazflag-]:first');
                var hazmatGroup = $('[id^=hazmat-group-]:first');

                if (checkBox[0].checked == false) {
                    hazmatGroup.css('display', 'block');
                }
            },
            onHide : function () {
                var checkBox = $('[id^=lhazflag-]:first');
                var hazmatGroup = $('[id^=hazmat-group-]:first');

                if (checkBox[0].checked == false) {
                    hazmatGroup.css('display', 'none');
                }
            },
            title : "'Limited Quantity' Hazmat by Ground (49 CFR)",
            //content : "Selected dangerous goods packed in small quantities (limited quantity) or very small volumes (excepted quantity) pose a lesser risk in transport than do the same goods packed in larger volumes. Thus they qualify for some relief from robust packaging requirements provided that they are packed and marked properly. This could save considerable packaging costs. The limited quantity is the maximum quantity per inner packaging or article for transporting dangerous goods as limited quantities. The limited quantity maximun, per material, can be found in the industry standard Dangerous Goods List. Select 'Yes' if this line item qualifies as a limited quantity.",
            content : " Generally speaking, limited quantity ground shipments allow for the most expansive set of reliefs from the hazmat shipping regulations. When shipped by ground, limited quantity hazmat packages are typically excepted from:" 
                    + "<ul>"
                    + "<li>Hazard class labeling;</li>"
                    + "<li>Using specification packaging;</li>"
                    + "<li>Filling out shipping papers and emergency response information; and</li>"
                    + "<li>Placarding vehicles.</li>"
                    + "</ul>"
                    + "However, because a limited quantity package is still a hazmat package, certain basic hazmat shipping rules still apply. The package:"
                    + "<ul>"
                    + "<li>Must meet general packaging requirements of 49 CFR 173, Subpart B (i.e., be a \"strong outer packaging\");</li>"
                    + "<li>Must be \"combination\" packaging (i.e., cans/bottles in a box);</li>"
                    + "<li>Cannot exceed a gross weight of 30 kg (66 lbs.); and</li>"
                    + "<li>Is typically limited to 1 to 5 liters or kilograms capacity for inner packagings, depending on the hazard class and packing group.</li>"
                    + "</ul>"
                    + "All limited quantity reliefs considered, a ready-to-ship limited quantity hazmat package needs to only display the limited quantity marking, an address marking, and sometimes orientation arrows to meet the DOT's requirements for hazmat ground shipments.",                        		
            placement : "right",
        },
        
        // ADDITIONAL INFORMATION
        {
            element : "#additional-info",
            title : "Additional Information",
            content : "If there are any comments that need to be added to the Bill of Lading or the Delivery Receipt, then please enter the information into the corresponding boxes.",
            placement : "top",
            backdrop : true
        },

        // BUTTONS
        {
            element : "#emailPrintBol",
            title : "Print/Email BOL",
            content : "Click here once all of the above information has been entered and you are ready to print or email the BOL.",
            placement : "left",
        },
        {
            element : "#draftBtn",
            title : "Save as Draft",
            content : "Click this button if you have not filled out all the required information"
                    + " above but still wish to save your current progress.",
            placement : "top",
        },
        {
            element : "#saveShipLaterBtn",
            title : "Save & Ship Later",
            content : "Click here once all the required information has been entered above and you"
                    + " do not wish to proceed with any further actions.",
            placement : "top",
        },
        {
            element : "#saveShipNowBtn",
            title : "Save & Ship Now",
            content : "Click here once all the required information has been entered above and are"
                    + " ready to ship at this moment.",
            placement : "top",
        },
        {
            element : "#save-template",
            title : "Save Template",
            content : "Click here once all the required information has been entered above.",
            placement : "top",
        },
        {
            element : "#back-to-top",
            title : "Back to Top",
            content : "Click this to go back to the top of the page.",
            placement : "right",
        }
    ]
});

var editBolUtil = {
    init: function () {
        // check to see if walkthrough=true query parameter exists
        // if so, invoke the template tour
        if (this.isWalkthrough() === true) {
            editBolUtil.invokeNewTemplateTour();
        }

        $('#edit-bol').on('click', function () {
            editBolTour.restart();
        });
        $('#create-a-bol1, #create-a-bol2').on('click', function () {
            editBolTour.setBasePath("/print-email-bol");
            editBolTour.restart();
        });
    
        $('#create-template').on('click', function () {
            editBolUtil.invokeNewTemplateTour();
        });
    
        $('#one-stop').on('click', function () {
            $loggedIn = $('#user-logged-in').val();
    
            if ($loggedIn == 'false') {
                $('#toggle-login').trigger('click');
            } else {
                editBolTour.setBasePath("/servlet/ShipBolServlet?flag=addBol");
                editBolTour.restart();
            }
        });
    
        $('#draftBtn, #save-template, #emailPrintBol, #saveShipNowBtn, #saveShipLaterBtn')
            .on('click', function () {
                editBolTour.end();
            });
    },

    isWalkthrough: function () {
        var queryParamStr = location.search;

        return queryParamStr.search('walkthrough=true') !== -1;
    },

    invokeNewTemplateTour: function () {
        $loggedIn = $('#user-logged-in').val();

        if ($loggedIn == 'false') {
            $('#toggle-login').trigger('click');
        } else {
            editBolTour.setBasePath("/servlet/ShipBolServlet?flag=addTemplate");
            editBolTour.restart();
        }
    }
}

editBolTour.init();
editBolUtil.init();