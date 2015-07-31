import alt from "../alt-instance";
import utils from "../common/utils";
import api from "../api/accountApi";

class ChainActions {

    setBalance( balance ) {
       console.log( "set balance", balance );
       this.dispatch( balance );
    }

    setVestingBalance( balance ) {
       console.log( "set vesting balance", balance );
       this.dispatch( balance );
    }

    updateObject( object ) {
      console.log( object )
      this.dispatch( object )
    }

    removeObject( object_id )
    {
      console.log( object )
      this.dispatch( object_id )
    }

    getGlobalProperties()
    {
        return api.getFullAccounts( subscription.bind(this) /*subscription.bind(this, name_or_id)*/, name_or_id)
            .then(fullAccount => {
                console.log("result:", fullAccount);
                this.pending_requests.delete(name_or_id)
                this.dispatch(fullAccount[0][1]);
            }).catch((error) => {
                console.log("Error in ChainActions.getAccount: ", error);
                this.pending_requests.delete(name_or_id)
            });


    }

    getAccount(name_or_id) {
        if( !this.pending_requests ) 
           this.pending_requests = new Set()
        else if( this.pending_requests.has(name_or_id) ) 
           return

        this.pending_requests.add(name_or_id)

        console.log( "ChainActions.getAccount()", name_or_id );

        /**
             This method will be called with an array containing all of the
             objects that were added, removed, or modified that are relevant
             to the given account.

        */
        let subscription = (result) => {
             console.log("sub result:", result )
             let objs = result[0]
             for( var i = 0; i < objs.length; ++i )
             {
                let obj = objs[i];
                if( typeof obj == 'object' )
                { // obj.id has been created or updated
                   if( obj.id.search( "1.5." ) == 0 )
                      this.actions.setBalance( obj )
                   else if( obj.id.search( "1.13." ) == 0 )
                      this.actions.setVestingBalance( obj )
                   else 
                      this.actions.updateObject( obj )
                }
                else if( typeof obj == 'string' )
                { // obj is the ID of an object that has been removed
                   this.actions.removeObject( obj );
                }
             }

             if( result[0][0].id.split('.')[1] == 5 )
                this.actions.setBalance( result[0][0] );
             else if( result[0][0].id.split('.')[1] == 13 )
                this.actions.setVestingBalance( result[0][0] );
             else
                this.actions.updateObject( result[0][0] );
        };

        return api.getFullAccounts( subscription.bind(this) /*subscription.bind(this, name_or_id)*/, name_or_id)
            .then(fullAccount => {
                console.log("result:", fullAccount);
                this.pending_requests.delete(name_or_id)
                this.dispatch(fullAccount[0][1]);
            }).catch((error) => {
                console.log("Error in ChainActions.getAccount: ", error);
                this.pending_requests.delete(name_or_id)
            });
    }
}

module.exports = alt.createActions(ChainActions);
