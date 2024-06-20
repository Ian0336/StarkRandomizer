import card1 from "../../img/cards/1.png";
import card2 from "../../img/cards/2.png";
import card3 from "../../img/cards/3.png";
import card4 from "../../img/cards/4.png";
import card5 from "../../img/cards/5.png";

export const cardImgs = [card1, card1, card2, card3, card4, card5];
export const allCards = [1,2,3,4,5];
export const contractAddresses = {
    nft_address: "0x07b239a8f16a3301bccb00bc073adaebc9f088dbdd393fd88a15b2942bcf1502",
    draw_contract: "0x06bca4d8e24a6225d9c9687b5b476ff0c9af022021665cc9cad2768b585e5008",
};
export const unitPoolInfo = [
    {
        name: "Unit Pool A : Commons",
        short:"Unit Pool A",
        cards: [1,2,3,4,5]
    },
    {
        name: "Unit Pool B : Uncommons",
        short:"Unit Pool B",
        cards: [1,2,3,4,5]
    },
    {
        name: "Unit Pool C : Rares",
        short:"Unit Pool C",
        cards: [1,2,3,4,5]
    }
];
export const drawPoolInfo = [
    {
        name: "Draw Pool A : Normals Card Pack",
        short:"Draw Pool A",
        unit_pool:[0,1,2]
    },
    {
        name: "Draw Pool B : Special Card Pack",
        short:"Draw Pool B",
        unit_pool:[0,1,2]
    },
];

export const formatAddress = (address: string) => {
    return address.slice(0,6) + "..." + address.slice(-4);
}