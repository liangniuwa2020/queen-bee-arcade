import sys
import os
from pathlib import Path

# Add current dir
base_dir = Path(__file__).resolve().parent
index_path = base_dir / "index.html"

def launch_app():
    try:
        import webview
        window = webview.create_window(
            title="经典街机八线机 - 女王蜂 (QUEEN BEE / SUBSINO)",
            url=index_path.as_uri(),
            width=1040,
            height=860,
            resizable=True,
            min_size=(800, 680)
        )
        webview.start(debug=False)
    except ImportError:
        # Fallback to default browser
        import webbrowser
        print(f"[*] 正在通过默认浏览器打开游戏: {index_path}")
        webbrowser.open(index_path.as_uri())

if __name__ == "__main__":
    launch_app()
