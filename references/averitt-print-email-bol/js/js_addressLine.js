// Uses Averitt.setError, so make sure averitt-main.js is loaded
var AddressLine = {
    hasPoBox: function (address_line)
    {
        var result             = false,
            clean_address      = '',
            // Modified from https://gist.github.com/leeoniya/899034
            po_box_pattern     = /^box[^a-z]|(p[-. ]?o.?[- ]?|post office )(b\.|box|\#)/i;
        if (address_line !== null
                && address_line.trim() !== '') {
            clean_address = address_line.trim().toLowerCase();
            result = po_box_pattern.test(clean_address);
        }
        return result;
    },

    isValid: function (address_objs)
    {
        var mthd         = 'isValid(address_objs) ',
            result       = true,
            address      = '';
        if (address_objs != null) {
	        $.each(address_objs, function(idx, address_obj) {
	            address = address_obj.value;
	            if (AddressLine.hasPoBox(address)) {
	                //console.log(mthd + 'Address is PO Box: ' + address_obj.id);
	                $(address_obj).trigger('focus');
	                Averitt.setError(address_obj, 'Address can NOT be a PO Box.');
	                result = false;
	            }
	        });
        }
        return result;
    }
};