window.__ModuleLoader__.load({
  id: "@ramify/dsh-ramify",
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

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  RamifyProjectToolCard: () => RamifyProjectToolCard,
  RamifySidebarAction: () => RamifySidebarAction,
  RamifyWorkspaceOverlay: () => RamifyWorkspaceOverlay,
  apply: () => apply,
  inject: () => inject,
  ramifyWorkspaceOpen: () => ramifyWorkspaceOpen,
  setRamifyWorkspaceOpen: () => setRamifyWorkspaceOpen,
  subscribeRamifyWorkspace: () => subscribeRamifyWorkspace
});
module.exports = __toCommonJS(index_exports);

// src/client/RamifySurface.tsx
var import_react = require("react");

// src/client/store.ts
var listeners = /* @__PURE__ */ new Set();
var open = false;
var workspaceFrame = null;
function ramifyWorkspaceOpen() {
  return open;
}
function subscribeRamifyWorkspace(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function setRamifyWorkspaceOpen(next) {
  if (open === next) return;
  open = next;
  for (const listener of listeners) listener();
}
function setRamifyWorkspaceFrame(frame) {
  workspaceFrame = frame;
}
function ramifyWorkspaceFrame() {
  return workspaceFrame;
}

// src/client/RamifySurface.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var RAMIFY_URL = "http://127.0.0.1:9519/";
function SproutMark() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ramify-entry__mark", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-entry__stem" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-entry__leaf ramify-entry__leaf--left" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-entry__leaf ramify-entry__leaf--right" })
  ] });
}
function RamifySidebarAction({ wide }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: `ramify-entry${wide ? "" : " ramify-entry--rail"}`,
      "aria-label": "\u6253\u5F00 Ramify \u5DE5\u4F5C\u53F0",
      title: wide ? void 0 : "Ramify",
      onClick: () => {
        setRamifyWorkspaceOpen(true);
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SproutMark, {}),
        wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-entry__label", children: "Ramify" }) : null
      ]
    }
  );
}
function ExternalIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.5 2.5h4v4M13.2 2.8 7.5 8.5", stroke: "currentColor", strokeWidth: "1.35", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 8.7v3.1c0 .94-.76 1.7-1.7 1.7H4.2c-.94 0-1.7-.76-1.7-1.7V5.7c0-.94.76-1.7 1.7-1.7h3.1", stroke: "currentColor", strokeWidth: "1.35", strokeLinecap: "round" })
  ] });
}
function CloseIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m3.5 3.5 9 9m0-9-9 9", stroke: "currentColor", strokeWidth: "1.45", strokeLinecap: "round" }) });
}
function RamifyWorkspaceOverlay() {
  const open2 = (0, import_react.useSyncExternalStore)(subscribeRamifyWorkspace, ramifyWorkspaceOpen, ramifyWorkspaceOpen);
  const [ready, setReady] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (!open2) return;
    setReady(false);
    const onKeyDown = (event) => {
      if (event.key === "Escape") setRamifyWorkspaceOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open2]);
  if (!open2) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ramify-layer", role: "dialog", "aria-modal": "true", "aria-labelledby": "ramify-workspace-title", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ramify-shell", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "ramify-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ramify-brand", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-brand__seal", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SproutMark, {}) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "ramify-brand__name", id: "ramify-workspace-title", children: "Ramify" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-brand__meta", children: "creative branching workspace" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ramify-status", "aria-live": "polite", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-status__dot" }),
        ready ? "\u5DE5\u4F5C\u53F0\u5DF2\u8FDE\u63A5" : "\u6B63\u5728\u5524\u9192\u5DE5\u4F5C\u53F0"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ramify-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "ramify-icon-button", href: RAMIFY_URL, target: "_blank", rel: "noreferrer", "aria-label": "\u5728\u65B0\u7A97\u53E3\u6253\u5F00 Ramify", title: "\u5728\u65B0\u7A97\u53E3\u6253\u5F00", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalIcon, {}) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ramify-icon-button", type: "button", "aria-label": "\u5173\u95ED Ramify", title: "\u5173\u95ED (Esc)", onClick: () => {
          setRamifyWorkspaceOpen(false);
        }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseIcon, {}) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ramify-stage", children: [
      !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ramify-loading", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ramify-loading__sprout", children: "\u{1F331}" }),
        "\u679D\u53F6\u6B63\u5728\u5C55\u5F00"
      ] }) }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "iframe",
        {
          ref: (frame) => {
            setRamifyWorkspaceFrame(frame?.contentWindow ?? null);
          },
          className: `ramify-frame${ready ? " ramify-frame--ready" : ""}`,
          src: RAMIFY_URL,
          title: "Ramify \u5DE5\u4F5C\u53F0",
          onLoad: () => {
            setReady(true);
          }
        }
      )
    ] })
  ] }) });
}

