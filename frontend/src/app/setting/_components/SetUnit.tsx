import React from 'react'
import { Button } from '@nextui-org/react'
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {cards} from '../../_utils/helper'
const allCards = [1]
const SetUnit = () => {
  return (
  <div>
    <UnitPool />
    <Button color="default" variant="faded">
      Get 10 cards !
    </Button>
  </div>
  )
}
const UnitPool = () => {
  return (
    <>
    <div className="flex flex-col">
        <p className="text-md">Unit Pool A : Rares</p>
    </div>
    <div className="gap-10 grid grid-cols-2 sm:grid-cols-5">
    {allCards.map((item, index) => (
        <Card shadow="sm" key={index} /* isPressable onPress={() => console.log("item pressed")} */ className="bg-transparent">
          <CardBody className="overflow-visible p-0">
            <Image
              
              radius="lg"
              width="100%"
              alt={`Card ${item}`}
              className="w-full object-cover h-[300px]"
              src={cards[item].src}
            />
          </CardBody>
          <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
        <div className="flex flex-grow gap-2 items-center">
          <Image
            alt="Breathing app icon"
            className="rounded-full w-10 h-11 bg-black"
            src="https://nextui.org/images/breathing-app-icon.jpeg"
          />
          <div className="flex flex-col">
            <p className="text-tiny text-white/60">Breathing App</p>
            <p className="text-tiny text-white/60">Get a good night's sleep.</p>
          </div>
        </div>
        <Button radius="full" size="sm">Get App</Button>
      </CardFooter>
          
        </Card>
      ))}
      </div>
    </>
  )
}

export default SetUnit