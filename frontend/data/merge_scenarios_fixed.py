#!/usr/bin/env python3
import json
from pathlib import Path

# Read original file
with open('legendary-scenarios.json', 'r', encoding='utf-8') as f:
    original = json.load(f)

# Read all scenario files from scenarios directory
scenarios_dir = Path('scenarios')
all_scenarios_dict = {}

if scenarios_dir.exists():
    for json_file in sorted(scenarios_dir.glob('*.json')):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if 'scenarios' in data:
                for scenario in data['scenarios']:
                    # 중복 제거: ID를 키로 사용
                    all_scenarios_dict[scenario['id']] = scenario
                print(f"Loaded {len(data['scenarios'])} scenarios from {json_file.name}")

# Convert dict to list and sort by order
all_scenarios = sorted(all_scenarios_dict.values(), key=lambda x: x.get('order', 999))

# Update the scenarios in original data
original['scenarios'] = all_scenarios

# Write back
with open('legendary-scenarios.json', 'w', encoding='utf-8') as f:
    json.dump(original, f, ensure_ascii=False, indent=2)

print(f"\n✅ Total unique scenarios: {len(all_scenarios)}")
print(f"Scenarios by ID: {sorted([s['id'] for s in all_scenarios])}")
