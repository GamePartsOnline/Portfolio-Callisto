#!/usr/bin/env python3
"""
Script pour télécharger toutes les images du site callistoarts.com
"""
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin, urlparse
import time
from pathlib import Path

BASE_URL = "https://callistoarts.com"
OUTPUT_DIR = "/home/flowtech/The_Hacking_Project/Mes-repo/Portfolio/assets/images"

# Créer le dossier de sortie
os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_image(url, output_path):
    """Télécharge une image depuis une URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Téléchargé: {os.path.basename(output_path)}")
        return True
    except Exception as e:
        print(f"✗ Erreur pour {url}: {e}")
        return False

def get_all_images_from_page(url):
    """Récupère toutes les URLs d'images d'une page"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        images = set()
        
        # Trouver toutes les balises img
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if src:
                # Convertir en URL absolue
                full_url = urljoin(BASE_URL, src)
                # Filtrer seulement les images du domaine callistoarts.com
                if 'callistoarts.com' in full_url and any(ext in full_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                    images.add(full_url)
        
        # Trouver les images dans les styles CSS inline
        for style in soup.find_all(style=True):
            style_content = style.get('style', '')
            import re
            urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', style_content)
            for url in urls:
                full_url = urljoin(BASE_URL, url)
                if 'callistoarts.com' in full_url and any(ext in full_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                    images.add(full_url)
        
        return images
    except Exception as e:
        print(f"Erreur lors de l'analyse de {url}: {e}")
        return set()

def sanitize_filename(url):
    """Crée un nom de fichier valide à partir d'une URL"""
    parsed = urlparse(url)
    path = parsed.path
    filename = os.path.basename(path)
    
    # Nettoyer le nom de fichier
    filename = filename.split('?')[0]  # Enlever les paramètres de requête
    
    # Si pas de nom de fichier, créer un nom basé sur l'URL
    if not filename or '.' not in filename:
        filename = f"image_{hash(url) % 100000}.jpg"
    
    return filename

def main():
    print("=" * 60)
    print("Téléchargement des images depuis callistoarts.com")
    print("=" * 60)
    
    all_images = set()
    
    # Pages à explorer
    pages_to_check = [
        BASE_URL,
        f"{BASE_URL}/digital-painting-demoscene/",
        f"{BASE_URL}/animation-video/",
        f"{BASE_URL}/montage-video-demoscene/",
        f"{BASE_URL}/photos/",
        f"{BASE_URL}/traditional-arts/",
        f"{BASE_URL}/gaming-artwork/",
    ]
    
    print("\n📄 Exploration des pages...")
    for page_url in pages_to_check:
        print(f"\nAnalyse de: {page_url}")
        images = get_all_images_from_page(page_url)
        all_images.update(images)
        print(f"  → {len(images)} images trouvées")
        time.sleep(1)  # Pause pour ne pas surcharger le serveur
    
    print(f"\n📊 Total d'images uniques trouvées: {len(all_images)}")
    
    if not all_images:
        print("\n⚠️  Aucune image trouvée. Vérifiez que le site est accessible.")
        return
    
    print("\n📥 Téléchargement des images...")
    downloaded = 0
    failed = 0
    
    for img_url in sorted(all_images):
        filename = sanitize_filename(img_url)
        output_path = os.path.join(OUTPUT_DIR, filename)
        
        # Éviter les doublons
        if os.path.exists(output_path):
            print(f"⊘ Déjà présent: {filename}")
            continue
        
        if download_image(img_url, output_path):
            downloaded += 1
        else:
            failed += 1
        
        time.sleep(0.5)  # Pause entre les téléchargements
    
    print("\n" + "=" * 60)
    print(f"✅ Téléchargement terminé!")
    print(f"   - Téléchargées: {downloaded}")
    print(f"   - Échouées: {failed}")
    print(f"   - Dossier: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
