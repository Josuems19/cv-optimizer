import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

cmds = [
    'docker exec coolify whoami',
    'docker exec coolify id',
    'docker inspect coolify --format "{{.AppArmorProfile}}"',
    'docker exec coolify bash -c "echo test > /var/www/html/storage/app/applications/svuzl9kryvgwnd8z0j0w9myx/test.txt" 2>&1',
    'docker exec coolify ls -la /var/www/html/storage/app/applications/svuzl9kryvgwnd8z0j0w9myx/ 2>&1',
    'docker exec coolify bash -c "cat /proc/1/status | head -5"',
]

for cmd in cmds:
    print(f'>>> {cmd}')
    _, out, err = c.exec_command(cmd, timeout=15)
    o = out.read().decode()
    e = err.read().decode()
    if o: print(o)
    if e: print(f'STDERR: {e}')

c.close()
