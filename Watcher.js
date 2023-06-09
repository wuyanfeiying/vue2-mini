class Watcher {
  constructor (vm, key, cb) {
    this.vm = vm;
    // data的key
    this.key = key;
    // 回调函数：更新视图
    // 此回调函数，是在 Compiler 中，模板解析的过程中，取值时，创建Watcher实例时，创建的
    this.cb = cb;

    // 初始化Vue时，先执行Observer进行数据的响应化处理，每个属性在响应化时，会初始化 订阅收集器（Dep）
    // 此处将当前 Watcher的实例 存储到 Dep.target 上面
    Dep.target = this;
    // 此处，进行了属性的取值操作，会触发一次属性的get方法，在observer中，会进行依赖的收集操作，将Dep.target存储到dep.subs中
    this.oldValue = vm[key]
    // 数据销毁
    Dep.target = null
  }

  // 数据发生变化时，更新视图
  // 当数据发生变动时，会触发Observer中监听的属性的set方法，
  // set方法中，会调用 Dep中的notify, 对 订阅收集器（Dep）下面的所有订阅者（Watcher 实例）进行统一调用watcher.update方法
  // 从而触发回调函数，更新视图数据
  update() {
    let newValue = this.vm[this.key]
    if (this.oldValue === newValue) {
      return
    }
    this.cb(newValue)
  }
}