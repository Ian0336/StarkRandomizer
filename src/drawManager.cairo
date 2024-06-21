use starknet::{ContractAddress, get_caller_address};
const ADMIN_ROLE: felt252 = 'ADMIN_ROLE';
const FULFILL_ROLE: felt252 = 'FULFILL_ROLE';
const U32MAX: u32 = 4294967295;

#[starknet::interface]
trait IDrawManager<TContractState> {
    fn set_vrf_contract(ref self: TContractState, _vrf_contract: ContractAddress);
    fn set_token_pool(ref self: TContractState, _ids: Span<u256>);
    fn set_token_max_amount(ref self: TContractState, _max_amount: Span<u32>);
    fn set_unit_pool(ref self: TContractState, _unit_id: u32, _token_ids: Span<u32>, _probs: Span<u32>);
    fn set_drawing_pool(ref self: TContractState, _pool_id: u32, _unit_ids: Span<u32>, _probs: Span<u32>);
    fn send_request(ref self: TContractState, _pools_id: Span<u32>, _draw_amounts: Span<u32>);
    fn fulfill_random_words(ref self: TContractState, _request_id: u256, _random_words: felt252);
    // view functions
    fn get_vrf_contract(self: @TContractState) -> ContractAddress;
    fn get_token_pool_info(self: @TContractState) -> Span<u256>;
    fn get_token_max_amount(self: @TContractState) -> Span<u32>;
    fn get_token_remainings(self: @TContractState) -> Span<u32>;
    fn check_unit_pool_exist(self: @TContractState, unit_id: u32) -> bool;
    fn check_drawing_pool_exist(self: @TContractState, pool_id: u32) -> bool;
    fn get_unit_pool_info(self: @TContractState, unit_id: u32) -> (Span<u32>, Span<u32>);
    fn get_drawing_pool_info(self: @TContractState, pool_id: u32) -> (Span<u32>, Span<u32>);
    fn pending_request_num(self: @TContractState) -> u256;
    fn get_request_queue(self: @TContractState) -> Span<u256>;
    fn get_last_request_id(self: @TContractState) -> u256;
    fn get_request_info(self: @TContractState, request_id: u256) -> RequestInfo;
}
#[derive(Copy, Drop, Serde,starknet::Store, PartialEq)]
pub struct PoolInfo {
    pub enable: bool,
    pub length: u32,
}

#[derive(Copy, Drop, Serde,starknet::Store, PartialEq)]
pub struct RequestInfo {
    pub exists: bool,
    pub fulfilled: bool,
    pub completed: bool,
    pub request_sender: ContractAddress,
    pub random_words: felt252,
    pub length: u32,
}

pub mod Errors {
    pub const EMPTY_IDS: felt252 = 'draw_manager: EmptyIDs';
    pub const LENGTH_NOT_MATCH: felt252 = 'draw_manager: LengthNotMatch';
    pub const TOKEN_EXISTED: felt252 = 'draw_manager: TokenExisted';
    pub const TOKEN_NOT_EXIST: felt252 = 'draw_manager: TokenNotExist';
    pub const UNIT_POOL_EXISTED: felt252 = 'draw_manager: UnitPoolExisted';
    pub const UNIT_POOL_NOT_EXIST: felt252 = 'draw_manager: UnitPoolNotExist';
    pub const DRAWING_POOL_EXISTED: felt252 = 'draw_manager: PoolExisted';
    pub const DRAWING_POOL_NOT_EXIST: felt252 = 'draw_manager: PoolNotExist';
    pub const DRAWABLE_NOT_ENOUGH: felt252 = 'draw_manager: DrawableNotEnough';
    pub const REQUEST_NOT_EXIST: felt252 = 'draw_manager: RequestNotExist';
    pub const REQUEST_ALREADY_FULFILLED: felt252 = 'draw_manager: AlreadyFulfilled';
    pub const REQUEST_NOT_FULFILLED: felt252 = 'draw_manager: NotFulfilled';
    pub const NO_PENDING_REQUEST: felt252 = 'draw_manager: NoPendingRequest';
    pub const HAS_ROLE_ALREADY: felt252 = 'draw_manager: HasRoleAlready';
    pub const ZERO_AMOUNT: felt252 = 'draw_manager: ZeroAmount';
}

#[derive(Drop, PartialEq, starknet::Event)]
pub struct RequestCompleted {
    #[key]
    pub requestId: u256,
    pub requester: ContractAddress,
    pub ids: Span<u256>,
}
#[derive(Drop, PartialEq, starknet::Event)]
pub struct RequestSend {
    #[key]
    pub requestId: u256,
    pub requester: ContractAddress,
}

