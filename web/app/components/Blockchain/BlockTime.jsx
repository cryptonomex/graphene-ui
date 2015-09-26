import React from "react";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import TimeAgo from "../Utility/TimeAgo";

/**
 * @brief displays block's date and time based on block number
 *
 * properties: block_number - number
 * Note, it doesn't fetch block, just calculates time based on number alone.
 **/

@BindToChainState({keep_updating:true})
class BlockTime extends React.Component {

    static propTypes = {
        block_number: React.PropTypes.number.isRequired,
        globalObject: ChainTypes.ChainObject.isRequired,
        dynGlobalObject: ChainTypes.ChainObject.isRequired
    }

    static defaultProps = {
        globalObject: "2.0.0",
        dynGlobalObject: "2.1.0"
    }

    constructor(props) {
        super(props);
        this.state = {time: null};
    }

    componentDidMount() {
        this.calcTime(this.props.block_number);
    }

    calcTime(block_number) {
        let block_interval = this.props.globalObject.get("parameters").get("block_interval");
        let head_block = this.props.dynGlobalObject.get("head_block_number");
        let head_block_time = new Date(this.props.dynGlobalObject.get("time") + "+00:00");
        let seconds_below = (head_block - block_number) * block_interval;
        let time = new Date(head_block_time - seconds_below * 1000);
        this.setState({time});
    }

    componentWillReceiveProps(next_props) {
        if(next_props.block_number !== this.props.block_number) {
            this.calcTime(next_props.block_number);
        }
    }

    /*
    shouldComponentUpdate(next_props, next_state) {
        return next_props.block_number !== this.props.block_number || next_state.time !== this.state.time;
    }
    */

                //{this.state.time ?  <FormattedDate value={this.state.time} formats={intlData.formats} format="short"/> : null}
    render() {
        return (
            <span className="time" key={this.props.block_number}>
                {this.state.time ? <TimeAgo time={this.state.time} /> : null }
            </span>
        );
    }
}

export default BlockTime;
