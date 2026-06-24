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
        print("Conexión exitosa!")
        
    def run_command(self, command, timeout=60):
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
        
        # 1. Verificar permisos del directorio
        print("\n=== Permisos actuales ===")
        ssh.run_command("sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/")
        
        # 2. Arreglar permisos con sudo
        print("\n=== Arreglando permisos ===")
        ssh.run_command("sudo chmod -R 777 /data/coolify/applications/")
        ssh.run_command("sudo chown -R 9999:9999 /data/coolify/applications/")
        
        # 3. Verificar que se aplicaron
        print("\n=== Verificando permisos después ===")
        ssh.run_command("sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/")
        
        # 4. Verificar el docker-compose.yaml
        print("\n=== Verificando docker-compose.yaml ===")
        ssh.run_command("sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/docker-compose.yaml")
        
        # 5. Verificar el contenido del directorio
        print("\n=== Contenido del directorio ===")
        ssh.run_command("sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/")
        
        # 6. Verificar el .env de la aplicación
        print("\n=== Verificando .env de la aplicación ===")
        ssh.run_command("sudo cat /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/.env 2>/dev/null | head -20")
        
        # 7. Verificar si hay un Dockerfile
        print("\n=== Verificando Dockerfile ===")
        ssh.run_command("sudo cat /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/Dockerfile 2>/dev/null || echo 'No hay Dockerfile'")
        
        print("\n=== ¡Permisos arreglados! Intenta redeployar en Coolify ===")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
