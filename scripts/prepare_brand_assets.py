from pathlib import Path
from PIL import Image, ImageChops

root = Path('/home/ubuntu/webdev-static-assets/brand-fix')
logo = Image.open(root / 'ProfoundIQLogo2.png').convert('RGBA')
white = Image.new('RGBA', logo.size, (255, 255, 255, 255))
diff = ImageChops.difference(logo, white).convert('L')
bbox = diff.point(lambda value: 255 if value > 12 else 0).getbbox()
if not bbox:
    raise RuntimeError('Could not find non-white logo artwork')
left, top, right, bottom = bbox
pad = 28
left, top = max(0, left - pad), max(0, top - pad)
right, bottom = min(logo.width, right + pad), min(logo.height, bottom + pad)
header = logo.crop((left, top, right, bottom)).convert('RGB')
header.save(root / 'ProfoundIQLogo-header.jpg', quality=94, optimize=True)

# The emblem occupies the upper portion of the supplied lockup. Keep a clean square
# with the original white background for broad favicon compatibility.
emblem = logo.crop((300, 160, 724, 590)).convert('RGB')
side = max(emblem.size)
canvas = Image.new('RGB', (side, side), 'white')
canvas.paste(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2))
emblem = canvas.resize((256, 256), Image.Resampling.LANCZOS)
emblem.save(root / 'ProfoundIQ-favicon.png', optimize=True)
Path('/home/ubuntu/profound-iq-consulting/client/public').mkdir(parents=True, exist_ok=True)
emblem.save('/home/ubuntu/profound-iq-consulting/client/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

hero = Image.open(root / 'profound-hero-f95.webp').convert('RGB')
hero.save(root / 'profound-hero-f95a7f36.webp', 'WEBP', quality=88, method=6)

print('Prepared:', *(path.name for path in root.glob('ProfoundIQLogo-header.jpg')), *(path.name for path in root.glob('ProfoundIQ-favicon.png')), *(path.name for path in root.glob('profound-hero-f95a7f36.webp')))
print('Logo bbox:', bbox, 'header size:', header.size, 'favicon size:', emblem.size, 'hero size:', hero.size)
