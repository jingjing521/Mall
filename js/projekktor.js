/*!
 * Projekktor II - HTML5 Media Player, Projekktor Core Version: V1.1.02 r114
 * http://www.projekktor.com
 * Copyright 2010, 2011, Sascha Kluger, Spinning Airwhale Media, http://www.spinningairwhale.com
 * GNU General Public License
 * http://www.projekktor.com/license/
 */
jQuery(function($) {
    if ($.browser.msie) { (function() {
            if (!
            /*@cc_on!@*/
            0) {
                return
            }
            var e = "audio,video,source".split(",");
            for (var i = 0; i < e.length; i++) {
                document.createElement(e[i])
            }
        })();
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(obj, start) {
                for (var i = (start || 0), j = this.length; i < j; i++) {
                    if (this[i] == obj) {
                        return i
                    }
                }
                return - 1
            }
        }
    }
    var projekktors = [];
    function Iterator(arr) {
        this.length = arr.length;
        this.each = function(fn) {
            $.each(arr, fn)
        };
        this.size = function() {
            return arr.length
        }
    }
    if ($.prop == undefined || $().jquery < "1.6") {
        $.fn.prop = function(arga, argb) {
            return $(this).attr(arga, argb)
        }
    }
    projekktor = $p = function() {
        var arg = arguments[0],
        instances = [],
        plugins = [];
        if (!arguments.length) {
            return projekktors[0] || null
        }
        if (typeof arg == "number") {
            return projekktors[arg]
        }
        if (typeof arg == "string") {
            if (arg == "*") {
                return new Iterator(projekktors)
            }
            for (var i = 0; i < projekktors.length; i++) {
                try {
                    if (projekktors[i].getId() == arg.id) {
                        instances.push(projekktors[i]);
                        continue
                    }
                } catch(e) {}
                try {
                    for (var j = 0; j < $(arg).length; j++) {
                        if (projekktors[i].env.playerDom.get(0) == $(arg).get(j)) {
                            instances.push(projekktors[i]);
                            continue
                        }
                    }
                } catch(e) {}
                try {
                    if (projekktors[i].getParent() == arg) {
                        instances.push(projekktors[i]);
                        continue
                    }
                } catch(e) {}
                try {
                    if (projekktors[i].getId() == arg) {
                        instances.push(projekktors[i]);
                        continue
                    }
                } catch(e) {}
            }
            if (instances.length > 0) {
                return (instances.length == 1) ? instances[0] : new Iterator(instances)
            }
        }
        if (instances.length == 0) {
            var cfg = arguments[1] || {};
            var callback = arguments[2] || {};
            if (typeof arg == "string") {
                var count = 0,
                playerA;
                $.each($(arg),
                function() {
                    playerA = new PPlayer($(this), cfg, callback);
                    projekktors.push(playerA);
                    count++
                });
                return (count > 1) ? new Iterator(projekktors) : playerA
            } else {
                if (arg) {
                    projekktors.push(new PPlayer(arg, cfg, callback));
                    return new Iterator(projekktors)
                }
            }
        }
        return null;
        function PPlayer(srcNode, cfg, onReady) {
            this.config = new projekktorConfig("1.1.02");
            this._persCfg = ["playbackQuality", "enableNativePlayback", "enableFlashFallback", "volume"];
            this.env = {
                muted: false,
                inFullscreen: false,
                playerDom: null,
                mediaContainer: null,
                agent: "standard",
                mouseIsOver: false,
                loading: false,
                autoSize: false,
                className: "",
                onReady: onReady
            };
            this.media = [];
            this._plugins = [];
            this._queue = [];
            this._cuePoints = {};
            this.listeners = [];
            this.playerModel = {};
            this._isReady = false;
            this._currentItem = null;
            this._playlistServer = "";
            this._id = "";
            this._reelUpdate = function(obj) {
                this.env.loading = true;
                var ref = this,
                data = obj || [{}];
                this.media = [];
                try {
                    for (var props in data.config) {
                        if (typeof data.config[props].indexOf("objectfunction") > -1) {
                            continue
                        }
                        this.config[props] = eval(data.config[props])
                    }
                    if (data.config != null) {
                        $p.utils.log("Updated config var: " + props + " to " + this.config[props]);
                        this._promote("configModified");
                        delete(data.config)
                    }
                } catch(e) {}
                var files = data.playlist || data;
                for (var item in files) {
                    if (typeof files[item] == "function" || typeof files[item] == null) {
                        continue
                    }
                    if (files[item]) {
                        var itemIdx = this._addItem(this._prepareMedia({
                            file: files[item],
                            config: files[item].config || {},
                            errorCode: files[item].errorCode
                        }))
                    }
                    $.each(files[item].cuepoints || [],
                    function() {
                        this.item = itemIdx;
                        ref.setCuePoint(this)
                    })
                }
                if (itemIdx == null) {
                    this._addItem(this._prepareMedia({
                        file: "",
                        config: {},
                        errorCode: 97
                    }))
                }
                this.env.loading = false;
                this._promote("scheduled", this.getItemCount());
                this._syncPlugins(function() {
                    ref.setActiveItem(0)
                })
            };
            this._addItem = function(data, idx, replace) {
                var resultIdx = 0;
                if (this.media.length === 1 && this.media[0].mediaModel == "NA") {
                    this._detachplayerModel();
                    this.media = []
                }
                if (idx === undefined || idx < 0 || idx > this.media.length - 1) {
                    this.media.push(data);
                    resultIdx = this.media.length - 1
                } else {
                    this.media.splice(idx, (replace === true) ? 1 : 0, data);
                    resultIdx = idx
                }
                if (this.env.loading === false) {
                    this._promote("scheduleModified", this.getItemCount())
                }
                return resultIdx
            };
            this._removeItem = function(idx) {
                var resultIdx = 0;
                if (this.media.length === 1) {
                    if (this.media[0].mediaModel == "NA") {
                        return 0
                    } else {
                        this.media[0] = this._prepareMedia({
                            file: ""
                        });
                        return 0
                    }
                }
                if (idx === undefined || idx < 0 || idx > this.media.length - 1) {
                    this.media.pop();
                    resultIdx = this.media.length
                } else {
                    this.media.splice(idx, 1);
                    resultIdx = idx
                }
                if (this.env.loading === false) {
                    this._promote("scheduleModified", this.getItemCount())
                }
                return resultIdx
            };
            this._prepareMedia = function(data) {
                var ref = this,
                mediaFiles = [],
                qualities = [],
                extTypes = {},
                typesModels = {},
                priority = [],
                modelSets = [];
                result = {},
                extRegEx = [];
                for (var i in $p.mmap) {
                    platforms = (typeof $p.mmap[i]["platform"] == "object") ? $p.mmap[i]["platform"] : [$p.mmap[i]["platform"]];
                    $.each(platforms,
                    function(_na, platform) {
                        if (!ref._canPlay($p.mmap[i].type, platform, data.config.streamType || "http")) {
                            return true
                        }
                        $p.mmap[i].level = ref.config._platforms.indexOf(platform);
                        $p.mmap[i].level = ($p.mmap[i].level < 0) ? 100 : $p.mmap[i].level;
                        extRegEx.push("." + $p.mmap[i].ext);
                        if (!extTypes[$p.mmap[i].ext]) {
                            extTypes[$p.mmap[i].ext] = new Array()
                        }
                        extTypes[$p.mmap[i].ext].push($p.mmap[i]);
                        if (!typesModels[$p.mmap[i].type]) {
                            typesModels[$p.mmap[i].type] = new Array()
                        }
                        typesModels[$p.mmap[i].type].push($p.mmap[i])
                    })
                }
                extRegEx = "^.*.(" + extRegEx.join("|") + ")$";
                if (typeof data.file == "string") {
                    data.file = [{
                        src: data.file
                    }];
                    if (typeof data.type == "string") {
                        data.file = [{
                            src: data.file,
                            type: data.type
                        }]
                    }
                }
                if ($.isEmptyObject(data) || data.file === false || data.file === null) {
                    data.file = [{
                        src: null
                    }]
                }
                for (var index in data.file) {
                    if (index == "config") {
                        continue
                    }
                    if (typeof data.file[index] == "string") {
                        data.file[index] = {
                            src: data.file[index]
                        }
                    }
                    if (data.file[index].src == null) {
                        continue
                    }
                    if (data.file[index].type != null && data.file[index].type !== "") {
                        try {
                            var codecMatch = data.file[index].type.split(" ").join("").split(/[\;]codecs=.([a-zA-Z0-9\,]*)[\'|\"]/i);
                            if (codecMatch[1] !== undefined) {
                                data.file[index].codec = codecMatch[1];
                                data.file[index].type = codecMatch[0]
                            }
                        } catch(e) {}
                    } else {
                        data.file[index].type = this._getTypeFromFileExtension(data.file[index].src)
                    }
                    if (typesModels[data.file[index].type]) {
                        typesModels[data.file[index].type].sort(function(a, b) {
                            return a.level - b.level
                        });
                        modelSets.push(typesModels[data.file[index].type][0])
                    }
                }
                if (modelSets.length == 0) {
                    modelSets = typesModels["none/none"]
                } else {
                    modelSets.sort(function(a, b) {
                        return a.level - b.level
                    });
                    var bestMatch = modelSets[0].level;
                    modelSets = $.grep(modelSets,
                    function(value) {
                        return value.level == bestMatch
                    })
                }
                var types = [];
                $.each(modelSets || [],
                function() {
                    types.push(this.type)
                });
                var modelSet = (modelSets && modelSets.length > 0) ? modelSets[0] : {
                    type: "none/none",
                    model: "NA",
                    errorCode: 11
                };
                types = $p.utils.unique(types);
                for (var index in data.file) {
                    if ($.inArray(data.file[index].type, types) < 0 && modelSet.type != "none/none") {
                        continue
                    }
                    data.file[index].src = (!$.isEmptyObject(data.config) && data.config.streamType == "http") ? $p.utils.toAbsoluteURL(data.file[index].src) : data.file[index].src;
                    if ((data.file[index].quality || null) == null) {
                        data.file[index].quality = "default"
                    }
                    qualities.push(data.file[index].quality);
                    mediaFiles.push(data.file[index])
                }
                var _setQual = [];
                $.each(this.getConfig("playbackQualities"),
                function() {
                    _setQual.push(this.key || "default")
                });
                result = {
                    ID: data.config.id || $p.utils.randomId(8),
                    file: mediaFiles,
                    qualities: $p.utils.intersect($p.utils.unique(_setQual), $p.utils.unique(qualities)),
                    mediaModel: modelSet.model || "NA",
                    errorCode: modelSet.errorCode || data.errorCode || 7,
                    config: data.config || {}
                };
                return result
            };
            this._modelUpdateListener = function(type, value) {
                var ref = this;
                if (!this.playerModel.init) {
                    return
                }
                if (type != "time" && type != "progress") {
                    $p.utils.log("Update: '" + type, this.playerModel.getSrc(), this.playerModel.getModelName(), value)
                }
                switch (type) {
                case "state":
                    this._promote("state", value);
                    switch (value) {
                    case "IDLE":
                        break;
                    case "AWAKENING":
                        var modelRef = this.playerModel;
                        this._syncPlugins(function() {
                            if (modelRef.getState("AWAKENING")) {
                                modelRef.displayItem(true)
                            }
                        });
                        break;
                    case "BUFFERING":
                    case "PLAYING":
                        break;
                    case "ERROR":
                        this._addGUIListeners();
                        this._promote("error", {});
                        break;
                    case "STOPPED":
                        this._promote("stopped", {});
                        break;
                    case "PAUSED":
                        if (this.getConfig("disablePause") === true) {
                            this.playerModel.applyCommand("play", 0)
                        }
                        break;
                    case "COMPLETED":
                        if (this._currentItem + 1 >= this.media.length && !this.getConfig("loop")) {
                            this.setFullscreen(false);
                            this._promote("done", {})
                        }
                        this.setActiveItem("next");
                        break
                    }
                    break;
                case "buffer":
                    this._promote("buffer", value);
                    break;
                case "modelReady":
                    this._promote("item", ref._currentItem);
                    break;
                case "displayReady":
                    this._promote("displayReady", true);
                    var modelRef = this.playerModel;
                    this._syncPlugins(function() {
                        ref._promote("ready");
                        ref._addGUIListeners();
                        if (!modelRef.getState("IDLE")) {
                            modelRef.start()
                        }
                    });
                    break;
                case "qualityChange":
                    this.setConfig({
                        playbackQuality:
                        value
                    });
                    this._promote("qualityChange", value);
                    break;
                case "FFreinit":
                    break;
                case "seek":
                    this._promote("seek", value);
                    break;
                case "volume":
                    this.setConfig({
                        volume:
                        value
                    });
                    this._promote("volume", value);
                    if (value <= 0) {
                        this.env.muted = true;
                        this._promote("mute", value)
                    } else {
                        if (this.env.muted == true) {
                            this.env.muted = false;
                            this._promote("unmute", value)
                        }
                    }
                    break;
                case "playlist":
                    this.setFile(value.file, value.type);
                    break;
                case "config":
                    this.setConfig(value);
                    break;
                case "scaled":
                    if (this.env.autoSize === true) {
                        this.env.playerDom.css({
                            height: value.realHeight + "px",
                            width: value.realWidth + "px"
                        });
                        this._promote("resize", value);
                        this.env.autoSize = false;
                        break
                    }
                    this._promote("scaled", value);
                    break;
                default:
                    this._promote(type, value);
                    break
                }
            };
            this._syncPlugins = function(callback) {
                var ref = this;
                this.env.loading = true; (function() {
                    try {
                        if (ref._plugins.length > 0) {
                            for (var i = 0; i < ref._plugins.length; i++) {
                                if (!ref._plugins[i].isReady()) {
                                    setTimeout(arguments.callee, 50);
                                    return
                                }
                            }
                        }
                        ref.env.loading = false;
                        ref._promote("pluginsReady", {});
                        try {
                            callback()
                        } catch(e) {}
                    } catch(e) {}
                })()
            };
            this._MD = function(event) {
                projekktor("#" + event.currentTarget.id.replace("_media", ""))._displayMousedownListener(event)
            };
            this._addGUIListeners = function() {
                var ref = this;
                this._removeGUIListeners();
                if (this.getDC().get(0).addEventListener) {
                    this.getDC().get(0).addEventListener("mousedown", this._MD, true)
                } else {
                    this.getDC().mousedown(function(event) {
                        ref._displayMousedownListener(event)
                    })
                }
                this.getDC().mousemove(function(event) {
                    ref._displayMousemoveListener(event)
                }).mouseenter(function(event) {
                    ref._displayMouseEnterListener(event)
                }).mouseleave(function(event) {
                    ref._displayMouseLeaveListener(event)
                });
                $(window).bind("resize.projekktor" + this.getId(),
                function() {
                    ref.playerModel.applyCommand("resize")
                }).bind("touchstart",
                function() {
                    ref._windowTouchListener(event)
                });
                if (this.config.enableKeyboard === true) {
                    $(document.documentElement).unbind("keydown.pp" + this._id);
                    $(document.documentElement).bind("keydown.pp" + this._id,
                    function(evt) {
                        ref._keyListener(evt)
                    })
                }
            };
            this._removeGUIListeners = function() {
                $("#" + this.getId()).unbind();
                this.getDC().unbind();
                if (this.getDC().get(0).removeEventListener) {
                    this.getDC().get(0).removeEventListener("mousedown", this._MD, true)
                } else {
                    this.getDC().get(0).detachEvent("onmousedown", this._MD)
                }
                $(window).unbind("resize.projekktor" + this.getId())
            };
            this._registerPlugins = function() {
                var plugins = $.merge($.merge([], this.config._plugins), this.config._addplugins);
                if (this._plugins.length > 0) {
                    return
                }
                if (plugins.length == 0) {
                    return
                }
                for (var i = 0; i < plugins.length; i++) {
                    var pluginName = "projekktor" + plugins[i].charAt(0).toUpperCase() + plugins[i].slice(1);
                    try {
                        typeof eval(pluginName)
                    } catch(e) {
                        continue
                    }
                    var pluginObj = $.extend(true, {},
                    new projekktorPluginInterface(), eval(pluginName).prototype);
                    pluginObj.name = plugins[i].toLowerCase();
                    pluginObj.pp = this;
                    pluginObj.playerDom = this.env.playerDom;
                    pluginObj._init(this.config["plugin_" + plugins[i].toLowerCase()] || {});
                    this._plugins.push(pluginObj)
                }
            };
            this.removePlugin = function(rmvPl) {
                if (this._plugins.length == 0) {
                    return
                }
                var pluginsToRemove = rmvPl || $.merge($.merge([], this.config._plugins), this.config._addplugins),
                pluginsRegistered = this._plugins.length;
                for (var j = 0; j < pluginsToRemove.length; j++) {
                    for (var k = 0; k < pluginsRegistered; k++) {
                        if (this._plugins[k] != undefined) {
                            if (this._plugins[k].name == pluginsToRemove[j].toLowerCase()) {
                                this._plugins[k].deconstruct();
                                this._plugins.splice(k, 1)
                            }
                        }
                    }
                }
            };
            this._promote = function(evt, value) {
                var event = evt,
                pluginData = {};
                if (typeof event == "object") {
                    if (!event._plugin) {
                        return
                    }
                    value.PLUGIN = event._plugin + "";
                    value.EVENT = event._event + "";
                    event = "pluginevent"
                }
                if (event != "time" && event != "progress" && event != "mousemove") {
                    $p.utils.log("Event: [" + event + "]", value)
                }
                if (this._plugins.length > 0) {
                    for (var i = 0; i < this._plugins.length; i++) {
                        try {
                            this._plugins[i][event + "Handler"](value, this)
                        } catch(e) {}
                        try {
                            this._plugins[i]["eventHandler"](event, value, this)
                        } catch(e) {}
                    }
                }
                if (this.listeners.length > 0) {
                    for (var i = 0; i < this.listeners.length; i++) {
                        try {
                            if (this.listeners[i]["event"] == event || this.listeners[i]["event"] == "*") {
                                this.listeners[i]["callback"](value, this)
                            }
                        } catch(e) {}
                    }
                }
            };
            this._detachplayerModel = function() {
                this._removeGUIListeners();
                try {
                    this.playerModel.destroy();
                    this._promote("detach", {})
                } catch(e) {}
            };
            this._displayMousedownListener = function(evt) {
                if (!this.env.mouseIsOver) {
                    return false
                }
                if ("TEXTAREA|INPUT".indexOf(evt.target.tagName.toUpperCase()) > -1) {
                    return false
                }
                switch (evt.which) {
                case 1:
                    this._promote("leftclick", evt);
                    return true;
                case 2:
                    this._promote("middleclick", evt);
                    return false;
                case 3:
                    if ($(evt.target).hasClass("context")) {
                        break
                    }
                    evt.stopPropagation();
                    evt.preventDefault();
                    $(document).bind("contextmenu",
                    function(evt) {
                        $(document).unbind("contextmenu");
                        return false
                    });
                    this._promote("rightclick", evt);
                    return false
                }
            };
            this._displayMousemoveListener = function(evt) {
                if ("|TEXTAREA|INPUT".indexOf("|" + evt.target.tagName.toUpperCase()) > -1) {
                    this.env.mouseIsOver = false;
                    return
                }
                if (this.env.mouseX != evt.clientX && this.env.mouseY != evt.clientY) {
                    this.env.mouseIsOver = true;
                    this._promote("mousemove", evt);
                    this.env.mouseX = evt.clientX;
                    this.env.mouseY = evt.clientY
                }
                evt.stopPropagation()
            };
            this._windowTouchListener = function(evt) {
                if (evt.touches) {
                    if (evt.touches.length > 0) {
                        if (($(document.elementFromPoint(evt.touches[0].clientX, evt.touches[0].clientY)).attr("id") || "").indexOf(this.getDC().attr("id")) == 0) {
                            if (this.env.mouseIsOver == false) {
                                this._promote("mouseenter", {})
                            }
                            this.env.mouseIsOver = true;
                            this._promote("mousemove", {});
                            evt.stopPropagation()
                        } else {
                            if (this.env.mouseIsOver) {
                                this._promote("mouseleave", {});
                                this.env.mouseIsOver = false
                            }
                        }
                    }
                }
            };
            this._displayMouseEnterListener = function(evt) {
                this._promote("mouseenter", {});
                this.env.mouseIsOver = true;
                evt.stopPropagation()
            };
            this._displayMouseLeaveListener = function(evt) {
                this._promote("mouseleave", {});
                this.env.mouseIsOver = false;
                evt.stopPropagation()
            };
            this._keyListener = function(evt) {
                if (!this.env.mouseIsOver) {
                    return
                }
                var ref = this,
                set = (this.getConfig("keys").length > 0) ? this.getConfig("keys") : [{
                    32 : function(player) {
                        player.setPlayPause()
                    },
                    27 : function(player) {
                        player.setFullscreen(false)
                    },
                    13 : function(player) {
                        player.setFullscreen(true)
                    },
                    39 : function(player) {
                        player.setPlayhead("+5")
                    },
                    37 : function(player) {
                        player.setPlayhead("-5")
                    },
                    38 : function(player) {
                        player.setVolume("+5")
                    },
                    40 : function(player) {
                        player.setVolume("-5")
                    },
                    68 : function(player) {
                        player.setDebug()
                    },
                    67 : function(player) {
                        $p.utils.log("Config Dump", this.config)
                    },
                    80 : function(player) {
                        $p.utils.log("Schedule Dump", this.media)
                    }
                }];
                evt.stopPropagation();
                evt.preventDefault();
                $p.utils.log("Keypress: " + evt.keyCode);
                this._promote("key", evt);
                $.each(set || [],
                function() {
                    try {
                        this[evt.keyCode](ref)
                    } catch(e) {}
                    try {
                        this["*"](ref)
                    } catch(e) {}
                })
            };
            this._enterFullViewport = function(forcePlayer, addClass) {
                var win = this.getIframeWindow() || $(window),
                target = this.getIframe() || this.getDC();
                if (forcePlayer) {
                    win = $(window);
                    target = this.getDC()
                }
                target.data("fsdata", {
                    scrollTop: win.scrollTop(),
                    scrollLeft: win.scrollLeft(),
                    targetStyle: target.attr("style"),
                    bodyOverflow: $(win[0].document.body).css("overflow"),
                    iframeWidth: target.attr("width") || 0,
                    iframeHeight: target.attr("height") || 0
                });
                win.scrollTop(0).scrollLeft(0);
                $(win[0].document.body).css("overflow", "hidden");
                target.css({
                    position: "absolute",
                    display: "block",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 9999,
                    margin: 0,
                    padding: 0
                });
                if (addClass !== false) {
                    this.getDC().addClass("fullscreen")
                }
                return target
            };
            this._exitFullViewport = function(forcePlayer) {
                var win = this.getIframeWindow() || $(window),
                target = this.getIframe() || this.getDC();
                if (forcePlayer) {
                    win = $(window);
                    target = this.getDC()
                }
                var fsData = target.data("fsdata") || {};
                win.scrollTop(fsData.scrollTop).scrollLeft(fsData.scrollLef);
                $(win[0].document.body).css("overflow", fsData.bodyOverflow);
                if (fsData.iframeWidth > 0 && !forcePlayer) {
                    target.attr("width", fsData.iframeWidth + "px");
                    target.attr("height", fsData.iframeHeight + "px")
                }
                target.attr("style", (fsData.targetStyle == null) ? "": fsData.targetStyle);
                this.getDC().removeClass("fullscreen");
                return (this.getIframe()) ? parent.window.document: document
            };
            this.getPlayerVer = function() {
                return this.config._version
            };
            this.getItemConfig = function(name, itemIdx) {
                return this.getConfig(name, itemIdx)
            };
            this.getConfig = function(name, itemIdx) {
                var idx = itemIdx || this._currentItem,
                result = this.config["_" + name] || this.config[name] || null;
                if ($.inArray(name, this._persCfg) > -1) {
                    if (this._cookie(name) !== null) {
                        result = this._cookie(name)
                    }
                }
                if (this.config["_" + name] == undefined) {
                    try {
                        if (this.media[idx]["config"][name] !== undefined) {
                            result = this.media[idx]["config"][name]
                        }
                    } catch(e) {}
                }
                if (name.indexOf("plugin_") > -1) {
                    try {
                        if (this.media[idx]["config"][name]) {
                            result = $.extend(true, {},
                            this.config[name], this.media[idx]["config"][name])
                        }
                    } catch(e) {}
                }
                if (result == null) {
                    return null
                }
                if (typeof result == "object" && result.length === null) {
                    result = $.extend(true, {},
                    result || {})
                } else {
                    if (typeof result == "object") {
                        result = $.extend(true, [], result || [])
                    }
                }
                if (typeof result == "string") {
                    switch (result) {
                    case "true":
                        result = true;
                        break;
                    case "false":
                        result = false;
                        break;
                    case "NaN":
                    case "undefined":
                    case "null":
                        result = null;
                        break
                    }
                }
                return result
            };
            this.getDC = function() {
                return this.env.playerDom
            };
            this.getState = function(isThis) {
                var result = null;
                try {
                    result = this.playerModel.getState()
                } catch(e) {
                    result = "IDLE"
                }
                if (isThis != null) {
                    return (result == isThis.toUpperCase())
                }
                return result
            };
            this.getLoadProgress = function() {
                try {
                    return this.playerModel.getLoadProgress()
                } catch(e) {
                    return 0
                }
            };
            this.getKbPerSec = function() {
                try {
                    return this.playerModel.getKbPerSec()
                } catch(e) {
                    return 0
                }
            };
            this.getItemCount = function() {
                return (this.media.length == 1 && this.media[0].mediaModel == "na") ? 0 : this.media.length
            };
            this.getItemId = function(idx) {
                return this.media[idx || this._currentItem].ID || null
            };
            this.getItemIdx = function() {
                return this._currentItem
            };
            this.getPlaylist = function() {
                return this.getItem("*")
            };
            this.getItem = function() {
                if (this.media.length == 1 && this.media[0].mediaModel == "na") {
                    return []
                }
                switch (arguments[0] || "current") {
                case "next":
                    return $.extend(true, [], this.media[this._currentItem + 1]);
                case "prev":
                    return $.extend(true, [], this.media[this._currentItem - 1]);
                case "current":
                    return $.extend(true, [], this.media[this._currentItem]);
                case "*":
                    return $.extend(true, [], this.media);
                default:
                    return $.extend(true, [], this.media[arguments[0] || this._currentItem])
                }
            };
            this.getVolume = function() {
                return (this.getConfig("fixedVolume") === true) ? this.config.volume: this.getConfig("volume")
            };
            this.getTrackId = function() {
                if (this.getConfig("trackId")) {
                    return this.config.trackId
                }
                if (this._playlistServer != null) {
                    return "pl" + this._currentItem
                }
                return null
            };
            this.getLoadPlaybackProgress = function() {
                try {
                    return this.playerModel.getLoadPlaybackProgress()
                } catch(e) {
                    return 0
                }
            };
            this.getDuration = function() {
                try {
                    return this.playerModel.getDuration()
                } catch(e) {
                    return 0
                }
            };
            this.getPosition = function() {
                try {
                    return this.playerModel.getPosition() || 0
                } catch(e) {
                    return 0
                }
            };
            this.getMaxPosition = function() {
                try {
                    return this.playerModel.getMaxPosition() || 0
                } catch(e) {
                    return 0
                }
            };
            this.getTimeLeft = function() {
                try {
                    return this.playerModel.getDuration() - this.playerModel.getPosition()
                } catch(e) {
                    return this.media[this._currentItem].duration
                }
            };
            this.getInFullscreen = function() {
                return this.getNativeFullscreenSupport().isFullScreen()
            };
            this.getMediaContainer = function() {
                if (this.env.mediaContainer == null) {
                    this.env.mediaContainer = $("#" + this.getMediaId())
                }
                if (this.env.mediaContainer.length == 0) {
                    if (this.env.playerDom.find("." + this.getNS() + "display").length > 0) {
                        this.env.mediaContainer = $(document.createElement("div")).attr({
                            id: this.getId() + "_media"
                        }).css({
                            overflow: "hidden",
                            height: "100%",
                            width: "100%",
                            top: 0,
                            left: 0,
                            padding: 0,
                            margin: 0,
                            display: "block"
                        }).appendTo(this.env.playerDom.find("." + this.getNS() + "display"))
                    } else {
                        this.env.mediaContainer = $(document.createElement("div")).attr({
                            id: this.getMediaId()
                        }).css({
                            width: "1px",
                            height: "1px"
                        }).appendTo($(document.body))
                    }
                }
                return this.env.mediaContainer
            };
            this.getMediaId = function() {
                return this.getId() + "_media"
            };
            this.getMediaType = function() {
                try {
                    return this._getTypeFromFileExtension(this.playerModel.getSrc()) || "na/na"
                } catch(e) {
                    return "na/na"
                }
            };
            this.getUsesFlash = function() {
                return (this.playerModel.flashVersion != false)
            };
            this.getModel = function() {
                try {
                    return this.media[this._currentItem].mediaModel.toUpperCase()
                } catch(e) {
                    return "NA"
                }
            };
            this.getIframeWindow = function() {
                try {
                    var result = parent.location.host || false;
                    return (result === false) ? false: $(parent.window)
                } catch(e) {
                    return false
                }
            };
            this.getIframe = function() {
                try {
                    var result = window.$(frameElement) || [];
                    return (result.length == 0) ? false: result
                } catch(e) {
                    return false
                }
            };
            this.getPlaybackQuality = function() {
                var result = "default";
                try {
                    result = this.playerModel.getPlaybackQuality()
                } catch(e) {}
                if (result == "default") {
                    result = this.getConfig("playbackQuality")
                }
                if (result == "default") {
                    result = this.getAppropriateQuality()
                }
                if ($.inArray(result, this.getPlaybackQualities()) == -1) {
                    result = "default"
                }
                return result
            };
            this.getPlaybackQualities = function() {
                try {
                    return $.extend(true, [], this.media[this._currentItem].qualities || [])
                } catch(e) {
                    return []
                }
            };
            this.getFlashVersion = function(typ) {
                try {
                    try {
                        var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                        try {
                            axo.AllowScriptAccess = "always"
                        } catch(e) {
                            return "6,0,0"
                        }
                    } catch(e) {}
                    return new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version").replace(/\D+/g, ",").match(/^,?(.+),?$/)[1].match(/\d+/g)[0]
                } catch(e) {
                    try {
                        if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
                            return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1].match(/\d+/g)[0]
                        }
                    } catch(e) {}
                }
                return 0
            };
            this.getAndroidVersion = function(type) {
                var agent = navigator.userAgent.toLowerCase();
                try {
                    return parseInt(agent.match(/android\s+(([\d\.]+))?/)[1])
                } catch(e) {
                    return 0
                }
            };
            this.getIosVersion = function(type) {
                var agent = navigator.userAgent.toLowerCase(),
                start = agent.indexOf("os ");
                if ((agent.indexOf("iphone") > -1 || agent.indexOf("ipad") > -1) && start > -1) {
                    return parseInt(agent.substr(start + 3, 3).replace("_", "."))
                }
                return 0
            };
            this.getNativeVersion = function(type) {
                if (type == "*") {
                    return (this.getCanPlayNatively()) ? 1 : 0
                }
                try {
                    var testObject = document.createElement((type.indexOf("video") > -1) ? "video": "audio");
                    if (testObject.canPlayType != false) {
                        switch (testObject.canPlayType(type)) {
                        case "no":
                        case "":
                            break;
                        case "maybe":
                            if ($.browser.opera) {
                                if ($.browser.version.slice(0, 2) < 11) {
                                    break
                                }
                            }
                        case "probably":
                        default:
                            return 1
                        }
                    }
                } catch(e) {
                    return 0
                }
            };
            this.getBrowserVersion = function(type) {
                return 1
            };
            this.getIsMobileClient = function(what) {
                var uagent = navigator.userAgent.toLowerCase();
                var mobileAgents = ["android", "windows ce", "blackberry", "palm", "mobile"];
                for (var i = 0; i < mobileAgents.length; i++) {
                    if (uagent.indexOf(mobileAgents[i]) > -1) {
                        return (what) ? (mobileAgents[i].toUpperCase() == what.toUpperCase()) : true
                    }
                }
                return false
            };
            this.getCanPlay = function(type, platform, streamType) {
                return this._canPlay(type, platform, streamType)
            };
            this.getCanPlayNatively = function(type) {
                return this._canPlay(type, "NATIVE")
            };
            this._canPlay = function(type, platform, streamType) {
                var ref = this,
                checkIn = [],
                checkFor = [],
                st = streamType || "http",
                pltfrm = (typeof platform == "object") ? platform: [platform];
                if ($p._compTableCache == null) {
                    $p._compTableCache = this._testMediaSupport()
                }
                $.each(pltfrm,
                function(key, plt) {
                    if (plt != null) {
                        plt = plt.toUpperCase()
                    }
                    $.each($p._compTableCache[st] || [],
                    function(key, val) {
                        if (plt != null) {
                            if (key != plt) {
                                return true
                            }
                        }
                        checkIn = $.merge(checkIn, this)
                    })
                });
                if (checkIn.length == 0) {
                    return false
                }
                switch (typeof type) {
                case "undefined":
                    if (checkIn.length > 0) {
                        return true
                    }
                case "string":
                    if (type == "*") {
                        return checkIn
                    }
                    checkFor.push(type);
                    break;
                case "array":
                    checkFor = type;
                    break
                }
                for (var i in checkFor) {
                    if ($.inArray(checkFor[i], checkIn) > -1) {
                        return true
                    }
                }
                return false
            };
            this.getPlatforms = function() {
                var result = [],
                plt = this.getConfig("platforms");
                for (var i = 0; i < plt.length; i++) {
                    var capped = $p.utils.capitalise(plt[i].toUpperCase());
                    try {
                        if (this["get" + capped + "Version"]("*") > 0) {
                            if (this.getConfig("enable" + capped + "Platform") === false) {
                                continue
                            }
                            result.push(capped)
                        }
                    } catch(e) {}
                }
                return result
            };
            this.getNativeFullscreenSupport = function() {
                var ref = this,
                fullScreenApi = {
                    supportsFullScreen: "semi",
                    isFullScreen: function() {
                        try {
                            return ref.getDC().hasClass("fullscreen")
                        } catch(e) {
                            return false
                        }
                    },
                    requestFullScreen: function() {
                        ref._enterFullViewport();
                        ref.playerModel.applyCommand("fullscreen", true)
                    },
                    cancelFullScreen: function() {
                        ref._exitFullViewport();
                        ref.playerModel.applyCommand("fullscreen", false)
                    },
                    prefix: "",
                    ref: this
                },
                browserPrefixes = "webkit moz o ms khtml".split(" ");
                if (typeof document.cancelFullScreen != "undefined") {
                    fullScreenApi.supportsFullScreen = true
                } else {
                    for (var i = 0,
                    il = browserPrefixes.length; i < il; i++) {
                        fullScreenApi.prefix = browserPrefixes[i];
                        if (typeof document.createElement("video")[fullScreenApi.prefix + "EnterFullscreen"] != "undefined") {
                            fullScreenApi.supportsFullScreen = "media"
                        }
                        if (typeof document[fullScreenApi.prefix + "CancelFullScreen"] != "undefined") {
                            fullScreenApi.supportsFullScreen = "dom";
                            if (fullScreenApi.prefix == "moz" && typeof document[fullScreenApi.prefix + "FullScreenEnabled"] == "undefined") {
                                fullScreenApi.supportsFullScreen = false
                            }
                        }
                        if (fullScreenApi.supportsFullScreen !== false && fullScreenApi.supportsFullScreen !== "semi") {
                            break
                        }
                    }
                }
                if (fullScreenApi.supportsFullScreen == "semi") {
                    return fullScreenApi
                }
                fullScreenApi.isFullScreen = function() {
                    var dest = (ref.getIframe()) ? parent.window.document: document;
                    switch (this.prefix) {
                    case "":
                        return dest.fullScreen;
                    case "webkit":
                        return dest.webkitIsFullScreen;
                    default:
                        return dest[this.prefix + "FullScreen"]
                    }
                };
                if (fullScreenApi.supportsFullScreen == "dom") {
                    fullScreenApi.requestFullScreen = function() {
                        if (this.isFullScreen()) {
                            return
                        }
                        var target = ref._enterFullViewport(),
                        apiRef = this,
                        dest = (ref.getIframe()) ? parent.window.document: document;
                        $(dest).unbind(this.prefix + "fullscreenchange.projekktor");
                        $(dest).bind(this.prefix + "fullscreenchange.projekktor",
                        function(evt) {
                            if (!apiRef.isFullScreen()) {
                                apiRef.ref._exitFullViewport();
                                apiRef.ref.playerModel.applyCommand("fullscreen", false)
                            } else {
                                apiRef.ref.playerModel.applyCommand("fullscreen", true)
                            }
                        });
                        if (this.prefix === "") {
                            target.get(0).requestFullScreen()
                        } else {
                            target.get(0)[this.prefix + "RequestFullScreen"]()
                        }
                    };
                    fullScreenApi.cancelFullScreen = function() {
                        $((ref.getIframe()) ? parent.window.document: document).unbind(this.prefix + "fullscreenchange.projekktor");
                        var target = ref._exitFullViewport();
                        if (this.prefix === "") {
                            target.cancelFullScreen()
                        } else {
                            target[this.prefix + "CancelFullScreen"]()
                        }
                        ref.playerModel.applyCommand("fullscreen", false)
                    };
                    return fullScreenApi
                }
                fullScreenApi.requestFullScreen = function(el) {
                    ref.playerModel.getMediaElement().get(0)[this.prefix + "EnterFullscreen"]()
                };
                fullScreenApi.dest = {};
                fullScreenApi.cancelFullScreen = function() {};
                return fullScreenApi
            };
            this.getId = function() {
                return this._id
            };
            this.getHasGUI = function() {
                try {
                    return this.playerModel.getHasGUI()
                } catch(e) {
                    return false
                }
            };
            this.getCssPrefix = this.getNS = function() {
                return this.config._cssClassPrefix || this.config._ns || "pp"
            };
            this.getPlayerDimensions = function() {
                return {
                    width: this.config._width,
                    height: this.config._height
                }
            };
            this.getMediaDimensions = function() {
                return {
                    width: this.config._width,
                    height: this.config._height
                }
            };
            this.getAppropriateQuality = function() {
                if (this.media.length == 0) {
                    return []
                }
                var wid = this.env.playerDom.width(),
                hei = this.env.playerDom.height(),
                ratio = $p.utils.roundNumber(wid / hei, 2),
                quals = this.media[this._currentItem].qualities || [],
                temp = {};
                $.each(this.getConfig("playbackQualities") || [],
                function() {
                    if ($.inArray(this.key, quals) < 0) {
                        return true
                    }
                    if ((this.minHeight || 0) > hei && temp.minHeight <= hei) {
                        return true
                    }
                    if ((temp.minHeight || 0) > this.minHeight) {
                        return true
                    }
                    if (typeof this.minWidth == "number") {
                        if (this.minWidth === 0 && this.minHeight > hei) {
                            return true
                        }
                        if (this.minWidth > wid) {
                            return true
                        }
                        temp = this
                    } else {
                        if (typeof this.minWidth == "object") {
                            var ref = this;
                            $.each(this.minWidth,
                            function() {
                                if ((this.ratio || 100) > ratio) {
                                    return true
                                }
                                if (this.minWidth > wid) {
                                    return true
                                }
                                temp = ref;
                                return true
                            })
                        }
                    }
                    return true
                });
                return temp.key || "default"
            };
            this.getFromUrl = function(url, dest, callback, customParser, dataType) {
                var data = null,
                ref = this;
                if (dest == ref && callback == "_reelUpdate") {
                    this._promote("scheduleLoading", 1 + this.getItemCount())
                }
                if (callback.substr(0, 1) != "_") {
                    window[callback] = function(data) {
                        try {
                            delete window[callback]
                        } catch(e) {}
                        dest[callback](data)
                    }
                } else {
                    if (dataType.indexOf("jsonp") > -1) {
                        this["_jsonp" + callback] = function(data) {
                            dest[callback](data)
                        }
                    }
                }
                if (dataType) {
                    if ($.parseJSON == undefined && dataType.indexOf("json") > -1) {
                        this._raiseError("Projekktor requires at least jQuery 1.4.2 in order to handle JSON playlists.");
                        return this
                    }
                    dataType = (dataType.indexOf("/") > -1) ? dataType.split("/")[1] : dataType
                }
                $.ajax({
                    url: url,
                    complete: function(xhr, status) {
                        if (dataType == undefined) {
                            try {
                                if (xhr.getResponseHeader("Content-Type").indexOf("xml") > -1) {
                                    dataType = "xml"
                                }
                                if (xhr.getResponseHeader("Content-Type").indexOf("json") > -1) {
                                    dataType = "json"
                                }
                                if (xhr.getResponseHeader("Content-Type").indexOf("html") > -1) {
                                    dataType = "html"
                                }
                            } catch(e) {}
                        }
                        data = $p.utils.cleanResponse(xhr.responseText, dataType);
                        try {
                            data = customParser(data, xhr.responseText)
                        } catch(e) {}
                        if (status != "error" && dataType != "jsonp") {
                            try {
                                dest[callback](data)
                            } catch(e) {}
                        }
                    },
                    error: function(data) {
                        if (dest[callback] && dataType != "jsonp") {
                            dest[callback](false)
                        }
                    },
                    cache: true,
                    async: !this.getIsMobileClient(),
                    dataType: dataType,
                    jsonpCallback: (callback.substr(0, 1) != "_") ? false: "projekktor('" + this.getId() + "')._jsonp" + callback,
                    jsonp: (callback.substr(0, 1) != "_") ? false: "callback"
                });
                return this
            };
            this.setActiveItem = function(mixedData) {
                var newItem = 0,
                lastItem = this._currentItem,
                ref = this;
                if (typeof mixedData == "string") {
                    switch (mixedData) {
                    case "previous":
                        newItem = this._currentItem - 1;
                        break;
                    case "next":
                        newItem = this._currentItem + 1;
                        break;
                    default:
                    case "poster":
                        result = 0;
                        break
                    }
                } else {
                    if (typeof mixedData == "number") {
                        newItem = parseInt(mixedData)
                    } else {
                        newItem = 0
                    }
                }
                if (newItem != this._currentItem) {
                    if (this.getConfig("disallowSkip") == true && !this.getState("COMPLETED")) {
                        return this
                    }
                }
                this._detachplayerModel();
                this.env.loading = false;
                var ap = false;
                if (newItem === 0 && (lastItem == null || lastItem == newItem) && (this.config._autoplay === true || "DESTROYING|AWAKENING".indexOf(this.getState()) > -1)) {
                    ap = true
                } else {
                    if (this.getItemCount() > 1 && newItem != lastItem && lastItem != null && this.config._continuous === true && newItem < this.getItemCount()) {
                        ap = true
                    }
                }
                if (newItem >= this.getItemCount() || newItem < 0) {
                    ap = this.config._loop;
                    newItem = 0
                }
                this._currentItem = newItem;
                var wasFullscreen = this.getInFullscreen();
                this.getDC().attr("class", this.env.className);
                if (wasFullscreen) {
                    this.getDC().addClass("fullscreen")
                }
                var newModel = this.media[this._currentItem].mediaModel.toUpperCase();
                if (!$p.models[newModel]) {
                    newModel = "NA";
                    this.media[this._currentItem].mediaModel = newModel;
                    this.media[this._currentItem].errorCode = 8
                } else {
                    if (this.getConfig("className") != null) {
                        this.getDC().addClass(this.getNS() + this.getConfig("className"))
                    }
                    this.getDC().addClass(this.getNS() + (this.getConfig("streamType") || "http"))
                }
                this.playerModel = new playerModel();
                $.extend(this.playerModel, $p.models[newModel].prototype);
                this._promote("syncing", "display");
                this._enqueue(function() {
                    try {
                        ref._applyCuePoints()
                    } catch(e) {}
                });
                this.playerModel._init({
                    media: $.extend(true, {},
                    this.media[this._currentItem]),
                    model: newModel,
                    pp: this,
                    environment: $.extend(true, {},
                    this.env),
                    autoplay: ap,
                    quality: this.getPlaybackQuality()
                });
                return this
            };
            this.getIsLastItem = function() {
                return ((this._currentItem == this.media.length - 1) && this.config._loop !== true)
            };
            this.getIsFirstItem = function() {
                return ((this._currentItem == 0) && this.config._loop !== true)
            };
            this.setPlay = function() {
                this._enqueue("play", false);
                return this
            };
            this.setPause = function() {
                this._enqueue("pause", false);
                return this
            };
            this.setStop = function(toZero) {
                var ref = this;
                if (this.getState("IDLE")) {
                    return this
                }
                if (toZero) {
                    this._enqueue(function() {
                        ref._currentItem = 0;
                        ref.setActiveItem(0)
                    })
                } else {
                    this._enqueue("stop", false)
                }
                return this
            };
            this.setPlayPause = function() {
                if (!this.getState("PLAYING")) {
                    this.setPlay()
                } else {
                    this.setPause()
                }
                return this
            };
            this.setVolume = function(vol, fadeDelay) {
                if (this.getConfig("fixedVolume") == true) {
                    return this
                }
                var initalVolume = this.getVolume();
                if (typeof vol == "string") {
                    var dir = vol.substr(0, 1);
                    vol = parseFloat(vol.substr(1));
                    vol = (vol > 1) ? vol / 100 : vol;
                    if (dir == "+") {
                        vol = this.getVolume() + vol
                    } else {
                        if (dir == "-") {
                            vol = this.getVolume() - vol
                        } else {
                            vol = this.getVolume()
                        }
                    }
                }
                if (typeof vol == "number") {
                    vol = (vol > 1) ? 1 : vol;
                    vol = (vol < 0) ? 0 : vol
                } else {
                    return this
                }
                if (vol > initalVolume && fadeDelay) {
                    if (vol - initalVolume > 0.03) {
                        for (var i = initalVolume; i <= vol; i = i + 0.03) {
                            this._enqueue("volume", i, fadeDelay)
                        }
                        this._enqueue("volume", vol, fadeDelay);
                        return this
                    }
                } else {
                    if (vol < initalVolume && fadeDelay) {
                        if (initalVolume - vol > 0.03) {
                            for (var i = initalVolume; i >= vol; i = i - 0.03) {
                                this._enqueue("volume", i, fadeDelay)
                            }
                            this._enqueue("volume", vol, fadeDelay);
                            return this
                        }
                    }
                }
                this._enqueue("volume", vol);
                return this
            };
            this.setPlayhead = function(position) {
                if (this.getConfig("disallowSkip") == true) {
                    return this
                }
                if (typeof position == "string") {
                    var dir = position.substr(0, 1);
                    position = parseFloat(position.substr(1));
                    if (dir == "+") {
                        position = this.getPosition() + position
                    } else {
                        if (dir == "-") {
                            position = this.getPosition() - position
                        } else {
                            position = this.getPosition()
                        }
                    }
                }
                if (typeof position == "number") {
                    this._enqueue("seek", position)
                }
                return this
            };
            this.setPlayerPoster = function(url) {
                var ref = this;
                this._enqueue(function() {
                    ref.setConfig({
                        poster: url
                    },
                    0)
                });
                this._enqueue(function() {
                    ref.playerModel.setPosterLive()
                });
                return this
            };
            this.setItemConfig = function() {
                return this.setConfig(arguments)
            };
            this.setConfig = function() {
                var ref = this,
                args = arguments;
                this._enqueue(function() {
                    ref._setConfig(args[0] || null, args[1] || null)
                });
                return this
            };
            this._setConfig = function() {
                if (!arguments.length) {
                    return result
                }
                var confObj = arguments[0],
                dest = "*",
                value = false;
                if (typeof confObj != "object") {
                    return this
                }
                if (arguments[1] == "string" || arguments[1] == "number") {
                    dest = arguments[1]
                } else {
                    dest = this._currentItem
                }
                for (var i in confObj) {
                    if ($.inArray(i, this._persCfg) > -1) {
                        this._cookie(i, (typeof confObj[i] == "string") ? confObj[i] : eval(confObj[i]))
                    }
                    if (this.config["_" + i] != null) {
                        continue
                    }
                    try {
                        value = eval(confObj[i])
                    } catch(e) {
                        value = confObj[i]
                    }
                    if (dest == "*") {
                        $.each(this.media,
                        function() {
                            if (this.config == null) {
                                this.config = {}
                            }
                            this.config[i] = value
                        });
                        continue
                    }
                    if (this.media[dest] == undefined) {
                        return this
                    }
                    if (this.media[dest]["config"] == null) {
                        this.media[dest]["config"] = {}
                    }
                    this.media[dest]["config"][i] = value
                }
                return this
            };
            this.setFullscreen = function(goFull) {
                if (this.getConfig("isCrossDomain")) {
                    return this
                }
                var nativeFullscreen = this.getNativeFullscreenSupport(),
                ref = this;
                goFull = (goFull == null) ? !nativeFullscreen.isFullScreen() : goFull;
                if (goFull == nativeFullscreen.isFullScreen()) {
                    return this
                }
                if (goFull === true) {
                    nativeFullscreen.requestFullScreen()
                } else {
                    nativeFullscreen.cancelFullScreen()
                }
                return this
            };
            this.setResize = function() {
                this._modelUpdateListener("resize");
                return this
            };
            this.setSize = function(data) {
                var w = data.width || this.config._width,
                h = data.height || this.config._height;
                if (w.indexOf("px") == -1 && w.indexOf("%") == -1) {
                    data.width += "px"
                }
                if (h.indexOf("px") == -1 && h.indexOf("%") == -1) {
                    data.height += "px"
                }
                this.getDC().css({
                    width: data.width,
                    height: data.height
                });
                this.config._width = this.getDC().width();
                this.config._height = this.getDC().height();
                this._modelUpdateListener("resize")
            };
            this.setLoop = function(value) {
                this.config._loop = value || !this.config._loop
            };
            this.setDebug = function(value) {
                $p.utils.logging = value || !$p.utils.logging;
                if ($p.utils.logging) {
                    $p.utils.log("DEBUG MODE for player #" + this.getId())
                }
            };
            this.addListener = function(evt, callback) {
                var ref = this;
                this._enqueue(function() {
                    ref._addListener(evt, callback)
                });
                return this
            };
            this._addListener = function(evt, callback) {
                var listenerObj = {
                    event: evt,
                    callback: callback
                };
                this.listeners.push(listenerObj);
                return this
            };
            this.removeListener = function(evt, callback) {
                var len = this.listeners.length;
                for (var i = 0; i < len; i++) {
                    if (this.listeners[i] == undefined) {
                        continue
                    }
                    if (this.listeners[i].event != evt && evt !== "*") {
                        continue
                    }
                    if (this.listeners[i].callback != callback && callback != null) {
                        continue
                    }
                    this.listeners.splice(i, 1)
                }
                return this
            };
            this.setItem = function() {
                var itemData = arguments[0];
                var affectedIdx = 0;
                this._clearqueue();
                if (this.env.loading === true) {}
                if (itemData == null) {
                    affectedIdx = this._removeItem(arguments[1]);
                    if (affectedIdx === this._currentItem) {
                        this.setActiveItem("previous")
                    }
                } else {
                    affectedIdx = this._addItem(this._prepareMedia({
                        file: itemData,
                        config: itemData.config || {}
                    }), arguments[1], arguments[2]);
                    if (affectedIdx === this._currentItem) {
                        this.setActiveItem(this._currentItem)
                    }
                }
                return this
            };
            this.setFile = function() {
                var fileNameOrObject = arguments[0] || "",
                dataType = arguments[1] || this._getTypeFromFileExtension(fileNameOrObject),
                result = [];
                if (this.env.loading === true) {
                    return this
                }
                this._clearqueue();
                this.env.loading = true;
                this._detachplayerModel();
                if (typeof fileNameOrObject == "object") {
                    $p.utils.log("Applying incoming JS Object", fileNameOrObject);
                    this._reelUpdate(fileNameOrObject);
                    return this
                }
                result[0] = {};
                result[0].file = {};
                result[0].file.src = fileNameOrObject || "";
                result[0].file.type = dataType || this._getTypeFromFileExtension(splt[0]);
                if (result[0].file.type.indexOf("/xml") > -1 || result[0].file.type.indexOf("/json") > -1) {
                    $p.utils.log("Loading external data from " + result[0].file.src + " supposed to be " + result[0].file.type);
                    this._playlistServer = result[0].file.src;
                    this.getFromUrl(result[0].file.src, this, "_reelUpdate", this.getConfig("reelParser"), result[0].file.type);
                    return this
                }
                $p.utils.log("Applying incoming single file:" + result[0].file.src, result);
                this._reelUpdate(result);
                return this
            };
            this.setPlaybackQuality = function(quality) {
                var qual = quality || this.getAppropriateQuality();
                if ($.inArray(qual, this.media[this._currentItem].qualities || []) > -1) {
                    this.playerModel.applyCommand("quality", qual);
                    this.setConfig({
                        playbackQuality: qual
                    })
                }
                return this
            };
            this.openUrl = function(cfg) {
                cfg = cfg || {
                    url: "",
                    target: "",
                    pause: false
                };
                if (cfg.url == "") {
                    return
                }
                if (cfg.pause === true) {
                    this.setPause()
                }
                window.open(cfg.url, cfg.target).focus();
                return this
            };
            this.selfDestruct = this.destroy = function() {
                var ref = this;
                this._enqueue(function() {
                    ref._destroy()
                });
                return this
            },
            this._destroy = function() {
                var ref = this;
                $(this).unbind();
                this.removePlugin();
                this.playerModel.destroy();
                this._removeGUIListeners();
                this.env.playerDom.replaceWith($(this.env.srcNode).clone());
                $.each(projekktors,
                function(idx) {
                    try {
                        if (this.getId() == ref.getId() || this.getId() == ref.getId() || this.getParent() == ref.getId()) {
                            projekktors.splice(idx, 1);
                            return
                        }
                    } catch(e) {}
                });
                this._promote("destroyed");
                this.removeListener("*");
                return this
            };
            this.reset = function() {
                var ref = this;
                this._clearqueue();
                this._enqueue(function() {
                    ref._reset()
                });
                return this
            },
            this._reset = function() {
                var cleanConfig = {},
                ref = this;
                $(this).unbind();
                this.setFullscreen(false);
                this.removePlugin();
                this._removeGUIListeners();
                this.env.mediaContainer = null;
                for (var i in this.config) {
                    cleanConfig[(i.substr(0, 1) == "_") ? i.substr(1) : i] = this.config[i]
                }
                if (typeof this.env.onReady === "function") {
                    this._enqueue(ref.env.onReady(ref))
                }
                this._init(this.env.playerDom, cleanConfig);
                return this
            },
            this.setCuePoint = function(obj) {
                var item = (obj.item !== undefined) ? obj.item: this.getItemIdx(),
                ref = this,
                cuePoint = {
                    id: obj.id || $p.utils.randomId(8),
                    group: obj.group || $p.utils.randomId(8),
                    item: item,
                    on: $p.utils.toSeconds(obj.on) || 0,
                    off: $p.utils.toSeconds(obj.off) || $p.utils.toSeconds(obj.on) || 0,
                    value: obj.value || null,
                    callback: obj.callback ||
                    function() {},
                    precision: (obj.precision == null) ? 0 : obj.precision,
                    title: (obj.title == null) ? "": obj.title,
                    _listeners: [],
                    _unlocked: false,
                    _active: false,
                    _lastTime: 0,
                    isAvailable: function() {
                        return this._unlocked
                    },
                    _stateListener: function(state, player) {
                        if ("STOPPED|COMPLETED|DESTROYING".indexOf(state) > -1) {
                            if (this._active) {
                                try {
                                    this.callback(false, this, player)
                                } catch(e) {}
                            }
                            this._active = false;
                            this._lastTime = -1
                        }
                    },
                    _timeListener: function(time, player) {
                        if (player.getItemIdx() !== this.item && this.item != "*") {
                            return
                        }
                        var timeIdx = (this.precision == 0) ? Math.round(time) : $p.utils.roundNumber(time, this.precision),
                        ref = this;
                        if (this._unlocked === false) {
                            var approxMaxTimeLoaded = player.getDuration() * player.getLoadProgress() / 100;
                            if (this.on <= approxMaxTimeLoaded || this.on <= timeIdx) {
                                $.each(this._listeners.unlock || [],
                                function() {
                                    this(ref, player)
                                });
                                this._unlocked = true
                            } else {
                                return
                            }
                        }
                        if (this._lastTime == timeIdx) {
                            return
                        }
                        var nat = (timeIdx - this._lastTime <= 1 && timeIdx - this._lastTime > 0);
                        if (((timeIdx >= this.on && timeIdx <= this.off) || (timeIdx >= this.on && this.on == this.off && timeIdx <= this.on + 1)) && this._active !== true) {
                            this._active = true;
                            $p.utils.log("Cue Point: [ON " + this.on + "] at " + timeIdx, this);
                            try {
                                this.callback({
                                    enabled: true,
                                    value: this.value,
                                    seeked: !nat,
                                    player: player
                                })
                            } catch(e) {}
                        } else {
                            if ((timeIdx < this.on || timeIdx > this.off) && this.off != this.on && this._active == true) {
                                this._active = false;
                                $p.utils.log("Cue Point: [OFF] at " + this.off, this);
                                try {
                                    this.callback({
                                        enabled: false,
                                        value: this.value,
                                        seeked: !nat,
                                        player: player
                                    })
                                } catch(e) {}
                            } else {
                                if (this.off == this.on && this._active && new Number(timeIdx - this.on).toPrecision(this.precision) > 1) {
                                    this._active = false
                                }
                            }
                        }
                        this._lastTime = timeIdx
                    },
                    addListener: function(event, func) {
                        if (this._listeners[event] == null) {
                            this._listeners[event] = []
                        }
                        this._listeners[event].push(func ||
                        function() {})
                    }
                };
                if (obj.unlockCallback != null) {
                    cuePoint.addListener("unlock", obj.unlockCallback)
                }
                if (this._cuePoints[item] == null) {
                    this._cuePoints[item] = []
                }
                this._cuePoints[item].push(cuePoint);
                if (!this.getState("IDLE")) {
                    this._promote("cuepointAdded")
                }
                return this
            },
            this.getCuePoints = function(idx) {
                return this._cuePoints[idx || this.getItemIdx()] || this._cuePoints || {}
            },
            this.getCuePointById = function(id, idx) {
                var result = false,
                cuePoints = this.getCuePoints(idx);
                for (var j = 0; j < cuePoints.length; j++) {
                    if (cuePoints.id == id) {
                        result = this;
                        break
                    }
                }
                return result
            },
            this.removeCuePoints = function(idx, group) {
                var cuePoints = this.getCuePoints(idx) || {};
                for (var cIdx in cuePoints) {
                    for (var j = 0; j < cuePoints[cIdx].length; j++) {
                        if (cuePoints[cIdx][j].group === group || group === undefined) {
                            this.removeListener("time", cuePoints[cIdx][j].timeEventHandler);
                            this.removeListener("state", cuePoints[cIdx][j].stateEventHandler);
                            cuePoints[cIdx].splice(j, 1)
                        }
                    }
                }
            },
            this._applyCuePoints = function() {
                var ref = this;
                if (this._cuePoints[this._currentItem] == null && this._cuePoints["*"] == null) {
                    return
                }
                $.each($.merge(this._cuePoints[this._currentItem] || [], this._cuePoints["*"] || []),
                function(key, cuePointObj) {
                    cuePointObj.timeEventHandler = function(time, player) {
                        try {
                            cuePointObj._timeListener(time, player)
                        } catch(e) {}
                    },
                    cuePointObj.stateEventHandler = function(state, player) {
                        try {
                            cuePointObj._stateListener(state, player)
                        } catch(e) {}
                    },
                    ref.addListener("time", cuePointObj.timeEventHandler);
                    ref.addListener("state", cuePointObj.stateEventHandler);
                    ref.addListener("item",
                    function() {
                        ref.removeListener("time", cuePointObj.timeEventHandler);
                        ref.removeListener("state", cuePointObj.stateEventHandler)
                    })
                })
            },
            this._enqueue = function(command, params, delay) {
                if (command == null) {
                    return
                }
                this._queue.push({
                    command: command,
                    params: params,
                    delay: delay
                });
                this._processQueue()
            };
            this._clearqueue = function(command, params) {
                if (this._isReady !== true) {
                    return
                }
                this._queue = []
            };
            this._processQueue = function() {
                var ref = this,
                modelReady = false;
                if (this._processing === true) {
                    return
                }
                if (this.env.loading === true) {
                    return
                }
                this._processing = true; (function() {
                    try {
                        modelReady = ref.playerModel.getIsReady()
                    } catch(e) {}
                    if (ref.env.loading !== true && modelReady) {
                        try {
                            var msg = ref._queue.shift();
                            if (msg != null) {
                                if (typeof msg.command == "string") {
                                    if (msg.delay > 0) {
                                        setTimeout(function() {
                                            ref.playerModel.applyCommand(msg.command, msg.params)
                                        },
                                        msg.delay)
                                    } else {
                                        ref.playerModel.applyCommand(msg.command, msg.params)
                                    }
                                } else {
                                    msg.command(ref)
                                }
                            }
                        } catch(e) {}
                        if (ref._queue.length == 0) {
                            if (ref._isReady === false) {
                                ref._isReady = true
                            }
                            ref._processing = false;
                            return
                        }
                        arguments.callee();
                        return
                    }
                    setTimeout(arguments.callee, 100)
                })()
            };
            this._cookie = function(key, value) {
                if (document.cookie === undefined) {
                    return null
                }
                if (document.cookie === false) {
                    return null
                }
                if (key == null) {
                    return null
                }
                if (arguments.length > 1 && value != null) {
                    var t = new Date();
                    t.setDate(t.getDate() + this.config._cookieExpiry);
                    return (document.cookie = encodeURIComponent(this.config._cookieName + "_" + key) + "=" + encodeURIComponent(value) + "; expires=" + t.toUTCString() + "; path=/")
                }
                var result, returnthis = (result = new RegExp("(?:^|; )" + encodeURIComponent(this.config._cookieName + "_" + key) + "=([^;]*)").exec(document.cookie)) ? decodeURIComponent(result[1]) : null;
                return (returnthis == "true" || returnthis == "false") ? eval(returnthis) : returnthis
            };
            this._getTypeFromFileExtension = function(url) {
                var fileExt = "",
                extRegEx = [],
                extTypes = {},
                extRegEx = [];
                for (var i in $p.mmap) {
                    extRegEx.push("." + $p.mmap[i].ext);
                    extTypes[$p.mmap[i].ext] = $p.mmap[i]
                }
                extRegEx = "^.*.(" + extRegEx.join("|") + ")";
                try {
                    fileExt = url.match(new RegExp(extRegEx))[1];
                    fileExt = (!fileExt) ? "NaN": fileExt.replace(".", "")
                } catch(e) {
                    fileExt = "NaN"
                }
                return extTypes[fileExt].type
            };
            this._testMediaSupport = function() {
                var result = {},
                streamType = "",
                ref = this;
                for (var i = 0; i < $p.mmap.length; i++) {
                    platforms = (typeof $p.mmap[i]["platform"] == "object") ? $p.mmap[i]["platform"] : [$p.mmap[i]["platform"]];
                    $.each(platforms,
                    function(_na, platform) {
                        if (platform == null) {
                            return true
                        }
                        var platform = platform.toUpperCase();
                        streamType = $p.mmap[i]["streamType"] || ["http"];
                        $.each(streamType,
                        function(key, st) {
                            if (result[st] == null) {
                                result[st] = {}
                            }
                            if (result[st][platform] == null) {
                                result[st][platform] = []
                            }
                            if ($.inArray($p.mmap[i]["type"], result[st][platform]) > -1) {
                                return true
                            }
                            var capped = $p.utils.capitalise(platform),
                            version = $p.models[$p.mmap[i]["model"].toUpperCase()].prototype[(platform.toLowerCase()) + "Version"] || 1;
                            try {
                                if (ref["get" + capped + "Version"]($p.mmap[i]["type"]) >= version) {
                                    if (ref.config["_enable" + capped + "Platform"] != false) {
                                        result[st][platform].push($p.mmap[i]["type"]);
                                        if ($p.mmap[i]["fixed"] == true) {
                                            return false
                                        }
                                    }
                                    return true
                                }
                            } catch(e) {
                                $p.utils.log("ERROR", "get" + capped + "Version not found")
                            }
                        })
                    })
                }
                return result
            };
            this._raiseError = function(txt) {
                this.env.playerDom.html(txt).css({
                    color: "#fdfdfd",
                    backgroundColor: "#333",
                    lineHeight: this.config.height + "px",
                    textAlign: "center",
                    display: "block"
                });
                this._promote("error")
            };
            this._readMediaTag = function(domNode) {
                var result = {},
                htmlTag = "",
                attr = [],
                ref = this;
                if (domNode[0].tagName.toUpperCase() != "VIDEO" && domNode[0].tagName.toUpperCase() != "AUDIO") {
                    return false
                }
                if (!this.getConfig("ignoreAttributes")) {
                    result = {
                        autoplay: ((domNode.attr("autoplay") !== undefined || domNode.prop("autoplay") !== undefined) && domNode.prop("autoplay") !== false) ? true: false,
                        controls: ((domNode.attr("controls") !== undefined || domNode.prop("controls") !== undefined) && domNode.prop("controls") !== false) ? true: false,
                        loop: ((domNode.attr("autoplay") !== undefined || domNode.prop("loop") !== undefined) && domNode.prop("loop") !== false) ? true: false,
                        title: (domNode.attr("title") !== undefined && domNode.attr("title") !== false) ? domNode.attr("title") : "",
                        poster: (domNode.attr("poster") !== undefined && domNode.attr("poster") !== false) ? domNode.attr("poster") : "",
                        width: (domNode.attr("width") !== undefined && domNode.attr("width") !== false) ? domNode.attr("width") : false,
                        height: (domNode.attr("height") !== undefined && domNode.attr("height") !== false) ? domNode.attr("height") : false
                    }
                }
                if ($.browser.msie) {
                    htmlTag = $($("<div></div>").html($(domNode).clone())).html();
                    attr = ["autoplay", "controls", "loop"];
                    for (var i = 0; i < attr.length; i++) {
                        if (htmlTag.indexOf(attr[i]) == -1) {
                            continue
                        }
                        result[attr[i]] = true
                    }
                }
                domNode.prop("autoplay", false);
                result.playlist = [];
                result.playlist[0] = [];
                if (srcNode.attr("src")) {
                    result.playlist[0].push({
                        src: srcNode.attr("src"),
                        type: srcNode.attr("type") || this._getTypeFromFileExtension(srcNode.attr("src"))
                    })
                }
                if ($.browser.msie && $.browser.version < 9) {
                    var childNode = srcNode;
                    do {
                        childNode = childNode.next("source");
                        if (childNode.attr("src")) {
                            result.playlist[0].push({
                                src: childNode.attr("src"),
                                type: childNode.attr("type") || this._getTypeFromFileExtension(childNode.attr("src"))
                            })
                        }
                    } while ( childNode . attr ("src"))
                } else {
                    srcNode.children("source").each(function() {
                        if ($(this).attr("src")) {
                            result.playlist[0].push({
                                src: $(this).attr("src"),
                                type: $(this).attr("type") || ref._getTypeFromFileExtension($(this).attr("src"))
                            })
                        }
                    })
                }
                try {
                    domNode[0].pause();
                    domNode.find("source").remove();
                    domNode.prop("src", "");
                    domNode[0].load()
                } catch(e) {}
                return result
            };
            this._applyDimensions = function() {
                if (this.config._height !== false && this.config._width !== false) {
                    if (this.config._width <= this.config._minWidth && this.config._iframe != true) {
                        this.config._width = this.config._minWidth;
                        this.env.autoSize = true
                    }
                    if (this.config._height <= this.config._minHeight && this.config._iframe != true) {
                        this.config._height = this.config._minHeight;
                        this.env.autoSize = true
                    }
                }
                this.env.playerDom.css({
                    "max-width": "100%"
                });
                if (this.config._height !== false) {
                    this.env.playerDom.css("height", this.config._height + "px")
                }
                if (this.config._width !== false) {
                    this.env.playerDom.css("width", this.config._width + "px")
                }
            };
            this._init = function(customNode, customCfg) {
                var theNode = customNode || srcNode,
                theCfg = customCfg || cfg,
                cfgBySource = this._readMediaTag(theNode);
                this.env.srcNode = $.extend(true, {},
                theNode);
                this.env.className = theNode.attr("class");
                if (cfgBySource !== false) {
                    this.env.playerDom = $("<div/>").attr({
                        "class": theNode[0].className,
                        style: theNode.attr("style")
                    });
                    theNode.replaceWith(this.env.playerDom)
                } else {
                    cfgBySource = {
                        width: theNode.attr("width") || theNode.css("width") || theNode.width(),
                        height: theNode.attr("height") || theNode.css("height") || theNode.height()
                    };
                    this.env.playerDom = theNode
                }
                theCfg = $.extend(true, {},
                cfgBySource, theCfg);
                for (var i in theCfg) {
                    if (this.config["_" + i] != null) {
                        this.config["_" + i] = theCfg[i]
                    } else {
                        if (i.indexOf("plugin_") > -1) {
                            this.config[i] = $.extend(this.config[i], theCfg[i])
                        } else {
                            this.config[i] = theCfg[i]
                        }
                    }
                }
                $p.utils.logging = this.config._debug;
                if (this.getIsMobileClient()) {
                    this.config._autoplay = false;
                    this.config.fixedVolume = true
                }
                this._id = theNode[0].id || $p.utils.randomId(8);
                this.env.playerDom.attr("id", this._id);
                if (this.config._theme) {
                    switch (typeof this.config._theme) {
                    case "string":
                        break;
                    case "object":
                        this._applyTheme(this.config._theme)
                    }
                } else {
                    this._start(false)
                }
                return this
            };
            this._start = function(data) {
                var ref = this,
                files = [];
                this._applyDimensions();
                this._registerPlugins();
                if (this.config._iframe === true) {
                    if (this.getIframeWindow()) {
                        this.getIframeWindow().ready(function() {
                            ref._enterFullViewport(true, false)
                        })
                    } else {
                        ref._enterFullViewport(true, false)
                    }
                }
                if (this.getIframeWindow() === false) {
                    this.config._isCrossDomain = true
                }
                if (typeof onReady === "function") {
                    this._enqueue(function() {
                        onReady(ref)
                    })
                }
                for (var i in this.config._playlist[0]) {
                    if (this.config._playlist[0][i].type) {
                        if (this.config._playlist[0][i].type.indexOf("/json") > -1 || this.config._playlist[0][i].type.indexOf("/xml") > -1) {
                            this.setFile(this.config._playlist[0][i].src, this.config._playlist[0][i].type);
                            return this
                        }
                    }
                }
                this.setFile(this.config._playlist);
                return this
            };
            this._applyTheme = function(data) {
                var ref = this;
                if (data === false) {
                    this._raiseError("The Projekktor theme-set specified could not be loaded.");
                    return false
                }
                if (typeof data.css == "string") {
                    $("head").append('<style type="text/css">' + $p.utils.parseTemplate(data.css, {
                        rp: data.baseURL
                    }) + "</style>")
                }
                if (typeof data.html == "string") {
                    this.env.playerDom.html($p.utils.parseTemplate(data.html, {
                        p: this.getNS()
                    }))
                }
                this.env.playerDom.addClass(data.id).addClass(data.variation);
                if (typeof data.config == "object") {
                    for (var i in data.config) {
                        if (this.config["_" + i] != null) {
                            this.config["_" + i] = data.config[i]
                        } else {
                            if (i.indexOf("plugin_") > -1) {
                                this.config[i] = $.extend(true, {},
                                this.config[i], data.config[i])
                            } else {
                                this.config[i] = data.config[i]
                            }
                        }
                    }
                    if (typeof data.config.plugins == "object") {
                        for (var i = 0; i < data.config.plugins.length; i++) {
                            try {
                                typeof eval("projekktor" + data.config.plugins[i])
                            } catch(e) {
                                this._raiseError("The applied theme requires the following Projekktor plugin(s): <b>" + data.config.plugins.join(", ") + "</b>");
                                return false
                            }
                        }
                    }
                }
                if (data.onReady) {
                    this._enqueue(function(player) {
                        eval(data.onReady)
                    })
                }
                return this._start()
            };
            return this._init()
        }
    };
    $p.mmap = [];
    $p.models = {};
    $p.newModel = function(obj, ext) {
        var result = false,
        extend = ($p.models[ext] && ext != undefined) ? $p.models[ext].prototype: {};
        if (typeof obj != "object") {
            return result
        }
        if (!obj.modelId) {
            return result
        }
        if ($p.models[obj.modelId]) {
            return result
        }
        $p.models[obj.modelId] = function() {};
        $p.models[obj.modelId].prototype = $.extend({},
        extend, obj);
        for (var i = 0; i < obj.iLove.length; i++) {
            obj.iLove[i].model = obj.modelId.toLowerCase();
            $p.mmap.push(obj.iLove[i])
        }
        return true
    }
});
var projekktorConfig = function(a) {
    this._version = a
};
jQuery(function(a) {
    $p.utils = {
        imageDummy: function() {
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABBJREFUeNpi/v//PwNAgAEACQsDAUdpTjcAAAAASUVORK5CYII="
        },
        capitalise: function(b) {
            return b.charAt(0).toUpperCase() + b.slice(1).toLowerCase()
        },
        blockSelection: function(b) {
            if (!b) {
                return false
            }
            if (a.browser.mozilla) {
                b.css("MozUserSelect", "none")
            } else {
                if (a.browser.msie) {
                    b.bind("selectstart",
                    function() {
                        return false
                    })
                } else {
                    b.mousedown(function() {
                        return false
                    })
                }
            }
            return b
        },
        unique: function(b) {
            var d = [];
            for (var c = b.length; c--;) {
                var e = b[c];
                if (a.inArray(e, d) === -1) {
                    d.unshift(e)
                }
            }
            return d
        },
        intersect: function(d, c) {
            var b = [];
            a.each(d,
            function(f) {
                try {
                    if (a.inArray(c, d[f]) > -1) {
                        b.push(d[f])
                    }
                } catch(g) {}
                try {
                    if (a.inArray(d[f], c) > -1) {
                        b.push(d[f])
                    }
                } catch(g) {}
            });
            return b
        },
        roundNumber: function(b, c) {
            if (b <= 0 || isNaN(b)) {
                return 0
            }
            return Math.round(b * Math.pow(10, c)) / Math.pow(10, c)
        },
        randomId: function(f) {
            var e = "abcdefghiklmnopqrstuvwxyz",
            b = "";
            for (var d = 0; d < f; d++) {
                var c = Math.floor(Math.random() * e.length);
                b += e.substring(c, c + 1)
            }
            return b
        },
        toAbsoluteURL: function(e) {
            var b = location,
            d, j, g, c;
            if (e == null || e == "") {
                return ""
            }
            if (/^\w+:/.test(e)) {
                return e
            }
            d = b.protocol + "//" + b.host;
            if (e.indexOf("/") == 0) {
                return d + e
            }
            j = b.pathname.replace(/\/[^\/]*$/, "");
            g = e.match(/\.\.\//g);
            if (g) {
                e = e.substring(g.length * 3);
                for (c = g.length; c--;) {
                    j = j.substring(0, j.lastIndexOf("/"))
                }
            }
            return d + j + "/" + e
        },
        strip: function(b) {
            return b.replace(/^\s+|\s+$/g, "")
        },
        toSeconds: function(b) {
            var c = 0;
            if (typeof b != "string") {
                return b
            }
            if (b) {
                var d = b.split(":");
                for (i = 0; i < d.length; i++) {
                    c = c * 60 + parseFloat(d[i].replace(",", "."))
                }
            }
            return parseFloat(c)
        },
        toTimeString: function(e, h) {
            var c = Math.floor(e / (60 * 60)),
            f = e % (60 * 60),
            d = Math.floor(f / 60),
            b = f % 60,
            g = Math.floor(b);
            if (c < 10) {
                c = "0" + c
            }
            if (d < 10) {
                d = "0" + d
            }
            if (g < 10) {
                g = "0" + g
            }
            return (h === true) ? c + ":" + d: c + ":" + d + ":" + g
        },
        embeddFlash: function(d, c, k) {
            var f = c.FlashVars || {},
            m = "",
            e = "",
            l = "",
            g = "",
            h = d,
            b = "";
            if (c.src.indexOf("?") == -1) {
                c.src += "?"
            } else {
                c.src += "&"
            }
            for (var j in f) {
                if (typeof f[j] != "function") {
                    g = f[j];
                    c.src += j + "=" + encodeURIComponent(g) + "&"
                }
            }
            c.src.replace(/&$/, "");
            e = '<object id="' + c.id + '" codebase="https://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0"  name="' + c.name + '" width="' + c.width + '" height="' + c.height + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="movie" value="' + c.src + '"></param><param name="allowScriptAccess" value="' + c.allowScriptAccess + '"></param><param name="allowFullScreen" value="' + c.allowFullScreen + '"></param><param name="wmode" value="' + c.wmode + '"></param>';
            l = "<embed ";
            for (var j in c) {
                if (j.toUpperCase() === "FLASHVARS") {
                    continue
                }
                if (typeof c[j] != "function") {
                    l += j + '="' + c[j] + '" '
                }
            }
            l += ' pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash"></embed>';
            m = e + l;
            m += "</object>";
            if (a.browser.mozilla || a.browser.webkit || a.browser.opera) {
                m = l
            }
            if (h === null) {
                return m
            }
            h.get(0).innerHTML = m;
            if (k !== false) {
                h.append(a("<div/>").attr("id", c.id + "_cc").css({
                    width: "100%",
                    height: "100%",
                    backgroundColor: (a.browser.msie && jQuery.browser.version < 9) ? "#000": "transparent",
                    filter: "alpha(opacity = 0.1)",
                    position: "absolute",
                    top: 0,
                    left: 0
                }))
            }
            return a("#" + c.id)[0]
        },
        parseTemplate: function(c, e, d) {
            if (e === undefined || e.length == 0 || typeof e != "object") {
                return c
            }
            for (var b in e) {
                c = c.replace(new RegExp("%{" + b + "}", "gi"), ((d === true) ? window.encodeURIComponent(e[b]) : e[b]))
            }
            c = c.replace(/%{(.*?)}/gi, "");
            return c
        },
        stretch: function(f, g, n, l, d, h) {
            if (g == null) {
                return false
            }
            if ((g instanceof a) == false) {
                g = a(g)
            }
            if (g.data("od") == null) {
                g.data("od", {
                    width: g.width(),
                    height: g.height()
                })
            }
            var e = (d !== undefined) ? d: g.data("od").width,
            b = (h !== undefined) ? h: g.data("od").height,
            j = (n / e),
            m = (l / b),
            c = n,
            k = l;
            switch (f) {
            case "none":
                c = e;
                k = b;
                break;
            case "fill":
                if (j > m) {
                    c = e * j;
                    k = b * j
                } else {
                    if (j < m) {
                        c = e * m;
                        k = b * m
                    }
                }
                break;
            case "aspectratio":
            default:
                if (j > m) {
                    c = e * m;
                    k = b * m
                } else {
                    if (j < m) {
                        c = e * j;
                        k = b * j
                    }
                }
                break
            }
            n = $p.utils.roundNumber((c / n) * 100, 0);
            l = $p.utils.roundNumber((k / l) * 100, 0);
            if (n == 0 || l == 0) {
                return false
            }
            g.css({
                margin: 0,
                padding: 0,
                width: n + "%",
                height: l + "%",
                left: (100 - n) / 2 + "%",
                top: (100 - l) / 2 + "%"
            });
            if (g.data("od").width != g.width() || g.data("od").height != g.height()) {
                return true
            }
            return false
        },
        parseUri: function(f) {
            var e = {
                strictMode: false,
                key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
                q: {
                    name: "queryKey",
                    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                },
                parser: {
                    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
                }
            },
            b = e.parser[e.strictMode ? "strict": "loose"].exec(f),
            d = {},
            c = 14;
            while (c--) {
                d[e.key[c]] = b[c] || ""
            }
            d[e.q.name] = {};
            d[e.key[12]].replace(e.q.parser,
            function(h, g, j) {
                if (g) {
                    d[e.q.name][g] = j
                }
            });
            return d
        },
        log: function() {
            if (this.logging == false) {
                return
            }
            this.history = this.history || [];
            this.history.push(arguments);
            if (window.console) {
                console.log(Array.prototype.slice.call(arguments))
            }
        },
        cleanResponse: function(d, b) {
            var c = false;
            switch (b) {
            case "html":
            case "xml":
                if (window.DOMParser) {
                    c = new DOMParser();
                    c = c.parseFromString(d, "text/xml")
                } else {
                    c = new ActiveXObject("Microsoft.XMLDOM");
                    c.async = "false";
                    c.loadXML(d)
                }
                break;
            case "json":
                c = d;
                if (typeof c == "string") {
                    c = a.parseJSON(c)
                }
                break;
            case "jsonp":
                break;
            default:
                c = d;
                break
            }
            return c
        },
        logging: false
    }
});
var projekktorPluginInterface = function() {};
jQuery(function(a) {
    projekktorPluginInterface.prototype = {
        pluginReady: false,
        name: "",
        pp: {},
        config: {},
        playerDom: null,
        canvas: {
            media: null,
            projekktor: null
        },
        _appliedDOMObj: [],
        _init: function(b) {
            this.config = a.extend(true, this.config, b);
            this.initialize()
        },
        getConfig: function(c, d) {
            var b = null,
            e = d || null;
            if (this.pp.getConfig("plugin_" + this.name) != null) {
                b = this.pp.getConfig("plugin_" + this.name)[c]
            }
            if (b == null) {
                b = this.pp.getConfig(c)
            }
            if (b == null) {
                b = this.config[c]
            }
            if (typeof b == "object" && b.length === null) {
                b = a.extend(true, {},
                b, this.config[c])
            } else {
                if (typeof b == "object") {
                    b = a.extend(true, [], b || [], this.config[c] || [])
                }
            }
            return (b == null) ? e: b
        },
        getDA: function(b) {
            return "data-" + this.pp.getNS() + "-" + this.name + "-" + b
        },
        getCN: function(b) {
            return this.pp.getNS() + b
        },
        sendEvent: function(b, c) {
            this.pp._promote({
                _plugin: this.name,
                _event: b
            },
            c)
        },
        deconstruct: function() {
            this.pluginReady = false;
            a.each(this._appliedDOMObj,
            function() {
                a(this).remove()
            })
        },
        applyToPlayer: function(e, d) {
            var b = this.pp.getNS();
            if (!e) {
                return null
            }
            if (this.playerDom.find("." + b + e.attr("class")).length == 0) {
                var c = e.attr("class");
                e.removeClass(c);
                e.addClass(b + c);
                if (d === true) {
                    e.prependTo(this.playerDom)
                } else {
                    e.appendTo(this.playerDom)
                }
                this._appliedDOMObj.push(e);
                return e
            }
            var c = e.attr("class");
            e = this.playerDom.find("." + b + e.attr("class"));
            e.removeClass(c);
            e.addClass(b + c);
            return e
        },
        getElement: function(b) {
            return this.pp.env.playerDom.find("." + this.pp.getNS() + b)
        },
        setActive: function(d, b) {
            var c = (typeof d == "object") ? d: this.getElement(d);
            if (b != false) {
                c.addClass("active").removeClass("inactive")
            } else {
                c.addClass("inactive").removeClass("active")
            }
            c.css("display", "");
            return c
        },
        initialize: function() {},
        isReady: function() {
            return this.pluginReady
        }
    }
});
projekktorConfig.prototype = {
    "_cookieName": "qwprojaaekktor",
    "_cookieExpiry": 356,
    "_plugins": ["Display", "Controlbar"],
    "_addplugins": [],
    "_reelParser": null,
    "_ns": "pp",
    "_platforms": ["browser", "android", "ios", "native", "flash"],
    "_iframe": false,
    "_ignoreAttributes": false,
    "_loop": false,
    "_autoplay": false,
    "_continuous": true,
    "_playlist": [],
    "_theme": {
        "id": "projekktor",
        "baseURL": ".\/"
    },
    "_themeRepo": false,
    "_messages": {
        "0": "An error occurred.",
        "1": "You aborted the media playback. ",
        "2": "A network error caused the media download to fail part-way. ",
        "3": "The media playback was aborted due to a corruption problem. ",
        "4": "The media (%{title}) could not be loaded because the server or network failed.",
        "5": "Sorry, your browser does not support the media format of the requested file.",
        "6": "Your client is in lack of the Flash Plugin V%{flashver} or higher.",
        "7": "No media scheduled.",
        "8": "! Invalid media model configured !",
        "9": "File (%{file}) not found.",
        "10": "Invalid or missing quality settings for %{title}.",
        "11": "Invalid streamType and\/or streamServer settings for %{title}.",
        "12": "Invalid or inconsistent quality setup for %{title}.",
        "80": "The requested file does not exist.",
        "97": "No media scheduled.",
        "98": "Invalid or malformed playlist data!",
        "99": "Click display to proceed. ",
        "100": "PLACEHOLDER",
        "500": "This Youtube video has been removed or set to private",
        "501": "The Youtube user owning this video disabled embedding.",
        "502": "Invalid Youtube Video-Id specified."
    },
    "_debug": false,
    "_width": 0,
    "_height": 0,
    "_minHeight": 40,
    "_minWidth": 40,
    "_keys": [],
    "_enableNativePlatform": true,
    "_enableFlashPlatform": true,
    "_enableIosPlatform": true,
    "_enableBrowserPlatform": true,
    "_isCrossDomain": false,
    "ID": 0,
    "title": null,
    "poster": false,
    "controls": false,
    "start": false,
    "stop": false,
    "volume": 0.5,
    "cover": "",
    "disablePause": false,
    "disallowSkip": false,
    "fixedVolume": false,
    "imageScaling": "aspectratio",
    "videoScaling": "aspectratio",
    "playerFlashMP4": "jarisplayer.swf",
    "playerFlashMP3": "jarisplayer.swf",
    "streamType": "http",
    "streamServer": "",
    "useYTIframeAPI": true,
    "enableKeyboard": true,
    "enableFullscreen": true,
    "playbackQuality": "default",
    "_playbackQualities": [{
        "key": "small",
        "minHeight": 240,
        "minWidth": 240
    },
    {
        "key": "medium",
        "minHeight": 360,
        "minWidth": [{
            "ratio": 1.77,
            "minWidth": 640
        },
        {
            "ratio": 1.33,
            "minWidth": 480
        }]
    },
    {
        "key": "large",
        "minHeight": 480,
        "minWidth": [{
            "ratio": 1.77,
            "minWidth": 853
        },
        {
            "ratio": 1.33,
            "minWidth": 640
        }]
    },
    {
        "key": "hd1080",
        "minHeight": 1080,
        "minWidth": [{
            "ratio": 1.77,
            "minWidth": 1920
        },
        {
            "ratio": 1.33,
            "minWidth": 1440
        }]
    },
    {
        "key": "hd720",
        "minHeight": 720,
        "minWidth": [{
            "ratio": 1.77,
            "minWidth": 1280
        },
        {
            "ratio": 1.33,
            "minWidth": 960
        }]
    },
    {
        "key": "highres",
        "minHeight": 1081,
        "minWidth": 0
    }],
    "enableTestcard": true,
    "skipTestcard": false,
    "duration": 0,
    "className": ""
};
jQuery(function(a) {
    $p.newModel({
        modelId: "VIDEOFLASH",
        flashVersion: 9,
        iLove: [{
            ext: "flv",
            type: "video/x-flv",
            platform: "flash",
            streamType: ["http", "pseudo", "rtmp"],
            fixed: true
        },
        {
            ext: "flv",
            type: "video/flv",
            platform: "flash",
            streamType: ["http", "pseudo", "rtmp"],
            fixed: true
        },
        {
            ext: "mp4",
            type: "video/mp4",
            platform: "flash",
            streamType: ["http", "pseudo", "rtmp"],
            fixed: "maybe"
        },
        {
            ext: "mov",
            type: "video/quicktime",
            streamType: ["http", "pseudo", "rtmp"],
            platform: "flash"
        },
        {
            ext: "m4v",
            type: "video/mp4",
            platform: "flash",
            streamType: ["http", "pseudo", "rtmp"],
            fixed: "maybe"
        },
        {
            ext: "f4m",
            type: "video/abst",
            platform: "flash",
            streamType: ["httpVideoLive"]
        }],
        _eventMap: {
            onprogress: "progressListener",
            ontimeupdate: "timeListener",
            ondatainitialized: "metaDataListener",
            onconnectionsuccess: "startListener",
            onplaypause: "_playpauseListener",
            onplaybackfinished: "endedListener",
            onmute: "volumeListener",
            onvolumechange: "volumeListener",
            onbuffering: "waitingListener",
            onnotbuffering: "canplayListener",
            onconnectionfailed: "errorListener"
        },
        isPseudoStream: false,
        allowRandomSeek: false,
        flashVerifyMethod: "api_get",
        _jarisVolume: 0,
        applyMedia: function(b) {
            var c = {
                id: this.pp.getMediaId() + "_flash",
                name: this.pp.getMediaId() + "_flash",
                src: this.pp.getConfig("playerFlashMP4"),
                width: "100%",
                height: "100%",
                allowScriptAccess: "always",
                allowFullScreen: "false",
                allowNetworking: "all",
                wmode: (a.browser.msie) ? "transparent": "opaque",
                bgcolor: "#000000",
                FlashVars: {
                    type: "video",
                    streamtype: (this.pp.getConfig("streamType") != "rtmp") ? "file": "rtmp",
                    server: (this.pp.getConfig("streamType") == "rtmp") ? this.pp.getConfig("streamServer") : "",
                    autostart: "false",
                    hardwarescaling: "true",
                    controls: "false",
                    jsapi: "true",
                    aspectratio: this.pp.getConfig("videoScaling")
                }
            };
            switch (this.pp.getConfig("streamType")) {
            case "rtmp":
                this.allowRandomSeek = true;
                this.media.loadProgress = 100;
                break;
            case "pseudo":
                this.isPseudoStream = true;
                this.allowRandomSeek = true;
                this.media.loadProgress = 100;
                break
            }
            this.createFlash(c, b)
        },
        applySrc: function() {
            var c = this,
            b = this.getSource();
            this.mediaElement.api_source(b[0].src);
            this.seekedListener();
            if (this.getState("PLAYING")) {
                this.setPlay();
                if (c.isPseudoStream !== true) {
                    this.setSeek(this.media.position || 0)
                }
            }
        },
        addListeners: function() {
            if (this.mediaElement == null) {
                return
            }
            var b = this;
            a.each(this._eventMap,
            function(c, d) {
                b.mediaElement.api_addlistener(c, "projekktor('" + b.pp.getId() + "').playerModel." + d)
            })
        },
        removeListeners: function() {
            try {
                this.mediaElement.api_removelistener("*")
            } catch(b) {}
        },
        flashReadyListener: function() {
            this.applySrc();
            this.displayReady()
        },
        errorListener: function(b) {
            this.setTestcard(4)
        },
        volumeListener: function(b) {
            if (this._jarisVolume != b.volume) {
                this._jarisVolume = b.volume;
                this.sendUpdate("volume", b.volume)
            }
        },
        _playpauseListener: function(b) {
            if (b.isplaying) {
                if (this.getModelName().indexOf("AUDIO") > -1) {
                    this.setSeek(this.media.position)
                }
                this.playingListener()
            } else {
                this.pauseListener()
            }
        },
        metaDataListener: function(c) {
            this.applyCommand("volume", this.pp.getConfig("volume"));
            try {
                this.mediaElement.api_seek(this.media.position || 0)
            } catch(b) {}
            this._setState("playing");
            if (this.modelId.indexOf("AUDIO") > -1) {
                this.mediaElement.api_removelistener("ondatainitialized");
                return
            }
            try {
                this.videoWidth = c.width;
                this.videoHeight = c.height;
                this.sendUpdate("scaled", {
                    width: this.videoWidth,
                    height: this.videoHeight
                })
            } catch(b) {}
        },
        startListener: function(c) {
            this.applyCommand("volume", this.pp.getConfig("volume"));
            try {
                this.mediaElement.api_seek(this.media.position || 0)
            } catch(b) {}
            this._setState("playing")
        },
        setSeek: function(c) {
            if (this.isPseudoStream) {
                this.media.offset = c;
                this.timeListener({
                    position: 0
                });
                this.applySrc()
            } else {
                try {
                    this.mediaElement.api_seek(c)
                } catch(b) {}
                this.seekedListener();
                this.timeListener({
                    position: c
                })
            }
        },
        setVolume: function(b) {
            this._volume = b;
            try {
                this.mediaElement.api_volume(b)
            } catch(c) {
                return false
            }
            return b
        },
        setPause: function(b) {
            try {
                this.mediaElement.api_pause()
            } catch(c) {}
        },
        setPlay: function(b) {
            try {
                this.mediaElement.api_play()
            } catch(c) {}
        },
        getVolume: function() {
            return this._jarisVolume
        },
        detachMedia: function() {
            try {
                a(this.mediaElement).remove()
            } catch(b) {}
        }
    });
    $p.newModel({
        modelId: "AUDIOFLASH",
        iLove: [{
            ext: "mp3",
            type: "audio/mp3",
            platform: "flash",
            streamType: ["http"]
        },
        {
            ext: "mp3",
            type: "audio/mpeg",
            platform: "flash",
            streamType: ["http"]
        },
        {
            ext: "m4a",
            type: "audio/mp4",
            platform: "flash",
            streamType: ["http"]
        }],
        applyMedia: function(b) {
            $p.utils.blockSelection(b);
            this.imageElement = this.applyImage(this.pp.getConfig("cover") || this.pp.getConfig("poster"), b);
            var c = a("#" + this.pp.getMediaId() + "_flash_container");
            if (c.length == 0) {
                c = a(document.createElement("div")).css({
                    width: "1px",
                    height: "1px"
                }).attr("id", this.pp.getMediaId() + "_flash_container").prependTo(this.pp.getDC())
            }
            var d = {
                id: this.pp.getMediaId() + "_flash",
                name: this.pp.getMediaId() + "_flash",
                src: this.pp.getConfig("playerFlashMP3"),
                width: "1px",
                height: "1px",
                allowScriptAccess: "always",
                allowFullScreen: "false",
                allowNetworking: "all",
                wmode: "transparent",
                bgcolor: "#000000",
                FlashVars: {
                    type: "audio",
                    streamtype: "file",
                    server: "",
                    autostart: "false",
                    hardwarescaling: "false",
                    controls: "false",
                    jsapi: "true"
                }
            };
            this.createFlash(d, c, false)
        }
    },
    "VIDEOFLASH")
});
jQuery(function(a) {
    $p.newModel({
        modelId: "VIDEO",
        androidVersion: 2,
        iosVersion: 3,
        nativeVersion: 0,
        iLove: [{
            ext: "mp4",
            type: "video/mp4",
            platform: ["ios", "android", "native"],
            streamType: ["http", "pseudo", "httpVideo"],
            fixed: "maybe"
        },
        {
            ext: "ogv",
            type: "video/ogg",
            platform: "native",
            streamType: ["http", "httpVideo"]
        },
        {
            ext: "webm",
            type: "video/webm",
            platform: "native",
            streamType: ["http", "httpVideo"]
        },
        {
            ext: "ogg",
            type: "video/ogg",
            platform: "native",
            streamType: ["http", "httpVideo"]
        },
        {
            ext: "anx",
            type: "video/ogg",
            platform: "native",
            streamType: ["http", "httpVideo"]
        }],
        _eventMap: {
            pause: "pauseListener",
            play: "playingListener",
            volumechange: "volumeListener",
            progress: "progressListener",
            timeupdate: "timeListener",
            ended: "_ended",
            waiting: "waitingListener",
            canplaythrough: "canplayListener",
            canplay: "canplayListener",
            error: "errorListener",
            suspend: "suspendListener",
            seeked: "seekedListener",
            loadstart: null
        },
        allowRandomSeek: false,
        videoWidth: 0,
        videoHeight: 0,
        wasPersistent: true,
        isPseudoStream: false,
        applyMedia: function(c) {
            var b = this;
            if (a("#" + this.pp.getMediaId() + "_html").length == 0) {
                this.wasPersistent = false;
                c.html("").append(a("<video/>").attr({
                    id: this.pp.getMediaId() + "_html",
                    poster: (this.pp.getIsMobileClient("ANDROID")) ? this.getPoster() : $p.utils.imageDummy(),
                    loop: false,
                    autoplay: false,
                    "x-webkit-airplay": "allow"
                }).prop({
                    controls: (this.hasGUI || (this.pp.getIsMobileClient() && this.pp.getItemIdx() > 0)),
                    volume: this.getVolume()
                }).css({
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0
                }))
            }
            this.mediaElement = a("#" + this.pp.getMediaId() + "_html");
            this.applySrc()
        },
        applySrc: function() {
            var e = this,
            c = e.getState("PLAYING"),
            b = e.getState("AWAKENING");
            this.removeListener("error");
            this.removeListener("play");
            this.removeListener("loadstart");
            this.removeListener("canplay");
            this.mediaElement.find("source").remove();
            a.each(this.getSource(),
            function() {
                a("<source/>").appendTo(e.mediaElement).attr({
                    src: this.src,
                    type: this.type
                })
            });
            var d = function() {
                e.removeListener("canplay", "qs");
                e.removeListener("loadstart", "qs");
                e.addListeners("error");
                e.addListeners("play");
                e.addListeners("loadstart");
                e.addListeners("canplay");
                e.mediaElement = a("#" + e.pp.getMediaId() + "_html");
                if (b) {
                    e.displayReady();
                    return
                }
                if (e.getState("SEEKING")) {
                    if (e._isPlaying) {
                        e.setPlay()
                    }
                    e.seekedListener();
                    return
                }
                if (!e.isPseudoStream) {
                    e.setSeek(e.media.position || 0)
                }
                if (e._isPlaying) {
                    e.setPlay()
                }
            };
            if (!a.browser.msie) {
                this.mediaElement.bind("loadstart.projekktorqs" + this.pp.getId(), d)
            } else {
                this.mediaElement.bind("canplay.projekktorqs" + this.pp.getId(), d)
            }
            this.mediaElement[0].load()
        },
        detachMedia: function() {
            try {
                this.mediaElement[0].pause()
            } catch(b) {}
        },
        addListeners: function(e, c) {
            if (this.mediaElement == null) {
                return
            }
            var f = (c != null) ? ".projekktor" + c + this.pp.getId() : ".projekktor" + this.pp.getId(),
            d = this,
            b = (e == null) ? "*": e;
            a.each(this._eventMap,
            function(g, h) {
                if ((g == b || b == "*") && h != null) {
                    d.mediaElement.bind(g + f,
                    function(i) {
                        d[h](this, i)
                    })
                }
            })
        },
        removeListener: function(b, c) {
            if (this.mediaElement == null) {
                return
            }
            var e = (c != null) ? ".projekktor" + c + this.pp.getId() : ".projekktor" + this.pp.getId(),
            d = this;
            a.each(this._eventMap,
            function(f, g) {
                if (f == b) {
                    d.mediaElement.unbind(f + e)
                }
            })
        },
        _ended: function() {
            var d = this.mediaElement[0].duration,
            b = (Math.round(this.media.position) === Math.round(d)),
            c = ((d - this.media.maxpos) < 2) && (this.media.position === 0) || false;
            if (b || c || this.isPseudoStream) {
                this.endedListener(this)
            } else {
                this.pauseListener(this)
            }
        },
        playingListener: function(c) {
            var b = this; (function() {
                try {
                    if (b.mediaElement[0].currentSrc != "" && b.mediaElement[0].networkState == b.mediaElement[0].NETWORK_NO_SOURCE && b.getDuration() == 0) {
                        b.setTestcard(80);
                        return
                    }
                    if (b.getDuration() == 0) {
                        setTimeout(arguments.callee, 500);
                        return
                    }
                    if (b.media.type.indexOf("/ogg") > -1 || b.media.type.indexOf("/webm") > -1) {
                        b.allowRandomSeek = true
                    }
                } catch(d) {}
            })();
            this._setState("playing")
        },
        errorListener: function(d, b) {
            try {
                switch (event.target.error.code) {
                case event.target.error.MEDIA_ERR_ABORTED:
                    this.setTestcard(1);
                    break;
                case event.target.error.MEDIA_ERR_NETWORK:
                    this.setTestcard(2);
                    break;
                case event.target.error.MEDIA_ERR_DECODE:
                    this.setTestcard(3);
                    break;
                case event.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    this.setTestcard(4);
                    break;
                default:
                    this.setTestcard(5);
                    break
                }
            } catch(c) {}
        },
        canplayListener: function(c) {
            var b = this;
            if (this.pp.getConfig("streamType") == "pseudo") {
                a.each(this.media.file,
                function() {
                    if (this.src.indexOf(b.mediaElement[0].currentSrc) > -1) {
                        if (this.type == "video/mp4") {
                            b.isPseudoStream = true;
                            b.allowRandomSeek = true;
                            b.media.loadProgress = 100;
                            return false
                        }
                    }
                })
            }
            this._setBufferState("full")
        },
        setPlay: function() {
            try {
                this.mediaElement[0].play()
            } catch(b) {}
        },
        setPause: function() {
            try {
                this.mediaElement[0].pause()
            } catch(b) {}
        },
        setVolume: function(b) {
            this._volume = b;
            try {
                this.mediaElement.prop("volume", b)
            } catch(c) {
                return false
            }
            return b
        },
        setSeek: function(c) {
            if (this.isPseudoStream) {
                this.media.position = 0;
                this.media.offset = c;
                this.timeListener();
                this.applySrc();
                return
            }
            var b = this; (function() {
                try {
                    b.mediaElement[0].currentTime = c;
                    b.timeListener({
                        position: c
                    })
                } catch(d) {
                    if (b.mediaElement != null) {
                        setTimeout(arguments.callee, 100)
                    }
                }
            })()
        },
        setFullscreen: function(b) {
            if (this.element == "audio") {
                return
            }
            this._scaleVideo()
        },
        setResize: function() {
            if (this.element == "audio") {
                return
            }
            this._scaleVideo(false)
        }
    });
    $p.newModel({
        modelId: "AUDIO",
        iLove: [{
            ext: "ogg",
            type: "audio/ogg",
            platform: "native",
            streamType: ["http"]
        },
        {
            ext: "oga",
            type: "audio/ogg",
            platform: "native",
            streamType: ["http"]
        },
        {
            ext: "mp3",
            type: "audio/mp3",
            platform: ["ios", "android", "native"],
            streamType: ["http"]
        },
        {
            ext: "mp3",
            type: "audio/mpeg",
            platform: ["ios", "android", "native"],
            streamType: ["http"]
        }],
        imageElement: {},
        applyMedia: function(c) {
            var b = this;
            $p.utils.blockSelection(c);
            this.imageElement = this.applyImage(this.pp.getConfig("cover") || this.pp.getConfig("poster"), c);
            this.imageElement.css({
                border: "0px"
            });
            var d = a("#" + this.pp.getMediaId() + "_audio_container");
            if (d.length == 0) {
                d = a(document.createElement("div")).css({
                    width: "1px",
                    height: "1px"
                }).attr("id", this.pp.getMediaId() + "_audio_container").prependTo(this.pp.getDC())
            }
            d.html("").append(a("<audio/>").attr({
                id: this.pp.getMediaId() + "_html",
                poster: $p.utils.imageDummy(),
                loop: false,
                autoplay: false,
                "x-webkit-airplay": "allow"
            }).prop({
                controls: false,
                volume: this.getVolume()
            }).css({
                width: "1px",
                height: "1px",
                position: "absolute",
                top: 0,
                left: 0
            }));
            this.mediaElement = a("#" + this.pp.getMediaId() + "_html");
            this.applySrc()
        },
        setPosterLive: function() {
            if (this.imageElement.parent) {
                var b = this.imageElement.parent(),
                c = this;
                if (this.imageElement.attr("src") == c.pp.getConfig("poster")) {
                    return
                }
                this.imageElement.fadeOut("fast",
                function() {
                    a(this).remove();
                    c.imageElement = c.applyImage(c.pp.getConfig("poster"), b)
                })
            }
        }
    },
    "VIDEO");
    $p.newModel({
        modelId: "VIDEOHLS",
        androidVersion: 3,
        iosVersion: 4,
        iLove: [{
            ext: "m3u8",
            type: "application/x-mpegURL",
            platform: ["ios", "android"],
            streamType: ["http", "httpVideo", "httpVideoLive"]
        },
        {
            ext: "m3u",
            type: "application/x-mpegURL",
            platform: ["ios", "android"],
            streamType: ["http", "httpVideo", "httpVideoLive"]
        },
        {
            ext: "ts",
            type: "video/MP2T",
            platforms: ["ios", "android"],
            streamType: ["http", "httpVideo", "httpVideoLive"]
        }]
    },
    "VIDEO")
});
jQuery(function(a) {
    $p.newModel({
        modelId: "IMAGE",
        iLove: [{
            ext: "jpg",
            type: "image/jpeg",
            platform: "browser",
            streamType: ["http"]
        },
        {
            ext: "gif",
            type: "image/gif",
            platform: "browser",
            streamType: ["http"]
        },
        {
            ext: "png",
            type: "image/png",
            platform: "browser",
            streamType: ["http"]
        }],
        allowRandomSeek: true,
        _position: 0,
        _duration: 0,
        applyMedia: function(b) {
            this.mediaElement = this.applyImage(this.media.file[0].src, b.html(""));
            this._duration = this.pp.getConfig("duration");
            this._position = -1;
            this.displayReady();
            this._position = -0.5
        },
        setPlay: function() {
            var b = this;
            this._setBufferState("full");
            this.progressListener(100);
            this.playingListener();
            if (this._duration == 0) {
                b._setState("completed");
                return
            } (function() {
                if (b._position >= b._duration) {
                    b._setState("completed");
                    return
                }
                if (!b.getState("PLAYING")) {
                    return
                }
                b.timeListener({
                    duration: b._duration,
                    position: b._position
                });
                setTimeout(arguments.callee, 500);
                b._position += 0.5
            })()
        },
        detachMedia: function() {
            this.mediaElement.remove()
        },
        setPause: function() {
            this.pauseListener()
        },
        setSeek: function(b) {
            if (b < this._duration) {
                this._position = b
            }
        }
    });
    $p.newModel({
        modelId: "HTML",
        iLove: [{
            ext: "html",
            type: "text/html",
            platform: "browser",
            streamType: ["http"]
        }],
        applyMedia: function(c) {
            var b = this;
            this.mediaElement = a(document.createElement("iframe")).attr({
                id: this.pp.getMediaId() + "_iframe",
                name: this.pp.getMediaId() + "_iframe",
                src: this.media.file[0].src,
                scrolling: "no",
                frameborder: "0",
                width: "100%",
                height: "100%"
            }).css({
                overflow: "hidden",
                border: "0px",
                width: "100%",
                height: "100%"
            }).appendTo(c.html(""));
            this.mediaElement.load(function(d) {
                b.success()
            });
            this.mediaElement.error(function(d) {
                b.remove()
            });
            this._duration = this.pp.getConfig("duration")
        },
        success: function() {
            this.displayReady()
        },
        remove: function() {
            this.mediaElement.remove()
        }
    },
    "IMAGE")
});
jQuery(function(a) {
    $p.newModel({
        modelId: "YTVIDEO",
        iLove: [{
            ext: "youtube.com",
            type: "video/youtube",
            platform: "flash",
            fixed: "maybe"
        }],
        allowRandomSeek: true,
        useIframeAPI: true,
        flashVerifyMethod: "cueVideoById",
        _ffFix: false,
        _updateTimer: null,
        init: function(c) {
            var b = this;
            this.useIframeAPI = this.pp.getConfig("useYTIframeAPI") || this.pp.getIsMobileClient();
            this.hasGUI = this.pp.getIsMobileClient();
            if (!this.useIframeAPI) {
                this.requiresFlash = 8;
                this.ready();
                return
            }
            var d = this.pp.getId();
            if (window.ProjekktorYoutubePlayerAPIReady !== true) {
                a.getScript("http://www.youtube.com/player_api"); (function() {
                    try {
                        if (window.ProjekktorYoutubePlayerAPIReady == true) {
                            b.ready();
                            return
                        }
                        setTimeout(arguments.callee, 50)
                    } catch(f) {
                        setTimeout(arguments.callee, 50)
                    }
                })()
            } else {
                this.ready()
            }
            window.onYouTubePlayerAPIReady = function() {
                window.ProjekktorYoutubePlayerAPIReady = true
            }
        },
        applyMedia: function(f) {
            this._setBufferState("empty");
            var e = this,
            c = (this.modelId == "YTAUDIO") ? 1 : "100%",
            b = (this.modelId == "YTAUDIO") ? 1 : "100%";
            if (this.modelId == "YTAUDIO") {
                this.imageElement = this.applyImage(this.pp.getPoster(), f)
            }
            if (this.useIframeAPI) {
                f.html("").append(a("<div/>").attr("id", this.pp.getId() + "_media_youtube").css({
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0
                }));
                var d = a("<div/>").attr("id", this.pp.getId() + "_media_youtube_cc").css({
                    width: "100%",
                    height: "100%",
                    backgroundColor: (a.browser.msie) ? "#000": "transparent",
                    filter: "alpha(opacity = 0.1)",
                    position: "absolute",
                    top: 0,
                    left: 0
                });
                f.append(d);
                this.mediaElement = new YT.Player(this.pp.getId() + "_media_youtube", {
                    width: (this.pp.getIsMobileClient()) ? this.pp.config._width: c,
                    height: (this.pp.getIsMobileClient()) ? this.pp.config._height: b,
                    playerVars: {
                        autoplay: 0,
                        disablekb: 0,
                        version: 3,
                        start: 0,
                        controls: (this.pp.getIsMobileClient()) ? 1 : 0,
                        showinfo: 0,
                        enablejsapi: 1,
                        start: (this.media.position || 0),
                        origin: window.location.href,
                        wmode: "transparent",
                        modestbranding: 1
                    },
                    videoId: this.youtubeGetId(),
                    events: {
                        onReady: function(h) {
                            e.onReady(h)
                        },
                        onStateChange: function(h) {
                            e.stateChange(h)
                        },
                        onError: function(h) {
                            e.errorListener(h)
                        }
                    }
                })
            } else {
                var g = {
                    id: this.pp.getId() + "_media_youtube",
                    name: this.pp.getId() + "_media_youtube",
                    src: "http://www.youtube.com/apiplayer",
                    width: (this.pp.getIsMobileClient()) ? this.pp.config._width: c,
                    height: (this.pp.getIsMobileClient()) ? this.pp.config._height: b,
                    bgcolor: "#000000",
                    allowScriptAccess: "always",
                    wmode: "transparent",
                    FlashVars: {
                        enablejsapi: 1,
                        autoplay: 0,
                        version: 3,
                        modestbranding: 1,
                        showinfo: 0
                    }
                };
                this.createFlash(g, f)
            }
        },
        flashReadyListener: function() {
            this._youtubeResizeFix();
            this.addListeners();
            this.mediaElement.cueVideoById(this.youtubeGetId(), this.media.position || 0, this._playbackQuality)
        },
        _youtubeResizeFix: function() {
            this.applyCommand("volume", this.pp.getConfig("volume"))
        },
        addListeners: function() {
            this.mediaElement.addEventListener("onStateChange", "projekktor('" + this.pp.getId() + "').playerModel.stateChange");
            this.mediaElement.addEventListener("onError", "projekktor('" + this.pp.getId() + "').playerModel.errorListener");
            this.mediaElement.addEventListener("onPlaybackQualityChange", "projekktor('" + this.pp.getId() + "').playerModel.qualityChangeListener")
        },
        setSeek: function(c) {
            try {
                this.mediaElement.seekTo(c, true);
                if (!this.getState("PLAYING")) {
                    this.timeListener({
                        position: this.mediaElement.getCurrentTime(),
                        duration: this.mediaElement.getDuration()
                    })
                }
            } catch(b) {}
        },
        setVolume: function(b) {
            try {
                this.mediaElement.setVolume(b * 100)
            } catch(c) {}
        },
        setPause: function(b) {
            try {
                this.mediaElement.pauseVideo()
            } catch(c) {}
        },
        setPlay: function(b) {
            try {
                this.mediaElement.playVideo()
            } catch(c) {}
        },
        setQuality: function(c) {
            try {
                this.mediaElement.setPlaybackQuality(c)
            } catch(b) {}
        },
        getVolume: function() {
            try {
                return this.mediaElement.getVolume()
            } catch(b) {}
            return 0
        },
        getPoster: function() {
            return this.media.config["poster"] || this.pp.config.poster || "http://img.youtube.com/vi/" + this.youtubeGetId() + "/0.jpg"
        },
        getPlaybackQuality: function() {
            try {
                return this.mediaElement.getPlaybackQuality()
            } catch(b) {
                return false
            }
        },
        getSrc: function() {
            return this.youtubeGetId() || null
        },
        errorListener: function(b) {
            switch ((b.data == undefined) ? b: b.data) {
            case 100:
                this.setTestcard(500);
                break;
            case 101:
            case 150:
                this.setTestcard(501);
                break;
            case 2:
                this.setTestcard(502);
                break
            }
        },
        stateChange: function(b) {
            clearTimeout(this._updateTimer);
            if (this.mediaElement === null || this.getState("COMPLETED")) {
                return
            }
            switch ((b.data == undefined) ? b: b.data) {
            case - 1 : this.setPlay();
                this.ffFix = true;
                break;
            case 0:
                if (this.getState("AWAKENING")) {
                    break
                }
                this._setBufferState("full");
                this.endedListener({});
                break;
            case 1:
                this._setBufferState("full");
                if ((this.media.position || 0) > 0 && (a.browser.mozilla) && this.ffFix) {
                    this.ffFix = false;
                    this.setSeek(this.media.position)
                }
                this.playingListener({});
                this.canplayListener({});
                this.updateInfo();
                break;
            case 2:
                this.pauseListener({});
                break;
            case 3:
                this.waitingListener({});
                break;
            case 5:
                if (this.useIframeAPI !== true) {
                    this.onReady()
                }
                break
            }
        },
        onReady: function() {
            this.setVolume(this.pp.getVolume());
            a("#" + this.pp.getId() + "_media").attr("ALLOWTRANSPARENCY", true).attr({
                scrolling: "no",
                frameborder: 0
            }).css({
                overflow: "hidden",
                display: "block",
                border: "0"
            });
            if (this.media.title || this.pp.config.title || this.pp.getIsMobileClient()) {
                this.displayReady();
                return
            }
            var b = this;
            a.ajax({
                url: "http://gdata.youtube.com/feeds/api/videos/" + this.youtubeGetId() + "?v=2&alt=jsonc",
                async: false,
                complete: function(f, c) {
                    try {
                        data = f.responseText;
                        if (typeof data == "string") {
                            data = a.parseJSON(data)
                        }
                        if (data.data.title) {
                            b.sendUpdate("config", {
                                title: data.data.title + " (" + data.data.uploader + ")"
                            })
                        }
                    } catch(d) {}
                    b.displayReady()
                }
            })
        },
        youtubeGetId: function() {
            return encodeURIComponent(this.media.file[0].src.replace(/^[^v]+v.(.{11}).*/, "$1"))
        },
        updateInfo: function() {
            var b = this;
            clearTimeout(this._updateTimer); (function() {
                if (b.mediaElement == null) {
                    clearTimeout(b._updateTimer);
                    return
                }
                try {
                    if (b.getState("PLAYING")) {
                        b.timeListener({
                            position: b.mediaElement.getCurrentTime(),
                            duration: b.mediaElement.getDuration()
                        });
                        b.progressListener({
                            loaded: b.mediaElement.getVideoBytesLoaded(),
                            total: b.mediaElement.getVideoBytesTotal()
                        });
                        b._updateTimer = setTimeout(arguments.callee, 500)
                    }
                } catch(c) {}
            })()
        }
    });
    $p.newModel({
        modelId: "YTAUDIO",
        iLove: [{
            ext: "youtube.com",
            type: "audio/youtube",
            platform: "flash",
            fixed: "maybe"
        }]
    },
    "YTVIDEO")
});
var playerModel = function() {};
jQuery(function(a) {
    playerModel.prototype = {
        modelId: "player",
        iLove: [],
        _currentState: null,
        _currentBufferState: null,
        _ap: false,
        _volume: 0,
        _quality: "default",
        _displayReady: false,
        _isPlaying: false,
        _id: null,
        _KbPerSec: 0,
        _bandWidthTimer: null,
        _isPoster: false,
        _isFullscreen: false,
        hasGUI: false,
        allowRandomSeek: false,
        flashVerifyMethod: "api_get",
        mediaElement: null,
        pp: {},
        media: {
            duration: 0,
            position: 0,
            maxpos: 0,
            offset: 0,
            file: false,
            poster: "",
            ended: false,
            loadProgress: 0,
            errorCode: 0
        },
        _init: function(b) {
            this.pp = b.pp || null;
            this.media = a.extend(true, {},
            this.media, b.media);
            this._ap = b.autoplay;
            this._id = $p.utils.randomId(8);
            this._quality = b.quality || this._quality;
            this._volume = this.pp.getVolume("volume");
            this._playbackQuality = this.pp.getPlaybackQuality();
            this.init()
        },
        init: function(b) {
            this.ready()
        },
        ready: function() {
            this.sendUpdate("modelReady");
            if (this._ap) {
                this._setState("awakening")
            } else {
                this.displayItem(false)
            }
        },
        displayItem: function(b) {
            if (b !== true || this.getState("STOPPED")) {
                this._setState("idle");
                this.applyImage(this.getPoster(), this.pp.getMediaContainer().html(""));
                this._isPoster = true;
                this.displayReady();
                return
            }
            a("#" + this.pp.getMediaId() + "_image").remove();
            if (this.hasGUI) {
                this.pp.env.playerDom.children().not("." + this.pp.getNS() + "display").addClass("inactive").removeClass("active")
            }
            this._displayReady = false;
            this._isPoster = false;
            a("#" + this.pp.getId() + "_testcard_media").remove();
            this.applyMedia(this.pp.getMediaContainer())
        },
        applyMedia: function() {},
        sendUpdate: function(b, c) {
            this.pp._modelUpdateListener(b, c)
        },
        displayReady: function() {
            this._displayReady = true;
            this.pp._modelUpdateListener("displayReady")
        },
        start: function() {
            var b = this;
            if (this.mediaElement == null && this.modelId != "PLAYLIST") {
                return
            }
            if (this.getState("STARTING")) {
                return
            }
            this._setState("STARTING");
            if (!this.getState("STOPPED")) {
                this.addListeners()
            }
            if (this.pp.getIsMobileClient("ANDROID") && !this.getState("PLAYING")) {
                setTimeout(function() {
                    b.setPlay()
                },
                500)
            }
            this.setPlay()
        },
        addListeners: function() {},
        removeListeners: function() {
            try {
                this.mediaElement.unbind(".projekktor" + this.pp.getId())
            } catch(b) {}
        },
        detachMedia: function() {},
        destroy: function() {
            this.removeListeners();
            this._setState("destroying");
            this.detachMedia();
            this.media.loadProgress = 0;
            this.media.playProgress = 0;
            this.media.position = 0;
            this.media.duration = 0
        },
        reInit: function() {
            if (this.flashVersion != false || !(a.browser.mozilla) || this.getState("ERROR") || this.pp.getConfig("bypassFlashFFFix") === true) {
                return
            }
            this.sendUpdate("FFreinit");
            this.removeListeners();
            this.displayItem((!this.getState("IDLE")))
        },
        applyCommand: function(c, b) {
            switch (c) {
            case "quality":
                this.setQuality(b);
                break;
            case "play":
                if (this.getState("ERROR")) {
                    break
                }
                if (this.getState("IDLE")) {
                    this._setState("awakening");
                    break
                }
                this.setPlay();
                break;
            case "pause":
                if (this.getState("ERROR")) {
                    break
                }
                this.setPause();
                break;
            case "volume":
                if (this.getState("ERROR")) {
                    break
                }
                if (!this.setVolume(b)) {
                    this._volume = b;
                    this.sendUpdate("volume", b)
                }
                break;
            case "stop":
                this.setStop();
                break;
            case "seek":
                if (this.getState("ERROR")) {
                    break
                }
                if (this.getState("SEEKING")) {
                    break
                }
                if (this.getState("IDLE")) {
                    break
                }
                if (this.media.loadProgress == -1) {
                    break
                }
                this._setState("seeking");
                this.sendUpdate("seek", b);
                this.setSeek(b);
                break;
            case "fullscreen":
                if (b == this._isFullscreen) {
                    break
                }
                this._isFullscreen = b;
                this.sendUpdate("fullscreen", this._isFullscreen);
                this.setFullscreen(b);
                this.reInit();
                break;
            case "resize":
                this.setResize();
                this.sendUpdate("resize", b);
                break
            }
        },
        setSeek: function(b) {},
        setPlay: function() {},
        setPause: function() {},
        setStop: function() {
            this.detachMedia();
            this._setState("stopped");
            this.displayItem(false)
        },
        setVolume: function(b) {},
        setFullscreen: function(b) {
            this.setResize()
        },
        setResize: function() {
            var b = this.pp.getMediaContainer();
            this.sendUpdate("scaled", {
                realWidth: this.videoWidth || null,
                realHeight: this.videoHeight || null,
                displayWidth: b.width(),
                displayHeight: b.height()
            })
        },
        setPosterLive: function() {},
        setQuality: function(c) {
            var b = [];
            if (this._quality == c) {
                return
            }
            this._quality = c;
            if (this.getState("PLAYING") || this.getState("PAUSED")) {
                this.applySrc()
            }
            this.qualityChangeListener()
        },
        applySrc: function() {},
        getSource: function() {
            var b = [],
            d = this.media.offset || this.pp.getConfig("start") || false,
            c = this;
            a.each(this.media.file || [],
            function() {
                if (c._quality != this.quality && c._quality != null) {
                    return true
                }
                var e = (c.pp.getConfig("streamType") == "pseudo") ? c.pp.getConfig("startParameter") : false;
                if (!e || !d) {
                    b.push(this);
                    return true
                }
                var f = $p.utils.parseUri(this.src),
                h = f.protocol + "://" + f.host + f.path,
                g = [];
                a.each(f.queryKey,
                function(i, j) {
                    if (i == e) {
                        return true
                    }
                    g.push(i + "=" + j)
                });
                h += (g.length > 0) ? "?" + g.join("&") + "&" + e + "=" + d: "?" + e + "=" + d;
                this.src = h;
                b.push(this);
                return true
            });
            if (b.length == 0) {
                return this.media.file
            } else {
                return b
            }
        },
        getVolume: function() {
            if (this.mediaElement == null) {
                return this._volume
            }
            return (this.mediaElement.prop("muted") == true) ? 0 : this.mediaElement.prop("volume")
        },
        getLoadProgress: function() {
            return this.media.loadProgress || 0
        },
        getLoadPlaybackProgress: function() {
            return this.media.playProgress || 0
        },
        getPosition: function() {
            return this.media.position || 0
        },
        getDuration: function() {
            return this.media.duration || 0
        },
        getMaxPosition: function() {
            return this.media.maxpos || 0
        },
        getPlaybackQuality: function() {
            return (a.inArray(this._quality, this.media.qualities) > -1) ? this._quality: "default"
        },
        getInFullscreen: function() {
            return this.pp.getInFullscreen()
        },
        getKbPerSec: function() {
            return this._KbPerSec
        },
        getState: function(c) {
            var b = (this._currentState == null) ? "IDLE": this._currentState;
            if (c != null) {
                return (b == c.toUpperCase())
            }
            return b
        },
        getSrc: function() {
            try {
                return this.mediaElement[0].currentSrc
            } catch(b) {}
            try {
                return this.media.file[0].src
            } catch(b) {}
            try {
                return this.getPoster()
            } catch(b) {}
            return null
        },
        getModelName: function() {
            return this.modelId || null
        },
        getHasGUI: function() {
            return (this.hasGUI && !this._isPoster)
        },
        getIsReady: function() {
            return this._displayReady
        },
        getPoster: function() {
            return this.pp.getConfig("poster")
        },
        getMediaElement: function() {
            return this.mediaElement || a("<video/>")
        },
        timeListener: function(e) {
            if (e == null) {
                return
            }
            var b = parseFloat(e.position) || parseFloat(e.currentTime) || this.media.position || 0,
            d = parseFloat(e.duration) || null,
            c = 0;
            if (isNaN(d + b)) {
                return
            }
            if (d != null && (d != this.media.duration && !this.isPseudoStream) || (this.isPseudoStream && this.media.duration == 0)) {
                this.media.duration = d;
                this.sendUpdate("durationChange", d)
            }
            this.media.position = this.media.offset + b;
            this.media.maxpos = Math.max(this.media.maxpos || 0, this.media.position || 0);
            this.media.playProgress = parseFloat((this.media.position > 0 && this.media.duration > 0) ? this.media.position * 100 / this.media.duration: 0);
            this.sendUpdate("time", this.media.position);
            this.loadProgressUpdate()
        },
        loadProgressUpdate: function() {
            try {
                var d = this.mediaElement.get(0);
                if (typeof d.buffered !== "object") {
                    return
                }
                if (typeof d.buffered.length <= 0) {
                    return
                }
                var b = Math.round(d.buffered.end(d.buffered.length - 1) * 100) / 100,
                c = b * 100 / this.media.duration;
                if (c == this.media.loadProgress) {
                    return
                }
                this.media.loadProgress = (this.allowRandomSeek === true) ? 100 : -1;
                this.media.loadProgress = (this.media.loadProgress < 100 || this.media.loadProgress == undefined) ? c: 100;
                this.sendUpdate("progress", this.media.loadProgress)
            } catch(f) {}
        },
        progressListener: function(h, c) {
            try {
                if (typeof this.mediaElement[0].buffered == "object") {
                    if (this.mediaElement[0].buffered.length > 0) {
                        this.mediaElement.unbind("progress");
                        return
                    }
                }
            } catch(g) {}
            if (this._bandWidthTimer == null) {
                this._bandWidthTimer = (new Date()).getTime()
            }
            var f = 0,
            d = 0;
            try {
                if (!isNaN(c.loaded / c.total)) {
                    f = c.loaded;
                    d = c.total
                } else {
                    if (c.originalEvent && !isNaN(c.originalEvent.loaded / c.originalEvent.total)) {
                        f = c.originalEvent.loaded;
                        d = c.originalEvent.total
                    }
                }
            } catch(g) {
                if (h && !isNaN(h.loaded / h.total)) {
                    f = h.loaded;
                    d = h.total
                }
            }
            var b = (f > 0 && d > 0) ? f * 100 / d: 0;
            if (Math.round(b) > Math.round(this.media.loadProgress)) {
                this._KbPerSec = ((f / 1024) / (((new Date()).getTime() - this._bandWidthTimer) / 1000))
            }
            b = (this.media.loadProgress !== 100) ? b: 100;
            b = (this.allowRandomSeek === true) ? 100 : b;
            if (this.media.loadProgress != b) {
                this.media.loadProgress = b;
                this.sendUpdate("progress", b)
            }
            if (this.media.loadProgress >= 100 && this.allowRandomSeek == false) {
                this._setBufferState("full")
            }
        },
        qualityChangeListener: function() {
            this.sendUpdate("qualityChange", this._quality)
        },
        endedListener: function(b) {
            if (this.mediaElement === null) {
                return
            }
            if (this.media.maxpos <= 0) {
                return
            }
            if (this.getState() == "STARTING") {
                return
            }
            this._setState("completed")
        },
        waitingListener: function(b) {
            this._setBufferState("empty")
        },
        canplayListener: function(b) {
            this._setBufferState("full")
        },
        canplaythroughListener: function(b) {
            this._setBufferState("full")
        },
        suspendListener: function(b) {
            this._setBufferState("full")
        },
        playingListener: function(b) {
            if (this.getSrc() == null) {}
            this._setState("playing")
        },
        startListener: function(b) {
            this.applyCommand("volume", this.pp.getConfig("volume"));
            if (!this.isPseudoStream) {
                this.setSeek(this.media.position || 0)
            }
            this._setState("playing")
        },
        pauseListener: function(b) {
            this._setState("paused")
        },
        seekedListener: function() {
            if (this._isPlaying) {
                this._setState("PLAYING")
            } else {
                this._setState("PAUSED")
            }
        },
        volumeListener: function(b) {
            this.sendUpdate("volume", this.getVolume())
        },
        flashReadyListener: function() {
            this._displayReady = true
        },
        errorListener: function(b, c) {},
        metaDataListener: function(c) {
            try {
                this.videoWidth = c.videoWidth;
                this.videoHeight = c.videoHeight
            } catch(b) {}
            this._scaleVideo()
        },
        setTestcard: function(f, b) {
            var e = this.pp.getMediaContainer(),
            d = this.pp.getConfig("messages"),
            c = (d[f] != undefined) ? d[f] : d[0];
            c = (b != undefined && b != "") ? b: c;
            if (this.pp.getItemCount() > 1) {
                c += d[99]
            }
            if (c.length < 3) {
                c = "ERROR"
            }
            if (f == 100) {
                c = b
            }
            c = $p.utils.parseTemplate(c, a.extend({},
            this.media, {
                title: this.pp.getConfig("title")
            }));
            e.html("").css({
                width: "100%",
                height: "100%"
            });
            this.mediaElement = a(document.createElement("div")).addClass(this.pp.getNS() + "testcard").attr("id", this.pp.getId() + "_testcard_media").appendTo(e);
            if (c.length > 0) {
                a(document.createElement("p")).appendTo(this.mediaElement).html(c)
            }
            this._setState("error")
        },
        applyImage: function(e, c) {
            var g = a(document.createElement("img")).hide(),
            f = this;
            $p.utils.blockSelection(g);
            if (e == "" || e == undefined) {
                return a(document.createElement("span")).attr({
                    id: this.pp.getMediaId() + "_image"
                }).appendTo(c)
            }
            g.html("").appendTo(c).attr({
                id: this.pp.getMediaId() + "_image",
                src: e,
                alt: this.pp.getConfig("title") || ""
            }).css({
                position: "absolute"
            });
            g.error(function(h) {
                a(this).remove()
            });
            var b = function(h) {
                h.realWidth = h.prop("width");
                h.realHeight = h.prop("height");
                h.width = function() {
                    return h.realWidth
                };
                h.height = function() {
                    return h.realHeight
                }
            };
            if (a.browser.msie) { (function() {
                    try {
                        if (g[0].complete == true) {
                            g.show();
                            b(g);
                            $p.utils.stretch(f.pp.getConfig("imageScaling"), g, c.width(), c.height());
                            return
                        }
                        setTimeout(arguments.callee, 100)
                    } catch(h) {
                        setTimeout(arguments.callee, 100)
                    }
                })()
            } else {
                g.load(function(h) {
                    g.show();
                    b(g);
                    $p.utils.stretch(f.pp.getConfig("imageScaling"), g, c.width(), c.height())
                })
            }
            var d = function(j, h) {
                return;
                if (h.is(":visible") === false) {
                    f.pp.removeListener("fullscreen", arguments.callee)
                }
                b(j);
                var i = h.width(),
                k = h.height(),
                l = j.width(),
                n = j.height();
                if ($p.utils.stretch(f.pp.getConfig("imageScaling"), j, h.width(), h.height())) {
                    try {
                        f.sendUpdate("scaled", {
                            realWidth: j._originalDimensions.width,
                            realHeight: j._originalDimensions.height,
                            displayWidth: f.mediaElement.width(),
                            displayHeight: f.mediaElement.height()
                        })
                    } catch(m) {}
                }
            };
            this.pp.addListener("fullscreen",
            function() {
                d(g, c)
            });
            this.pp.addListener("resize",
            function() {
                d(g, c)
            });
            return g
        },
        createFlash: function(d, b, c) {
            this.mediaElement = $p.utils.embeddFlash(b.html(""), d, c);
            this._waitforPlayer()
        },
        _waitforPlayer: function() {
            if (this._displayReady == true) {
                return
            }
            this._setBufferState("empty");
            var c = this,
            b = 0; (function() {
                if (b > 6 && a.browser.mozilla) {
                    b = 0;
                    var d = a(c.mediaElement).parent(),
                    g = a(c.mediaElement).clone();
                    d.html("").append(g);
                    c.mediaElement = g.get(0)
                }
                var d = c.mediaElement;
                if (a(d).attr("id").indexOf("testcard") > -1) {
                    return
                }
                b++;
                try {
                    if (d == undefined) {
                        setTimeout(arguments.callee, 200)
                    } else {
                        if (d[c.flashVerifyMethod] == undefined) {
                            setTimeout(arguments.callee, 200)
                        } else {
                            c._setBufferState("full");
                            c.flashReadyListener()
                        }
                    }
                } catch(f) {
                    setTimeout(arguments.callee, 200)
                }
            })()
        },
        _setState: function(c) {
            var b = this;
            c = c.toUpperCase();
            if (this._currentState != c) {
                if (this._currentState == "PAUSED" && c == "PLAYING") {
                    this.sendUpdate("resume", this.media);
                    this._isPlaying = true
                }
                if ((this._currentState == "IDLE" || this._currentState == "STARTING") && c == "PLAYING") {
                    this.sendUpdate("start", this.media);
                    this._isPlaying = true
                }
                if (c == "PAUSED") {
                    this._isPlaying = false
                }
                if (c == "ERROR") {
                    this.setPlay = function() {
                        b.sendUpdate("start")
                    }
                }
                this._currentState = c.toUpperCase();
                this.sendUpdate("state", this._currentState)
            }
        },
        _setBufferState: function(b) {
            if (this._currentBufferState != b.toUpperCase()) {
                this._currentBufferState = b.toUpperCase();
                this.sendUpdate("buffer", this._currentBufferState)
            }
        },
        _scaleVideo: function(h) {
            var d = this.pp.getMediaContainer();
            if (this.pp.getIsMobileClient()) {
                return
            }
            try {
                var f = d.width(),
                i = d.height(),
                b = this.videoWidth,
                c = this.videoHeight;
                if ($p.utils.stretch(this.pp.getConfig("videoScaling"), this.mediaElement, f, i, b, c)) {
                    this.sendUpdate("scaled", {
                        realWidth: b,
                        realHeight: c,
                        displayWidth: f,
                        displayHeight: i
                    })
                }
            } catch(g) {}
        }
    }
});
jQuery(function(a) {
    $p.newModel({
        modelId: "NA",
        iLove: [{
            ext: "NaN",
            type: "none/none",
            platform: "browser"
        }],
        hasGUI: true,
        applyMedia: function(c) {
            c.html("");
            var b = this;
            this.mouseClick = function() {
                b.pp.removeListener("leftclick", arguments.callee);
                b._setState("completed")
            };
            this.displayReady();
            if (this.pp.getConfig("skipTestcard") && this.pp.getItemCount > 1) {
                b._setState("completed");
                return
            }
            if (this.pp.getConfig("enableTestcard") && !this.pp.getIsMobileClient()) {
                this.setTestcard((this.media.file[0].src != null && this.media.errorCode === 7) ? 5 : this.media.errorCode);
                this.pp.addListener("leftclick", mouseClick)
            } else {
                this.applyCommand("stop");
                window.location.href = this.media.file[0].src
            }
        },
        detachMedia: function() {
            this.pp.removeListener("leftclick", this.mouseClick)
        }
    })
});
jQuery(function(a) {
    $p.newModel({
        modelId: "PLAYLIST",
        iLove: [{
            ext: "json",
            type: "text/json",
            platform: "browser"
        },
        {
            ext: "jsonp",
            type: "text/jsonp",
            platform: "browser"
        },
        {
            ext: "xml",
            type: "text/xml",
            platform: "browser"
        },
        {
            ext: "json",
            type: "application/json",
            platform: "browser"
        },
        {
            ext: "jsonp",
            type: "application/jsonp",
            platform: "browser"
        },
        {
            ext: "xml",
            type: "application/xml",
            platform: "browser"
        }],
        applyMedia: function(b) {
            this.displayReady()
        },
        setPlay: function() {
            this.sendUpdate("playlist", this.media)
        }
    })
});
var projekktorDisplay = function() {};
jQuery(function(a) {
    projekktorDisplay.prototype = {
        logo: null,
        logoIsFading: false,
        display: null,
        displayClicks: 0,
        buffIcn: null,
        buffIcnSprite: null,
        bufferDelayTimer: null,
        _controlsDims: null,
        config: {
            displayClick: {
                callback: "setPlayPause",
                value: null
            },
            displayPlayingClick: {
                callback: "setPlayPause",
                value: null
            },
            displayDblClick: {
                callback: null,
                value: null
            },
            staticControls: false,
            bufferIconDelay: 1000,
            designMode: false,
            spriteUrl: "",
            spriteWidth: 50,
            spriteHeight: 50,
            spriteTiles: 25,
            spriteOffset: 1,
            spriteCountUp: false,
            logoImage: "",
            logoDelay: 1,
            logoPosition: "tl",
            logoClick: false
        },
        initialize: function() {
            var b = this;
            this.display = this.applyToPlayer(a(document.createElement("div")).addClass("display"));
            this.buffIcn = this.applyToPlayer(a(document.createElement("div")).addClass("buffering")).addClass("inactive");
            if (this.config.spriteUrl != "") {
                this.buffIcnSprite = a(document.createElement("div")).appendTo(this.buffIcn).css({
                    width: this.config.spriteWidth,
                    height: this.config.spriteHeight,
                    marginLeft: ((this.buffIcn.width() - this.config.spriteWidth) / 2) + "px",
                    marginTop: ((this.buffIcn.height() - this.config.spriteHeight) / 2) + "px",
                    backgroundColor: "transparent",
                    backgroundImage: "url(" + this.config.spriteUrl + ")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "0 0"
                }).addClass("inactive")
            }
            this.startButton = this.applyToPlayer(a(document.createElement("div")).addClass("start")).addClass("inactive");
            this.pp.getMediaContainer();
            this.logo = this.applyToPlayer(a("<img/>").addClass("logo").addClass("inactive").attr("src", $p.utils.imageDummy()).css("position", "absolute").css(((this.getConfig("logoPosition").indexOf("r") > -1) ? "right": "left"), "2%").css(((this.getConfig("logoPosition").indexOf("t") > -1) ? "top": "bottom"), "2%"));
            this.pluginReady = true
        },
        displayReadyHandler: function() {
            var b = this;
            this.startButton.unbind().click(function() {
                b.pp.setPlay()
            });
            this.hideStartButton();
            if (this.getConfig("designMode")) {
                this.shofBufferIcon()
            }
        },
        syncingHandler: function() {
            this.showBufferIcon();
            if (this.pp.getState("IDLE")) {
                this.hideStartButton()
            }
        },
        readyHandler: function() {
            this.hideBufferIcon();
            if (this.pp.getState("IDLE")) {
                this.showStartButton()
            }
        },
        bufferHandler: function(b) {
            if (!this.pp.getState("PLAYING") && !this.pp.getState("AWAKENING")) {
                return
            }
            if (b == "EMPTY") {
                this.showBufferIcon()
            } else {
                this.hideBufferIcon()
            }
        },
        stateHandler: function(b) {
            switch (b) {
            case "STARTING":
                this.showBufferIcon();
                this.hideStartButton();
                break;
            case "PLAYING":
                this.hideBufferIcon();
                this.hideStartButton();
                break;
            case "IDLE":
                this.showStartButton();
                break;
            case "AWAKENING":
                this.hideStartButton();
                break;
            case "ERROR":
                this.logo.addClass("inactive").removeClass("active");
                this.hideBufferIcon();
                this.hideStartButton();
                break;
            case "COMPLETED":
                this.hideBufferIcon();
                break;
            default:
                this.hideStartButton()
            }
        },
        stoppedHandler: function() {
            this.hideBufferIcon()
        },
        scheduleLoadingHandler: function() {
            this.hideStartButton();
            this.showBufferIcon()
        },
        scheduledHandler: function() {
            if (!this.getConfig("autoplay")) {
                tthis.showStartButton()
            }
            this.hideBufferIcon()
        },
        itemHandler: function() {
            var b = this;
            this.logoIsFading = false;
            this.logoImage = this.getConfig("logoImage");
            this.logo.stop(true, true).addClass("inactive").removeClass("active").attr("src", $p.utils.imageDummy()).unbind()
        },
        timeHandler: function() {
            if (this.logoImage == false) {
                return
            }
            if (this.pp.getIsMobileClient("android")) {
                return
            }
            var b = this.pp.getPosition(),
            d = this.pp.getDuration(),
            c = this;
            if (!this.logoIsFading && b + this.config.logoDelay + 1 < d) {
                if (b > this.config.logoDelay && d > (this.config.logoDelay * 2)) {
                    this.logoIsFading = true;
                    this.logo.css({
                        cursor: (this.getConfig("logoClick") != null) ? "pointer": "normal"
                    }).unbind().bind("touchstart",
                    function() {
                        c._clickHandler("logo")
                    }).error(function() {
                        c.logoImage = false;
                        a(this).attr("src", $p.utils.imageDummy()).addClass("inactive").removeClass("active")
                    }).load(function() {
                        c.logo.fadeIn("slow",
                        function() {
                            a(this).addClass("active").removeClass("inactive");
                            c.logoIsFading = false
                        })
                    }).click(function() {
                        c._clickHandler("logo")
                    }).attr("src", this.logoImage)
                }
            }
            if (!this.logoIsFading) {
                if (b + this.config.logoDelay + 1 > d) {
                    this.logoIsFading = true;
                    this.logo.fadeOut("slow",
                    function() {
                        a(this).addClass("inactive").removeClass("active");
                        c.logoIsFading = false
                    })
                }
            }
        },
        plugineventHandler: function(c) {
            if (c.PLUGIN == "controlbar" && c.EVENT == "show" && this.getConfig("staticControls")) {
                var b = c.height * 100 / this.pp.getDC().height();
                this.display.height((100 - b) + "%").data("sc", true)
            }
        },
        leftclickHandler: function(b) {
            var c = this;
            if (a(b.target).attr("id").indexOf("_media") == -1) {
                return
            }
            switch (this.pp.getState()) {
            case "ERROR":
                this.pp.setActiveItem("next");
                return;
            case "IDLE":
                this.pp.setPlay();
                return
            }
            if (this.pp.getHasGUI() == true) {
                return
            }
            this.displayClicks++;
            if (this.displayClicks > 0) {
                setTimeout(function() {
                    if (c.displayClicks == 1) {
                        if (c.pp.getState() == "PLAYING") {
                            c._clickHandler("displayPlaying")
                        } else {
                            c._clickHandler("display")
                        }
                    } else {
                        if (c.displayClicks == 2) {
                            c._clickHandler("displayDbl")
                        }
                    }
                    c.displayClicks = 0
                },
                250)
            }
            return
        },
        showStartButton: function() {
            this.startButton.addClass("active").removeClass("inactive")
        },
        hideStartButton: function() {
            this.startButton.addClass("inactive").removeClass("active")
        },
        hideBufferIcon: function() {
            var b = this;
            if (this.getConfig("designMode")) {
                return
            }
            clearTimeout(this.bufferDelayTimer);
            this.buffIcn.stop(true, true);
            this.buffIcn.fadeOut("fast",
            function() {
                a(this).addClass("inactive").removeClass("active").css("display", "")
            })
        },
        showBufferIcon: function(b) {
            var c = this;
            clearTimeout(this.bufferDelayTimer);
            if (this.pp.getHasGUI()) {
                return
            }
            if ((this.pp.getModel() === "YTAUDIO" || this.pp.getModel() === "YTVIDEO") && !this.pp.getState("IDLE")) {
                b = true
            }
            if (b != true && this.getConfig("bufferIconDelay") > 0) {
                this.bufferDelayTimer = setTimeout(function() {
                    c.showBufferIcon(true)
                },
                this.getConfig("bufferIconDelay"));
                return
            }
            this.buffIcn.stop(true, true);
            if (this.buffIcn.hasClass("active")) {
                return
            }
            this.buffIcn.fadeIn("fast",
            function() {
                if (c.buffIcnSprite == null) {
                    return
                }
                var d = (c.config.spriteCountUp == true) ? 0 : (c.config.spriteHeight + c.config.spriteOffset) * (c.config.spriteTiles - 1),
                e = d;
                c.buffIcnSprite.addClass("active").removeClass("inactive").css("display", ""); (function() {
                    if (!c.buffIcn.is(":visible")) {
                        return
                    }
                    c.buffIcnSprite.css("backgroundPosition", "0px -" + e + "px");
                    if (c.config.spriteCountUp == true) {
                        e += c.config.spriteHeight + c.config.spriteOffset
                    } else {
                        e -= c.config.spriteHeight + c.config.spriteOffset
                    }
                    if (e > (d + c.config.spriteHeight) * c.config.spriteTiles || e < c.config.spriteOffset) {
                        e = d
                    }
                    setTimeout(arguments.callee, 60)
                })()
            })
        },
        _clickHandler: function(c) {
            try {
                this.pp[this.getConfig(c + "Click").callback](this.getConfig(c + "Click").value)
            } catch(b) {
                try {
                    this.getConfig(c + "Click")(this.getConfig(c + "Click").value)
                } catch(b) {}
            }
            return false
        }
    }
});
var projekktorControlbar = function() {};
jQuery(function(a) {
    projekktorControlbar.prototype = {
        _cTimer: null,
        _noCHide: false,
        _cFading: false,
        _vSliderAct: false,
        _storeVol: 0,
        _timeTags: {},
        cb: null,
        _pos: {
            left: 0,
            right: 0
        },
        controlElements: {},
        controlElementsConfig: {
            cb: null,
            playhead: {
                on: null,
                call: null
            },
            loaded: null,
            scrubber: null,
            scrubberdrag: {
                on: ["mousedown"],
                call: "scrubberdragStartDragListener"
            },
            play: {
                on: ["touchstart", "click"],
                call: "playClk"
            },
            pause: {
                on: ["touchstart", "click"],
                call: "pauseClk"
            },
            stop: {
                on: ["touchstart", "click"],
                call: "stopClk"
            },
            prev: {
                on: ["touchstart", "click"],
                call: "prevClk"
            },
            next: {
                on: ["touchstart", "click"],
                call: "nextClk"
            },
            rewind: {
                on: ["touchstart", "click"],
                call: "rewindClk"
            },
            forward: {
                on: ["touchstart", "click"],
                call: "forwardClk"
            },
            fsexit: {
                on: ["touchstart", "click"],
                call: "exitFullscreenClk"
            },
            fsenter: {
                on: ["touchstart", "click"],
                call: "enterFullscreenClk"
            },
            loquality: {
                on: ["touchstart", "click"],
                call: "setQualityClk"
            },
            hiquality: {
                on: ["touchstart", "click"],
                call: "setQualityClk"
            },
            vslider: {
                on: ["touchstart", "click"],
                call: "vsliderClk"
            },
            vmarker: {
                on: ["touchstart", "click"],
                call: "vsliderClk"
            },
            vknob: {
                on: ["mousedown"],
                call: "vknobStartDragListener"
            },
            mute: {
                on: ["touchstart", "click"],
                call: "muteClk"
            },
            unmute: {
                on: ["touchstart", "click"],
                call: "unmuteClk"
            },
            vmax: {
                on: ["touchstart", "click"],
                call: "vmaxClk"
            },
            open: {
                on: ["touchstart", "click"],
                call: "openCloseClk"
            },
            close: {
                on: ["touchstart", "click"],
                call: "openCloseClk"
            },
            loop: {
                on: ["touchstart", "click"],
                call: "loopClk"
            },
            draghandle: {
                on: ["mousedown"],
                call: "handleStartDragListener"
            },
            controls: null,
            title: null,
            sec_dur: null,
            min_dur: null,
            hr_dur: null,
            sec_elp: null,
            min_elp: null,
            hr_elp: null,
            sec_rem: null,
            min_rem: null,
            hr_rem: null
        },
        config: {
            disableFade: false,
            toggleMute: false,
            showCuePoints: false,
            fadeDelay: 2500,
            showOnStart: false,
            showOnIdle: false,
            controlsTemplate: '<ul class="left"><li><div %{play}></div><div %{pause}></div></li><li><div %{title}></div></li></ul><ul class="right"><li><div %{fsexit}></div><div %{fsenter}></div></li><li><div %{vmax}></div></li><li><div %{vslider}><div %{vmarker}></div><div %{vknob}></div></div></li><li><div %{mute}></div></li><li><div %{timeleft}>%{hr_elp}:%{min_elp}:%{sec_elp} | %{hr_dur}:%{min_dur}:%{sec_dur}</div></li><li><div %{next}></div></li><li><div %{prev}></div></li></ul><ul class="bottom"><li><div %{scrubber}><div %{loaded}></div><div %{playhead}></div><div %{scrubberdrag}></div></div></li></ul>'
        },
        initialize: function() {
            var f = this,
            e = this.playerDom.html(),
            c = true,
            b = this.pp.getNS();
            for (var d in this.controlElementsConfig) {
                if (e.match(new RegExp(b + d, "gi"))) {
                    c = false;
                    break
                }
            }
            if (c) {
                this.cb = this.applyToPlayer(a(document.createElement("div")).addClass("controls"));
                this.applyTemplate(this.cb, this.getConfig("controlsTemplate"))
            } else {
                this.cb = this.playerDom.find("." + b + "controls")
            }
            for (var d in this.controlElementsConfig) {
                this.controlElements[d] = a(this.playerDom).find("." + b + d);
                $p.utils.blockSelection(this.controlElements[d])
            }
            this.addGuiListeners();
            this._storeVol = this.getConfig("volume");
            this.updateDisplay();
            this.hidecb(true);
            this.pluginReady = true
        },
        applyTemplate: function(c, f) {
            var d = this,
            b = this.pp.getNS();
            if (f) {
                var e = f.match(/\%{[a-zA-Z_]*\}/gi);
                if (e != null) {
                    a.each(e,
                    function(g, h) {
                        var i = h.replace(/\%{|}/gi, "");
                        if (h.match(/\_/gi)) {
                            f = f.replace(h, '<span class="' + b + i + '"></span>')
                        } else {
                            f = f.replace(h, 'class="' + b + i + '"')
                        }
                    })
                }
                c.html(f)
            }
        },
        itemHandler: function(b) {
            a(this.cb).find("." + this.pp.getNS() + "cuepoint").remove();
            this.pluginReady = true;
            this.hidecb(true);
            this.drawTitle();
            this.displayQualityToggle()
        },
        startHandler: function() {
            if (this.getConfig("showOnStart") == true) {
                this.showcb(true)
            } else {
                this.hidecb(true)
            }
        },
        readyHandler: function(b) {
            clearTimeout(this._cTimer);
            this.cb.removeClass("fade");
            if (this.getConfig("showOnIdle")) {
                this.showcb(true)
            }
            if (!this.getConfig("disableFade")) {
                this.cb.addClass("fade")
            } else {
                this.sendEvent("show", {
                    width: this.cb.width(),
                    height: this.cb.height()
                })
            }
            this.pluginReady = true
        },
        durationChangeHandler: function(b) {
            this.sendEvent("show", {
                width: this.cb.width(),
                height: this.cb.height()
            });
            this.displayCuePoints(b)
        },
        updateDisplay: function() {
            var b = this,
            c = this.pp.getState();
            if (this.pp.getHasGUI()) {
                return
            }
            if (this.getConfig("controls") == false) {
                this.hidecb(true);
                return
            }
            if (this.pp.getItemCount() < 2 || this.getConfig("disallowSkip")) {
                this._active("prev", false);
                this._active("next", false)
            } else {
                this._active("prev", true);
                this._active("next", true)
            }
            if (this.pp.getItemIdx() < 1) {
                this._active("prev", false)
            }
            if (this.pp.getItemIdx() >= this.pp.getItemCount() - 1) {
                this._active("next", false)
            }
            if (this.getConfig("disablePause")) {
                this._active("play", false);
                this._active("pause", false)
            } else {
                if (c === "PLAYING") {
                    this.drawPauseButton()
                }
                if (c === "PAUSED") {
                    this.drawPlayButton()
                }
                if (c === "IDLE") {
                    this.drawPlayButton()
                }
            }
            this._active("stop", c !== "IDLE");
            this._active("forward", c !== "IDLE");
            this._active("rewind", c !== "IDLE");
            if (this.pp.getInFullscreen() === true) {
                this.drawExitFullscreenButton()
            } else {
                this.drawEnterFullscreenButton()
            }
            if (!this.getConfig("enableFullscreen") || this.getConfig("isCrossDomain")) {
                this._active("fsexit", false);
                this._active("fsenter", false)
            }
            this._active("loop", this.pp.getConfig("loop"));
            this.displayQualityToggle();
            this.displayTime();
            this.displayVolume(this.pp.getVolume() || this._storeVol)
        },
        stateHandler: function(b) {
            this.updateDisplay();
            if ("STOPPED|DONE|IDLE".indexOf(b) > -1) {
                this._noCHide = false;
                this.hidecb(true);
                return
            }
            if ("STOPPED|AWAKENING|IDLE|DONE".indexOf(b) > -1) {
                this.displayTime(0, 0, 0);
                this.displayProgress(0)
            } else {
                this.displayProgress()
            }
        },
        scheduleModifiedHandler: function() {
            if (this.pp.getState() === "IDLE") {
                return
            }
            this.updateDisplay();
            this.displayTime();
            this.displayProgress()
        },
        volumeHandler: function(b) {
            this.displayVolume(b)
        },
        progressHandler: function(b) {
            this.displayProgress()
        },
        timeHandler: function(b) {
            this.displayTime();
            this.displayProgress()
        },
        qualityChangeHandler: function(b) {
            this.displayQualityToggle(b)
        },
        fullscreenHandler: function(d) {
            var c = this,
            b = this.pp.getNS();
            clearTimeout(this._cTimer);
            this._noCHide = false;
            this._cFading = false;
            this._vSliderAct = false;
            if (!this.getConfig("controls")) {
                return
            }
            if (!this.getConfig("enableFullscreen") || this.getConfig("isCrossDomain")) {
                return
            }
            if (d) {
                this.cb.addClass("fullscreen");
                this.drawExitFullscreenButton()
            } else {
                this.cb.removeClass("fullscreen");
                this.drawEnterFullscreenButton()
            }
            if (this.pp.getState() == "IDLE" && !this.getConfig("showOnIdle")) {
                this.hidecb(true)
            } else {
                this._cTimer = setTimeout(function() {
                    c.hidecb()
                },
                this.getConfig("fadeDelay"))
            }
            if (this.getConfig("disableFade")) {
                this.sendEvent("show", {
                    width: this.cb.width(),
                    height: this.cb.height()
                })
            }
        },
        scaledHandler: function() {
            if (this.getConfig("disableFade")) {
                this.sendEvent("show", {
                    width: this.cb.width(),
                    height: this.cb.height()
                })
            }
        },
        addGuiListeners: function() {
            var b = this;
            a.each(this.controlElementsConfig,
            function(c, d) {
                if (!d) {
                    return true
                }
                if (d.on == null) {
                    return true
                }
                a.each(d.on,
                function(h, e) {
                    var f = ("on" + e in window.document);
                    if (!f) {
                        var g = document.createElement("div");
                        g.setAttribute("on" + e, "return;");
                        f = (typeof g["on" + e] == "function")
                    }
                    if (f) {
                        b.controlElements[c].bind(e,
                        function(i) {
                            b.clickCatcher(i, d.call, b.controlElements[c])
                        });
                        return false
                    }
                })
            });
            this.cb.mouseenter(function(c) {
                b.controlsMouseEnterListener(c)
            });
            this.cb.mouseleave(function(c) {
                b.controlsMouseLeaveListener(c)
            })
        },
        clickCatcher: function(b, d, c) {
            if (a.browser.msie) {
                b.cancelBubble = true
            } else {
                b.stopPropagation();
                b.preventDefault()
            }
            this[d](b, c);
            return false
        },
        drawTitle: function() {
            var b = this;
            this.controlElements.title.html(this.getConfig("title", ""))
        },
        hidecb: function(c) {
            clearTimeout(this._cTimer);
            var b = this.pp.getNS(),
            d = this;
            if (this.cb == null) {
                return
            }
            this.cb.stop(true, true);
            if (this.getConfig("disableFade") || this._noCHide || !this.cb.is(":visible")) {
                return
            }
            if (c === true) {
                this._cFading = false;
                this.cb.removeClass("active").addClass("inactive").css("display", "");
                return
            }
            if (this.getConfig("controls") == false || !this.cb.hasClass("fade")) {
                this.cb.removeClass("active").addClass("inactive");
                return
            }
            this.cb.fadeOut("slow",
            function() {
                a(this).removeClass("active").addClass("inactive").css("display", "");
                d._cFading = false
            })
        },
        showcb: function(c) {
            clearTimeout(this._cTimer);
            if (this.pp.getHasGUI() || this.getConfig("controls") == false) {
                this.cb.removeClass("active").addClass("inactive").css("display", "");
                return
            }
            var d = this,
            b = this.pp.getNS();
            if (this.cb == null) {
                return
            }
            if ("IDLE|AWAKENING|ERROR".indexOf(this.pp.getState()) > -1 && c != true) {
                return
            }
            this.cb.stop(true, true);
            if ((!this.cb.hasClass("fade") || c == true)) {
                this.cb.removeClass("inactive").addClass("active").css("display", "");
                return
            }
            if (this.cb.is(":visible") || this._cFading == true) {
                this._cTimer = setTimeout(function() {
                    d.hidecb()
                },
                this.getConfig("fadeDelay"));
                return
            }
            this._cFading = true;
            this.cb.fadeIn("slow",
            function() {
                d._cFading = false;
                a(this).removeClass("inactive").addClass("active").css("display", "")
            })
        },
        displayTime: function(f, c, j) {
            if (this.pp.getHasGUI()) {
                return
            }
            try {
                var d = (f != undefined) ? f: this.pp.getLoadPlaybackProgress(),
                h = (c != undefined) ? c: this.pp.getDuration(),
                b = (j != undefined) ? j: this.pp.getPosition()
            } catch(g) {
                var d = f || 0,
                h = c || 0,
                b = j || 0
            }
            this.controlElements.playhead.data("pct", d).css({
                width: d + "%"
            });
            var i = a.extend({},
            this._clockDigits(h, "dur"), this._clockDigits(b, "elp"), this._clockDigits(h - b, "rem"));
            a.each(this.controlElements,
            function(e, k) {
                if (i[e]) {
                    a.each(k,
                    function() {
                        a(this).html(i[e])
                    })
                }
            })
        },
        displayProgress: function() {
            this.controlElements.loaded.css("width", this.pp.getLoadProgress() + "%")
        },
        displayVolume: function(f) {
            if (this._vSliderAct == true) {
                return
            }
            if (f == null) {
                return
            }
            var b = this.cb.is(":visible"),
            e = this,
            d = this.getConfig("fixedVolume"),
            c = (this.controlElements.mute.hasClass("toggle") || this.controlElements.unmute.hasClass("toggle") || this.getConfig("toggleMute"));
            this._active("mute", !d);
            this._active("unmute", !d);
            this._active("vmax", !d);
            this._active("vknob", !d);
            this._active("vmarker", !d);
            this._active("vslider", !d);
            this.controlElements.vmarker.css("width", f * 100 + "%");
            this.controlElements.vknob.css("left", f * 100 + "%");
            if (c) {
                switch (parseFloat(f)) {
                case 0:
                    this._active("mute", false);
                    this._active("unmute", true);
                    this._active("vmax", true);
                    break;
                default:
                    this._active("mute", true);
                    this._active("unmute", false);
                    this._active("vmax", false);
                    break
                }
            }
            if (b) {
                this.cb.fadeTo(1, 0.99).fadeTo(1, 1)
            }
        },
        displayCuePoints: function(d) {
            var b = this,
            c = this.pp.getNS();
            if (!this.getConfig("showCuePoints")) {
                return
            }
            b.controlElements.scrubber.remove("." + c + "cuepoint");
            a.each(this.pp.getCuePoints() || [],
            function() {
                var e = Math.max(100 / d, Math.round(d / 100), 1),
                h = (this.on * 100 / d) - ((e / 2) * 100 / d),
                g = this,
                f = b.pp,
                i = a(document.createElement("div")).addClass(c + "cuepoint").addClass("inactive").css("left", h + "%").css("width", e + "%").data("on", this.on);
                if (this.title != "") {
                    i.attr("title", this.title)
                }
                this.addListener("unlock",
                function() {
                    a(i).removeClass("inactive").addClass("active");
                    i.click(function() {
                        b.pp.setPlayhead(i.data("on"))
                    })
                });
                b.controlElements.scrubber.append(i)
            })
        },
        drawPauseButton: function(b) {
            this._active("pause", true);
            this._active("play", false)
        },
        drawPlayButton: function(b) {
            this._active("pause", false);
            this._active("play", true)
        },
        drawEnterFullscreenButton: function(b) {
            this._active("fsexit", false);
            this._active("fsenter", true)
        },
        drawExitFullscreenButton: function(b) {
            this._active("fsexit", true);
            this._active("fsenter", false)
        },
        displayQualityToggle: function(d) {
            var f = this.getConfig("playbackQualities"),
            e = this.pp.getPlaybackQualities(),
            b = this.pp.getNS();
            best = [];
            if (e.length < 2 || f.length < 2) {
                this._active("loquality", false).removeClass().addClass(b + "loquality").data("qual", "");
                this._active("hiquality", false).removeClass().addClass(b + "hiquality").data("qual", "");
                return
            }
            f.sort(function(h, g) {
                return h.minHeight - g.minHeight
            });
            for (var c = f.length; c--; c > 0) {
                if (a.inArray(f[c].key, e) > -1) {
                    best.push(f[c].key)
                }
                if (best.length > 1) {
                    break
                }
            }
            if (best[0] == this.pp.getPlaybackQuality()) {
                this._active("loquality", true).addClass("qual" + best[1]).data("qual", best[1]);
                this._active("hiquality", false).addClass("qual" + best[0]).data("qual", best[0])
            } else {
                this._active("loquality", false).addClass("qual" + best[1]).data("qual", best[1]);
                this._active("hiquality", true).addClass("qual" + best[0]).data("qual", best[0])
            }
        },
        setQualityClk: function(b) {
            this.pp.setPlaybackQuality(a(b.target).data("qual"))
        },
        playClk: function(b) {
            this.pp.setPlay()
        },
        pauseClk: function(b) {
            this.pp.setPause()
        },
        stopClk: function(b) {
            this.pp.setStop()
        },
        controlsMouseEnterListener: function(b) {
            this._noCHide = true
        },
        controlsMouseLeaveListener: function(b) {
            this._noCHide = false
        },
        controlsClk: function(b) {},
        leftclickHandler: function() {
            this.mouseleaveHandler()
        },
        mousemoveHandler: function(b) {
            if (this.pp.getState("STARTING")) {
                return
            }
            clearTimeout(this._cTimer);
            this.showcb()
        },
        mouseleaveHandler: function(b) {
            var c = this;
            clearTimeout(this._cTimer);
            this._noCHide = false;
            this._cTimer = setTimeout(function() {
                c.hidecb()
            },
            this.getConfig("fadeDelay"))
        },
        prevClk: function(b) {
            this.pp.setActiveItem("previous")
        },
        nextClk: function(b) {
            this.pp.setActiveItem("next")
        },
        forwardClk: function(b) {
            this.pp.setPlayhead("+10")
        },
        rewindClk: function(b) {
            this.pp.setPlayhead("-10")
        },
        muteClk: function(b) {
            this._storeVol = (this.pp.getVolume() == 0) ? this.getConfig("volume") : this.pp.getVolume();
            this.pp.setVolume(0)
        },
        unmuteClk: function(b) {
            if (this._storeVol <= 0) {
                this._storeVol = 1
            }
            this.pp.setVolume(this._storeVol)
        },
        vmaxClk: function(b) {
            this.pp.setVolume(1)
        },
        enterFullscreenClk: function(b) {
            this.pp.setFullscreen(true)
        },
        exitFullscreenClk: function(b) {
            this.pp.setFullscreen(false)
        },
        openCloseClk: function(b) {
            var c = this;
            a(a(b.currentTarget).attr("class").split(/\s+/)).each(function(d, e) {
                if (e.indexOf("toggle") == -1) {
                    return
                }
                c.playerDom.find("." + e.substring(6)).slideToggle("slow",
                function() {
                    c.pp.setResize()
                });
                c.controlElements.open.toggle();
                c.controlElements.close.toggle()
            })
        },
        loopClk: function(b) {
            this.pp.setLoop(a(b.currentTarget).hasClass("inactive") || false);
            this.updateDisplay()
        },
        startClk: function(b) {
            this.pp.setPlay()
        },
        vmarkerClk: function(b) {
            vsliderClk(b)
        },
        vsliderClk: function(c) {
            if (this._vSliderAct == true) {
                return
            }
            var g = (this.pp.getInFullscreen() === true && this.controlElements.vslider.length > 1) ? 1 : 0,
            e = a(this.controlElements.vslider[g]),
            b = e.width(),
            d = (c.originalEvent.touches) ? c.originalEvent.touches[0].pageX: c.originalEvent.pageX,
            f = d - e.offset().left;
            if (f < 0 || f == "NaN" || f == undefined) {
                result = 0
            } else {
                result = (f / b)
            }
            this.pp.setVolume(result);
            this._storeVol = result
        },
        scrubberdragStartDragListener: function(b) {
            if (this.getConfig("disallowSkip") == true) {
                return
            }
            this._sSliderAct = true;
            var e = this,
            f = (this.pp.getInFullscreen() === true && this.controlElements.scrubber.length > 1) ? 1 : 0,
            c = a(this.controlElements.scrubberdrag[f]),
            g = a(this.controlElements.loaded[f]),
            d = 0,
            k = Math.abs(parseInt(c.offset().left) - b.clientX),
            i = function(m) {
                var l = Math.abs(c.offset().left - m.clientX);
                l = (l > c.width()) ? c.width() : l;
                l = (l > g.width()) ? g.width() : l;
                l = (l < 0) ? 0 : l;
                l = Math.abs(l / c.width()) * e.pp.getDuration();
                if (l > 0 && l != d) {
                    d = l;
                    e.pp.setPlayhead(d)
                }
            },
            h = function(l) {
                if (a.browser.msie) {
                    l.cancelBubble = true
                } else {
                    l.stopPropagation()
                }
                e.playerDom.unbind("mouseup.slider");
                c.unbind("mousemove", j);
                c.unbind("mouseup", h);
                e._sSliderAct = false;
                return false
            },
            j = function(l) {
                clearTimeout(e._cTimer);
                if (a.browser.msie) {
                    l.cancelBubble = true
                } else {
                    l.stopPropagation()
                }
                i(l);
                return false
            };
            this.playerDom.bind("mouseup.slider", h);
            c.mouseup(h);
            c.mousemove(j);
            i(b)
        },
        vknobStartDragListener: function(b, c) {
            this._vSliderAct = true;
            var f = this,
            g = (this.pp.getInFullscreen() === true && this.controlElements.vslider.length > 1) ? 1 : 0,
            e = a(c[g]),
            d = a(this.controlElements.vslider[g]),
            d = a(this.controlElements.vslider[g]),
            k = Math.abs(parseInt(e.position().left) - b.clientX),
            h = 0,
            i = function(l) {
                f.playerDom.unbind("mouseup", i);
                d.unbind("mousemove", j);
                d.unbind("mouseup", i);
                e.unbind("mousemove", j);
                e.unbind("mouseup", i);
                f._vSliderAct = false;
                return false
            },
            j = function(l) {
                clearTimeout(f._cTimer);
                var m = (l.clientX - k);
                m = (m > d.width() - e.width() / 2) ? d.width() - (e.width() / 2) : m;
                m = (m < 0) ? 0 : m;
                e.css("left", m + "px");
                h = Math.abs(m / (d.width() - (e.width() / 2)));
                f.pp.setVolume(h);
                f._storeVol = h;
                a(f.controlElements.vmarker[g]).css("width", h * 100 + "%");
                return false
            };
            this.playerDom.mouseup(i);
            d.mousemove(j);
            d.mouseup(i);
            e.mousemove(j);
            e.mouseup(i)
        },
        handleStartDragListener: function(d, g) {
            var h = this;
            var f = Math.abs(parseInt(this.cb.position().left) - d.clientX);
            var c = Math.abs(parseInt(this.cb.position().top) - d.clientY);
            var b = function(i) {
                if (a.browser.msie) {
                    i.cancelBubble = true
                } else {
                    i.stopPropagation()
                }
                h.playerDom.unbind("mouseup", b);
                h.playerDom.unbind("mouseout", b);
                h.playerDom.unbind("mousemove", e);
                return false
            };
            var e = function(j) {
                if (a.browser.msie) {
                    j.cancelBubble = true
                } else {
                    j.stopPropagation()
                }
                clearTimeout(h._cTimer);
                var k = (j.clientX - f);
                k = (k > h.playerDom.width() - h.cb.width()) ? h.playerDom.width() - h.cb.width() : k;
                k = (k < 0) ? 0 : k;
                h.cb.css("left", k + "px");
                var i = (j.clientY - c);
                i = (i > h.playerDom.height() - h.cb.height()) ? h.playerDom.height() - h.cb.height() : i;
                i = (i < 0) ? 0 : i;
                h.cb.css("top", i + "px");
                return false
            };
            this.playerDom.mousemove(e);
            this.playerDom.mouseup(b)
        },
        errorHandler: function(b) {
            this.hidecb(true)
        },
        _active: function(d, b) {
            var c = this.controlElements[d];
            if (b == true) {
                c.addClass("active").removeClass("inactive")
            } else {
                c.addClass("inactive").removeClass("active")
            }
            return c
        },
        _clockDigits: function(e, i) {
            if (e < 0 || isNaN(e) || e == undefined) {
                e = 0
            }
            var g = Math.floor(e / (60 * 60));
            var h = e % (60 * 60);
            var d = Math.floor(h / 60);
            var c = h % 60;
            var f = Math.floor(c);
            var b = {};
            b["min_" + i] = (d < 10) ? "0" + d: d;
            b["sec_" + i] = (f < 10) ? "0" + f: f;
            b["hr_" + i] = (g < 10) ? "0" + g: g;
            return b
        }
    }
});