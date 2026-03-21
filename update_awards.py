#!/usr/bin/env python3
"""
Script pour mettre à jour les récompenses depuis le site callistoarts.com
"""
import json
import re
from pathlib import Path

# Mapping des fichiers avec leurs récompenses trouvées sur le site
awards_mapping = {
    "Callisto_Pascals-lemur-leap_step-finale-2048x1152.jpg": {
        "title": "Pascal's lemur leap",
        "award": "10ème place @ Revision 2025",
        "year": 2025
    },
    "abyss_of-symphony.jpg": {
        "title": "Symphony Of The Abyss by Callisto",
        "award": "2nd in the Rsync 2025 Graphics competition",
        "year": 2025
    },
    "paintover2024_callisto_refresh_step05.jpg": {
        "title": "Refresh",
        "award": "12ème place @ Revision 2024",
        "year": 2024
    },
    "Chromatic-Resonance.jpg": {
        "title": "Chromatique résonance",
        "award": "1ère place @ Rsync 2024",
        "year": 2024
    },
    "Luna-fly-by-callisto-finale-1-scaled.jpg": {
        "title": "Luna Fly",
        "award": "5ème place @ Session 2023",
        "year": 2023
    },
    "cropped-elevation-finale-scaled-1.jpg": {
        "title": "Elevation 2079",
        "award": "1ère place @ Inercia 2022",
        "year": 2022
    },
    "IMG_0899-scaled.jpg": {
        "title": "Sky code",
        "award": "Participation @ Inercia 2025",
        "year": 2025
    }
}

# Charger le JSON actuel
json_path = Path("assets/images/portfolio_images.json")

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Mettre à jour les récompenses
updated_count = 0
for image in data["images"]:
    filename = image["filename"]
    
    # Chercher une correspondance exacte ou partielle
    for key, award_info in awards_mapping.items():
        if key in filename or filename in key:
            # Mettre à jour les informations
            if "title" in award_info:
                image["title"] = award_info["title"]
            if "award" in award_info:
                image["award"] = award_info["award"]
                updated_count += 1
            if "year" in award_info:
                image["year"] = award_info["year"]
            break

# Sauvegarder le JSON mis à jour
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✓ {updated_count} récompenses mises à jour dans portfolio_images.json")
