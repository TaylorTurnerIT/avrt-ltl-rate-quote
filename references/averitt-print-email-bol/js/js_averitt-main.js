/*--------------------------------------------------------------------*
 * Dependencies:
 * /js/vendor/jquery-3.6.4.min.js
 *--------------------------------------------------------------------*/

// Prototype trim method if it does not already exist
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        'use strict';
        return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
    };
}

//Prototype trim method if it does not already exist
if (!String.prototype.noScript) {
    String.prototype.noScript = function () {
        'use strict';
        var $html = $(this.bold());
        $html.find('script').remove();
        return $html.text();
    };
}

//Prototype blank method if it does not already exist
if (!String.prototype.blank) {
    String.prototype.blank = function () {
        'use strict';
        return (!this || /^\s*$/.test(this));
    };
}

// From jQuery equivalent to Prototype "defer" method:
// at http://stackoverflow.com/questions/3616781/is-there-a-jquery-equivalent-to-prototypes-defer
if (!Function.prototype.deferFunc) {
    Function.prototype.deferFunc = function() {
        'use strict';
        var _method = this,
            args = Array.prototype.slice.call(arguments, 0);
        return window.setTimeout(function() {
            return _method.apply(_method, args);
        }, 0.01);
    };
}

var Formatter, Session, Cookie, Averitt, DateValidator, Viewport;

