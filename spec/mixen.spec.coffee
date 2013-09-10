describe 'Mixen', ->
  it 'should be defined', ->
    expect(Mixen).toBeDefined()

  it 'should be possible to compose a class', ->
    class MyModule
      x: -> 3

    X = Mixen(MyModule)

    inst = new X

    expect(inst.x()).toBe(3)

  it 'should be possible to compose multiple classes together', ->
    class Module1
      x: -> (super ? 0) + 5

    class Module2
      x: -> (super ? 0) + 2

    X = Mixen(Module1, Module2)

    inst = new X

    expect(inst.x()).toBe(7)

  it 'should be possible to pass through a method from a mixin', ->
    class MyModule
      x: -> 3

    class X extends Mixen(MyModule)

    inst = new X

    expect(inst.x()).toBe(3)

  it 'should pass references to the previous function', ->
    class MyModule
      x: (arg) ->
        (super(arg) ? 0) + 2

    class X extends Mixen(MyModule)
      x: (arg) -> super(arg) + 8

    inst = new X

    expect(inst.x(0)).toBe(10)

  it 'should end up calling the parent classes methods', ->
    class Parent
      x: (a) -> a + 2

    class X extends Mixen(Parent)

    inst = new X

    expect(inst.x(2)).toBe(4)

  it 'should pass references to the chain of previous functions in the order defined', ->
    class Module1
      x: (arg) ->
        (super ? 5) + arg + '1'

    class Module2
      x: (arg) ->
        (super ? 4) + arg + '2'

    class X extends Mixen(Module2, Module1)
      x: (arg) -> super + arg + '0'

    inst = new X

    expect(inst.x('-')).toBe('5-1-2-0')

  it 'should play nice with backbone extend', ->
    X = Backbone.Model.extend({
      x: -> 3
      y: -> 12
    })

    Y = X.extend({
      x: -> 6
    })

    Z = Mixen(Y)

    expect((new Z).x()).toBe(6)
    expect((new Z).y()).toBe(12)
    expect((new Z).idAttribute).toBe('id')
    expect((new Z).cid).toBe('c4')

  it 'should call all constructors in the right order', ->
    order = ''

    class Module1
      constructor: ->
        expect(@ instanceof Module).toBe(true)

        order += '1'

    class Module2

    class Module3
      constructor: ->
        expect(@ instanceof Module).toBe(true)

        order += '3'

    class Module extends Mixen(Module1, Module2, Module3)
      constructor: ->
        super

        expect(@ instanceof Module).toBe(true)

        order += '4'

    inst = new Module

    expect(order).toBe('134')

  it 'should not call mixen constructors if super is not called', ->
    class Module1
      constructor: ->
        expect(true).toBe(false)

    class Module extends Mixen(Module1)
      constructor: ->
        expect(true).toBe(true)

    inst = new Module

  it 'should call mixen constructors if no constructor is defined', ->
    called = false

    class Module1
      constructor: ->
        called = true

    class Module extends Mixen(Module1)

    inst = new Module

    expect(called).toBe(true)

  it 'should pass through non-function properties', ->
    class Module1
      property: 4

    class X extends Mixen(Module1)

    inst = new X

    expect(inst.property).toBe(4)

  it 'should handle multiple mixins', ->
    class Module1
      x: -> 3

    class Module2
      y: -> 5

    class X extends Mixen(Module1, Module2)

    inst = new X

    expect(inst.x).toBeDefined()
    expect(inst.y).toBeDefined()
    expect(inst.x()).toBe(3)
    expect(inst.y()).toBe(5)

  it 'should be able to handle multiple mixens existing at once', ->
    class Module1
      x: -> '1' + (super ? '')

    class Module2
      x: -> '2' + (super ? '')

    class Module3
      x: -> '3' + (super ? '')

    class Module4

    class Module5
      x: -> '5' + (super ? '')

    class Module6
      x: -> '6' + (super ? '')

    class A extends Mixen(Module4, Module3, Module1)

    class B extends Mixen(Module5, Module3, Module2)

    class C extends Mixen(Module6, Module3, Module1)

    class D extends Mixen(Module6, Module3, Module1)

    class E extends Mixen(Module6, Module4, Module5)
    
    class F extends Mixen(Module1, Module6, Module5)

    a = new A
    b = new B
    d = new D
    c = new C
    e2 = new E
    f = new F
    e1 = new E

    expect(a.x()).toBe('31')
    expect(b.x()).toBe('532')
    expect(e1.x()).toBe('65')
    expect(c.x()).toBe('631')
    expect(d.x()).toBe('631')
    expect(e2.x()).toBe('65')
    expect(f.x()).toBe('165')

  it 'should be able to mixin mixens', ->
    order = ''

    class Module1
      constructor: ->
        order += '-1-'

    class Module2
      constructor: ->
        order += '-2-'

    class Module12 extends Mixen(Module1, Module2)
      constructor: ->
        super
        order += '-12-'

    class Module3
      constructor: ->
        order += '-3-'

    class Module312 extends Mixen(Module3, Module12)
      constructor: ->
        super
        order += '-312-'

    inst = new Module312

    expect(order).toBe('-3--1--2--12--312-')
