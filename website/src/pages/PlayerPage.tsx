import * as React from "react";

import {message} from "antd";
import {LoadingPage, ReplayerPage} from "netless-whiteboard-room";
import {RouteComponentProps} from "react-router";
import {WhiteWebSdk} from "white-react-sdk";
import {Redirect} from "@netless/i18n-react-router";
import {netlessWhiteboardApi} from "../apiMiddleware";
import PageError from "./PageError";

export type PlayerPageProps = RouteComponentProps<{
   readonly uuid: string;
   readonly userId: string;
}>;

export type PlayerPageState = {
    readonly roomToken?: string;
    readonly redirectPath?: string;
    readonly fetchTokenFailed: boolean;
};

export default class PlayerPage extends React.Component<PlayerPageProps, PlayerPageState> {

    private static readonly sdk: WhiteWebSdk = new WhiteWebSdk();

    private readonly userId: string;

    public constructor(props: PlayerPageProps) {
        super(props);
        this.userId = this.props.match.params.userId;
        this.state = {fetchTokenFailed: false};
    }

    public componentWillMount(): void {
        this.replayRoom().catch(error => {
            message.error("回放房间失败：" + error.message);
            console.error(error);
            this.setState({fetchTokenFailed: true});
        });
    }

    private async replayRoom(): Promise<void> {
        const uuid = this.props.match.params.uuid;
        const response = await netlessWhiteboardApi.room.joinRoomApi(uuid);

        if (response.code !== 200) {
            throw new Error("join room failed");
        }
        const roomToken = response.msg.roomToken;

        this.setState({roomToken});
    }

    private onGoBack = (): void => {
        this.setState({redirectPath: "/"});
    }

    private onGoToRealtimeRoom = (uuid: string): void => {
        this.setState({redirectPath: `/whiteboard/${uuid}/${this.userId}/`});
    }

    public render(): React.ReactNode {
        if (this.state.redirectPath) {
            return <Redirect to={this.state.redirectPath}/>;

        } else if (this.state.fetchTokenFailed) {
            return <PageError/>;

        } else if (this.state.roomToken === undefined) {
            return <LoadingPage/>;

        } else {
            return <ReplayerPage uuid={this.props.match.params.uuid}
                                 roomToken={this.state.roomToken}
                                 sdk={PlayerPage.sdk}
                                 callbacks={{
                                     onGoBack: this.onGoBack,
                                     onGoToRealtimeRoom: this.onGoToRealtimeRoom,
                                 }}/>;
        }
    }
}