Formatter = {
    patterns: {
        illegal_chars: /(~|`|!|@|#|\$|%|\^|&|\*|\(|\)|\\|\.|_|-|\+|=|,|[a-zA-Z])/g,
        regex_three_digits: /^[0-9]{3}/g,
        regex_seg_three_digits: /^[0|1]{1}[0-9]{1}\/[0-3]{1}[0-9]{2}/g,
        regex_seg_1: /^[0|1]{1}[0-9]{1}/g,
        regex_seg_1_slash: /^[0|1]{1}[0-9]{1}\//g,
        regex_one_digit_zero: /^[0]\//g,
        regex_one_digit: /[1-9]\//g,
        regex_seg_2: /^[0|1]{1}[0-9]{1}\/[0-3]{1}[0-9]{1}/g,
        regex_two_digit: /\/[1-9]{1}\//g,
        regex_seg_3: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/g,
        regex_no_slashes: /[0-9]{2}\/[0-9]{2}[\/]{1,4}/g,
        regex_non_digits: /\D/g,
        regex_digits: /\d/g
    },

    setAllDateTimers: function (date_input_obj, date_illegal_chars_timer, date_seg1_timer, date_seg2_timer, date_seg3_timer) {
        Formatter.setIllegalCharsTimer(date_input_obj, date_illegal_chars_timer);
        Formatter.setDateSegOneTimer(date_input_obj, date_seg1_timer);
        Formatter.setDateSegTwoTimer(date_input_obj, date_seg2_timer);
        Formatter.setDateSegThreeTimer(date_input_obj, date_seg3_timer);
    },

    clearAllDateTimers: function (date_illegal_chars_timer, date_seg1_timer, date_seg2_timer, date_seg3_timer) {
        clearInterval(date_illegal_chars_timer);
        clearInterval(date_seg1_timer);
        clearInterval(date_seg2_timer);
        clearInterval(date_seg3_timer);

        date_illegal_chars_timer = 0;
        date_seg1_timer = 0;
        date_seg2_timer = 0;
        date_seg3_timer = 0;
    },

    evaluateDateState: function (date_input_obj, date_seg1_timer, date_seg2_timer) {
        if (date_input_obj.value.length === 1 && date_seg1_timer === 0) {
            Formatter.setDateSegOneTimer(date_input_obj, date_seg1_timer);
        }

        if (date_input_obj.value.length === 4 && date_seg2_timer === 0) {
            Formatter.setDateSegTwoTimer(date_input_obj, date_seg2_timer);
        }
    },

    setIllegalCharsTimer: function (date_input_obj, date_illegal_chars_timer) {
        date_illegal_chars_timer = setInterval(function () {
            Formatter.removeIllegalChars(date_input_obj);
        }, 50);
    },

    setDateSegOneTimer: function (date_input_obj, date_seg1_timer) {
        date_seg1_timer = setInterval(function () {
            Formatter.cleanDateSegmentOne(date_input_obj, date_seg1_timer);
        }, 50);
    },

    setDateSegTwoTimer: function (date_input_obj, date_seg2_timer) {
        date_seg2_timer = setInterval(function () {
            Formatter.cleanDateSegmentTwo(date_input_obj, date_seg2_timer);
        }, 50);
    },

    setDateSegThreeTimer: function (date_input_obj, date_seg3_timer) {
        date_seg3_timer = setInterval(function () {
            Formatter.cleanDateSegmentThree(date_input_obj);
        }, 50);
    },

    removeIllegalChars: function (date_input_obj) {
        // Remove bad characters
        if (Formatter.patterns.illegal_chars.test(date_input_obj.value)) {
            date_input_obj.value = date_input_obj.value.replace(Formatter.patterns.illegal_chars, '');
        }
    },

    cleanDateSegmentOne: function (date_input_obj, date_seg1_timer) {
        var first_seg,
            val = date_input_obj.value,
            len = date_input_obj.value.length;

        // First character cannot be a slash
        if (len === 1 && val === '/') {
            date_input_obj.value = '';
        }

        // if number value consists of a digit followed by a slash, prepend a zero to that segment
        if (len === 2 && Formatter.patterns.regex_one_digit.test(val)) {
            date_input_obj.value = '0' + val;
            clearInterval(date_seg1_timer);
            date_seg1_timer = 0;
        }

        // Month cannot be zero
        if (len === 2 && Formatter.patterns.regex_one_digit_zero.test(val)) {
            date_input_obj.value = '';
        }

        // Month cannot be double zero
        if (len === 2 && val == '00') {
            date_input_obj.value = '';
        }

        // Month cannot be greater than 12
        if (len === 2) {
            first_seg = val;

            if (first_seg > 12) {
                date_input_obj.value = val.replace(first_seg, '');
            }
        }

        // Append a trailing slash
        if (len === 2 && Formatter.patterns.regex_seg_1.test(val)) {
            date_input_obj.value = date_input_obj.value + '/';
            clearInterval(date_seg1_timer);
            date_seg1_timer = 0;
        }

        if (len === 3 && Formatter.patterns.regex_seg_1_slash.test(val)) {
            clearInterval(date_seg1_timer);
            date_seg1_timer = 0;
        }
    },

    cleanDateSegmentTwo: function (date_input_obj, date_seg2_timer) {
        var first_seg = date_input_obj.value.substring(0,3),
            second_seg,
            temp_num;

        // 4th character cannot be a slash
        if (date_input_obj.value.length === 4 && date_input_obj.value === first_seg + '/') {
            date_input_obj.value = first_seg;
        }

        // Day cannot be greater than 31
        if (date_input_obj.value.length === 5) {
            second_seg = date_input_obj.value.substring(3);

            if (second_seg > 31) {
                date_input_obj.value = date_input_obj.value.replace(second_seg, '');
            }
        }

        // Day cannot be 0/
        if (date_input_obj.value.length === 5 && date_input_obj.value === first_seg + '0/') {
            date_input_obj.value = first_seg;
        }

        // Day cannot be double 00
        if (date_input_obj.value.length === 5 && second_seg == '00') {
            date_input_obj.value = date_input_obj.value.replace(second_seg, '');
        }

        // If second segment is only one digit followed by a slash prepend a zero to that segment
        if (date_input_obj.value.length === 5 && Formatter.patterns.regex_two_digit.test(date_input_obj.value)) {
            temp_num = date_input_obj.value.substring(3,4);
            date_input_obj.value = first_seg + '0' + temp_num;
        }

        if (date_input_obj.value.length === 5 && Formatter.patterns.regex_seg_2.test(date_input_obj.value)) {
            date_input_obj.value = date_input_obj.value + '/';
            clearInterval(date_seg2_timer);
            date_seg2_timer = 0;
        }

        if (date_input_obj.value.length === 6 && Formatter.patterns.regex_seg_2.test(date_input_obj.value)) {
            clearInterval(date_seg2_timer);
            date_seg2_timer = 0;
        }
    },

    cleanDateSegmentThree: function (date_input_obj) {
        var final_val;

        // Do not permit slashes in fourth segment
        if (date_input_obj.value.substring(6,7) === '/' ||
            date_input_obj.value.substring(7,8) === '/' ||
            date_input_obj.value.substring(8,9) === '/' ||
            date_input_obj.value.substring(9,10) === '/') {
            date_input_obj.value = date_input_obj.value.substring(0, date_input_obj.value.length - 1);
        }

        // Do not permit more that 4 digits
        if (date_input_obj.value.length === 10 && Formatter.patterns.regex_seg_3.test(date_input_obj.value)) {
            // Store reference to input value as final value
            final_val = date_input_obj.value;
        }

        // Segment 3 cannot be more than 4 digits long
        if (date_input_obj.value.length > 10) {
            date_input_obj.value = date_input_obj.value.substring(0, date_input_obj.value.length - 1);
        }
    },

    // This is a factory method that instantiates a new formatDate object
    // The argument should be the id of a text input
    registerInputId: function (id) {
        return {
            formatDate: function () {
                var date_input_obj = document.getElementById(id),
                    date_illegal_chars_timer = 0,
                    date_seg1_timer = 0,
                    date_seg2_timer = 0,
                    date_seg3_timer = 0,
                    keyCount = 0,
                    $input_obj;

                $input_obj = jQuery(date_input_obj);

                // Set timers when input is in focus
                $input_obj.on('focus', function () {
                    Formatter.setAllDateTimers(this, date_illegal_chars_timer, date_seg1_timer, date_seg2_timer, date_seg2_timer);
                });

                // prevent key repeat
                $input_obj.on('keypress', function (e) {
                    if (keyCount > 1) {
                        e.preventDefault();
                    }

                    keyCount++;
                });

                $input_obj.on('keyup keydown', function () {
                    var third_num = this.value.substring(2, 3),
                        sixth_num = this.value.substring(5, 6);

                    // prevent key repeat
                    keyCount = 0;

                    // The following 2 conditions need to be set on keyup, not setInterval

                    // Cannot have 3 digits in a row in first segment
                    // append slash, reposition third number to fourth position
                    if (this.value.length === 3 && Formatter.patterns.regex_three_digits.test(this.value)) {
                        this.value = this.value.substring(0, this.value.length - 1) + '/' + third_num;
                    }

                    // Cannot have 3 digits in a row in second segment
                    // append slash, reposition sixth number to fifth position
                    if (this.value.length === 6 && Formatter.patterns.regex_seg_three_digits.test(this.value)) {
                        this.value = this.value.substring(0, this.value.length - 1) + '/' + sixth_num;
                    }

                    Formatter.evaluateDateState(this, date_seg1_timer, date_seg2_timer);
                });

                // Clear timers when input loses focus
                $input_obj.on('blur', function () {
                    Formatter.clearAllDateTimers(date_illegal_chars_timer, date_seg1_timer, date_seg2_timer, date_seg3_timer);
                });
            }
        };
    },

    // Phone Formatter
    setPhoneSegOneTimer: function (phone_seg1_obj, phone_seg2_obj, phone_seg1_timer) {
        phone_seg1_timer = setInterval(function () {
            Formatter.cleanPhoneSeg(phone_seg1_obj, phone_seg2_obj, phone_seg1_timer);
        }, 50);
    },

    setPhoneSegTwoTimer: function (phone_seg2_obj, phone_seg3_obj, phone_seg2_timer) {
        phone_seg2_timer = setInterval(function () {
            Formatter.cleanPhoneSeg(phone_seg2_obj, phone_seg3_obj, phone_seg2_timer);
        }, 50);
    },

    setPhoneSegThreeTimer: function (phone_seg3_obj, phone_seg3_timer) {
        phone_seg3_timer = setInterval(function () {
            Formatter.cleanPhoneLastSeg(phone_seg3_obj, phone_seg3_timer);
        }, 50);
    },

    cleanPhoneSeg: function (input_obj_1, input_obj_2, timer) {
        var val = input_obj_1.value,
            len = val.length;

        if (Formatter.patterns.regex_non_digits.test(val)) {
            input_obj_1.value = val.substring(0, val.length - 1);
        }

        if (input_obj_1.value.length === 3 && Formatter.patterns.regex_digits.test(val)) {
            // go to last input
            $(input_obj_2).trigger('focus').trigger('select');

            clearInterval(timer);
            timer = 0;
        }
    },

    cleanPhoneLastSeg: function (phone_seg3_obj, phone_seg3_timer) {
        if (Formatter.patterns.regex_non_digits.test(phone_seg3_obj.value)) {
            phone_seg3_obj.value = phone_seg3_obj.value.substring(0, phone_seg3_obj.value.length - 1);
        }

        if (phone_seg3_obj.value.length > 4 && Formatter.patterns.regex_digits.test(phone_seg3_obj.value)) {
            phone_seg3_obj.value = phone_seg3_obj.value.substring(0, phone_seg3_obj.value.length - 1);
        }
    },

    // This is a factory method that instantiates a new formatPhone object
    // The argument should be the id an element that contains three phone input segments
    registerPhoneGroupId: function (phone_group_id) {
        return {
            formatPhone: function () {
                var phone_input_group = document.getElementById(phone_group_id),
                    inputs = phone_input_group.getElementsByTagName('input'),
                    $seg1 = jQuery(inputs[0]),
                    $seg2 = jQuery(inputs[1]),
                    $seg3 = jQuery(inputs[2]),
                    phone_seg1_timer = 0,
                    phone_seg2_timer = 0,
                    phone_seg3_timer = 0,
                    seg1_key_count = 0,
                    seg2_key_count = 0,
                    seg3_key_count = 0;

                $seg1.on('focus', function () {
                    if (inputs[0].value.length < 3) {
                        Formatter.setPhoneSegOneTimer(inputs[0], inputs[1], phone_seg1_timer);
                    }
                });

                $seg1.on('keyup', function () {
                    if (inputs[0].value.length < 3) {
                        Formatter.setPhoneSegOneTimer(inputs[0], inputs[1], phone_seg1_timer);
                    }
                });

                $seg2.on('focus', function () {
                    if (inputs[1].value.length < 3) {
                        Formatter.setPhoneSegTwoTimer(inputs[1], inputs[2], phone_seg2_timer);
                    }
                });

                $seg2.on('keyup', function () {
                    if (inputs[1].value.length < 3) {
                        Formatter.setPhoneSegTwoTimer(inputs[1], inputs[2], phone_seg2_timer);
                    }
                });

                $seg3.on('focus', function () {
                    if (inputs[2].value.length < 4) {
                        Formatter.setPhoneSegThreeTimer(inputs[2], phone_seg3_timer);
                    }
                });

                $seg3.on('keyup', function () {
                    if (inputs[2].value.length < 4) {
                        Formatter.setPhoneSegThreeTimer(inputs[2], phone_seg3_timer);
                    }
                });

                // Prevent rapid firing while holding down a key
                $seg1.on('keypress', function (e) {
                    if (seg1_key_count > 1) {
                        e.preventDefault();
                    }
                    seg1_key_count++;
                });

                $seg2.on('keypress', function (e) {
                    if (seg2_key_count > 1) {
                        e.preventDefault();
                    }
                    seg2_key_count++;
                });

                $seg3.on('keypress', function (e) {
                    if (seg3_key_count > 1) {
                        e.preventDefault();
                    }
                    seg3_key_count++;
                });

                // Prevent rapid-fire keys and non-digit characters
                $seg1.on('keyup keydown', function () {
                    seg1_key_count = 0;

                    if (Formatter.patterns.regex_non_digits.test(inputs[0].value)) {
                        inputs[0].value = inputs[0].value.substring(0, inputs[0].value.length - 1);
                    }

                    if (inputs[0].value.length === 4) {
                        inputs[0].value = inputs[0].value.substring(0, inputs[0].value.length - 1);
                    }
                });

                $seg2.on('keyup keydown', function () {
                    seg2_key_count = 0;

                    if (Formatter.patterns.regex_non_digits.test(inputs[1].value)) {
                        inputs[1].value = inputs[1].value.substring(0, inputs[1].value.length - 1);
                    }

                    if (inputs[1].value.length === 4) {
                        inputs[1].value = inputs[1].value.substring(0, inputs[1].value.length - 1);
                    }
                });

                $seg3.on('keyup keydown', function (e) {
                    seg3_key_count = 0;

                    if (Formatter.patterns.regex_non_digits.test(inputs[2].value)) {
                        inputs[2].value = inputs[2].value.substring(0, inputs[2].value.length - 1);
                    }
                });
            }
        };
    }
};

Session = {
    init_expire_count: 120, // seconds
    expire_warning: 43, // minutes
    warning_timer: 0,
    logout_timer: 0,
    message: '',

    init: function () {
        var is_logged_in = document.getElementById('user-logged-in');
        //console.log('Session start');

        if (is_logged_in !== null && is_logged_in.value === 'true') {
            this.count_left = this.init_expire_count;
            this.warning_timer = setTimeout(Session.createMessage, (Session.expire_warning * 60) * 1000);
        }
    },

    createMessage: function () {
        var $confirm_refresh;

        Session.message = `
            <div id="session-contents" class="modal-body">
                <h2 class="modal-title">Are you still there?</h2>
                <div class="modal-message">
                    <p>Your session will become inactive in <strong class="ae-color--text-brand"><span id="remaining-count">${Session.count_left}</span></strong></p>
                    <p><strong>Would you like to continue working?</strong></p>
                </div>
            </div>
            <div class="modal-controls">
                <button class="ae-button--secondary" id="confirm-refresh">
                    Yes, keep me logged in
                </button>
            </div>
        `;

        Session.appendOverlay();
        Session.remaining_count = document.getElementById('remaining-count');
        $confirm_refresh = jQuery('#confirm-refresh');

        $confirm_refresh.on('click', function (e) {
            Session.refresh();
            e.preventDefault();
        });

        Session.startLogoutTimer();
    },

    startLogoutTimer: function () {
        Session.logout_timer = setInterval(function () {
            Session.countdownLogout();
        }, 1000);
    },

    countdownLogout: function () {
        if (Session.count_left !== 0) {
            Session.count_left = Session.count_left - 1;
            Session.remaining_count.innerHTML = Session.count_left;
        } else {
            clearInterval(Session.logout_timer);
            location.href = '/logout';
        }
    },

    refresh: function () {
        // remove modal
        if (document.getElementById('session-overlay')) {
            Session.deleteModal();
        }

        clearInterval(Session.logout_timer);

        // make server call to refresh backend
        Session.callServer();

        // reset timer
        Session.count_left = Session.init_expire_count;
        Session.warning_timer = setTimeout(Session.createMessage, (Session.expire_warning * 60) * 1000);
    },

    callServer: function () {
        jQuery.ajax({
            type: 'get',
            url:  '/servlet/Location',
            data: {
                action:     'doGet',
                whichFunc:  'GetCitiesFromZip',
                zipCode:    '30030',
                getMexico:  'false'
            }
        }).done(function (data) {
            if (typeof console !== "undefined") {
                console.log('callServer(): ' + data);
            }
        });
    },

    appendOverlay: function () {
        var overlay = document.createElement('div');

        overlay.setAttribute('id', 'session-overlay');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);

        if (!document.getElementById('session-dialog')) {
            Session.createDialog();
        }
    },

    createDialog: function () {
        var container      = document.createElement('div'),
            overlay        = document.getElementById('session-overlay');

        container.setAttribute('id', 'session-dialog');
        container.className = 'ae-session-modal-dialog';
        container.innerHTML = Session.message;
        document.body.appendChild(container);
    },

    deleteModal: function () {
        var overlay = document.getElementById('session-overlay') ? document.getElementById('session-overlay') : 0,
            contents = document.getElementById('session-dialog') ? document.getElementById('session-dialog') : 0,
            mommy = overlay ? overlay.parentNode : '',
            daddy = contents ? contents.parentNode : '';

        if (overlay !== 0) {
            mommy.removeChild(overlay);
        }

        if (contents !== 0) {
            daddy.removeChild(contents);
        }
    }
};

Cookie = {
    getCookieVal: function (offset) {
        var endstr = document.cookie.indexOf (";", offset);
        if (endstr === -1) {
            endstr = document.cookie.length;
        }

        return unescape(document.cookie.substring(offset, endstr));
    },

    fixCookieDate: function (date) {
        var base = new Date(0),
            skew = base.getTime(); // dawn of (Unix) time - should be 0

        // Except on the Mac - ahead of its time
        if (skew > 0) {
            date.setTime (date.getTime() - skew);
        }
    },

    getCookie: function (name) {
        var arg  = name + "=",
            alen = arg.length,
            clen = document.cookie.length,
            i    = 0,
            j;

        while (i < clen) {
            j = i + alen;

            if (document.cookie.substring(i, j) === arg) {
                return Cookie.getCookieVal(j);
            }

            i = document.cookie.indexOf(" ", i) + 1;

            if (i === 0) {
                break;
            }
        }
        return null;
    },

    setCookie: function (name, value, expires, path, domain, secure) {
        document.cookie = name + "=" + escape (value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    },

    deleteCookie: function (name, path, domain) {
        if (Cookie.getCookie(name)) {
            document.cookie = name + "=" +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            "; expires=Thu, 01-Jan-70 00:00:01 GMT";
        }
    }
};

Averitt = {
    document_root: '',
    ajax_loader_id: 0,

    externalLinks: function () {
        'use strict';
        var $links = jQuery('a[rel="external"]');

        $links.on('click', function (event) {
            window.open(this.href);
            event.preventDefault();
            return false;
        });
    },

    insertAfter: function (new_node, existing_node) {
        'use strict';
        if (existing_node !== null) {
            if (existing_node.nextSibling) {
                existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling);
            } else {
                existing_node.parentNode.appendChild(new_node);
            }
        }
    },

    trimTextareaWhitespace: function (textarea_obj) {
        'use strict';
        textarea_obj.value = textarea_obj.value.replace(/(^\s+|\s+$)/gm, '');
    },

    trimTextarea: function (textarea_obj, callback) {
        var ary = textarea_obj.value.split('\n'),
            i_len = ary.length,
            temp_ary = [],
            i = 0,
            j = 0,
            cleaned_val = '',
            i_line,
            j_len;

        for (i = 0; i < i_len; i += 1) {
            i_line = ary[i].trim();
            if (i_line !== '') {
                temp_ary.push(i_line);
            }
        }

        j_len = temp_ary.length;

        for (j = 0; j < j_len; j += 1) {
            cleaned_val += temp_ary[j];
            if (j !== temp_ary.length - 1) {
                cleaned_val += '\n';
            }
        }

        textarea_obj.value = cleaned_val;

        if (typeof callback === 'function') {
            callback();
        }
    },

    hasClass: function (target, the_class) {
        var pattern = new RegExp("(^| )" + the_class + "( |$)");

        if (pattern.test(target.className)) {
            return true;
        }

        return false;
    },

    getRadioVal: function (radio_name) {
        var radio_obj = document.getElementsByName(radio_name),
            len = radio_obj.length,
            checked_val;

        while (len--) {
            if (radio_obj[len].checked) {
                checked_val = radio_obj[len].value;
            }
        }
        return checked_val;
    },

    setSelectedOption: function (select_input, select_val) {
        var len = select_input.options.length;
        while (len--) {
            if (select_input.options[len].value === select_val) {
                select_input.options[len].selected = true;
            }
        }
    },

    labelHelpers: {
        init: function () {
            'use strict';

            if (!document.getElementsByTagName('label')) {
                return;
            }

            var labels = document.getElementsByTagName('label'),
                i,
                len = labels.length,
                label_val,
                this_input;

            for (i = 0; i < len; i += 1) {
                label_val = labels[i].lastChild.nodeValue;
                if (labels[i].className === 'input-helper') {

                    jQuery(labels[i]).addClass('hidden');

                    if (labels[i].parentNode.getElementsByTagName('input')[0]) {
                        this_input = labels[i].parentNode.getElementsByTagName('input')[0];
                    } else {
                        this_input = labels[i].parentNode.getElementsByTagName('textarea')[0];
                    }


                    this.labelInput(label_val, this_input);
                }
            }
        },

        labelInput: function (label_val, this_input) {
            'use strict';
            if (this_input.value === '') {
                this_input.value = label_val;
                this.inputEvents(label_val, this_input);
            }
        },

        inputEvents: function (label_val, this_input) {
            'use strict';
            // W3C Modern Event Listener feature detection
            if (document.addEventListener) {
                this_input.addEventListener('focus', function () {
                    if (this_input.value === label_val) {
                        this_input.value = '';
                    }
                });

                this_input.addEventListener('blur', function () {
                    if (this_input.value === '') {
                        this_input.value = label_val;
                    }
                });

            } else if (document.attachEvent) {
                // If IE, oldschool clickhandlers
                this_input.onclick = function () {
                    if (this_input.value === label_val) {
                        this_input.value = '';
                    }
                };

                this_input.onblur = function () {
                    if (this_input.value === '') {
                        this_input.value = label_val;
                    }
                };
            }
        }
    },

    ltlHelper: function () {
        'use strict';
        if (!document.getElementById('ltl-instructions') && !document.getElementById('ltl-tracker')) {
            return;
        }

        var instructions = document.getElementById('ltl-instructions').firstChild.nodeValue,
            this_textarea = document.getElementById('ltl-tracker');

        Averitt.labelHelpers.labelInput(instructions, this_textarea);
    },

    formDialog: {
        init: function () {
            'use strict';
            var forms = document.forms,
                len   = forms.length;

            while (len--) {
                this.processForm(forms[len]);
            }
        },

        processForm: function (form_obj) {
            'use strict';
            jQuery(form_obj).on('submit', function () {
                Averitt.formDialog.appendOverlay();
            });
        },

        appendOverlay: function (callback, msg) {
            var overlay = document.createElement('div');

            overlay.setAttribute('id', 'form-overlay');
            overlay.className = 'overlay';
            document.body.appendChild(overlay);

            if (!document.getElementById('form-dialog')) {
                Averitt.formDialog.createDialog(msg);
            }

            if (typeof callback === 'function') {
                setTimeout(callback, 500);
            }
        },

        createDialog: function (msg = 'Processing') {
            var container      = document.createElement('div'),
                contents       = container.cloneNode(true),
                overlay        = document.getElementById('form-overlay'),
                html;

            html = `<div class="ae-spinner--container">
                        <div class="ae-spinner--msg">${msg}</div>
                        <div class="ae-spinner--x-large"><div>
                    </div>`;

            container.setAttribute('id', 'form-dialog');
            container.className = 'modal-dialog--form';
            contents.setAttribute('id', 'form-contents');
            contents.className = 'modal-contents';
            contents.innerHTML = html;
            container.appendChild(contents);
            document.body.appendChild(container);
        },

        deleteModal: function () {
            var overlay = document.getElementById('form-overlay') ? document.getElementById('form-overlay') : 0,
                contents = document.getElementById('form-dialog') ? document.getElementById('form-dialog') : 0,
                mommy = overlay ? overlay.parentNode : '',
                daddy = contents ? contents.parentNode : '';

            if (overlay !== 0) {
                mommy.removeChild(overlay);
            }

            if (contents !== 0) {
                daddy.removeChild(contents);
            }
        }
    },

    login: {
        userField: null,
        passField: null,
        redirectTargetField: null,

        init: function () {
            let login,
                clean_user_value,
                clean_pass_value,
                clean_redirectTarget_value;

            if (!document.getElementById('login')) {
                return;
            }

            login              = document.getElementById('login');
            this.login_form    = login;
            this.userField     = document.getElementById('username');
            this.passField     = document.getElementById('password');
            this.redirectTargetField = document.getElementById('redirectTarget');

            // MAINTENANCE-700
            // Filter out script in username/password via escaping username/password
            // MAINTENANCE-740
            // Remove any script tag(s) and content contained within
            clean_user_value     = this.userField.value.trim().noScript();
            //console.log("Averitt.login.init() - clean_user_value: " + clean_user_value);
            clean_pass_value     = this.passField.value.trim().noScript();
            if (this.redirectTargetField !== null) {
                clean_redirectTarget_value = this.redirectTargetField.value.trim().noScript();
            } else {
                clean_redirectTarget_value = '';
            }

            // MAINTENANCE-740
            // Put the "cleaned" user name and password back into the form
            this.userField.value = clean_user_value;
            this.passField.value = clean_pass_value;
            if (this.redirectTargetField !== null) {
                this.redirectTargetField.value = clean_redirectTarget_value;
            }

            $(login).on("submit", function (event) {
                event.preventDefault();
                // REDESIGN-91 Handle 2x and 3x times calling submit for login
                // 2x were from using "submit" style handling
                // 3x were then found from the three times login.init() is called [Why? LOL]
                if (event.handled !== true) {
                    // Prevent multiple handlers from firing multiple times
                    event.handled = true;
                    Averitt.login.validate();
                } else {
                    // Do nothing, already handled
                }
            });
        },
        
        validate: function (e) {
            let user_error = 'Username cannot be empty',
                pass_error = 'Password cannot be empty',
                user_field = Averitt.login.userField,
                pass_field = Averitt.login.passField,
                redirectTarget_field = Averitt.login.redirectTargetField,
                // MAINTENANCE-700
                // Filter out script in username/password via escaping username/password
                // MAINTENANCE-740
                // Remove any script tag(s) and content contained within
                clean_user_value = user_field.value.trim().noScript(),
                clean_pass_value = pass_field.value.trim().noScript(),
                clean_redirectTarget_value = null;
            //console.log("Averitt.login.validate() - clean_user_value: " + clean_user_value);
                if (redirectTarget_field !== null) {
                    clean_redirectTarget_value = redirectTarget_field.value.trim().noScript();
                }

            // MAINTENANCE-740
            // Put the "cleaned" user name and password back into the form
            user_field.value = clean_user_value;
            pass_field.value = clean_pass_value;
            if (redirectTarget_field !== null) {
                redirectTarget_field.value = clean_redirectTarget_value;
            }

            // if username or password are empty, throw errors
            if (clean_user_value === '') {
                Averitt.setError(user_field,
                                 user_error);
                user_field.trigger('focus');
            } else if (clean_pass_value === '') {
                Averitt.setError(pass_field,
                                 pass_error);
                pass_field.trigger('focus');
            } else {
                Averitt.login.loginAjax(clean_user_value,
                                        clean_pass_value,
                                        clean_redirectTarget_value);
            }
        },

        loginAjax: function (userName,
                             userPwd,
                             redirectTarget) {
            let redirect = redirectTarget,
                error_box;

            let url_str = '/Login' + document.getElementById('nonce-for-js').value
            // Start spinny gif
            Averitt.login.handleLoginAjaxBeforeSend();

            jQuery.ajax({
                type:     'post',
                url:     url_str,
                data: {
                    // MAINTENANCE-733 & -735
                    // Change from escape(...) to encodeURIComponent(...), so that "+" is handled right
                    user: encodeURIComponent(userName),
                    pass: encodeURIComponent(userPwd)
                }
            }).done(function (data) {
                let htmlData = jQuery(jQuery.parseHTML(data));

                let errors = htmlData.find('#login-error').html();
                //console.log("loginAjax() - errors: " + errors);

                //TODO: Seperate Ajax from normal calls and setup a JSON object to
                //redirect for AJAX instead of having to parse html responses for ID's.

                if (errors) {
                    error_box = '<div class="error-message" id="login-error-box">' + errors.trim() + '</div>';
                    if (!document.getElementById('login-error-box')) {
                        // Append error box, since not exists
                        jQuery('#login').prepend(error_box);
                    } else {
                        // Replace contents of error box, since it exists
                        $('#login-error-box').html(errors.trim());
                    }

                    jQuery('#login-ajax-load').addClass('mute');
                    //location.href += '#login-error-box';
                    if (Viewport.getType() === 'handheld') {
                        Averitt.scrollToSection('login-form');
                    }
                } else if (redirect) {
                    location.replace(redirect);  //force password reset/change
                } else {
                    location.reload();
                }
            }).fail(function(data, textStatus, errorThrown){
                    let errors = "An error has occurred. data.status = " + data.status + "<br/>";
                        errors += "If this problem persists, please contact our Customer Technology Support team at 1-877-281-7131 ";
                        errors += "or email <a href=\"mailto:support@averittexpress.com\">support@averittexpress.com</a>";

                    error_box = '<div class="error-message" id="login-error-box">' + errors.trim() + '</div>';
                    if (!document.getElementById('login-error-box')) {
                        // Append error box, since not exists
                        jQuery('#login').prepend(error_box);
                    } else {
                        // Replace contents of error box, since it exists
                        $('#login-error-box').html(errors.trim());
                    }

                    jQuery('#login-ajax-load').addClass('mute');
                    //location.href += '#login-error-box';
                    if (Viewport.getType() === 'handheld') {
                        Averitt.scrollToSection('login-form');
                    }
                });
        },

        handleLoginAjaxComplete: function() {
            try {
                location.reload();
            } catch(error) {
                if (typeof console !== "undefined") {
                    console.log("handleLoginAjaxComplete Error: " + error.name + " " + error.description);
                }
            }
        },

        handleLoginAjaxBeforeSend: function() {
            jQuery('#login-ajax-load').removeClass('mute');
        }
    },

    isLogoutPage: function () {
        var is_logout = false;
        if (location.pathname === '/logout') {
            is_logout = true;
        } else {
            is_logout = false;
        }

        return is_logout;
    },

    navToggle: {
        nav_flag: 0,
        login_flag: 0,
        login_form: null,

        init: function () {
            var login_toggle;

            this.login_form = document.getElementById('login-form');

            if (this.login_form !== null) {
                // InnerHTML of login form for modal window content
                Averitt.modal.message = this.login_form.innerHTML;

                if (Viewport.getType() !== 'handheld') {
                    this.login_form.innerHTML = '';
                }

                Viewport.watchViewport(
                    function () {
                        if (Viewport.getType() !== 'handheld') {
                            Averitt.login_flag = 0;
                            Averitt.navToggle.login_flag = 0;
                            Averitt.navToggle.nav_flag = 0;
                            jQuery(Averitt.navToggle.login_form).addClass('mute');

                            // destroy login_form innerHTML
                            Averitt.navToggle.login_form.innerHTML = '';
                        } else {
                            // Rebuild form from modal.message
                            if (Averitt.navToggle.login_form.innerHTML === '') {
                                Averitt.navToggle.login_form.innerHTML = Averitt.modal.message;
                            }

                            Averitt.login.init();

                            // destroy modal if it exists
                            if (document.getElementById('modal-dialog')) {
                                Averitt.modal.deleteModal();
                            }
                        }
                    }
                );
            }

            if (document.getElementById('toggle-login')) {
                jQuery('#toggle-login').on('click', function (e) {
                    e.preventDefault();
                    Averitt.navToggle.loginToggle();
                });
            }
        },

        loginToggle: function () {
            if (Viewport.getType() === 'handheld') {
                Averitt.navToggle.showHideLogin();
            } else {
                Averitt.modal.appendOverlay(false);
                Averitt.login.init();
            }

            document.getElementById('username').focus();
        },

        showHideLogin: function () {
            if (this.login_flag === 0) {
                this.login_flag = 1;
                this.nav_flag = 0;
                jQuery(Averitt.navToggle.nav).removeClass('show-nav');
                jQuery(Averitt.navToggle.login_form).removeClass('mute');
            } else {
                this.login_flag = 0;
                this.nav_flag = 0;
                jQuery(Averitt.navToggle.nav).removeClass('show-nav');
                jQuery(Averitt.navToggle.login_form).addClass('mute');
            }
        },

        showHideNav: function () {
            if (this.nav_flag === 0) {
                this.nav_flag = 1;
                this.login_flag = 0;
                jQuery(Averitt.navToggle.nav).addClass('show-nav');
                jQuery(Averitt.navToggle.login_form).addClass('mute');
            } else {
                this.nav_flag = 0;
                this.login_flag = 0;
                jQuery(Averitt.navToggle.nav).removeClass('show-nav');
                jQuery(Averitt.navToggle.login_form).addClass('mute');
            }
        }
    },

    // Convert image files to SVGs
    // If device has SVG feature, then run the script
    // This script relies on Modernizer.js
    rasterToSVG: {
        regex: /.(png|jpg|gif)/,

        init: function () {
            'use strict';

            var images = document.getElementsByTagName('img'),
                i = images.length;

            while (i--) {
                if (jQuery(images[i]).hasClass('svg')) {
                    images[i].src = this.changeFileType(images[i].src, 'svg');
                }
            }
        },

        changeFileType: function (path, extension) {
            var new_path = path.replace(this.regex, '.' + extension);
            return new_path;
        }
    },

    modal: {
        body: document.getElementsByTagName('body')[0],
        message: '',
        initialized: false,

        appendOverlay: function (bg_click_remove, btn_click_remove) {
            'use strict';
            var overlay = document.createElement('div');

            overlay.setAttribute('id', 'overlay');
            overlay.className = 'overlay';
            this.body.appendChild(overlay);

            if (!document.getElementById('modal-dialog')) {
                Averitt.modal.createDialog(btn_click_remove);
            }

            if (bg_click_remove === undefined) {
                // Add event to remove overlay when clicked
                jQuery(overlay).on('click', function (e) {
                    Averitt.modal.deleteModal();
                    e.preventDefault();
                    return false;
                });
            }
        },

        // TODO: checking for undefined is not ideal. Review other places where this modal is used and consider reworking to make implementing more clear.
        createDialog: function (btn_click_remove) {
            var container      = document.createElement('div'),
                contents       = container.cloneNode(true),
                overlay        = document.getElementById('overlay'),
                delete_overlay = btn_click_remove === undefined ? document.createElement('span') : '',
                x              = "\u0058";

            // Add delete button if btn_click_remove is set
            if (btn_click_remove === undefined) {
                delete_overlay.setAttribute('id', 'delete-overlay');
                delete_overlay.className = 'delete-overlay ae-icon-close';
            }

            container.setAttribute('id', 'modal-dialog');
            container.className = 'modal-dialog';
            contents.setAttribute('id', 'modal-contents');
            contents.className = 'modal-contents';
            contents.innerHTML = Averitt.modal.message;
            container.appendChild(contents);

            // Add delete button if btn_click_remove is set
            if (btn_click_remove === undefined) {
                container.appendChild(delete_overlay);
            }

            Averitt.modal.body.appendChild(container);

            Averitt.modal.initialized = true;

            // Add delete button event if btn_click_remove is set
            if (btn_click_remove === undefined) {
                jQuery(delete_overlay).on('click', function (e) {
                    Averitt.modal.deleteModal('modal-dialog');
                });
            }
        },

        deleteModal: function () {
            var overlay = document.getElementById('overlay') ? document.getElementById('overlay') : 0,
                contents = document.getElementById('modal-dialog') ? document.getElementById('modal-dialog') : 0,
                mommy = overlay ? overlay.parentNode : '',
                daddy = contents ? contents.parentNode : '';

            if (overlay !== 0) {
                mommy.removeChild(overlay);
            }

            if (contents !== 0) {
                daddy.removeChild(contents);
            }

            Averitt.modal.initialized = false;
        }
    },

    readMore: {
        init: function () {
            var $main              = jQuery('#content-main'),
                $read_more_content = $main.find('.read-more-content'),
                $more_content      = $read_more_content.find('.read-more'),
                len                = $read_more_content.length;

            // hide content initially
            $more_content.addClass('hidden');

            $read_more_content.each(function () {
                Averitt.readMore.makeControls(len, jQuery(this).find('.read-more'), jQuery(this).find('.read-less'));
                len -= 1;
            });
        },

        makeControls: function (id, $target, $container) {
            var controller     = document.createElement('span'),
                controller_txt = document.createTextNode('Read More');

            controller.className = 'link toggle-btn';
            controller.setAttribute('id', 'toggle-' + id);
            controller.appendChild(controller_txt);

            $container.append(controller);

            jQuery(controller).on('click', function () {
                Averitt.readMore.showHide(this, $target);
            });
        },

        showHide: function (controller, $target) {
            if ($target.hasClass('hidden')) {
                $target.slideUp(0);
                $target.slideDown(100);
                $target.removeClass('hidden');
                $target.addClass('show');
                controller.firstChild.nodeValue = 'Read Less';
            } else {
                $target.slideUp(100, function () {
                    $target.slideDown(0);
                    $target.removeClass('show');
                    $target.addClass('hidden');
                });
                controller.firstChild.nodeValue = 'Read More';
            }
        }
    },

    detectViewportType: function () {
        'use strict';
        if (!window.getComputedStyle || !window.matchMedia) {return;}
        var size = window.getComputedStyle(document.body, ':after').getPropertyValue('content'),
            viewport_type,
            tablet,
            widescreen;

        if (size !== "") {
            if (size.indexOf("tablet") !== -1) {
                viewport_type = 'tablet';
            } else if (size.indexOf("widescreen") !== -1) {
                viewport_type = 'widescreen';
            } else {
                viewport_type = 'handheld';
            }
        } else {
            tablet  = window.matchMedia("screen and (min-width: 40em)");
            widescreen = window.matchMedia("screen and (min-width: 62.5em)");

            if (tablet.matches === false && widescreen.matches === false) {
                viewport_type = 'handheld';
            } else if (tablet.matches === true && widescreen.matches === false) {
                viewport_type = 'tablet';
            } else {
                viewport_type = 'widescreen';
            }
        }

        this.viewport_state = viewport_type;
        return viewport_type;
    },

    //pad with leadig zeros
    leadingZerosPad: function (str, max) {
        str = str.toString();
        return str.length < max ? Averitt.leadingZerosPad("0" + str, max) : str;
    },

    validateForm : {
        init: function (form_id) {
            jQuery('#' + form_id).on('submit', function (e) {
                e.preventDefault();
                Averitt.validateForm.submitListener(this);
            });
        },

        form_is_valid: false,

        rules: {
            required: /\S/,
            positiveInteger: /^\d*[1-9]\d*$/,
            positiveIntegerOrBlank: /^(\s*|\d*[1-9]\d*)$/,
            positiveOrZeroInteger: /^\d+$/,
            integer: /^-?\d+$/,
            threeDigits: /^\d{3}$/,
            fourDigits: /^\d{4}$/,
            blankOrSevenDigits: /^(|\d{7})$/,
            blankOrDigits: /^(\s*|\d+)$/,
            tenDigits: /^\d{10}$/,
            decimal: /^-?\d+(\.\d+)?$/,
            numFloat: /^[0-9]*\.?[0-9]*?$/,
            email: /^[\w\.\-]+@([\w\-]+\.)+[a-zA-Z]+$/,
            telephone: /^(\+\d+)?( |\-)?(\(?\d+\)?)?( |\-)?(\d+( |\-)?)*\d+$/,
            filename: /^(0)[1-5](_)[a-z]+(-)?[a-z]+(_)[a-z](.)(jpg|pdf|doc|mpg|mp3|mov|m4v|mp4)/,
            zip: /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i,
            'js-zip-required': /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i,
            date: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/g,
            basicLatin: /^[ -~]*?$/,
			unNumber: /^UN\d{4}$/,
			validateDateFormat: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
			militaryTime: /^(?:[01]\d|2[0-3])[0-5]\d$/,
			militaryTimeOrBlank: /^(?:$|(?:[01]\d|2[0-3])[0-5]\d)$/,

            linearFeet: function (val) {
                if (val > 0 && val <= 53) {
                    return true;
                } else {
                    return false;
                }
            },

            shipmentWeight: function (val) {
                if ( val > 0 && val <= 44500 ) {
                    return true;
                } else {
                    return false;
                }
            },

            chooseCity: function (val) {
                if (val === 'Choose City' || val === '') {
                    return false;
                } else {
                    return true;
                }
            },

            choose: function (val) {
                if (val === '0') {
                    return false;
                } else {
                    return true;
                }
            },

            requiredSelect: function (val, field) {
                if (val === '' || val === '-1' || val === '0' || val === 'Select One' || val === 'Select Description') {
                    return false;
                } else {
                    return true;
                }
            },
			
			radioSelectRequired: function (val, field) {
			    if ( $('input[name="' + field.name + '"]:radio:checked').length===0 ) {
                    return false;
                } else {
                    return true;
                }
            },

            notARobot: function (val) {
                if (typeof NotARobot != 'undefined' && NotARobot != null) {
                    NotARobot.validateRobotAnswer(false); //false means wait for AJAX response
                    return NotARobot.isValidAnswer;
                }
            },

			pickupDateWithinMaxMin: function (val, field) {
				var pickupDate = val;

				//in coming date formats is  "mm/dd/yyyy"
				// must conver to yyyymmdd to avoid end of year bug

				//these are user entered so have to account for 1 digit mm or dd
				var pickupDate_array = pickupDate.split("/");
				var   pickup_date_yyyy  = pickupDate_array[2],
				      pickup_date_dd    = Averitt.leadingZerosPad( pickupDate_array[1], 2 ),
				      pickup_date_mm    = Averitt.leadingZerosPad( pickupDate_array[0], 2 );

				//these will alwasy have 2 digit dd mm
				var   min_date = $(field).data('min_date'),
				      min_date_yyyy  = min_date.substring(6,11),
				      min_date_dd    = min_date.substring(3,5),
				      min_date_mm    = min_date.substring(0,2);

				var   max_date = $(field).data('max_date'),
				      max_date_yyyy  = max_date.substring(6,11),
				      max_date_dd    = max_date.substring(3,5),
				      max_date_mm    = max_date.substring(0,2);

				var   pickup_date_yyyymmdd =  pickup_date_yyyy + pickup_date_mm + pickup_date_dd;
				var   min_date_yyyymmdd    =  min_date_yyyy + min_date_mm + min_date_dd;
				var   max_date_yyyymmdd    =  max_date_yyyy + max_date_mm + max_date_dd;

				//returns true if pickup date is within mIN/MAX dates 
				return (pickup_date_yyyymmdd >=  min_date_yyyymmdd
				        && pickup_date_yyyymmdd <=  max_date_yyyymmdd);
			},

			deliveryDateAfterPickupDate: function (val) {
				var deliveryDate = val;
				var pickupDate = $('#pickupDatePicker').val();

				//in coming date formats is  "mm/dd/yyyy"
				// must conver to yyyymmdd to avoid end of year bug

				//these are user entered so have to account for 1 digit mm or dd
				var deliveryDate_array = deliveryDate.split("/");
				var   delivery_date_yyyy  = deliveryDate_array[2],
				      delivery_date_dd    = Averitt.leadingZerosPad( deliveryDate_array[1], 2 ),
				      delivery_date_mm    = Averitt.leadingZerosPad( deliveryDate_array[0], 2 );
				
				var pickupDate_array = pickupDate.split("/");
				var   pickup_date_yyyy  = pickupDate_array[2],
				      pickup_date_dd    = Averitt.leadingZerosPad( pickupDate_array[1], 2 ),
				      pickup_date_mm    = Averitt.leadingZerosPad( pickupDate_array[0], 2 );

				var   delivery_date_yyyymmdd =  delivery_date_yyyy + delivery_date_mm + delivery_date_dd;
				var   pickup_date_yyyymmdd =  pickup_date_yyyy + pickup_date_mm + pickup_date_dd;

				//returns true if delivery date is >= pickup date 
				return (delivery_date_yyyymmdd >=  pickup_date_yyyymmdd);
			},
			validateBothBlankOrBothNotBlank: function (val, field) {
				// either both are blank or both filled in
				//one cannot be blank if other is not blank
			    let prefix =  field.id.substring(0, field.id.indexOf("End"));
				
				let pStartTime = ($('#' + prefix + 'Start').val()).trim();
				let pEndTime   = ($('#' + prefix + 'End').val()).trim();
				
				//if both are blank it is good - if both are not blank it is good
				return ( (pStartTime === "" && pEndTime === "") || (pStartTime !== "" && pEndTime !== "") );				
			},									
			validateTimeWindow: function (val, field) {
				//really it is valid if windowEndDateAfterOrEqualToStartDate
			    // determine prefix (is it pickup or delivery)
			    // this validaton is normally applied to ####EndHHfield
			    // this code assumes two 24HH:MMM fields as follows:
			    // pickupStar. pickupEnd in this case 'pickup' is the  prefix
			    // deliveryStart,deliveryEnd - in this case 'pickup' is the  prefix
			    let prefix =  field.id.substring(0, field.id.indexOf("End"));

				let pStartTime = $('#' + prefix + 'Start').val();
				let pEndTime = $('#' + prefix + 'End').val();
				pStartTime = pStartTime.trim();
				pEndTime = pEndTime.trim();	
				
				// if both times are blank, consider the window valid
				if (pStartTime === "" && pEndTime === "") {
					return true;
				}
				
				//returns true if end time is >= start time 
				return (pEndTime >= pStartTime);

			},

            readyHH: function () {
                var now          = new Date(),
                    ready        = new Date($('#pickupDatePicker').val()),
                    readyHour    = parseInt($('#readyHH').val(), 10),
                    readyMinute  = parseInt($('#readyMM').val(), 10),
                    readyAMPM    = $('#readyAMPM').val();

                //convert to military time for Date.setHours
                if (readyAMPM == 'PM' && readyHour < 12) {
                    readyHour += 12;
                }
                if (readyAMPM == 'AM' && readyHour == 12) {
                    readyHour = 0;
                }

                ready.setHours(readyHour, readyMinute);

                //returns true if pickup time entered is greater than current time
                return (ready.getTime() > now.getTime());

            },

            closeHH: function () {
                var ready        = new Date($('#pickupDatePicker').val()),
                    close        = new Date($('#pickupDatePicker').val()),
                    readyHour    = parseInt($('#readyHH').val(), 10),
                    readyMinute  = parseInt($('#readyMM').val(), 10),
                    readyAMPM    = $('#readyAMPM').val(),
                    closeHour    = parseInt($('#closeHH').val(), 10),
                    closeMinute  = parseInt($('#closeMM').val(), 10),
                    closeAMPM    = $('#closeAMPM').val();

                //convert to miltary time for Date.setHours
                if (readyAMPM === 'PM' && readyHour < 12) {
                    readyHour += 12;
                }
                if (readyAMPM === 'AM' && readyHour === 12) {
                    readyHour = 0;
                }
                if (closeAMPM === 'PM' && closeHour < 12) {
                    closeHour += 12;
                }
                if (closeAMPM === 'AM' && closeHour === 12) {
                    closeHour = 0;
                }

                ready.setHours(readyHour, readyMinute);
                close.setHours(closeHour, closeMinute);

                //returns true if closing time is greater than pickup time
                return (close.getTime() > ready.getTime());

            },

            pickupFromHH: function () {
                var now          = new Date(),
                    ready        = new Date($('#pickupDatePicker').val()),
                    readyHour    = parseInt($('#pickupFromHH').val(), 10),
                    readyMinute  = parseInt($('#pickupFromMM').val(), 10),
                    readyAMPM    = $('#pickupFromAMPM').val();

                //convert to military time for Date.setHours
                if (readyAMPM == 'PM' && readyHour < 12) {
                    readyHour += 12;
                }
                if (readyAMPM == 'AM' && readyHour == 12) {
                    readyHour = 0;
                }

                ready.setHours(readyHour, readyMinute);

                //returns true if pickup time entered is greater than current time
                return (ready.getTime() > now.getTime());

            },

            pickupToHH: function () {
                var ready        = new Date($('#pickupDatePicker').val()),
                    close        = new Date($('#pickupDatePicker').val()),
                    readyHour    = parseInt($('#pickupFromHH').val(), 10),
                    readyMinute  = parseInt($('#pickupFromMM').val(), 10),
                    readyAMPM    = $('#pickupFromAMPM').val(),
                    closeHour    = parseInt($('#pickupToHH').val(), 10),
                    closeMinute  = parseInt($('#pickupToMM').val(), 10),
                    closeAMPM    = $('#pickupToAMPM').val();

                //convert to miltary time for Date.setHours
                if (readyAMPM === 'PM' && readyHour < 12) {
                    readyHour += 12;
                }
                if (readyAMPM === 'AM' && readyHour === 12) {
                    readyHour = 0;
                }
                if (closeAMPM === 'PM' && closeHour < 12) {
                    closeHour += 12;
                }
                if (closeAMPM === 'AM' && closeHour === 12) {
                    closeHour = 0;
                }

                ready.setHours(readyHour, readyMinute);
                close.setHours(closeHour, closeMinute);

                //returns true if closing time is greater than pickup time
                return (close.getTime() > ready.getTime());

            },

            deliveryFromHH: function () {
                var now          = new Date(),
                    ready        = new Date($('#deliveryDatePicker').val()),
                    readyHour    = parseInt($('#deliveryFromHH').val(), 10),
                    readyMinute  = parseInt($('#deliveryFromMM').val(), 10),
                    readyAMPM    = $('#deliveryFromAMPM').val();

                //convert to military time for Date.setHours
                if (readyAMPM == 'PM' && readyHour < 12) {
                    readyHour += 12;
                }
                if (readyAMPM == 'AM' && readyHour == 12) {
                    readyHour = 0;
                }

                ready.setHours(readyHour, readyMinute);

                //returns true if delivery time entered is greater than current time
                return (ready.getTime() > now.getTime());

            },

            deliveryToHH: function () {
                var ready        = new Date($('#deliveryDatePicker').val()),
                    close        = new Date($('#deliveryDatePicker').val()),
                    readyHour    = parseInt($('#deliveryFromHH').val(), 10),
                    readyMinute  = parseInt($('#deliveryFromMM').val(), 10),
                    readyAMPM    = $('#deliveryFromAMPM').val(),
                    closeHour    = parseInt($('#deliveryToHH').val(), 10),
                    closeMinute  = parseInt($('#deliveryToMM').val(), 10),
                    closeAMPM    = $('#deliveryToAMPM').val();

                //convert to miltary time for Date.setHours
                if (readyAMPM === 'PM' && readyHour < 12) {
                    readyHour += 12;
                }
                if (readyAMPM === 'AM' && readyHour === 12) {
                    readyHour = 0;
                }
                if (closeAMPM === 'PM' && closeHour < 12) {
                    closeHour += 12;
                }
                if (closeAMPM === 'AM' && closeHour === 12) {
                    closeHour = 0;
                }

                ready.setHours(readyHour, readyMinute);
                close.setHours(closeHour, closeMinute);

                //returns true if closing time is greater than delivery time
                return (close.getTime() > ready.getTime());

            },

            noHtml: function isHTML() {
                let input = $('.noHtml').val(),
                    wrapper  = document.createElement('div');

                wrapper.innerHTML = input;

                //returns false if html was detected in the user input
                for (var nodes = wrapper.childNodes, i = nodes.length; i--; ) {
                    if (nodes[i].nodeType == 1) {
                        return false;
                    }
                }

                return true;
              }
        },

        errors: {
            required: 'Required field',
            positiveInteger: 'Positive, whole numbers only',
            positiveIntegerOrBlank: 'Positive, whole numbers only',
            positiveOrZeroInteger: 'Non-negative whole numbers only',
            integer: 'Whole numbers only',
            threeDigits: 'Must contain exactly 3 digits',
            fourDigits: 'Must contain exactly 4 digits',
            blankOrSevenDigits: 'Must be blank or contain exactly 7 digits',
            blankOrDigits: 'Must be blank or contain only digits',
            tenDigits: 'Must contain exactly 10 digits',
            decimal: 'Must contain a number',
            numFloat: 'Must contain valid decimals',
            email: 'Invalid email address',
            telephone: 'Invalid telephone number',
            filename: 'Please name this file with the correct naming scheme',
            zip: 'Invalid ZIP code',
            'js-zip-required': 'Invalid ZIP code',
            linearFeet: 'Linear Feet should be between 1 and 53',
            shipmentWeight: 'Weight should be between 1 and 44500',
            chooseCity: 'Must choose a city',
            choose: 'Must make a selection',
            requiredSelect: 'Must select one',
			radioSelectRequired: 'Required',
            date: 'Incorrect format. Use mm/dd/yyyy',
            basicLatin: 'Only basic latin characters are permitted',
            notARobot: 'Your answer is not correct',
			pickupDateWithinMaxMin: 'Pickup Date cannot be prior to current date nor more than one week from the current date.',
			deliveryDateAfterPickupDate: 'Delivery Date cannot be prior to the Pickup Date',
			validateBothBlankOrBothNotBlank: 'Both time window fields need to either have a value or not have a value. One cannot be empty and the other filled.',
			validateTimeWindow: 'Window End Date cannot be prior to the Window Start Date',
            readyHH: 'Ready Time must be after Current Time',
            closeHH: 'Closing Time must be after Ready Time',
            noHtml: 'HTML is not permitted',
			unNumber: 'Invalid UN number format: "UN" followed by a four-digit number',
			validateDateFormat: 'The date entered does not conform to the format pattern mm/dd/yyyy',
			militaryTime: 'Enter time in military format: 24HHMM (e.g., 1430 for 2:30 PM)',
			militaryTimeOrBlank: 'Enter time in military format: 24HHMM (e.g., 1430 for 2:30 PM)'
        },

        submitListener: function (form_obj, perform_submit) {
            var fields = $(form_obj.elements).filter(':visible');

            if (typeof perform_submit === 'undefined' ||
                    perform_submit === null){
                // If no param, then default it to true
                perform_submit = true;
            }

            Averitt.validateForm.form_is_valid = true;
            Averitt.validateForm.validateFields( fields );
            if( Averitt.validateForm.form_is_valid == true ) {
	            //Only submit the form from the last step of the guided form or from full form view
	            if ($(form_obj.getElementsByTagName("fieldset")).length === 0 || $(form_obj.getElementsByTagName("fieldset")).filter(':last').is(':visible') === true) {

	            	//if guided form validate all non visible fields (GuidedForm is created in guidedForm.js)
	            	//this check is just in case user changed a field during tour or while in fill form view and went back to guided view prior to submit
	            	if( typeof GuidedForm !== 'undefined' ) {
	            		fields = $(form_obj.elements).filter(':not(:visible)');
	                    Averitt.validateForm.validateFields( fields );
	                    if( Averitt.validateForm.form_is_valid == false ) {
	                    	GuidedForm.showFullFormView();
	                    	return;
	                    }
	            	}

	                // Only submit, if we are suppose to perform it (i.e. default, yes!)
	                if (perform_submit) {
	                    Averitt.formDialog.appendOverlay(function () {
	                        form_obj.submit();
	                    });
	                }
	            }
            }
        },

        validateFields: function (fields) {
            var  len    = fields.length,
            i,
            class_name,
            classRegExp = /(^| )(\S+)\b/g,
            class_result,
            validation_class,
            rule;

            for ( i = 0; i < len; i += 1 ) {
                class_name = fields[i].className;

                while ( class_result = classRegExp.exec(class_name) ) {
                    validation_class = class_result[2];
                    rule = Averitt.validateForm.rules[validation_class];

					if ( fields[i].id.includes("-selectized") ) {
						let selectId = fields[i].id.split("-",1)[0];
						let select = document.getElementById(selectId);
						fields[i] = select;
					}

                    if (typeof rule === 'object' &&
                            !rule.test(fields[i].value.trim()) ||
                            typeof rule === 'function' &&
                            rule(fields[i].value.trim(), fields[i]) === false) {
                    	if ( $(fields[i]).hasClass("selectized") ) {
                            $('#' + fields[i].id + '-selectized').trigger('focus').trigger('select');
                    	} else {
                            $(fields[i]).trigger('focus').trigger('select');
                        }
                        Averitt.setError(fields[i], Averitt.validateForm.errors[validation_class]);
                        Averitt.validateForm.form_is_valid = false;
                        return;
                    }
                }
            }
        }
    },

    // Adds error message underneath input
    // input_obj refers to this input
    // message can be any String
    setError: function (input_obj, message, isStatic = false) {
        var error_obj = document.createElement('p'),
            id = input_obj.id + '-error',
            error_txt = document.createTextNode(message),
            og_class = input_obj.className;

        error_obj.className = isStatic === false ? 'ae-error--inline' : 'ae-error--inline-static';

        // Check to see if error already exists
        if (!document.getElementById(id)) {
            error_obj.setAttribute('id', id);
            // designate the parent who holds the error child
            input_obj.parentNode.classList.add('error-inline-parent');
			if (input_obj.type === 'radio') {
				input_obj.parentNode.parentNode.appendChild(error_obj);
			} else {
            input_obj.parentNode.appendChild(error_obj);
			}     
            input_obj.className += ' error-input';
            error_obj.appendChild(error_txt);
        }

        if (input_obj.nodeName.toLowerCase() === 'ul') {
            jQuery('body').on('click', function () {
                Averitt.removeError(input_obj, document.getElementById(id), og_class);
            });       
        } else if (input_obj.nodeName.toLowerCase() !== 'div') {
            jQuery(input_obj).on('blur keypress keydown change', function () {
                Averitt.removeError(input_obj, document.getElementById(id), og_class);
            });
        } else {
            jQuery(input_obj).on('keypress keydown change', function () {
                Averitt.removeError(input_obj, document.getElementById(id), og_class);
            });
        }
    },

    // Removes Error Message from the DOM
    removeError: function (input_obj, error_obj, og_class) {
        if (error_obj !== null) {
            error_obj.parentNode.removeChild(error_obj);
            input_obj.parentNode.classList.remove('error-inline-parent');
            input_obj.className = og_class;
        }
    },

    createAjaxLoader: function (target, size) {
        var loader_img,
            img_name;

        // Make sure image does not already exist
        if (target && !document.getElementById('ajax-loader-' + this.ajax_loader_id)) {
            if (size === 'small') {
                img_name = 'ajax-loader-small.gif';
            } else {
                img_name = 'ajax-loader.gif';
            }

            loader_img = document.createElement('img');
            loader_img.setAttribute('id', 'ajax-loader-' + this.ajax_loader_id);
            loader_img.setAttribute('src', Averitt.document_root + '/img/' + img_name);
            loader_img.setAttribute('alt', '');
            loader_img.className = 'loading';
            target.appendChild(loader_img);

            // step up to keep id unique
            this.ajax_loader_id += 1;
        } else {
            return;
        }
    },

    destroyAjaxLoader: function (num) {
        var el = document.getElementById('ajax-loader-' + num);
        el.parentNode.removeChild(el);
        this.ajax_loader_id -= 1;
    },

    /* Usage
     *          id:  id of the text input
     *    min_date:  Specify minimum date in mm/dd/yyyy format
     *    max_date:  Specify maximum date in mm/dd/yyyy format
     *
     *    To invoke the dateWidget, use Averitt.dateWidget('yourInputId');
     *    Optionally, you can set minumum and maximum date parameters
     *    Example: Averitt.dateWidget('yourInputId', '01/01/2013', '12/31/2013');
     */
    dateWidget: function (id, min_date, max_date) {
        var $date_input = jQuery('#' + id),
            date = Formatter.registerInputId(id),
            pickadate_start = false,
            pickadate_end = false,
            jquery_datepicker_start = null,
            jquery_datepicker_end = null,
            min_date_pieces,
            max_date_pieces,
            $label;

        if (min_date !== undefined) {
            min_date_pieces = min_date.split("/");
            pickadate_start = [min_date_pieces[2], min_date_pieces[0], min_date_pieces[1]];
            jquery_datepicker_start = new Date(min_date_pieces[2], min_date_pieces[0] -1, min_date_pieces[1]);
        }

        if (max_date !== undefined) {
            max_date_pieces = max_date.split("/");
            pickadate_end = [max_date_pieces[2], max_date_pieces[0], max_date_pieces[1]];
            jquery_datepicker_end = new Date(max_date_pieces[2], max_date_pieces[0] - 1, max_date_pieces[1]);
        }

        // if the viewport is handheld, instantiate Pickadate 3rd-party datepicker,
        // otherwise instantiate the jQueryUI datepicker.
        if (Viewport.getType() === 'handheld') {
            // add date icon
            $label = $date_input.parent().parent().find('label');
            $label.addClass('ae-label--pickadate');
            $label.append('<img class="ui-datepicker-trigger" src="/img/calendar.png" alt="" />');

            // Pickadate.js datepicker
            $date_input.pickadate({
                format: 'mm/dd/yyyy',
                dateMin: pickadate_start,
                dateMax: pickadate_end
            });

            if ($date_input.is(':disabled')) {
                $date_input.pickadate('disable');
            }
        } else {
            // Format manual input
            date.formatDate();
            // jQuery UI datepicker
            $date_input.datepicker({
                dateFormat: 'mm/dd/yy',
                showOn: 'button',
                buttonImage: Averitt.document_root + '/img/calendar.png',
                buttonImageOnly: true,
                buttonText: '',
                minDate: jquery_datepicker_start,
                maxDate: jquery_datepicker_end,
                constrainInput: true
            });
            if ($date_input.is(':disabled')) {
                $date_input.datepicker('disable');
                //console.log('dateWidget - disable date(2)');
            }
            $('.ui-datepicker-trigger').removeAttr('height').removeAttr('width').removeAttr('title');
        }
    },

    /* Usage
     * phone_group_id: id of the element that contains the three phone input segments
     * To invoke the phoneWidget, use Averitt.phoneWidget('yourId');
     */
    phoneWidget: function (phone_group_id) {
        var //phone_id = jQuery('#' + phone_group_id),
            phone = Formatter.registerPhoneGroupId(phone_group_id);

        phone.formatPhone();
    },

    toolTip:  {
        show: false,
        collection: [],

        init: function () {
            var els, len;

            if (typeof(document.querySelectorAll) === 'function') {
                // do modern thing
                els = document.querySelectorAll('.tooltip');
                len = els.length;

                while (len--) {
                    Averitt.toolTip.create(els[len]);
                    Averitt.toolTip.collection.push(els[len]);
                }

            } else {
                // do old browser thing
                els = document.getElementsByTagName('*');
                len = els.length;

                while (len--) {
                    if (els[len].className === 'tooltip' && els[len].offsetWidth !== 0) {
                        Averitt.toolTip.create(els[len]);
                        Averitt.toolTip.collection.push(els[len]);
                    }
                }
            }
        },

        create: function (obj) {
            var tooltip_container        = document.createElement('span'),
                content_container        = tooltip_container.cloneNode(true),
                btn                      = tooltip_container.cloneNode(true),
                tooltip_delete           = tooltip_container.cloneNode(true),
                tooltip_delete_txt       = document.createTextNode('x'),
                txt                      = document.createTextNode(obj.getAttribute('data-tooltip')),
                btn_txt                  = document.createTextNode('?'),
                obj_width                = obj.offsetWidth - 32,
                obj_parent_width         = obj.parentNode.offsetWidth,
                content_width            = (obj_width / obj_parent_width),
                content_width_percentage = (content_width * 100) + '%';

            // set styling
            tooltip_container.className = 'ae-tooltip-container';
            content_container.className = 'content';
            content_container.style.width = content_width_percentage;
            tooltip_delete.className = 'delete-tooltip';
            btn.className = 'btn-tooltip';

            // set text nodes
            content_container.appendChild(txt);
            tooltip_delete.appendChild(tooltip_delete_txt);
            content_container.appendChild(tooltip_delete);
            btn.appendChild(btn_txt);

            // construct object
            tooltip_container.appendChild(btn);

            // append to DOM
            obj.appendChild(tooltip_container);
            obj.appendChild(content_container);

            // set events
            jQuery(btn).on('click', function () {
                // First, hide all open tooltips
                Averitt.toolTip.hideAll();
                Averitt.toolTip.toggle(content_container);
            });

            jQuery(content_container).on('click', function () {
                Averitt.toolTip.hide(this);
            });
        },

        hideAll: function () {
            var collection = Averitt.toolTip.collection,
                collection_len = collection.length;

            jQuery('body').off();

            while (collection_len--) {
                Averitt.toolTip.hide(collection[collection_len].lastChild);
            }
        },

        after: function (obj) {
            jQuery('body').on('click', function () {
                Averitt.toolTip.hide(obj);
            });
        },

        toggle: function (obj) {
            if (Averitt.toolTip.show === false) {
                Averitt.toolTip.show = true;
                jQuery(obj).fadeIn('fast', function () {
                    jQuery('body').on('click', function () {
                        Averitt.toolTip.hideAll();
                    });
                });
            } else {
                Averitt.toolTip.hide(obj);
            }
        },

        hide: function (obj) {
            Averitt.toolTip.show = false;
            jQuery(obj).fadeOut('fast');
        }
    },

    print: {
        init: function (container_id) {
            var container = document.getElementById('printable');

            if (container_id === undefined || container_id === null) {
                container = document.getElementById('printable');
            } else {
                container = document.getElementById(container_id);
            }

            this.makePrintButton(container);
        },

        makePrintButton: function (container) {
            var print_btn = document.createElement('span'),
                txt       = document.createTextNode('Print');

            print_btn.appendChild(txt);
            print_btn.className = 'ae-button--link';
            print_btn.id = 'print-btn';
            container.appendChild(print_btn);
            Averitt.insertAfter(print_btn, container.firstChild);

            jQuery(print_btn).on('click', function () {
                window.print();
            });
        }
    },

    tabbed: {
        init: function (nav_id) {
            var nav_len,
                nav_anchor;

            // Initialize Navigation object
            this.nav_ul    = document.getElementById(nav_id);
            this.nav_items = this.nav_ul.getElementsByTagName('li');
            this.nav_ary   = [];

            nav_len = this.nav_items.length;
            while (nav_len--) {
                nav_anchor = this.nav_items[nav_len].getElementsByTagName('a');
                Averitt.tabbed.nav_ary.push(nav_anchor);

                Averitt.tabbed.registerNavEvents(nav_anchor);
            }

            Viewport.watchViewport(function () {
                Averitt.tabbed.toggleNavEvents(jQuery(Averitt.tabbed.nav_ary));
            });
        },

        registerNavEvents: function (nav_anchor) {
            jQuery(nav_anchor).on('click', function (e) {
                Averitt.tabbed.selectNavItem(this, e);
            });
        },

        toggleNavEvents: function ($nav_items) {
            if (Viewport.getType() === 'handheld') {
                $nav_items.off();
            }
        },

        selectNavItem: function (anchor_obj, e) {
            var pattern = /^.*#/g,
                section = anchor_obj.href.replace(pattern, ''), // grab the anchor href minus the '#' symbol
                this_section = document.getElementById(section);

            Averitt.tabbed.deselectAllNavItems();
            anchor_obj.parentNode.className = 'selected'; // parent node should = 'li'

            // toggle sections
            Averitt.tabbed.hideAllSections();
            Averitt.tabbed.showSection(this_section);

            if (Viewport.getType() !== 'handheld') {
                e.preventDefault();
            }
        },

        deselectAllNavItems: function () {
            var items = this.nav_ul.getElementsByTagName('li'),
                len = items.length;

            while (len--) {
                items[len].className = '';
            }
        },

        showSection: function (section_obj) {
            section_obj.className = '';
        },

        hideAllSections: function () {
            var tabbed_sections = document.getElementById('tabbed-sections').getElementsByTagName('section'),
                len = tabbed_sections.length;

            while (len--) {
                tabbed_sections[len].className = 'hidden mute';
            }
        }
    },

    scrollToSection: function (section_id) {
        var $section = jQuery('#' + section_id);

        jQuery('html, body').animate({
            scrollTop: $section.offset().top
        }, 200);
    },

    convertToSelectize: function(selectId, allowEmptyOption, onChangeCallback, requiredSelect) {
    	//STEP 1
    	//convert data attributes to what selectize expects for data-data json formated attributes
    	//selectize.js will lose custom attributes unless they are coded as data-data and json formated
    	//removing the "data-" part of the attribute and keeping the rest
    	//when it is restored the "data-" part is added back - reason is because jason error is you leave "data-" as
    	//a prefix to the name
    	$('#' + selectId + ' option').each(function() {
    		//console.log($(this).text() + ' ' + $(this).val());
    		var foundDataData = false;
    		var selectizeAttr = "{";
	    	var addComma = false;
    	    $.each(this.attributes, function() {
    	        // this.attributes is not a plain object, but an array
    	        // of attribute nodes, which contain both the name and value
    	        if(this.specified) {
    	          //console.log(this.name, this.value);
    	          if(this.name == 'data-data') {
    	        	  foundDataData = true;
    	              return false; //break
    	          }
    	          if(this.name == 'value' || this.name == 'selected') {
    	        	  return true; //continue;
    	          }
    	          if (addComma) {
    	        	  selectizeAttr += ',';
    	          }
    	          //remove 'data-' if there
    	          selectizeAttr += '"' + this.name.replace('data-','') + '":' + '"' + this.value + '"';
    	          addComma = true;
    	        }
    	    });
    	    selectizeAttr += "}";

    	    //if data-data is already present then do not convert attributes to selectize data-data json formatted attributes
    	    if(foundDataData == false) {
    	    	this.setAttribute("data-data", selectizeAttr);
    	    }
    	});

        //TODO: Maybe: Add code to restore the option selected prior to Search if search is aborted or user fails to actually select and focus is lost

    	//STEP 2
        //init selectize to turn on search embedded in pull down.
        //Read Notes: MyAE\MyAverittExpressApplicationWeb\WebContent\js\vendor\selectize.js-0.12.4\notes.txt
    	//NOTE: I modified one line in the release of selectize.js - search on Rodney K in selectize.js and read notes.txt in Github
        var $select =
	        $('#'+selectId).selectize({
	        	placeholder: "Search",
	        	selectOnTab: true,
	        	openOnFocus: false,
	        	allowEmptyOption: allowEmptyOption,
	        	onChange: function (value) {
	                //After option is selected by the user then set the focus to this Select input again
	        		// so that the focus border will show and so that the user can do a single click to
	        		// dropdown the options instead of two clicks
	        		//FYI this.$control_input is the same as $('#LookupLocation-selectized')
	        		this.$control_input.trigger('focus').trigger('select');

	        		// put the attributes back on the original option because selectize does not do this
	        		//this allows the original select onChange to have the attributes
	            	$('#' + selectId + ' option').each(function() {
	            		//console.log($(this).text() + ' ' + $(this).val());
	            	    var option=this;

	                	var selectize = $select[0].selectize;
        	        	var data = selectize.options[value];
        	        	if( data != undefined ) {
	        	        	$.each(data, function(key,value){
	        	        		if(key != 'value' && key != 'text') {
	        	        			key=key.replace('$','')
	        	        	        option.setAttribute('data-'+key,value);
	        	        		}
	        	        	});
	            	    }
	               	});

                    if(typeof onChangeCallback === 'function' && onChangeCallback()) {
                        onChangeCallback();
                    }
	        	}
	        });

        //STEP 3 Do not allow browser autocomplete in input/search field (it gets in the way)
        $("#" + selectId + "-selectized").attr("autocomplete", "nope"); //nope is not official - but it turns it off

		//STEP 4 Add Validation class
		if( requiredSelect != undefined && requiredSelect == true ) {
		    $("#" + selectId + "-selectized").addClass("requiredSelect"); 
		}
        //STEP 5
        //When the user clicks the new select input, we blank out what is currently selected with this code below.
        //This way the user knows we have Search capability because the placeholder text will show and it reads "Search".
        //Normally the currently selected item will remain and it will go in edit mode and then the user has to press the backspace/delete
        //key in order to get back to Search mode.  Here we are placing the user in Search mode when they click in the field.
        var KEY_BACKSPACE = 8;
        var selectize = $select[0].selectize;
        var $control = selectize.$control;

        $control.on('mouseup', function(e) {
        	e.keyCode=KEY_BACKSPACE;
        	selectize.deleteSelection(e);

        });
    },

    validateSelectIsNotBlank: function (selectId, errMsg) {
        var select = document.getElementById(selectId),
            select_sel = document.getElementById(selectId + '-selectized'),
            required_regx = /\S/;

        if( select != null ) {
	        if (required_regx.test(select.value.trim()) === false) {
	            Averitt.setError(select, errMsg);
	            if(select_sel != null) {
	                $(select_sel).trigger('focus').trigger('select');
	            } else {
	                $(select).trigger('focus').trigger('select');
	            }
	            return false;
	        }
        }
        return true;
    },

    removeTags: function(str) {
    	//remove XSS risk - remove all XML/HTML tags
    	if( str != null) {
            return str.replace(/(<([^>]+)>)/ig,"");
    	} else {
    		return str;
    	}
    }

};

DateValidator = {
    is_valid : true,
    from_date_label : 'From',
    to_date_label : 'To',

    // pre: from.value && to.value like mm/dd/yyyy
    validate: function (from, to) {
        DateValidator.is_valid = true;

        if (from.value === '') {
            Averitt.setError(from, this.to_date_label + ' and ' + this.from_date_label + ' dates cannot be empty');
            DateValidator.is_valid = false;
            $(from).trigger('focus').trigger('select');
        } else if (to.value === '') {
            Averitt.setError(to, this.to_date_label + ' and ' + this.from_date_label + ' dates cannot be empty');
            DateValidator.is_valid = false;
            $(to).trigger('focus').trigger('select');
        } else if (DateValidator.isDateValid(from) === false) {
            Averitt.setError(from, 'Must be in a mm/dd/yyyy format');
            DateValidator.is_valid = false;
            $(from).trigger('focus').trigger('select');
        } else if (DateValidator.isDateValid(to) === false) {
            Averitt.setError(to, 'Must be in a mm/dd/yyyy format');
            DateValidator.is_valid = false;
            $(to).trigger('focus').trigger('select');
        } else if (DateValidator.isDateRangeValid(from, to) === false) {
            Averitt.setError(from, this.from_date_label + ' date cannot be greater than ' + this.to_date_label + ' date');
            DateValidator.is_valid = false;
            $(from).trigger('focus').trigger('select');
        }
    },

    validateAllowBlanks: function (from, to) {
        DateValidator.is_valid = true;

        if (from.value.trim() != '' && DateValidator.isDateValid(from) === false) {
            Averitt.setError(from, 'Must be in a mm/dd/yyyy format or blank');
            DateValidator.is_valid = false;
            $(from).trigger('focus').trigger('select');
        } else if (to.value.trim() != '' && DateValidator.isDateValid(to) === false) {
            Averitt.setError(to, 'Must be in a mm/dd/yyyy format or blank ');
            DateValidator.is_valid = false;
            $(to).trigger('focus').trigger('select');
        } else if (from.value.trim() != '' && to.value.trim() != '' && DateValidator.isDateRangeValid(from, to) === false) {
            Averitt.setError(from, this.from_date_label + ' date cannot be greater than ' + this.to_date_label + ' date');
            DateValidator.is_valid = false;
            $(from).trigger('focus').trigger('select');
        }
    },

    isValid : function () {
        return DateValidator.is_valid;
    },

    // pre: date_elem.value like mm/dd/yyyy
    isDateValid : function (date_elem) {
        var date_obj = DateValidator.toJSDateObj(date_elem),
            is_valid = false;

        if (date_obj !== null) {
            is_valid = true;
        }

        return is_valid;
    },

    // pre: date_elem.value like mm/dd/yyyy
    // post: JS Date object with value of date_elem, or null
    toJSDateObj: function (date_elem) {
        var date_ary,
            mm = 0,
            dd = 0,
            yyyy = 0,
            is_valid = false,
            test_date;

        date_ary  = $(date_elem).val().split('/');
        if (date_ary.length === 3) {
            mm        = parseInt(date_ary[0], 10);
            dd        = parseInt(date_ary[1], 10);
            yyyy      = parseInt(date_ary[2], 10);

            if (mm >= 1 && dd >= 1 && yyyy >= 1970) { // Lowest date is 01/01/1970
                test_date = new Date(yyyy,
                                     (mm - 1),
                                     dd);

                // JS will roll the date.  E.g. if dd > 30 or 31, mm will increment
                if (test_date.getMonth() === (mm - 1) &&
                    test_date.getDate() === dd &&
                    test_date.getFullYear() === yyyy) {
                    is_valid = true;
                }
            }
        }

        if (is_valid) {
            return test_date;
        } else {
            return null;
        }
    },

    // pre: *_date_elem.value like mm/dd/yyyy
    isDateRangeValid : function (from_date_elem, to_date_elem) {
        var is_valid = false,
            from_sec,
            to_sec,
            from_date = DateValidator.toJSDateObj(from_date_elem),
            to_date   = DateValidator.toJSDateObj(to_date_elem);

        if (from_date !== null && to_date !== null) {
            from_sec = Date.parse(from_date.toString());
            to_sec   = Date.parse(to_date.toString());
            if (from_sec <= to_sec) {
                is_valid = true;
            }
        }

        return is_valid;
    },

    // pre: date_elem.value like mm/dd/yyyy
    isDateInPast : function (date_elem) {
        var is_valid = false,
            test_sec,
            now_sec,
            test_date  = DateValidator.toJSDateObj(date_elem),
            now_date   = new Date();
        now_date.setHours(0, 0, 0, 0); // Clear time from date

        if (test_date !== null) {
            test_sec = Date.parse(test_date.toString());
            now_sec  = now_date.getTime();
            if (test_sec < now_sec) {
                is_valid = true;
            }
        }

        return is_valid;
    },

    isOnOrAfterDate: function(date_elem, minimum_date) {
        var input_date   = DateValidator.toJSDateObj(date_elem),
            min_date     = new Date(minimum_date),
            is_onOrAfter_date = false,
            input_date_str,
            input_month,
            input_day;

        if (input_date !== null
                && min_date !== null) {
        	//input date str build
            input_month    = input_date.getMonth() + 1;
            input_month    = DateValidator.padString('' + input_month, 2);
            input_day      = DateValidator.padString('' + input_date.getDate(), 2);

            input_date_str = input_date.getFullYear() + '' +
                             input_month + '' +
                             input_day;

        	//min date str build
            min_month    = min_date.getMonth() + 1;
            min_month    = DateValidator.padString('' + min_month, 2);
            min_day      = DateValidator.padString('' + min_date.getDate(), 2);

            min_date_str = min_date.getFullYear() + '' +
                           min_month + '' +
                           min_day;

            if (input_date_str >= min_date_str) {
                is_onOrAfter_date = true;
            }
        }

        return is_onOrAfter_date;
    },

    isFutureDate : function (date_elem) {
        var input_date   = DateValidator.toJSDateObj(date_elem),
            current_date = new Date(),
            is_future_date = false,
            input_date_str,
            current_date_str,
            input_month,
            current_month,
            input_day,
            current_day;

        // Milliseconds are not used because we need more control (i.e. only compare mm, dd, yyyy)

        if (input_date !== null) {
            input_month    = input_date.getMonth() + 1;
            input_month    = DateValidator.padString('' + input_month, 2);
            input_day      = DateValidator.padString('' + input_date.getDate(), 2);

            input_date_str = input_date.getFullYear() + '' +
                             input_month + '' +
                             input_day;

            current_month    = current_date.getMonth() + 1;
            current_month    = DateValidator.padString('' + current_month, 2);
            current_day      = DateValidator.padString('' + current_date.getDate(), 2);

            current_date_str = current_date.getFullYear() + '' +
                               current_month + '' +
                               current_day;

            if (input_date_str > current_date_str) {
                is_future_date = true;
            }
        }

        return is_future_date;
    },

    getTimeInMins : function (hour,
                              minute,
                              ampm) {
        var time_in_mins = 0,
            hour_val     = (typeof hour === 'string' ? parseInt(hour, 10) : hour),
            minute_val   = (typeof minute === 'string' ? parseInt(minute, 10) : minute);

        if (hour_val < 12 &&
                ampm === 'PM') {
            hour_val += 12;
        }
        time_in_mins = (hour_val * 60) + minute_val;
        return time_in_mins;
    },

    padString: function(str, max) {
        return str.length < max ? DateValidator.padString('0' + str, max) : str;
    }
};

Viewport = {
    types: ['handheld', 'mini', 'tablet', 'widescreen'],

    init: function () {
        this.updateBodyClass();
        this.watchViewport(() => {
            this.updateBodyClass();
        });
    },

    updateBodyClass: function () {
        const body = document.body;

        body.classList.remove(...this.types);
        body.classList.add(this.getType());
    },

    watchViewport: function (cb) {
        let timer = 0;

        // fire method on window resize once the resize event completes
        if (typeof addEventListener === 'function') {
            window.addEventListener('resize', function () {
                clearTimeout(timer);
                timer = setTimeout(cb, 100);
            }, false);
        }
    },

    getType: function () {
        let len = this.types.length;
        let content;

        if (typeof getComputedStyle === 'function') {
            content = window.getComputedStyle(document.body, ':after').getPropertyValue('content');

            while (len--) {
                if (content.indexOf(this.types[len]) !== -1) {
                    return this.types[len];
                }
            }
        }

        return this.types[0];
    }
};

// Firefox will show form overlay processing message if you get to the page via back button
// Apparently, adding an empty unload function prevents Firefox from caching the page in the Back-Forward Cache
// https://developer.mozilla.org/en-US/docs/Web/API/window.onunload
if (typeof addEventListener === 'function') {
    window.addEventListener('unload', function () {}, false);
}

// Sitewide methods
Averitt.navToggle.init();
Session.init();
Viewport.init();
Averitt.rasterToSVG.init();
Averitt.externalLinks();
Averitt.labelHelpers.init();
Averitt.ltlHelper();
Averitt.login.init();

if (document.getElementById('uni-menu-track-form')) {
    jQuery('#uni-menu-track-form').on('submit', function (e) {
        var the_form = this;
        e.preventDefault();

        Averitt.formDialog.appendOverlay(function () {
            the_form.submit();
        }, 'Searching for PROs');
    });
}

if (document.getElementById('ltl-tracker-home-form')) {
    jQuery('#ltl-tracker-home-form').on('submit', function (e) {
        var the_form = this;
        e.preventDefault();

        Averitt.formDialog.appendOverlay(function () {
            the_form.submit();
        });
    });
}

if (document.getElementById('service-map-home-form')) {
    Averitt.validateForm.init('service-map-home-form');
}

if (document.getElementById('ltlPickupRequest')) {
    Averitt.validateForm.init('ltlPickupRequest');
    if (document.getElementById('requester-phone-inputs')) {
        Averitt.phoneWidget('requester-phone-inputs');
    }
    if (document.getElementById('shipper-phone-inputs')) {
        Averitt.phoneWidget('shipper-phone-inputs');
    }
}

if (document.getElementById('back-to-top') && document.getElementById('content-main')) {
    jQuery('#back-to-top').on('click', function (e) {
        Averitt.scrollToSection('content-main');
        e.preventDefault();
    });
}

if (document.getElementById('content-main')) {
    Averitt.readMore.init();
}

if (document.getElementById('printable')) {
    Averitt.print.init();
}

jQuery(function($) {
	$('.input-extension').on('keypress', function(e) {
		var key = e.which;
		if (key <= 48 || key >= 58) {
			e.preventDefault();
		}
	});
});

document.querySelector('html').classList.add('js');