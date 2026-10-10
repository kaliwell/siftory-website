# Siftory · 寻藏官网

> 状态：当前
> 更新日期：2026-10-10

寻藏的产品介绍与交互动画官网。软件仓库：https://github.com/kaliwell/Siftory 。官网：https://kaliwell.github.io/siftory-website/ 。动画：https://kaliwell.github.io/siftory-website/promo/ 。

## 开发与验证

使用 Node.js 24 与 npm。执行 `npm ci`，`npm run dev` 启动本地预览；`npm run verify` 执行公开范围检查、类型检查、lint、格式、静态构建与回归测试。首页与动画预渲染 HTML，React 提供交互，CSS 三维动画保留。

## 部署

仓库 Pages Source 为 GitHub Actions。推送 main 后执行 `.github/workflows/pages.yml`，验证通过才发布 dist。路径前缀为 `/siftory-website/`，修改仓库名称时须同步 Vite base、构建元数据与测试。源代码与构建输出分开，dist 不入 Git。

## 公开范围与授权

仅公开页面、动画、示例品牌图和已审查的软件界面截图。没有上传原项目历史、私人材料、模型、用户素材、安装包、Sites 私有项目身份、运行状态和凭据。截图为历史 V1.0.0 示例，当前软件源码为 Alpha 1.0.1-alpha.1；正式安装包尚未发布。

源码授权条款尚未定稿，当前 UNLICENSED。产品方向为个人非商业免费、商用付费；源码可见不等于采用开源许可证。本官网无购买或付款入口。主题偏好仅存当前设备，没有添加访客追踪脚本。静态托管由 GitHub Pages 提供。
