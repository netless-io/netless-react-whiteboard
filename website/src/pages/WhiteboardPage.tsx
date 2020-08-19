import * as React from "react";

import PageError from "./PageError";

import {message} from "antd";
import {LoadingPage, RealtimeRoomPage, UserPayload} from "netless-react-whiteboard-room";
import {RouteComponentProps} from "react-router";
import {Redirect} from "@netless/i18n-react-router";
import {netlessWhiteboardApi} from "../apiMiddleware";
import {ossOptions} from "../AppOptions";
import whiteWebSdk from "../SDK";

export type WhiteboardPageProps = RouteComponentProps<{
    readonly uuid: string;
    readonly userId: string;
}>;

export type WhiteboardPageState = {
    readonly connectFailed: boolean;
    readonly redirectPath?: string;
    readonly roomInfo?: {
        readonly roomToken: string;
        readonly userPayload: UserPayload;
    };
};

export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {

    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {connectFailed: false};
    }

    public componentWillMount(): void {
        this.joinRoom().catch(error => {
            message.error("加入房间失败：" + error.message);
            console.error(error);
            this.setState({connectFailed: true});
        });
    }

    private async joinRoom(): Promise<void> {
        const uuid = this.props.match.params.uuid;
        const userId = this.props.match.params.userId;
        const response = await netlessWhiteboardApi.room.joinRoomApi(uuid);

        if (response.code !== 200) {
            throw new Error("join room failed");
        }
        const roomToken = response.msg.roomToken;
        const user = netlessWhiteboardApi.user.getUserAndCreateIfNotExit(userId);

        this.setState({roomInfo: {
            roomToken: roomToken,
            userPayload: Object.freeze({
                userId: userId,
                userUUID: user.uuid,
                nickName: user.name,
            }),
        }});
    }

    private onGoBack = (): void => {
        this.setState({redirectPath: "/"});
    }

    private onGoReplay = (uuid: string, slice?: string): void => {
        this.setState({redirectPath: `/replay/${uuid}/${this.props.match.params.userId}/`});
    }

    public render(): React.ReactNode {
        if (this.state.redirectPath) {
            return <Redirect to={this.state.redirectPath}/>;

        } else if (this.state.connectFailed) {
            return <PageError/>;

        } else if (!this.state.roomInfo) {
            return <LoadingPage/>;

        } else {
            return (
                <RealtimeRoomPage uuid={this.props.match.params.uuid}
                                  roomToken={this.state.roomInfo.roomToken}
                                  userPayload={this.state.roomInfo.userPayload}
                                  sdk={whiteWebSdk}
                                  ossOptions={ossOptions}
                                  callbacks={{
                                      onGoBack: this.onGoBack,
                                      onGoReplay: this.onGoReplay,
                                  }}/>
            );
        }
    }
}
