import React from 'react'
import cname from "classnames"
import Trigger from "react-foundation-apps/src/trigger"
import Modal from "react-foundation-apps/src/modal"
import ZfApi from "react-foundation-apps/src/utils/foundation-api"
import PasswordInput from "../Forms/PasswordInput"
import notify from "actions/NotificationActions"
import Translate from "react-translate-component";
import counterpart from "counterpart";

import AltContainer from "alt/AltContainer"
import WalletDb from "stores/WalletDb"
import WalletUnlockStore from "stores/WalletUnlockStore"
import SessionActions from "actions/SessionActions"
import WalletUnlockActions from "actions/WalletUnlockActions"
import Apis from "rpc_api/ApiInstances"

class WalletUnlockModal extends React.Component {

    constructor() {
        super()
        this.state = {
            password_error: null,
            password_input_reset: Date.now()
        }
    }

    componentDidMount() {
        let modal = React.findDOMNode(this.refs.modal)
        ZfApi.subscribe(this.props.modalId, (name, msg) => {
            //DEBUG console.log('... name, msg',name, msg)
            if(name !== this.props.modalId)
                return
            if(msg === "close") {
                if(this.props.reject) this.props.reject()
                this.refs.password_input.clear()
                WalletUnlockActions.cancel()
            } else if (msg === "open") {
                if(Apis.instance().chain_id !== WalletDb.getWallet().chain_id) {
                    notify.error("This wallet was intended for a different block-chain; expecting " +
                        WalletDb.getWallet().chain_id.substring(0,4).toUpperCase() + ", but got " +
                        Apis.instance().chain_id.substring(0,4).toUpperCase())
                    ZfApi.publish(this.props.modalId, "close")
                    return
                }
                modal.querySelector('[name="password"]').focus()
            }
        })
    }
    
    componentDidUpdate() {
        //DEBUG console.log('... componentDidUpdate this.props.resolve', this.props.resolve)
        if(this.props.resolve) {
            if (WalletDb.isLocked())
                ZfApi.publish(this.props.modalId, "open")
            else 
                this.props.resolve(false)
        }
    }
    
    render() {
        //DEBUG console.log('... U N L O C K',this.props)
        var unlock_what = this.props.unlock_what || counterpart.translate("wallet.title");
        
        // Modal overlayClose must be false pending a fix that allows us to detect
        // this event and clear the password (via this.refs.password_input.clear())
        // https://github.com/akiran/react-foundation-apps/issues/34
        return ( 
            // U N L O C K
            <Modal id={this.props.modalId} ref="modal" overlay={true} overlayClose={false}>
                <Trigger close="">
                    <a href="#" className="close-button">&times;</a>
                </Trigger>
                <h3><Translate content="header.unlock" /> {unlock_what}</h3>
                <form>
                    <PasswordInput ref="password_input"
                        onEnter={this.onPasswordEnter.bind(this)}
                        key={this.state.password_input_reset}
                        wrongPassword={this.state.password_error}/>
                    <div className="button-group">
                        <a className="button" href
                            onClick={this.onPasswordEnter.bind(this)}>
                            <Translate content="header.unlock" /> {unlock_what}</a>
                        <Trigger close={this.props.modalId}>
                            <a href className="secondary button"><Translate content="account.perm.cancel" /></a>
                        </Trigger>
                    </div>
                </form>
            </Modal>
        )
    }
    
    onPasswordEnter(e) {
        e.preventDefault()
        var password = this.refs.password_input.value()
        this.setState({password_error: null})
        WalletDb.validatePassword(
            password || "",
            true //unlock
        )
        if (WalletDb.isLocked()) {
            this.setState({password_error: true})
            return
        }
        else {
            this.refs.password_input.clear()
            this.setState({password_input_reset: Date.now()})
            this.setState({password_error: false})
            ZfApi.publish(this.props.modalId, "close")
            this.props.resolve(true)
            SessionActions.onUnlock()
        }
    }

}

WalletUnlockModal.defaultProps = {
    modalId: "unlock_wallet_modal2"
}

class WalletUnlockModalContainer extends React.Component {
    render() {
        return (
            <AltContainer store={WalletUnlockStore}>
                <WalletUnlockModal/>
            </AltContainer>
        )
    }
}
export default WalletUnlockModalContainer
