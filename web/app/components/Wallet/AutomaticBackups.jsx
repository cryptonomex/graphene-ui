import React, {PropTypes, Component} from "react"
import connectToStores from "alt/utils/connectToStores"
import WalletUnlockActions from "actions/WalletUnlockActions"
import WalletDb from "stores/WalletDb"
import BackupActions, {backup, restore, decryptWalletBackup} from "actions/BackupActions"
import notify from "actions/NotificationActions"
import cname from "classnames"
import Translate from "react-translate-component";
import fetch from "node-fetch"
import AutomaticBackupStore from "stores/AutomaticBackupStore"
import LoadingIndicator from "components/LoadingIndicator"

class BaseComponent extends Component {
    static getStores() {
        return [ AutomaticBackupStore ]
    }
    static getPropsFromStores() {
        var store = AutomaticBackupStore.getState()
        return store
    }
}

@connectToStores
export default class AutomaticBackups extends BaseComponent {
    constructor() {
        super()
        this.state = {
            sending: false
        }
    }
    body(content) {
        return <span>
            <h3><Translate content="wallet.automatic_backups" /></h3>
            {content}
        </span>
    }
    render() {
        if(this.state.sending)
            return this.body(<div>
                <div className="center-content">
                    <br/>
                    <h5><Translate content="wallet.sending_email"/>&hellip;</h5>
                    <br/>
                    <LoadingIndicator type="three-bounce"/>
                </div>
            </div>)
        
        return this.body(<span>
            <form onSubmit={this.onSubmit.bind(this)} noValidate>
                <label><Translate content="wallet.email" />
                    <input type="text" value={this.props.email} onChange={this.onUpdateEmail.bind(this)}/>
                </label>
                <span className={cname("button success", { disabled: invalidEmail(this.props.email) } )}
                    onClick={this.onSubmit.bind(this)}><Translate content="wallet.confirm_email" /></span>
                <Reset/>
            </form>
        </span>)
    }
    onUpdateEmail(e) {
        e.preventDefault()
        AutomaticBackupStore.setEmail(e.target.value)
    }
    onSubmit(e) {
        e.preventDefault()
        this.setState({sending:true}, ()=>{
            fetch("http://localhost:9080/requestCode?email=" + encodeURIComponent(this.props.email))
                .then( res => {
                    this.setState({sending:false})
                    console.log("res.status", res.status)
                    // assert.equal(true, res.ok)
                    // assert.equal(200, res.status)
                    // assert.equal("OK", res.statusText)
                }).catch( error =>{
                    this.setState({sending:false})
                    console.error(error, error.stack)
                })
        })
    }
}

// No spaces, only one @ symbol, any character for the email name (not completely complient but safe),
// only valid domain name characters...  Single letter domain is allowed, top level domain has at
// least 2 characters.
var invalidEmail = email => ! email || ! /^[^ ^@.]+@[a-z0-9][\.a-z0-9_-]*\.[a-z0-9]{2,}$/i.test( email )

class Reset extends Component {
    render() {
        var label = this.props.label || <Translate content="wallet.reset" />
        return  <span className="button cancel"
            onClick={this.onReset.bind(this)}>{label}</span>
    }
    onReset() {
        AutomaticBackupStore.reset()
        window.history.back()
    }
}
