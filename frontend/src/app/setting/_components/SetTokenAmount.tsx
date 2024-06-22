//@ts-nocheck
'use client'
import React from 'react'
import { Button } from '@nextui-org/react'
import {Card, CardHeader, CardBody, CardFooter, Divider, Input, Image} from "@nextui-org/react";
import {allCards, cardImgs, unitPoolInfo} from '../../_utils/helper'
import { useContract, useContractWrite, useAccount, useWaitForTransaction } from '@starknet-react/core';
import drawAbi from '../../_utils/abi/drawAbi.json';
import { contractAddresses } from '../../_utils/helper';
import { appState } from '../../_utils/state';
import { snapshot } from 'valtio';

const SetTokenAmount = ({nextOne}) => {
  const [loading, setLoading] = React.useState(false)
  const [setNumber, setSetNumber] = React.useState(0)

  return (
  <div>
    <TokenPool setLoading={setLoading} setSetNumber={setSetNumber}></TokenPool>
    <Button color="default" variant="faded" size='lg' onPress={nextOne} isLoading={loading} isDisabled={setNumber!=1}>
        NEXT
    </Button>
  </div>
  )
}
const TokenPool = ({setLoading, setSetNumber}) => {
  const [amount, setAmount] = React.useState([0,0,0,0,0])
  const { address} = useAccount();
    const handleTokenAmount = async() => {
      if(address == null){
        alert('Please connect wallet first');
        return
      }
      writeAsync()
    }
    
    // contract call
    

    const { contract } = useContract({
      abi: drawAbi,
      address: contractAddresses.draw_contract,
    });

    const calls = React.useMemo(() => {
      if (!address || !contract) return [];
      return contract.populateTransaction["set_token_max_amount"]!(amount);
    }, [contract, address, amount]);

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
      if(receipt){
        setSetNumber(prev=>prev+1)
      }
    }, [receipt])
  // contract call

  return (
    <div className='border mb-5 p-3'>
    <div className="flex flex-col">
        <p className="text-md">TokenID Pool</p>
    </div>
    <Divider className="my-4 bg-white" />
    <div className="gap-3 grid grid-cols-5 sm:grid-cols-5">
    {allCards.map((item, index) => (
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
            placeholder="Unlimited"
            value={amount[index] == 0 ? 'Unlimited' : amount[index]}
            onChange={(e) => {setAmount(amount.map((item, i) => i === index  && !isNaN(Number(e.target.value)) ? Number(e.target.value) : item))}}
            />
            <Button color="default" className='ml-1' variant="faded" size='sm' onPress={() => setAmount(amount.map((item, i) => i === index ? 0 : item))}>
              <span className='text-lg text-red-500'>∞</span>
            </Button>
            </CardFooter>
        </Card>
      ))}
        
      </div>
      <Button color="default" variant="faded" className='w-1/4 mt-3' size='lg' onPress={handleTokenAmount} isLoading={isLoading}>
        Set Token Availability
      </Button>
    </div>
  )
}

export default SetTokenAmount