#!/usr/bin/env python3
"""
Generate placeholder character images for the rhythm game
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not installed. Installing...")
    import subprocess
    subprocess.check_call(['pip3', 'install', 'pillow'])
    from PIL import Image, ImageDraw, ImageFont

import os

# Image settings
WIDTH = 64
HEIGHT = 48
CHARACTERS = ['bear', 'cat', 'rabbit', 'dog', 'fox']
COLORS = {
    'red': '#e53950',
    'blue': '#2b78ff'
}

# Emoji representations
EMOJIS = {
    'bear': '🐻',
    'cat': '🐱',
    'rabbit': '🐰',
    'dog': '🐶',
    'fox': '🦊'
}

def create_character_image(character, color_name, stage, output_path):
    """Create a simple character image with emoji (stage 1, 2, or 3)"""
    color = COLORS[color_name]

    # Create image with transparency
    img = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw background rounded rectangle
    # Convert hex to RGB
    r = int(color[1:3], 16)
    g = int(color[3:5], 16)
    b = int(color[5:7], 16)

    # Stage별로 밝기 조정 (1 = 어두움, 2 = 중간, 3 = 밝음)
    brightness_factor = 0.5 + (stage * 0.25)  # 0.75, 1.0, 1.25
    r = min(255, int(r * brightness_factor))
    g = min(255, int(g * brightness_factor))
    b = min(255, int(b * brightness_factor))

    # Stage별로 테두리 두께 다르게
    outline_width = stage  # 1, 2, 3

    # Draw rounded rectangle background
    draw.rounded_rectangle(
        [(2, 2), (WIDTH-2, HEIGHT-2)],
        radius=8,
        fill=(r, g, b, 255),
        outline=(255, 255, 255, 150),
        width=outline_width
    )

    # Try to add emoji text
    try:
        # Try to find a font that supports emojis
        font_size = 24
        try:
            # Try common emoji fonts
            for font_name in ['/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf',
                             '/System/Library/Fonts/Apple Color Emoji.ttc',
                             'seguiemj.ttf']:
                try:
                    font = ImageFont.truetype(font_name, font_size)
                    break
                except:
                    continue
            else:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()

        emoji = EMOJIS[character]
        # Get text bounding box
        bbox = draw.textbbox((0, 0), emoji, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Center the emoji
        x = (WIDTH - text_width) // 2 - bbox[0]
        y = (HEIGHT - text_height) // 2 - bbox[1]

        draw.text((x, y), emoji, font=font, fill=(255, 255, 255, 255))
    except Exception as e:
        # Fallback: just draw the character name
        font = ImageFont.load_default()
        text = character[:3].upper()
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (WIDTH - text_width) // 2 - bbox[0]
        y = (HEIGHT - text_height) // 2 - bbox[1]
        draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))

    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created: {output_path}")

def main():
    # Create images for each character, color, and stage
    for color_name in ['red', 'blue']:
        color_dir = f'assets/images/{color_name}'
        os.makedirs(color_dir, exist_ok=True)

        for character in CHARACTERS:
            for stage in [1, 2, 3]:
                output_path = f'{color_dir}/{character}_stage{stage}.png'
                create_character_image(character, color_name, stage, output_path)

    print("\nAll placeholder images created successfully!")
    print("Stage 1: 어두움 (얇은 테두리)")
    print("Stage 2: 중간 밝기 (중간 테두리)")
    print("Stage 3: 밝음 (두꺼운 테두리)")
    print("\nYou can replace these with your own custom character images.")

if __name__ == '__main__':
    main()
