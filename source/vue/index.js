import {initState} from './observe'
import Watcher from './observe/watcher';
import {util,compiler} from './util';
import {render,patch,h} from './vdom'
function Vue(options){ // vue 中原始用户传入的数据
    this._init(options);//初始化Vue 并且将用户选项传入
}
Vue.prototype._init = function(options){
    //vue初始化  this.$options 表示的是vue中的参数
    let vm = this;
    vm.$options = options;
   
    //MVVM 原理 需要数据重新初始化
    initState(vm); // data computed watch
    // 初始化工作 vue1.0  =>
    if(vm.$options.el){
        vm.$mount();
    }
}
//渲染页面 将组建进行挂载
function query(el){
    if(typeof el === 'string'){
        return document.querySelector(el);
    }
    return el;
}
//?: 匹配不捕获
//+至少一个
//? 尽可能少匹配
//源码里的 模板编译 也是基于正则的

Vue.prototype._update = function(vnode){
    //用户传入的数据 去更新视图
    console.log('数据更新')
    let vm = this;
    let el = vm.$el;
    let preVnode = vm.preVnode;// 第一次肯定没有
    if(!preVnode){
        vm.preVnode = vnode;//把上一次节点保存起来
        render(vnode,el);
    }else{
        vm.$el = patch(preVnode,vnode)
    }
    //----------以下逻辑 讲完虚拟dom 会用虚拟dom来写
    //要循环这个元素 将里面的内容 换成我们的数据
    // let node = document.createDocumentFragment();
    // let firstChild;
    // while(firstChild = el.firstChild){//每次拿到第一个元素 就将这个元素放入到文档碎片中
    //     node.appendChild(firstChild)//appendChild 具有移动的功能
    // }
    // //todo 对文本进行替换
    // compiler(node,vm);
    // el.appendChild(node)
    //匹配{{}}的方式来进行替换

    //依赖收集 属性变化了页面要重新渲染 watcher 和 dep
}
Vue.prototype._render = function () {
    let vm = this;
    let render = vm.$options.render;//获取用户别写render方法
    let vnode = render.call(vm,h)//h => 返回vnode
    return vnode;
}
Vue.prototype.$mount = function(){
    let vm = this;
    let el = vm.$options.el;//#app
    el = vm.$el = query(el);//获取当前挂载的节点
    //渲染时通过 watcher来渲染的
    //渲染watcher 用于渲染的watcher
    //vue2.0 组建级别的更新 new Vue 产生一个组件

    let updateComponent = ()=>{ //更新组件
        vm._update(vm._render());// 更新组件
    }
    new Watcher(vm,updateComponent)//渲染watcher,默认调用updateComponent犯法

}
Vue.prototype.$watch = function (expr,handler,opts) {
    //创建一个watcher
    let vm = this;
    new Watcher(vm,expr,handler,{user:true,...opts});//用户自己定义的watch  
}
export default Vue
