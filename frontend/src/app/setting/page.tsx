// @ts-nocheck
'use client'
import React from 'react'
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/react";
import SetUnit from './_components/SetUnit';
import SetDraw from './_components/SetDraw';
import Result from './_components/Result';
import SetTokenAmount from './_components/SetTokenAmount';
import { useRouter } from 'next/navigation'
import { useAccount } from '@starknet-react/core';



const Home = () => {
  const {address} = useAccount();
  const rounter = useRouter()
  const [curState, setCurState] = React.useState(0)
  React.useEffect(() => {
    if(address === null){
      rounter.push('/shop')
    }
  }, [])
  const nextOne = () => {
    setCurState(curState + 1);
    if (curState === 3){
      rounter.push('/shop')
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  return (
    <div className='items-center w-[90%] max-w-[1280px]'>
      <Breadcrumbs size='lg' color='foreground' variant="solid" separator='' className='pb-3 w-full'>
        <BreadcrumbItem isCurrent={curState === 0}  className='mx-3'>Set Token Pool</BreadcrumbItem>
        <BreadcrumbItem className='mx-3'>{'>>>'}</BreadcrumbItem>
        <BreadcrumbItem isCurrent={curState === 1}  className='mx-3'>Set Unit Pool</BreadcrumbItem>
        <BreadcrumbItem className='mx-3'>{'>>>'}</BreadcrumbItem>
        <BreadcrumbItem isCurrent={curState === 2} className='mx-3'>Set Drawing Pool</BreadcrumbItem>
        <BreadcrumbItem className='mx-3'>{'>>>'}</BreadcrumbItem>
        <BreadcrumbItem isCurrent={curState === 3} className='mx-3'>Current Configurations</BreadcrumbItem>
      </Breadcrumbs>
      {curState === 0 && <SetTokenAmount nextOne={nextOne} />}
      {curState === 1 && <SetUnit nextOne={nextOne} />}
      {curState === 2 && <SetDraw nextOne={nextOne} />}
      {curState === 3 && <Result nextOne={nextOne} />}
    </div>
  )
}

export default Home