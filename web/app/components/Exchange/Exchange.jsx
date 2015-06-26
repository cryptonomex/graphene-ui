import React from "react";
import MarketsActions from "actions/MarketsActions";
import MyOpenOrders from "./MyOpenOrders";
import OrderBook from "./OrderBook";
import MarketHistory from "./MarketHistory";
import BuySell from "./BuySell";
import Margin from "./Margin";
import utils from "common/utils";
import DepthHighChart from "./DepthHighChart";

require("./exchange.scss");

class Exchange extends React.Component {
    constructor() {
        super();

        this.state = {
            history: [],
            buyAmount: 5,
            buyPrice: 160,
            sellAmount: 5,
            sellPrice: 170,
            sub: false,
            activeTab: "buy",
            showBuySell: true
        };
    }

    _createLimitOrder(buyAsset, sellAsset, buyAssetAmount, sellAssetAmount, e) {
        e.preventDefault();
        console.log("sell id:", sellAsset);

        let expiration = new Date();
        expiration.setYear(expiration.getFullYear() + 5);

        MarketsActions.createLimitOrder(
            this.props.account.id,
            sellAssetAmount * utils.get_asset_precision(sellAsset.precision),
            sellAsset.id,
            buyAssetAmount * utils.get_asset_precision(buyAsset.precision),
            buyAsset.id,
            expiration.toISOString().slice(0, -7), // the seconds will be added in the actionCreator to set a unique identifer for this user and order
            false // fill or kill
        );
    }

    _cancelLimitOrder(orderID, e) {
        e.preventDefault();
        console.log("cancelling limit order:", orderID);
        let {account} = this.props;
        MarketsActions.cancelLimitOrder(
            account.id,
            orderID // order id to cancel
        );
    }

    _subToMarket(props) {
        let {quote, base, asset_symbol_to_id, assets} = props;
        if (asset_symbol_to_id[quote] && asset_symbol_to_id[base]) {
            let quote_id = asset_symbol_to_id[quote];
            let base_id = asset_symbol_to_id[base];
            let baseAsset = assets.get(base_id);
            let quoteAsset = assets.get(quote_id);
            if (quoteAsset && baseAsset && !this.state.sub) {
                MarketsActions.subscribeMarket(baseAsset, quoteAsset);
                this.setState({sub: true});
            }
        }
    }

    _depthChartClick(e) {
        e.preventDefault();
        this.setState({
            buyPrice: Math.round(100 * e.xAxis[0].value) / 100,
            sellPrice: Math.round(100 * e.xAxis[0].value) / 100
        });
    }

    componentDidMount() {
        this._subToMarket(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.sub && nextProps.assets.size > 0) {
            this._subToMarket(nextProps);
        }
    }

    componentWillUnmount() {
        let {quote, base, asset_symbol_to_id} = this.props;
        let quote_id = asset_symbol_to_id[quote];
        let base_id = asset_symbol_to_id[base];
        MarketsActions.unSubscribeMarket(quote_id, base_id);
    }

    _buyAmountChanged(e) { this.setState({buyAmount: e.target.value}); }

    _buyPriceChanged(e) { this.setState({buyPrice: e.target.value}); }

    _sellAmountChanged(e) { this.setState({sellAmount: e.target.value}); }

    _sellPriceChanged(e) { this.setState({sellPrice: e.target.value}); }

    _changeTab(value) {
        this.setState({activeTab: value});
    }

    _toggleBuySell() {
        this.setState({showBuySell: !this.state.showBuySell});
    }

