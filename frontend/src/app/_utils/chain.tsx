'use client';
import { connect, disconnect } from "get-starknet"
import { appState } from './state';
import { proxy, snapshot } from 'valtio';
import { allCards, contractAddresses } from "./helper";
import { useContractRead } from "@starknet-react/core";
import { BlockTag } from "starknet";
import nftAbi from "../_utils/abi/nftAbi.json";

export const connectWallet = async () => {
  if (appState.account) {
    await disconnect();
    appState.account = null;
    return;
  }
  let connection = await connect();
  if(connection) {
	  let my_account = await connection.enable()
	  connection?.on('networkChanged', () => appState.account = null)
	  connection?.on('accountsChanged', () => appState.account = null)
	  appState.account = my_account;
	}
}

/* export const fetchNftIdList = async () => {
	const { address } = snapshot(appState);
	const nftBalance = await Promise.all(
		allCards.map(async (nftId) => {
			return Number(
				await nftContract.methods.balanceOf(address, nftId).call(),
			);
		}),
	);
	console.log('nft balance', nftBalance);
	const nftIdList = nftBalance.reduce((list, balance, idx) => {
		const idFilledArray: number[] = Array(balance).fill(allCards[idx]);
		return list.concat(idFilledArray);
	}, [] as number[]);
	console.log('fetch nft id list', nftIdList);
	appState.collectedNft = proxy(nftIdList);
}; */
