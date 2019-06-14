import * as React from "react";

import "./RealtimeRoomTopLeft.less";

import HomeIcon from "../assets/image/home.svg";

import {Button, message, Modal, Tooltip} from "antd";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {Room} from "white-react-sdk";

export type RealtimeRoomLeftProps = InjectedIntlProps & {
    readonly room: Room;
    readonly onGoBack?: () => void;
};

export type RealtimeRoomLeftState = {
    readonly isMouseOn: boolean;
    readonly isVisible: boolean;
};

class RealtimeRoomTopLeft extends React.Component<RealtimeRoomLeftProps, RealtimeRoomLeftState> {

    public constructor(props: RealtimeRoomLeftProps) {
        super(props);
        this.state = {
            isMouseOn: false,
            isVisible: false,
        };
    }
    private handleGoBackHome = (): void =>  {
        this.setState({isVisible: !this.state.isVisible});
    }

    private disconnect = async (): Promise<void> => {
        try {
            await this.props.room.disconnect();

            if (this.props.onGoBack) {
                this.props.onGoBack();
            }
        } catch (err) {
            message.error("disconnect fail");
            this.handleGoBackHome();
        }
    }

    public render(): React.ReactNode {

        return (
            <Tooltip placement="bottomRight" title={this.props.intl.formatMessage({id: "goback"})}>
                <div onClick={this.handleGoBackHome} className="whiteboard-box-top-left">
                    <img src={HomeIcon}/>
                </div>
                <Modal title="Go Back"
                       visible={this.state.isVisible}
                       footer={null}
                       onCancel={() => this.setState({isVisible: false})}>
                    <div className="go-back-title">
                        Are you leaving the room?
                    </div>
                    <div className="go-back-script">
                        If you leave, we will delete all temporary user information.
                    </div>
                    <div className="go-back-btn-box">
                        <Button
                            size="large"
                            style={{width: 108}}
                            type="primary" onClick={() => this.setState({isVisible: false})}>Continue</Button>
                        <Button
                            size="large"
                            style={{width: 108}}
                            onClick={this.disconnect}>Exit</Button>
                    </div>
                </Modal>
            </Tooltip>
        );
    }
}

export default injectIntl(RealtimeRoomTopLeft);
