# python爬取小说

- 笔记本：常用命令
- 创建时间：2019-11-26 08:27:14 UTC
- 更新时间：2019-11-26 08:27:47 UTC
- 印象笔记 GUID：7260a7c7-7e67-4233-bebb-d6d4ddd53e7e

```
#! /usr/bin/python
# -*- coding: UTF-8 -*-

import newspaper
def download(url):
    a = newspaper.Article(url, language='zh')
    a.download()
    a.parse()
    f.write(a.text)
    f.write("\n")
    f.write("-----------本章完--------------")
    f.write("\n");
f = open("./a.txt", 'w');
for i in range(20):
    if i < 10:
        newlist = 'http://m.qihaoqihao.net/41/473/808150'+ str(i+1) + '.html';
    else:
        newlist = 'http://m.qihaoqihao.net/41/473/80815'+ str(i+1) + '.html';
    download(newlist)
f.close()

```

%60%60%60python%0A%23!%20%2Fusr%2Fbin%2Fpython%0A%23%20-*-%20coding%3A%20UTF-8%20-*-%0A%0Aimport%20newspaper%0Adef%20download(url)%3A%0A%20%20%20%20a%20%3D%20newspaper.Article(url%2C%20language%3D'zh')%0A%20%20%20%20a.download()%0A%20%20%20%20a.parse()%0A%20%20%20%20f.write(a.text)%0A%20%20%20%20f.write(%22%5Cn%22)%0A%20%20%20%20f.write(%22-----------%E6%9C%AC%E7%AB%A0%E5%AE%8C--------------%22)%0A%20%20%20%20f.write(%22%5Cn%22)%3B%0Af%20%3D%20open(%22.%2Fa.txt%22%2C%20'w')%3B%0Afor%20i%20in%20range(20)%3A%0A%20%20%20%20if%20i%20%3C%2010%3A%0A%20%20%20%20%20%20%20%20newlist%20%3D%20'http%3A%2F%2Fm.qihaoqihao.net%2F41%2F473%2F808150'%2B%20str(i%2B1)%20%2B%20'.html'%3B%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20newlist%20%3D%20'http%3A%2F%2Fm.qihaoqihao.net%2F41%2F473%2F80815'%2B%20str(i%2B1)%20%2B%20'.html'%3B%0A%20%20%20%20download(newlist)%0Af.close()%0A%60%60%60%0A%0A
