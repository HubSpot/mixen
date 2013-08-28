(function() {
  var Mixen, identity, indexOf, moduleSuper, uniqueId,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  indexOf = function(haystack, needle) {
    var i, stalk, _i, _len;
    for (i = _i = 0, _len = haystack.length; _i < _len; i = ++_i) {
      stalk = haystack[i];
      if (stalk === needle) {
        return i;
      }
    }
    return -1;
  };

  identity = function(arg) {
    return arg;
  };

  uniqueId = (function() {
    var id;
    id = 0;
    return function() {
      return id++;
    };
  })();

  Mixen = function() {
    return Mixen.createMixen.apply(Mixen, arguments);
  };

  Mixen.createdMixens = {};

  moduleSuper = function(module, method) {
    return function() {
      var args, current, id, modules, nextModule, pos;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      current = this.constructor.prototype;
      id = null;
      while (true) {
        if (current === Object.prototype) {
          return;
        }
        id = current._mixen_id;
        if (id != null) {
          break;
        }
        current = current.constructor.__super__.constructor.prototype;
      }
      if (id == null) {
        return;
      }
      modules = Mixen.createdMixens[id];
      pos = indexOf(modules, module);
      nextModule = null;
      while (pos++ < modules.length - 1) {
        nextModule = modules[pos];
        if (nextModule.prototype[method] != null) {
          break;
        }
      }
      if ((nextModule != null) && (nextModule.prototype != null) && (nextModule.prototype[method] != null)) {
        return nextModule.prototype[method].apply(this, args);
      }
    };
  };

  Mixen.createMixen = function() {
    var method, mods, module, out, _fn, _i, _len, _ref, _ref1;
    mods = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    out = (function() {
      function out() {
        var args, mod, _i, _len;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        for (_i = 0, _len = mods.length; _i < _len; _i++) {
          mod = mods[_i];
          mod.apply(this, args);
        }
      }

      return out;

    })();
    out.prototype._mixen_id = uniqueId();
    Mixen.createdMixens[out.prototype._mixen_id] = mods;
    _ref = mods.slice(0).reverse();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      module = _ref[_i];
      _ref1 = module.prototype;
      _fn = function(method, module) {
        var _base;
        out.prototype[method] = function() {
          var args, _ref2;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return (_ref2 = module.prototype[method]).call.apply(_ref2, [this].concat(__slice.call(args)));
        };
        if (module.__super__ == null) {
          module.__super__ = {};
        }
        return (_base = module.__super__)[method] != null ? (_base = module.__super__)[method] : _base[method] = moduleSuper(module, method);
      };
      for (method in _ref1) {
        if (!__hasProp.call(_ref1, method)) continue;
        if (method === 'constructor') {
          continue;
        }
        if (typeof module.prototype[method] !== 'function') {
          out.prototype[method] = module.prototype[method];
          continue;
        }
        _fn(method, module);
      }
    }
    return out;
  };

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return Mixen;
    });
  } else if (typeof exports === 'object') {
    module.exports = Mixen;
  } else {
    window.Mixen = Mixen;
  }

}).call(this);
