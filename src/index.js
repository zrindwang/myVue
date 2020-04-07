import Vue from 'vue';

let vm = new Vue({
    el:'#app',
    data(){
        return {msg:'hello wz'}
    },
    render(h){//内部会调用render方法 将render方法中的this变成当前实例
        return h('p',{id:'a'},this.msg)
    }
})

setTimeout(() => {
    vm.msg = 'hello world'
}, 1000);