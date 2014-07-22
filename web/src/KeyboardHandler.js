
(function (window) {//closure

    var global = window;

    var own = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

    var _Object_defineProperty = Object.defineProperty || function (obj, prop, val) {
        if ("value" in val) {
            obj[prop] = val.value;
        }
    };

    var _initKeyboardEvent_type = (function (e) {
        try {
            e.initKeyboardEvent(
				"keyup" // in DOMString typeArg
				, true // in boolean canBubbleArg
				, true // in boolean cancelableArg
				, global // in views::AbstractView viewArg
				, "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.key
				, 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.location
				, true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
				, false // [test]shift | alt
				, true // [test]shift | alt
				, false // meta
				, false // altGraphKey
			);



            // Safari and IE9 throw Error here due keyCode, charCode and which is readonly
            // Uncomment this code block if you need legacy properties
            delete e.keyCode;
            _Object_defineProperty(e, "keyCode", { writable: true, configurable: true, value: 9 });
            delete e.charCode;
            _Object_defineProperty(e, "charCode", { writable: true, configurable: true, value: 9 });
            delete e.which;
            _Object_defineProperty(e, "which", { writable: true, configurable: true, value: 9 });

            return ((e.keyIdentifier || e.key) === "+" && (e.Location) === 3) && (
				e.ctrlKey ?
					e.altKey ? // webkit
						1
						:
						3
					:
					e.shiftKey ?
						2 // webkit
						:
						4 // IE9
				) || 9 // FireFox|w3c
            ;
        }
        catch (__e__) { _initKeyboardEvent_type = 0; }
    })(document.createEvent("KeyboardEvent"));

    var _keyboardEvent_properties_dictionary = {
        "char": "",
        "key": "",
        "location": 0,
        "ctrlKey": false,
        "shiftKey": false,
        "altKey": false,
        "metaKey": false,
        "repeat": false,
        "locale": "",

        "detail": 0,
        "bubbles": false,
        "cancelable": false,

        //legacy properties
        "keyCode": 0,
        "charCode": 0,
        "which": 0
    };


    function crossBrowser_initKeyboardEvent(type, dict) {
        var e;
        if (_initKeyboardEvent_type) {
            e = document.createEvent("KeyboardEvent");
        } else {
            e = document.createEvent("Event");
        }
        var _prop_name
            , localDict = {};

        for (_prop_name in _keyboardEvent_properties_dictionary) if (own(_keyboardEvent_properties_dictionary, _prop_name)) {
            localDict[_prop_name] = (own(dict, _prop_name) && dict || _keyboardEvent_properties_dictionary)[_prop_name];
        }

        var _ctrlKey = localDict.ctrlKey
            , _shiftKey = localDict.shiftKey
            , _altKey = localDict.altKey
            , _metaKey = localDict.metaKey
            , _altGraphKey = localDict.altGraphKey

            , _modifiersListArg = _initKeyboardEvent_type > 3 ? (
                (_ctrlKey ? "Control" : "")
                    + (_shiftKey ? " Shift" : "")
                    + (_altKey ? " Alt" : "")
                    + (_metaKey ? " Meta" : "")
                    + (_altGraphKey ? " AltGraph" : "")
                ).trim() : null

            , _key = localDict.key
            , _char = localDict.char
            , _location = localDict.location
            , _keyCode = localDict.keyCode || (localDict.keyCode = _key && _key.charCodeAt(0) || 0)
            , _charCode = localDict.charCode || (localDict.charCode = _char && _char.charCodeAt(0) || 0)

            , _bubbles = localDict.bubbles
            , _cancelable = localDict.cancelable

            , _repeat = localDict.repeat
            , _locale = localDict.locale
            , _view = global
        ;

        localDict.which || (localDict.which = localDict.keyCode);

        if ("initKeyEvent" in e) {//FF
            //https://developer.mozilla.org/en/DOM/event.initKeyEvent
            e.initKeyEvent(type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode);
        }
        else if (_initKeyboardEvent_type && "initKeyboardEvent" in e) {//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
            if (_initKeyboardEvent_type === 1) { // webkit
                //http://stackoverflow.com/a/8490774/1437207
                //https://bugs.webkit.org/show_bug.cgi?id=13368
                e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey);
            }
            else if (_initKeyboardEvent_type === 2) { // old webkit
                //http://code.google.com/p/chromium/issues/detail?id=52408
                e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode);
            }
            else if (_initKeyboardEvent_type === 3) { // webkit
                e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey);
            }
            else if (_initKeyboardEvent_type === 4) { // IE9
                //http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
                e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _key, _location, _modifiersListArg, _repeat, _locale);
            }
            else { // FireFox|w3c
                //http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
                //https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
                e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _char, _key, _location, _modifiersListArg, _repeat, _locale);
            }
        }
        else {
            e.initEvent(type, _bubbles, _cancelable);
        }

        for (_prop_name in _keyboardEvent_properties_dictionary) if (own(_keyboardEvent_properties_dictionary, _prop_name)) {
            if (e[_prop_name] !== localDict[_prop_name]) {
                try {
                    delete e[_prop_name];
                    _Object_defineProperty(e, _prop_name, { writable: true, "value": localDict[_prop_name] });
                }
                catch (e) {
                    //Some properties is read-only
                }

            }
        }

        return e;
    }

    //export
    global.crossBrowser_initKeyboardEvent = crossBrowser_initKeyboardEvent;

})(window);


//function dispatchKeyboardEvent(target, type, item) {
//    item.canBubble = true;
//    item.cancelable = true;
//    item.key = item.key || item.which || item.keyCode;
//    var e= crossBrowser_initKeyboardEvent(type, item);

//    target.dispatchEvent(e);
//}


var modifiers = { altKey: "Alt", ctrlKey: "Control", shiftKey: "Shift", metaKey: "Meta" };
function getModifiers(it) {
    var l = [];
    for (var i in modifiers) {
        if (it[i]) {
            l.push(modifiers[i]);
        }
    }
    return l.join(" ");
}


function dispatchKeyboardEvent(target, type, item) {
    var oEvent = document.createEvent('KeyboardEvent');
    var options = item || {};

    $(target).focus();

    //Set your default options to the right of ||
    var opts = {
        type: type,
        canBubble: options.canBubble || true,
        cancelable: options.cancelable || true,
        view: options.view || target.ownerDocument.defaultView,
        key: (options.keyIdentifier || options.key || options.which) || 0,
        location: options.location || 0, //The coordinates within the entire page
        modifierList: getModifiers(options) || "",
        repeat: options.repeat || 0, //The coordinates within the viewport
        locale: options.locale || null,
    };

    //Pass in the options
    oEvent.initKeyboardEvent(
        opts.type,
        opts.canBubble,
        opts.cancelable,
        opts.view,
        opts.key,
        opts.location,
        opts.modifierList,
        opts.repeat,
        opts.locale
    );

    //Fire the event
    target.dispatchEvent(oEvent);
}

