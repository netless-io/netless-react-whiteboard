import * as React from "react";

import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import WhiteboardPage from "./WhiteboardPage";
import PlayerPage from "./PlayerPage";
import Homepage from "./Homepage";
import PageError from "./PageError";

import {AppRouter, HistoryType} from "@netless/i18n-react-router";
import {language} from "../locale";
import {message} from "antd";

export class AppRoutes extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
    }

    public componentDidCatch(error: any, inf: any): void {
        message.error(`网页加载发生错误：${error}`);
    }

    public render(): React.ReactNode {
        return (
            <AppRouter historyType={HistoryType.HashRouter} language={language}
                       noFoundRoute={PageError}
                       routes={[
                           {path: "/", component: Homepage},
                           {path: "/replay/:uuid/:userId/", component: PlayerPage},
                           {path: "/whiteboard/:uuid?/", component: WhiteboardCreatorPage},
                           {path: "/whiteboard/:uuid/:userId/", component: WhiteboardPage},
                       ]}/>
        );
    }
}

