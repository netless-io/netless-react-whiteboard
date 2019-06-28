import * as React from "react";

import PlayerIcon from "../assets/image/player.svg";
import LikeIcon from "../assets/image/like_icon.svg";

import Tooltip from "antd/lib/tooltip";
import ScaleController from "@netless/react-scale-controller";

import {Room, RoomState} from "white-react-sdk";
import {UserPayload} from "../common";

export type RealtimeRoomBottomLeftProps = {
    readonly room: Room;
    readonly roomState: RoomState;
    readonly userPayload: UserPayload;
    readonly disableCustomEvents: boolean;
    readonly onGoReplay?: (uuid: string, slice?: string) => void;
};

export default class RealtimeRoomBottomLeft extends React.Component<RealtimeRoomBottomLeftProps, {}> {

    private zoomChange = (scale: number): void => {
        this.props.room.moveCamera({scale});
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
                <Tooltip placement="top" title="点击回放">
                    <div className="whiteboard-box-bottom-left-player"
                         onClick={this.replay}>
                        <img src={PlayerIcon}/>
                    </div>
                </Tooltip>
                {!this.props.disableCustomEvents && (
                    <div className="whiteboard-box-bottom-left-cell"
                         onClick={async () => {
                             this.props.room.dispatchMagixEvent("handclap", "handclap");
                         }}>
                        <img style={{width: 15}} src={LikeIcon}/>
                    </div>
                )}
            </div>
        );
    }
}
