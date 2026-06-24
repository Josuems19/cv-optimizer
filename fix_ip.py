import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.1.189', 22, 'josuems', 'Berlin35!')

tinker_cmd = """docker exec coolify php artisan tinker --execute="\\$s = \\App\\Models\\Server::find(2); \\$s->ip = 'host.docker.internal'; \\$s->save(); echo \\$s->ip;" """
print(f'>>> {tinker_cmd}')
_, out, err = c.exec_command(tinker_cmd, timeout=15)
o = out.read().decode()
e = err.read().decode()
if o: print(o)
if e: print(f'STDERR: {e}')

c.close()
