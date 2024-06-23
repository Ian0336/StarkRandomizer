# Project Description
Blockchain applications like games and lotteries need random prize distributions but face challenges in maintaining consistent draw rates. For StarkHack, our team developed a smart contract module with a multi-layer structure that enhances NFT design flexibility and resolves the issue where draw rates are dependent on the NFT supply count.
### Smart Contract Stucture
![image](https://hackmd.io/_uploads/SyeQoUrIC.png)
### Draw Contract Design
![image](https://hackmd.io/_uploads/BJJViLHLA.png)
- **TokenID Pool**: This pool contains all possible prizes (NFTs) and is designed for ERC-1155 lotteries that support batch-drawing through the ERC-1155 mintBatch function. It lacks associated rates, allowing it to be replenished without altering existing draw rates. Blockchain developers can set and modify the supply count for each TokenID (prize) independently. The maximum values for supply count and type are 2^32 - 1 and 2^256 - 1, respectively.

- **Unit Pools**: Each Unit Pool contains a set of draw rates for the corresponding TokenIDs from the TokenID Pool. Multiple Unit Pools can be configured with desired probabilities for the given TokenIDs, providing flexibility in use case design.

- **Drawing Pools**: These pools can draw from multiple Unit Pools with varying probabilities for each. Developers can combine multiple Unit Pools and Drawing Pools to create the desired probability distribution. Having multiple Drawing Pools allows for setting different draw rates for Unit Pools in each, such as having a “privileged” Drawing Pool with higher Rare draw rates.

When the supply count of a TokenID is reached, its own probability will be set to 0%, while the Unit Pool’s probability remains constant. This allows the player to continue to have the same percentage chance of pulling a Rare, even when one of the Rare cards has reached its mint cap. Only when all TokenIDs corresponding to the same Unit Pool are exhausted, does the TokenID pool need to be replenished, or the Drawing Pool will simply continue to pull from other Unit Pools. The game developers can avoid this issue entirely by always setting at least one TokenID in the Unit Pool to have an unlimited supply. 
### Contracts

**Starknet Sepolia**
| Contract Name                    | Address                                                                                                                                                                                 |                                          Purpose                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |:-----------------------------------------------------------------------------------------:|
| StarkRandomizer Drawing Contract | [0x044f4d8d0714f230c0d998f07419841940a1784614c6f79d28dc73e900faa189](https://sepolia.starkscan.co/contract/0x044f4d8d0714f230c0d998f07419841940a1784614c6f79d28dc73e900faa189#overview) | Requests a random number from the VRFManager and mints the corresponding NFT(s) to user. |
| ERC-1155 NFT Contract            | [0x0523725a2e321a46ee5d55080e53c9b52c5a3dbb9d003413aa7e1735118a33f6](https://sepolia.starkscan.co/contract/0x0523725a2e321a46ee5d55080e53c9b52c5a3dbb9d003413aa7e1735118a33f6#overview) |ERC-1155 contract for minting NFTs.
| VRF Manager Contract             | [0x051d6475f06b8031c8cb6eb075f011ae884a706d3993e002863e64b995312c93](https://sepolia.starkscan.co/contract/0x051d6475f06b8031c8cb6eb075f011ae884a706d3993e002863e64b995312c93#overview) |Communicates with the Pragma VRF Contract. |
| Pragma VRF Contract     | [0x060c69136b39319547a4df303b6b3a26fab8b2d78de90b6bd215ce82e9cb515c](https://sepolia.starkscan.co/contract/0x060c69136b39319547a4df303b6b3a26fab8b2d78de90b6bd215ce82e9cb515c#overview)     | A VRF Contract provided by Pragma that generates trusted random numbers.     |

### Frontend

- Built with the Next.js framework.
- Interacts with the contracts using the starknet-react library.
- Deployed with Vercel.
