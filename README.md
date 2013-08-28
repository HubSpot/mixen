Mixen
====================

Mixen lets you combine classes on the fly.  With it you can build smaller, easier to understand and
more testable components, and more easily share code with others.  **It does not just merge the prototypes.**

```coffeescript
class MyModel extends Mixen(Throttle, APIBinding, Validate, Backbone.Model)
  # Inheritance Chain:
  #
  # MyModel -> Throttle -> APIBinding -> Validate -> Backbone.Model


class MyOtherModel extends Mixen(APIBinding, Backbone.Model)
  # Inheritance Chain:
  #
  # MyOtherModel -> APIBinding -> Backbone.Model
```

The 2kb library only exposes a single function, `Mixen`.  This function allows you to combine
classes together in such a way that the `super` keyword will dynamically call the appropriate method in the
next mixin you're using.

> Note:
>
> These examples are in CoffeeScript.  Skip down to the bottom for a short description of how
> this can be done with JavaScript.

### Usage

On the browser include [mixen.min.js](https://github.com/HubSpot/Mixen/blob/master/mixen.min.js), and the `Mixen` function will be globally available.
You can also use AMD.

On node:

```bash
npm install mixen
```

```coffeescript
Mixen = require('mixen')
```

The Mixen function takes in any number of classes, and returns an object:

```coffeescript
MyObject = Mixen(Object1, Object2, ...)
```

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
`super` call used above with `ModuleName.__super__.methodName`.

```javascript
var AuthInContext, MyView, UserInContext;

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

Where __extends is implemented as:

```coffeescript
var __hasProp = {}.hasOwnProperty,
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
```

### Debugging

If it's not working the way you expect, it's usually because you forgot to call `super` in one of your methods.

Take a look at the tests for complete examples of how things should work.

### Support

Mixen is tested in IE6+, Firefox 3+, Chrome 14+, Safari 4+, Opera 10+, Safari on iOS 3+, Android 2.2+ and Node 0.8+.
