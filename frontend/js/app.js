(function () {
  "use strict";

  var S = window.Scenario;
  var Format = window.Format;
  var Sim = window.Simulation;
  var Toast = window.Toast;

  /* ============ tema ============ */
  var root = document.documentElement;
  var metaTheme = document.getElementById("meta-theme-color");
  function syncThemeColor() {
    if (!metaTheme) return;
    metaTheme.setAttribute("content", root.getAttribute("data-theme") === "dark" ? "#171435" : "#F7F7FA");
  }
  var stored = null;
  try { stored = localStorage.getItem("tema"); } catch (err) { stored = null; }
  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }
  syncThemeColor();
  document.getElementById("tema").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    syncThemeColor();
    try { localStorage.setItem("tema", next); } catch (err) {}
  });

  /* ============ liquid glass: brilho que segue o ponteiro ============ */
  document.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(".glass");
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100) + "%");
    el.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100) + "%");
  });

  /* ============ o ponto de partida ============ */
  document.getElementById("sc-capital").textContent = Format.compactMoney(S.capital);
  document.getElementById("sc-hours").textContent = S.hours + " horas";
  document.getElementById("sc-goal").textContent = S.goal;

  /* ============ navegação ============ */
  var semAnimacao = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // leva a tela até a parte que acabou de aparecer (o scroll-margin-top do
  // CSS desconta a barra do topo) e põe o foco nela, pra o leitor de tela
  // anunciar e o próximo Tab já continuar lá dentro
  function irPara(secao) {
    secao.scrollIntoView({ behavior: semAnimacao ? "auto" : "smooth", block: "start" });
    secao.focus({ preventScroll: true });
  }

  // a combinação mudou: o resultado que estava na tela não vale mais
  function combinacaoMudou() {
    window.ResultView.hide();
    window.PandemicView.reset();
  }

  Toast.mount();
  window.OptionsView.mount(document.getElementById("options"), combinacaoMudou);
  window.PandemicView.mount(irPara);

  document.getElementById("btn-reveal").addEventListener("click", function () {
    if (!Sim.chosen().length) {
      Toast.show("Selecione ao menos uma opção para continuar.");
      return;
    }
    Toast.hide();
    window.PandemicView.reset();
    window.ResultView.show();
    irPara(document.getElementById("sec-result"));
  });

  document.getElementById("btn-reset").addEventListener("click", function () {
    Sim.reset();
    window.OptionsView.sync();
    combinacaoMudou();
    Toast.hide();
    window.scrollTo({ top: 0, behavior: semAnimacao ? "auto" : "smooth" });
  });
})();
