import * as React from "react";

import CloseIcon from "../assets/image/close.svg";
import AddIcon from "../assets/image/add_icon.svg";

import TweenOne from "rc-tween-one";
import {Room, RoomState, Scene} from "white-react-sdk";
import {IAnimObject} from "rc-tween-one/typings/AnimObject";

export type MenuAnnexBoxState = {
    readonly isFocus: boolean,
};

export type MenuAnnexBoxProps = {
    readonly room: Room;
    readonly roomState: RoomState;
    readonly handleAnnexBoxMenuState: () => void;
    readonly isMenuOpen: boolean;
};

export default class MenuAnnexBox extends React.Component<MenuAnnexBoxProps, MenuAnnexBoxState> {

    private ref: HTMLDivElement | null = null;

    public constructor(props: MenuAnnexBoxProps) {
        super(props);
        this.state = {
            isFocus: false,
        };
    }

    public componentDidMount(): void {
        document.body.addEventListener("keydown", this.onArrowControllerHotKey);
    }

    public componentWillUnmount(): void {
        document.body.removeEventListener("keydown", this.onArrowControllerHotKey);
    }

    private onArrowControllerHotKey = (evt: KeyboardEvent): void => {
    }

    private onChangeActiveScene = (newActiveIndex: number) => {
        const {room} = this.props;
        room.setSceneIndex(newActiveIndex);
    }

    private onRemoveScene = (index: number): void => {
        const {room} = this.props;
        const scenes = room.state.sceneState.scenes;
        const scenePath = room.state.sceneState.scenePath;
        const directory = MenuAnnexBox.getDirectory(scenePath);

        room.removeScenes(`${directory}/${scenes[index].name}`);
    }

    private onInsertNewScene(activeIndex: number): void {
        const {room, roomState} = this.props;
        const newSceneIndex = activeIndex + 1;
        const scenePath = roomState.sceneState.scenePath;
        const directory = MenuAnnexBox.getDirectory(scenePath);

        room.putScenes(`${directory}/`, [{}], newSceneIndex);
        room.setSceneIndex(newSceneIndex);
    }

    private static getDirectory(path: string): string {
        return path.replace(/\/\w+$/, "");
    }

    public render(): React.ReactNode {
        const {roomState} = this.props;
        const sceneDirCells = roomState.sceneState.scenePath.split("/");

        sceneDirCells.pop();

        const scenes = roomState.sceneState.scenes;
        const activeIndex = roomState.sceneState.index;
        const sceneDir = sceneDirCells.join("/");

        return (
            <div className="menu-annex-box"
                 ref={ref => this.ref = ref}>

                <div className="menu-title-line">
                    <div className="menu-title-text-box">PPT</div>
                    <div className="menu-close-btn" onClick={this.props.handleAnnexBoxMenuState}>
                        <img className="menu-title-close-icon" src={CloseIcon}/>
                    </div>
                </div>
                <div style={{height: 42}}/>

                {scenes.map((scene, index) => (
                    <Page key={scene.name}
                          room={this.props.room}
                          sceneDir={sceneDir}
                          scene={scene}
                          index={index}
                          isActive={index === activeIndex}
                          isMenuOpen={this.props.isMenuOpen}
                          onFocusChanged={isFocus => this.setState({isFocus})}
                          onSceneChanged={this.onChangeActiveScene}
                          onSceneRemoved={this.onRemoveScene}/>
                ))}
                <div style={{height: 42}}/>
                <div className="menu-under-btn">
                    <div className="menu-under-btn-inner"
                         onClick={() => this.onInsertNewScene(activeIndex)}>
                        <img src={AddIcon}/>
                        <div>add page</div>
                    </div>
                </div>
            </div>
        );
    }
}

type PageProps = {
    readonly room: Room;
    readonly scene: Scene;
    readonly sceneDir: string;
    readonly index: number;
    readonly isActive: boolean;
    readonly isMenuOpen: boolean;
    readonly onFocusChanged: (isFocus: boolean) => void;
    readonly onSceneChanged: (sceneIndex: number) => void;
    readonly onSceneRemoved: (sceneIndex: number) => void;
};

type PageState = {
    readonly isHover: boolean;
};

class Page extends React.Component<PageProps, PageState> {

    public constructor(props: PageProps) {
        super(props);
        this.state = {
            isHover: false,
        };
    }

    public render(): React.ReactNode {
        const {scene, index, isActive} = this.props;
        return (
            <div className={isActive ? "page-out-box-active" : "page-out-box"}
                 key={`${scene.name}${index}`}
                 onMouseEnter={() => this.setState({isHover: true})}
                 onMouseLeave={() => this.setState({isHover: false})}>

                <div className="page-box-inner-index-left">
                    {index + 1}
                </div>
                <div className="page-mid-box"
                     onFocus={() => this.props.onFocusChanged(true)}
                     onBlur={() => this.props.onFocusChanged(false)}
                     onClick={() => this.props.onSceneChanged(index)}>

                    <div className="page-box">
                        <PageImage isActive={isActive}
                                   isMenuOpen={this.props.isMenuOpen}
                                   scene={scene}
                                   room={this.props.room}
                                   path={`${this.props.sceneDir}/${scene.name}`}/>
                    </div>
                </div>
                <div className="page-box-inner-index-delete-box">
                    {this.state.isHover && this.renderRemoveButton()}
                </div>
            </div>

        );
    }

    private renderRemoveButton(): React.ReactNode {
        const animations: IAnimObject[] = [{
            scale: 1,
            duration: 200,
            ease: "easeInOutQuart",
        }];
        return (
            <TweenOne className="page-box-inner-index-delete"
                      animation={animations}
                      style={{transform: "scale(0)"}}
                      onClick={() => this.props.onSceneRemoved(this.props.index)}>
                <img className="menu-title-close-icon" src={CloseIcon}/>
            </TweenOne>
        );
    }
}

type PageImageProps = { scene: Scene, path: string, room: Room, isMenuOpen: boolean, isActive: boolean};

class PageImage extends React.Component<PageImageProps, {}> {

    private ref?: HTMLDivElement | null;

    public componentWillReceiveProps(nextProps: PageImageProps): void {
        const ref = this.ref;
        if (nextProps.isMenuOpen !== this.props.isMenuOpen && nextProps.isMenuOpen && ref) {
            this.props.room.scenePreview(this.props.path, ref, 192, 112.5);
        }
    }

    private setupDivRef = (ref: HTMLDivElement | null) => {
        if (ref) {
            this.ref = ref;
            this.props.room.scenePreview(this.props.path, ref, 192, 112.5);
        }
    }

    public render(): React.ReactNode {
        return <div className="ppt-image" ref={this.setupDivRef}/>;
    }
}
