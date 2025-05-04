// services/web3Service.js
import Web3 from "web3";
import { ABI } from '../lib/utils'
import AbiCore from '../lib/Abis'

// Instancia global de Web3
let web3Instance = null;

// Conectar la wallet y obtener la cuenta
export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const web3 = new Web3(window.ethereum);
            web3Instance = web3;  // Guarda la instancia de web3 si la necesitas en otro lugar

            // Solicitar cuentas de la wallet
            const accounts = await web3.eth.requestAccounts();
            if (accounts.length === 0) {
                throw new Error("No se encontraron cuentas en la wallet");
            }

            const account = accounts[0]; // Usar la primera cuenta
            const zyrcleCoreAbi = AbiCore;
            const zyrcleCoreAddress = "0x6312374fFCe6e7967021d740805e34E3adD24AAf"; // Dirección del contrato ZyrcleCore

            // Solo inicializamos el contrato si tenemos una cuenta válida
            const zyrcleCore = new web3.eth.Contract(zyrcleCoreAbi, zyrcleCoreAddress);

            return { account, zyrcleCore };  // Retorna la cuenta y el contrato
        } catch (error) {
            console.error("Error al conectar con la wallet:", error);
            throw new Error("No se pudo conectar con la wallet o no se pudo obtener la cuenta");
        }
    } else {
        throw new Error("No se detectó una wallet Ethereum");
    }
};


// Verificar si la wallet está conectada
export const isWalletConnected = async () => {
    if (web3Instance && window.ethereum) {
        const accounts = await web3Instance.eth.getAccounts();
        return accounts.length > 0;
    }
    return false;
};

// Obtener la cuenta conectada
export const getWalletAddress = async () => {
    if (web3Instance && window.ethereum) {
        const accounts = await web3Instance.eth.getAccounts();
        return accounts.length > 0 ? accounts[0] : null;
    }
    return null;
};

// Detectar cambios de cuenta
export const listenForAccountChange = (callback) => {
    if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
                callback(accounts[0]); // Llamamos al callback con la nueva cuenta
            } else {
                callback(null); // Si no hay cuentas, pasa null
            }
        });
    }
};

export const depositWaste = async (contract, account, weightInKg) => {
    try {
        // Convertir a wei si el contrato espera en otra unidad, por ahora asumimos kg como uint256
        const tx = await contract.methods.depositWaste(weightInKg).send({ from: account });
        console.log("Transacción exitosa:", tx);
        return tx;
    } catch (error) {
        console.error("Error al ejecutar depositWaste:", error);
        throw new Error("No se pudo registrar el depósito de reciclaje.");
    }
};
