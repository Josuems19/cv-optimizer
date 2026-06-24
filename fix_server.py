import paramiko

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
        
        # Cambiar private_key_id del servidor "Coolify" (id:2) a 0 (localhost key)
        print("\n=== Cambiando private_key_id del servidor a 0 (localhost key) ===")
        ssh.run_command("""docker exec coolify php artisan tinker --execute="
            \\$server = \\App\\Models\\Server::find(2);
            \\$server->private_key_id = 0;
            \\$server->ip = '127.0.0.1';
            \\$server->save();
            echo 'Private key ID: ' . \\$server->private_key_id . ' IP: ' . \\$server->ip;
        " """)
        
        # Resetear unreachable_count
        print("\n=== Reseteando unreachable_count ===")
        ssh.run_command("""docker exec coolify php artisan tinker --execute="
            \\$server = \\App\\Models\\Server::find(2);
            \\$server->unreachable_count = 0;
            \\$server->save();
            echo 'Unreachable count reset to: ' . \\$server->unreachable_count;
        " """)
        
        # Verificar el estado final
        print("\n=== Estado final del servidor ===")
        ssh.run_command("""docker exec coolify php artisan tinker --execute="
            \\$server = \\App\\Models\\Server::find(2);
            echo 'Name: ' . \\$server->name;
            echo 'IP: ' . \\$server->ip;
            echo 'Private Key ID: ' . \\$server->private_key_id;
            echo 'Unreachable: ' . \\$server->unreachable_count;
            echo 'Is Validating: ' . (\\$server->is_validating ? 'true' : 'false');
        " """)
        
        # Reiniciar Coolify para que tome los cambios
        print("\n=== Reiniciando Coolify ===")
        ssh.run_command("docker restart coolify")
        
        import time
        print("Esperando 10 segundos...")
        time.sleep(10)
        
        # Verificar que Coolify está corriendo
        print("\n=== Verificando Coolify después del reinicio ===")
        ssh.run_command("docker ps | grep coolify")
        
        print("\n=== ¡Listo! Ahora recarga http://192.168.1.189:8000 en tu navegador ===")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
