const defaultREG = /\{\{((?:.|\r?\n)+?)\}\}/g
export const util = {
    getValue(vm,expr){//school.name
        let keys = expr.split('.');
        return keys.reduce((memo,current)=>{
            memo = memo[current];//memo = vm.school
            return memo
        },vm)
    },
    compilerText(node,vm){//编译文本 替换{{}}  
    if(!node.expr){
        node.expr = node.textContent;//给节点增加一个自定义属性 为了方便后续更新操作
    }
    node.textContent = node.expr.replace(defaultREG,function(...args){
        return JSON.stringify(util.getValue(vm,args[1]))
    })
    }
}
export function compiler(node,vm){//node 就是文档碎片
    let childNodes = node.childNodes;//只有第一层 只有儿子 没有孙子
    //将类数组转化成数组
    [...childNodes].forEach(child=>{//一种元素 一种是文本
        if(child.nodeType == 1){//1 元素 3 表示文本
            compiler(child,vm);//编译当前元素的孩子节点
        }else if(child.nodeType == 3){
            util.compilerText(child,vm)
        }
    })
}