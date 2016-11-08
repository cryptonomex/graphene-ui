import React from "react";
import {PropTypes} from "react";
import classNames from "classnames";
import utils from "common/utils";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import PriceText from "../Utility/PriceText";
import FormattedFee from "../Utility/FormattedFee";
import AssetName from "../Utility/AssetName";

@BindToChainState({keep_updating: true})
class BuySell extends React.Component {

    static propTypes = {
        balance: ChainTypes.ChainObject,
        type: PropTypes.string,
        amountChange: PropTypes.func.isRequired,
        priceChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    };

    static defaultProps = {
        type: "bid"
    };

    shouldComponentUpdate(nextProps) {
        return (
                nextProps.amount !== this.props.amount ||
                nextProps.total !== this.props.total ||
                nextProps.currentPrice !== this.props.currentPrice ||
                nextProps.price !== this.props.price ||
                nextProps.balance !== this.props.balance ||
                nextProps.account !== this.props.account ||
                nextProps.className !== this.props.className ||
                nextProps.fee !== this.props.fee ||
                nextProps.isPredictionMarket !== this.props.isPredictionMarket ||
                nextProps.feeAsset !== this.props.feeAsset ||
                nextProps.isOpen !== this.props.isOpen
            );
    }

    _addBalance(balance) {
        if (this.props.type === "bid") {
            this.props.totalChange({target: {value: balance.toString()}});
        } else {
            this.props.amountChange({target: {value: balance.toString()}});
        }
    }

    _setPrice(price) {
        this.props.priceChange({target: {value: price.toString()}});
    }

