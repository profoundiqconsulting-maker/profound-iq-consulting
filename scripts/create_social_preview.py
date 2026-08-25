from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

source = Path('/home/ubuntu/webdev-static-assets/brand-fix/ProfoundIQLogo2.png')
output = Path('/home/ubuntu/webdev-static-assets/brand-fix/profound-iq-social-preview.png')
canvas = Image.new('RGB', (1200, 630), '#101d35')
draw = ImageDraw.Draw(canvas)
for x in range(1200):
    shade = int(16 + (x / 1200) * 10)
    draw.line((x, 0, x, 630), fill=(shade, 29, 53))
draw.rectangle((0, 0, 18, 630), fill='#c9a34e')
draw.line((70, 500, 1080, 88), fill='#c9a34e', width=5)
try:
    serif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
    sans = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    title_font = ImageFont.truetype(serif, 72)
    body_font = ImageFont.truetype(sans, 26)
    label_font = ImageFont.truetype(sans, 18)
except OSError:
    title_font = body_font = label_font = ImageFont.load_default()
if source.exists():
    logo = Image.open(source).convert('RGBA')
    logo.thumbnail((270, 150), Image.Resampling.LANCZOS)
    logo_card = Image.new('RGBA', (300, 180), '#f7f3e8')
    logo_card.alpha_composite(logo, ((300 - logo.width) // 2, (180 - logo.height) // 2))
    canvas.paste(logo_card.convert('RGB'), (820, 64))
draw.text((86, 84), 'PROFOUND IQ CONSULTING', fill='#c9a34e', font=label_font)
draw.text((86, 172), 'Clarity is a', fill='#f7f3e8', font=title_font)
draw.text((86, 260), 'capability.', fill='#c9a34e', font=title_font)
draw.text((90, 386), 'Transformational learning, consulting, and psychometric insight.', fill='#d4dbe5', font=body_font)
draw.text((90, 548), 'profoundiqconsulting.com', fill='#f7f3e8', font=label_font)
output.parent.mkdir(parents=True, exist_ok=True)
canvas.save(output, format='PNG', optimize=True)
print(output)
