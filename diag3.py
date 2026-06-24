import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

cmds = [
    # Check sudoers for josuems
    'sudo cat /etc/sudoers.d/* 2>/dev/null',
    'sudo grep -i josuems /etc/sudoers 2>/dev/null',
    # Check if NOPASSWD is set
    'sudo sudo -l -U josuems 2>&1',
    # The real problem: check if the SSH deploy session can use sudo without password
    # Try simulating what Coolify does - SSH to localhost and run the command
    'ssh -o StrictHostKeyChecking=no -i /home/josuems/.ssh/id_ed25519 josuems@127.0.0.1 "sudo echo test" 2>&1',
    # Check what key the Coolify container uses for SSH
    'docker exec coolify cat /var/www/html/storage/app/ssh/id_ed25519 2>/dev/null | head -3',
    # Check if josuems can sudo without password by testing
    'echo "test" | sudo -S echo "sudo works" 2>&1',
    # Check the actual Coolify server SSH config
    'docker exec coolify cat /var/www/html/storage/app/ssh/config 2>/dev/null',
]

for cmd in cmds:
    print(f'>>> {cmd}')
    _, out, err = c.exec_command(cmd, timeout=15)
    o = out.read().decode()
    e = err.read().decode()
    if o: print(o)
    if e: print(f'STDERR: {e}')

c.close()
