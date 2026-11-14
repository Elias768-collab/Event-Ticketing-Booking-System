
export class Router {
  constructor() {
    this.routes = [];
  }

//   Register routes
  add(method, path, handler) {
    const segments = path.split("/").filter(Boolean);

    this.routes.push({
      method: method.toUpperCase(),
      path,
      segments,
      handler,
    });
  }

  get(path, handler) {
    this.add("GET", path, handler);
  }

  post(path, handler) {
    this.add("POST", path, handler);
  }
  
/**
 * Compares the HTTP method
 * Compares the number of path segments
 * Checks each segment
 * Extracts dynamic parameters beginning with ":"
 * Returns the matching handler and parameters
 * Return null if nothing matches
 */
  match(method, pathname) {
    const requestSegments = pathname.split("/").filter(Boolean);

    for (const route of this.routes) {
        
        /**
         * Wrong verb?
         * A POST request can't match a GET request
         */
      if (route.method !== method.toUpperCase()) {
        continue;
      }

      if (route.segments.length !== requestSegments.length) {
        continue;
      }

    //   Preparing an empty box for route parameters
      const params = {};
      let matches = true;

    //   Comparing the sign and the request piece by piece, side by side
      for (let i = 0; i < route.segments.length; i++) {
        const routeSegment = route.segments[i];
        const requestSegment = requestSegments[i];

        if (routeSegment.startsWith(":")) {
          const paramName = routeSegment.slice(1);
          params[paramName] = decodeURIComponent(requestSegment);
        } else if (routeSegment !== requestSegment) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return {
          handler: route.handler,
          params,
        };
      }
    }

    return null;
  }
}
