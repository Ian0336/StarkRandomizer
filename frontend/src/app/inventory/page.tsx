// @ts-nocheck
'use client'
import React, { useEffect } from "react";
import {Card, CardBody, CardFooter, Image} from "@nextui-org/react";
import {cardImgs, allCards, contractAddresses} from '../_utils/helper'
import useFetchNFT from "../_utils/hooks/useFetchNFT";
import { Spinner } from "@nextui-org/react";
import { useAccount } from "@starknet-react/core";


const Home = () => {
  const {address} = useAccount();
  const [loading, setLoading] = React.useState(false)
  const [nftIdList, setNftIdList] = React.useState([])
  const [nftIdNums, setNftIdNums] = React.useState([])
  const nft1 = useFetchNFT(1)
  const nft2 = useFetchNFT(2)
  const nft3 = useFetchNFT(3)
  const nft4 = useFetchNFT(4)
  const nft5 = useFetchNFT(5)
  useEffect(() => {
    let tmp = []
    for (let i = 0; i < allCards.length; i++) {
      let id = allCards[i]
      // add to nftIdList with nftIdNums[i] times
      for (let j = 0; j < nftIdNums[id]; j++) {
        tmp.push(id)
      }
    }
    setNftIdList(tmp)
  }, [nftIdNums])
  useEffect(() => {
    if(nft1.isLoading === false && nft2.isLoading === false && nft3.isLoading === false && nft4.isLoading === false && nft5.isLoading === false) {
      setLoading(false)
      setNftIdNums([0, nft1.value, nft2.value, nft3.value, nft4.value, nft5.value]);
    }
  }, [nft1.isLoading, nft2.isLoading, nft3.isLoading, nft4.isLoading, nft5.isLoading])
  return (
    <>
    {loading && address!=null ? <Spinner /> :<></>}
      <div className="gap-10 grid grid-cols-2 sm:grid-cols-5">
        {cardImgs[0] !== undefined ? nftIdList.map((item, index) => (
          <Card key={index} className="bg-transparent border-none shadow-none">
            <CardBody className="overflow-visible p-0">
              <Image
                
                radius="lg"
                width="100%"
                alt={`Card ${item}`}
                className="w-full object-cover h-[330px]"
                src={cardImgs[item].src}
              />
            </CardBody>
            
          </Card>
        )):<></>}
      </div>
    </>
  )
}

export default Home