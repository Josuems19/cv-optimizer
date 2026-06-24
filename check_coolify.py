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
        
        # Verificar estado de Coolify
        print("\n=== Estado de Coolify ===")
        ssh.run_command("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
        
        # Verificar configuración de Coolify
        print("\n=== Configuración de Coolify ===")
        ssh.run_command("docker exec coolify cat /data/coolify/.env 2>/dev/null | head -20")
        
        # Verificar servidores configurados
        print("\n=== Servidores en Coolify ===")
        ssh.run_command("docker exec coolify php artisan tinker --execute=\"echo \\json_encode(\\App\\Models\\Server::all()->toArray(), JSON_PRETTY_PRINT);\" 2>/dev/null || echo 'No se pudo ejecutar tinker'")
        
        # Verificar la base de datos de Coolify
        print("\n=== Intentando acceder a la API de Coolify ===")
        ssh.run_command("curl -s http://localhost:8000/api/v1/servers 2>/dev/null | head -50 || echo 'API no accesible'")
        
        # Verificar logs recientes
        print("\n=== Logs recientes de Coolify ===")
        ssh.run_command("docker logs coolify --tail 20 2>&1")
        
        # Verificar si hay problemas con el proxy
        print("\n=== Estado del proxy ===")
        ssh.run_command("docker ps | grep traefik")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
