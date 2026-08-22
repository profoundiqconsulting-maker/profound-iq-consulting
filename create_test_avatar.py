from PIL import Image, ImageDraw
image = Image.new('RGB', (320, 240), '#16243d')
draw = ImageDraw.Draw(image)
draw.ellipse((84, 44, 236, 196), fill='#c9a34e')
draw.text((145, 90), 'P', fill='#16243d')
image.save('/home/ubuntu/profound-iq-consulting/test-avatar.png', format='PNG')
