import paramiko
import time
import sys

class SSHClient:
    def __init__(self, host, port, username, password):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
    def connect(self):
        print(f"Conectando a {self.username}@{self.host}:{self.port}...")
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
    # Configuración
    ssh = SSHClient(
        host="192.168.1.189",
        port=22,
        username="josuems",
        password="Berlin35!"
    )
    
    try:
        ssh.connect()
        
        # Verificar Coolify
        print("\n=== Verificando Coolify ===")
        ssh.run_command("docker ps | grep coolify")
        
        # Verificar directorio del proyecto
        print("\n=== Verificando espacio en disco ===")
        ssh.run_command("df -h /")
        
        # Clonar repositorio
        print("\n=== Clonando repositorio ===")
        ssh.run_command("cd /home/josuems && git clone https://github.com/Josuems19/cv-optimizer.git 2>/dev/null || echo 'Repositorio ya existe'")
        
        # Verificar estructura
        print("\n=== Verificando estructura ===")
        ssh.run_command("ls -la /home/josuems/cv-optimizer/")
        
        print("\n=== Configuración inicial completada ===")
        print("Ahora necesitas:")
        print("1. Abrir Coolify en http://192.168.1.189:8000")
        print("2. Crear un nuevo proyecto")
        print("3. Conectar el repositorio de GitHub")
        print("4. Configurar las variables de entorno")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
