"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _justoInjector = require(
"justo-injector");var _justoResult = require(
"justo-result");var _SimpleTask = require(
"./SimpleTask");var _SimpleTask2 = _interopRequireDefault(_SimpleTask);var _Macro = require(
"./Macro");var _Macro2 = _interopRequireDefault(_Macro);var _Workflow = require(
"./Workflow");var _Workflow2 = _interopRequireDefault(_Workflow);var _RunError = require(
"./RunError");var _RunError2 = _interopRequireDefault(_RunError);


var simple = Symbol();
var macro = Symbol();
var workflow = Symbol();
var runSyncSimpleTask = Symbol();
var runAsyncSimpleTask = Symbol();var 








Runner = (function () {





  function Runner(config) {_classCallCheck(this, Runner);

    if (!config) throw new Error("Expected runner configuration.");
    if (!config.reporters) throw new Error("Expected reporters.");
    if (!config.loggers) throw new Error("Expected loggers.");


    Object.defineProperty(this, "loggers", { value: config.loggers, enumerable: true });
    Object.defineProperty(this, "reporters", { value: config.reporters, enumerable: true });
    Object.defineProperty(this, "simple", { value: this[simple].bind(this), enumerable: true });
    Object.defineProperty(this, "macro", { value: this[macro].bind(this), enumerable: true });
    Object.defineProperty(this, "workflow", { value: this[workflow].bind(this), enumerable: true });
    Object.defineProperty(this, "breakOnError", { value: config.onError == "break", enumerable: true });}_createClass(Runner, [{ key: "publishInto", value: 
















    function publishInto(obj) {
      Object.defineProperty(obj, "simple", { value: this.simple, enumerable: true, configurable: true });
      Object.defineProperty(obj, "macro", { value: this.macro, enumerable: true, configurable: true });
      Object.defineProperty(obj, "workflow", { value: this.workflow, enumerable: true, configurable: true });} }, { key: "unpublishFrom", value: 







    function unpublishFrom(obj) {
      delete obj.simple;
      delete obj.macro;
      delete obj.workflow;} }, { key: 




















    simple, value: function value() {var _this = this;for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
      var opts, fn, task, wrapper;


      if (args.length === 0) {
        throw new Error("Invalid number of arguments. At least, the task function must be passed.");} else 
      if (args.length == 1) {
        fn = args[0];
        opts = {};} else 
      if (args.length >= 2) {
        opts = args[0];fn = args[1];}


      if (typeof opts == "object" && !opts.name) opts.name = fn.name || "simple anonymous task";


      task = new _SimpleTask2["default"](opts, fn);


      wrapper = function () {for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}
        var opts, params;


        if (args.length === 0) {
          opts = {};
          params = [];} else 
        if (args.length == 1) {
          opts = args[0];
          params = [];} else 
        if (args.length >= 2) {
          opts = args[0];
          params = args.slice(1);}


        if (typeof opts == "string") opts = { title: opts };


        return _this.runSimpleTask(task, opts, params);};


      this.initWrapper(wrapper, task);


      return wrapper;} }, { key: "runSimpleTask", value: 










    function runSimpleTask(task, opts, params) {
      var res;


      opts = Object.assign({ title: task.title, ignore: task.ignore, mute: task.mute }, opts);
      if (opts.hasOwnProperty("onlyIf")) opts.ignore = !opts.onlyIf;
      if (opts.hasOwnProperty("onlyif")) opts.ignore = !opts.onlyif;


      if (opts.ignore) {
        this.loggers.debug("Ignoring simple task '" + opts.title + "'.");
        if (!opts.mute) this.reporters.ignore(opts.title, task);} else 
      {
        if (task.sync) res = this[runSyncSimpleTask](task, opts, params);else 
        this[runAsyncSimpleTask](task, opts, params);}



      return res;} }, { key: 


    runSyncSimpleTask, value: function value(task, opts, params) {
      var res = undefined, state = undefined, err = undefined, start = undefined, end = undefined;


      try {
        var fn = task.fn;

        params = (0, _justoInjector.inject)({ params: params, logger: this.loggers, log: this.loggers }, fn);

        this.loggers.debug("Starting sync run of simple task '" + opts.title + "'.");
        if (!opts.mute) this.reporters.start(opts.title, task);

        start = Date.now();
        res = fn.apply(undefined, _toConsumableArray(params));
        state = _justoResult.ResultState.OK;} 
      catch (e) {
        err = e;
        state = _justoResult.ResultState.FAILED;} finally 
      {
        end = Date.now();}


      this.loggers.debug("Ended sync run of simple task '" + opts.title + "' in '" + state + "' state.");
      if (!opts.mute) this.reporters.end(task, state, err, start, end);
      if (err && this.breakOnError) throw new _RunError2["default"](task, err);


      return res;} }, { key: 


    runAsyncSimpleTask, value: function value(task, opts, params) {
      var state, err, start, end;

      try {
        var fn = task.fn;

        this.loggers.debug("Starting async run of simple task '" + opts.title + "'.");
        if (!opts.mute) this.reporters.start(opts.title, task);

        start = Date.now();
        err = this.runAsyncFunction(fn, params);
        state = err ? Result.FAILED : _justoResult.ResultState.OK;} 
      catch (e) {
        err = e;
        state = _justoResult.ResultState.FAILED;} finally 
      {
        end = Date.now();}


      this.loggers.debug("Ended async run of simple task '" + opts.title + "' in '" + state + "' state.");
      if (!opts.mute) this.reporters.end(task, state, err, start, end);
      if (err && this.breakOnError) throw new _RunError2["default"](task, err);} }, { key: "runAsyncFunction", value: 











    function runAsyncFunction(fn, params) {
      var deasync = require("deasync");
      var err;

      try {
        err = deasync(function (done) {
          function jdone(err) {
            if (err) {
              if (err instanceof Error) done(err);else 
              done(new Error(err));} else 
            {
              done();}}



          params = (0, _justoInjector.inject)({ done: jdone, params: params, logger: this.loggers, log: this.loggers }, fn);
          fn.apply(undefined, _toConsumableArray(params));})();} 

      catch (e) {
        err = e;}


      return err;} }, { key: 



















    macro, value: function value() {var _this2 = this;for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {args[_key3] = arguments[_key3];}
      var opts, tasks, wrapper, task;


      if (args.length === 0) {
        throw new Error("Invalid number of arguments. At least, the array of tasks must be passed.");} else 
      if (args.length == 1) {
        tasks = args[0];
        opts = {};} else 
      if (args.length >= 2) {
        opts = args[0];tasks = args[1];}


      if (typeof opts == "object" && !opts.name) opts.name = "anonymous macro";


      task = new _Macro2["default"](opts, []);var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

        for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var t = _step.value;
          if (t instanceof Function) {
            if (!t.__task__) t = this[simple](t);} else 
          {
            if (!t.task.__task__) t.task = this[simple](t.task);}


          task.add(t);}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator["return"]) {_iterator["return"]();}} finally {if (_didIteratorError) {throw _iteratorError;}}}



      wrapper = function () {for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {args[_key4] = arguments[_key4];}
        var opts, params;


        if (args.length === 0) {
          opts = {};
          params = [];} else 
        if (args.length == 1) {
          opts = args[0];
          params = [];} else 
        if (args.length >= 2) {
          opts = args[0];
          params = args.slice(1);}


        if (typeof opts == "string") opts = { title: opts };


        return _this2.runMacro(task, opts, params);};


      this.initWrapper(wrapper, task);


      return wrapper;} }, { key: "runMacro", value: 










    function runMacro(macro, opts, params) {
      var title, res;


      title = opts.title || macro.title;
      if (!opts.hasOwnProperty("ignore")) opts.ignore = macro.ignore;
      if (!opts.hasOwnProperty("mute")) opts.mute = macro.mute;
      params = params.length === 0 ? undefined : params;


      if (opts.ignore) {
        this.loggers.debug("Ignoring macro '" + title + "'.");
        if (!opts.mute) this.reporters.ignore(title, macro);} else 
      {
        var err = undefined;

        this.loggers.debug("Starting run of macro '" + title + "'.");
        if (!opts.mute) this.reporters.start(title, macro);

        try {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
            for (var _iterator2 = macro.tasks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var t = _step2.value;
              var task = t.task;
              var __task__ = task.__task__;
              var oo = { title: t.title, mute: opts.mute };
              var pp = params || t.params || [];

              if (__task__ instanceof _SimpleTask2["default"]) this.runSimpleTask(__task__, oo, pp);else 
              if (__task__ instanceof _Macro2["default"]) this.runMacro(__task__, oo, pp);else 
              if (__task__ instanceof _Workflow2["default"]) this.runWorkflow(__task__, oo, pp);else 
              throw new Error("Invalid task of macro.");}} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2["return"]) {_iterator2["return"]();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}} 

        catch (e) {
          err = e;} finally 
        {
          if (err && this.breakOnError) {
            this.loggers.debug("Ended run of macro '" + title + "' on error.");
            if (!opts.mute) this.reporters.end(macro);
            throw err;} else 
          {
            this.loggers.debug("Ended run of macro '" + title + "'.");
            if (!opts.mute) this.reporters.end(macro);}}}} }, { key: 






















    workflow, value: function value() {var _this3 = this;for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {args[_key5] = arguments[_key5];}
      var opts, fn, task, wrapper;


      if (args.length === 0) {
        throw new Error("Invalid number of arguments. At least, the workflow function must be passed.");} else 
      if (args.length == 1) {
        fn = args[0];
        opts = {};} else 
      if (args.length >= 2) {
        opts = args[0];fn = args[1];}


      if (typeof opts == "object" && !opts.name) opts.name = fn.name || "anonymous workflow";


      task = new _Workflow2["default"](opts, fn);


      wrapper = function () {for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {args[_key6] = arguments[_key6];}
        var opts, params;


        if (args.length === 0) {
          opts = {};
          params = [];} else 
        if (args.length == 1) {
          opts = args[0];
          params = [];} else 
        if (args.length >= 2) {
          opts = args[0];
          params = args.slice(1);}


        if (typeof opts == "string") opts = { title: opts };


        return _this3.runWorkflow(task, opts, params);};


      this.initWrapper(wrapper, task);


      return wrapper;} }, { key: "runWorkflow", value: 










    function runWorkflow(workflow, opts, params) {
      var title, res;


      title = opts.title || workflow.title;
      if (!opts.hasOwnProperty("ignore")) opts.ignore = workflow.ignore;
      if (!opts.hasOwnProperty("mute")) opts.mute = workflow.mute;


      if (opts.ignore) {
        this.loggers.debug("Ignoring workflow '" + title + "'.");
        if (!opts.mute) this.reporters.ignore(title, workflow);} else 
      {
        var state = undefined, err = undefined, start = undefined, end = undefined;

        try {
          var fn = workflow.fn;
          params = (0, _justoInjector.inject)({ params: params, logger: this.loggers, log: this.loggers }, fn);

          this.loggers.debug("Starting run of workflow '" + title + "'.");
          if (!opts.mute) this.reporters.start(title, workflow);

          start = Date.now();
          res = fn.apply(undefined, _toConsumableArray(params));
          state = _justoResult.ResultState.OK;} 
        catch (e) {
          err = e;
          state = _justoResult.ResultState.FAILED;} finally 
        {
          end = Date.now();}


        this.loggers.debug("Ended run of workflow '" + title + "' in '" + state + "' state.");
        if (!opts.mute) this.reporters.end(workflow, state, err, start, end);
        if (err && this.breakOnError) throw new _RunError2["default"](workflow, err);}



      return res;} }, { key: "initWrapper", value: 









    function initWrapper(wrapper, task) {
      Object.defineProperty(wrapper, "__task__", { value: task });

      Object.defineProperty(wrapper, "ignore", { 
        value: function value(opts) {for (var _len7 = arguments.length, params = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {params[_key7 - 1] = arguments[_key7];}
          if (typeof opts == "string") opts = { title: opts };
          wrapper.apply(undefined, [Object.assign({}, opts, { ignore: true })].concat(params));}, 

        enumerable: true });


      Object.defineProperty(wrapper, "mute", { 
        value: function value(opts) {for (var _len8 = arguments.length, params = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {params[_key8 - 1] = arguments[_key8];}
          if (typeof opts == "string") opts = { title: opts };
          return wrapper.apply(undefined, [Object.assign({}, opts, { mute: true })].concat(params));}, 

        enumerable: true });} }, { key: "end", value: 






    function end() {
      this.reporters.end();
      this.loggers.debug("Ending report.");} }, { key: "continueOnError", get: function get() {return !this.breakOnError;} }], [{ key: "DEFAULT_DISPLAY", get: 


    function get() {
      return DEFAULT_DISPLAY;} }, { key: "DEFAULT_LOGGER_OPTIONS", get: 


    function get() {
      return DEFAULT_LOGGER_OPTIONS;} }]);return Runner;})();exports["default"] = Runner;module.exports = exports["default"];
