export function startSpinner() {
    document.getElementById('spinnerOverlay').classList.remove("d-none");
}

export function stopSpinner() {
    document.getElementById('spinnerOverlay').classList.add("d-none");
}
//use spinner when using await calls cause we are assuming they take a while