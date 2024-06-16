
//function setTokenPool(uint256[] calldata _ids) external onlyRole(MANAGER_ROLE) {
//    ids = _ids;
//    emit SetTokenPool(_ids);
//}
//
///// @inheritdoc IHierarchicalDrawing
//function setTokenMaxAmount(uint32[] calldata _maxAmounts) external onlyRole(MANAGER_ROLE) {
//    if(ids.length == 0) revert EmptyIDs();
//    if(ids.length != _maxAmounts.length) revert LengthNotMatch();
//    
//    maxAmounts = _maxAmounts;
//    remainings = _maxAmounts;
//
//    emit SetTokenMaxAmount(_maxAmounts);
//}
//
///// @inheritdoc IHierarchicalDrawing
//function setUnitPool(uint32 _unitID, uint32[] calldata _probs) external onlyRole(MANAGER_ROLE) {
//    UnitPoolInfo storage unit = unitPoolsInfo[_unitID];
//    if(_probs.length != ids.length) revert LengthNotMatch();
//    if (unit.enable) revert UnitPoolExisted(_unitID);
//
//    unit.enable = true;
//    unit.tree = buildOcTree(_probs);
//    unit.treeHeight = getOctreeHeight(_probs.length);
//    unit.probs = _probs;
//    existedUnit.push(_unitID);
//
//    emit SetUnitPool(_unitID);
//}
//
///// @inheritdoc IHierarchicalDrawing
//function setDrawingPool(uint32 _poolID, uint32[] calldata _unitIDs, uint32[] calldata _probs) external onlyRole(MANAGER_ROLE) {
//    DrawingPoolInfo storage pool = drawingPoolsInfo[_poolID];
//    if(_unitIDs.length != _probs.length) revert LengthNotMatch();
//    if (pool.enable) revert DrawingPoolExisted(_poolID);
//
//    UnitPoolInfo memory unit;
//    for(uint32 i;i<_unitIDs.length;i++) {
//        unit = unitPoolsInfo[_unitIDs[i]];
//        if(!unit.enable) revert UnitPoolNotExist(_unitIDs[i]);
//    }
//
//    pool.accumulatedProbs = getAccumulatedArr(_probs);
//    pool.enable = true;
//    pool.units = _unitIDs;
//    pool.probs = _probs;
//    existedDrawing.push(_poolID);
//
//    emit SetDrawingPool(_poolID);
//}
//
//
//function sendRequest(address _user, uint32[] calldata _poolsID, uint32[] calldata _drawAmounts) external {
//    address _requester = _user;
//    uint256 _requestId = vrfGenerator.requestRandomWords(_requester);
//    RequestInfo storage request = requestsInfo[_requestId];
//    request.exists = true;
//    request.requestSender = _requester;
//    request.poolsID = _poolsID;
//    request.amounts = _drawAmounts;
//
//    requestsQueue.push(_requestId);
//    emit RequestSent(_requestId, _requester);
//}
//
//
///// @inheritdoc IHierarchicalDrawing
//function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) external {
//    RequestInfo storage request = requestsInfo[_requestId];
//    if(!request.exists) revert RequestNotExist(_requestId);
//    if(request.fulfilled) revert RequestAlreadyFulfilled(_requestId);
//    request.fulfilled = true;
//    request.randomWords = _randomWords;
//    uint256[] memory _ids = execRequest(_requestId);
//
//    emit RequestCompleted(_requestId, request.requestSender, _ids);
//}
use starknet::{ContractAddress, get_caller_address};
const MANAGER_ROLE: felt252 = 'MANAGER_ROLE';
const FULLFILL_ROLE: felt252 = 'FULLFILL_ROLE';

