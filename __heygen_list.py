import requests, json

key = 'sk_V2_hgu_kYf04ztCKsw_Cve4GPYnTNpH0Qpm9Pk57bFpw51nZJ4v'
headers = {'X-Api-Key': key, 'Accept': 'application/json'}

# List avatars
print("=== AVATARS ===")
r = requests.get('https://api.heygen.com/v2/avatars', headers=headers, timeout=30)
print('Status:', r.status_code)
if r.status_code == 200:
    data = r.json()
    avatars = data.get('data', {}).get('avatars', [])
    print(f'Found {len(avatars)} avatars:')
    for a in avatars[:15]:
        aid = a.get('avatar_id', '')
        name = a.get('avatar_name', '')
        print(f'  ID: {aid} | Name: {name}')
else:
    print('Error:', r.text[:400])

print()
print("=== VOICES ===")
r2 = requests.get('https://api.heygen.com/v2/voices', headers=headers, timeout=30)
print('Status:', r2.status_code)
if r2.status_code == 200:
    data2 = r2.json()
    voices = data2.get('data', {}).get('voices', [])
    print(f'Found {len(voices)} voices:')
    for v in voices[:15]:
        vid = v.get('voice_id', '')
        vname = v.get('name', '')
        lang = v.get('language', '')
        gender = v.get('gender', '')
        print(f'  ID: {vid} | Name: {vname} | Lang: {lang} | Gender: {gender}')
else:
    print('Error:', r2.text[:400])
