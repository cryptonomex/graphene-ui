import React from "react";
import {PropTypes} from "react";
import {Link} from "react-router";
import Translate from "react-translate-component";
import BaseComponent from "../BaseComponent";
import ChainStore from "api/chain"
import AltContainer from 'alt/AltContainer';
import Inspector from "react-json-inspector";


class Accounts2 extends BaseComponent {

    constructor() {
       super({account_name:"nathan"});
       this.state = {
         account : null
       }
       console.log( "Accounts2 constructor" )

       let comp = this

       ChainStore.getAccountByName( "nathan" )
                 .then( acnt => {
                   this.setState( {account:acnt} )
                   ChainStore.getFullAccountById( acnt.get('id'), ((acnt) =>
                                       { comp.onAccountUpdate(acnt)
                                         console.log( "update callback" )} ) )
                             .then( acnt => comp.setState({account:acnt}),
                                    err  => console.log( "error looking up account", err ) )
                 }, err => console.log( "error looking up account" ) )
    }

    onAccountUpdate( acnt ) {
       console.log( "update account", acnt )
       this.setState( {account:acnt} )
    }

    /*
    shouldComponentUpdate(nextProps) {
        return true;
    }
    */

    render() {
       console.log( "Accounts2 render" );
       if( this.state.account ) 
       {
           let name = this.state.account.get('name')
           let balance = ChainStore.getAccountBalance( this.state.account, "1.3.0" )

           return (
               <div className="grid-block vertical">
                   <div className="grid-block page-layout">
                       <div className="grid-block medium-6 main-content">
                           <div className="grid-content">
                           { name }<br/>
                           { balance } CORE
                           <Inspector data={this.state.account.toJS()} key={this.state.inspector_key}/>
                           { JSON.stringify( this.state.account.balances, null, 2 ) }
                           </div>
                       </div>
                   </div>
               </div>
           );
       } else
        {
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
