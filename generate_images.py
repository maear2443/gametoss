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

def create_character_image(character, color_name, output_path):
    """Create a simple character image with emoji"""
    color = COLORS[color_name]

    # Create image with transparency
    img = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw background rounded rectangle
    # Convert hex to RGB
    r = int(color[1:3], 16)
    g = int(color[3:5], 16)
    b = int(color[5:7], 16)

    # Draw rounded rectangle background
    draw.rounded_rectangle(
        [(2, 2), (WIDTH-2, HEIGHT-2)],
        radius=8,
        fill=(r, g, b, 255),
        outline=(255, 255, 255, 100),
        width=2
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
    # Create images for each character and color
    for color_name in ['red', 'blue']:
        color_dir = f'assets/images/{color_name}'
        os.makedirs(color_dir, exist_ok=True)

        for character in CHARACTERS:
            output_path = f'{color_dir}/{character}.png'
            create_character_image(character, color_name, output_path)

    print("\nAll placeholder images created successfully!")
    print("You can replace these with your own custom character images.")

if __name__ == '__main__':
    main()
