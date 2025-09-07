# 🌿 Indigenous Art Authentication Ledger

Welcome to a groundbreaking Web3 solution for authenticating indigenous art! This project uses the Stacks blockchain and Clarity smart contracts to create an immutable ledger that verifies the origins and authenticity of indigenous artworks, protecting creators from forgeries and exploitation in global markets. By leveraging blockchain's transparency, it empowers indigenous communities to maintain control over their cultural heritage while enabling secure, verifiable transactions.

## ✨ Features

🔒 Immutable registration of art pieces with provenance data  
📜 Digital certificates of authenticity tied to NFTs  
🛡️ Forgery detection through hash-based verification and community validation  
💰 Royalty distribution for creators on every resale  
🌍 Global marketplace integration for fair trade  
⚖️ Dispute resolution mechanism for authenticity claims  
👥 Community governance for indigenous-led oversight  
🔍 Public query tools for verifying art history  

## 🛠 How It Works

This project addresses the real-world problem of indigenous art forgeries, where counterfeit pieces flood markets, undervaluing genuine works and eroding cultural integrity. By providing a decentralized, tamper-proof system, artists can prove creation dates, origins, and ownership, while buyers gain confidence in their purchases.

The system involves 8 smart contracts written in Clarity, each handling a specific aspect of the authentication and transaction lifecycle:

1. **ArtRegistry.clar**: Handles registration of new art pieces, storing hashes, metadata (e.g., artist info, cultural significance), and timestamps.  
2. **AuthenticityNFT.clar**: Mints NFTs as digital certificates, linking physical art to blockchain records.  
3. **OwnershipTransfer.clar**: Manages secure transfers of ownership, updating provenance chains.  
4. **RoyaltyDistributor.clar**: Enforces automatic royalty payments (e.g., 10% to original creators) on resales.  
5. **ForgeryVerifier.clar**: Allows verification of art hashes against registered records and flags potential duplicates.  
6. **MarketplaceEscrow.clar**: Facilitates escrowed sales with buyer/seller protections and authenticity checks.  
7. **DisputeResolver.clar**: Enables community or expert-voted resolutions for disputes, with staking for integrity.  
8. **GovernanceDAO.clar**: Permits indigenous community members to vote on protocol updates, fees, or blacklisting forgers.

**For Indigenous Artists/Creators**  
- Generate a unique hash (e.g., SHA-256) of your artwork (digital scan or photo).  
- Call the `register-art` function in ArtRegistry.clar with the hash, title, description, cultural metadata, and proof of indigenous origin.  
- Mint an NFT via AuthenticityNFT.clar to create a verifiable digital twin.  
- List for sale on the marketplace, setting royalty terms.  

Your art is now protected with an immutable timestamp and provenance trail!

**For Buyers/Collectors**  
- Use ForgeryVerifier.clar to check an art piece's hash against the ledger.  
- Purchase via MarketplaceEscrow.clar, where funds are held until authenticity is confirmed.  
- Transfer ownership securely, with royalties automatically distributed.  

Instant peace of mind with blockchain-backed verification.

**For Verifiers/Communities**  
- Query art details using public read functions in ArtRegistry.clar or OwnershipTransfer.clar.  
- Participate in governance via GovernanceDAO.clar to maintain cultural accuracy.  
- Initiate disputes in DisputeResolver.clar if forgery is suspected, providing evidence for resolution.  

This ensures indigenous voices lead the platform, fostering trust and economic empowerment.