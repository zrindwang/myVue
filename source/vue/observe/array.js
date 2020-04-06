//主要做的事 就是拦截用户调用的 push shift unshift pop reverse sort splice
//以上方法会改变原数组

import { observe } from ".";

//先获取老的数组方法 只改写这7个方法

let oldArrayProtoMethods = Array.prototype;
//拷贝的一个新的对象 可以茶渣老地点方法
export let arrayMethods = Object.create(oldArrayProtoMethods);

let methods = [
    'push',
    'pop',
    'unshift',
    'shift',
    'reverse',
    'sort',
    'splice'
]
export function observerArray(inserted){
    for(let i=0;i<inserted.length;i++){
        observe(inserted[i])
    }
}
export function dependArray(value){//递归收集数组中的依赖
    for (let i = 0; i < value.length; i++) {
        const currentItem = value[i];//有肯也是一个数组[[[]]]
        currentItem.__ob__&&currentItem.__ob__.dep.depend();
        if(Array.isArray(currentItem)){
            dependArray(currentItem)//不停收集  
        }        
    }
}
methods.forEach(method=>{
    arrayMethods[method] = function(...args){
        let r = oldArrayProtoMethods[method].apply(this,args);
        //todo
        let inserted;
        switch (method){
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);//获取splice 新增的内容
            default:
                break;
        }
        console.log('数组方法更新')
        if(inserted) observerArray(inserted)
        this.__ob__.dep.notify();
        return r;
    }
})