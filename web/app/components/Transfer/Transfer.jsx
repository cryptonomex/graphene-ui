import React from "react";
import BalanceComponent from "../Utility/BalanceComponent";
import AccountActions from "actions/AccountActions";
import Translate from "react-translate-component";
import AccountSelector from "../Account/AccountSelector";
import AccountStore from "stores/AccountStore";
import AmountSelector from "../Utility/AmountSelector";
import utils from "common/utils";
import counterpart from "counterpart";
import TransactionConfirmStore from "stores/TransactionConfirmStore";

class Transfer extends React.Component {

    static contextTypes = {
        router: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = Transfer.getInitialState();
        if(props.query.from) this.state.from_name = props.query.from;
        if(props.query.to) this.state.to_name = props.query.to;
        if(props.query.amount) this.state.amount = props.query.amount;
        if(props.query.asset) this.state.asset_id = props.query.asset;
        if(props.query.memo) this.state.memo = props.query.memo;
        this.onTrxIncluded = this.onTrxIncluded.bind(this);
    }

    static getInitialState(){
        return {
            from_name: "",
            to_name: "",
            from_account: null,
            to_account: null,
            amount: "",
            asset_id: null,
            asset: null,
            memo: ""
        };
    }

    fromChanged(from_name) {
        let asset = undefined
        let amount = undefined
        this.setState({from_name,asset,amount})
    }

    toChanged(to_name) {
        this.setState({to_name})
    }

    onFromAccountChanged(from_account) {
        this.setState({from_account})
    }

    onToAccountChanged(to_account) {
        this.setState({to_account})
    }

    onAmountChanged({amount, asset}) {
        this.setState({amount, asset})
    }

    onMemoChanged(e) {
        this.setState({memo: e.target.value});
    }

    onTrxIncluded(confirm_store_state) {
        if(confirm_store_state.included && confirm_store_state.broadcasted_transaction) {
            this.setState(Transfer.getInitialState());
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        }
    }

    onSubmit(e) {
        e.preventDefault();
        let asset = this.state.asset;
        let precision = utils.get_asset_precision(asset.get("precision"));
        let amount = this.state.amount.replace( /,/g, "" )
        AccountActions.transfer(
            this.state.from_account.get("id"),
            this.state.to_account.get("id"),
            parseInt(amount * precision, 10),
            asset.get("id"),
            this.state.memo
        ).then( () => {
            TransactionConfirmStore.listen(this.onTrxIncluded);
        }).catch( e => {
            console.log( "error: ",e)
        } );
    }

    render() {
        let from_error = null;
        if(this.state.from_account && !AccountStore.isMyAccount(this.state.from_account) )
            from_error = counterpart.translate("account.errors.not_yours");

        let asset_types = [];
        let balance = null;
        if (this.state.from_account && !from_error) {
            let account_balances = this.state.from_account.get("balances").toJS();
            asset_types = Object.keys(account_balances);
            if (asset_types.length > 0) {
                let current_asset_id = this.state.asset ? this.state.asset.get("id") : asset_types[0];
                balance = (<span><Translate component="span" content="transfer.available"/>: <BalanceComponent balance={account_balances[current_asset_id]}/></span>)
            } else {
                balance = "No funds";
            }
        }

        let submitButtonClass = "button";
        if(!this.state.from_account || !this.state.to_account || !this.state.amount || this.state.amount === "0" || !this.state.asset || from_error)
            submitButtonClass += " disabled";

        return (
            <form className="grid-block vertical full-width-content" onSubmit={this.onSubmit.bind(this)} noValidate>
                <div className="grid-container large-5 medium-7 small-11" style={{paddingTop: "2rem"}}>
                    {/*  F R O M  */}
                    <div className="content-block">
                        <AccountSelector label="transfer.from"
                                         accountName={this.state.from_name}
                                         onChange={this.fromChanged.bind(this)}
                                         onAccountChanged={this.onFromAccountChanged.bind(this)}
                                         account={this.state.from_name}
                                         error={from_error}
                                         tabIndex={1}/>
                    </div>
                    {/*  T O  */}
                    <div className="content-block">
                        <AccountSelector label="transfer.to"
                                         accountName={this.state.to_name}
                                         onChange={this.toChanged.bind(this)}
                                         onAccountChanged={this.onToAccountChanged.bind(this)}
                                         account={this.state.to_name}
                                         tabIndex={2}/>
                    </div>
                    {/*  A M O U N T   */}
                    <div className="content-block">
                        <AmountSelector label="transfer.amount"
                                        amount={this.state.amount}
                                        onChange={this.onAmountChanged.bind(this)}
                                        asset={asset_types.length > 0 && this.state.asset ? this.state.asset.get("id") : ( this.state.asset_id ? this.state.asset_id : asset_types[0])}
                                        assets={asset_types}
                                        display_balance={balance}
                                        tabIndex={3}/>
                    </div>
                    {/*  M E M O  */}
                    <div className="content-block">
                        <label><Translate component="span" content="transfer.memo"/></label>
                        <textarea rows="1" value={this.state.memo} tabIndex="4" onChange={this.onMemoChanged.bind(this)}/>
                        {/*<div>{memo_error}</div>*/}
                    </div>

                    {/*  S E N D  B U T T O N  */}
                    <div>
                        <button className={submitButtonClass} type="submit" value="Submit" tabIndex="5">
                            <Translate component="span" content="transfer.send" />
                        </button>
                    </div>

                    {/* TODO: show remaining balance */}

                </div>

            </form>
        );
    }
}

export default Transfer;
