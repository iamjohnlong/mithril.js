"use strict"

var Vnode = require("../render/vnode")
var coreRouter = require("../router/router")

module.exports = function($window, mount) {
	var router = coreRouter($window)
	var currentComponent, currentRender, currentArgs, currentPath

	var RouteComponent = {view: function() {
		return currentRender(Vnode(currentComponent, null, currentArgs, undefined, undefined, undefined))
	}}
	function defaultRender(vnode) {
		return vnode
	}
	var route = function(root, defaultRoute, routes) {

		currentComponent = "div"
		currentRender = defaultRender
		currentArgs = null

		mount(root, RouteComponent)

		router.defineRoutes(routes, function(payload, args, path) {

			var routeCtx = {}
			var hasMiddleware = typeof payload.middleware === "object"

			if (hasMiddleware) {
				var queue = function(funcs, routeCtx) {
					var i = 0;
					function next() {
						if (funcs.length !== i) {
							var f = funcs[i];
							f.call(payload, args, routeCtx, next)
							i++;
						} else {
							done()
						}
					}
					next()
				};
				queue(payload.middleware, routeCtx)
			} else {
				done()
			}

			function done() {
				currentRender = payload.render.bind(payload, args, routeCtx, path)
				root.redraw(true)
			}

		}, function() {
			router.setPath(defaultRoute, null, {replace: true})
		})
	}
	route.link = router.link
	route.prefix = router.setPrefix
	route.set = router.setPath
	route.get = function() {return currentPath}

	return route
}
