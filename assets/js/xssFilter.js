var xssFilter = xssFilter || (function(){
    var injectionTriggers = ["<",">","\"","'","(",")"];   // List of strings that may indicate code injection attempt
    var defaultValue = "";  // Default value to return if manual validation is done for a field and we don't want to return the bad data
    var allInputs = $("input:text, textarea"); // Only need to worry about user inputted values  (inputs with type=text or textareas)
    var createOnChangeListener = false;
    var clearOnLoad = false;
    var debugMode = false;

    return {
        init : function() {
            var mthd = "validateAll()";
            this.debug(mthd,"Initializing xssFilter...");
            if(clearOnLoad) {
                this.validateAll();
            }
            if(createOnChangeListener) {
                this.setListener();
            }
            this.debug(mthd,"SUCCESS!");
        },
        
        // Kills/clears bad data from the inputs when page loads
        validateAll : function() {
            var mthd = "validateAll()";
            this.debug(mthd,"   Validating all inputs...");
            var allValid = true;
            for(var i=0;i<allInputs.length;i++) {
                var input = $('#'+allInputs[i].id);
                var value = input.val() == null ? "" : input.val();
                var valid = this.isValid(value);
                if(!valid) {
                    input.val("");
                    allValid = false;
                }
            }
            
            if(!allValid) {
                this.debug(mthd,"   ...error while validating: potentially bad data. Redirecting...");
            } else {
                this.debug(mthd,"   ...all data is clean");
            }
        },
        
        // Filter methods allow for the manual checking of a field against the triggers defined above
        filter : function(origVal,defaultVal) {
            var mthd = "filter(origVal,defaultVal)";
            this.debug(mthd,"");
            if(this.isValid(origVal)){
                return origVal;
            }
            else {
                return defaultVal;
            }
        },
        filter : function(origVal) {
            var mthd = "filter";
            this.debug(mthd,"");
            if(this.isValid(origVal)){
                return origVal;
            }
            else {
                return defaultValue;
            }
        },
        
        // Encodes user-controlled data
        sanitize : function(str) {
            var mthd = "sanitize(str)";
            this.debug(mthd,"Sanitizing...");
            var temp = document.createElement('div');
            temp.textContent = str;
            this.debug(mthd,"returning: "+temp.innerHTML);
            return temp.innerHTML;
        },
        
        // Checks a given string against the triggers defined above
        isValid : function(str){
            var mthd = "isValid(str)";
            this.debug(mthd,"");
            for(var j=0;j<injectionTriggers.length;j++) {
                var trigger=injectionTriggers[j];
                if(str.includes(trigger)){
                    return false;
                }
            }
            return true;
        },
        
        // Good for making sure users can't INPUT potentially bad data
        setListener : function() {
            var mthd = "setListener()";
            this.debug(mthd,"   Creating change event listener...");
            $(document).on('input', this.allInputs, function(event) {
                var input = $('#'+event.target.id);
                var value = input.val();
                var valid = xssFilter.isValid(value);
                if(!valid) {
                    input.val("");  // Clear the input area so they can't submit potentially bad data
                }
            });
            this.debug(mthd,"   ...done");
        },
        
        debug : function(mthd,msg) {
            if(debugMode == true && msg != "") {
                console.log("xssFilter."+mthd+": "+msg);
            }
        }
    };
}());

$(document).ready(function() {
    xssFilter.init();
});