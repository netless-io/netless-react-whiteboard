import * as React from "react";

import PageError from "./PageError";

import {parse} from "query-string";
import {Redirect} from "@netless/i18n-react-router";
import {RouteComponentProps} from "react-router";
import {netlessWhiteboardApi, RoomType} from "../apiMiddleware";

export type WhiteboardCreatorPageProps = RouteComponentProps<{
    readonly uuid?: string;
}>;

export type WhiteboardCreatorPageState = {
    readonly foundError: boolean;
    readonly roomUUID?: string;
};

class WhiteboardCreatorPage extends React.Component<WhiteboardCreatorPageProps, WhiteboardCreatorPageState> {

    private readonly userId: string;

    public constructor(props: WhiteboardCreatorPageProps) {
        super(props);
        this.state = {
            foundError: false,
            roomUUID: props.match.params.uuid,
        };
        const {userId} = parse(props.location.search);

        if (typeof userId !== "string") {
            this.userId = netlessWhiteboardApi.user.createUser().userId;
        } else {
            this.userId = userId;
        }
    }

    public async componentWillMount(): Promise<void> {
        if (this.state.roomUUID === undefined) {
            const limit = 0;
            const mode = RoomType.historied;
            const response = await netlessWhiteboardApi.room.createRoomApi("test1", limit, mode);

            if (response.code === 200) {
                this.setState({roomUUID: response.msg.room.uuid});
            } else {
                this.setState({foundError: true});
            }
        }
    }

    public render(): React.ReactNode {
        if (this.state.foundError) {
            return <PageError/>;
        } else if (this.state.roomUUID) {
            return <Redirect to={`/whiteboard/${this.state.roomUUID}/${this.userId}/`}/>;
        }
        return null;
    }
}

export default WhiteboardCreatorPage;
