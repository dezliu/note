# MHA高可用数据库架构搭建

- 笔记本：mha-mysql
- 创建时间：2020-11-03 06:42:22 UTC
- 更新时间：2020-12-10 10:14:45 UTC
- 原始链接：https://www.cnblogs.com/gomysql/p/3675429.html
- 印象笔记 GUID：43eb54d0-9c54-40bb-b264-35582b8dbbea

# MHA高可用数据库架构搭建

## 1. 环境准备

四台虚拟机

 | hostname | ip | role | comment
 | mha-manager | 192.168.231.100 | Manager 控制器 | 用于监控管理
 | mysql-master | 192.168.231.101 | mysql master | ...
 | mysql-slave1 | 192.168.231.102 | mysql slave2 | ...
 | mysql-slave2 | 192.168.231.103 | mysql slave2 | ...

四台机器：

```
sudo vim /etc/hosts
# 添加：
192.168.231.100 mha-manager
192.168.231.101 mysql-master
192.168.231.102 mysql-slave1
192.168.231.103 mysql-slave2

```

## 2. 配置SSH登录无密码验证

### 2.1. 在manager上配置到所有数据库节点的无密码认证

```
ssh-keygen -t rsa //一路回车
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.101
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.102
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.103

```

### 2.2. 在master上配置到slave01和slave02的无密码认证

```
ssh-keygen -t rsa //一路回车
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.102
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.103

```

### 2.3. 在slave01上配置到master和slave02的无密码认证

```
ssh-keygen -t rsa //一路回车
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.101
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.103

```

### 2.4. 在slave02上配置到master和slave01的无密码认证

```
ssh-keygen -t rsa //一路回车
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.101
ssh-copy-id -i ~/.ssh/id_rsa.pub liudezhi@192.168.231.102

```

## 3. 配置主从复制

### 3.1. 配置主数据库

修改配置文件

```
vim /etc/my.cnf
server_id=1
log_bin=mysql-bin

```

创建主从复制用户

```
set global validate_password_length=4;
set global validate_password_policy=0;
grant replication slave on *.* to slave@'192.168.231.%' identified by 'slave';

```

### 3.2. 配置从数据库

修改配置文件

```
vim /etc/my.cnf
server_id =2
log_bin=mysql-bin

```

重启mysql `sudo systemctl restart mysqld`

### 3.3. 开启GTID

编辑mysql配置文件（主库从库都需要修改）

```
sudo vim /etc/my.cnf
[mysqld]
gtid_mode=ON
log_slave_updates
enforce_gtid_consistency

```

重启mysql `sudo systemctl restart mysqld`

```
show global variables like '%gtid%';
+----------------------------------+-------+
| Variable_name                    | Value |
+----------------------------------+-------+
| binlog_gtid_simple_recovery      | ON    |
| enforce_gtid_consistency         | ON    |
| gtid_executed                    |       |
| gtid_executed_compression_period | 1000  |
| gtid_mode                        | ON    |
| gtid_owned                       |       |
| gtid_purged                      |       |
| session_track_gtids              | OFF   |
+----------------------------------+-------+

```

### 3.4. 从库配置

```
mysql> change master to
->master_host='192.168.231.101',
-> master_user='slave',
-> master_password='slave',
-> master_auto_position=1;
#开启slave
mysql> start slave;
# 查看 slave 状态
mysql> show slave status;   # 这一步可能出错，原因看下面 1和2.
#禁用自动删除relay log 功能
mysql> set global relay_log_purge = 0;
#设置只读
mysql> set global read_only=1;

```

编辑配置文件，在mysqld标签下添加

```
sudo vim /etc/my.cnf
[mysqld]
#禁用自动删除relay log 永久生效
relay_log_purge = 0

```

#### 3.4.1. start slave 错误解决：

1. 报错：error connecting to master 'slave@192.168.231.101:3306' - retry-time: 60 ret
 **原因：** 防火墙没有开放 3306端口
 **解决：** 开放 3306 端口

```
sudo firewall-cmd --zone=public --add-port=3306/tcp --permanent
sudo firewall-cmd --reload

```

1. 报错：Fatal error: The slave I/O thread stops because master and slave have equal MySQL server UUIDs; these UUIDs must be different for replication to work
 **原因：** 因为是虚拟机直接克隆的 server_uuid 完全相同。
 **解决：** 修改 data/auto.cnf，确保 uuid不同。重启db

```
sudo vim /var/lib/mysql/auto.cnf

```

## 4. 部署MHA

### 4.1. 安装

所有节点安装 mha node

