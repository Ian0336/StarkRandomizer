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
import { useSnapshot } from 'valtio';
import { formatAddress } from "../_utils/helper";


export default function MyNavbar() {
  const {account} = useSnapshot(appState);
  const [curPage, setCurPage] = React.useState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    setCurPage(pathname)
  }, [pathname, searchParams])
  const handle_connect = async () => {
    await connectWallet();
  }

  return (
    <Navbar className="bg-transparent" >
      <NavbarBrand>
        <Image src={myLogo} alt="Seekers Alliance" width={150} height={150} />
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-20" justify="center">
        <NavbarItem isActive = {curPage === "/shop"}>
          <Link className="text-white" onPress={() => router.push('/shop')} href="#">
            Shop
          </Link>
        </NavbarItem>
        <NavbarItem isActive = {curPage === "/inventory"}>
          <Link className="text-white" onPress={() => router.push('/inventory')} href="#" aria-current="page">
            Inventory
          </Link>
        </NavbarItem>
        <NavbarItem isActive = {curPage === "/setting"}>
          <Link className="text-white" onPress={() => router.push('/setting')} href="#">
            Setting
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        
        <NavbarItem>
          <Button as={Link} color="default" onClick={()=>connectWallet()} variant="faded">
            {account ? formatAddress(account.selectedAddress) : "Connect Wallet"}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
