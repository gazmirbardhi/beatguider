#!/usr/bin/env python3
"""Change author from 'BeatGuider Team' to 'dj mondi' in all MDX articles."""
import os
import glob

articles_dir = "content/articles"
mdx_files = sorted(glob.glob(os.path.join(articles_dir, "*.mdx")))
print(f"Found {len(mdx_files)} MDX files")

fixed_count = 0
for f in mdx_files:
    with open(f, "r") as fh:
        content = fh.read()
    
    if 'author: "BeatGuider Team"' in content:
        content = content.replace('author: "BeatGuider Team"', 'author: "dj mondi"')
        with open(f, "w") as fh:
            fh.write(content)
        fixed_count += 1
        print(f"  {os.path.basename(f)}: author updated")

print(f"\nDone: {fixed_count} files updated")