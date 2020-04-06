let id = 0;
import {pushTarget,popTarget} from './dep'
import { observe } from '.';
import { util } from '../util';
class Watcher{//每次产生一个watcher 都要有一个唯一的标识
    /**
     * @param {*} vm  当前组件的实例 
     * @param {*} exprOrFn 用户可能传入的是一个表达式,也有可能传入的是一个函数
     * @param {*} cb  用户传入的回调函数 vm.$watch('msg',cb)
     * @param {*} opts //一些其他参数
     */
    // vm ()=>{this.firName+..} ()=>{} lazy:true
    constructor(vm,exprOrFn,cb=()=>{},opts={}){
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        if(typeof exprOrFn === 'function'){//getter 就是 new Watcher传入的第二个函数
            this.getter = exprOrFn
        }else{
            this.getter = function () {//调用此方法 会将vm上对应的表达式取出来
                return util.getValue(vm,exprOrFn)
            }
        }
        if(opts.user){//标识是用户自己写的watch
            this.user = true;
        }
        this.lazy = opts.lazy;//如果这个值是计算属性
        this.dirty = this.lazy;
        this.cb = cb;
        this.deps = [];
        this.depsId = new Set();
        this.opts = opts;
        this.id = id++;
        this.immediate = opts.immediate
        //创建watcher 现将表达式对应的值取出来 oldValue
        this.value = this.lazy?undefined:this.get(); //默认创建watcher 会调用自身的方法
        if(this.immediate){
            this.cb(this.value);
        }
    }
    get(){//创建watcher 默认执行
        //Dep.target = 用户的watcher
        pushTarget(this);//渲染watcher Dep.target = watcher
        //fullName(){ return this.firstName + this.lastName}
        let value = this.getter.call(this.vm);//让当前传入的函数执行
        popTarget();
        return value
    }
    evaluate(){
        this.value = this.get();
        this.dirty = false;//值求过了 下次渲染不需要再求
    }
    addDep(dep){//同一个watcher 不应该重复记录dep
        let id = dep.id;//msg的dep
        if(!this.depsId.has(id)){
            this.depsId.add(id)
            this.deps.push(dep);//让watcher 记住当前dep
            dep.addSub(this);
        }


    }
    depend(){
        let i = this.deps.length;
        while(i--){
            this.deps[i].depend();
        }
    }
    update(){
        if(this.lazy){//如果是计算属性  
            this.dirty = true;//计算属性依赖的值变化了 稍后取值重新计算
        }else{
            queueWatcher(this);
        } 
    }
    run(){
        let value = this.get();//新值
        if(this.value !== value){
            this.cb(value,this.value);
        }
    }
}
let has = {};
let queue = [];
function flushQueue(){
    //等待当前这一轮全部更新后 再让watcher依次执行
    queue.forEach((watcher)=>{
        watcher.run()
    })
    has = {};
    queue = [];
}
function queueWatcher(watcher){//对重复的watcher进行过滤操作
    let id = watcher.id;
    if(has[id]==null){
        has[id] = true;
        queue.push(watcher)//相同watcher只会存一个到queue中
    }
    //延迟清空队列
    nextTick(flushQueue);
    
}
//渲染使用他 计算属性也要用它 vm.watch也用他

let callbacks = [];
function flushCallbacks(){
    callbacks.forEach(cb=>cb());
}
function nextTick(cb){//cb就是flushQueue
    callbacks.push(cb);
    //要异步刷新这个callbacks ,获取一个异步方法
    let timeFunc = ()=>{
        flushCallbacks();
    }
    if(Promise){//优先微任务 =>宏任务
        Promise.resolve().then(timeFunc)
    }
    if(MutationObserver){
        let observe = new MutationObserver(timeFunc);
        let textNode = document.createTextNode(1);
        observe.observe(textNode,{characterData:true});
        textNode.textContent = 2;
        return
    }
    if(setImmediate){
        return setImmediate(timeFunc,0);
    }
    if(setTimeout){
        return setTimeout(timeFunc,0);
    }
}
//等待页面更新再去获取dom元素
export default Watcher