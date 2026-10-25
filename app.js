const ids = [
  "grossSalary","inss","transport","otherDeductions","essentials","saved",
  "fixedPct","passivePct","investPct","leisurePct","reserveMonths",
  "monthlyContribution","desiredIncome","monthlyRate"
];

const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(value) ? value : 0);
const val = id => Math.max(0, Number(document.getElementById(id).value) || 0);
const setText = (id, text) => document.getElementById(id).textContent = text;

// Tabela Oficial Progressiva do INSS
function calculateINSS(gross) {
  if (gross <= 0) return 0;
  if (gross <= 1412.00) return gross * 0.075;
  if (gross <= 2666.68) return (gross * 0.09) - 21.18;
  if (gross <= 4000.03) return (gross * 0.12) - 101.18;
  if (gross <= 7786.02) return (gross * 0.14) - 181.18;
  return 908.85; // Teto maximo
}

// Tabela Oficial do IRRF
function calculateIRRF(gross, inssVal) {
  const base = gross - inssVal;
  if (base <= 2259.20) return 0;
  if (base <= 2826.65) return (base * 0.075) - 169.44;
  if (base <= 3751.05) return (base * 0.15) - 381.44;
  if (base <= 4664.68) return (base * 0.225) - 662.77;
  return (base * 0.275) - 896.00;
}

function calculate() {
  const gross = val("grossSalary");
  const net = Math.max(0, gross - val("inss") - val("transport") - val("otherDeductions"));
  setText("netSalary", money(net));

  const fixed = net * val("fixedPct") / 100;
  const passive = net * val("passivePct") / 100;
  const invest = net * val("investPct") / 100;
  const leisure = net * val("leisurePct") / 100;
  setText("fixedValue", money(fixed));
  setText("passiveValue", money(passive));
  setText("investValue", money(invest));
  setText("leisureValue", money(leisure));

  const essentials = val("essentials");
  const months = Math.max(1, val("reserveMonths"));
  const target = essentials * months;
  const saved = val("saved");
  const remaining = Math.max(0, target - saved);
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  setText("reserveTarget", money(target));
  setText("reserveDescription", `${months} ${months === 1 ? "mês" : "meses"} de despesas essenciais (${money(essentials)} por mês).`);
  setText("savedDisplay", money(saved));
  setText("remainingReserve", money(remaining));
  document.getElementById("reserveProgress").style.width = `${progress}%`;
  setText("reserveStatus", remaining <= 0 && target > 0 ? "Meta da reserva atingida." : `Você ainda precisa acumular ${money(remaining)} (${progress.toFixed(1).replace(".",",")}% concluído).`);

  const desired = val("desiredIncome");
  const ratePct = val("monthlyRate");
  const rate = ratePct / 100;
  const capital = rate > 0 ? desired / rate : (desired > 0 ? Infinity : 0);
  setText("requiredCapital", Number.isFinite(capital) ? money(capital) : "Não calculável");
  const contribution = val("monthlyContribution");
  let monthsNeeded = null;
  if (capital <= 0) monthsNeeded = 0;
  else if (contribution > 0) {
    if (rate === 0) monthsNeeded = Math.ceil(capital / contribution);
    else if (contribution > capital * rate) {
      monthsNeeded = Math.ceil(Math.log((capital * rate + contribution) / contribution) / Math.log(1 + rate));
    }
  }
  if (monthsNeeded === 0 && capital > 0) {
    setText("timeToGoal", "Meta já alcançada");
    setText("timeDetails", "Ajuste a renda desejada se quiser simular outra meta.");
  } else if (monthsNeeded && Number.isFinite(monthsNeeded)) {
    const years = Math.floor(monthsNeeded / 12);
    const rem = monthsNeeded % 12;
    setText("timeToGoal", years > 0 ? `${years} ano(s) e ${rem} mês(es)` : `${monthsNeeded} mês(es)`);
    setText("timeDetails", `Estimativa com aporte de ${money(contribution)} por mês.`);
  } else {
    setText("timeToGoal", contribution <= 0 ? "Informe um aporte mensal" : "Meta não atingível");
    setText("timeDetails", "Ajuste o valor do aporte ou rentabilidade.");
  }

  save();
}

