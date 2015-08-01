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

   /**
    *  Check for an account by name.  If it isn't known and no
    *  query has been issued in the last min_age seconds then
    *  submit a query to fetch the account name. Otherwise
    *  return the promise from the prior query
    *
    *  @return a Promise for the account value
    */
   getAccountByName( name, min_age_ms = null )
   {
      let acnt = this.accounts_by_name.get(name)
      if( acnt && id in acnt )
         return getObject( acnt.id, min_age_ms )

      let now = new Date().getTime()
      if( acnt && min_age_ms && acnt.last_query <= now - min_age_ms ) 
         acnt.last_query = now
      else if( !acnt )
         acnt = { last_query : now }

      if( acnt.last_query != now && last_promise in acnt )
         return acnt.last_promise

      /** make a websocket json-rpc call to get_account_by_name and pass it 
       * the name of the account that we are looking for.  If a valid account
       * is returned then add it to the global objects_by_id cache, update the
       * accounts_by_name index to point to the object id, then return the
       * account object
       */
      acnt.last_promise = new Promise( (resolve,reject ) => {
          Apis.instance().db_api().exec( "get_account_by_name", [ name ] )
              .then( optional_account_object => {
                  if( optional_account_object )
                  {
                     let new_obj = this.updateObject( optional_account_object )
                     acnt.id = new_obj.id
                     this.accounts_by_name.set( name, acnt )
                     resolve( new_obj )
                  }
                  else
                  {
                     reject( Error("Account " + name + " was not found" ) )
                  }
              }).catch( error => reject(error) )
      })
   }

   /**
    *  If the data is in the cache then the promise will resolve
    *  immediately.  Otherwise an asynchronous call will be made to
    *  fetch the object from the server.  
    *
    *  @return a promise with the object data
    */
   getObject( id, min_age = null) {
      if( !utils.is_object_id(id) ) 
         throw Error( "argument is not an object id" )

      let current_sub = this.subscriptions_by_id.get(id)

      let now = new Date().getTime()
      if( current_sub && min_age_ms && current_sub.last_update <= now - min_age_ms )
         current_sub.last_update = now
      else if( !current_sub )
         current_sub = { last_update: now }

      if( current_sub.now != now ) 
         return current_sub.last_promise
      
      current_sub.last_promise = new Promise( (resolve, reject ) => {
          Apis.instance().db_api().exec( "get_objects", [ id ] )
              .then( optional_objects => {
                  let result = optional_objects[0]
                  if( result )
                      resolve( this.updateObject( result ) )
                  else
                      reject( Error( "Unable to find object " + id ) )
              }).catch( error => reject(error) )
      })
      this.subscriptions_by_id.set( id, current_sub )
      return current_sub.last_promise
   }

   /**
    *  @return a promise to the current value of the object
    *  at the time of the subscription.  
    */
   subscribeToObject( id, subscriber, on_update )
   {
      let current_sub = this.subscriptions_by_id.get(id)

      if( !current_sub ) 
      {
         current_sub = { subscriptions : new Map() }
         this.subscriptions_by_id.set( id, current_sub )
      }

      if( !(subscriptions in current_sub ) )
         current_sub.subscriptions = new Map()
      let original_size = current_sub.subscriptions.size
      current_sub.subscriptions.set( subscriber, on_update )
      if( original_size == 0 )
      {
         /// TODO notify the backend that we would like to subscribe
         /// to updates on this object
      }

      return current_sub.last_promise
   }

   /**
    *  Remove the callback associated with the subscrier and
    *  unsubscribe from the remote server if the subscriber was 
    *  the last one listening
    */
   unsubscribeFromObject( id, subscriber )
   {
      let current_sub = this.subscriptions_by_id.get(id)
      if( !current_sub ) return
      if( !(subscriptions in current_sub) ) return

      if( current_sub.subscriptions.delete( subscriber ) )
      {
          if( current_sub.subscriptions.size == 0 )
          {
              // TODO: notify the backend that we would like to unsubscribe from
              // this particular object
          }
      }
   }

   getAssetBySymbol( name, min_age = null )
   {
   }

   /**
    *  Updates the object in place by only merging the set
    *  properties of object.  
    *
    *  This method will create an immutable object with the given ID if
    *  it does not already exist.
    *
    *  @pre object.id must be a valid object ID
    *  @return an Immutable constructed from object and deep merged with the current state
    */
   updateObject( object )
   {
      let current = this.objects_by_id.get( object.id )
      let by_id = this.objects_by_id
      if( !current )
         by_id = by_id.set( object.id, current = Immutable.fromJS(object) )
      else
         by_id = by_id.set( object.id, current = current.mergeDeep( Immutable.fromJS(object) ) )
      this.objects_by_id = by_id

      /** modify the current subscription state to indicate the last update time and
       * replace the last_promise with one that returns the latest object
       */
      let current_sub = this.subscriptions_by_id.get( object.id )
      current_sub.last_update = new Date().getTime()
      current_sub.last_promise = new Promise( (resolve,reject)=>resolve(current) )

      /// notify everyone who has subscribed to updates of this object
      if( subscriptions in current_sub )
         for( sub of current_sub.subscriptions )
            sub( current )

      return current;
   }

   getGlobalProperties( min_age_ms = null )
   {
      /// TODO: replace "2.0.0" with constants defined from generated code
      return this.getObject( "2.0.0", min_age_ms )
   }

   getDynamicGlobalProperties( min_age = null )
   {
      /// TODO: replace "2.1.0" with constants defined from generated code
      return this.getObject( "2.1.0", min_age_ms )
   }

   removeObject( object_id )
   {
      this.objects_by_id.delete(object_id)
      /// TODO: notify backend that we no longer wish to subscribe to the
      /// given ID  (if we are currently subscribed)
      this.subscriptions_by_id.delete(object_id)
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
