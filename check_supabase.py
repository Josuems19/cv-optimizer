import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

# The Supabase project uses its own PostgreSQL (hosted by Supabase, not the local one)
# We need to check via the Supabase Management API or the SQL editor
# Let's check if we can reach the Supabase database directly

# Actually, let's just verify by checking what tables exist via the REST API
# The real fix is to run the SQL migrations in the Supabase dashboard

# Let's create a quick script that calls the Supabase REST API to check
import urllib.request
import json

url = "https://pbuutfvauqzortfmwjuc.supabase.co/rest/v1/profiles?select=id"
api_key = "sb_publishable_6wvCEMUhWwwH7LwgkFCV0w_4_AKflWu"

req = urllib.request.Request(url)
req.add_header("apikey", api_key)
req.add_header("Authorization", f"Bearer {api_key}")

try:
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    print("Profiles table exists:", data)
except Exception as e:
    print("Error:", e)

# Check resumes table
url2 = "https://pbuutfvauqzortfmwjuc.supabase.co/rest/v1/resumes?select=id&limit=1"
req2 = urllib.request.Request(url2)
req2.add_header("apikey", api_key)
req2.add_header("Authorization", f"Bearer {api_key}")

try:
    resp2 = urllib.request.urlopen(req2)
    data2 = json.loads(resp2.read().decode())
    print("Resumes table exists:", data2)
except Exception as e:
    print("Resumes error:", e)

c.close()
