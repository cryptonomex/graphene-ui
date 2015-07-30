import BaseStore from "./BaseStore"
import alt from "../alt-instance"
import ChainActions from "../actions/ChainActions.js"
import deepmerge from 'lodash.merge'

class AccountObject
{
  constructor( id ) {
     this.id = id
     this.balances = {}
     this.vesting_balances = {}
  }
}


class ChainStore extends BaseStore
{
   constructor() {
      super()
      this.objects_by_id    = new Map()
      this.accounts_by_name = new Map()
      this.assets_by_id     = new Map()
      this.assets_by_name   = new Map()

      this.bindListeners({
         onGetAccount: ChainActions.getAccount,
         onSetBalance: ChainActions.setBalance,
         onSetVestingBalance: ChainActions.setVestingBalance,
         updateObject: ChainActions.updateObject
      });
   }
   getOrCreateAccount( id )
   {
      let account = this.objects_by_id.get(id)
      console.log( "exsiting account", account, "for id ",id )
      if( !account )
      {
         console.log( "creating new account" );
         account = new AccountObject( id )
         this.objects_by_id.set(id, account )
      }
      return account;
   }

   getOrCreateObject( id )
   {
      let object = this.objects_by_id.get(id)
      if( !object )
      {
         object = {id}
         this.objects_by_id.set( id, object )
      }
      return object;
   }


   /**
    *  Updates the object in place by only merging the set
    *  properties of object.  
    *
    *  This method will create an object with the given ID if
    *  it does not already exist.
    *
    *  @pre object.id must be a valid object ID
    */
   updateObject( object )
   {
      let obj = this.getOrCreateObject( object.id )
      deepmerge( obj, object )
      return obj;
   }

   onSetVestingBalance( balance_object )
   {
      let balance_obj = this.updateObject( balance_object );
      let account     = this.getOrCreateAccount( balance_obj.owner )
      account.vesting_balances[ balance_obj.id ] =  balance_obj;
   }


   onSetBalance( balance_object )
   {
      console.log( "set balance" );
      let balance_obj = this.updateObject( balance_object );
      console.log("balance_obj: ",balance_obj);
      let account     = this.getOrCreateAccount( balance_obj.owner )
      console.log("account: ",account);
      account.balances[ balance_obj.asset_type] =  balance_obj;
      console.log("balance object:",balance_obj,"account:",account)
   }

   onGetAccount( full_account )
   {
     console.log( "full account: ", full_account )
     let {
         account, vesting_balances, statistics, call_orders, limit_orders, referrer_name, registrar_name, lifetime_referrer_name
     } = full_account

     if( !account.id ) return

     let current_account = this.getOrCreateAccount( account.id )
     console.log( "current account", current_account )
     let had_name = 'name' in current_account
     deepmerge( current_account, account ) 
     console.log( "merged account", current_account )

     if( !had_name )
        this.accounts_by_name.set( current_account.name, current_account )
     console.log( "full account: ", full_account )

     for( var i = 0; i < full_account.balances.length; ++i )
        this.onSetBalance( full_account.balances[i] )

     for( var i = 0; i < full_account.vesting_balances.length; ++i )
        this.onSetVestingBalance( full_account.vesting_balances[i] )

     for( var i = 0; i < full_account.vesting_balances.length; ++i )
        this.onSetVestingBalance( full_account.vesting_balances[i] )

     current_account.stats = this.updateObject( statistics )
 
   }

}

module.exports = alt.createStore(ChainStore, "ChainStore")
