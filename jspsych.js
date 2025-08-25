var jsPsych = (function () {
  "use strict";

  const t = {
      display: "block",
      width: "100%",
      "margin-bottom": "1em",
      "text-align": "center",
      "font-weight": "bold",
    },
    e = { "margin-top": "2em", clear: "both" };
  class i {
    constructor(t) {
      this.jsPsych = t;
    }
    run(i, s) {
      let n = document.createElement("div");
      (n.id = "jspsych-progressbar-container"),
        (n.innerHTML =
          '<div class="jspsych-progressbar-text" id="jspsych-progressbar-text"></div><div class="jspsych-progressbar-outer"><div class="jspsych-progressbar-inner" id="jspsych-progressbar-inner"></div></div>'),
        (n.style.visibility = "hidden"),
        document.querySelector(".jspsych-display-element").insertBefore(n, document.querySelector(".jspsych-display-element").firstChild);
      const o = document.getElementById("jspsych-progressbar-text"),
        a = document.getElementById("jspsych-progressbar-container"),
        r = document.getElementById("jspsych-progressbar-inner");
      (o.innerHTML = i.text),
        Object.assign(a.style, t),
        Object.assign(document.querySelector(".jspsych-content").style, e),
        (this.container = a),
        (this.progress_bar = r),
        (this.text = o),
        this.update(0, i.text),
        (this.on_load_callback = s),
        this.jsPsych.pluginAPI.autoPreload(
          this.jsPsych.timeline.getTimeline(),
          () => {
            this.on_load_callback(), (this.container.style.visibility = "visible");
          },
          (t) => {
            this.update(t);
          },
          i
        );
    }
    update(t, e) {
      (this.progress_bar.style.width = t + "%"), e && (this.text.innerHTML = e);
    }
  }
  const s = { type: "internal", on_load: () => {} },
    n = {
      display_element: void 0,
      on_finish: function (t) {},
      on_trial_start: function (t) {},
      on_trial_finish: function () {},
      on_data_update: function (t) {},
      on_interaction_data_update: function (t) {},
      on_close: function () {},
      preload_audio: [],
      preload_images: [],
      preload_video: [],
      use_webaudio: !0,
      exclusions: {},
      show_progress_bar: !1,
      message_progress_bar: "Loading...",
      auto_update_progress_bar: !0,
      default_iti: 0,
      minimum_valid_rt: 0,
      experiment_width: null,
      override_safe_mode: !1,
      case_sensitive_responses: !1,
      extensions: [],
    },
    o = {
      audio: "preload_audio",
      video: "preload_video",
      image: "preload_images",
    };
  class a {
    constructor(t) {
      (this.jsPsych = t),
        (this.events = {}),
        (this.extensions = {}),
        (this.DOM_container = this.jsPsych.opts.display_element),
        (this.DOM_target = this.DOM_container.appendChild(document.createElement("div"))),
        this.DOM_target.classList.add("jspsych-display-element"),
        this.jsPsych.opts.experiment_width && (this.DOM_target.style.width = this.jsPsych.opts.experiment_width + "px"),
        this.DOM_target.appendChild(document.createElement("div")).classList.add("jspsych-content");
    }
    finishTrial(t) {
      if (!this.current_trial.ended) {
        (this.current_trial.ended = !0), this.jsPsych.pluginAPI.cancelAllKeyboardResponses(), this.jsPsych.pluginAPI.cancelAllMouseResponses(), this.jsPsych.pluginAPI.clearAllTimeouts();
        var e = this.jsPsych.pluginAPI.getKeyboardResponse(this.current_trial.trial_type);
        t || (t = e(this.current_trial_data_node.trial));
        var i = this.jsPsych.data.getInteractionData();
        (this.current_trial_data_node.interaction_history = i),
          (this.current_trial_data_node.trial.raw_interaction_data = i.readOnlyData()),
          this.jsPsych.data.resetInteractionData(),
          (this.current_trial_data_node.trial = { ...this.current_trial_data_node.trial, ...t });
        var s = this.jsPsych.data.write(this.current_trial_data_node.trial);
        (this.current_trial_data_node.data = s),
          this.jsPsych.opts.on_data_update(this.current_trial_data_node.data),
          this.jsPsych.opts.on_trial_finish(this.current_trial_data_node.data),
          this.callExtension("on_trial_finish", { trial: this.current_trial_data_node.data }),
          this.DOM_target.innerHTML = "";
        var n = this.current_trial.on_finish(this.current_trial_data_node.data);
        "function" == typeof n.then && (this.current_trial.async = !0),
          this.current_trial.async
            ? n.then(() => {
                this.nextTrial();
              })
            : this.nextTrial();
      }
    }
    nextTrial() {
      if ((this.progress.current_trial_global++, this.progress.current_trial_global >= this.progress.total_trials)) this.finishExperiment();
      else {
        this.jsPsych.opts.auto_update_progress_bar && this.updateProgressBar(), this.jsPsych.opts.default_iti > 0 ? this.jsPsych.pluginAPI.setTimeout(() => this.startTrial(), this.jsPsych.opts.default_iti) : this.startTrial();
      }
    }
    startTrial() {
      (this.current_trial_data_node = this.jsPsych.timeline.trialHistory.find((t) => null === t.time_elapsed)),
        (this.current_trial = this.current_trial_data_node.trial),
        (this.current_trial.trial_index = this.progress.current_trial_global),
        (this.current_trial.timeline_node_id = this.current_trial_data_node.relative_id),
        this.jsPsych.pluginAPI.startNewTrial(),
        this.callExtension("on_load"),
        this.jsPsych.opts.on_trial_start(this.current_trial);
      var t = this.current_trial.on_load;
      "function" == typeof t.then && (this.current_trial.async = !0),
        this.current_trial.async
          ? t.then(() => {
              this.executeTrial();
            })
          : (t(), this.executeTrial());
    }
    executeTrial() {
      this.callExtension("on_start", { trial: this.current_trial });
      var t = this.jsPsych.plugins[this.current_trial.type];
      if (void 0 !== t) {
        try {
          var e = t.trial(this.DOM_target.querySelector(".jspsych-content"), this.current_trial);
        } catch (t) {
          console.error("Error in plugin " + this.current_trial.type), console.error(t);
        }
        "function" == typeof e.then && (this.current_trial.async = !0),
          this.current_trial.async &&
            e.then((t) => {
              this.finishTrial(t);
            });
      } else console.error("Error: Cannot find plugin " + this.current_trial.type + ". Please make sure the file is loaded.");
    }
    finishExperiment() {
      this.callExtension("on_finish"),
        (window.onbeforeunload = void 0),
        this.jsPsych.opts.on_finish(this.jsPsych.data.get()),
        (this.DOM_target.innerHTML = ""),
        (this.DOM_target.style.display = "none"),
        this.jsPsych.endExperiment();
    }
    updateProgressBar() {
      this.progress.bar.update(this.progress.percent_complete);
    }
    async run(t, e) {
      if (
        (this.jsPsych.timeline.setTimeline(t),
        await this.jsPsych.pluginAPI.initializeAudio(),
        (this.progress = {
          total_trials: this.jsPsych.timeline.length(),
          current_trial_global: 0,
          percent_complete: 0,
        }),
        (window.onbeforeunload = this.jsPsych.opts.on_close),
        e.preload)
      ) {
        if (this.jsPsych.opts.show_progress_bar) {
          const t = new i(this.jsPsych);
          (this.progress.bar = t),
            await new Promise((e) => {
              t.run({ text: this.jsPsych.opts.message_progress_bar }, e);
            }),
            this.updateProgressBar();
        } else {
          let t = [];
          if ((e.preload_audio && (t = t.concat(e.preload_audio)), e.preload_images && (t = t.concat(e.preload_images)), e.preload_video && (t = t.concat(e.preload_video)), 0 !== t.length)) {
            const i = { type: s, stimuli: t };
            this.jsPsych.timeline.prepend(i);
          }
        }
        await this.jsPsych.pluginAPI.preload(t);
      }
      this.startTrial();
    }
    addEvents(t) {
      for (var e in t) this.events[e] = t[e];
    }
    callExtension(t, e) {
      for (const i in this.extensions) {
        const s = this.extensions[i];
        void 0 !== s[t] && s[t](e);
      }
    }
    initExtension(t, e) {
      const i = t.info.name,
        s = t.instance;
      return (this.extensions[i] = s), s.initialize(e || {}, this.jsPsych);
    }
  }
  class r {
    constructor(t) {
      this.jsPsych = t;
    }
    addProperties(t) {
      for (const e in t) this.jsPsych.data.results[e] = t[e];
    }
    addDataToLastTrial(t) {
      this.jsPsych.timeline.addToLast({ data: t });
    }
    get() {
      return this.jsPsych.timeline.getTrials(0);
    }
    getDisplayElement() {
      return this.jsPsych.DOM_target;
    }
    getProgressBar() {
      return this.jsPsych.progress.bar;
    }
    getTimeline() {
      return this.jsPsych.timeline;
    }
    endExperiment(t, e) {
      this.jsPsych.DOM_target.innerHTML = t;
      const i = {
        type: s,
        on_load: () => {
          this.jsPsych.pluginAPI.cancelAllKeyboardResponses(), this.jsPsych.pluginAPI.clearAllTimeouts();
        },
      };
      (e = e || {}), this.jsPsych.timeline.end_message = e;
      const n = this.jsPsych.timeline.findTrial(this.jsPsych.progress.current_trial_global);
      this.jsPsych.timeline.insertAfter(n, i);
    }
    finishTrial(t) {
      this.jsPsych.finishTrial(t);
    }
  }
  class l {
    constructor() {
      this.timeline_variables = [];
    }
    setTimeline(t) {
      (this.timeline = t), this.buildTimeline();
    }
    buildTimeline() {
      (this.recursiveBuild(this.timeline), this.nodes.length > 0) ? (this.nodes[0].trial_idx = 0) : (this.nodes[0] = {}), (this.trialHistory = this.nodes);
      for (let t = 1; t < this.nodes.length; t++) {
        const e = this.nodes[t - 1].trial_idx;
        this.nodes[t].trial_idx = e + (this.nodes[t - 1].trial.internal ? 0 : 1);
      }
    }
    recursiveBuild(t, e, i, s) {
      (e = e || this.root_node), (s = s || []), (i = i || "");
      var n = Math.floor(1e12 * Math.random()),
        o = "0." + n;
      const a = (e) => (Array.isArray(e) ? this.recursiveBuild(e, e, o, []) : ((e.parent_node = o), this.insert(e, o), (s[s.length] = e)));
      if (Array.isArray(t)) for (var r = 0; r < t.length; r++) a(t[r]);
      else a(t);
      if ("timeline" == t.type && t.randomize_order) {
        let e = [];
        for (; s.length > 0; ) {
          let t = Math.floor(Math.random() * s.length);
          e.push(s[t]), s.splice(t, 1);
        }
        s = e;
      }
      if ("timeline" == t.type && void 0 !== t.conditional_function && !t.conditional_function()) for (var r = 0; r < s.length; r++) this.remove(s[r].relative_id);
      if ("timeline" == t.type && void 0 !== t.loop_function) for (; t.loop_function(this.generatedData(t.relative_id)); ) this.recursiveBuild(t.timeline, e, i, []);
      if ("timeline" == t.type && void 0 !== t.timeline_variables) {
        var l = this.flatten(t.timeline_variables),
          c = t.sample;
        "function" == typeof c && (c = c()), c && (l = this.sample(l, c));
        for (var d = 0; d < l.length; d++) this.recursiveBuild(t.timeline, e, i, []), this.setTimelineVariables(l[d], i);
      }
    }
    insert(t, e) {
      e = e || "";
      var i = this.parent(e),
        s = this.children(e).length,
        n = this.nodeWithTrial(t);
      i ? i.children.splice(s, 0, n) : this.nodes.splice(this.nodes.length, 0, n), this.id_map[n.relative_id] = n;
    }
    findTrial(t) {
      for (let e = 0; e < this.trialHistory.length; e++) if (this.trialHistory[e].trial_idx === t) return this.trialHistory[e];
    }
    setTimelineVariables(t, e) {
      this.timeline_variables.push({
        timeline_variables: t,
        node_id: e,
      });
    }
    length() {
      let t = 0;
      for (const e of this.trialHistory) e.trial.internal || (t += 1);
      return t;
    }
    getTimeline() {
      return this.timeline;
    }
    getTrials(t, e) {
      if (((t = t || 0), (e = e || this.trialHistory.length - 1), "string" == typeof t && (t = this.id_map[t].trial_idx), "string" == typeof e && (e = this.id_map[e].trial_idx), t > e)) {
        console.warn("Invalid selection range for jsPsych.timeline.getTrials(). End trial is before start trial.");
        return;
      }
      for (var i = [], s = 0; s < this.trialHistory.length; s++) {
        var n = this.trialHistory[s];
        n.trial_idx >= t && n.trial_idx <= e && i.push(n.trial);
      }
      return i;
    }
    addToLast(t) {
      const e = this.trialHistory[this.trialHistory.length - 1];
      for (const i in t) e.trial[i] = t[i];
    }
    insertAfter(t, e) {}
  }
  class c {
    constructor(t) {
      (this.jsPsych = t), (this.all_listeners = {}), (this.audio_context = null), (this.audio_buffers = []), (this.preloads = []), (this.images = []), (this.videos = []);
    }
    initializeAudio() {
      return new Promise((t, e) => {
        "undefined" == typeof this.jsPsych.opts.use_webaudio ||
          this.jsPsych.opts.use_webaudio
            ? window.AudioContext || window.webkitAudioContext
              ? ((this.audio_context = window.AudioContext ? new AudioContext() : new webkitAudioContext()), this.audio_context.state, "suspended" === this.audio_context.state ? this.audio_context.resume().then(t) : t())
              : t()
            : t();
      });
    }
    getAudioBuffer(t) {
      return new Promise((e, i) => {
        if (this.audio_buffers[t]) return void e(this.audio_buffers[t]);
        fetch(t)
          .then((t) => t.arrayBuffer())
          .then((i) => this.audio_context.decodeAudioData(i))
          .then((i) => ((this.audio_buffers[t] = i), e(i)))
          .catch((t) => {
            console.error(t), i(t);
          });
      });
    }
    preload(t, e, i, s) {
      (e = e || (() => {})), (i = i || (() => {}));
      let n = [];
      const a = [];
      for (let t = 0; t < this.jsPsych.opts.preload_audio.length; t++) n.push({ type: "audio", path: this.jsPsych.opts.preload_audio[t] });
      for (let t = 0; t < this.jsPsych.opts.preload_video.length; t++) n.push({ type: "video", path: this.jsPsych.opts.preload_video[t] });
      for (let t = 0; t < this.jsPsych.opts.preload_images.length; t++) n.push({ type: "image", path: this.jsPsych.opts.preload_images[t] });
      for (let t = 0; t < s.length; t++) n.push({ type: s[t].type, path: s[t].path });
      for (const e of t) for (const t in o) e[o[t]] && e[o[t]].forEach((e) => n.push({ type: t, path: e }));
      let r = 0,
        l = n.length;
      if (0 === l) return void e();
      const c = (t, e) => {
        if (!a.includes(e)) {
          a.push(e), (r = a.length), i(Math.round((r / l) * 100));
          let s = !1;
          for (let e = 0; e < this.preloads.length; e++) this.preloads[e].path === t && (s = !0);
          if (s) return;
          this.preloads.push({ type: "image", path: t });
        }
        r === l && e();
      };
      for (let t = 0; t < l; t++) {
        const e = n[t].path;
        if ("image" === n[t].type) {
          const i = new Image();
          (i.src = e),
            (i.onload = () => {
              c("image", e);
            }),
            (this.images[e] = i);
        }
        if ("audio" === n[t].type)
          if (this.audio_context)
            this.getAudioBuffer(e)
              .then(() => c("audio", e))
              .catch((t) => c("audio", e));
          else {
            const i = new Audio();
            (i.src = e), c("audio", e);
          }
        if ("video" === n[t].type) {
          const i = document.createElement("video");
          (i.src = e),
            i.addEventListener("canplaythrough", () => {
              c("video", e);
            }),
            (this.videos[e] = i);
        }
      }
    }
    autoPreload(t, e, i, s) {
      if (s.images.length + s.audio.length + s.video.length > 0) {
        let t = {
          type: "preload",
          images: s.images || [],
          audio: s.audio || [],
          video: s.video || [],
          show_progress_bar: this.jsPsych.opts.show_progress_bar,
          message: this.jsPsych.opts.message_progress_bar,
          on_success: e,
          on_error: e,
          on_update: i,
        };
        const n = this.jsPsych.plugins.preload;
        n.trial(this.jsPsych.getDisplayElement(), t);
      } else e();
    }
    getKeyboardResponse(t) {
      return (e) => {
        if (((e = this.convertTrialToPluginParameters(e)), this.jsPsych.data.getInteractionData().length() > 0)) {
          const i = this.jsPsych.data.getInteractionData().filter({ event: "keydown" });
          if (i.length > 0) {
            const s = i.values[i.length - 1];
            if (t.minimum_valid_rt > 0 && s.rt < t.minimum_valid_rt) s.rt = null;
            return s;
          }
        }
        return {};
      };
    }
    cancelAllKeyboardResponses() {
      for (let t in this.all_listeners) {
        const e = this.all_listeners[t];
        e.type.includes("key") && (e.obj.removeEventListener(e.type, e.fn), delete this.all_listeners[t]);
      }
    }
    cancelAllMouseResponses() {
      for (let t in this.all_listeners) {
        const e = this.all_listeners[t];
        e.type.includes("mouse") || e.type.includes("touch") ? (e.obj.removeEventListener(e.type, e.fn), delete this.all_listeners[t]) : "click" === e.type && (e.obj.removeEventListener("click", e.fn), delete this.all_listeners[t]);
      }
    }
    clearAllTimeouts() {
      for (const t of this.timeout_handlers) clearTimeout(t);
      this.timeout_handlers = [];
    }
    startNewTrial() {
      (this.current_trial_start_time = performance.now()), (this.last_rt = null);
    }
    setTimeout(t, e) {
      const i = setTimeout(t, e);
      return this.timeout_handlers.push(i), i;
    }
    convertTrialToPluginParameters(t) {
      const e = {};
      return (
        t.type,
        t.data,
        t.on_finish,
        t.on_start,
        t.on_load,
        Object.entries(t).forEach(([t, i]) => {
          "type" !== t && "data" !== t && "on_finish" !== t && "on_start" !== t && "on_load" !== t && (e[t] = i);
        }),
        e
      );
    }
  }
  const d = { "border-bottom": "1px solid #555" };
  var h,
    p =
      ((h = function (t, e) {
        return (h =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (t, e) {
              t.__proto__ = e;
            }) ||
          function (t, e) {
            for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
          })(t, e);
      }),
      function (t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
        function i() {
          this.constructor = t;
        }
        h(t, e), (t.prototype = null === e ? Object.create(e) : ((i.prototype = e.prototype), new i()));
      });
  var u = (function (t) {
    function e() {
      return (null !== t && t.apply(this, arguments)) || this;
    }
    return (
      p(e, t),
      (e.prototype.append = function (e) {
        t.prototype.append.call(this, e), this.data.push(e);
      }),
      (e.prototype.values = function () {
        return this.data;
      }),
      e
    );
  })(
    (function () {
      function t(t) {
        this.data = t || [];
      }
      return (
        (t.prototype.append = function (t) {
          this.data.push(t);
        }),
        (t.prototype.values = function () {
          return this.data;
        }),
        (t.prototype.first = function () {
          return this.data.length > 0 ? this.data[0] : void 0;
        }),
        (t.prototype.last = function () {
          return this.data.length > 0 ? this.data[this.data.length - 1] : void 0;
        }),
        (t.prototype.filter = function (t) {
          var e = [],
            i = Object.keys(t);
          return (
            this.data.forEach(function (s) {
              var n = !0;
              i.forEach(function (e) {
                void 0 !== s[e] && s[e] == t[e] ? (n = n && !0) : (n = !1);
              }),
                n && e.push(s);
            }),
            new this.constructor(e)
          );
        }),
        (t.prototype.filterCustom = function (t) {
          var e = [];
          return (
            this.data.forEach(function (i) {
              t(i) && e.push(i);
            }),
            new this.constructor(e)
          );
        }),
        (t.prototype.filterColumns = function (t) {
          var e = [];
          return (
            this.data.forEach(function (i) {
              var s = {};
              t.forEach(function (t) {
                void 0 !== i[t] && (s[t] = i[t]);
              }),
                Object.keys(s).length > 0 && e.push(s);
            }),
            new this.constructor(e)
          );
        }),
        (t.prototype.select = function (t) {
          var e = [];
          return (
            this.data.forEach(function (i) {
              void 0 !== i[t] && e.push(i[t]);
            }),
            new u(e)
          );
        }),
        (t.prototype.ignore = function (t) {
          return this.filterCustom(function (e) {
            return !t.includes(e);
          });
        }),
        (t.prototype.unique = function () {
          var t = [];
          return (
            this.data.forEach(function (e) {
              t.includes(e) || t.push(e);
            }),
            new this.constructor(t)
          );
        }),
        (t.prototype.count = function () {
          return this.data.length;
        }),
        (t.prototype.sum = function () {
          for (var t = 0, e = 0; e < this.data.length; e++) t += this.data[e];
          return t;
        }),
        (t.prototype.mean = function () {
          if (0 === this.data.length) return;
          return this.sum() / this.count();
        }),
        (t.prototype.median = function () {
          if (0 === this.data.length) return;
          var t = this.data.slice().sort(function (t, e) {
            return t - e;
          });
          return t.length % 2 == 0 ? (t[t.length / 2 - 1] + t[t.length / 2]) / 2 : t[Math.floor(t.length / 2)];
        }),
        (t.prototype.min = function () {
          if (0 === this.data.length) return;
          return Math.min.apply(null, this.data);
        }),
        (t.prototype.max = function () {
          if (0 === this.data.length) return;
          return Math.max.apply(null, this.data);
        }),
        (t.prototype.variance = function () {
          if (this.data.length <= 1) return;
          for (var t = this.mean(), e = 0, i = 0; i < this.data.length; i++) e += Math.pow(this.data[i] - t, 2);
          return e / (this.data.length - 1);
        }),
        (t.prototype.sd = function () {
          if (this.data.length <= 1) return;
          return Math.sqrt(this.variance());
        }),
        (t.prototype.frequencies = function () {
          var t = {};
          for (var e = 0; e < this.data.length; e++) void 0 === t[this.data[e]] ? (t[this.data[e]] = 1) : t[this.data[e]]++;
          return t;
        }),
        (t.prototype.all = function (t) {
          for (var e = 0; e < this.data.length; e++) if (!t(this.data[e])) return !1;
          return !0;
        }),
        (t.prototype.any = function (t) {
          for (var e = 0; e < this.data.length; e++) if (t(this.data[e])) return !0;
          return !1;
        }),
        (t.prototype.readOnlyData = function () {
          return new this.constructor(JSON.parse(JSON.stringify(this.data)));
        }),
        (t.prototype.join = function (t) {
          return new this.constructor(this.data.concat(t.data));
        }),
        (t.prototype.push = function (t) {
          this.data.push(t);
        }),
        (t.prototype.addToAll = function (t) {
          for (var e = Object.keys(t), i = 0; i < this.data.length; i++) for (var s = 0; s < e.length; s++) this.data[i][e[s]] = t[e[s]];
        }),
        (t.prototype.addToLast = function (t) {
          var e = this.data.length;
          if (e > 0) for (var i = Object.keys(t), s = 0; s < i.length; s++) this.data[e - 1][i[s]] = t[i[s]];
        }),
        (t.prototype.csv = function () {
          var t = this.data,
            e = Object.keys(t[0]);
          return e.join(",") + "\n" + t.map((t) => e.map((e) => JSON.stringify(t[e])).join(",")).join("\n");
        }),
        (t.prototype.json = function (t) {
          void 0 === t || !t ? JSON.stringify(this.data) : JSON.stringify(this.data, null, t);
        }),
        (t.prototype.localSave = function (t, e) {
          void 0 === e && (e = "jspsych-data");
          var i = { csv: this.csv, json: this.json };
          i[t] ? window.localStorage.setItem(e, i[t]()) : console.error("Invalid format specified for jsPsych.data.localSave. Please use 'csv' or 'json'.");
        }),
        t
      );
    })()
  );
  class m {
    constructor(t) {
      (this.jsPsych = t), (this.turk = {});
    }
    turkInfo() {
      var t = this.getURLVariable("assignmentId"),
        e = this.getURLVariable("hitId"),
        i = this.getURLVariable("workerId"),
        s = this.getURLVariable("turkSubmitTo"),
        n = "NOT_IN_MTURK" !== t,
        o = "sandbox" === this.getURLVariable("environment");
      return {
        assignmentId: t,
        hitId: e,
        workerId: i,
        turkSubmitTo: s,
        previewMode: !n,
        outsideTurk: !n,
        sandbox: o,
      };
    }
    submitToTurk(t) {
      var e = this.turkInfo(),
        i = e.turkSubmitTo + "/mturk/externalSubmit",
        s = document.createElement("form");
      (s.method = "POST"), (s.action = i);
      var n = document.createElement("input");
      for (var o in ((n.type = "hidden"), (n.name = "assignmentId"), (n.value = e.assignmentId), s.appendChild(n), t)) {
        var a = document.createElement("input");
        (a.type = "hidden"), (a.name = o), (a.value = t[o]), s.appendChild(a);
      }
      document.body.appendChild(s), s.submit();
    }
    getURLVariable(t) {
      t = t.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var e = new RegExp("[\\?&]" + t + "=([^&#]*)").exec(location.search);
      return null === e ? "NOT_IN_MTURK" : decodeURIComponent(e[1].replace(/\+/g, " "));
    }
  }
  var f = {
    randomization: {
      shuffle: function (t) {
        for (var e, i, s = t.length; 0 !== s; ) (i = Math.floor(Math.random() * s)), (e = t[--s]), (t[s] = t[i]), (t[i] = e);
        return t;
      },
      shuffleNoRepeats: function (t, e) {
        if (void 0 === e) return t;
        for (var i = 0; i < t.length; i++) {
          var s = t[i],
            n = e[i];
          if ("object" == typeof s && "object" == typeof n) {
            if (JSON.stringify(s) == JSON.stringify(n)) return f.randomization.shuffleNoRepeats(t, e);
          } else if (s == n) return f.randomization.shuffleNoRepeats(t, e);
        }
        return t;
      },
      repeat: function (t, e, i) {
        for (var s = [], n = 0; n < e; n++) {
          var o = JSON.parse(JSON.stringify(t));
          i && (o = f.randomization.shuffle(o)), (s = s.concat(o));
        }
        return s;
      },
      sampleWithoutReplacement: function (t, e) {
        for (var i = [], s = 0; s < e; s++) {
          var n = Math.floor(Math.random() * t.length);
          i.push(t.splice(n, 1)[0]);
        }
        return i;
      },
      sampleWithReplacement: function (t, e, i) {
        for (var s = [], n = 0; n < e; n++) {
          var o = Math.floor(Math.random() * t.length),
            a = JSON.parse(JSON.stringify(t[o]));
          s.push(a);
        }
        if (i && s.length > 1) {
          var r = 0,
            l = 0;
          for (n = 0; n < s.length; n++) {
            var c = 0;
            for (var d = 0; d < s[n].length; d++) c += s[n][d] * Math.pow(10, d);
            i[n] > 0 ? (r += c) : (l += c);
          }
          if (r == l) return f.randomization.sampleWithReplacement(t, e, i);
        }
        return s;
      },
      factorial: function (t) {
        if (0 === Object.keys(t).length) return [{}];
        var e = Object.keys(t),
          i = e[0],
          s = t[i],
          n = {};
        for (var o in t) o != i && (n[o] = t[o]);
        for (var a = [], r = f.randomization.factorial(n), l = 0; l < s.length; l++)
          for (var c = s[l], d = 0; d < r.length; d++) {
            var h = JSON.parse(JSON.stringify(r[d]));
            (h[i] = c), a.push(h);
          }
        return a;
      },
      randomID: function (t) {
        for (var e = "", i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", s = 0; s < t; s++) e += i.charAt(Math.floor(Math.random() * i.length));
        return e;
      },
    },
    turk: new m(),
    pluginAPI: new c(),
    data: new u(),
    timeline: new l(),
    extensions: {},
    version: function () {
      return "7.2.3";
    },
  };
  function g(t) {
    var e = { ...n, ...t };
    (f.opts = e),
      (f.turk.turkInfo().outsideTurk && !e.override_safe_mode) ||
        (window.addEventListener("beforeunload", (t) => {
          (t.preventDefault(), t.returnValue) ? (t.returnValue = "") : (delete t.returnValue, (t.returnValue = ""));
        }),
        window.addEventListener("unload", e.on_close)),
      (f.data = new u(e.display_element)),
      (f.data.results = {}),
      (f.pluginAPI = new c(f)),
      (f.timeline = new l()),
      (f.DOM = new a(f));
    const i = new r(f);
    if (
      (e.extensions.forEach((t) => {
        i.registerExtension(t.type, t.params);
      }),
      (i.run = async function (t) {
        await f.DOM.run(t, e);
      }),
      void 0 !== e.on_interaction_data_update)
    ) {
      const t = e.on_interaction_data_update;
      f.DOM.addEvents({ on_interaction: t });
    }
    return i;
  }
  return (
    (g.plugins = {}),
    (g.data = f.data),
    (g.turk = f.turk),
    (g.randomization = f.randomization),
    (g.pluginAPI = f.pluginAPI),
    (g.version = f.version),
    (g.utils = {
      deepCopy: function (t) {
        if (null == t || "object" != typeof t) return t;
        if (t instanceof Date) {
          var e = new Date(t.getTime());
          return e;
        }
        if (t instanceof Array) {
          e = [];
          for (var i = 0, s = t.length; i < s; i++) e[i] = g.utils.deepCopy(t[i]);
          return e;
        }
        if (t instanceof Object) {
          e = {};
          for (var n in t) t.hasOwnProperty(n) && (e[n] = g.utils.deepCopy(t[n]));
          return e;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
      },
    }),
    g
  );
})();