// Dependencies: jQuery, ajaxCities.js, AddRemoveRow.js, CharacterCounter.js
var Shipper, Consignee, Billto, Accessorials, AdditionalPOs, AdditionalBOLs,EditBol;

Shipper = {
    code: '',
    company: '',
    address1: '',
    address2: '',
    zip: '',
    city: '',
    state: '',
    country: '',
    phone1: '',
    phone2: '',
    phone3: '',
    obj_select: new Object(),
    obj_code: new Object(),
    obj_name: new Object(),
    obj_address1: new Object(),
    obj_address2: new Object(),
    obj_zip: new Object(),
    obj_city: new Object(),
    obj_state: new Object(),
    obj_country: new Object(),
    obj_phone_area: new Object(),
    obj_phone_first: new Object(),
    obj_phone_last: new Object(),
    account_fields: [],

    init: function (default_city) {
        var doc = document;
        this.city            = default_city;
        this.obj_select      = doc.getElementById('company-shipper');
        this.obj_code        = doc.getElementById('shipper-code');
        this.obj_name        = doc.getElementById('SN');
        this.obj_address1    = doc.getElementById('SA1');
        this.obj_address2    = doc.getElementById('SA2');
        this.obj_zip         = doc.getElementById('SZ');
        this.obj_city        = doc.getElementById('SC');
        this.obj_state       = doc.getElementById('SS');
        this.obj_country     = doc.getElementById('shipper-country');
        this.obj_phone_area  = doc.getElementById('shipper-phone-area');
        this.obj_phone_first = doc.getElementById('shipper-phone-first');
        this.obj_phone_last  = doc.getElementById('shipper-phone-last');
        this.account_fields  = [ $(this.obj_name),
                                 $(this.obj_address1),
                                 $(this.obj_country),
                                 $(this.obj_zip),
                                 $(this.obj_city),
                                 $(this.obj_state) ];
    },

    updateCompanyFields: function () {
        let account_found       = false,
            // SHIPPLUS-195 - When coming from rate quote, the city/state/zip are muted (disabled), so don't allow them to change
            is_zip_editable = !$(this.obj_zip).hasClass('mute');

        // Call to handle hide/show and set for displaying account number (if related account is used for target select)
        account_found = EditBol.updateCompanyDisplayDiv($(this.obj_select),
                                                        this.code);
        // If an account was used, then disable the linked fields.  Otherwise enable them...
        EditBol.disableAccountFields(this, account_found);

        if (this.country === 'MX' || this.country === 'CA') {
            this.setError(this.obj_select, 'Shipper can only be a United States address');
            //console.log('Non-US!');

            // Make sure fields get set to empty if a non-us address is selected for shipper
            this.obj_code.value        = '';
            this.obj_name.value        = '';
            this.obj_address1.value    = '';
            this.obj_address2.value    = '';
            this.obj_phone_area.value  = '';
            this.obj_phone_first.value = '';
            this.obj_phone_last.value  = '';
            this.obj_zip.value         = '';
            this.obj_city.value        = '';
            this.obj_state.value       = '';
            this.obj_country.value     = this.country;
        } else {
            this.obj_code.value        = this.code;
            this.obj_name.value        = this.company;
            this.obj_address1.value    = this.address1;
            this.obj_address2.value    = this.address2;
            this.obj_phone_area.value  = this.phone1;
            this.obj_phone_first.value = this.phone2;
            this.obj_phone_last.value  = this.phone3;
            this.obj_country.value     = this.country;

            if (is_zip_editable) {
                this.obj_zip.value         = this.zip;
                this.obj_city.value        = this.city.toUpperCase();
                this.obj_state.value       = this.state;
                AjaxCities.getAmericanCities(this.obj_zip,
                                             this.obj_city,
                                             this.obj_state,
                                             false,
                                             function () {
                    Averitt.setSelectedOption(Shipper.obj_city, Shipper.city.toUpperCase());
                });
            }
        }
    },

    setError: function(input_obj, message, error){
        let error_obj = document.createElement('p'),
        id = input_obj.id + '-error',
        error_txt = document.createTextNode(message),
        og_class = input_obj.className;

        error_obj.className = 'error-inline';

        // Check to see if error already exists
        if (!document.getElementById(id)) {
            error_obj.setAttribute('id', id);
            input_obj.parentNode.appendChild(error_obj);
            input_obj.className += ' error-input';
            error_obj.appendChild(error_txt);
        }

        jQuery(input_obj).on('blur keypress keydown change', function () {
            let country=$('#shipper-country').val();
            if(country==="US"){
                Averitt.removeError(input_obj, document.getElementById(id), og_class);
            }
        });
    }
};

Consignee = {
    code: '',
    company: '',
    address1: '',
    address2: '',
    zip: '',
    city: '',
    state: '',
    country: '',
    phone1: '',
    phone2: '',
    phone3: '',
    obj_select: new Object(),
    obj_code: new Object(),
    obj_name: new Object(),
    obj_address1: new Object(),
    obj_address2: new Object(),
    obj_zip: new Object(),
    obj_city: new Object(),
    obj_state: new Object(),
    obj_country: new Object(),
    obj_prefix: new Object(),
    obj_phone_area: new Object(),
    obj_phone_first: new Object(),
    obj_phone_last: new Object(),
    account_fields: [],

    init: function (default_city) {
        var doc = document;
        this.city            = default_city;
        this.obj_select      = doc.getElementById('company-consignee'),
        this.obj_code        = doc.getElementById('consignee-code'),
        this.obj_name        = doc.getElementById('CN'),
        this.obj_address1    = doc.getElementById('CA1'),
        this.obj_address2    = doc.getElementById('CA2'),
        this.obj_zip         = doc.getElementById('CZ'),
        this.obj_city        = doc.getElementById('CC'),
        this.obj_state       = doc.getElementById('CS'),
        this.obj_country     = doc.getElementById('consignee-country'),
        this.obj_prefix      = doc.getElementById('mexico-prefix-consignee'),
        this.obj_phone_area  = doc.getElementById('consignee-phone-area'),
        this.obj_phone_first = doc.getElementById('consignee-phone-first'),
        this.obj_phone_last  = doc.getElementById('consignee-phone-last'),
        this.account_fields  = [ $(this.obj_name),
                                 $(this.obj_address1),
                                 $(this.obj_country),
                                 $(this.obj_zip),
                                 $(this.obj_city),
                                 $(this.obj_state) ];
    },

    updateCompanyFields: function () {
        let account_found = false,
            // SHIPPLUS-195 - When coming from rate quote, the city/state/zip are muted (disabled), so don't allow them to change
            is_zip_editable = !$(this.obj_zip).hasClass('mute');

        // Call to handle hide/show and set for displaying account number (if related account is used for target select)
        account_found = EditBol.updateCompanyDisplayDiv($(this.obj_select),
                                                        this.code);
        // If an account was used, then disable the linked fields.  Otherwise enable them...
        EditBol.disableAccountFields(this, account_found);

        this.obj_code.value        = this.code;
        this.obj_name.value        = this.company;
        this.obj_address1.value    = this.address1;
        this.obj_address2.value    = this.address2;
        this.obj_country.value     = this.country;
        this.obj_phone_area.value  = this.phone1;
        this.obj_phone_first.value = this.phone2;
        this.obj_phone_last.value  = this.phone3;

        if (is_zip_editable) {
            this.obj_zip.value         = this.zip;
            this.obj_city.value        = this.city.toUpperCase();
            this.obj_state.value       = this.state;
            if (this.country === 'MX') {
                AjaxCities.getMexicanCities(this.obj_zip,
                                            this.obj_city,
                                            this.obj_state,
                                            true,
                                            function () {
                    Averitt.setSelectedOption(Consignee.obj_city, Consignee.city.toUpperCase());
                    Consignee.obj_prefix.className = '';
                });

            } else if (this.country === 'CA') {
                AjaxCities.getCanadianCities(this.obj_zip,
                                             this.obj_city,
                                             this.obj_state,
                                             true,
                                             function () {
                    Averitt.setSelectedOption(Consignee.obj_city, Consignee.city.toUpperCase());
                    Consignee.obj_prefix.className = 'js-init-hidden';
                });

            } else {
                AjaxCities.getAmericanCities(this.obj_zip,
                                             this.obj_city,
                                             this.obj_state,
                                             false,
                                             function () {
                    Averitt.setSelectedOption(Consignee.obj_city, Consignee.city.toUpperCase());
                    Consignee.obj_prefix.className = 'js-init-hidden';
                });
            }
            // re-initialize the zip on keyup event according to the country selected
            $('#' + this.obj_country.id).trigger('change');
            this.obj_zip.value = this.zip;
            this.obj_state.value = this.state;
            // Set the Puerto Rico information
            EditBol.togglePuertoRicoFields(this.city,
                                           this.state,
                                           this.country);
        }
    }
};

Billto = {
    code: '',
    company: '',
    address1: '',
    address2: '',
    zip: '',
    city: '',
    state: '',
    country: '',
    phone1: '',
    phone2: '',
    phone3: '',
    obj_select: new Object(),
    obj_code: new Object(),
    obj_name: new Object(),
    obj_address1: new Object(),
    obj_address2: new Object(),
    obj_zip: new Object(),
    obj_city: new Object(),
    obj_state: new Object(),
    obj_country: new Object(),
    obj_phone_area: new Object(),
    obj_phone_first: new Object(),
    obj_phone_last: new Object(),
    account_fields: [],

    init: function (default_city) {
        let doc = document;
        this.city            = default_city;
        this.obj_select      = doc.getElementById('company-billto'),
        this.obj_code        = doc.getElementById('billto-code'),
        this.obj_name        = doc.getElementById('BN'),
        this.obj_address1    = doc.getElementById('BA1'),
        this.obj_address2    = doc.getElementById('BA2'),
        this.obj_zip         = doc.getElementById('BZ'),
        this.obj_city        = doc.getElementById('BC'),
        this.obj_state       = doc.getElementById('BS'),
        this.obj_country     = doc.getElementById('billto-country'),
        this.obj_phone_area  = doc.getElementById('billto-phone-area'),
        this.obj_phone_first = doc.getElementById('billto-phone-first'),
        this.obj_phone_last  = doc.getElementById('billto-phone-last'),
        this.account_fields  = [ $(this.obj_name),
                                 $(this.obj_address1),
                                 $(this.obj_country),
                                 $(this.obj_zip),
                                 $(this.obj_city),
                                 $(this.obj_state) ];

        // SHIPPLUS-175 - Handle bill-to phone being required accidently
        if (this.obj_code.value === ''
                && this.obj_name.value === '') {
            EditBol.removePhoneRequired(this);
        }
    },

    updateCompanyFields: function () {
        let account_found      = false,
            // SHIPPLUS-195 - When coming from rate quote, the city/state/zip are muted (disabled), so don't allow them to change
            is_zip_editable = !$(this.obj_zip).hasClass('mute');

        // Call to handle hide/show and set for displaying account number (if related account is used for target select)
        account_found = EditBol.updateCompanyDisplayDiv($(this.obj_select),
                                                        this.code);
        // If an account was used, then disable the linked fields.  Otherwise enable them...
        EditBol.disableAccountFields(this, account_found);

        this.obj_code.value        = this.code;
        this.obj_name.value        = this.company;
        this.obj_address1.value    = this.address1;
        this.obj_address2.value    = this.address2;
        this.obj_country.value     = this.country;
        this.obj_phone_area.value  = this.phone1;
        this.obj_phone_first.value = this.phone2;
        this.obj_phone_last.value  = this.phone3;

        if (is_zip_editable) {
            this.obj_zip.value         = this.zip;
            this.obj_city.value        = this.city;
            this.obj_state.value       = this.state;
            if (this.country === 'MX') {
                AjaxCities.getMexicanCities(this.obj_zip,
                                            this.obj_city,
                                            this.obj_state,
                                            true,
                                            function () {
                    Averitt.setSelectedOption(Billto.obj_city, Billto.city.toUpperCase());
                });
            } else if (this.country === 'CA') {
                AjaxCities.getCanadianCities(this.obj_zip,
                                             this.obj_city,
                                             this.obj_state,
                                             true,
                                             function () {
                    Averitt.setSelectedOption(Billto.obj_city, Billto.city.toUpperCase());
                });
            } else {
                AjaxCities.getAmericanCities(this.obj_zip,
                                             this.obj_city,
                                             this.obj_state,
                                             false,
                                             function (callback_city_input, callback_state, callback_country) {
                    Averitt.setSelectedOption(Billto.obj_city, Billto.city.toUpperCase());

                    // Check Puerto Rico
                    EditBol.togglePuertoRicoFields(callback_city_input, callback_state, callback_country);
                });
            }

            // re-initialize the zip on keyup event according to the country selected
            $('#' + this.obj_country.id).trigger('change');
            this.obj_zip.value = this.zip;
            this.obj_state.value = this.state;
        }
    }
};

Accessorials = {
    init: function () {
        let doc = document;

        this.arrival_check           = doc.getElementById("ARRN");
        this.convention_check        = doc.getElementById("CONV");
        this.construction_site_check = doc.getElementById("CSD");
        this.lift_check              = doc.getElementById("LIFT");
        this.residential_check       = doc.getElementById("RESD");
        this.non_commercial_check    = doc.getElementById("NCOM");
        this.security_inspection_check           = doc.getElementById("SECU");
        this.additional_cargo_liability_checkbox = document.getElementById("XVAL");

        this.standard_accessorial_ary = [
            Accessorials.arrival_check,
            Accessorials.convention_check,
            Accessorials.construction_site_check,
            Accessorials.lift_check,
            Accessorials.residential_check,
            Accessorials.non_commercial_check,
            Accessorials.security_inspection_check,
            Accessorials.additional_cargo_liability_checkbox
        ];

        Averitt.toolTip.init();

        //if in ViewBol mode or when editing a BOL from a rate quote then accessorials are not allowed to be changed so no need to setup
        //checkbox events. OTHERWISE do setup events
        if (EditBol.refer_flag.value === 'viewBol' || EditBol.is_from_ratequote.value === 'true') {
            //prevent unchecking of all BOL accessorial checkboxes if in view mode or from ratequote
            $("input[name='asseccorials']:checkbox").on("click", function (e) {
                e.preventDefault();
                return false;
            });
        } else {
            // Validate mutually exclusive checkboxes
            $(Accessorials.residential_check).on('click', function () {
                Accessorials.validateAccessorials();
            });

            $(Accessorials.construction_site_check).on('click', function () {
                Accessorials.validateAccessorials();
            });

            $(Accessorials.non_commercial_check).on('click', function () {
                Accessorials.validateAccessorials();
            });

            if( Accessorials.additional_cargo_liability_checkbox != null) {
                //turn on off Required and hide show amount field
	            $(Accessorials.additional_cargo_liability_checkbox).on('click', function () {
	        	    if( Accessorials.additional_cargo_liability_checkbox.checked === true ) {
	        		    $('#ACLamount').addClass('currency'); 
	        		    $('#js-toggle-liability-amount-input').removeClass('mute');  //show
	        		    $('#ACLamount').trigger('focus');
	        	    } else {
	        		    $('#ACLamount').removeClass('currency');
	        		    $('#js-toggle-liability-amount-input').addClass('mute');  //hide
	        		    $('#ACLamount').val('');
	        	    }       		
	            });
	        }
        
            this.addCheckboxEvents();
        }
    },

    addCheckboxEvents: function () {
        let len = Accessorials.standard_accessorial_ary.length;

        while (len--) {
            Accessorials.checkStandardGuarantee(Accessorials.standard_accessorial_ary[len]);
        }
    },

    checkStandardGuarantee: function (this_accessorial) {
        $(this_accessorial).on('click', function () {
            if (this.checked === true && EditBol.isGuaranteeDeliveryByChecked()) {
                Accessorials.clearStandardGuaranteeChecks();
            }
        });
    },

    // NonCommerical, Residential and Construction Site cannot be selected together.
    // These would be better handled with radio buttons since they are mutually exclusive,
    // but there is a business case for keeping them as checkboxes.
    validateAccessorials: function () {
        if (Accessorials.non_commercial_check.checked === true && Accessorials.construction_site_check.checked === true){
            EditBol.customAlert("","Non-Commercial Pickup/Delivery and Construction Site Delivery cannot be selected together, both accessorials will be unselected.",
                                "validateAccessorials", undefined); //no need to scroll user is in area already
            Accessorials.construction_site_check.checked = false;
            Accessorials.non_commercial_check.checked = false;
            return false;
        }

        if (Accessorials.non_commercial_check.checked === true && Accessorials.residential_check.checked === true){
            EditBol.customAlert("","Non-Commercial Pickup/Delivery and Residential Delivery cannot be selected together, both accessorials will be unselected.",
                                     "validateAccessorials", undefined);
            Accessorials.non_commercial_check.checked = false;
            Accessorials.residential_check.checked = false;
            return false;
        }

        if (Accessorials.residential_check.checked === true && Accessorials.construction_site_check.checked === true){
            EditBol.customAlert("","Residential Delivery and Construction Site Delivery cannot be selected together, both accessorials will be unselected.",
                                     "validateAccessorials", undefined);
            Accessorials.residential_check.checked = false;
            Accessorials.construction_site_check.checked = false;
            return false;
        }


        //if checked then amount field cannot be blank and has to be a valid dollar amount
        if( Accessorials.additional_cargo_liability_checkbox != null ) {
            let currency = /^\$?[0-9]+(,[0-9]{3})*(\.\d{0,2})?$/;
            let dollarsAndCents72 =  /^\d{1,7}(\.\d{0,2})?$/;
            let $aclAmount = $('#ACLamount');
            let acl_amount = $aclAmount.val().trim();
            let msg;

        	if(Accessorials.additional_cargo_liability_checkbox.checked === true) {
                let results = currency.test(acl_amount);
	            if(results === false){
	                msg = 'Not a validate monatary value';
	                Averitt.setError($aclAmount[0], msg);
	                $aclAmount.trigger('focus');
	                return false;
	            }

	            //remove dollar sign and commas then test for 7,2 format x,xxx,xxx.xx
                let acl_amount_stripped = acl_amount.replace(/\$/g, "").replace(/,/g,"");

	            //in shipplus, unlike in RateQuote, we need to check the max on 100,000
	            if( acl_amount_stripped > 100000){
	                msg = 'The max ACL allowed is $100,000.';
	                Averitt.setError($aclAmount[0], msg);
	                $aclAmount.trigger('focus');
	                return false;
	            }

	            results = dollarsAndCents72.test(acl_amount_stripped);
	            if(results === false){
	                msg = 'Input is too large (9,999,999.99 is max).';
	                Averitt.setError($aclAmount[0], msg);
	                $aclAmount.trigger('focus');
	                return false;
	            }
        	}

            if( Accessorials.additional_cargo_liability_checkbox.checked === false &&
            	acl_amount !== "") {
                msg = 'Do not enter a value here unless you check the checkbox';
                Averitt.setError($aclAmount[0], msg);
                $aclAmount.trigger('focus');
                return false;
            }
	    }

        return true;
    },

    standardGuaranteeCheck: function (input_checkbox) {
        if (input_checkbox.checked === true) {
            if (Accessorials.arrival_check.checked === true ||
                Accessorials.convention_check.checked === true ||
                Accessorials.construction_site_check.checked === true ||
                Accessorials.lift_check.checked === true ||
                Accessorials.residential_check.checked === true ||
                Accessorials.non_commercial_check.checked === true ||
                Accessorials.security_inspection_check.checked === true ||
                Accessorials.additional_cargo_liability_checkbox.checked  === true) {

                Accessorials.clearStandardGuaranteeChecks();
            }
        }
    },

    clearStandardGuaranteeChecks: function () {
        EditBol.customAlert("","'Inside Delivery' is the only Accessorials available with the 'Standard LTL Guarantee Shipping Option'. Other Accessorials will be unselected.",
                           "StandardGuarantee", "guarantee-delivery-by-radio-group");
        Accessorials.arrival_check.checked           = false;
        Accessorials.convention_check.checked        = false;
        Accessorials.construction_site_check.checked = false;
        Accessorials.lift_check.checked              = false;
        Accessorials.residential_check.checked       = false;
        Accessorials.non_commercial_check.checked    = false;
        Accessorials.security_inspection_check.checked     = false
        Accessorials.additional_cargo_liability_checkbox   = false;
    }
};

