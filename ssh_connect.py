import paramiko
import sys

def ssh_connect():
    host = "192.168.1.189"
    port = 22
    username = "josuems"
    password = "Berlin35!"
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Conectando a {username}@{host}:{port}...")
        client.connect(host, port, username, password, timeout=10)
        print("¡Conexión exitosa!")
        
        # Test command
        stdin, stdout, stderr = client.exec_command("whoami && hostname")
        print(f"Usuario: {stdout.read().decode().strip()}")
        
        return client
    except paramiko.AuthenticationException:
        print("Error: Autenticación fallida. Verifica usuario/contraseña.")
        return None
    except paramiko.SSHException as e:
        print(f"Error SSH: {e}")
        return None
    except Exception as e:
        print(f"Error de conexión: {e}")
        return None

if __name__ == "__main__":
    client = ssh_connect()
    if client:
        print("\n¡Listo para ejecutar comandos!")
        client.close()
