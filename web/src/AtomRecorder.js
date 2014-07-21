/// <reference path="../Scripts/jquery-1.11.1.js" />


(function(window) {//closure
 
    var global = window;

    var own = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

    var _Object_defineProperty = Object.defineProperty || function (obj, prop, val) {
        if ("value" in val) {
            obj[prop] = val.value;
        }
    };

    var _initKeyboardEvent_type = (function (e)
    {
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
    })(document.createEvent( "KeyboardEvent" ));
 
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
	if( _initKeyboardEvent_type ) {
		e = document.createEvent( "KeyboardEvent" );
	}else {
		e = document.createEvent( "Event" );
	}
	var _prop_name
		, localDict = {};
 
	for( _prop_name in _keyboardEvent_properties_dictionary ) if(own(_keyboardEvent_properties_dictionary, _prop_name) ) {
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
		, _keyCode = localDict.keyCode || (localDict.keyCode = _key && _key.charCodeAt( 0 ) || 0)
		, _charCode = localDict.charCode || (localDict.charCode = _char && _char.charCodeAt( 0 ) || 0)
 
		, _bubbles = localDict.bubbles
		, _cancelable = localDict.cancelable
 
		, _repeat = localDict.repeat
		, _locale = localDict.locale
		, _view = global
	;
	
	localDict.which || (localDict.which = localDict.keyCode);
 
	if( "initKeyEvent" in e ) {//FF
		//https://developer.mozilla.org/en/DOM/event.initKeyEvent
		e.initKeyEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
	}
	else if(  _initKeyboardEvent_type && "initKeyboardEvent" in e ) {//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
		if( _initKeyboardEvent_type === 1 ) { // webkit
			//http://stackoverflow.com/a/8490774/1437207
			//https://bugs.webkit.org/show_bug.cgi?id=13368
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey );
		}
		else if( _initKeyboardEvent_type === 2 ) { // old webkit
			//http://code.google.com/p/chromium/issues/detail?id=52408
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
		}
		else if( _initKeyboardEvent_type === 3 ) { // webkit
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey );
		}
		else if( _initKeyboardEvent_type === 4 ) { // IE9
			//http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _modifiersListArg, _repeat, _locale );
		}
		else { // FireFox|w3c
			//http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
			//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _char, _key, _location, _modifiersListArg, _repeat, _locale );
		}
	}
	else {
	    e.initEvent(type, _bubbles, _cancelable);
	}
 
	for( _prop_name in _keyboardEvent_properties_dictionary )if( own( _keyboardEvent_properties_dictionary, _prop_name ) ) {
		if( e[_prop_name] !== localDict[_prop_name] ) {
			try {
				delete e[_prop_name];
				_Object_defineProperty( e, _prop_name, { writable: true, "value": localDict[_prop_name] } );
			}
			catch(e) {
				//Some properties is read-only
			}
			
		}
	}
	
	return e;
}
 
//export
global.crossBrowser_initKeyboardEvent = crossBrowser_initKeyboardEvent;
 
})(window);


