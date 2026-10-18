# SaaS de Gestão de Obras TAF — Fluxo Completo do Sistema (rev00)

Oct 16, 2026 · @FELIPE NERY

## 1. O que é o sistema

É um ERP de obra que substitui o Sankhya e as planilhas, com uma regra que não se negocia: nenhum real entra ou sai sem obra, item do orçamento e natureza.

- **Esqueleto:** cada obra é um centro de custo, e a planilha orçamentária da licitação (EAP de 5 níveis, 346 itens na 342) é a estrutura onde tudo se pendura.
- **Compra:** a solicitação nasce dentro de um item, e o preço é comparado com a meta e o teto daquele item antes de virar pedido. Dentro da meta, passa direto; acima, sobe para quem tem alçada.
- **Nota fiscal:** o XML chega sozinho, casa com o pedido e o recebimento, e é rateado à mão entre itens e obras. A soma tem que fechar 100% da nota.
- **Campo:** o encarregado aponta produção, gente, máquina, chuva e parada todo dia. Disso saem histograma real, produtividade medida e valor agregado.
- **Controle:** medição, faturamento, caixa, EVM, Lean (lookahead, restrições, PPC) e PMBOK saem dos mesmos registros, sem planilha paralela.

A referência de mercado é a Prevision, do Sienge: planejamento com IDC, IDP e curva S, gestão semanal e custo ligado ao cronograma, mas o custo vem de um ERP externo ([Prevision](https://sienge.com.br/prevision.md), [Prevision Gestão de Custos](https://sienge.com.br/prevision-gestao-custos/)). O que diferencia este sistema é a compra travada no item do orçamento e o rateio manual da nota, que é como a TAF trabalha.

## 2. O que suas planilhas já fazem e onde elas falham

As 5 planilhas já têm a lógica do sistema inteiro, em 100 abas e cerca de 268 mil fórmulas. O que falta é o que planilha não garante: amarração obrigatória, uma versão vigente e dado lançado por quem está na obra.

**O que já está pronto e vira regra do sistema**

| O que já faz | Onde está hoje | Vira no sistema |
| --- | --- | --- |
| Custo-meta e teto (margem zero) por item e por pacote, com data de fechar | Estudo 342, abas 11 e 12; META DE COMPRA | Semáforo da solicitação de compra |
| Composição de cada item em mão de obra, material, máquina, terceiro e indireto | Estudo 342, aba 31 | Natureza herdada em cada lançamento |
| Plano por serviço com produtividade, equipes-tipo e histograma diário, semanal e mensal | Estudo 342, abas 34 a 40 | Módulo de planejamento |
| Calendário do dinheiro dia a dia em 3 cenários, com pior ponto do caixa | Estudo 342, abas 08 a 10 | Caixa previsto |
| Lookahead, restrições com P×I, compromisso semanal e PPC | TAF rev6, abas 05, 05A, 05C | Módulo Lean |
| BM, nota, recebimento, reajuste e antecipação | TAF rev6, abas 06 e 07 | Medição e faturamento |
| 18 conferências com MASTER CHECK | TAF rev6, aba 13 | Travas do sistema, não relatório |
| Viabilidade com CPU, curva ABC, cotação e BDI | Viabilidade CAESB Sobradinho | Módulo de proposta |

**O que falha hoje, com o número**

| Falha | Evidência | Como o sistema fecha |
| --- | --- | --- |
| 16% do custo da 281 sem centro de custo | 08D: R$ 179.772 de R$ 1.103.553 com central "NAO CONSTA" | Lançamento sem obra e item não grava |
| Custo lançado por obra e conta, não por item | 08 CUSTOS tem 8 contas; a 08A compara só por conta | Custo por item contra a meta do item |
| 281 sem orçamento de custo e com custo lançado só até 30/05/2026 | 08B, célula H7; 13 CHECKS, item 13 | Obra sem linha de base não abre compra |
| Duas versões vencidas entre os 5 arquivos | Estudo REV10, quando a rev6 já usa a REV13; META marcada "SUBSTITUÍDO pela REV02" | Uma versão vigente; as outras ficam congeladas com data e autor |
| O mesmo estudo com resultado de sinal oposto entre revisões | REV10: +R$ 227 mil; REV13, na aba 04 da rev6: −R$ 231 mil | Toda revisão mostra o que mudou e por quê |
| Apontamento vazio | 05B sem nenhuma linha; 05 SEMANAS com 0 dias apontados | Apontamento no celular, cobrado por papel |
| 94 de 102 restrições abertas, 12 vencidas, uma pessoa com 23 | 05C; 13 CHECKS, item 17 | Fila por dono, alerta e limite por pessoa |
| R$ 774 mil do custo-meta da 342 ainda é estimativa (80 itens sem cotação) | Estudo REV10, aba 00, linha 20 | Item sem cotação fica marcado até ser cotado |
| Pacote ADM da 342 com meta acima do teto | Estudo, aba 11: meta R$ 650 mil, teto R$ 439 mil | A solicitação nasce vermelha e só a diretoria aprova |

A auditoria de 15/10 marca os 21 erros clássicos como PARCIAL. A seção 13 liga cada um ao módulo que o resolve.

## 3. Espinha dorsal: onde cada real fica guardado

Cada custo fica gravado com três endereços: onde foi usado (obra e item), o que é (insumo e natureza) e como o cliente paga (evento). Quem lança só escolhe o item; o resto o sistema herda.

&#91;embedded content: Modelo de dados · exemplo da obra 342\]

- A EAP entra com o código do cliente e 5 níveis. Na 342 são 6 grupos no nível 1 e 346 itens no nível 5, e o sistema soma de baixo para cima.
- Cada item guarda quantidade, preço licitado, custo-meta, teto, fonte do custo, pacote de compra, evento de medição e tipo (serviço, material ou projeto).
- A natureza vem do cadastro do insumo, nunca da escolha de quem lança.
- Cada item tem três saldos: meta, comprometido (pedidos aprovados) e realizado (notas). Meta menos comprometido menos realizado sem pedido é o saldo livre, e é ele que o semáforo da compra lê.
- Pacote e evento cortam os itens por fora da EAP: o pacote junta itens para comprar em escala (FOFO, TERRA); o evento junta itens que o cliente paga juntos.

## 4. Quem é quem: campo e escritório

São 12 papéis, cada um com uma tela e uma fila do que é dele. Ninguém digita o que outro já digitou, e o escritório (planejamento, compras, administrativo, financeiro) entra no fluxo em pontos fixos.

| Papel | Hoje na TAF | O que faz no sistema |
| --- | --- | --- |
| Diretoria | Thadeu | Aprova o que passa do teto ou está fora do orçamento; define margem-alvo e limite de caixa; preside o comitê trimestral |
| Gestão da carteira | Felipe | Dono do método, do custo-meta e das linhas de base; aprova revisão de estudo |
| Gerente de contrato | Tiago Marinho (342) | Dono do resultado da obra; aprova entre meta e teto; conduz a reunião de segunda |
| Engenheiro residente | Marko Aurélio (342) | Solicita compra e contratação dentro do item; lookahead e restrições; monta o BM |
| Encarregado e apontador | por frente | Aponta o dia até 9h do dia seguinte; promete o compromisso da semana |
| Planejamento e controle | escritório | Cronograma, histograma, EVM, reprogramação; guarda a versão vigente |
| Orçamento e custos | escritório | Importa a planilha do cliente, compõe custo-meta e teto, revisa cotações |
| Compras e suprimentos | escritório | Cotação com 3 preços, mapa, negociação, pedido, cobrança de entrega, avaliação de fornecedor |
| Almoxarife | obra | Recebe contra o pedido, registra entrega parcial, dá saída de material para o item |
| Administrativo de obra | obra ou escritório | Confere a nota que chegou e faz o rateio manual; documentos de RH e segurança |
| Financeiro | escritório | Agenda e paga, concilia banco, emite a nota do BM, controla recebimento e antecipação |
| Fiscal e contábil | escritório ou contador | Escrituração, retenções, tributos e DRE oficial |

Fora da TAF, o fornecedor usa um portal para responder cotação, aceitar pedido e mandar nota e medição. O cliente e a fiscalização não usam o sistema, mas cada aprovação deles fica registrada.

**Matriz RACI** (R = executa, A = responde pelo resultado, C = consultado, I = informado)

| Processo | Dir. | Gestão | Ger. contrato | Eng. | Encarr. | Planej. | Compras | Almox. | Adm. | Financ. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Custo-meta e linha de base | I | A | C | C |  | R | C |  |  |  |
| Solicitação de compra no item |  |  | I | R/A | C |  | I |  |  |  |
| Cotação e mapa |  |  | I | C |  |  | R/A |  |  |  |
| Aprovação acima da meta |  |  | R/A | C |  |  | C |  |  |  |
| Aprovação acima do teto | R/A | C | C |  |  |  |  |  |  |  |
| Pedido (OC) |  |  | I | I |  |  | R/A | I |  | I |
| Recebimento na obra |  |  |  | I | C |  | I | R/A |  |  |
| Nota e rateio |  |  | C | C |  |  | C | C | R/A | I |
| Pagamento e conciliação | I |  | I |  |  |  |  |  | C | R/A |
| Apontamento diário |  |  | I | A | R | I |  |  |  |  |
| Lookahead e restrições |  | I | A | R | C | C | C |  |  |  |
| Compromisso semanal e PPC |  | I | A | R | R | C |  |  |  |  |
| BM e faturamento | I |  | A | R |  | C |  |  |  | R |
| Fechamento do mês | A | R | C | C |  | R |  |  | C | C |

## 5. Fluxo 1 — Do edital à linha de base

A obra só abre compra depois de ter linha de base congelada: orçamento importado, custo-meta, teto e pacotes. É o que falta hoje na 281.

1. **Triagem e viabilidade.** Prazo de entrega, objeto, atestados exigidos contra o acervo; depois CPU, curva ABC, cotação e BDI (o que a planilha de viabilidade já faz). Checklist de proposta e critério de aceite da obra: margem mínima após tributos, caixa máximo e capacidade.
2. **Contrato.** Cadastro com as premissas que hoje estão soltas: regime (evento, preço unitário, global), regra de medição, corte do BM, prazo de pagamento, reajuste, garantia, ISS do município da obra, escopo negativo e matriz de risco.
3. **Importação do orçamento.** A planilha do cliente entra com o código dele (ex.: A.3.1.3.1) e vira a EAP. O sistema soma de baixo para cima e confere com o valor do contrato, centavo a centavo.
4. **Custo-meta por item.** Cotação da TAF quando existe; quando não, estimativa marcada como tal (na 342: preço SANEAGO × 0,75 para material, ÷ 1,2418 para serviço). A fonte é obrigatória em todo item.
5. **Teto por item.** É o preço licitado menos os tributos da nota. Acima dele o item dá prejuízo.
6. **Pacotes.** Itens agrupados para comprar ou contratar em escala (21 na 342), cada um com responsável, data em que precisa estar na obra (vem do cronograma) e data de fechar (precisa − antecedência).
7. **Plano.** Serviços com produtividade e equipes-tipo geram histograma, desembolso e caixa.
8. **Congelamento.** A linha de base vira versão 1. Toda revisão depois (REV11, REV12, REV13…) é nova versão com motivo, autor e diferença item a item.

```latex
\text{Teto do item} = \text{Preço licitado} \times (1 - 0{,}085)
```

Na 342, 8,5% é a soma de ISS (2%) e tributos do lucro presumido (6,5%). A folga entre meta e teto é o espaço que o gerente de contrato tem para aprovar sem chamar a diretoria.

&#91;embedded content: Estudo 342 REV10, aba 11 META - PACOTES · 21 pacotes\]

Sem o ADM, os outros 20 pacotes somam R$ 334 mil de folga; o ADM sozinho consome quase dois terços disso. Em URB, TOPO e ELETS qualquer centavo acima da meta já é assunto da diretoria.

## 6. Fluxo 2 — Compra, da solicitação ao pagamento

A compra só trava quando o preço passa da meta do item. Dentro da meta, ela segue direto para pedido, e cada etapa muda o estado do custo: comprometido no pedido, realizado na nota, pago no banco.

&#91;embedded content: Fluxo de compra por papel · 11 passos, 1 decisão\]

O sistema compara o preço com a meta duas vezes: na solicitação, com o preço que o engenheiro achou, e no mapa, com o preço fechado. Aprovação recusada volta para renegociar ou para remanejar saldo de outro item.

**Alçadas** (os valores em R$ são decisão sua, seção 18)

| Situação no item | Sinal | Quem aprova | Exemplo |
| --- | --- | --- | --- |
| Preço cabe no saldo da meta do item | Verde | Ninguém: vira pedido (acima de um valor absoluto, o gerente confirma) | Retroescavadeira a R$ 16.000/mês contra meta de R$ 17.500 |
| Acima da meta, até o teto | Amarelo | Gerente de contrato, com justificativa escrita | Tubo com o anel que faltou passa da meta de R$ 102 |
| Acima do teto, ou item sem orçamento | Vermelho | Diretoria | Pacote ADM da 342: meta de R$ 650 mil, teto de R$ 439 mil |
| Fora da planilha do contrato | Bloqueado | Ninguém compra antes do registro de mudança e do pedido de preço ao cliente | Solda de termofusão da 343, sem aditivo desde a viabilidade |

**Os seus exemplos rodando no sistema**

| Caso | O que acontece |
| --- | --- |
| Retroescavadeira 30 dias: meta R$ 17.500, fechou R$ 16.000 | Verde, pedido sai. R$ 1.500 de economia aparecem no item de terraplenagem. Operador e diesel entram no mesmo item, cada um com a sua natureza. |
| 100 m de tubo: meta R$ 102, cotação R$ 100 | Verde, pedido sai. |
| Esqueceram o anel do PVC | O anel entra como linha complementar no mesmo item. Se a soma passar de R$ 102, fica amarelo e vai para o gerente. Se o anel não existe na composição, o sistema pergunta a causa: erro de orçamento ou pedido do cliente. |
| Milheiro de tijolo para várias caixas | Duas formas: rateia na solicitação (ex.: 250 tijolos em cada uma de 4 caixas) ou compra para o estoque da obra e apropria no item quando o almoxarife dá saída. Cimento e agregado, igual. |
| Tubo para a obra toda com preço especial | Um pedido, rateado na nota entre vários itens. O sistema exige que a soma feche 100% da nota e avisa qual item ficou acima da meta. |
| Uma compra de FoFo para 342 e 343 | Um pedido, dois centros de custo. Cada obra recebe a sua parte e o seu desvio. |

**Regras do rateio e do pagamento**

- O rateio é manual, como você definiu: o sistema sugere a divisão que veio do pedido, e o administrativo ou o engenheiro ajusta. Máquina nenhuma decide para onde vai o custo.
- Trava: linhas e impostos da nota somam 100%; linha sem obra e item não grava.
- Divergência entre nota e pedido (preço ou quantidade) acima da tolerância volta para Compras antes de virar título.
- Remanejar saldo entre itens é uma operação própria: tira de um item, põe em outro, o total da obra não muda, o gerente aprova e fica registrado.
- Pagamento só com recebimento confirmado. A auditoria achou R$ 20 mil pagos à TAP METAL em 13/10 antes da entrega aceita.

## 7. Fluxo 3 — Serviço, empreiteiro e locação

Serviço e locação passam pelo mesmo semáforo da compra, mas pagam por medição do fornecedor conferida contra o apontamento, não por nota avulsa.

1. **Contrato com o fornecedor.** Escopo, itens do orçamento que ele atende, preço (unitário, global ou por hora), condição de pagamento (no pacote TERRA da 342: medição mensal, pagamento dia 10) e retenções pela regra cadastrada (INSS, ISS e as demais quando couberem).
2. **Semáforo no fechamento.** O valor total do contrato é comparado com a meta dos itens que ele cobre. Mesmas alçadas da seção 6.
3. **Medição do terceiro.** O engenheiro mede a quantidade do período. O sistema compara com a produção apontada naquela frente e avisa quando a medição do terceiro passa do que o campo apontou.
4. **Locação de equipamento.** Período, horímetro, dias parados por chuva ou quebra descontados conforme o contrato. Diesel e operador entram separados, no mesmo item.
5. **Nota e pagamento.** A nota do fornecedor casa com a medição aprovada e segue o rateio e o pagamento da seção 6.
6. **Saldo do contrato.** Contratado menos medido, por item, sempre à vista do gerente.

Critério de escolha não é só preço: capacidade técnica, prazo, saúde financeira e certidões entram na avaliação do fornecedor (erro E19 da auditoria).

## 8. Fluxo 4 — Apontamento diário

O apontamento é o único dado que nasce no campo. Sem ele não existe produtividade medida, histograma real nem valor agregado, e hoje a 05B está vazia nas três obras.

**O que o encarregado lança, por frente e por dia** (os campos da 05B, mais quatro)

| Campo | Para que serve |
| --- | --- |
| Data, obra, frente (item da EAP), equipe | Endereço do dia |
| Serviço, quantidade, unidade | Produção e % físico do item |
| Pessoas por função, hora de entrada e saída | Histograma diário e por hora, HH real |
| Equipamentos com horímetro e horas paradas | Custo de máquina e ociosidade |
| Material aplicado | Saída do estoque da obra para o item |
| Chuva (mm ou período) e solo | Pedido de prazo com prova, comunicado à fiscalização em 48 h |
| Parou? motivo, horas paradas | Causa de não cumprimento no PPC |
| Fotos e observação | Diário de obra e prova de medição |

**Caminho do dado**

1. O encarregado lança no celular, ou manda foto e áudio no WhatsApp e o sistema transcreve em rascunho.
2. O apontador confere até 9h do dia seguinte (a rotina que já está na 00. GUIA).
3. O engenheiro aprova. Dia sem apontamento acende alerta no placar.
4. O sistema calcula sozinho:
   - produção acumulada e % físico por item e por evento;
   - histograma real por função, por dia e por hora, contra o previsto;
   - produtividade real contra a composição do cliente e contra o estudo;
   - custo do dia: gente × custo/dia do banco de mão de obra + horas de máquina + material aplicado;
   - valor agregado do dia: quantidade × custo-meta unitário do item.

O estudo da 342 já prevê 19.026 HH contra 14.635 HH das composições da SANEAGO, 30% a mais. Só o apontamento diz qual dos dois está certo.

## 9. Fluxo 5 — Planejamento Lean, reuniões e tarefas

Só entra no plano da semana o que está sem restrição. O PPC mede se a programação foi confiável, não o esforço da equipe; verde a partir de 80%, amarelo a partir de 60%, como na 01A.

&#91;embedded content: Ciclo semanal Lean · abas 05, 05A, 05B, 05C e 01A\]

A restrição aberta segura a frente no lookahead até alguém removê-la; a reunião de segunda devolve as causas e as tarefas para a rodada seguinte.

**Restrições**

- Cada restrição tem frente (item ou evento), tipo, dono com nome de pessoa, data em que precisa estar resolvida, próximo passo e R$ em jogo. São as 23 colunas da 05C, mais o "como" e o "quanto" que a auditoria cobrou.
- Tipos: interna, cliente, fornecedor, parceiro, projeto; dentro deles, material, equipamento, mão de obra, OS emitida, licença e acesso.
- Restrição automática: pacote de compra com a data de fechar vencida e sem pedido vira restrição na frente que depende dele. É o caso da R05 de hoje (pacote TERRA, fechar até 29/09, vencida).
- Toda remarcação ganha causa e nova data, e o contador de vezes replanejada sobe (lição do reservatório da 281, remarcado três vezes).
- Limite de restrições abertas por pessoa (hoje 8, na 13 CHECKS); passou, o sistema avisa o gerente.

**Reunião de segunda, ata e tarefas**

1. A pauta se monta sozinha: as 10 perguntas, 3 luzes e 1 decisão por obra da 01A, com os números do corte.
2. A reunião é gravada e transcrita (Tactiq). Hoje a sua conta no Tactiq permite buscar e listar reuniões; transcrição e resumo exigem o plano Team.
3. A transcrição vira ata no formato 1 linha = 1 ação, com o quê, quem, quando, por quê, onde, como e quanto. O gerente confirma antes de publicar.
4. Cada ação vira tarefa no Kanban do sistema, ligada à obra e, quando couber, à restrição ou ao item. ClickUp e Monday, que já estão conectados à sua conta, podem espelhar as tarefas.
5. O painel de tarefas mostra abertas, vencidas e concluídas por dono e por obra.

## 10. Fluxo 6 — Medição, faturamento e recebimento

O sistema acompanha cada evento do campo até o dinheiro na conta, e só deixa medir o que a regra do contrato permite.

**Estados de cada evento** (hoje a planilha só tem estados do dinheiro)

Executado → inspecionado pela TAF → testado → atestado pela fiscalização → medido no BM → faturado → recebido. Depois: as built e cadastro, recebimento provisório, recebimento definitivo, entrega à operação.

**Regras que vêm do cadastro do contrato**

| Obra | Regime | Regra de medição | Calendário |
| --- | --- | --- | --- |
| 342 SANEAGO UTR | Preço global por evento (Anexo VII) | Evento UN só paga concluído e atestado; percentual proporcional ao avanço | Boletim fecha dia 20, nota no último dia do mês, pagamento em 30 dias |
| 343 CAESB Sobradinho | Preço unitário | Quantidade executada × preço | Pelo edital (item 2.16) |
| 281 SANEAGO Mozarlândia | Eventograma, consórcio | Evento concluído; material em canteiro só com Termo de Guarda | Reajuste por BM em nota separada |

**Do BM ao caixa**

1. O engenheiro monta o BM a partir dos eventos atestados; o sistema mostra o previsto do mês e o IDP por pacote, não só o acumulado. Na 281, os BMs oscilaram de 41,5% a 146% do previsto.
2. Fiscalização aprova ou glosa; glosa volta com a memória de cálculo corrigida.
3. Antes de emitir a nota, o sistema confere as certidões (CND) da TAF e do parceiro. Na 281 elas venceram sem ninguém ver.
4. Nota de serviço no município da obra, com ISS e retenções pela regra cadastrada.
5. Recebimento conciliado com o banco; diferença entre esperado e recebido vira pendência.
6. Antecipação de nota entra como custo financeiro da obra (1,96% ao mês na 281).
7. Reajuste: data do pedido, protocolo, índice, valor pedido e valor pago, por obra.

## 11. Fluxo 7 — Fechamento do mês e resultado

O mês fecha em um dia porque tudo já entrou amarrado; o sistema só pede conferência e bloqueia o fechamento se algo estiver solto.

1. **Corte.** Data de gestão do mês (hoje a célula B5 da 02).
2. **Campo conferido.** Todos os dias úteis com apontamento aprovado.
3. **Receita.** BM do mês lançado, com estado de cada evento.
4. **Custo.** 100% das notas de entrada rateadas; provisão do que foi consumido e ainda não faturado (folha, encargos, locação, medição de terceiro), para o custo ficar no mês certo.
5. **Valor agregado.** O sistema calcula por item, pacote, evento e obra:

```latex
\begin{aligned}
VA_{custo} &= \textstyle\sum (\text{quantidade executada} \times \text{custo-meta unitário}) \\
IDC &= VA_{custo} \div \text{custo realizado} \\
IDP &= \text{medido aprovado} \div \text{medição prevista até o último BM} \\
EAC &= \text{custo realizado} + (\text{custo-meta total} - VA_{custo}) \div IDC
\end{aligned}
```

6. **Resultado.** DRE por obra (medido − tributos − custo) e da carteira, contra o estudo vigente.
7. **Caixa.** Previsto contra realizado, pior ponto e quando ele acontece, com atraso de recebimento simulado em 15, 30 e 60 dias.
8. **Travas.** As 18 conferências da aba 13 viram regras: o mês não fecha com nota sem obra, BM sem nota, medido acima do contrato ou custo previsto incompleto.
9. **Decisão.** O comitê trimestral olha o resultado e o caixa de cada obra e decide: seguir, renegociar, aportar ou parar. Os gatilhos de obra deficitária são escritos antes.

## 12. DRE e plano de contas

O DRE segue a estrutura da Lei 6.404 (art. 187) e é o mesmo para cada obra e para a empresa: o da empresa é a soma das obras mais a administração central. O custo de obra (materiais, mão de obra direta, canteiro) fica separado das despesas da sede ([Sienge, DRE na construção civil](https://sienge.com.br/blog/dre-construcao-civil/)). O plano de contas tem 4 níveis e mantém as 8 contas de hoje.

**DRE da obra e da empresa**

| Linha | Como o sistema calcula | Contas |
| --- | --- | --- |
| Receita bruta de obras | BM aprovado + reajuste + aditivos | 3.1 |
| (−) Deduções | ISS do município da obra, PIS, COFINS, glosas | 3.2 |
| (=) Receita líquida |  |  |
| (−) Custo direto da obra | Mão de obra, materiais, máquinas e terceiros, rateados nos itens | 4.1 a 4.4 |
| (−) Custo indireto da obra | Administração local, canteiro, seguros da obra, provisão para perda | 4.5 e 4.6 |
| (=) Resultado da obra | A linha que a 08C já calcula, agora aberta por item |  |
| (−) Administração central | Sede, rateada por obra pela receita | 5 |
| (±) Resultado financeiro | Antecipação de recebíveis, juros, tarifas, rendimentos | 6 |
| (=) Resultado antes do IRPJ e da CSLL |  |  |
| (−) IRPJ e CSLL | Lucro presumido, por trimestre | 7 |
| (=) Lucro líquido |  |  |

**Duas visões do resultado da obra**

- **Pelo medido:** o que o cliente aprovou no BM. É o gerencial de hoje (08C) e o que vira caixa.
- **Pelo executado:** avanço pelo custo incorrido sobre o custo total estimado, como o CPC 47 pede para obra reconhecida ao longo do tempo ([Planning, CPC 47](https://planning.com.br/reconhecimento-receita-contratos-longo-prazo/)). A diferença para o medido vai para ativo de contrato (executado e não medido) ou passivo de contrato (medido acima do executado).
- **Na 342 as duas se afastam:** o evento UN só paga concluído. Olhar só o medido mostra prejuízo que não existe nos primeiros meses; olhar só o executado esconde o buraco de caixa.
- **Contrato oneroso:** quando o custo total estimado passa da receita, a perda inteira é provisionada no mês em que a estimativa se confirma, sem diluir na obra. Pela REV13, a 342 está nessa situação (−R$ 231 mil).
- **Consórcio (281):** o DRE da TAF leva só a participação dela, quando o termo do consórcio chegar (08C, célula B39).

**Tributos sobre a receita no lucro presumido**

A premissa única de 6,5% da 02 PARÂMETROS não vale para todo contrato. A presunção depende de a empreitada ter fornecimento total de materiais e, desde 2026, sobe 10% na receita acima de R$ 5 milhões por ano ([presunção na construção](https://tributodevido.com.br/portal/percentuais-de-presuncao-no-lucro-presumido-para-construcao-civil-com-fornecimento-de-materiais/); [alíquotas e LC 224/2025](https://triviumcontabil.com.br/lucro-presumido-como-funciona/)).

| Tributo | Empreitada com todos os materiais | Só mão de obra ou material parcial |
| --- | --- | --- |
| PIS e COFINS cumulativos | 3,65% | 3,65% |
| IRPJ: 15% sobre a presunção | 8% de presunção: 1,20% | 32% de presunção: 4,80% |
| Adicional de IRPJ: 10% da base acima de R$ 60 mil por trimestre | até 0,80% | até 3,20% |
| CSLL: 9% sobre a presunção | 12% de presunção: 1,08% | 32% de presunção: 2,88% |
| Total sobre a receita, sem ISS | 5,93% a 6,73% | 11,33% a 14,53% |

Na receita acima de R$ 1,25 milhão por trimestre, a presunção com materiais vai a 8,8% (IRPJ, desde 01/01/2026) e 13,2% (CSLL, desde 01/04/2026), e a carga chega a 7,04%. O ISS soma de 2% a 5%, conforme o município. O sistema calcula por contrato e por trimestre e marca o contrato sem fornecimento total de materiais, onde a carga dobra. Valide com o contador antes de usar.

**Contas de resultado**

A natureza fica no cadastro do insumo, não na mão de quem lança: cimento cadastrado em 4.2.03 cai em 4.2.03 em toda nota, e o usuário só escolhe o item do orçamento.

| Código | Conta | Hoje (08) | Natureza na composição |
| --- | --- | --- | --- |
| 3.1 | Receita bruta de obras | — | — |
| 3.1.01 | Medições de contratos (BM) | — | — |
| 3.1.02 | Reajuste contratual | — | — |
| 3.1.03 | Aditivos e serviços extras | — | — |
| 3.2 | Deduções: ISS, PIS, COFINS, glosas e descontos | TRIB | — |
| 4.1 | Mão de obra de campo | MO | Mão de obra |
| 4.1.01 | Salários de produção, horas extras e adicionais | MO | Mão de obra |
| 4.1.02 | Encargos sociais e provisões (férias, 13º, rescisão) | MO | Mão de obra |
| 4.1.03 | Benefícios: transporte, alimentação, cesta | MO | Mão de obra |
| 4.2 | Materiais | MAT | Material e equipamento fornecido |
| 4.2.01 | Tubos e conexões (FoFo, PVC, PEAD, concreto) | MAT | Material |
| 4.2.02 | Válvulas, registros, ventosas e peças especiais | MAT | Material |
| 4.2.03 | Cimentos, agregados, argamassas e alvenaria | MAT | Material |
| 4.2.04 | Concreto usinado, aço e formas | MAT | Material |
| 4.2.05 | Elétrica e automação | MAT | Material |
| 4.2.06 | Impermeabilização e geossintéticos | MAT | Material |
| 4.2.07 | Equipamentos permanentes fornecidos (bombas, guindaste) | MAT | Equipamento fornecido |
| 4.2.08 | Material de consumo e ferramentas | MAT | Material |
| 4.3 | Máquinas e veículos de produção | EQP | Máquinas e veículos |
| 4.3.01 | Locação de máquinas, com ou sem operador | EQP | Máquinas |
| 4.3.02 | Combustíveis e lubrificantes | EQP | Máquinas |
| 4.3.03 | Manutenção, peças e hora de equipamento próprio | EQP | Máquinas |
| 4.4 | Terceiros e empreiteiros | TER | Serviços de terceiros |
| 4.4.01 | Empreitada de mão de obra | TER | Terceiros |
| 4.4.02 | Serviços técnicos: topografia, sondagem, ensaios | TER | Terceiros |
| 4.4.03 | Transporte, carga e bota-fora | TER | Terceiros |
| 4.5 | Custo indireto da obra | ADM | Indireto da obra |
| 4.5.01 | Equipe técnica e administrativa local | ADM | Indireto |
| 4.5.02 | Canteiro: mobilização, contêineres, ligações | ADM | Indireto |
| 4.5.03 | Alojamento, alimentação e utilidades | ADM | Indireto |
| 4.5.04 | Segurança do trabalho, EPI e exames | ADM | Indireto |
| 4.5.05 | Veículos de apoio, TI, telefonia e impressão | ADM | Indireto |
| 4.5.06 | Projetos executivos, ART, taxas e licenças | ADM | Indireto |
| 4.5.07 | Seguros e garantias da obra | SEG | Indireto |
| 4.6 | Provisão para perda em contrato oneroso | — | — |
| 5.1 | Pessoal da sede: pró-labore, salários, encargos | — | BDI |
| 5.2 | Ocupação e serviços da sede: aluguel, contabilidade, jurídico, TI | — | BDI |
| 5.3 | Comerciais e de propostas: editais, garantia de proposta, visitas | — | BDI |
| 6.1 | Despesas financeiras: juros, tarifas, IOF | FIN | BDI |
| 6.2 | Custo de antecipação de recebíveis | FIN | BDI |
| 6.3 | Receitas financeiras: rendimentos | FIN | — |
| 7.1 | IRPJ | TRIB | BDI |
| 7.2 | CSLL | TRIB | BDI |

**Contas patrimoniais que o sistema movimenta**

| Código | Conta | Quando o sistema lança |
| --- | --- | --- |
| 1.1.01 | Caixa e bancos | Pagamento e recebimento conciliados |
| 1.1.02 | Medições a receber | Nota do BM emitida |
| 1.1.03 | Ativo de contrato: executado e não medido | Fechamento do mês, pela visão do executado |
| 1.1.04 | Retenções contratuais e cauções a receber | BM com retenção ou caução |
| 1.1.05 | Tributos retidos a compensar | INSS, IR e contribuições retidos na nota do BM |
| 1.1.06 | Estoque de obra | Material comprado para o almoxarifado, antes da saída para o item |
| 1.1.07 | Adiantamentos a fornecedores | Pagamento antes da entrega, só com aprovação |
| 1.2 | Imobilizado: equipamentos e veículos | Compra de bem próprio |
| 2.1.01 | Fornecedores e empreiteiros | Nota de entrada rateada |
| 2.1.02 | Salários e encargos a pagar | Folha do mês |
| 2.1.03 | Tributos a recolher | Nota do BM e apuração trimestral |
| 2.1.04 | Retenções de terceiros a recolher | INSS e ISS retidos na nota do fornecedor |
| 2.1.05 | Passivo de contrato: medido acima do executado | Fechamento do mês |
| 2.1.06 | Empréstimos e antecipação de recebíveis | Antecipação de nota |
| 2.1.07 | Provisão para perda em contratos | Estudo vigente com custo acima da receita |
| 2.3 | Patrimônio líquido | Aporte de capital de giro dos sócios |

Os 9 grupos que o consórcio da 281 usa (materiais, pessoal, alojamento, administrativo, engenharia PJ, terceiros, segurança, locação, combustíveis) entram como de-para na importação do histórico.

## 13. Camada PMBOK

Os 7 domínios de desempenho do PMBOK 8 viram telas do sistema, e cada um dos 21 erros da auditoria vira uma trava ou um alerta. A 8ª edição saiu em novembro de 2025, com 6 princípios, 7 domínios, 5 áreas de foco (iniciação a encerramento) e 40 processos adaptáveis ([PMI](https://www.pmi.org/PMBOK-guide); [resumo da 8ª edição](https://pmstudycircle.com/pmbok-guide-8th-edition/)).

| Domínio | O que o sistema entrega |
| --- | --- |
| Governança | Linha de base congelada, versão vigente única, alçadas, comitê trimestral, trilha de auditoria |
| Escopo | EAP do contrato, escopo negativo, registro de mudanças e aditivos, estados físicos de cada evento |
| Cronograma | Cronograma com rede, lookahead, compromisso semanal, PPC e causas |
| Finanças | Custo-meta e teto, comprometido, realizado, EVM, DRE por obra, caixa |
| Partes interessadas | Quem é quem por obra, plano de comunicação, sugestões do campo |
| Recursos | Histograma previsto e real, capacidade contra demanda entre obras, fornecedores avaliados |
| Riscos | Registro com P×I, resposta, gatilho e dono; chuva medida; lições aprendidas ligadas a obras novas |

**Os 21 erros da auditoria de 15/10 e onde cada um morre**

| Erro | Título | Trava ou função no sistema |
| --- | --- | --- |
| E01 | Estou tocando o projeto | Obra sem linha de base não abre compra |
| E02 | Não tenho tempo para planejar | Restrição com dono, próximo passo e R$ em jogo |
| E03 | Como está indo? Legal! | IDP e IDC por evento e pacote, não só o total |
| E04 | Isso vai ficar para uma segunda fase | Escopo negativo e aceite formal no contrato |
| E05 | Preciso disso até sexta | Compromisso só com quantidade confirmada pelo encarregado |
| E06 | Precisamos melhorar nossa produtividade | Produtividade medida pelo apontamento |
| E07 | É culpa da chuva | Chuva apontada todo dia e alerta de comunicado em 48 h |
| E08 | Auditoria? Preciso atualizar a documentação | Versão vigente única e trilha automática |
| E09 | Ninguém me falou nada sobre isso | Partes interessadas e canais por obra |
| E10 | Não era bem isso que eu queria | Registro de mudanças com aprovação do cliente |
| E11 | Vamos precisar refazer tudo | Premissas contratuais estruturadas no cadastro |
| E12 | Terminei, mas ainda falta pôr em produção | Estados físicos do evento até o recebimento definitivo |
| E13 | Temos que encantar o cliente | Nada fora da planilha sem pedido de preço |
| E14 | O comercial vende até a mãe | Checklist de proposta e critério de aceite de obra |
| E15 | Santo de casa não faz milagre | Sugestões do campo com dono e ganho |
| E16 | Na hora H, os recursos não estão disponíveis | Capacidade contra demanda e regra de prioridade entre obras |
| E17 | Quem é você? Não tenho tempo | Cadastro único de pessoas, empresas, fiscais e ART |
| E18 | Isso já foi tentado aqui | Obra piloto, campeão nomeado e adesão medida no placar |
| E19 | Vamos fazer na Índia, que é mais barato | Avaliação de fornecedor e pagamento só após entrega aceita |
| E20 | Fala com o Fulano que ele tem as lições aprendidas | Lições revisadas a cada BM e ligadas às restrições |
| E21 | Vamos assumir o prejuízo e entregar o projeto | Gatilhos de obra deficitária e comitê trimestral |

## 14. BI: painéis e indicadores

São 10 painéis, todos lidos dos mesmos registros, sem exportação. O desenho de cada um entra quando você mandar o layout dos dashboards.

| Painel | Pergunta que responde | Indicadores | Para quem |
| --- | --- | --- | --- |
| Carteira | Como estão todas as obras hoje? | Contratado, medido, recebido, custo, resultado, caixa, IDP, IDC, luzes | Diretoria |
| Obra | Vai dar lucro e no prazo? | Curva S física e financeira, EAC, desvio por pacote e item | Gerente de contrato |
| Compras | Estou comprando dentro da meta? | Comprometido contra meta por pacote, economia e estouro, pacotes a fechar em 30 dias, aprovações paradas por alçada | Compras e gerente |
| Produção | O campo rende o que o plano diz? | Produção diária por frente, produtividade real contra composição e estudo, HH | Engenheiro |
| Histograma | Tenho a gente e a máquina certas? | Efetivo previsto e real por função, por dia, semana, mês e hora; equipamentos | Engenheiro e planejamento |
| Lean | A programação é confiável? | PPC semanal, Pareto das causas, restrições abertas e vencidas por dono e tipo | Reunião de segunda |
| Caixa | Quando falta dinheiro e quanto? | Calendário do dinheiro previsto e real, pior ponto, capital de giro, atraso de recebimento | Diretoria e financeiro |
| Medição | O feito já virou dinheiro? | Previsto, enviado, aprovado, faturado e recebido por BM; IDP do mês por pacote | Gerente e financeiro |
| Resultado | Quanto cada obra deu? | DRE por obra e consolidado, margem contra o estudo vigente | Diretoria |
| Riscos e mudanças | O que pode estourar e o que estou cobrando do cliente? | Exposição P×I, aditivos em negociação, serviços fora da planilha | Gestão e diretoria |

## 15. Integrações

A integração que mais tira digitação é a da nota de compra: o XML chega sozinho e o administrativo só faz o rateio.

| Integração | Para quê | Como funciona |
| --- | --- | --- |
| NF-e de compra | Nota emitida contra o CNPJ da TAF entra sem digitação | Manifestação do destinatário: chega o resumo (emitente, chave, valor), o sistema dá ciência e baixa o XML completo; a manifestação final vai em até 180 dias ([Focus NFe](https://focusnfe.com.br/produtos/manifestacao-destinatario-mde/)) |
| NFS-e tomada (serviço e locação) | Nota de terceiro de serviço | Fluxo separado da NF-e: API de NFS-e ou upload do PDF/XML |
| NFS-e emitida (BM) | Faturar a medição | Emissor do município da obra: Santo Antônio do Descoberto, Brasília, Mozarlândia |
| Bancos | Pagar e conciliar | Extrato por API ou OFX para conciliação; remessa de pagamentos em lote |
| Sankhya, na transição | Rodar em paralelo sem redigitar | API Gateway com OAuth 2.0; REST para naturezas, centros de resultado, projetos e financeiro (consultar, registrar, baixar); notas pelo REST só em consulta ([Sankhya Developer](https://developer.sankhya.com.br/docs/api-de-servi%C3%A7os)) |
| Tactiq | Transcrição da reunião para ata | Busca e lista já funcionam na sua conta; transcrição e resumo pedem o plano Team |
| ClickUp ou Monday | Espelhar tarefas, se a equipe já usa | Os dois estão conectados à sua conta; o Kanban do sistema continua sendo a fonte |
| WhatsApp | Apontamento e consulta do campo | Encarregado manda foto e áudio; volta rascunho para o apontador confirmar |
| INMET | Chuva média por mês na região da obra | Base para o fator de chuva do plano e para pedido de prazo |
| Índices de reajuste | Reajuste do contrato | Índices da fórmula do contrato (na 342, 8 índices) |

## 16. De-para: cada aba vira um módulo

As 100 abas cabem em 12 módulos. Nenhuma lógica sua se perde; o que some é a cópia de valor entre arquivos e a conferência manual.

| Módulo do sistema | Abas de hoje | O que muda |
| --- | --- | --- |
| M01 Cadastros e contratos | TAF: 02 PARÂMETROS, 03 CONTRATOS. Estudo: 02 CONTRATO, 18 BANCO MO, 19 ENCARGOS, 20 EQUIPES, 34 CALENDÁRIO, 35 BANCO DE EQUIPAMENTOS | Um cadastro para todas as obras; feriados, ISS e premissas por obra |
| M02 Viabilidade e proposta | Viabilidade: RESUMO, CUSTO DIRETO, CUSTO INDIRETO, DIMENSIONAMENTO DE EQUIPES, BD, CPUs INTERNAS, BANCO EQP, CPU, ANALÍTICA, ABC, ABC INSUMO, ABC SERVIÇO, COTAÇÃO, PLANILHA, ÍNDICE CIVIL. Estudo: 03 PREMISSAS, 04 CENÁRIOS | Importação nativa no lugar das macros; cenários lado a lado |
| M03 Orçamento e custo-meta | Estudo: 06 ORÇAMENTO ANALÍTICO, 11 e 12 META, 24 e 25 CPU SANEAGO, 31 COMPOSIÇÃO POR ITEM. TAF: 04 PLANO DAS OBRAS, LINHA DE BASE. Arquivo META DE COMPRA | EAP única com meta, teto, fonte e versão |
| M04 Planejamento | Estudo: 05 EVENTOGRAMA, 13 a 15 EVENTOGRAMA REV02, 21 a 30 HISTOGRAMAS, 32 e 33, 36 EQUIPES-TIPO, 37 PLANO, 38 a 40 HISTOGRAMAS. TAF: CRONOGRAMA PROJECT, HISTOGRAMA PLANEJADO | Plano recalcula ao mudar produtividade; real ao lado do previsto |
| M05 Suprimentos | Estudo: 11 e 12 META. Arquivo META DE COMPRA | Solicitação, cotação, pedido e contrato de serviço com semáforo |
| M06 Notas e contas a pagar | TAF: 08 CUSTOS, 08D LANÇAMENTOS 281 | Nota com rateio no lugar do lançamento por conta; a 08D vira importação do histórico |
| M07 Campo | TAF: 05B APONTAMENTO DIÁRIO | Celular e WhatsApp, com fotos |
| M08 Lean e gestão semanal | TAF: 05 SEMANAS, 05A COMPROMISSO, 05C RESTRIÇÕES, 01A GESTÃO DA SEMANA, PAUTA DE SEGUNDA. Estudo: 16 O QUE PEDIR, 17 PENDÊNCIAS | Pauta automática, ata e Kanban |
| M09 Medição e faturamento | TAF: 06 MEDIÇÃO, 07 FATURAMENTO. Estudo: 07 MEDIÇÃO POR CENÁRIO, 23 REAJUSTE | Estados físicos do evento e travas de CND |
| M10 Controle e resultado | TAF: 08A, 08B, 08C, 10 CAIXA, 12 EVM, FLUXO PROJETADO. Estudo: 00 RESULTADO, 01 RESUMO, 08 a 10 DESEMBOLSO E CAIXA | Fecha sozinho a partir dos lançamentos |
| M11 Governança | TAF: 13 CHECKS, CHECKS DA OPERAÇÃO, 14 FONTES, 15 CHANGELOG. Arquivo AUDITORIA 21 ERROS | Conferências viram travas; fontes e changelog viram trilha automática |
| M12 BI | TAF: 01 PAINEL, 01C PLACAR, DASHBOARD BI. Estudo: 30 HISTOGRAMAS COMPARADOS, 32 GRÁFICOS | 10 painéis da seção 14 |

Navegação e rotina (TAF: 00 GUIA, 00A MENU, 00A CICLO DA OBRA) viram a tela inicial de cada papel: o que fazer hoje, na semana e no mês.

## 17. Implantação por fases

A implantação começa pela 342 e o Sankhya só é desligado na última fase, depois de pelo menos um fechamento mensal rodando em paralelo.

&#91;embedded content: Implantação · 4 fases, 4 portões\]

- **Por que a 342 primeiro:** o canteiro começa em 19/10, não há histórico para migrar, e orçamento analítico, meta e plano já existem.
- **Sankhya na transição:** continua emitindo e escriturando até a Fase 3. Na Fase 1 o sistema lê dele, pela API, naturezas, centros de resultado e financeiro, para ninguém digitar duas vezes.
- **281:** entra na Fase 2 com a 08D importada como histórico e com o custo-meta que ainda falta (pauta de segunda, linha 73, prazo 30/10/2026).
- **343:** entra na Fase 2 com o motor de planejamento dela e o custo do estudo como linha de base.

## 18. Decisões que são suas

Sete decisões travam o início da construção; a primeira e a segunda definem o tamanho do projeto.

- [ ] **Fiscal e contábil.** Substituir o Sankhya inteiro inclui escrituração e obrigações fiscais, a parte mais cara e onde ERP genérico ganha. Opções: construir; integrar um módulo fiscal de terceiro; ou o sistema faz gestão, compras e financeiro e exporta para o contador.
- [ ] **Quem constrói.** Time próprio, software house, ou um MVP rápido no Lovable com banco Supabase, que já estão conectados à sua conta.
- [ ] **Valores de alçada.** Limite em R$ do verde sem confirmação, limite do gerente, tolerância entre nota e pedido.
- [ ] **Obra piloto.** Proposta: a 342, que começa o canteiro em 19/10 sem histórico para migrar.
- [ ] **Plano de contas.** Validar com o contador o plano de contas e a carga tributária da seção 12, contrato por contrato.
- [ ] **Versões vigentes.** Mandar o estudo REV13 e a META REV02; recebi a REV10 e a META marcada como substituída.
- [ ] **Tarefas.** Kanban próprio como fonte, com ou sem espelho no ClickUp ou Monday; plano Team do Tactiq para a ata automática.

### Fontes

- [Prevision (Sienge)](https://sienge.com.br/prevision.md) e [Prevision Gestão de Custos](https://sienge.com.br/prevision-gestao-custos/)
- [PMBOK Guide, PMI](https://www.pmi.org/PMBOK-guide) e [resumo da 8ª edição](https://pmstudycircle.com/pmbok-guide-8th-edition/)
- [Manifestação do destinatário, Focus NFe](https://focusnfe.com.br/produtos/manifestacao-destinatario-mde/)
- [API de serviços, Sankhya Developer](https://developer.sankhya.com.br/docs/api-de-servi%C3%A7os)
- Suas planilhas: Viabilidade CAESB Sobradinho REV00; TAF Gestão e Operação rev6; Obra 342 Estudo de Obra Interno REV10; Obra 342 Meta de Compra; Auditoria 21 erros rev4
