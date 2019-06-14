import * as React from "react";
import * as OSS from "ali-oss";

import "./RealtimeRoom.less";

import LikeIcon from "../assets/image/like.svg";
import ArrowIcon from "../assets/image/arrow.svg";

import TweenOne from "rc-tween-one";
import Dropzone from "react-dropzone";
import TopLoadingBar from "@netless/react-loading-bar";
import ToolBox from "@netless/react-tool-box";

import MenuHotKey from "./MenuHotKey";
import MenuBox from "./MenuBox";
import MenuAnnexBox from "./MenuAnnexBox";
import MenuPPTDoc from "./MenuPPTDoc";
import UploadBtn from "./UploadBtn";

import WhiteboardTopLeft from "./WhiteboardTopLeft";
import WhiteboardTopRight from "./WhiteboardTopRight";
import WhiteboardBottomLeft from "./WhiteboardBottomLeft";
import WhiteboardBottomRight from "./WhiteboardBottomRight";

import {
    WhiteWebSdk,
    RoomWhiteboard,
    Room,
    RoomState,
    RoomPhase,
    PptConverter,
    MemberState,
    ViewMode,
    JoinRoomParams,
} from "white-react-sdk";

import {message} from "antd";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import {IAnimObject} from "rc-tween-one/typings/AnimObject";
import {UserCursor} from "../components/UserCursor";

function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export enum MenuInnerType {
    HotKey = "HotKey",
    AnnexBox = "AnnexBox",
    PPTBox = "PPTBox",
    DocSet = "DocSet",
}

export type WhiteboardPageProps = {
    readonly room: Room;
    readonly phase: RoomPhase;
    readonly roomState: RoomState;
};

export type WhiteboardPageState = {
    readonly phase: RoomPhase;
    readonly connectedFail: boolean;
    readonly didSlaveConnected: boolean;
    readonly isHandClap: boolean;
    readonly menuInnerState: MenuInnerType;
    readonly isMenuVisible: boolean;
    readonly roomToken: string | null;
    readonly ossPercent: number;
    readonly converterPercent: number;
    readonly userId: string;
    readonly isMenuOpen: boolean;
    readonly isMenuLeft?: boolean;
    readonly progressDescription?: string,
    readonly fileUrl?: string,
    readonly whiteboardLayerDownRef?: HTMLDivElement;
};