    render() {
        let {type, quote, base, amountChange, fee, isPredictionMarket,
            priceChange, onSubmit, balance, totalPrecision, totalChange,
            balancePrecision, quotePrecision, currentPrice, currentPriceObject,
            feeAsset, feeAssets} = this.props;
        let amount = 0, price = 0, total = 0;

        let caret = this.props.isOpen ? <span>&#9660;</span> : <span>&#9650;</span>;

        if (this.props.amount) amount = this.props.amount;
        if (this.props.price) price = this.props.price;
        if (this.props.total) total = this.props.total;

        let balanceAmount = balance ? utils.get_asset_amount(balance.get("balance"), {precision: balancePrecision}) : 0;
        if (!balanceAmount) {
            balanceAmount = 0;
        }

        let hasBalance = type === "bid" ? balanceAmount >= parseFloat(total) : balanceAmount >= parseFloat(amount);

        let buttonText = isPredictionMarket ? counterpart.translate("exchange.short") : type === "bid" ? counterpart.translate("exchange.buy") : counterpart.translate("exchange.sell");
        let forceSellText = type === "bid" ? counterpart.translate("exchange.buy") : counterpart.translate("exchange.sell");

        let noBalance = isPredictionMarket ? false : !(balanceAmount > 0 && hasBalance);
        let invalidPrice = !(price > 0);
        let invalidAmount = !(amount >0);

        let disabled = noBalance || invalidPrice || invalidAmount;

        let buttonClass = classNames("button buySellButton", type, {disabled: disabled});
        let balanceSymbol = type === "bid" ? base.get("symbol") : quote.get("symbol");

        let disabledText = invalidPrice ? counterpart.translate("exchange.invalid_price") :
                           invalidAmount ? counterpart.translate("exchange.invalid_amount") :
                           noBalance ? counterpart.translate("exchange.no_balance") :
                           null;

        // Fee asset selection
        if( feeAssets[1] && feeAssets[1].getIn(["options", "core_exchange_rate", "quote", "asset_id"]) === "1.3.0" && feeAssets[1].getIn(["options", "core_exchange_rate", "base", "asset_id"]) === "1.3.0" ) {
            feeAsset = feeAssets[0];
            feeAssets.splice(1, 1);
        }
        let index = 0;
        let options = feeAssets.map(asset => {
            let {name, prefix} = utils.replaceName(asset.get("symbol"), asset.get("bitasset") && !asset.getIn(["bitasset", "is_prediction_market"]) && asset.get("issuer") === "1.2.0");
            return <option key={asset.get("id")} value={index++}>{prefix}{name}</option>;
        });

        // Subtract fee from amount to sell
        let balanceToAdd;

        if (this.props.feeAsset.get("symbol") === balanceSymbol) {
            balanceToAdd = balanceAmount === 0 ? 0 : balanceAmount - fee;
        } else {
            balanceToAdd = balanceAmount === 0 ? 0 : balanceAmount;
        }

        return (
            <div className={this.props.className}>
                <div className="exchange-bordered buy-sell-container">
                    <div className={"exchange-content-header " + type}>
                        <span>{buttonText} <AssetName name={quote.get("symbol")} /></span>

                    </div>

                    <form className={(!this.props.isOpen ? "hide-container " : "") + "order-form"} noValidate>
                        <div className="grid-block vertical no-overflow no-padding">

                                <div className="grid-block no-padding buy-sell-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="exchange.price" />:
                                    </div>
                                    <div className="grid-block small-6 no-margin no-overflow buy-sell-input">
                                        <input type="number" id="buyPrice" value={price} onChange={priceChange} autoComplete="off" placeholder="0.0"/>
                                    </div>
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-box">
                                        <AssetName name={base.get("symbol")} />
                                    </div>
                                </div>

                                <div className="grid-block no-padding buy-sell-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="transfer.amount" />:
                                    </div>
                                    <div className="grid-block small-6 no-margin no-overflow buy-sell-input">
                                        <input type="number" id="buyAmount" value={amount} onChange={amountChange} autoComplete="off" placeholder="0.0"/>
                                    </div>
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-box">
                                        <AssetName name={quote.get("symbol")} />
                                    </div>
                                </div>

                                <div className="grid-block no-padding buy-sell-row bottom-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="exchange.total" />:
                                    </div>
                                    <div className="grid-block small-6 no-margin no-overflow buy-sell-input">
                                        <input type="number" id="buyAmount" value={total} onChange={totalChange} autoComplete="off" placeholder="0.0"/>
                                    </div>
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-box">
                                        <AssetName name={base.get("symbol")} />
                                    </div>
                                </div>

                                <div className="grid-block no-padding buy-sell-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="transfer.fee" />:
                                    </div>
                                    <div className="grid-block small-6 no-margin no-overflow buy-sell-input">
                                        <input disabled type="text" id="fee" value={fee} autoComplete="off"/>
                                    </div>
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-box" style={{paddingLeft: feeAssets.length !== 1 ? 0 : 5}}>
                                        <select
                                            style={feeAssets.length === 1 ? {background: "none"} : null}
                                            disabled={feeAssets.length === 1}
                                            value={feeAssets.indexOf(this.props.feeAsset)}
                                            className={"form-control" + (feeAssets.length !== 1 ? " buysell-select" : "")}
                                            onChange={this.props.onChangeFeeAsset}
                                        >
                                            {options}
                                        </select>
                                    </div>

                                </div>

                            </div>
                            <div>
                                <div className="grid-content clear-fix no-padding">

                                    <table className="float-left">
                                        <tbody>
                                          <tr className="buy-sell-info">
                                                <td><Translate content="exchange.balance" />:</td>
                                                <td style={{paddingLeft: 5, textAlign: "right"}}>
                                                    <span style={{borderBottom: "#A09F9F 1px dotted", cursor: "pointer"}} onClick={this._addBalance.bind(this, balanceToAdd)}>
                                                        {utils.format_number(balanceAmount, balancePrecision)} <AssetName name={balanceSymbol} />
                                                    </span>
                                                </td>
                                          </tr>

                                          <tr className="buy-sell-info">
                                                <td style={{paddingTop: 5}}>{this.props.type === "bid" ? <Translate content="exchange.lowest_ask" /> : <Translate content="exchange.highest_bid" />}:&nbsp;</td>
                                                {currentPrice ? (
                                                <td style={{paddingLeft: 5, textAlign: "right", paddingTop: 5, verticalAlign: "bottom"}}>
                                                    <span style={{borderBottom: "#A09F9F 1px dotted", cursor: "pointer"}} onClick={this.props.setPrice.bind(this, type, currentPriceObject)}>
                                                    <PriceText price={currentPrice} quote={quote} base={base} /> <AssetName name={base.get("symbol")} />
                                                    </span>
                                                </td>) : null}
                                        </tr>
                                        </tbody>
                                    </table>

                                    {/* BUY/SELL button */}
                                    {disabledText ?
                                        (<div className="float-right" data-tip={disabledText} data-place="right" data-type="light">
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, true)} value={buttonText} />
                                        </div>) :
                                        (<div className="float-right" data-tip={""}>
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, true)} value={buttonText} />
                                        </div>)
                                    }

                                {/* SHORT button */}
                                    {disabledText && isPredictionMarket ? (
                                        <div style={{paddingRight: 10}} className="float-right" data-tip={disabledText} data-place="right" data-type="light">
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, false)} value={forceSellText} />
                                        </div>) : isPredictionMarket ? (
                                        <div style={{paddingRight: 10}} className="float-right" data-tip={""}>
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, false)} value={forceSellText} />
                                        </div>) : null
                                    }

                                  </div>
                            </div>

                    </form>
                </div>
            </div>
        );
    }
}

export default BuySell;
