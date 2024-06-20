// @ts-nocheck
'use client'
import React from 'react'
import buy_card_banner from "../../img/banner.jpg";
import {Card, CardHeader, CardBody, Link, Image, Button, CardFooter} from '@nextui-org/react'
import {Popover, PopoverTrigger, PopoverContent} from "@nextui-org/react";
import { useAccount, useProvider } from '@starknet-react/core';import { useBlock } from "@starknet-react/core";
import { BlockNumber } from "starknet";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import drawAbi from '../_utils/abi/drawAbi.json';
import { useContract, useContractWrite, useWaitForTransaction } from '@starknet-react/core';
import { contractAddresses } from '../_utils/helper';
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/react";
import { on } from 'events';
import {Uint256, hash, num} from 'starknet';
import {uint256ToBN } from '../_utils/helper';
import { appState } from '../_utils/state';

const Home = () => {
  const {address} = useAccount();
  const model1 = useDisclosure();
  const model2 = useDisclosure();
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
        <Button color="default" variant="faded" className='w-1/4' onPress={()=>{model1.onOpen();console.log('ter')}}>
          Get Normal Packs !
        </Button>
        <Button color="default" variant="faded" className='w-1/4'>
            Get Special Packs !
          </Button>
          
          
        </div>
        
      </CardFooter>
      
      <GetModel isOpen={model1.isOpen} onOpenChange={model1.onOpenChange} idx={0}/>
    </Card>
    </>
  )
}

export default Home
function GetModel({ isOpen, onOpenChange,idx}) {
  const [NFTIds, setNFTIds] = React.useState(null);
  const [curState, setCurState] = React.useState(0);
  const [myEvent, setMyEvent] = React.useState(null);
  const [requestId, setRequestId] = React.useState({low:0, high:0});
  const {provider} = useProvider();
  // State: 0:before submit, 1:submitting, 2:isLoading, 3:get TX(Wait for VRF), 4:get the result
  // contract call
  const { address} = useAccount();
    

  const { contract } = useContract({
    abi: drawAbi,
    address: contractAddresses.draw_contract,
  });

  const calls = React.useMemo(() => {
    if (!address || !contract) return [];
    return contract.populateTransaction["send_request"]!([idx],[10]);
  }, [contract, address, idx]);
  
  const handleBtnPress = async () => {
    if(curState === 0){
      setCurState(1);
      await writeAsync();
      setCurState(2);
    }else if(curState === 4){
      // reset everything
      setCurState(0);
      setNFTIds(null);
      setRequestId({low:0, high:0});
      reset();
      onOpenChange(false);

      
    }
  }
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
    refetchInterval: 2000,
  });
  // contract call

  React.useEffect(() => {
    if (isSubmitting) {
      setCurState(1);
    } else if (isLoading) {
      setCurState(2);
    } else if (receipt) {
      setRequestId({low: receipt.events[0].keys[1], high: receipt.events[0].keys[2]});
      setCurState(3);
    }
  }, [isSubmitting, isLoading, receipt, isSubmitError]);
  // any type of error set state to 0 and reset the form and close the modal
  React.useEffect(() => {
    if (isError || isSubmitError) {
      setCurState(0);
      reset();
      onOpenChange(false);
    }
  }, [isError, isSubmitError]);
  React.useEffect(() => {
      const id = setInterval(() => {
        fetchVRF()
      }, 3000);
    return () => {
        clearInterval(id);
    }
}, [curState])
  const fetchVRF = async () => {
    if(curState !== 3) return;
    const lastBlock = await provider.getBlock('latest');
    const keyFilter = [num.toHex(hash.starknetKeccak('RequestCompleted')), num.toHex(requestId.low), num.toHex(requestId.high)];
    let eventsListObj = await provider.getEvents({
      address: contractAddresses.draw_contract,
      from_block: { block_number: lastBlock.block_number - 9 },
      to_block: { block_number: lastBlock.block_number + 2 },
      keys: [keyFilter],
      chunk_size: 10,
    });
    let eventsList = eventsListObj.events;

    
    for(let i = 0; i < eventsList.length; i++){
      console.log(eventsList[i].keys[1], requestId.low, eventsList[i].keys[2], requestId.high)
      
      if(eventsList[i].keys[1] == requestId.low && eventsList[i].keys[2] === requestId.high){
        console.log(eventsList[i].data);
        let tmp = eventsList[i].data.slice(2)
        let tmp2 = []
        console.log(tmp);
        for (let i = 0; i < tmp.length; i+=2){
          let u256T = {low: tmp[i], high: tmp[i+1]}
          tmp2.push(uint256ToBN(u256T))
        }
        setMyEvent(eventsList[i])
        setCurState(4);
        setNFTIds(tmp2);
        appState.cardResult = tmp2;
        break;
      }
    
    }
  }
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl' isDismissable={false}>
    <ModalContent className="text-black">
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">{
            curState === 0 ? `Get 10 ${idx == 0 ? "Normal" : "Special"} Packs` :
            curState === 1 ? "Submitting..." :
            curState === 2 ? "Loading..." :
            curState === 3 ? "Wait for VRF..." :
            curState === 4 ? "Open your packs" : ""
            }</ModalHeader>
          <ModalBody >
            {curState === 3 ?(<div>Request Transaction Hash: <Link onPress={() => window.open(`https://sepolia.starkscan.co/tx/${receipt.transaction_hash}`, '_blank').focus()}>{receipt.transaction_hash}</Link></div>) : ""}
            {curState === 4 ?(<div>VRF Transaction Hash: <Link onPress={() => window.open(`https://sepolia.starkscan.co/tx/${myEvent.transaction_hash}`, '_blank').focus()}>{myEvent.transaction_hash}</Link></div>) : ""}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="faded" className='w-1/4' isLoading={curState!==0&&curState!==4} onPress={handleBtnPress}>
              {curState === 0 ? `Get Now` :'Open Packs'}
            </Button>
          </ModalFooter>

        </>
      )}
    </ModalContent>
  </Modal>
    
  );
}