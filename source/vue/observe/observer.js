import { observe } from "./index";
import { arrayMethods, observerArray ,dependArray} from "./array";
import Dep from "./dep";
export function defineReactive(data,key,value){//定义响应式的数据便哈
    //vue 不支持ie8 及 ie8 以下的浏览器
    // 如果value 依旧是一个对象 需要深度观察
    let childOb = observe(value);
    let dep = new Dep();//dep 收集依赖
    Object.defineProperty(data,key,{
        get(){
            if(Dep.target){//这次有值用的是渲染watcher
                //我们希望存入的watcher不能重复,如果重复会造成更新时多次渲染
                dep.depend();//他想让dep 中可以存 watcher ,我还希望这个watcher中也存放dep,实现多对多关系
                if(childOb){//**数组依赖收集 [[1],2,3]  */
                    childOb.dep.depend();//数组也收集了当前渲染watcher
                    dependArray(value);
                }
            }
            // console.log('获取数据')
            return value
        },
        set(newVal){      
            if(newVal === value) return;
            observe(newVal);//如果新数据为对象也应该进行观测
            console.log('设置数据')
            value = newVal
            dep.notify();
        }
    })
}
class Observer {
    constructor(data){//data 是刚才定义的vm._data
        this.dep = new Dep(); //此dep 专门为数组而设定
        //每一个对象 包含数组 都有一个__ob__属性 返回的是当前的observer实例
        Object.defineProperty(data,'__ob__',{
            get:()=>this
        })
        if(Array.isArray(data)){
            //只能拦截数组方法,数组里的每一项还需要去观测一下
            data.__proto__ = arrayMethods //让数组 通过链来查找我们自己编写的原型
            // 当调用
            observerArray(data);//观测数据中的每一项
        }else{this.walk(data);}  
    }
    walk(data){
        let keys = Object.keys(data);
        for(let i = 0;i<keys.length;i++){
            let key = keys[i];
            let value = data[key];
            defineReactive(data,key,value);
        }
    }
}

export default Observer