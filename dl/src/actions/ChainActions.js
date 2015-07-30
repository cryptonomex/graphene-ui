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

    getAccount(name_or_id) {

        console.log( "ChainActions.getAccount()", name_or_id );
        let subscription = (result) => {
             console.log("sub result:", result )

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
                this.dispatch(fullAccount[0][1]);
            }).catch((error) => {
                console.log("Error in ChainActions.getAccount: ", error);
            });
    }
}

module.exports = alt.createActions(ChainActions);
