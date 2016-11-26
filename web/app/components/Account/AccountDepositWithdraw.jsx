import React from "react";
import {Link} from "react-router";
import connectToStores from "alt/utils/connectToStores";
import accountUtils from "common/account_utils";
import utils from "common/utils";
import Translate from "react-translate-component";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import WalletDb from "stores/WalletDb";
// import TranswiserDepositWithdraw from "../DepositWithdraw/transwiser/TranswiserDepositWithdraw";
// import BlockTradesBridgeDepositRequest from "../DepositWithdraw/blocktrades/BlockTradesBridgeDepositRequest";
// import BlockTradesGatewayDepositRequest from "../DepositWithdraw/blocktrades/BlockTradesGatewayDepositRequest";
import BlockTradesGateway from "../DepositWithdraw/BlockTradesGateway";
// import OpenLedgerFiatDepositWithdrawal from "../DepositWithdraw/openledger/OpenLedgerFiatDepositWithdrawal";
// import OpenLedgerFiatTransactionHistory from "../DepositWithdraw/openledger/OpenLedgerFiatTransactionHistory";
import Tabs from "../Utility/Tabs";
import HelpContent from "../Utility/HelpContent";
import Post from "common/formPost";
import cnames from "classnames";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import SettingsActions from "actions/SettingsActions";
import BitKapital from "../DepositWithdraw/BitKapital";