#[starknet::interface]
trait IDrawManager<TContractState> {
    fn set_vrf_contract(ref self: TContractState, _vrf_contract: ContractAddress);
    fn set_token_pool(ref self: TContractState, _ids: Span<u256>);
    fn set_token_max_amount(ref self: TContractState, _max_amounts: Span<u32>);
    fn set_unit_pool(ref self: ContractState, _unit_id: u32, _unit_ids: Span<u32>, _probs: Span<u32>);
    fn set_drawing_pool(ref self: TContractState, _pool_id: u32, _unit_ids: Span<u32>, _probs: Span<u32>);
    fn send_request(ref self: TContractState, _user: ContractAddress, _pools_id: Span<u32>, _draw_amounts: Span<u32>);
    fn fulfill_random_words(ref self: TContractState, _request_id: u256, _random_words: Span<u256>);
    // view functions
    fn get_token_pool_info(self: @TContractState) -> Span<u256>;
    fn get_token_max_amounts(self: @TContractState) -> Span<u32>;
    fn get_token_remainings(self: @TContractState) -> Span<u32>;
    fn get_token_info(self: @TContractState, id: u256) -> (bool, u256, u32, u32);
    fn get_existed_unit_pool(self: @TContractState) -> Span<u32>;
    fn get_existed_drawing_pool(self: @TContractState) -> Span<u32>;
    fn get_unit_pool_info(self: @TContractState, unit_id: u32) -> (Span<u32>, PackedArray32);
    fn get_pool_info(self: @TContractState, pool_id: u32) -> (Span<u32>, Span<u32>, Span<u32>);
    fn pending_request_num(self: @TContractState) -> u256;
    fn get_request_queue(self: @TContractState) -> Span<u256>;
    fn get_last_request_id(self: @TContractState) -> u256;
    fn get_request_info(self: @TContractState, request_id: u256) -> RequestInfo;
}
#[derive(Copy, Drop, Serde,starknet::Store, PartialEq)]
pub struct PoolInfo {
    pub enable: bool,
    pub units: Span<u32>,
    pub probs: Span<u32>,
    pub accumulated_probs: Span<u32>,
}
#[derive(Copy, Drop, Serde,starknet::Store, PartialEq)]
pub struct UnitPoolInfo {
    pub enable: bool,
    pub tree_height: u8,
    pub probs: Span<u32>,
    pub tree: PackedArray32,
}
#[derive(Copy, Drop, Serde,starknet::Store, PartialEq)]
pub struct DrawingPoolInfo {
    pub enable: bool,
    pub units: Span<u32>,
    pub probs: Span<u32>,
    pub accumulated_probs: Span<u32>,
}
#[derive(Copy, Drop, Serde,starknet::Store, PartialEq)]
pub struct RequestInfo {
    pub exists: bool,
    pub fulfilled: bool,
    pub completed: bool,
    pub request_sender: ContractAddress,
    pub pools_id: Span<u32>,
    pub amounts: Span<u32>,
    pub random_words: Span<u256>,
}
#[derive(Copy, Drop, Serde,starknet::Store, PartialEq)]
pub struct PackedArray32 {
    pub nums: u256,
    pub result: Span<u256>,
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

#[starknet::contract]
mod DrawManager {
    use super::{MANAGER_ROLE, UnitPoolInfo, DrawingPoolInfo, RequestInfo, PackedArray32, IDrawManager, Errors, PoolInfo};
    use starknet::ContractAddress;
    use starknet::get_caller_address;
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
        UINT32_MAX: u32,
        nft_contract: ContractAddress,
        vrf_contract: ContractAddress,
        unit_pools_info: LegacyMap::<u32, PoolInfo>,
        drawing_pools_info: LegacyMap::<u32, PoolInfo>,
        requests_info: LegacyMap::<u256, RequestInfo>,
        request_nonce: u256,
        existed_unit: Array<u32>,
        existed_drawing: Array<u32>,
        max_amounts: Span<u32>,
        remainings: Span<u32>,
        ids: Span<u256>,
        requests_queue: Span<u256>,
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

