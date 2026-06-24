import paramiko
import time

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
        
        # 1. Pull latest from GitHub (ya tiene el package-lock fixeado)
        print("\n=== Pulling latest from GitHub ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && git pull origin master 2>&1")
        
        # 2. Verificar package-lock.json existe
        print("\n=== Verificando package-lock.json ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && ls -la package.json package-lock.json")
        
        # 3. Configurar git en el servidor
        print("\n=== Configurando git ===")
        ssh.run_command("git config --global user.email 'josuems@ioserver' && git config --global user.name 'Josue'")
        
        # 4. Buscar el directorio de Coolify para esta aplicación
        print("\n=== Buscando directorio de Coolify ===")
        ssh.run_command("ls -la /data/coolify/applications/ 2>/dev/null || echo 'Directorio no encontrado'")
        
        # 5. Verificar permisos generales de Coolify
        print("\n=== Verificando permisos /data/coolify ===")
        ssh.run_command("ls -la /data/coolify/ 2>/dev/null")
        
        # 6. Buscar docker-compose en toda la máquina
        print("\n=== Buscando archivos docker-compose ===")
        ssh.run_command("find /data/coolify -name 'docker-compose*' -type f 2>/dev/null | head -20")
        
        # 7. Verificar si hay problemas de permisos en Coolify
        print("\n=== Verificando permisos de Coolify container ===")
        ssh.run_command("docker exec coolify ls -la /data/coolify/applications/ 2>/dev/null || echo 'No accesible desde container'")
        
        # 8. Arreglar permisos desde dentro del container
        print("\n=== Arreglando permisos desde Coolify container ===")
        ssh.run_command("docker exec coolify chmod -R 777 /data/coolify/applications/ 2>/dev/null || echo 'No se pudieron cambiar permisos'")
        
        print("\n=== ¡Listo! Ahora intenta redeployar en Coolify ===")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
