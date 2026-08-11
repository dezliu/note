# Vue中的动画

- 笔记本：06.Vue中的动画
- 创建时间：2019-12-17 06:27:08 UTC
- 更新时间：2019-12-17 06:27:13 UTC
- 印象笔记 GUID：21f3f832-2526-4e85-a5e7-4185944dcd87

## [Vue中的动画](https://cn.vuejs.org/v2/guide/transitions.html)

为什么要有动画：动画能够提高用户的体验，帮助用户更好的理解页面中的功能；

### 使用过渡类名

1. HTML结构：

```
<div >
    <input type="button" value="动起来" @click="myAnimate">
    <!-- 使用 transition 将需要过渡的元素包裹起来 -->
    <transition name="fade">
      <div v-show="isshow">动画哦</div>
    </transition>
  </div>

```

1. VM 实例：

```
// 创建 Vue 实例，得到 ViewModel
var vm = new Vue({
  el: '#app',
  data: {
    isshow: false
  },
  methods: {
    myAnimate() {
      this.isshow = !this.isshow;
    }
  }
});

```

1. 定义两组类样式：

```
/* 定义进入和离开时候的过渡状态 */
    .fade-enter-active,
    .fade-leave-active {
      transition: all 0.2s ease;
      position: absolute;
    }

    /* 定义进入过渡的开始状态 和 离开过渡的结束状态 */
    .fade-enter,
    .fade-leave-to {
      opacity: 0;
      transform: translateX(100px);
    }

```

### [使用第三方 CSS 动画库](https://cn.vuejs.org/v2/guide/transitions.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E8%BF%87%E6%B8%A1%E7%B1%BB%E5%90%8D)

1. 导入动画类库：

```
<link rel="stylesheet" type="text/css"  >

```

1. 定义 transition 及属性：

```
<transition
	enter-active-leave-active-:duration="{ enter: 500, leave: 800 }">
  	<div v-show="isshow">动画哦</div>
</transition>

```

### 使用动画钩子函数

1. 定义 transition 组件以及三个钩子函数：

```
<div >
    <input type="button" value="切换动画" @click="isshow = !isshow">
    <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter">
      <div v-if="isshow" >OK</div>
    </transition>
  </div>

```

1. 定义三个 methods 钩子方法：

```
methods: {
        beforeEnter(el) { // 动画进入之前的回调
          el.style.transform = 'translateX(500px)';
        },
        enter(el, done) { // 动画进入完成时候的回调
          el.offsetWidth;
          el.style.transform = 'translateX(0px)';
          done();
        },
        afterEnter(el) { // 动画进入完成之后的回调
          this.isshow = !this.isshow;
        }
      }

```

1. 定义动画过渡时长和样式：

```
.show{
      transition: all 0.4s ease;
    }

```

### [v-for 的列表过渡](https://cn.vuejs.org/v2/guide/transitions.html#%E5%88%97%E8%A1%A8%E7%9A%84%E8%BF%9B%E5%85%A5%E5%92%8C%E7%A6%BB%E5%BC%80%E8%BF%87%E6%B8%A1)

1. 定义过渡样式：

```
<style>
    .list-enter,
    .list-leave-to {
      opacity: 0;
      transform: translateY(10px);
    }

    .list-enter-active,
    .list-leave-active {
      transition: all 0.3s ease;
    }
</style>

```

1. 定义DOM结构，其中，需要使用 transition-group 组件把v-for循环的列表包裹起来：

```
  <div >
    <input type="text" v-model="txt" @keyup.enter="add">

    <transition-group tag="ul" name="list">
      <li v-for="(item, i) in list" :key="i">{{item}}</li>
    </transition-group>
  </div>

```

1. 定义 VM中的结构：

```
    // 创建 Vue 实例，得到 ViewModel
    var vm = new Vue({
      el: '#app',
      data: {
        txt: '',
        list: [1, 2, 3, 4]
      },
      methods: {
        add() {
          this.list.push(this.txt);
          this.txt = '';
        }
      }
    });

```

### 列表的排序过渡

