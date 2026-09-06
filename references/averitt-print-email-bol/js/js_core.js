var Core = {};

// Douglas Crockford's handy function trims whitespace on both sides of the string
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        'use strict';
        return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
    };
}

// W3C DOM 2 Events model
if (document.addEventListener) {
    Core.addEventListener = function (target, type, listener) {
        'use strict';
        target.addEventListener(type, listener, false);
    };

    Core.removeEventListener = function (target, type, listener) {
        'use strict';
        target.removeEventListener(type, listener, false);
    };

    Core.preventDefault = function (event) {
        'use strict';
        event.preventDefault();
    };

    Core.stopPropagation = function (event) {
        'use strict';
        event.stopPropagation();
    };
} else if (document.attachEvent) {
    // Internet Explorer Events model
    Core.addEventListener = function (target, type, listener) {
        // prevent adding the same listener twice, since DOM 2 Events ignores
        // duplicates like this
        if (Core._findListener(target, type, listener) != -1) {
            return;
        }

        // listener2 calls listener as a method of target in one of two ways,
        // depending on what this version of IE supports, and passes it the global
        // event object as an argument
        var listener2 = function () {
            var event = window.event;

            if (Function.prototype.call) {
                listener.call(target, event);
            } else {
                target._currentListener = listener;
                target._currentListener(event);
                target._currentListener = null;
            }
        };

        // add listener2 using IE's attachEvent method
        target.attachEvent("on" + type, listener2);

        // create an object describing this listener so we can clean it up later
        var listenerRecord = {
            target: target,
            type: type,
            listener: listener,
            listener2: listener2
        },
        targetDocument,
        targetWindow,
        listenerId;

        // get a reference to the window object containing target
        targetDocument = target.document || target;
        targetWindow = targetDocument.parentWindow;

        // create a unique ID for this listener
        listenerId = "l" + Core._listenerCounter++;

        // store a record of this listener in the window object
        if (!targetWindow._allListeners) {
            targetWindow._allListeners = {};
        }
        targetWindow._allListeners[listenerId] = listenerRecord;

        // store this listener's ID in target
        if (!target._listeners) {
            target._listeners = [];
        }
        target._listeners[target._listeners.length] = listenerId;

        // set up Core._removeAllListeners to clean up all listeners on unload
        if (!targetWindow._unloadListenerAdded) {
            targetWindow._unloadListenerAdded = true;
            targetWindow.attachEvent("onunload", Core._removeAllListeners);
        }
    };

    Core.removeEventListener = function (target, type, listener) {
        // find out if the listener was actually added to target
        var listenerIndex = Core._findListener(target, type, listener),
            targetDocument,
            targetWindow,
            listenerId,
            listenerRecord;
        if (listenerIndex == -1) {
            return;
        }

        // get a reference to the window object containing target
        targetDocument = target.document || target;
        targetWindow = targetDocument.parentWindow;

        // obtain the record of the listener from the window object
        listenerId = target._listeners[listenerIndex];
        listenerRecord = targetWindow._allListeners[listenerId];

        // remove the listener, and remove its ID from target
        target.detachEvent("on" + type, listenerRecord.listener2);
        target._listeners.splice(listenerIndex, 1);

        // remove the record of the listener from the window object
        delete targetWindow._allListeners[listenerId];
    };

    Core.preventDefault = function (event) {
        event.returnValue = false;
    };

    Core.stopPropagation = function (event) {
        event.cancelBubble = true;
    };

    Core._findListener = function (target, type, listener) {
        // get the array of listener IDs added to target
        var listeners = target._listeners,
            targetDocument,
            targetWindow,
            i,
            listenerId,
            listenerRecord;

        if (!listeners) {
            return -1;
        }

        // get a reference to the window object containing target
        targetDocument = target.document || target;
        targetWindow = targetDocument.parentWindow;

        // searching backward (to speed up onunload processing), find the listener
        for (i = listeners.length - 1; i >= 0; i--) {
            // get the listener's ID from target
            listenerId = listeners[i];

            // get the record of the listener from the window object
            listenerRecord = targetWindow._allListeners[listenerId];

            // compare type and listener with the retrieved record
            if (listenerRecord.type == type && listenerRecord.listener == listener) {
                return i;
            }
        }
        return -1;
    };

    Core._removeAllListeners = function () {
        var targetWindow = this,
            listenerRecord;

        for (id in targetWindow._allListeners) {
            listenerRecord = targetWindow._allListeners[id];
            listenerRecord.target.detachEvent("on" + listenerRecord.type, listenerRecord.listener2);
            delete targetWindow._allListeners[id];
        }
    };

  Core._listenerCounter = 0;
}

