# AURA — Pre-Signing Transaction Intelligence & Safety Layer on OKX X Layer

> **See exactly what a transaction will do before you approve it.**  
> AURA is a non-custodial, pre-execution security sentinel built for **OKX X Layer (Chain ID 196)**. It translates raw bytecode and complex smart contract interactions into clear, everyday language and intercepts drainer traps before you sign.

---

## 🛡️ Key Features

- **Pre-Execution Simulation**: Decodes transaction payloads and simulates balance changes (`assetDeltas`) before any signature is requested.
- **Plain-English Explanations**: Converts cryptic hexadecimal data and complex smart contract methods into human-friendly explanations.
- **Approval & Exposure Sentinel**: Scans active token permissions across USDT, Native USDC (Circle), USDT0, and WOKB to detect dormant or unlimited allowances.
- **One-Click Risk Mitigation**: Allows users to modify dangerous "Unlimited" approvals into safe, capped allowances (e.g., 1 USDT) before submitting.
- **OKX Wallet Native & Multi-Wallet Support**: Optimized for OKX Wallet with native X Layer detection, alongside MetaMask and WalletConnect.
- **100% Non-Custodial & Read-Only**: Never asks for private keys or seed phrases. Operates strictly as a pre-signing evaluation and simulation layer.

---

## ⚡ Network Details (OKX X Layer)

| Parameter | Mainnet | Enhanced Testnet (Active) |
| :--- | :--- | :--- |
| **Chain ID** | `196` | `1952` *(Note: Deprecated testnet chain ID `195` migrated to `1952`)* |
| **Gas Token** | OKB | OKB |
| **RPC URL** | `https://rpc.xlayer.tech` / `https://xlayerrpc.okx.com` | `https://testrpc.xlayer.tech` |
| **Block Explorer** | [OKX Explorer (X Layer)](https://www.okx.com/web3/explorer/xlayer) | [OKX Explorer (Testnet)](https://www.okx.com/web3/explorer/xlayer-test) |
| **Architecture** | Polygon CDK / EVM Validium Layer 2 | Testnet Environment |

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React
- **Blockchain Interface**: [Viem](https://viem.sh) (EVM interaction, ABI decoding, and multi-RPC state reads configured for Chain IDs 196 & 1952)
- **Backend API**: Express.js, Node.js (`tsx` / `esbuild`)
- **AI Intelligence**: Google Gemini API (`@google/genai`) for grounded risk summaries and question answering

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PinnacleCryptNG/Aura-for-XLayer.git
   cd Aura-for-XLayer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Provide your Gemini API key (if using AI-grounded insights):
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔍 How AURA Works

```
[ DApp / Wallet Interaction ]
            │
            ▼
┌───────────────────────────┐
│  1. Payload Interception  │  Extracts target address, method signature, and calldata
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│  2. On-Chain Simulation   │  Calls real X Layer RPC to compute net asset balance changes
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│  3. Safety & Risk Engine  │  Evaluates spender age, verification, limits, and phishing traps
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│  4. Plain-Words Review    │  Displays clear summary, risk score, and one-click "Limit to 1 USDT"
└───────────────────────────┘
```

---

## 🔒 Security Principles

- **Zero-Storage of Secrets**: No private keys, mnemonic phrases, or personal user data are stored on any server.
- **Fail-Safe Defaults**: If external enrichment services are unavailable, AURA falls back to deterministic on-chain static bytecode analysis and verified ABI parsing.
- **Complementary Safety**: Designed to work seamlessly alongside wallet-level security as an added verification barrier before signatures are committed.

---

## 🧪 How to Test (For Judges)

Judges can test AURA immediately either in live mode with testnet funds or by copying the pre-formatted malicious simulation payload below into the app's payload inspector:

### 1. Claim Testnet OKB
- Get free X Layer Testnet OKB from the official faucet:  
  👉 **[Official OKX X Layer Faucet](https://www.okx.com/xlayer/faucet)** (or switch your OKX Wallet / MetaMask to **X Layer Testnet - Chain ID 1952**).

### 2. Live Threat Simulation (Copy & Paste Test)
Test AURA's real-time interception and plain-English risk breakdown by simulating an **unlimited USDT drainer trap**:

- **Target / Token Contract Address** (USDT on X Layer):
  ```text
  0x1E4a5963aBFD975d8c9021ce480b42188849D41d
  ```
- **Malicious Unlimited Approval Calldata** (Grants unverified spender `0x8391a2...` infinite access `type(uint256).max`):
  ```text
  0x095ea7b30000000000000000000000008391a27f69201f8449c239d1089201a4e8291a27ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
  ```

### 3. What to Observe:
1. **Critical Risk Alert**: AURA flags the unverified contract, 2-day-old interaction history, and unlimited exposure.
2. **Plain-English Translation**: Explains clearly: *"You are granting Unknown Website Trap unlimited permission to spend your USDT."*
3. **One-Click Mitigation**: Click **"Limit to 1 USDT (Recommended)"** to rewrite the calldata to a safe capped allowance of 1 USDT (`0x00000000000000000000000000000000000000000000000000000000000f4240`).

---

## 📄 License

MIT License. Open source and built for the OKX X Layer Web3 ecosystem.