`<transition-group>` 组件还有一个特殊之处。不仅可以进入和离开动画，**还可以改变定位**。要使用这个新功能只需了解新增的 `v-move` 特性，**它会在元素的改变定位的过程中应用**。

- `v-move` 和 `v-leave-active` 结合使用，能够让列表的过渡更加平缓柔和：

```
.v-move{
  transition: all 0.8s ease;
}
.v-leave-active{
  position: absolute;
}

```

%23%23%20%5BVue%E4%B8%AD%E7%9A%84%E5%8A%A8%E7%94%BB%5D(https%3A%2F%2Fcn.vuejs.org%2Fv2%2Fguide%2Ftransitions.html)%0A%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E6%9C%89%E5%8A%A8%E7%94%BB%EF%BC%9A%E5%8A%A8%E7%94%BB%E8%83%BD%E5%A4%9F%E6%8F%90%E9%AB%98%E7%94%A8%E6%88%B7%E7%9A%84%E4%BD%93%E9%AA%8C%EF%BC%8C%E5%B8%AE%E5%8A%A9%E7%94%A8%E6%88%B7%E6%9B%B4%E5%A5%BD%E7%9A%84%E7%90%86%E8%A7%A3%E9%A1%B5%E9%9D%A2%E4%B8%AD%E7%9A%84%E5%8A%9F%E8%83%BD%EF%BC%9B%0A%0A%23%23%23%20%E4%BD%BF%E7%94%A8%E8%BF%87%E6%B8%A1%E7%B1%BB%E5%90%8D%0A1.%20HTML%E7%BB%93%E6%9E%84%EF%BC%9A%0A%60%60%60%0A%3Cdiv%20id%3D%22app%22%3E%0A%20%20%20%20%3Cinput%20type%3D%22button%22%20value%3D%22%E5%8A%A8%E8%B5%B7%E6%9D%A5%22%20%40click%3D%22myAnimate%22%3E%0A%20%20%20%20%3C!--%20%E4%BD%BF%E7%94%A8%20transition%20%E5%B0%86%E9%9C%80%E8%A6%81%E8%BF%87%E6%B8%A1%E7%9A%84%E5%85%83%E7%B4%A0%E5%8C%85%E8%A3%B9%E8%B5%B7%E6%9D%A5%20--%3E%0A%20%20%20%20%3Ctransition%20name%3D%22fade%22%3E%0A%20%20%20%20%20%20%3Cdiv%20v-show%3D%22isshow%22%3E%E5%8A%A8%E7%94%BB%E5%93%A6%3C%2Fdiv%3E%0A%20%20%20%20%3C%2Ftransition%3E%0A%20%20%3C%2Fdiv%3E%0A%60%60%60%0A2.%20VM%20%E5%AE%9E%E4%BE%8B%EF%BC%9A%0A%60%60%60%0A%2F%2F%20%E5%88%9B%E5%BB%BA%20Vue%20%E5%AE%9E%E4%BE%8B%EF%BC%8C%E5%BE%97%E5%88%B0%20ViewModel%0Avar%20vm%20%3D%20new%20Vue(%7B%0A%20%20el%3A%20'%23app'%2C%0A%20%20data%3A%20%7B%0A%20%20%20%20isshow%3A%20false%0A%20%20%7D%2C%0A%20%20methods%3A%20%7B%0A%20%20%20%20myAnimate()%20%7B%0A%20%20%20%20%20%20this.isshow%20%3D%20!this.isshow%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)%3B%0A%60%60%60%0A3.%20%E5%AE%9A%E4%B9%89%E4%B8%A4%E7%BB%84%E7%B1%BB%E6%A0%B7%E5%BC%8F%EF%BC%9A%0A%60%60%60%0A%2F*%20%E5%AE%9A%E4%B9%89%E8%BF%9B%E5%85%A5%E5%92%8C%E7%A6%BB%E5%BC%80%E6%97%B6%E5%80%99%E7%9A%84%E8%BF%87%E6%B8%A1%E7%8A%B6%E6%80%81%20*%2F%0A%20%20%20%20.fade-enter-active%2C%0A%20%20%20%20.fade-leave-active%20%7B%0A%20%20%20%20%20%20transition%3A%20all%200.2s%20ease%3B%0A%20%20%20%20%20%20position%3A%20absolute%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20%2F*%20%E5%AE%9A%E4%B9%89%E8%BF%9B%E5%85%A5%E8%BF%87%E6%B8%A1%E7%9A%84%E5%BC%80%E5%A7%8B%E7%8A%B6%E6%80%81%20%E5%92%8C%20%E7%A6%BB%E5%BC%80%E8%BF%87%E6%B8%A1%E7%9A%84%E7%BB%93%E6%9D%9F%E7%8A%B6%E6%80%81%20*%2F%0A%20%20%20%20.fade-enter%2C%0A%20%20%20%20.fade-leave-to%20%7B%0A%20%20%20%20%20%20opacity%3A%200%3B%0A%20%20%20%20%20%20transform%3A%20translateX(100px)%3B%0A%20%20%20%20%7D%0A%60%60%60%0A%0A%23%23%23%20%5B%E4%BD%BF%E7%94%A8%E7%AC%AC%E4%B8%89%E6%96%B9%20CSS%20%E5%8A%A8%E7%94%BB%E5%BA%93%5D(https%3A%2F%2Fcn.vuejs.org%2Fv2%2Fguide%2Ftransitions.html%23%E8%87%AA%E5%AE%9A%E4%B9%89%E8%BF%87%E6%B8%A1%E7%B1%BB%E5%90%8D)%0A1.%20%E5%AF%BC%E5%85%A5%E5%8A%A8%E7%94%BB%E7%B1%BB%E5%BA%93%EF%BC%9A%0A%60%60%60%0A%3Clink%20rel%3D%22stylesheet%22%20type%3D%22text%2Fcss%22%20href%3D%22.%2Flib%2Fanimate.css%22%3E%0A%60%60%60%0A2.%20%E5%AE%9A%E4%B9%89%20transition%20%E5%8F%8A%E5%B1%9E%E6%80%A7%EF%BC%9A%0A%60%60%60%0A%3Ctransition%0A%09enter-active-class%3D%22fadeInRight%22%0A%20%20%20%20leave-active-class%3D%22fadeOutRight%22%0A%20%20%20%20%3Aduration%3D%22%7B%20enter%3A%20500%2C%20leave%3A%20800%20%7D%22%3E%0A%20%20%09%3Cdiv%20class%3D%22animated%22%20v-show%3D%22isshow%22%3E%E5%8A%A8%E7%94%BB%E5%93%A6%3C%2Fdiv%3E%0A%3C%2Ftransition%3E%0A%60%60%60%0A%0A%23%23%23%20%E4%BD%BF%E7%94%A8%E5%8A%A8%E7%94%BB%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%0A1.%20%E5%AE%9A%E4%B9%89%20transition%20%E7%BB%84%E4%BB%B6%E4%BB%A5%E5%8F%8A%E4%B8%89%E4%B8%AA%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%9A%0A%60%60%60%0A%3Cdiv%20id%3D%22app%22%3E%0A%20%20%20%20%3Cinput%20type%3D%22button%22%20value%3D%22%E5%88%87%E6%8D%A2%E5%8A%A8%E7%94%BB%22%20%40click%3D%22isshow%20%3D%20!isshow%22%3E%0A%20%20%20%20%3Ctransition%0A%20%20%20%20%40before-enter%3D%22beforeEnter%22%0A%20%20%20%20%40enter%3D%22enter%22%0A%20%20%20%20%40after-enter%3D%22afterEnter%22%3E%0A%20%20%20%20%20%20%3Cdiv%20v-if%3D%22isshow%22%20class%3D%22show%22%3EOK%3C%2Fdiv%3E%0A%20%20%20%20%3C%2Ftransition%3E%0A%20%20%3C%2Fdiv%3E%0A%60%60%60%0A2.%20%E5%AE%9A%E4%B9%89%E4%B8%89%E4%B8%AA%20methods%20%E9%92%A9%E5%AD%90%E6%96%B9%E6%B3%95%EF%BC%9A%0A%60%60%60%0Amethods%3A%20%7B%0A%20%20%20%20%20%20%20%20beforeEnter(el)%20%7B%20%2F%2F%20%E5%8A%A8%E7%94%BB%E8%BF%9B%E5%85%A5%E4%B9%8B%E5%89%8D%E7%9A%84%E5%9B%9E%E8%B0%83%0A%20%20%20%20%20%20%20%20%20%20el.style.transform%20%3D%20'translateX(500px)'%3B%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20enter(el%2C%20done)%20%7B%20%2F%2F%20%E5%8A%A8%E7%94%BB%E8%BF%9B%E5%85%A5%E5%AE%8C%E6%88%90%E6%97%B6%E5%80%99%E7%9A%84%E5%9B%9E%E8%B0%83%0A%20%20%20%20%20%20%20%20%20%20el.offsetWidth%3B%0A%20%20%20%20%20%20%20%20%20%20el.style.transform%20%3D%20'translateX(0px)'%3B%0A%20%20%20%20%20%20%20%20%20%20done()%3B%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20afterEnter(el)%20%7B%20%2F%2F%20%E5%8A%A8%E7%94%BB%E8%BF%9B%E5%85%A5%E5%AE%8C%E6%88%90%E4%B9%8B%E5%90%8E%E7%9A%84%E5%9B%9E%E8%B0%83%0A%20%20%20%20%20%20%20%20%20%20this.isshow%20%3D%20!this.isshow%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%60%60%60%0A3.%20%E5%AE%9A%E4%B9%89%E5%8A%A8%E7%94%BB%E8%BF%87%E6%B8%A1%E6%97%B6%E9%95%BF%E5%92%8C%E6%A0%B7%E5%BC%8F%EF%BC%9A%0A%60%60%60%0A.show%7B%0A%20%20%20%20%20%20transition%3A%20all%200.4s%20ease%3B%0A%20%20%20%20%7D%0A%60%60%60%0A%0A%0A%23%23%23%20%5Bv-for%20%E7%9A%84%E5%88%97%E8%A1%A8%E8%BF%87%E6%B8%A1%5D(https%3A%2F%2Fcn.vuejs.org%2Fv2%2Fguide%2Ftransitions.html%23%E5%88%97%E8%A1%A8%E7%9A%84%E8%BF%9B%E5%85%A5%E5%92%8C%E7%A6%BB%E5%BC%80%E8%BF%87%E6%B8%A1)%0A1.%20%E5%AE%9A%E4%B9%89%E8%BF%87%E6%B8%A1%E6%A0%B7%E5%BC%8F%EF%BC%9A%0A%60%60%60%0A%3Cstyle%3E%0A%20%20%20%20.list-enter%2C%0A%20%20%20%20.list-leave-to%20%7B%0A%20%20%20%20%20%20opacity%3A%200%3B%0A%20%20%20%20%20%20transform%3A%20translateY(10px)%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20.list-enter-active%2C%0A%20%20%20%20.list-leave-active%20%7B%0A%20%20%20%20%20%20transition%3A%20all%200.3s%20ease%3B%0A%20%20%20%20%7D%0A%3C%2Fstyle%3E%0A%60%60%60%0A2.%20%E5%AE%9A%E4%B9%89DOM%E7%BB%93%E6%9E%84%EF%BC%8C%E5%85%B6%E4%B8%AD%EF%BC%8C%E9%9C%80%E8%A6%81%E4%BD%BF%E7%94%A8%20transition-group%20%E7%BB%84%E4%BB%B6%E6%8A%8Av-for%E5%BE%AA%E7%8E%AF%E7%9A%84%E5%88%97%E8%A1%A8%E5%8C%85%E8%A3%B9%E8%B5%B7%E6%9D%A5%EF%BC%9A%0A%60%60%60%0A%20%20%3Cdiv%20id%3D%22app%22%3E%0A%20%20%20%20%3Cinput%20type%3D%22text%22%20v-model%3D%22txt%22%20%40keyup.enter%3D%22add%22%3E%0A%0A%20%20%20%20%3Ctransition-group%20tag%3D%22ul%22%20name%3D%22list%22%3E%0A%20%20%20%20%20%20%3Cli%20v-for%3D%22(item%2C%20i)%20in%20list%22%20%3Akey%3D%22i%22%3E%7B%7Bitem%7D%7D%3C%2Fli%3E%0A%20%20%20%20%3C%2Ftransition-group%3E%0A%20%20%3C%2Fdiv%3E%0A%60%60%60%0A3.%20%E5%AE%9A%E4%B9%89%20VM%E4%B8%AD%E7%9A%84%E7%BB%93%E6%9E%84%EF%BC%9A%0A%60%60%60%0A%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%20Vue%20%E5%AE%9E%E4%BE%8B%EF%BC%8C%E5%BE%97%E5%88%B0%20ViewModel%0A%20%20%20%20var%20vm%20%3D%20new%20Vue(%7B%0A%20%20%20%20%20%20el%3A%20'%23app'%2C%0A%20%20%20%20%20%20data%3A%20%7B%0A%20%20%20%20%20%20%20%20txt%3A%20''%2C%0A%20%20%20%20%20%20%20%20list%3A%20%5B1%2C%202%2C%203%2C%204%5D%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20methods%3A%20%7B%0A%20%20%20%20%20%20%20%20add()%20%7B%0A%20%20%20%20%20%20%20%20%20%20this.list.push(this.txt)%3B%0A%20%20%20%20%20%20%20%20%20%20this.txt%20%3D%20''%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D)%3B%0A%60%60%60%0A%0A%0A%23%23%23%20%E5%88%97%E8%A1%A8%E7%9A%84%E6%8E%92%E5%BA%8F%E8%BF%87%E6%B8%A1%0A%60%3Ctransition-group%3E%60%20%E7%BB%84%E4%BB%B6%E8%BF%98%E6%9C%89%E4%B8%80%E4%B8%AA%E7%89%B9%E6%AE%8A%E4%B9%8B%E5%A4%84%E3%80%82%E4%B8%8D%E4%BB%85%E5%8F%AF%E4%BB%A5%E8%BF%9B%E5%85%A5%E5%92%8C%E7%A6%BB%E5%BC%80%E5%8A%A8%E7%94%BB%EF%BC%8C**%E8%BF%98%E5%8F%AF%E4%BB%A5%E6%94%B9%E5%8F%98%E5%AE%9A%E4%BD%8D**%E3%80%82%E8%A6%81%E4%BD%BF%E7%94%A8%E8%BF%99%E4%B8%AA%E6%96%B0%E5%8A%9F%E8%83%BD%E5%8F%AA%E9%9C%80%E4%BA%86%E8%A7%A3%E6%96%B0%E5%A2%9E%E7%9A%84%20%60v-move%60%20%E7%89%B9%E6%80%A7%EF%BC%8C**%E5%AE%83%E4%BC%9A%E5%9C%A8%E5%85%83%E7%B4%A0%E7%9A%84%E6%94%B9%E5%8F%98%E5%AE%9A%E4%BD%8D%E7%9A%84%E8%BF%87%E7%A8%8B%E4%B8%AD%E5%BA%94%E7%94%A8**%E3%80%82%0A%2B%20%60v-move%60%20%E5%92%8C%20%60v-leave-active%60%20%E7%BB%93%E5%90%88%E4%BD%BF%E7%94%A8%EF%BC%8C%E8%83%BD%E5%A4%9F%E8%AE%A9%E5%88%97%E8%A1%A8%E7%9A%84%E8%BF%87%E6%B8%A1%E6%9B%B4%E5%8A%A0%E5%B9%B3%E7%BC%93%E6%9F%94%E5%92%8C%EF%BC%9A%0A%60%60%60%0A.v-move%7B%0A%20%20transition%3A%20all%200.8s%20ease%3B%0A%7D%0A.v-leave-active%7B%0A%20%20position%3A%20absolute%3B%0A%7D%0A%60%60%60%0A%0A
