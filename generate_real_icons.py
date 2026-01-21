import base64
import os

def convert_to_base64(filepath):
    with open(filepath, 'rb') as f:
        data = f.read()
    ext = os.path.splitext(filepath)[1].lower()
    mime_type = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
    }.get(ext, 'application/octet-stream')
    
    base64_str = base64.b64encode(data).decode('utf-8')
    return f'data:{mime_type};base64,{base64_str}'

# Essential icons from the tools object
essential_icons = {
    'ADD_MARKS_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/All Tools Icon Box/add marks.png',
    'MARK_CORRECT_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/All Tools Icon Box/marr correct.png',
    'MARK_INCORRECT_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/All Tools Icon Box/mark incorrect.png',
    'PENCIL_TOOL_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/All Tools Icon Box/pencil.png',
    'TEXT_TOOL_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/All Tools Icon Box/text tool.png',
    'DRAW_LINE_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/All Tools Icon Box/draw line.png',
    'DRAW_BOX_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/All Tools Icon Box/draw box.png',
    'TOOL_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/Tool Icon/Tool Icon.png',
    'TOTAL_MARKS_ICON': 'c:/Users/ABC/OneDrive/Perfect Student Evaluation System/osm_app/media/Tool Icon/Total Marks.png'
}

print('// ========== BASE64 ICON CONSTANTS ==========')
for name, path in essential_icons.items():
    try:
        base64_data = convert_to_base64(path)
        # Split long strings to avoid command line issues
        if len(base64_data) > 1000:
            print(f'const {name} = "{base64_data[:500]}..."; // TRUNCATED for display')
        else:
            print(f'const {name} = "{base64_data}";')
        print()
    except Exception as e:
        print(f'// Error converting {name}: {e}')
        print()