Core.addClass = function (target, the_class) {
    'use strict';
    if (!Core.hasClass(target, the_class)) {
        if (target.className === "") {
            target.className = the_class;
        } else {
            target.className += " " + the_class;
        }
    }
};

Core.getElementsByClass = function (the_class) {
    'use strict';
    var elementArray = [],
        matchedArray = [],
        pattern = new RegExp("(^| )" + the_class + "( |$)"),
        i,
        len;

    if (typeof document.all !== "undefined") {
      elementArray = document.all;
    } else {
      elementArray = document.getElementsByTagName("*");
    }

    len = elementArray.length;

    for (i = 0; i < len; i += 1) {
      if (pattern.test(elementArray[i].className)) {
        matchedArray[matchedArray.length] = elementArray[i];
      }
    }

    return matchedArray;
};

Core.getElementsByClass = function (the_class) {
    'use strict';
    var elementArray = [],
        matchedArray = [],
        pattern = new RegExp("(^| )" + the_class + "( |$)"),
        i,
        len;

    if (typeof document.all !== "undefined") {
        elementArray = document.all;
    } else {
        elementArray = document.getElementsByTagName("*");
    }

    len = elementArray.length;

    for (i = 0; i < len; i += 1) {
        if (pattern.test(elementArray[i].className)) {
            matchedArray[matchedArray.length] = elementArray[i];
        }
    }

    return matchedArray;
};

Core.hasClass = function (target, the_class) {
    'use strict';
    var pattern = new RegExp("(^| )" + the_class + "( |$)");

    if (pattern.test(target.className)) {
        return true;
    }

    return false;
};

Core.removeClass = function (target, the_class) {
    'use strict';
    var pattern = new RegExp("(^| )" + the_class + "( |$)");

    target.className = target.className.replace(pattern, "$1");
    target.className = target.className.replace(/ $/, "");
};

// Adds error message underneath input
// curr_obj refers to this input
// error_id can be any unique String
// message can be any String
Core.setError = function (curr_obj, error_id, message) {
    'use strict';
    var error_obj = document.createElement('div');

    error_obj.className = 'error-message';

    // Check to see if error already exists
    if (!document.getElementById(error_id)) {
        error_obj.setAttribute('id', error_id);
        curr_obj.parentNode.appendChild(error_obj);
        error_obj.innerHTML = '<p>' + message + '</p>';
    }

    // After displaying message, focus and select any text in the input
    curr_obj.focus();
    curr_obj.select();

    // Clear error message
    Core.addEventListener(curr_obj, 'keypress', function () {
        Core.removeError(curr_obj, error_id);
    });
};

// Removes Error Message from the DOM
Core.removeError = function (curr_obj, error_id) {
    'use strict';
    var error;

    if (document.getElementById(error_id)) {
        error = document.getElementById(error_id);
        curr_obj.parentNode.removeChild(error);
    } else {
        return;
    }
};

// Create Elements with attributes
// el_attributes should be an object with properties and values
Core.createNode = function (el_type, el_attributes) {
    'use strict';
    var el = document.createElement(el_type),
        key;

    for (key in el_attributes) {
        if (el_attributes.hasOwnProperty(key)) {
            el.setAttribute(key, el_attributes[key]);
        }
    }
    return el;
};

Core.start = function (runnable) {
    Core.addEventListener(window, 'load', runnable.init);
};

Core.addLoadEvent = function (func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            if (oldonload) {
                oldonload();
            }
            func();
        };
    }
};

Core.hasWhiteSpace = function (str) {
    'use strict';
    return str.indexOf(' ') >= 0;
};