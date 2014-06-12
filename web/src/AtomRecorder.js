/// <reference path="../Scripts/jquery-1.9.0.js" />
/// <reference path="../Scripts/jquery-1.9.0.intellisense.js" />

var AtomRecorder = (function (window) {
    var $ = window.$;
    var document = window.document;

    var steps = [];

    var lastStep = { action: "none" };

    var resolve = function (name) {
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

    var path = function (e,r) {

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

    var recordStep = function (evt,s) {

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

    var clickHandler = function (e) {
        recordStep(e,{
            action: "click",
            pageX: e.pageX,
            pageY: e.pageY,
            text: $(e.target).text()
        });
    };

    var keyUpHandler = function (e) {
        recordStep(e,{
            action: "keyup"
        });
    };

    var keyDownHandler = function (e) {
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
        }
    };

    var popStep = function () {
        if (!steps.length)
            return;
        var s = steps.shift();
        var f = actions[s.action];
        if (f) {
            var e = resolve(s.path);
            f(e,s);
        }
        setTimeout(popStep, timeout);
    };

    var run = function (sjs) {
        steps = sjs;
        setTimeout(popStep, timeout);
    };

    return {
        steps: steps,
        start: function () {
            $(window).click(clickHandler);
            $(window).keyup(keyUpHandler);
            $(window).keydown(keyDownHandler);
        },
        stop: function () {
            $(window).unbind("click", clickHandler);
            $(window).unbind("keyup", keyUpHandler);
            $(window).unbind("keydown", keyDownHandler);
        },
        run: run
    };
})(window);

var $a = AtomRecorder;