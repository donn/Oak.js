export const Actions = {
    SELECT_TAB: 'SELECT_TAB',
    ADD_TAB: 'ADD_TAB',
    UPDATE_TAB: 'UPDATE_TAB',
    DELETE_TAB: 'DELETE_TAB',
    UPDATE_PROJECT_SETTINGS: 'UPDATE_PROJECT_SETTINGS'
};

export const selectTab = id => ({
    type: Actions.SELECT_TAB,
    id
});

export const addTab = tab => ({
    type: Actions.ADD_TAB,
    tab
});

export const updateTab = (index, tab) => ({
    type: Actions.UPDATE_TAB,
    index,
    tab
});

export const deleteTab = id => ({
    type: Actions.DELETE_TAB,
    id
});

export const setProjectSettings = (n, s, i) => ({
    type: Actions.UPDATE_PROJECT_SETTINGS,
    payload: {
        file_name: n,
        memory_size: s,
        isa: i
    }
})