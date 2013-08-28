(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  describe('Mixen', function() {
    it('should be defined', function() {
      return expect(Mixen).toBeDefined();
    });
    it('should be possible to pass through a method from a mixin', function() {
      var MyModule, X, inst, _ref;
      MyModule = (function() {
        function MyModule() {}

        MyModule.prototype.x = function() {
          return 3;
        };

        return MyModule;

      })();
      X = (function(_super) {
        __extends(X, _super);

        function X() {
          _ref = X.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        return X;

      })(Mixen(MyModule));
      inst = new X;
      expect(inst.x).toBeDefined();
      expect(inst.x()).toBe(3);
      return expect(typeof inst.x).toBe('function');
    });
    it('should pass references to the previous function', function() {
      var MyModule, X, inst, _ref;
      MyModule = (function() {
        function MyModule() {}

        MyModule.prototype.x = function(arg) {
          var _ref;
          return ((_ref = MyModule.__super__.x.call(this, arg)) != null ? _ref : 0) + 2;
        };

        return MyModule;

      })();
      X = (function(_super) {
        __extends(X, _super);

        function X() {
          _ref = X.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        X.prototype.x = function(arg) {
          return X.__super__.x.call(this, arg) + 8;
        };

        return X;

      })(Mixen(MyModule));
      inst = new X;
      return expect(inst.x(0)).toBe(10);
    });
    it('should end up calling the parent classes methods', function() {
      var Parent, X, inst, _ref;
      Parent = (function() {
        function Parent() {}

        Parent.prototype.x = function(a) {
          return a + 2;
        };

        return Parent;

      })();
      X = (function(_super) {
        __extends(X, _super);

        function X() {
          _ref = X.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        return X;

      })(Mixen(Parent));
      inst = new X;
      return expect(inst.x(2)).toBe(4);
    });
    it('should pass references to the chain of previous functions in the order defined', function() {
      var Module1, Module2, X, inst, _ref;
      Module1 = (function() {
        function Module1() {}

        Module1.prototype.x = function(arg) {
          var _ref;
          return ((_ref = Module1.__super__.x.apply(this, arguments)) != null ? _ref : 5) + arg + '1';
        };

        return Module1;

      })();
      Module2 = (function() {
        function Module2() {}

        Module2.prototype.x = function(arg) {
          var _ref;
          return ((_ref = Module2.__super__.x.apply(this, arguments)) != null ? _ref : 4) + arg + '2';
        };

        return Module2;

      })();
      X = (function(_super) {
        __extends(X, _super);

        function X() {
          _ref = X.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        X.prototype.x = function(arg) {
          return X.__super__.x.apply(this, arguments) + arg + '0';
        };

        return X;

      })(Mixen(Module2, Module1));
      inst = new X;
      return expect(inst.x('-')).toBe('5-1-2-0');
    });
    it('should call all constructors in the right order', function() {
      var Module, Module1, Module2, Module3, inst, order;
      order = '';
      Module1 = (function() {
        function Module1() {
          expect(this instanceof Module).toBe(true);
          order += '1';
        }

        return Module1;

      })();
      Module2 = (function() {
        function Module2() {}

        return Module2;

      })();
      Module3 = (function() {
        function Module3() {
          expect(this instanceof Module).toBe(true);
          order += '3';
        }

        return Module3;

      })();
      Module = (function(_super) {
        __extends(Module, _super);

        function Module() {
          Module.__super__.constructor.apply(this, arguments);
          expect(this instanceof Module).toBe(true);
          order += '4';
        }

        return Module;

      })(Mixen(Module1, Module2, Module3));
      inst = new Module;
      return expect(order).toBe('134');
    });
    it('should not call mixen constructors if super is not called', function() {
      var Module, Module1, inst;
      Module1 = (function() {
        function Module1() {
          expect(true).toBe(false);
        }

        return Module1;

      })();
      Module = (function(_super) {
        __extends(Module, _super);

        function Module() {
          expect(true).toBe(true);
        }

        return Module;

      })(Mixen(Module1));
      return inst = new Module;
    });
    it('should call mixen constructors if no constructor is defined', function() {
      var Module, Module1, called, inst, _ref;
      called = false;
      Module1 = (function() {
        function Module1() {
          called = true;
        }

        return Module1;

      })();
      Module = (function(_super) {
        __extends(Module, _super);

        function Module() {
          _ref = Module.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        return Module;

      })(Mixen(Module1));
      inst = new Module;
      return expect(called).toBe(true);
    });
    it('should pass through non-function properties', function() {
      var Module1, X, inst, _ref;
      Module1 = (function() {
        function Module1() {}

        Module1.prototype.property = 4;

        return Module1;

      })();
      X = (function(_super) {
        __extends(X, _super);

        function X() {
          _ref = X.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        return X;

      })(Mixen(Module1));
      inst = new X;
      return expect(inst.property).toBe(4);
    });
    it('should handle multiple mixins', function() {
      var Module1, Module2, X, inst, _ref;
      Module1 = (function() {
        function Module1() {}

        Module1.prototype.x = function() {
          return 3;
        };

        return Module1;

      })();
      Module2 = (function() {
        function Module2() {}

        Module2.prototype.y = function() {
          return 5;
        };

        return Module2;

      })();
      X = (function(_super) {
        __extends(X, _super);

        function X() {
          _ref = X.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        return X;

      })(Mixen(Module1, Module2));
      inst = new X;
      expect(inst.x).toBeDefined();
      expect(inst.y).toBeDefined();
      expect(inst.x()).toBe(3);
      return expect(inst.y()).toBe(5);
    });
    it('should be able to handle multiple mixens existing at once', function() {
      var A, B, C, D, E, F, Module1, Module2, Module3, Module4, Module5, Module6, a, b, c, d, e1, e2, f, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      Module1 = (function() {
        function Module1() {}

        Module1.prototype.x = function() {
          var _ref;
          return '1' + ((_ref = Module1.__super__.x.apply(this, arguments)) != null ? _ref : '');
        };

        return Module1;

      })();
      Module2 = (function() {
        function Module2() {}

        Module2.prototype.x = function() {
          var _ref;
          return '2' + ((_ref = Module2.__super__.x.apply(this, arguments)) != null ? _ref : '');
        };

        return Module2;

      })();
      Module3 = (function() {
        function Module3() {}

        Module3.prototype.x = function() {
          var _ref;
          return '3' + ((_ref = Module3.__super__.x.apply(this, arguments)) != null ? _ref : '');
        };

        return Module3;

      })();
      Module4 = (function() {
        function Module4() {}

        return Module4;

      })();
      Module5 = (function() {
        function Module5() {}

        Module5.prototype.x = function() {
          var _ref;
          return '5' + ((_ref = Module5.__super__.x.apply(this, arguments)) != null ? _ref : '');
        };

        return Module5;

      })();
      Module6 = (function() {
        function Module6() {}

        Module6.prototype.x = function() {
          var _ref;
          return '6' + ((_ref = Module6.__super__.x.apply(this, arguments)) != null ? _ref : '');
        };

        return Module6;

      })();
      A = (function(_super) {
        __extends(A, _super);

        function A() {
          _ref = A.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        return A;

      })(Mixen(Module4, Module3, Module1));
      B = (function(_super) {
        __extends(B, _super);

        function B() {
          _ref1 = B.__super__.constructor.apply(this, arguments);
          return _ref1;
        }

        return B;

      })(Mixen(Module5, Module3, Module2));
      C = (function(_super) {
        __extends(C, _super);

        function C() {
          _ref2 = C.__super__.constructor.apply(this, arguments);
          return _ref2;
        }

        return C;

      })(Mixen(Module6, Module3, Module1));
      D = (function(_super) {
        __extends(D, _super);

        function D() {
          _ref3 = D.__super__.constructor.apply(this, arguments);
          return _ref3;
        }

        return D;

      })(Mixen(Module6, Module3, Module1));
      E = (function(_super) {
        __extends(E, _super);

        function E() {
          _ref4 = E.__super__.constructor.apply(this, arguments);
          return _ref4;
        }

        return E;

      })(Mixen(Module6, Module4, Module5));
      F = (function(_super) {
        __extends(F, _super);

        function F() {
          _ref5 = F.__super__.constructor.apply(this, arguments);
          return _ref5;
        }

        return F;

      })(Mixen(Module1, Module6, Module5));
      a = new A;
      b = new B;
      d = new D;
      c = new C;
      e2 = new E;
      f = new F;
      e1 = new E;
      expect(a.x()).toBe('31');
      expect(b.x()).toBe('532');
      expect(e1.x()).toBe('65');
      expect(c.x()).toBe('631');
      expect(d.x()).toBe('631');
      expect(e2.x()).toBe('65');
      return expect(f.x()).toBe('165');
    });
    return it('should be able to mixin mixens', function() {
      var Module1, Module12, Module2, Module3, Module312, inst, order;
      order = '';
      Module1 = (function() {
        function Module1() {
          order += '-1-';
        }

        return Module1;

      })();
      Module2 = (function() {
        function Module2() {
          order += '-2-';
        }

        return Module2;

      })();
      Module12 = (function(_super) {
        __extends(Module12, _super);

        function Module12() {
          Module12.__super__.constructor.apply(this, arguments);
          order += '-12-';
        }

        return Module12;

      })(Mixen(Module1, Module2));
      Module3 = (function() {
        function Module3() {
          order += '-3-';
        }

        return Module3;

      })();
      Module312 = (function(_super) {
        __extends(Module312, _super);

        function Module312() {
          Module312.__super__.constructor.apply(this, arguments);
          order += '-312-';
        }

        return Module312;

      })(Mixen(Module3, Module12));
      inst = new Module312;
      return expect(order).toBe('-3--1--2--12--312-');
    });
  });

}).call(this);
