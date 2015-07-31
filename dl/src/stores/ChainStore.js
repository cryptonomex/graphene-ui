import Immutable from "immutable";
import utils from "../common/utils";


/**
 *  @brief maintains a local cache of blockchain state 
 *
 *  ChainStore is responsible for keeping track of objects,
 *  indexes, and subscriptions and completely abstracts away
 *  the websocket API exposed by the server.
 *
 *  All objects maintained by the ChainStore are kept Immutable to 
 *  facilitate easy change detection in the user interface.
 *
 *  It is undesirable to subscribe to all objects on the server; therefore,
 *  the ChainStore tracks the number of local subscribers to a particular object
 *  and automatically subscribes and unsubscribes from the remote object. It
 *  is important to manage this in a central place because the server only
 *  allows one callback per object.
 *
 *  When fetching data there are several possible states:
 *    1. The data is present, in which case it is simply returned
 *    2. The data is not present, in which case a query is made and a placeholder is
 *       returned indicating the loading state.
 *    3. The data is in the loading state, in which case it is simply returned.
 *    4. The data loading state returns an error, in which case the object state is changed
 *       from loading to error.
 *    5. The data is in the error state, in which case it is simply returned
 *    6. The data is 'stale' in which case a new query is made and a loading placeholder is returned
 *
 *  Every time an object is updated, the "last_update" property is set and every time an
 *  object is queried an optional freshness parameter may be passed which is compared against
 *  the last update property to determine staleness.  The last_update  property is maintained
 *  as part of the subscriptions structure and not the object itself to prevent the immutable
 *  object from being marked as dirty.
 */
class ChainStore 
{
   constructor() {
      this.objects_by_id            = Immutable.Map()
      this.accounts_by_name         = Immutable.Map()
      this.assets_by_id             = Immutable.Map()
      this.assets_by_symbol         = Immutable.Map()
      this.subscriptions_by_id      = new Map()
      this.subscriptions_by_account = new Map()
      this.subscriptions_by_market  = new Map()
   }

   getAccount( name_or_id, min_age = null )
   {
      let obj = this.getObject( id_or_symbol ) );
      return obj ? obj : this.getObject( this.accounts_by_name.get(id_or_symbol) )
   }

   getAsset(id_or_symbol, min_age = null) {
      let obj = this.getObject( id_or_symbol ) );
      return obj ? obj : this.getObject( this.assets_by_symbol.get(id_or_symbol) )
   }

   getObject( id, min_age = null) {
      if( !utils.is_object_id(id) ) 
         return null

      let obj =  this.objects_by_id.get(id)
      if( !obj )
      {
         obj = Immutable.Map({id,_loading:true}) )
         this.objects_by_id = this.objects_by_id.set( id, obj )

         // TODO: start async request to fetch object
      }
      /* TODO
      else if( min_age ) {
         check to see if we should refetch the object 
      }
      */
      return obj
   }

   getGlobalProperties( min_age = null )
   {
      /// TODO: replace "2.0.0" with constants defined from generated code
      return getObject( "2.0.0", min_age )
   }

   getDynamicGlobalProperties( min_age = null )
   {
      /// TODO: replace "2.1.0" with constants defined from generated code
      return getObject( "2.1.0", min_age )
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

   removeObject( object_id )
   {
      this.objects_by_id.delete(object_id)
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
