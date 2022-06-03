import { combineReducers } from "redux";
import tabs from "./tab";
import selectedtab from "./selectedtab";
import global_settings from "./globalsettings";
import project_settings from "./projectsettings";
import panel_visibility from "./setvisibility";
import { localizeReducer } from "react-localize-redux";

export default combineReducers({
    tabs,
    selectedtab,
    global_settings,
    project_settings,
    panel_visibility,
    localize: localizeReducer,
});
