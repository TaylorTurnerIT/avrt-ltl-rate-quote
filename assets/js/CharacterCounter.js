var CharacterCounter = {
    init: function (input_id, max_chars) {
        var char_counter = CharacterCounter.registerCharacterCounter(input_id, max_chars);
        char_counter.countCharacters();
    },

    printRemainingCharacters: function (input_obj, max_chars, report_control_id) {
        var len = input_obj.value.length,
            result = max_chars - len;

        if (max_chars - len >= 0) {
            CharacterCounter.updateUi(result, report_control_id);
        } else {
            CharacterCounter.updateUi(0, report_control_id);
            input_obj.value = input_obj.value.substring(0, input_obj.value.length - 1);
        }
    },

    updateUi: function (result, report_control_id) {
        var report_control = document.getElementById(report_control_id);

        report_control.firstChild.nodeValue = result;
    },

    registerCharacterCounter: function (input_id, max_chars) {
        return {
            countCharacters: function () {
                var $input_obj        = $('#' + input_id),
                    report_control_id = 'remaining-characters-' + input_id,
                    init_chars        = $input_obj.val().length,
                    chars             = init_chars > 0 ? max_chars - init_chars : max_chars,
                    report_controls   = '<p class="ae-m--top-none js-character-counter">Remaining characters: <span class="ae-color--text-brand" id="' + report_control_id + '">' + chars + '</span></p>',
                    key_count;

                // Append controls
                $input_obj.after(report_controls);

                // Prevent rapid firing while holding down a key
                $input_obj.on('keypress', function (e) {
                    key_count = 0;

                    if (key_count > 1) {
                        e.preventDefault();
                    }
                    key_count++;
                });

                $input_obj.on('keyup', function () {
                    key_count = 0;
                    CharacterCounter.printRemainingCharacters(this, max_chars, report_control_id);
                });
            }
        };
    }
};