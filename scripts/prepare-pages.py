from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
source = root / "dist/client"
assert (source / "index.html").exists(), "Build the website first"
target = root / "docs"
if target.exists():
    shutil.rmtree(target)
shutil.copytree(source, target)
(target / ".nojekyll").touch()
print("Prepared GitHub Pages output in docs/")
