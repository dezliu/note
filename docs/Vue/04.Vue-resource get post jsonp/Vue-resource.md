# Vue-resource

- 笔记本：04.Vue-resource get post jsonp
- 创建时间：2019-12-17 04:29:37 UTC
- 更新时间：2019-12-17 04:49:30 UTC
- 印象笔记 GUID：8e22165b-42d4-453e-9be2-06acbefb31f9

#### [vue-resource 实现 get, post, jsonp请求](https://github.com/pagekit/vue-resource)

除了 vue-resource 之外，还可以使用 `axios` 的第三方包实现实现数据的请求

1. 之前的学习中，如何发起数据请求？

1. 常见的数据请求类型？ get post jsonp

1. 测试的URL请求资源地址：

- get请求地址： http://vue.studyit.io/api/getlunbo

- post请求地址：http://vue.studyit.io/api/post

- jsonp请求地址：http://vue.studyit.io/api/jsonp

1. JSONP的实现原理

- 由于浏览器的安全性限制，不允许AJAX访问 协议不同、域名不同、端口号不同的 数据接口，浏览器认为这种访问不安全；

- 可以通过动态创建script标签的形式，把script标签的src属性，指向数据接口的地址，因为script标签不存在跨域限制，这种数据获取方式，称作JSONP（注意：根据JSONP的实现原理，知晓，JSONP只支持Get请求）；

- 具体实现过程：

  - 先在客户端定义一个回调方法，预定义对数据的操作；

  - 再把这个回调方法的名称，通过URL传参的形式，提交到服务器的数据接口；

  - 服务器数据接口组织好要发送给客户端的数据，再拿着客户端传递过来的回调方法名称，拼接出一个调用这个方法的字符串，发送给客户端去解析执行；

  - 客户端拿到服务器返回的字符串之后，当作Script脚本去解析执行，这样就能够拿到JSONP的数据了；

- 带大家通过 Node.js ，来手动实现一个JSONP的请求例子；

```
   const http = require('http');
   // 导入解析 URL 地址的核心模块
   const urlModule = require('url');

   const server = http.createServer();
   // 监听 服务器的 request 请求事件，处理每个请求
   server.on('request', (req, res) => {
     const url = req.url;

     // 解析客户端请求的URL地址
     var info = urlModule.parse(url, true);

     // 如果请求的 URL 地址是 /getjsonp ，则表示要获取JSONP类型的数据
     if (info.pathname === '/getjsonp') {
       // 获取客户端指定的回调函数的名称
       var cbName = info.query.callback;
       // 手动拼接要返回给客户端的数据对象
       var data = {
         name: 'zs',
         age: 22,
         gender: '男',
         hobby: ['吃饭', '睡觉', '运动']
       }
       // 拼接出一个方法的调用，在调用这个方法的时候，把要发送给客户端的数据，序列化为字符串，作为参数传递给这个调用的方法：
       var result = `${cbName}(${JSON.stringify(data)})`;
       // 将拼接好的方法的调用，返回给客户端去解析执行
       res.end(result);
     } else {
       res.end('404');
     }
   });

   server.listen(3000, () => {
     console.log('server running at http://127.0.0.1:3000');
   });

```

1. vue-resource 的配置步骤：

- 直接在页面中，通过`script`标签，引入 `vue-resource` 的脚本文件；

- 注意：引用的先后顺序是：先引用 `Vue` 的脚本文件，再引用 `vue-resource` 的脚本文件；

1. 发送get请求：

```
getInfo() { // get 方式获取数据
  this.$http.get('http://127.0.0.1:8899/api/getlunbo').then(res => {
    console.log(res.body);
  })
}

```

1. 发送post请求：

```
postInfo() {
  var url = 'http://127.0.0.1:8899/api/post';
  // post 方法接收三个参数：
  // 参数1： 要请求的URL地址
  // 参数2： 要发送的数据对象
  // 参数3： 指定post提交的编码类型为 application/x-www-form-urlencoded
  this.$http.post(url, { name: 'zs' }, { emulateJSON: true }).then(res => {
    console.log(res.body);
  });
}

```

1. 发送JSONP请求获取数据：

