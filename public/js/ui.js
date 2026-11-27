
/**
 * Create a DOM element without using innerHTML.
 *
 * @param {string} tag - HTML element name.
 * @param {object} props - Element properties and event handlers.
 * @param {Array|string|number|Node} children - Child content.
 */
export function element(tag, props = {}, children = []) {
  const element = document.createElement(tag);

  //  Loop through each property as a key and value pair.
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if (key === "className") {
      element.className = value;
    } else if (key === "htmlFor") {
      element.htmlFor = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in element) {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  }

  const items = Array.isArray(children) ? children : [children];

  for (const child of items) {
    if (child === undefined || child === null || child === false) {
      continue;
    }

    if (child instanceof Node) {
      element.appendChild(child);
    } else {
      element.appendChild(
        document.createTextNode(String(child))
      );
    }
  }

  return element;
}

// All prices in the application are stored in kobo (whole-number cents).
// Dividing by 100 converts kobo to naira for display.
export function formatPrice(priceCents) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}
