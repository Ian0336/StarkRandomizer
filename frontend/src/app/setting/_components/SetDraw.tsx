//@ts-nocheck
'use client'
import React from 'react'
import { Button } from '@nextui-org/react'
import {Card, CardHeader, CardBody, CardFooter, Divider, Input, Image} from "@nextui-org/react";
import {cardImgs, unitPoolInfo, drawPoolInfo} from '../../_utils/helper'
import { useContract, useContractWrite, useAccount } from '@starknet-react/core';
import drawAbi from '../../_utils/abi/drawAbi.json';
import { contractAddresses } from '../../_utils/helper';
import { appState } from '../../_utils/state';
import { snapshot } from 'valtio';

const SetDraw = ({nextOne}) => {
  const [loading, setLoading] = React.useState(false)
  return (
  <div>
    {drawPoolInfo.map((item, index) => (
        <DrawPool key={index} id={index} setLoading={setLoading}/>
    ))}
    <Button color="default" variant="faded" size='lg' onPress={nextOne} isLoading={loading}>
      Next Step !!
    </Button>
  </div>
  )
}
const DrawPool = ({id, setLoading}) => {
  const [tmpProp, setTmpProp] = React.useState([])
  const [prop, setProp] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [tokenIds, setTokenIds] = React.useState([])
  React.useEffect(() => {
    setTmpProp(new Array(drawPoolInfo[id].unit_pool.length).fill(0))
  }, [])
  React.useEffect(() => {
    let all_non_zero_idx = [];
    let non_zero_val = [];
    for(let i = 0; i < tmpProp.length; i++){
      let val = Math.round(Number(tmpProp[i]*100));
      if(tmpProp[i] !== 0){
        all_non_zero_idx.push(i)
        non_zero_val.push(val)
      }
    }
    setTokenIds(prev=>all_non_zero_idx)
    setProp(prev=>non_zero_val)
  }, [tmpProp])
  /* React.useEffect(() => {
    setLoading(isPending)
    setIsLoading(isPending)
  }, [isPending]) */
  const handleSetDrawingPool = () => {
    appState.drawingPoolProps[id].unit_pool_prop = prop.map((item) => Math.round(item/100))
    appState.drawingPoolProps[id].unit_pool = tokenIds
    writeAsync()
  }

  // contract call
  const { address} = useAccount();
    

  const { contract } = useContract({
    abi: drawAbi,
    address: contractAddresses.draw_contract,
  });

  const calls = React.useMemo(() => {
    if (!address || !contract) return [];
    return contract.populateTransaction["set_drawing_pool"]!(id, tokenIds, prop);
  }, [contract, address, tokenIds, prop, id]);

  const {
    writeAsync,
    data,
    isPending,
  } = useContractWrite({
    calls,
  }); 
// contract call

  return (
    <div className='border mb-5 p-3'>
    <div className="flex flex-col">
        <p className="text-md">{drawPoolInfo[id].name}</p>
    </div>
    <Divider className="my-4 bg-white" />
    <div className="gap-10 grid grid-cols-2 sm:grid-cols-5">
    {drawPoolInfo[id].unit_pool.map((item, index) => (
        <Card shadow="sm" key={index} className="bg-transparent">
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
            onChange={(e) => {setTmpProp(tmpProp.map((item, i) => i === index ? Number(e.target.value) : item))}}
            />
            </CardFooter>
        </Card>
      ))}
        
      </div>
      <Button color="default" variant="faded" className='w-1/4 mt-3' size='lg' isLoading={isPending} onPress={handleSetDrawingPool}>
            {`Set ${drawPoolInfo[id].short}`}
      </Button>
    </div>
  )
}

export default SetDraw