    render() {
        let {asset_symbol_to_id, assets, account, limit_orders, short_orders, base: baseSymbol, quote: quoteSymbol} = this.props;
        let {buyAmount, buyPrice, sellAmount, sellPrice} = this.state;
        let base = null, quote = null;

        if (asset_symbol_to_id[quoteSymbol] && asset_symbol_to_id[baseSymbol]) {
            let quote_id = asset_symbol_to_id[quoteSymbol];
            let base_id = asset_symbol_to_id[baseSymbol];
            base = assets.get(base_id);
            quote = assets.get(quote_id);
        }

        // let buyTabClass = classNames("tab-item", {"is-active": this.state.activeTab === "buy"});
        // let sellTabClass = classNames("tab-item", {"is-active": this.state.activeTab === "sell"});
        // let marginTabClass = classNames("tab-item", {"is-active": this.state.activeTab === "margin"});

        return (

            <div className="grid-block  vertical">
                <div className="grid-block shrink">
                    <p>{baseSymbol} / {quoteSymbol} Put all kinds of info related to the market here (current price, spread, etc)</p>
                </div>
                <div className="grid-block page-layout" style={{border: "0px solid brown" ,  overflowY: "auto"}}>


                    {/* Left Column */}
                    <div className="grid-block left-column-2 small-3 medium-2" style={{border: "0px solid green" , overflowY: "auto"}}>
                      


                              
                                <div className="grid-block">
                                <MyOpenOrders
                                        orders={limit_orders}
                                        account={account.id}
                                        base={base}
                                        quote={quote}
                                        baseSymbol={baseSymbol}
                                        quoteSymbol={quoteSymbol}
                                        onCancel={this._cancelLimitOrder.bind(this)}/>
                            </div>
                    </div>

                    {/* Center Column */}
                    <div className="block grid-block vertical small-9 medium-10 large-8" style={{border: "0px solid yellow" ,  overflowY: "auto" , padding: "0"}}>

                                {/* TODO: placeholder for price history chart */}
                                        <div className="grid-block" style={{display: "inline-block", flexGrow: "0" }} >
                                                
                                                    <DepthHighChart
                                                        orders={limit_orders}
                                                        flat_asks={this.props.flat_asks}
                                                        flat_bids={this.props.flat_bids}
                                                        base={base}
                                                        quote={quote}
                                                        baseSymbol={baseSymbol}
                                                        quoteSymbol={quoteSymbol}
                                                        height={300}
                                                        />

                                        </div>

                           
                                        {/* Depth Chart */}

                                        <div className="grid-block" style={{ flexGrow: "0" , }} >
                                                    <DepthHighChart
                                                        orders={limit_orders}
                                                        flat_asks={this.props.flat_asks}
                                                        flat_bids={this.props.flat_bids}
                                                        base={base}
                                                        quote={quote}
                                                        baseSymbol={baseSymbol}
                                                        quoteSymbol={quoteSymbol}
                                                        height={100}
                                                        />
                                        
                                        </div>

                                    <div className="grid-block" style={{ flexGrow: "0" , padding: "2rem" }} >
                                        <div className="grid-content small-6">
                                                <BuySell 
                                                    type="buy"
                                                    amount={buyAmount}
                                                    price={buyPrice}
                                                    quoteSymbol={quoteSymbol}
                                                    baseSymbol={baseSymbol}
                                                    amountChange={this._buyAmountChanged.bind(this)}
                                                    priceChange={this._buyPriceChanged.bind(this)}
                                                    onSubmit={this._createLimitOrder.bind(this, quote, base, buyAmount, buyAmount * buyPrice)}
                                                />
                                        </div>
                                        <div className="grid-content small-6">
                                                <BuySell 
                                                    type="sell"
                                                    amount={sellAmount}
                                                    price={sellPrice}
                                                    quoteSymbol={quoteSymbol}
                                                    baseSymbol={baseSymbol}
                                                    amountChange={this._sellAmountChanged.bind(this)}
                                                    priceChange={this._sellPriceChanged.bind(this)}
                                                    onSubmit={this._createLimitOrder.bind(this, base, quote, sellAmount * sellPrice, sellAmount)}
                                                />
                                        </div>
                                    </div>
                                <div className="grid-block" style={{ flexGrow: "0" , padding: "2rem" }} >
                                        {/* Depth Chart */}
                                            <OrderBook
                                                orders={limit_orders}
                                                base={base}
                                                quote={quote}
                                                baseSymbol={baseSymbol}
                                                quoteSymbol={quoteSymbol}
                                                />
                                </div>
                        </div>
                   

                    <div className="grid-block right-column  show-for-large medium-2" style={{border: "0px solid purple" , overflowY: "auto"}}>
                        {/* Market History */}
                        <MarketHistory history={this.props.history} />
                    </div>
                    
                </div>
       
        </div>
        );
    }
}

export default Exchange;
