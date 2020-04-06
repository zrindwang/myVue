let id = 0;
class Dep{
    constructor(){
        this.id = id++;
        this.subs = [];
    }
    addSub(watcher){ //订阅 将addSub传入内容保存至数组
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher=>watcher.update());
    }
    depend(){
        if(Dep.target){//防止直接调用depend方法
            //Dep.target 是一个渲染watcher
            Dep.target.addDep(this)//希望watcher中互相记忆
        }
    }
}
//用来保存当前的watcher
let stack = [];
export function pushTarget(watcher){
    Dep.target = watcher;
    stack.push(watcher);
}
export function popTarget(){
    stack.pop();
    Dep.target = stack[stack.length-1];
}
export default Dep;