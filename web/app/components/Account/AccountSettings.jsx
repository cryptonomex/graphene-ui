import React from "react";
import {BackupCreate} from "../Wallet/Backup";
import BackupBrainkey from "../Wallet/BackupBrainkey";
import {WalletOptions, ChangeActiveWallet, WalletDelete} from "../Wallet/WalletManager";
import WalletCreate from "../Wallet/WalletCreate";
import Translate from "react-translate-component";
import counterpart from "counterpart";

export default class AccountSettings extends React.Component {

    constructor() {
        super();
        this.state = {
            restoreType: 0,
            types: ["backup", "restore", "delete"],
            keys: {
                backup: "settings.backupcreate_brainkey",
                restore: "settings.backup_brainkey",
                delete: "wallet.delete_wallet"
            }
        };
    }

    _changeType(e) {

        this.setState({
            restoreType: this.state.types.indexOf(e.target.value)
        });
    }

    render() {
        let {types, restoreType, keys} = this.state;
        let options = types.map(type => {
            return <option key={type} value={type}>{counterpart.translate(keys[type])} </option>;
        });

        let content;

        switch (types[restoreType]) {
        case "backup":
            content = <BackupBrainkey />;
            break;

        case "restore":
            content = (
                <div>
                    <p style={{maxWidth: "40rem", paddingBottom: 10}}><Translate content="settings.restore_brainkey_text" /></p>
                    <WalletCreate restoreBrainkey={true} />
                </div>
            );
            break;

        case "delete":
            content = <WalletDelete />;
            break;

        default:
            break;
        }

        return (
            <div>
                <select
                    onChange={this._changeType.bind(this)}
                    className="bts-select"
                    value={types[restoreType]}
                >
                    {options}
                </select>

                {content}
            </div>
        );
    }
};
