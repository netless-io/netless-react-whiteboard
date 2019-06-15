import * as React from "react";

import SelectorIcon from "../assets/image/hotkey/selector.svg";
import PencilIcon from "../assets/image/hotkey/pencil.svg";
import TextIcon from "../assets/image/hotkey/text.svg";
import EraserIcon from "../assets/image/hotkey/eraser.svg";
import EllipseIcon from "../assets/image/hotkey/ellipse.svg";
import HandIcon from "../assets/image/hotkey/hand.svg";
import RectangleIcon from "../assets/image/hotkey/rectangle.svg";
import UpCursorIcon from "../assets/image/up_cursor.svg";
import DownCursorIcon from "../assets/image/down_cursor.svg";
import CloseIcon from "../assets/image/close.svg";

type toolsInnerType = {
    readonly icon: string,
    readonly toolName: string,
    readonly hotKey: string,
};

type toolsOtherHotKeyType = {
    readonly type: string,
    readonly inner: any,
};

type toolsOtherType = {
    readonly actionName: string,
    readonly needPlusIcon: boolean,
    readonly hotKey: [toolsOtherHotKeyType],
};

export type MenuHotKeyProps = {
    readonly handleHotKeyMenuState: () => void;
};

export default class MenuHotKey extends React.Component<MenuHotKeyProps, {}> {

    public constructor(props: MenuHotKeyProps) {
        super(props);
        this.state = {};
        this.renderPlusIcon = this.renderPlusIcon.bind(this);
    }

    public render(): React.ReactNode {
        const MenuHotKeyDoc = {
            tools: {
                name: "工具",
                inner: [
                    {
                        icon: SelectorIcon,
                        toolName: "选择工具",
                        hotKey: "V",
                    },
                    {
                        icon: PencilIcon,
                        toolName: "铅笔",
                        hotKey: "P",
                    },
                    {
                        icon: TextIcon,
                        toolName: "文字",
                        hotKey: "T",
                    },
                    {
                        icon: EraserIcon,
                        toolName: "橡皮",
                        hotKey: "E",
                    },
                    {
                        icon: EllipseIcon,
                        toolName: "椭圆",
                        hotKey: "O",
                    },
                    {
                        icon: RectangleIcon,
                        toolName: "矩形",
                        hotKey: "R",
                    },
                ],
            },
            others: {
                name: "其他",
                inner: [
                    {
                        actionName: "切换页面",
                        needPlusIcon: false,
                        hotKey: [
                            {
                                type: "img",
                                inner: UpCursorIcon,
                            },
                            {
                                type: "img",
                                inner: DownCursorIcon,
                            },
                        ],
                    },
                    {
                        actionName: "移动画布",
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: "空格键",
                            },
                            {
                                type: "mixing",
                                inner: {
                                    img: HandIcon,
                                    text: "拖动",
                                },
                            },
                        ],
                    },
                    {
                        actionName: "放大画布",
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: "Ctrl",
                            },
                            {
                                type: "font",
                                inner: "+",
                            },
                        ],
                    },
                    {
                        actionName: "缩小画布",
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: "Ctrl",
                            },
                            {
                                type: "font",
                                inner: "-",
                            },
                        ],
                    },
                ],
            },
        };
        let menuHotKeyDocToolArray;
        let menuHotKeyDocOtherArray;

        menuHotKeyDocToolArray = MenuHotKeyDoc.tools.inner.map((data: toolsInnerType, index: number) => {
            return (
                <div className="menu-tool-box" key={`${index}`}>
                    <div className="menu-tool-box-left">
                        <div className="menu-tool-box-icon-box">
                            <img className="menu-tool-box-icon" src={data.icon}/>
                        </div>
                        <div className="menu-tool-box-name">{data.toolName}</div>
                    </div>
                    <div className="menu-tool-box-right">{data.hotKey}</div>
                </div>
            );
        });
        menuHotKeyDocOtherArray = MenuHotKeyDoc.others.inner.map((data: toolsOtherType, index: number) => {
            const hotKeyArray = data.hotKey.map((subData: toolsOtherHotKeyType, index: number) => {
                const isLast: boolean = (index + 1) === data.hotKey.length;
                const isAlphabet: boolean = subData.inner.length === 1;
                if (subData.type === "img") {
                    return (
                        <div className="menu-other-hot-out-box" key={`${index}`}>
                            <div className="menu-other-hot-box" style={{marginRight: isLast ? 0 : 5}}>
                                <img src={subData.inner}/>
                            </div>
                            {this.renderPlusIcon(isLast, data.needPlusIcon)}
                        </div>
                    );
                } else if (subData.type === "font") {
                    return (
                        <div className="menu-other-hot-out-box" key={`${index}`}>
                            <div className={isAlphabet ? "menu-other-hot-box" : "menu-other-hot-box-word"}
                                 style={{marginRight: isLast ? 0 : 5}}>
                                {subData.inner}
                            </div>
                            {this.renderPlusIcon(isLast, data.needPlusIcon)}
                        </div>
                    );
                } else {
                    return (
                        <div className="menu-other-hot-out-box" key={`${index}`}>
                            <div className={isAlphabet ? "menu-other-hot-box" : "menu-other-hot-box-word"}
                                 style={{marginRight: isLast ? 0 : 5}}>
                                <img className="menu-other-hot-out-box-mix" src={subData.inner.img}/>
                                {subData.inner.TextIcon}
                            </div>
                            {this.renderPlusIcon(isLast, data.needPlusIcon)}
                        </div>
                    );
                }
            });
            return (
                <div className="menu-other-box" key={`${index}`}>
                    <div className="menu-other-box-left">{data.actionName}</div>
                    <div className="menu-other-array-box">{hotKeyArray}</div>
                </div>
            );
        });

        return (
            <div className="menu-hot-key-box">
                <div className="menu-title-line">
                    <div className="menu-title-text-box">
                        Hot Key
                    </div>
                    <div className="menu-close-btn" onClick={this.props.handleHotKeyMenuState}>
                        <img className="menu-title-close-icon" src={CloseIcon}/>
                    </div>
                </div>
                <div style={{height: 42}}/>
                <div className="menu-hot-key-title">{MenuHotKeyDoc.tools.name}</div>
                {menuHotKeyDocToolArray}
                <div className="menu-hot-key-title">{MenuHotKeyDoc.others.name}</div>
                {menuHotKeyDocOtherArray}
                <div style={{width: "100%", height: 24, backgroundColor: "white"}}/>
            </div>
        );
    }

    private renderPlusIcon(isLast: boolean, needPlusIcon: boolean): React.ReactNode {
        if (needPlusIcon && !isLast) {
            return <div className="menu-other-hot-box-plus">+</div>;
        } else {
            return null;
        }
    }
}
