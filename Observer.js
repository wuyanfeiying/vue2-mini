class Observer {
  constructor (data) {
    this.walk(data)
  }

  walk (data) {
    // 判断data是否是对象
    if (!data || typeof data !== 'object') {
      return
    }

    // 遍历 data 对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  // 对每个属性进行响应化处理
  defineReactive(obj, key, val) {
    let that = this

    // 初始化 订阅收集器：负责收集订阅者（Watcher）, 并发送通知
    let dep = new Dep()

    // val 如果也是对象，需要继续将内部属性响应化
    that.walk(val)

    Object.defineProperty(obj, key, {
      enumerable: true, // 是否可枚举，比如 是否可以循环
      configurable: true, // 是否可配置，比如 是否可以删除属性
      // 访问属性时
      get(){
        // 收集依赖（收集订阅器 Watcher 的实例）
        // 注意：这里 Dep.target 是 订阅器Watcher的实例，
        // 在初始化Watcher的时候，被缓存到Dep的target上面
        // 怎么触发的呢？
        // 在Watcher初始化的时候(这个发生在模版解析器中），访问了属性，触发这个属性的getter，就到这里来了
        // 触发完属性之后，又会被销毁掉（Dep.target = null）
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      // 属性被赋值时
      set(newValue) {
        if (newValue === val) {
          return
        }
        val = newValue
        that.walk(newValue)
        // 发送通知
        // 告诉当前Dep(订阅收集器)关联的所有 订阅者（Watcher 实例），更新数据
        dep.notify()
      }
    })
  }
}