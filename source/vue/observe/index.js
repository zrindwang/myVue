import Observer from './observer'
import Watcher from './watcher';
import Dep from './dep';
export function initState(vm){
    //做不同的初始化工作
    let opts = vm.$options
    if(opts.data){
        initData(vm);
    }
    if(opts.computed){
        initComputed(vm,opts.computed);
    }
    if(opts.watch){
        initWatch(vm);
    }   
}
export function observe(data){
    if(typeof data !== 'object'|| data == null){
        return //不是对象 或者是null 直接退出
    }
    if(data.__ob__){//已经被检测过了
        return data.__ob__
    }
    return new Observer(data);
}
function proxy(vm,source,key){ // 代理数据 v.m.msg = vm._data.msg
    //vm.msg 等价于 vm._data.msg
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },
        set(newVal){
            vm[source][key] = newVal
        }
    })
}
function initData(vm){//将用户传入的数据 通过object.defineProperty 重新定义
    let data =vm.$options.data;//用户传入的data
    data = vm._data = typeof data === 'function'?data.call(vm):data||{};
    for(let key in data){
        proxy(vm,'_data',key)
    }
    
    observe(vm._data)


}
function createComputedGetter(vm,key) {
    let watcher = vm._watchersComputed[key]//这个watcher就是我们定义的计算属性watcher
    return function() {//用户取值会执行此方法
        if(watcher){
            if(watcher.dirty){//
                watcher.evaluate();//如果页面取值,而且dirty是true 就会调用watcher的get方法
            }
            if(Dep.target){//watcher 就是计算属性watcher dep = [firstName.dep,
            //  lastName.dep]
                watcher.depend();
            }
            return watcher.value;
        }
    }
    
}
// 计算属性 特点 默认不执行,等用户取值的时候执行,会缓存取值的结果
//如果依赖的值变化了 会更新dirty属性,再次取值时,可以重新求新值

//watch 方法 不能用在模板里 监控的逻辑都放在watch中即可
//watcher 三类 渲染watcher 用户watcher 计算watcher
function initComputed(vm,computed){
    let watchers = vm._watchersComputed = Object.create(null);//创建存储计算属性的watcher对象
    console.log(computed)
    for(let key in computed){//{fullName:()=>this.firstName+this.lastName}
    let userDef = computed[key];
    //new Watcher 此时什么都不会做 配置了 lazy dirty
        watchers[key] = new Watcher(vm,userDef,()=>{},{lazy:true});//计算属性 watcher 默认刚开始这个方法不会执行
        //vm.fullName
        Object.defineProperty(vm,key,{
            get:createComputedGetter(vm,key)
        })//将这个属性 定义到vm上

    }
}

function createWatcher(vm,key,handler,opts){
    //内部最终使用$watch方法
    return vm.$watch(key,handler,opts);
}
function initWatch(vm){
    let watch = vm.$options.watch;//用户传入的watch属性
    for(let key in watch){//msg(){}
        let userDef = watch[key];
        let handler = userDef;
        if(userDef.handler){
            handler = userDef.handler;
        }
        createWatcher(vm,key,handler,{immediate:userDef.immediate});
    }
}