```
sudo yum install perl-DBD-MySQL -y
sudo rpm -Uvh mha4mysql-node-0.58-0.el7.centos.noarch.rpm

```

Manager 节点安装 mha manager

```
sudo yum install -y mha4mysql-manager-0.58-0.el7.centos.noarch.rpm

```

### 4.2. 配置 mha 管理账号

登录数据库
 添加mha管理账号

```
grant all privileges on *.* to mha_mgr@'192.168.231.%' identified by 'mha_mgr';

#查看是否添加成功
select user,host from mysql.user;

```

**注：** 主库上创建，从库会自动复制（在从库上查看）

```
select user,host from mysql.user;

```

### 4.3. mha-manager节点配置

### 4.3.1. 编辑配置文件

```
#创建配置文件目录
sudo mkdir /etc/mha_master

#编辑mha配置文件
vim /etc/mha_master/mha.cnf
[server default]
manager_log=/etc/mha_master/manager.log
manager_workdir=/etc/mha/app1
master_binlog_dir=/var/lib/mysql
user=mha_mgr 				#mha管理用户
password=mha_mgr 			#mha管理密码
ping_interval=2
repl_user=slave
repl_password=slave
ssh_user=liudezhi
[server1]
hostname=192.168.231.101
port=3306
candidate_master=1
[server2]
hostname=192.168.231.102
port=3306
candidate_master=1
[server3]
hostname=192.168.231.103
port=3306
candidate_master=1

```

### 4.3.2. 测试 ssh

```
masterha_check_ssh --conf=/etc/mha_master/mha.cnf

```

看到如下字样，则测试成功

```
All SSH connection tests passed successfully.

```

### 4.3.3. 测试复制(验证主从)

```
sudo masterha_check_repl --conf=/etc/mha_master/mha.cnf
[error][/usr/share/perl5/vendor_perl/MHA/Server.pm, ln398] 192.168.231.102(192.168.231.102:3306): User slave does not exist or does not have REPLICATION SLAVE privilege! Other slaves can not start replication from this host.
[error][/usr/share/perl5/vendor_perl/MHA/MasterMonitor.pm, ln427] Error happened on checking configurations.  at /usr/share/perl5/vendor_perl/MHA/ServerManager.pm line 1403.
[error][/usr/share/perl5/vendor_perl/MHA/MasterMonitor.pm, ln525] Error happened on monitoring servers.
[info] Got exit code 1 (Not master dead).

```

我们发现检测失败，这可能是因为从节点上没有账号，因为这个架构，任何一个从节点， 将有可能成为主节点， 所以也需要创建账号。

因此，我们需要在master节点上再次执行以下操作：

```
grant replication slave on *.* to slave@'192.168.231.%' identified by 'slave';
flush privileges;

```

此时我们再运行：

```
sudo masterha_check_repl --conf=/etc/mha_master/mha.cnf
MySQL Replication Health is OK.

```

此步骤完成。

### 4.3.4. 在 manager 节点启动 MHA：

```
su
nohup masterha_manager -conf=/etc/mha_master/mha.cnf &> /etc/mha_master/manager.log &
[1] 55199

```

启动成功以后，我们来查看一下 master 节点的状态：

```
masterha_check_status -conf=/etc/mha_master/mha.cnf
mha (pid:55199) is running(0:PING_OK), master:192.168.231.101

```

上面的信息中“mha (pid:55199) is running(0:PING_OK)”表示MHA服务运行OK，否则， 则会显示为类似“mha is stopped(1:NOT_RUNNING).” 如果，我们想要停止 MHA ，则需要使用 stop 命令：

```
masterha_stop -conf=/etc/mha_master/mha.cnf

```

### 4.3.5. 测试 MHA 故障转移

mysql-master 节点：

```
sudo systemctl stop mysqld

```

manager 节点：

```
tail -200 /etc/mha_master/manager.log
mha: MySQL Master failover 192.168.231.101(192.168.231.101:3306) to 192.168.231.102(192.168.231.102:3306) succeeded

```

表示 manager 检测到192.168.231.101节点故障， 而后自动执行故障转移， 将192.168.231.102提升为主节点。

**注意：** 故障转移完成后， manager将会自动停止， 此时使用 masterha_check_status 命令检测将会遇到错误提示， 如下所示

```
masterha_check_status -conf=/etc/mha_master/mha.cnf
mha is stopped(2:NOT_RUNNING).

```

>
参考链接：

