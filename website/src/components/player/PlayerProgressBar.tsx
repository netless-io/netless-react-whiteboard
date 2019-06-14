import * as React from "react";

import * as ChatIcon from "../../assets/image/chat.svg";
import * as PlayerBeginIcon from "../../assets/image/player_begin.svg";
import * as PlayerStopIcon from "../../assets/image/player_stop.svg";

import WhiteboardChat from "../whiteboard/WhiteboardChat";
import SeekSlider from "@netless/react-seek-slider";

import {Badge, Icon, Popover} from "antd";
import {PlayerPhase, Player} from "white-react-sdk";
import {displayWatch} from "../../tools/WatchDisplayer";
import {MessageType} from "../whiteboard/WhiteboardBottomRight";

export type PlayerProgressBarProps = {
    readonly player: Player;
    readonly phase: PlayerPhase;
    readonly userId: string;
    readonly currentTime: number;
    readonly messages: MessageType[];
    readonly onChangeCurrentTime: (time: number) => void;
};

export type PlayerProgressBarState = {
    readonly seenMessagesLength: number;
    readonly isPlayerSeeking: boolean;
    readonly isChatBoxVisible: boolean;
};

export class PlayerProgressBar extends React.Component<PlayerProgressBarProps, PlayerProgressBarState> {

    private readonly player: Player;
    private scheduleTime: number = 0;

    public constructor(props: PlayerProgressBarProps) {
        super(props);
        this.player = props.player;
        this.state = {
            seenMessagesLength: 0,
            isPlayerSeeking: false,
            isChatBoxVisible: false,
        };
    }

    private getCurrentTime = (scheduleTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.scheduleTime = scheduleTime;
            return this.props.currentTime;

        } else {
            const isChange = this.scheduleTime !== scheduleTime;
            if (isChange) {
                return scheduleTime;
            } else {
                return this.props.currentTime;
            }
        }
    }

    private onClickOperationButton = (): void => {
        switch (this.player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
                this.player.play();
                break;
            }
            case PlayerPhase.Playing: {
                this.player.pause();
                break;
            }
            case PlayerPhase.Ended: {
                this.player.seekToScheduleTime(0);
                break;
            }
        }
    }

    private onClickSeekTime = (time: number): void => {
        this.props.onChangeCurrentTime(time);
        this.player.seekToScheduleTime(time);
    }

    private onChatBoxVisibleChanged = (visible: boolean): void => {
        if (visible) {
            this.setState({isChatBoxVisible: true});
        } else {
            this.setState({isChatBoxVisible: false, seenMessagesLength: this.props.messages.length});
        }
    }

    public render(): React.ReactNode {
        return (
            <div style={{display: "flex"}}
                 className="player-schedule">
                <div className="player-left-box">
                    <div className="player-controller"
                         onClick={() => this.onClickOperationButton()}>
                        {this.renderOperationButton(this.props.phase)}
                    </div>
                </div>
                {this.renderProgressBar()}
                {this.renderTimeDescription()}
                {this.renderChatBox()}
            </div>
        );
    }

    private renderOperationButton = (phase: PlayerPhase): React.ReactNode => {
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img src={PlayerBeginIcon}/>;
            }
            case PlayerPhase.Buffering: {
                return <Icon style={{fontSize: 18}} type="loading" />;
            }
            case PlayerPhase.Ended: {
                return <img style={{marginLeft: 2}} src={PlayerStopIcon}/>;
            }
            default: {
                return <img style={{marginLeft: 2}} src={PlayerStopIcon}/>;
            }
        }
    }

    private renderProgressBar(): React.ReactNode {
        return (
            <div className="player-mid-box">
                <SeekSlider fullTime={this.player.timeDuration}
                            currentTime={this.getCurrentTime(this.props.currentTime)}
                            onChange={this.onClickSeekTime}
                            hideHoverTime
                            limitTimeTooltipBySides/>
            </div>
        );
    }

    private renderTimeDescription(): React.ReactNode {
        const scheduleTime = displayWatch(Math.floor(this.player.scheduleTime / 1000));
        const durationTime = displayWatch(Math.floor(this.player.timeDuration / 1000));
        return (
            <div className="player-mid-box-time">
                {scheduleTime} / {durationTime}
            </div>
        );
    }

    private renderChatBox(): React.ReactNode {
        let messagesCount = 0;

        if (this.state.isChatBoxVisible) {
            messagesCount = this.props.messages.length - this.state.seenMessagesLength;
        }
        const popoverContent = (
            <WhiteboardChat messages={this.props.messages}
                            userId={this.props.userId}/>
        );
        return (
            <Badge overflowCount={99}
                   offset={[-3, 6]}
                   count={messagesCount}>
                <Popover overlayClassName="whiteboard-chat"
                         trigger="click"
                         placement="topLeft"
                         content={popoverContent}
                         onVisibleChange={this.onChatBoxVisibleChanged}>
                    <div className="player-right-box">
                        <div className="player-right-box-inner">
                            <img style={{width: 17}} src={ChatIcon}/>
                        </div>
                    </div>
                </Popover>
            </Badge>
        );
    }
}
