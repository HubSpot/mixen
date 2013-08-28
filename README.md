Mixen
====================

Mixen lets you combine a whole bunch of classes together to build the exact class you want to be extending.

In traditional CoffeeScript, each class can only extend a single other class, and you can't change that
setup dynamically.  So if you want to be able to compose classes from smaller ones, you better only want to
use each class one way.  It's easy to merge classes together, but then one module's methods will clobber
method's with that same name before it.

Mixen is a 2kb library that exposes a single function.  The function, `Mixen`, allows you to combine
classes together in such a way that the `super` keyword will dynamically call the appropriate method in the
next mixin you're using.

It was created to solve the problem of "we want to create a parent 'view' or 'model' or anything
everyone will inherit from, but not everyone needs every bell and whistle."  It lets you define modules
and when you go to create a class, you can pick and choose which modules you need.

> Note:
>
> These examples are in CoffeeScript.  Skip down to the bottom for a short description of how
> this could be done with just JavaScript.  The syntax is not as nice.

### Example

At some point in everyone's Backbone journey, it seems necessary to create a
personalized extension of Backbone.View which can do all sorts of special things.

Mixen allows you to create such a View superclass which mixins modular components.

A mixin is just a class:

```coffeescript
class AwesomeMixin
  myMethod: ->
```

Any view who would like your method can now use Mixen to mix you in:

```coffeescript
class MyView extends Mixen(AwesomeMixin, Backbone.View)
```

### Multiple Mixins Which Share a Method

So far what you've seen is not anything which couldn't be done with class extension, or `_.extends`.
Mixen adds one very important capability, the ability to have multiple mixins all implement the same method.

```coffeescript
class CountSyncs
  sync: ->
    @syncs ?= 0
    @syncs++

    super
```

```coffeescript
class ThrottleSyncs
  sync: ->
    return if @syncing
    @syncing = true

    super.finally =>
      @syncing = false
```

Now, you can mix in both classes.  When the first mixin calls `super`, it will dynamically find and call the second
mixin's `sync` method.

```coffeescript
class MyModel extends Mixen(ThrottleSyncs, CountSyncs, Backbone.Model)
```

`MyModel` will both throttle it's sync's and keep track of it's sync count.

Note that the count `CountSyncs` will change depending on if it is listed before or after
`Throttle Syncs`.  All methods are resolved from left to right.  In other words,
when you call `super`, you are calling the mixin to the current mixins right.

#### The End of the Chain

When you're developing a mixin, you don't know if your mixin will be the last in a chain used
to create a class or not.  Therefore you must always call super (unless you want to break the chain), and
you must always be ready for `super` to return undefined (as it will if there are no more classes mixed in
which implement that method).

```coffeescript
class UserInContext
  getContext: ->
    context = super ? {}
    context.user = 'bob smith'
    context

class AuthInContext
  getContext: ->
    context = super ? {}
    context.auth = 'logged-in'
    context
```

Each getContext method will be called, in the order they are defined in the Mixen call:

```coffeescript
class MyView extends Mixen(AuthInContext, UserInContext, Backbone.View)
  getContext: ->
    context = super
    context.x = 2
    context
```

### Mixening in Constructors

Mixins can have constructors.  As long as the resultant class either does not have a constructor,
or calls `super` in it's constructor, all of the mixins constructors will be called in the order
they are defined.  If you do not wish for the constructors to be called, simply don't call super
in the constructor of the class extending the mixen.

```coffeescript
class CallInitialize
  constructor: ->
    @initialize?()
```

```coffeescript
# initialize will be called
class MyThing extends Mixen(CallInitialize)

# initialize will be called
class MyThing extends Mixen(CallInitialize)
  constructor: ->
    # Do whatever other stuff you want...

    super

# initialize WON'T be called
class MyThing extends Mixen(CallInitialize)
  constructor: ->
    # Never called super...
```

Note, that unlike the other methods, mixins should not call `super` in their constructors.  This is
necessary because, unlike with standard methods, all classes have a constructor, even if you never
explicitly implemented one.  This means that if we made you call `super`, you would have to explicitly
call `super` in each constructor, even when you don't care to specify one.  To keep things simple, we
always call all the mixin's constructors in the order they are specified, provided the mixing class doesn't
explicitly prevent it.

### Using passSuper

All of this super overriding can be problematic if you want to use inheritance to define your mixins (make
mixins which extend other mixins, most people don't do this).  You can use the `passSuper` option to get
Mixen to give you the super functions, and leave the built-in one alone:

```coffeescript
class MyModule
  passSuper: true

  getContext: (parent, otherArg) ->
    context = parent(otherArg) ? {}
    context.otherThing = otherArg
    context
```

### Aliases

Mixen doesn't create them for you, but you're more than welcome to create some helpful aliases as you need:

```coffeescript
Mixen.View = (modules...) ->
  Mixen(modules..., Backbone.View)
```

You can do a similar thing to create a default list of mixins for your application:

```coffeescript
ViewMixen = (modules...) ->
  Mixen(modules..., EventJanitor, Backbone.View)
```

### Composition

You can safely mixin other mixens:

```coffeescript
BaseView = Mixen(EventJanitor, Backbone.View)

class MyView extends Mixen(SuperSpecialModule, BaseView)
```

### Not Using CoffeeScript?

If you're not using CoffeeScript, it is possible to write the necessary js manually.  Replicating CoffeeScript's
interitance mechanism is fairly complicated however.  It requires a robust extension mechanism, and replacing every
`super` call used above with `ModuleName.__super__.methodName`.  If you'd like you could also use the `passSuper` option explained
above to avoid the awkward `__super__` syntax.

```javascript
var AuthInContext, MyView, UserInContext, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent){
    for (var key in parent) {
      if (__hasProp.call(parent, key))
        child[key] = parent[key];
    }

    function ctor() {
      this.constructor = child;
    }

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;

    return child;
  };

UserInContext = function (){}

UserInContext.prototype.getContext = function(){
  var context;

  context = UserInContext.__super__.getContext.apply(this, arguments) || {};
  context.user = 'bob smith';
  return context;
};

AuthInContext = function (){}

AuthInContext.prototype.getContext = function(){
  var context;

  context = AuthInContext.__super__.getContext.apply(this, arguments) || {};
  context.auth = 'logged-in';
  return context;
};

MyView = function (){
  return MyView.__super__.constructor.apply(this, arguments);
}

__extends(MyView, Mixen(AuthInContext, UserInContext, Backbone.View));

MyView.prototype.getContext = function(){
  var context;

  context = MyView.__super__.getContext.apply(this, arguments);
  context.x = 2;
  return context;
};
```

### Debugging

If it's not working the way you expect, it's usually because you forgot to call `super` in one of your methods.

Take a look at the tests for complete examples of how things should work.

### Support

Mixen is tested in IE6+, Firefox 3+, Chrome 14+, Safari 4+, Opera 10+, Safari on iOS 3+, Android 2.2+, Node 0.6+.
