# app.js

- 笔记本：05.结合Node手写JSONP服务器剖析JSONP原理
- 创建时间：2019-12-17 05:10:38 UTC
- 更新时间：2019-12-17 05:10:53 UTC
- 印象笔记 GUID：329b3b00-c2fd-48c8-9a16-6c5cfb472032

```

// 导入http 内置模块
const http = require('http');
// 这个核心模块可以帮我们解析URL地址，从而拿到pathname query
const urlModule = require('url');
// 创建一个http 服务器
const server = http.createServer();
// 监听 http 服务器的 request 请求
server.on('request', function(req, res) {
    // const url = req.url;
    const { pathname: url, query } = urlModule.parse(req.url, true);
    if(url === '/getscript') {
        // 拼接一个合法的JS 脚本，这里拼接的是一个方法的调用
        // var scriptStr = 'show()';
        var data = {
            name: 'liu',
            age: 18,
            gender: 'male'
        }
        var scriptStr = `${query.callback}(${JSON.stringify(data)})`;
        // res.end 发送给客户端，客户端拿到后把这个字符串当作js代码去解析执行
        res.end(scriptStr);
    } else {
        res.end('404');
    }
});
// 指定端口号并启动服务器监听
server.listen(3000, function() {
    console.log('server listen at http://127.0.0.1:3000');
})

```

%60%60%60node%0A%2F%2F%C2%A0%E5%AF%BC%E5%85%A5http%C2%A0%E5%86%85%E7%BD%AE%E6%A8%A1%E5%9D%97%0Aconst%C2%A0http%C2%A0%3D%C2%A0require('http')%3B%0A%2F%2F%C2%A0%E8%BF%99%E4%B8%AA%E6%A0%B8%E5%BF%83%E6%A8%A1%E5%9D%97%E5%8F%AF%E4%BB%A5%E5%B8%AE%E6%88%91%E4%BB%AC%E8%A7%A3%E6%9E%90URL%E5%9C%B0%E5%9D%80%EF%BC%8C%E4%BB%8E%E8%80%8C%E6%8B%BF%E5%88%B0pathname%C2%A0query%0Aconst%C2%A0urlModule%C2%A0%3D%C2%A0require('url')%3B%0A%2F%2F%C2%A0%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AAhttp%C2%A0%E6%9C%8D%E5%8A%A1%E5%99%A8%0Aconst%C2%A0server%C2%A0%3D%C2%A0http.createServer()%3B%0A%2F%2F%C2%A0%E7%9B%91%E5%90%AC%C2%A0http%C2%A0%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9A%84%C2%A0request%C2%A0%E8%AF%B7%E6%B1%82%0Aserver.on('request'%2C%C2%A0function(req%2C%C2%A0res)%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0const%C2%A0url%C2%A0%3D%C2%A0req.url%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0const%C2%A0%7B%C2%A0pathname%3A%C2%A0url%2C%C2%A0query%C2%A0%7D%C2%A0%3D%C2%A0urlModule.parse(req.url%2C%C2%A0true)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0if(url%C2%A0%3D%3D%3D%C2%A0'%2Fgetscript')%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0%E6%8B%BC%E6%8E%A5%E4%B8%80%E4%B8%AA%E5%90%88%E6%B3%95%E7%9A%84JS%C2%A0%E8%84%9A%E6%9C%AC%EF%BC%8C%E8%BF%99%E9%87%8C%E6%8B%BC%E6%8E%A5%E7%9A%84%E6%98%AF%E4%B8%80%E4%B8%AA%E6%96%B9%E6%B3%95%E7%9A%84%E8%B0%83%E7%94%A8%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0var%C2%A0scriptStr%C2%A0%3D%C2%A0'show()'%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0var%C2%A0data%C2%A0%3D%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0name%3A%C2%A0'liu'%2C%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0age%3A%C2%A018%2C%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0gender%3A%C2%A0'male'%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0var%C2%A0scriptStr%C2%A0%3D%C2%A0%60%24%7Bquery.callback%7D(%24%7BJSON.stringify(data)%7D)%60%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%2F%2F%C2%A0res.end%C2%A0%E5%8F%91%E9%80%81%E7%BB%99%E5%AE%A2%E6%88%B7%E7%AB%AF%EF%BC%8C%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8B%BF%E5%88%B0%E5%90%8E%E6%8A%8A%E8%BF%99%E4%B8%AA%E5%AD%97%E7%AC%A6%E4%B8%B2%E5%BD%93%E4%BD%9Cjs%E4%BB%A3%E7%A0%81%E5%8E%BB%E8%A7%A3%E6%9E%90%E6%89%A7%E8%A1%8C%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0res.end(scriptStr)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%7D%C2%A0else%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0res.end('404')%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%7D%0A%7D)%3B%0A%2F%2F%C2%A0%E6%8C%87%E5%AE%9A%E7%AB%AF%E5%8F%A3%E5%8F%B7%E5%B9%B6%E5%90%AF%E5%8A%A8%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%9B%91%E5%90%AC%0Aserver.listen(3000%2C%C2%A0function()%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0console.log('server%C2%A0listen%C2%A0at%C2%A0http%3A%2F%2F127.0.0.1%3A3000')%3B%0A%7D)%0A%60%60%60
