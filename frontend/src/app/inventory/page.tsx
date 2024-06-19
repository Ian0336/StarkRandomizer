// @ts-nocheck
'use client'
import React, { useEffect } from "react";
import {Card, CardBody, CardFooter, Image} from "@nextui-org/react";
import {cardImgs, allCards, contractAddresses} from '../_utils/helper'
import useFetchNFT from "../_utils/hooks/useFetchNFT1";


const Home = () => {
  const [nftIdList, setNftIdList] = React.useState([])
  const [nftIdNums, setNftIdNums] = React.useState([])
  const value1 = useFetchNFT(1)
  const value2 = useFetchNFT(2)
  const value3 = useFetchNFT(3)
  const value4 = useFetchNFT(4)
  const value5 = useFetchNFT(5)
  console.log(value1)
  useEffect(() => {
    if (value1 !== undefined && value2 !== undefined && value3 !== undefined && value4 !== undefined && value5 !== undefined) {
      setNftIdNums([0, value1, value2, value3, value4, value5]);
      
    }
    
  }, [value1, value2, value3, value4, value5])
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
  console.log(nftIdList)
  return (
    <div className="gap-10 grid grid-cols-2 sm:grid-cols-5">
      {cardImgs[0] !== undefined ? nftIdList.map((item, index) => (
        <Card key={index} /* isPressable onPress={() => console.log("item pressed")} */ className="bg-transparent border-none shadow-none">
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
  )
}

export default Home