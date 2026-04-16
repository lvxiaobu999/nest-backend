# Nest + Prisma + PostgreSQL 配置说明

## 已完成需求

- 数据库使用 PostgreSQL
- 使用 Prisma 连接并操作 PostgreSQL
- 提供 `docker-compose.yml`，可直接用 Docker 启动数据库
- 在 Nest 项目中接入 PrismaService
- 增加一个最小可用的 `users` 示例模块，演示增删改查
- 补充中文说明文档与常用命令
- 代码关键位置已添加中文注释

## 项目结构说明

```text
.
├─ docker-compose.yml          # PostgreSQL 容器编排文件
├─ prisma
│  ├─ schema.prisma            # Prisma 数据模型定义
│  └─ seed.js                  # 初始化演示数据
├─ prisma.config.ts            # Prisma 7 配置文件
├─ src
│  ├─ prisma                   # PrismaService 与模块封装
│  └─ users                    # 用户表示例模块
├─ .env.example                # 环境变量模板
└─ README.md                   # 当前说明文档
```

## 环境变量

项目根目录已准备好 `.env.example` 模板，默认配置如下：

```env
PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nest_prisma_db
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nest_prisma_db?schema=public"
```

注意：

- 如果你修改了 PostgreSQL 用户名、密码、端口或库名，请同步修改 `DATABASE_URL`
- 当前文件内容建议统一保持 UTF-8 编码，避免中文乱码
- Prisma 7 的数据库连接配置已放到 `prisma.config.ts` 中

## package.json 已配置脚本

| 指令                             | 作用                                             |
| -------------------------------- | ------------------------------------------------ |
| `pnpm run start`                 | 启动 Nest 应用                                   |
| `pnpm run start:dev`             | 开发模式启动 Nest                                |
| `pnpm run start:debug`           | 调试模式启动 Nest                                |
| `pnpm run start:prod`            | 生产模式运行构建产物                             |
| `pnpm run build`                 | 构建项目                                         |
| `pnpm run format`                | 格式化 `src`、`test`、`prisma`、`md`、`yml` 文件 |
| `pnpm run lint`                  | 执行 ESLint 检查并自动修复                       |
| `pnpm run test`                  | 运行单元测试                                     |
| `pnpm run test:e2e`              | 运行 e2e 测试                                    |
| `pnpm run test:cov`              | 生成测试覆盖率                                   |
| `pnpm run db:up`                 | 使用 Docker Compose 后台启动 PostgreSQL          |
| `pnpm run db:down`               | 停止并移除 PostgreSQL 容器                       |
| `pnpm run db:logs`               | 查看 PostgreSQL 容器日志                         |
| `pnpm run prisma:generate`       | 生成 Prisma Client                               |
| `pnpm run prisma:format`         | 格式化 `schema.prisma`                           |
| `pnpm run prisma:migrate:dev`    | 开发环境执行迁移并生成迁移文件                   |
| `pnpm run prisma:migrate:deploy` | 生产环境执行迁移                                 |
| `pnpm run prisma:push`           | 直接把 Prisma 模型同步到数据库                   |
| `pnpm run prisma:seed`           | 执行种子数据脚本                                 |
| `pnpm run prisma:studio`         | 打开 Prisma Studio 可视化管理界面                |

## 推荐启动步骤

1. 安装依赖

```bash
pnpm install
```

2. 检查环境变量

```bash
# 已提供 .env.example 模板
# 当前项目也已写入一份本地 .env 默认配置
```

3. 启动 PostgreSQL 容器

```bash
pnpm run db:up
```

4. 生成 Prisma Client

```bash
pnpm run prisma:generate
```

5. 执行数据库迁移

```bash
pnpm run prisma:migrate:dev --name init
```

6. 写入演示数据

```bash
pnpm run prisma:seed
```

7. 启动 Nest 项目

```bash
pnpm run start:dev
```

## Docker Compose 直接命令

如果你不想通过 `package.json` 脚本调用，也可以直接执行：

```bash
docker compose up -d
docker compose down
docker compose logs -f postgres
```

## Prisma 示例接口

项目中额外提供了一个 `users` 模块，用来演示 Prisma 读写数据库：

- `GET /`：查看项目启动说明
- `GET /users`：查询所有用户
- `GET /users/:id`：根据 ID 查询用户
- `POST /users`：新增用户
- `PATCH /users/:id`：更新用户
- `DELETE /users/:id`：删除用户

### `POST /users` 请求示例

```json
{
  "email": "demo@example.com",
  "name": "演示用户"
}
```

### `PATCH /users/:id` 请求示例

```json
{
  "name": "已更新的用户名"
}
```

## 说明补充

- 当前示例模型使用的是 `User` 表，后续你可以继续在 `prisma/schema.prisma` 中添加更多表
- 如果你后面还想继续补 Prisma 的分页、事务、统一异常处理，或者把它继续对接你自己的业务表结构，我可以继续帮你直接往下配
