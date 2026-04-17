# Cover Image Downloader

This script downloads free, commercial-use stock photos for EventRadius event cover images.

## Features

- ✅ Downloads from **Unsplash** and **Pexels** (free, no attribution required)
- ✅ Auto-resizes images to 1200x630px (optimal for social sharing)
- ✅ Converts to WebP format for fast loading
- ✅ Organizes by category: general, social, professional, arts, sports, food, wellness, tech
- ✅ 40+ pre-curated high-quality images included
- ✅ Optional API search for custom images

## Quick Start

### 1. Install Dependencies

```bash
cd scripts
pip install requests Pillow
```

### 2. Download Images (No API Key Needed)

```bash
# Download all curated images from both sources (40+ images)
python download_cover_images.py --batch-download
```

Images will be saved to `../frontend/public/cover-images/` organized by category.

### 3. Verify Download

```bash
ls -la ../frontend/public/cover-images/
```

You should see subdirectories: `general/`, `social/`, `professional/`, `arts/`, `food/`, `wellness/`, `tech/`

## Usage Examples

### Download Only Unsplash Images
```bash
python download_cover_images.py --source unsplash --batch-download
```

### Download Only Pexels Images
```bash
python download_cover_images.py --source pexels --batch-download
```

### Search for Custom Images (Requires API Key)

**Get free API keys:**
- Unsplash: https://unsplash.com/developers
- Pexels: https://www.pexels.com/api/

```bash
# Search Unsplash for yoga images
python download_cover_images.py --source unsplash --search "yoga class" --count 5 --unsplash-key YOUR_KEY

# Search Pexels for food events
python download_cover_images.py --source pexels --search "food party" --count 5 --pexels-key YOUR_KEY
```

### Custom Output Directory
```bash
python download_cover_images.py --output ./my-images --batch-download
```

### Skip Image Optimization
```bash
python download_cover_images.py --batch-download --no-optimize
```

## Image Categories

| Category | Description | Use Case |
|----------|-------------|----------|
| `general` | Generic events, gatherings | Any event type |
| `social` | Parties, nightlife, celebrations | Social meetups |
| `professional` | Business meetings, conferences | Corporate events |
| `arts` | Music, exhibitions, performances | Cultural events |
| `sports` | Fitness, games, outdoor | Athletic events |
| `food` | Dining, cooking, tastings | Food events |
| `wellness` | Yoga, meditation, health | Wellness activities |
| `tech` | Hackathons, tech meetups | Technology events |

## Output Structure

```
frontend/public/cover-images/
├── general/
│   ├── community-gathering.webp
│   ├── event-space.webp
│   └── conference-hall.webp
├── social/
│   ├── party-crowd.webp
│   └── night-party.webp
├── professional/
│   ├── business-meeting.webp
│   └── team-meeting.webp
└── ... (other categories)
```

## Technical Details

### Image Specifications
- **Resolution**: 1200x630px (16:9 ratio, optimal for social cards)
- **Format**: WebP (with JPEG fallback option)
- **Quality**: 85% (balance of size and quality)
- **Average Size**: ~50-150 KB per image

### Licensing
All images downloaded are under:
- **Unsplash License**: Free for commercial use, no attribution required
- **Pexels License**: Free for commercial use, no attribution required

**What you CAN do:**
- Use on your platform as cover image gallery
- Modify, resize, crop
- Use commercially without royalties
- Display to users for event creation

**What you CANNOT do:**
- Resell raw images as stock photos
- Compile them to replicate Unsplash/Pexels

## Frontend Integration

### React Component Example

```typescript
// CoverImageGallery.tsx
const categories = ['general', 'social', 'professional', 'arts', 'sports', 'food', 'wellness', 'tech'];

const CoverImageGallery = ({ onSelect }: { onSelect: (url: string) => void }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {categories.map(cat => (
        <div key={cat}>
          <h3>{cat}</h3>
          {images[cat].map(img => (
            <img 
              src={`/cover-images/${cat}/${img}`}
              onClick={() => onSelect(`/cover-images/${cat}/${img}`)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
```

### Next.js Static Files

Images are saved to `public/cover-images/` so they're automatically served:

```
https://yourdomain.com/cover-images/general/community-gathering.webp
```

## Troubleshooting

### "Pillow not installed" warning
```bash
pip install Pillow
```

### Permission denied
```bash
chmod +x download_cover_images.py
```

### Network errors / 403 Forbidden
- The script uses browser-like User-Agent headers
- If still blocked, images may need manual download
- Alternative: Use API keys for more reliable access

### Large file sizes
Images are automatically optimized. To skip optimization:
```bash
python download_cover_images.py --batch-download --no-optimize
```

## Alternative: Manual Download

If the script doesn't work, manually download from:

1. **Unsplash**: https://unsplash.com/s/photos/event
2. **Pexels**: https://www.pexels.com/search/event/

Download ~40 images and organize in the category folders.

## Count Estimates

| Source | Curated Images | Categories |
|--------|----------------|------------|
| Unsplash | ~35 | All 8 categories |
| Pexels | ~10 | Partial coverage |
| **Total** | **~45** | Good coverage |

## Next Steps After Download

1. ✅ Run the script: `python download_cover_images.py --batch-download`
2. ✅ Review images in each category
3. ✅ Delete any that don't match your brand
4. ✅ Test frontend gallery component
5. ✅ Deploy with images in `public/cover-images/`

---

**Cost**: $0 (all images are free commercial use)
**Time**: ~5 minutes to download 40+ images
**Legal Risk**: Minimal (all images have permissive licenses)
