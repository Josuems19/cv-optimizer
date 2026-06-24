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
        
        # 1. Forzar pull (resetear cambios locales)
        print("\n=== Forzando pull desde GitHub ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && git fetch origin && git reset --hard origin/master 2>&1")
        
        # 2. Verificar package-lock.json
        print("\n=== Verificando archivos ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && ls -la package*.json")
        
        # 3. Buscar dónde Coolify almacena las aplicaciones
        print("\n=== Buscando volúmenes de Coolify ===")
        ssh.run_command("docker volume ls | grep coolify")
        
        # 4. Buscar dentro del volumen de Coolify
        print("\n=== Buscando aplicaciones dentro de Docker ===")
        ssh.run_command("docker exec coolify find / -name 'applications' -type d 2>/dev/null | head -10")
        
        # 5. Verificar si Coolify tiene un volumen específico
        print("\n=== Verificando volúmenes Docker ===")
        ssh.run_command("docker volume inspect coolify_data 2>/dev/null || echo 'Volumen no encontrado'")
        
        # 6. Listar contenido del volumen coolify_data
        print("\n=== Contenido del volumen coolify_data ===")
        ssh.run_command("docker run --rm -v coolify_data:/data alpine ls -la /data/applications/ 2>/dev/null || echo 'No accesible'")
        
        # 7. Crear directorio de aplicaciones si no existe
        print("\n=== Creando directorio de aplicaciones ===")
        ssh.run_command("docker exec coolify mkdir -p /data/coolify/applications")
        ssh.run_command("docker exec coolify chmod -R 777 /data/coolify/applications")
        
        print("\n=== ¡Listo! Ahora intenta redeployar en Coolify ===")
        print("Ve a http://192.168.1.189:8000 y haz click en Redeploy")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
