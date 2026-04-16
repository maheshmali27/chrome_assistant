import { createRoot } from "react-dom/client";
import FloatingButton from "./FloatingButton";

// Mount into a Shadow DOM so extension styles don't leak into the page
const host = document.createElement("div");
host.id = "pa-extension-root";
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: "open" });
const container = document.createElement("div");
shadow.appendChild(container);

createRoot(container).render(<FloatingButton />);
