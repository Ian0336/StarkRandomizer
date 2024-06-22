//@ts-nocheck
import card1 from "../../img/cards/1.png";
import card2 from "../../img/cards/2.png";
import card3 from "../../img/cards/3.png";
import card4 from "../../img/cards/4.png";
import card5 from "../../img/cards/5.png";

export const cardImgs = [card1, card1, card2, card3, card4, card5];
export const allCards = [1,2,3,4,5];
export const contractAddresses = {
    nft_address: "0x0523725a2e321a46ee5d55080e53c9b52c5a3dbb9d003413aa7e1735118a33f6",
    draw_contract: "0x044f4d8d0714f230c0d998f07419841940a1784614c6f79d28dc73e900faa189",
};
export const unitPoolInfo = [
    {
        name: "Unit Pool A : Rares",
        short:"Unit Pool A",
        cards: [1,2,3,4,5]
    },
    {
        name: "Unit Pool B : Uncommons",
        short:"Unit Pool B",
        cards: [1,2,3,4,5]
    },
    {
        name: "Unit Pool C : Commons",
        short:"Unit Pool C",
        cards: [1,2,3,4,5]
    }
];
export const drawPoolInfo = [
    {
        name: "Drawing Pool A: Normal",
        short:"Drawing Pool A",
        unit_pool:[0,1,2]
    },
    {
        name: "Drawing Pool B: Special",
        short:"Drawing Pool B",
        unit_pool:[0,1,2]
    },
];

export const formatAddress = (address: string) => {
    return address.slice(0,6) + "..." + address.slice(-4);
}
export function uint256ToBN(uint256 /*: Uint256*/) {
    return (BigInt(uint256.high) << 128n) + BigInt(uint256.low);
  }