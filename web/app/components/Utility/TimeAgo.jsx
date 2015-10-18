import React from "react";
import {FormattedRelative} from "react-intl";

class TimeAgo extends React.Component {
    
    constructor(props) {
        super(props);

        this.timeout = null;
        this._update = this._update.bind(this);
        this.last_block = 0;
        this.block_local_time = 0;
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.time !== this.props.time) {
            this.forceUpdate();
        }
        return false;
    }

    _update() {

        this._clearTimeout();
        let {time} = this.props;
        if (typeof time === "string") {
            time += "+00:00";
        }

        let timePassed = Math.round((new Date()).getTime() - (new Date(time)).getTime()) / 1000;
        let interval;
        if (timePassed < 60) { // 60s
            interval = 1000; // 1s
        } else if (timePassed < 60 * 60){ // 1 hour
            interval = 60 * 1000; // 1 minute
        } else {
            interval = 60 * 60 * 1000 // 1 hour
        }

        // console.log("now:", now, "propTime:", propTime, "time:", time, "typeof time:", typeof time);

        this.timeout = setTimeout(this._update, interval);

        this.forceUpdate();
    }

    _clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    componentDidMount() {
        this._update();
    }

    componentWillUnmount() {
        this._clearTimeout();
    }

    render() {

        let {time, component} = this.props;

        var block_number = ChainStore.getObject('2.1.0').get('head_block_number');
        
        if (block_number > this.last_block) {
            this.last_block = block_number;

            this.block_local_time = new Date();
        }

        if (!time) {
            return null;
        }
        
        if (typeof time === "string" && time.indexOf("+") === -1) {
            time += "+00:00";
        }

        if ( (this.block_local_time > 0) && (this.props.block == this.last_block) )
        { 
            // Adjust time to user's local time
            var tmp1 = new Date(time).getTime();
            var tmp2 = new Date(this.block_local_time).getTime();

            var diff = tmp1 - tmp2;
            time = new Date(tmp1 - diff);
            
        }

        component = component ? component : "span";

        let timeAgo = <span ref={"timeago_ttip_" + time} data-tip={new Date(time)} data-place="top" data-type="light"><FormattedRelative value={time}/></span>
        return React.createElement(component, {className: this.props.className}, timeAgo);
    }
}

export default TimeAgo;
