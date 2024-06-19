// @ts-nocheck
import { proxy } from 'valtio';

/* interface AppState {
	address: string;
	requestId: string;
	cardResult: number[];
	transactionId?: string;
	collectedNft: number[];
} */

export const appState = proxy<AppState>({
    account: null,
	requestId: '',
	cardResult: [],
	transactionId: '',
	collectedNft: [],
});
