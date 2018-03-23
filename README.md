## weekly report
周报系统

## 采用架构
Koa2 + vue2+ mongoDB

## 上线日志

#### v1.0.1
 - 修复当list过多,不能查看全部的issue
 - 修复在hash模式下,token失效以及404的提示方式,从dialog改为notify
 
#### v1.0.2
 - 修复兼容浏览器显示问题

#### v1.1.0
- 新增Team概念，所有角色新增一个层级
- 新增一个Team页面，super账户有对team进行管理，新增、修改、删除（如果team下有对应的非leader角色的user，就不可以删除），可以新增team leader
- 新增一个Project页面，小组长和team leader可以对项目进行管理：新增、修改、删除、禁用、启用，其中是禁用还是删除，系统会判断是否关联了task里面的记录，所有这些Project的相关操作，都是隶属于同一个team
- 个人密码修改
- 默认展开task所有的记录，不再限制分页的数量
- 任务列表取消放大动效，避免模糊