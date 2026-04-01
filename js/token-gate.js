/**
 * CORTEX TOKEN-GATE (AX-100)
 * Scarcity Engine: Solo poseedores del NFT en Foundation acceden al Master WAV.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnClaim = document.getElementById('btn-claim-wav');
    if (!btnClaim) return;
  
    // Config: Foundation Collection Address
    const COLLECTION_ADDRESS = "0xE6Eb9807e457758035d59042E56EB0061D64De4a";
  
    // Minimal ERC721 ABI for balanceOf
    const erc721ABI = [
      "function balanceOf(address owner) view returns (uint256)"
    ];
  
    let isConnected = false;
  
    btnClaim.addEventListener('click', async (e) => {
      e.preventDefault();
  
      if (typeof window.ethereum === 'undefined') {
        alert("[ CORTEX ] ERROR: No Web3 Wallet (MetaMask/Rabby) detectada.");
        return;
      }
  
      try {
        btnClaim.innerText = "ESPERANDO FIRMA...";
        
        // Connect to Wallet
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
  
        btnClaim.innerText = "VERIFICANDO ON-CHAIN...";
  
        // Switch to Mainnet if needed (Foundation is on Ethereum Mainnet)
        const network = await provider.getNetwork();
        if (network.chainId !== 1n) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x1' }],
            });
          } catch (switchError) {
            console.warn("Could not switch to mainnet automatically.");
          }
        }
  
        // Create Contract Instance
        const contract = new ethers.Contract(COLLECTION_ADDRESS, erc721ABI, provider);
        
        // Read balance
        const balance = await contract.balanceOf(userAddress);
  
        if (balance > 0n) {
          btnClaim.innerText = "ACCESO CONCEDIDO (ENVIANDO WAV)";
          btnClaim.style.background = "rgba(0, 255, 100, 0.4)";
          btnClaim.style.borderColor = "#00ff64";
          
          // Generar link de descarga (Dummy o URL privada en la implementación final)
          setTimeout(() => {
              const a = document.createElement('a');
              a.href = "/assets/master_vip.wav"; 
              a.download = "Borja_Moskv_Master_VIP.wav";
              a.click();
              btnClaim.innerText = "DESCARGA COMPLETADA";
          }, 1500);
  
        } else {
          btnClaim.innerText = "ACCESO DENEGADO (0 NFTs)";
          btnClaim.style.background = "rgba(255, 0, 60, 0.4)";
          btnClaim.style.borderColor = "#ff003c";
          setTimeout(() => {
            btnClaim.innerText = "⬇️ DL MASTER MÁXIMO [OWN NFT]";
            btnClaim.style.background = "rgba(46, 80, 144, 0.4)";
            btnClaim.style.borderColor = "rgba(242, 221, 51, 0.8)";
          }, 3000);
        }
  
      } catch (error) {
        console.error("[CORTEX NFT-GATE] Error:", error);
        btnClaim.innerText = "ERROR EN CONEXIÓN";
        setTimeout(() => {
            btnClaim.innerText = "⬇️ DL MASTER MÁXIMO [OWN NFT]";
        }, 3000);
      }
    });
  });
  
