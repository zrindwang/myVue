//这个文件除了第一次初始化渲染之外
// 还要做比对操作

export function render(vnode, container) {//让虚拟节点
    let el = createElm(vnode);
    container.appendChild(el);
}
//创建真实节点
function createElm(vnode) {
    let { tag, children, key, props, text } = vnode;
    if (typeof tag === 'string') {
        //标签 一个虚拟节点 对应它的真实节点
        vnode.el = document.createElement(tag);
        updateProperties(vnode);
        children.forEach(child => {//child 虚拟节点
            return render(child, vnode.el)//递归渲染当前孩子列表
        });
    } else {
        //文本
        vnode.el = document.createTextNode(text);
    }
    //递归创建
    return vnode.el
}
//更新属性也好调用此方法 oldProps = {a:1,style:{fontSize:19px}}
function updateProperties(vnode, oldProps = {}) {
    let newProps = vnode.props || {};//当前老节点中的属性
    let el = vnode.el;//当前的真实节点
    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};
    //如果下次更新 我应该用新的属性 来更新老的节点
    //如果老的中有属性 新的中没有
    for (let key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = ''
        }
    }
    for (let key in oldProps) {
        if (!newProps[key]) {
            delete el[key];// 如果新的中没有这个属性了,那就直接删除这个属性
        }

    }
    //我要先考虑一下 以前有没有
    for (let key in newProps) {
        if (key === 'style') {
            for (let styleName in newProps.style) {
                //el.style.color = 'red'
                el.style[styleName] = newProps.style[styleName]

            }
        } else if (key === 'class') {
            el.className = newProps.class
        } else {
            el[key] = newProps[key]
        }
    }
}
export function patch(oldVnode, newVnode) {
    // 1)先比对 标签不一样
    if (oldVnode.tag !== newVnode.tag) {//以前div 现在P
        oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el)
    }
    // 2) 比较文本了 标签一样 肯定都是undefined
    if (!oldVnode.tag) {
        if (oldVnode.text !== newVnode.text) {//如果内容不一致 直接根据当前新的元素中的内容 替换掉文本节点
            oldVnode.el.textContent = newVnode.text;
        }
    }
    //标签一样 可能属性不一样了
    let el = newVnode.el = oldVnode.el //标签一样复用
    updateProperties(newVnode, oldVnode.props)//做属性对比

    //必须要有一个根节点
    //比较孩子
    let oldChildren = oldVnode.children || [];
    let newChildren = newVnode.children || [];
    //老的有孩子 新的有孩子  updateChildren
    if (oldChildren.length > 0 && newChildren.length > 0) {
        updateChildren(el, oldChildren, newChildren)//递归比较
    } else if (oldChildren.length > 0) {//老的有孩子 新的没孩子
        el.innerHTML = ''
    } else if (newChildren.length > 0) {
        for (let i = 0; i < newChildren.length; i++) {
            let child = newChildren[i];
            el.appendChild(createElm(child));
        }
    }
    return el;
}
function isSameNode(oldVnode, newVnode) {
    return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}
function updateChildren(parent, oldChildren, newChildren) {
    //vue 增加了很多优化策略 因为在浏览器中操作dom
    //涉及正序和倒序
    let oldStartIndex = 0;
    let oldStartVnode = oldChildren[0];
    let oldEndIndex = oldChildren.length - 1;
    let oldEndVnode = oldChildren[oldEndIndex];

    let newStartIndex = 0;
    let newStartVnode = newChildren[0];
    let newEndIndex = newChildren.length - 1;
    let newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
        let map = {};
        children.forEach((item, index) => {
            map[item.key] = index
        })
        return map;//{a:0,b:1,c:2,d:3}
    }
    let map = makeIndexByKey(oldChildren);
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        //向后插入元素
        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex];
        }
        if (isSameNode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode);//用新的属性替换老的属性
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
            //向前插入
        } else if (isSameNode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
            //倒序功能 abcd dcba
        } else if (isSameNode(oldStartVnode, newEndVnode)) {
            patch(oldStartVnode, newEndVnode);
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
            //正序 abcd dabc
        } else if (isSameNode(oldEndVnode, newStartVnode)) {//老的尾巴和新的头去比 将老的尾巴移动到老的头前面
            patch(oldEndVnode, newStartVnode);
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex]
        } else {
            // 两个列表 乱序 不复用
            // 先拿新节点的第一项 去老节点中匹配,如果匹配不到直接将这个节点插入到
            // 老节点开头的前面,如果能查找到则直接移动老节点
            // 老节点中剩余的属性 直接删除
            let moveIndex = map[newStartVnode.key]
            if (moveIndex == undefined) {
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
            } else {
                let moveVnode = oldChildren[moveIndex];
                oldChildren[moveIndex] = undefined;
                parent.insertBefore(moveVnode.el, oldStartVnode.el);
                patch(moveVnode, newStartVnode);
            }
            //要将新节点的指针向后移
            newStartVnode = newChildren[++newStartIndex];
        }
        //倒序 和正序
    }
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            //要插入的元素
            let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
            parent.insertBefore(createElm(newChildren[i]), ele);
            //可能往前面插入 也有可能往后面插入
            // parent.appendChild(createElm(newChildren[i]))
            //insertBefore(插入的的元素,null) = appendChild
        }
    }
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let child = oldChildren[i];
            if (child !== undefined) {
                parent.removeChild(child.el);
            }
        }
    }

    //不要使用索引作为key 可能会导致创建当前元素的所有子元素
}