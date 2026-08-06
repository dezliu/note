# 个人笔记

基于 [MkDocs](https://www.mkdocs.org/) + [Terminal](https://github.com/ntno/mkdocs-terminal) 的个人笔记 / 知识库。

在线访问：https://dezliu.github.io/note/

## 环境要求

- Python 3.9+
- [uv](https://github.com/astral-sh/uv)（推荐）或 pip

## 安装

```bash
# 使用 uv（推荐）
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt

# 或使用 pip
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 本地预览

```bash
source .venv/bin/activate
mkdocs serve
```

访问 http://127.0.0.1:8000

## 构建静态站点

```bash
mkdocs build
```

产物输出到 `site/` 目录。

## 发布到 GitHub Pages

公开仓库使用 GitHub Pages **免费**（含免费额度内的 GitHub Actions 构建分钟数）。本仓库为公开项目站点，无额外费用。

### 访问地址怎么来的

GitHub 对「用户/组织下的项目仓库」使用固定规则生成站点地址：

```text
https://<GitHub用户名>.github.io/<仓库名>/
```

对本仓库即：

```text
https://dezliu.github.io/note/
```

该地址写在 `mkdocs.yml` 的 `site_url` 中，构建时会据此生成正确的链接与资源路径。若将来改仓库名或换用户名，需同步更新 `site_url`。

### 自动部署怎么工作

1. 推送代码到 `main`（或手动在 Actions 里触发 `Deploy MkDocs to GitHub Pages`）
2. Workflow（`.github/workflows/deploy-pages.yml`）安装依赖并执行 `mkdocs build`
3. 将生成的 `site/` 目录发布到 GitHub Pages
4. 稍等片刻后，打开 https://dezliu.github.io/note/ 即可访问

### 首次开启（只需一次）

1. 打开 https://github.com/dezliu/note/settings/pages
2. **Source** 选择 **GitHub Actions**
3. 推送后到 https://github.com/dezliu/note/actions 确认部署成功
4. 访问 https://dezliu.github.io/note/

## 目录结构

```text
.
├── .github/workflows/ # GitHub Pages 自动部署
├── docs/              # 文档源文件
│   ├── index.md       # 首页
│   └── hello-world.md # Hello World 示例
├── mkdocs.yml         # MkDocs 配置
├── requirements.txt   # Python 依赖
└── README.md
```

## 写文章

1. 在 `docs/` 下新增 `.md` 文件
2. 在 `mkdocs.yml` 的 `nav` 中添加导航项
3. 保存后本地预览会自动热更新