[https://www.cnblogs.com/keerya/p/7883766.html](https://www.cnblogs.com/keerya/p/7883766.html)

[https://blog.51cto.com/ccokay/1930398](https://blog.51cto.com/ccokay/1930398)

%23%20MHA%E9%AB%98%E5%8F%AF%E7%94%A8%E6%95%B0%E6%8D%AE%E5%BA%93%E6%9E%B6%E6%9E%84%E6%90%AD%E5%BB%BA%0A%0A%23%23%201.%20%E7%8E%AF%E5%A2%83%E5%87%86%E5%A4%87%0A%E5%9B%9B%E5%8F%B0%E8%99%9A%E6%8B%9F%E6%9C%BA%0Ahostname%20%7C%20ip%20%7C%20role%20%7C%20comment%0A%20-%20%7C%20-%20%7C%20-%20%7C%20-%0A%20mha-manager%20%7C%20192.168.231.100%20%7C%20Manager%20%E6%8E%A7%E5%88%B6%E5%99%A8%20%7C%20%E7%94%A8%E4%BA%8E%E7%9B%91%E6%8E%A7%E7%AE%A1%E7%90%86%0A%20mysql-master%20%7C%20192.168.231.101%20%7C%20mysql%20master%20%7C%20...%0A%20mysql-slave1%20%7C%20192.168.231.102%20%7C%20mysql%20slave2%20%7C%20...%0A%20mysql-slave2%20%7C%20192.168.231.103%20%7C%20mysql%20slave2%20%7C%20...%0A%20%0A%20%E5%9B%9B%E5%8F%B0%E6%9C%BA%E5%99%A8%EF%BC%9A%0A%20%60%60%60shell%0A%20sudo%20vim%20%2Fetc%2Fhosts%0A%20%23%20%E6%B7%BB%E5%8A%A0%EF%BC%9A%0A192.168.231.100%20mha-manager%0A192.168.231.101%20mysql-master%0A192.168.231.102%20mysql-slave1%0A192.168.231.103%20mysql-slave2%0A%60%60%60%0A%0A%23%23%202.%20%E9%85%8D%E7%BD%AESSH%E7%99%BB%E5%BD%95%E6%97%A0%E5%AF%86%E7%A0%81%E9%AA%8C%E8%AF%81%0A%23%23%23%202.1.%20%E5%9C%A8manager%E4%B8%8A%E9%85%8D%E7%BD%AE%E5%88%B0%E6%89%80%E6%9C%89%E6%95%B0%E6%8D%AE%E5%BA%93%E8%8A%82%E7%82%B9%E7%9A%84%E6%97%A0%E5%AF%86%E7%A0%81%E8%AE%A4%E8%AF%81%0A%60%60%60shell%0Assh-keygen%20-t%20rsa%20%2F%2F%E4%B8%80%E8%B7%AF%E5%9B%9E%E8%BD%A6%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.101%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.102%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.103%0A%60%60%60%0A%0A%23%23%23%202.2.%20%E5%9C%A8master%E4%B8%8A%E9%85%8D%E7%BD%AE%E5%88%B0slave01%E5%92%8Cslave02%E7%9A%84%E6%97%A0%E5%AF%86%E7%A0%81%E8%AE%A4%E8%AF%81%0A%60%60%60shell%0Assh-keygen%20-t%20rsa%20%2F%2F%E4%B8%80%E8%B7%AF%E5%9B%9E%E8%BD%A6%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.102%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.103%0A%60%60%60%0A%0A%23%23%23%202.3.%20%E5%9C%A8slave01%E4%B8%8A%E9%85%8D%E7%BD%AE%E5%88%B0master%E5%92%8Cslave02%E7%9A%84%E6%97%A0%E5%AF%86%E7%A0%81%E8%AE%A4%E8%AF%81%0A%60%60%60shell%0Assh-keygen%20-t%20rsa%20%2F%2F%E4%B8%80%E8%B7%AF%E5%9B%9E%E8%BD%A6%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.101%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.103%0A%60%60%60%0A%0A%23%23%23%202.4.%20%E5%9C%A8slave02%E4%B8%8A%E9%85%8D%E7%BD%AE%E5%88%B0master%E5%92%8Cslave01%E7%9A%84%E6%97%A0%E5%AF%86%E7%A0%81%E8%AE%A4%E8%AF%81%0A%60%60%60shell%0Assh-keygen%20-t%20rsa%20%2F%2F%E4%B8%80%E8%B7%AF%E5%9B%9E%E8%BD%A6%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.101%0Assh-copy-id%20-i%20~%2F.ssh%2Fid_rsa.pub%20liudezhi%40192.168.231.102%0A%60%60%60%0A%0A%23%23%203.%20%E9%85%8D%E7%BD%AE%E4%B8%BB%E4%BB%8E%E5%A4%8D%E5%88%B6%0A%23%23%23%203.1.%20%E9%85%8D%E7%BD%AE%E4%B8%BB%E6%95%B0%E6%8D%AE%E5%BA%93%0A%E4%BF%AE%E6%94%B9%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%0A%60%60%60shell%0Avim%20%2Fetc%2Fmy.cnf%0Aserver_id%3D1%0Alog_bin%3Dmysql-bin%0A%60%60%60%0A%E5%88%9B%E5%BB%BA%E4%B8%BB%E4%BB%8E%E5%A4%8D%E5%88%B6%E7%94%A8%E6%88%B7%0A%60%60%60mysql%0Aset%20global%20validate_password_length%3D4%3B%0Aset%20global%20validate_password_policy%3D0%3B%0Agrant%20replication%20slave%20on%20*.*%20to%20slave%40'192.168.231.%25'%20identified%20by%20'slave'%3B%0A%60%60%60%0A%0A%23%23%23%203.2.%20%E9%85%8D%E7%BD%AE%E4%BB%8E%E6%95%B0%E6%8D%AE%E5%BA%93%0A%E4%BF%AE%E6%94%B9%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%0A%60%60%60shell%0Avim%20%2Fetc%2Fmy.cnf%0Aserver_id%20%3D2%0Alog_bin%3Dmysql-bin%0A%60%60%60%0A%E9%87%8D%E5%90%AFmysql%20%60sudo%20systemctl%20restart%20mysqld%60%0A%0A%23%23%23%203.3.%20%E5%BC%80%E5%90%AFGTID%0A%E7%BC%96%E8%BE%91mysql%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%EF%BC%88%E4%B8%BB%E5%BA%93%E4%BB%8E%E5%BA%93%E9%83%BD%E9%9C%80%E8%A6%81%E4%BF%AE%E6%94%B9%EF%BC%89%0A%60%60%60shell%0Asudo%20vim%20%2Fetc%2Fmy.cnf%0A%5Bmysqld%5D%0Agtid_mode%3DON%0Alog_slave_updates%0Aenforce_gtid_consistency%0A%60%60%60%0A%E9%87%8D%E5%90%AFmysql%20%60sudo%20systemctl%20restart%20mysqld%60%0A%60%60%60mysql%0Ashow%20global%20variables%20like%20'%25gtid%25'%3B%0A%2B----------------------------------%2B-------%2B%0A%7C%20Variable_name%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7C%20Value%20%7C%0A%2B----------------------------------%2B-------%2B%0A%7C%20binlog_gtid_simple_recovery%20%20%20%20%20%20%7C%20ON%20%20%20%20%7C%0A%7C%20enforce_gtid_consistency%20%20%20%20%20%20%20%20%20%7C%20ON%20%20%20%20%7C%0A%7C%20gtid_executed%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7C%20%20%20%20%20%20%20%7C%0A%7C%20gtid_executed_compression_period%20%7C%201000%20%20%7C%0A%7C%20gtid_mode%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7C%20ON%20%20%20%20%7C%0A%7C%20gtid_owned%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7C%20%20%20%20%20%20%20%7C%0A%7C%20gtid_purged%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7C%20%20%20%20%20%20%20%7C%0A%7C%20session_track_gtids%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7C%20OFF%20%20%20%7C%0A%2B----------------------------------%2B-------%2B%0A%60%60%60%0A%0A%23%23%23%203.4.%20%E4%BB%8E%E5%BA%93%E9%85%8D%E7%BD%AE%0A%60%60%60mysql%0Amysql%3E%20change%20master%20to%0A-%3Emaster_host%3D'192.168.231.101'%2C%0A-%3E%20master_user%3D'slave'%2C%0A-%3E%20master_password%3D'slave'%2C%0A-%3E%20master_auto_position%3D1%3B%0A%23%E5%BC%80%E5%90%AFslave%0Amysql%3E%20start%20slave%3B%0A%23%20%E6%9F%A5%E7%9C%8B%20slave%20%E7%8A%B6%E6%80%81%0Amysql%3E%20show%20slave%20status%3B%20%20%20%23%20%E8%BF%99%E4%B8%80%E6%AD%A5%E5%8F%AF%E8%83%BD%E5%87%BA%E9%94%99%EF%BC%8C%E5%8E%9F%E5%9B%A0%E7%9C%8B%E4%B8%8B%E9%9D%A2%201%E5%92%8C2.%0A%23%E7%A6%81%E7%94%A8%E8%87%AA%E5%8A%A8%E5%88%A0%E9%99%A4relay%20log%20%E5%8A%9F%E8%83%BD%0Amysql%3E%20set%20global%20relay_log_purge%20%3D%200%3B%0A%23%E8%AE%BE%E7%BD%AE%E5%8F%AA%E8%AF%BB%0Amysql%3E%20set%20global%20read_only%3D1%3B%0A%60%60%60%0A%E7%BC%96%E8%BE%91%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%EF%BC%8C%E5%9C%A8mysqld%E6%A0%87%E7%AD%BE%E4%B8%8B%E6%B7%BB%E5%8A%A0%0A%60%60%60shell%0Asudo%20vim%20%2Fetc%2Fmy.cnf%0A%5Bmysqld%5D%0A%23%E7%A6%81%E7%94%A8%E8%87%AA%E5%8A%A8%E5%88%A0%E9%99%A4relay%20log%20%E6%B0%B8%E4%B9%85%E7%94%9F%E6%95%88%0Arelay_log_purge%20%3D%200%0A%60%60%60%0A%23%23%23%23%203.4.1.%20start%20slave%20%E9%94%99%E8%AF%AF%E8%A7%A3%E5%86%B3%EF%BC%9A%0A1.%20%E6%8A%A5%E9%94%99%EF%BC%9Aerror%20connecting%20to%20master%20'slave%40192.168.231.101%3A3306'%20-%20retry-time%3A%2060%20ret%0A**%E5%8E%9F%E5%9B%A0%EF%BC%9A**%20%E9%98%B2%E7%81%AB%E5%A2%99%E6%B2%A1%E6%9C%89%E5%BC%80%E6%94%BE%203306%E7%AB%AF%E5%8F%A3%0A**%E8%A7%A3%E5%86%B3%EF%BC%9A**%20%E5%BC%80%E6%94%BE%203306%20%E7%AB%AF%E5%8F%A3%0A%60%60%60shell%0Asudo%20firewall-cmd%20--zone%3Dpublic%20--add-port%3D3306%2Ftcp%20--permanent%20%0Asudo%20firewall-cmd%20--reload%0A%60%60%60%0A%0A2.%20%E6%8A%A5%E9%94%99%EF%BC%9AFatal%20error%3A%20The%20slave%20I%2FO%20thread%20stops%20because%20master%20and%20slave%20have%20equal%20MySQL%20server%20UUIDs%3B%20these%20UUIDs%20must%20be%20different%20for%20replication%20to%20work%0A**%E5%8E%9F%E5%9B%A0%EF%BC%9A**%20%E5%9B%A0%E4%B8%BA%E6%98%AF%E8%99%9A%E6%8B%9F%E6%9C%BA%E7%9B%B4%E6%8E%A5%E5%85%8B%E9%9A%86%E7%9A%84%20server_uuid%20%E5%AE%8C%E5%85%A8%E7%9B%B8%E5%90%8C%E3%80%82%0A**%E8%A7%A3%E5%86%B3%EF%BC%9A**%20%E4%BF%AE%E6%94%B9%20data%2Fauto.cnf%EF%BC%8C%E7%A1%AE%E4%BF%9D%20uuid%E4%B8%8D%E5%90%8C%E3%80%82%E9%87%8D%E5%90%AFdb%0A%60%60%60shell%0Asudo%20vim%20%2Fvar%2Flib%2Fmysql%2Fauto.cnf%0A%60%60%60%0A%0A%0A%23%23%204.%20%E9%83%A8%E7%BD%B2MHA%0A%23%23%23%204.1.%20%E5%AE%89%E8%A3%85%0A%E6%89%80%E6%9C%89%E8%8A%82%E7%82%B9%E5%AE%89%E8%A3%85%20mha%20node%0A%60%60%60shell%0Asudo%20yum%20install%20perl-DBD-MySQL%20-y%0Asudo%20rpm%20-Uvh%20mha4mysql-node-0.58-0.el7.centos.noarch.rpm%0A%60%60%60%0AManager%20%E8%8A%82%E7%82%B9%E5%AE%89%E8%A3%85%20mha%20manager%0A%60%60%60shell%0Asudo%20yum%20install%20-y%20mha4mysql-manager-0.58-0.el7.centos.noarch.rpm%0A%60%60%60%0A%0A%23%23%23%204.2.%20%E9%85%8D%E7%BD%AE%20mha%20%E7%AE%A1%E7%90%86%E8%B4%A6%E5%8F%B7%0A%E7%99%BB%E5%BD%95%E6%95%B0%E6%8D%AE%E5%BA%93%20%0A%E6%B7%BB%E5%8A%A0mha%E7%AE%A1%E7%90%86%E8%B4%A6%E5%8F%B7%0A%60%60%60mysql%0Agrant%20all%20privileges%20on%20*.*%20to%20mha_mgr%40'192.168.231.%25'%20identified%20by%20'mha_mgr'%3B%0A%0A%23%E6%9F%A5%E7%9C%8B%E6%98%AF%E5%90%A6%E6%B7%BB%E5%8A%A0%E6%88%90%E5%8A%9F%0Aselect%20user%2Chost%20from%20mysql.user%3B%0A%60%60%60%0A%0A**%E6%B3%A8%EF%BC%9A**%20%E4%B8%BB%E5%BA%93%E4%B8%8A%E5%88%9B%E5%BB%BA%EF%BC%8C%E4%BB%8E%E5%BA%93%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%EF%BC%88%E5%9C%A8%E4%BB%8E%E5%BA%93%E4%B8%8A%E6%9F%A5%E7%9C%8B%EF%BC%89%0A%60%60%60mysql%0Aselect%20user%2Chost%20from%20mysql.user%3B%0A%60%60%60%0A%0A%23%23%23%204.3.%20mha-manager%E8%8A%82%E7%82%B9%E9%85%8D%E7%BD%AE%0A%0A%23%23%23%204.3.1.%20%E7%BC%96%E8%BE%91%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%0A%60%60%60shell%0A%23%E5%88%9B%E5%BB%BA%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E7%9B%AE%E5%BD%95%0Asudo%20mkdir%20%2Fetc%2Fmha_master%0A%0A%23%E7%BC%96%E8%BE%91mha%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%0Avim%20%2Fetc%2Fmha_master%2Fmha.cnf%0A%5Bserver%20default%5D%0Amanager_log%3D%2Fetc%2Fmha_master%2Fmanager.log%20%0Amanager_workdir%3D%2Fetc%2Fmha%2Fapp1%0Amaster_binlog_dir%3D%2Fvar%2Flib%2Fmysql%0Auser%3Dmha_mgr%20%09%09%09%09%23mha%E7%AE%A1%E7%90%86%E7%94%A8%E6%88%B7%0Apassword%3Dmha_mgr%20%09%09%09%23mha%E7%AE%A1%E7%90%86%E5%AF%86%E7%A0%81%0Aping_interval%3D2%0Arepl_user%3Dslave%0Arepl_password%3Dslave%0Assh_user%3Dliudezhi%0A%5Bserver1%5D%0Ahostname%3D192.168.231.101%0Aport%3D3306%0Acandidate_master%3D1%0A%5Bserver2%5D%0Ahostname%3D192.168.231.102%0Aport%3D3306%0Acandidate_master%3D1%0A%5Bserver3%5D%0Ahostname%3D192.168.231.103%0Aport%3D3306%0Acandidate_master%3D1%0A%60%60%60%0A%23%23%23%204.3.2.%20%E6%B5%8B%E8%AF%95%20ssh%0A%60%60%60shell%0Amasterha_check_ssh%20--conf%3D%2Fetc%2Fmha_master%2Fmha.cnf%0A%60%60%60%0A%E7%9C%8B%E5%88%B0%E5%A6%82%E4%B8%8B%E5%AD%97%E6%A0%B7%EF%BC%8C%E5%88%99%E6%B5%8B%E8%AF%95%E6%88%90%E5%8A%9F%0A%60%60%60shell%0AAll%20SSH%20connection%20tests%20passed%20successfully.%0A%60%60%60%0A%23%23%23%204.3.3.%20%E6%B5%8B%E8%AF%95%E5%A4%8D%E5%88%B6(%E9%AA%8C%E8%AF%81%E4%B8%BB%E4%BB%8E)%0A%60%60%60shell%0Asudo%20masterha_check_repl%20--conf%3D%2Fetc%2Fmha_master%2Fmha.cnf%0A%5Berror%5D%5B%2Fusr%2Fshare%2Fperl5%2Fvendor_perl%2FMHA%2FServer.pm%2C%20ln398%5D%20192.168.231.102(192.168.231.102%3A3306)%3A%20User%20slave%20does%20not%20exist%20or%20does%20not%20have%20REPLICATION%20SLAVE%20privilege!%20Other%20slaves%20can%20not%20start%20replication%20from%20this%20host.%0A%5Berror%5D%5B%2Fusr%2Fshare%2Fperl5%2Fvendor_perl%2FMHA%2FMasterMonitor.pm%2C%20ln427%5D%20Error%20happened%20on%20checking%20configurations.%20%20at%20%2Fusr%2Fshare%2Fperl5%2Fvendor_perl%2FMHA%2FServerManager.pm%20line%201403.%0A%5Berror%5D%5B%2Fusr%2Fshare%2Fperl5%2Fvendor_perl%2FMHA%2FMasterMonitor.pm%2C%20ln525%5D%20Error%20happened%20on%20monitoring%20servers.%0A%5Binfo%5D%20Got%20exit%20code%201%20(Not%20master%20dead).%0A%60%60%60%0A%E6%88%91%E4%BB%AC%E5%8F%91%E7%8E%B0%E6%A3%80%E6%B5%8B%E5%A4%B1%E8%B4%A5%EF%BC%8C%E8%BF%99%E5%8F%AF%E8%83%BD%E6%98%AF%E5%9B%A0%E4%B8%BA%E4%BB%8E%E8%8A%82%E7%82%B9%E4%B8%8A%E6%B2%A1%E6%9C%89%E8%B4%A6%E5%8F%B7%EF%BC%8C%E5%9B%A0%E4%B8%BA%E8%BF%99%E4%B8%AA%E6%9E%B6%E6%9E%84%EF%BC%8C%E4%BB%BB%E4%BD%95%E4%B8%80%E4%B8%AA%E4%BB%8E%E8%8A%82%E7%82%B9%EF%BC%8C%20%E5%B0%86%E6%9C%89%E5%8F%AF%E8%83%BD%E6%88%90%E4%B8%BA%E4%B8%BB%E8%8A%82%E7%82%B9%EF%BC%8C%20%E6%89%80%E4%BB%A5%E4%B9%9F%E9%9C%80%E8%A6%81%E5%88%9B%E5%BB%BA%E8%B4%A6%E5%8F%B7%E3%80%82%0A%0A%E5%9B%A0%E6%AD%A4%EF%BC%8C%E6%88%91%E4%BB%AC%E9%9C%80%E8%A6%81%E5%9C%A8master%E8%8A%82%E7%82%B9%E4%B8%8A%E5%86%8D%E6%AC%A1%E6%89%A7%E8%A1%8C%E4%BB%A5%E4%B8%8B%E6%93%8D%E4%BD%9C%EF%BC%9A%0A%60%60%60mysql%0Agrant%20replication%20slave%20on%20*.*%20to%20slave%40'192.168.231.%25'%20identified%20by%20'slave'%3B%0Aflush%20privileges%3B%0A%60%60%60%0A%E6%AD%A4%E6%97%B6%E6%88%91%E4%BB%AC%E5%86%8D%E8%BF%90%E8%A1%8C%EF%BC%9A%0A%60%60%60shell%0Asudo%20masterha_check_repl%20--conf%3D%2Fetc%2Fmha_master%2Fmha.cnf%0AMySQL%20Replication%20Health%20is%20OK.%0A%60%60%60%0A%E6%AD%A4%E6%AD%A5%E9%AA%A4%E5%AE%8C%E6%88%90%E3%80%82%0A%0A%0A%23%23%23%204.3.4.%20%E5%9C%A8%20manager%20%E8%8A%82%E7%82%B9%E5%90%AF%E5%8A%A8%20MHA%EF%BC%9A%0A%60%60%60shell%0Asu%0Anohup%20masterha_manager%20-conf%3D%2Fetc%2Fmha_master%2Fmha.cnf%20%26%3E%20%2Fetc%2Fmha_master%2Fmanager.log%20%26%0A%5B1%5D%2055199%0A%60%60%60%0A%0A%E5%90%AF%E5%8A%A8%E6%88%90%E5%8A%9F%E4%BB%A5%E5%90%8E%EF%BC%8C%E6%88%91%E4%BB%AC%E6%9D%A5%E6%9F%A5%E7%9C%8B%E4%B8%80%E4%B8%8B%20master%20%E8%8A%82%E7%82%B9%E7%9A%84%E7%8A%B6%E6%80%81%EF%BC%9A%0A%60%60%60shell%0Amasterha_check_status%20-conf%3D%2Fetc%2Fmha_master%2Fmha.cnf%0Amha%20(pid%3A55199)%20is%20running(0%3APING_OK)%2C%20master%3A192.168.231.101%0A%60%60%60%0A%0A%E4%B8%8A%E9%9D%A2%E7%9A%84%E4%BF%A1%E6%81%AF%E4%B8%AD%E2%80%9Cmha%20(pid%3A55199)%20is%20running(0%3APING_OK)%E2%80%9D%E8%A1%A8%E7%A4%BAMHA%E6%9C%8D%E5%8A%A1%E8%BF%90%E8%A1%8COK%EF%BC%8C%E5%90%A6%E5%88%99%EF%BC%8C%20%E5%88%99%E4%BC%9A%E6%98%BE%E7%A4%BA%E4%B8%BA%E7%B1%BB%E4%BC%BC%E2%80%9Cmha%20is%20stopped(1%3ANOT_RUNNING).%E2%80%9D%E3%80%80%E3%80%80%E5%A6%82%E6%9E%9C%EF%BC%8C%E6%88%91%E4%BB%AC%E6%83%B3%E8%A6%81%E5%81%9C%E6%AD%A2%20MHA%20%EF%BC%8C%E5%88%99%E9%9C%80%E8%A6%81%E4%BD%BF%E7%94%A8%20stop%20%E5%91%BD%E4%BB%A4%EF%BC%9A%0A%60%60%60shell%0Amasterha_stop%20-conf%3D%2Fetc%2Fmha_master%2Fmha.cnf%0A%60%60%60%0A%0A%23%23%23%204.3.5.%20%E6%B5%8B%E8%AF%95%20MHA%20%E6%95%85%E9%9A%9C%E8%BD%AC%E7%A7%BB%0Amysql-master%20%E8%8A%82%E7%82%B9%EF%BC%9A%0A%60%60%60shell%0Asudo%20systemctl%20stop%20mysqld%0A%60%60%60%0A%0Amanager%20%E8%8A%82%E7%82%B9%EF%BC%9A%0A%60%60%60shell%0Atail%20-200%20%2Fetc%2Fmha_master%2Fmanager.log%0Amha%3A%20MySQL%20Master%20failover%20192.168.231.101(192.168.231.101%3A3306)%20to%20192.168.231.102(192.168.231.102%3A3306)%20succeeded%0A%60%60%60%0A%E8%A1%A8%E7%A4%BA%20manager%20%E6%A3%80%E6%B5%8B%E5%88%B0192.168.231.101%E8%8A%82%E7%82%B9%E6%95%85%E9%9A%9C%EF%BC%8C%20%E8%80%8C%E5%90%8E%E8%87%AA%E5%8A%A8%E6%89%A7%E8%A1%8C%E6%95%85%E9%9A%9C%E8%BD%AC%E7%A7%BB%EF%BC%8C%20%E5%B0%86192.168.231.102%E6%8F%90%E5%8D%87%E4%B8%BA%E4%B8%BB%E8%8A%82%E7%82%B9%E3%80%82%0A%0A**%E6%B3%A8%E6%84%8F%EF%BC%9A**%20%E6%95%85%E9%9A%9C%E8%BD%AC%E7%A7%BB%E5%AE%8C%E6%88%90%E5%90%8E%EF%BC%8C%20manager%E5%B0%86%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%81%9C%E6%AD%A2%EF%BC%8C%20%E6%AD%A4%E6%97%B6%E4%BD%BF%E7%94%A8%20masterha_check_status%20%E5%91%BD%E4%BB%A4%E6%A3%80%E6%B5%8B%E5%B0%86%E4%BC%9A%E9%81%87%E5%88%B0%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%EF%BC%8C%20%E5%A6%82%E4%B8%8B%E6%89%80%E7%A4%BA%0A%60%60%60shell%0Amasterha_check_status%20-conf%3D%2Fetc%2Fmha_master%2Fmha.cnf%0Amha%20is%20stopped(2%3ANOT_RUNNING).%0A%60%60%60%0A%0A**Tips%EF%BC%9A**%0A%60%60%60shell%0A%23%20%E4%BF%AE%E6%94%B9%20%E4%B8%BB%E6%9C%BA%E5%90%8D%0Asudo%20nmcli%20g%20hostname%20%E4%B8%BB%E6%9C%BA%E5%90%8D%0A%23%20%E4%BF%AE%E6%94%B9ip%20%E5%90%8E%E9%87%8D%E5%90%AF%E7%BD%91%E5%8D%A1%0Asudo%20nmcli%20c%20reload%0Asudo%20nmcli%20c%20up%20ens33%0A%60%60%60%0A%0A%3E%20%E5%8F%82%E8%80%83%E9%93%BE%E6%8E%A5%EF%BC%9A%0A%5Bhttps%3A%2F%2Fwww.cnblogs.com%2Fkeerya%2Fp%2F7883766.html%5D(https%3A%2F%2Fwww.cnblogs.com%2Fkeerya%2Fp%2F7883766.html)%0A%5Bhttps%3A%2F%2Fblog.51cto.com%2Fccokay%2F1930398%5D(https%3A%2F%2Fblog.51cto.com%2Fccokay%2F1930398)
