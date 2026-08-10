# 个人笔记

单仓库双站点：

- **Terminal 首页**（[terminal-portfolio](https://github.com/iamdhakrey/terminal-portfolio)，Astro）：交互式终端风格主页，支持 `ls` / `cd` / `cat` / `ll` 等命令直接浏览文档
- **知识库**（[MkDocs](https://www.mkdocs.org/) + [Terminal](https://github.com/ntno/mkdocs-terminal) 主题）：文档正文

在线访问：

| 站点 | 地址 |
| --- | --- |
| Terminal 首页 | https://dezliu.github.io/note/ |
| 知识库 | https://dezliu.github.io/note/docs/ |

## 环境要求

- Python 3.9+
- Node.js 20+
- [uv](https://github.com/astral-sh/uv)（推荐）或 pip

## 安装

```bash
# 1. 知识库（Python）
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
# 或使用 pip
# python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

# 2. Terminal 首页（Node.js）
cd landing
npm install
cd ..
```

## 本地启动

两个站点分别启动，互不影响：

```bash
# Terminal 首页：http://localhost:4321/note
cd landing
npm run dev

# 知识库：http://127.0.0.1:8000
source .venv/bin/activate
mkdocs serve
```

> `npm run dev` 会先执行 `scripts/build-fs.js`，扫描 `docs/` 目录生成终端用的虚拟文件系统（`landing/src/data/fileSystem.json`），新增文档后重启 dev server 即可在终端中浏览。

## 构建静态站点

```bash
# Terminal 首页：产物在 landing/dist/
cd landing && npm run build && cd ..

# 知识库：产物在 site-docs/（mkdocs.yml 中 site_dir 指定）
mkdocs build
```

## 发布到 GitHub Pages

公开仓库使用 GitHub Pages **免费**（含免费额度内的 GitHub Actions 构建分钟数）。

### 访问地址怎么来的

GitHub 对「用户/组织下的项目仓库」使用固定规则生成站点地址：

```text
https://<GitHub用户名>.github.io/<仓库名>/
```

对本仓库即 `https://dezliu.github.io/note/`。两个子站的路径分配：

- Terminal 首页占用根路径 `/note/`（Astro 的 `base: '/note'`，见 `landing/astro.config.mjs`）
- 知识库占用 `/note/docs/`（`mkdocs.yml` 的 `site_url`）

若将来改仓库名或换用户名，需同步更新这两处配置。

### 自动部署怎么工作

Workflow（`.github/workflows/deploy-pages.yml`）在同一次构建中完成双站合并部署：

1. 推送代码到 `main`（或在 Actions 里手动触发 `Deploy to GitHub Pages`）
2. Node.js 构建 Terminal 首页：`cd landing && npm install && npm run build`，产物复制到 `_site/`
3. Python 构建知识库：`mkdocs build --strict`，产物复制到 `_site/docs/`
4. 将合并后的 `_site/` 发布到 GitHub Pages
5. 稍等片刻后访问 https://dezliu.github.io/note/

### 首次开启（只需一次）

1. 打开 https://github.com/dezliu/note/settings/pages
2. **Source** 选择 **GitHub Actions**
3. 推送后到 https://github.com/dezliu/note/actions 确认部署成功
4. 访问 https://dezliu.github.io/note/

## 目录结构

```text
.
├── .github/workflows/ # GitHub Pages 双站合并部署
├── docs/              # 知识库源文件（按文件夹组织）
│   ├── index.md       # 首页（目录由 hook 自动生成）
│   ├── java/          # 示例：Java 目录（可再嵌套子目录）
│   └── ai/            # 示例：AI 目录
├── landing/           # Terminal 首页（Astro + terminal-portfolio）
│   ├── profile.config.ts   # 个人信息、命令、导航配置
│   ├── scripts/build-fs.js # 扫描 docs/ 生成虚拟文件系统
│   └── src/pages/index.astro # 终端交互主页面
├── hooks/
│   └── folder_toc.py  # 首页可展开目录树
├── mkdocs.yml         # MkDocs 配置（site_dir: site-docs）
├── requirements.txt   # Python 依赖
└── README.md
```

## 写文章

1. 在 `docs/` 下按主题新建文件夹（如 `docs/java/`、`docs/ai/xxx/`）
2. 在文件夹内新增 `.md` 文件；可用 `index.md` 作为该目录概览
3. 在 `mkdocs.yml` 的 `nav` 中按同样层级添加导航项（侧栏用）
4. 首页「目录」会根据文件夹结构自动生成，支持多层展开，无需手写
5. 保存后本地预览会自动热更新；Terminal 首页需重新 `npm run dev` 以刷新虚拟文件系统
