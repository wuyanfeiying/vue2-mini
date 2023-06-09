class Vue {
  constructor (options){
    this.$options = options || {}
    this.$data = options.data
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

    debugger

    // 代理data到vm上，例如：vm.msg = vm.$data.msg
    this._proxyData(this.$data)

    // 初始化 监听器：对data的属性进行响应化处理
    new Observer(this.$data)

    // 初始化 模板编译器：解析指令和差值表达式
    new Compiler(this)
  }

  // 代理data到vm上
  _proxyData (data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this,key,{
        enumberable: true, // 是否可枚举，比如能不能遍历这个属性
        configurable: true, // 是否可配置，比如能不能删除这个属性
        // 访问属性时
        get(){
          return data[key]
        },

        set(newValue) {
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}