import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const withdrawButton = document.getElementById("withdrawButton");
const amountFunded = document.getElementById("amountFunded");
const balanceButton = document.getElementById("balanceButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;
balanceButton.onclick = balance;

async function connect() {
    if (typeof window.ethereum != "undefined") {
        console.log("Metamask detected");
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        console.log("Connected.");
        console.log(`Connected accounts: ${accounts}`);
    } else {
        console.log("Metamask not detected.");
        connectButton.innerHTML = "Please install Metamask";
    }
}

async function fund() {
    const ethAmount = amountFunded.value;
    console.log(`Funding with ${ethAmount}ETH...`);
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.cheaperWithdraw();
            listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}

async function balance() {
    console.log("Checking balance...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log(signer);
    const balance = await provider.getBalance(contractAddress);
    document.getElementById("currentBalance").innerHTML =
        ethers.utils.formatEther(balance);
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                );
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}
