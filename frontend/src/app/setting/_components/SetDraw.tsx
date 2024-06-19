//@ts-nocheck
'use client'
import React from 'react'
import { Button } from '@nextui-org/react'
import {Card, CardHeader, CardBody, CardFooter, Divider, Input, Image} from "@nextui-org/react";
import {cardImgs, unitPoolInfo, drawPoolInfo} from '../../_utils/helper'

const SetDraw = ({nextOne}) => {
  return (
  <div>
    {drawPoolInfo.map((item, index) => (
        <UnitPool key={index} id={index} />
    ))}
    <Button color="default" variant="faded" size='lg' onPress={nextOne}>
      Next Step !!
    </Button>
  </div>
  )
}
const UnitPool = ({id}) => {
    const [prop, setProp] = React.useState([])
    React.useEffect(() => {
        let tmp = [];
        for (let i = 0; i < drawPoolInfo[id].unit_pool.length; i++) {
            tmp.push(0)
        }
        setProp(tmp)
    }, [])
    console.log(prop)

  return (
    <div className='border mb-5 p-3'>
    <div className="flex flex-col">
        <p className="text-md">{drawPoolInfo[id].name}</p>
    </div>
    <Divider className="my-4 bg-white" />
    <div className="gap-10 grid grid-cols-2 sm:grid-cols-5">
    {drawPoolInfo[id].unit_pool.map((item, index) => (
        <Card shadow="sm" key={index} /* isPressable onPress={() => console.log("item pressed")} */ className="bg-transparent">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-white ">{unitPoolInfo[item].name}</p>
          </CardHeader>
          <CardBody>
            <p className="text-transparent ">Make beautiful websites regardless of your design experience.</p>
          </CardBody>
          <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
            <Input
            type="url"
            placeholder="0"
            endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">%</span>
                </div>
              }
            onChange={(e) => {setProp(prop.map((item, i) => i === index ? Number(e.target.value) : item))}}
            />
            </CardFooter>
        </Card>
      ))}
        <Button color="default" variant="faded">
            {`Set ${drawPoolInfo[id].short}`}
        </Button>
      </div>
    </div>
  )
}

export default SetDraw