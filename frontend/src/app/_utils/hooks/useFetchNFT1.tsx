// @ts-nocheck
import React from 'react'
import { proxy, snapshot } from 'valtio';
import { allCards, contractAddresses } from "../helper";
import { useContractRead } from "@starknet-react/core";
import { BlockTag } from "starknet";
import nftAbi from "../abi/nftAbi.json";
import { appState } from '../state';

const useFetchNFT = (ids) => {
    const { account } = snapshot(appState);
    const [value, setValue] = React.useState(0);
    const { data, refetch, fetchStatus, status } = useContractRead({
      abi: nftAbi,
      functionName: "balance_of",
      address: contractAddresses.nft_address,
      args: [account?.selectedAddress, ids],
      watch: true,
      blockIdentifier: BlockTag.latest
    });
    React.useEffect(() => {
      if(account?.selectedAddress === undefined) return;
      refetch();
    }, []);
    React.useEffect(() => {
      if(account?.selectedAddress === undefined) return;
      refetch();
    }, [account]);
    return Number(data);
}

export default useFetchNFT