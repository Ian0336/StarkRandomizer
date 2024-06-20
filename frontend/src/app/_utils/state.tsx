// @ts-nocheck
import { proxy } from 'valtio';
import { unitPoolInfo } from './helper';

/* interface AppState {
	address: string;
	requestId: string;
	cardResult: number[];
	transactionId?: string;
	collectedNft: number[];
} */

export const appState = proxy<AppState>({
	requestId: '',
	cardResult: [],
	transactionId: '',
	drawingPoolProps:[
		{
			"unit_pool": [],
			"unit_pool_prop": []
		},
		{
			"unit_pool": [],
			"unit_pool_prop": []
		},
	],
	unitPoolProp:[
		{
			"token_pool": [],
			"token_pool_prop": []
		},
		{
			"token_pool": [],
			"token_pool_prop": []
		},
		{
			"token_pool": [],
			"token_pool_prop": []
		}
	],
});
