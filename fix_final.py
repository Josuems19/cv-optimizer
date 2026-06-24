import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

cmds = [
    'sudo rm -f /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/.env',
    'sudo rm -f /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/env',
    'sudo chmod 777 /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/',
    'sudo chown 9999:9999 /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/',
    'ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/',
    "docker exec coolify php artisan tinker --execute=\"$s = \\App\\Models\\Server::find(2); $s->ip = 'host.docker.internal'; $s->save(); echo $s->ip;\"",
]

for cmd in cmds:
    print(f'>>> {cmd}')
    _, out, err = c.exec_command(cmd, timeout=15)
    o = out.read().decode()
    e = err.read().decode()
    if o: print(o)
    if e: print(f'STDERR: {e}')

c.close()
print('\nDone! Try deploying again.')
