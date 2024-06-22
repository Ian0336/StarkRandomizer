// @ts-nocheck
import React from 'react'
import { allCards, contractAddresses } from "../helper";
import { useContractRead, useAccount } from "@starknet-react/core";
import { BlockTag } from "starknet";
import drawAbi from "../abi/drawAbi.json";
import { error } from 'console';

const useFetchDrawPoolProp = (ids) => {
    const { address} = useAccount();
    const { data, refetch, fetchStatus, status, isLoading, error, isError} = useContractRead({
      abi: drawAbi,
      functionName: "get_drawing_pool_info",
      address: contractAddresses.draw_contract,
      args: [ids],
      watch: true,
      blockIdentifier: BlockTag.pending
    });
    React.useEffect(() => {
      if(address === undefined) return;
      refetch();
    }, [address]);
    let tmp = [];
    let tmp2 = [];
    if (isError) 
      console.log(error?.message);
    else{
      if(data !== undefined){
        tmp = data[0].map((item, index) => Number(item));
        // data[2] is accumulated prop, turn it into prop and make them add up to 100
        tmp2 = [];
        let ratio = 100 / Number(data[1][data[1].length - 1]);
        for(let i = 0; i < data[1].length; i++) {
          let j = Number(data[1][i]) - (i === 0 ? 0 : Number(data[1][i - 1]));
          tmp2.push((j * ratio).toFixed(2));
        }
      }
      ;
    }
    return {unit_pool: tmp, unit_pool_prop: tmp2, isLoading:isLoading};
}

export default useFetchDrawPoolProp


