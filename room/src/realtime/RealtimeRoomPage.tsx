import * as React from "react";

import RealtimeRoom from "./RealtimeRoom";

import {message} from "antd";
import {JoinRoomParams, PptConverter, Room, RoomPhase, RoomState, WhiteWebSdk} from "white-web-sdk";
import {UserPayload} from "../common/UserPayload";
import {UserCursor} from "../components/UserCursor";
import {LoadingPage} from "../components/LoadingPage";
import {OSSOptions} from "../tools/OSSCreator";

export type RealtimeRoomPageProps = {
    readonly uuid: string;
    readonly roomToken: string;
    readonly userPayload: UserPayload;
    readonly sdk: WhiteWebSdk;
    readonly ossOptions: OSSOptions;
    readonly callbacks?: RealtimeRoomPageCallbacks;
};

export type RealtimeRoomPageCallbacks = {
    readonly onGoBack?: () => void;
};

export type RealtimeRoomPageState = {
    readonly room?: Room;
    readonly phase: RoomPhase;
    readonly roomState?: RoomState;
};

const EmptyObject = Object.freeze({});

export default class RealtimeRoomPage extends React.Component<RealtimeRoomPageProps, RealtimeRoomPageState> {

    private readonly uuid: string;
    private readonly roomToken: string;
    private readonly pptConverter: PptConverter;

    private didLeavePage: boolean = false;

    public constructor(props: RealtimeRoomPageProps) {
        super(props);
        this.uuid = this.props.uuid;
        this.roomToken = this.props.roomToken;
        this.pptConverter = props.sdk.pptConverter(this.roomToken);
        this.state = {
            phase: RoomPhase.Connecting,
        };
    }

    public componentWillMount(): void {
        this.startJoinRoom().catch(this.findError);
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
    }

    private async startJoinRoom (): Promise<void> {
        const whiteWebSdk = this.props.sdk;
        const userCursor = new UserCursor();
        const roomParams: JoinRoomParams = {
            uuid: this.uuid,
            roomToken: this.roomToken,
            cursorAdapter: new UserCursor(),
            userPayload: this.props.userPayload,
        };
        const room = await whiteWebSdk.joinRoom(roomParams, {
            onPhaseChanged: phase => {
                if (!this.didLeavePage) {
                    this.setState({phase});
                }
                console.log(`room ${this.uuid} changed: ${phase}`);
            },
            onRoomStateChanged: modifyState => {
                if (modifyState.roomMembers) {
                    userCursor.setColorAndAppliance(modifyState.roomMembers);
                }
                this.setState({
                    roomState: {...this.state.roomState, ...modifyState} as RoomState,
                });
            },
            onDisconnectWithError: this.findError,
            onKickedWithReason: reason => this.findError(new Error("kicked with reason: " + reason)),
        });
        this.setState({
            room: room,
            phase: room.phase,
            roomState: {...room.state},
        });
    }

    private findError = (error: Error): void => {
        message.error("实时房间出错：" + error.message);
        console.error(message);
        this.setState({room: undefined, phase: RoomPhase.Disconnected});
    }

    private isPhaseVisible(): boolean {
        return (this.state.phase === RoomPhase.Connected || this.state.phase === RoomPhase.Reconnecting);
    }

    public render(): React.ReactNode {
        if (this.state.room && this.state.roomState && this.isPhaseVisible()) {
            return <RealtimeRoom ossOptions={this.props.ossOptions}
                                 room={this.state.room}
                                 roomToken={this.props.roomToken}
                                 phase={this.state.phase}
                                 roomState={this.state.roomState}
                                 userPayload={this.props.userPayload}
                                 callbacks={this.props.callbacks || EmptyObject}/>
        } else {
            return <LoadingPage/>;
        }
    }
}
