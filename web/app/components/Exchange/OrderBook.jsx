import React from "react";
import Immutable from "immutable";
import classNames from "classnames";
import market_utils from "common/market_utils";
import utils from "common/utils";

class OrderBook extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (
            !Immutable.is(nextProps.orders, this.props.orders)
            );
    }

    render() {
        let {orders, account, quote, base, quoteSymbol, baseSymbol} = this.props;
        let bids = null, asks = null;
        let high = 0, low = 0;
        
        if(orders.size > 0 && base && quote) {
            let quotePrecision = utils.get_asset_precision(quote.precision);
            let basePrecision = utils.get_asset_precision(base.precision);

            bids = orders.filter(a => {
                return a.sell_price.base.asset_id === base.id;
            }).sort((a, b) => {
                let {buy: a_buy, sell: a_sell} = market_utils.parseOrder(a, false);
                let {buy: b_buy, sell: b_sell} = market_utils.parseOrder(b, false);

                let a_price = (a_sell.amount / basePrecision) / (a_buy.amount / quotePrecision);
                let b_price = (b_sell.amount / basePrecision) / (b_buy.amount / quotePrecision);
                return b_price > a_price;
            }).map(order => {
                let isAskOrder = market_utils.isAsk(order, base);
                let {buy, sell} = market_utils.parseOrder(order, isAskOrder);
                let price = (sell.amount / basePrecision) / (buy.amount / quotePrecision);
                let tdClass = classNames({orderHistoryBid: !isAskOrder, orderHistoryAsk: isAskOrder});
                high = price;
                return (
                     <tr key={order.id}>
                        <td>{(price * buy.amount / quotePrecision).toFixed(3)}</td>
                        <td>{(buy.amount / quotePrecision).toFixed(3)}</td>
                        <td className={tdClass}>{price.toFixed(3)}</td>
                        {/*TODO: add expiration data <td>{order.expiration}</td> */}
                    </tr>
                    );
            }).toArray();

            let askIndex = 0;
            asks = orders.filter(a => {
                return a.sell_price.quote.asset_id === base.id;
            }).sort((a, b) => {
                let {buy: a_buy, sell: a_sell} = market_utils.parseOrder(a, true);
                let {buy: b_buy, sell: b_sell} = market_utils.parseOrder(b, true);

                let a_price = (a_sell.amount / basePrecision) / (a_buy.amount / quotePrecision);
                let b_price = (b_sell.amount / basePrecision) / (b_buy.amount / quotePrecision);
                return a_price > b_price;
            }).map(order => {
                let isAskOrder = market_utils.isAsk(order, base);
                let {buy, sell} = market_utils.parseOrder(order, isAskOrder);
                let price = (sell.amount / basePrecision) / (buy.amount / quotePrecision);
                let tdClass = classNames({orderHistoryBid: !isAskOrder, orderHistoryAsk: isAskOrder});
                if (askIndex === 0) {
                    low = price;
                }
                askIndex++;
                return (
                     <tr key={order.id}>
                        <td >{(price * buy.amount / quotePrecision).toFixed(3)}</td>
                        <td >{(buy.amount / quotePrecision).toFixed(3)}</td>
                        <td className={tdClass}>{price.toFixed(3)}</td>

                        {/*TODO: add expiration data <td>{order.expiration}</td> */}
                    </tr>
                    );
            }).toArray();
        }

        return (
                <div className="grid-block" style={{height: "20vh" , overflowY: "auto"}}>
                <div className="grid-block small-6"  style={{marginRight: "3px"}}>
                    <table className="table order-table">
                        <thead>
                        <tr>
                            <th>Value</th>
                            <th>Amount</th>
                            <th>Bid</th>
                        </tr>
                        </thead>
                        <tbody>
                                {bids}
                        </tbody>
                    </table>
                </div>
                <div className="grid-block small-6">
                    <table className="table order-table" style={{marginRight: "3px"}}>
                        <thead>
                        <tr>
                            <th>Value</th>
                            <th>Amount</th>
                            <th>Bid</th>

                            
                        </tr>
                        </thead>
                        <tbody>
                                {asks}
                        </tbody>
                    </table>
                </div>
                </div>
        );
    }
}

export default OrderBook;
