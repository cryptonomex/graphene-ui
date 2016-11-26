import React from "react";
import ReactDOM from "react-dom";
import {PropTypes} from "react";
import Immutable from "immutable";
import Ps from "perfect-scrollbar";
import utils from "common/utils";
import market_utils from "common/market_utils";
import Translate from "react-translate-component";
import SettingsActions from "actions/SettingsActions";
import classnames from "classnames";
import PriceText from "../Utility/PriceText";
import TransitionWrapper from "../Utility/TransitionWrapper";
import AssetName from "../Utility/AssetName";

class OrderBookRowVertical extends React.Component {

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.order.price_full !== this.props.order.price_full ||
            nextProps.order.amount !== this.props.order.amount ||
            nextProps.index !== this.props.index
        )
    }

    render() {
        let {order, quote, base, type, final} = this.props;

        let integerClass = type === "bid" ? "orderHistoryBid" : type === "ask" ? "orderHistoryAsk" : "orderHistoryCall";

        return (
            <tr key={order.price_full} onClick={this.props.onClick} className={classnames({"final-row": final})}>
                <td>{utils.format_number(order.value, base.get("precision"))}</td>
                <td>{utils.format_number(order.amount, quote.get("precision"))}</td>
                <td className={integerClass}>
                    <PriceText preFormattedPrice={order.price} />
                </td>
            </tr>
        )
    }
}

class OrderBookRowHorizontal extends React.Component {


    shouldComponentUpdate(nextProps) {
        return (
            nextProps.order.price_full !== this.props.order.price_full ||
            nextProps.order.amount !== this.props.order.amount ||
            nextProps.position !== this.props.position ||
            nextProps.index !== this.props.index
        )
    }

    render() {
        let {order, quote, base, type, position} = this.props;

        let integerClass = type === "bid" ? "orderHistoryBid" : type === "ask" ? "orderHistoryAsk" : "orderHistoryCall" ;

        let price = <PriceText preFormattedPrice={order.price} />;
        let amount = type === "bid" ?
            utils.format_number(order.amount, quote.get("precision")) :
            utils.format_asset(order.for_sale, quote, true);
        let value = type === "bid" ?
            utils.format_asset(order.for_sale, base, true) :
            utils.format_number(order.value, base.get("precision"));
        let total = type === "bid" ?
            utils.format_asset(order.totalForSale, base, true) :
            utils.format_asset(order.totalValue, base, true);

        return (
            <tr onClick={this.props.onClick} >
                {position === "left" ? <td>{total}</td> :
                <td style={{width: "25%"}} className={integerClass}>
                    {price}
                </td>
                }
                <td>{position === "left" ? value : amount}</td>
                <td>{position === "left" ? amount : value}</td>
                {position === "right" ? <td>{total}</td> :
                <td style={{width: "25%"}} className={integerClass}>
                    {price}
                </td>
                }

            </tr>
        );

    }
}

