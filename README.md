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

Feel free to [start playing with Mixen](http://jsfiddle.net/4XgaR/7/) right now.

On the browser include [mixen.min.js](https://raw.github.com/HubSpot/mixen/v0.5.0/mixen.min.js), and the `Mixen` function will be globally available.
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

Skip down for a list of the publicly available mixins.

### Example

A mixin is just a class:

```coffeescript
class OnlyRenderWithModel
  render: ->
    return unless @model

    super
```

Any view who would like your method can now use Mixen to mix you in:

```coffeescript
class MyView extends Mixen(OnlyRenderWithModel, Backbone.View)
```

You can now replace your BaseModels and BaseViews with modular components.

### Multiple Mixins Which Share Methods

Mixen adds one very important capability to inheritance, the ability to have multiple mixins all implement the same method.

```coffeescript
class CountSyncs
  sync: ->
    @syncs = (@syncs or 0) + 1

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
`ThrottleSyncs`.  All methods are resolved from left to right.  In other words,
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

Diamond inheritance is not supported yet.

### Not Using CoffeeScript?

If you're not using CoffeeScript, it is possible to write the necessary js manually.  Replicating CoffeeScript's
inheritance mechanism is fairly complicated however.  It requires a robust extension mechanism, and replacing every
`super` call used above with `ModuleName.__super__.methodName`.

```javascript
var AuthInContext, MyView, UserInContext;

UserInContext = function (){}

UserInContext.prototype.getContext = function(){
  var context = UserInContext.__super__.getContext.apply(this, arguments) || {};
  context.user = 'bob smith';
  return context;
};

AuthInContext = function (){}

AuthInContext.prototype.getContext = function(){
  var context = AuthInContext.__super__.getContext.apply(this, arguments) || {};
  context.auth = 'logged-in';
  return context;
};

MyView = function (){
  return MyView.__super__.constructor.apply(this, arguments);
}

__extends(MyView, Mixen(AuthInContext, UserInContext, Backbone.View));

MyView.prototype.getContext = function(){
  var context = MyView.__super__.getContext.apply(this, arguments);
  context.x = 2;
  return context;
};
```

Where `__extends` is implemented as:

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

You can always ask us for help in GitHub Issues.

### Support

Mixen is tested in IE6+, Firefox 3+, Chrome 14+, Safari 4+, Opera 10+, Safari on iOS 3+, Android 2.2+ and Node 0.8+.

### Contributing

We welcome pull requests and discussion using GitHub Issues.

To get setup for development, run this in the project directory:

```bash
npm install
```

Then, you can run `grunt watch` to have it watch the source files for changes.
Run `grunt test` to ensure that the tests still pass.
You can also open `spec/vendor/jasmine-1.3.1/SpecRunner.html` in your browser to check the tests (after doing a `grunt` build).

If you create a mixin which others might find useful, please name it `mixen-<type>-<name>`, where type identifies what sort
of thing this mixin is designed to extend (leave type out of it's general-purpose).

Examples of good names:

mixen-view-eventjanitor
mixen-model-throttle

### Mixins

#### Backbone

##### View

- [Event Janitor](http://github.com/HubSpot/mixen-view-eventjanitor)

##### Model

- [Throttle](http://github.com/HubSpot/mixen-model-throttle)

Please let us know of any interesting Mixen's you make!

### Changelog

- 0.5.0 - Initial public release
- 0.5.1 - Fix bug with interoperability with Backbone.extend
