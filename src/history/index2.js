import {h,render,patch} from '../../source/vue/vdom'
//节约性能  先把真实节点用对象表示出来 ,再通过对象渲染到页面上
// 前端操作dom的时候 排序  -> 正序 反序列 删除

//虚拟dom 只是一个对象 
//vue template render函数 s

//初始化 将虚拟节点 渲染到页面
//<div id='container><span style='color:red'>hello </span>wz<div>

let oldVnode = h('div',{id:'container'},
h('li',{style:{background:'red'},key:'a'},'a'),
h('li',{style:{background:'yellow'},key:'b'},'b'),
h('li',{style:{background:'pink'},key:'c'},'c'),
h('li',{style:{background:'blue'},key:'d'},'d'),
);
let newVnode = h('div',{id:'aa'},
h('li',{style:{background:'blue'},key:'e'},'e'),
h('li',{style:{background:'red'},key:'a'},'a'),
h('li',{style:{background:'green'},key:'f'},'f'),
h('li',{style:{background:'pink'},key:'c'},'c'),
h('li',{style:{background:'black'},key:'n'},'n'),
)
//patchVnode 用新的虚拟节点 和老的虚拟节点 做对比 更新真实dom元素
let container = document.getElementById('app')
render(oldVnode,container)


setTimeout(() => {
    patch(oldVnode,newVnode);
}, 1000);
// let obj = {
//     tag:'div',
//     props:{},
//     children:[{
//         tag:undefined,
//         props:undefined,
//         children:undefined,
//         text:'hello'
//     }]
// }
// new Vue({
//     render(h){
//         return h('div',{},hello)
//     }
// })

