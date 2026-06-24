import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

cmds = [
    # Test SSH from inside the Coolify container to localhost
    'docker exec coolify cat /var/www/html/storage/app/ssh/keys/ssh_key@ih76dghynb6dn6cuvf3p3rja',
    # Check authorized_keys
    'cat /home/josuems/.ssh/authorized_keys',
    # Test SSH from Coolify container to host
    'docker exec coolify php artisan tinker --execute="echo \\App\\Models\\Server::find(2)->ip;"',
    # Test actual SSH from container
    'docker exec coolify sh -c "ssh -o StrictHostKeyChecking=no -o BatchMode=yes -i /var/www/html/storage/app/ssh/keys/ssh_key@ih76dghynb6dn6cuvf3p3rja josuems@127.0.0.1 echo SSH_OK 2>&1"',
    # The server IP is 127.0.0.1 - but from inside the container, 127.0.0.1 is the container itself!
    # We need to use host.docker.internal or the actual host IP
    'docker exec coolify sh -c "ssh -o StrictHostKeyChecking=no -o BatchMode=yes -i /var/www/html/storage/app/ssh/keys/ssh_key@ih76dghynb6dn6cuvf3p3rja josuems@host.docker.internal echo SSH_OK 2>&1"',
    # Check what IP the container sees
    'docker exec coolify sh -c "cat /etc/hosts | head -10"',
]

for cmd in cmds:
    print(f'>>> {cmd}')
    _, out, err = c.exec_command(cmd, timeout=15)
    o = out.read().decode()
    e = err.read().decode()
    if o: print(o)
    if e: print(f'STDERR: {e}')

c.close()
