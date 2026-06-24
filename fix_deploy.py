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
        
        # 1. Eliminar package-lock.json y node_modules para regenerar
        print("\n=== Regenerando package-lock.json ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && rm -rf node_modules package-lock.json")
        
        # 2. Instalar dependencias para regenerar lock file
        print("\n=== Instalando dependencias (regenera lock file) ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && npm install --package-lock-only 2>&1", timeout=120)
        
        # 3. Verificar que el lock file existe y está sincronizado
        print("\n=== Verificando package-lock.json ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && ls -la package-lock.json")
        
        # 4. Hacer commit y push
        print("\n=== Commiteando cambios ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && git add package-lock.json && git commit -m 'fix: regenerate package-lock.json' 2>&1")
        
        print("\n=== Push a GitHub ===")
        ssh.run_command("cd /home/josuems/cv-optimizer && git push origin master 2>&1")
        
        # 5. Verificar si hay archivos con permisos incorrectos en Coolify
        print("\n=== Verificando permisos en Coolify ===")
        ssh.run_command("ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/ 2>/dev/null || echo 'Directorio no encontrado'")
        
        # 6. Arreglar permisos
        print("\n=== Arreglando permisos ===")
        ssh.run_command("sudo chown -R 1000:1000 /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/ 2>/dev/null || echo 'No se pudieron cambiar permisos'")
        ssh.run_command("sudo chmod -R 755 /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/ 2>/dev/null || echo 'No se pudieron cambiar permisos'")
        
        # 7. Verificar docker compose permissions
        print("\n=== Verificando docker-compose.yaml ===")
        ssh.run_command("ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/docker-compose.yaml 2>/dev/null || echo 'Archivo no encontrado'")
        
        print("\n=== ¡Listo! Ahora intenta redeployar en Coolify ===")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
