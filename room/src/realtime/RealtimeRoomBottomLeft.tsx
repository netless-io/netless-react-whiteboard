import * as React from "react";

import PlayerIcon from "../assets/image/player.svg";
import LikeIcon from "../assets/image/like_icon.svg";

import ScaleController from "@netless/react-scale-controller";

import {Room, RoomState} from "white-react-sdk";
import {Tooltip} from "antd";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {UserPayload} from "../common/UserPayload";

export type RealtimeRoomBottomLeftProps = InjectedIntlProps & {
    readonly room: Room;
    readonly roomState: RoomState;
    readonly userPayload: UserPayload;
    readonly onGoReplay?: (uuid: string, slice?: string) => void;
};

class RealtimeRoomBottomLeft extends React.Component<RealtimeRoomBottomLeftProps, {}> {

    private zoomChange = (scale: number): void => {
        const {room} = this.props;
        room.zoomChange(scale);
    }

    private replay = async (): Promise<void> => {
        const room = this.props.room;
        await room.disconnect();

        if (this.props.onGoReplay) {
            this.props.onGoReplay(room.uuid, room.slice);
        }
    }

    public render(): React.ReactNode {
        const {roomState} = this.props;
        return (
            <div className="whiteboard-box-bottom-left">
                <ScaleController zoomScale={roomState.zoomScale} zoomChange={this.zoomChange}/>
                <Tooltip placement="top" title={this.props.intl.formatMessage({id: "playback"})}>
                    <div className="whiteboard-box-bottom-left-player"
                         onClick={this.replay}>
                        <img src={PlayerIcon}/>
                    </div>
                </Tooltip>
                <div
                    onClick={async () => {
                        this.props.room.dispatchMagixEvent("handclap", "handclap");
                    }}
                    className="whiteboard-box-bottom-left-cell">
                    <img style={{width: 15}} src={LikeIcon}/>
                </div>
            </div>
        );
    }
}

export default injectIntl(RealtimeRoomBottomLeft);