export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {

    private readonly room: Room;

    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            connectedFail: false,
            didSlaveConnected: false,
            isHandClap: false,
            menuInnerState: MenuInnerType.HotKey,
            isMenuVisible: false,
            roomToken: null,
            ossPercent: 0,
            converterPercent: 0,
            userId: "",
            isMenuOpen: false,
        };
        this.room = props.room;
        this.room.addMagixEventListener("handclap", async () => {
            this.setState({isHandClap: true});
            await sleep(800);
            this.setState({isHandClap: false});
        });
    }

    public componentWillMount(): void {
        window.addEventListener("resize", this.onWindowResize);
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.onWindowResize);
    }

    private onWindowResize = (): void => {
        this.room.refreshViewSize();
    }

    private renderMenuInner = (): React.ReactNode => {
        switch (this.state.menuInnerState) {
            case MenuInnerType.HotKey: {
                return (
                    <MenuHotKey handleHotKeyMenuState={this.handleHotKeyMenuState}/>
                );
            }
            case MenuInnerType.AnnexBox: {
                return (
                    <MenuAnnexBox isMenuOpen={this.state.isMenuOpen}
                                  room={this.state.room!}
                                  roomState={this.state.roomState!}
                                  handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}/>
                );
            }
            case MenuInnerType.PPTBox: {
                return (
                    <MenuPPTDoc room={this.state.room!}/>
                );
            }
            default: {
                return null;
            }
        }
    }

    private setWhiteboardLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }

    private handleHotKeyMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.HotKey,
            isMenuLeft: false,
        });
    }

    private handleAnnexBoxMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.AnnexBox,
            isMenuLeft: false,
        });
    }

    private handlePPtBoxMenuState = (): void => {
        if (this.state.isMenuVisible) {
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
            });
        } else {
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
                menuInnerState: MenuInnerType.PPTBox,
                isMenuLeft: true,
            });
        }
    }

    private resetMenu = () => {
        this.setState({
            isMenuVisible: false,
            isMenuLeft: false,
        });
    }

    private isImageType = (type: string): boolean => {
        return type === "image/jpeg" || type === "image/png";
    }

    private onDropFiles = async (acceptedFiles: File[], rejectedFiles: File[],
                                 event: React.DragEvent<HTMLDivElement>): Promise<void> => {
        event.persist();
        try {
            const imageFiles = acceptedFiles.filter(file => this.isImageType(file.type));
            const client = new OSS({
                accessKeyId: ossConfigObj.accessKeyId,
                accessKeySecret: ossConfigObj.accessKeySecret,
                region: ossConfigObj.region,
                bucket: ossConfigObj.bucket,
            });
            const uploadManager = new UploadManager(client, this.state.room!);
            await Promise.all([
                uploadManager.uploadImageFiles(imageFiles, event.clientX, event.clientY),
            ]);
        } catch (error) {
            this.state.room!.setMemberState({
                currentApplianceName: "selector",
            });
        }
    }

    private setMemberState = (modifyState: Partial<MemberState>) => {
        this.state.room!.setMemberState(modifyState);
    }

    private progress = (phase: PPTProgressPhase, percent: number): void => {
        message.config({
            maxCount: 1,
        });
        switch (phase) {
            case PPTProgressPhase.Uploading: {
                this.setState({ossPercent: percent * 100});
                break;
            }
            case PPTProgressPhase.Converting: {
                this.setState({converterPercent: percent * 100});
                break;
            }
        }
    }

    private setMenuState = (state: boolean) => {
        this.setState({isMenuOpen: state});
    }

    public render(): React.ReactNode {

        if (this.state.connectedFail) {
            return null;

        } else if (this.state.phase === RoomPhase.Connecting ||
            this.state.phase === RoomPhase.Disconnecting) {
            return null;
        } else if (!this.state.room) {
            return null;
        } else if (!this.state.roomState) {
            return null;
        } else {
            return (
                <div id="outer-container">
                    <MenuBox setMenuState={this.setMenuState}
                             resetMenu={this.resetMenu}
                             pageWrapId={"page-wrap" }
                             outerContainerId={ "outer-container" }
                             isLeft={this.state.isMenuLeft}
                             isVisible={this.state.isMenuVisible}
                             menuInnerState={this.state.menuInnerState}>
                        {this.renderMenuInner()}
                    </MenuBox>
                    {this.renderPageWrapper(this.state.room, this.state.roomState)}
                </div>
            );
        }
    }

    private renderPageWrapper(room: Room, roomState: RoomState): React.ReactNode {
        return (
            <div style={{backgroundColor: "white"}} id="page-wrap">
                <Dropzone accept={"image/*"}
                          disableClick={true}
                          onDrop={this.onDropFiles}
                          className="whiteboard-drop-upload-box">

                    <TopLoadingBar loadingPercent={this.state.ossPercent}/>
                    <TopLoadingBar style={{backgroundColor: "red"}} loadingPercent={this.state.converterPercent}/>

                    <div className="whiteboard-out-box">
                        {this.renderClipView()}
                        {this.renderRoundOperationViews(room, roomState)}
                        {this.renderToolsBar(room, roomState)}

                        <div onClick={this.handlePPtBoxMenuState}
                             className={(this.state.menuInnerState === MenuInnerType.PPTBox && this.state.isMenuVisible) ? "slide-box-active" : "slide-box"}>
                            <img src={ArrowIcon}/>
                        </div>
                        <div className="whiteboard-tool-layer-down" ref={this.setWhiteboardLayerDownRef}>
                            {this.renderWhiteboard()}
                        </div>
                    </div>
                </Dropzone>
            </div>
        );
    }

    private renderRoundOperationViews(room: Room, roomState: RoomState): React.ReactNode {
        return (
            <React.Fragment>
                <WhiteboardTopLeft room={room}/>
                <WhiteboardTopRight room={room}
                                    roomState={roomState}
                                    uuid={this.props.match.params.uuid}
                                    number={this.state.userId}/>
                <WhiteboardBottomLeft room={room}
                                      roomState={roomState}
                                      uuid={this.props.match.params.uuid}
                                      userId={this.state.userId}/>
                <WhiteboardBottomRight room={room}
                                       roomState={roomState}
                                       userId={this.state.userId}
                                       handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                       handleHotKeyMenuState={this.handleHotKeyMenuState}/>
            </React.Fragment>
        );
    }

    private renderToolsBar(room: Room, roomState: RoomState): React.ReactNode {
        return (
            <div className={roomState.broadcastState.mode === ViewMode.Follower ? "whiteboard-tool-box-disable" : "whiteboard-tool-box"}>
                <ToolBox setMemberState={this.setMemberState}
                         memberState={room.state.memberState}
                         customerComponent={[
                             <UploadBtn
                                 oss={ossConfigObj}
                                 room={room}
                                 roomToken={this.state.roomToken}
                                 onProgress={this.progress}
                                 whiteboardRef={this.state.whiteboardLayerDownRef}
                             />,
                         ]}/>
            </div>
        );
    }

    private renderClipView = (): React.ReactNode => {
        if (this.state.isHandClap) {
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
                    <TweenOne animation={animations} style={style} className="whiteboard-box-gift-inner-box">
                        <img src={LikeIcon}/>
                    </TweenOne>
                </div>
            );
        } else {
            return null;
        }
    }

    private renderWhiteboard(): React.ReactNode {
        if (this.state.room) {
            return <RoomWhiteboard room={this.state.room}
                                   style={{width: "100%", height: "100vh"}}/>;
        } else {
            return null;
        }
    }
}
