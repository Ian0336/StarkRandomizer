//@ts-nocheck
'use client'
import React from 'react'
import { Button } from '@nextui-org/react'
import {Card, CardHeader, CardBody, CardFooter, Divider, Input, Image} from "@nextui-org/react";
import {cardImgs, unitPoolInfo} from '../../_utils/helper'
import { useContract, useContractWrite, useAccount, useWaitForTransaction } from '@starknet-react/core';
import drawAbi from '../../_utils/abi/drawAbi.json';
import { contractAddresses } from '../../_utils/helper';
import { appState } from '../../_utils/state';
import { snapshot } from 'valtio';

const SetUnit = ({nextOne}) => {
  const [loading, setLoading] = React.useState(false)
  const [setNumber, setSetNumber] = React.useState(0)

  return (
  <div>
    {unitPoolInfo.map((item, index) => (
        <UnitPool key={index} id={index} setLoading={setLoading} setSetNumber={setSetNumber}/>
    ))}
    <Button color="default" variant="faded" size='lg' onPress={nextOne} isLoading={loading} isDisabled={setNumber!=3}>
    NEXT
    </Button>
  </div>
  )
}
const UnitPool = ({id, setLoading, setSetNumber}) => {
    const [tmpProp, setTmpProp] = React.useState([])
    const [prop, setProp] = React.useState([])
    const [tokenIds, setTokenIds] = React.useState([])
    const [setted, setSetted] = React.useState(false)
    React.useEffect(() => {
      setTmpProp(new Array(unitPoolInfo[id].cards.length).fill(0))
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
    const handleSetUnitPool = () => {
      // check if the sum of prop is 10000
      let sum = prop.reduce((a, b) => a + b, 0)
      if(sum !== 10000){
        alert("The sum of the probability should be 100")
        return
      }
      appState.unitPoolProp[id].token_pool_prop = prop.map((item) => (item/100).toFixed(2))
      appState.unitPoolProp[id].token_pool = tokenIds
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
      return contract.populateTransaction["set_unit_pool"]!(id, tokenIds, prop);
    }, [contract, address, tokenIds, prop, id]);

    const {
      writeAsync,
      reset,
      data: tx,
      isLoading: isSubmitting,
      isError: isSubmitError,
      error: submitError,
    } = useContractWrite({
      calls,
    });
    const {
      data: receipt,
      isLoading,
      isError,
      error,
    } = useWaitForTransaction({
      hash: tx?.transaction_hash,
      watch: true,
      retry: true,
      refetchInterval: 1000,
    });

    React.useEffect(() => {
      setLoading(isLoading)
    }, [isLoading, setLoading])
    React.useEffect(() => {
      if(setted) return
      if(receipt){
        setSetNumber(prev=>prev+1)
        setSetted(true)
      }
    }, [receipt])
  // contract call
  return (
    <div className='border mb-5 p-3'>
    <div className="flex flex-col">
        <p className="text-md">{unitPoolInfo[id].name}</p>
    </div>
    <Divider className="my-4 bg-white" />
    <div className="gap-3 grid grid-cols-5 sm:grid-cols-5">
    {unitPoolInfo[id].cards.map((item, index) => (
        <Card key={index} className="bg-transparent border-none shadow-none">
          <CardBody className="overflow-visible p-0">
            <Image
              radius="lg"
              width="100%"
              alt={`Card ${item}`}
              className="w-full object-cover"
              src={cardImgs[item].src}
            />
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
      <Button color="default" variant="faded" className='w-1/4 mt-3' size='lg' onPress={handleSetUnitPool} isLoading={isLoading}>
            {`Set ${unitPoolInfo[id].short}`}
      </Button>
    </div>
  )
}

export default SetUnit