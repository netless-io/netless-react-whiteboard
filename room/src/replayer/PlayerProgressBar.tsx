import * as React from "react";

import ChatIcon from "../assets/image/chat.svg";
import PlayerBeginIcon from "../assets/image/player_begin.svg";
import PlayerStopIcon from "../assets/image/player_stop.svg";

import SeekSlider from "@netless/react-seek-slider";

import {Badge, Icon, Popover} from "antd";
import {PlayerPhase, Player} from "white-react-sdk";
import {MessageType} from "../realtime/RealtimeRoomBottomRight";
import WhiteboardChat from "../components/WhiteboardChat";

export type PlayerProgressBarProps = {
    readonly player: Player;
    readonly phase: PlayerPhase;
    readonly currentTime: number;
    readonly messages: MessageType[];
    readonly disableChatBox: boolean;
    readonly onChangeCurrentTime: (time: number) => void;
};

export type PlayerProgressBarState = {
    readonly seenMessagesLength: number;
    readonly isPlayerSeeking: boolean;
    readonly isChatBoxVisible: boolean;
};

function displayWatch(seconds: number): string {
    const displaySeconds = seconds % 60;
    const minutes = (seconds - displaySeconds) / 60;

    if (minutes >= 60) {
        const displayMinutes = minutes % 60;
        const hours = (minutes - displayMinutes) / 60;

        return `${hours} : ${displayMinutes} : ${displaySeconds}`;

    } else {
        return `${minutes} : ${displaySeconds}`;
    }
}

export class PlayerProgressBar extends React.Component<PlayerProgressBarProps, PlayerProgressBarState> {

    private readonly player: Player;
    private progressTime: number = 0;

    public constructor(props: PlayerProgressBarProps) {
        super(props);
        this.player = props.player;
        this.state = {
            seenMessagesLength: 0,
            isPlayerSeeking: false,
            isChatBoxVisible: false,
        };
    }

    private getCurrentTime = (progressTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.progressTime = progressTime;
            return this.props.currentTime;

        } else {
            const isChange = this.progressTime !== progressTime;
            if (isChange) {
                return progressTime;
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
                this.player.seekToProgressTime(0);
                break;
            }
        }
    }

    private onClickSeekTime = (time: number): void => {
        this.props.onChangeCurrentTime(time);
        this.player.seekToProgressTime(time);
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
                {!this.props.disableChatBox && this.renderChatBox()}
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
        const progressTimestamp = displayWatch(Math.floor(this.player.progressTime / 1000));
        const durationTime = displayWatch(Math.floor(this.player.timeDuration / 1000));
        return (
            <div className="player-mid-box-time">
                {progressTimestamp} / {durationTime}
            </div>
        );
    }

    private renderChatBox(): React.ReactNode {
        let messagesCount: number;

        if (this.state.isChatBoxVisible) {
            messagesCount = 0;
        } else {
            messagesCount = this.props.messages.length - this.state.seenMessagesLength;
        }
        const popoverContent = (
            <WhiteboardChat messages={this.props.messages}/>
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
