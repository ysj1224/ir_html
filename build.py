import os

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, 'template.html')
    index_path = os.path.join(base_dir, 'index.html')
    slides_dir = os.path.join(base_dir, 'slides')

    if not os.path.exists(template_path):
        print("Error: template.html not found! Run split.js first to initialize.")
        return

    if not os.path.exists(slides_dir):
        print("Error: slides directory not found!")
        return

    # Read template
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()

    # Read and sort slides
    slide_files = sorted([f for f in os.listdir(slides_dir) if f.endswith('.html')])
    print(f"Found {len(slide_files)} slides to merge...")

    slides_contents = []
    for file_name in slide_files:
        print(f"Reading: {file_name}")
        file_path = os.path.join(slides_dir, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            slides_contents.append(f.read().strip())

    slides_content = '\n\n    '.join(slides_contents)

    # Replace placeholder
    placeholder = '<!-- SLIDES_PLACEHOLDER -->'
    if placeholder not in template:
        print("Error: template.html does not contain <!-- SLIDES_PLACEHOLDER -->")
        return

    merged_content = template.replace(placeholder, slides_content)

    # Write to index.html
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(merged_content)
    
    print("Successfully built index.html!")

if __name__ == '__main__':
    main()