// src/client/RamifyToolCard.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function shouldAutoOpenRamifyProject(wasRunning, settled, failed) {
  return wasRunning && settled && !failed;
}
function RamifyProjectToolCard({ block }) {
  const settled = "kind" in block;
  const failed = settled && block.isError;
  const wasRunning = (0, import_react2.useRef)(!settled);
  (0, import_react2.useEffect)(() => {
    if (!settled) {
      wasRunning.current = true;
      return;
    }
    if (shouldAutoOpenRamifyProject(wasRunning.current, settled, failed)) {
      wasRunning.current = false;
      setRamifyWorkspaceOpen(true);
    } else if (settled) {
      wasRunning.current = false;
    }
  }, [failed, settled]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ramify-tool", "data-state": failed ? "error" : settled ? "done" : "running", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ramify-tool__seal", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ramify-entry__mark", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ramify-entry__stem" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ramify-entry__leaf ramify-entry__leaf--left" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ramify-entry__leaf ramify-entry__leaf--right" })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ramify-tool__copy", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: failed ? "Ramify \u9879\u76EE\u521B\u5EFA\u5931\u8D25" : settled ? "Ramify \u9879\u76EE\u5DF2\u5C31\u7EEA" : "\u6B63\u5728\u521B\u5EFA Ramify \u9879\u76EE" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: failed ? "\u5C55\u5F00\u8F68\u8FF9\u67E5\u770B\u9519\u8BEF" : settled ? "\u9879\u76EE\u5DF2\u540C\u6B65\u5230\u5185\u7F6E\u5DE5\u4F5C\u53F0" : "\u6B63\u5728\u51C6\u5907\u6839\u8282\u70B9\u4E0E\u753B\u5E03" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "button",
      {
        className: "ramify-tool__open",
        type: "button",
        disabled: failed,
        onClick: () => {
          setRamifyWorkspaceOpen(true);
        },
        children: [
          "\u6253\u5F00 Ramify",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": "true", children: "\u2197" })
        ]
      }
    ),
    !settled ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ramify-tool__sweep", "aria-hidden": "true" }) : null
  ] });
}