@BindToChainState()
class AccountDepositWithdraw extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
        contained: React.PropTypes.bool
    };

    static defaultProps = {
        contained: false
    };

    constructor(props) {
        super();
        this.state = {
            blockTradesCoins: [],
            blockTradesBackedCoins: [],
            openLedgerCoins: [],
            openLedgerBackedCoins: [],
            olService: props.viewSettings.get("olService", "gateway"),
            btService: props.viewSettings.get("btService", "bridge"),
            activeService: 0,
            services: ["Openledger (OPEN.X)"],
            currentCoin: "TL"
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.account !== this.props.account ||
            !utils.are_equal_shallow(nextState.blockTradesCoins, this.state.blockTradesCoins) ||
            !utils.are_equal_shallow(nextState.blockTradesBackedCoins, this.state.blockTradesBackedCoins) ||
            !utils.are_equal_shallow(nextState.openLedgerCoins, this.state.openLedgerCoins) ||
            !utils.are_equal_shallow(nextState.openLedgerBackedCoins, this.state.openLedgerBackedCoins) ||
            nextState.olService !== this.state.olService ||
            nextState.btService !== this.state.btService ||
            nextState.metaService !== this.state.metaService ||
            nextState.currentCoin !== this.state.currentCoin
        );
    }

    componentWillMount() {
        accountUtils.getFinalFeeAsset(this.props.account, "transfer");

        // fetch("https://blocktrades.us/api/v2/coins").then(reply => reply.json().then(result => {
        //     this.setState({
        //         blockTradesCoins: result
        //     });
        //     this.setState({
        //         blockTradesBackedCoins: this.getBlocktradesBackedCoins(result)
        //     });
        // })).catch(err => {
        //     console.log("error fetching blocktrades list of coins", err);
        // });

        fetch("https://blocktrades.us/ol/api/v2/coins").then(reply => reply.json().then(result => {
            this.setState({
                openLedgerCoins: result
            });
            this.setState({
                openLedgerBackedCoins: this.getOpenledgerBackedCoins(result)
            });
        })).catch(err => {
            console.log("error fetching openledger list of coins", err);
        });
    }

    // getBlocktradesBackedCoins(allBlocktradesCoins) {
    //     let coins_by_type = {};
    //     allBlocktradesCoins.forEach(coin_type => coins_by_type[coin_type.coinType] = coin_type);
    //     let blocktradesBackedCoins = [];
    //     allBlocktradesCoins.forEach(coin_type => {
    //         if (coin_type.walletSymbol.startsWith('TRADE.') && coin_type.backingCoinType)
    //         {
    //             blocktradesBackedCoins.push({
    //                 name: coins_by_type[coin_type.backingCoinType].name,
    //                 walletType: coins_by_type[coin_type.backingCoinType].walletType,
    //                 backingCoinType: coins_by_type[coin_type.backingCoinType].walletSymbol,
    //                 symbol: coin_type.walletSymbol,
	// 				supportsMemos: coins_by_type[coin_type.backingCoinType].supportsOutputMemos
    //             });
    //         }});
    //     return blocktradesBackedCoins;
    // }

    setCurrentCoin(coin) {
        this.setState({
            currentCoin: coin
        });
    }

	getOpenledgerBackedCoins(allOpenledgerCoins) {
        let coins_by_type = {};
        allOpenledgerCoins.forEach(coin_type => coins_by_type[coin_type.coinType] = coin_type);
        let openledgerBackedCoins = [];
        allOpenledgerCoins.forEach(coin_type => {
            if (coin_type.walletSymbol.startsWith('OPEN.') && coin_type.backingCoinType)
            {
                openledgerBackedCoins.push({
                    name: coins_by_type[coin_type.backingCoinType].name,
                    walletType: coins_by_type[coin_type.backingCoinType].walletType,
                    backingCoinType: coins_by_type[coin_type.backingCoinType].walletSymbol,
                    symbol: coin_type.walletSymbol,
					supportsMemos: coins_by_type[coin_type.backingCoinType].supportsOutputMemos
                });
            }});
        return openledgerBackedCoins;
    }

    toggleOLService(service) {
        this.setState({
            olService: service
        });

        SettingsActions.changeViewSetting({
            olService: service
        });
    }

    // toggleBTService(service) {
    //     this.setState({
    //         btService: service
    //     });
    //
    //     SettingsActions.changeViewSetting({
    //         btService: service
    //     });
    // }

    // toggleMetaService(service) {
    //     this.setState({
    //         metaService: service
    //     });
    //
    //     SettingsActions.changeViewSetting({
    //         metaService: service
    //     });
    // }

    onSetService(e) {
        let index = this.state.services.indexOf(e.target.value);
        this.setState({
            activeService: index
        });

        SettingsActions.changeViewSetting({
            activeService: index
        });
    }

    render() {
        let {account} = this.props;
        let {olService, btService, metaService, depositWithdrawDefaultActiveTab,
            services, activeService, currentCoin} = this.state;

        // let blockTradesGatewayCoins = this.state.blockTradesBackedCoins.filter(coin => {
        //     if (coin.backingCoinType === "muse") {    // it is not filterring, should be MUSE
        //         return false;
        //     }
        //     return coin.symbol.toUpperCase().indexOf("TRADE") !== -1;
        // })
        // .map(coin => {
        //     return coin;
        // })
        // .sort((a, b) => {
		// 	if (a.symbol < b.symbol)
		// 		return -1
		// 	if (a.symbol > b.symbol)
		// 		return 1
		// 	return 0
		// });

        let openLedgerGatewayCoins = this.state.openLedgerBackedCoins
        .filter((a) => {
            return (a.symbol === "OPEN.BTC" || a.symbol === "OPEN.USDT");
        })
        .map(coin => {
            return coin;
        });

        // console.log("openLedgerGatewayCoins:", openLedgerGatewayCoins, "olService", olService);

        return (
		<div className={this.props.contained ? "grid-content" : "grid-container"}>
            <div className={this.props.contained ? "" : "grid-content"}>
                <div style={{borderBottom: "2px solid #444"}}>
                    <HelpContent path="components/DepositWithdraw" section="receive" account={account.get("name")}/>
                    {/* <HelpContent path="components/DepositWithdraw" section="deposit-short"/> */}

                    <Translate component="p" content="gateway.bitkapital_text" />
                    <div className="button-group">
                        <div className={cnames("button", currentCoin === "TL" ? "active" : "outline")} onClick={this.setCurrentCoin.bind(this, "TL")}>TL</div>
                        <div className={cnames("button", currentCoin === "OPEN.BTC" ? "active" : "outline")} onClick={this.setCurrentCoin.bind(this, "OPEN.BTC")}>OPEN.BTC</div>
                        <div className={cnames("button", currentCoin === "OPEN.USDT" ? "active" : "outline")} onClick={this.setCurrentCoin.bind(this, "OPEN.USDT")}>OPEN.USDT</div>
                    </div>
                </div>
                {/* <div style={{paddingTop: 30, paddingLeft: 8, paddingBottom: 10, fontSize: 14}}>
                    <Translate content="gateway.service" />
                </div>
                <select onChange={this.onSetService.bind(this)} className="bts-select" value={services[activeService]} >
                    {options}
                </select> */}

    			<div className="grid-content no-padding" style={{marginTop: 20}}>

                    {currentCoin !== "TL" ?
                    <div>
                        <div className="content-block">
                            <div className="float-right">
                                <a href="https://www.ccedk.com/" target="__blank"><Translate content="gateway.website" /></a>
                            </div>

                            <BlockTradesGateway
                                account={account}
                                coins={openLedgerGatewayCoins}
                                provider="openledger"
                                currentCoin={openLedgerGatewayCoins.find(a => a.symbol === currentCoin)}
                            />
                        </div>
                    </div> : <BitKapital account={account}/>
                    }

                </div>
            </div>
		</div>
    );
    }
};

@connectToStores
export default class DepositStoreWrapper extends React.Component {
    static getStores() {
        return [AccountStore, SettingsStore]
    };

    static getPropsFromStores() {
        return {
            account: AccountStore.getState().currentAccount,
            viewSettings: SettingsStore.getState().viewSettings
        }
    };

    render () {
        return <AccountDepositWithdraw {...this.props}/>
    }
}
