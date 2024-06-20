// @ts-nocheck
import React from 'react'
import { allCards, contractAddresses } from "../helper";
import { useContractRead, useAccount } from "@starknet-react/core";
import { BlockTag } from "starknet";
import nftAbi from "../abi/nftAbi.json";
import { error } from 'console';

const useFetchNFT = (ids) => {
    const { address} = useAccount();
    const { data, refetch, fetchStatus, status, isLoading, error, isError} = useContractRead({
      abi: nftAbi,
      functionName: "balance_of",
      address: contractAddresses.nft_address,
      args: [address, ids],
      watch: true,
      blockIdentifier: BlockTag.latest
    });
    React.useEffect(() => {
      if(address === undefined) return;
      refetch();
    }, [address]);
    if (isError || !data) 
      console.log(error?.message);
    return {value: Number(data), isLoading:isLoading };
}

export default useFetchNFT