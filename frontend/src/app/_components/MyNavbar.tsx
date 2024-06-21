// @ts-nocheck
'use client';
import React, { useEffect } from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import myLogo from "../../img/seekers_alliance_logo.png";
import Image from 'next/image'
import { connectWallet } from "../_utils/chain";
import { useRouter } from 'next/navigation'
import { usePathname, useSearchParams } from 'next/navigation'
import { appState } from '../_utils/state';
import { formatAddress } from "../_utils/helper";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import { useConnect, useDisconnect, useAccount, StarknetChainId } from "@starknet-react/core";

export default function MyNavbar() {
  const { address } = useAccount(); 
  const { disconnect } = useDisconnect();
  const [curPage, setCurPage] = React.useState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  useEffect(() => {
    setCurPage(pathname)
  }, [pathname, searchParams])

  const handleToSetting = () => {
    if(address==null) return;
    router.push('/setting');
  }
  const handleToInventory = () => {
    if(address==null) return;
    router.push('/inventory');
  }

  const handleConnect = () => {
    if(address) {
      disconnect();
    } else {
      onOpen();
    }
  }
  
  return (
    <Navbar className="bg-transparent" maxWidth="full">
      <NavbarBrand justify="start">
        <Image src={myLogo} alt="Seekers Alliance" width={300} height={300} className=""/>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-20" justify="center">
        <NavbarItem isActive = {curPage === "/shop"}>
          <Link className="text-white" onPress={() => router.push('/shop')} href="#">
          DRAW CARDS
          </Link>
        </NavbarItem>
        <NavbarItem isActive = {curPage === "/inventory"}>
          <Popover placement='up'>
          <PopoverTrigger>
          <Link className="text-white" onPress={handleToInventory} href="#" aria-current="page">
          INVENTORY
          </Link>
          </PopoverTrigger>
          {address==null?(<PopoverContent className='text-black'>
            <div className="px-1 py-2">
              <div className="text-small font-bold text-red-400">Please connect your wallet</div>
            </div>
          </PopoverContent>):(<></>)}
        </Popover>
        </NavbarItem>
        
        
        <NavbarItem isActive = {curPage === "/setting"}>
        <Popover placement='up'>
          <PopoverTrigger>
            <Link className="text-white" onPress={handleToSetting} href="#">
            SET DRAWING POOLS
            </Link>
          </PopoverTrigger>
          {address==null?(<PopoverContent className='text-black'>
            <div className="px-1 py-2">
              <div className="text-small font-bold text-red-400">Please connect your wallet</div>
            </div>
          </PopoverContent>):(<></>)}
        </Popover>
          
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        
        <NavbarItem>
          <Button as={Link} color="default" onPress={handleConnect} variant="faded">
            {address ? formatAddress(address) : "Connect Wallet"}
          </Button>
        </NavbarItem>
      </NavbarContent>
      <ConnectModel isOpen={isOpen} onOpenChange={onOpenChange} />
    </Navbar>
  );
}

function ConnectModel({ isOpen, onOpenChange}) {
  const { connect, connectors} = useConnect();
  const { disconnect } = useDisconnect();
  const { address, chainId } = useAccount();
  const [con, setCon] = React.useState(false);
  const handleConnect = async (connector) => {
    await connect({ connector });
    setCon(true);
  }
  React.useEffect(() => {
    if(con) {
      if (chainId != BigInt("0x534e5f5345504f4c4941")) {
        alert("Please connect to Sepolia network");
        disconnect();
        setCon(false);
        return;
      }else{
        setCon(false);
        onOpenChange()
      
      }
    }
  }, [address, chainId])
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
    <ModalContent className="text-black">
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">Connect your wallet</ModalHeader>
          <ModalBody >
            <ul>
              {connectors.map((connector) => (
                <li key={connector.id}>
                  
                  <Button color="default" variant="faded" onPress={() => {handleConnect(connector)}} className="w-full">
                    {connector.name.charAt(0).toUpperCase() + connector.name.slice(1)}
                  </Button>
                </li>
              ))}
            </ul>
          </ModalBody>
          <ModalFooter></ModalFooter>

        </>
      )}
    </ModalContent>
  </Modal>
    
  );
}