```
jsonpInfo() { // JSONP形式从服务器获取数据
  var url = 'http://127.0.0.1:8899/api/jsonp';
  this.$http.jsonp(url).then(res => {
    console.log(res.body);
  });
}

```

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <script src="./lib/vue-2.4.0.js"></script>
    <!-- 注意：vue-resource 依赖于vue ，所以先后顺序要注意 -->
    <!-- this.$http -->
    <script src="./lib/vue-resource-1.3.4.js"></script>
</head>
<body>
    <div id="app">
        <input type="button" value="get请求" @click="getInfo">
        <input type="button" value="post请求" @click="postInfo">
        <input type="button" value="jsonp请求" @click="jsonpInfo">
    </div>
    <script>
        var vm = new Vue({
            el: '#app',
            data: {
            },
            methods: {
                getInfo() {         // 发起get请求
                    // 当发起get 请求之后，通过.then 来设置成功的回调函数
                    this.$http.get('http://www.liulongbin.top:3005/api/getlunbo').then(function(result) {
                        console.log(result.body);   // 通过result.body 拿到服务器返回的成功的数据
                    })
                },
                postInfo() {        // 发起post 请求
                    // 表单发起请求 application/x-www-form-urlencoded
                    // 手动发起的post 请求默认没有表单格式，所以有的服务器处理不了
                    // 通过post 方法的第三个参数，设置提交的内容类型为普通表单数据格式
                    this.$http.post('http://www.liulongbin.top:3005/api/post', {}, { emulateJSON: true }).then(result => {
                        console.log(result.body);
                    });
                },
                jsonpInfo() {       // 发起JSONP 请求
                    this.$http.jsonp('http://www.liulongbin.top:3005/api/jsonp').then(result => {
                        console.log(result.body);
                    });
                }
            }
        });
    </script>
</body>
</html>

