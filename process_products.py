import json
import os
import urllib.request
import re

# Path config
base_path = r'C:\Users\Administrator\.accio\accounts\7087613041\agents\DID-F456DA-47F456DAU1779296-1778-553CBB\project\jewelry-aura-site'
json_path = os.path.join(base_path, 'products.json')
img_dir = os.path.join(base_path, 'assets', 'images', 'products')

# Ensure directories exist
os.makedirs(img_dir, exist_ok=True)

# Load products
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

products = data.get('products', [])

def categorize(title):
    title = title.lower()
    if 'set' in title or '-piece' in title:
        return 'Jewelry Sets'
    if 'necklace' in title or 'choker' in title or 'pendant' in title or 'sweater' in title:
        return 'Necklaces'
    if 'earring' in title or 'ear dangle' in title or 'stud' in title:
        return 'Earrings'
    if 'ring' in title:
        return 'Rings'
    if 'bracelet' in title:
        return 'Bracelets'
    if 'bead' in title or 'material' in title or 'diy' in title or 'accessories' in title:
        return 'DIY & Materials'
    return 'Fine Jewelry'

updated_products = []
total = len(products)

print(f"Starting processing of {total} products...")

for i, p in enumerate(products):
    title = p.get('title', 'Product')
    img_url = p.get('image', '')
    
    # 1. Categorize
    p['category'] = categorize(title)
    
    # 2. Download Image
    if img_url.startswith('http'):
        try:
            # Generate a filename from index or sanitized title
            filename = f"product_{i+1}.jpg"
            save_path = os.path.join(img_dir, filename)
            
            # Simple download
            # We add a header to bypass some basic protections if any
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(save_path, 'wb') as out_file:
                out_file.write(response.read())
            
            # Update path in JSON (relative to root for frontend)
            p['image'] = f"assets/images/products/{filename}"
        except Exception as e:
            print(f"Failed to download {img_url}: {e}")
    
    updated_products.append(p)
    if (i + 1) % 50 == 0:
        print(f"Processed {i+1}/{total}...")

# Save updated JSON
data['products'] = updated_products
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Processing complete. JSON updated and images saved locally.")
