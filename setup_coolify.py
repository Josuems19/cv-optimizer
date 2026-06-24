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
    ssh = SSHClient(
        host="192.168.1.189",
        port=22,
        username="josuems",
        password="Berlin35!"
    )
    
    try:
        ssh.connect()
        
        # Crear archivo .env.local en el servidor
        print("\n=== Configurando variables de entorno ===")
        env_content = """# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pbuutfvauqzortfmwjuc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6wvCEMUhWwwH7LwgkFCV0w_4_AKflWu

# OpenAI (opcional si usas otro proveedor)
OPENAI_API_KEY=

# Deepseek (opcional)
DEEPSEEK_API_KEY=

# Mimo (opcional)
MIMO_API_KEY=
MIMO_BASE_URL=https://api.mimo.com/v1
"""
        
        # Escribir archivo .env.local
        ssh.run_command(f"cat > /home/josuems/cv-optimizer/.env.local << 'EOF'\n{env_content}EOF")
        
        # Verificar que se creó
        ssh.run_command("cat /home/josuems/cv-optimizer/.env.local")
        
        print("\n=== Archivo .env.local configurado ===")
        print("\nAhora abre Coolify en tu navegador:")
        print("http://192.168.1.189:8000")
        print("\nCredenciales de Coolify:")
        print("Email: aeljosh@live.com.mx")
        print("Contraseña: Verbose!!!")
        print("\nPasos en Coolify:")
        print("1. Click en 'New Project'")
        print("2. Selecciona 'Application'")
        print("3. Conecta tu repositorio de GitHub: Josuems19/cv-optimizer")
        print("4. En 'Build Settings', configura:")
        print("   - Build Pack: Dockerfile")
        print("   - Dockerfile: (dejar vacío para auto-detect)")
        print("5. En 'Environment Variables', agrega las mismas variables del .env.local")
        print("6. Click 'Deploy'")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
