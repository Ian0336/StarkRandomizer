// @ts-nocheck
'use client'
import React from 'react'
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/react";
import SetUnit from './_components/SetUnit';
import SetDraw from './_components/SetDraw';
import Result from './_components/Result';
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
    if (curState === 2){
      rounter.push('/')
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  return (
    <div className='items-center w-full'>
      <Breadcrumbs size='lg' color='foreground' variant="solid" separator='' className='pb-3 w-full'>
        <BreadcrumbItem isCurrent={curState === 0}  className='mx-3'>Set Unit Pool</BreadcrumbItem>
        <BreadcrumbItem className='mx-3'>{'>>>'}</BreadcrumbItem>
        <BreadcrumbItem isCurrent={curState === 1} className='mx-3'>Set Drawing Pool</BreadcrumbItem>
        <BreadcrumbItem className='mx-3'>{'>>>'}</BreadcrumbItem>
        <BreadcrumbItem isCurrent={curState === 2} className='mx-3'>Results</BreadcrumbItem>
      </Breadcrumbs>
      {curState === 0 && <SetUnit nextOne={nextOne}/>}
      {curState === 1 && <SetDraw nextOne={nextOne}/>}
      {curState === 2 && <Result nextOne={nextOne}/>}
    </div>
  )
}

export default Home