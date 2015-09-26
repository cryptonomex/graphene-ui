var helper = require('../chain/transaction_helper')
var ops = require('../chain/signed_transaction')
var type = require('../chain/serializer_operation_types')
var v = require('../chain/serializer_validation')
import key from "../common/key_utils"
import lookup from "chain/lookup"
import chain_types from "chain/chain_types"

var PrivateKey = require('../ecc/key_private')
var ApplicationApi = require('./ApplicationApi')
var WalletDb = require('../stores/WalletDb')

import PrivateKeyStore from "stores/PrivateKeyStore"
import Aes from "ecc/aes"

class WalletApi {

    constructor() {
        this.application_api = new ApplicationApi()
    }
    
    new_transaction() {
        return new ops.signed_transaction()
    }
    
    sign_and_broadcast( tr, broadcast = true ) {
        v.required(tr, "transaction")
        return WalletDb.process_transaction(
            tr,
            null, //signer_private_key,
            broadcast
        )
    }
    
    /** Console print any transaction object with zero default values. */
    template(transaction_object_name) {
        var object = helper.template(
            transaction_object_name, 
            {use_default: true, annotate: true}
        )
        // visual
        console.error(JSON.stringify(object,null,4))
        
        // usable
        object = helper.template(
            transaction_object_name, 
            {use_default: true, annotate: false}
        )
        // visual
        console.error(JSON.stringify(object))
        return object
    }

    create_account_with_brain_key(
        brainkey,
        new_account_name,
        registrar_id,
        referrer_id = 0,
        referrer_percent = 100,
        broadcast = true
    ) {
        var owner_privkey = key.get_owner_private( brainkey, "0" )
        var active_privkey = key.get_active_private( owner_privkey )
        return this.application_api.create_account_with_brain_key(
            owner_privkey.toPublicKey().toPublicKeyString(),
            active_privkey.toPublicKey().toPublicKeyString(),
            new_account_name,
            registrar_id,
            referrer_id,
            referrer_percent,
            broadcast
        )
    }
    
    transfer(
        from_account_id,
        to_account_id,
        amount, 
        asset, 
        memo_message,
        broadcast = true,
        encrypt_memo = true,
        optional_nonce = null
    ) {
        return this.application_api.transfer(
            from_account_id,
            to_account_id,
            amount, 
            asset, 
            memo_message,
            broadcast,
            encrypt_memo,
            optional_nonce
        )
    }

}
module.exports = WalletApi
