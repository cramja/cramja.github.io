import json
from yaml import load, dump
try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper

with open('reading.md') as f:
    lines = f.readlines()

lines = lines[6:]
year = 0
books = []
for line in lines:
    line = line.strip()
    if line.startswith("## ["):
        year = int(line[4:8])
    elif line.startswith("## "):
        year = int(line[3:])
    elif len(line) > 0:
        parts = line.split(" - ")
        books.append({'date': f'{year}-01-01', 'title': parts[0], 'author': parts[1]})

print(dump(books, default_flow_style=False))