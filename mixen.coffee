# Mixen is a tool for creating superclasses composed of a bunch of mixins.
#
# You register the mixins, and then you give mixen a list of which modules you'd like to use
# and it builds the superclass dynamically.

indexOf = (haystack, needle) ->
  for stalk, i in haystack
    return i if stalk is needle

  return -1

identity = (arg) -> arg

uniqueId = do ->
  id = 0
  -> id++

Mixen = ->
  Mixen.createMixen arguments...

Mixen.createdMixens = {}

moduleSuper = (module, method) ->
  # This is called when super gets called in one of our mixin'ed modules.
  #
  # It resolves what the next module in the module list which has
  # this method defined and calls that method.
  (args...) ->
    current = @constructor::
    id = null
    while not id?
      # Navigate up the inheritance tree looking for the object we created
      # when we built the mixen.  It will have the id we need to find the other
      # modules.
      return if current is Object::

      id = current._mixen_id

      current = current.constructor.__super__.constructor::

    return unless id?

    modules = Mixen.createdMixens[id]

    pos = indexOf modules, module
    nextModule = null
    while pos++ < modules.length - 1
      # Look through the remaining modules for the next one which implements
      # the method we're calling.
      nextModule = modules[pos]
        
      break if nextModule::[method]?

    if nextModule? and nextModule::? and nextModule::[method]?
      return nextModule::[method].apply @, args

# Mixens are namespaces for mixins, you create a Mixen, add a bunch of modules to it, then make your
# classes with those modules.
Mixen.createMixen = (mods...) ->
  class out
    # If the extending class calls `super`, or doesn't have a constructor,
    # this will be called:
    constructor: (args...) ->
      for mod in mods
        mod.apply @, args
      
  # Since a single mixin module can be used multiple times, we need to
  # store the id of this instance on the outputted object, so we can
  # figure out which modules were included with it when it comes
  # time to resolve super calls.
  out::_mixen_id = uniqueId()

  Mixen.createdMixens[out::_mixen_id] = mods

  for module in mods.slice(0).reverse()
    for own method of module::
      continue if method is 'constructor'

      if typeof module::[method] isnt 'function'
        # Non-function attributes just get copied onto the resultant object
        out::[method] = module::[method]
        continue

      do (method, module) ->
        if module::passSuper
          # By default we modify how super works for our own purposes.
          # This will cause problems if you want to use inheritance to
          # define your modules and you want super to mean what it normally
          # does.  The `passSuper` option will cause that clobbering to not
          # occur, and will instead pass a reference to the next mixin to be
          # called as the first argument to each method.
          currentMethod = out::[method] ? identity

          out::[method] = (args...) ->
            module::[method].call @, currentMethod, args...
        else
          out::[method] = (args...) ->
            module::[method].call @, args...

          # Coffeescript expands super calls into ModuleName.__super__.methodName
          #
          # Dynamically composing a bunch of inheriting classes out
          # of the mixins seems like a good idea, but it doesn't work because
          # CoffeeScript rewrites __super__ calls statically based on the
          # class super is in, so they would not respect these classes.
          module.__super__ ?= {}
          module.__super__[method] ?= moduleSuper(module, method)

  out

if typeof define is 'function' and define.amd
  # AMD
  define -> Mixen
else if typeof exports is 'object'
  # Node
  module.exports = Mixen
else
  # Global
  window.Mixen = Mixen
