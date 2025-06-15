export const appState = $state<{ loading: boolean; loadingOpacity: 100 }>({
	loading: false,
	loadingOpacity: 100
});

export const setAppLoading = (loading?: boolean, loadingOpacity?: 100) => {
	appState.loading = !!loading;
	appState.loadingOpacity = loadingOpacity || 100;
};
