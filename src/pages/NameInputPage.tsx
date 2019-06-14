import * as React from "react";
import * as uuid from "uuid/v4";

import "./PageNameInput.less";

import NetlessBlack from "../assets/image/netless_black.svg";

import {Input, Button} from "antd";
import {RouteComponentProps} from "react-router";
import {Link} from "@netless/i18n-react-router";
import {netlessWhiteboardApi} from "../apiMiddleware";

export type PageNameInputProps = RouteComponentProps<{}>;
export type PageNameInputState = {
    readonly name: string;
};

class NameInputPage extends React.Component<PageNameInputProps, PageNameInputState> {

    public constructor(props: PageNameInputProps) {
        super(props);
        this.state = {
            name: "",
        };
    }

    private onInputNameChanged(name: string): void {
        this.setState({name: name.trim()});
    }

    private onClickButton = (): void => {
        if (this.state.name) {
            netlessWhiteboardApi.user.updateUserInf(this.state.name, uuid(), "1");
        } else {
            netlessWhiteboardApi.user.updateUserInf("Netless user", uuid(), "1");
        }
        this.props.history.push("/whiteboard/");
    }

    public render(): React.ReactNode {
        return (
            <div className="page-input-box">
                <Link to="/">
                    <img src={NetlessBlack}/>
                </Link>
                <div className="page-input-left-box">
                    <div className="page-input-left-mid-box">
                        <div className="name-title">输入临时用户名字<br/>可以方便您在互动的时候区别身份</div>
                        <Input size="large"
                               placeholder="输入用户名"
                               value={this.state.name}
                               onChange={e => this.onInputNameChanged(e.target.value)}/>
                        <Button size="large"
                                type="primary"
                                onClick={this.onClickButton}
                                className="name-button">
                            确认
                        </Button>
                    </div>
                </div>
                <div className="page-input-right-box"/>
            </div>
        );
    }
}

export default NameInputPage;
