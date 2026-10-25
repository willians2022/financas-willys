# Willys Finanças — Planejamento Financeiro

Aplicativo web responsivo para planejar salário líquido, gastos, reserva de emergência e meta de renda passiva.

## Recursos
- Cálculo do salário líquido estimado a partir de salário bruto e descontos informados.
- Percentuais editáveis para gastos fixos, meta de renda passiva, investimentos adicionais e lazer.
- Meta de reserva de emergência baseada nas despesas essenciais e no número de meses escolhido.
- Simulação de patrimônio necessário para uma renda passiva hipotética.
- Estimativa de tempo para atingir a meta com aportes mensais.
- Salvamento local no navegador.
- Estrutura PWA básica para instalação em dispositivos compatíveis.

## Como executar
Abra `index.html` no navegador. Para testar recursos PWA/offline, publique no GitHub Pages ou use um servidor local.

## Publicar no GitHub Pages
1. Crie um repositório público no GitHub, por exemplo `willys-financas`.
2. Envie `index.html`, `style.css`, `app.js`, `manifest.json` e `sw.js`.
3. Abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)` e salve.
6. Aguarde a publicação e abra o endereço mostrado pelo GitHub Pages.

## Observações importantes
- Os descontos de INSS e vale-transporte são campos editáveis; confira o holerite e a legislação vigente.
- A reserva de emergência é calculada como despesas essenciais mensais × meses selecionados.
- As categorias percentuais são simulações independentes e podem se sobrepor. Não some categorias que representam o mesmo dinheiro.
- A rentabilidade usada no simulador é hipotética, não representa promessa de retorno.
- Os dados são armazenados apenas no `localStorage` do navegador e não são enviados a um servidor.

Feito para **Willys Tecnologia IoT**.
