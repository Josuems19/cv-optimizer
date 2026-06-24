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
        
        # Verificar qué llave está usando el servidor Coolify (id:2)
        print("\n=== Verificando llave del servidor Coolify ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"\\$server = \\App\\Models\\Server::find(2); echo 'Private Key ID: ' . \\$server->private_key_id;\"")
        
        # Verificar authorized_keys del usuario josuems
        print("\n=== Verificando authorized_keys ===")
        ssh.run_command("cat /home/josuems/.ssh/authorized_keys 2>/dev/null || echo 'No authorized_keys found'")
        
        # Verificar si la llave localhost funciona para josuems
        print("\n=== Probando llave localhost contra josuems ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"\\$key = \\App\\Models\\PrivateKey::find(0); echo \\$key->private_key;\" > /tmp/test_key.pem 2>/dev/null")
        ssh.run_command("chmod 600 /tmp/test_key.pem 2>/dev/null")
        
        # Agregar la llave pública de Coolify a authorized_keys
        print("\n=== Agregando llave pública de Coolify a authorized_keys ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"\\$key = \\App\\Models\\PrivateKey::find(0); echo \\$key->public_key;\"")
        
        # Obtener la llave pública y agregarla
        public_key = ssh.run_command("docker exec coolify php artisan tinker --execute=\"\\$key = \\App\\Models\\PrivateKey::find(0); echo \\$key->public_key;\"")[0].strip()
        
        # Crear directorio .ssh si no existe
        ssh.run_command("mkdir -p /home/josuems/.ssh && chmod 700 /home/josuems/.ssh")
        
        # Agregar la llave pública
        ssh.run_command(f"echo '{public_key}' >> /home/josuems/.ssh/authorized_keys && chmod 600 /home/josuems/.ssh/authorized_keys")
        
        # Verificar que se agregó
        print("\n=== Verificando authorized_keys después de agregar ===")
        ssh.run_command("cat /home/josuems/.ssh/authorized_keys")
        
        # Probar SSH de nuevo
        print("\n=== Probando SSH con la llave configurada ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"\\App\\Jobs\\ServerJob::dispatch(\\App\\Models\\Server::find(2)); echo 'Job dispatched';\"")
        
        # Verificar si hay problemas con el user
        print("\n=== Verificando usuario josuems ===")
        ssh.run_command("id josuems")
        ssh.run_command("grep josuems /etc/passwd")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
