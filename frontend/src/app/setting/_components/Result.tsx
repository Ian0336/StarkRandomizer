// @ts-nocheck
'use client'
import React from 'react'
import {Accordion, AccordionItem, Image, Button} from "@nextui-org/react";
import {cardImgs, unitPoolInfo, drawPoolInfo} from '../../_utils/helper'

const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const Result = ({nextOne}) => {
  return (
    <> 
      <Accordion className='text-white'>
      {drawPoolInfo.map((item, index) => (
          <AccordionItem key={index} aria-label={item.name}  title={item.name}>
            <Accordion className='text-white'>
            {item.unit_pool.map((unit, i) => (
              <AccordionItem key={i} aria-label={unitPoolInfo[unit].name} subtitle={"100%"} title={unitPoolInfo[unit].name}>
                  <Accordion className='text-white' key={i}>
                  {unitPoolInfo[unit].cards.map((card, j) => (
                      <AccordionItem key={j} aria-label={`Card ${card}`} title={`Card ${card}`}>
                        <Image src={cardImgs[card].src} alt={`Card ${card}`} width={100} height={100} />
                      </AccordionItem>
                  ))}
                </Accordion>
              </AccordionItem>
            ))}
            </Accordion>
          </AccordionItem>
        ))  
      }
      
    </Accordion>
    <Button color="default" variant="faded" size='lg' onPress={nextOne}>
      GO TO BUY NOW !!
    </Button>
  </>
  )
}

export default Result