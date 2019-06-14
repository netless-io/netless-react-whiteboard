import * as React from "React";
import "./LoadingPage.less";

import LoadingIcon from "../assets/image/loading.svg";

export class LoadingPage extends React.Component {

    public render(): React.ReactNode {
        return (
            <div className="white-board-loading">
                <img src={LoadingIcon}/>
            </div>
        );
    }
}
