# Zyrcle - Sustainable Recycling dApp

**Zyrcle** is a decentralized application (dApp) that revolutionizes recycling using the **Avalanche** blockchain, IoT sensors, and AI. Built with **React** for a dynamic frontend and **Web3.js** for blockchain interactions, Zyrcle enables users to recycle materials, earn ZYRCLE tokens, mint carbon credit NFTs, and purchase eco-friendly products while tracking environmental impact.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Pages and Functionali](#pages-and-functionalities)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

Zyrcle promotes sustainable recycling by leveraging **Avalanche** for transparent transactions, **IoT smart containers** for material tracking, and **AI** for optimized waste collection routes. Users connect wallets (e.g., MetaMask), access containers, earn ZYRCLE tokens, mint carbon credit NFTs, and redeem tokens in a marketplace, contributing to a cleaner planet.

## Tech Stack

- **Frontend**: React (v18.x) for responsive UI components and state management.
- **Blockchain**: Web3.js (v4.x) for Avalanche network interactions and smart contract calls.
- **Wallet**: MetaMask for authentication and transaction signing.
- **Blockchain Network**: Avalanche (mainnet or Fuji testnet).
- **External Tech**: IoT sensors for container data, AI for route optimization.
- **Styling**: [Assumed Tailwind CSS or similar, customizable].
- **Additional Libraries**: Chart.js (for dashboards), Leaflet (for collection maps).

## Pages and Functionali

Zyrcle’s pages are built with **React** components and use **Web3.js** for blockchain interactions on Avalanche. Below are the key pages and their functionalities.

### 1. Home Page (`/`)

- **Purpose**: Introduces Zyrcle and connects user wallets.
- **Functionalities**:
  - Displays platform stats (e.g., 120+ tons recycled, 10,000+ ZYRCLE tokens distributed).
  - **Wallet Connection**: Links MetaMask to display the user’s address (e.g., `0xEBf7...656F`).
    ```javascript
    import Web3 from 'web3';

    const connectWallet = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return await web3.eth.getAccounts()[0];
      } else {
        alert('Please install MetaMask!');
      }
    };
    ```
  - Outlines the process: Connect, recycle, earn, spend.
- **React Features**: Uses `useState` for wallet state and `useEffect` for Web3.js initialization.

### 2. Residents Page (`/residents`)

- **Purpose**: Manages resident recycling activities.
- **Subsections**:
  - **Recycling Access**:
    - Unlocks IoT smart containers via QR code scanning or 6-digit code entry.
    - Shows ZYRCLE balance (e.g., 760,000 ZIR).
    - **Web3.js**: Verifies wallet-based access to containers.
      ```javascript
      const unlockContainer = async (account, contractAddress, abi, code) => {
        const contract = new web3.eth.Contract(abi, contractAddress);
        return await contract.methods.unlockContainer(code).call({ from: account });
      };
      ```
    - **React Features**: Implements QR scanner and manual code input form.
  - **Residence Dashboard**:
    - Tracks recycling for a residence (e.g., Green Valley Apartments).
    - Displays metrics: Containers (4), weight (36.3 kg), ZYRCLE tokens (72.4), CO₂ saved (7.5 kg).
    - Visualizes material types (plastic, paper, glass, metal) and CO₂ reduction via charts.
    - Monitors container status (e.g., 68% fill, 12.4 kg for Plastic).
    - **Web3.js**: Fetches token earnings and IoT data from contracts.
      ```javascript
      const getContainerStats = async (account, contractAddress, abi) => {
        const contract = new web3.eth.Contract(abi, contractAddress);
        return await contract.methods.getContainerStats().call({ from: account });
      };
      ```
    - **React Features**: Uses Chart.js for graphs and `useEffect` for real-time updates.

### 3. Collectors Page (`/collectors`)

- **Purpose**: Supports waste collectors with AI-optimized routes.
- **Subsection**:
  - **Collectors Dashboard**:
    - Displays collection routes in Medellín (e.g., Calle 33 #76-120, 92% full, Organic).
    - Provides a Leaflet map for navigation and route optimization.
    - Tracks stats: Weight (0 kg today), containers (0), CO₂ saved (0 kg monthly).
    - Allows confirming deliveries to drop-off centers.
    - **Web3.js**: Logs collection events on Avalanche.
      ```javascript
      const confirmDelivery = async (account, contractAddress, abi, routeId) => {
        const contract = new web3.eth.Contract(abi, contractAddress);
        await contract.methods.confirmDelivery(routeId).send({ from: account });
      };
      ```
    - **React Features**: Integrates Leaflet for maps, `useState` for route updates, and buttons for navigation.

### 4. My Certificates Page (`/my-certificates`)

- **Purpose**: Displays minted carbon credit NFTs.
- **Functionalities**:
  - Lists user’s NFTs (e.g., Gold, Silver, Bronze certificates for CO₂ savings).
  - Shows “No certificates minted” if none exist.
  - **Web3.js**: Queries NFT ownership via ERC-721 contract.
    ```javascript
    const getNFTs = async (account, contractAddress, abi) => {
      const contract = new web3.eth.Contract(abi, contractAddress);
      return await contract.methods.getUserNFTs(account).call();
    };
    ```
- **React Features**: Uses `useState` to render NFT list dynamically.

### 5. Validators Page (`/validators`)

- **Purpose**: Manages real-time recycling event validation.
- **Subsection**:
  - **Validator Panel**:
    - Filters drop-off events by date and status.
    - Allows validators to verify recycling transactions.
    - **Web3.js**: Validates events on Avalanche blockchain.
      ```javascript
      const validateEvent = async (account, contractAddress, abi, eventId) => {
        const contract = new web3.eth.Contract(abi, contractAddress);
        await contract.methods.validateEvent(eventId).send({ from: account });
      };
      ```
    - **React Features**: Implements filter forms and event tables with `useState`.

### 6. Marketplace Page (`/marketplace`)

- **Purpose**: Allows spending ZYRCLE tokens on eco-friendly products.
- **Functionalities**:
  - Lists carbon credit certificates (e.g., Gold: 2 tons CO₂, 200 ZYRCLE; Silver: 1 ton, 100 ZYRCLE).
  - Supports “Add to Cart” for purchasing via smart contracts.
  - Shows ZYRCLE balance (e.g., 760,000 ZYRCLE).
  - **Web3.js**: Executes token transactions.
    ```javascript
    const purchaseCertificate = async (account, contractAddress, abi, certId, price) => {
      const contract = new web3.eth.Contract(abi, contractAddress);
      await contract.methods.buyCertificate(certId).send({ from: account, value: price });
    };
    ```
- **React Features**: Uses `useState` for cart and balance updates, product grid with filtering.

## Installation

To run Zyrcle locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/zyrcle.git
   cd zyrcle
Install Dependencies:
bash
npm install
Required dependencies:
json
{
  "dependencies": {
    "react": "^18.2.0",
    "web3": "^4.16.0",
    "chart.js": "^4.0.0",
    "leaflet": "^1.9.0"
  }
}
Set Up Environment Variables:
Create a .env file:
env
REACT_APP_AVALANCHE_NODE_URL=https://api.avax-test.network/ext/bc/C/rpc
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
Run the App:
bash
npm start
Access at http://localhost:3000.
Usage
Connect Wallet: On /, connect MetaMask to authenticate.
Recycle: Use /residents to unlock containers via QR codes or codes.
Track Progress: Monitor metrics on the Residence Dashboard.
Collect Waste: Navigate routes on /collectors and confirm deliveries.
View NFTs: Check minted certificates on /my-certificates.
Shop: Purchase certificates in /marketplace.
Validate: Manage events on /validators.
Contributing
To contribute:
Fork the repository.
Create a branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add feature").
Push (git push origin feature/your-feature).
Open a pull request.
License
MIT License. See LICENSE for details.
