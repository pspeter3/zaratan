import { NAME } from "./zaratan";

import "./style.css";

const heading = document.createElement("h1");
heading.textContent = NAME;
document.getElementById("app")?.appendChild(heading);
