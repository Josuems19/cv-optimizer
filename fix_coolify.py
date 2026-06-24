import paramiko
import json

class SSHClient:
    def __init__(self, host, port, username, password):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
    def connect(self):
        self.client.connect(self.host, self.port, self.username, self.password, timeout=10)
        print("¡Conexión exitosa!")
        
    def run_command(self, command, timeout=30):
        print(f"\n>>> {command}")
        stdin, stdout, stderr = self.client.exec_command(command, timeout=timeout)
        output = stdout.read().decode()
        error = stderr.read().decode()
        if output:
            print(output)
        if error:
            print(f"STDERR: {error}")
        return output, error
    
    def close(self):
        self.client.close()

def main():
    ssh = SSHClient(
        host="192.168.1.189",
        port=22,
        username="josuems",
        password="Berlin35!"
    )
    
    try:
        ssh.connect()
        
        # Verificar la IP del servidor Coolify
        print("\n=== Verificando configuración del servidor ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"echo \\App\\Models\\Server::find(2)->ip;\"")
        
        # Verificar si el servidor es alcanzable
        print("\n=== Verificando conectividad del servidor ===")
        ssh.run_command("docker exec coolify ping -c 2 host.docker.internal")
        
        # Verificar llave SSH
        print("\n=== Verificando llaves SSH ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"echo \\json_encode(\\App\\Models\\PrivateKey::all()->toArray(), JSON_PRETTY_PRINT);\"")
        
        # Intentar actualizar la IP del servidor a localhost
        print("\n=== Actualizando IP del servidor a 127.0.0.1 ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"\\$server = \\App\\Models\\Server::find(2); \\$server->ip = '127.0.0.1'; \\$server->save(); echo 'IP actualizada';\"")
        
        # Verificar si hay problemas con el SSH
        print("\n=== Verificando SSH local ===")
        ssh.run_command("ssh -o StrictHostKeyChecking=no -o BatchMode=yes josuems@127.0.0.1 'echo SSH_OK' 2>&1 || echo 'SSH falló'")
        
        # Verificar el estado del servidor después de cambios
        print("\n=== Estado del servidor después de cambios ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"\\$server = \\App\\Models\\Server::find(2); echo 'IP: ' . \\$server->ip . '\\nName: ' . \\$server->name . '\\nUnreachable: ' . \\$server->unreachable_count;\"")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
