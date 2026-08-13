window.__ModuleLoader__.load({
  id: "@ramify/dsh-details-demo",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var CSS = String.raw`
.details-demo-open {
  width: 100%; height: 36px; display: flex; align-items: center; gap: 9px;
  padding: 0 10px; border: 0; border-radius: 10px; color: var(--dsw-alias-label-secondary);
  background: transparent; font: inherit; cursor: pointer;
}
.details-demo-open:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.details-demo-open__icon {
  width: 17px; height: 17px; flex: none; box-sizing: border-box;
  border: 1.5px solid currentColor; border-radius: 3px; position: relative;
}
.details-demo-open__icon::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 5px; width: 1px; background: currentColor; opacity: .55;
}
.details-demo-open__label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 14px; }
.details-demo-panel {
  --demo-accent: #e1693f;
  height: 100%; min-width: 0; display: flex; flex-direction: column; box-sizing: border-box;
  color: var(--dsw-alias-label-primary); background:
    linear-gradient(90deg, color-mix(in srgb, var(--demo-accent) 5%, transparent) 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(color-mix(in srgb, var(--demo-accent) 5%, transparent) 1px, transparent 1px) 0 0 / 24px 24px,
    var(--dsw-alias-bg-base);
  border-left: 1px solid var(--dsw-alias-border-l2);
}
.details-demo-head {
  height: 54px; flex: none; display: flex; align-items: center; gap: 10px; padding: 0 12px 0 16px;
  box-sizing: border-box; border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 92%, transparent); backdrop-filter: blur(12px);
}
.details-demo-kicker { color: var(--demo-accent); font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; }
.details-demo-title { margin-top: 4px; font: 600 14px/1.1 Charter, Georgia, serif; }
.details-demo-close {
  width: 28px; height: 28px; margin-left: auto; display: grid; place-items: center; border: 0;
  border-radius: 50%; color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer;
}
.details-demo-close:hover { background: var(--dsw-alias-interactive-bg-hover); }
.details-demo-body { flex: 1; min-height: 0; overflow: auto; padding: 18px 16px 28px; }
.details-demo-ruler {
  height: 28px; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 3px 5px;
  border-bottom: 1px solid color-mix(in srgb, var(--demo-accent) 45%, transparent);
  background: repeating-linear-gradient(90deg, transparent 0 11px, color-mix(in srgb, var(--demo-accent) 30%, transparent) 11px 12px) left bottom / auto 8px no-repeat;
  color: var(--demo-accent); font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
}
.details-demo-width { margin: 18px 0 4px; font: 700 clamp(36px, 10vw, 58px)/.9 Charter, Georgia, serif; letter-spacing: -.055em; }
.details-demo-unit { margin-left: 5px; color: var(--dsw-alias-label-tertiary); font: 500 13px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0; }
.details-demo-caption { margin: 0 0 22px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
.details-demo-grid { display: grid; gap: 8px; }
.details-demo-row {
  display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 10px; padding: 10px 11px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent);
}
.details-demo-row dt { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
.details-demo-row dd { margin: 0; overflow: hidden; color: var(--dsw-alias-label-primary); font: 500 11px/16px ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
.details-demo-warning { margin-top: 18px; padding: 12px; border-left: 3px solid var(--demo-accent); background: color-mix(in srgb, var(--demo-accent) 9%, transparent); font-size: 12px; line-height: 18px; }
.details-demo-drag { margin-top: 16px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
`;
function installStyles() {
  const style = document.createElement("style");
  style.dataset.plugin = "@ramify/dsh-details-demo";
  style.textContent = CSS;
  document.head.append(style);
  return () => {
    style.remove();
  };
}
function DetailsDemoAction({ wide, openDetails }) {
  const [notice, setNotice] = (0, import_react.useState)(null);
  const open = () => {
    openDetails();
    const required = wide ? 1220 : 996;
    setNotice(window.innerWidth < required ? `${window.innerWidth}px \u592A\u7A84 \xB7 \u9700\u8981 \u2265${required}px` : null);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "details-demo-open", type: "button", "aria-label": "\u6253\u5F00 Details \u6D4B\u8BD5", title: notice ?? "Details \u6D4B\u8BD5", onClick: open, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "details-demo-open__icon", "aria-hidden": "true" }),
    wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "details-demo-open__label", children: notice ?? "Details \u6D4B\u8BD5" }) : null
  ] });
}
function DetailsDemoPanel({ sessionId, closeDetails }) {
  const root = (0, import_react.useRef)(null);
  const [width, setWidth] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    if (root.current === null) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry?.contentRect.width ?? 0));
    });
    observer.observe(root.current);
    return () => {
      observer.disconnect();
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "details-demo-panel", ref: root, "aria-label": "DSH Details \u6D4B\u8BD5\u9762\u677F", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "details-demo-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "details-demo-kicker", children: "SINGLE \xB7 SESSION" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "details-demo-title", children: "Details column" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "details-demo-close", type: "button", "aria-label": "\u5173\u95ED Details \u6D4B\u8BD5", onClick: closeDetails, children: "\xD7" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-ruler", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "300" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "360 default" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "520" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-width", children: [
        width,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "details-demo-unit", children: "px" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "details-demo-caption", children: "\u62D6\u52A8\u9762\u677F\u5DE6\u8FB9\u7F18\uFF0C\u89C2\u5BDF DSH \u5728 300\u2013520px \u4E4B\u95F4\u7EA6\u675F\u5BBD\u5EA6\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { className: "details-demo-grid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "slot" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "details" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "kind" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "single" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "scope" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "session" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "session" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { title: String(sessionId), children: String(sessionId) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "details-demo-warning", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u73B0\u5728\u770B\u5230\u7684\u662F\u66FF\u6362\u6548\u679C\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
        "\u8FD9\u4E2A\u6D4B\u8BD5\u63D2\u4EF6\u5360\u7528\u4E86 single \u63D2\u69FD\uFF0C\u56E0\u6B64 DSH \u539F\u6765\u7684\u5DE5\u5177 Input / Output \u8BE6\u60C5\u9762\u677F\u6682\u65F6\u88AB\u66FF\u6362\u3002"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "details-demo-drag", children: "\u7A97\u53E3\u53D8\u7A84\u65F6\uFF0CDSH \u4F1A\u5148\u538B\u7F29\u6B64\u5217\uFF1B\u65E0\u6CD5\u4FDD\u8BC1\u4E2D\u95F4\u533A\u57DF\u81F3\u5C11 640px \u65F6\uFF0C\u4F1A\u81EA\u52A8\u628A Details \u6536\u6210 0px\u3002" })
    ] })
  ] });
}
var inject = ["slots", "layout"];
function apply(ctx) {
  ctx.effect(() => installStyles(), "details-demo: styles");
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "details-demo",
    order: -9,
    label: "Details \u6D4B\u8BD5",
    inject: () => ({ openDetails: () => {
      ctx.layout.openDetails();
    } })
  }, DetailsDemoAction));
  ctx.slots.inject("details", () => ctx.slots.register({
    name: "details",
    // Static client packages otherwise tie the shipped DetailsPanel at 0.
    // Single slots require a distinct priority; the lowest entry renders.
    priority: -100,
    inject: () => ({ closeDetails: () => {
      ctx.layout.closeDetails();
    } })
  }, DetailsDemoPanel));
}

    return module.exports;
  },
});
