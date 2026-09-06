// Invoke AddRemoveRow
// var items = AddRemoveRow.registerObj('item-rows', '+ Add Item', 100, MyObject);
// items.init();
var AddRemoveRow = {
    registerObj: function (section_id, add_btn_str, max_items, local_obj) {
        return {
            init: function () {
                var $container   = jQuery('#' + section_id),
                    $section     = $container.find('.js-group'),
                    len          = $section.length,
                    i;

                if (local_obj === null) {
                    local_obj = AddRemoveRow;
                }

                // Manage Add/Delete state
                local_obj.items_hidden = 0;
                local_obj.max_items    = max_items;
                local_obj.item_rows    = [];

                // create the add item button
                AddRemoveRow.makeAddButton($container, add_btn_str, local_obj);

                // add delete button to each item
                for (i = 0; i < len; i += 1) {
                    AddRemoveRow.makeDeleteControl($section[i], i, local_obj, $container);

                    // count number of items that are hidden
                    if (jQuery('#js-group-' + i).hasClass('js-init-hidden')) {
                        // Update global items hidden count
                        local_obj.items_hidden += 1;
                    }
                }

                // when all items are hidden but one
                if (local_obj.items_hidden === (local_obj.max_items - 1)) {
                    // hide first delete button
                    jQuery($container.find('.js-delete-item')[0]).fadeOut(200);
                }
            }
        };
    },

    makeAddButton: function ($container, add_btn_str, local_obj) {
        var doc     = document,
            btn     = doc.createElement('div'),
            span    = doc.createElement('span'),
            txt_str = add_btn_str === undefined ? '+ Add Row' : add_btn_str,
            btn_txt = doc.createTextNode(txt_str),
            id      = $container.attr('id');

        btn.className  = 'ae-button--inline ae-m--bottom-large';
        btn.id         = 'btn-add-item-' + id;
        span.className = 'btn-label';

        span.appendChild(btn_txt);
        btn.appendChild(span);
        $container[0].appendChild(btn);

        AddRemoveRow.add_button = btn;

        jQuery(btn).on('click', function () {
            AddRemoveRow.addSection($container, btn.id, local_obj);

            if (typeof local_obj.recalculateEvents === 'function') {
                local_obj.recalculateEvents();
            }
        });
    },

    addSection: function ($container, add_btn_id, local_obj) {
        var $sections           = $container.find('.js-group'),
            len                 = $sections.length,
            hidden_sections_ary = [],
            id                  = $container.attr('id'),
            $message            = jQuery('<p class="branded" id="max-msg-' + id +
                                         '">Maximum number of line items has been reached.</p>'),
            hidden_section,
            $show_section,
            i;

        // Update global items hidden count
        local_obj.items_hidden -= 1;

        // loop through hidden items
        // unhide the first hidden item in the list
        for (i = 0; i < len; i += 1) {
            hidden_section = $sections[i];
            // count number of items that are hidden
            if (jQuery(hidden_section).hasClass('js-init-hidden')) {
                hidden_sections_ary.push($sections[i]);
            }
        }

        // Show delete button for this section
        if (local_obj.items_hidden > 1) {
            jQuery($container.find('.js-delete-item')[0]).fadeIn(300);
        }

        if (local_obj.items_hidden <= 0) {
            jQuery(AddRemoveRow.add_button).fadeOut(200, function () {
                var $add_btn = jQuery('#' + add_btn_id);

                $add_btn.addClass('js-init-hidden');
                if (!document.getElementById('max-msg-' + id)) {
                    $add_btn.after($message);
                } else {
                    jQuery('#max-msg-' + id).removeClass('js-init-hidden');
                }
            });
        }

        if (hidden_sections_ary.length > 0) {
            $show_section = jQuery(hidden_sections_ary[0]);
            $show_section.fadeOut(0, function () {
                $show_section.removeClass('js-init-hidden');
                $show_section.fadeIn(400);
            });
        }
    },

    // Requires class="js-group" for each containing section
    makeDeleteControl: function (target,
                                 index,
                                 local_obj,
                                 $container) {
        var doc        = document,
            delete_btn = doc.createElement('span'),
            btn_label  = delete_btn.cloneNode('true'),
            id         = $container.attr('id');

        delete_btn.className = 'js-delete-item ae-icon-remove ae-shipment-fields--remove-button-label';
        delete_btn.id        = 'js-delete-item-' + id + '-' + index;
        delete_btn.setAttribute('data-id', index);
        btn_label.className  = 'btn-label';
        btn_label.title      = 'Delete Item';

        delete_btn.appendChild(btn_label);

        jQuery(delete_btn).on('click', function () {
            EditBol.itemToDel.type = "Ship Item"
        	EditBol.itemToDel.dataObj = {parent : jQuery(this).parent().parent(),
        	                             index : index,
        	                             $container : $container,
        	                             id : id,
        	                             local_obj : local_obj 
        	                           };

			$('#confirmation-modal').modal({ backdrop: 'static', keyboard: 'false' });
            $('#modalTitle').html("DELETE SHIP ITEM CONFIRMATION");
            $('#confirmationMessage').html("Confirm that you want to delete this ship item.");    
        });

        try {
            target.getElementsByTagName("ul")[0].appendChild(delete_btn);
        } catch(ex) {
            target.appendChild(delete_btn);  
        }

    },

    deleteSection: function ($this_container,
                             index,
                             $container,
                             id,
                             local_obj) {
        var $add_btn = jQuery('#btn-add-item-' + id),
            $delete_btns;

        if (typeof local_obj.clearInputRow === 'function') {
            local_obj.clearInputRow(index);
        }

        if (typeof local_obj.clearRow === 'function') {
            local_obj.clearRow(index);
        }

        // Update global items hidden count
        local_obj.items_hidden += 1;
        local_obj.item_rows.push($this_container);

        $this_container.fadeOut(400, function () {
            $this_container.addClass('js-init-hidden');
            // remove from DOM and append after the current last items section (determine last after item is removed)
            var $temp_node = $this_container.detach();
            var $last_section = $container.find('.js-group').last();
            $last_section.after($temp_node);

            if (local_obj.items_hidden >= 1) {
                jQuery('#max-msg-' + id).addClass('js-init-hidden');
                if ($add_btn.hasClass('js-init-hidden')) {
                    $add_btn.fadeOut(0);
                    $add_btn.removeClass('js-init-hidden');
                    $add_btn.fadeIn(300);
                }
            }

            if (local_obj.items_hidden === (local_obj.max_items - 1)) {
                $delete_btns = $container.find('.js-delete-item');
                // hide last delete button
                jQuery($delete_btns[0]).fadeOut(200);


                if (typeof local_obj.recalculateEvents === 'function') {
                    local_obj.recalculateEvents();
                }

                // Make first row fields required
                if (typeof local_obj.makeFirstRowItemsRequired === 'function') {
                    local_obj.makeFirstRowItemsRequired(index);
                }
            }
        });
    }
};