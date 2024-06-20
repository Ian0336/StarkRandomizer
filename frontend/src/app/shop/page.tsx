// @ts-nocheck
'use client'
import React from 'react'
import buy_card_banner from "../../img/banner.jpg";
import {Card, CardHeader, CardBody, Image, Button, CardFooter} from '@nextui-org/react'
import {Popover, PopoverTrigger, PopoverContent} from "@nextui-org/react";
import { useAccount } from '@starknet-react/core';
const Home = () => {
  const {address} = useAccount();
  return (
    <>
    <Card className="col-span-12 sm:col-span-4 h-[500px] bg-transparent border-none">
      
      <Image
        removeWrapper
        alt="Card background"
        className="z-0 w-full h-full object-cover"
        src={buy_card_banner.src}
      />
      <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
        <div className="flex flex-grow gap-20 items-center justify-end pr-10">
        <Popover placement='up'>
          <PopoverTrigger>
            <Button color="default" variant="faded" className='w-1/6'>
              Get 1 card  !
            </Button>
          </PopoverTrigger>
          {address==null?(<PopoverContent className='text-black'>
            <div className="px-1 py-2">
              <div className="text-small font-bold text-red-400">Please connect your wallet</div>
            </div>
          </PopoverContent>):(<></>)}
        </Popover>
        <Popover placement='up'>
          <PopoverTrigger>
            <Button color="default" variant="faded" className='w-1/6'>
              Get 10 cards !
            </Button>
          </PopoverTrigger>
          {address==null?(<PopoverContent className='text-black'>
            <div className="px-1 py-2">
              <div className="text-small font-bold text-red-400">Please connect your wallet</div>
            </div>
          </PopoverContent>):(<></>)}
        </Popover>
          
          
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