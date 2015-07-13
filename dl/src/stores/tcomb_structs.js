var t = require("tcomb");

let Account = t.struct({
    id: t.Str,
    name: t.Str,
    owner: t.Obj,
    active: t.Obj,
    annotations: t.Arr,
    options: t.Obj,
    //voting_account: t.Str,
    //num_witness: t.Num,
    //num_committee: t.Num,
    //votes: t.Arr,
    referrer: t.Str,
    referrer_rewards_percentage: t.Num,
    registrar: t.Str,
    lifetime_referrer: t.Str,
    lifetime_referrer_fee_percentage: t.Num,
    membership_expiration_date: t.Str,
    network_fee_percentage: t.Num,
    statistics: t.Str,
    blacklisting_accounts: t.Arr,
    whitelisting_accounts: t.Arr,
    cashback_vb: t.maybe(t.Str)
}, "Account");

let Asset = t.struct({
    annotations: t.Arr,
    bitasset_data_id: t.maybe(t.Str),
    bitasset_data: t.maybe(t.Obj),
    dynamic_asset_data_id: t.Str,
    dynamic_data: t.maybe(t.Obj),
    id: t.Str,
    issuer: t.Str,
    market_asset: t.Bool,
    options: t.Obj,
    precision: t.Num,
    symbol: t.Str
}, "Asset");

// let BitAssetData = t.struct({
//     current_feed: t.Obj,
//     current_feed_publication_time: t.Str,
//     feeds: t.Arr,
//     force_settled_volume: t.Num,
//     id: t.Str,
//     is_prediction_market: t.Bool,
//     options: t.Obj
// }, "BitAssetData");

let Block = t.struct({
    extensions: t.Arr,
    id: t.Num,
    next_secret_hash: t.Str,
    previous: t.Str,
    previous_secret: t.Str,
    timestamp: t.Dat,
    transactions: t.Arr,
    transaction_merkle_root: t.Str,
    witness: t.Str,
    witness_signature: t.Str
}, "Block");

let WalletTcomb = t.struct({
    id: t.maybe(t.Num),
    public_name: t.Str,
    password_checksum: t.Str,
    encrypted_brainkey: t.maybe(t.Str),
    brainkey_checksum: t.Str,
    brainkey_sequence: t.Num,
    backed_up: t.maybe(t.Bool)
}, "WalletTcomb");

//let PublicKeyTcomb = t.struct({
//    id: t.maybe(t.Num),
//    pubkey: t.Str,
//    key_id: t.maybe(t.Str)
//}, "PublicKeyTcomb");

let PrivateKeyTcomb = t.struct({
    id: t.maybe(t.Num),
    key_id: t.maybe(t.Str),
    wallet_id: t.Num,
    // brainkey_pos: "0" = 1st owner key, "0.0" = 1st active for owner "0"
    brainkey_pos: t.maybe(t.Str),
    encrypted_key: t.Str,
    pubkey: t.Str
}, "PrivateKeyTcomb");

let Witness = t.struct({
    accumulated_income: t.Num,
    id: t.Str,
    next_secret_hash: t.Str,
    previous_secret: t.Str,
    signing_key: t.Str,
    url: t.Str,
    vote_id: t.Str,
    witness_account: t.Str
}, "Witness");

let Delegate = t.struct({
    id: t.Str,
    delegate_account: t.Str,
    vote_id: t.Str
}, "Delegate");

let GlobalObject = t.struct({
    active_delegates: t.Arr,
    active_witnesses: t.Arr,
    chain_id: t.Str,
    id: t.Str,
    next_available_vote_id: t.Num,
    parameters: t.Obj
}, "GlobalObject");

let DynGlobalObject = t.struct({
    current_witness: t.Str,
    head_block_id: t.Str,
    head_block_number: t.Num,
    id: t.Str,
    next_maintenance_time: t.Dat,
    random: t.Str,
    time: t.Dat,
    witness_budget: t.Num
}, "DynGlobalObject");

let LimitOrder = t.struct({
    expiration: t.Dat,
    for_sale: t.Num,
    id: t.Str,
    sell_price: t.Obj,
    seller: t.Str
}, "LimitOrder");

let ShortOrder = t.struct({
    expiration: t.Dat,
    for_sale: t.Num,
    id: t.Str,
    sell_price: t.Obj,
    seller: t.Str
}, "ShortOrder");

let CallOrder = t.struct({
    borrower: t.Str,
    call_price: t.Obj,
    collateral: t.Num,
    debt: t.Num,
    id: t.Str,
    maintenance_collateral_ratio: t.Num
}, "CallOrder");

let LimitTrx = t.struct({
    amount_to_sell: t.Obj,
    expiration: t.Dat,
    fee: t.Obj,
    fill_or_kill: t.Bool,
    min_to_receive: t.Obj,
    seller: t.Str
}, "LimitTrx");

let ShortTrx = t.struct({
    amount_to_sell: t.Obj,
    collateral: t.Obj,
    expiration: t.Dat,
    fee: t.Obj,
    initial_collateral_ratio: t.Num,
    maintenance_collateral_ratio: t.Num,
    seller: t.Str
}, "ShortTrx");

module.exports = {
    Account: Account,
    Asset: Asset,
    Block: Block,
    WalletTcomb: WalletTcomb,
    //PublicKeyTcomb: PublicKeyTcomb,
    PrivateKeyTcomb: PrivateKeyTcomb,
    Witness: Witness,
    Delegate: Delegate,
    GlobalObject: GlobalObject,
    DynGlobalObject: DynGlobalObject,
    LimitTrx: LimitTrx,
    ShortTrx: ShortTrx,
    LimitOrder: LimitOrder,
    ShortOrder: ShortOrder,
    CallOrder: CallOrder
};
