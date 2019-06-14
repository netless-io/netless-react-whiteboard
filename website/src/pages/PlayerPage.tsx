import * as React from "react";

import "./PlayerPage.less";

import * as LoadingIcon from "../assets/image/loading.svg";
import * as HomeIcon from "../assets/image/home.svg";
import * as BoardIcon from "../assets/image/board.svg";
import * as LikeIcon from "../assets/image/like.svg";

import Identicon from "react-identicons";
import TweenOne from "rc-tween-one";

import {message} from "antd";
import {RouteComponentProps} from "react-router";
import {WhiteWebSdk, PlayerWhiteboard, PlayerPhase, Player, ReplayRoomParams} from "white-react-sdk";
import {push} from "@netless/i18n-react-router";
import {UserCursor} from "../components/whiteboard/UserCursor";
import {netlessWhiteboardApi} from "../apiMiddleware";
import {PlayerProgressBar} from "../components/player/PlayerProgressBar";
import {IAnimObject} from "rc-tween-one/typings/AnimObject";
import {MessageType} from "../components/whiteboard/WhiteboardChat";

function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export type PlayerPageProps = RouteComponentProps<{
   readonly uuid: string;
   readonly userId: string;
}>;

export type PlayerPageState = {
    readonly player: Player | null;
    readonly phase: PlayerPhase;
    readonly currentTime: number;
    readonly isFullScreen: boolean;
    readonly isFirstScreenReady: boolean;
    readonly isHandClap: boolean;
    readonly messages: MessageType[];
};

export default class PlayerPage extends React.Component<PlayerPageProps, PlayerPageState> {

    private readonly cursor: any;

    public constructor(props: PlayerPageProps) {
        super(props);
        this.cursor = new UserCursor();
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isFullScreen: false,
            isFirstScreenReady: false,
            isHandClap: false,
            player: null,
            messages: [],
        };
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }

    public async componentDidMount(): Promise<void> {
        const uuid = this.props.match.params.uuid;
        const whiteWebSdk = new WhiteWebSdk();
        const roomToken = await this.getRoomToken(uuid);

        if (uuid && roomToken) {
            const playerParams: ReplayRoomParams = {
                room: uuid,
                roomToken: roomToken,
                cursorAdapter: this.cursor,
            };
            const player = await whiteWebSdk.replayRoom(playerParams, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                },
                onLoadFirstFrame: () => {
                    this.setState({isFirstScreenReady: true});
                    if (player.state.roomMembers) {
                        this.cursor.setColorAndAppliance(player.state.roomMembers);
                    }
                },
                onPlayerStateChanged: modifyState => {
                    if (modifyState.roomMembers) {
                        this.cursor.setColorAndAppliance(modifyState.roomMembers);
                    }
                },
                onStoppedWithError: error => {
                  message.error("Playback error");
                },
                onScheduleTimeChanged: scheduleTime => {
                    this.setState({currentTime: scheduleTime});
                },
            });
            this.setState({player});

            player.addMagixEventListener("handclap", async () => {
                this.setState({isHandClap: true});
                await sleep(800);
                this.setState({isHandClap: false});
            });
            player.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
        }
    }
    private onWindowResize = (): void => {
        if (this.state.player) {
            this.state.player.refreshViewSize();
        }
    }

    public componentWillMount(): void {
        window.addEventListener("resize", this.onWindowResize);
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.onWindowResize);
    }

    public render(): React.ReactNode {
        if (!this.state.player) {
            return (
                <div className="white-board-loading">
                    <img src={LoadingIcon}/>
                </div>
            );
        } else if (this.state.phase === PlayerPhase.WaitingFirstFrame) {
            return (
                <div className="white-board-loading">
                    <img src={LoadingIcon}/>
                </div>
            );
        } else {
            return (
                <div className="player-out-box">
                    {this.renderTopBar()}
                    {this.state.player && (
                        <PlayerProgressBar player={this.state.player}
                                           phase={this.state.phase}
                                           userId={this.props.match.params.userId}
                                           currentTime={this.state.currentTime}
                                           messages={this.state.messages}
                                           onChangeCurrentTime={currentTime => this.setState({currentTime})}/>
                    )}
                    {this.state.isHandClap && this.renderHandClap()}

                    <PlayerWhiteboard className="player-box" player={this.state.player}/>
                </div>
            );
        }
    }

    private renderTopBar(): React.ReactNode {
        const user = netlessWhiteboardApi.user.getUser(`${parseInt(this.props.match.params.userId)}`)!;
        return (
            <div className="player-nav-box"
                 style={{display: "flex"}}>
                <div className="player-nav-left-box">
                    <div className="player-nav-left">
                        <div className="player-nav-icon-box-left"
                             onClick={() => push(this.props.history, "/")}>
                            <img src={HomeIcon}/>
                        </div>
                        <div className="player-nav-icon-box-right"
                             onClick={() => push(this.props.history, `/whiteboard/${this.props.match.params.uuid}/${this.props.match.params.userId}/`)}>
                            <img src={BoardIcon}/>
                        </div>
                    </div>
                </div>
                <div className="player-nav-right">
                    <Identicon size={36} string={user.uuid}/>
                </div>
            </div>
        );
    }

    private renderHandClap(): React.ReactNode {
        const animations: IAnimObject[] = [{
            scale: 1,
            duration: 360,
            ease: "easeInOutQuart",
        }, {
            opacity: 0,
            scale: 2,
            ease: "easeInOutQuart",
            duration: 400,
        }];
        const style: React.CSSProperties = {
            transform: "scale(0)",
            borderTopLeftRadius: 4,
        };
        return (
            <div className="whiteboard-box-gift-box">
                <TweenOne className="whiteboard-box-gift-inner-box"
                          animation={animations}
                          style={style}>
                    <img src={LikeIcon}/>
                </TweenOne>
            </div>
        );
    }
}
