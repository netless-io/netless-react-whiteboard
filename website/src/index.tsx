import * as React from "react";
import * as ReactDOM from "react-dom";

import "netless-whiteboard-room/dist/index.css";
import {AppRoutes} from "./pages/AppRoutes";

ReactDOM.render(
    <AppRoutes/>,
    document.getElementById("app-root"),
);
