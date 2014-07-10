/// <reference path="../Scripts/jquery-1.9.0.js" />
/// <reference path="../Scripts/jquery-1.9.0.intellisense.js" />

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

        var defaultActions = {
            type: function (r, e, item) {
                var a = item.actions;
                var s = r.steps;
                for (var i = 0; i < a.length; i++) {
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
                        pageX: x,
                        pageY: y,
                        path: item.path,
                        action: i===0 ? "mousedown" :( i===a.length-2 ? "mouseup": "mousemove")
                    });
                }
            },
            keydown: function (r, e, item) {
                $(e).trigger('keydown', item);
            },
            keyup: function(r,e,item){
                $(e).trigger('keyup', item);
            },
            keypress: function (r, e, item) {
                $(e).trigger('keypress', item);
            },
            mouseup: function (r, e, item) {
                $(body).trigger('mouseup', item);
            },
            mousemove: function (r, e, item) {
                $(body).trigger('mousemove', item);
            },
            mousedown: function (r, e, item) {
                $(body).trigger('mousedown', item);
            },
            click: function (r, e) {
                $(e).click();
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
                    rec.recordStep({ target: window }, {
                        action: "alert",
                        text: msg
                    });
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
                    pageX: e.pageX,
                    pageY: e.pageY,
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

            this.mouseDownHandler = (function (s) {
                var target = null;
                var points = [];
                function moveHandler(e) {
                    points.push(e.pageX);
                    points.push(e.pageY);
                }
                function upHandler(e) {
                    if (e.pageX !== points[0] || e.pageY !== points[1]) {
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
                    points.push(e.pageX);
                    points.push(e.pageY);
                    $(window).mousemove(moveHandler);
                    $(window).mouseup(upHandler);
                };
            })(this);

        };

        var keyProperties = ["which","altKey","shiftKey","ctrlKey","char","charCode","key","keyCode"];

        recorder.prototype = {


            recordStep: function (evt,s) {

                var lastStep = this.lastStep;

                s.path = path(evt.target);
                var e = evt.target;
                if (/input|textarea/i.test(e.nodeName)) {
                    if (/keyup|keydown|keypress/i.test(s.action)) {
                        // check last..
                        if (/keyup|keydown|keypress|type/i.test(lastStep.action)) {
                            if (lastStep.path === s.path) {
                                lastStep.action = "type";
                                lastStep.actions = lastStep.actions || [];
                                var se = { action: s.action };
                                for (var i = 0; i < keyProperties.length; i++) {
                                    var pn = keyProperties[i];
                                    var pv = evt[pn];
                                    if (pv) {
                                        se[pn] = pv;
                                    }
                                }
                                lastStep.actions.push(se);
                                lastStep.value = $(e).val();
                                return;
                            }
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
                if (!/type|keyup|keydown|keypress/i.test(s.action)) {
                    this.fireEvent(this);
                }
            },


            start: function () {
                $(window).click(this.clickHandler);
                $(window).keyup(this.keyUpHandler);
                $(window).keydown(this.keyDownHandler);
                $(window).keydown(this.keyPressHandler);
                $(window).mousedown(this.mouseDownHandler);
                this.state = "recording";
                this.fireEvent(this);
            },

            stop: function () {
                $(window).unbind("click", this.clickHandler);
                $(window).unbind("keyup", this.keyUpHandler);
                $(window).unbind("keypress", this.keyPressHandler);
                $(window).unbind("keydown", this.keyDownHandler);
                $(window).unbind("mousedown", this.mouseDownHandler);
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
                setTimeout(function () { self.popStep();}, this.timeout);
            }
        };

        window.AtomRecorder = new recorder();

    })(window);

});