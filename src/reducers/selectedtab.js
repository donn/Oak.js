const selectedTabReducer = (state = 0, action) => {
    switch (action.type) {
        case 'SELECT_TAB':
            return action.id;
        default:
            return state;
    }
}
  
export default selectedTabReducer;