AdditionalPOs = {
    $link: new Object(),
    $po_number: new Object(),
    max_index: 0,

    init: function () {
        let $rows = $('ul[id^=additional-pos-row-]');

        this.$link      = $('#additional-pos-link');
        this.$po_number = $('#PON');
        this.max_index  = $rows.length - 1;

        // Find inputs with value not blank
        let $inputs = $rows.find(':text[value!=""]');
        if ($inputs.length > 0) {
            //console.log("init - show rows");
            AdditionalPOs.showRows();
        } else {
            // Setup link click
            this.$link.on('click', function () {
                AdditionalPOs.showRows();
            });
        }
    },

    showRow: function ($row) {
        // Show a row
        let $add_link = $row.find('[id^=additional-pos-row-add-]'),
            $delete_link = $row.find('[id^=additional-pos-row-delete-]');
        //console.log("showRow(" + $row + ")");
        $row.removeClass('js-init-hidden');
        // Setup add click
        $add_link.on('click', function (event) {
            let $event_target = $(event.target),
                $parent_row = $event_target.parents('ul[id^=additional-pos-row-]');
            //console.log("add_link $parent_row: " + $parent_row.attr('id'));
            AdditionalPOs.addRow($parent_row);
        });
        // Setup delete click
        $delete_link.on('click', function (event) {
            let $event_target = $(event.target),
                $parent_row = $event_target.parents('ul[id^=additional-pos-row-]');
            //console.log("delete_link $parent_row: " + $parent_row.attr('id'));
            AdditionalPOs.deleteRow($parent_row);
        });
    },

    hideRow: function ($row) {
        // Hide a row
        let $add_link = $row.find('[id^=additional-pos-row-add-]'),
            $delete_link = $row.find('[id^=additional-pos-row-delete-]');
        //console.log("hideRow(" + $row.attr('id') + ")");
        $row.addClass('js-init-hidden');
        // Remove add click
        $add_link.off('click');
        // Remove delete click
        $delete_link.off('click');
        // Clear any input fields
        AdditionalPOs.clearRowInputs($row);
    },

    showRows: function () {
        let $rows = $('ul[id^=additional-pos-row-]');
        // Show all the rows
        $rows.each(function(idx, row) {
            AdditionalPOs.showRow($(row));
        });
        // Turn off link handle
        this.$link.off('click');
        // Remove ae-button--link and add ae-form-element--label class
        this.$link.removeClass('ae-button--link').addClass('ae-form-element--label');
    },

    clearRowInputs: function($row) {
        // Clear all the text inputs
        $row.find(':text').val('');
    },

    hideRows: function () {
        let $rows = $('ul[id^=additional-pos-row-]');
        //console.log("hide all rows");
        // Hide all the rows
        $rows.each(function(idx, row) {
            var $row = $(row);
            AdditionalPOs.hideRow($row);
        });
        // Setup link click
        this.$link.on('click', function () {
            AdditionalPOs.showRows();
        });
        // Add ae-button--link and remove ae-form-element--label class
        this.$link.addClass('ae-button--link').removeClass('ae-form-element--label');
    },

    addRow: function ($current_row) {
        // Add a row
        //console.log("add row..." + $current_row.attr('id'));
        let $clone = $current_row.clone(),
            $add_link = $clone.find('[id^=additional-pos-row-add-]'),
            $delete_link = $clone.find('[id^=additional-pos-row-delete-]'),
            $inputs = $clone.find('input'),
            id_index = 0;
        // Move to next index value
        this.max_index++;
        // Get id index for inputs (i.e. 0 -> 0-4, 1 -> 5-9, 2 -> 10-14, etc)
        id_index = (this.max_index * 5);
        // Update clone id
        $clone.attr('id', 'additional-pos-row-' + this.max_index);
        // Update add link id
        $add_link.attr('id', 'additional-pos-row-add-' + this.max_index);
        // Update delete link id
        $delete_link.attr('id', 'additional-pos-row-delete-' + this.max_index);
        // Update all inputs ids
        $inputs.each(function(idx, input) {
            // Update the id and clear the value
            $(input).attr('id', 'additionalPO-' + id_index).val('');
            id_index++;
        });
        // Add clone row after the current row
        $current_row.after($clone);
        // Show the clone row
        this.showRow($clone);
    },

    deleteRow: function ($current_row) {
        let $rows = $('ul[id^=additional-pos-row-]');
        // Delete row
        if ($rows.length === 1) {
            // Since last one, hide it all...
            this.hideRows();
        } else {
            //console.log("delete row..." + $current_row.attr('id'));
            // Hide the row first
            this.hideRow($current_row);
            // Remove from DOM
            $current_row.remove();
        }
    }
};

AdditionalBOLs = {
        $link: new Object(),
        $bol_number: new Object(),
        max_index: 0,

        init: function () {
            let $rows = $('ul[id^=additional-bols-row-]');
                $inputs = new Object();

            this.$link      = $('#additional-bols-link');
            this.$bol_number = $('#BOL');
            this.max_index  = $rows.length - 1;

            // Find inputs with value not blank
            $inputs = $rows.find(':text[value!=""]');
            if ($inputs.length > 0) {
                //console.log("init - show rows");
                AdditionalBOLs.showRows();
            } else {
                // Setup link click
                this.$link.on('click', function () {
                    AdditionalBOLs.showRows();
                });
            }
        },

        showRow: function ($row) {
            // Show a row
            let $add_link = $row.find('[id^=additional-bols-row-add-]'),
                $delete_link = $row.find('[id^=additional-bols-row-delete-]');
            //console.log("showRow(" + $row + ")");
            $row.removeClass('js-init-hidden');
            // Setup add click
            $add_link.on('click', function (event) {
                let $event_target = $(event.target),
                    $parent_row = $event_target.parents('ul[id^=additional-bols-row-]');
                //console.log("add_link $parent_row: " + $parent_row.attr('id'));
                AdditionalBOLs.addRow($parent_row);
            });
            // Setup delete click
            $delete_link.on('click', function (event) {
                var $event_target = $(event.target),
                    $parent_row = $event_target.parents('ul[id^=additional-bols-row-]');
                //console.log("delete_link $parent_row: " + $parent_row.attr('id'));
                AdditionalBOLs.deleteRow($parent_row);
            });
        },

        hideRow: function ($row) {
            // Hide a row
            let $add_link = $row.find('[id^=additional-bols-row-add-]'),
                $delete_link = $row.find('[id^=additional-bols-row-delete-]');
            //console.log("hideRow(" + $row.attr('id') + ")");
            $row.addClass('js-init-hidden');
            // Remove add click
            $add_link.off('click');
            // Remove delete click
            $delete_link.off('click');
            // Clear any input fields
            AdditionalBOLs.clearRowInputs($row);
        },

        showRows: function () {
            let $rows = $('ul[id^=additional-bols-row-]');
            // Show all the rows
            $rows.each(function(idx, row) {
                AdditionalBOLs.showRow($(row));
            });
            // Turn off link handle
            this.$link.off('click');
            // Remove ae-button--link and add ae-form-element--label class
            this.$link.removeClass('ae-button--link').addClass('ae-form-element--label');
        },

        clearRowInputs: function($row) {
            // Clear all the text inputs
            $row.find(':text').val('');
        },

        hideRows: function () {
            let $rows = $('ul[id^=additional-bols-row-]');
            //console.log("hide all rows");
            // Hide all the rows
            $rows.each(function(idx, row) {
                let $row = $(row);
                AdditionalBOLs.hideRow($row);
            });
            // Setup link click
            this.$link.on('click', function () {
                AdditionalBOLs.showRows();
            });
            // Add ae-button--link and remove ae-form-element--label class
            this.$link.addClass('ae-button--link').removeClass('ae-form-element--label');
        },

        addRow: function ($current_row) {
            // Add a row
            //console.log("add row..." + $current_row.attr('id'));
            let $clone = $current_row.clone(),
                $add_link = $clone.find('[id^=additional-bols-row-add-]'),
                $delete_link = $clone.find('[id^=additional-bols-row-delete-]'),
                $inputs = $clone.find('input'),
                id_index = 0;
            // Move to next index value
            this.max_index++;
            // Get id index for inputs (i.e. 0 -> 0-4, 1 -> 5-9, 2 -> 10-14, etc)
            id_index = (this.max_index * 5);
            // Update clone id
            $clone.attr('id', 'additional-bols-row-' + this.max_index);
            // Update add link id
            $add_link.attr('id', 'additional-bols-row-add-' + this.max_index);
            // Update delete link id
            $delete_link.attr('id', 'additional-bols-row-delete-' + this.max_index);
            // Update all inputs ids
            $inputs.each(function(idx, input) {
                // Update the id and clear the value
                $(input).attr('id', 'additionalBOL-' + id_index).val('');
                id_index++;
            });
            // Add clone row after the current row
            $current_row.after($clone);
            // Show the clone row
            this.showRow($clone);
        },

        deleteRow: function ($current_row) {
            let $rows = $('ul[id^=additional-bols-row-]');
            // Delete row
            if ($rows.length === 1) {
                // Since last one, hide it all...
                this.hideRows();
            } else {
                //console.log("delete row..." + $current_row.attr('id'));
                // Hide the row first
                this.hideRow($current_row);
                // Remove from DOM
                $current_row.remove();
            }
        }
    };

