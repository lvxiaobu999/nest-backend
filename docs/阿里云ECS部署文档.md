# 阿里云 ECS 部署文档

本文档适用于当前 NestJS 项目在阿里云 ECS 上部署，推荐方案是：

- PM2：负责 Node/Nest 进程守护、日志、自动重启、开机自启。
- Nginx：负责公网入口、反向代理、后续 HTTPS。
- Docker Compose：可选，用于启动 PostgreSQL 和 Redis。

## 一、整体操作逻辑

1. 阿里云安全组只放行公网入口端口：`80`、后续 HTTPS 的 `443`。
2. Nest 服务只监听服务器本机端口：默认 `3000`。
3. Nginx 接收公网请求，再转发到 `127.0.0.1:3000`。
4. PM2 启动 `dist/main.js`，并设置 `NODE_ENV=production`。
5. 项目读取 `.env.production`，连接生产数据库、Redis、JWT 等配置。
6. 每次更新代码后执行：拉代码、安装依赖、生成 Prisma Client、执行迁移、构建、重启 PM2。

## 二、服务器初始化

先确认服务器系统：

```bash
cat /etc/os-release
```

Ubuntu/Debian 系统：

```bash
sudo apt update
sudo apt install -y nginx git curl
```

Alibaba Cloud Linux/CentOS/RHEL 系统：

```bash
sudo yum install -y nginx git curl
```

安装 Node.js 建议使用 nvm。若服务器已安装可跳过。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

启用 pnpm：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

安装 PM2：

```bash
npm install -g pm2
```

## 三、准备项目

建议把项目放到固定目录，例如：

```bash
sudo mkdir -p /www
sudo chown -R $USER:$USER /www
cd /www
git clone <你的仓库地址> nest-backend
cd /www/nest-backend
```

安装依赖：

```bash
pnpm install --frozen-lockfile
```

检查 `.env.production`，至少确认这些配置是生产值：

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://..."
REDIS_HOST=...
REDIS_PORT=6379
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
LOG_LEVEL=warn
```

注意：`JWT_SECRET` 必须换成强随机字符串，不要使用示例值。

## 四、数据库和 Redis

如果生产环境也使用当前仓库里的 `docker-compose.yml` 启动 PostgreSQL 和 Redis：

```bash
pnpm run db:up:prod
```

拉取镜像的时候可能会超时导致失败，这时看先配置一下国内的镜像加速器

```bash
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
```

（提示：复制上面的整段代码，在终端里右键粘贴并按回车即可执行完毕。我试着阿里云上面的个人申请的加速器，还是失败）

第二步：重启 Docker 服务让配置生效

```bash
sudo systemctl daemon-reload

sudo systemctl restart docker
```

查看容器日志：

```bash
pnpm run db:logs:prod
```

如果你使用阿里云 RDS、云数据库 Redis，跳过 Docker Compose，只需要把 `.env.production` 中的连接信息改成云服务地址。

## 五、Prisma 和项目构建

生成 Prisma Client：

```bash
pnpm run prisma:generate:prod
```

执行生产迁移：

```bash
pnpm run prisma:migrate:deploy
```

构建项目：

```bash
pnpm run build
```

本地验证一次：

```bash
NODE_ENV=production node dist/main.js
```

确认能启动后按 `Ctrl+C` 停止，交给 PM2 管理。

## 六、PM2 进程守护

本仓库已提供 `ecosystem.config.js`，默认配置：

- 应用名：`nest-backend-api`
- 启动文件：`dist/main.js`
- 生产环境：`NODE_ENV=production`
- 端口：`3000`
- 日志目录：`logs/`

启动：

```bash
pm2 start ecosystem.config.js
```

查看状态：

```bash
pm2 list
pm2 logs nest-backend-api
```

保存当前 PM2 进程列表：

```bash
pm2 save
```

设置开机自启：

```bash
pm2 startup
```

执行 `pm2 startup` 输出的那一整行 `sudo env ...` 命令，然后再次保存：

```bash
pm2 save
```

常用维护命令：

```bash
pm2 restart nest-backend-api
pm2 stop nest-backend-api
pm2 delete nest-backend-api
pm2 monit
```

## 七、Nginx 反向代理

本仓库已提供 Nginx 示例：`deploy/nginx/nest-api.conf`。

本仓库已提供 Nginx 示例：`deploy/nginx/nest-api.conf`。

Ubuntu/Debian 系统复制到 `sites-available`：

```bash
sudo cp deploy/nginx/nest-api.conf /etc/nginx/sites-available/nest-api
```

编辑域名：

```bash
sudo nano /etc/nginx/sites-available/nest-api
```

Alibaba Cloud Linux/CentOS/RHEL 系统一般复制到 `conf.d`：

```bash
sudo cp deploy/nginx/nest-api.conf /etc/nginx/conf.d/nest-api.conf
sudo nano /etc/nginx/conf.d/nest-api.conf
```

把：

```nginx
server_name example.com;
```

改成你的域名或公网 IP：

```nginx
server_name api.example.com;
```

Ubuntu/Debian 系统启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/nest-api /etc/nginx/sites-enabled/nest-api
sudo nginx -t
sudo systemctl reload nginx
```

Alibaba Cloud Linux/CentOS/RHEL 系统不需要创建软链接，直接测试并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

如果系统存在默认站点并冲突，可以禁用默认站点：

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 八、阿里云安全组

进入阿里云控制台：

1. ECS 实例
2. 安全组
3. 入方向规则
4. 放行：

| 端口 | 用途     |
| ---- | -------- |
| 22   | SSH 登录 |
| 80   | HTTP     |
| 443  | HTTPS    |

生产环境不建议放行 `3000`。让 `3000` 只在服务器本机被 Nginx 访问即可。

## 九、配置 HTTPS

域名解析到 ECS 公网 IP 后，可以使用 Certbot 自动签发证书：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx
```

按提示选择你的域名，Certbot 会自动修改 Nginx 配置并设置证书续期。

## 十、日常发布流程

以后更新代码时，进入项目目录：

```bash
cd /www/nest-backend
git pull
pnpm install --frozen-lockfile
pnpm run prisma:generate:prod
pnpm run prisma:migrate:deploy
pnpm run build
pm2 restart nest-backend-api
```

检查：

```bash
pm2 list
pm2 logs nest-backend-api
curl http://127.0.0.1:3000
curl http://你的域名或公网IP
```

## 十一、排查思路

接口访问不到时按这个顺序查：

1. `pm2 list`：确认服务是否在线。
2. `pm2 logs nest-backend-api`：看应用报错。
3. `curl http://127.0.0.1:3000`：确认 Nest 本机可访问。
4. `sudo nginx -t`：确认 Nginx 配置正确。
5. `sudo systemctl status nginx`：确认 Nginx 正常运行。
6. 阿里云安全组：确认 `80` 或 `443` 已放行。
7. `.env.production`：确认数据库、Redis、JWT、端口配置正确。
