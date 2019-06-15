import * as React from "react";

import Identicon from "react-identicons";
import Switch from "antd/lib/switch";
import message from "antd/lib/message";

import {RoomState, ViewMode, Room} from "white-react-sdk";

export type WhiteboardPerspectiveSetProps = {
    readonly room: Room;
    readonly roomState: RoomState;
};

export default class WhiteboardPerspectiveSet extends React.Component<WhiteboardPerspectiveSetProps, {}> {

    public render(): React.ReactNode {
        const {roomState, room} = this.props;
        const perspectiveState = roomState.broadcastState;
        return (
            <div className="whiteboard-perspective-box">
                <div>
                    <div className="whiteboard-perspective-title">
                        当前视角
                    </div>
                    <div className="whiteboard-perspective-user-box">
                        <div className="whiteboard-perspective-user-head">
                            <Identicon
                                size={24}
                                string={perspectiveState.broadcasterInformation && perspectiveState.broadcasterInformation.avatar}/>
                        </div>
                        <div className="whiteboard-perspective-user-name">
                            {perspectiveState.broadcasterInformation && perspectiveState.broadcasterInformation.nickName.substring(0, 6)}
                        </div>
                    </div>
                </div>
                <div className="whiteboard-perspective-set-box">
                    <div className="whiteboard-perspective-set-title">
                        跟随视角
                    </div>
                    <Switch
                        checked={perspectiveState.mode === ViewMode.Follower}
                        size="small"
                        onChange={checked => {
                            if (checked) {
                                room.setViewMode(ViewMode.Follower);
                            } else {
                                room.setViewMode(ViewMode.Freedom);
                            }
                        }}/>
                </div>
                <div className="whiteboard-perspective-set-box">
                    <div className="whiteboard-perspective-set-title">
                        成为演讲者
                    </div>
                    <Switch size="small"
                            checked={perspectiveState.mode === ViewMode.Broadcaster}
                            onChange={checked => {
                                if (checked) {
                                    room.setViewMode(ViewMode.Broadcaster);
                                    message.info("进入演讲模式，他人会跟随您的视角");
                                } else {
                                    room.setViewMode(ViewMode.Freedom);
                                }
                            }}/>
                </div>
            </div>
        );
    }
}
