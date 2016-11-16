import React from "react";
import {Link, PropTypes} from "react-router";
import connectToStores from "alt/utils/connectToStores";
import ActionSheet from "react-foundation-apps/src/action-sheet";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import Icon from "../Icon/Icon";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import WalletManagerStore from "stores/WalletManagerStore";
import cnames from "classnames";
import TotalBalanceValue from "../Utility/TotalBalanceValue";
import Immutable from "immutable";

var logo = require("assets/logo-ico-blue.png");

@connectToStores
class Header extends React.Component {

    static getStores() {
        return [AccountStore, WalletUnlockStore, WalletManagerStore, SettingsStore];
    }

    static getPropsFromStores() {
        return {
            linkedAccounts: AccountStore.getState().linkedAccounts,
            currentAccount: AccountStore.getState().currentAccount,
            locked: WalletUnlockStore.getState().locked,
            current_wallet: WalletManagerStore.getState().current_wallet,
            lastMarket: SettingsStore.getState().viewSettings.get("lastMarket"),
            starredAccounts: SettingsStore.getState().starredAccounts
        };
    }

    static contextTypes = {
        location: React.PropTypes.object,
        history: PropTypes.history
    };

    constructor(props, context) {
        super();
        this.state = {
            active: context.location.pathname
        };

        this.unlisten = null;
    }

    componentWillMount() {
        this.unlisten = this.context.history.listen((err, newState) => {
            if (!err) {
                if (this.unlisten && this.state.active !== newState.location.pathname) {
                    this.setState({
                        active: newState.location.pathname
                    });
                }
            }
        });
    }