// src/client/RamifySessionBridge.tsx
var import_react3 = require("react");
var RAMIFY_ORIGIN = "http://127.0.0.1:9519";
function bridgeRequest(value) {
  if (typeof value !== "object" || value === null) return null;
  const row = value;
  if (row.type !== "ramify:dsh-submit" || row.version !== 1) return null;
  if (typeof row.requestId !== "string" || typeof row.prompt !== "string") return null;
  if (!Number.isInteger(row.count) || Number(row.count) < 1 || Number(row.count) > 5) return null;
  if (row.action === "create") {
    if (typeof row.projectId !== "string" || typeof row.rootId !== "string") return null;
    if (!Array.isArray(row.nodeIds) || row.nodeIds.length !== row.count || !row.nodeIds.every((id) => typeof id === "string")) return null;
    return row;
  }
  if (row.action !== "branch") return null;
  if (typeof row.projectId !== "string" || typeof row.nodeId !== "string" || typeof row.nodeTitle !== "string") return null;
  if (!Array.isArray(row.nodeIds) || row.nodeIds.length !== row.count || !row.nodeIds.every((id) => typeof id === "string")) return null;
  return row;
}
function promptFor(request) {
  if (request.action === "create") {
    return [
      `\u8BF7\u7EE7\u7EED\u5B8C\u6210\u5DF2\u521B\u5EFA\u7684 Ramify \u9879\u76EE ${request.projectId}\u3002`,
      `\u6839\u8282\u70B9\u662F ${request.rootId}\uFF0C\u4E0D\u8981\u518D\u6B21\u521B\u5EFA\u9879\u76EE\u3002`,
      `\u5B8C\u6574\u9700\u6C42\uFF1A${request.prompt.trim()}`,
      `\u753B\u5E03\u5DF2\u7ECF\u521B\u5EFA\u4E86 ${request.count} \u4E2A\u751F\u6210\u4E2D\u5360\u4F4D\u8282\u70B9\uFF1A${request.nodeIds.join("\u3001")}\u3002`,
      "\u8BF7\u4E3A\u6BCF\u4E2A\u5360\u4F4D\u8282\u70B9\u786E\u5B9A\u4E00\u4E2A\u660E\u663E\u4E0D\u540C\u7684\u65B9\u5411\uFF0C\u5E76\u76F4\u63A5\u4F7F\u7528 ramify_node_complete \u5B8C\u6574\u5199\u5165\u5BF9\u5E94\u8282\u70B9\u3002",
      "\u4E0D\u8981\u65B0\u5EFA\u9879\u76EE\uFF0C\u4E0D\u8981\u65B0\u5EFA\u989D\u5916\u65B9\u6848\u8282\u70B9\uFF0C\u4E5F\u4E0D\u8981\u5220\u9664\u8FD9\u4E9B\u5360\u4F4D\u8282\u70B9\u3002",
      "\u5B8C\u6210\u540E\u4E0D\u8981\u8F93\u51FA\u672C\u5730\u670D\u52A1\u5730\u5740\uFF1BRamify \u5DE5\u4F5C\u53F0\u4F1A\u81EA\u52A8\u66F4\u65B0\u3002"
    ].join("\n");
  }
  return [
    `\u8BF7\u7EE7\u7EED\u7F16\u8F91 Ramify \u9879\u76EE ${request.projectId}\u3002`,
    `\u7236\u8282\u70B9\u662F ${request.nodeId}\uFF08${request.nodeTitle}\uFF09\u3002`,
    `\u753B\u5E03\u5DF2\u7ECF\u521B\u5EFA\u4E86 ${request.count} \u4E2A\u5206\u652F\u5360\u4F4D\u8282\u70B9\uFF1A${request.nodeIds.join("\u3001")}\u3002`,
    `\u4FEE\u6539\u8981\u6C42\uFF1A${request.prompt.trim()}`,
    "\u5148\u8BFB\u53D6\u9879\u76EE\u6811\u786E\u8BA4\u8282\u70B9\uFF0C\u518D\u76F4\u63A5\u4F7F\u7528 ramify_node_complete \u5B8C\u6574\u5199\u5165\u8FD9\u4E9B\u5360\u4F4D\u8282\u70B9\u3002\u4E0D\u8981\u518D\u521B\u5EFA\u8282\u70B9\uFF0C\u4FDD\u7559\u539F\u8282\u70B9\u3002"
  ].join("\n");
}
function RamifySessionBridge({ inputActions }) {
  (0, import_react3.useEffect)(() => {
    const onMessage = (event) => {
      if (event.origin !== RAMIFY_ORIGIN || event.source !== ramifyWorkspaceFrame()) return;
      const request = bridgeRequest(event.data);
      if (request === null || request.prompt.trim() === "") return;
      inputActions.setDraft(promptFor(request));
      inputActions.submit();
      if (event.source !== null && "postMessage" in event.source) {
        event.source.postMessage({ type: "ramify:dsh-accepted", version: 1, requestId: request.requestId }, event.origin);
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [inputActions]);
  return null;
}

// src/client/styles.ts
var STYLE_ID = "@ramify/dsh-ramify/client";
var CSS = String.raw`
.ramify-entry {
  box-sizing: border-box;
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  color: var(--dsw-alias-label-secondary, #77736b);
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease, transform 150ms ease;
}
.ramify-entry:hover {
  color: var(--dsw-alias-label-primary, #282723);
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 124, 113, .11));
}
.ramify-entry:active { transform: translateY(1px); }
.ramify-entry--rail {
  width: 36px;
  justify-content: center;
  padding: 0;
}
.ramify-entry__mark {
  position: relative;
  width: 18px;
  height: 20px;
  flex: none;
}
.ramify-entry__stem {
  position: absolute;
  left: 8px;
  top: 5px;
  width: 1.5px;
  height: 14px;
  border-radius: 1px;
  background: currentColor;
  transform: rotate(-5deg);
  transform-origin: bottom;
}
.ramify-entry__leaf {
  position: absolute;
  width: 7px;
  height: 4px;
  border: 1.4px solid currentColor;
  border-radius: 90% 10% 90% 10%;
  background: var(--dsw-specific-sidebar-fill, #f7f6f2);
}
.ramify-entry__leaf--left { left: 1px; top: 4px; transform: rotate(24deg); }
.ramify-entry__leaf--right { left: 9px; top: 1px; transform: rotate(-16deg) scaleX(-1); }
.ramify-entry__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: .01em;
}

.ramify-tool {
  position: relative;
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 11px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 9px 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(110, 110, 100, .2));
  border-radius: 11px;
  color: var(--dsw-alias-label-primary, #2d3029);
  background:
    radial-gradient(circle at 0 50%, rgba(132, 153, 111, .12), transparent 38%),
    var(--dsw-alias-bg-base, #f7f6f1);
}
.ramify-tool__seal {
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  border: 1px solid rgba(126, 148, 105, .28);
  border-radius: 50%;
  color: #748764;
  background: rgba(132, 153, 111, .12);
}
.ramify-tool__copy { min-width: 0; display: grid; gap: 3px; }
.ramify-tool__copy strong { overflow: hidden; font-size: 13px; font-weight: 550; line-height: 17px; text-overflow: ellipsis; white-space: nowrap; }
.ramify-tool__copy small { overflow: hidden; color: var(--dsw-alias-label-tertiary, #85857d); font-size: 11px; line-height: 15px; text-overflow: ellipsis; white-space: nowrap; }
.ramify-tool__open {
  height: 30px;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 0 10px;
  border: 1px solid rgba(126, 148, 105, .3);
  border-radius: 8px;
  color: #607052;
  background: rgba(132, 153, 111, .1);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
}
.ramify-tool__open:hover { border-color: rgba(126, 148, 105, .52); background: rgba(132, 153, 111, .18); }
.ramify-tool__open:active { transform: translateY(1px); }
.ramify-tool__open:disabled { cursor: not-allowed; opacity: .45; }
.ramify-tool[data-state='error'] .ramify-tool__seal { color: #b35c50; border-color: rgba(179, 92, 80, .3); background: rgba(179, 92, 80, .1); }
.ramify-tool__sweep {
  position: absolute;
  inset: 0 auto 0 -35%;
  width: 30%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(155, 176, 134, .16), transparent);
  animation: ramify-sweep 1.35s ease-in-out infinite;
}
@keyframes ramify-sweep { to { left: 110%; } }

.ramify-layer {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: grid;
  place-items: center;
  padding: 10px;
  box-sizing: border-box;
  pointer-events: auto;
  background: rgba(18, 19, 17, .48);
  backdrop-filter: blur(10px) saturate(.8);
  animation: ramify-veil-in 180ms ease-out both;
}
.ramify-shell {
  --ramify-ink: #2d3029;
  --ramify-muted: #777c70;
  --ramify-paper: #f4f3ed;
  --ramify-line: rgba(64, 70, 59, .16);
  position: relative;
  width: min(1560px, 100%);
  height: 100%;
  min-height: 360px;
  display: grid;
  grid-template-rows: 54px minmax(0, 1fr);
  overflow: hidden;
  color: var(--ramify-ink);
  background:
    radial-gradient(circle at 20% -10%, rgba(184, 201, 168, .24), transparent 35%),
    var(--ramify-paper);
  border: 1px solid rgba(255, 255, 255, .36);
  border-radius: 15px;
  box-shadow: 0 28px 90px rgba(0, 0, 0, .28), 0 2px 10px rgba(0, 0, 0, .12);
  animation: ramify-shell-in 220ms cubic-bezier(.2, .8, .2, 1) both;
}
.ramify-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0 12px 0 18px;
  border-bottom: 1px solid var(--ramify-line);
  background: rgba(247, 246, 240, .9);
  backdrop-filter: blur(18px);
}
.ramify-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.ramify-brand__seal {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(67, 80, 59, .19);
  border-radius: 50%;
  color: #4f6245;
  background: rgba(218, 228, 207, .55);
  box-shadow: inset 0 0 0 3px rgba(255,255,255,.38);
}
.ramify-brand__name {
  font-family: Iowan Old Style, Baskerville, Charter, Georgia, serif;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -.01em;
}
.ramify-brand__meta {
  color: var(--ramify-muted);
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.ramify-status {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  color: var(--ramify-muted);
  font-size: 12px;
}
.ramify-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #82966f;
  box-shadow: 0 0 0 3px rgba(130, 150, 111, .14);
}
.ramify-actions { display: flex; align-items: center; gap: 5px; }
.ramify-icon-button {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: #65695f;
  background: transparent;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, transform 140ms ease;
}
.ramify-icon-button:hover { color: #262923; background: rgba(71, 78, 65, .09); }
.ramify-icon-button:active { transform: scale(.95); }
.ramify-stage { position: relative; min-height: 0; background: #efeee8; }
.ramify-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: .3;
  background-image: radial-gradient(circle, #a7aa9f 1px, transparent 1px);
  background-size: 18px 18px;
}
.ramify-frame {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  background: #f6f5f0;
  opacity: 0;
  transition: opacity 240ms ease;
}
.ramify-frame--ready { opacity: 1; }
.ramify-loading {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: grid;
  place-items: center;
  color: #71766b;
  font-family: Iowan Old Style, Baskerville, Georgia, serif;
  font-size: 14px;
  letter-spacing: .04em;
}
.ramify-loading__sprout { display: block; margin: 0 auto 10px; animation: ramify-breathe 1.8s ease-in-out infinite; }
@keyframes ramify-veil-in { from { opacity: 0; } }
@keyframes ramify-shell-in { from { opacity: 0; transform: translateY(10px) scale(.99); } }
@keyframes ramify-breathe { 50% { transform: translateY(-3px); opacity: .65; } }
@media (max-width: 700px) {
  .ramify-layer { padding: 0; }
  .ramify-shell { border: 0; border-radius: 0; }
  .ramify-brand__meta, .ramify-status { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ramify-layer, .ramify-shell, .ramify-loading__sprout { animation: none; }
  .ramify-frame { transition: none; }
}
`;
function installRamifyStyles() {
  const prior = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`);
  if (prior !== null) return () => {
  };
  const style = document.createElement("style");
  style.dataset.plugin = "@ramify/dsh-ramify";
  style.dataset.pluginCss = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
  return () => {
    style.remove();
  };
}

// src/client/index.ts
var inject = ["slots"];
function apply(ctx) {
  ctx.effect(() => installRamifyStyles(), "ramify: client styles");
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "ramify",
    order: -10,
    label: "Ramify"
  }, RamifySidebarAction));
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay",
    id: "ramify-workspace",
    order: 20,
    label: "Ramify workspace"
  }, RamifyWorkspaceOverlay));
  ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
    name: "tool.call.toolview",
    key: "ramify_project_create"
  }, RamifyProjectToolCard));
  ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
    name: "conversation.input.dock",
    id: "ramify-session-bridge"
  }, RamifySessionBridge));
}

    return module.exports;
  },
});
