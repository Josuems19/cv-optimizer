import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

cmds = [
    # Check current state of the directory
    'sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/',
    # Check if the directory got recreated with wrong perms after failed deploy
    'sudo stat /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/',
    # Check who the Coolify container runs its deploy as
    'docker exec coolify id www-data',
    # Check if there's an immutable flag
    'sudo lsattr /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/ 2>&1',
    # Test write from host as josuems
    'touch /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/test_write.txt 2>&1 && echo "WRITE OK" && rm /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/test_write.txt || echo "WRITE FAILED"',
    # Check if AppArmor is blocking tee
    'sudo dmesg | grep -i apparmor | tail -5',
    'sudo dmesg | grep -i denied | tail -5',
    # Recreate the app directory from scratch
    'sudo rm -rf /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx',
    'sudo mkdir -p /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx',
    'sudo chmod -R 777 /data/coolify/applications/',
    'sudo chown -R 9999:9999 /data/coolify/applications/',
    'sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/',
    # Verify the Coolify deploy process - check if it runs via a specific mechanism
    'docker exec coolify cat /var/www/html/app/Actions/Application/DeployApplication.php 2>/dev/null | head -30 || echo "File not found"',
]

for cmd in cmds:
    print(f'>>> {cmd}')
    _, out, err = c.exec_command(cmd, timeout=15)
    o = out.read().decode()
    e = err.read().decode()
    if o: print(o)
    if e: print(f'STDERR: {e}')

c.close()
