import * as React from "react";

import RealtimeRoom from "./RealtimeRoom";
import message from "antd/lib/message";

import {
    Room,
    RoomPhase,
    RoomState,
    DefaultHotKeys,
    JoinRoomParams,
    LegacyPPTConverter,
    WhiteWebSdk,
    AnimationMode,
    ViewMode,
} from "white-web-sdk";

import {CursorTool} from "@netless/cursor-tool";
import {UserPayload} from "../common";
import {LoadingPage} from "../components";
import {OSSOptions} from "../tools";

export type RealtimeRoomPageProps = {
    readonly uuid: string;
    readonly roomToken: string;
    readonly userPayload: UserPayload;
    readonly sdk: WhiteWebSdk;
    readonly ossOptions: OSSOptions;
    readonly isWritable?: boolean;
    readonly disableAppFeatures?: boolean;
    readonly callbacks?: RealtimeRoomPageCallbacks;
};

export type RealtimeRoomPageCallbacks = {
    readonly onGoBack?: () => void;
    readonly onGoReplay?: (uuid: string, slice?: string) => void;
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
    private readonly pptConverter: LegacyPPTConverter;

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
        this.joinRoom().catch(this.findError);
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
    }

    private async joinRoom (): Promise<void> {
        const whiteWebSdk = this.props.sdk;
        const cursorAdapter = new CursorTool();
        const roomParams: JoinRoomParams = {
            uuid: this.uuid,
            roomToken: this.roomToken,
            cursorAdapter: cursorAdapter,
            userPayload: {...this.props.userPayload},
            isWritable: this.props.isWritable,
            floatBar: true,
            hotKeys: {
                ...DefaultHotKeys,
                changeToSelector: "s",
                changeToLaserPointer: "l",
                changeToPencil: "p",
                changeToRectangle: "r",
                changeToEllipse: "c",
                changeToEraser: "e",
                changeToStraight: "t",
                changeToArrow: "a",
                changeToHand: "h",
            },
        };
        const room = await whiteWebSdk.joinRoom(roomParams, {
            onPhaseChanged: phase => {
                if (!this.didLeavePage) {
                    this.setState({phase});
                }
                console.log(`room ${this.uuid} changed: ${phase}`);
            },
            onRoomStateChanged: modifyState => {
                this.setState({
                    roomState: {...this.state.roomState, ...modifyState} as RoomState,
                });
            },
            onDisconnectWithError: this.findError,
            onKickedWithReason: reason => this.findError(new Error("kicked with reason: " + reason)),
        });
        cursorAdapter.setRoom(room);

        if (room.state.broadcastState.mode !== ViewMode.Follower) {
            // 对准 ppt
            room.moveCameraToContain({
                originX: -640,
                originY: -360,
                width: 1280,
                height: 720,
                animationMode: AnimationMode.Immediately,
            });
        }
        (window as any).room = room;
        this.setState({
            room: room,
            phase: room.phase,
            roomState: {...room.state},
        });
    }

    private findError = (error: Error): void => {
        message.error("实时房间出错：" + error.message);
        console.error(error);
        this.setState({room: undefined, phase: RoomPhase.Disconnected});
    }

    private isPhaseVisible(): boolean {
        return (this.state.phase === RoomPhase.Connected || this.state.phase === RoomPhase.Reconnecting);
    }

    public render(): React.ReactNode {
        if (this.state.room && this.state.roomState && this.isPhaseVisible()) {
            return (
                <RealtimeRoom ossOptions={this.props.ossOptions}
                              room={this.state.room}
                              roomToken={this.props.roomToken}
                              sdk={this.props.sdk}
                              phase={this.state.phase}
                              roomState={this.state.roomState}
                              userPayload={this.props.userPayload}
                              disableAppFeatures={!!this.props.disableAppFeatures}
                              callbacks={this.props.callbacks || EmptyObject}/>
            );
        } else {
            return <LoadingPage/>;
        }
    }
}