class OrderBook extends React.Component {
    constructor(props) {
        super();
        this.state = {
            scrollToBottom: true,
            flip: props.flipOrderBook,
            showAllBids: false,
            showAllAsks: false
        };

        this._updateHeight = this._updateHeight.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !Immutable.is(nextProps.orders, this.props.orders) ||
            !Immutable.is(nextProps.calls, this.props.calls) ||
            !Immutable.is(nextProps.calls, this.props.calls) ||
            nextProps.horizontal !== this.props.horizontal ||
            nextProps.latest !== this.props.latest ||
            nextProps.smallScreen !== this.props.smallScreen ||
            !utils.are_equal_shallow(nextState, this.state)
        );
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.marketReady) {
            this.setState({
                scrollToBottom: true
            });
        }

        // Change of market or direction
        if (nextProps.base !== this.props.base || nextProps.quote !== this.props.quote) {
            this.setState({
                scrollToBottom: true
            });

            if (this.refs.askTransition) {
                this.refs.askTransition.resetAnimation();
            }

            if (this.refs.bidTransition) {
                this.refs.bidTransition.resetAnimation();
            }
        }
    }

    _updateHeight() {
        if (!this.props.horizontal) {
            let containerHeight = this.refs.orderbook_container.offsetHeight;
            let priceHeight = this.refs.center_text.offsetHeight;
            let asksHeight = this.refs.asksWrapper.offsetHeight;

            this.setState({
                vertAsksHeight: Math.floor((containerHeight - priceHeight) / 2),
                vertBidsHeight: containerHeight - priceHeight - asksHeight - 2
            }, this.psUpdate);
        }
    }

    componentWillMount() {
        window.addEventListener("resize", this._updateHeight, false);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._updateHeight, false);
    }

    componentDidMount() {

        if (!this.props.horizontal) {
            this._updateHeight();

            let asksContainer = ReactDOM.findDOMNode(this.refs.vert_asks);
            Ps.initialize(asksContainer);
            let bidsContainer = ReactDOM.findDOMNode(this.refs.vert_bids);
            Ps.initialize(bidsContainer);
        } else {
            let bidsContainer = ReactDOM.findDOMNode(this.refs.hor_bids);
            Ps.initialize(bidsContainer);
            let asksContainer = ReactDOM.findDOMNode(this.refs.hor_asks);
            Ps.initialize(asksContainer);
        }
    }

    psUpdate() {
        if (!this.props.horizontal) {
            let asksContainer = ReactDOM.findDOMNode(this.refs.vert_asks);
            Ps.update(asksContainer);
            if (this.state.scrollToBottom) {
                asksContainer.scrollTop = asksContainer.scrollHeight;
            };
            let bidsContainer = ReactDOM.findDOMNode(this.refs.vert_bids);
            Ps.update(bidsContainer);
        } else {
            let bidsContainer = ReactDOM.findDOMNode(this.refs.hor_bids);
            Ps.update(bidsContainer);
            let asksContainer = ReactDOM.findDOMNode(this.refs.hor_asks);
            Ps.update(asksContainer);
        }
    }

    componentDidUpdate(prevProps) {
        this._updateHeight();
    }

    _onBidScroll(e) {

        if (e.target.scrollTop < (e.target.scrollHeight - this.state.vertAsksHeight)) {
            if (this.state.scrollToBottom) {
                this.setState({
                    scrollToBottom: false
                });
            }
        } else {
            this.setState({
                scrollToBottom: false
            });
        }
    }

    _flipBuySell() {
        SettingsActions.changeViewSetting({
            flipOrderBook: !this.state.flip
        });

        this.setState({flip: !this.state.flip});
    }

    _onToggleShowAll(type) {
        if (type === "asks") {
            this.setState({
                showAllAsks: !this.state.showAllAsks
            });

            if (this.state.showAllAsks) {
                this.refs.hor_asks.scrollTop = 0;
            }

        } else {
            this.setState({
                showAllBids: !this.state.showAllBids
            });

            if (this.state.showAllBids) {
                this.refs.hor_bids.scrollTop = 0;
            }
        }
    }

    render() {
        let {combinedBids, combinedAsks, quote, base, quoteSymbol, baseSymbol, horizontal} = this.props;
        let {showAllAsks, showAllBids} = this.state;

        let bidRows = null, askRows = null;
        let high = 0, low = 0;

        let totalBidValue = 0;
        let totalAskAmount = 0;

        let totalAsks = 0, totalBids = 0, totalBidForSale = 0;

        if(base && quote) {
            let totalBidAmount = 0;
            high = combinedBids.length > 0 ? combinedBids.reduce((total, a) => {
                totalBids += a.value;
                return total < a.price_full ? a.price_full : total;
            }, 0) : 0;

            let bidCount = combinedBids.length - 1;

            bidRows = combinedBids.sort((a, b) => {
                return b.price_full - a.price_full;
            })
            .filter(a => {
                if (this.state.showAllBids) {
                    return true;
                }
                return a.price_full >= high / 5;
            })
            .map((order, index) => {
                totalBidAmount = market_utils.limitByPrecision(totalBidAmount + utils.get_satoshi_amount(order.amount, quote), quote);
                totalBidValue += order.value;
                totalBidForSale += order.for_sale;

                order.totalValue = totalBidValue;
                order.totalAmount = totalBidAmount;
                order.totalForSale = totalBidForSale;

                return (horizontal ?
                    <OrderBookRowHorizontal
                        index={index}
                        key={order.price_full}
                        order={order}
                        onClick={this.props.onClick.bind(this, "bid", order)}
                        base={base}
                        quote={quote}
                        type={order.type}
                        position={!this.state.flip ? "left" : "right"}
                    /> :
                    <OrderBookRowVertical
                        index={index}
                        key={order.price_full}
                        order={order}
                        onClick={this.props.onClick.bind(this, "bid", order)}
                        base={base}
                        quote={quote}
                        type={order.type}
                        final={index === 0}
                    />
                )
            }).filter(a => {
                return a !== null;
            })
            .sort((a, b) => {
                return parseFloat(b.key) - parseFloat(a.key);
            });

            low = combinedAsks.length > 0 ? combinedAsks.reduce((total, a) => {
                totalAsks += a.amount;
                if (!total) {
                    return a.price_full;
                }
                return total > a.price_full ? a.price_full : total;
            }, null) : 0;

            let totalAskValue = 0, totalAskForSale = 0;

            askRows = combinedAsks.sort((a, b) => {
                return a.price_full - b.price_full;
            }).filter(a => {
                if (this.state.showAllAsks) {
                    return true;
                }
                return a.price_full <= low * 5;
            }).map((order, index) => {
                totalAskAmount = market_utils.limitByPrecision(totalAskAmount + order.amount, base);
                // totalAskAmount += order.amount;
                totalAskValue += (order.sell_price.quote.amount * order.for_sale / order.sell_price.base.amount);
                totalAskForSale += order.for_sale;
                // console.log("order:", order);
                // console.log(order.sell_price.quote.amount * order.for_sale / order.sell_price.base.amount);
                order.totalValue = totalAskValue;
                order.totalAmount = totalAskAmount;
                order.totalForSale = totalAskForSale;

                return (horizontal ?

                    <OrderBookRowHorizontal
                        index={index}
                        key={order.price_full}
                        order={order}
                        onClick={this.props.onClick.bind(this, "ask", order)}
                        base={base}
                        quote={quote}
                        type={order.type}
                        position={!this.state.flip ? "right" : "left"}
                    /> :
                    <OrderBookRowVertical
                        index={index}
                        key={order.price_full}
                        order={order}
                        onClick={this.props.onClick.bind(this, "ask", order)}
                        base={base}
                        quote={quote}
                        type={order.type}
                        final={0 === index}

                    />
                    );
            }).filter(a => {
                return a !== null;
            }).sort((a, b) => {
                if (horizontal) {
                    return parseFloat(a.key) - parseFloat(b.key);
                } else {
                    return parseFloat(b.key) - parseFloat(a.key);
                }
            })
        }

        let spread = high > 0 && low > 0 ? utils.format_number(low - high, base.get("precision")) : "0";

        if (this.props.horizontal) {

            let totalBidsLength = bidRows.length;
            let totalAsksLength = askRows.length;

            if (!showAllBids) {
                bidRows.splice(10, bidRows.length);
            }

            if (!showAllAsks) {
                askRows.splice(10, askRows.length);
            }

            let leftHeader = (
                <thead ref="leftHeader">
                    <tr key="top-header" className="top-header">
                        <th style={{width: "25%", textAlign: "center"}}><Translate className="header-sub-title" content="exchange.total" /><span className="header-sub-title"> (<AssetName name={baseSymbol} />)</span></th>
                        <th style={{width: "25%", textAlign: "center"}}><span className="header-sub-title"><AssetName name={baseSymbol} /></span></th>
                        <th style={{width: "25%", textAlign: "center"}}><span className="header-sub-title"><AssetName name={quoteSymbol} /></span></th>
                        <th style={{width: "25%", textAlign: "right"}}>
                            <Translate className={(this.state.flip ? "ask-total" : "bid-total") + " header-sub-title"} content="exchange.price" />
                        </th>
                    </tr>
                </thead>
            );

            let rightHeader = (
                <thead ref="rightHeader">
                    <tr key="top-header" className="top-header">
                        <th style={{width: "25%", textAlign: "right"}}>
                            <Translate className={(!this.state.flip ? "ask-total" : "bid-total") + " header-sub-title"} content="exchange.price" />
                        </th>
                        <th style={{width: "25%", textAlign: "center"}}><span className="header-sub-title"><AssetName name={quoteSymbol} /></span></th>
                        <th style={{width: "25%", textAlign: "center"}}><span className="header-sub-title"><AssetName name={baseSymbol} /></span></th>
                        <th style={{width: "25%", textAlign: "right"}}><Translate className="header-sub-title" content="exchange.total" /><span className="header-sub-title"> (<AssetName name={baseSymbol} />)</span></th>
                    </tr>
                </thead>
            );

            return (
                    <div className={classnames(this.props.wrapperClass, "grid-block orderbook no-padding small-vertical medium-horizontal align-spaced no-overflow small-12 xlarge-8")}>
                        <div className={classnames("small-12 medium-6 middle-content", this.state.flip ? "order-1" : "order-2")}>
                            <div className="exchange-bordered">
                                <div className="exchange-content-header ask">
                                    <Translate content="exchange.asks" />
                                    {/* {this.state.flip ? (
                                    <span>
                                        <span onClick={this._flipBuySell.bind(this)} style={{cursor: "pointer", fontSize: "1rem"}}>  &#8646;</span>
                                        {!this.props.smallScreen ? <span onClick={this.props.moveOrderBook} style={{cursor: "pointer", fontSize: "1rem"}}> &#8645;</span> : null}
                                    </span>) : null} */}
                                    <div style={{lineHeight: "16px"}} className="float-right header-sub-title">
                                        <Translate content="exchange.total" />
                                        <span>: </span>
                                        {utils.format_number(totalAsks, quote.get("precision"))}
                                        <span> (<AssetName name={quoteSymbol} />)</span>
                                    </div>
                                </div>
                                <table className="table order-table table-hover text-right no-overflow">
                                    {!this.state.flip ? rightHeader : leftHeader}
                                </table>
                                <div className="grid-block" ref="hor_asks" style={{paddingRight: !showAllAsks ? 0 : 15, overflow: "hidden", maxHeight: 210}}>
                                    <table style={{paddingBottom: 5}} className="table order-table table-hover text-right no-overflow">
                                        <TransitionWrapper
                                            ref="askTransition"
                                            className="orderbook orderbook-top"
                                            component="tbody"
                                            transitionName="newrow"
                                        >
                                            {askRows}
                                        </TransitionWrapper>
                                    </table>
                                </div>
                                {totalAsksLength > 13 ? (
                                <div className="orderbook-showall">
                                    <a onClick={this._onToggleShowAll.bind(this, "asks")}>
                                        <Translate content={showAllAsks ? "exchange.hide" : "exchange.show_asks"} />
                                        {!showAllAsks ? <span> ({totalAsksLength})</span> : null}
                                    </a>
                                </div>) : null}
                            </div>
                        </div>

                        <div className={classnames("small-12 medium-6 middle-content", this.state.flip ? "order-2" : "order-1")}>
                            <div className="exchange-bordered">
                                <div className="exchange-content-header bid">
                                    <Translate content="exchange.bids" />
                                    {/* {!this.state.flip ? (
                                    <span>
                                        <span onClick={this._flipBuySell.bind(this)} style={{cursor: "pointer", fontSize: "1rem"}}>  &#8646;</span>
                                        <span onClick={this.props.moveOrderBook} style={{cursor: "pointer", fontSize: "1rem"}}> &#8645;</span>
                                    </span>) : null} */}
                                    <div style={{lineHeight: "16px"}} className="float-right header-sub-title">
                                        <Translate content="exchange.total" />
                                        <span>: </span>
                                        {utils.format_number(totalBids, base.get("precision"))}
                                        <span> (<AssetName name={baseSymbol} />)</span>
                                    </div>
                                </div>
                                <table className="table order-table table-hover text-right">
                                    {this.state.flip ? rightHeader : leftHeader}
                                </table>
                                <div className="grid-block" ref="hor_bids" style={{paddingRight: !showAllBids ? 0 : 15, overflow: "hidden", maxHeight: 210}}>
                                    <table style={{paddingBottom: 5}} className="table order-table table-hover text-right">
                                        <TransitionWrapper
                                            ref="bidTransition"
                                            className="orderbook orderbook-bottom"
                                            component="tbody"
                                            transitionName="newrow"
                                        >
                                            {bidRows}
                                        </TransitionWrapper>
                                    </table>
                                </div>
                                {totalBidsLength > 13 ? (
                                <div className="orderbook-showall">
                                    <a onClick={this._onToggleShowAll.bind(this, "bids")}>
                                        <Translate content={showAllBids ? "exchange.hide" : "exchange.show_bids"} />
                                        {!showAllBids ? <span> ({totalBidsLength})</span> : null}
                                    </a>
                                </div>) : null}
                            </div>
                        </div>
                    </div>
            );
        } else {
            // Vertical orderbook
            return (
                <div className="left-order-book no-padding no-overflow">
                    <div className="grid-block shrink left-orderbook-header" style={{paddingRight: 15, zIndex: 10}}>
                        <table className="table expand order-table table-hover text-right">
                            <thead>
                                <tr>
                                    <th style={{paddingBottom: 8, textAlign: "right", "borderBottomColor": "#777"}}>
                                        <span className="header-sub-title"><AssetName name={baseSymbol} /></span>
                                    </th>
                                    <th style={{paddingBottom: 8, textAlign: "right", "borderBottomColor": "#777"}}>
                                        <span className="header-sub-title"><AssetName name={quoteSymbol} /></span>
                                    </th>
                                    <th style={{paddingBottom: 8, textAlign: "right", "borderBottomColor": "#777"}}>
                                        <Translate className="header-sub-title" content="exchange.price" />
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className="grid-block vertical no-padding" ref="orderbook_container" style={{width: "100%"}}>
                            <div id="asksWrapper" style={{overflow:"hidden"}} ref="asksWrapper">
                                <div onScroll={this._onBidScroll.bind(this)} className="grid-block" ref="vert_asks" style={{overflow: "hidden", maxHeight: this.state.vertAsksHeight || 300}}>
                                    <div style={{paddingRight: 10, width: "100%", height: "100%", display: "table-cell", verticalAlign: "bottom"}}>
                                        <table style={{position: "relative", bottom: 0}} className="table order-table table-hover text-right">
                                            <TransitionWrapper
                                                ref="askTransition"
                                                className="ps-container orderbook-top"
                                                component="tbody"
                                                transitionName="newrow"
                                            >
                                                {askRows}
                                            </TransitionWrapper>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div ref="center_text" style={{minHeight: 35}}>
                                    <div key="spread" className="orderbook-latest-price" ref="centerRow">
                                        <div className="text-center spread">
                                            {this.props.latest ? <span className={this.props.changeClass}><PriceText preFormattedPrice={this.props.latest} /> <AssetName name={baseSymbol} />/<AssetName name={quoteSymbol} /></span> : null}
                                        </div>
                                    </div>
                            </div>
                            <div id="bidsWrapper" style={{overflow:"hidden"}}>
                                <div className="grid-block" ref="vert_bids" style={{overflow: "hidden", height: this.state.vertBidsHeight || 300}}>
                                <div style={{paddingRight: 10, width: "100%", height: "100%", display: "table-cell", verticalAlign: "top"}}>
                                    <table className="table order-table table-hover text-right">
                                        <TransitionWrapper
                                            ref="bidTransition"
                                            className="ps-container orderbook-top"
                                            component="tbody"
                                            transitionName="newrow"
                                        >
                                            {bidRows}
                                        </TransitionWrapper>
                                    </table>
                                </div>
                                </div>
                            </div>
                    </div>
                    <div style={{width: "100%", borderTop: "1px solid grey"}} className="align-center grid-block footer shrink bottom-header">
                        <div onClick={this.props.moveOrderBook} className="button outline">
                            <Translate content="exchange.horizontal" />
                        </div>
                    </div>
                </div>
            );
        }
    }
}

OrderBook.defaultProps = {
    bids: [],
    asks: [],
    orders: {}
};

OrderBook.propTypes = {
    bids: PropTypes.array.isRequired,
    asks: PropTypes.array.isRequired,
    orders: PropTypes.object.isRequired
};

export default OrderBook;
