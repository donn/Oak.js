const selectedTabReducer = (state = {
    settings: false,
    help: false
}, action) => {
    switch (action.type) {
        case 'SET_HELP_VISIBLE':
            return {
                ...state,
                help: action.state
            };
        case 'SET_SETTINGS_VISIBLE':
            return {
                ...state,
                settings: action.state
            };
        default:
            return state;
    }
}
  
export default selectedTabReducer;