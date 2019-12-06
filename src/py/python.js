import script from "./python-script";

export default (() => {
  const d = document.createElement("div");
  d.innerHTML = script;
  window.z92$ = d;

  const pre = window.onload;
  window.python_start = e => {
    pre();
    document.body.appendChild(z92$);
    brython({ debug: 1, py_id: ["mypy"] });
  };
})();
