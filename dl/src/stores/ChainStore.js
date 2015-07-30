import BaseStore from "./BaseStore"
import alt from "../alt-instance"
import ChainActions from "../actions/ChainActions.js"

class ChainStore extends BaseStore
{
   constructor() {
      super()
      this.accounts_by_id   = new Map()
      this.accounts_by_name = new Map()
      this.assets_by_id     = new Map()
      this.assets_by_name   = new Map()

      this.bindListeners({
         onGetAccount: ChainActions.getAccount,
         onSetBalance: ChainActions.setBalance
      });
   }

   onSetBalance( balance_object )
   {
      console.log( "on set balance", balance_object )
      this.getAccountByID( balance_object.owner ).balances[ balance_object.asset_type ] = balance_object
   }

   onGetAccount( full_account )
   {
     let {
         account, vesting_balances, statistics, call_orders, limit_orders, referrer_name, registrar_name, lifetime_referrer_name
     } = full_account

     account.balances = new Map
     if( account.id )
     {
        console.log( "caching account", account )
        this.accounts_by_id.set( account.id, account )
        this.accounts_by_name.set( account.name, account )
     }
     else
     {
        console.log( "no account.id", account )
     }
     console.log( "store", this )
     console.log( "store json", JSON.stringify( this, null, 2 ) )
     console.log( this.getAccountByID( account.id ) )
     console.log( this.getAccountByName( account.name ) )
   }

}

module.exports = alt.createStore(ChainStore, "ChainStore")
