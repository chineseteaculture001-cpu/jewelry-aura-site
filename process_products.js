const fs = require('fs');
const path = require('path');
const https = require('https');

const base_path = 'C:\\Users\\Administrator\\.accio\\accounts\\7087613041\\agents\\DID-F456DA-47F456DAU1779296-1778-553CBB\\project\\jewelry-aura-site';
const json_path = path.join(base_path, 'products.json');
const img_dir = path.join(base_path, 'assets', 'images', 'products');

// Ensure directories exist
if (!fs.existsSync(img_dir)) {
    fs.mkdirSync(img_dir, { recursive: true });
}

// Load products
const data = JSON.parse(fs.readFileSync(json_path, 'utf8'));
const products = data.products || [];

function categorize(title) {
    const t = title.toLowerCase();
    if (t.includes('set') || t.includes('-piece')) return 'Jewelry Sets';
    if (t.includes('necklace') || t.includes('choker') || t.includes('pendant') || t.includes('sweater')) return 'Necklaces';
    if (t.includes('earring') || t.includes('ear dangle') || t.includes('stud')) return 'Earrings';
    if (t.includes('ring')) return 'Rings';
    if (t.includes('bracelet')) return 'Bracelets';
    if (t.includes('bead') || t.includes('material') || t.includes('diy') || t.includes('accessories')) return 'DIY & Materials';
    return 'Fine Jewelry';
}

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Status Code: ${response.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function process() {
    console.log(`Starting processing of ${products.length} products...`);
    
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        p.category = categorize(p.title);
        
        if (p.image && p.image.startsWith('http')) {
            const filename = `product_${i + 1}.jpg`;
            const dest = path.join(img_dir, filename);
            
            try {
                await downloadImage(p.image, dest);
                p.image = `assets/images/products/${filename}`;
            } catch (err) {
                console.error(`Failed to download ${p.image}: ${err.message}`);
            }
        }
        
        if ((i + 1) % 50 === 0) {
            console.log(`Processed ${i + 1}/${products.length}...`);
        }
    }
    
    fs.writeFileSync(json_path, JSON.stringify(data, null, 2), 'utf8');
    console.log("Processing complete. JSON updated and images saved locally.");
}

process();