EditBol = {
    itemToDel: {type: undefined,  dataObj: undefined},
    alertModal: {type: undefined,  scrollTo: undefined},
    staleHazmat : false,
    bolOrTemplate : $('#bolOrTemplate').val(),

    init: function () {
        let doc                        = document,
            $shipper_import            = $('input:radio[name=shipperImport]'),
            $consignee_import          = $('input:radio[name=consigneeImport]'),
            $bill_to_import            = $('input:radio[name=billtoImport]'),
            $shipper_country_select    = $('#shipper-country'),
            $shipper_company_select    = $('#company-shipper'),
            $consignee_country_select  = $('#consignee-country'),
            $consignee_company_select  = $('#company-consignee'),
            $billto_country_select     = $('#billto-country'),
            $bill_to_company_select    = $('#company-billto'),
            $consignee_zip_input       = $('#CZ'),
            $billto_zip_input          = $('#BZ'),
            $must_deliver_input        = $('#date-widget'),
            $items_to_ship             = $('#items-to-ship'),
            $shipment_fields           = $items_to_ship.find('.shipment-fields'),
            $items_to_ship_definitions = $('#items-to-ship-definitions'),
            $desc_lists                = $items_to_ship.find('.dropdown-list'),
            $hazmat_contact            = $('#hazmat-contact'),
            $draft_btn                 = $('#draftBtn'),
            $save_ship_later_btn       = $('#saveShipLaterBtn'),
            $save_ship_now_btn         = $('#saveShipNowBtn'),
            $email_print_btn           = $('#emailPrintBol'),
            $save_template_btn         = $('#save-template'),
            template_title             = doc.getElementById('template-title'),
            is_from_ratequote          = doc.getElementById('is-from-ratequote'),
            hasRateQuote               = doc.getElementById('hasRateQuote'),
            content_main               = doc.getElementById('content-main'),
            is_public_bol              = content_main.getAttribute('data-is-public-bol'),
            is_edit_bol                = content_main.getAttribute('data-is-edit-bol'),
            add_edit_bol_form_obj      = doc.getElementById('add-edit-bol'),
            add_edit_bol_form_elements = add_edit_bol_form_obj.elements,
            $shipper_zip_input         = $('#SZ'),
            shipper_city_select        = doc.getElementById('SC'),
            shipper_state_input        = doc.getElementById('SS'),
            default_shipper_city       = doc.getElementById('default-shipper-city').getAttribute('data-default-city'),
            consignee_city_select      = doc.getElementById('CC'),
            consignee_state_input      = doc.getElementById('CS'),
            default_consignee_city     = doc.getElementById('default-consignee-city').getAttribute('data-default-city'),
            billto_city_select         = doc.getElementById('BC'),
            billto_state_input         = doc.getElementById('BS'),
            default_billto_city        = doc.getElementById('default-billto-city').getAttribute('data-default-city'),
            hazmat_inputs              = doc.getElementsByName('lhazflag'),
            hazmat_inputs_len          = hazmat_inputs.length,
            shipment_fields_len        = $shipment_fields.length,
            $un_number_ary             = $('input[id^=un-number-]'),
            bol_number                 = doc.getElementById('BOL'),
            refer_flag                 = doc.getElementById('refer-flag'),
            today = new Date(),
            current_date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear(),
            $section                   = $items_to_ship.find('.js-group'),
            max_items                  = $section.length,
            shipper_city_num           = 0,
            consignee_city_num         = 0,
            billto_city_num            = 0,
            j                          = 0,
            i                          = 0,
            items;

        if( hasRateQuote.value ==='true'  ) { is_from_ratequote.value = 'true' };  //SHIPPLUS-318

        // define state
        this.is_edit_bol           = is_edit_bol;
        this.add_edit_bol_form_obj = add_edit_bol_form_obj;
        this.refer_flag            = refer_flag;
        this.is_from_ratequote     = is_from_ratequote;

        // Set Puerto Rico flag
        this.is_puerto_rico = false;

        // On page load, these values are used to select city if it exists on the respective bean object
        Shipper.init(default_shipper_city);
        Consignee.init(default_consignee_city);
        Billto.init(default_billto_city);

        // --------------------------------------------------------------------------*
        // Shipper
        // --------------------------------------------------------------------------*

        // Initialize Shipper fields
        if ($shipper_country_select.attr('data-country') !== undefined &&
                $shipper_country_select.attr('data-country').toLowerCase() === 'mx') {
            Averitt.setSelectedOption($shipper_country_select[0], 'MX');

            document.getElementById('mexico-prefix-shipper').className = '';

            AjaxCities.getMexicanCities($shipper_zip_input[0], shipper_city_select, shipper_state_input, true, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(shipper_city_select, Shipper.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            AjaxCities.findCities('SZ', 'SC', 'SS', 'shipper-country', true, 'mx');

        } else if ($shipper_country_select.attr('data-country') !== undefined &&
                    $shipper_country_select.attr('data-country').toLowerCase() === 'ca') {
            Averitt.setSelectedOption($shipper_country_select[0], 'CA');

            AjaxCities.getCanadianCities($shipper_zip_input[0], shipper_city_select, shipper_state_input, false, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(shipper_city_select, Shipper.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            AjaxCities.findCities('SZ', 'SC', 'SS', 'shipper-country', false, 'ca');

        } else {
            AjaxCities.getAmericanCities($shipper_zip_input[0], shipper_city_select, shipper_state_input, false, function () {
                Averitt.setSelectedOption(shipper_city_select, Shipper.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            // ex: AjaxCities.findCities(zip_input_id, city_select_id, state_input_id, country_input_id, include_mexico, country_str, callback);
            // A null is specified for country id instead of 'shipper-country' to avoid a JS error in Ship Plus.  Ship Plus shipper doesn't have 'shipper-country'.
            AjaxCities.findCities('SZ', 'SC', 'SS', null, false, 'us');
        }

        // --------------------------------------------------------------------------*
        // Consignee
        // --------------------------------------------------------------------------*

        // Initialize Consignee fields
        if ($consignee_country_select.attr('data-country').toLowerCase() === 'mx') {
            Averitt.setSelectedOption($consignee_country_select[0], 'MX');

            document.getElementById('mexico-prefix-consignee').className = '';

            AjaxCities.getMexicanCities($consignee_zip_input[0], consignee_city_select, consignee_state_input, true, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(consignee_city_select, Consignee.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            AjaxCities.findCities('CZ', 'CC', 'CS', 'consignee-country', true, 'mx');

        } else if ($consignee_country_select.attr('data-country').toLowerCase() === 'ca') {
            Averitt.setSelectedOption($consignee_country_select[0], 'CA');

            AjaxCities.getCanadianCities($consignee_zip_input[0], consignee_city_select, consignee_state_input, false, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(consignee_city_select, Consignee.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            AjaxCities.findCities('CZ', 'CC', 'CS', 'consignee-country', false, 'ca');

        } else {
            Averitt.setSelectedOption($consignee_country_select[0], 'US');

            AjaxCities.getAmericanCities($consignee_zip_input[0], consignee_city_select, consignee_state_input, false, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(consignee_city_select, Consignee.city.toUpperCase());

                // Check Puerto Rico
                EditBol.togglePuertoRicoFields(callback_city_input, callback_state, callback_country);
            });

            // Initialize Ajax method on Consignee ZIP input
            AjaxCities.findCities('CZ', 'CC', 'CS', 'consignee-country', false, 'us', function (callback_city_input, callback_state, callback_country) {
                // Check Puerto Rico
                EditBol.togglePuertoRicoFields(callback_city_input, callback_state, callback_country);
            });
        }

        // --------------------------------------------------------------------------*
        // Bill To
        // --------------------------------------------------------------------------*

        // Initialize Billto fields
        let curr_billto_country = $billto_country_select.attr('data-country').toLowerCase();
        if (curr_billto_country === 'mx') {
            Averitt.setSelectedOption($billto_country_select[0], 'MX');

            document.getElementById('mexico-prefix-billto').className = '';

            AjaxCities.getMexicanCities($billto_zip_input[0], billto_city_select, billto_state_input, true, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(billto_city_select, Billto.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            AjaxCities.findCities('BZ', 'BC', 'BS', 'billto-country', true, 'mx');

        } else if (curr_billto_country === 'ca') {
            Averitt.setSelectedOption($billto_country_select[0], 'CA');

            AjaxCities.getCanadianCities($billto_zip_input[0], billto_city_select, billto_state_input, false, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(billto_city_select, Billto.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            AjaxCities.findCities('BZ', 'BC', 'BS', 'billto-country', false, 'ca');

        } else {
            Averitt.setSelectedOption($billto_country_select[0], 'US');

            AjaxCities.getAmericanCities($billto_zip_input[0], billto_city_select, billto_state_input, false, function (callback_city_input, callback_state, callback_country) {
                Averitt.setSelectedOption(billto_city_select, Billto.city.toUpperCase());
            });

            // initializes the AJAX call for the zip code input "on-change" event
            AjaxCities.findCities('BZ', 'BC', 'BS', 'billto-country', false, 'us');
        }

        // --------------------------------------------------------------------------*
        // Comments
        // --------------------------------------------------------------------------*

        // Initialize comment helpers if it is editBol
        if (EditBol.is_edit_bol === 'true' && is_public_bol === 'false') {
            CharacterCounter.init('bol-comments', 140);
            CharacterCounter.init('delivery-receipt-comments', 140);
        }

        if (EditBol.is_edit_bol === 'true' && is_public_bol === 'false') {
            // Set Promo code check
            EditBol.promoCode.init();

            EditBol.rateQuoteInfo.init();

            // Initialize ability to paste comments
            this.pasteComments();
        }

        this.saveAddressPiece.init();


        // ------------
        // SHIPPLUS-134 - Manage the ability for the user to select address info from their address book or related accounts
        // ...for shipper...
        this.initImportOptions($shipper_import,
                               $shipper_company_select,
                               'shipper',
                               Shipper);
        // ...for consignee...
        this.initImportOptions($consignee_import,
                               $consignee_company_select,
                               'consignee',
                               Consignee);
        // ...for billto...
        this.initImportOptions($bill_to_import,
                                $bill_to_company_select,
                                'billto',
                                Billto);

        // Initialize events for populating company fields
        this.populateShippingTypes($shipper_company_select, 'shipper');
        this.populateShippingTypes($consignee_company_select, 'consignee');
        this.populateShippingTypes($bill_to_company_select, 'billto');

        // SHIPPLUS-134 - Manage the ability for the user to select address info from thier address book or related accounts
        // ------------

        // SHIPPLUS-144 - Handle additional PO's
        AdditionalPOs.init();
        // SHIPPLUS-144 - Handle additional PO's
        AdditionalBOLs.init(); //SHIPPLUS-385 - Handle additional BOLs

        // Initialize Custom Broker section
        EditBol.toggleInternationalFields($consignee_country_select[0]);

        // Set city selects based on respective country select value
        $consignee_country_select.on('change', function () {
            // Clear the Puerto Rico information - when switching countries - if it exists
            EditBol.togglePuertoRicoFields('', '', this.value);
            EditBol.changeZipEvent(this, $consignee_zip_input, consignee_city_select, consignee_state_input, 'CZ', 'CC', 'CS', 'consignee-country',
                function (callback_city_input, callback_state, callback_country) {
                    // Check Puerto Rico when a zip code is entered - US only
                    EditBol.togglePuertoRicoFields(callback_city_input, callback_state, callback_country);
                });
            EditBol.toggleInternationalFields(this);
        });

        $billto_country_select.on('change', function () {
            EditBol.changeZipEvent(this, $billto_zip_input, billto_city_select, billto_state_input, 'BZ', 'BC', 'BS', 'billto-country');
        });

        $shipper_country_select.on('change', function () {
            EditBol.changeZipEvent(this, $shipper_zip_input, shipper_city_select, shipper_state_input, 'SZ', 'SC', 'SS', 'shipper-country');
        });

        // Initialize phone widget for phone fields
        Averitt.phoneWidget('shipper-phone-inputs');
        Averitt.phoneWidget('consignee-phone-inputs');
        Averitt.phoneWidget('billto-phone-inputs');

        if ($('input[name=upsellContactPhone]').length > 0) {
            if ($('#ltl-contact-phone-inputs').length === 1) {
                //console.log('ltl-contact-ratequote-phone-inputs');
                Averitt.phoneWidget('ltl-contact-phone-inputs');
            } else
                if ($('#ltl-contact-ratequote-phone-inputs').length === 1) {
                    //console.log('ltl-contact-ratequote-phone-inputs');
                    Averitt.phoneWidget('ltl-contact-ratequote-phone-inputs');
                }
        }
        if ($('#hazmat-contact-phone-inputs').length === 1) {
            //console.log('hazmat-contact-phone-inputs');
            Averitt.phoneWidget('hazmat-contact-phone-inputs');
        }

        Averitt.dateWidget('date-widget', current_date);

        // Bill To Section
        // if Address book is toggled, set required fields
        $bill_to_company_select.on('change', function () {
            //console.log('change: this.value = \'' + this.value +'\'');
            if (this.value !== '') {
                EditBol.requireBilltoFields();
            } else {
                // SHIPPLUS-175 - Handle bill-to phone being required accidently
                EditBol.removePhoneRequired(Billto);
            }
        });

        // if Name is filled out on blur, set required fields
        $('#BN').on('blur', function () {
            //console.log('blur: $(this).val() = \'' + $(this).val() +'\'');
            if ($(this).val() !== '') {
                EditBol.requireBilltoFields();
            } else {
                // SHIPPLUS-175 - Handle bill-to phone being required accidently
                EditBol.removePhoneRequired(Billto);
            }
        });

        Accessorials.init();

        // Instantiate AddRemoveRow if not viewBol or not coming from RateQuote
        if (refer_flag.value !== 'viewBol' && is_from_ratequote.value !== 'true') {
            items = AddRemoveRow.registerObj('items-to-ship', '+ Add Another Item', max_items, EditBol);
            items.init();
        }

        $('#items-to-ship-help').on('click', function (e) {
            e.preventDefault();
            EditBol.toggleTarget($items_to_ship_definitions);
        });

        // Set blur events on potentially required fields in Items to Ship: lunits, lwgt, ldesc
        for (idx1 = 0; idx1 < shipment_fields_len; idx1 += 1) {
            EditBol.setLineItemEvents(idx1);
        }

        //SHIPPLUS-526 When a customer is coming from a new rate quote or rate quote history to create a bol, all line items are required to be filled out.
        //Weight is the only determinate of validation check
        if (is_from_ratequote.value === 'true') {
            for (let idx2 = 0; idx2 < shipment_fields_len; idx2 += 1) {
                $('#lwgt-' + idx2).trigger('blur');
            }
        }

        // Keep track of the hazmat checkboxes
        // If any are checked, make sure that hazmat contact section is shown
        this.hazmat_response = '';
        this.hazmat_count = 0;

        //console.log('hazmat_checkboxes_len: ' + hazmat_checkboxes_len);
        // Toggle Items to Ship Hazmat sections
        while (hazmat_inputs_len--) {
            let hazmat_input = hazmat_inputs[hazmat_inputs_len];
            EditBol.toggleHazmatFields(hazmat_input);
        }

        EditBol.updateHazmatContactDisplay();

        $un_number_ary.each(function() {
            EditBol.registerUNnumberEvents($(this));
        });

        if (is_public_bol === 'false') {
            // Toggle Items to Ship Descriptions
            $shipment_fields.each(function () {
                EditBol.toggleDescriptions($(this));
            });

            $desc_lists.on('mouseleave', function () {
                EditBol.hideTarget($desc_lists);
            });
        }

        if (is_from_ratequote.value !== 'true') {
            // on page load, see if Standard LTL Guarantee is set
            EditBol.toggleStandardGuarantee();

            // Toggles message in BOL Comments triggered by Standard LTL Shipping option checkbox
            document.getElementsByName('guaranteeDeliveryBy').forEach(function (radioBtn) {
                radioBtn.addEventListener('click', function() {
                    EditBol.toggleStandardGuarantee();
                });
            });
            EditBol.setEventOnResetGuaranteedShippingOpts();
        } else {
            EditBol.requireStandardOptionFields();
        }

        document.getElementsByName('guaranteeDeliveryBy').forEach(function (radioBtn) {
            radioBtn.addEventListener('click', function() {
                Accessorials.standardGuaranteeCheck(this);
                // throw error if date-widget is not empty
                EditBol.validate.mustDeliverAndStandardCheck($must_deliver_input[0]);
                EditBol.validate.validateConsigneeZipAndGuaranteeDelivery();
                EditBol.validate.displayGuaranteeByFiveErrorMessage();
            });
        });

        // When the user finishes entering the consignee zip code (cz), check the guarantee delivery by date
        $consignee_zip_input.on('blur', function () {
            // if the standard guarantee is checked, and the consignee zip is not empty and contains five digits and the guaranteeDeliveryByNoon is checked and the consignee zip is not in the array of eligible zip codes,
            // display an error message.
            if (this.value.length === 5) {
                EditBol.validate.validateConsigneeZipAndGuaranteeDelivery();
                EditBol.validate.displayGuaranteeByFiveErrorMessage();
            }
        });

        // When the user finishes entering the shipper zip code (cz), check for a guarantee by five message
        $shipper_zip_input.on('blur', function () {
            // if the standard guarantee is checked, and the shipper zip is not empty and contains five digits and the guaranteeDeliveryByFive is checked and a message is returned, display the error message.
            if (this.value.length === 5) {
                EditBol.validate.displayGuaranteeByFiveErrorMessage();
            }
        });

        // throw error if standard ltl guarantee is checked
        $('#date-widget').on('focus', function () {
            if (EditBol.isGuaranteeDeliveryByChecked()) {
                EditBol.validate.setDeliverAndStandardError($must_deliver_input[0]);

                if (document.getElementById('ui-datepicker-div')) {
                    $('#ui-datepicker-div').css('display', 'none');
                }

                this.blur();
            }
        });

        // Prevent default submit event
        $(add_edit_bol_form_obj).on('submit', function (e) {
            e.preventDefault();
        });

        // Prevent default behavior for the enter key
        EditBol.preventEnterSubmit();

        $email_print_btn.on('click', function (e) {
            EditBol.submitPublicForm();
        });

        const address_objs = [ Shipper.obj_address1,
                             Consignee.obj_address1 ];
        $draft_btn.on('click', function (e) {
            EditBol.finalizeOptions('no', 'bol');
            EditBol.setServiceType();
            if (Accessorials.validateAccessorials() === false) {
                return false;
            }

            if (bol_number.value === '') {
                Averitt.setError(bol_number, 'Required Field');
                bol_number.focus();
                bol_number.select();
            } else {
                if (AddressLine.isValid(address_objs)) {
                    EditBol.validate.lineItemCheck(function (result) {
                        //console.log("return lineItemCheck() - result: " + result);
                        if (result === true) {
                            result = EditBol.validate.validatePoNumField();
                            if (result === true) {
                                if (Accessorials.validateAccessorials() === true) {
                                    Averitt.formDialog.appendOverlay(function () {
                                        EditBol.enableAccountFields();
                                        add_edit_bol_form_obj.submit();
                                    }, 'Saving BOL');
                                }
                            }
                        }
                    });
                } else {
                    return false;
                }
            }
        });

        $save_ship_later_btn.on('click', function (e) {
            e.preventDefault();
            EditBol.finalizeOptions('no', 'finalize');
            EditBol.setServiceType();
            EditBol.emptyBilltoFields();
            EditBol.validate.firstLineRequired();

            if(EditBol.validate.allDimsRequiredOrNone()){
                EditBol.validateFields.checkFields(EditBol.add_edit_bol_form_obj.elements, function (result) {
                    //console.log('validateFields.checkFields-result: ' + result);
                    if (result === true) {
                        if (AddressLine.isValid(address_objs)) {
                            //console.log('AddressLine-valid');
                            EditBol.promoCode.hasBeenApplied(function (promo_ok) {
                                //console.log('promoCode-promo_ok: ' + promo_ok);
                                if (promo_ok === true) {
                                    EditBol.validate.lineItemCheck(function (result) {
                                        //console.log('validate.lineItemCheck-result: ' + result);
                                        EditBol.saveAndShipLater();
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });

        $save_ship_now_btn.on('click', function (e) {
            e.preventDefault();
            EditBol.finalizeOptions('yes', 'finalize');
            EditBol.setServiceType();
            EditBol.emptyBilltoFields();
            EditBol.validate.firstLineRequired();

            if(EditBol.validate.allDimsRequiredOrNone()){
                EditBol.validateFields.checkFields(EditBol.add_edit_bol_form_obj.elements, function (result) {
                    if (result === true) {
                        if (AddressLine.isValid(address_objs)) {
                            EditBol.promoCode.hasBeenApplied(function (promo_ok) {
                                if (promo_ok === true) {
                                    EditBol.validate.lineItemCheck(function (result) {
                                        EditBol.saveAndShipNow();
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });

        $save_template_btn.on('click', function (e) {
            EditBol.finalizeOptions('no', 'template');
            EditBol.setServiceType();
            if (template_title !== null && template_title.value === '') {
                Averitt.setError(template_title, 'Required Field');
                template_title.focus();
                template_title.select();
            } else if (AddressLine.isValid(address_objs)) {
                let result = EditBol.validate.validatePoNumField();
                if (result === true) {
                    Averitt.formDialog.appendOverlay(function () {
                        EditBol.enableAccountFields();
                        add_edit_bol_form_obj.submit();
                    }, 'Saving Template');
                }
            }
        });

        // Assign events on the modal buttons
        jQuery("#confirmation-confirm").on("click", function(e) {
            e.preventDefault();
            $('#confirmation-modal').modal("hide");

            if (EditBol.itemToDel.type === "Ship Item") {
                AddRemoveRow.deleteSection(EditBol.itemToDel.dataObj.parent,
                                           EditBol.itemToDel.dataObj.index,
                                           EditBol.itemToDel.dataObj.$container,
                                           EditBol.itemToDel.dataObj.id,
                                           EditBol.itemToDel.dataObj.local_obj);
            } else if (EditBol.itemToDel.type === "Frequent Description") {
                EditBol.deleteDescription(EditBol.itemToDel.dataObj.desc_val,
                                          EditBol.itemToDel.dataObj.customer_val,
                                          EditBol.itemToDel.dataObj.$description);
            }


        });

        jQuery("#confirmation-cancel").on("click", function(e) {
            e.preventDefault();
            $('#confirmation-modal').modal("hide");
        });

        jQuery("#alert-ok-editBol").on("click", function(e) {
            e.preventDefault();
            $('#alert-modal').modal("hide");
            if (EditBol.alertModal.scrollTo !== undefined) {
                Averitt.scrollToSection( EditBol.alertModal.scrollTo );//do not remove
            }
        });
    },

    preventEnterSubmit: function () {
        let is_textarea;

        $(EditBol.add_edit_bol_form_obj).on('keypress', function (e) {
            is_textarea = $(e.target).is('textarea');

            if (e.which === '13') {
                if (is_textarea === false) {
                    e.preventDefault();
                }
            }
        });
    },

    isChecked: function (checkbox) {
        if (checkbox.checked === true) {
            return true;
        } else {
            return false;
        }
    },

    // The following method is used by the AddRemoveRow object
    clearInputRow: function (index) {
        let doc         = document,
            lhaz_yes    = doc.getElementById('hazmatToggleYes-' + index),
            lhaz_no     = doc.getElementById('hazmatToggleNo-' + index),
            lunits      = doc.getElementById('lunits-' + index),
            lutype      = doc.getElementById('lutype-' + index),
            lclass      = doc.getElementById('lclass-' + index),
            lnmfc       = doc.getElementById('lnmfc-' + index),
            lnmfc_sub   = doc.getElementById('lnmfcsub-' + index),
            lwgt        = doc.getElementById('lwgt-' + index),
            llen        = doc.getElementById('llen-' + index),
            lwid        = doc.getElementById('lwid-' + index),
            lhgt        = doc.getElementById('lhgt-' + index),
            ldensity    = doc.getElementById('density-' + index),
            ldesc       = doc.getElementById('ldesc-' + index),
            har_code    = doc.getElementById('har-code-' + index),
            val_by_comm = doc.getElementById('val-by-comm-' + index);

        //if HAZMAT is set to Yes then trigger clicking the No to hide/reset HAZMAT fields
        if ( lhaz_yes.checked === true ) {
            $(lhaz_no).trigger('click');
        }

        lunits.value                 = '';
        lutype.options.selectedIndex = 0;
        lclass.options.selectedIndex = 0;
        lnmfc.value                  = '';
        lnmfc_sub.value              = '';
        lwgt.value                   = '';
        llen.value                   = '';
        lwid.value                   = '';
        lhgt.value                   = '';
        ldensity.value               = '';
        ldesc.value                  = '';

        // empty puerto rico fields
        har_code.value = '';
        val_by_comm.value = '';
    },

    enableAccountFields: function () {
        this.disableAccountFields(Shipper, false);
        this.disableAccountFields(Consignee, false);
        this.disableAccountFields(Billto, false);
    },

    disableAccountFields: function (obj, disabledValue) {
        //console.log("disableAccountFields - " + disabledValue + " - " + obj.account_fields.length);
        $.each(obj.account_fields, function(idx, $field_obj) {
            $field_obj.prop('disabled', disabledValue);
            //console.log("disableAccountFields - " + $field_obj.attr('id') + " - " + $field_obj.prop('disabled'));
        });
    },


    setServiceType: function () {
        let service_type = document.getElementById('serviceType');
        let upsell_type  = document.getElementById('upselltype');

        // When loading from the Rate Quote, the user will not have the option to select (i.e. check) a "by 5" or "by noon" shipment option.
        // This (guarantee shipping option) is selected in the Rate Quote page instead.
        if (document.getElementById('is-from-ratequote').value !== 'true') {
            if (EditBol.isGuaranteeDeliveryBy5Checked()) {
                service_type.value = 'definite';
                upsell_type.value = 'by5';
            } else if (EditBol.isGuaranteeDeliveryByNoonChecked()) {
                service_type.value = 'definite';
                upsell_type.value = 'byNoon';
            } else {
                service_type.value = 'standard';
                upsell_type.value = '';
            }
        }
    },

    saveAndShipLater: function () {
        let doc                           = document,
            service_type               = doc.getElementById('serviceType');
        //console.log('saveAndShipLater()');
        if (service_type.value === 'definite' || EditBol.isGuaranteeDeliveryByChecked()) {
            //console.log('saveAndShipLater() - definite');
            // if upsell flag is set, upsell message
            Averitt.modal.message = '';
            Averitt.modal.message += '<h3 class="modal-title"><em>Note:</em></h3>';
            Averitt.modal.message += '<p class="modal-contents">You&#8217;ve selected to <strong>Save and Ship Later</strong>, but we noticed your shipment includes a Guaranteed Shipment option.</p>';
            Averitt.modal.message += '<p class="modal-contents">In order for your guaranteed shipping options to apply to this shipment, you&#8217;ll need to be sure to complete the shipment in ShipPlus no later than 3:00 pm on the date your shipment needs to be picked up.</p>';
            Averitt.modal.message += '<p class="modal-contents">Questions? If you need website assistance contact Customer Technology Support at 877-281-7131. If you need assistance with your guaranteed shipment contact our Specialized Services team at 866-249-8496.</p>';
            Averitt.modal.message += '<ul class="modal-controls">';
            Averitt.modal.message += '<li class="li-last"><div class="ae-button--secondary" id="ship-later-cancel">Cancel</div></li>';
            Averitt.modal.message += '<li><div class="ae-button--secondary" id="ship-later-confirm">Save and Ship Later</div></li>';
            Averitt.modal.message += '</ul>';

            Averitt.modal.appendOverlay(false, false);
            // The following class removal added for Shipplus-556 to eliminate padding in the modal.
            document.getElementById("modal-contents").classList.remove("modal-contents");

            $('#ship-later-confirm').on('click', function () {
                Averitt.modal.message = '';
                Averitt.modal.deleteModal();
                EditBol.setAcknowledgeModalMessage();
            });

            $('#ship-later-cancel').on('click', function () {
                Averitt.modal.message = '';
                Averitt.modal.deleteModal();
            });
        } else {
            //console.log('saveAndShipLater() - set ack');
            EditBol.setAcknowledgeModalMessage();
        }
    },

    setAcknowledgeModalMessage: function () {
        Averitt.modal.message = '';
        Averitt.modal.message += '<h3 class="modal-title"><em>Important:</em></h3>';
        Averitt.modal.message += '<p class="modal-contents">Upon completion of the shipping process an invoice will be generated.</p>';
        Averitt.modal.message += '<p class="modal-contents">Please review your freight charge selections.</p>';
        Averitt.modal.message += '<p class="modal-contents">Check the accuracy of the information entered so we can ensure proper billing/invoice.</p>';
        Averitt.modal.message += '<ul class="modal-controls">';
        Averitt.modal.message += '<li class="li-last"><div class="ae-button--secondary" id="acknowledge-cancel">Cancel</div></li>';
        Averitt.modal.message += '<li><div class="ae-button--secondary" id="acknowledge">Continue</div></li>';
        Averitt.modal.message += '</ul>';

        Averitt.modal.appendOverlay(false, false);
        // The following class removal added for REDESIGN-435 to eliminate padding in the modal.
        document.getElementById("modal-contents").classList.remove("modal-contents");

        $('#acknowledge').on('click', function () {
            Averitt.modal.message = '';
            Averitt.modal.deleteModal();
            Averitt.formDialog.appendOverlay(function () {
                EditBol.enableAccountFields();
                EditBol.add_edit_bol_form_obj.submit();
            });
        });

        $('#acknowledge-cancel').on('click', function () {
            Averitt.modal.message = '';
            Averitt.modal.deleteModal();
        });
    },

    saveAndShipNow: function () {
        EditBol.setAcknowledgeModalMessage();
    },

    toggleStandardGuarantee: function () {
        let bol_comments            = document.getElementById('bol-comments'),
            service_type            = document.getElementById('serviceType'),
            upsell_type             = document.getElementById('upselltype'),
            $standard_option_fields = $('#standard-option-fields'),
            message                 = 'Guaranteed Delivery by 5',
            regex                  = /Guaranteed Delivery by 5/gm;

        EditBol.resetStandardGuaranteeComments();

        if (EditBol.isGuaranteeDeliveryByChecked()) {
            EditBol.requireStandardOptionFields();
            EditBol.showTarget($standard_option_fields);

            // update hidden fields
            service_type.value = 'definite';
            upsell_type.value = 'by5';

            if (EditBol.isGuaranteeDeliveryByNoonChecked()) {
                // if Consignee zip code is in the list of zip codes that are not eligible for Guaranteed Delivery by Noon
                upsell_type.value = 'byNoon';
                message = 'Guaranteed Delivery by Noon';
                regex = /Guaranteed Delivery by Noon/gm;
            }

            // update bol comments
            if (bol_comments.value === '') {
                bol_comments.value = message;
            } else if (bol_comments.value.match(regex) === null) {
                bol_comments.value += '\n' + message;
            }
        } else {
            EditBol.resetStandardGuarantee();
        }
    },
    resetStandardGuarantee: function() {
        let service_type = document.getElementById('serviceType'),
            upsell_type = document.getElementById('upselltype'),
            $standard_option_fields = $('#standard-option-fields');

        EditBol.resetStandardGuaranteeComments();
        EditBol.clearStandardOptionFields();
        EditBol.hideTarget($standard_option_fields);

        // update hidden fields
        service_type.value = 'standard';
        upsell_type.value = '';
    },

    resetStandardGuaranteeComments: function() {
        let bol_comments = document.getElementById('bol-comments'),
            messages = ['Guaranteed Delivery by 5', 'Guaranteed Delivery by Noon'];

        messages.forEach (function (msg) {
            bol_comments.value = bol_comments.value.replace(msg, '');
        });
    },

    clearStandardOptionFields: function () {
        let $name,
            $email,
            $phone1,
            $phone2,
            $phone3,
            $position;

        if (document.getElementById('ltl-contact-name') !== null) {
            $name     = $('#ltl-contact-name');
            $email    = $('#ltl-contact-email');
            $phone1   = $('#ltl-contact-phone-area');
            $phone2   = $('#ltl-contact-phone-first');
            $phone3   = $('#ltl-contact-phone-last');
            $position = $('#ltl-contact-position');
        } else if (document.getElementById('ltl-contact-ratequote-name') !== null) {
            $name     = $('#ltl-contact-ratequote-name');
            $email    = $('#ltl-contact-ratequote-email');
            $phone1   = $('#ltl-contact-ratequote-phone-area');
            $phone2   = $('#ltl-contact-ratequote-phone-first');
            $phone3   = $('#ltl-contact-ratequote-phone-last');
            $position = $('#ltl-contact-ratequote-position');
        }

        if ($name !== undefined) {
            $name.val('').removeClass('required').removeClass('contactName');
            $email.val('').removeClass('email');
            $phone1.val('').removeClass('required');
            $phone2.val('').removeClass('required');
            $phone3.val('').removeClass('required');
            $position.val('');
        }
    },

    // TODO: upsellContactShipNow was used before and set to true to confirm all upsell contact fields were populated.
    // this may not be needed now.
    requireStandardOptionFields: function () {
        let $name,
            $email,
            $phone1,
            $phone2,
            $phone3;

        if (document.getElementById('ltl-contact-name') !== null) {
            $name   = $('#ltl-contact-name');
            $email  = $('#ltl-contact-email');
            $phone1 = $('#ltl-contact-phone-area');
            $phone2 = $('#ltl-contact-phone-first');
            $phone3 = $('#ltl-contact-phone-last');
        } else if (document.getElementById('ltl-contact-ratequote-name') !== null) {
            $name   = $('#ltl-contact-ratequote-name');
            $email  = $('#ltl-contact-ratequote-email');
            $phone1 = $('#ltl-contact-ratequote-phone-area');
            $phone2 = $('#ltl-contact-ratequote-phone-first');
            $phone3 = $('#ltl-contact-ratequote-phone-last');
        }

        if ($name !== undefined) {
            $name.addClass('required').addClass('contactName');
            $email.addClass('email');
            $phone1.addClass('required');
            $phone2.addClass('required');
            $phone3.addClass('required');
        }
    },

    togglePuertoRicoFields: function (callback_city_input, callback_state, callback_country) {
        let freight_section = document.getElementById('freight-included'),
            pr_section      = document.getElementById('puerto-rico-fields'),
            $items_to_ship  = $('#items-to-ship'),
            $pr_line_items  = $items_to_ship.find('.js-pr-line-item');

        if (callback_state === 'PR') {
            freight_section.className = 'ae-checkbox-group ae-m--bottom-large';
            $pr_line_items.removeClass('js-init-hidden');
            pr_section.className = 'ae-section';
            EditBol.requirePuertoRicoFields();
            EditBol.is_puerto_rico = true;
        } else if(freight_section !== null){
            freight_section.className = 'ae-checkbox-group js-init-hidden';
            $pr_line_items.addClass('js-init-hidden');
            pr_section.className = 'js-init-hidden';
            EditBol.emptyPuertoRicoFields();
            EditBol.is_puerto_rico = false;
        }
    },

    submitForm: function (the_form, e) {
        e.preventDefault();
        EditBol.emptyBilltoFields();

        EditBol.validateFields.checkFields(the_form.elements, function (result) {
            if (result === true) {
                EditBol.promoCode.hasBeenApplied(function (promo_ok) {
                    if (promo_ok === true) {
                        Averitt.formDialog.appendOverlay(function () {
                            EditBol.enableAccountFields();
                            the_form.submit();
                        });
                    }
                });
            }
        });
    },

    // Some of the Billto fields may have been set to 'required' if user
    // clicks 'Add to Address Book'
    // If any of their values happen to be empty upon form submission,
    // make sure those required classes are removed to prevent false positives
    emptyBilltoFields: function () {
        let $bn           = $('#BN'),
            $ba           = $('#BA1'),
            $b_country    = $('#billto-country'),
            $bc           = $('#BC'),
            $bz           = $('#BZ'),
            $bs           = $('#BS'),
            $phone1       = $('#billto-phone-area'),
            $phone2       = $('#billto-phone-first'),
            $phone3       = $('#billto-phone-last'),
            $bn_error     = $('#BN-error'),
            $ba_error     = $('#BA1-error'),
            $b_country_error = $('#billto-country-error'),
            $bc_error     = $('#BC-error'),
            $bz_error     = $('#BZ-error'),
            $bs_error     = $('#BS-error'),
            $phone1_error = $('#billto-phone-area-error'),
            $phone2_error = $('#billto-phone-first-error'),
            $phone3_error = $('#billto-phone-last-error');

        if ($bn.val() === '' &&
            $ba.val() === '' &&
            ($b_country.val() === '' ||
             $b_country.val() === 'US') &&
            $bc.val() === 'Choose City' &&
            $bz.val() === '' &&
            $bs.val() === '' &&
            $phone1.val() === '' &&
            $phone2.val() === '' &&
            $phone3.val() === '') {

            // remove required classes and error classes
            $bn.removeClass('required error-input');
            $ba.removeClass('required error-input');
            $b_country.removeClass('requiredSelect error-input');
            $bc.removeClass('chooseCity error-input');
            $bz.removeClass('zip error-input');
            $bs.removeClass('required error-input');
            $phone1.removeClass('required error-input');
            $phone2.removeClass('required error-input');
            $phone3.removeClass('required error-input');

            // remove any error messages
            $bn_error.remove();
            $ba_error.remove();
            $b_country_error.remove();
            $bc_error.remove();
            $bz_error.remove();
            $bs_error.remove();
            $phone1_error.remove();
            $phone2_error.remove();
            $phone3_error.remove();

            // Update EditBol.validate.valid_fields.billto
            EditBol.validate.valid_fields.billto = true;
        }
    },

    removePhoneRequired: function (obj) {
        //console.log('removePhoneRequired: ' + obj);
        $(obj.obj_phone_area).removeClass('required');
        $(obj.obj_phone_first).removeClass('required');
        $(obj.obj_phone_last).removeClass('required');
    },

    requireBilltoFields: function () {
        let $bn     = $('#BN'),
            $ba     = $('#BA1'),
            $b_country = $('#billto-country'),
            $bc     = $('#BC'),
            $bz     = $('#BZ'),
            $bs     = $('#BS'),
            $phone1 = $('#billto-phone-area'),
            $phone2 = $('#billto-phone-first'),
            $phone3 = $('#billto-phone-last');

        $bn.addClass('required');
        $ba.addClass('required');
        $b_country.addClass('requiredSelect');
        $bc.addClass('chooseCity');
        $bz.addClass('zip');
        $bs.addClass('required');
        $phone1.addClass('required');
        $phone2.addClass('required');
        $phone3.addClass('required');
    },

    requireDefaultBrokerFields: function () {
        let name  = $('#broker-name'),
            phone = $('#broker-phone');

        name.addClass('required');
        phone.addClass('positiveOrZeroInteger');
    },

    requireDefaultMexicanBrokerFields: function () {
        let address = $('#broker-address'),
            city    = $('#broker-city'),
            state   = $('#broker-state'),
            zip     = $('#broker-zip');

        address.addClass('required');
        city.addClass('required');
        state.addClass('required');
        zip.addClass('zip');
    },

    requirePuertoRicoFields: function () {
        let $name           = $('#pp-name'),
            $irs            = $('#pp-irs'),
            terms           = document.getElementById('pr-terms');

        $name.addClass('required');
        $irs.addClass('required');
        terms.className = 'requiredCheckboxTerms';
    },

    emptyPuertoRicoFields: function () {
        let $name        = $('#pp-name'),
            $irs         = $('#pp-irs'),
            terms        = document.getElementById('pr-terms');

        $name.removeClass('required');
        $irs.removeClass('required');
        terms.className = '';

        $name.val('');
        $irs.val('');
        terms.checked = false;
    },

    removeLineItemDescRequirement: function () {
        let ldesc = document.getElementsByName('ldesc'),
            len   = ldesc.length;

        while (len--) {
            ldesc[len].className = 'ae-input js-ldesc';
        }
    },

    // Set blur events on potentially required fields in Items to Ship: lunits, lwgt, ldesc
    setLineItemEvents: function (index) {
        let $lunits         = $('#lunits-' + index),
            $lwgt           = $('#lwgt-' + index),
            $llen           = $('#llen-' + index),
            $lwid           = $('#lwid-' + index),
            $lhgt           = $('#lhgt-' + index),
            $ldensity       = $('#density-' + index),
            isReadOnly      = $lwgt.hasClass('mute'),
            $ldesc          = $('#ldesc-' + index),
            $val_by_comm    = $('#val-by-comm-' + index);
        
        if ($lwgt.hasClass('mute')){
            $ldensity.parent().remove();
        }

        $lunits.on('blur', function () {
            if (this.value !== '') {
                $lunits.addClass('positiveInteger');
                if (!isReadOnly) {
                    $lwgt.addClass('positiveInteger');
                }
                if ($ldesc.parent().css('display') !== 'none') {
                    $ldesc.addClass('required');
                }
                if (EditBol.is_puerto_rico === true) {
                    $val_by_comm.addClass('required dollarsAndCents72');
                } else {
                    $val_by_comm.removeClass('required dollarsAndCents72');
                }
                EditBol.updateDensityField(index, EditBol.calculateDensity(index));  
            }
        });

        $lwgt.on('blur', function () {
            let isReadOnly      = $lwgt.hasClass('mute');
            if (this.value !== '') {
                $lunits.addClass('positiveInteger');
                if (!isReadOnly) {
                    $lwgt.addClass('positiveInteger');
                }
                if ($ldesc.parent().css('display') !== 'none') {
                    $ldesc.addClass('required');
                }
                if (EditBol.is_puerto_rico === true) {
                    $val_by_comm.addClass('required dollarsAndCents72');
                } else {
                    $val_by_comm.removeClass('required dollarsAndCents72');
                }
                EditBol.updateDensityField(index, EditBol.calculateDensity(index));  
            }
        });
        
        $llen.on('blur', function () {
            if (this.value !== '') {
                EditBol.updateDensityField(index, EditBol.calculateDensity(index));  
            }
        });
        
        $lwid.on('blur', function () {
            if (this.value !== '') {
                EditBol.updateDensityField(index, EditBol.calculateDensity(index));  
            }
        });
        
        $lhgt.on('blur', function () {
            if (this.value !== '') {
                EditBol.updateDensityField(index, EditBol.calculateDensity(index));  
            }
        });

        $ldesc.on('blur', function () {
            let isReadOnly      = $lwgt.hasClass('mute');
            if (this.value !== '') {
                $lunits.addClass('positiveInteger');
                if (!isReadOnly) {
                    $lwgt.addClass('positiveInteger');
                }
                if ($ldesc.parent().css('display') !== 'none') {
                    $ldesc.addClass('required');
                }
                if (EditBol.is_puerto_rico === true) {
                    $val_by_comm.addClass('required dollarsAndCents72');
                } else {
                    $val_by_comm.removeClass('required dollarsAndCents72');
                }
            }
        });

        $val_by_comm.on('blur', function () {
            let isReadOnly      = $lwgt.hasClass('mute');
            if (this.value !== '') {
                $lunits.addClass('positiveInteger');
                if (!isReadOnly) {
                    $lwgt.addClass('positiveInteger');
                }
                if ($ldesc.parent().css('display') !== 'none') {
                    $ldesc.addClass('required');
                }
                if (EditBol.is_puerto_rico === true) {
                    $val_by_comm.addClass('required dollarsAndCents72');
                } else {
                    $val_by_comm.removeClass('required dollarsAndCents72');
                }
            }
        });
    },
    
    calculateDensity: function(index) {
        let piecesFieldValue = $('#lunits-' + index).val();
        let weightFieldValue = $('#lwgt-' + index).val();
        let lengthFieldValue = $('#llen-' + index).val();
        let widthFieldValue = $('#lwid-' + index).val();
        let heightFieldValue = $('#lhgt-' + index).val();
        if(Number(piecesFieldValue) && Number(weightFieldValue) && Number(lengthFieldValue) 
            && Number(widthFieldValue) && Number(heightFieldValue)) {
            let volume = EditBol.calculateVolume(Number(lengthFieldValue),
                Number(widthFieldValue), Number(heightFieldValue), Number(piecesFieldValue));
            if (Number(weightFieldValue) == 0.0  || volume == 0.0) {
                return 0.0;
            } else {
                return (Number(weightFieldValue) / volume).toFixed(2);
            }
       }
    },
    
    calculateVolume: function(length, width, height, pieces) {
        return (EditBol.inchesToFeet(height) * 
            EditBol.inchesToFeet(width) * 
            EditBol.inchesToFeet(length) * 
            pieces);
    },
    
    inchesToFeet: function(inches) {
        return (inches === 0.0 ? 0.0 : inches / 12);
    },
    
    updateDensityField: function(index, density) {
         $('#density-' + index).val(density);
    },

    toggleInternationalFields: function (select_input) {
        let doc                   = document,
            freight_prepaid    = doc.getElementById('freight-prepaid'),
            content_main       = doc.getElementById('content-main'),
            is_public_bol            = content_main.getAttribute('data-is-public-bol'),
            guaranteeDeliveryBy= doc.getElementById('guaranteeDeliveryBy'),
            $blind_shipment          = $('#blind-shipment'),
            $standard_container      = $('#standard-guarantee-container'),
            $freight_collect         = $('#freight-collect-container'),
            $broker_fields           = $('#international-broker-fields'),
            $mexican_broker_fields   = $('#mexican-broker-fields');

        if (select_input.value === 'MX' || select_input.value === 'CA') {
            // Standard LTL Guarantee is not an option on shipments moving to Mexico or Canada.
            EditBol.hideTarget($standard_container);

            // Set correct state of Standard LTL Guarantee section
            EditBol.toggleStandardGuarantee();
            EditBol.resetGuaranteeDeliveryBy();

            // When we had a BOL with Standard LTL Guarantee coming from rate quote
            EditBol.clearStandardOptionFields();

            // Show international Customs Broker Information
            EditBol.showTarget($broker_fields);

            // Add validation classes to broker fields
            EditBol.requireDefaultBrokerFields();
        } else {
            // Set correct state of Standard LTL Guarantee section
            EditBol.showTarget($standard_container);
            // When "if" is not present, upsell rate quotes are treated as standard shipments.
            if (guaranteeDeliveryBy !== undefined && guaranteeDeliveryBy !== null) {
                EditBol.toggleStandardGuarantee();
            }

            // clear all standard broker fields
            EditBol.resetStandardBrokerFields();

            // clear all Mexican broker fields
            EditBol.resetMexicanBrokerFields();
            EditBol.hideTarget($broker_fields);
        }

        if (select_input.value === 'MX') {
            // Mexico cannot have Blind Shipment
            if (is_public_bol === 'false') {
                $blind_shipment[0].checked = false;
                $blind_shipment.prop('disabled', true);
            }

            // Freight Charges should be locked down to Prepaid on Mexico Consignees.
            freight_prepaid.checked = true;
            EditBol.hideTarget($freight_collect);

            // Show Mexican Customs Broker fields
            EditBol.showTarget($mexican_broker_fields);

            // Add validation classes to broker fields
            EditBol.requireDefaultMexicanBrokerFields();
        } else {
            $blind_shipment.prop('disabled', false);
            EditBol.showTarget($freight_collect);

            // clear all Mexican broker fields
            EditBol.resetMexicanBrokerFields();
            EditBol.hideTarget($mexican_broker_fields);
        }

        if (EditBol.isGuaranteeDeliveryByChecked()) {
            EditBol.toggleStandardGuarantee();
        }
    },

    finalizeOptions: function (shipNow, saveType) {
        document.getElementById('shipNow').value = shipNow;
        document.getElementById('saveType').value = saveType;
    },

    submitPublicForm: function () {
        let editForm            = document.getElementById('add-edit-bol'),
            hazmat_inputs    = document.getElementsByName('lhazflag');

        editForm.action = "/print-email-bol";

        let idx;
        EditBol.validate.mustDeliverByDateCheck(function (is_valid_date) {
            if (is_valid_date) {
                for (idx = hazmat_inputs.length - 1; idx >= 0; idx--) {
                    EditBol.toggleRequireLineItemFields(hazmat_inputs[idx], idx);
                }
                EditBol.validate.lineItemCheck(function (is_line_item_valid) {
                    if (is_line_item_valid === true) {
                        EditBol.validate.unNumberCheck(function(is_unnumber_valid) {
                            if (is_unnumber_valid === true) {
                                EditBol.validate.hazMatEmergencyContactCheck(function (is_hazmat_valid) {
                                    if (is_hazmat_valid === true) {
                                        Averitt.formDialog.appendOverlay(function () {
                                            EditBol.enableAccountFields();
                                            editForm.submit();
                                        }, 'Processing BOL Request');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    toggleRequireLineItemFields: function (hazmat_input, index) {
        let lunits = document.getElementsByName('lunits'),
            lwgt   = document.getElementsByName('lwgt'),
            isReadOnly = $(lwgt[index]).hasClass('mute');

        if (hazmat_input.value === "Y") {
            lunits[index].className = 'ae-input positiveInteger';
            if (!isReadOnly) {
                lwgt[index].className   = 'ae-input positiveInteger';
            }
        }
    },

    resetStandardBrokerFields: function () {
        let doc        = document,
            name       = doc.getElementById('broker-name'),
            phone      = doc.getElementById('broker-phone'),
            fax        = doc.getElementById('broker-fax'),
            is_in_bond = doc.getElementById('is-in-bond');

        if (doc.getElementById('broker-name')) {
            name.value  = '';
            phone.value = '';
            fax.value   = '';
            is_in_bond.checked = false;

            // Remove validation classes
            name.className  = 'ae-input--full';
            phone.className = 'ae-input';

            // clear any inline error messaging
            $('#broker-name-error').remove();
            $('#broker-phone-error').remove();
        }
    },

    resetMexicanBrokerFields: function () {
        let doc     = document,
            address = doc.getElementById('broker-address'),
            city    = doc.getElementById('broker-city'),
            state   = doc.getElementById('broker-state'),
            zip     = doc.getElementById('broker-zip');

        if (doc.getElementById('broker-address')) {
            address.value = '';
            city.value    = '';
            state.value   = '';
            zip.value     = '';

            // Remove validation classes
            address.className = 'ae-input--full';
            city.className    = 'ae-input';
            state.className   = 'ae-input--state';
            zip.className     = 'ae-input--zip';

            // clear any inline error messaging
            $('#broker-address-error').remove();
            $('#broker-city-error').remove();
            $('#broker-state-error').remove();
            $('#broker-zip-error').remove();
        }
    },

    registerUNnumberEvents: function ($un_number) {
        //console.log("registerUNnumberEvents(" + $un_number.attr('id') + ") ");
        let index          = $un_number.attr('id').split('-').pop(); // un-number-6 -> 6
        let old_value      = $un_number.val().toUpperCase(),
            $nos_desc      = $('#nos-desc-' + index),
            nos_desc_value = '' + $nos_desc.val();
        //console.log("registerUNnumberEvents(" + index + ") id: " + $un_number.attr('id') + " old: " + old_value);
        // Force update on register
//This was causing getHazmatData to be called twice as this is setup in HAZMAT toggle
//        EditBol.getHazmatData($un_number.get(0),
//                              index, true);
//        // Restore NOS description value...
//        $nos_desc.val(nos_desc_value);

        $un_number.on('keydown', function ($event) {
            old_value = $un_number.val().toUpperCase();
        });

        $un_number.on('keyup', function ($event) {
            let new_value = $un_number.val().toUpperCase();
            $un_number.val(new_value);
            //console.log("$un_number.on(" + $event.type + ") id: " + $un_number.attr('id') + " old: " + old_value + " new: " + new_value);
            if (new_value !== old_value) {
                // Populate UN Description select
                EditBol.getHazmatData($un_number.get(0),
                                      index, false);
            }
        });
    },

    // Clears Handling Units, Unit & Type, Class, NMFC, Sub, Weight, Description, and Hzmt checkbox
    resetHandlingFields: function (index) {
        //console.log("resetHandlingFields(" + index + ") ");
        let doc         = document,
            $desc_group = $('#js-desc-group-' + index),
            lunits      = doc.getElementById('lunits-' + index),
            lutype      = doc.getElementById('lutype-' + index),
            lclass      = doc.getElementById('lclass-' + index),
            lnmfc       = doc.getElementById('lnmfc-' + index),
            lnmfcsub    = doc.getElementById('lnmfcsub-' + index),
            lwgt        = doc.getElementById('lwgt-' + index),
            llen        = doc.getElementById('llen-' + index), 
            lwid        = doc.getElementById('lwid-' + index),
            lhgt        = doc.getElementById('lhgt-' + index),            
            ldesc       = doc.getElementById('ldesc-' + index),
            lhazflag    = doc.getElementById('lhazflag-' + index);

        // Clear values
        lunits.value = '';
        lutype.value = 'SK';
        lclass.value = '50';
        lnmfc.value = '';
        lnmfcsub.value = '';
        lwgt.value = '';
        llen.value = '';
        lwid.value = '';
        lhgt.value = '';
        ldesc.value = '';
        // Close and uncheck hazard fields
        lhazflag.checked = false;

        // restore standard description
        $desc_group.css('display', 'block');
        $desc_group.animate({
            'opacity': 1
        }, 200);
    },

    // SHIPPLUS-541 -  isNos-index field added to jsp to hold true or false for isNos.
    // Clears PkgClass, HazClass, Description, IsNos and hides NOS Description fields
    resetHazardFields: function (index) {
        //console.log("resetHazardFields(" + index + ") ");
        let $un_number     = $('#un-number-' + index),
            $hazgrp        = $('#hazmat-group-' + index),
            $select_obj    = $('#haz-select-' + index),
            $multi_un_desc = $('#multiple-un-desc-' +index),
            $nos_container = $('#nos-container-' + index),
            $is_nos        = $('#isNos-' + index),
            $nos_desc      = $('#nos-desc-' + index),
            $pkg           = $('#pkgclass-' + index),
            $haz           = $('#hazclass-' + index),
            $desc          = $('#hazdesc-' + index),
            $report_fields = $('#hazmat-report-fields-' + index),
            $no_lim_quant  = $('#limquantToggleNo-' + index );

        $select_obj.find('option').not(':first').remove().end();

        // hide sections
        EditBol.hideTarget($multi_un_desc);
        EditBol.hideTarget($report_fields);
        EditBol.hideTarget($nos_container);

        // remove required classes
        $un_number.removeClass('required')
        $select_obj.removeClass('required');
        $nos_desc.removeClass('required');
		$is_nos.removeClass('required');

        // clear values
        $un_number.val('');
        $pkg.val('');
        $haz.val('');
        $desc.val('');
        $nos_desc.val('');
        $is_nos.val('');
        $no_lim_quant.prop("checked", true);
        EditBol.removeError( $un_number[0] );
        EditBol.removeError( $hazgrp[0] );
    },

    toggleHazmatFields: function (hazmat_input) {
        //console.log("toggleHazmatFields(hazmat_checkbox_input) ");
        let $hazmat_input_item      = $('#' + hazmat_input.id),
            index          = $hazmat_input_item.attr('data-index'),
            $ul            = $hazmat_input_item.parent().parent().parent(),
            $desc_group    = $ul.find('.js-desc-group'),
            $desc_input    = $desc_group.find('.js-ldesc'),
            $hazmat_section = $('#hazmat-group-' + index),
            $un_number     = $('#un-number-' + index),
            hazmat_radio_buttons = document.getElementsByName("hazmatToggle-" + index);

           
        for (const hazmat_radio_button of hazmat_radio_buttons){
            hazmat_radio_button.addEventListener('click', function () {
                EditBol.toggleHazmatRadioButtons(hazmat_radio_button.value, hazmat_input, index);
            });
        }   
            

        // If hazmat is checked on page load, show hazmat dependent fields
        if (hazmat_input.value === "Y") {
            EditBol.expandHazmt($desc_input,
                                $desc_group,
                                $hazmat_section,
                                $un_number,
                                index,
                                false);

            // Populate UN Description options and show fields
            EditBol.getHazmatData($un_number.get(0),
                                  index, true);
        }
    },

    toggleHazmatRadioButtons: function (radio_value, hazmat_input, index) {
        hazmat_input.value = radio_value;
        EditBol.updateHazmat(hazmat_input, index);
    },

    updateHazmat: function (hazmat_input, index) {
        let section = hazmat_input.parentNode.parentNode.parentNode.parentNode,
                lunits = section.querySelector('input[name="lunits"]'),
                lwgt = section.querySelector('input[name="lwgt"]'),
                isReadOnly = $(lwgt).hasClass('mute'),
                $hazmat_input_item      = $('#' + hazmat_input.id),
                $ul            = $hazmat_input_item.parent().parent().parent(),
                $desc_group    = $ul.find('.js-desc-group'),
                $desc_input    = $desc_group.find('.js-ldesc'),
                $hazmat_section = $('#hazmat-group-' + index),
                $un_number     = $('#un-number-' + index);

            EditBol.removeError( $un_number[0] );  //if there are any

            //console.log('hazmat_checkbox_input.onClick() isHidden: ' + $hazmat_section.is(":hidden") + ' isVisible: ' + $hazmat_section.is(":visible"));
            if (hazmat_input.value == "Y") {
                EditBol.expandHazmt($desc_input,
                                    $desc_group,
                                    $hazmat_section,
                                    $un_number,
                                    index);
                // when it shows up add required classes
                $(lunits).addClass('positiveInteger');
                if (!isReadOnly) {
                    $(lwgt).addClass('positiveInteger');
                }
            } else {
                EditBol.contractHazmt($desc_input,
                                      $desc_group,
                                      $hazmat_section,
                                      $un_number,
                                      index);
                // reset to default classes
                $(lunits).removeClass('positiveInteger');
                if (!isReadOnly) {
                    $(lwgt).removeClass('positiveInteger');
                }
            }
        EditBol.updateHazmatContactDisplay();
    },

    contractHazmt: function ($desc_input,
                             $desc_group,
                             $hazmat_section,
                             $un_number,
                             index) {

        $desc_input.val($desc_group.children("span").text()); // restore original value
        //console.log("contractHazmt($desc_input, $desc_group, $hazmat_section, $un_number, " + index + ") ");
        EditBol.resetHazardFields(index);

        // Hide Hazardous Materials
        EditBol.hideTarget($hazmat_section);

        // if no other potentially required fields are set
        $desc_input.addClass('required');
        $desc_group.css('display', 'block');
        $desc_group.animate({
            'opacity': 1
        }, 200);

        // Remove required class on un_number
        $un_number.removeClass('required');
    },

    expandHazmt: function ($desc_input,
                           $desc_group,
                           $hazmat_section,
                           $un_number,
                           index,
                           is_unfocus) {
        //console.log("expandHazmt($desc_input, $desc_group, $hazmat_section, $un_number, " + index + ", " + is_unfocus + ") ");
        // Hide description and clear value
        $desc_input.val('');
        $desc_input.removeClass('required error-input');

        $desc_group.animate({
            'opacity': 0
        }, 200, function () {
            $desc_group.css('display', 'none');
            $('#ldesc-' + index + '-error').remove();
        });

        // Show Hazardous Materials
        EditBol.showTarget($hazmat_section);

        // focus on UN number if not on pageload
        if (is_unfocus !== false || is_unfocus === undefined) {
            $un_number.trigger('focus');
        }

        // Set required class to un_number
        $un_number.addClass('required');
    },

    // If any boxes are checked, make sure Hazmat Contact shows
    updateHazmatContactDisplay: function () {
        let  $hazmat_contact = $('#hazmat-contact'),
             $phone1       = $('#hazmat-contact-phone-area'),
             $phone2       = $('#hazmat-contact-phone-first'),
             $phone3       = $('#hazmat-contact-phone-last'),
             $contact_name = $('#emergency-name');

        //console.log('updateHazmatContactDisplay(check_input, $hazmat_contact) ');
        EditBol.hazmat_count = 0;
        let  hazmat_inputs = document.getElementsByName('lhazflag');
        for (const hazmat_input of hazmat_inputs){
            if (hazmat_input.value == "Y"){
                EditBol.hazmat_count++;
            }
        }
        //console.log(EditBol.hazmat_checkbox_count);

        if (EditBol.hazmat_count > 0) {
            //console.log("show $hazmat_contact #" + EditBol.hazmat_checkbox_count);
            EditBol.showTarget($hazmat_contact);
            $phone1.addClass('areaCode required');
            $phone2.addClass('threePositiveDigits required');
            $phone3.addClass('fourPositiveDigits required');
            $contact_name.addClass('required');
        } else {
            //console.log("hide $hazmat_contact #" + EditBol.hazmat_checkbox_count);
            EditBol.hideTarget($hazmat_contact);
            $phone1.removeClass('areaCode required');
            $phone2.removeClass('threePositiveDigits required');
            $phone3.removeClass('fourPositiveDigits required');
            $contact_name.removeClass('required');
        }
    },

    getHazmatData: function (input_obj,
                             index_num, fromPageLoad) {
        //console.log("getHazmatData(input_obj, " + index_num + ") ");
        let num = input_obj.value,
            response_ary,
            response,
            $multi_un_desc = $('#multiple-un-desc-' + index_num),
            $report_fields = $('#hazmat-report-fields-' + index_num),
            $desc_select   = $('#haz-select-' + index_num);
        if (num.length === 6) {
            //console.log("getHazmatData(input_obj, " + index_num + ") ajax call to get data...");
            $.ajax({
                type: 'post',
                url: '/HazMaterials',
                data: {
                    method: 'fillHazMat',
                    unNum: num,
                    index: index_num
                }
            }).done(function (data) {
                response_ary = data.split('|');
                //console.log("getHazmatData(input_obj, " + index_num + ") response_ary: " + response_ary);

                response = EditBol.parseHazmatResponse(input_obj,
                                                       response_ary, fromPageLoad);
                EditBol.hazmat_response = response;
                //console.log("getHazmatData(input_obj, " + index_num + ") response: " + response);
                if (response === 'invalid') {
                    EditBol.hideTarget($multi_un_desc);
                    EditBol.hideTarget($report_fields);
                } else if (response === 'multiple') {
                    // Show Hazardous Material Description fields
                    EditBol.showTarget($multi_un_desc);
                    EditBol.showTarget($report_fields);
                    $desc_select.trigger('focus');
                } else {
                    // Hide Hazardous Material Description fields
                    EditBol.hideTarget($multi_un_desc);
                    EditBol.showTarget($report_fields);
                }
            });
        } else {
            //console.log("getHazmatData(input_obj, " + index_num + ") num: " + num);
        }
    },

    parseHazmatResponse: function (input_obj,
                                   response_ary, fromPageLoad) {
        //console.log("parseHazmatResponse(input_obj, response_ary) ");
        let response_seg_1       = response_ary[1].toLowerCase(),
            len                  = response_ary.length,
            options_html         = '',
            index                = response_ary[0],
            un_desc              = document.getElementById('haz-select-' + index),
            is_nos               = false,
            $hazgrp              = $('#hazmat-group-' + index),
            $un                  = $('#un-number-' + index),
            $pkg                 = $('#pkgclass-' + index),
            $haz                 = $('#hazclass-' + index),
            $sub                 = $('#hazsubclass-' + index),
            $desc                = $('#hazdesc-' + index),
            $nos_desc            = $('#nos-desc-' + index),
            $li_sub              = $('#li-hazsubclass-' + index),
            param_pkg_class      = input_obj.getAttribute('data-pkg-class'),
            param_haz_class      = input_obj.getAttribute('data-haz-class'),
            param_haz_subclass   = input_obj.getAttribute('data-haz-subclass'),
            param_haz_desc       = input_obj.getAttribute('data-haz-desc'),
            option_el            = document.createElement('option'),
            option_temp,
            option_txt,
            options_ary = [],
            $select_desc,
            un_number,
            pkg_class            = "",
            haz_class            = "",
            sub_class            = "",
            desc                 = "",
            selected_ary,
            selected_val,
            i,
            selected = '',
            un_msg               = "",
            return_val           = response_seg_1;

        // reset fields
        EditBol.resetUnNumChildValues(index);
        EditBol.removeError( $un[0] );
        EditBol.removeError( $hazgrp[0] );

        if (response_seg_1 === 'invalid') {
            // Error
            if( fromPageLoad === false ) {
                Averitt.setError(input_obj, 'Invalid UN Number');
                input_obj.focus();
                input_obj.select();
            }
            EditBol.validate.valid_fields.items_to_ship = false;
            //console.log("parseHazmatResponse(input_obj, response_ary) INVALID");
        } else if (response_seg_1 === 'multiple') {
            // Multiple selections are received from the response,
            // therefore, populate select
            un_number = response_ary[2];

            // build selections
            // Note: Last element of array returned is empty
            for (let idx = 3; idx < len - 1; idx += 1) {
                selected_ary = response_ary[idx].split(';');
                // SHIPPLUS-541 - nos flag and descr are returned now when there are multiple records for a hazmat un number.
                // We will no longer rely on 'nos' in description to determine if option is nos or not.
                is_nos       = selected_ary[0] === 'Y' ? true : false;
                option_temp  = option_el.cloneNode(true);

                // SHIPPLUS-541 - nos flag is returned in position 0 now, so adjust index for desc fields.
                // set selected state
                if (param_pkg_class === selected_ary[1]
                        && param_haz_class === selected_ary[2]
                        && param_haz_subclass === selected_ary[3]
                        && param_haz_desc === selected_ary[4]) {
                    selected = ' selected';
                    option_temp.setAttribute('selected', 'selected');
                }

                // SHIPPLUS-541 - build hazmat description excluding nos flag
                let descrArray = response_ary[idx].split(";");
                let description = descrArray[1] + ";" + descrArray[2] + ";"+ descrArray[3] + ";"+ descrArray[4];
                option_txt = document.createTextNode(description);

                // SHIPPLUS-541 - adjust index numbers since nos flag is in position 0 now.
                option_temp.setAttribute('data-pkg-class', selected_ary[1]);
                option_temp.setAttribute('data-haz-class', selected_ary[2]);
                option_temp.setAttribute('data-haz-subclass', selected_ary[3]);
                option_temp.setAttribute('data-desc', selected_ary[4]);

                // SHIPPLUS-541 - store nos flag as an additional attribute of hazmat option.
                option_temp.setAttribute('data-nos', is_nos);

                option_temp.appendChild(option_txt);

                options_ary.push(option_temp);
            } // for-loop

            // SHIPPLUS-541 - remove is_nos from parameter list as it is not used. See MAINTENANCE-1256.
            // attach options to select
            EditBol.appendHazmatDesc(un_desc,
                                     options_ary,
                                     index);

            $select_desc = $('#haz-select-' + index);

            // Set required class on select for validation to parse later
            $select_desc.addClass('requiredSelect');

            // set change event to show and populate related fields
            $select_desc.on('change', function () {
                EditBol.setSelectedHazmatFields(this,
                                                index);

                //if stale haz mat data was previously found then there may be some error messages from setErrorForever()
                //remove the messages if they exist
                if( EditBol.staleHazmat === true) {
                    EditBol.removeError( $un[0] );
                    EditBol.removeError( $hazgrp[0] );
                    EditBol.removeError( $pkg[0] );
                    EditBol.removeError( $haz[0] );
                    EditBol.removeError( $sub[0] );
                    let $descError = $('#hazdesc-' + index + '-error');
                    EditBol.removeError( $descError[0] );
                    EditBol.removeError( $desc[0] );
                }
            });
            // Trigger change to intialize
            $select_desc.trigger('change');

            if ($select_desc[0].options.selectedIndex > 0) {
                EditBol.are_items_to_ship_valid = true;
            } else {
                EditBol.are_items_to_ship_valid = false;
            }
            //console.log("parseHazmatResponse(input_obj, response_ary) MULTIPLE");
        } else {
            // Only a single selection was returned,
            // so populate simple related fields
            un_number = response_ary[1];
            pkg_class = response_ary[2];
            haz_class = response_ary[3];
            sub_class = response_ary[4];
            desc      = response_ary[5];
            // SHIPPLUS-541 - pass nos flag value to updateHazmatFields function. Function uses this to decide whether to hide/show N.O.S. Description field.
            is_nos    = response_ary[6] === 'Y' ? true : false;
            EditBol.are_items_to_ship_valid = true;
            EditBol.updateHazmatFields(index,
                                       pkg_class,
                                       haz_class,
                                       sub_class,
                                       desc,
                                       is_nos);
            //console.log("parseHazmatResponse(input_obj, response_ary) SINGLE");
        }

        return_val = EditBol.checkForStaleHazmat( input_obj, response_ary, fromPageLoad );
        return return_val;

    },

    checkForStaleHazmat: function (input_obj, response_ary, fromPageLoad) {
        "use strict";
        let index                = response_ary[0],
            $hazgrp              = $('#hazmat-group-' + index),
            $un                  = $('#un-number-' + index),
            $pkg                 = $('#pkgclass-' + index),
            $haz                 = $('#hazclass-' + index),
            $sub                 = $('#hazsubclass-' + index),
            $desc                = $('#hazdesc-' + index),
            $nos_desc            = $('#nos-desc-' + index),
            $haz_is_nos          = $('#isNos-' + index),
            $li_sub              = $('#li-hazsubclass-' + index),
            $li_haz_select       = $('haz-select-' + index),
            response_seg_1       = response_ary[1].toLowerCase(),
            return_val           = response_seg_1;

        //only perform check if BOL or Template - not View or ...
        if( !(EditBol.bolOrTemplate === 'BOL' || EditBol.bolOrTemplate === 'Template')) {
            return return_val;
        }

        //if during page load of saved data test if underlying HAZmat data for UN number has changed and if it has make user update the BOL/template
        if( fromPageLoad === true ) {
            let un_msg,
                param_pkg_class      = input_obj.getAttribute('data-pkg-class'),
                param_haz_class      = input_obj.getAttribute('data-haz-class'),
                param_haz_subclass   = input_obj.getAttribute('data-haz-subclass'),
                param_haz_desc       = input_obj.getAttribute('data-haz-desc'),
                param_nos_desc       = $nos_desc.val(),
                param_haz_is_nos     = input_obj.getAttribute('data-nos'),
                un_number,
                pkg_class            = "",
                haz_class            = "",
                sub_class            = "",
                desc                 = "",
                haz_is_nos           = "",
                foundStaleHazmat     = false,
                performTests         = true;

            if (response_seg_1 === 'invalid') {
                un_msg = "This UN Number is no longer valid.  The old original data is shown below. You must enter a new valid UN Number or select 'No' for HAZMAT.";
                if (EditBol.bolOrTemplate === 'BOL') {
                    un_msg += " Also, after you make changes, you must save this Bol as a Draft before the BOL can be finialized and shipped.";
                } else {
                    //Template
                    un_msg += " Also, after you make changes, you must save this template before it can be used to create a BOL.";
                }
                foundStaleHazmat = true;
                return_val = 'default'; //forces HAZmat fields to show
            } else if (response_seg_1 === 'multiple') {
                un_msg = "The underlying hazmat info has changed since you last saved this " + EditBol.bolOrTemplate + ".  The old original data is shown below. You must select one of the options that best matches your old data or enter a new UN Number or select 'No' for HAZMAT.";
                if (EditBol.bolOrTemplate === 'BOL') {
                    un_msg += " Also, after you make changes, you must save this Bol as a Draft before the BOL can be finialized and shipped.";
                } else {
                    //Template
                    un_msg += " Also, after you make changes, you must save this template before it can be used to create a BOL.";
                }

                let match_found = EditBol.getMatchingUNRecord(response_ary, input_obj);
                if (!match_found){
                    $pkg.val('');
                    $haz.val('');
                    $sub.val('');
                    $desc.val('');
                    $li_haz_select.val('Select Description');
                    $nos_desc.val('');
                    $haz_is_nos.val('');
                    EditBol.setErrorForeverWithParentClass( $desc[0], "The hazardous material data is no longer valid. Please re-enter the U.N.Number and associated hazmat data.", null);
                    foundStaleHazmat = true;
                }
            } else {
                // Only a single HAZMAT selection was returned,
                un_msg = "The underlying hazmat info has changed since you last saved this " + EditBol.bolOrTemplate + ".  The new data is shown in the input fields and the old original data is shown below.";
                if (EditBol.bolOrTemplate === 'BOL') {
                    un_msg += " You must save new data to the draft BOL before the BOL can be finialized and shipped.";
                } else {
                    //Template
                    un_msg += " You must save the new data to the template before it can be used to create a BOL.";
                }

                pkg_class = response_ary[2];
                haz_class = response_ary[3];
                sub_class = response_ary[4];
                desc      = response_ary[5];
                haz_is_nos   = response_ary[6] === 'Y' ? "true" : "false";

                if (performTests) {
                    if (param_pkg_class.trim().toUpperCase() != pkg_class.trim().toUpperCase() ) {
                        foundStaleHazmat = true;
                        EditBol.setErrorForever( $pkg[0], "Original: '" + param_pkg_class.toUpperCase() + "'" );
                        //EditBol.foundStaleHazmat(index, un_msg, $pkg[0], "Original: '" + param_pkg_class.toUpperCase() + "'" );
                    }
                    if (param_haz_class.trim().toUpperCase() != haz_class.trim().toUpperCase() ) {
                        foundStaleHazmat = true;
                        EditBol.setErrorForever(  $haz[0], "Original: '" + param_haz_class.toUpperCase() + "'" );
                        //EditBol.foundStaleHazmat(index, un_msg, $haz[0], "Original: '" + param_haz_class.toUpperCase() + "'" );
                    }
                    if (param_haz_subclass.trim().toUpperCase() != sub_class.trim().toUpperCase() ) {
                        foundStaleHazmat = true;
                        EditBol.setErrorForever( $sub[0], "Original: '" + param_haz_subclass.toUpperCase() + "'" );
                        //EditBol.foundStaleHazmat(index, un_msg, $sub[0], "Original: '" + param_haz_subclass.toUpperCase() + "'" );
                        //subClass is normally hidden when blank - make sure it is always visible in this case
                        $li_sub.removeClass('mute');
                    }
                    if (param_haz_desc.trim().toUpperCase() != desc.trim().toUpperCase() ) {
                        foundStaleHazmat = true;
                        EditBol.setErrorForever( $desc[0], "Original: '" + param_haz_desc.toUpperCase() + "'" );
                        //EditBol.foundStaleHazmat(index, un_msg, $desc[0], "Original: '" + param_haz_desc.toUpperCase() + "'" );

                        //if going from (original) NOS to no NOS (new) then be sure to blank out NOS DESC nos-desc-
                        //also show the user their old value for N.O.S. Desc
                        if( param_haz_is_nos.trim() === 'true'  &&  haz_is_nos.trim() === 'false' ) {
                            $nos_desc.val("");
                            let $descError = $('#hazdesc-' + index + '-error');
                            EditBol.setErrorForeverWithParentClass( $descError[0], "Your N.O.S. Desc: '" + param_nos_desc +"'", null);
                        }
                    }
                    if (param_haz_is_nos.trim().toUpperCase() !== haz_is_nos.trim().toUpperCase() ) {
                        $nos_desc.val("");
                        foundStaleHazmat = true;
                        EditBol.setErrorForeverWithParentClass( $desc[0], "The nos flag for the saved template is not valid. Please delete and re-enter the U.N.Number.", null);
                    }
                }
            }

            if( foundStaleHazmat) {
                //EditBol.setErrorForever( $un[0], un_msg );
                EditBol.setErrorForever( $hazgrp[0], un_msg );

                //Only do this section once on first stale hazmat found
                if (EditBol.staleHazmat === false) {
                    //disable all buttons except Save Template
                    //If editing a BOL then do not disable SAVE DRAFT BOL
                    if( EditBol.bolOrTemplate === 'Template') {
                        $('#draftBtn').prop("disabled",true);
                    }
                    $('#saveShipLaterBtn').prop("disabled",true);
                    $('#saveShipNowBtn').prop("disabled",true);
                    $('#emailPrintBol').prop("disabled",true);

                    //make alert
                    EditBol.customAlert("WARNING!","This " + EditBol.bolOrTemplate + " was previously created with Hazmat data that has since changed.  The old (original) and new information will be presented to you in the ITEMS TO SHIP section. You will need to save this " + EditBol.bolOrTemplate + " with the new data before it can be used. If you wish you can edit/delete the item(s) in question and then save the " + EditBol.bolOrTemplate + ".", 'staleHazmat', 'js-group-' + index );
                    EditBol.staleHazmat = true;
                }

                //if more than one items has the stale hazmat issue then set scrollTo to the smallest index so it will be scrollTo first item and this item will be on top
                //after alert ok is pressed then scrolTo will be performed
                let scrollTo_array = EditBol.alertModal.scrollTo.split('-'),
                    scrollTo_index  = scrollTo_array[scrollTo_array.length - 1].trim();
                if( index < scrollTo_index ) {
                    EditBol.alertModal.scrollTo = 'js-group-' + index;
                }
            }
        } else {
            //if stale haz mat data was previously found then there may be some error messages from setErrorForever()
            //remove the messages if they exist
            if( EditBol.staleHazmat === true) {
                EditBol.removeError( $pkg[0] );
                EditBol.removeError( $haz[0] );
                EditBol.removeError( $sub[0] );
                let $descError = $('#hazdesc-' + index + '-error');
                EditBol.removeError( $descError[0] );
                EditBol.removeError( $desc[0] );
            }
        }
        return return_val;
    },

    customAlert : function(title, message, type, scrollToSection) {
        if( $('#alert-modal')[0] !== undefined ) {
            $('#alert-modal').modal({ backdrop: 'static', keyboard: 'false' });
            $('#alertModalTitle').html(title);
            $('#alertMessage').html(message);
            $('#alertOkButtonText').html("OK");
            EditBol.alertModal.type = type;
            EditBol.alertModal.scrollTo = scrollToSection;
        } else {
            alert(message);
        }
    },

    hasNOS: function (desc) {
 //NOTE we are using this based on the DESC because there is NO NOS f Y/N field in bol_lineitems
        // Check to see if description contains NOS
        // If so, extract from array and populate data-nos attribute
        let desc_array = desc.split(','),
            last_desc  = desc_array[desc_array.length - 1].trim();

        //remove dots
        if (last_desc.replace(/\./g, '').toLowerCase() === 'nos') {
            //console.log("hasNOS(" + last_desc + ") TRUE");
            return 'true';
        } else {
            //console.log("hasNOS(" + last_desc + ") FALSE");
            return 'false';
        }
    },

    setSelectedHazmatFields: function (select_obj,
                                       index) {
        let  $hazmat_report_fields = $('#hazmat-report-fields-' + index),
             $nos_container = $('#nos-container-' + index),
             selected_idx = select_obj.options.selectedIndex,
             selected_opt = select_obj.options[selected_idx],
             pkg_class    = '',
             haz_class    = '',
             desc         = '',
             is_nos          = false;


        if (selected_idx > 0) {
            pkg_class    = selected_opt.getAttribute('data-pkg-class'),
            haz_class    = selected_opt.getAttribute('data-haz-class'),
            haz_subclass = selected_opt.getAttribute('data-haz-subclass'),
            desc         = selected_opt.getAttribute('data-desc'),
            // SHIPPLUS-541 - use the nos flag stored in the selected option. updateHazmatFields function uses this to decide whether to hide/show N.O.S. Description field.
            is_nos       = selected_opt.getAttribute('data-nos') === 'true';

            EditBol.updateHazmatFields(index,
                                       pkg_class,
                                       haz_class,
                                       haz_subclass,
                                       desc,
                                       is_nos);
            EditBol.showTarget($hazmat_report_fields);
        } else {
            EditBol.updateHazmatFields(index,
                                       "",
                                       "",
                                       "",
                                       "",
                                       false);
            EditBol.hideTarget($nos_container);
            EditBol.hideTarget($hazmat_report_fields);
        }
    },

    appendHazmatDesc: function (select_obj,
                                options_ary,
                                index) {
        //console.log("appendHazmatDesc(select_obj, option_ary, " + index + ") ");
        if (select_obj !== null
                && select_obj !== undefined) {
            let $select = $('#' + select_obj.id),
                len = options_ary.length,
                idx = 0;

            $select.find('option').not(':first').remove().end();
            for (idx = 0; idx < len; idx += 1) {
                let option = options_ary[idx],
                    desc = option['data-desc'];
                $select.append($(option).text(desc));
            };
        }
    },

    updateHazmatFields: function (index,
                                  pkg_str,
                                  haz_str,
                                  sub_str,
                                  desc_str,
                                  is_nos) {
        //console.log("updateHazmatFields(" + index + ", " + pkg_str + ", " + haz_str + ", " + sub_str + "," + desc_str + ") ");
        let $nos_container = $('#nos-container-' + index),
            $pkg           = $('#pkgclass-' + index),
            $haz           = $('#hazclass-' + index),
            $sub           = $('#hazsubclass-' + index),
            $desc          = $('#hazdesc-' + index),
            $nos_desc      = $('#nos-desc-' + index),
            $isNos         = $('#isNos-' + index),
            $li_sub        = $('#li-hazsubclass-' + index)

        $pkg.val(pkg_str);
        $haz.val(haz_str);
        $sub.val(sub_str);
        $desc.val(desc_str);
        $isNos.val(is_nos);


        //if the sub class is blank then hide the subclass from users view else show it
        if( sub_str.trim() === "" ) {
            $li_sub.addClass('mute');
        } else {
            $li_sub.removeClass('mute');
        }

        if (is_nos === true) {
            // if nos, add a required class to that field as well
            $nos_desc.addClass('required');
            EditBol.showTarget($nos_container);
        } else {
            // if not nos, remove required class to that field as well
            $nos_desc.removeClass('required');
            EditBol.hideTarget($nos_container);
        }
    },

    resetUnNumChildValues: function (index) {
        //console.log("resetUnNumChildValues(" + index + ") ");
        let $select_obj   = $('#haz-select-' + index);

        // remove old select options
        $select_obj.find('option').not(':first').remove().end();

        // SHIPPLUS-541 - pass nos flag value to updateHazmatFields function. Function uses this to decide whether to hide/show N.O.S. Description field.
        // clear all values of fields that are dependent on UN Number value
        EditBol.updateHazmatFields(index,
                                   '',
                                   '',
                                   '',
                                   '',
                                   false);
    },

    toggleDescriptions: function ($shipment_fields_container) {
        let $target       = $shipment_fields_container.find('.dropdown-list'),
            $desc_input   = $shipment_fields_container.find('.js-ldesc'),
            $descriptions = $target.find('li');

        $descriptions.each(function () {
            EditBol.populateDescField($desc_input, $(this), $target);
        });

        $desc_input.on('focus', function () {
            EditBol.toggleTarget($target);
        });

        $desc_input.on('blur', function () {
            EditBol.hideTarget($target);
        });
    },

    // Populate description field from description list
    populateDescField: function ($desc_input, $description, $dropdown_list, callback) {
        let desc_val       = $description.attr('data-desc'),
            customer_val   = $('#LookupNumber').val(),
            $desc_del_icon = $description.find('.js-delete-item-small:first'),
            $desc_text     = $description.find('span:first');

        $desc_del_icon.on('click', function () {
            //alert("Delete[" + $(this).attr('id') + "/" + $(this).attr('data-id') + "]: " + desc_val + " for " + customer_val);
            // Confirm delete request, before acting on it
            EditBol.itemToDel.type = "Frequent Description"
            EditBol.itemToDel.dataObj = {desc_val:desc_val, customer_val:customer_val, $description:$description};

            $('#confirmation-modal').modal({ backdrop: 'static', keyboard: 'false' });
            $('#modalTitle').html("DELETE Frequent Description CONFIRMATION");
            $('#confirmationMessage').html("Confirm that you want to delete the Frequent Description: '" + desc_val + "'.");
        });

        $desc_text.on('click', function () {
            $desc_input.val(desc_val);
            EditBol.hideTarget($dropdown_list);
        });
    },

    deleteDescription : function(desc_val,
                                 customer_val,
                                 $description)
    {
        'use strict;'
        //var mthd = 'deleteDescription(' + desc_val + ', ' + customer_cal + ', $description) ';
        $.ajax({
            type:     "POST",
            url:      "/servlet/ShipBOLDescription",
            cache:    false,
            currTime: (new Date()),
            data: {
                'cmd':                    'delete',
                'description':            desc_val,
                'customer':               customer_val
            },
            success: function(data) {
                //console.log(mthd + "Success - data: " + data);
                $description.remove();
                EditBol.deleteDescriptionInAllLineItems( $description );
            },
            error: function(jqXHR, textStatus, errorThrown) {
                //console.log(mthd + "Failure - textStatus: " + textStatus + " - errorThrown: " + errorThrown);
            }
        });
    },

    deleteDescriptionInAllLineItems : function( $in_description )
    {
        'use strict;'

        let $items_to_ship    = $('#items-to-ship'),
            $shipment_fields  = $items_to_ship.find('.shipment-fields');
        let input_desc_to_del = $in_description.attr('data-desc');

        $shipment_fields.each(function () {
            let $shipment_fields_container = $(this),
                $target       = $shipment_fields_container.find('.dropdown-list'),
                $descriptions = $target.find('li');

            $descriptions.each(function () {
                let $description = $(this),
                    curr_des = $description.attr('data-desc');
                if( input_desc_to_del === curr_des ) {
                    $description.remove();
                    return;
                }
            });
        });
    },

    showTarget: function ($target) {
        //console.log("showTarget(" + $target.attr('id') + ") ");
        $target.slideDown(200);
    },

    hideTarget: function ($target, speed) {
        //console.log("hideTarget(" + $target.attr('id') + ", " + speed + ") ");
        let rate         = 200;

        if (speed !== undefined) {
            rate = speed;
        }

        $target.slideUp(rate);
    },

    toggleTarget: function ($target) {
        //console.log('toggleTarget($target) isHidden: ' + $target.is(":hidden") + ' isVisible: ' + $target.is(":visible"));
        if ($target.is(":hidden")
                || !$target.is(":visible")) {
            EditBol.showTarget($target);
        } else {
            EditBol.hideTarget($target);
        }
    },

    changeZipEvent: function (country_select, $zip_input, city_select, state_input, zip_id, city_id, state_id, country_id, puerto_rico_callback) {
        let prefix_billto    = document.getElementById('mexico-prefix-billto'),
            prefix_consignee = document.getElementById('mexico-prefix-consignee'),
            prefix_shipper   = document.getElementById('mexico-prefix-shipper');

        AjaxCities.resetZipEvent($zip_input, city_select, state_input);

        // Reset event binding with respect to country
        if (country_select !== null
                && country_select.value.toLowerCase() === 'mx') {
            AjaxCities.findCities(zip_id, city_id, state_id, country_id, true, 'MX');
            if (country_id === 'billto-country') {
                prefix_billto.className = '';
            } else if (country_id === 'consignee-country') {
                prefix_consignee.className = '';
            } else if (country_id === 'shipper-country') {
                prefix_shipper.className = '';
            }
        } else if (country_select !== null
                    && country_select.value.toLowerCase() === 'ca') {
            AjaxCities.findCities(zip_id, city_id, state_id, country_id, false, 'CA');
            if (country_id === 'billto-country') {
                prefix_billto.className = 'js-init-hidden';
            } else if (country_id === 'consignee-country') {
                prefix_consignee.className = 'js-init-hidden';
            } else if (country_id === 'shipper-country') {
                prefix_shipper.className = 'js-init-hidden';
            }
        } else {
            AjaxCities.findCities(zip_id, city_id, state_id, country_id, false, 'US', puerto_rico_callback);
            if (country_id === 'billto-country') {
                prefix_billto.className = 'js-init-hidden';
            } else if (country_id === 'consignee-country') {
                prefix_consignee.className = 'js-init-hidden';
            } else if (country_id === 'shipper-country') {
                prefix_shipper.className = 'js-init-hidden';
            }
        }
    },

    initImportOptions: function ($import_obj,
                                 $select_obj,
                                 obj_name,
                                 obj) {
        let mthd = 'initImportOptions(' + $import_obj.attr('id') + ', ' + $select_obj.attr('id') + ', ' + obj_name + ') ',
            code_val      = $('#' + obj_name + '-code').val(),
            zip           = obj.obj_zip.value;
        //console.log(mthd);

        //init selectize to turn on search embedded in pull down.
        //Read Notes: MyAE\MyAverittExpressApplicationWeb\WebContent\js\vendor\selectize.js-0.12.4\notes.txt
        if ($select_obj.length > 0) {
            let selectObj   = $select_obj[0];
            let id          = selectObj.id;
            // allow empty option
            Averitt.convertToSelectize(id, true, function() {
                EditBol.removeError(selectObj);
            });
        }

        //slide everything up 14 px's
        $(".selectize-input" ).css({"margin-bottom":"14px","margin-top":"0px"});
        $(".selectize-dropdown" ).css({"margin-top":"-15px"});



        // Make initial call to setup selector
        EditBol.updateImportOptions($select_obj,
                                    obj_name,
                                    false,
                                    zip);
        if (code_val != null
                && code_val !== '') {
            // Since code was set, then find the select option and pick it
            $select_obj.val($select_obj.find("option[data-company-code=" + code_val + "]").val());
            // If an account was used, then disable the linked fields.
            EditBol.disableAccountFields(obj, true);
        }
        // Setup handler for onChange for selector
        $import_obj.on('change', function (e) {
            //console.log('click ' + obj_name + ' import');
            EditBol.updateImportOptions($select_obj,
                                        obj_name,
                                        true,
                                        zip);
        });
    },

    updateImportOptions: function ($select_obj,
                                   obj_name,
                                   update_select,
                                   zip) {
        let mthd                = 'updateImportOptions(' + $select_obj.attr('id') + ', ' +
                                                           obj_name + ', ' +
                                                           update_select + ', ' +
                                                           zip + ') ',
            import_choice       = Averitt.getRadioVal(obj_name + 'Import'),
            empty_option_el     = document.createElement('option'),
            entry_prefix        = (import_choice === 'AB' ? 'ab' : 'ra'),
            $entry_list         = $('input[name=' + entry_prefix + 'Entry]'),
            $clear_obj          = $('#' + obj_name + '-clear'),
            is_from_ratequote   = $('#is-from-ratequote'),
            match_zip           = '';
        let selectized_obj     = null;

        if (is_from_ratequote.val() === 'true') {
            // Per SHIPPLUS-180 & 181, if from RateQuote and shipper/consignee, then only include selections that match the ZIP
            //console.log(mthd + 'From RQ');
            if (obj_name === 'shipper'
                    || obj_name === 'consignee') {
                match_zip = zip;
                //console.log(mthd + 'match_zip: ' + match_zip);
            }
        }

        if ( $select_obj.hasClass("selectized") ) {
        	selectized_obj =  $('#' + $select_obj[0].id)[0].selectize;
        }

        if( selectized_obj === null ) {
	        //console.log(mthd);
	        // Remove current entry list, minus the default 1st one: 'Company' (value = '')
	        $select_obj.find('option').not(':first').remove().end();
	        if (update_select) {
	            // Update selector to first one...updates attached fields
	            $select_obj.val($select_obj.find('option:first').val());
	            $select_obj.trigger('change');
	        }

	        // For each entry, build a select option with it's data attributes
	        $entry_list.each(function() {
                let $entry = $('#' + this.id),
	                attrs = this.attributes,
	                zip = this.getAttribute('data-company-zip');
	            if (match_zip === ''
	                    || match_zip === zip) {
	                // Create empty copy of option
	                let option_temp  = empty_option_el.cloneNode(true);
	                // Set text part
	                let option_txt = document.createTextNode($entry.val());
	                //console.log(mthd + 'attrs: ' + attrs);
	                // Add data attributes
	                $.each(attrs, function(idx, attr) {
                        let name = attr.name,
	                        value = attr.value;
	                    // Set all attributes to match, if their name starts with 'data-' or is 'value'
	                    if (/data-.*/.test(name)
	                            || /value/.test(name)) {
	                        //console.log(mthd + 'name: ' + name + ' value: ' + value);
	                        option_temp.setAttribute(name, value);
	                    };
	                });
	                // Append text part to option
	                option_temp.appendChild(option_txt);
	                // Append option to select
	                $select_obj.append($(option_temp));
	            }
	        });
	        // Check length of select options, if 1 or less, hide selector
	        if ($select_obj.find("option").length <= 1) {
	            $select_obj.hide();
	        } else {
	            $select_obj.show();
	        }
        } else {
        	//selectized select
        	selectized_obj.clearOptions();
            let order = 1;
        	selectized_obj.addOption({
		         text:"Company",
		         value: "",
		         $order: 1
		     });

	        selectized_obj.setValue(selectized_obj.search("Company").items[0].id);

            // For each entry, build a select option with it's data attributes
	        $entry_list.each(function() {
                let attrs = this.attributes,
	                zip = this.getAttribute('data-company-zip'),
	                entryValue = this.value;
	                let comma = "",
	                    addOptionJson = "{";
	            if (match_zip === ''
	                    || match_zip === zip) {
	                // Add data attributes
	                $.each(attrs, function(idx, attr) {
                        let name = attr.name;
	                    // Add attributes - but only ones that start with text, value, data
	                    if (/data-.*/.test(name)
	                            || /value/.test(name) || /text/.test(name)) {
	                        addOptionJson += comma + '"' + this.name.replace('data-','') + '":' + '"' + this.value + '"';
	                        comma = ",";

	                    }
	                });
	                order +=1;
	                addOptionJson += comma + '"$order":' + order;
	                //make text string from value
	                if (obj_name === 'shipper' || obj_name === 'consignee') {
	                	//make shorter - only use account - name - address1
	                	//get first comma after address1&2 (which is first comma after last " - ")
                        let n = entryValue.indexOf(",", entryValue.lastIndexOf(" - ") );
	                	if ( n > 0) {
	                	    entryValue = entryValue.substring(0, n);
	                	}
	                	if( entryValue.length > 51){
	                		entryValue = entryValue.substring(0,51-3) + "...";
	                	}
	                }
		            addOptionJson += comma + '"text":"' + entryValue + '"';

	                addOptionJson += "}";
	            	selectized_obj.addOption( JSON.parse(addOptionJson) );
	            }
	        });
	        // Check length of select options, if 1 or less, hide selector
	        if (order <= 1) {
	        	//work on dive with class=selectize-control single
	        	$('#' + $select_obj[0].id + '-selectized').parent('div').parent('div').hide();
	        } else {
	        	$('#' + $select_obj[0].id + '-selectized').parent('div').parent('div').show();
	        }
        }

        // Check which radio button was choosen for import mode
        if (import_choice === 'AB') {
            if (!$clear_obj.hasClass('js-init-hidden')) {
                // Hide clear link, since not Related Account import
                $clear_obj.addClass('js-init-hidden');
                $clear_obj.off('click');
            }
        } else {
            if ($clear_obj.hasClass('js-init-hidden')) {
                // Show clear link, since not Related Account import
                $clear_obj.removeClass('js-init-hidden');
                $clear_obj.on('click', function () {
                    EditBol.removeError($select_obj);

                    // Change to 1st entry, which should be 'Company' and cause clear of fields...
                	if( selectized_obj === null ) {
	                    $select_obj.val($select_obj.find('option:first').val())
	                    $select_obj.trigger('change');
	                    //console.log('clear + ' + $select_obj.find('option:first').val());
                	} else {
	    	        	selectized_obj.setValue(selectized_obj.search("Company").items[0].id);
                	}
                });
            }
        }
    },

    updateCompanyDisplayDiv: function ($select_obj,
                                       company_code) {
        let mthd = 'updateCompanyDisplayDiv(' + $select_obj.attr('id') + ', ' +
                                                company_code + ') ',
            $display_div = $('#display-' + $select_obj.attr('id')),
            result = false;
        //console.log(mthd + '$display_div: ' + $display_div.attr('id'));
        if (company_code === null
                || company_code === '') {
            // If is null/empty, clear and hide
            if (!$display_div.hasClass('js-init-hidden')) {
                $display_div.addClass('js-init-hidden');
                //console.log(mthd + "hide (" + company_code + ")");
            }
        } else {
            // If not null/empty, set and display
            if ($display_div.hasClass('js-init-hidden')) {
                $display_div.removeClass('js-init-hidden');
                //console.log(mthd + "show (" + company_code + ")");
            }
            result = true;
        }
        $display_div.text('Account: ' + company_code);
        return result;
    },

    populateShippingTypes: function ($select_obj,
                                     obj_name) {
        let mthd = 'populateShippingTypes(' + $select_obj.attr('id') + ', ' + obj_name + ') ',
            data_company_address1,
            data_company_address2,
            data_company_name,
            data_company_code,
            data_company_country,
            data_company_city,
            data_company_email,
            data_company_phone,
            data_company_state,
            data_company_zip,
            phone1,
            phone2,
            phone3;

        $select_obj.on('change', function () {
            let selected_value = this.options[this.options.selectedIndex].value,
                selected_option = this.options[this.selectedIndex],
                selected_option_dca1_attrs = $(selected_option).filter(function () { return !$.isEmptyObject($(this).data()) });
            // MAINTENANCE-778 - selecting 'Company' (i.e. '' with no data) for default should clear the address entries
            if (selected_value === '' ) {
                if ( this.options[this.options.selectedIndex].innerText === 'Company'
                        ||typeof selected_option_dca1_attrs === typeof undefined
                        || selected_option_dca1_attrs.length === 0) {
	                // For some browsers, `attr` is undefined; for others, `attr` is false.  Check for both.
	                // It no attr found and no value specified, then clean data fields
	                // console.log(mthd + 'clear!');
	                data_company_address1 = '';
	                data_company_address2 = '';
	                data_company_name     = '';
	                data_company_code     = '';
	                data_company_country  = '';
	                data_company_city     = '';
	                data_company_email    = '';
	                data_company_phone    = '';
	                data_company_state    = '';
	                data_company_zip      = '';
	                phone1                = '';
	                phone2                = '';
	                phone3                = '';
	            } else {
	            	return ;
	            }

            } else {
                // console.log(mthd + 'set!');
                data_company_address1 = selected_option.getAttribute('data-company-address1');
                data_company_address2 = selected_option.getAttribute('data-company-address2');
                data_company_name     = selected_option.getAttribute('data-company-company');
                data_company_code     = selected_option.getAttribute('data-company-code');
                data_company_country  = selected_option.getAttribute('data-company-country');
                data_company_city     = selected_option.getAttribute('data-company-city');
                data_company_email    = selected_option.getAttribute('data-company-email');
                data_company_phone    = selected_option.getAttribute('data-company-phone');
                data_company_state    = selected_option.getAttribute('data-company-state');
                data_company_zip      = selected_option.getAttribute('data-company-zip');
                // SHIPPLUS-110 - Handle 11 digit phone numbers
                if (data_company_phone.length === 11) {
                    data_company_phone = data_company_phone.substring(1, 11);
                }
                phone1                = data_company_phone.substring(0, 3);
                phone2                = data_company_phone.substring(3, 6);
                phone3                = data_company_phone.substring(6, 10);
            }
            // console.log(mthd + '(onclick) code: ' + data_company_code);
            switch (obj_name) {
                case 'shipper':
                    Shipper.code     = data_company_code;
                    Shipper.company  = data_company_name;
                    Shipper.address1 = data_company_address1;
                    Shipper.address2 = data_company_address2;
                    Shipper.zip      = data_company_zip;
                    Shipper.city     = data_company_city;
                    Shipper.state    = data_company_state;
                    Shipper.country  = data_company_country;
                    Shipper.phone1   = phone1;
                    Shipper.phone2   = phone2;
                    Shipper.phone3   = phone3;

                    Shipper.updateCompanyFields();
                    break;

                case 'consignee':
                    Consignee.code     = data_company_code;
                    Consignee.company  = data_company_name;
                    Consignee.address1 = data_company_address1;
                    Consignee.address2 = data_company_address2;
                    Consignee.zip      = data_company_zip;
                    Consignee.city     = data_company_city;
                    Consignee.state    = data_company_state;
                    Consignee.country  = data_company_country;
                    Consignee.phone1   = phone1;
                    Consignee.phone2   = phone2;
                    Consignee.phone3   = phone3;

                    Consignee.updateCompanyFields();
                    break;

                case 'billto':
                    Billto.code     = data_company_code;
                    Billto.company  = data_company_name;
                    Billto.address1 = data_company_address1;
                    Billto.address2 = data_company_address2;
                    Billto.zip      = data_company_zip;
                    Billto.city     = data_company_city;
                    Billto.state    = data_company_state;
                    Billto.country  = data_company_country;
                    Billto.phone1   = phone1;
                    Billto.phone2   = phone2;
                    Billto.phone3   = phone3;

                    Billto.updateCompanyFields();
                    break;
                default:
                    return;
            }
        });
    },

    saveAddressPiece: {
        init: function () {
            let $saveConsigneeBtn = $('#consave'),
                $save_billto_btn  = $('#consave2'),
                doc               = document,
                consignee_fields_obj = {
                    company_name: doc.getElementById('CN'),
                    address1: doc.getElementById('CA1'),
                    address2: doc.getElementById('CA2'),
                    city: doc.getElementById('CC'),
                    state: doc.getElementById('CS'),
                    zip: doc.getElementById('CZ'),
                    phone1: doc.getElementById('consignee-phone-area'),
                    phone2: doc.getElementById('consignee-phone-first'),
                    phone3: doc.getElementById('consignee-phone-last'),
                    country: doc.getElementById('consignee-country')
                },
                billto_fields_obj = {
                    company_name: doc.getElementById('BN'),
                    address1: doc.getElementById('BA1'),
                    address2: doc.getElementById('BA2'),
                    city: doc.getElementById('BC'),
                    state: doc.getElementById('BS'),
                    zip: doc.getElementById('BZ'),
                    phone1: doc.getElementById('billto-phone-area'),
                    phone2: doc.getElementById('billto-phone-first'),
                    phone3: doc.getElementById('billto-phone-last'),
                    country: doc.getElementById('billto-country')
                };

            // Check valid fields then submit
            // EditBol.validate.billtoCheck passes an anonymous function as a callback with result
            // as an argument. This argument is defined in EditBol.validateFields.checkFields
            // EditBol.saveAddressPiece.saveContact() will delete the overlay after the process runs

            $saveConsigneeBtn.on('click', function () {
                EditBol.validate.consigneeCheck(consignee_fields_obj, function (result) {
                    if (result === true) {
                        Averitt.formDialog.appendOverlay(function () {
                            EditBol.saveAddressPiece.saveContact(consignee_fields_obj);
                            // refresh import selects
                        }, 'Adding ' + consignee_fields_obj.company_name.value + ' to Address Book');
                    }
                });
            });

            $save_billto_btn.on('click', function () {
                // First set billto fields as required
                EditBol.requireBilltoFields();

                EditBol.validate.billtoCheck(billto_fields_obj, function (result) {
                    if (result === true) {
                        Averitt.formDialog.appendOverlay(function () {
                            EditBol.saveAddressPiece.saveContact(billto_fields_obj);
                            // refresh import selects
                        }, 'Adding ' + billto_fields_obj.company_name.value + ' to Address Book');
                    }
                });
            });
        },

        saveContact: function (obj) {
            $.ajax({
                type: 'post',
                url: '/secure/address-book/add-contact-shipplus',
                data: {
                    name:     obj.company_name.value.trim(),
                    company:  obj.company_name.value.trim(),
                    address1: obj.address1.value.trim(),
                    address2: obj.address2.value.trim(),
                    city:     obj.city.value.trim(),
                    state:    obj.state.value.trim(),
                    zip:      obj.zip.value.trim(),
                    phone:    obj.phone1.value.trim() + obj.phone2.value.trim() + obj.phone3.value.trim(),
                    country:  obj.country.value.trim(),
                    from:     "ajax"
                }
            }).done(function (response) {
                if (response === "succeeded") {
                    document.getElementById('add-to-address-response').innerHTML = '<div class="message"><p>' + obj.company_name.value + ' added successfully to Address Book</p></div>';
                    Averitt.formDialog.deleteModal();
                    Averitt.scrollToSection('add-to-address-response');
                } else {
                    document.getElementById('add-to-address-response').innerHTML = '<div class="error-message"><p>' + response + '</p></div>';
                    Averitt.formDialog.deleteModal();
                    Averitt.scrollToSection('add-to-address-response');
                }
            });
        }
    },

    validate: {
        // Keep track of errors
        valid_fields: {
            shipper: false,
            consignee: false,
            billto: false,
            shipment: false,
            items_to_ship: false
        },

        rules: {
            zip: /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i,
            classname: /(^| )(\S+)\b/g
        },

        shipperCheck: function (callback) {
            let doc      = document,
                name     = doc.getElementById('SN'),
                address1 = doc.getElementById('SA1'),
                zip      = doc.getElementById('SZ'),
                city     = doc.getElementById('SC'),
                state    = doc.getElementById('SS'),
                phone1   = doc.getElementById('shipper-phone-area'),
                phone2   = doc.getElementById('shipper-phone-first'),
                phone3   = doc.getElementById('shipper-phone-last'),
                required_ary = [name, address1, zip, city, state, phone1, phone2, phone3];

            // This method passes a callback as the second parameter which takes one argument: result.
            // result is set in EditBol.validateFields.checkFields
            EditBol.validateFields.checkFields(required_ary, function (result) {
                EditBol.validate.valid_fields.shipper = result;
                callback(result);
            });
        },

        firstLineRequired: function () {
            let lunits   = document.getElementsByName('lunits')[0],
                lwgt     = document.getElementsByName('lwgt')[0],
                llen     = document.getElementsByName('llen')[0],
                lwid     = document.getElementsByName('lwid')[0],
                lhgt     = document.getElementsByName('lhgt')[0],
                ldesc    = document.getElementsByName('ldesc')[0],
                lhazflag = document.getElementsByName('lhazflag')[0],
                isLwgtReadOnly = $(lwgt).hasClass('mute'),
                isLunitsReadOnly = $(lunits).hasClass('mute');

            if(!isLunitsReadOnly) {
                lunits.className = 'ae-input positiveInteger';
            }

            if (!isLwgtReadOnly) {
                lwgt.className   = 'ae-input positiveInteger';
                llen.className   = 'ae-input positiveIntegerOrBlank';
                lwid.className   = 'ae-input positiveIntegerOrBlank';
                lhgt.className   = 'ae-input positiveIntegerOrBlank';
            }

            if (lhazflag.value === "Y") {
                ldesc.className = 'ae-input js-ldesc';
            } else {
                ldesc.className = 'ae-input js-ldesc required';
            }
        },

        lineItemCheck: function (callback) {
            let required_ary = [],
                lunits       = document.getElementsByName('lunits'),
                lwgt         = document.getElementsByName('lwgt'),
                len          = lunits.length,
                idx          = 0,
                val_by_comm  = document.getElementsByName('valByComm');

            for (idx = 0; idx < len; idx++) {
                required_ary.push(lunits[idx]);
                required_ary.push(lwgt[idx]);
                if (EditBol.is_puerto_rico === true) {
                    required_ary.push(val_by_comm[idx]);
                }
            }

            EditBol.removeLineItemDescRequirement();

            EditBol.validateFields.checkFields(required_ary, function (result) {
                //console.log("retuned from checkFields() - result: " + result);
                callback(result);
            });
        },

        unNumberCheck: function (callback) {
            let required_ary     = [],
                hazmat_inputs = document.getElementsByName('lhazflag'),
                un_numbers       = document.getElementsByName('unNum'),
                idx;

            for (idx = hazmat_inputs.length - 1; idx >= 0; idx--) {
                if (hazmat_inputs[idx].value === "Y") {
                    required_ary.push(un_numbers[idx]);
                }
            }

            EditBol.validateFields.checkFields(required_ary, function (is_valid) {
                callback(is_valid);
            });
        },

        consigneeCheck: function (obj, callback) {
            let required_ary = [obj.company_name, obj.address1, obj.zip, obj.city, obj.state, obj.phone1, obj.phone2, obj.phone3];

            // This method passes a callback as the second parameter which takes one argument: result.
            // result is set in EditBol.validateFields.checkFields
            EditBol.validateFields.checkFields(required_ary, function (result) {
                EditBol.validate.valid_fields.consignee = result;
                callback(result);
            });
        },

        billtoCheck: function (obj, callback) {
            let required_ary = [obj.company_name, obj.address1, obj.country, obj.zip, obj.city, obj.state, obj.phone1, obj.phone2, obj.phone3];

            // This method passes a callback as the second parameter which takes one argument: result.
            // result is set in EditBol.validateFields.checkFields
            EditBol.validateFields.checkFields(required_ary, function (result) {
                EditBol.validate.valid_fields.billto = result;
                callback(result);
            });
        },

        hazMatEmergencyContactCheck: function (callback) {
            let doc = document,
                emergency_phone1       = doc.getElementById('hazmat-contact-phone-area'),
                emergency_phone2       = doc.getElementById('hazmat-contact-phone-first'),
                emergency_phone3       = doc.getElementById('hazmat-contact-phone-last'),
                emergency_contact_name = doc.getElementById('emergency-name'),
                required_ary = [emergency_phone1, emergency_phone2, emergency_phone3, emergency_contact_name];

            //console.log('emergency_phone1: ' + emergency_phone1);
            //console.log('emergency_phone2: ' + emergency_phone2);
            //console.log('emergency_phone3: ' + emergency_phone3);
            EditBol.validateFields.checkFields(required_ary, function(result) {
                callback(result);
            });
        },

        shipmentCheck: function (callback) {
            let bol_number = document.getElementById('BOL'),
                required_ary = [bol_number];

            // This method passes a callback as the second parameter which takes one argument: result.
            // result is set in EditBol.validateFields.checkFields
            EditBol.validateFields.checkFields(required_ary, function (result) {
                EditBol.validate.valid_fields.shipment = result;
                callback(result);
            });
        },

        mustDeliverByDateCheck: function(callback) {
            let by_date            = document.getElementById('date-widget'),
                is_valid_date = true;

            if (by_date.value !== '' &&
                !EditBol.isGuaranteeDeliveryByChecked()) {
                if (DateValidator.isDateValid(by_date) === true) {
                    if (DateValidator.isFutureDate(by_date) === false) {
                        is_valid_date = false;
                        by_date.focus();
                        Averitt.setError(by_date, 'Must be a future date.');
                    }
                } else {
                    is_valid_date = false;
                    by_date.focus();
                    Averitt.setError(by_date, 'Invalid date.');
                }
            }

            callback(is_valid_date);
        },

        mustDeliverAndStandardCheck: function (must_deliver_input) {
            if (must_deliver_input.value !== '' && EditBol.isGuaranteeDeliveryByChecked()) {
                EditBol.validate.setDeliverAndStandardError(must_deliver_input);
            } else {
                return false;
            }
        },

        setDeliverAndStandardError: function (must_deliver_input) {
            EditBol.customAlert("",'A Standard LTL Guarantee Shipping Option cannot be used in conjunction with a Must Deliver On or Before date. Must Deliver On or Before date will be cleared.',
                                   "DeliverAndStandard", "shipment-information");
            must_deliver_input.value = '';
        },

        validateConsigneeZipAndGuaranteeDelivery: function () {
            // Retrieve consignee zip code
            const consignee_zip = document.getElementById('CZ').value;
            EditBol.validate.retrieveGuaranteeByNoonEligibleZips()
                .then((eligible_zips) => {
                    if (!eligible_zips.includes(consignee_zip)
                        && EditBol.isGuaranteeDeliveryByNoonChecked()) {
                        EditBol.validate.setConsigneeZipNotGuaranteeDeliveryEligibleError();
                    }
            });
        },
        
        displayGuaranteeByFiveErrorMessage: function () {
            let shipper_zip = $('#SZ')[0].value.trim();
            let consignee_zip = $('#CZ')[0].value.trim();
            if(shipper_zip !== '' || consignee_zip !== ''){
                EditBol.validate.getGuaranteeByFiveMessage().then((message) => {
                    if (message !== undefined && message !== null && message.length > 0
                      && EditBol.isGuaranteeDeliveryBy5Checked()){
                          EditBol.customAlert("",message + ". Guaranteed Delivery will be cleared.",
                              "GuaranteeDelivery", "standard-guarantee-container");
                          EditBol.resetGuaranteeDeliveryBy();
                          EditBol.resetStandardGuarantee();
                    }
                })
            }
        },

        allDimsRequiredOrNone: function () {
            let lengthFields  = document.getElementsByName('llen');
            let widthFields  = document.getElementsByName('lwid');
            let heightFields  = document.getElementsByName('lhgt');
            let len = lengthFields.length;
            let valid = true;
                            
            for (idx = 0; idx < len; idx++) {
                let llenValue = lengthFields[idx].value;
                let lwidValue = widthFields[idx].value;
                let lhgtValue = heightFields[idx].value;
                if ((llenValue == null || llenValue == "") && (lwidValue == null || lwidValue == "") && (lhgtValue == null || lhgtValue == "")) {
                    // no op
                } else if ((llenValue != null && llenValue != "") && (lwidValue != null && lwidValue != "") && (lhgtValue != null && lhgtValue != "")) {
                    // no op
                } else {
                    valid = false;
                    lengthFields[idx].focus();
                    Averitt.setError(lengthFields[idx], 'Length, width, and height fields must all have values or leave all 3 blank.');
                    break;
                }
            }
            return valid;
         },

        retrieveGuaranteeByNoonEligibleZips: async function () {
            const response = await fetch('/secure/guarantee-by-noon-zip-codes');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            let data = await response.json();
            // Make an entry for an empty consignee zip code as the user may not have added that yet.
            data.push('');
            return data;
        },
        
        getGuaranteeByFiveMessage: async function (){
            let service_type = document.getElementById('serviceType').value;
            if (service_type === 'definite'){
                let shipper_zip = $('#SZ')[0].value.trim();
                let consignee_zip = $('#CZ')[0].value.trim();
                let url = '/secure/guarantee-by-five-message' + '?shipperZipCode=' + shipper_zip + '&consigneeZipCode=' + consignee_zip + '&serviceType=' + service_type;
                let response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                return await response.text();
            }
            return "";
         },

        setConsigneeZipNotGuaranteeDeliveryEligibleError: function () {
          EditBol.customAlert("",'The Consignee ZIP code is not eligible for By Noon Guarantee . Guaranteed Delivery will be cleared.',
              "GuaranteeDelivery", "standard-guarantee-container");
          EditBol.resetGuaranteeDeliveryBy();
          EditBol.resetStandardGuarantee();
        },

        validatePoNumField: function () {
            let po_num_field = document.getElementById('PON'),
                po_num_value = po_num_field.value.trim(),
                validation_class = 'requiredIfAdditionalPOs';
            let rule = EditBol.validateFields.rules[validation_class];
            // cannot have additional PO without a MAIN PO
            if( rule(po_num_value) === false ) {
                po_num_field.focus();
                po_num_field.select();
                Averitt.setError(po_num_field, EditBol.validateFields.errors[validation_class]);
                return false
            }
            return true;
        }
    },

    validateFields: {
        rules: {
            required: /\S/,
            alphaNumSpecialChars: /^[A-Za-z\d\.\#\&\(\)\'\-]+(\s+[A-Za-z\d\.\#\&\(\)\'\-]+)*$/,
            contactName: /^[A-z\.\/\#\&\(\)\'\-]+(\s+[A-z\d\.\/\#\&\(\)\'\-]+)*$/,
            positiveInteger: /^\d*[1-9]\d*$/,
            positiveOrZeroInteger: /^\d+$/,
            threePositiveDigits: /^$|^([0-9]{3})$/,   // Allow empty as valid (let required handle stopping blanks)
            fourPositiveDigits: /^$|^([0-9]{4})$/,    // Allow empty as valid (let required handle stopping blanks)
            areaCode: /^$|^([2-9][0-9]{2})$/,         // Allow empty as valid (let required handle stopping blanks)
            integer: /^-?\d+$/,
            tenDigits: /^\d{10}$/,
            decimal: /^-?\d+(\.\d+)?$/,
            numFloat: /^[0-9]*\.?[0-9]*?$/,
            email: /^[\w\.\-]+@([\w\-]+\.)+[a-zA-Z]+$/,
            telephone: /^(\+\d+)?( |\-)?(\(?\d+\)?)?( |\-)?(\d+( |\-)?)*\d+$/,
            filename: /^(0)[1-5](_)[a-z]+(-)?[a-z]+(_)[a-z](.)(jpg|pdf|doc|mpg|mp3|mov|m4v|mp4)/,
            zip: /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i,
            dollarsAndCents72: /^\d{1,7}(\.\d{0,2})?$/,
            currency:/^\$?[0-9]+(,[0-9]{3})*(\.\d{0,2})?$/,
            positiveIntegerOrBlank: /^$|^d*[1-9]\d*$/,

            chooseCity: function (val) {
                return !(val === 'Choose City');
            },

            requiredSelect: function (val) {
                return !(val === '-1' || val === '0' || val === '' || val === 'Select One' || val === 'Select Description');
            },

            requiredCheckboxTerms: function (obj) {
                // this has to be a checkbox
                return obj.checked === true;
            },

            requiredIfAdditionalPOs: function (textValue) {
                // this is the 'main' PO box text field
                if (textValue === "") {
                    // Find inputs with value not blank
                    let nonBlankAddPoFields = $('input[id^=additionalPO-]').filter(function() { return $(this).val()!==""; });
                    return nonBlankAddPoFields.length <= 0;
                } else {
                    return true;
                }
            },

            isValidBolNameLength: function (bolName) {
                // apostrophes are escaped in java code before saving to DB in FR7P001 table so each apostrophe takes up two characters
            	// 20 characters is DB field length

                let aposCount = bolName.split("'").length - 1;
                let escapedBolNameLen = bolName.length + aposCount;

                //if escapedBolNameLen <= 20 all good; else name is  too long and insert will fail
            	return escapedBolNameLen <= 20
            }
        },

        errors: {
            required: 'Required field',
            areaCode: "Must be a valid Area Code",
            threePositiveDigits: "Must be 3 positive digits",
            fourPositiveDigits: "Must be 4 positive digits",
            alphaNumSpecialChars: "Only alphanumeric and limited special characters: . # & ( ) ' -",
            contactName: "Contact name not valid",
            positiveInteger: 'Positive, whole numbers only',
            positiveOrZeroInteger: 'Non-negative whole numbers only',
            integer: 'Whole numbers only',
            tenDigits: 'Must contain exactly 10 digits',
            decimal: 'Must contain a number',
            numFloat: 'Must contain valid decimals',
            email: 'Invalid email address',
            telephone: 'Invalid telephone number',
            filename: 'Please name this file with the correct naming scheme',
            zip: 'Invalid ZIP code',
            linearFeet: 'Linear Feet should be between 1 and 53',
            shipmentWeight: 'Weight should be between 1 and 44500',
            chooseCity: 'Must choose a city',
            requiredSelect: 'Must Select One',
            requiredCheckboxTerms: 'You must agree to the terms',
            dollarsAndCents72: 'Must be in the format 9.99, 9.9, or 9 (maximum of 6 digits).',
            currency: 'Not a validate monatary value',
            requiredIfAdditionalPOs: 'PO Number is required when adding Additional POs. Or delete the below Additional PO rows.',
            isValidBolNameLength: '20 characters is the max BOL name length, but apostrophes count as two characters.',
            positiveIntegerOrBlank: 'Dimension must be blank or positive, whole numbers only.',
        },

        checkFields: function (fields_ary, callback) {
            let len = fields_ary.length,
                idx,
                class_name,
                class_regex = /(^| )(\S+)\b/g,
                class_result,
                validation_class,
                rule,
                input_obj;


            for (idx = 0; idx < len; idx += 1 ) {
                input_obj  = fields_ary[idx];
                class_name = input_obj.className;

                while (class_result = class_regex.exec(class_name)) {
                    validation_class = class_result[2];
                    rule             = EditBol.validateFields.rules[validation_class];

                    if (typeof rule === 'function'
                            && input_obj.nodeName.toLowerCase() === 'select'
                            && (input_obj.selectedIndex === -1 || rule(input_obj.options[input_obj.selectedIndex].value) === false)) {
                        //console.log("input_obj(select) input_obj.id: " + input_obj.id);
                        input_obj.focus();
                        Averitt.setError(input_obj, EditBol.validateFields.errors[validation_class]);
                        callback(false);
                        return false;
                    } else if ((typeof rule === 'object'
                                   && rule.test(input_obj.value.trim()) === false)
                                   || (typeof rule === 'function'
                                          && rule(input_obj.value.trim()) === false
                                          && input_obj.nodeName.toLowerCase() !== 'select'
                                          && input_obj.type !== 'checkbox')) {
                        //console.log("input_obj(object) input_obj.id: " + input_obj.id);
                        input_obj.focus();
                        input_obj.select();
                        Averitt.setError(input_obj, EditBol.validateFields.errors[validation_class]);
                        callback(false);
                        return false;
                    } else if (typeof rule === 'function'
                                   && input_obj.type === 'checkbox'
                                   && rule(input_obj) === false) {
                        //console.log("input_obj(checkbox) input_obj.id: " + input_obj.id);
                        input_obj.focus();
                        input_obj.select();
                        Averitt.setError(input_obj, EditBol.validateFields.errors[validation_class]);
                        callback(false);
                        return false;
                    }
                }
            }

            if (Accessorials.validateAccessorials() === false) {
                callback(false);
                return false;
            }

            // This returns a boolean value after this method successfully sets are_fields_valid to true
            callback(true);
            return true;
        }
    },

    pasteComments: function () {
        let bol_comments = document.getElementById('bol-comments'),
            delivery_receipt_comments = document.getElementById('delivery-receipt-comments'),
            paste_controls = document.createElement('p'),
            span = document.createElement('span'),
            span_txt = document.createTextNode('Paste comments from Bill of Lading'),
            $paste_controls = $(paste_controls),
            char_counter = bol_comments.parentNode.querySelector('.js-character-counter');

        span.className = 'ae-button--link';
        paste_controls.appendChild(span);
        span.appendChild(span_txt);

        Averitt.insertAfter(paste_controls, char_counter);

        $paste_controls.on('click', function () {
            Averitt.trimTextareaWhitespace(bol_comments);
            delivery_receipt_comments.value = bol_comments.value;

            CharacterCounter.printRemainingCharacters(delivery_receipt_comments, 140, 'remaining-characters-delivery-receipt-comments');
        });
    },

    promoCode: {
        is_making_request: false,

        init: function () {
            let $promo_input = $('#promo-code'),
                $confirm_btn = $('#confirm-promo-code');

            $promo_input.on('change', function () {
                EditBol.promoCode.unconfirmPromotionCode();
                return true;
            });

            $promo_input.on('blur', function () {
                this.value = this.value.trim();
            });

            $confirm_btn.on('click', function () {
                EditBol.promoCode.confirmPromotionCode();
            });
        },

        hasBeenApplied: function (callback) {
            let promo_code = document.getElementById('promo-code'),
                promo_response_message = document.getElementById('promo-response-message'),
                result = true;

            if (promo_code != null && promo_code.value !== '' && promo_response_message === null) {
                Averitt.setError(promo_code, 'Please apply the Promo Code');
                promo_code.focus();
                result = false;
            }

            if (typeof callback === 'function') {
                callback(result);
            }
        },

        setPromotionConfirmed: function (val) {
            let promo_confirmed_input = document.getElementById('promo-confirmed');

            promo_confirmed_input.value = val;
        },

        unconfirmPromotionCode: function () {
            let response_txt = document.getElementById('promo-response');

            EditBol.promoCode.setPromotionConfirmed('false');
            response_txt.innerHTML = '';
        },

        // servlet/ShipBolServlet?action=checkPromotionCode&promotionCode=TRNET
        confirmPromotionCode: function () {
            let promo_input     = document.getElementById('promo-code'),
                promo_input_val = promo_input.value.trim(),
                response_txt    = document.getElementById('promo-response'),
                error_pattern   = /ERROR: /g,
                now,
                response,
                message_class = 'message';

            if (promo_input.value === '') {
                EditBol.promoCode.setPromotionConfirmed('false');
            } else {
                EditBol.promoCode.setPromotionConfirmed('true');

                if (EditBol.promoCode.is_making_request === false) {
                    // initialize Ajax
                    EditBol.promoCode.is_making_request = true;
                    EditBol.promoCode.unconfirmPromotionCode();
                    now = new Date();

                    $.ajax({
                        type: 'get',
                        url: '/servlet/ShipBolServlet',
                        data: {
                            action: 'checkPromotionCode',
                            promotionCode: promo_input_val,
                            currTime: now
                        }
                    }).done(function (data) {
                        if (error_pattern.test(data)) {
                            promo_input.value = '';
                            EditBol.promoCode.setPromotionConfirmed('false');
                            response = data.replace(error_pattern, '');
                            message_class = 'error-message';
                        } else {
                            response = data;
                            EditBol.promoCode.setPromotionConfirmed('true');
                        }

                        response_txt.innerHTML = '<div id="promo-response-message" class="' + message_class + '"><p>' + response + '</p></div>';
                        EditBol.promoCode.is_making_request = false;
                    });
                }
            }
        }
    },

    rateQuoteInfo: {
        init: function () {
            let $rateQuoteInfoNum = $('#rate-quote-info-number'),
                rateQuoteInfoNumInput = document.getElementById('rate-quote-info-number'),
                old_rqin_value = rateQuoteInfoNumInput.value;

            $rateQuoteInfoNum.on('keyup', function ($event) {
                let new_rqin_value = rateQuoteInfoNumInput.value;
                let bol_comments = document.getElementById('bol-comments');
                let old_str = "Rate Quote: " + old_rqin_value;
                let new_str = "";

                //console.log("$rateQuoteInfoNum.on(" + $event.type + ") id: " + $rateQuoteInfoNum.attr('id') + " old: " + old_rqin_value + " new: " + new_rqin_value);
                if (new_rqin_value !== old_rqin_value) {

                    if ( new_rqin_value !== "") {
                        new_str = "Rate Quote: " + new_rqin_value;
                    }

                    //If Rate Quote is already there then replace
                    //Else add
                    if ( bol_comments.value.indexOf(old_str) !== -1 ) {
                        bol_comments.value = bol_comments.value.replace(old_str, new_str)
                    }
                    else
                    {
                        if (bol_comments.value === '') {
                            bol_comments.value = new_str;
                        } else  {
                            bol_comments.value += '\n' + new_str;
                        }

                    }
                    old_rqin_value = new_rqin_value;
                }
            });
        }
    },

    setErrorForever: function(input_obj, message){
        EditBol.setErrorForeverWithParentClass( input_obj, message, 'error-input' )
    },

    setErrorForeverWithParentClass: function(input_obj, message, class_to_add_to_input_obj){
        let error_obj = document.createElement('p'),
        id = input_obj.id + '-error',
        error_txt = document.createTextNode(message);

        error_obj.className = 'error-inline';

        // Check to see if error already exists
        if (!document.getElementById(id)) {
            error_obj.setAttribute('id', id);
            input_obj.parentNode.appendChild(error_obj);
            if (class_to_add_to_input_obj != null ) {
                $(input_obj).addClass( class_to_add_to_input_obj );
            }
            error_obj.appendChild(error_txt);
        }
    },

    // Removes Error Message from the DOM
    removeError: function (input_obj) {
        if(input_obj != null) {
            let err_id = input_obj.id + '-error';
            let error_obj = document.getElementById(err_id);
            if (error_obj !== null) {
                error_obj.parentNode.removeChild(error_obj);
                $(input_obj).removeClass('error-input');
            }
        }
    },

    // Get matching Hazmat UN record
    getMatchingUNRecord: function (response_ary, input_obj) {
        let param_pkg_class      = input_obj.getAttribute('data-pkg-class'),
            param_haz_class      = input_obj.getAttribute('data-haz-class'),
            param_haz_subclass   = input_obj.getAttribute('data-haz-subclass'),
            param_haz_desc       = input_obj.getAttribute('data-haz-desc'),
            param_haz_is_nos     = input_obj.getAttribute('data-nos') === 'true'? 'Y':'N';
        for (let i = 3; i < response_ary.length - 1; i++) {
            let un_record = response_ary[i].split(";");
                haz_is_nos = un_record[0];
                pkg_class = un_record[1];
                haz_class = un_record[2];
                sub_class = un_record[3];
                desc      = un_record[4];
            let haz_is_nos_are_equal = param_haz_is_nos.trim().toUpperCase() === haz_is_nos.trim().toUpperCase(),
                pkg_classes_are_equal = param_pkg_class.trim().toUpperCase() === pkg_class.trim().toUpperCase(),
                haz_classes_are_equal = param_haz_class.trim().toUpperCase() === haz_class.trim().toUpperCase(),
                haz_subclasses_are_equal = param_haz_subclass.trim().toUpperCase() === sub_class.trim().toUpperCase(),
                haz_descrs_are_equal = param_haz_desc.trim().toUpperCase() === desc.trim().toUpperCase()
            if (haz_is_nos_are_equal && pkg_classes_are_equal && haz_classes_are_equal && haz_subclasses_are_equal && haz_descrs_are_equal ){
                return true;
            }
       }
       return false;
    },

    // Register the event listener for the button, "reset-guaranteed-shipping-opts", to reset guaranteed shipping options
    setEventOnResetGuaranteedShippingOpts: function () {
        const resetGuaranteedShippingOptsBtn = document.getElementById('reset-guaranteed-shipping-opts');
        resetGuaranteedShippingOptsBtn.addEventListener('click', function() {
            EditBol.resetStandardGuarantee();
            const radioButtons = document.getElementsByName('guaranteeDeliveryBy');
            for(const element of radioButtons) {
                element.checked = false;
            }

            EditBol.hideTarget($('#standard-option-fields'));
        });
    },

    // Create a function that resets the guaranteeDeliveryBy radio buttons
    resetGuaranteeDeliveryBy: function () {
        const radioButtons = document.getElementsByName('guaranteeDeliveryBy');
        for(const element of radioButtons) {
            element.checked = false;
        }
    },

    // Create a function that returns true if the guaranteeDeliveryBy radio button is checked
    isGuaranteeDeliveryByChecked: function () {
        const radioButtons = document.getElementsByName('guaranteeDeliveryBy');
        for(const element of radioButtons) {
            if (element.checked) {
                return true;
            }
        }
        return false;
    },

    // Create a function that returns true if the guaranteeDeliveryBy radio button with a value of "by5" is checked
    isGuaranteeDeliveryBy5Checked: function () {
        const radioButtons = document.getElementsByName('guaranteeDeliveryBy');
        for(const element of radioButtons) {
            if (element.checked && element.value === 'by5') {
                return true;
            }
        }
        return false;
    },

    // Create a function that returns true if the guaranteeDeliveryBy radio button with a value of "byNoon" is checked
    isGuaranteeDeliveryByNoonChecked: function () {
        const radioButtons = document.getElementsByName('guaranteeDeliveryBy');
        for(const element of radioButtons) {
            if (element.checked && element.value === 'byNoon') {
                return true;
            }
        }
        return false;
    },

};

EditBol.init();
window.scrollTo(0, 0); // scroll to top
