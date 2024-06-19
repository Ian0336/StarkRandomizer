// @ts-nocheck
'use client'
import React from 'react'
import buy_card_banner from "../../img/buy_cards_banner.png";

import {Card, CardHeader, CardBody, Image, Button, CardFooter} from '@nextui-org/react'

const Home = () => {
  return (
    <>
    {/* <Card className="py-4 bg-transparent border-none">
      
      <CardBody className="overflow-visible py-2">
      <Image src={buy_card_banner} alt="Buy Card Banner" width={1000} height={1000} />

      </CardBody>
    </Card> */}
    <Card className="col-span-12 sm:col-span-4 h-[500px] bg-transparent border-none">
      
      <Image
        removeWrapper
        alt="Card background"
        className="z-0 w-full h-full object-cover"
        src={buy_card_banner.src}
      />
      <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
        <div className="flex flex-grow gap-20 items-center justify-end pr-10">
          <Button color="default" variant="faded" className='w-1/6'>
            Get 1 card  !
          </Button>
          <Button color="default" variant="faded" className='w-1/6'>
            Get 10 cards !
          </Button>
        </div>
        
      </CardFooter>
      {/* <Button color="primary" variant="solid">
        Solid
      </Button>
      <Button color="primary" variant="faded">
        Faded
      </Button>   */}
    </Card>
    </>
  )
}

export default Home