#[starknet::contract]
mod DrawManager {
    use super::{ADMIN_ROLE, RequestInfo, IDrawManager, Errors, PoolInfo, FULFILL_ROLE, RequestCompleted, U32MAX, RequestSend};
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::introspection::src5::SRC5Component;
    use core::poseidon::PoseidonTrait;
    use core::hash::{HashStateTrait, HashStateExTrait};
    use hackathon::prizeItems::{IPrizeItemsDispatcherTrait, IPrizeItemsDispatcher};
    use hackathon::vrfManager::{IVrfManagerDispatcherTrait, IVrfManagerDispatcher};


    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;


    #[storage]
    struct Storage {
        nft_contract: ContractAddress,
        vrf_contract: ContractAddress,

        unit_pools_info: LegacyMap::<u32, PoolInfo>,
        unit_pools_info_units: LegacyMap::<(u32, u32), u32>,
        unit_pools_info_probs: LegacyMap::<(u32, u32), u32>,
        unit_pools_info_accumulated_probs: LegacyMap::<(u32, u32), u32>,

        drawing_pools_info: LegacyMap::<u32, PoolInfo>,
        drawing_pools_info_units: LegacyMap::<(u32, u32), u32>,
        drawing_pools_info_accumulated_probs: LegacyMap::<(u32, u32), u32>,
        
        requests_info: LegacyMap::<u256, RequestInfo>,
        requests_info_pools_id: LegacyMap::<(u256, u256), u32>,
        requests_info_amounts: LegacyMap::<(u256, u256), u32>,

        request_nonce: u256,
        existed_unit: LegacyMap::<u32, bool>,
        existed_drawing: LegacyMap::<u32, bool>,
        existed_drawing_length: u32,
        existed_unit_length: u32,

        ids_length: u32,
        token_max_amount: LegacyMap::<u32, u32>,
        remainings: LegacyMap::<u32, u32>,
        ids: LegacyMap::<u32, u256>,

        requests_queue: LegacyMap::<u256, u256>,
        requests_queue_num: u256,
        
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
       
        RequestCompleted: RequestCompleted,
        RequestSend: RequestSend,
    }
    #[constructor]
    fn constructor(
        ref self: ContractState, 
        owner: ContractAddress,
        nft_contract: ContractAddress
    ) {
        assert(!owner.is_zero(), 'owner is 0');
        self.access_control.initializer();
        self.access_control._grant_role(DEFAULT_ADMIN_ROLE, owner);
        self.access_control._grant_role(ADMIN_ROLE, owner);
        self.nft_contract.write(nft_contract);
    }


