"""按 docs/ 文件夹结构，为首页生成可展开目录树。"""

from __future__ import annotations

import re
from pathlib import Path

MARKER = "<!-- folder-toc -->"
SKIP_DIR_NAMES = {
    "assets",
    "stylesheets",
    "javascripts",
    "images",
    "css",
    "js",
    "img",
}


def _title_from_md(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    for line in text.splitlines():
        match = re.match(r"^#\s+(.+?)(?:\s+\{#.*\})?\s*$", line.strip())
        if match:
            return match.group(1).strip()
    return path.stem.replace("-", " ").replace("_", " ")


def _rel_link(path: Path, docs_dir: Path) -> str:
    return path.relative_to(docs_dir).as_posix()


def _iter_subdirs(dir_path: Path) -> list[Path]:
    return sorted(
        (
            child
            for child in dir_path.iterdir()
            if child.is_dir()
            and not child.name.startswith(".")
            and child.name not in SKIP_DIR_NAMES
        ),
        key=lambda path: path.name.lower(),
    )


def _iter_pages(dir_path: Path) -> list[Path]:
    return sorted(
        (
            child
            for child in dir_path.iterdir()
            if child.is_file() and child.suffix == ".md" and child.name != "index.md"
        ),
        key=lambda path: path.name.lower(),
    )


def _indent(text: str, spaces: int) -> str:
    prefix = " " * spaces
    return "\n".join(prefix + line if line else line for line in text.splitlines())


def _collect_entries(dir_path: Path, docs_dir: Path, depth: int = 0) -> list[str]:
    """递归收集目录条目，返回扁平的 markdown 列表行列表。"""
    entries: list[str] = []
    indent = "    " * depth

    # 当前目录的 index.md → 概览链接
    index_path = dir_path / "index.md"
    if index_path.exists():
        entries.append(f"{indent}- [概览]({_rel_link(index_path, docs_dir)})")

    # 当前目录下的 .md 页面（排除 index.md）
    for page in _iter_pages(dir_path):
        entries.append(f"{indent}- [{_title_from_md(page)}]({_rel_link(page, docs_dir)})")

    # 子目录 → 粗体标题 + 递归
    for subdir in _iter_subdirs(dir_path):
        sub_index = subdir / "index.md"
        title = _title_from_md(sub_index) if sub_index.exists() else subdir.name
        entries.append(f"{indent}- **{title}**")
        entries.extend(_collect_entries(subdir, docs_dir, depth=depth + 1))

    return entries


def _render_folder(dir_path: Path, docs_dir: Path, depth: int = 0) -> str:
    index_path = dir_path / "index.md"
    title = _title_from_md(index_path) if index_path.exists() else dir_path.name

    lines = _collect_entries(dir_path, docs_dir, depth=0)
    if not lines:
        return ""

    body = "\n".join(lines)
    block = "\n".join(
        [
            '<details markdown="1">',
            f"<summary><strong>{title}</strong></summary>",
            "",
            body,
            "",
            "</details>",
        ]
    )
    return block


def _render_root_toc(docs_dir: Path) -> str:
    parts: list[str] = []

    for subdir in _iter_subdirs(docs_dir):
        folder = _render_folder(subdir, docs_dir)
        if folder:
            parts.append(folder)

    root_pages = [
        f"- [{_title_from_md(page)}]({_rel_link(page, docs_dir)})"
        for page in _iter_pages(docs_dir)
    ]
    if root_pages:
        parts.append("\n".join(root_pages))

    if not parts:
        return "_暂无笔记，在 `docs/` 下新建文件夹与 Markdown 即可出现在这里。_"

    return "\n\n".join(parts)


def on_page_markdown(markdown: str, page, config, files) -> str:
    if page.file.src_uri != "index.md":
        return markdown
    if MARKER not in markdown:
        return markdown

    docs_dir = Path(config["docs_dir"])
    toc = _render_root_toc(docs_dir)
    return markdown.replace(MARKER, toc)
