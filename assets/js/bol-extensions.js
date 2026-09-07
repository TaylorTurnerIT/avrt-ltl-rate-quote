// BolExt: local extensions layered on top of the cloned shipPlusEditBol.js.
// Adds (1) additional UN numbers per hazmat group and (2) containers
// (pallets/skids/crates) whose sub-items are full clones of the reference
// line-item markup, bound to the reference logic (hazmat toggle, UN lookup,
// line-item blur validation, density). State is mirrored into two JSON
// sidecar fields (extra_uns_json, containers_json) consumed by the
// POST /print-email-bol handler. Programmatic form submission is gated so
// extension fields are validated before the BOL generates.
(function () {
    'use strict';

    var EXTRA_LINE_KEY = 'extra_uns_json';
    var CONTAINERS_KEY = 'containers_json';
    var RAW_KEY = 'avrt-bol-form-v1';
    var EXT_KEY = 'avrt-bol-ext-v1';
    // Flat rows use suffixes 0-24; clones use 100+ so the reference JS
    // (which targets fields by echoed numeric index) never collides.
    var cloneSeq = 100;
    // While rebuilding saved/demo state, skip saves and auto-scroll.
    var rebuilding = false;
    var quietBuild = false;

    function setError(input, message) {
        if (window.Averitt && typeof Averitt.setError === 'function') {
            Averitt.setError(input, message);
        } else if (input && input.className !== undefined) {
            input.className += ' error-input';
        }
    }

    function hazLookup(unNo, index) {
        var body = 'method=fillHazMat&unNum=' + encodeURIComponent(unNo) + '&index=' + encodeURIComponent(index);
        return fetch('/HazMaterials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        }).then(function (resp) { return resp.text(); }).then(function (text) {
            var parts = text.split('|');
            var kind = (parts[1] || '').toLowerCase();
            if (kind === 'invalid') { return { status: 'invalid' }; }
            if (kind === 'multiple') {
                var opts = [];
                for (var i = 3; i < parts.length - 1; i += 1) {
                    var seg = parts[i].split(';');
                    opts.push({ nos: seg[0] === 'Y', pkg: seg[1] || '', haz: seg[2] || '', sub: seg[3] || '', desc: seg[4] || '' });
                }
                return { status: 'multiple', un: parts[2] || unNo, options: opts };
            }
            return {
                status: 'single', un: parts[1] || unNo,
                pkg: parts[2] || '', haz: parts[3] || '', sub: parts[4] || '',
                desc: parts[5] || '', nos: parts[6] === 'Y'
            };
        });
    }

    function describe(entry) {
        var s = entry.un + ' — ' + entry.desc + ', ' + entry.haz;
        if (entry.sub) { s += '(' + entry.sub + ')'; }
        if (entry.pkg) { s += ', PG ' + entry.pkg; }
        if (entry.nos && entry.tech) { s += ' (' + entry.tech + ')'; }
        return s;
    }

    function lunitsList() {
        return Array.prototype.slice.call(document.querySelectorAll('input[name="lunits"]'));
    }

    function groupOf(el) {
        while (el && el !== document) {
            if (el.classList && el.classList.contains('js-group')) { return el; }
            el = el.parentNode;
        }
        return null;
    }

    function linePositionOf(group) {
        var lunits = group.querySelector('input[name="lunits"]');
        return lunitsList().indexOf(lunits);
    }

    // ---------- additional UN numbers ----------

    function makeExtraUnRow(inputVal, entry, tech) {
        var li = document.createElement('li');
        li.className = 'bol-ext-extra-un';
        li.innerHTML =
            '<label class="ae-form-element--label">Additional UN Number</label>' +
            '<input class="ae-input bol-ext-un-input" type="text" maxlength="6" />' +
            '<span class="mute bol-ext-un-status"></span>' +
            '<div class="bol-ext-un-detail" style="display:none;">' +
            '<p class="bol-ext-un-summary ae-m--top-small ae-m--bottom-none"></p>' +
            '<div class="bol-ext-variant" style="display:none;">' +
            '<label class="ae-form-element--label">UN Description</label>' +
            '<select class="ae-select--adjustable bol-ext-variant-select"></select>' +
            '</div>' +
            '<div class="bol-ext-tech" style="display:none;">' +
            '<label class="ae-form-element--label">N.O.S. Technical Name</label>' +
            '<input class="ae-input--full bol-ext-tech-input" type="text" maxlength="50" />' +
            '</div></div>' +
            '<span class="ae-button--link bol-ext-remove">Remove</span>';
        li._entry = null;

        var input = li.querySelector('.bol-ext-un-input');
        var status = li.querySelector('.bol-ext-un-status');
        var detail = li.querySelector('.bol-ext-un-detail');
        var summary = li.querySelector('.bol-ext-un-summary');
        var variantBox = li.querySelector('.bol-ext-variant');
        var variantSelect = li.querySelector('.bol-ext-variant-select');
        var techBox = li.querySelector('.bol-ext-tech');
        var techInput = li.querySelector('.bol-ext-tech-input');

        function applyEntry(entry) {
            li._entry = entry;
            detail.style.display = '';
            summary.textContent = describe(entry);
            techBox.style.display = entry.nos ? '' : 'none';
            syncJson();
        }

        function applyResult(result) {
            variantBox.style.display = 'none';
            if (result.status === 'invalid') {
                li._entry = null;
                detail.style.display = 'none';
                setError(input, 'Invalid UN Number');
                syncJson();
                return;
            }
            if (result.status === 'single') {
                applyEntry({ un: result.un, pkg: result.pkg, haz: result.haz, sub: result.sub, desc: result.desc, nos: result.nos, tech: '' });
                return;
            }
            variantBox.style.display = '';
            detail.style.display = '';
            variantSelect.innerHTML = '';
            var placeholder = document.createElement('option');
            placeholder.value = '-1';
            placeholder.textContent = 'Select Description';
            variantSelect.appendChild(placeholder);
            result.options.forEach(function (opt, i) {
                var el = document.createElement('option');
                el.value = String(i);
                el.textContent = opt.pkg + ';' + opt.haz + ';' + opt.sub + ';' + opt.desc;
                variantSelect.appendChild(el);
            });
            variantSelect.onchange = function () {
                var i = parseInt(variantSelect.value, 10);
                if (isNaN(i) || i < 0) { li._entry = null; summary.textContent = ''; syncJson(); return; }
                var opt = result.options[i];
                applyEntry({ un: result.un, pkg: opt.pkg, haz: opt.haz, sub: opt.sub, desc: opt.desc, nos: opt.nos, tech: '' });
            };
        }

        input.addEventListener('keyup', function () {
            var v = input.value.toUpperCase();
            if (input.value !== v) { input.value = v; }
            if (v.length === 6) {
                status.textContent = 'looking up…';
                hazLookup(v, 'x').then(function (result) {
                    status.textContent = '';
                    applyResult(result);
                });
            }
        });
        techInput.addEventListener('input', function () {
            if (li._entry) { li._entry.tech = techInput.value; syncJson(); }
        });
        li.querySelector('.bol-ext-remove').addEventListener('click', function () {
            li.parentNode.removeChild(li);
            syncJson();
        });
        li._restore = applyEntry;
        if (inputVal) { input.value = inputVal; }
        if (entry) {
            if (tech) { entry.tech = tech; }
            var techInputInit = li.querySelector('.bol-ext-tech-input');
            if (techInputInit && entry.tech) { techInputInit.value = entry.tech; }
            applyEntry(entry);
        }
        return li;
    }

    function makeRedX(title, onRemove) {
        // Same markup/classes as the reference rows' delete control
        // (AddRemoveRow.makeDeleteControl): the red X comes from
        // .ae-icon-remove:before in the reference stylesheet.
        var x = document.createElement('span');
        x.className = 'js-delete-item ae-icon-remove bol-ext-x';
        var label = document.createElement('span');
        label.className = 'btn-label';
        label.title = title;
        x.appendChild(label);
        x.setAttribute('role', 'button');
        x.setAttribute('aria-label', title);
        x.addEventListener('click', onRemove);
        return x;
    }

    function installExtraUnButton(groupSection) {
        var group = groupSection.querySelector('.hazmat-group');
        if (!group || group.querySelector('.bol-ext-extra-un-wrap')) { return; }
        var suffix = 'x';
        var idHolder = groupSection.querySelector('input[name="lhazflag"]');
        if (idHolder && idHolder.id) {
            var m = /lhazflag-(\d+)/.exec(idHolder.id);
            if (m) { suffix = m[1]; }
        }
        var list = document.createElement('ul');
        list.className = 'bol-ext-extra-un-list';
        list.id = 'extra-un-list-' + suffix;
        var btn = document.createElement('span');
        btn.className = 'ae-button--link bol-ext-add-un';
        btn.textContent = '+';
        btn.title = 'Add UN number';
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', 'Add UN number');
        btn.addEventListener('click', function () {
            list.appendChild(makeExtraUnRow());
        });
        var wrap = document.createElement('div');
        wrap.className = 'bol-ext-extra-un-wrap';
        wrap.appendChild(document.createElement('br'));
        wrap.appendChild(btn);
        wrap.appendChild(list);
        group.appendChild(wrap);
    }

    function collectExtraUns() {
        // Extra UN rows on flat (non-clone) rows, keyed by document position
        // of the row, matching the server's flat-array indexing.
        var out = {};
        document.querySelectorAll('.bol-ext-extra-un').forEach(function (li) {
            var group = groupOf(li);
            if (!group || group.classList.contains('bol-ext-clone')) { return; }
            var entry = li._entry;
            if (!entry) { return; }
            var techInput = li.querySelector('.bol-ext-tech-input');
            if (techInput) { entry.tech = techInput.value; }
            var pos = linePositionOf(group);
            if (pos < 0) { return; }
            if (!out[pos]) { out[pos] = []; }
            out[pos].push(entry);
        });
        return out;
    }

    // ---------- containers with cloned sub-items ----------

    function resuffix(root, suffix) {
        root.querySelectorAll('[id]').forEach(function (el) {
            el.id = el.id.replace(/-\d+$/, '-' + suffix);
        });
        root.querySelectorAll('[for]').forEach(function (el) {
            el.setAttribute('for', el.getAttribute('for').replace(/-\d+$/, '-' + suffix));
        });
        root.querySelectorAll('[name]').forEach(function (el) {
            if (/^(hazmatToggle|limquantToggle)-\d+$/.test(el.name)) {
                el.name = el.name.replace(/-\d+$/, '-' + suffix);
            }
        });
        var flag = root.querySelector('input[name="lhazflag"]');
        if (flag) { flag.setAttribute('data-index', String(suffix)); }
        var loop = root.querySelector('input[name="lineItemLoopIndex"]');
        if (loop) { loop.value = String(suffix); }
        if (root.classList && root.classList.contains('js-group')) {
            root.id = root.id.replace(/-\d+$/, '-' + suffix);
        }
    }

    function stripDynamicState(clone) {
        clone.querySelectorAll('.ae-error--inline').forEach(function (e) { e.parentNode.removeChild(e); });
        clone.querySelectorAll('.error-input').forEach(function (e) { e.classList.remove('error-input'); });
        clone.querySelectorAll('.error-inline-parent').forEach(function (e) { e.classList.remove('error-inline-parent'); });
        clone.querySelectorAll('.bol-ext-extra-un-wrap,.js-delete-item').forEach(function (e) { e.parentNode.removeChild(e); });
        function clean(sel, classes) {
            var el = clone.querySelector(sel);
            if (el) { classes.forEach(function (c) { el.classList.remove(c); }); }
        }
        clean('input[name="lunits"]', ['positiveInteger']);
        clean('input[name="lwgt"]', ['positiveInteger']);
        clean('input[name="ldesc"]', ['required']);
        clean('input[name="valByComm"]', ['required', 'dollarsAndCents72']);
        clean('input[name="nosDesc"]', ['required']);
        clean('select[name="hazSelect"]', ['requiredSelect']);
    }

    function clearCloneFields(suffix) {
        ['un-number-', 'nos-desc-', 'pkgclass-', 'hazclass-', 'hazsubclass-', 'hazdesc-'].forEach(function (prefix) {
            var el = document.getElementById(prefix + suffix);
            if (el) { el.value = ''; }
        });
        var isNos = document.getElementById('isNos-' + suffix);
        if (isNos) { isNos.value = 'false'; }
        var sel = document.getElementById('haz-select-' + suffix);
        if (sel) {
            sel.innerHTML = '';
            var opt = document.createElement('option');
            opt.value = '-1';
            opt.textContent = 'Select Description';
            sel.appendChild(opt);
            sel.selectedIndex = 0;
        }
    }

    function renumberAll() {
        document.querySelectorAll('.bol-ext-container').forEach(function (div) {
            div.querySelectorAll('section.js-group.bol-ext-clone').forEach(function (sec, ii) {
                var label = sec.querySelector('.bol-ext-item-label .bol-ext-item-num');
                if (label) { label.textContent = String(ii + 1); }
            });
        });
    }

    function addSubItem(container) {
        var template = document.querySelector('#items-to-ship section.shipment-fields.js-group');
        if (!template) { return; }
        var suffix = cloneSeq;
        cloneSeq += 1;
        var clone = template.cloneNode(true);
        clone.classList.add('bol-ext-clone');
        clone.classList.remove('js-init-hidden');
        resuffix(clone, suffix);
        stripDynamicState(clone);
        installUnPrefixes(clone);
        // clearInputRow resolves fields via getElementById, so the clone
        // must be in the document before resetting it.
        container.querySelector('.bol-ext-subitems').appendChild(clone);
        if (window.EditBol && typeof EditBol.clearInputRow === 'function') {
            EditBol.clearInputRow(suffix);
        }
        clearCloneFields(suffix);
        // Sub-item weight/length/width are not tracked: the container
        // covers them. Hide those rows and mark the inputs mute so the
        // reference logic treats them as read-only (never required,
        // density removed).
        ['lwgt', 'llen', 'lwid'].forEach(function (name) {
            var input = clone.querySelector('input[name="' + name + '"]');
            if (!input) { return; }
            input.classList.add('mute');
            var li = input;
            while (li && li.tagName !== 'LI') { li = li.parentNode; }
            if (li) { li.style.display = 'none'; }
        });
        if (window.EditBol) {
            var flag = clone.querySelector('input[name="lhazflag"]');
            if (flag && typeof EditBol.toggleHazmatFields === 'function') {
                EditBol.toggleHazmatFields(flag);
            }
            var un = clone.querySelector('input[name="unNum"]');
            if (un && typeof EditBol.registerUNnumberEvents === 'function' && window.jQuery) {
                EditBol.registerUNnumberEvents(window.jQuery(un));
            }
            if (typeof EditBol.setLineItemEvents === 'function') {
                EditBol.setLineItemEvents(suffix);
            }
        }
        // Additional UN numbers live on their own sub-item rows, never as
        // extra rows inside a sub-item, so clones get no Add-UN control.
        var firstUl = clone.getElementsByTagName('ul')[0];
        var removeItem = makeRedX('Remove item', function () {
            clone.parentNode.removeChild(clone);
            renumberAll();
            syncJson();
        });
        if (firstUl) {
            firstUl.appendChild(removeItem);
        } else {
            clone.insertBefore(removeItem, clone.firstChild);
        }
        var itemLabel = document.createElement('div');
        itemLabel.className = 'bol-ext-item-label';
        itemLabel.innerHTML = 'Item <span class="bol-ext-item-num"></span>';
        clone.insertBefore(itemLabel, clone.firstChild);
        renumberAll();
        syncJson();
        if (!quietBuild) { clone.scrollIntoView({ block: 'nearest' }); }
    }

    function valOf(scope, selector) {
        var el = scope.querySelector(selector);
        return el ? el.value.trim() : '';
    }

    function collectContainerExtraUns(memberSection) {
        var out = [];
        memberSection.querySelectorAll('.bol-ext-extra-un').forEach(function (li) {
            var entry = li._entry;
            if (!entry) { return; }
            var techInput = li.querySelector('.bol-ext-tech-input');
            if (techInput) { entry.tech = techInput.value; }
            out.push(entry);
        });
        return out;
    }

    function collectContainers() {
        var out = [];
        document.querySelectorAll('.bol-ext-container').forEach(function (div) {
            function val(cls) {
                var el = div.querySelector('.' + cls);
                return el ? el.value.trim() : '';
            }
            var typeEl = div.querySelector('.bol-ext-c-type');
            var items = [];
            div.querySelectorAll('section.js-group.bol-ext-clone').forEach(function (sec) {
                var pos = linePositionOf(sec);
                var hazFlag = sec.querySelector('input[name="lhazflag"]');
                items.push({
                    line: pos,
                    desc: valOf(sec, 'input[name="ldesc"]'),
                    pieces: valOf(sec, 'input[name="lunits"]'),
                    len: valOf(sec, 'input[name="llen"]'),
                    wid: valOf(sec, 'input[name="lwid"]'),
                    hgt: valOf(sec, 'input[name="lhgt"]'),
                    nmfc: valOf(sec, 'input[name="lnmfc"]'),
                    sub: valOf(sec, 'input[name="lnmfcsub"]'),
                    class: valOf(sec, 'select[name="lclass"]'),
                    haz: !!(hazFlag && hazFlag.value === 'Y'),
                    uns: collectContainerExtraUns(sec)
                });
            });
            out.push({
                type: typeEl ? typeEl.value : 'SK',
                pieces: val('bol-ext-c-pieces'),
                len: val('bol-ext-c-len'),
                wid: val('bol-ext-c-wid'),
                hgt: val('bol-ext-c-hgt'),
                wgt: val('bol-ext-c-wgt'),
                items: items
            });
        });
        return out;
    }

    function makeContainer() {
        var div = document.createElement('div');
        div.className = 'bol-ext-container ae-section ae-shipment-fields--container-extended';
        div.innerHTML =
            '<h3 class="ae-field-header">Container</h3>' +
            '<ul class="ae-flex--wrap ae-flex--gap">' +
            '<li><label class="ae-form-element--label">Unit type</label>' +
            '<select class="ae-select bol-ext-c-type"><option value="SK">Pallet</option><option value="SK">Skid</option><option value="CR">Crate</option><option value="BX">Box</option><option value="DR">Drum</option></select></li>' +
            '<li><label class="ae-form-element--label">Pieces</label><input class="ae-input bol-ext-c-pieces" type="text" maxlength="5" /></li>' +
            '<li><label class="ae-form-element--label">Length (in)</label><input class="ae-input bol-ext-c-len" type="text" maxlength="3" /></li>' +
            '<li><label class="ae-form-element--label">Width (in)</label><input class="ae-input bol-ext-c-wid" type="text" maxlength="3" /></li>' +
            '<li><label class="ae-form-element--label">Height (in)</label><input class="ae-input bol-ext-c-hgt" type="text" maxlength="3" /></li>' +
            '<li><label class="ae-form-element--label">Weight</label><input class="ae-input bol-ext-c-wgt" type="text" maxlength="6" /></li>' +
            '</ul>' +
            '<h5 class="ae-m--top-large">Items in this container</h5>' +
            '<div class="bol-ext-subitems"></div>' +
            '<span class="ae-button--link bol-ext-subitem-add">Add item to container</span>';
        var header = div.querySelector('h3');
        header.appendChild(makeRedX('Remove container', function () {
            div.parentNode.removeChild(div);
            renumberAll();
            syncJson();
        }));
        div.querySelector('.bol-ext-subitem-add').addEventListener('click', function () {
            addSubItem(div);
        });
        div.addEventListener('input', syncJson);
        div.addEventListener('change', syncJson);
        return div;
    }

    function installContainerButton() {
        var section = document.getElementById('items-to-ship');
        if (!section || document.getElementById('btn-add-item-containers')) { return; }
        var btn = document.createElement('div');
        btn.className = 'ae-button--inline ae-m--bottom-large ae-m--left-large';
        btn.id = 'btn-add-item-containers';
        btn.innerHTML = '<span class="btn-label">+ Add Container</span>';
        var host = document.createElement('div');
        host.id = 'bol-ext-containers';
        var anchor = section.querySelector('.ae-button--inline');
        if (anchor && anchor.parentNode) {
            // Containers live above the add buttons, never below them.
            anchor.parentNode.insertBefore(host, anchor);
            anchor.parentNode.insertBefore(btn, anchor.nextSibling);
        } else {
            section.appendChild(host);
            section.appendChild(btn);
        }
        btn.addEventListener('click', function () {
            host.appendChild(makeContainer());
            renumberAll();
            syncJson();
            if (!quietBuild) { host.scrollIntoView({ block: 'nearest' }); }
        });
    }

    // ---------- JSON sidecars ----------

    function ensureSidecar(name) {
        var form = document.getElementById('add-edit-bol');
        var el = document.getElementById(name);
        if (!el) {
            el = document.createElement('input');
            el.type = 'hidden';
            el.name = name;
            el.id = name;
            form.appendChild(el);
        }
        return el;
    }

    function syncJson() {
        var form = document.getElementById('add-edit-bol');
        if (!form) { return; }
        ensureSidecar(EXTRA_LINE_KEY).value = JSON.stringify(collectExtraUns());
        ensureSidecar(CONTAINERS_KEY).value = JSON.stringify(collectContainers());
    }

    // ---------- validation gate on programmatic submit ----------

    function intOk(v) {
        if (v === '') { return true; }
        return /^\d*[1-9]\d*$/.test(v);
    }

    function checkExtraRow(li) {
        var input = li.querySelector('.bol-ext-un-input');
        var typed = input && input.value.trim() !== '';
        if (!typed && !li._entry) { return true; }
        if (!li._entry) {
            setError(input, 'Look up a valid UN number or remove this row');
            return false;
        }
        if (li._entry.nos) {
            var tech = li.querySelector('.bol-ext-tech-input');
            if (tech && tech.value.trim() === '') {
                setError(tech, 'Required field');
                return false;
            }
        }
        return true;
    }

    function validate() {
        var ok = true;
        document.querySelectorAll('.bol-ext-extra-un').forEach(function (li) {
            if (!checkExtraRow(li)) { ok = false; }
        });
        document.querySelectorAll('.bol-ext-container').forEach(function (div) {
            function val(cls) {
                var el = div.querySelector('.' + cls);
                return el ? el : null;
            }
            ['bol-ext-c-pieces', 'bol-ext-c-len', 'bol-ext-c-wid', 'bol-ext-c-hgt', 'bol-ext-c-wgt'].forEach(function (cls) {
                var el = val(cls);
                if (el && !intOk(el.value.trim())) {
                    setError(el, 'Positive, whole numbers only');
                    ok = false;
                }
            });
            div.querySelectorAll('section.js-group.bol-ext-clone').forEach(function (sec) {
                var desc = sec.querySelector('input[name="ldesc"]');
                var pieces = sec.querySelector('input[name="lunits"]');
                var hazFlag = sec.querySelector('input[name="lhazflag"]');
                var isHaz = !!(hazFlag && hazFlag.value === 'Y');
                var touched = (desc && desc.value.trim() !== '')
                    || (pieces && pieces.value.trim() !== '')
                    || sec.querySelectorAll('.bol-ext-extra-un').length > 0
                    || isHaz;
                // Hazmat rows print the UN basic description instead: the
                // reference hides and clears the commodity description, so
                // it must not be required here either.
                if (touched && !isHaz && desc && desc.value.trim() === '') {
                    setError(desc, 'Required field');
                    ok = false;
                }
            });
        });
        return ok;
    }

    // ---------- persistence (refresh-safe) + demo content ----------

    function loadJson(key) {
        try {
            var raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveNow() {
        if (rebuilding) { return; }
        try {
            syncJson();
            var raw = {};
            document.querySelectorAll('#add-edit-bol input, #add-edit-bol select, #add-edit-bol textarea').forEach(function (el) {
                if (!el.id || el.id === EXTRA_LINE_KEY || el.id === CONTAINERS_KEY) { return; }
                if (el.type === 'checkbox' || el.type === 'radio') {
                    raw[el.id] = { c: el.checked ? 1 : 0 };
                } else {
                    raw[el.id] = { v: el.value };
                }
            });
            window.localStorage.setItem(RAW_KEY, JSON.stringify(raw));
            window.localStorage.setItem(EXT_KEY, JSON.stringify({
                extras: collectFlatExtrasForSave(),
                containers: collectContainersForSave(),
                resolutions: collectResolutions()
            }));
        } catch (e) { /* storage unavailable: skip */ }
    }

    var saveTimer = null;
    function scheduleSave() {
        if (saveTimer) { window.clearTimeout(saveTimer); }
        saveTimer = window.setTimeout(saveNow, 400);
    }

    function groupSuffix(groupSection) {
        var flag = groupSection.querySelector('input[name="lhazflag"]');
        if (!flag || !flag.id) { return null; }
        var m = /lhazflag-(\d+)/.exec(flag.id);
        return m ? m[1] : null;
    }

    function collectFlatExtrasForSave() {
        var out = [];
        document.querySelectorAll('.bol-ext-extra-un').forEach(function (li) {
            var group = groupOf(li);
            if (!group || group.classList.contains('bol-ext-clone')) { return; }
            var input = li.querySelector('.bol-ext-un-input');
            var tech = li.querySelector('.bol-ext-tech-input');
            out.push({
                suffix: groupSuffix(group),
                input: input ? input.value : '',
                entry: li._entry || null,
                tech: tech ? tech.value : ''
            });
        });
        return out;
    }

    function readResolution(groupSection) {
        function v(name) {
            var el = groupSection.querySelector('[name="' + name + '"]');
            return el ? el.value : '';
        }
        var isNos = groupSection.querySelector('[name="isNos"]');
        return {
            pkg: v('pkgClass'),
            haz: v('hazClass'),
            sub: v('hazSubClass'),
            desc: v('hazDesc'),
            nos: !!isNos && isNos.value === 'true',
            tech: v('nosDesc')
        };
    }

    function collectResolutions() {
        var out = [];
        document.querySelectorAll('#items-to-ship section.shipment-fields.js-group').forEach(function (sec) {
            if (sec.classList.contains('bol-ext-clone')) { return; }
            var flag = sec.querySelector('input[name="lhazflag"]');
            var un = sec.querySelector('input[name="unNum"]');
            if (!flag || flag.value !== 'Y' || !un || un.value.trim() === '') { return; }
            out.push({ suffix: groupSuffix(sec), res: readResolution(sec) });
        });
        return out;
    }

    function dumpSection(sec) {
        var out = {};
        sec.querySelectorAll('input, select, textarea').forEach(function (el) {
            if (!el.name || el.name === 'lineItemLoopIndex') { return; }
            var base = el.name.replace(/-\d+$/, '');
            if (el.type === 'radio') {
                if (el.checked) { out['radio:' + base] = el.value; }
            } else if (el.type === 'checkbox') {
                out['check:' + base + ':' + el.value] = el.checked ? 1 : 0;
            } else {
                out[el.name] = el.value;
            }
        });
        return out;
    }

    function fillSection(sec, dump) {
        Object.keys(dump || {}).forEach(function (k) {
            if (k.indexOf('radio:') === 0) {
                var prefix = k.slice(6);
                sec.querySelectorAll('input[type="radio"]').forEach(function (r) {
                    if (r.name.replace(/-\d+$/, '') === prefix) {
                        r.checked = (r.value === dump[k]);
                    }
                });
            } else if (k.indexOf('check:') === 0) {
                var rest = k.slice(6);
                var at = rest.lastIndexOf(':');
                var cprefix = rest.slice(0, at);
                var cvalue = rest.slice(at + 1);
                sec.querySelectorAll('input[type="checkbox"]').forEach(function (c) {
                    if (c.name.replace(/-\d+$/, '') === cprefix && c.value === cvalue) {
                        c.checked = !!dump[k];
                    }
                });
            } else {
                var el = sec.querySelector('[name="' + k + '"]');
                if (el) { el.value = dump[k]; }
            }
        });
    }

    function collectContainersForSave() {
        var out = [];
        document.querySelectorAll('.bol-ext-container').forEach(function (div) {
            function val(cls) {
                var el = div.querySelector('.' + cls);
                return el ? el.value : '';
            }
            var typeEl = div.querySelector('.bol-ext-c-type');
            var items = [];
            div.querySelectorAll('section.js-group.bol-ext-clone').forEach(function (sec) {
                var extras = [];
                sec.querySelectorAll('.bol-ext-extra-un').forEach(function (li) {
                    var input = li.querySelector('.bol-ext-un-input');
                    var tech = li.querySelector('.bol-ext-tech-input');
                    extras.push({ input: input ? input.value : '', entry: li._entry || null, tech: tech ? tech.value : '' });
                });
                items.push({ fields: dumpSection(sec), extras: extras, resolution: readResolution(sec) });
            });
            out.push({
                type: typeEl ? typeEl.value : 'SK',
                pieces: val('bol-ext-c-pieces'),
                len: val('bol-ext-c-len'),
                wid: val('bol-ext-c-wid'),
                hgt: val('bol-ext-c-hgt'),
                wgt: val('bol-ext-c-wgt'),
                items: items
            });
        });
        return out;
    }

    // Re-selects the saved hazmat variant once the lookup repopulates the
    // description select (multi-variant UNs), then restores the tech name.
    function reapplyResolution(suffix, res) {
        if (!res || !res.desc) { return; }
        var tries = 0;
        var timer = window.setInterval(function () {
            tries += 1;
            var sel = document.getElementById('haz-select-' + suffix);
            if (sel && sel.options.length > 1) {
                window.clearInterval(timer);
                for (var i = 1; i < sel.options.length; i += 1) {
                    var o = sel.options[i];
                    if ((o.getAttribute('data-pkg-class') || '') === (res.pkg || '')
                        && (o.getAttribute('data-haz-class') || '') === (res.haz || '')
                        && (o.getAttribute('data-haz-subclass') || '') === (res.sub || '')
                        && (o.getAttribute('data-desc') || '') === (res.desc || '')) {
                        sel.selectedIndex = i;
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
                if (res.tech) {
                    var nos = document.getElementById('nos-desc-' + suffix);
                    if (nos) { nos.value = res.tech; }
                }
                scheduleSave();
            } else if (tries > 40) {
                window.clearInterval(timer);
            }
        }, 200);
    }

    function expandCloneHazmat(sec, unValue, res) {
        var yes = null;
        sec.querySelectorAll('input[type="radio"]').forEach(function (r) {
            if (r.name.replace(/-\d+$/, '') === 'hazmatToggle' && r.value === 'Y') { yes = r; }
        });
        if (yes) { yes.click(); }
        var un = sec.querySelector('input[name="unNum"]');
        if (un && unValue) {
            un.value = unValue;
            un.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        }
        var flag = sec.querySelector('input[name="lhazflag"]');
        var suffix = flag && /lhazflag-(\d+)/.exec(flag.id) ? RegExp.$1 : null;
        if (suffix && res) { reapplyResolution(suffix, res); }
    }

    function setValById(id, value) {
        var el = document.getElementById(id);
        if (el) { el.value = value; }
    }

    function setSelectById(id, value) {
        var el = document.getElementById(id);
        if (el) { el.value = value; }
    }

    function blurById(id) {
        var el = document.getElementById(id);
        if (el) { el.dispatchEvent(new Event('blur')); }
    }

    function setCity(selectId, city) {
        var sel = document.getElementById(selectId);
        if (!sel) { return; }
        var found = Array.prototype.some.call(sel.options, function (o) { return o.value === city; });
        if (!found) {
            var opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            sel.appendChild(opt);
        }
        sel.value = city;
    }

    function demoHazmat(suffix, un, res) {
        var yes = document.getElementById('hazmatToggleYes-' + suffix);
        if (yes) { yes.click(); }
        var u = document.getElementById('un-number-' + suffix);
        if (u) {
            u.value = un;
            u.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        }
        if (res) { reapplyResolution(suffix, res); }
    }

    var DEMO_RES_UN1993 = { pkg: 'III', haz: '3', sub: '', desc: 'Flammable liquids, n.o.s.', nos: true, tech: 'Contains isopropanol' };

    function fillDemo() {
        rebuilding = true;
        quietBuild = true;
        try {
            setValById('SN', 'Acme Party Supply');
            setValById('SA1', '100 Big Top Ave');
            setValById('SZ', '37201');
            setValById('SS', 'TN');
            setCity('SC', 'Nashville');
            setValById('CN', 'Beale Street Events');
            setValById('CA1', '400 Beale St');
            setValById('CZ', '38103');
            setValById('CS', 'TN');
            setCity('CC', 'Memphis');
            setValById('BN', 'Acme Party Supply');
            setValById('BA1', '100 Big Top Ave');
            setValById('BZ', '37201');
            setValById('BS', 'TN');
            setCity('BC', 'Nashville');
            setValById('BOL', 'BOL-1042');
            setValById('PON', 'PO-7781');
            setValById('bol-comments', 'Call consignee 30 min before delivery');
            setValById('emergency-name', 'Acme Party Supply');
            setValById('hazmat-contact-phone-area', '800');
            setValById('hazmat-contact-phone-first', '555');
            setValById('hazmat-contact-phone-last', '1234');
            setValById('lunits-0', '2');
            setSelectById('lutype-0', 'SK');
            setSelectById('lclass-0', '70');
            setValById('lnmfc-0', '156600');
            setValById('lnmfcsub-0', '02');
            setValById('ldesc-0', 'Paper party decorations');
            setValById('lwgt-0', '320');
            setValById('llen-0', '48');
            setValById('lwid-0', '40');
            setValById('lhgt-0', '48');
            blurById('lunits-0');
            var addBtn = document.getElementById('btn-add-item-items-to-ship');
            if (addBtn) { addBtn.click(); }
            setValById('lunits-1', '4');
            setSelectById('lutype-1', 'PC');
            setSelectById('lclass-1', '70');
            setValById('lwgt-1', '120');
            blurById('lunits-1');
            // Note: toggling Hazmat clears the commodity description by
            // design (the UN basic description prints instead).
            demoHazmat('1', 'UN1046', null);
            var host = document.getElementById('bol-ext-containers');
            if (host) {
                var div = makeContainer();
                host.appendChild(div);
                div.querySelector('.bol-ext-c-pieces').value = '1';
                div.querySelector('.bol-ext-c-len').value = '48';
                div.querySelector('.bol-ext-c-wid').value = '40';
                div.querySelector('.bol-ext-c-hgt').value = '48';
                div.querySelector('.bol-ext-c-wgt').value = '610';
                addSubItem(div);
                addSubItem(div);
                var clones = div.querySelectorAll('section.js-group.bol-ext-clone');
                if (clones[0]) {
                    fillSection(clones[0], { lunits: '12', lutype: 'BX', lclass: '70', ldesc: 'Greasepaint kits' });
                    blurSectionField(clones[0], 'lunits');
                }
                if (clones[1]) {
                    fillSection(clones[1], { lunits: '3', lutype: 'DR', lclass: '70' });
                    blurSectionField(clones[1], 'lunits');
                    expandCloneHazmat(clones[1], 'UN1993', DEMO_RES_UN1993);
                }
            }
        } finally {
            rebuilding = false;
            quietBuild = false;
        }
        syncJson();
        saveNow();
    }

    function blurSectionField(sec, name) {
        var el = sec.querySelector('[name="' + name + '"]');
        if (el) { el.dispatchEvent(new Event('blur')); }
    }

    function formIsEmpty() {
        var sn = document.getElementById('SN');
        if (sn && sn.value.trim() !== '') { return false; }
        return !lunitsList().some(function (el) { return el.value.trim() !== ''; });
    }

    function rebuild(saved) {
        rebuilding = true;
        quietBuild = true;
        try {
            (saved.extras || []).forEach(function (e) {
                if (!e.suffix) { return; }
                var list = document.getElementById('extra-un-list-' + e.suffix);
                if (!list) { return; }
                list.appendChild(makeExtraUnRow(e.input || '', e.entry || null, e.tech || ''));
            });
            var host = document.getElementById('bol-ext-containers');
            (saved.containers || []).forEach(function (c) {
                if (!host) { return; }
                var div = makeContainer();
                host.appendChild(div);
                if (c.type) { div.querySelector('.bol-ext-c-type').value = c.type; }
                div.querySelector('.bol-ext-c-pieces').value = c.pieces || '';
                div.querySelector('.bol-ext-c-len').value = c.len || '';
                div.querySelector('.bol-ext-c-wid').value = c.wid || '';
                div.querySelector('.bol-ext-c-hgt').value = c.hgt || '';
                div.querySelector('.bol-ext-c-wgt').value = c.wgt || '';
                (c.items || []).forEach(function (it) {
                    addSubItem(div);
                    var all = div.querySelectorAll('section.js-group.bol-ext-clone');
                    var sec = all[all.length - 1];
                    fillSection(sec, it.fields || {});
                    (it.extras || []).forEach(function (x) {
                        var list = sec.querySelector('.bol-ext-extra-un-list');
                        if (list) { list.appendChild(makeExtraUnRow(x.input || '', x.entry || null, x.tech || '')); }
                    });
                    var hazOn = Object.keys(it.fields || {}).some(function (k) {
                        return k.indexOf('radio:hazmatToggle') === 0 && it.fields[k] === 'Y';
                    });
                    if (hazOn) {
                        var un = sec.querySelector('input[name="unNum"]');
                        expandCloneHazmat(sec, un ? un.value : '', it.resolution || null);
                    }
                });
            });
            (saved.resolutions || []).forEach(function (r) {
                if (r && r.suffix) { reapplyResolution(r.suffix, r.res); }
            });
        } finally {
            rebuilding = false;
            quietBuild = false;
        }
        syncJson();
    }

    // The reference lookup only fires on exactly 6 characters, i.e. with
    // the UN prefix ("UN0129"). A static "UN-" badge after each UN input
    // (styled like the surrounding container, clearly not editable text)
    // shows the implied prefix, and bare 4-digit entries run the reference
    // lookup with the prefix applied behind the scenes. The input value
    // itself is never rewritten. Fully-typed entries, including
    // NA-prefixed ones, take the untouched reference path.
    function installUnPrefix(input) {
        if (!input || !input.id || input.id.indexOf('un-number-') !== 0) { return; }
        if (input.parentNode && input.parentNode.classList
            && input.parentNode.classList.contains('bol-ext-un-wrap')) { return; }
        var badge = document.createElement('span');
        badge.className = 'bol-ext-un-prefix';
        badge.textContent = 'UN-';
        badge.title = 'UN numbers are looked up with the UN prefix';
        // Wrap input + badge in a flex row so the badge stays vertically
        // centered on the input regardless of font metrics. Badge first:
        // it reads as a fused prefix, not a detached tag.
        var wrap = document.createElement('span');
        wrap.className = 'bol-ext-un-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(badge);
        wrap.appendChild(input);
    }

    function lookupUn(input) {
        if (!input || !input.id || input.id.indexOf('un-number-') !== 0) { return; }
        var v = input.value.trim().toUpperCase();
        if (!/^\d{4}$/.test(v)) { return; }
        var suffix = input.id.split('-').pop();
        var original = input.value;
        input.value = 'UN' + v;
        try {
            if (window.EditBol && typeof EditBol.getHazmatData === 'function') {
                EditBol.getHazmatData(input, suffix, false);
            }
        } finally {
            input.value = original;
        }
        scheduleSave();
    }

    function installUnPrefixes(root) {
        (root || document).querySelectorAll('input[id^="un-number-"]').forEach(installUnPrefix);
    }

    function firePendingLookups() {
        // Re-runs lookups for restored bare-digit UNs (the reference skips
        // them on load since they are not 6 characters), but only on rows
        // marked hazmat so hidden rows stay untouched.
        document.querySelectorAll('#items-to-ship section.shipment-fields.js-group').forEach(function (sec) {
            var flag = sec.querySelector('input[name="lhazflag"]');
            var un = sec.querySelector('input[name="unNum"]');
            if (flag && flag.value === 'Y' && un && /^\d{4}$/.test(un.value.trim())) {
                lookupUn(un);
            }
        });
    }

    function init() {
        document.querySelectorAll('#items-to-ship section.shipment-fields.js-group').forEach(function (sec) {
            installExtraUnButton(sec);
        });
        installContainerButton();
        installUnPrefixes(document);
        syncJson();
        var savedExt = loadJson(EXT_KEY);
        var hasSaved = !!loadJson(RAW_KEY) || !!savedExt;
        if (savedExt) { rebuild(savedExt); }
        firePendingLookups();
        if (!hasSaved && formIsEmpty()) { fillDemo(); }
        var form = document.getElementById('add-edit-bol');
        if (form) {
            form.addEventListener('input', scheduleSave);
            form.addEventListener('change', scheduleSave);
            form.addEventListener('click', scheduleSave);
        }
        // Delegated (covers cloned rows too): runs after the reference
        // row-level keyup handler, which no-ops on 4 characters.
        document.addEventListener('keyup', function (e) {
            var t = e.target;
            if (t && t.tagName === 'INPUT') { lookupUn(t); }
        });
        document.addEventListener('paste', function (e) {
            var t = e.target;
            if (t && t.tagName === 'INPUT' && t.id && t.id.indexOf('un-number-') === 0) {
                window.setTimeout(function () { lookupUn(t); }, 0);
            }
        });
        var emailBtn = document.getElementById('emailPrintBol');
        if (emailBtn) {
            emailBtn.addEventListener('click', function () {
                syncJson();
                saveNow();
                // Safety net: if validation (reference or extension) blocks
                // the submit, make sure the first visible error is in view
                // instead of leaving a seemingly dead button.
                window.setTimeout(function () {
                    if (document.getElementById('form-overlay')) { return; }
                    var errs = document.querySelectorAll('#add-edit-bol .ae-error--inline');
                    for (var i = 0; i < errs.length; i += 1) {
                        var r = errs[i].getBoundingClientRect();
                        if (r.width > 0 && r.height > 0) {
                            errs[i].scrollIntoView({ block: 'center' });
                            break;
                        }
                    }
                }, 1500);
            });
        }
        var nativeSubmit = HTMLFormElement.prototype.submit;
        HTMLFormElement.prototype.submit = function () {
            syncJson();
            if (this.id === 'add-edit-bol' && !validate()) {
                var first = document.querySelector('#add-edit-bol .ae-error--inline');
                if (first && typeof first.scrollIntoView === 'function') {
                    first.scrollIntoView({ block: 'center' });
                }
                return;
            }
            nativeSubmit.call(this);
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