    #[abi(embed_v0)]
    impl DrawManagerImpl of IDrawManager<ContractState> {
        fn set_vrf_contract(ref self: ContractState, _vrf_contract: ContractAddress) {
            self.access_control.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.vrf_contract.write(_vrf_contract);
            self.access_control.grant_role(FULFILL_ROLE, _vrf_contract);
        }
        fn set_token_pool(ref self: ContractState, _ids: Span<u256>) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.ids_length.write(_ids.len());
            let mut i = 0;
            loop{
                if i == _ids.len() {
                    break;
                }
                self.ids.write(i, *_ids.at(i));
                i += 1;
            }
        }
        fn set_token_max_amount(ref self: ContractState, _max_amount: Span<u32>) {
            //self.access_control.assert_only_role(ADMIN_ROLE);
            assert(_max_amount.len() == self.ids_length.read(), Errors::LENGTH_NOT_MATCH);
            let mut i = 0;
            loop{
                if (i == _max_amount.len()) {
                    break;
                }
                if(*_max_amount.at(i) == 0){
                    self.token_max_amount.write(i, U32MAX);
                    self.remainings.write(i, U32MAX);
                }else{
                    self.token_max_amount.write(i, *_max_amount.at(i));
                    self.remainings.write(i, *_max_amount.at(i));
                }
                i += 1;
            }
        }
        fn set_unit_pool(ref self: ContractState, _unit_id: u32, _token_ids: Span<u32>, _probs: Span<u32>) {
            //self.access_control.assert_only_role(ADMIN_ROLE);
            let mut unit = self.unit_pools_info.read(_unit_id);
            assert(_token_ids.len() == _probs.len(), Errors::LENGTH_NOT_MATCH);
            //assert(!unit.enable, Errors::UNIT_POOL_EXISTED);

            let tmp_acc = get_accumulated_arr(_probs);
            unit.enable = true;
            unit.length = _token_ids.len();
            self.unit_pools_info.write(_unit_id, unit);

            let mut i = 0;
            loop{
                if i == _token_ids.len() {
                    break;
                }
                self.unit_pools_info_units.write((_unit_id, i), *_token_ids.at(i));
                self.unit_pools_info_probs.write((_unit_id, i), *_probs.at(i));
                self.unit_pools_info_accumulated_probs.write((_unit_id, i), *tmp_acc.at(i));
                i += 1;
            };
            
            self.existed_unit.write(_unit_id, true);
            self.existed_unit_length.write(self.existed_unit_length.read() + 1);
        }
        fn set_drawing_pool(ref self: ContractState, _pool_id: u32, _unit_ids: Span<u32>, _probs: Span<u32>) {
            //self.access_control.assert_only_role(ADMIN_ROLE);
            assert(_unit_ids.len() == _probs.len(), Errors::LENGTH_NOT_MATCH);
            let mut pool = self.drawing_pools_info.read(_pool_id);
            //assert(!pool.enable, Errors::DRAWING_POOL_EXISTED);
            let num = _unit_ids.len();
            let mut i = 0;
            loop{
                if i == num {
                    break;
                }
                assert(self.existed_unit.read(*_unit_ids.at(i)), Errors::UNIT_POOL_NOT_EXIST);
                i += 1;
            };

            let tmp_acc = get_accumulated_arr(_probs);
            pool.length = _unit_ids.len();
            pool.enable = true;
            self.drawing_pools_info.write(_pool_id, pool);

            i = 0;
            loop{
                if i == _unit_ids.len() {
                    break;
                }
                self.drawing_pools_info_units.write((_pool_id, i), *_unit_ids.at(i));
                self.drawing_pools_info_accumulated_probs.write((_pool_id, i), *tmp_acc.at(i));
                i += 1;
            };

            self.existed_drawing.write(_pool_id, true);
            self.existed_drawing_length.write(self.existed_drawing_length.read() + 1);
        }
        fn send_request(ref self: ContractState, _pools_id: Span<u32>, _draw_amounts: Span<u32>) {
            let _user = get_caller_address();
            assert(_pools_id.len() == _draw_amounts.len(), Errors::LENGTH_NOT_MATCH);
            let contract_address = self.vrf_contract.read();
            let request_id: u256 = IVrfManagerDispatcher{contract_address}.request_my_randomness();
            let mut request = self.requests_info.read(request_id);
            request.exists = true;
            request.request_sender = _user;
            request.length = _pools_id.len();
            self.requests_info.write(request_id, request);
            
            let mut i = 0;
            loop{
                if i == _pools_id.len() {
                    break;
                }
                self.requests_info_pools_id.write((request_id, i.into()), *_pools_id.at(i));
                self.requests_info_amounts.write((request_id, i.into()), *_draw_amounts.at(i));
                i += 1;
            };

            let queue_num = self.requests_queue_num.read();
            self.requests_queue.write(queue_num, request_id);
            self.requests_queue_num.write(queue_num + 1);
            self.emit(RequestSend{requestId: request_id, requester: _user});
            
        }
        fn fulfill_random_words(ref self: ContractState, _request_id: u256, _random_words: felt252) {
            self.access_control.assert_only_role(FULFILL_ROLE);
            let mut request = self.requests_info.read(_request_id);
            assert(request.exists, Errors::REQUEST_NOT_EXIST);
            assert(!request.fulfilled, Errors::REQUEST_ALREADY_FULFILLED);
            request.fulfilled = true;
            request.random_words = _random_words;
            self.requests_info.write(_request_id, request);
            let ids = exec_request(ref self, _request_id);
            self.emit(RequestCompleted{requestId: _request_id, requester: request.request_sender, ids: ids});

        }
        fn get_vrf_contract(self: @ContractState) -> ContractAddress {
            self.vrf_contract.read()
        }
        fn get_token_pool_info(self: @ContractState) -> Span<u256> {
            let mut ids = array![];
            let num = self.ids_length.read();
            let mut i = 0;
            loop{
                if i == num {
                    break;
                }
                ids.append(self.ids.read(i));
                i += 1;
            };
            ids.span()
        }
        fn get_token_remainings(self: @ContractState) -> Span<u32> {
            let mut remainings = array![];
            let num = self.ids_length.read();
            let mut i = 0;
            loop{
                if i == num {
                    break;
                }
                remainings.append(self.remainings.read(i));
                i += 1;
            };
            remainings.span()
        }
        fn get_token_max_amount(self: @ContractState) -> Span<u32> {
            let mut max_amount = array![];
            let num = self.ids_length.read();
            let mut i = 0;
            loop{
                if i == num {
                    break;
                }
                max_amount.append(self.token_max_amount.read(i));
                i += 1;
            };
            max_amount.span()
        }
        fn check_unit_pool_exist(self: @ContractState, unit_id: u32) -> bool {
            self.existed_unit.read(unit_id)
        }
        fn check_drawing_pool_exist(self: @ContractState, pool_id: u32) -> bool {
            self.existed_drawing.read(pool_id)
        }
        fn get_unit_pool_info(self: @ContractState, unit_id: u32) -> (Span<u32>, Span<u32>) {
            let unit = self.unit_pools_info.read(unit_id);
            let mut units = array![];
            let mut accumulated_probs = array![];
            let mut i = 0;
            loop{
                if i == unit.length {
                    break;
                }
                units.append(self.unit_pools_info_units.read((unit_id, i)));
                accumulated_probs.append(self.unit_pools_info_accumulated_probs.read((unit_id, i)));
                i += 1;
            };
            (units.span(), accumulated_probs.span())
        }
        fn get_drawing_pool_info(self: @ContractState, pool_id: u32) -> (Span<u32>, Span<u32>) {
            let pool = self.drawing_pools_info.read(pool_id);
            let mut units = array![];
            let mut accumulated_probs = array![];
            let mut i = 0;
            loop{
                if i == pool.length {
                    break;
                }
                units.append(self.drawing_pools_info_units.read((pool_id, i)));
                accumulated_probs.append(self.drawing_pools_info_accumulated_probs.read((pool_id, i)));
                i += 1;
            };
            (units.span(), accumulated_probs.span())
        }
        fn pending_request_num(self: @ContractState) -> u256 {
            self.requests_queue_num.read() - self.request_nonce.read()
        }
        fn get_request_queue(self: @ContractState) -> Span<u256> {
            let mut queue = array![];
            let num = self.requests_queue_num.read();
            let mut i = 0;
            loop{
                if i == num {
                    break;
                }
                queue.append(self.requests_queue.read(i));
                i += 1;
            };
            queue.span()
        }
        fn get_last_request_id(self: @ContractState) -> u256 {
            self.requests_queue.read(self.request_nonce.read())
        }
        fn get_request_info(self: @ContractState, request_id: u256) -> RequestInfo {
            self.requests_info.read(request_id)
        }
    }

    fn get_accumulated_arr(probs: Span<u32>) -> Span<u32> {
        let mut accumulated = array![];
        let mut sum: u32 = 0;
        let num = probs.len();
        let mut i = 0;
        loop{
            if i == num {
                break;
            }
            sum += *probs.at(i);
            accumulated.append(sum);
            i += 1;
        };
        accumulated.span()
    }

    fn exec_request(ref self: ContractState, request_id: u256) -> Span<u256> {
        let mut request = self.requests_info.read(request_id);
        let mut ids = array![];


        let receiver = request.request_sender;
        let mut pools_id = array![];
        let mut amounts = array![];
        let mut i = 0;
        loop{
            if i == request.length {
                break;
            }
            pools_id.append(self.requests_info_pools_id.read((request_id, i.into())));
            amounts.append(self.requests_info_amounts.read((request_id, i.into())));
            i += 1;
        };

        let mut unit_id: u32 = 0;
        let mut random_word_32: u32 = 0;
        let mut id_index: u32 = 0;
        let mut consumed_random_word: felt252 = request.random_words;
        i = 0;
        let mut j: u32 = 0;

        loop{
            if i == pools_id.len() {
                break;
            }
            j = 0;
            let amounts_i = *amounts.at(i);
            let pools_id_i = *pools_id.at(i);
            loop{
                if j == amounts_i {
                    break;
                }
                let (consumed_random_word_tmp, random_word_32_tmp) = split_random_word(consumed_random_word);
                consumed_random_word = consumed_random_word_tmp;
                random_word_32 = random_word_32_tmp;
                unit_id = get_unit_id(ref self, pools_id_i, random_word_32);
                let (consumed_random_word_tmp2, random_word_32_tmp2) = split_random_word(consumed_random_word);
                consumed_random_word = consumed_random_word_tmp2;
                random_word_32 = random_word_32_tmp2;
                id_index = get_token_id(ref self, unit_id, random_word_32);
                ids.append(self.ids.read(id_index));
                
                
                j += 1;
            };
            i += 1;
        };
        
        // nft contract mint
        let (mint_ids, mint_amounts) = count_ids(ids.span());
        let contract_address = self.nft_contract.read();
        IPrizeItemsDispatcher{contract_address}.mint_batch(receiver, mint_ids, mint_amounts);
        
        let nonce = self.request_nonce.read();
        self.request_nonce.write(nonce + 1);
        request.completed = true;
        self.requests_info.write(request_id, request);
        
        ids.span()
    }

    fn split_random_word(random_word: felt252) -> (felt252, u32) {
        let consumed_random_word: felt252 = PoseidonTrait::new().update_with(random_word).finalize();
            let tmp256: u256 = random_word.into();
            let tmpMAX: u256 = U32MAX.into();
            let tmp = tmp256 % tmpMAX+1;
            let random_word_32: u32 = tmp.try_into().unwrap();
            (consumed_random_word, random_word_32)
    }
    fn get_unit_id(ref self: ContractState, pool_id: u32, random_word: u32) -> u32 {
        let pool = self.drawing_pools_info.read(pool_id);
        let mut i: u32 = 0;
        let mut _random_word: u32 = random_word % self.drawing_pools_info_accumulated_probs.read((pool_id, pool.length - 1));
        loop{
            if i == pool.length {
                break;
            }
            if _random_word < self.drawing_pools_info_accumulated_probs.read((pool_id, i)) {
                break;
            }
            i += 1;
        };
        self.drawing_pools_info_units.read((pool_id, i))
    }
    fn get_token_id(ref self: ContractState, unit_id: u32, random_word: u32) -> u32 {
        let unit = self.unit_pools_info.read(unit_id);
        let mut i: u32 = 0;
        let mut _random_word: u32 = random_word % self.unit_pools_info_accumulated_probs.read((unit_id, unit.length - 1));
        loop{
            if i == unit.length {
                break;
            }
            if _random_word < self.unit_pools_info_accumulated_probs.read((unit_id, i)) {
                break;
            }
            i += 1;
        };
        let id_index = self.unit_pools_info_units.read((unit_id, i));
        //check whether the token is the last one
        if(self.remainings.read(id_index) == 1){
            // adjust the unit_pools_info_units and unit_pools_info_accumulated_probs and unit_pools_info_probs
            let mut tmp_units = array![];
            let mut tmp_probs = array![];
            let mut j = 0;
            loop{
                if (j == unit.length) {
                    break;
                }
                if (j != i){
                    tmp_units.append(self.unit_pools_info_units.read((unit_id, j)));
                    tmp_probs.append(self.unit_pools_info_probs.read((unit_id, j)));
                }
                j += 1;
            };
            let tmp_acc = get_accumulated_arr(tmp_probs.span());
            self.unit_pools_info.write(unit_id, PoolInfo{enable: true, length: unit.length - 1});
            let mut j = 0;
            loop{
                if j == tmp_units.len() {
                    break;
                }
                self.unit_pools_info_units.write((unit_id, j), *tmp_units.at(j));
                self.unit_pools_info_probs.write((unit_id, j), *tmp_probs.at(j));
                self.unit_pools_info_accumulated_probs.write((unit_id, j), *tmp_acc.at(j));
                j += 1;
            };
        }
        self.remainings.write(id_index, self.remainings.read(id_index) - 1);
        id_index
    }
    fn count_ids(ids: Span<u256>) -> (Span<u256>, Span<u256>) {
        let mut ids_dict: Felt252Dict<u32> = Default::default();
        let mut mint_ids = array![];
        let mut mint_amounts = array![];
        let n = ids.len();
        let mut i = 0;
        loop{
            if i == n {
                break;
            }
            let id:felt252 = (*ids.at(i)).try_into().unwrap();
            let mut amount = ids_dict.get(id);
            if amount == 0 {
                amount = 1;
                let tmp_id: u256 = id.into();
                mint_ids.append(tmp_id);
            } else {
                amount += 1;
            }
            ids_dict.insert(id, amount);
            i += 1;
        };
        i = 0;
        let tmp_mint_ids = mint_ids.clone();
        loop{
            if i == mint_ids.len() {
                break;
            }
            let id:felt252 = (*mint_ids.at(i)).try_into().unwrap();
            mint_amounts.append(ids_dict.get(id).into());
            i += 1;
        };
        (tmp_mint_ids.span(), mint_amounts.span())
    }
    
}