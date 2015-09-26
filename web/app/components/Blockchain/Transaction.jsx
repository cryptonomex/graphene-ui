import React from "react";
import {PropTypes} from "react";
import FormattedAsset from "../Utility/FormattedAsset";
import {Link as RealLink} from "react-router";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import classNames from "classnames";
import {FormattedDate} from "react-intl";
import intlData from "../Utility/intlData";
import {operations} from "chain/chain_types";
import Inspector from "react-json-inspector";
import utils from "common/utils";
import LinkToAccountById from "../Blockchain/LinkToAccountById";
import LinkToAssetById from "../Blockchain/LinkToAssetById";
import FormattedPrice from "../Utility/FormattedPrice";

require("./operations.scss");
require("./json-inspector.scss");

let ops = Object.keys(operations);

class OpType extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (
            nextProps.type !== this.props.type
        );
    }

    render() {
        let trxTypes = counterpart.translate("transaction.trxTypes");
        let labelClass = classNames("txtlabel", this.props.color || "info");
        return (
            <tr>
                <td>
                    <span className={labelClass}>
                        {trxTypes[ops[this.props.type]]}
                    </span>
                </td>
                <td>
                </td>
            </tr>
        );
    }
}

class NoLinkDecorator extends React.Component {
    render() {
        return <span>{this.props.children}</span>;
    }
}

class OperationTable extends React.Component {

    render() {

       let fee_row = this.props.fee.amount > 0 ? (
            <tr>
                <td><Translate component="span" content="transfer.fee" /></td>
                <td><FormattedAsset color="fee" amount={this.props.fee.amount} asset={this.props.fee.asset_id} /></td>
            </tr> ) : null;

        return (
            <div >
            {/*  <h6><Translate component="span" content="explorer.block.op" /> #{this.props.index + 1}/{this.props.opCount}</h6> */}
                <table style={{marginBottom: "1em"}} className="table op-table">
                    <caption></caption>
                    <tbody>
                        <OpType type={this.props.type} color={this.props.color}/>
                        {this.props.children}
                        {fee_row}
                    </tbody>
                </table>
            </div>
            );
    }
}

class Transaction extends React.Component {

    linkToAccount(name_or_id) {
        if(!name_or_id) return <span>-</span>;
        let Link = this.props.no_links ? NoLinkDecorator : RealLink;
        return utils.is_object_id(name_or_id) ?
            <LinkToAccountById account={name_or_id}/> :
            <Link to="account-overview" params={{account_name: name_or_id}}>{name_or_id}</Link>;
    }

    linkToAsset(symbol_or_id) {
        if(!symbol_or_id) return <span>-</span>;
        let Link = this.props.no_links ? NoLinkDecorator : RealLink;
        return utils.is_object_id(symbol_or_id) ?
            <LinkToAssetById asset={symbol_or_id}/> :
            <Link to="asset" params={{symbol: symbol_or_id}}>{symbol_or_id}</Link>;
    }

