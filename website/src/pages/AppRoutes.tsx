import * as React from "react";

import HomePage from "./HomePage";
import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import WhiteboardPage from "./WhiteboardPage";
import PlayerPage from "./PlayerPage";
import NameInputPage from "./NameInputPage";
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
                           {path: "/", component: HomePage},
                           {path: "/replay/:uuid/:userId/", component: PlayerPage},
                           {path: "/name/", component: NameInputPage},
                           {path: "/whiteboard/:uuid?/", component: WhiteboardCreatorPage},
                           {path: "/whiteboard/:uuid/:userId/", component: WhiteboardPage},
                       ]}/>
        );
    }
}

