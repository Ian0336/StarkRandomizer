'use client';
import Image from "next/image";
import { useConnect } from "@starknet-react/core";
import { useRouter } from 'next/navigation'
import { use, useEffect } from "react";

export default function Home() {
  
  const { connect, connectors } = useConnect();
  const router = useRouter();
  useEffect(() => {
    router.push('/shop', { scroll: true })
    }
  );
 
  
  return (
    <></>
  );
}