function save() {
  const data = {};
  ids.forEach(id => data[id] = document.getElementById(id).value);
  try { localStorage.setItem("willysFinancasData_v2", JSON.stringify(data)); } catch (_) {}
}

function load() {
  try {
    const rawData = localStorage.getItem("willysFinancasData_v2");
    if (rawData) {
      const data = JSON.parse(rawData);
      ids.forEach(id => { if (data[id] !== undefined) document.getElementById(id).value = data[id]; });
      
      // Se houver salário bruto válido preenchido previamente, oculta o modal. Caso contrário, exibe-o.
      if (Number(document.getElementById("grossSalary").value) > 0) {
        document.getElementById("welcomeModal").classList.add("hidden");
      } else {
        document.getElementById("welcomeModal").classList.remove("hidden");
      }
      calculate();
    } else {
      showModal();
    }
  } catch (_) {
    showModal();
  }
}

function showModal() {
  ids.forEach(id => {
    if (!["fixedPct", "passivePct", "investPct", "leisurePct", "reserveMonths", "monthlyRate"].includes(id)) {
      document.getElementById(id).value = 0;
    }
  });
  document.getElementById("welcomeModal").classList.remove("hidden");
}

// Ao digitar o Salário Bruto manualmente na tela principal, calcula INSS, VT e IRRF em tempo real
document.getElementById("grossSalary").addEventListener("input", (e) => {
  const g = Number(e.target.value) || 0;
  const inssCalc = calculateINSS(g);
  const irrfCalc = calculateIRRF(g, inssCalc);
  document.getElementById("inss").value = inssCalc.toFixed(2);
  document.getElementById("otherDeductions").value = irrfCalc.toFixed(2);
  document.getElementById("transport").value = (g * 0.06).toFixed(2);
});

ids.forEach(id => document.getElementById(id).addEventListener("input", calculate));

// Ação do Botão "Aplicar e Começar" do Ecrã Inicial
document.getElementById("applyModalBtn").addEventListener("click", () => {
  const grossVal = Number(document.getElementById("modalGrossSalary").value) || 0;
  const savedVal = Number(document.getElementById("modalSaved").value) || 0;

  document.getElementById("grossSalary").value = grossVal;
  document.getElementById("saved").value = savedVal;

  if (grossVal > 0) {
    const inssCalculated = calculateINSS(grossVal);
    const irrfCalculated = calculateIRRF(grossVal, inssCalculated);
    const transportCalculated = grossVal * 0.06;
    const netEst = Math.max(0, grossVal - inssCalculated - irrfCalculated - transportCalculated);

    document.getElementById("inss").value = inssCalculated.toFixed(2);
    document.getElementById("otherDeductions").value = irrfCalculated.toFixed(2);
    document.getElementById("transport").value = transportCalculated.toFixed(2);
    document.getElementById("essentials").value = Math.round(netEst * 0.5);
    document.getElementById("monthlyContribution").value = Math.round(netEst * 0.2);
    document.getElementById("desiredIncome").value = 1000;
  } else {
    document.getElementById("inss").value = 0;
    document.getElementById("otherDeductions").value = 0;
    document.getElementById("transport").value = 0;
    document.getElementById("essentials").value = 0;
    document.getElementById("monthlyContribution").value = 0;
    document.getElementById("desiredIncome").value = 0;
  }

  document.getElementById("welcomeModal").classList.add("hidden");
  calculate();
});

// Ação do Botão Zerar/Limpar
document.getElementById("resetBtn").addEventListener("click", () => {
  try { 
    localStorage.clear();
  } catch (_) {}
  showModal();
  document.getElementById("modalGrossSalary").value = "";
  document.getElementById("modalSaved").value = "";
  calculate();
});

load();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}