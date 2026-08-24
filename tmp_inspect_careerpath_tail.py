from pathlib import Path
p=Path('/home/ubuntu/profound-iq-consulting/client/src/pages/CareerPath.tsx')
for n,line in enumerate(p.read_text().splitlines(),1):
    if 120 <= n <= 141:
        print(f'{n}: {line}')
