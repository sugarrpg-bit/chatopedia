// Тимчатопедія: тема, меню на телефоні, пошук за назвами сторінок, випадкова стаття, підказки на графіку.
// Список сторінок — window.WIKI_PAGES з pages.js (генерує wiki.py).
(function () {
  "use strict";
  var root = document.documentElement;
  var base = root.getAttribute("data-root") || "";
  var pages = window.WIKI_PAGES || [];

  // тема: системна → світла / темна; запам'ятовуємо в браузері, якщо можна
  try { var saved = localStorage.getItem("wiki-theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  var themeBtn = document.getElementById("theme");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme");
    var dark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "light" : "dark");
    try { localStorage.setItem("wiki-theme", dark ? "light" : "dark"); } catch (e) {}
  });

  // меню на вузькому екрані
  var burger = document.getElementById("burger");
  if (burger) burger.addEventListener("click", function (e) { e.stopPropagation(); document.body.classList.toggle("drawer"); });
  document.addEventListener("click", function (e) {
    if (document.body.classList.contains("drawer") && !e.target.closest(".side")) document.body.classList.remove("drawer");
  });

  var toastEl = document.getElementById("toast"), toastT;
  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 2200);
  }

  // пошук: підказки з назв, Enter — перша сторінка, де є запит
  var list = document.getElementById("titles");
  if (list) pages.forEach(function (p) { var o = document.createElement("option"); o.value = p.t; list.appendChild(o); });
  var form = document.getElementById("search");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("q").value.trim().toLowerCase();
    if (!q) return;
    var hit = pages.filter(function (p) { return p.t.toLowerCase() === q; })[0] ||
              pages.filter(function (p) { return p.t.toLowerCase().indexOf(q) >= 0; })[0];
    if (hit) location.href = base + hit.u;
    else toast("У Тимчатопедії поки немає такої сторінки");
  });

  var rnd = document.getElementById("random");
  if (rnd) rnd.addEventListener("click", function (e) {
    e.preventDefault();
    var arts = pages.filter(function (p) { return p.a; });
    if (arts.length) location.href = base + arts[Math.floor(Math.random() * arts.length)].u;
  });

  // графіки: підказка з точним значенням при наведенні чи дотику
  Array.prototype.forEach.call(document.querySelectorAll(".chart"), function (box) {
    var tip = document.createElement("div");
    tip.className = "tip"; tip.hidden = true; box.appendChild(tip);
    function show(e) {
      var g = e.target.closest("g[data-tip]");
      if (!g) return;
      Array.prototype.forEach.call(box.querySelectorAll("g.on"), function (x) { x.classList.remove("on"); });
      g.classList.add("on");
      var bar = g.querySelector(".bar") || g, rb = bar.getBoundingClientRect(), rc = box.getBoundingClientRect();
      tip.textContent = g.getAttribute("data-tip");
      tip.style.left = (rb.left - rc.left + rb.width / 2) + "px";
      tip.style.top = (rb.top - rc.top) + "px";
      tip.hidden = false;
    }
    box.addEventListener("mouseover", show);
    box.addEventListener("click", show);
    box.addEventListener("mouseleave", function () {
      tip.hidden = true;
      Array.prototype.forEach.call(box.querySelectorAll("g.on"), function (x) { x.classList.remove("on"); });
    });
  });
})();
