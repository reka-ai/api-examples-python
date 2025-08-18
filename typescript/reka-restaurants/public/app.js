// src/client.ts
async function getUserLocation() {
  return {
    country: "US",
    city: "New York City",
    region: "New York",
    timezone: "US/Eastern"
  };
}
function renderLoading(isLoading) {
  const btn = document.querySelector("#submit-btn");
  const spinner = document.querySelector("#spinner");
  if (btn) btn.disabled = isLoading;
  if (spinner) spinner.style.display = isLoading ? "inline-block" : "none";
}
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderReasoningSteps(reasoningSteps) {
  const wrapper = document.createElement("div");
  wrapper.className = "reasoning";
  if (!Array.isArray(reasoningSteps) || reasoningSteps.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No reasoning steps available.";
    wrapper.appendChild(empty);
    return wrapper;
  }
  const list = document.createElement("ul");
  list.className = "reasoning-list";
  const toPlain = (val) => {
    try {
      if (val == null) return "";
      if (typeof val === "string") return val;
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };
  const truncate = (text, max = 600) => {
    if (text.length <= max) return text;
    return text.slice(0, max) + "\u2026";
  };
  for (const step of reasoningSteps) {
    const li = document.createElement("li");
    li.className = "reasoning-step";
    const role = typeof step?.role === "string" ? step.role : "assistant";
    const heading = document.createElement("div");
    heading.className = "reasoning-head";
    heading.innerHTML = `<span class="role">${escapeHTML(role)}</span>`;
    li.appendChild(heading);
    const reasoningContent = typeof step?.reasoning_content === "string" ? step.reasoning_content : "";
    if (reasoningContent) {
      const rc = document.createElement("div");
      rc.className = "reasoning-content";
      rc.textContent = reasoningContent;
      li.appendChild(rc);
    }
    const toolCalls = Array.isArray(step?.tool_calls) ? step.tool_calls : [];
    if (toolCalls.length > 0) {
      const callsWrap = document.createElement("div");
      callsWrap.className = "tool-calls";
      for (const call of toolCalls) {
        const name = typeof call?.name === "string" ? call.name : "tool_call";
        const args = call?.args ?? null;
        const item = document.createElement("div");
        item.className = "tool-call";
        const argsPretty = truncate(toPlain(args));
        item.innerHTML = `<span class="tool-badge">${escapeHTML(name)}</span><pre class="code">${escapeHTML(argsPretty)}</pre>`;
        callsWrap.appendChild(item);
      }
      li.appendChild(callsWrap);
    }
    const contentObj = step?.content;
    const toolName = typeof contentObj?.tool_name === "string" ? contentObj.tool_name : null;
    const toolOutput = contentObj?.tool_output ?? null;
    if (toolName || toolOutput) {
      const outWrap = document.createElement("div");
      outWrap.className = "tool-output";
      if (toolName) {
        const label = document.createElement("div");
        label.innerHTML = `<span class="tool-badge">${escapeHTML(toolName)}</span>`;
        outWrap.appendChild(label);
      }
      if (Array.isArray(toolOutput)) {
        const sublist = document.createElement("ul");
        sublist.className = "tool-output-list";
        for (const item of toolOutput.slice(0, 5)) {
          const sli = document.createElement("li");
          const url = typeof item?.url === "string" ? item.url : "";
          const title = typeof item?.title === "string" ? item.title : "";
          const snippet = typeof item?.snippet === "string" ? item.snippet : "";
          const a = url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(title || url)}</a>` : escapeHTML(title || "");
          sli.innerHTML = `${a}${snippet ? ` \u2014 ${escapeHTML(snippet)}` : ""}`;
          sublist.appendChild(sli);
        }
        outWrap.appendChild(sublist);
      } else if (typeof toolOutput === "string") {
        const pre = document.createElement("pre");
        pre.className = "code";
        pre.textContent = truncate(toolOutput);
        outWrap.appendChild(pre);
      } else if (toolOutput && typeof toolOutput === "object") {
        const pre = document.createElement("pre");
        pre.className = "code";
        pre.textContent = truncate(toPlain(toolOutput));
        outWrap.appendChild(pre);
      }
      li.appendChild(outWrap);
    }
    list.appendChild(li);
  }
  wrapper.appendChild(list);
  return wrapper;
}
function renderResults(payload) {
  const container = document.querySelector("#results");
  if (!container) return;
  container.innerHTML = "";
  if (!payload?.ok) {
    container.innerHTML = `<div class="error">${escapeHTML(payload?.error ?? "Something went wrong")}</div>`;
    return;
  }
  const data = payload.data;
  const list = data?.restaurants ?? [];
  const restaurantsPanel = document.createElement("div");
  restaurantsPanel.className = "tab-panel active";
  if (!Array.isArray(list) || list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No results returned. Try a broader query.";
    restaurantsPanel.appendChild(empty);
  } else {
    const ul = document.createElement("ul");
    ul.className = "results-list";
    for (const item of list) {
      const li = document.createElement("li");
      li.className = "result-item";
      const title = escapeHTML(item?.name ?? "Unknown");
      const cuisine = escapeHTML(item?.cuisine ?? "");
      const address = escapeHTML(item?.address ?? "");
      const neighborhood = escapeHTML(item?.neighborhood ?? "");
      const why = escapeHTML(item?.why ?? "");
      const price = escapeHTML(item?.approx_price ?? "");
      const rating = typeof item?.rating === "number" ? `${item.rating.toFixed(1)}\u2605` : "";
      const distance = typeof item?.distance_km === "number" ? `${item.distance_km.toFixed(1)} km` : "";
      const url = typeof item?.url === "string" && item.url ? item.url : "";
      li.innerHTML = `
        <div class="header">
          <span class="name">${title}</span>
          <span class="meta">${[cuisine, price, rating, distance].filter(Boolean).join(" \xB7 ")}</span>
        </div>
        <div class="sub">${[address, neighborhood].filter(Boolean).join(" \xB7 ")}</div>
        <div class="why">${why}</div>
        ${url ? `<div class="link"><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Website</a></div>` : ""}
      `;
      ul.appendChild(li);
    }
    restaurantsPanel.appendChild(ul);
  }
  const disclaimer = typeof data?.disclaimer === "string" ? data.disclaimer : "";
  if (disclaimer) {
    const note = document.createElement("div");
    note.className = "disclaimer";
    note.textContent = disclaimer;
    restaurantsPanel.appendChild(note);
  }
  const hasReasoning = Array.isArray(payload?.reasoning_steps) && payload.reasoning_steps.length > 0;
  const reasoningPanel = document.createElement("div");
  reasoningPanel.className = "tab-panel";
  if (hasReasoning) {
    reasoningPanel.appendChild(renderReasoningSteps(payload.reasoning_steps));
  }
  const nav = document.createElement("div");
  nav.className = "tab-nav";
  const btnRestaurants = document.createElement("button");
  btnRestaurants.type = "button";
  btnRestaurants.className = "tab-btn active";
  btnRestaurants.textContent = "Restaurants";
  const tabsRoot = document.createElement("div");
  tabsRoot.className = "tabs";
  let btnReasoning = null;
  if (hasReasoning) {
    btnReasoning = document.createElement("button");
    btnReasoning.type = "button";
    btnReasoning.className = "tab-btn";
    btnReasoning.textContent = "Reasoning";
  }
  const activate = (which) => {
    if (which === "restaurants") {
      btnRestaurants.classList.add("active");
      restaurantsPanel.classList.add("active");
      if (btnReasoning) btnReasoning.classList.remove("active");
      reasoningPanel.classList.remove("active");
    } else {
      btnRestaurants.classList.remove("active");
      restaurantsPanel.classList.remove("active");
      if (btnReasoning) btnReasoning.classList.add("active");
      reasoningPanel.classList.add("active");
    }
  };
  btnRestaurants.addEventListener("click", () => activate("restaurants"));
  if (btnReasoning) btnReasoning.addEventListener("click", () => activate("reasoning"));
  nav.appendChild(btnRestaurants);
  if (btnReasoning) nav.appendChild(btnReasoning);
  tabsRoot.appendChild(nav);
  tabsRoot.appendChild(restaurantsPanel);
  if (hasReasoning) tabsRoot.appendChild(reasoningPanel);
  container.appendChild(tabsRoot);
}
async function handleSubmit(e) {
  e.preventDefault();
  const input = document.querySelector("#query");
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;
  renderLoading(true);
  try {
    const location = window.__REKA_LOCATION__ ?? null;
    const resp = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, location })
    });
    const json = await resp.json();
    renderResults(json);
  } catch (err) {
    renderResults({ ok: false, error: "Network error" });
  } finally {
    renderLoading(false);
  }
}
async function init() {
  const form = document.querySelector("#search-form");
  form?.addEventListener("submit", handleSubmit);
  getUserLocation().then((loc) => {
    window.__REKA_LOCATION__ = loc;
  });
}
document.addEventListener("DOMContentLoaded", init);
