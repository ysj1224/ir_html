import os
import sys
import time

base_dir = os.path.dirname(os.path.abspath(__file__))
template_path = os.path.join(base_dir, 'template.html')
index_path = os.path.join(base_dir, 'index.html')
slides_dir = os.path.join(base_dir, 'slides')

def build():
    try:
        if not os.path.exists(template_path):
            print("Error: template.html not found! Run split.js first to initialize.")
            return False

        if not os.path.exists(slides_dir):
            print("Error: slides directory not found!")
            return False

        # Read template
        with open(template_path, 'r', encoding='utf-8') as f:
            template = f.read()

        # Read and sort slides
        slide_files = sorted([f for f in os.listdir(slides_dir) if f.endswith('.html')])

        slides_contents = []
        for file_name in slide_files:
            file_path = os.path.join(slides_dir, file_name)
            with open(file_path, 'r', encoding='utf-8') as f:
                slides_contents.append(f.read().strip())

        slides_content = '\n\n    '.join(slides_contents)

        # Replace placeholder
        placeholder = '<!-- SLIDES_PLACEHOLDER -->'
        if placeholder not in template:
            print("Error: template.html does not contain <!-- SLIDES_PLACEHOLDER -->")
            return False

        merged_content = template.replace(placeholder, slides_content)

        # Write to index.html
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(merged_content)
        
        current_time = time.strftime('%H:%M:%S', time.localtime())
        print(f"[{current_time}] Built index.html successfully!")
        return True
    except Exception as e:
        print("Build failed:", e)
        return False

def get_mtimes():
    # Return dictionary of filenames and their last modified times
    mtimes = {}
    if os.path.exists(template_path):
        mtimes[template_path] = os.path.getmtime(template_path)
    if os.path.exists(slides_dir):
        for file_name in os.listdir(slides_dir):
            if file_name.endswith('.html'):
                file_path = os.path.join(slides_dir, file_name)
                mtimes[file_path] = os.path.getmtime(file_path)
    return mtimes

def main():
    # Initial build
    build()

    # Check watch argument
    args = sys.argv[1:]
    if '--watch' in args or 'watch' in args or '-w' in args:
        print("👀 Watching for changes in template.html and slides/... (Press Ctrl+C to stop)")
        
        last_mtimes = get_mtimes()
        try:
            while True:
                time.sleep(0.5)
                current_mtimes = get_mtimes()
                
                # Check for changes
                changed = False
                if len(current_mtimes) != len(last_mtimes):
                    changed = True
                else:
                    for path, mtime in current_mtimes.items():
                        if path not in last_mtimes or mtime != last_mtimes[path]:
                            changed = True
                            break
                
                if changed:
                    print("🔄 Change detected. Rebuilding...")
                    build()
                    last_mtimes = current_mtimes
        except KeyboardInterrupt:
            print("\nStopped watching.")

if __name__ == '__main__':
    main()
