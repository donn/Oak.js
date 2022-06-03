const tabReducer = (state = [], action) => {
    switch (action.type) {
        case "ADD_TAB":
            return [...state, action.tab];
        case "UPDATE_TAB": {
            return state.map((t, index) => {
                if (index === action.index) {
                    return Object.assign({}, t, action.tab);
                }

                return t;
            });
        }
        case "DELETE_TAB":
            return [
                ...state.slice(0, action.id),
                ...state.slice(action.id + 1),
            ];
        default:
            return state;
    }
};

export default tabReducer;
