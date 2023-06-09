class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }

  // 编译模板：处理 元素节点 和 文本节点
  compile(el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 元素节点
      if (this.isElementNode(node)) {
        this.compileElement(node)
      } else if (this.isTextNode(node)) {
        // 文本节点
        this.compileText(node)
      }

      // 判断是否有子节点
      if (node.childNodes && node.childNodes.length > 0) {
        // 对子节点进行递归调用
        this.compile(node)
      }
    })
  }

  // 元素节点 解析
  compileElement(node) {
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name

      // 判断是否为指令 v-
      if (this.isDirective(attrName)) {
        // v-text ---> text
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }

      // 判断是否为事件指令 v-on:事件名
      if (this.isEvent(attrName)) {
        let key = attr.value // 解析后是：changeCount

        // 注意区分 substr 和 substring 用法
        // attrName 此时已经在上面经过处理了（attrName.substr(2)）
        // 'v-on:click="changeName"'.substr(2) --> 'on:click'
        // 'on:click'.substring(3) --> 'click'

        const dir = attrName.substring(3) // 解析后是：click

        this.eventHandler(node, this.vm, key, dir)
      }
    })
  }

  // 更新获取到的值
  update(node, key, attrName) {
    let updateFn = this[attrName + 'Updater']
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }

  // v-text 指令
  textUpdater(node, value, key) {
    node.textContent = value
    // 初始化 订阅者, 传入更新函数
    new Watcher(this.vm, key, newValue => {
      node.textContent = newValue
    })
  }

  // v-model 指令
  modelUpdater(node, value, key) {
    node.value = value
    new Watcher(this.vm, key, newValue => {
      node.value = newValue
    })

    // 双向数据绑定
    node.addEventListener('input', ()=> {
      this.vm[key] = node.value
    })
  }

  // v-html 指令
  htmlUpdater(node, value, key) {
    node.innerHTML = value
    new Watcher(this.vm, key, newValue => {
      node.innerHTML = newValue
    })
  }

  // 添加事件
  eventHandler(node, vm, exp, dir) {
    const fn = vm.$options.methods && vm.$options.methods[exp]
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm))
    }
  }

  // 文本节点 解析
  compileText(node) {
    // 正则匹配 差值表达式
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent

    if (reg.test(value)) {
      let key = reg.exec(value)[1]
      node.textContent = value.replace(reg, this.vm[key])

      // 创建 订阅者（Watcher）, 当数据改变时 更新视图
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }

  // 判断元素属性是否是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  // 判断是否为 事件指令 v-on:事件名
  isEvent(attrName) {
    return attrName.indexOf("on:") === 0
  }

  // 判断节点是否为 元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }

  // 判断节点是否为 文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }

}