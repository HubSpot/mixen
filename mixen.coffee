# Mixen lets you combine classes together as needed. With it you can build smaller,
# easier to understand and more testable components, and more easily share code with others.

indexOf = (haystack, needle) ->
  for stalk, i in haystack
    return i if stalk is needle

  return -1

uniqueId = do ->
  id = 0
  -> id++

Mixen = ->
  Mixen.createMixen arguments...

Mixen.createMixen = (mods...) ->
  # Since a single mixin module can be used multiple times, we need to
  # store the id of this instance on the outputted object, so we can
  # figure out which modules were included with it when it comes
  # time to resolve super calls.
  #
  # We could also iterate over every mixen we've created so far, but
  # that could have performance implications if you have lots of mixens.
  Last = mods[mods.length - 1]
  for module in mods.slice(0).reverse()
    class Inst extends Last
      # If the extending class calls `super`, or doesn't have a constructor,
      # this will be called to call each mixin's constructor.
      constructor: (args...) ->
        for mod in mods
          mod.apply @, args

    for own k, v of Inst.__super__
      continue unless typeof v is 'function'

      do (k, v, module) ->
        Inst.__super__[k] = (args...) ->
          Last._mixen_stack.unshift module
          ret = v.apply @, args
          Last._mixen_stack.shift()
          return ret

    Last = Inst

    for method of module::
      Inst::[method] = module::[method]

    for own method of module::
      continue if method is 'constructor'
      continue if typeof(module::[method]) isnt 'function'

      # Coffeescript expands super calls into `ModuleName.__super__.methodName`
      #
      # Dynamically composing a bunch of inheriting classes out
      # of the mixins seems like a good idea, but it doesn't work because
      # CoffeeScript rewrites `__super__` calls statically based on the
      # class super is in, so they would not respect these classes.

      if module.__super__?
        # We don't want to mutate the actual module's super, as we could be messing with some
        # random unassuming class
        class NewSuper extends module.__super__
        module.__super__ = NewSuper
      else
        module.__super__ = {}

      module.__super__[method] ?= moduleSuper(module, method)

  Last._mixen_modules = mods
  Last._mixen_stack = []

  Last

moduleSuper = (module, method) ->
  # This is called when super gets called in one of our mixin'ed modules.
  #
  # It resolves what the next module in the module list which has
  # this method defined and calls that method.
  (args...) ->
    modules = @constructor._mixen_stack[0]?._mixen_modules or @constructor._mixen_modules
    return unless modules?

    pos = indexOf modules, module
    nextModule = null

    if pos is -1
      console.error "Something went wrong in Mixen, the appropriate mixin couldn't be found"
      return

    while pos++ < modules.length - 1
      # Look through the remaining modules for the next one which implements
      # the method we're calling.
      nextModule = modules[pos]
        
      break if nextModule::[method]?

    if nextModule? and nextModule::? and nextModule::[method]?
      return nextModule::[method].apply @, args

if typeof define is 'function' and define.amd
  # AMD
  define -> Mixen
else if typeof exports is 'object'
  # Node
  module.exports = Mixen
else
  # Global
  window.Mixen = Mixen
