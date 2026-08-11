# client.html

- 笔记本：05.结合Node手写JSONP服务器剖析JSONP原理
- 创建时间：2019-12-17 05:11:28 UTC
- 更新时间：2019-12-17 05:11:37 UTC
- 印象笔记 GUID：678f7622-c72a-41e3-b21d-6ff0c6870b6d

```

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <script>
        function showInfo(data) {
            console.log(data);
        }
    </script>
    <script src="http://127.0.0.1:3000/getscript?callback=showInfo">
    </script>
</body>
</html>

```

%60%60%60html%0A%3C!DOCTYPE%C2%A0html%3E%0A%3Chtml%C2%A0lang%3D%22en%22%3E%0A%3Chead%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cmeta%C2%A0charset%3D%22UTF-8%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cmeta%C2%A0name%3D%22viewport%22%C2%A0content%3D%22width%3Ddevice-width%2C%C2%A0initial-scale%3D1.0%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cmeta%C2%A0http-equiv%3D%22X-UA-Compatible%22%C2%A0content%3D%22ie%3Dedge%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Ctitle%3EDocument%3C%2Ftitle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cscript%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0function%C2%A0showInfo(data)%C2%A0%7B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0console.log(data)%3B%0A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%7D%0A%C2%A0%C2%A0%C2%A0%C2%A0%3C%2Fscript%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3Cscript%C2%A0src%3D%22http%3A%2F%2F127.0.0.1%3A3000%2Fgetscript%3Fcallback%3DshowInfo%22%3E%0A%C2%A0%C2%A0%C2%A0%C2%A0%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%60%60%60
