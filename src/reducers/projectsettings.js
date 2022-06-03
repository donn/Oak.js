const projectSettingsReducer = (state = {}, action) => {
    switch (action.type) {
        case "UPDATE_PROJECT_SETTINGS":
            return action.payload;
        default:
            return state;
    }
};

export default projectSettingsReducer;
