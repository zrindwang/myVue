import Vue from 'vue';//默认先查找source 目录下的vue文件夹

let vm = new Vue({
    el:"#app",//表示要渲染的元素是app
    data(){
        return {
            msg:'hello',
            school:{name:'zf',age:10},
            arr:[[1],2,3],
            firstName:'wang',
            lastName:'zheng',
        }
    },
    computed:{
        fullName(){
            return this.firstName + this.lastName
        }
    },
    watch:{
        // msg:{
        //     handler(newValue,oldValue){
        //         console.log(newValue,oldValue);
        //     },
        //     immediate:true
        // }
    }
})
//如果新增属性是对象 也需要对其进行代理
// console.log(vm.arr[0]['a'] = 100)
// 什么样的组数会被观测  [0,1,2] 不能直接改变索引 不能被检测到
//[1,2,3].length-- 因为数组的长度变化 我们没有监控

//[{a:1}] //内部会对数组里多点对象进行监控

//[].push splice/shift unshift 这些方法会被监控 Vue.$set调用的就是数组的splice
setTimeout(() => {
    // vm.msg = 'world' // dep = {watcher}
    // vm.arr[0].push(100) ;//数组的依赖收集
    // console.log(vm)

    //--------watch
    // vm.msg = 'world'


    //更改计算属性

    vm.firstName = 'zheng';// firstName = [watcher 计算属性watcher,渲染watcher]
}, 1000);