'use client'
import React from "react";
import {Card, CardBody, CardFooter, Image} from "@nextui-org/react";
import {cards, allCards} from '../_utils/helper'


const Home = () => {
  return (
    <div className="gap-10 grid grid-cols-2 sm:grid-cols-5">
      {cards[0] !== undefined ? allCards.map((item, index) => (
        <Card shadow="sm" key={index} /* isPressable onPress={() => console.log("item pressed")} */ className="bg-transparent">
          <CardBody className="overflow-visible p-0">
            <Image
              
              radius="lg"
              width="100%"
              alt={`Card ${item}`}
              className="w-full object-cover h-[330px]"
              src={cards[item].src}
            />
          </CardBody>
          
        </Card>
      )):<></>}
    </div>
  )
}

export default Home