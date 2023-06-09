class Dep {
  constructor() {
    // 存储所有订阅者（Watcher实例）
    this.subs = []
  }

  // 添加订阅者
  // 此方法，会在 Observer(数据劫持) 中属性对应的 get方法中进行调用
  addSub(watcher) {
    if (watcher && watcher.update) {
      this.subs.push(watcher)
    }
  }

  // 发送通知
  // Dep下的所有订阅者都会触发更新函数
  // 此方法，会在 Observer(数据劫持) 中属性对应的 set方法中 进行调用
  notify() {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}