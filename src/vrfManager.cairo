use starknet::ContractAddress;
#[starknet::interface]
trait IRandomness<TContractState> {
    fn request_random(
        ref self: TContractState,
        seed: u64,
        callback_address: ContractAddress,
        callback_fee_limit: u128,
        publish_delay: u64,
        num_words: u64,
        calldata: Array<felt252>
    ) -> u64;
    fn cancel_random_request(
        ref self: TContractState,
        request_id: u64,
        requestor_address: ContractAddress,
        seed: u64,
        minimum_block_number: u64,
        callback_address: ContractAddress,
        callback_fee_limit: u128,
        num_words: u64
    );
    fn submit_random(
        ref self: TContractState,
        request_id: u64,
        requestor_address: ContractAddress,
        seed: u64,
        minimum_block_number: u64,
        callback_address: ContractAddress,
        callback_fee_limit: u128,
        callback_fee: u128,
        random_words: Span<felt252>,
        proof: Span<felt252>,
        calldata: Array<felt252>
    );
    fn get_pending_requests(
        self: @TContractState, requestor_address: ContractAddress, offset: u64, max_len: u64
    ) -> Span<felt252>;


    fn requestor_current_index(self: @TContractState, requestor_address: ContractAddress) -> u64;
    fn get_public_key(self: @TContractState, requestor_address: ContractAddress) -> felt252;
    fn get_payment_token(self: @TContractState) -> ContractAddress;
    fn set_payment_token(ref self: TContractState, token_contract: ContractAddress);

    fn refund_operation(ref self: TContractState, caller_address: ContractAddress, request_id: u64);
    fn get_total_fees(
        self: @TContractState, caller_address: ContractAddress, request_id: u64
    ) -> u256;
    fn get_out_of_gas_requests(
        self: @TContractState, requestor_address: ContractAddress,
    ) -> Span<u64>;
    fn withdraw_funds(ref self: TContractState, receiver_address: ContractAddress);
    fn get_contract_balance(self: @TContractState) -> u256;
    fn compute_premium_fee(self: @TContractState, caller_address: ContractAddress) -> u128;
    fn get_admin_address(self: @TContractState,) -> ContractAddress;
    fn set_admin_address(ref self: TContractState, new_admin_address: ContractAddress);
}
#[starknet::interface]
trait IExampleRandomness<TContractState> {
    fn get_last_random(self: @TContractState) -> felt252;
    fn request_my_randomness(ref self: TContractState);
    fn receive_random_words(
        ref self: TContractState,
        requestor_address: ContractAddress,
        request_id: u64,
        random_words: Span<felt252>,
        calldata: Array<felt252>
    );
    fn withdraw_funds(ref self: TContractState, receiver: ContractAddress);
    fn get_last_request_id(self: @TContractState) -> u64;
    fn set_callback_address(ref self: TContractState, callback_address: ContractAddress);
}

const DRAW_ROLE: felt252 = 'DRAW_ROLE';
const ADMIN_ROLE: felt252 = 'ADMIN_ROLE';

#[starknet::contract]
mod ExampleRandomness {
    use super::{ContractAddress, IExampleRandomness, IRandomnessDispatcher, IRandomnessDispatcherTrait, ADMIN_ROLE, DRAW_ROLE};
    use starknet::info::{get_block_number, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::interface::{
        ERC20ABIDispatcher, ERC20ABIDispatcherTrait
    };
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::introspection::src5::SRC5Component;



    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        randomness_contract_address: ContractAddress,
        min_block_number_storage: u64,
        last_random_storage: felt252,
        last_request_id: u64,
        callback_address: ContractAddress,

        #[substorage(v0)]
        access_control: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, randomness_contract_address: ContractAddress) {
        self.randomness_contract_address.write(randomness_contract_address);
        self.last_random_storage.write(0);
        self.access_control.initializer();
        self.access_control._grant_role(DEFAULT_ADMIN_ROLE, owner);
        self.access_control._grant_role(ADMIN_ROLE, owner);
    }

    #[abi(embed_v0)]
    impl IExampleRandomnessImpl of IExampleRandomness<ContractState> {
        fn get_last_random(self: @ContractState) -> felt252 {
            let last_random = self.last_random_storage.read();
            return last_random;
        }
        fn get_last_request_id(self: @ContractState) -> u64 {
            let last_request_id = self.last_request_id.read();
            return last_request_id;
        }
        fn set_callback_address(ref self: ContractState, callback_address: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.callback_address.write(callback_address);
        }


        fn request_my_randomness(
            ref self: ContractState,
        ) {
            let randomness_contract_address = self.randomness_contract_address.read();
            let randomness_dispatcher = IRandomnessDispatcher {
                contract_address: randomness_contract_address
            };
            let caller = get_caller_address();
            let compute_fees = randomness_dispatcher.compute_premium_fee(caller);
            let callback_fee_limit = 10000000000000000;
            // Approve the randomness contract to transfer the callback fee
            // You would need to send some ETH to this contract first to cover the fees
            let eth_dispatcher = ERC20ABIDispatcher {
                contract_address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7 // ETH Contract Address
                    .try_into()
                    .unwrap()
            };
            eth_dispatcher
                .approve(
                    randomness_contract_address,
                    (callback_fee_limit + callback_fee_limit / 5).into()
                );
            let calldata = array![];
            // Request the randomness
            let request_id = randomness_dispatcher
                .request_random(
                    self.last_request_id.read(), self.callback_address.read(), callback_fee_limit, 1, 1, calldata
                );
            self.last_request_id.write(request_id);
            let current_block_number = get_block_number();
            self.min_block_number_storage.write(current_block_number + 1);

            return ();
        }

        fn withdraw_funds(ref self: ContractState, receiver: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            let eth_dispatcher = ERC20ABIDispatcher {
                contract_address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7 // ETH Contract Address
                    .try_into()
                    .unwrap()
            };
            let balance = eth_dispatcher.balanceOf(get_contract_address());
            eth_dispatcher.transfer(receiver, balance);
        }


        fn receive_random_words(
            ref self: ContractState,
            requestor_address: ContractAddress,
            request_id: u64,
            random_words: Span<felt252>,
            calldata: Array<felt252>
        ) {
            // Have to make sure that the caller is the Pragma Randomness Oracle contract
            let caller_address = get_caller_address();
            
            // and that the current block is within publish_delay of the request block
            let current_block_number = get_block_number();
            let min_block_number = self.min_block_number_storage.read();
            assert(min_block_number <= current_block_number, 'block number issue');

            // and that the requestor_address is what we expect it to be (can be self
            // or another contract address), checking for self in this case
            //let contract_address = get_contract_address();
            //assert(requestor_address == contract_address, 'requestor is not self');

            // Optionally: Can also make sure that request_id is what you expect it to be,
            // and that random_words_len==num_words

            // Your code using randomness!
            let random_word = *random_words.at(0);

            self.last_random_storage.write(random_word);

            return ();
        }
    }

    
}