from pathlib import Path
from PIL import Image

source = Path('/tmp/profound-logo.jpg')
out_dir = Path('/home/ubuntu/webdev-static-assets')
out_dir.mkdir(parents=True, exist_ok=True)
output = out_dir / 'profound-iq-logo.webp'

with Image.open(source) as image:
    image = image.convert('RGB')
    image.save(output, 'WEBP', quality=88, method=6)

print(output)
print(f'{source.stat().st_size} -> {output.stat().st_size} bytes')
