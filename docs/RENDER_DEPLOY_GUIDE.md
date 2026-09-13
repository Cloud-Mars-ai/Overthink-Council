# Render 免费上线与国内极速访问指南

本文档指导如何将本项目一键部署至 [Render.com](https://render.com) 免费云平台，并彻底解决国内网络无法直接访问海外 PaaS 默认域名的问题。

---

## 目录
1. [前期准备](#1-前期准备)
2. [步骤一：Render 一键 Blueprint 部署](#步骤一render-一键-blueprint-部署)
3. [步骤二：国内无障碍访问配置（Cloudflare CDN + 自定义域名）](#步骤二国内无障碍访问配置cloudflare-cdn--自定义域名)
4. [步骤三：配置 24 小时保活（防 15 分钟休眠）](#步骤三配置-24-小时保活防-15-分钟休眠)
5. [常见问题与排错](#常见问题与排错)

---

## 1. 前期准备

- **GitHub 仓库**：确保最新代码已推送至 GitHub（`Felix77720/Overthink-Council`）。
- **Render 账号**：前往 [Render.com](https://render.com) 使用 GitHub 授权注册登录。
- **自定义域名**（实现国内免梯访问的关键）：任意顶级域名或二级子域名均可（如阿里云/腾讯云/Cloudflare/Namesilo 几元钱注册的 `.top`、`.xyz`、`.com` 等）。
- **Cloudflare 免费账号**：[dash.cloudflare.com](https://dash.cloudflare.com)。

---

## 步骤一：Render 一键 Blueprint 部署

由于本项目根目录已内置 `render.yaml` 自动化编排文件，部署仅需 3 次点击：

1. 打开 [Render Dashboard](https://dashboard.render.com/)。
2. 点击右上角的 **`New +`** 按钮，选择 **`Blueprint`**。
3. 在仓库列表中找到并连接 **`Felix77720/Overthink-Council`**。
4. Render 会自动解析 `render.yaml`，显示服务信息：
   - **Service Name**: `overthink-council`
   - **Environment**: `Node`
   - **Plan**: `Free`
   - **Region**: `Oregon` (或自定义)
5. **环境变量配置（可选）**：
   - 可以在页面中填写 `GEMINI_API_KEY` 或 `OPENAI_API_KEY`（如果不填，用户可在前端界面点击右上角设置图标自行输入密钥）。
6. 点击底部的 **`Apply`** 按钮。
7. 等待 2~3 分钟，查看构建日志。当出现 `HTTP server is listening at 0.0.0.0:10000` 且状态变为 **`Live`** 时，说明服务已成功启动！

---

## 步骤二：国内无障碍访问配置（Cloudflare CDN + 自定义域名）

> **为什么必须做这步？**  
> Render 分配的默认域名（如 `https://overthink-council.onrender.com`）在国内受 GFW DNS 阻断，国内网络无法直连。  
> 绑定自定义域名并经过 Cloudflare 免费 CDN 代理回源后，国内用户将直连 Cloudflare 优选节点，畅通无阻访问！

### 2.1 将域名托管至 Cloudflare
1. 在 Cloudflare 控制台添加你的主域名（例如 `yourdomain.com`），根据提示将域名的 DNS 服务器（NS 记录）修改为 Cloudflare 指定的服务器。

### 2.2 在 Cloudflare 添加 CNAME 解析
1. 进入该域名的 **DNS** -> **Records** 页面。
2. 点击 **Add record**，填写：
   - **Type**: `CNAME`
   - **Name**: 自定义子域名（例如 `council`，即最终访问域名为 `council.yourdomain.com`；如用主域名填 `@`）
   - **Target**: 你的 Render 原始服务域名（例如 `overthink-council.onrender.com`）
   - **Proxy status**: **务必开启代理**（显示橙色云朵 ☁️ `Proxied`）
   - **TTL**: `Auto`
3. 保存记录。

### 2.3 设置 Cloudflare SSL/TLS 加密模式
1. 切换到左侧菜单 **SSL/TLS** -> **Overview**。
2. 将加密模式切换为 **`Full`（完全）** 或 **`Full (strict)`**。（避免出现 ERR_TOO_MANY_REDIRECTS 重定向循环）。

### 2.4 在 Render 后台绑定该自定义域名
1. 回到 Render 控制台，进入 `overthink-council` 服务。
2. 点击左侧导航栏的 **`Settings`**。
3. 滚动到 **`Custom Domains`** 区域，点击 **`Add Custom Domain`**。
4. 输入你在上面配置的完整域名（如 `council.yourdomain.com`），点击 **Save**。
5. Render 会自动检测 DNS 并签发证书，大约 1~3 分钟内状态会变成绿色的 **Verified**。

此时，在**国内无代理、无梯子**的环境下访问 `https://council.yourdomain.com`，即可飞速打开应用！

---

## 步骤三：配置 24 小时保活（防 15 分钟休眠）

Render 免费实例在连续 15 分钟无外部访问时会挂起。有新访客时，会有约 50 秒冷启动等待。

利用本项目内建的轻量探针接口，可以彻底免除休眠：

1. 打开 [UptimeRobot](https://uptimerobot.com/)（免费注册）或 [cron-job.org](https://cron-job.org/)。
2. 点击 **Add New Monitor**：
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Overthink-Council-KeepAlive`
   - **URL (or IP)**: `https://council.yourdomain.com/api/council/health` （或者你的 onrender 域名）
   - **Monitoring Interval**: 选择 **`10 minutes`** 或 **`12 minutes`**（只要小于 15 分钟即可）
3. 点击 **Create Monitor**。

**工作原理**：每 10 分钟发送一次 GET 请求到健康检查接口（响应耗时仅几毫秒，不消耗任何大模型 Token），Render 检测到持续有真实流量，因此**保持 24 小时在线，永不进入休眠状态**！

---

## 常见问题与排错

### Q1: 如果我暂时没有自己的域名，能直接在国内免费访问吗？
- Render 的官方域名 `onrender.com` 在中国大陆多数省份受到网络阻断。
- 如果急需展示且没有域名，可通过国内免费 CDN / 免费 Cloudflare Worker 搭建轻量中转反代，或者向我们获取免费的反代脚本模板。
- 但强烈建议使用 1~2 元/年的极简域名配合 Cloudflare，这是最稳健、最受全球开发者认可的长久方案。

### Q2: 部署后流式输出（SSE）是否正常？
- 正常。本项目采用标准 Web API `ReadableStream` 配合 `Cache-Control: no-cache`，Cloudflare 和 Render 默认均支持流式响应传输。

### Q3: 接口速率限制报错 `Too many requests`？
- 我们已在 `render.yaml` 中将 `TRUST_PROXY_HEADERS` 设为 `true`。经过 Render 和 Cloudflare 代理的真实访客 IP 会被正确识别，每个人享有独立的高安全配额，不会发生全网共用配额导致的误拦截。
