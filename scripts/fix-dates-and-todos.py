#!/usr/bin/env python3
"""Remove placeholder dates and TODO(owner) comments from all MDX articles."""
import os
import glob

articles_dir = "content/articles"
mdx_files = sorted(glob.glob(os.path.join(articles_dir, "*.mdx")))
print(f"Found {len(mdx_files)} MDX files")

fixed_count = 0
total_removed = 0

for f in mdx_files:
    with open(f, "r") as fh:
        content = fh.read()

    lines = content.split("\n")
    new_lines = []
    removed = 0

    for line in lines:
        stripped = line.strip()
        # Remove publishedAt/updatedAt placeholder lines (wherever they appear)
        if stripped == 'publishedAt: "2026-11-21"' or stripped == 'updatedAt: "2026-11-21"':
            removed += 1
            continue
        # Remove all # TODO(owner): lines
        if stripped.startswith("# TODO(owner):"):
            removed += 1
            continue
        new_lines.append(line)

    if removed > 0:
        with open(f, "w") as fh:
            fh.write("\n".join(new_lines))
        fixed_count += 1
        total_removed += removed
        print(f"  {os.path.basename(f)}: removed {removed} line(s)")

print(f"\nDone: {fixed_count} files modified, {total_removed} lines removed")