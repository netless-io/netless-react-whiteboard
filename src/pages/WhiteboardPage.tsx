import * as React from "react";
import * as OSS from "ali-oss";
import * as uuidv4 from "uuid/v4";

import "./WhiteboardPage.less";

import * as LikeIcon from "../assets/image/like.svg";
import * as LoadingIcon from "../assets/image/loading.svg";
import * as ArrowIcon from "../assets/image/arrow.svg";

import TweenOne from "rc-tween-one";
import Dropzone from "react-dropzone";
import TopLoadingBar from "@netless/react-loading-bar";
import ToolBox from "@netless/react-tool-box";

import PageError from "./PageError";
import MenuHotKey from "../components/menu/MenuHotKey";
import MenuBox from "../components/menu/MenuBox";
import MenuAnnexBox from "../components/menu/MenuAnnexBox";
import MenuPPTDoc from "../components/menu/MenuPPTDoc";
import UploadBtn from "../tools/UploadBtn";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";
import WhiteboardTopRight from "../components/whiteboard/WhiteboardTopRight";
import WhiteboardBottomLeft from "../components/whiteboard/WhiteboardBottomLeft";
import WhiteboardBottomRight from "../components/whiteboard/WhiteboardBottomRight";

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
import {RouteComponentProps} from "react-router";
import {IAnimObject} from "rc-tween-one/typings/AnimObject";
import {netlessToken, ossConfigObj} from "../appToken";
import {UserCursor} from "../components/whiteboard/UserCursor";
import {netlessWhiteboardApi, UserInfType} from "../apiMiddleware";

function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export enum MenuInnerType {
    HotKey = "HotKey",
    AnnexBox = "AnnexBox",
    PPTBox = "PPTBox",
    DocSet = "DocSet",
}

export type WhiteboardPageProps = RouteComponentProps<{
    readonly uuid: string;
    readonly userId: string;
}>;

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
    readonly room?: Room;
    readonly roomState?: RoomState;
    readonly pptConverter?: PptConverter;
    readonly isMenuLeft?: boolean;
    readonly progressDescription?: string,
    readonly fileUrl?: string,
    readonly whiteboardLayerDownRef?: HTMLDivElement;
};

class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {

    private readonly cursor: UserCursor;
    private didLeavePage: boolean = false;

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
       this.cursor = new UserCursor();
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }

    private startJoinRoom = async (): Promise<void> => {
        const uuid = this.props.match.params.uuid;
        const userId = this.props.match.params.userId;

        this.setState({userId: userId});

        const roomToken = await this.getRoomToken(uuid);

        if (netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${userId}`) === `Netless uuid ${userId}`) {
            const userUuid = uuidv4();
            netlessWhiteboardApi.user.updateUserInf(userUuid, userUuid, userId);
        }
        const userUuid = netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${userId}`);
        const name = netlessWhiteboardApi.user.getUserInf(UserInfType.name, `${userId}`);

        if (roomToken && uuid) {
            const whiteWebSdk = new WhiteWebSdk();
            const pptConverter = whiteWebSdk.pptConverter(netlessToken.sdkToken);

            this.setState({pptConverter: pptConverter});

            const roomParams: JoinRoomParams = {
                uuid: uuid,
                roomToken: roomToken,
                cursorAdapter: this.cursor,
                userPayload: {id: userId, userId: userUuid, nickName: name, avatar: userUuid},
            };
            const room = await whiteWebSdk.joinRoom(roomParams, {
                onPhaseChanged: phase => {
                    if (!this.didLeavePage) {
                        this.setState({phase});
                    }
                    console.log(`room ${this.props.match.params.uuid} changed: ${phase}`);
                },
                onDisconnectWithError: error => {
                    console.error(error);
                },
                onKickedWithReason: reason => {
                    console.error("kicked with reason: " + reason);
                },
                onRoomStateChanged: modifyState => {
                    if (modifyState.roomMembers) {
                        this.cursor.setColorAndAppliance(modifyState.roomMembers);
                    }
                    this.setState({
                        roomState: {...this.state.roomState, ...modifyState} as RoomState,
                    });
                },
            });
            room.addMagixEventListener("handclap", async () => {
                this.setState({isHandClap: true});
                await sleep(800);
                this.setState({isHandClap: false});
            });
            this.setState({room: room, roomState: room.state, roomToken: roomToken});

        } else {
            message.error("join fail");
        }
    }

    private onWindowResize = (): void => {
        if (this.state.room) {
            this.state.room.refreshViewSize();
        }
    }

    public componentWillMount(): void {
        document.body.style.overflow = "hidden";
        window.addEventListener("resize", this.onWindowResize);
    }

    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
        if (this.state.room && this.state.room.state.roomMembers) {
            this.cursor.setColorAndAppliance(this.state.room.state.roomMembers);
        }
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
        window.removeEventListener("resize", this.onWindowResize);
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
            return <PageError/>;

        } else if (this.state.phase === RoomPhase.Connecting ||
            this.state.phase === RoomPhase.Disconnecting) {
            return (
                <div className="white-board-loading">
                    <img src={LoadingIcon}/>
                </div>
            );
        } else if (!this.state.room) {
            return (
                <div className="white-board-loading">
                    <img src={LoadingIcon}/>
                </div>
            );
        } else if (!this.state.roomState) {
            return (
                <div className="white-board-loading">
                    <img src={LoadingIcon}/>
                </div>
            );
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

export default WhiteboardPage;