$(window).ready(function () { 


    (function (window) {
        var $ = window.$;
        var document = window.document;
        var body = document.body;

        function resolve(name) {
            if (/^\#/.test(name)) {
                return document.getElementById(name.substr(1));
            }

            var e = window;

            if (/^window/i.test(name)) {
                name = name.substr(7);
                e = window;
            }
            if (/^body/i.test(name)) {
                name = name.substr(5);
                e = body;
            }

            var tokens = name.split('.');
            for (var i = 0; i < tokens.length; i++) {
                e = $(e).children().get(tokens[i]);
            }
            return e;
        }

        function path(e,r) {

            if (!r && e.id) {
                return "#" + e.id;
            }
        
            if (e === document.body) {
                return "body";
            }

            var pe = e.previousElementSibling;

            var n = 0;
            while (pe) {
                pe = pe.previousElementSibling;
                n++;
            }
        
            return ( e.parentElement ? path(e.parentElement,true) : "window") + "." + n;
        }

        var dispatchTextEvent = function (target, type, data) {
            var t = document.createEvent("TextEvent");
            t.initTextEvent("textInput", true, true, document.defaultView, data);
            target.dispatchEvent(t);
        };

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

        var dispatchKeyboardEvent = function (target, type, item) {
            var oEvent = target.ownerDocument.createEvent('KeyboardEvent');
            var options = item || {};


            //Set your default options to the right of ||
            var opts = {
                type: type,
                canBubble: options.canBubble || true,
                cancelable: options.cancelable || true,
                view: options.view || target.ownerDocument.defaultView,
                key: (options.key || options.which) || 0,
                location: options.location || 0, //The coordinates within the entire page
                modifierList: getModifiers(options) || "",
                repeat: options.repeat || 0, //The coordinates within the viewport
                locale: options.locale || null,
            };

            // Chromium Hack
            Object.defineProperty(oEvent, 'keyCode', {
                get: function () {
                    return this.keyIdentifier;
                }
            });
            Object.defineProperty(oEvent, 'which', {
                get: function () {
                    return this.keyIdentifier;
                }
            });

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
        };

        var dispatchMouseEvent = function (target, type, o) {

            var event = target.ownerDocument.createEvent('MouseEvents'),
                options = o || {};

            //Set your default options to the right of ||
            var opts = {
                type: type || 'click',
                canBubble: options.canBubble || true,
                cancelable: options.cancelable || true,
                view: options.view || target.ownerDocument.defaultView,
                detail: options.detail || 1,
                screenX: options.screenX || 0, //The coordinates within the entire page
                screenY: options.screenY || 0,
                clientX: options.clientX || 0, //The coordinates within the viewport
                clientY: options.clientY || 0,
                ctrlKey: options.ctrlKey || false,
                altKey: options.altKey || false,
                shiftKey: options.shiftKey || false,
                metaKey: options.metaKey || false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
                button: options.button || 0, //0 = left, 1 = middle, 2 = right
                relatedTarget: options.relatedTarget || null,
            };

            //Pass in the options
            event.initMouseEvent(
                opts.type,
                opts.canBubble,
                opts.cancelable,
                opts.view,
                opts.detail,
                opts.screenX,
                opts.screenY,
                opts.clientX,
                opts.clientY,
                opts.ctrlKey,
                opts.altKey,
                opts.shiftKey,
                opts.metaKey,
                opts.button,
                opts.relatedTarget
            );

            //Fire the event
            target.dispatchEvent(event);
        };

        var defaultActions = {
            alert: function () {
                throw new Error("Unexpected alert !!!");
            },
            type: function (r, e, item) {
                var a = item.actions;
                var s = r.steps;
                for (var i = a.length-1; i >=0; i--) {
                    var ai = a[i];
                    ai.path = item.path;
                    s.unshift(ai);
                }
            },
            drag: function (r, e, item) {
                var a = item.points;
                var s = r.steps;
                for (var i = 0; i < a.length; i+=2) {
                    var x = a[i];
                    var y = a[i + 1];
                    s.unshift({
                        clientX: x,
                        clientY: y,
                        path: item.path,
                        action: i===0 ? "mousedown" :( i===a.length-2 ? "mouseup": "mousemove")
                    });
                }
            },
            keydown: function (r, e, item) {
                dispatchKeyboardEvent(e, "keydown", item);
            },
            keyup: function(r,e,item){
                dispatchKeyboardEvent(e, "keyup", item);
            },
            keypress: function (r, e, item) {
                dispatchKeyboardEvent(e, "keypress", item);
            },
            textInput: function (r, e, item) {
                dispatchTextEvent(e, "textInput", item.data);
            },
            mouseup: function (r, e, item) {
                dispatchMouseEvent(e, 'mouseup',  item);
            },
            mousemove: function (r, e, item) {
                dispatchMouseEvent(e, 'mouseover', item);
            },
            mousedown: function (r, e, item) {
                dispatchMouseEvent(e, 'mousedown', item);
            },
            click: function (r, e, item) {
                dispatchMouseEvent(e, 'click', item);
            },
            verifyText: function (r, e, item) {
                var et = $(e).text();
                if (et !== item.text) {
                    return "Expected " + item.text + " found " + et + " at " + item.path;
                }
            }
        };



        var recorder = function (options) {

            if (options && options.events) {
                this.fireEvent = options.events;
            } else {
                this.fireEvent = function (r) {
                    if (console) {
                        console.log(r.state + ": " + JSON.stringify(r.lastStep, undefined));
                    }
                };
            }

            this.actions = defaultActions;
            this.timeout = 100;
            this.isBusy = function () {
                return false;
            };
            this.steps = [];
            this.state = "ready";
            this.lastStep = { action: "none" };
            var windowAlert = window.alert;

            var self = this;

            window.alert = function (msg) {
                var rec = self;
                if (rec.state === "recording") {

                    // Since mouse click is not yet recorded
                    // this is the reason, we will wait for mouse click
                    // event to be finished first
                    setTimeout(function () {
                        rec.recordStep({ target: window }, {
                            action: "alert",
                            text: msg
                        });
                    }, 1);
                    return windowAlert(msg);
                }
                if (rec.state === "running") {
                    if (!rec.steps.length) {
                        console.log("Unexpected ALERT found");
                        return windowAlert();
                    }
                    var step = rec.steps.shift();
                    self.lastStep = step;
                    if (step.action !== "alert" || step.text !== msg) {
                        rec.state = "failed";
                        return;
                    }
                    console.log("Alert was simulated successfully.");
                }
            };



            this.clickHandler = function(e) {
                self.recordStep(e, {
                    action: "click",
                    clientX: e.clientX,
                    clientY: e.clientY,
                    text: $(e.target).text() || $(e.target).val()
                });
            };

            this.keyUpHandler = function (e) {
                self.recordStep(e, {
                    action: "keyup"
                });
            };

            this.keyPressHandler = function (e) {
                self.recordStep(e, {
                    action: "keypress"
                });
            };

            this.keyDownHandler = function (e) {
                self.recordStep(e, {
                    action: "keydown"
                });
            };

            this.textInputHandler = function (e) {
                self.recordStep(e.originalEvent, {
                    action: "textInput"
                });
            };

            this.mouseDownHandler = (function (s) {
                var target = null;
                var points = [];
                function moveHandler(e) {
                    points.push(e.clientX);
                    points.push(e.clientY);
                }
                function upHandler(e) {
                    if (e.clientX !== points[0] || e.clientY !== points[1]) {
                        s.recordStep(e, {
                            action: "drag",
                            points: points
                        });
                    }
                    $(window).unbind('mousemove', moveHandler);
                    $(window).unbind('mouseup', upHandler);
                }
                return function (e) {
                    target = e.target;
                    points.length = 0;
                    points.push(e.clientX);
                    points.push(e.clientY);
                    $(window).mousemove(moveHandler);
                    $(window).mouseup(upHandler);
                };
            })(this);

        };

        var keyProperties = ["which", "altKey", "shiftKey", "ctrlKey", "char", "charCode", "key", "keyCode", "data", "repeat", "locale", "location"];

        var copyKeyProperties = function (src, dest) {
            $.each(keyProperties, function (i,k) {
                var v = src[k];
                if (v) {
                    dest[k] = v;
                }
            });
            return dest;
        };

        recorder.prototype = {


            recordStep: function (evt,s) {

                var lastStep = this.lastStep;

                s.path = path(evt.target);
                var e = evt.target;

                // When action is an keyboard action, we want to combine
                // multiple keyboard events on one HtmlElement to save space and
                // emulate change event on input/textarea element
                if (/keyup|keydown|keypress|textinput/i.test(s.action)) {
                    copyKeyProperties(evt, s);
                    
                    // check if last step was also a keyboard event
                    if (/keyup|keydown|keypress|textinput|type/i.test(lastStep.action)) {

                        // only if the element is same, we should combine 
                        // text type event
                        if (lastStep.path === s.path) {
                            if (!lastStep.actions) {
                                lastStep.actions = [copyKeyProperties(lastStep, { action: lastStep.action })];
                            }
                            lastStep.action = "type";
                            lastStep.actions.push(copyKeyProperties(s, { action: s.action }));
                            lastStep.value = $(e).val();
                            return;
                        }
                    }
                }



                if (/type/i.test(lastStep.action)) {
                    lastStep.value = $(resolve(lastStep.path)).val();
                    if (s.action !== lastStep.action || s.path !== lastStep.path) {
                        this.fireEvent(this);
                    }
                }

                this.steps.push(s);
                this.lastStep = s;
                if (!/type|keyup|keydown|keypress|textinput/i.test(s.action)) {
                    this.fireEvent(this);
                }
            },


            start: function () {
                $(window).click(this.clickHandler);
                $(window).keyup(this.keyUpHandler);
                $(window).keydown(this.keyDownHandler);
                $(window).keydown(this.keyPressHandler);
                $(window).mousedown(this.mouseDownHandler);
                $(window).bind("textInput", this.textInputHandler);
                this.state = "recording";
                this.fireEvent(this);
            },

            stop: function () {
                $(window).unbind("click", this.clickHandler);
                $(window).unbind("keyup", this.keyUpHandler);
                $(window).unbind("keypress", this.keyPressHandler);
                $(window).unbind("keydown", this.keyDownHandler);
                $(window).unbind("mousedown", this.mouseDownHandler);
                $(window).unbind("textInput", this.textInputHandler);
                this.state = "ready";
                this.fireEvent(this);
            },


            popStep: function () {
                var steps = this.steps;
                var actions = this.actions;
                if (this.isBusy()) {
                    this.run();
                    return;
                }
                if (!steps.length) {
                    this.state = "success";
                    this.fireEvent(this);
                    return;
                }
                var s = steps.shift();
                this.lastStep = s;
                var f = actions[s.action];
                if (f) {
                    var e = resolve(s.path);
                    var error = f(this, e, s);
                    if (error) {
                        // error...
                        this.state = "error";
                        this.fireEvent(this);
                        return;
                    }
                }
                var self = this;
                setTimeout(function () { self.popStep(); }, this.timeout);
            },

            run: function (sjs) {
                if (sjs) {
                    this.steps = sjs;
                }
                var self = this;
                this.state = "running";
                setTimeout(function () { self.popStep();}, this.timeout);
            }
        };

        window.AtomRecorder = new recorder();

    })(window);

});