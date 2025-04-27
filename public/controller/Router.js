export class Router {
    //instance members 
    routes = null;
    currentView = null;

    constructor(routes) {
        this.routes = routes;
        const path = window.location.pathname;
    }

    async navigate(path) {
        window.history.pushState(null,null,path); 
        await this.#loadRoute(path); //function starts with # it is private
        //listen to popstate event: fired when the active history entry changes 
        window.onpopstate = () => {
            this.#loadRoute(window.location.pathname);
        };
    }

    async #loadRoute(path) {
        let matchedRoute = this.routes.find(route => route.path === path);
        if(!matchedRoute) {
            console.error('Route not found for path:', path);
            matchedRoute = this.routes[0];
            window.location.pathname = matchedRoute.path;
        }

        const controller = new matchedRoute.controller(); //matchedRoute.controller() becomes name of class
        const view = new matchedRoute.view(controller);
        controller.setView(view);

        //view lifecycle methods
        if(this.currentView) 
            await this.currentView.onLeave(); 
        this.currentView = view;
        await view.onMount();
        await view.render();

    }
}