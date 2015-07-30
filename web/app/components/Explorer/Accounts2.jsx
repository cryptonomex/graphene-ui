import React from "react";
import {PropTypes} from "react";
import {Link} from "react-router";
import Translate from "react-translate-component";
import BaseComponent from "../BaseComponent";
import ChainActions from "actions/ChainActions.js"
import ChainStore from "stores/ChainStore"
import AltContainer from 'alt/AltContainer';
import Inspector from "react-json-inspector";
import cloneDeep from "lodash.clonedeep"
import clone   from "lodash.clone"


class Accounts2 extends BaseComponent {

    constructor() {
       super({account_name:"nathan"},ChainStore);
       this.state = {
         account : null
       }
       console.log( "Accounts2 constructor" )
           ChainActions.getAccount( "nathan" );
    }

    shouldComponentUpdate(nextProps) {
        return true;
    }

    onChange(newState) {
       console.log( "changed" );
        if (newState) {
            console.log( "newState2" );
            this.setState( { account : clone(ChainStore.getState().accounts_by_name.get( "nathan" ))/*, inspector_key : Date.now() */} );
            console.log( "NEW STATE", this.state );
        }
    }

    render() {
       console.log( "Accounts2 render" );
       let accounts = ChainStore.getState().accounts_by_name;
       let acnt = ChainStore.getState().accounts_by_name.get("nathan");
       console.log( "RENDER NEW STATE", this.state, "acnt", acnt );

       if( this.state.account ) 
       {
           return (
               <div className="grid-block vertical">
                   <div className="grid-block page-layout">
                       <div className="grid-block medium-6 main-content">
                           <div className="grid-content">
                           { JSON.stringify( this.state.account, null, 2 ) }
                           <Inspector data={this.state.account} key={this.state.inspector_key}/>
                           { JSON.stringify( this.state.account.balances, null, 2 ) }
                           </div>
                       </div>
                   </div>
               </div>
           );
       } else
        {
           ChainActions.getAccount( "nathan" );
           return (
               <div className="grid-block vertical">
                   <div className="grid-block page-layout">
                       <div className="grid-block medium-6 main-content">
                           <div className="grid-content">
                           { JSON.stringify( "Not Found", null, 2 ) }
                           </div>
                       </div>
                   </div>
               </div>
           )
        }
    }
}

Accounts2.defaultProps = {
    account: {}
};


export default Accounts2;
