# Nest 相关语法

本文件记录常用 Nest CLI 命令，用于快速生成模块、控制器、服务等。

## 1. Nest CLI 基础语法

- `nest g <schematic> <name>`：生成代码
- `nest generate <schematic> <name>`：同上
- `nest new <project-name>`：新建 Nest 项目

常见 schematic：

- `mo` / `module`：模块
- `co` / `controller`：控制器
- `s` / `service`：服务
- `pi` / `pipe`：管道
- `gu` / `guard`：守卫
- `fi` / `filter`：异常过滤器
- `in` / `interceptor`：拦截器
- `ma` / `middleware`：中间件
- `ws` / `gateway`：WebSocket 网关

## 2. 常用命令示例

### 2.1 生成模块

```bash
nest g mo modules/menus
```

该命令会生成一个名为 `modules/menus` 的模块文件及相关目录结构。

### 2.2 生成控制器

```bash
nest g co modules/menus
```

### 2.3 生成服务

```bash
nest g s modules/menus
```

### 2.4 一次性生成模块 + 控制器 + 服务

```bash
nest g resource modules/menus
```

或使用 `--no-spec` 取消测试文件生成：

```bash
nest g resource modules/menus --no-spec
```

### 2.5 生成管道、守卫、过滤器、拦截器

```bash
nest g pi common/validation
nest g gu auth/jwt
nest g fi common/http-exception
nest g in common/logging
```

## 3. 其他常见用法

### 3.1 生成模块时指定路径

```bash
nest g mo users
nest g mo admin/settings
```

### 3.2 生成控制器时指定 HTTP 路径

```bash
nest g co users --no-spec
```

### 3.3 生成服务时指定作用域

```bash
nest g s users
```

## 4. 说明

- `nest g mo modules/menus` 只是一个示例，实际路径可根据项目结构调整。
- 如果使用 `pnpm`、`npm` 或 `yarn` 运行，也可以通过 `npx nest g mo modules/menus` 来执行。
- 若未全局安装 `@nestjs/cli`，建议先安装：

```bash
pnpm add -D @nestjs/cli
```