    render() {
        let {trx} = this.props;
        let info = null;

        info = [];

        let opCount = trx.operations.length;

        trx.operations.forEach((op, opIndex) => {

            let rows = [];
            let color = "";
            switch (ops[op[0]]) { // For a list of trx types, see chain_types.coffee

                case "transfer":

                    color = "success";

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.from" /></td>
                            <td>{this.linkToAccount(op[1].from)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.to" /></td>
                            <td>{this.linkToAccount(op[1].to)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.amount" /></td>
                            <td><FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id} /></td>
                        </tr>
                    );

                    break;

                case "limit_order_create":
                    color = "warning";
                    // missingAssets = this.getAssets([op[1].amount_to_sell.asset_id, op[1].min_to_receive.asset_id]);
                    // let price = (!missingAssets[0] && !missingAssets[1]) ? utils.format_price(op[1].amount_to_sell.amount, assets.get(op[1].amount_to_sell.asset_id), op[1].min_to_receive.amount, assets.get(op[1].min_to_receive.asset_id), false, inverted) : null;
                    
                    rows.push(
                        <tr key="1">
                            <td><Translate component="span" content="transaction.amount_sell" /></td>
                            <td><FormattedAsset amount={op[1].amount_to_sell.amount} asset={op[1].amount_to_sell.asset_id} /></td>
                        </tr>
                    );
                    rows.push(
                        <tr key="2">
                            <td><Translate component="span" content="exchange.price" /></td>
                            <td>
                                <FormattedPrice
                                    base_asset={op[1].amount_to_sell.asset_id}
                                    quote_asset={op[1].min_to_receive.asset_id}
                                    base_amount={op[1].amount_to_sell.amount}
                                    quote_amount={op[1].min_to_receive.amount} />
                            </td>
                        </tr>
                    );
                    // rows.push(
                    //     <tr key="2">
                    //         <td><Translate component="span" content="transaction.min_receive" /></td>
                    //         <td>{!missingAssets[1] ? <FormattedAsset amount={op[1].min_to_receive.amount} asset={op[1].min_to_receive.asset_id} /> : null}</td>
                    //     </tr>
                    // );
                    rows.push(
                        <tr key="3">
                            <td><Translate component="span" content="transaction.seller" /></td>
                            <td>{this.linkToAccount(op[1].seller)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key="4">
                            <td><Translate component="span" content="transaction.expiration" /></td>
                            <td>
                                <FormattedDate
                                    value={op[1].expiration}
                                    formats={intlData.formats}
                                    format="full"
                                />
                            </td>
                        </tr>
                    );

                    break;

                case "short_order_create":
                    color = "short";
                    // this.getAssets([op[1].amount_to_sell.asset_id, op[1].collateral.asset_id]);
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.amount_sell" /></td>
                            <td><FormattedAsset amount={op[1].amount_to_sell.amount} asset={op[1].amount_to_sell.asset_id} />}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.collateral" /></td>
                            <td>{<FormattedAsset amount={op[1].collateral.amount} asset={op[1].collateral.asset_id} />}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.coll_ratio" /></td>
                            <td>{op[1].initial_collateral_ratio}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.coll_maint" /></td>
                            <td>{op[1].maintenance_collateral_ratio}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.seller" /></td>
                            <td>{this.linkToAccount(op[1].seller)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.expiration" /></td>
                            <td>
                                <FormattedDate
                                    value={op[1].expiration}
                                    formats={intlData.formats}
                                    format="full"
                                />
                            </td>
                        </tr>
                    );

                    break;

                case "limit_order_cancel":
                    color = "cancel";
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.order_id" /></td>
                            <td>{op[1].order}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.fee_payer" /></td>
                            <td>{this.linkToAccount(op[1].fee_paying_account)}</td>
                        </tr>
                    );

                    break;

                case "short_order_cancel":
                    color = "cancel";
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.order_id" /></td>
                            <td>{op[1].order}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.fee_payer" /></td>
                            <td>{this.linkToAccount(op[1].fee_paying_account)}</td>
                        </tr>
                    );

                    break;

                case "call_order_update":
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.funding_account" /></td>
                            <td>{this.linkToAccount(op[1].funding_account)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.delta_collateral" /></td>
                            <td><FormattedAsset amount={op[1].delta_collateral.amount} asset={op[1].delta_collateral.asset_id} /></td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.delta_debt" /></td>
                            <td><FormattedAsset amount={op[1].delta_debt.amount} asset={op[1].delta_debt.asset_id} /></td>
                        </tr>
                    );
                    break;

                case "key_create":
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.fee_payer" /></td>
                            <td>{this.linkToAccount(op[1].fee_paying_account)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.key" /></td>
                            <td>{op[1].key_data[1]}</td>
                        </tr>
                    );

                    break;

                case "account_create":

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="account.name" /></td>
                            <td>{this.linkToAccount(op[1].name)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="account.member.reg" /></td>
                            <td>{this.linkToAccount(op[1].registrar)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="account.member.ref" /></td>
                            <td>{this.linkToAccount(op[1].referrer)}</td>
                        </tr>
                    );

                    break;

                case "account_update":
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="account.name" /></td>
                            <td>{this.linkToAccount(op[1].account)}</td>
                        </tr>
                    );
                    // let voting_account = ChainStore.getAccount(op[1].new_options.voting_account)
                    // let updating_account = ChainStore.getAccount(op[1].account)
                    if( op[1].new_options.voting_account )
                    {
                       // let proxy_account_name = voting_account.get('name')
                       rows.push(
                                   <tr>
                                       <td><Translate component="span" content="account.votes.proxy" /></td>
                                       <td>{this.linkToAccount(op[1].new_options.voting_account)}</td>
                                   </tr>
                       );
                    }
                    else
                    {
                       console.log( "num witnesses: ", op[1].new_options.num_witness ) 
                       console.log( "===============> NEW: ", op[1].new_options ) 
                       rows.push(
                                   <tr>
                                       <td><Translate component="span" content="account.votes.proxy" /></td>
                                       <td><Translate component="span" content="account.votes.no_proxy" /></td>
                                   </tr>
                       );
                       rows.push(
                                   <tr>
                                       <td><Translate component="span" content="account.options.num_committee" /></td>
                                       <td>{op[1].new_options.num_committee}</td>
                                   </tr>
                       );
                       rows.push(
                                   <tr>
                                       <td><Translate component="span" content="account.options.num_witnesses" /></td>
                                       <td>{op[1].new_options.num_witness}</td>
                                   </tr>
                       );
                       rows.push(
                                   <tr>
                                       <td><Translate component="span" content="account.options.votes" /></td>
                                       <td>{JSON.stringify( op[1].new_options.votes) }</td>
                                   </tr>
                       );
                    }
                    rows.push(
                                <tr>
                                    <td><Translate component="span" content="account.options.memo_key" /></td>
                                   {/* TODO replace with KEY render component that provides a popup */}
                                    <td>{op[1].new_options.memo_key.substring(0,10)+"..."}</td>
                                </tr>
                    );

                    break;

                case "account_whitelist":
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.authorizing_account" /></td>
                            <td>{this.linkToAccount(op[1].authorizing_account)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.listed_account" /></td>
                            <td>{this.linkToAccount(op[1].account_to_list)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.new_listing" /></td>
                            <td>{op[1].new_listing.toString()}</td>
                        </tr>
                    );

                    break;

                case "account_upgrade":                    
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.account_upgrade" /></td>
                            <td>{this.linkToAccount(op[1].account_to_upgrade)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.lifetime" /></td>
                            <td>{op[1].upgrade_to_lifetime_member.toString()}</td>
                        </tr>
                    );
                    break;

                case "account_transfer":
                    /* This case is uncomplete, needs filling out with proper fields */
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.from" /></td>
                            <td>{this.linkToAccount(op[1].account_id)}</td>
                        </tr>
                    );

                    break;

                case "asset_create":
                    color = "warning";
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.assets.issuer" /></td>
                            <td>{this.linkToAccount(op[1].issuer)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.assets.symbol" /></td>
                            <td>{this.linkToAsset(op[1].symbol)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.assets.precision" /></td>
                            <td>{op[1].precision}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.common_options" /></td>
                            <td><Inspector data={ op[1].common_options } search={false}/></td>
                        </tr>
                    );

                    break;

                case "asset_update":
                case "asset_update_bitasset":
                    color = "warning";                    

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.asset_update" /></td>
                            <td>{this.linkToAsset(op[1].asset_to_update)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.assets.issuer" /></td>
                            <td>{this.linkToAccount(op[1].issuer)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.new_options" /></td>
                            <td><Inspector data={ op[1].new_options } search={false}/></td>
                        </tr>
                    );

                    break;

                case "asset_update_feed_producers":
                    color = "warning";
                    console.log("op:", op);
                    let producers = [];
                    op[1].new_feed_producers.forEach(producer => {
                        // let missingAsset = this.getAccounts([producer])[0];
                        producers.push(<div>{this.linkToAccount(producer)}<br/></div>);
                    });

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.asset_update" /></td>
                            <td>{this.linkToAsset(op[1].asset_to_update)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.new_producers" /></td>
                            <td>{producers}</td>
                        </tr>
                    );

                    break;

                case "asset_issue":
                    color = "warning";
                    
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.assets.issuer" /></td>
                            <td>{this.linkToAccount(op[1].issuer)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.asset_issue" /></td>
                            <td><FormattedAsset style={{fontWeight: "bold"}} amount={op[1].asset_to_issue.amount} asset={op[1].asset_to_issue.asset_id} /></td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.to" /></td>
                            <td>{this.linkToAccount(op[1].issue_to_account)}</td>
                        </tr>
                    );

                    break;

                case "asset_burn":
                    color = "cancel";

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.account.title" /></td>
                            <td>{this.linkToAccount(op[1].payer)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.amount" /></td>
                            <td><FormattedAsset amount={op[1].amount_to_burn.amount} asset={op[1].amount_to_burn.asset_id} /></td>
                        </tr>
                    );

                    break;

                case "asset_fund_fee_pool":
                    color = "warning";

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.account.title" /></td>
                            <td>{this.linkToAccount(op[1].from_account)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.asset.title" /></td>
                            <td>{this.linkToAsset(op[1].asset_id)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.amount" /></td>
                            <td><FormattedAsset amount={op[1].amount} asset={op[1].asset_id} /></td>
                        </tr>
                    );

                    break;

                case "asset_settle":
                    color = "warning";

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.account.title" /></td>
                            <td>{this.linkToAccount(op[1].account)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.asset.title" /></td>
                            <td>{this.linkToAsset(op[1].amount.asset_id)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.amount" /></td>
                            <td><FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id} /></td>
                        </tr>
                    );

                    break;

                case "asset_publish_feed":
                    color = "warning";                    
                    let {feed} = op[1];
                    console.log("op:", op, feed);

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.publisher" /></td>
                            <td>{this.linkToAccount(op[1].publisher)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.asset.title" /></td>
                            <td>{this.linkToAsset(op[1].asset_id)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.coll_ratio" /></td>
                            <td>{(feed.maximum_short_squeeze_ratio / 1000).toFixed(2)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.coll_maint" /></td>
                            <td>{(feed.maintenance_collateral_ratio / 1000).toFixed(2)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="markets.core_rate" /></td>
                            <td>
                                <FormattedPrice
                                    base_asset={feed.core_exchange_rate.base.asset_id}
                                    quote_asset={feed.core_exchange_rate.quote.asset_id}
                                    base_amount={feed.core_exchange_rate.base.amount}
                                    quote_amount={feed.core_exchange_rate.quote.amount} 
                                />  
                            </td>
                        </tr>
                    );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.settlement_price" /></td>
                            <td>
                                <FormattedPrice
                                    base_asset={feed.settlement_price.base.asset_id}
                                    quote_asset={feed.settlement_price.quote.asset_id}
                                    base_amount={feed.settlement_price.base.amount}
                                    quote_amount={feed.settlement_price.quote.amount} 
                                />
                            </td>
                        </tr>
                    );

                    break;

                case "committee_member_create":                    

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.delegate.title" /></td>
                            <td>{this.linkToAccount(op[1].delegate_account)}</td>
                        </tr>
                    );

                    break;

                case "witness_create":

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.witness" /></td>
                            <td>{this.linkToAccount(op[1].witness_account)}</td>
                        </tr>
                    );

                    break;

                case "witness_update":

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="explorer.block.witness" /></td>
                            <td>{this.linkToAccount(op[1].witness_account)}</td>
                        </tr>
                    );

                    if (op[1].new_url) {
                        rows.push(
                            <tr>
                                <td><Translate component="span" content="transaction.new_url" /></td>
                                <td><a href={op[1].new_url} target="_blank">{op[1].new_url}</a></td>
                            </tr>
                        );
                    }

                    break;

                case "balance_claim":
                    color = "success";

                    let bal_id = op[1].balance_to_claim.substring(5);
                    console.log( "bal_id: ", bal_id, op[1].balance_to_claim );

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.claimed" /></td>
                            <td><FormattedAsset amount={op[1].total_claimed.amount} asset={op[1].total_claimed.asset_id} /></td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.deposit_to" /></td>
                            <td>{this.linkToAccount(op[1].deposit_to_account)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.balance_id" /></td>
                            <td>#{bal_id}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transaction.balance_owner" /></td>
                            <td style={{fontSize: "80%"}}>{op[1].balance_owner_key.substring(0,10)}...</td>
                        </tr>
                    );
                    break;

                case "vesting_balance_withdraw":
                    color = "success";

                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.to" /></td>
                            <td>{this.linkToAccount(op[1].owner)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr>
                            <td><Translate component="span" content="transfer.amount" /></td>
                            <td><FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id} /></td>
                        </tr>
                    );

                    break;

                default: 
                    rows = null;
                    break;
            }

            info.push(
                <OperationTable key={opIndex} opCount={opCount} index={opIndex} color={color} type={op[0]} fee={op[1].fee}>
                    {rows}
                </OperationTable>
            );
        });

        return (
            <div>
            {/*     <h5><Translate component="span" content="explorer.block.trx" /> #{index + 1}</h5> */ }
                {info}
            </div>
        );
    }
}

Transaction.defaultProps = {
    no_links: false
};

Transaction.propTypes = {
    trx: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    no_links: PropTypes.bool
};

export default Transaction;
