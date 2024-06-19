// @ts-nocheck
'use client'
import React from 'react'
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/react";
import SetUnit from './_components/SetUnit';
import SetDraw from './_components/SetDraw';
import Result from './_components/Result';

const Home = () => {
  const [curState, setCurState] = React.useState("setUnitPool")
  return (
    <div className='items-center'>
      <Breadcrumbs size='lg' color='foreground' variant="solid" separator='' className='pb-3'>
        <BreadcrumbItem isCurrent={curState === "setUnitPool"}  className='mx-3'>Set Unit Pool</BreadcrumbItem>
        <BreadcrumbItem className='mx-3'>{'>>>'}</BreadcrumbItem>
        <BreadcrumbItem isCurrent={curState === "setDrawingPool"} className='mx-3'>Set Drawing Pool</BreadcrumbItem>
        <BreadcrumbItem className='mx-3'>{'>>>'}</BreadcrumbItem>
        <BreadcrumbItem isCurrent={curState === "results"} className='mx-3'>Results</BreadcrumbItem>
      </Breadcrumbs>
      {curState === "setUnitPool" && <SetUnit />}
      {curState === "setDrawingPool" && <SetDraw />}
      {curState === "results" && <Result />}
    </div>
  )
}

export default Home