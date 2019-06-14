import * as React from "react";

import {slide as Menu, reveal as MenuLeft} from "react-burger-menu";
import {MenuInnerType} from "../../pages/WhiteboardPage";

function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

const styles: any = {
    bmMenu: {
        boxShadow: "0 8px 24px 0 rgba(0,0,0,0.15)",
    },
    bmBurgerButton: {
        display: "none",
    },
};

const styles2: any = {
    bmBurgerButton: {
        display: "none",
    },
};

const styles3: any = {
    bmOverlay: {
        background: "rgba(0, 0, 0, 0.0)",
   },
};

export type MenuBoxProps = {
    readonly isVisible: boolean;
    readonly menuInnerState: MenuInnerType;
    readonly pageWrapId: string;
    readonly outerContainerId: string;
    readonly isLeft?: boolean;
    readonly resetMenu: () => void;
    readonly setMenuState: (state: boolean) => void;
};

export type MenuBoxStyleState = {
    readonly menuStyles: any,
};

export default class MenuBox extends React.Component<MenuBoxProps, MenuBoxStyleState> {

    public constructor(props: MenuBoxProps) {
        super(props);
        this.state = {
            menuStyles: this.props.isVisible ? styles : styles2,
        };
    }

    private async getMenuStyle(): Promise<void> {
        if (this.props.isVisible) {
            this.setState({
                menuStyles: styles,
            });
        } else {
            await sleep(500);
            this.setState({
                menuStyles: styles2,
            });
        }
    }
    public render(): React.ReactNode {
        if (this.props.isLeft) {
            return (
                <MenuLeft pageWrapId="page-wrap"
                          outerContainerId="outer-container"
                          width={360}
                          styles={styles3}
                          isOpen={this.props.isVisible}
                          onStateChange={async menuState => {
                              if (!menuState.isOpen) {
                                  await sleep(500);
                                  this.props.resetMenu();
                              }
                          }}>
                    {this.props.children}
                </MenuLeft>
            );
        } else {
            return (
                <Menu pageWrapId="page-wrap"
                      outerContainerId="outer-container"
                      noOverlay
                      styles={this.state.menuStyles}
                      width={280}
                      right={true}
                      isOpen={this.props.isVisible}
                      onStateChange={async menuState => {
                          if (!menuState.isOpen) {
                              await sleep(500);
                              this.props.setMenuState(false);
                          }
                          else {
                              this.props.setMenuState(true);
                          }
                          await this.getMenuStyle();
                      }}>
                    {this.props.children}
                </Menu>
            );
        }
    }
}
