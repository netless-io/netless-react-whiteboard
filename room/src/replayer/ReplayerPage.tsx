import * as React from "react";

import {message} from "antd";
import {Player, PlayerPhase, ReplayRoomParams, WhiteWebSdk} from "white-react-sdk";
import {LoadingPage, UserCursor} from "../components";
import Replayer from "./Replayer";

export type ReplayerPageProps = {
    readonly uuid: string;
    readonly roomToken: string;
    readonly beginTimestamp?: number;
    readonly duration?: number;
    readonly slice?: string;
    readonly sdk: WhiteWebSdk;
    readonly callbacks?: ReplayerPageCallbacks;
};

export type ReplayerPageCallbacks = {
    readonly onGoBack?: () => void;
    readonly onGoToRealtimeRoom?: (uuid: string) => void;
};

export type ReplayerPageState = {
    readonly player?: Player;
    readonly phase: PlayerPhase;
    readonly currentTime: number;
};

const EmptyObject = Object.freeze({});

export default class ReplayerPage extends React.Component<ReplayerPageProps, ReplayerPageState> {

    private readonly uuid: string;
    private readonly roomToken: string;

    private didLeavePage: boolean = false;

    public constructor(props: ReplayerPageProps) {
        super(props);
        this.uuid = props.uuid;
        this.roomToken = props.roomToken;
        this.state = {
            phase: PlayerPhase.WaitingFirstFrame,
            currentTime: 0,
        };
    }

    public componentWillMount(): void {
        this.startReplay().catch(this.findError);
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
    }

    private async startReplay(): Promise<void> {
        const userCursor = new UserCursor();
        const playerParams: ReplayRoomParams = {
            room: this.uuid,
            roomToken: this.roomToken,
            slice: this.props.slice,
            beginTimestamp: this.props.beginTimestamp,
            duration: this.props.duration,
            cursorAdapter: userCursor,
        };
        const player = await this.props.sdk.replayRoom(playerParams, {
            onPhaseChanged: phase => {
                if (!this.didLeavePage) {
                    this.setState({phase: phase});
                }
            },
            onLoadFirstFrame: () => {
                if (player.state.roomMembers) {
                    userCursor.refreshRoomMembers(player.state.roomMembers);
                }
            },
            onPlayerStateChanged: modifyState => {
                if (modifyState.roomMembers) {
                    userCursor.refreshRoomMembers(modifyState.roomMembers);
                }
            },
            onScheduleTimeChanged: scheduleTime => {
                this.setState({currentTime: scheduleTime});
            },
            onStoppedWithError: this.findError,
        });
        this.setState({player, phase: player.phase});
    }

    private findError = (error: Error): void => {
        message.error("回放录像出错：" + error.message);
        console.error(message);
        this.setState({player: undefined, phase: PlayerPhase.Stopped});
    }

    public render(): React.ReactNode {
        if (this.state.player) {
            return <Replayer player={this.state.player}
                             phase={this.state.phase}
                             currentTime={this.state.currentTime}
                             callbacks={this.props.callbacks || EmptyObject}
                             onChangeCurrentTime={currentTime => this.setState({currentTime})}/>
        } else {
            return <LoadingPage/>;
        }
    }
}
