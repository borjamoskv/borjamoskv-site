# C5-REAL
import socket

def start_server():
    host = '0.0.0.0'
    port = 9090
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((host, port))
    server_socket.listen(1)
    print(f"[TARGET] Server listening on {host}:{port} for SINTETO-PROTO-v1...")

    while True:
        try:
            client_socket, address = server_socket.accept()
            print(f"[TARGET] Connection established from {address}")
            data = client_socket.recv(1024).decode('utf-8')
            
            if data.strip() == "SINTETO-PROTO-v1: GIVE_KEY":
                print("[TARGET] Valid protocol handshake received. Dispensing key.")
                client_socket.send("SINTETO-KEY-77X99Y-C5REAL\n".encode('utf-8'))
            else:
                print(f"[TARGET] Invalid protocol attempt: {data.strip()}")
                client_socket.send("ERROR: INVALID PROTOCOL. Expected 'SINTETO-PROTO-v1: GIVE_KEY'\n".encode('utf-8'))
            
            client_socket.close()
        except Exception as e:
            print(f"[TARGET] Exception: {e}")

if __name__ == "__main__":
    start_server()
