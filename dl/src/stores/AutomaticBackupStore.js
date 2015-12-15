import alt from "alt-instance"
// import WalletDb from "stores/WalletDb"
// import AccountRefsStore from "stores/AccountRefsStore"
// import BalanceClaimActiveStore from "stores/BalanceClaimActiveStore"
// import CachedPropertyStore from "stores/CachedPropertyStore"
// import PrivateKeyActions from "actions/PrivateKeyActions"
// import WalletActions from "actions/WalletActions"
// import ChainStore from "api/ChainStore"
import BaseStore from "stores/BaseStore"
import iDB from "idb-instance"
import Immutable from "immutable"

/**  High-level container for managing multiple wallets.
*/
class AutomaticBackupStore extends BaseStore {
    constructor() {
        super()
        this.state = this._getInitialState()
        super._export("setEmail")
    }
    _getInitialState() {
        return {
            email: null,
            email_sent: false,
            /** The server must provide this code, authorizing the wallet create */
            create_wallet_code: null,
            
        }
    }
    setEmail(email) { this.setState({email}) }
    reset() { this.setState(this._getInitialState()) }
}

export var AutomaticBackupStoreWrapped = alt.createStore(AutomaticBackupStore, "AutomaticBackupStore");
export default AutomaticBackupStoreWrapped