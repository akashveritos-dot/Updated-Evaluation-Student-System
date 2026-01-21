#!/usr/bin/env python3
"""
Generate a simple favicon.ico file
"""

from PIL import Image, ImageDraw
import os

def create_favicon():
    # Create a 16x16 image with a simple design
    size = 16
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))  # Transparent background
    draw = ImageDraw.Draw(img)
    
    # Draw a simple circle with gradient effect
    draw.ellipse([2, 2, 14, 14], fill=(70, 130, 180, 255))  # Steel blue circle
    draw.ellipse([4, 4, 12, 12], fill=(100, 149, 237, 255))  # Cornflower blue inner circle
    
    # Add a small white dot in the center
    draw.ellipse([7, 7, 9, 9], fill=(255, 255, 255, 255))
    
    # Save as ICO file
    img.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("Favicon created successfully!")

if __name__ == "__main__":
    create_favicon()
