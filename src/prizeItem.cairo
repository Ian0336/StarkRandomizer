use starknet::{ContractAddress, get_caller_address};

#[starknet::interface]
trait IPrizeItems<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, token_id: u256, value: u256);
    fn mint_batch(ref self: TContractState, to: ContractAddress, token_ids: Span<u256>, values: Span<u256>);
    fn set_minter(ref self: TContractState, minter: ContractAddress);
    fn get_token_uri(self: @TContractState, token_id: u256) -> ByteArray;
}

#[starknet::contract]
mod PrizeItems {
    use openzeppelin::token::erc1155::interface::ERC1155ABI;
use core::traits::TryInto;
use starknet::{ContractAddress, get_caller_address};
    use starknet::class_hash::ClassHash;

    use zeroable::Zeroable;

    use openzeppelin::token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;

    use super::IPrizeItems;


    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableTwoStepImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC1155MixinImpl = ERC1155Component::ERC1155MixinImpl<ContractState>;
    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;


    //Consts
    const OLD_IERC1155_ID: felt252 = 0xd9b67a26;
    const IERC165_BACKWARD_COMPATIBLE_ID: felt252 = 0x80ac58cd;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        _minter: ContractAddress,
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    //
    // IMintableToken (StarkGate)
    //
    #[abi(embed_v0)]
    impl PrizeItemsImpl of IPrizeItems<ContractState> {
        fn mint(
            ref self: ContractState,   
            to: ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            only_minter(@self);
            //self.erc1155.mint_with_acceptance_check(zeroable::Zeroable::zero(), token_id, value, array![].span());
            let token_ids = array![token_id].span();
            let values = array![value].span();
            self.erc1155.update(Zeroable::zero(), to, token_ids, values);
        }
        fn mint_batch(
            ref self: ContractState,   
            to: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            only_minter(@self); 
            self.erc1155.batch_mint_with_acceptance_check(to, token_ids, values, array![].span());
        }
        fn set_minter(
            ref self: ContractState,   
            minter: ContractAddress,
        ) {
            let owner = self.ownable.owner();
            assert(!minter.is_zero(), 'minter is 0');
            assert(get_caller_address() == owner, 'only owner');
            self._minter.write(minter);
        }
        fn get_token_uri(
            self: @ContractState,   
            token_id: u256,
        ) -> ByteArray {
            let base: ByteArray = self.erc1155.uri(token_id);
            let token_uri: ByteArray = format!("{}{}", base, token_id);
            token_uri
        }
    }


    #[constructor]
    fn constructor(
        ref self: ContractState, 
        minter: ContractAddress, 
        owner: ContractAddress,
        base_uri: ByteArray,
    ) {
        assert(!owner.is_zero(), 'owner is 0');
        self.erc1155.initializer(base_uri);
        self.ownable.initializer(owner);
        self._minter.write(minter);
        self.erc1155.supports_interface(OLD_IERC1155_ID);
        //self.erc1155.mint_with_acceptance_check(zeroable::Zeroable::zero() , 0, 1, array![1].span());
    }
    

    // TODO #[view]
    fn minter(self: @ContractState) -> ContractAddress {
        self._minter.read()
    }

    fn only_minter(self: @ContractState) {
        let caller = starknet::get_caller_address();
        let minter = self._minter.read();
        assert(caller == minter, 'only minter');
    }
}