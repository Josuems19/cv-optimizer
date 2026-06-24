import paramiko
import base64

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

# The .env content from the error log
env_content = """COMMIT_COUNT=f779ca452b4918b3e99ec219579cc40c3012da3
COOLIFY_URL=http://svuzl9kryvgwnd8z0j0w9myx.192.168.1.189.sslip.io
COOLIFY_FQDN=svuzl9kryvgwnd8z0j0w9myx.192.168.1.189.sslip.io
COOLIFY_BRANCH=master
COOLIFY_RESOURCE_UUID=svuzl9kryvgwnd8z0j0w9myx
COOLIFY_CONTAINER_NAME=svuzl9kryvgwnd8z0j0w9myx-224012609577
NEXT_PUBLIC_SUPABASE_URL=https://pbuutfvauqzortfmwjuc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6wvCEMUhWwwH7LwgkFCV0w_4_AKflWu
PORT=3000
HOST=0.0.0.0"""

app_dir = '/data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx'

# Write .env file directly
print("=== Writing .env file ===")
stdin, stdout, stderr = c.exec_command(f"sudo tee {app_dir}/env > /dev/null", timeout=10)
stdin.write(env_content)
stdin.channel.shutdown_write()
o = stdout.read().decode()
e = stderr.read().decode()
if o: print(o)
if e: print(f'STDERR: {e}')

# Verify
print("\n=== Verifying .env ===")
stdin, stdout, stderr = c.exec_command(f"cat {app_dir}/env", timeout=10)
print(stdout.read().decode())

# Also write it as .env just in case
print("\n=== Writing .env ===")
stdin, stdout, stderr = c.exec_command(f"sudo cp {app_dir}/env {app_dir}/.env", timeout=10)
e = stderr.read().decode()
if e: print(f'STDERR: {e}')

# Verify
print("\n=== Verifying .env ===")
stdin, stdout, stderr = c.exec_command(f"ls -la {app_dir}/", timeout=10)
print(stdout.read().decode())

c.close()
print("\nDone! Try deploying again.")
