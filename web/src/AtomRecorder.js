/// <reference path="../Scripts/jquery-1.9.0.js" />
/// <reference path="../Scripts/jquery-1.9.0.intellisense.js" />

$(window).ready(function () { 

    window.AtomRecorder = (function (window) {
        var $ = window.$;
        var document = window.document;

        var steps = [];
        var state = "ready";

        var lastStep = { action: "none" };

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
                e = document.body;
            }

            var tokens = name.split('.');
            for (var i = 0; i < tokens.length; i++) {
                e = $(e).children().get(tokens[i]);
            }
            return e;
        };

        function path(e,r) {

            if (!r && e.id) {
                return "#" + e.id;
            }
        
            if (e == document.body) {
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

        function recordStep(evt,s) {

            s.path = path(evt.target);
            var e = evt.target;
            if (/input|textarea/i.test(e.nodeName)) {
                if (/keyup|keydown/i.test(s.action)) {
                    // check last..
                    if (/keyup|keydown|type/i.test(lastStep.action)) {
                        if (lastStep.path == s.path) {
                            lastStep.action = "type";
                            lastStep.value = $(e).val();
                            return;
                        }
                    }
                }
            }

            if (/type/i.test(lastStep.action)) {
                lastStep.value = $(resolve(lastStep.path)).val();
            }

            if (console) {
                console.log( JSON.stringify(s,undefined,2));
            }
            steps.push(s);
            lastStep = s;
        };

        function clickHandler(e) {
            recordStep(e,{
                action: "click",
                pageX: e.pageX,
                pageY: e.pageY,
                text: $(e.target).text()
            });
        };

        function keyUpHandler(e) {
            recordStep(e,{
                action: "keyup"
            });
        };

        function keyDownHandler(e) {
            recordStep(e,{
                action: "keydown"
            });
        };

        var timeout = 100;

        var actions = {
            type: function (e, item) {
                if (/submit/i.test(e.type)) {
                    $(e).click();
                } else {
                    $(e).val(item.value);
                }
            },
            click: function (e, item) {
                $(e).click();
            },
            verifyText: function (e, item) {
                var et = $(e).text();
                if (et != item.text) {
                    return "Expected " + item.text + " found " + et + " at " + item.path;
                }
            }
        };

        var isBusy = false;

        function popStep() {
            if (isBusy) {
                run();
                return;
            }
            if (!steps.length)
                return;
            var s = steps.shift();
            var f = actions[s.action];
            if (f) {
                var e = resolve(s.path);
                var error = f(e, s);
                if (error) {
                    // error...
                    console.log(error);
                }
            }
            setTimeout(popStep, timeout);
        };

        function run(sjs) {
            if (sjs) {
                steps = sjs;
            }
            setTimeout(popStep, timeout);
        };

        function registerBusy(f) {
            isBusy = f();
        }

        var button = document.createElement("BUTTON");
        button.style = "position:fixed;right:5px;bottom:5px;background:green;color:white;";
        $(button).css("position", "absolute");
        $(button).css("right", "5px");
        $(button).css("bottom", "5px");
        $(button).css("background", "green");
        $(button).css("color", "white");
        $(button).text("Record");
        document.body.appendChild(button);

        function start() {
            $(window).click(clickHandler);
            $(window).keyup(keyUpHandler);
            $(window).keydown(keyDownHandler);
            state = "recording";
            $(button).text("Stop");
            $(button).css("background", "red");
        }

        function stop() {
            $(window).unbind("click", clickHandler);
            $(window).unbind("keyup", keyUpHandler);
            $(window).unbind("keydown", keyDownHandler);
            state = "ready";
            $(button).text("Record");
            $(button).css("background", "green");
        }

        $(button).click(function () {
            if (state == "recording") {
                stop();
            } else {
                start();
            }
        });

        return {
            steps: steps,
            start: start,
            stop: stop,
            run: run,
            registerBusy: registerBusy,
        };
    })(window);

    window.$a = window.AtomRecorder;

});