```

%23%23%23%23%20%5Bvue-resource%20%E5%AE%9E%E7%8E%B0%20get%2C%20post%2C%20jsonp%E8%AF%B7%E6%B1%82%5D(https%3A%2F%2Fgithub.com%2Fpagekit%2Fvue-resource)%0A%E9%99%A4%E4%BA%86%20vue-resource%20%E4%B9%8B%E5%A4%96%EF%BC%8C%E8%BF%98%E5%8F%AF%E4%BB%A5%E4%BD%BF%E7%94%A8%20%60axios%60%20%E7%9A%84%E7%AC%AC%E4%B8%89%E6%96%B9%E5%8C%85%E5%AE%9E%E7%8E%B0%E5%AE%9E%E7%8E%B0%E6%95%B0%E6%8D%AE%E7%9A%84%E8%AF%B7%E6%B1%82%0A1.%20%E4%B9%8B%E5%89%8D%E7%9A%84%E5%AD%A6%E4%B9%A0%E4%B8%AD%EF%BC%8C%E5%A6%82%E4%BD%95%E5%8F%91%E8%B5%B7%E6%95%B0%E6%8D%AE%E8%AF%B7%E6%B1%82%EF%BC%9F%0A2.%20%E5%B8%B8%E8%A7%81%E7%9A%84%E6%95%B0%E6%8D%AE%E8%AF%B7%E6%B1%82%E7%B1%BB%E5%9E%8B%EF%BC%9F%20%20get%20%20post%20jsonp%0A3.%20%E6%B5%8B%E8%AF%95%E7%9A%84URL%E8%AF%B7%E6%B1%82%E8%B5%84%E6%BA%90%E5%9C%B0%E5%9D%80%EF%BC%9A%0A%20%2B%20get%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80%EF%BC%9A%20http%3A%2F%2Fvue.studyit.io%2Fapi%2Fgetlunbo%0A%20%2B%20post%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80%EF%BC%9Ahttp%3A%2F%2Fvue.studyit.io%2Fapi%2Fpost%0A%20%2B%20jsonp%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80%EF%BC%9Ahttp%3A%2F%2Fvue.studyit.io%2Fapi%2Fjsonp%0A4.%20JSONP%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86%0A%20%2B%20%E7%94%B1%E4%BA%8E%E6%B5%8F%E8%A7%88%E5%99%A8%E7%9A%84%E5%AE%89%E5%85%A8%E6%80%A7%E9%99%90%E5%88%B6%EF%BC%8C%E4%B8%8D%E5%85%81%E8%AE%B8AJAX%E8%AE%BF%E9%97%AE%20%E5%8D%8F%E8%AE%AE%E4%B8%8D%E5%90%8C%E3%80%81%E5%9F%9F%E5%90%8D%E4%B8%8D%E5%90%8C%E3%80%81%E7%AB%AF%E5%8F%A3%E5%8F%B7%E4%B8%8D%E5%90%8C%E7%9A%84%20%E6%95%B0%E6%8D%AE%E6%8E%A5%E5%8F%A3%EF%BC%8C%E6%B5%8F%E8%A7%88%E5%99%A8%E8%AE%A4%E4%B8%BA%E8%BF%99%E7%A7%8D%E8%AE%BF%E9%97%AE%E4%B8%8D%E5%AE%89%E5%85%A8%EF%BC%9B%0A%20%2B%20%E5%8F%AF%E4%BB%A5%E9%80%9A%E8%BF%87%E5%8A%A8%E6%80%81%E5%88%9B%E5%BB%BAscript%E6%A0%87%E7%AD%BE%E7%9A%84%E5%BD%A2%E5%BC%8F%EF%BC%8C%E6%8A%8Ascript%E6%A0%87%E7%AD%BE%E7%9A%84src%E5%B1%9E%E6%80%A7%EF%BC%8C%E6%8C%87%E5%90%91%E6%95%B0%E6%8D%AE%E6%8E%A5%E5%8F%A3%E7%9A%84%E5%9C%B0%E5%9D%80%EF%BC%8C%E5%9B%A0%E4%B8%BAscript%E6%A0%87%E7%AD%BE%E4%B8%8D%E5%AD%98%E5%9C%A8%E8%B7%A8%E5%9F%9F%E9%99%90%E5%88%B6%EF%BC%8C%E8%BF%99%E7%A7%8D%E6%95%B0%E6%8D%AE%E8%8E%B7%E5%8F%96%E6%96%B9%E5%BC%8F%EF%BC%8C%E7%A7%B0%E4%BD%9CJSONP%EF%BC%88%E6%B3%A8%E6%84%8F%EF%BC%9A%E6%A0%B9%E6%8D%AEJSONP%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86%EF%BC%8C%E7%9F%A5%E6%99%93%EF%BC%8CJSONP%E5%8F%AA%E6%94%AF%E6%8C%81Get%E8%AF%B7%E6%B1%82%EF%BC%89%EF%BC%9B%0A%20%2B%20%E5%85%B7%E4%BD%93%E5%AE%9E%E7%8E%B0%E8%BF%87%E7%A8%8B%EF%BC%9A%0A%20%09-%20%E5%85%88%E5%9C%A8%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%AE%9A%E4%B9%89%E4%B8%80%E4%B8%AA%E5%9B%9E%E8%B0%83%E6%96%B9%E6%B3%95%EF%BC%8C%E9%A2%84%E5%AE%9A%E4%B9%89%E5%AF%B9%E6%95%B0%E6%8D%AE%E7%9A%84%E6%93%8D%E4%BD%9C%EF%BC%9B%0A%20%09-%20%E5%86%8D%E6%8A%8A%E8%BF%99%E4%B8%AA%E5%9B%9E%E8%B0%83%E6%96%B9%E6%B3%95%E7%9A%84%E5%90%8D%E7%A7%B0%EF%BC%8C%E9%80%9A%E8%BF%87URL%E4%BC%A0%E5%8F%82%E7%9A%84%E5%BD%A2%E5%BC%8F%EF%BC%8C%E6%8F%90%E4%BA%A4%E5%88%B0%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%E6%95%B0%E6%8D%AE%E6%8E%A5%E5%8F%A3%EF%BC%9B%0A%20%09-%20%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%95%B0%E6%8D%AE%E6%8E%A5%E5%8F%A3%E7%BB%84%E7%BB%87%E5%A5%BD%E8%A6%81%E5%8F%91%E9%80%81%E7%BB%99%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%9A%84%E6%95%B0%E6%8D%AE%EF%BC%8C%E5%86%8D%E6%8B%BF%E7%9D%80%E5%AE%A2%E6%88%B7%E7%AB%AF%E4%BC%A0%E9%80%92%E8%BF%87%E6%9D%A5%E7%9A%84%E5%9B%9E%E8%B0%83%E6%96%B9%E6%B3%95%E5%90%8D%E7%A7%B0%EF%BC%8C%E6%8B%BC%E6%8E%A5%E5%87%BA%E4%B8%80%E4%B8%AA%E8%B0%83%E7%94%A8%E8%BF%99%E4%B8%AA%E6%96%B9%E6%B3%95%E7%9A%84%E5%AD%97%E7%AC%A6%E4%B8%B2%EF%BC%8C%E5%8F%91%E9%80%81%E7%BB%99%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%8E%BB%E8%A7%A3%E6%9E%90%E6%89%A7%E8%A1%8C%EF%BC%9B%0A%20%09-%20%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8B%BF%E5%88%B0%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%BF%94%E5%9B%9E%E7%9A%84%E5%AD%97%E7%AC%A6%E4%B8%B2%E4%B9%8B%E5%90%8E%EF%BC%8C%E5%BD%93%E4%BD%9CScript%E8%84%9A%E6%9C%AC%E5%8E%BB%E8%A7%A3%E6%9E%90%E6%89%A7%E8%A1%8C%EF%BC%8C%E8%BF%99%E6%A0%B7%E5%B0%B1%E8%83%BD%E5%A4%9F%E6%8B%BF%E5%88%B0JSONP%E7%9A%84%E6%95%B0%E6%8D%AE%E4%BA%86%EF%BC%9B%0A%20%2B%20%E5%B8%A6%E5%A4%A7%E5%AE%B6%E9%80%9A%E8%BF%87%20Node.js%20%EF%BC%8C%E6%9D%A5%E6%89%8B%E5%8A%A8%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AAJSONP%E7%9A%84%E8%AF%B7%E6%B1%82%E4%BE%8B%E5%AD%90%EF%BC%9B%0A%20%60%60%60%0A%20%20%20%20const%20http%20%3D%20require('http')%3B%0A%20%20%20%20%2F%2F%20%E5%AF%BC%E5%85%A5%E8%A7%A3%E6%9E%90%20URL%20%E5%9C%B0%E5%9D%80%E7%9A%84%E6%A0%B8%E5%BF%83%E6%A8%A1%E5%9D%97%0A%20%20%20%20const%20urlModule%20%3D%20require('url')%3B%0A%0A%20%20%20%20const%20server%20%3D%20http.createServer()%3B%0A%20%20%20%20%2F%2F%20%E7%9B%91%E5%90%AC%20%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%20request%20%E8%AF%B7%E6%B1%82%E4%BA%8B%E4%BB%B6%EF%BC%8C%E5%A4%84%E7%90%86%E6%AF%8F%E4%B8%AA%E8%AF%B7%E6%B1%82%0A%20%20%20%20server.on('request'%2C%20(req%2C%20res)%20%3D%3E%20%7B%0A%20%20%20%20%20%20const%20url%20%3D%20req.url%3B%0A%0A%20%20%20%20%20%20%2F%2F%20%E8%A7%A3%E6%9E%90%E5%AE%A2%E6%88%B7%E7%AB%AF%E8%AF%B7%E6%B1%82%E7%9A%84URL%E5%9C%B0%E5%9D%80%0A%20%20%20%20%20%20var%20info%20%3D%20urlModule.parse(url%2C%20true)%3B%0A%0A%20%20%20%20%20%20%2F%2F%20%E5%A6%82%E6%9E%9C%E8%AF%B7%E6%B1%82%E7%9A%84%20URL%20%E5%9C%B0%E5%9D%80%E6%98%AF%20%2Fgetjsonp%20%EF%BC%8C%E5%88%99%E8%A1%A8%E7%A4%BA%E8%A6%81%E8%8E%B7%E5%8F%96JSONP%E7%B1%BB%E5%9E%8B%E7%9A%84%E6%95%B0%E6%8D%AE%0A%20%20%20%20%20%20if%20(info.pathname%20%3D%3D%3D%20'%2Fgetjsonp')%20%7B%0A%20%20%20%20%20%20%20%20%2F%2F%20%E8%8E%B7%E5%8F%96%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8C%87%E5%AE%9A%E7%9A%84%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0%E7%9A%84%E5%90%8D%E7%A7%B0%0A%20%20%20%20%20%20%20%20var%20cbName%20%3D%20info.query.callback%3B%0A%20%20%20%20%20%20%20%20%2F%2F%20%E6%89%8B%E5%8A%A8%E6%8B%BC%E6%8E%A5%E8%A6%81%E8%BF%94%E5%9B%9E%E7%BB%99%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%9A%84%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1%0A%20%20%20%20%20%20%20%20var%20data%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%20%20name%3A%20'zs'%2C%0A%20%20%20%20%20%20%20%20%20%20age%3A%2022%2C%0A%20%20%20%20%20%20%20%20%20%20gender%3A%20'%E7%94%B7'%2C%0A%20%20%20%20%20%20%20%20%20%20hobby%3A%20%5B'%E5%90%83%E9%A5%AD'%2C%20'%E7%9D%A1%E8%A7%89'%2C%20'%E8%BF%90%E5%8A%A8'%5D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%2F%2F%20%E6%8B%BC%E6%8E%A5%E5%87%BA%E4%B8%80%E4%B8%AA%E6%96%B9%E6%B3%95%E7%9A%84%E8%B0%83%E7%94%A8%EF%BC%8C%E5%9C%A8%E8%B0%83%E7%94%A8%E8%BF%99%E4%B8%AA%E6%96%B9%E6%B3%95%E7%9A%84%E6%97%B6%E5%80%99%EF%BC%8C%E6%8A%8A%E8%A6%81%E5%8F%91%E9%80%81%E7%BB%99%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%9A%84%E6%95%B0%E6%8D%AE%EF%BC%8C%E5%BA%8F%E5%88%97%E5%8C%96%E4%B8%BA%E5%AD%97%E7%AC%A6%E4%B8%B2%EF%BC%8C%E4%BD%9C%E4%B8%BA%E5%8F%82%E6%95%B0%E4%BC%A0%E9%80%92%E7%BB%99%E8%BF%99%E4%B8%AA%E8%B0%83%E7%94%A8%E7%9A%84%E6%96%B9%E6%B3%95%EF%BC%9A%0A%20%20%20%20%20%20%20%20var%20result%20%3D%20%60%24%7BcbName%7D(%24%7BJSON.stringify(data)%7D)%60%3B%0A%20%20%20%20%20%20%20%20%2F%2F%20%E5%B0%86%E6%8B%BC%E6%8E%A5%E5%A5%BD%E7%9A%84%E6%96%B9%E6%B3%95%E7%9A%84%E8%B0%83%E7%94%A8%EF%BC%8C%E8%BF%94%E5%9B%9E%E7%BB%99%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%8E%BB%E8%A7%A3%E6%9E%90%E6%89%A7%E8%A1%8C%0A%20%20%20%20%20%20%20%20res.end(result)%3B%0A%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20res.end('404')%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D)%3B%0A%0A%20%20%20%20server.listen(3000%2C%20()%20%3D%3E%20%7B%0A%20%20%20%20%20%20console.log('server%20running%20at%20http%3A%2F%2F127.0.0.1%3A3000')%3B%0A%20%20%20%20%7D)%3B%0A%20%60%60%60%0A5.%20vue-resource%20%E7%9A%84%E9%85%8D%E7%BD%AE%E6%AD%A5%E9%AA%A4%EF%BC%9A%0A%20%2B%20%E7%9B%B4%E6%8E%A5%E5%9C%A8%E9%A1%B5%E9%9D%A2%E4%B8%AD%EF%BC%8C%E9%80%9A%E8%BF%87%60script%60%E6%A0%87%E7%AD%BE%EF%BC%8C%E5%BC%95%E5%85%A5%20%60vue-resource%60%20%E7%9A%84%E8%84%9A%E6%9C%AC%E6%96%87%E4%BB%B6%EF%BC%9B%0A%20%2B%20%E6%B3%A8%E6%84%8F%EF%BC%9A%E5%BC%95%E7%94%A8%E7%9A%84%E5%85%88%E5%90%8E%E9%A1%BA%E5%BA%8F%E6%98%AF%EF%BC%9A%E5%85%88%E5%BC%95%E7%94%A8%20%60Vue%60%20%E7%9A%84%E8%84%9A%E6%9C%AC%E6%96%87%E4%BB%B6%EF%BC%8C%E5%86%8D%E5%BC%95%E7%94%A8%20%60vue-resource%60%20%E7%9A%84%E8%84%9A%E6%9C%AC%E6%96%87%E4%BB%B6%EF%BC%9B%0A6.%20%E5%8F%91%E9%80%81get%E8%AF%B7%E6%B1%82%EF%BC%9A%0A%60%60%60%0AgetInfo()%20%7B%20%2F%2F%20get%20%E6%96%B9%E5%BC%8F%E8%8E%B7%E5%8F%96%E6%95%B0%E6%8D%AE%0A%20%20this.%24http.get('http%3A%2F%2F127.0.0.1%3A8899%2Fapi%2Fgetlunbo').then(res%20%3D%3E%20%7B%0A%20%20%20%20console.log(res.body)%3B%0A%20%20%7D)%0A%7D%0A%60%60%60%0A7.%20%E5%8F%91%E9%80%81post%E8%AF%B7%E6%B1%82%EF%BC%9A%0A%60%60%60%0ApostInfo()%20%7B%0A%20%20var%20url%20%3D%20'http%3A%2F%2F127.0.0.1%3A8899%2Fapi%2Fpost'%3B%0A%20%20%2F%2F%20post%20%E6%96%B9%E6%B3%95%E6%8E%A5%E6%94%B6%E4%B8%89%E4%B8%AA%E5%8F%82%E6%95%B0%EF%BC%9A%0A%20%20%2F%2F%20%E5%8F%82%E6%95%B01%EF%BC%9A%20%E8%A6%81%E8%AF%B7%E6%B1%82%E7%9A%84URL%E5%9C%B0%E5%9D%80%0A%20%20%2F%2F%20%E5%8F%82%E6%95%B02%EF%BC%9A%20%E8%A6%81%E5%8F%91%E9%80%81%E7%9A%84%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1%0A%20%20%2F%2F%20%E5%8F%82%E6%95%B03%EF%BC%9A%20%E6%8C%87%E5%AE%9Apost%E6%8F%90%E4%BA%A4%E7%9A%84%E7%BC%96%E7%A0%81%E7%B1%BB%E5%9E%8B%E4%B8%BA%20application%2Fx-www-form-urlencoded%0A%20%20this.%24http.post(url%2C%20%7B%20name%3A%20'zs'%20%7D%2C%20%7B%20emulateJSON%3A%20true%20%7D).then(res%20%3D%3E%20%7B%0A%20%20%20%20console.log(res.body)%3B%0A%20%20%7D)%3B%0A%7D%0A%60%60%60%0A8.%20%E5%8F%91%E9%80%81JSONP%E8%AF%B7%E6%B1%82%E8%8E%B7%E5%8F%96%E6%95%B0%E6%8D%AE%EF%BC%9A%0A%60%60%60%0AjsonpInfo()%20%7B%20%2F%2F%20JSONP%E5%BD%A2%E5%BC%8F%E4%BB%8E%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%8E%B7%E5%8F%96%E6%95%B0%E6%8D%AE%0A%20%20var%20url%20%3D%20'http%3A%2F%2F127.0.0.1%3A8899%2Fapi%2Fjsonp'%3B%0A%20%20this.%24http.jsonp(url).then(res%20%3D%3E%20%7B%0A%20%20%20%20console.log(res.body)%3B%0A%20%20%7D)%3B%0A%7D%0A%60%60%60%0A%0A**eg%3A**%0A%60%60%60html%0A%3C!DOCTYPE%C2%A0html%3E%0A%3Chtml%C2%A0lang%3D%22en%22%3E%0A%3Chead%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cmeta%C2%A0charset%3D%22UTF-8%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cmeta%C2%A0name%3D%22viewport%22%C2%A0content%3D%22width%3Ddevice-width%2C%C2%A0initial-scale%3D1.0%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cmeta%C2%A0http-equiv%3D%22X-UA-Compatible%22%C2%A0content%3D%22ie%3Dedge%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Ctitle%3EDocument%3C%2Ftitle%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cscript%C2%A0src%3D%22.%2Flib%2Fvue-2.4.0.js%22%3E%3C%2Fscript%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3C!--%C2%A0%E6%B3%A8%E6%84%8F%EF%BC%9Avue-resource%C2%A0%E4%BE%9D%E8%B5%96%E4%BA%8Evue%C2%A0%EF%BC%8C%E6%89%80%E4%BB%A5%E5%85%88%E5%90%8E%E9%A1%BA%E5%BA%8F%E8%A6%81%E6%B3%A8%E6%84%8F%C2%A0--%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3C!--%C2%A0this.%24http%C2%A0--%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cscript%C2%A0src%3D%22.%2Flib%2Fvue-resource-1.3.4.js%22%3E%3C%2Fscript%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cdiv%C2%A0id%3D%22app%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%3Cinput%C2%A0type%3D%22button%22%C2%A0value%3D%22get%E8%AF%B7%E6%B1%82%22%C2%A0%40click%3D%22getInfo%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%3Cinput%C2%A0type%3D%22button%22%C2%A0value%3D%22post%E8%AF%B7%E6%B1%82%22%C2%A0%40click%3D%22postInfo%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%3Cinput%C2%A0type%3D%22button%22%C2%A0value%3D%22jsonp%E8%AF%B7%E6%B1%82%22%C2%A0%40click%3D%22jsonpInfo%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3C%2Fdiv%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cscript%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0var%C2%A0vm%C2%A0%3D%C2%A0new%C2%A0Vue(%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0el%3A%C2%A0'%23app'%2C%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0data%3A%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D%2C%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0methods%3A%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0getInfo()%C2%A0%7B%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E5%8F%91%E8%B5%B7get%E8%AF%B7%E6%B1%82%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E5%BD%93%E5%8F%91%E8%B5%B7get%C2%A0%E8%AF%B7%E6%B1%82%E4%B9%8B%E5%90%8E%EF%BC%8C%E9%80%9A%E8%BF%87.then%C2%A0%E6%9D%A5%E8%AE%BE%E7%BD%AE%E6%88%90%E5%8A%9F%E7%9A%84%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0this.%24http.get('http%3A%2F%2Fwww.liulongbin.top%3A3005%2Fapi%2Fgetlunbo').then(function(result)%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0console.log(result.body)%3B%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E9%80%9A%E8%BF%87result.body%C2%A0%E6%8B%BF%E5%88%B0%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%BF%94%E5%9B%9E%E7%9A%84%E6%88%90%E5%8A%9F%E7%9A%84%E6%95%B0%E6%8D%AE%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D)%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D%2C%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0postInfo()%C2%A0%7B%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E5%8F%91%E8%B5%B7post%C2%A0%E8%AF%B7%E6%B1%82%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E8%A1%A8%E5%8D%95%E5%8F%91%E8%B5%B7%E8%AF%B7%E6%B1%82%C2%A0application%2Fx-www-form-urlencoded%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E6%89%8B%E5%8A%A8%E5%8F%91%E8%B5%B7%E7%9A%84post%C2%A0%E8%AF%B7%E6%B1%82%E9%BB%98%E8%AE%A4%E6%B2%A1%E6%9C%89%E8%A1%A8%E5%8D%95%E6%A0%BC%E5%BC%8F%EF%BC%8C%E6%89%80%E4%BB%A5%E6%9C%89%E7%9A%84%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%A4%84%E7%90%86%E4%B8%8D%E4%BA%86%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E9%80%9A%E8%BF%87post%C2%A0%E6%96%B9%E6%B3%95%E7%9A%84%E7%AC%AC%E4%B8%89%E4%B8%AA%E5%8F%82%E6%95%B0%EF%BC%8C%E8%AE%BE%E7%BD%AE%E6%8F%90%E4%BA%A4%E7%9A%84%E5%86%85%E5%AE%B9%E7%B1%BB%E5%9E%8B%E4%B8%BA%E6%99%AE%E9%80%9A%E8%A1%A8%E5%8D%95%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0this.%24http.post('http%3A%2F%2Fwww.liulongbin.top%3A3005%2Fapi%2Fpost'%2C%C2%A0%7B%7D%2C%C2%A0%7B%C2%A0emulateJSON%3A%C2%A0true%C2%A0%7D).then(result%C2%A0%3D%3E%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0console.log(result.body)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D%2C%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0jsonpInfo()%C2%A0%7B%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E5%8F%91%E8%B5%B7JSONP%C2%A0%E8%AF%B7%E6%B1%82%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0this.%24http.jsonp('http%3A%2F%2Fwww.liulongbin.top%3A3005%2Fapi%2Fjsonp').then(result%C2%A0%3D%3E%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0console.log(result.body)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%60%60%60
