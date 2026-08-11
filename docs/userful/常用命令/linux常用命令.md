# linux常用命令

- 笔记本：常用命令
- 创建时间：2019-11-26 07:43:30 UTC
- 更新时间：2019-11-27 02:25:23 UTC
- 印象笔记 GUID：b8dc1631-9176-49dc-8c79-f606dd774f1d

修改linux默认的python版本

```
sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 100
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3 150

```

```
fdisk -l
df -h
mount /dev/sd* /mnt/usb

```

```
# 统计某一目录下文件个数
find ./a/b/c -type f | wc -l
ls -lR /mnt/g/abcdefg/ | grep "^-" | wc -l
# 统计某一目录下文件夹个数
find ./a/b/c -type d | wc -l

```

%E4%BF%AE%E6%94%B9linux%E9%BB%98%E8%AE%A4%E7%9A%84python%E7%89%88%E6%9C%AC%0A%60%60%60shell%0Asudo%20update-alternatives%20--install%20%2Fusr%2Fbin%2Fpython%20python%20%2Fusr%2Fbin%2Fpython2%20100%0Asudo%20update-alternatives%20--install%20%2Fusr%2Fbin%2Fpython%20python%20%2Fusr%2Fbin%2Fpython3%20150%0A%60%60%60%0A%0A%60%60%60shell%0Afdisk%20-l%0Adf%20-h%0Amount%20%2Fdev%2Fsd*%20%2Fmnt%2Fusb%0A%60%60%60%0A%0A%60%60%60shell%0A%23%20%E7%BB%9F%E8%AE%A1%E6%9F%90%E4%B8%80%E7%9B%AE%E5%BD%95%E4%B8%8B%E6%96%87%E4%BB%B6%E4%B8%AA%E6%95%B0%0Afind%20.%2Fa%2Fb%2Fc%20-type%20f%20%7C%20wc%20-l%0Als%20-lR%20%2Fmnt%2Fg%2Fabcdefg%2F%20%7C%20grep%20%22%5E-%22%20%7C%20wc%20-l%0A%23%20%E7%BB%9F%E8%AE%A1%E6%9F%90%E4%B8%80%E7%9B%AE%E5%BD%95%E4%B8%8B%E6%96%87%E4%BB%B6%E5%A4%B9%E4%B8%AA%E6%95%B0%0Afind%20.%2Fa%2Fb%2Fc%20-type%20d%20%7C%20wc%20-l%0A%60%60%60