    componentWillUnmount() {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.linkedAccounts !== this.props.linkedAccounts ||
            nextProps.currentAccount !== this.props.currentAccount ||
            nextProps.locked !== this.props.locked ||
            nextProps.current_wallet !== this.props.current_wallet ||
            nextProps.lastMarket !== this.props.lastMarket ||
            nextProps.starredAccounts !== this.props.starredAccounts ||
            nextState.active !== this.state.active
        );
    }

    componentWillReceiveProps(nextProps) {
        // this._setActivePath();
    }

    _triggerMenu(e) {
        e.preventDefault();
        ZfApi.publish("mobile-menu", "toggle");
    }

    _toggleLock(e) {
        e.preventDefault();
        if (WalletDb.isLocked()) WalletUnlockActions.unlock();
        else WalletUnlockActions.lock();
    }

    _onNavigate(route, e) {
        e.preventDefault();
        this.context.history.pushState(null, route);
    }

    _onGoBack(e) {
        e.preventDefault();
        window.history.back();
    }

    _onGoForward(e) {
        e.preventDefault();
        window.history.forward();
    }

    _accountClickHandler(account_name, e) {
        e.preventDefault();
        ZfApi.publish("account_drop_down", "close");
        AccountActions.setCurrentAccount.defer(account_name);
    }

    onClickUser(account, e) {
        e.stopPropagation();
        e.preventDefault();

        this.context.history.pushState(null, `/account/${account}/overview`);
    }

    render() {
        let {active} = this.state;
        let {linkedAccounts, currentAccount, starredAccounts} = this.props;
        let settings = counterpart.translate("header.settings");
        let locked_tip = counterpart.translate("header.locked_tip");
        let unlocked_tip = counterpart.translate("header.unlocked_tip");

        let tradingAccounts = AccountStore.getMyAccounts();
        let myAccountCount = tradingAccounts.length;

        if (starredAccounts.size) {
            for (let i = tradingAccounts.length - 1; i >= 0; i--) {
                if (!starredAccounts.has(tradingAccounts[i])) {
                    tradingAccounts.splice(i, 1);
                }
            };
            starredAccounts.forEach(account => {
                if (tradingAccounts.indexOf(account.name) === -1) {
                    tradingAccounts.push(account.name);
                }
            });
        }


        let myAccounts = AccountStore.getMyAccounts();

        let walletBalance = myAccounts.length ? (
                            <div className="grp-menu-item" style={{
                                padding: "18px 0 15px 0",
                                fontSize: 14
                            }} >
                                <TotalBalanceValue.AccountWrapper accounts={myAccounts} inHeader={true}/>
                            </div>) : null;

        let headerLogo = (
            <a
                style={{paddingTop: 3, paddingBottom: 3}}
                className={cnames({active: active === "/" || active.indexOf("account") !== -1})}
                onClick={this._onNavigate.bind(this, currentAccount ? `/account/${currentAccount}/overview` : "create-account")}
            >
                <img style={{margin: 0, height: 40}} src={logo}/>
            </a>
        );


        let createAccountLink = myAccountCount === 0 ? (
            <div className="grp-menu-item" >
            <div className={cnames("button create-account", {active: active.indexOf("create-account") !== -1})} onClick={this._onNavigate.bind(this, "/create-account")}>
                <Translate content="header.create_account" />
            </div>
            </div>
        ) : null;

        let lock_unlock = (this.props.current_wallet && myAccountCount) ? (
            <div className="grp-menu-item" >
            { this.props.locked ?
                <a style={{padding: "1rem"}} href onClick={this._toggleLock.bind(this)} data-tip={locked_tip} data-place="bottom" data-type="light" data-html><Icon className="icon-14px" name="locked"/></a>
                : <a href onClick={this._toggleLock.bind(this)} data-tip={unlocked_tip} data-place="bottom" data-type="light" data-html><Icon className="icon-14px" name="unlocked"/></a> }
            </div>
        ) : null;

        let tradeLink = this.props.lastMarket && active.indexOf("market/") === -1 ?
            <a className={cnames({active: active.indexOf("market/") !== -1})} onClick={this._onNavigate.bind(this, `/market/${this.props.lastMarket}`)}><Translate component="span" content="header.exchange" /></a>:
            <a className={cnames({active: active.indexOf("market/") !== -1})} onClick={this._onNavigate.bind(this, "/market/USD_BTS")}><Translate component="span" content="header.exchange" /></a>;

        // Account selector: Only active inside the exchange
        let accountsDropDown = null;

        if (currentAccount) {

            let account_display_name = currentAccount.length > 20 ? `${currentAccount.slice(0, 20)}..` : currentAccount;
            if (tradingAccounts.indexOf(currentAccount) < 0) {
                tradingAccounts.push(currentAccount);
            }

            if (tradingAccounts.length >= 1) {

                let accountsList = tradingAccounts
                    .sort()
                    .map((name, index) => {
                        return (
                            <li key={name} style={index === 0 ? {paddingTop: 10} : null}>
                                <a href onClick={this._accountClickHandler.bind(this, name)}>
                                    <span className="float-left">
                                        <Icon className="icon-14px" name="user"/>
                                    </span>
                                    <span>{name}</span>
                                </a>
                            </li>
                        );
                    });

                let options = [
                    {to: "/settings", text: "header.settings"},
                    {to: "/help", text: "header.help"},
                    // {to: "/explorer", text: "header.explorer"}
                ].map(entry => {
                    return <li className="dropdown-options" key={entry.to}><Translate content={entry.text} component="a" onClick={this._onNavigate.bind(this, entry.to)}/></li>;
                });

                let lockOptions = (this.props.current_wallet && myAccountCount) ? (
                    <li className="dropdown-options">
                        <Translate
                            content={ this.props.locked ? "header.unlock" : "header.lock"}
                            component="a"
                            onClick={this._toggleLock.bind(this)}
                        />
                    </li>) : null;


                accountsDropDown = <div style={{fontSize: 14, paddingLeft: "1rem"}}>
                    &nbsp;{account_display_name} &nbsp;
                </div>;

                // (
                //     <ActionSheet>
                //         <ActionSheet.Button title="">
                //
                //         </ActionSheet.Button>
                //         <ActionSheet.Content >
                //             <ul className="no-first-element-top-border">
                //                 {options}
                //                 {lockOptions}
                //                 {tradingAccounts.length > 1 ? accountsList : null}
                //             </ul>
                //         </ActionSheet.Content>
                //     </ActionSheet>);
            }
        }

        return (
            <div className="header menu-group primary">
                <div className="show-for-small-only">
                    <ul className="primary menu-bar title">
                        <li><a href onClick={this._triggerMenu}><Icon className="icon-14px" name="menu"/></a></li>
                    </ul>
                </div>
                {window.electron ? <div className="grid-block show-for-medium shrink">
                    <ul className="menu-bar">
                        <li><div style={{marginLeft: "1rem", height: "3rem"}}><div style={{marginTop: "0.5rem"}} onClick={this._onGoBack.bind(this)} className="button outline">{"<"}</div></div></li>
                        <li><div style={{height: "3rem"}}><div style={{marginTop: "0.5rem"}} onClick={this._onGoForward.bind(this)} className="button outline">></div></div></li>
                    </ul>
                </div> : null}
                <div className="grid-block show-for-medium">
                    <ul className="menu-bar">
                        <li>{headerLogo}</li>
                        {/* {!currentAccount ? null : <li><Link to={`/account/${currentAccount}/overview`} activeClassName="active"><Translate content="header.account" /></Link></li>} */}
                        <li><a className={cnames({active: active.indexOf("transfer") !== -1})} onClick={this._onNavigate.bind(this, "/transfer")}><Translate component="span" content="header.payments" /></a></li>
                        <li>{tradeLink}</li>
                        {currentAccount && myAccounts.indexOf(currentAccount) !== -1 ? <li><Link to={"/deposit-withdraw/"} activeClassName="active"><Translate content="account.deposit_withdraw"/></Link></li> : null}
                    </ul>
                </div>
                <div className="grid-block show-for-medium shrink">
                    <div className="grp-menu-items-group header-right-menu">
                        {walletBalance}

                        <div className="grid-block shrink overflow-visible grp-menu-item" style={{padding: "18px 0px 15px"}}>
                            {accountsDropDown}
                        </div>
                        {lock_unlock}
                        {myAccountCount === 0 && !tradingAccounts.length ? (
                            <div className="grp-menu-item" >
                                <Link style={{padding: "1rem"}} to="/settings" data-tip={settings} data-place="bottom" data-type="light"><Icon className="icon-14px" name="cog"/></Link>
                            </div>
                        ) : null}
                        {createAccountLink}
                    </div>
                </div>
            </div>
        );
    }
}

export default Header;
