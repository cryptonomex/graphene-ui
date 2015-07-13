import React from "react";
import {PropTypes, Component} from "react";
import MarketCard from "./MarketCard";
import Immutable from "immutable";
import MarketsActions from "actions/MarketsActions";
import SettingsActions from "actions/SettingsActions";
import {Link} from "react-router";

class Markets extends Component {

    shouldComponentUpdate(nextProps) {
        return (
            !Immutable.is(nextProps.assets, this.props.assets) ||
            !Immutable.is(nextProps.settings, this.props.settings) ||
            nextProps.baseAsset !== this.props.baseAsset
        );
    }

    _switchMarkets() {
        console.log("switch markets");

        SettingsActions.changeSetting({
            setting: "inverseMarket",
            value: !this.props.settings.get("inverseMarket")
        });

    }

    _onChangeBase(e) {
        let base = this.props.assets.get(e.target[e.target.selectedIndex].id);
        MarketsActions.changeBase({id: base.id, symbol: base.symbol, precision: base.precision});
    }

    render() {
        console.log("[Markets.jsx:24] ----- render ----->", this.props);
        let {assets, settings, markets, baseAsset} = this.props;

        let marketCards = assets
            .map((a, index) => {
                console.log("market:", a);
                if (a.symbol !== baseAsset.symbol) {
                    let market;
                    if (settings.get("inverseMarket")) {
                        market = {quoteSymbol: a.symbol, baseSymbol: baseAsset.symbol};
                    } else {
                        market = {quoteSymbol: baseAsset.symbol, baseSymbol: a.symbol};
                    }
                    return (
                        <MarketCard
                            key={index}
                            market={market}
                            options={a.options}
                            data={a.dynamic_data}
                            assets={assets}
                            />
                    );
                }
            }).filter(a => {
                return a !== undefined;
            }).toArray();

        let baseOptions = assets.map(a => {
            return <option key={a.id} id={a.id}>{a.symbol}</option>;
        });

        return (
            <div className="grid-block small-horizontal" style={{flexWrap: "nowrap"}}>
                <div className="grid-block page-layout" style={{minWidth: "15rem"}}>
                    <div className="grid-content left-column-2" style={{padding: "0.5rem"}}>
                        <section className="block-list">
                            <header>Switch market orientation</header>
                            <ul>
                            <li>
                            <span style={{visibility: "hidden"}}>A</span>
                            <div className="switch">
                            <input type="checkbox" checked={settings.get("inverseMarket")}/>
                            <label onClick={this._switchMarkets.bind(this)}></label>
                            </div>
                            </li>
                            </ul>
                        </section>
                        <section className="block-list">
                            <header>Select base asset:</header>
                                <ul>
                                    <li className="with-dropdown">
                                    <select style={{lineHeight: "1.2em"}} value={baseAsset.symbol} onChange={this._onChangeBase.bind(this)}>
                                        {baseOptions}
                                    </select>
                                    </li>
                                </ul>
                        </section>
                    </div>
                </div>
                    <div className="grid-block page-layout" style={{overflowY: "auto", zIndex: 1}}>
                        <div className="grid-block small-up-1 medium-up-2 large-up-3">
                            {marketCards}
                        </div>
                </div>
            </div>
        );
    }
}


Markets.defaultProps = {
    settings: {},
    assets: {},
    markets: {}
};

Markets.propTypes = {
    settings: PropTypes.object.isRequired,
    assets: PropTypes.object.isRequired,
    markets: PropTypes.object
};

export default Markets;
