// @ts-nocheck
'use client'
import React from 'react'
import {Accordion, AccordionItem, Image, Button} from "@nextui-org/react";
import {cardImgs, unitPoolInfo, drawPoolInfo} from '../../_utils/helper';
import useFetchUnitPoolProp from '../../_utils/hooks/useFetchUnitPoolProp'
import useFetchDrawPoolProp from '@/app/_utils/hooks/useFetchDrawPoolProp';



const Result = ({nextOne}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [unitPoolProp, setUnitPoolProp] = React.useState([{},{},{}]);
  const [drawingPoolProps, setDrawingPoolProps] = React.useState([{},{}]);


  const unitPool0 = useFetchUnitPoolProp(0);
  const unitPool1 = useFetchUnitPoolProp(1);
  const unitPool2 = useFetchUnitPoolProp(2);
  const drawingPool0 = useFetchDrawPoolProp(0);
  const drawingPool1 = useFetchDrawPoolProp(1);

  React.useEffect(() => {
    if(unitPool0.isLoading === false && unitPool1.isLoading === false && unitPool2.isLoading === false && drawingPool0.isLoading === false && drawingPool1.isLoading === false) {
      setIsLoading(false);
      setDrawingPoolProps([drawingPool0, drawingPool1]);
      setUnitPoolProp([unitPool0, unitPool1, unitPool2]);
    }
  }, [unitPool0.isLoading, unitPool1.isLoading, unitPool2.isLoading, drawingPool0.isLoading, drawingPool1.isLoading])
  return (
    <> 
      <Accordion className='text-white'>
      {drawingPoolProps?.map((item, index) => (
          <AccordionItem key={index} aria-label={drawPoolInfo[index].name}  title={drawPoolInfo[index].name}>
            <Accordion className='text-white'>
            {item.unit_pool?.map((unit, i) => (
              <AccordionItem key={i} aria-label={unitPoolInfo[unit].name} subtitle={`${item.unit_pool_prop[i]}%`} title={unitPoolInfo[unit].name}>
                  <Accordion className='text-white' key={i}>
                  {unitPoolProp[unit].token_pool?.map((card, j) => (
                      <AccordionItem key={j} aria-label={`Card ${card}`} title={`Card ${card}`} subtitle={`${unitPoolProp[unit].token_pool_prop[j]}%`}>
                        <Image src={cardImgs[card].src} alt={`Card ${card}`} width={100} height={100} />
                      </AccordionItem>
                  ))}
                </Accordion>
              </AccordionItem>
            ))}
            </Accordion>
          </AccordionItem>
        ))  
      }
      
    </Accordion>
    <Button color="default" variant="faded" size='lg' onPress={nextOne}>
      GO TO BUY NOW !!
    </Button>
  </>
  )
}

export default Result