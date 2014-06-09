/// <reference path="../Scripts/jquery-1.9.0.js" />
/// <reference path="../Scripts/jquery-1.9.0.intellisense.js" />

var AtomRecorder = (function (window) {
    var $ = window.$;
    var document = window.document;

    var steps = [];

    var lastStep = { type: "none" };

    var path = function (e) {
        
        if (e == document.body) {
            return "body";
        }

        var pe = e.previousElementSibling;

        var n = 0;
        while (pe) {
            pe = pe.previousElementSibling;
            n++;
        }
        
        return ( e.parentElement ? path(e.parentElement) : "window") + "." + n;
    }

    var recordStep = function (s) {
        if (console) {
            console.log( JSON.stringify(s,undefined,2));
        }
        steps.push(s);
        lastStep = s;
    };

    var clickHandler = function (e) {
        recordStep({
            type: "click",
            pageX: e.pageX,
            pageY: e.pageY,
            path: path(e.target)
        });
    };

    var keyUpHandler = function (e) {
        if (/type/i.test(lastStep.type)) {
            lastStep.value = $(e.target).val();
            if (console) {
                console.log(lastStep);
            }
            return;
        }
        recordStep({
            type: "keyup",
            path: path(e.target)
        });
    };

    var keyDownHandler = function (e) {
        if (/type/i.test(lastStep.type)) {
            return;
        }
        if (/input|textarea/i.test(e.target.nodeName)) {
            recordStep({ type:"type", path: path(e.target) });
            return;
        }
        recordStep({
            type: "keydown",
            path: path(e.target)
        });
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
        }
    };
})(window);