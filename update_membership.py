import re

with open('templates/membership.html', 'r') as f:
    content = f.read()

# Dictionary of class titles to their ids
tiers = {
    'Paramadasohi': 'paramadasohi',
    'Mahadasohi': 'mahadasohi',
    'Dasohi': 'dasohi',
    'Danashiromani': 'danashiromani',
    'Mahadani': 'mahadani',
    'Dani': 'dani',
    'Upaposhaka': 'upaposhaka',
    'Ashrayadatha': 'ashrayadatha',
    'Life Member': 'life_member',
    'Institutional': 'institutional',
    'Honorary': 'honorary',
    'Student': 'student'
}

def replace_href(match):
    full_str = match.group(0)
    title = match.group(1).strip()
    tier_id = tiers.get(title, 'paramadasohi')
    # replace the apply now link
    # find the href
    new_str = re.sub(r'href="\{\{\s*url_for\(\'web\.apply_membership\'\)\s*\}\}"', f'href="{{{{ url_for(\'web.apply_membership\') }}}}?tier={tier_id}"', full_str)
    return new_str

regex = re.compile(r'<h3 class="m-card-title">(.*?)</h3>[\s\S]*?<a href="\{\{\s*url_for\(\'web\.apply_membership\'\)\s*\}\}" class="m-card-badge">Apply Now</a>', re.IGNORECASE)

new_content = regex.sub(replace_href, content)

with open('templates/membership.html', 'w') as f:
    f.write(new_content)

