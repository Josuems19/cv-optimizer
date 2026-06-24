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
        
        # 1. Verificar dónde Coolify monta sus datos
        print("\n=== Mounts del container coolify ===")
        ssh.run_command("docker inspect coolify --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'")
        
        # 2. Verificar el docker-compose de Coolify
        print("\n=== Docker Compose de Coolify ===")
        ssh.run_command("docker inspect coolify --format '{{json .Config.Env}}' | tr ',' '\n' | head -20")
        
        # 3. Buscar en el home de josuems
        print("\n=== Buscando directorios coolify en home ===")
        ssh.run_command("find /home/josuems -name '*coolify*' -type d 2>/dev/null")
        
        # 4. Buscar en /
        print("\n=== Buscando /data ===")
        ssh.run_command("ls -la /data/ 2>/dev/null || echo '/data no existe'")
        
        # 5. Verificar con sudo
        print("\n=== Buscando /data con sudo ===")
        ssh.run_command("sudo ls -la /data/ 2>/dev/null || echo 'No accesible con sudo'")
        
        # 6. Verificar si Coolify monta algo
        print("\n=== Todos los mounts de docker ===")
        ssh.run_command("docker inspect coolify --format '{{json .Mounts}}' | python3 -m json.tool 2>/dev/null || docker inspect coolify --format '{{json .Mounts}}'")
        
        # 7. Buscar la aplicación de Coolify en el sistema
        print("\n=== Buscando archivos de la aplicación en todo el sistema ===")
        ssh.run_command("sudo find / -path '*/applications/svuzl9kryvgwnd8z0j0w9myx*' 2>/dev/null | head -10")
        
        # 8. Verificar docker-compose de Coolify
        print("\n=== docker-compose de Coolify ===")
        ssh.run_command("sudo find / -name 'docker-compose.yaml' -newer /etc/hostname 2>/dev/null | head -10")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
