import * as React from "react";

import "./HomePage.less";

import NetlessBlack from "../assets/image/netless_black.svg";
import NetlessBg from "../assets/image/netless_bg.svg";
import WebApp from "../assets/image/web_app.png";

import QueueAnim from "rc-queue-anim";

import {Button} from "antd";
import {Link} from "@netless/i18n-react-router";
import {WhiteUIButton} from "../whiteUIKit/WhiteUIButton";
import LandingFooter from "./LandingFooter";

export default class HomePage extends React.Component<{}, {}> {

    public render(): React.ReactNode {

        return(
            <div>
                <div className="homepage-part1-bg">
                    <img src={NetlessBg}/>
                </div>

                {this.renderNavigationBar()}

                <div className="homepage-part1-box homepage-part1-box-height-zh">
                    <div className="homepage-part1">
                        {this.renderBody()}
                    </div>
                </div>
                <div className="homepage-part2">
                    <div className="homepage-inner-part2">
                        <div className="homepage-inner-part2-img">
                            <img src={WebApp}/>
                        </div>
                    </div>
                </div>
                <div className="footer-cut-line"/>
                <LandingFooter/>
            </div>
        );
    }

    private renderNavigationBar(): React.ReactNode {
        return (
            <div className="nav-box">
                <div className="nav-box-left">
                    <img src={NetlessBlack}/>| <span>Netless-whiteboard</span>
                </div>
                <div className="nav-box-right">
                    <a href="https://console.herewhite.com/zh-CN/">
                        <div className="nav-box-right-console">Console</div>
                    </a>
                    <a target="_blank" href="https://github.com/netless-io/">
                        <Button icon="github" type="primary">Go To Github</Button>
                    </a>
                </div>
            </div>
        );
    }

    private renderBody(): React.ReactNode {
        return (
            <QueueAnim delay={300}
                       duration={300}
                       key="box-a"
                       type="bottom"
                       leaveReverse
                       ease={["easeOutCubic", "easeInCubic"]}>
                <div key="a"
                     className="homepage-part1-up-zh">
                    Netless Whiteboard
                </div>
                <div key="b"
                     className="homepage-part1-mid">
                    The White-SDK from Netless is a complete, interactive whiteboard solution. The client products cover mainstream platforms such as iOS, Android, and Web, and provide complete supporting functions. Netless-whiteboard is an upper layer open source solution based on White-SDK and looks forward to your participation and maintenance.
                </div>
                <div key="c"
                     className="homepage-part1-down">
                    <a href="https://app.herewhite.com/register">
                        <WhiteUIButton className="homepage-part-one-btn"
                                       size="large">
                            Landing Page
                        </WhiteUIButton>
                    </a>
                    <Link to={"/name/"}>
                        <WhiteUIButton type="primary"
                                       className="homepage-part-one-btn homepage-part-one-margin"
                                       size="large">
                            Start Netless
                        </WhiteUIButton>
                    </Link>
                </div>
            </QueueAnim>
        );
    }
}
