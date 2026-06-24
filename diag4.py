import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

cmds = [
    # Check SSH directory inside Coolify container
    'docker exec coolify ls -la /var/www/html/storage/app/ssh/',
    # Check host SSH directory
    'ls -la /data/coolify/ssh/',
    'sudo ls -la /data/coolify/ssh/',
    # Check if the private key exists
    'sudo cat /data/coolify/ssh/id_ed25519 2>/dev/null | head -3 || echo "NO KEY FILE"',
    'sudo ls -la /data/coolify/ssh/keys/ 2>/dev/null || echo "No keys dir"',
    # Check all files recursively
    'sudo find /data/coolify/ssh/ -type f 2>/dev/null',
    # Check the Coolify database for server SSH config
    'docker exec coolify php artisan tinker --execute="echo \\json_encode(\\App\\Models\\PrivateKey::find(0)->toArray(), JSON_PRETTY_PRINT);" 2>/dev/null | head -30',
]

for cmd in cmds:
    print(f'>>> {cmd}')
    _, out, err = c.exec_command(cmd, timeout=15)
    o = out.read().decode()
    e = err.read().decode()
    if o: print(o)
    if e: print(f'STDERR: {e}')

c.close()
