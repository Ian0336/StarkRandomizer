// @ts-nocheck
'use client'
import React, { useEffect } from "react";
import {Card, CardBody, CardFooter, Image} from "@nextui-org/react";
import {cardImgs, allCards, contractAddresses} from '../_utils/helper'
import useFetchNFT from "../_utils/hooks/useFetchNFT";
import { Spinner } from "@nextui-org/react";
import { useAccount } from "@starknet-react/core";
import { appState } from "../_utils/state";
import { useSnapshot } from "valtio";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react"; 
const Home = () => {
  const {address} = useAccount(); 
  const {cardResult} = useSnapshot(appState);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  React.useEffect(() => {
    onOpen();
  }, [])
  return (
    <>
    <VideoModel isOpen={isOpen} onOpenChange={onOpenChange}/>
      <div className="gap-10 grid grid-cols-2 sm:grid-cols-5">
        {cardImgs[0] !== undefined ? cardResult.map((item, index) => (
          <Card key={index} className="bg-transparent border-none shadow-none">
            <CardBody className="overflow-visible p-0">
              <Image
                
                radius="lg"
                width="100%"
                alt={`Card ${item}`}
                className="w-full object-cover h-[330px]"
                src={cardImgs[item].src}
              />
            </CardBody>
            
          </Card>
        )):<></>}
      </div>
    </>
  )
}

export default Home
function VideoModel({ isOpen, onOpenChange}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
    <ModalContent className="text-black">
      {(onClose) => (
        <div>
          <video autoPlay  className="w-full h-full" onEnded={onClose}>
            <source src="/reveal.mp4" type="video/mp4" />
          </video>

        </div>
      )}
    </ModalContent>
  </Modal>
    
  );
} 