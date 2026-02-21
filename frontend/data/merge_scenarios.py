#!/usr/bin/env python3
import json
import os
from pathlib import Path

# Read original file
with open('legendary-scenarios.json', 'r', encoding='utf-8') as f:
    original = json.load(f)

# Read all scenario files from scenarios directory
scenarios_dir = Path('scenarios')
all_scenarios = []

if scenarios_dir.exists():
    for json_file in sorted(scenarios_dir.glob('*.json')):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if 'scenarios' in data:
                all_scenarios.extend(data['scenarios'])
                print(f"Loaded {len(data['scenarios'])} scenarios from {json_file.name}")

# Combine with original scenarios (keep original first 10)
original_scenarios = original['scenarios'][:10]
combined_scenarios = original_scenarios + all_scenarios

# Update the scenarios in original data
original['scenarios'] = combined_scenarios

# Write back
with open('legendary-scenarios.json', 'w', encoding='utf-8') as f:
    json.dump(original, f, ensure_ascii=False, indent=2)

print(f"\nTotal scenarios: {len(combined_scenarios)}")
print(f"Original: {len(original_scenarios)}, New: {len(all_scenarios)}")
