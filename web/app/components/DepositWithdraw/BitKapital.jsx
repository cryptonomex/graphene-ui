import React from "react";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import Translate from "react-translate-component";
import cnames from "classnames";
import TransactionConfirmStore from "stores/TransactionConfirmStore";
import AccountActions from "actions/AccountActions";
import AccountBalance from "../Account/AccountBalance";
import utils from "common/utils";

@BindToChainState()
export default class BitKapital extends React.Component {

    static propTypes = {
        jianjolly: ChainTypes.ChainAccount.isRequired,
        bitKapital: ChainTypes.ChainAccount.isRequired,
        asset: ChainTypes.ChainAsset.isRequired
    };

    static defaultProps = {
        jianjolly: "1.2.126253", // "jianjolly-0",
        bitKapital: "1.2.130090",
        asset: "KAPITAL"
    };

    constructor() {
        super();

        this.state = {
            action: "deposit",
            min: 55,
            max: 25050
        };
    }

    _renderDeposits() {
        return <iframe
            style={{width: "100%", minHeight: 800}}
            src={"https://bitkapital.com/kapital.html"}
        >
        </iframe>;
    }

    _renderWithdrawals() {
        return (
            <form onSubmit={this._onSubmit.bind(this)}>

                <div style={{padding: "20px 0"}}>
                    <Translate content="gateway.balance" />:
                    &nbsp;<span style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                        <AccountBalance
                            account={this.props.account.get("name")}
                            asset={this.props.asset.get("symbol")}
                        />
                    </span>
                </div>

                <label>Amount
                    <input ref="amount" required id="amount" type="number" min={this.state.min} max={this.state.max}></input>
                </label>

                <label>IBAN
                    <input ref="iban" required id="iban" type="text"></input>
                </label>

                <button className="button" type="submit">Withdraw</button>
            </form>
        );
    }

    changeAction(action) {
        this.setState({
            action
        });
    }

    _onSubmit(e) {
        e.preventDefault();
        let {min, max} = this.state;
        let {asset, account, bitKapital} = this.props;

        let amount = parseInt(this.refs.amount.value, 10);
        let iban = this.refs.iban.value;
        console.log("amount:", amount, "iban:", iban);

        let precision = utils.get_asset_precision(asset.get("precision"));

        if (amount < min || amount > max) {
            return;
        }

        AccountActions.transfer(
            account.get("id"), // from user
            bitKapital.get("id"), // to bitkapital account
            parseInt(amount * precision, 10), // amount in full precision
            asset.get("id"), // bitkapital asset id
            new Buffer("BOZDURMA - " + iban.toUpperCase(), "utf-8"), // memo
            null, // propose set to false
            asset.get("id"), // Pay fee with KAPITAL
        ).then( () => {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.listen(this.onTrxIncluded);
        });
    }

    onTrxIncluded(confirm_store_state) {
        if(confirm_store_state.included && confirm_store_state.broadcasted_transaction) {
            // this.setState(Transfer.getInitialState());
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        } else if (confirm_store_state.closed) {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        }
    }


    render() {
        let {jianjolly, account, asset} = this.props;
        let {action} = this.state;
        console.log("jianjolly:", jianjolly.toJS(), "asset:", asset.toJS());

        let isWhiteListed = jianjolly.get("whitelisted_accounts").includes(account.get("id"));

        console.log(account.get("id"), "isWhiteListed", isWhiteListed);

        if (false && !isWhiteListed) {
            return (
                <iframe
                    style={{width: "100%", minHeight: 800}}
                    src={"https://bitkapital.com/kayit.html" + account.get("name")}
                >
                </iframe>
            );
        }

        return (
            <div>
                <div style={{paddingBottom: 15}}>
                    <div style={{marginRight: 10}} onClick={this.changeAction.bind(this, "deposit")} className={cnames("button", action === "deposit" ? "active" : "outline")}><Translate content="gateway.deposit" /></div>
                    <div onClick={this.changeAction.bind(this, "withdraw")} className={cnames("button", action === "withdraw" ? "active" : "outline")}><Translate content="gateway.withdraw" /></div>
                </div>

                {action === "deposit" ? this._renderDeposits() : this._renderWithdrawals()}

            </div>
        );
    }
}
