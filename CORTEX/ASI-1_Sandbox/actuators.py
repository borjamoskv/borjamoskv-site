import socket

def send_handshake(host, port):
    # Create a TCP socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Connect to the server
        s.connect((host, port))
        # Send the handshake message
        s.sendall(b'SINTETO-PROTO-v1: GIVE_KEY\n')
        # Receive the response
        response = s.recv(1024)
    return response.decode('utf-8')