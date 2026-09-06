//-----------------------------------------------------*
// PLEASE DO NOT REFORMAT ... until I am done with REDESIGN-53
// Thanks!
//-----------------------------------------------------*

var AjaxCities = {
    response_str: '',

    // Factory method
    init: function (zip_input_id, city_select_id, state_input_id, country_input_id, include_mexico, country, callback) {
        return {
            zipInit: function () {
                var $zip_input     = jQuery('#' + zip_input_id),
                    $city_select   = jQuery('#' + city_select_id),
                    state_input    = null,
                    //$country_input = jQuery('#' + country_input_id),
                    is_mexico_included;

                if (document.getElementById(state_input_id)) {
                    state_input = document.getElementById(state_input_id);
                }

                if (include_mexico !== null) {
                    is_mexico_included = include_mexico;
                }

                AjaxCities.setZipFieldEventHandlers($zip_input, $city_select[0], state_input, include_mexico, country, callback);
                AjaxCities.setCityFieldEventHandlers($city_select, state_input_id, country_input_id);
            }
        };
    },
    
    //init  for findCitiesByCountryZip
    init2: function (country_input_id, zip_input_id, city_select_id, state_input_id, callback) {
        return {
            zipInit2: function () {
                var $zip_input     = jQuery('#' + zip_input_id),
                    $city_select   = jQuery('#' + city_select_id),
                    state_input    = null,
                    $country_input = jQuery('#' + country_input_id);

                if (document.getElementById(state_input_id)) {
                    state_input = document.getElementById(state_input_id);
                }


                //setZipFieldEventHandlers 
                $zip_input.on('input', function (e) {
                    country = $country_input.val();
                    AjaxCities.handleInputZip(this, $city_select[0], state_input, true, country, callback, e);
                });
                
                //setCityFieldEventHandlers($city_select, state_input_id, country_input_id);
                $city_select.on('change', function () {
                    if (state_input_id !== undefined && state_input_id !== null) {
                        // Update State field
                        document.getElementById(state_input_id).value = this.options[this.selectedIndex].getAttribute('data-state');
                    }
                });
            }
        };
    },
    
    //This is origin find cities by ZIP - where Country is changed by City selected
    findCities: function (zip_input_id, city_select_id, state_input_id, country_input_id, include_mexico, country, callback) {
        var select = AjaxCities.init(zip_input_id, city_select_id, state_input_id, country_input_id, include_mexico, country, callback);
        select.zipInit();
    },
    
    //The Country select and zip are input and Country cannot be changed except by user
    //findCities2
    findCitiesByCountryZip: function (country_input_id, zip_input_id, city_select_id, state_input_id,  callback) {
        var select = AjaxCities.init2(country_input_id, zip_input_id, city_select_id, state_input_id,   callback);
        select.zipInit2();
    },

    setZipFieldEventHandlers: function ($zip_input, city_select, state_input, include_mexico, country, callback) {
        //SHIPPLUS-467  changed from keyup to inptu
        $zip_input.on('input', function (e) {
            AjaxCities.handleInputZip(this, city_select, state_input, include_mexico, country, callback, e);
        });
    },

    resetZipEvent: function ($zip_input, city_select, state_input) {
        var zip_input = $zip_input[0];

        ($zip_input).off();     //SHIPPLUS-345 - I had to use both these off lines in order to fix the issue
        $('#' + zip_input.id).off();  //#SZ, #CZ...
        //$._data($('#SZ')[0], "events");
        //$._data(zip_input, "events");       
        AjaxCities.clearCities(zip_input, city_select, state_input);
    },

    changeZipEvent: function (country_select, $zip_input, city_select, state_input, zip_id, city_id, state_id, country_id) {
        AjaxCities.resetZipEvent($zip_input, city_select, state_input);

        // Reset event binding with respect to country
        if (country_select !== null && country_select.value.toLowerCase() === 'ca') {
            AjaxCities.findCities(zip_id, city_id, state_id, country_id, false, 'CA');
        } else if (country_select !== null && country_select.value.toLowerCase() === 'mx') {
            AjaxCities.findCities(zip_id, city_id, state_id, country_id, true, 'MX');
        } else if (country_select !== null && country_select.value.toLowerCase() === 'us') {
            AjaxCities.findCities(zip_id, city_id, state_id, country_id, false, 'US');
        } else {
            AjaxCities.findCities(zip_id, city_id, state_id, country_id, false);
        }
    },

    setCityFieldEventHandlers: function ($city_select, state_input_id, country_input_id) {
        $city_select.on('change', function () {
            if (state_input_id !== undefined && state_input_id !== null) {
                // Update State field
                document.getElementById(state_input_id).value = this.options[this.selectedIndex].getAttribute('data-state');
            }

            if (country_input_id !== undefined && country_input_id !== null) {
                // Update Country field
                document.getElementById(country_input_id).value = this.getAttribute('data-country');
            }
        });
    },

    handleInputZip: function (zip_input, city_select, state_input, include_mexico, country, callback, event) {
        $(city_select).empty();
        var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;

        if (keyCode == 37 || keyCode == 39 || keyCode == 13) {
            return false;
        }

        if (country !== null && country !== undefined && (country.toLowerCase() === 'ca' || country.toLowerCase() === 'canada')) {
            AjaxCities.getCanadianCities(zip_input, city_select, state_input, include_mexico, callback);
        } else if (country !== null && country !== undefined && (country.toLowerCase() === 'mx' || country.toLowerCase() === 'mexico')) {
            AjaxCities.getMexicanCities(zip_input, city_select, state_input, include_mexico, callback);
        } else if (country !== null && country !== undefined && (country.toLowerCase() === 'us' || country.toLowerCase() === 'us')) {
            AjaxCities.getAmericanCities(zip_input, city_select, state_input, include_mexico, callback);
        } else {
            AjaxCities.getCities(zip_input, city_select, state_input, include_mexico, callback);
        }
    },

    getCities: function (zip_input, city_select, state_input, include_mexico, callback) {
        var zip_val = zip_input.value.trim();

        if (AjaxCities.isValidZip(zip_input, city_select, state_input)) {
            jQuery.ajax({
                type: 'get',
                url: '/servlet/Location',
                data: {
                    action: 'doGet',
                    whichFunc: 'GetCitiesFromZip',
                    zipCode: zip_val,
                    getMexico: include_mexico
                }
            }).done(function (data) {
                AjaxCities.response_str = data.trim();
                AjaxCities.populateCitiesSelect(data.trim(), zip_input, city_select, state_input, function (city_select, state, country) {
                    if (typeof callback === 'function') {
                        callback(city_select, state, country);
                    }
                });
            });
        }
    },

    getAmericanCities: function (zip_input, city_select, state_input, include_mexico, callback) {
        var zip_val = zip_input.value.trim();

        if (AjaxCities.isValidZip(zip_input, city_select, state_input)) {
            jQuery.ajax({
                type: 'get',
                url: '/servlet/Location',
                data: {
                    action: 'doGet',
                    whichFunc: 'GetCitiesFromZip',
                    zipCode: zip_val,
                    getMexico: include_mexico
                }
            }).done(function (data) {
                AjaxCities.response_str = data.trim();
                AjaxCities.populateCitiesSelect(AjaxCities.americanCitiesResponseStr(), zip_input, city_select, state_input, function (city_select, state, country) {
                    if (typeof callback === 'function') {
                        callback(city_select, state, country);
                    }
                });
            });
        }
    },

    getCanadianCities: function (zip_input, city_select, state_input, include_mexico, callback) {
        var zip_val = zip_input.value.trim();

        if (AjaxCities.isValidZip(zip_input, city_select, state_input)) {
            jQuery.ajax({
                type: 'get',
                url: '/servlet/Location',
                data: {
                    action: 'doGet',
                    whichFunc: 'GetCitiesFromZip',
                    zipCode: zip_val,
                    getMexico: include_mexico
                }
            }).done(function (data) {
                AjaxCities.response_str = data.trim();
                AjaxCities.populateCitiesSelect(AjaxCities.canadianCitiesResponseStr(), zip_input, city_select, state_input, function (city_select, state, country) {
                    if (typeof callback === 'function') {
                        callback(city_select, state, country);
                    }
                });
            });
        }
    },

    getMexicanCities: function (zip_input, city_select, state_input, include_mexico, callback) {
        var zip_val = zip_input.value.trim();

        if (AjaxCities.isValidZip(zip_input, city_select, state_input)) {
            jQuery.ajax({
                type: 'get',
                url: '/servlet/Location',
                data: {
                    action: 'doGet',
                    whichFunc: 'GetCitiesFromZip',
                    zipCode: zip_val,
                    getMexico: include_mexico
                }
            }).done(function (data) {
                AjaxCities.response_str = data.trim();
                AjaxCities.populateCitiesSelect(AjaxCities.mexicanCitiesResponseStr(), zip_input, city_select, state_input, function (city_select, state, country) {
                    if (typeof callback === 'function') {
                        callback(city_select, state, country);
                    }
                });
            });
        }
    },

    citiesArray: function () {
        var data = AjaxCities.response_str,
            data_ary = data.split('|'),
            len = data_ary.length,
            i = 0,
            data_list_ary = [];

        // Create multidimensional array from cities list
        for (i = 0; i < len; i++) {
            data_list_ary.push([data_ary[i].split(',')]);
        }

        return data_list_ary;
    },

    americanCitiesResponseStr: function () {
        var city_ary = AjaxCities.citiesArray(),
            len = city_ary.length,
            i = 0,
            american_cities_list = '',
            city_last_part,
            us_len;

        // Create new list of American cities and delimit items with a pipe character
        for (i = 0; i < len; i++) {
            if (city_ary[i][0][2] === undefined) {
                return '';
            }

            city_last_part = city_ary[i][0][2].trim();

            if (city_ary[i][0][2] === 'US') {
                us_len = city_ary[i][0][2].length;
                american_cities_list += city_ary[i][0] + '|';
            }
        }

        // trim trailing pipe character
        american_cities_list = american_cities_list.replace(/\|+$/, '');

        return american_cities_list;
    },

    mexicanCitiesResponseStr: function () {
        var city_ary = AjaxCities.citiesArray(),
            len = city_ary.length,
            i = 0,
            mexican_cities_list = '',
            city_last_part,
            mx_len;

        // Create new list of Mexico cities and delimit items with a pipe character
        for (i = 0; i < len; i++) {
            if (city_ary[i][0][2] === undefined) {
                return '';
            }

            city_last_part = city_ary[i][0][2].trim();

            if (city_last_part === 'MX') {
                mx_len = city_last_part.length;
                mexican_cities_list += city_ary[i][0] + '|';
            }
        }

        // trim trailing pipe character
        mexican_cities_list = mexican_cities_list.replace(/\|+$/, '');

        return mexican_cities_list;
    },

    canadianCitiesResponseStr: function () {
        var city_ary = AjaxCities.citiesArray(),
            len = city_ary.length,
            i = 0,
            canadian_cities_list = '',
            city_last_part,
            ca_len;

        // Create new list of Candian cities and delimit items with a pipe character
        for (i = 0; i < len; i++) {
            if (city_ary[i][0][2] === undefined) {
                return '';
            }

            city_last_part = city_ary[i][0][2].trim();

            if (city_ary[i][0][2] === 'CA') {
                ca_len = city_ary[i][0][2].length;
                canadian_cities_list += city_ary[i][0] + '|';
            }
        }

        // trim trailing pipe character
        canadian_cities_list = canadian_cities_list.replace(/\|+$/, '');

        return canadian_cities_list;
    },

    // Creates options for the select field
    populateCitiesSelect: function (response_str, zip_input, city_select, state_input, callback) {
        var option_el = document.createElement('option'),
            response_list,
            len,
            parts_ary,
            state,
            country,
            option_txt,
            option,
            i,
            temp_ary;

        if (response_str === '') {
            // clear zip, city, state
            AjaxCities.clearCities(zip_input, city_select, state_input);

            // set error and break
            Averitt.setError(zip_input, 'Invalid ZIP or Postal Code');
            $(zip_input).trigger('focus').trigger('select');
            return;
        } else {
            response_list = response_str.split('|');
            len           = response_list.length;

            // Initialize so that all options except for first one are clear
            city_select.options.length = 1;

            // Create option nodes
            for (i = 0; i < len; i += 1) {
                parts_ary  = response_list[0].split(',');
                option     = option_el.cloneNode(true);
                temp_ary   = response_list[i].split(',');
                state      = temp_ary[1].trim();
                country    = temp_ary[2].trim();
                option_txt = document.createTextNode(temp_ary[0]);
                option.appendChild(option_txt);
                option.setAttribute('data-state', state);
                city_select.appendChild(option);
            }

        }

        // Set some data attributes on the select input for later reference
        city_select.setAttribute('data-state', state);
        city_select.setAttribute('data-country', country);

        // Do something with the select when method is finished
        if (typeof callback === 'function') {
            callback(city_select, state, country);
        }
    },

    clearCities: function (zip_input, city_select, state_input) {
        zip_input.value = '';
        city_select.options.length = 1;

        if (state_input !== null && state_input !== undefined) {
            state_input.value = '';
        }
    },

    // Accepts ZIP @string
    // Returns @boolean
    isValidZip: function (zip_input, city_select, state_input) {
        var is_zip_valid = false,
            zip_val      = zip_input.value.trim(),
            zip_len      = zip_val.length,
            canada_regex = /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i,
            us_regex     = /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}$)/i;

        if (zip_len > 5) {
            // Canada
            is_zip_valid = canada_regex.test(zip_val);
            AjaxCities.validateZip(is_zip_valid, zip_input, city_select, state_input);
        } else if (zip_len > 4 &&
                AjaxCities.isNumeric(zip_val)) {
            // US ZIP
            is_zip_valid = us_regex.test(zip_val);
            AjaxCities.validateZip(is_zip_valid, zip_input, city_select, state_input);
        }

        return is_zip_valid;
    },
    
    isZipInCountry: function (zip_val, country_select){
        var country_select_value = country_select.value,
            zip_len              = zip_val.length,
            canada_regex         = /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i,
            us_regex             = /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}$)/i;
        
        if (zip_len > 5) {
            // Canada
            if(canada_regex.test(zip_val) && country_select_value==='CA'){
                return true;
            }
        } else if (zip_len > 4 &&
                AjaxCities.isNumeric(zip_val)) {
            // US ZIP
            if(us_regex.test(zip_val) && country_select_value==='US'){
                return true;
            }
        } else {
            return false;
        }
    },

    validateZip: function (is_zip_valid, zip_input, city_select, state_input) {
        if (is_zip_valid === false) {
            Averitt.setError(zip_input, 'Invalid Zip Code!');
            AjaxCities.clearCities(zip_input, city_select, state_input);
        }
    },

    isNumeric: function (num) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    }
};
