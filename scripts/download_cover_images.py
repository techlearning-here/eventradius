#!/usr/bin/env python3
"""
Cover Image Downloader for EventRadius

Downloads free stock photos from Unsplash and Pexels for use as event cover images.
All images are free for commercial use with no attribution required.

Requirements:
    pip install requests Pillow

Usage:
    python download_cover_images.py --source unsplash --category event --count 10
    python download_cover_images.py --source pexels --category party --count 5
    python download_cover_images.py --batch-download

License: Images downloaded are under Unsplash License / Pexels License (free commercial use)
"""

import os
import sys
import argparse
import requests
import json
import time
from pathlib import Path
from urllib.parse import urlparse
from typing import List, Dict, Optional

# Try to import PIL for image processing
try:
    from PIL import Image
    from io import BytesIO
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("Warning: Pillow not installed. Images won't be resized/optimized.")
    print("Install with: pip install Pillow")


class CoverImageDownloader:
    """Downloads and manages cover images from free stock photo sources."""
    
    def __init__(self, output_dir: str = "../frontend/public/cover-images"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create category subdirectories
        self.categories = [
            "general", "social", "professional", "arts", 
            "sports", "food", "wellness", "tech"
        ]
        for cat in self.categories:
            (self.output_dir / cat).mkdir(exist_ok=True)
        
        # Statistics
        self.downloaded = 0
        self.failed = 0
    
    def _optimize_image(self, image_data: bytes, target_size: tuple = (1200, 630)) -> bytes:
        """Resize and optimize image for web use."""
        if not PIL_AVAILABLE:
            return image_data
        
        try:
            img = Image.open(BytesIO(image_data))
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Calculate aspect ratio
            target_ratio = target_size[0] / target_size[1]
            img_ratio = img.width / img.height
            
            if img_ratio != target_ratio:
                # Crop to target aspect ratio
                if img_ratio > target_ratio:
                    # Image is wider, crop width
                    new_width = int(img.height * target_ratio)
                    left = (img.width - new_width) // 2
                    img = img.crop((left, 0, left + new_width, img.height))
                else:
                    # Image is taller, crop height
                    new_height = int(img.width / target_ratio)
                    top = (img.height - new_height) // 2
                    img = img.crop((0, top, img.width, top + new_height))
            
            # Resize
            img = img.resize(target_size, Image.Resampling.LANCZOS)
            
            # Save to bytes with WebP format
            output = BytesIO()
            img.save(output, format='WEBP', quality=85, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            print(f"  Warning: Could not optimize image: {e}")
            return image_data
    
    def _save_image(self, url: str, category: str, filename: str) -> bool:
        """Download and save a single image."""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30, stream=True)
            response.raise_for_status()
            
            # Read image data
            image_data = response.content
            
            # Optimize if possible
            if PIL_AVAILABLE and len(image_data) > 0:
                image_data = self._optimize_image(image_data)
                ext = '.webp'
            else:
                # Keep original format
                content_type = response.headers.get('content-type', '')
                if 'jpeg' in content_type or 'jpg' in content_type:
                    ext = '.jpg'
                elif 'png' in content_type:
                    ext = '.png'
                elif 'webp' in content_type:
                    ext = '.webp'
                else:
                    ext = '.jpg'
            
            # Save file
            filepath = self.output_dir / category / f"{filename}{ext}"
            with open(filepath, 'wb') as f:
                f.write(image_data)
            
            size_kb = len(image_data) / 1024
            print(f"  ✓ Saved: {filepath} ({size_kb:.1f} KB)")
            self.downloaded += 1
            return True
            
        except Exception as e:
            print(f"  ✗ Failed to download {url}: {e}")
            self.failed += 1
            return False


class UnsplashDownloader(CoverImageDownloader):
    """Downloads images from Unsplash."""
    
    BASE_URL = "https://api.unsplash.com"
    
    def __init__(self, access_key: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.access_key = access_key
        
        # Pre-curated high-quality event image URLs
        # These are direct download URLs for specific images
        self.curated_images = {
            "general": [
                ("https://images.unsplash.com/photo-1511632765486-a01980e01a18", "community-gathering"),
                ("https://images.unsplash.com/photo-1523580494863-6f3031224c94", "event-space"),
                ("https://images.unsplash.com/photo-1540575467063-178a50c2df87", "conference-hall"),
                ("https://images.unsplash.com/photo-1492684223066-81342ee5ff30", "stage-event"),
                ("https://images.unsplash.com/photo-1475721027785-f74eccf877e2", "audience"),
            ],
            "social": [
                ("https://images.unsplash.com/photo-1530103862676-de8c9debad1d", "party-crowd"),
                ("https://images.unsplash.com/photo-1514525253161-7a46d19cd819", "night-party"),
                ("https://images.unsplash.com/photo-1519671482749-fd09be4cce9", "friends-toast"),
                ("https://images.unsplash.com/photo-1527529482837-4698179dc6ce", "social-gathering"),
                ("https://images.unsplash.com/photo-1505236858219-8359eb29e329", "celebration"),
            ],
            "professional": [
                ("https://images.unsplash.com/photo-1515187029135-18ee286d815b", "business-meeting"),
                ("https://images.unsplash.com/photo-1556761175-5973dc0f32e7", "team-meeting"),
                ("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4", "workspace"),
                ("https://images.unsplash.com/photo-1552664730-d307ca884978", "collaboration"),
                ("https://images.unsplash.com/photo-1556761175-b413fe77f21c", "office-event"),
            ],
            "arts": [
                ("https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b", "art-gallery"),
                ("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae", "concert"),
                ("https://images.unsplash.com/photo-1501281668745-f7f57925c3b4", "music-festival"),
                ("https://images.unsplash.com/photo-1459749411177-0473ef7161cf", "live-music"),
                ("https://images.unsplash.com/photo-1514533450685-4493e01d1fdc", "exhibition"),
            ],
            "food": [
                ("https://images.unsplash.com/photo-1555244162-803794f237d3", "dinner-party"),
                ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", "restaurant"),
                ("https://images.unsplash.com/photo-1560493676-04071c5f467b", "food-gathering"),
                ("https://images.unsplash.com/photo-1414235077428-338989a2e8c0", "fine-dining"),
            ],
            "wellness": [
                ("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b", "yoga-class"),
                ("https://images.unsplash.com/photo-1506126613408-eca07ce68773", "meditation"),
                ("https://images.unsplash.com/photo-1518611012118-696072aa579a", "fitness"),
                ("https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b", "wellness-event"),
            ],
            "tech": [
                ("https://images.unsplash.com/photo-1504384308090-c894fdcc538d", "hackathon"),
                ("https://images.unsplash.com/photo-1544531586-fde5298cdd40", "tech-meetup"),
                ("https://images.unsplash.com/photo-1531482615713-2afd69097998", "conference-tech"),
                ("https://images.unsplash.com/photo-1504384308090-c894fdcc538d", "workshop"),
            ],
        }
    
    def download_curated(self, optimize: bool = True):
        """Download all curated images."""
        print(f"Downloading curated Unsplash images to {self.output_dir}")
        print("=" * 60)
        
        for category, images in self.curated_images.items():
            print(f"\n[{category.upper()}] - {len(images)} images")
            
            for i, (base_url, name) in enumerate(images, 1):
                # Add parameters for high-res download
                if '?' in base_url:
                    url = f"{base_url}&w=1200&h=630&fit=crop"
                else:
                    url = f"{base_url}?w=1200&h=630&fit=crop"
                
                success = self._save_image(url, category, f"{name}")
                
                if not success and optimize:
                    # Try without optimization parameters
                    success = self._save_image(base_url, category, f"{name}")
                
                # Rate limiting - be nice to Unsplash
                time.sleep(0.5)
        
        self._print_summary()
    
    def search_and_download(self, query: str, count: int = 10):
        """
        Search Unsplash API and download images.
        Note: Requires API key for search functionality.
        """
        if not self.access_key:
            print("Error: Unsplash API key required for search.")
            print("Get one free at: https://unsplash.com/developers")
            print("Then run: python download_cover_images.py --unsplash-key YOUR_KEY")
            return
        
        headers = {
            'Authorization': f'Client-ID {self.access_key}'
        }
        
        url = f"{self.BASE_URL}/search/photos"
        params = {
            'query': query,
            'per_page': count,
            'orientation': 'landscape'
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            print(f"\nSearching Unsplash for '{query}'...")
            print(f"Found {len(data['results'])} images\n")
            
            for i, photo in enumerate(data['results'], 1):
                img_url = photo['urls']['regular']
                filename = f"{query.replace(' ', '-')}-{i}"
                category = self._guess_category(query)
                
                self._save_image(img_url, category, filename)
                time.sleep(0.5)  # Rate limiting
                
        except Exception as e:
            print(f"Search failed: {e}")
    
    def _guess_category(self, query: str) -> str:
        """Guess category from search query."""
        query = query.lower()
        category_map = {
            'party': 'social', 'social': 'social', 'night': 'social',
            'business': 'professional', 'corporate': 'professional', 'meeting': 'professional',
            'art': 'arts', 'music': 'arts', 'concert': 'arts',
            'food': 'food', 'dinner': 'food', 'restaurant': 'food',
            'yoga': 'wellness', 'fitness': 'wellness', 'health': 'wellness',
            'tech': 'tech', 'hackathon': 'tech', 'startup': 'tech',
        }
        
        for key, cat in category_map.items():
            if key in query:
                return cat
        return 'general'
    
    def _print_summary(self):
        """Print download summary."""
        print("\n" + "=" * 60)
        print("DOWNLOAD SUMMARY")
        print("=" * 60)
        print(f"✓ Successfully downloaded: {self.downloaded} images")
        print(f"✗ Failed: {self.failed} images")
        print(f"\nOutput directory: {self.output_dir.absolute()}")
        print("\nCategories:")
        for cat in self.categories:
            cat_dir = self.output_dir / cat
            count = len(list(cat_dir.glob('*')))
            print(f"  - {cat}: {count} images")


class PexelsDownloader(CoverImageDownloader):
    """Downloads images from Pexels."""
    
    BASE_URL = "https://api.pexels.com/v1"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.api_key = api_key
        
        # Pre-curated Pexels image URLs
        self.curated_images = {
            "general": [
                ("https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg", "crowd-event"),
                ("https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg", "festival"),
                ("https://images.pexels.com/photos/1154189/pexels-photo-1154189.jpeg", "event-venue"),
            ],
            "social": [
                ("https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg", "friends-party"),
                ("https://images.pexels.com/photos/2526105/pexels-photo-2526105.jpeg", "social-dance"),
                ("https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg", "nightlife"),
            ],
            "professional": [
                ("https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg", "conference-room"),
                ("https://images.pexels.com/photos/2422290/pexels-photo-2422290.jpeg", "networking"),
                ("https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg", "presentation"),
            ],
        }
    
    def download_curated(self):
        """Download all curated Pexels images."""
        print(f"Downloading curated Pexels images to {self.output_dir}")
        print("=" * 60)
        
        for category, images in self.curated_images.items():
            print(f"\n[{category.upper()}] - {len(images)} images")
            
            for base_url, name in images:
                # Add size parameter
                if '?' in base_url:
                    url = f"{base_url}&auto=compress&cs=tinysrgb&w=1200"
                else:
                    url = f"{base_url}?auto=compress&cs=tinysrgb&w=1200"
                
                self._save_image(url, category, name)
                time.sleep(0.5)
        
        self._print_summary()
    
    def search_and_download(self, query: str, count: int = 10):
        """
        Search Pexels API and download images.
        Note: Requires API key for search functionality.
        """
        if not self.api_key:
            print("Error: Pexels API key required for search.")
            print("Get one free at: https://www.pexels.com/api/")
            print("Then run: python download_cover_images.py --pexels-key YOUR_KEY")
            return
        
        headers = {
            'Authorization': self.api_key
        }
        
        url = f"{self.BASE_URL}/search"
        params = {
            'query': query,
            'per_page': count,
            'orientation': 'landscape'
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            print(f"\nSearching Pexels for '{query}'...")
            print(f"Found {len(data['photos'])} images\n")
            
            for i, photo in enumerate(data['photos'], 1):
                img_url = photo['src']['large']
                filename = f"{query.replace(' ', '-')}-{i}"
                category = self._guess_category(query)
                
                self._save_image(img_url, category, filename)
                time.sleep(0.5)
                
        except Exception as e:
            print(f"Search failed: {e}")
    
    def _guess_category(self, query: str) -> str:
        """Guess category from search query."""
        query = query.lower()
        category_map = {
            'party': 'social', 'social': 'social', 'night': 'social',
            'business': 'professional', 'corporate': 'professional', 'meeting': 'professional',
            'art': 'arts', 'music': 'arts', 'concert': 'arts',
            'food': 'food', 'dinner': 'food', 'restaurant': 'food',
            'yoga': 'wellness', 'fitness': 'wellness', 'health': 'wellness',
            'tech': 'tech', 'hackathon': 'tech', 'startup': 'tech',
        }
        
        for key, cat in category_map.items():
            if key in query:
                return cat
        return 'general'
    
    def _print_summary(self):
        """Print download summary."""
        print("\n" + "=" * 60)
        print("DOWNLOAD SUMMARY")
        print("=" * 60)
        print(f"✓ Successfully downloaded: {self.downloaded} images")
        print(f"✗ Failed: {self.failed} images")
        print(f"\nOutput directory: {self.output_dir.absolute()}")


def main():
    parser = argparse.ArgumentParser(
        description='Download free cover images for EventRadius',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download all curated Unsplash images (no API key needed)
  python download_cover_images.py --source unsplash --batch-download
  
  # Download all curated Pexels images (no API key needed)
  python download_cover_images.py --source pexels --batch-download
  
  # Download both (recommended for MVP)
  python download_cover_images.py --batch-download
  
  # Search Unsplash (requires API key)
  python download_cover_images.py --source unsplash --search "yoga class" --count 5 --unsplash-key YOUR_KEY
  
  # Search Pexels (requires API key)
  python download_cover_images.py --source pexels --search "food event" --count 5 --pexels-key YOUR_KEY
  
  # Custom output directory
  python download_cover_images.py --output ./my-images --batch-download
        """
    )
    
    parser.add_argument('--source', choices=['unsplash', 'pexels', 'both'], 
                        default='both',
                        help='Image source to download from')
    parser.add_argument('--batch-download', action='store_true',
                        help='Download all curated images')
    parser.add_argument('--search', type=str,
                        help='Search query (requires API key)')
    parser.add_argument('--count', type=int, default=10,
                        help='Number of images to download (for search)')
    parser.add_argument('--unsplash-key', type=str,
                        help='Unsplash API key (get at unsplash.com/developers)')
    parser.add_argument('--pexels-key', type=str,
                        help='Pexels API key (get at pexels.com/api)')
    parser.add_argument('--output', type=str, default='../frontend/public/cover-images',
                        help='Output directory for images')
    parser.add_argument('--no-optimize', action='store_true',
                        help='Skip image optimization (resize/convert)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("EventRadius Cover Image Downloader")
    print("=" * 60)
    print(f"Output directory: {args.output}")
    print()
    
    if args.batch_download or (not args.search and not args.batch_download):
        # Download curated images (no API key needed)
        if args.source in ('unsplash', 'both'):
            print("\n" + "=" * 60)
            print("UNSPALSH - Curated Images")
            print("=" * 60)
            unsplash = UnsplashDownloader(
                access_key=args.unsplash_key,
                output_dir=args.output
            )
            unsplash.download_curated(optimize=not args.no_optimize)
        
        if args.source in ('pexels', 'both'):
            print("\n" + "=" * 60)
            print("PEXELS - Curated Images")
            print("=" * 60)
            pexels = PexelsDownloader(
                api_key=args.pexels_key,
                output_dir=args.output
            )
            pexels.download_curated()
    
    elif args.search:
        # Search mode (requires API key)
        if args.source == 'unsplash':
            downloader = UnsplashDownloader(
                access_key=args.unsplash_key,
                output_dir=args.output
            )
            downloader.search_and_download(args.search, args.count)
        elif args.source == 'pexels':
            downloader = PexelsDownloader(
                api_key=args.pexels_key,
                output_dir=args.output
            )
            downloader.search_and_download(args.search, args.count)
    
    print("\n" + "=" * 60)
    print("Download complete!")
    print("=" * 60)
    print(f"\nImages saved to: {Path(args.output).absolute()}")
    print("\nNext steps:")
    print("1. Review downloaded images")
    print("2. Delete any that don't fit your brand")
    print("3. Update your frontend code to use these images")
    print("4. Images are ready for commercial use - no attribution required")


if __name__ == '__main__':
    main()