    #[abi(embed_v0)]
    impl DrawManagerImpl of IDrawManager<ContractState> {
        fn set_vrf_contract(ref self: ContractState, _vrf_contract: ContractAddress) {
            self.access_control.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.vrf_contract.write(_vrf_contract);
            self.access_control.grant_role(FULLFILL_ROLE, _vrf_contract);
        }
        fn set_token_pool(ref self: ContractState, _ids: Span<u256>) {
            self.access_control.assert_only_role(MANAGER_ROLE);
            self.ids.write(_ids);
        }
        fn set_token_max_amount(ref self: ContractState, _max_amounts: Span<u32>) {
            self.access_control.assert_only_role(MANAGER_ROLE);
            assert(self.ids.read().len() > 0, Errors::EMPTY_IDS);
            assert(self.ids.read().len() == _max_amounts.len(), Errors::LENGTH_NOT_MATCH);
            self.max_amounts.write(_max_amounts);
            self.remainings.write(_max_amounts);
        }
        fn set_unit_pool(ref self: ContractState, _unit_id: u32, _unit_ids: Span<u32>, _probs: Span<u32>) {
            self.access_control.assert_only_role(MANAGER_ROLE);
            let mut unit = self.unit_pools_info.read(_unit_id);
            assert(_probs.len() == self.ids.read().len(), Errors::LENGTH_NOT_MATCH);
            assert(!unit.enable, Errors::UNIT_POOL_EXISTED);

            unit.accumulated_probs = get_accumulated_arr(_probs);
            unit.enable = true;
            unit.units = _unit_ids.clone();
            unit.probs = _probs.clone();
            self.unit_pools_info.write(_unit_id, new_unit);
            
            let mut existed_unit = self.existed_unit.read();
            existed_unit.push(_unit_id);
            self.existed_unit.write(existed_unit);
        }
        fn set_drawing_pool(ref self: ContractState, _pool_id: u32, _unit_ids: Span<u32>, _probs: Span<u32>) {
            self.access_control.assert_only_role(MANAGER_ROLE);
            assert(_unit_ids.len() == _probs.len(), Errors::LENGTH_NOT_MATCH);
            let mut pool = self.drawing_pools_info.read(_pool_id);
            assert(!pool.enable, Errors::DRAWING_POOL_EXISTED);
            let num = _unit_ids.len();
            let mut i = 0;
            loop{
                if i == num {
                    break;
                }
                let unit = self.unit_pools_info.read(_unit_ids[i]);
                assert(unit.enable, Errors::UNIT_POOL_NOT_EXIST);
                i += 1;
            }

            pool.accumulated_probs = get_accumulated_arr(_probs);
            pool.enable = true;
            pool.units = _unit_ids.clone();
            pool.probs = _probs.clone();
            self.drawing_pools_info.write(_pool_id, pool);
            
            let mut existed_drawing = self.existed_drawing.read();
            existed_drawing.push(_pool_id);
            self.existed_drawing.write(existed_drawing);
        }
        fn send_request(ref self: ContractState, _user: ContractAddress, _pools_id: Span<u32>, _draw_amounts: Span<u32>) {
            let _requester = _user;
            let request_id = self.request_nonce.read();
            self.request_nonce.write(request_id + 1);
            let mut request = RequestInfo::new();
            request.exists = true;
            request.request_sender = requester;
            request.pools_id = _pools_id.clone();
            request.amounts = _draw_amounts.clone();
            self.requests_info.write(request_id, request);
            
            let mut requests_queue = self.requests_queue.read();
            requests_queue.push(request_id);
            self.requests_queue.write(requests_queue);
        }
    }

    fn get_accumulated_arr(probs: Span<u32>) -> Span<u32> {
        let mut accumulated = ArrayTraits::new();
        let mut sum = 0;
        let num = probs.len();
        let mut i = 0;
        loop{
            if i == num {
                break;
            }
            sum += probs[i];
            accumulated.push(sum);
            i += 1;
        }
        accumulated.span()
    }
}