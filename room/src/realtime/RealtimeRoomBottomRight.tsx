import * as React from "react";

import AnnexBoxIcon from "../assets/image/annex_box.svg";
import WhiteboardKeyboardIcon from "../assets/image/whiteboard_keyboard.svg";
import LeftArrowIcon from "../assets/image/left_arrow.svg";
import RightArrowIcon from "../assets/image/right_arrow.svg";
import ChatIcon from "../assets/image/chat.svg";

import Badge from "antd/lib/badge";
import Popover from "antd/lib/popover";
import Tooltip from "antd/lib/tooltip";
import WhiteboardChat from "../components/WhiteboardChat";

import {Room, RoomState} from "white-web-sdk";
import {UserPayload} from "../common";

export type RealtimeRoomBottomRightProps = {
    readonly room: Room;
    readonly roomState: RoomState;
    readonly userPayload: UserPayload;
    readonly disableCustomEvents: boolean;
    readonly handleHotKeyMenuState: () => void;
    readonly handleAnnexBoxMenuState: () => void;
};

export type RealtimeRoomBottomRightState = {
    readonly hotkeyTooltipDisplay: boolean;
    readonly annexBoxTooltipDisplay: boolean;
    readonly messages:  MessageType[];
    readonly seenMessagesLength: number;
    readonly isVisible: boolean;
};

export type MessageType = {
    readonly name: string;
    readonly avatar: string;
    readonly id: string;
    readonly messageInner: string[];
};

export default class RealtimeRoomBottomRight extends React.Component<RealtimeRoomBottomRightProps, RealtimeRoomBottomRightState> {

    public constructor(props: RealtimeRoomBottomRightProps) {
        super(props);
        this.state = {
            hotkeyTooltipDisplay: false,
            annexBoxTooltipDisplay: false,
            messages: [],
            seenMessagesLength: 0,
            isVisible: false,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-box-bottom-right">
                <div className="whiteboard-box-bottom-right-mid">
                    {this.renderHotKeyBox()}
                    {this.renderAnnexBox()}
                    {!this.props.disableCustomEvents && this.renderChatBox()}
                </div>
            </div>
        );
    }

    private renderHotKeyBox(): React.ReactNode {
        return (
            <Tooltip placement="top" title="快捷键" visible={this.state.hotkeyTooltipDisplay}>
                <div
                    style={{marginRight: 8}}
                    className="whiteboard-bottom-right-cell"
                    onClick={this.props.handleHotKeyMenuState}>
                    <img src={WhiteboardKeyboardIcon}/>
                </div>
            </Tooltip>
        );
    }

    private renderAnnexBox(): React.ReactNode {
        const {roomState, room} = this.props;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        return (
            <div>
                {scenes.length > 1 ?
                    <div className="whiteboard-annex-box">
                        <div
                            onClick={() => room.pptPreviousStep()}
                            className="whiteboard-annex-arrow-left">
                            <img src={LeftArrowIcon}/>
                        </div>
                        <Tooltip placement="top" title="附件资料" visible={this.state.annexBoxTooltipDisplay}>
                            <div
                                onMouseEnter={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: true,
                                    });
                                }}
                                onMouseLeave={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: false,
                                    });
                                }}
                                onClick={this.props.handleAnnexBoxMenuState}
                                className="whiteboard-annex-arrow-mid">
                                <div className="whiteboard-annex-img-box">
                                    <img src={AnnexBoxIcon}/>
                                </div>
                                <div className="whiteboard-annex-arrow-page">
                                    {activeIndex + 1} / {scenes.length}
                                </div>
                            </div>
                        </Tooltip>
                        <div
                            onClick={() => room.pptNextStep()}
                            className="whiteboard-annex-arrow-right">
                            <img src={RightArrowIcon}/>
                        </div>
                    </div> :
                    <Tooltip placement="topRight" title="附件资料" visible={this.state.annexBoxTooltipDisplay}>
                        <div
                            onMouseEnter={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: true,
                                });
                            }}
                            onMouseLeave={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: false,
                                });
                            }}
                            onClick={this.props.handleAnnexBoxMenuState}
                            className="whiteboard-bottom-right-cell">
                            <img src={AnnexBoxIcon}/>
                        </div>
                    </Tooltip>}
            </div>
        );
    }

    private renderChatBox(): React.ReactNode {
        const chatContent = (
            <WhiteboardChat messages={this.state.messages}
                            room={this.props.room}
                            authorPayload={this.props.userPayload}/>
        );
        return (
            <Badge overflowCount={99} offset={[-3, 6]} count={this.state.isVisible ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                <Popover
                    overlayClassName="whiteboard-chat"
                    content={chatContent}
                    trigger="click"
                    onVisibleChange={(visible: boolean) => {
                        if (visible) {
                            this.setState({isVisible: true});
                        } else {
                            this.setState({isVisible: false, seenMessagesLength: this.state.messages.length});
                        }
                    }}
                    placement="topLeft">
                    <div style={{marginLeft: 8}} className="whiteboard-bottom-right-cell">
                        <img style={{width: 17}} src={ChatIcon}/>
                    </div>
                </Popover>
            </Badge>
        );
    }
}
