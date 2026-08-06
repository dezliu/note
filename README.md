# 日志系统

基于 [MkDocs](https://www.mkdocs.org/) + [Material](https://squidfunk.github.io/mkdocs-material/) 的个人日志 / 知识库。

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

## 目录结构

```text
.
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
