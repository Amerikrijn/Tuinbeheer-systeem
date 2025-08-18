#!/usr/bin/env python3
"""
Systematische reparatie van alle Supabase aanroepen in de codebase.
Dit script voegt 'const supabase = getSupabaseClient()' toe waar nodig.
"""

import os
import re
import glob
from pathlib import Path

def fix_supabase_calls_in_file(file_path):
    """Repareer alle supabase. aanroepen in een bestand."""
    print(f"🔧 Repareren van {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Zoek naar alle supabase. aanroepen
    supabase_calls = re.findall(r'supabase\.', content)
    
    if not supabase_calls:
        return False  # Geen wijzigingen nodig
    
    # Zoek naar functies die supabase gebruiken
    lines = content.split('\n')
    modified = False
    
    for i, line in enumerate(lines):
        if 'supabase.' in line:
            # Zoek naar het begin van de functie
            function_start = find_function_start(lines, i)
            if function_start is not None:
                # Voeg supabase declaratie toe na de functie opening
                if not has_supabase_declaration(lines, function_start, i):
                    lines.insert(function_start + 1, '    const supabase = getSupabaseClient()')
                    modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"✅ {file_path} gerepareerd")
        return True
    
    return False

def find_function_start(lines, current_line):
    """Zoek naar het begin van de functie die de huidige regel bevat."""
    for i in range(current_line, -1, -1):
        line = lines[i].strip()
        if re.match(r'^(export\s+)?(async\s+)?function\s+\w+', line):
            return i
        if re.match(r'^\w+\s*[:=]\s*(async\s+)?\(', line):
            return i
        if re.match(r'^\w+\s*[:=]\s*\(async\s+\)\s*=>', line):
            return i
        if re.match(r'^\w+\s*[:=]\s*\(async\s+\)\s*=>\s*{', line):
            return i
    return None

def has_supabase_declaration(lines, start, end):
    """Controleer of er al een supabase declaratie is in de functie."""
    for i in range(start, end):
        if 'const supabase = getSupabaseClient()' in lines[i]:
            return True
    return False

def main():
    """Hoofdfunctie om alle bestanden te repareren."""
    print("🔧 Systematische reparatie van alle Supabase aanroepen...")
    
    # Zoek alle TypeScript/TSX bestanden
    ts_files = []
    for pattern in ['**/*.ts', '**/*.tsx']:
        ts_files.extend(glob.glob(pattern, recursive=True))
    
    # Filter node_modules en andere onnodige bestanden
    ts_files = [f for f in ts_files if 'node_modules' not in f and '.git' not in f]
    
    print(f"📁 Gevonden {len(ts_files)} TypeScript bestanden")
    
    fixed_count = 0
    for file_path in ts_files:
        if fix_supabase_calls_in_file(file_path):
            fixed_count += 1
    
    print(f"\n✅ Klaar! {fixed_count} bestanden gerepareerd.")
    print("\n📋 Volgende stappen:")
    print("1. Test je app om te zien of alle fouten zijn opgelost")
    print("2. Als er nog fouten zijn, voer dit script opnieuw uit")
    print("3. Controleer of alle imports correct zijn: import { getSupabaseClient } from '@/lib/supabase'")

if __name__ == "__main__":
    main()