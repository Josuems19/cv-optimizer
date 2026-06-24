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
        
        # 1. Verificar si el problema es que el directorio padre no tiene permisos de escritura
        print("\n=== Verificando TODOS los permisos en la ruta ===")
        ssh.run_command("sudo ls -la /data/")
        ssh.run_command("sudo ls -la /data/coolify/")
        ssh.run_command("sudo ls -la /data/coolify/applications/")
        ssh.run_command("sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/")
        
        # 2. Verificar si el archivo .env ya existe con permisos restrictivos
        print("\n=== Verificando si .env existe con permisos malos ===")
        ssh.run_command("sudo test -f /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/.env && sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/.env || echo 'No existe .env'")
        
        # 3. El problema puede ser que /data o /data/coolify tiene permisos restrictivos
        # El directorio raíz /data tiene perms 755 y es owned by root
        # /data/coolify tiene perms 700 y es owned by 9999
        # Pero el PROBLEMA REAL es que tee corre como el usuario del container (no sudo)
        # El deploy corre dentro del container Coolify como root, pero el bind mount
        # respeta los permisos del host
        
        # 4. Arreglar TODOS los permisos recursivamente desde /
        print("\n=== Arreglando permisos recursivos ===")
        ssh.run_command("sudo chmod -R 777 /data/coolify/applications/")
        
        # 5. Crear un script en el host que Coolify pueda usar
        print("\n=== Creando script de fix de permisos ===")
        ssh.run_command("""sudo bash -c 'cat > /data/coolify/applications/fix_perms.sh << "SCRIPT"
#!/bin/bash
chmod -R 777 /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/
SCRIPT
chmod +x /data/coolify/applications/fix_perms.sh'""")
        
        # 6. Verificar que el problema no es AppArmor o SELinux
        print("\n=== Verificando AppArmor ===")
        ssh.run_command("aa-status 2>/dev/null | head -5 || echo 'AppArmor no disponible'")
        
        # 7. Verificar si hay un problema con el bind mount desde el container
        print("\n=== Verificando mount desde container ===")
        ssh.run_command("docker exec coolify ls -la /var/www/html/storage/app/applications/")
        
        # 8. El problema REAL: el directorio padre /data tiene permisos 755 owned by root
        # Cambiar para que coolify pueda escribir
        print("\n=== Arreglando permisos de /data ===")
        ssh.run_command("sudo chmod 777 /data")
        ssh.run_command("sudo chmod 777 /data/coolify")
        
        # 9. Verificar después
        print("\n=== Verificando después de fix ===")
        ssh.run_command("sudo ls -la /data/")
        ssh.run_command("sudo ls -la /data/coolify/")
        ssh.run_command("sudo ls -la /data/coolify/applications/")
        ssh.run_command("sudo ls -la /data/coolify/applications/svuzl9kryvgwnd8z0j0w9myx/")
        
        print("\n=== ¡Ahora intenta redeployar en Coolify! ===")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
