import * as React from "react";

import HomeIcon from "../assets/image/home.svg";
import BoardIcon from "../assets/image/board.svg";
import LikeIcon from "../assets/image/like.svg";

import message from "antd/lib/message";
import Identicon from "react-identicons";
import TweenOne from "rc-tween-one";

import {Player, PlayerPhase} from "white-web-sdk";
import {PlayerWhiteboard} from "white-react-sdk";
import {IAnimObject} from "rc-tween-one/typings/AnimObject";
import {MessageType} from "../realtime/RealtimeRoomBottomRight";
import {ReplayerPageCallbacks} from "./ReplayerPage";
import {PlayerProgressBar} from "./PlayerProgressBar";

function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export type ReplayerProps = {
    readonly player: Player;
    readonly phase: PlayerPhase;
    readonly currentTime: number;
    readonly onChangeCurrentTime: (time: number) => void;
    readonly callbacks: ReplayerPageCallbacks;
};

export type ReplayerState = {
    readonly isHandClap: boolean;
    readonly messages:  MessageType[];
};

export default class Replayer extends React.Component<ReplayerProps, ReplayerState> {

    private readonly player: Player;
    private readonly callbacks: ReplayerPageCallbacks;

    public constructor(props: ReplayerProps) {
        super(props);
        this.state = {
            isHandClap: false,
            messages: [],
        };
        this.player = props.player;
        this.callbacks = props.callbacks;
        this.player.addMagixEventListener("handclap", async () => {
            this.setState({isHandClap: true});
            await sleep(800);
            this.setState({isHandClap: false});
        });
        this.player.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }

    public componentWillMount(): void {
        window.addEventListener("resize", this.onWindowResize);
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.onWindowResize);
    }

    private onWindowResize = (): void => {
        this.props.player.refreshViewSize();
    }

    public render(): React.ReactNode {
        return (
            <div className="player-out-box">
                {this.renderTopBar()}
                {this.props.player && (
                    <PlayerProgressBar player={this.props.player}
                                       phase={this.props.phase}
                                       currentTime={this.props.currentTime}
                                       messages={this.state.messages}
                                       onChangeCurrentTime={this.props.onChangeCurrentTime}/>
                )}
                {this.state.isHandClap && this.renderHandClap()}

                <PlayerWhiteboard className="player-box" player={this.player}/>
            </div>
        );
    }

    private renderTopBar(): React.ReactNode {
        return (
            <div className="player-nav-box"
                 style={{display: "flex"}}>
                <div className="player-nav-left-box">
                    <div className="player-nav-left">
                        <div className="player-nav-icon-box-left"
                             onClick={() => {
                                 if (this.callbacks.onGoBack) {
                                     this.callbacks.onGoBack();
                                 }
                             }}>
                            <img src={HomeIcon}/>
                        </div>
                        <div className="player-nav-icon-box-right"
                             onClick={() => {
                                 if (this.callbacks.onGoToRealtimeRoom) {
                                     this.callbacks.onGoToRealtimeRoom(this.player.roomUUID);
                                 }
                             }}>
                            <img src={BoardIcon}/>
                        </div>
                    </div>
                </div>
                <div className="player-nav-right">
                    <Identicon size={36} string={""}/>
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
