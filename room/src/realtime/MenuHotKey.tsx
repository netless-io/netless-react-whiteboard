import * as React from "react";
import "./MenuHotKey.less";

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

import {InjectedIntlProps, injectIntl} from "react-intl";

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

export type MenuHotKeyProps = InjectedIntlProps & {
    readonly handleHotKeyMenuState: () => void;
};

class MenuHotKey extends React.Component<MenuHotKeyProps, {}> {

    public constructor(props: MenuHotKeyProps) {
        super(props);
        this.state = {};
        this.renderPlusIcon = this.renderPlusIcon.bind(this);
    }

    public render(): React.ReactNode {
        const MenuHotKeyDoc = {
            tools: {
                name: this.props.intl.formatMessage({id: "tool"}),
                inner: [
                    {
                        icon: SelectorIcon,
                        toolName: this.props.intl.formatMessage({id: "selector"}),
                        hotKey: "V",
                    },
                    {
                        icon: PencilIcon,
                        toolName: this.props.intl.formatMessage({id: "pencil"}),
                        hotKey: "P",
                    },
                    {
                        icon: TextIcon,
                        toolName: this.props.intl.formatMessage({id: "text"}),
                        hotKey: "T",
                    },
                    {
                        icon: EraserIcon,
                        toolName: this.props.intl.formatMessage({id: "eraser"}),
                        hotKey: "E",
                    },
                    {
                        icon: EllipseIcon,
                        toolName: this.props.intl.formatMessage({id: "ellipse"}),
                        hotKey: "O",
                    },
                    {
                        icon: RectangleIcon,
                        toolName: this.props.intl.formatMessage({id: "rectangle"}),
                        hotKey: "R",
                    },
                ],
            },
            others: {
                name: this.props.intl.formatMessage({id: "other"}),
                inner: [
                    {
                        actionName: this.props.intl.formatMessage({id: "switch-page"}),
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
                        actionName: this.props.intl.formatMessage({id: "move-canvas"}),
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: this.props.intl.formatMessage({id: "space-key"}),
                            },
                            {
                                type: "mixing",
                                inner: {
                                    img: HandIcon,
                                    text: this.props.intl.formatMessage({id: "drag"}),
                                },
                            },
                        ],
                    },
                    {
                        actionName: this.props.intl.formatMessage({id: "scale-big"}),
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
                        actionName: this.props.intl.formatMessage({id: "scale-small"}),
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

export default injectIntl(MenuHotKey);
