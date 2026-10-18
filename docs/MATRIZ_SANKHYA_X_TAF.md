# Matriz: inventário do Sankhya × TAF Obras

Fonte: `fontes/Pesquisa_extensa_o_que_o_Sankhya_faz.md` (276 entradas com identificador). **Decisão do usuário (18/10/2026): não integrar com o Sankhya; criar as funções equivalentes dentro do TAF Obras.** O que exige certificado, banco, Sefaz ou lei fica como relatório/arquivo de apoio; o que é de outro ramo (varejo, agro, indústria, WMS, TMS, marketplaces) não será feito.

**Status final (Fase 18):** as decisões "Fazer" e "Fazer simplificado" foram entregues nas fases indicadas, cada fase com testes automatizados do que foi construído (`scripts/e2e_fase*.js`, `supabase/tests/*.sql`); a matriz não é um teste item a item do inventário. As decisões "Não fazer" estão justificadas na coluna Observação (serviço de terceiro, base licenciada ou fora do escopo de obra).

Resumo: **63 fazer**, **26 fazer simplificado**, **187 não fazer**, 0 sem decisão.

Fase: números do plano (12 base e cadastros, 13 financeiro, 14 contábil/fiscal, 15 suprimentos e estoque, 16 contratos/projetos/patrimônio/frota, 17 pessoas, gestão e administração); número isolado menor que 12 indica fase já entregue.

| ID | Capacidade | Decisão | Fase | Observação |
|---|---|---|---|---|
| FP-01 | Gerenciar contas a pagar e receber, títulos reais/provisões e situação de quitação. | Fazer | 13 | Título único pagar/receber, baixa múltipla, juros/multa/desconto, renegociação |
| FP-02 | Classificar movimentações por natureza, centro de resultado, empresa e origem. | Fazer | 13 | Título único pagar/receber, baixa múltipla, juros/multa/desconto, renegociação |
| FP-03 | Efetuar baixas de títulos, inclusive múltiplos, com modalidades de agrupamento configuráveis. | Fazer | 13 | Título único pagar/receber, baixa múltipla, juros/multa/desconto, renegociação |
| FP-04 | Calcular juros, multas e descontos na baixa segundo parâmetros. | Fazer | 13 | Título único pagar/receber, baixa múltipla, juros/multa/desconto, renegociação |
| FP-05 | Renegociar dívidas, agrupar títulos e mudar valores ou vencimentos. | Fazer | 13 | Título único pagar/receber, baixa múltipla, juros/multa/desconto, renegociação |
| FP-06 | Gerar arquivos de remessa bancária para cobrança/pagamento com layouts e filtros. | Fazer simplificado | 13 | CNAB 240 em layout genérico, a validar com o banco; sem envio ao banco |
| FP-07 | Agendar a geração de remessas bancárias e consultar seu histórico. | Fazer simplificado | 13 | CNAB 240 em layout genérico, a validar com o banco; sem envio ao banco |
| FP-08 | Conciliar extratos importados em texto/CNAB e OFC/OFX. | Fazer | 13 | Conciliação OFX/CSV e fluxo de caixa |
| FP-09 | Acompanhar fluxo de caixa, provisões, movimentações bancárias e ciclo financeiro. | Fazer | 13 | Conciliação OFX/CSV e fluxo de caixa |
| FP-10 | Programar eventos de cobrança antes, no ou após vencimento e após baixa. | Fazer simplificado | 13 | Régua de cobrança com mensagem pronta; envio manual |
| FP-11 | Registrar execução, sucesso/falha e títulos alcançados pela régua de cobrança. | Fazer simplificado | 13 | Régua de cobrança com mensagem pronta; envio manual |
| FP-12 | Disparar cobrança por WhatsApp com boleto ou DANFE por integração com Neppo. | Não fazer |  | WhatsApp por API de terceiro; fica o link manual |
| FP-13 | Boleto Rápido: emissão, alteração, cancelamento e conciliação por API; boleto híbrido com Pix. | Não fazer |  | Boleto, Pix, pagamento, DDA e Score exigem API bancária/serviço contratado |
| FP-14 | Pix Imediato: cobrança via API com retorno, baixa e conciliação automáticos. | Não fazer |  | Boleto, Pix, pagamento, DDA e Score exigem API bancária/serviço contratado |
| FP-15 | Pague Rápido: pagamento de boletos, até três níveis de aprovação e rastreamento do título. | Não fazer |  | Boleto, Pix, pagamento, DDA e Score exigem API bancária/serviço contratado |
| FP-16 | Busca DDA: captura boletos contra a empresa e vincula-os às contas a pagar. | Não fazer |  | Boleto, Pix, pagamento, DDA e Score exigem API bancária/serviço contratado |
| FP-17 | Sankhya Score: análise de risco com dados/IA, capacidade de pagamento e ofertas de crédito. | Não fazer |  | Boleto, Pix, pagamento, DDA e Score exigem API bancária/serviço contratado |
| FP-18 | Painéis de receitas, despesas, agenda, fluxo de caixa, DRE, comparativos e tesouraria. | Fazer | 13 | Painéis de receita, despesa, agenda, caixa e DRE |
| FP-19 | Configurar plano de contas e vínculo com plano referencial para escrituração. | Fazer | 14 | Plano de contas contábil e referencial |
| FP-20 | Integrar os eventos da folha à contabilidade, inclusive exceções por folha/departamento. | Fazer simplificado | 14 | Só custo de pessoal por obra, não a folha legal |
| FP-21 | Produzir Diário, Razão e balancetes. | Fazer | 14 | Diário, razão, balancete, DRE, balanço e bloqueio retroativo |
| FP-22 | Produzir DRE contábil e balanço patrimonial. | Fazer | 14 | Diário, razão, balancete, DRE, balanço e bloqueio retroativo |
| FP-23 | Bloquear lançamentos, edições e exclusões retroativas após fechamento contábil/fiscal. | Fazer | 14 | Diário, razão, balancete, DRE, balanço e bloqueio retroativo |
| FP-24 | Elaborar orçamento contábil e comparar orçado, realizado e desvio por departamentos/naturezas. | Fazer | 14 | Orçamento contábil, metas, limites e liberação |
| FP-25 | Controlar metas/orçamentos financeiros, limites de despesas, alertas e solicitações de liberação. | Fazer | 14 | Orçamento contábil, metas, limites e liberação |
| FP-26 | Planejamento Orçamentário: versões, premissas, projeções de pessoal, aprovações e DRE comparativa. | Fazer simplificado | 14 | Versões do orçamento; sem projeção de pessoal |
| FP-27 | Escriturar livros de entradas, saídas, serviços, ICMS/IPI, produção, estoque e inventário. | Fazer simplificado | 14 | Livros como relatório |
| FP-28 | Gerar SINTEGRA, SPED Fiscal e SPED Contribuições. | Não fazer |  | SPED, ECD/ECF, LALUR, Reinf e IBS/CBS: só arquivo de apoio ao contador, sem transmissão |
| FP-29 | Gerar ECD e ECF, com configurações de blocos e contas referenciais. | Não fazer |  | SPED, ECD/ECF, LALUR, Reinf e IBS/CBS: só arquivo de apoio ao contador, sem transmissão |
| FP-30 | Apurar IRPJ/CSLL no Lucro Real, adições/exclusões e controle LALUR/LACS. | Não fazer |  | SPED, ECD/ECF, LALUR, Reinf e IBS/CBS: só arquivo de apoio ao contador, sem transmissão |
| FP-31 | Gerar/transmitir EFD-Reinf, incluindo grupos 2000/4000, fechamento e acompanhamento de retorno. | Não fazer |  | SPED, ECD/ECF, LALUR, Reinf e IBS/CBS: só arquivo de apoio ao contador, sem transmissão |
| FP-32 | Cadastrar processos administrativos/judiciais para Reinf, EFD-Contribuições e referências em NF-e. | Não fazer |  | SPED, ECD/ECF, LALUR, Reinf e IBS/CBS: só arquivo de apoio ao contador, sem transmissão |
| FP-33 | Parametrizar o motor de cálculo de IBS, CBS e IS no módulo Livros Fiscais. | Não fazer |  | SPED, ECD/ECF, LALUR, Reinf e IBS/CBS: só arquivo de apoio ao contador, sem transmissão |
| FP-34 | Auditar XML/documentos fiscais e cruzar informações de SPEDs para encontrar inconsistências. | Não fazer |  | Auditoria tributária e monitoramento exigem base fiscal licenciada |
| FP-35 | Consultar/sanear regras tributárias de produtos e apoiar cadastro com tributação definida. | Não fazer |  | Auditoria tributária e monitoramento exigem base fiscal licenciada |
| FP-36 | Monitorar alterações por NCM/UF, alertas, benefícios e vigências futuras. | Não fazer |  | Auditoria tributária e monitoramento exigem base fiscal licenciada |
| FP-37 | Capturar NFS-e de serviços tomados e integrar dados à escrituração do ERP. | Fazer simplificado | 10 | XML de NF-e importado à mão; captura automática por provedor (função pronta, sem credencial) |
| FP-38 | Simular impactos e apoiar planejamento da Reforma Tributária com Reforma 360º. | Não fazer |  | Reforma 360º e recuperação de créditos: serviço especializado |
| FP-39 | Revisar histórico fiscal para identificar oportunidades de recuperação de créditos. | Não fazer |  | Reforma 360º e recuperação de créditos: serviço especializado |
| FP-40 | Controlar o ciclo patrimonial da aquisição à baixa, integrado a compras, financeiro e contabilidade. | Fazer | 16 | Bens, depreciação, localização, seguro e baixa |
| FP-41 | Calcular depreciação mensal fiscal/contábil, com configurações de ajuste e pró-rata. | Fazer | 16 | Bens, depreciação, localização, seguro e baixa |
| FP-42 | Controlar localização, inventário, seguros, manutenção e reavaliação dos bens; apoiar CIAP/EFD-Contribuições. | Fazer | 16 | Bens, depreciação, localização, seguro e baixa |
| FP-43 | Solicitar, aprovar e prestar contas de adiantamentos e reembolsos. | Fazer simplificado | 17 | Adiantamentos e despesas por colaborador e centro de custo |
| FP-44 | Gerenciar cartões corporativos, comprovantes e despesas por colaborador/centro de custo/política. | Fazer simplificado | 17 | Adiantamentos e despesas por colaborador e centro de custo |
| FP-45 | Auditar despesas com Barista IA, detectar duplicidades/desvios e automatizar aprovações conforme políticas. | Não fazer |  | Cartão, Pix de despesa, benefícios: serviços financeiros |
| FP-46 | Pagar despesas por Pix com criação da despesa para comprovação e classificação. | Não fazer |  | Cartão, Pix de despesa, benefícios: serviços financeiros |
| FP-47 | Gerir cartão multibenefícios, categorias, políticas de uso e integração com Pessoas+/financeiro. | Não fazer |  | Cartão, Pix de despesa, benefícios: serviços financeiros |
| FP-48 | Recarregar carteira empresarial por Pix/boleto e distribuir benefícios mediante pedidos por colaborador/time. | Não fazer |  | Cartão, Pix de despesa, benefícios: serviços financeiros |
| FP-49 | Calcular folha mensal com regras parametrizáveis e fechamento. | Não fazer |  | Folha legal, férias, rescisão e eSocial: sistema de folha/contador |
| FP-50 | Calcular férias, 13º e rescisões. | Não fazer |  | Folha legal, férias, rescisão e eSocial: sistema de folha/contador |
| FP-51 | Cadastrar dependentes, afastamentos e regras de jornadas, adicionais, bonificações e sindicatos. | Não fazer |  | Folha legal, férias, rescisão e eSocial: sistema de folha/contador |
| FP-52 | Integrar eventos da folha aos módulos financeiro e contábil. | Não fazer |  | Folha legal, férias, rescisão e eSocial: sistema de folha/contador |
| FP-53 | Enviar informações ao eSocial e acompanhar processos relacionados à folha. | Não fazer |  | Folha legal, férias, rescisão e eSocial: sistema de folha/contador |
| FP-54 | Dar acesso a holerites, férias e solicitações por portal e aplicativo. | Não fazer |  | Folha legal, férias, rescisão e eSocial: sistema de folha/contador |
| FP-55 | Exibir indicadores de custos de pessoas, turnover, movimentações, promoções e salários. | Fazer simplificado | 17 | Indicadores de custo de pessoal |
| FP-56 | Gerar remessa bancária dos pagamentos calculados da folha para crédito aos colaboradores. | Não fazer |  | Remessa de folha, talentos e IA preditiva |
| FP-57 | Mindsight · Recrutar/selecionar candidatos e sincronizar a admissão com a folha Sankhya. | Não fazer |  | Remessa de folha, talentos e IA preditiva |
| FP-58 | Mindsight · Gerenciar performance, desenvolvimento e engajamento de talentos. | Não fazer |  | Remessa de folha, talentos e IA preditiva |
| FP-59 | Mindsight · Produzir People Analytics e avaliações com modelos de ciência comportamental/inteligência preditiva. | Não fazer |  | Remessa de folha, talentos e IA preditiva |
| FP-60 | Pontotel · Registrar ponto digital, controlar banco de horas/atestados e integrar jornada à folha. | Fazer simplificado | 17 | Ponto simples por frente |
| FP-61 | Pontotel · Consultar geolocalização das marcações e usar reconhecimento facial/prova de vida. | Não fazer |  | Biometria e geolocalização |
| FP-62 | Pontotel · Alocar horas a atividades e projetos pelo módulo Timesheet. | Fazer | 17 | Timesheet por frente, alimenta o HH do Campo |
| FP-63 | Vixting · Digitalizar admissão, documentos e checklists, integrando exames admissionais. | Não fazer |  | Admissão digital |
| FP-64 | Vixting · Gerir exames ocupacionais, ASO, agendamentos, prazos e alertas ao longo do vínculo. | Fazer simplificado | 17 | ASO, NR, EPI e treinamentos com vencimento |
| FP-65 | Vixting · Centralizar SST: PGR, PCMSO, CIPA, EPIs, histórico e auditoria. | Fazer simplificado | 17 | ASO, NR, EPI e treinamentos com vencimento |
| C01 | Solicitação de compras · Gera solicitações a partir de pedidos, requisições e outros movimentos, inclusive na confirmação e por insuficiência de estoque. | Fazer | 15 | Solicitação e cotação com 2+ fornecedores |
| C02 | Cotação com vários fornecedores · Reúne itens requisitados, fornecedores, preços e condições para comparação. | Fazer | 15 | Solicitação e cotação com 2+ fornecedores |
| C03 | Portal de Cotação Online · Envia a cotação ao fornecedor e recebe sua resposta; acompanha envio e precificação. | Fazer simplificado | 15 | Resposta do fornecedor por arquivo ou formulário colado |
| C04 | Sugestão e aprovação de fornecedor · Apresenta melhor fornecedor/preço calculado e registra o fornecedor aprovado pelo comprador. | Fazer | 15 | Melhor fornecedor/preço, devolução e ocorrências |
| C05 | Pedidos, notas e devoluções de compra · Registra os documentos de aquisição e de devolução na Central de Compras. | Fazer | 15 | Melhor fornecedor/preço, devolução e ocorrências |
| C06 | Acompanhamento de documentos de compra · Registra ocorrências ligadas ao documento, fornecedor, produto, transportadora e demais envolvidos. | Fazer | 15 | Melhor fornecedor/preço, devolução e ocorrências |
| C07 | Compras orientadas por vendas · Disponibiliza análise da necessidade de compra a partir de pedidos de venda. | Não fazer |  | Compra orientada por venda: a TAF não revende |
| C08 | Compras por mínimo e máximo · Apoia reposição com relatórios baseados nos níveis de estoque. | Fazer | 15 | Mínimo/máximo e unidades alternativas (cadastro de insumo na Fase 12) |
| C09 | Unidades alternativas de compra · Permite comprar em unidade diferente da usada na venda, com fator de divisão/multiplicação. | Fazer | 15 | Mínimo/máximo e unidades alternativas (cadastro de insumo na Fase 12) |
| C10 | Direcionamento das cotações · Vincula contatos B2B e sugere fornecedores por produto, grupo ou classificação. | Fazer simplificado | 15 | Fornecedor sugerido por insumo |
| C11 | Orçamentos e pedidos · Gerencia a sequência de orçamento, pedido e nota de venda. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C12 | Faturamento parcial · Fatura itens selecionados e ajusta descontos de acordo com os itens faturados. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C13 | Faturamento de vários pedidos · Oferece rotinas para faturar diversos documentos, conforme condições da operação. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C14 | Devoluções e cancelamentos · Controla documentos de devolução e rotinas de cancelamento de vendas. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C15 | Integração venda–estoque–financeiro · Converte a reserva de estoque e provisão financeira em movimentação efetiva no faturamento, conforme parametrização. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C16 | Cadastro de cliente durante a venda · Permite inclusão simplificada do parceiro dentro do lançamento comercial. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C17 | Política segmentada de preços · Cria tabela principal e variações por região, parceiro, empresa ou negociação. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C18 | Atualização de preço pela compra · Disponibiliza formação/atualização do preço comercial vinculada às compras. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C19 | Simulação de negociação · Oferece tela para simular a negociação na jornada de formação de preço. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C20 | Fórmulas de comissão · Combina produto, negociação, vendedor, gerente, executor e perfil na apuração. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C21 | Comissão vinculada a metas · Usa metas previstas e realizadas e vendedores/gerentes dos itens. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C22 | Apuração e recálculo de comissão · Calcula por vendedor e período; permite recalcular valores sob regras documentadas. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C23 | Limites de bonificação · Exige liberação de bonificações por evento e usuário autorizado. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C24 | Permissão de faturamento · Restringe a execução de faturamento por usuário e acesso especial. | Não fazer |  | Comercial, preço de venda e comissões: fora do negócio de obras |
| C25 | Estoque por local, empresa e propriedade · Diferencia local, empresa e estoque próprio/de terceiros nos controles e inventários. | Fazer | 15 | Estoque por local de obra e lote quando exigido |
| C26 | Controle por lote · Identifica produtos e movimentações pelo lote. | Fazer | 15 | Estoque por local de obra e lote quando exigido |
| C27 | Controle por grade · Distingue variações de produtos, como tamanho e cor. | Não fazer |  | Grade e número de série |
| C28 | Controle por número de série · Rastreia unidades individualmente e oferece processos próprios de inventário. | Não fazer |  | Grade e número de série |
| C29 | Fabricação, validade e shelf life · Mantém datas e prazo mínimo de recebimento; aplica validações conforme configuração. | Fazer simplificado | 15 | Validade quando o insumo exigir |
| C30 | Cópia do estoque para inventário · Cria uma fotografia do saldo usada como referência estática da contagem. | Fazer | 15 | Inventário, contagem, ajuste e custo |
| C31 | Contagem e recontagem · Registra quantidades físicas, revisa divergências e admite implantação de saldos. | Fazer | 15 | Inventário, contagem, ajuste e custo |
| C32 | Contagem por código de barras · Usa leitura ou digitação de códigos, com identificação de unidade, controle e local. | Fazer | 15 | Inventário, contagem, ajuste e custo |
| C33 | Ajustes e conferência de inventário · Oferece ajuste de estoque, ajuste por série, conferência e importação de coletor. | Fazer | 15 | Inventário, contagem, ajuste e custo |
| C34 | Fórmulas de custo · Configura composição do custo por empresa ou produto e atualiza pela entrada de notas ou manualmente. | Fazer | 15 | Inventário, contagem, ajuste e custo |
| C35 | Modalidades de custo · Trabalha com reposição, custo fiscal com/sem ICMS, variável e gerencial. | Fazer simplificado | 15 | Custo médio ponderado |
| C36 | Custo médio ponderado móvel · Recalcula a média com base em saldos e entradas que alteram a titularidade. | Fazer | 15 | Custo médio e kardex |
| C37 | Kardex · Apresenta extrato dos movimentos que afetam propriedade/custo do produto. | Fazer | 15 | Custo médio e kardex |
| C38 | Venda por código de barras · Localiza produtos por código, descrição/EAN e monta o carrinho. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C39 | Descontos e promoções · Aplica descontos no item ou total e regras promocionais configuradas. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C40 | Pagamento combinado · Combina dinheiro, cartões, Pix e outras modalidades habilitadas; calcula troco e parcelas. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C41 | TEF integrado · Envia valor à maquininha, recebe aprovação e registra os pagamentos. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C42 | NFC-e e contingência · Emite documento fiscal/recibo e suporta contingência com envio posterior. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C43 | Movimentação do caixa · Abre/fecha turno, registra sangria/suprimento e consulta saldos por forma de pagamento. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C44 | Operação offline · Mantém operações locais e sincroniza com o ERP quando a conexão retorna. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C45 | Ploomes — funil e oportunidades · Gerencia negócios, etapas comerciais e carteira. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C46 | Ploomes — histórico de clientes · Centraliza interações, compras e negociações. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C47 | Ploomes — propostas e contratos · Automatiza produção de documentos comerciais e pedidos. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C48 | Ploomes — processos comerciais · Organiza workflows, checklists e regras personalizadas. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C49 | Ploomes — indicadores · Oferece relatórios e dashboards de metas/desempenho. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C50 | Ploomes — assistência com IA · Consulta documentos, responde sobre vendas e registra atividades conforme os recursos apresentados. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C51 | Ploomes — integração com ERP · Troca clientes, contatos, propostas e pedidos; recebe produtos e notas para leitura, conforme entidade e direção. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C52 | Meetime — cadências de prospecção · Organiza ligações, e-mails, WhatsApp e LinkedIn para o trabalho dos SDRs. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C53 | Meetime — gestão de pré-vendas · Acompanha execução, atividades, conversão e qualidade das abordagens. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C54 | Flowbiz — segmentação da base · Usa histórico de compras/interações de ERP, CRM e e-commerce para campanhas. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C55 | Flowbiz — jornadas automatizadas · Executa boas-vindas, recompra, follow-up, fidelização e pós-venda por canais configurados. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C56 | Flowbiz — recuperação de carrinhos · Aciona campanhas multicanal ligadas ao abandono de compra. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C57 | Flowbiz — criação de campanhas com IA · Apresenta AI Studio para estratégia, texto, layout e seleção de produtos. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C58 | Flowbiz — medição de marketing · Mostra envios, cliques, conversões e retorno por canal/jornada. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C59 | Sankhya Hub/Magis5 — pedidos multicanal · Centraliza vendas de marketplaces e seus pedidos/clientes. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C60 | Sankhya Hub/Magis5 — anúncios e kits · Administra catálogo, anúncios e kits de diferentes canais. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C61 | Sankhya Hub/Magis5 — estoque dos canais · Integra disponibilidade e atualização de estoque com o ERP. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C62 | Sankhya Hub/Magis5 — operação dos pedidos · Automatiza separação, expedição e emissão de documentos. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C63 | Magis5 — desempenho do comércio digital · Apresenta vendas, receita, estoque e margem por produtos/marcas. | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C64 | Mercos: força de vendas móvel e e-commerce B2B · Parceiro integrado ao Sankhya. O produto Mercos fornece catálogo, pedidos offline e loja B2B; o escopo contrata | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| C65 | ANYMARKET: integração com marketplaces · Integração documentada sincroniza produtos, preços, estoque, pedidos, faturamento e cancelamentos. Não foi classificado | Não fazer |  | Varejo, CRM, marketing e marketplaces |
| OP01 | Planejar capacidade produtiva pelo MRP II, considerando equipes por turno, equipamentos, materiais e prioridades. · I, S1 | Não fazer |  | MRP/PCP industrial |
| OP02 | Calcular necessidades de materiais pela explosão da estrutura BOM a partir do plano mestre MPS. · D, S2 | Não fazer |  | MRP/PCP industrial |
| OP03 | Apurar necessidades de compra considerando estoque e pedidos de compra existentes. · D, S2 | Não fazer |  | MRP/PCP industrial |
| OP04 | Configurar roteiros produtivos com eventos, dependências e fluxos de execução. · D, S3 | Não fazer |  | MRP/PCP industrial |
| OP05 | Controlar dependências entre ordens de produção e produtos intermediários. · D, S4 | Não fazer |  | MRP/PCP industrial |
| OP06 | Vincular pedidos de venda às respectivas ordens de produção. · D, S4 | Não fazer |  | MRP/PCP industrial |
| OP07 | Identificar parceiros terceirizados por ordem ou por operação produtiva. · D, S4 | Não fazer |  | MRP/PCP industrial |
| OP08 | Apontar execução por operador, atividade, início e término. · D, S5 | Fazer | 8 | Já existe no Campo (apontamento, paradas) |
| OP09 | Registrar paradas, motivos e fim de turno. · D, S5 | Fazer | 8 | Já existe no Campo (apontamento, paradas) |
| OP10 | Apontar consumo de materiais separadamente do registro de execução. · D, S5 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP11 | Transferir parcialmente produtos para a próxima atividade, mediante configuração. · D, S5 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP12 | Informar perdas e tratar apontamentos fora das tolerâncias configuradas. · D, S5 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP13 | Registrar produção conjunta e ratear matéria-prima entre coprodutos. · D, S6 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP14 | Calcular custos de produção e atualização de custos médios conforme regras do sistema. · D, S7 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP15 | Definir amostras e características analisáveis para qualidade em processo. · D, S8 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP16 | Registrar laudos e aprovar, reprovar ou aprovar com ressalva. · D, S8 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP17 | Executar ciclos de qualidade dentro do roteiro produtivo e acompanhar resultados por OP/lote. · D, S8 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP18 | Tratar não conformidades em fluxo estruturado de dez fases. · D, S9 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP19 | Gerenciar ciclo de documentos e coletar questionários padronizados. · D, S9 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP20 | Qualificar fornecedores e avaliar mudanças em processos/produtos. · D, S9 | Não fazer |  | Produção industrial e qualidade corporativa |
| OP21 | Conferir entradas pelo coletor e validar dados frente ao pedido de compra. · D, S10 | Fazer simplificado | 15 | Recebimento com divergência no almoxarifado |
| OP22 | Tratar divergências de recebimento, inclusive faltas, sobras e avarias. · D, S10–S11 | Fazer simplificado | 15 | Recebimento com divergência no almoxarifado |
| OP23 | Receber parcialmente, identificar unidades de movimentação/paletes e gerar armazenagem automática parametrizada. · D, S11 | Não fazer |  | WMS com coletor, logística e TMS |
| OP24 | Direcionar armazenagem por regras do sistema, produto ou grupo e endereços disponíveis. · D, S12 | Não fazer |  | WMS com coletor, logística e TMS |
| OP25 | Controlar giro físico por data de recebimento — FIFO. · D, S13 | Não fazer |  | WMS com coletor, logística e TMS |
| OP26 | Reabastecer picking e respeitar múltiplos de embalagem configurados. · D, S14 | Não fazer |  | WMS com coletor, logística e TMS |
| OP27 | Separar pedidos e cargas; conferir mercadorias e tratar divergências/recontagens. · D, S15–S16 | Não fazer |  | WMS com coletor, logística e TMS |
| OP28 | Fazer inventários globais ou rotativos, com segunda contagem quando há divergência. · D, S15 | Não fazer |  | WMS com coletor, logística e TMS |
| OP29 | Controlar validade e registrar números de série na expedição. · D, S15 | Não fazer |  | WMS com coletor, logística e TMS |
| OP30 | Formar volumes, registrar pesos e imprimir etiquetas para expedição. · D, S15 | Não fazer |  | WMS com coletor, logística e TMS |
| OP31 | Executar operações do armazém pelo aplicativo Coletor WMS Sankhya em Android. · I, S17 | Não fazer |  | WMS com coletor, logística e TMS |
| OP32 | Otimizar rotas, cargas e veículos; rastrear por telemetria. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP33 | Monitorar entregas por torre de controle e disponibilizar status WISMO. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP34 | Cotar, provisionar e auditar fretes; selecionar transportadoras. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP35 | Controlar logística reversa e ocorrências. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP36 | Gerenciar pátio e portaria — YMS. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP37 | Simular ocupação de cargas em 3D. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP38 | Disponibilizar aplicativos de motorista e inspeção de frota. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP39 | Integrar EDI Proceda e operações de crossdocking/terminais portuários. · I, S18 | Não fazer |  | WMS com coletor, logística e TMS |
| OP40 | Precificar frete por peso, rota, valor da carga ou distância e controlar prazo previsto. · D, S19 | Não fazer |  | WMS com coletor, logística e TMS |
| OP41 | Consolidar notas em ordens de carregamento, com validações de crédito, saldo e alçadas. · D, S19 | Não fazer |  | WMS com coletor, logística e TMS |
| OP42 | Organizar viagens, previsão de entrega, documentos e acerto financeiro. · D, S19 | Não fazer |  | WMS com coletor, logística e TMS |
| OP43 | Emitir CT-e/MDF-e e gerar CIOT conforme configuração e integrações. · D, S19 | Não fazer |  | WMS com coletor, logística e TMS |
| OP44 | Calcular afretamento, adiantamentos, seguro, pedágio e saldo; integrar operadoras de pagamento. · D, S19 | Não fazer |  | WMS com coletor, logística e TMS |
| OP45 | Abrir OS preventiva por dias, quilometragem ou horímetro e enviar notificações. · D, S20 | Fazer | 16 | Frota: OS preventiva/corretiva, abastecimento e pneus simples |
| OP46 | Registrar OS corretiva e checklists de conservação/funcionamento de veículos. · D, S20 | Fazer | 16 | Frota: OS preventiva/corretiva, abastecimento e pneus simples |
| OP47 | Registrar abastecimento e quilometragem, acompanhando consumo do veículo. · D, S20 | Fazer | 16 | Frota: OS preventiva/corretiva, abastecimento e pneus simples |
| OP48 | Rastrear pneus, posição, quilometragem, rodízio, recapagem e sucateamento. · D, S20 | Fazer | 16 | Frota: OS preventiva/corretiva, abastecimento e pneus simples |
| OP49 | Registrar contratos de receita, valores por serviço, vigência e estados como ativo/bonificado/bloqueado. · D, S21–S22 | Fazer | 16 | Contratos de receita, reajuste e rentabilidade |
| OP50 | Calcular reajustes e notificar término/reajuste de contratos; anexar documentos. · I, S23 | Fazer | 16 | Contratos de receita, reajuste e rentabilidade |
| OP51 | Provisionar receitas/despesas e acompanhar rentabilidade contratual. · I, S23 | Fazer | 16 | Contratos de receita, reajuste e rentabilidade |
| OP52 | Faturar serviços em lote e integrar cobranças ao financeiro. · I, S23 | Fazer simplificado | 9 | Faturamento por boletim já existe; sem lote por contrato |
| OP53 | Suspender serviços parcial ou totalmente por inadimplência, conforme regra. · I, S23 | Não fazer |  | Suspensão por inadimplência |
| OP54 | Emitir e acompanhar ordens de serviço e seu faturamento. · I, S23 | Fazer simplificado | 16 | OS de frota/serviço |
| OP55 | Apontar serviços pelo aplicativo nativo Sankhya Tasks. · I, S23 | Não fazer |  | Aplicativo nativo; o Campo cobre o apontamento |
| OP56 | Gerenciar agenda integrada, SLA, executantes, horas produtivas e retrabalho. · I, S24 | Fazer simplificado | 8 | Agenda e SLA no Lean |
| OP57 | Criar projetos/FAP por modelos e organizar etapas, equipes e cronogramas. · D, S25–S26 | Fazer | 16 | Projetos com etapas, equipes e horas apropriadas |
| OP58 | Apropriar horas de OS às etapas de projetos e gerir requisitos, anexos e documentos. · D, S26–S27 | Fazer | 16 | Projetos com etapas, equipes e horas apropriadas |
| OP59 | Apurar despesas por talhão, cultura, pasto ou unidade. · I, S28 | Não fazer |  | Agro e manutenção industrial |
| OP60 | Planejar insumos, registrar aplicações e rastrear lotes. · I, S28 | Não fazer |  | Agro e manutenção industrial |
| OP61 | Acompanhar contratos de armazenagem, comercialização e logística rural. · I, S28 | Não fazer |  | Agro e manutenção industrial |
| OP62 | Monitorar rebanhos individualmente, manejar confinamento e apurar custos. · I, S28 | Não fazer |  | Agro e manutenção industrial |
| OP63 | Analisar mapas georreferenciados, NDVI, clima e falhas. · I, S28 | Não fazer |  | Agro e manutenção industrial |
| OP64 | Abrir ordens de serviço diretamente do campo. · I, S28 | Não fazer |  | Agro e manutenção industrial |
| OP65 | Gerir manutenção preventiva, corretiva e preditiva de ativos: ordens, cronogramas, custos, históricos e indicadores. · I, S29 | Não fazer |  | Agro e manutenção industrial |
| DF01 | Emitir NF-e de mercadorias · Comunicação fiscal pelo componente SanNFe, com cadastros, certificado e parâmetros aplicáveis. | Não fazer |  | Emissão de NF-e/NFS-e: exige certificado e Sefaz/prefeitura |
| DF02 | Emitir NFS-e de serviços · Geração de RPS/XML, transmissão e acompanhamento conforme padrão municipal/nacional suportado. | Não fazer |  | Emissão de NF-e/NFS-e: exige certificado e Sefaz/prefeitura |
| DF03 | Acompanhar lotes, rejeições, cancelamento e substituição de NFS-e · Operações condicionadas ao documento, provedor e regras aplicáveis. | Não fazer |  | Emissão de NF-e/NFS-e: exige certificado e Sefaz/prefeitura |
| DF04 | Gerar e baixar XMLs de documentos aprovados · Exportação de NF-e/NFS-e e outros modelos tratados pela rotina. | Não fazer |  | Emissão de NF-e/NFS-e: exige certificado e Sefaz/prefeitura |
| DF05 | Importar XML de notas de compra e devoluções de venda · Exige o produto Importação de Documentos Eletrônicos/W na licença. | Fazer | 10 | Importação de XML de compra (feito) |
| DF06 | Registrar manifestação do destinatário e consultar documentos · Eventos junto à Sefaz, download de XML e execução automática conforme configuração MD-e/DF-e. | Não fazer |  | Manifestação do destinatário: exige certificado; use um provedor |
| ES01 | Administrar contratos de locação de imóveis · Vínculo com contrato de administração, locatário, vigência, aluguel e reajustes. | Não fazer |  | Imobiliária e comércio exterior |
| ES02 | Cadastrar imobiliárias, filiais e informações de administração · Configurações de serviços, notas e portais web. | Não fazer |  | Imobiliária e comércio exterior |
| ES03 | Organizar edifícios, galerias e imóveis vinculados · Características, localização e infraestrutura dos imóveis. | Não fazer |  | Imobiliária e comércio exterior |
| ES04 | Consultar atendimentos/SAC imobiliário · Pesquisa por imóvel, contrato, lote, corretor e estágio de atendimento. | Não fazer |  | Imobiliária e comércio exterior |
| ES05 | Integrar a operação imobiliária a portais online · Processo e tipos de imóveis configurados para os portais utilizados. | Não fazer |  | Imobiliária e comércio exterior |
| ES06 | Importar dados de DI de um XML de pré-nota · Rotina de Comércio Exterior com layout e campos delimitados. | Não fazer |  | Imobiliária e comércio exterior |
| ES07 | Informar DI e adições por item para NF-e de importação · A rotina da Central de Compras documentada exige digitação; não confundir com automação do SOP. | Não fazer |  | Imobiliária e comércio exterior |
| PL01 | Integrar áreas empresariais em uma base operacional · ERP Sankhya Om; a composição funcional depende da contratação. | Fazer | 1-12 | Base única e acesso web/celular |
| PL02 | Acesso web e recursos móveis · A disponibilidade por dispositivo varia conforme tela e aplicativo. | Fazer | 1-12 | Base única e acesso web/celular |
| PL03 | Parametrizar tipos de operação — TOP · Definir o comportamento dos documentos e das movimentações de compra, venda, devolução e outros processos. | Fazer simplificado | 17 | Tipos de documento e natureza fazem o papel da TOP |
| PL04 | Configurar efeitos da operação sobre estoque e documentos fiscais · Regras vinculadas à TOP, ao cadastro e ao cenário da empresa. | Não fazer |  | Efeito fiscal por operação |
| PL05 | Administrar usuários e grupos de acesso · Permissões herdadas do grupo e configurações individuais. | Fazer | 17 | Usuários, grupos, acesso temporário e horário |
| PL06 | Conceder acessos temporários por grupos adicionais · Vigência inicial e final para permissões complementares. | Fazer | 17 | Usuários, grupos, acesso temporário e horário |
| PL07 | Controlar horários de acesso, senhas e sessões · Configuração por usuário; não equivale a liberar acesso às telas. | Fazer | 17 | Usuários, grupos, acesso temporário e horário |
| PL08 | Autenticar com diretório LDAP · Quando a empresa utiliza essa integração e configura o vínculo. | Não fazer |  | LDAP |
| PL09 | Restringir visibilidade e ações operacionais · Exemplos documentados: receitas, documentos por vendedor e exportação de relatórios. | Fazer | 17 | Restrições por papel e suplente de aprovador |
| PL10 | Substituir aprovadores por período · Suplência para liberações, sem copiar automaticamente todos os acessos do titular. | Fazer | 17 | Restrições por papel e suplente de aprovador |
| PL11 | Aprovar ou negar exceções por alçada · Descontos e outros eventos sujeitos a limites e responsáveis. | Fazer | 11 | Alçadas por faixa de valor (feito) |
| PL12 | Notificar o resultado de liberações · E-mail ou notificação no Om, conforme configuração. | Fazer | 17 | Notificação de liberação e auditoria antes/depois |
| PL13 | Auditar alterações de dados · Usuário, data/hora, tipo de alteração e valores anteriores/posteriores nas tabelas mapeadas. | Fazer | 17 | Notificação de liberação e auditoria antes/depois |
| PL14 | Monitorar servidor, licença e componentes instalados · Administração de add-ons, extensões e diagnóstico do ambiente. | Não fazer |  | Administração do servidor: é do Supabase/Vercel |
| BI01 | Construir dashboards personalizados · Composição de painéis a partir de componentes de BI. | Fazer | 17 | Painéis configuráveis com filtros e detalhamento |
| BI02 | Criar gráficos, tabelas, tabelas dinâmicas e mapas · Editor visual ou XML, conforme conhecimento técnico. | Fazer | 17 | Painéis configuráveis com filtros e detalhamento |
| BI03 | Filtrar indicadores por parâmetros · Consultas e variáveis configuráveis por componente. | Fazer | 17 | Painéis configuráveis com filtros e detalhamento |
| BI04 | Detalhar indicadores e abrir registros do ERP · Navegação por níveis e abertura de telas a partir de eventos. | Fazer | 17 | Painéis configuráveis com filtros e detalhamento |
| BI05 | Executar ações em componentes tabulares · Depende da entidade e dos dados associados ao componente. | Fazer | 17 | Painéis configuráveis com filtros e detalhamento |
| BI06 | Usar fontes de dados externas em dashboards · Requer configurar a fonte e a conectividade. | Não fazer |  | Fontes externas |
| BI07 | Exibir cartões inteligentes na área de trabalho · Restrições específicas de estrutura e filtros. | Fazer | 17 | Cartões no Início |
| BI08 | Visualizar dashboards no celular com Sankhya Vision · Aplicativo de visualização; não oferece todas as interações/exportações do painel web. | Fazer | 12 | Painéis no celular (layout responsivo) |
| BI09 | Programar TV corporativa · Sequência de componentes de BI, sites, RSS e vídeos. | Não fazer |  | TV corporativa |
| IA01 | BIA · Responder dúvidas sobre uso do sistema com contexto da operação. | Não fazer |  | Assistentes de IA do fornecedor |
| IA02 | BIA · Consultar e abrir tickets com informações e histórico do problema. | Não fazer |  | Assistentes de IA do fornecedor |
| IA03 | BIA · Consultar uma base de conhecimento interna em linguagem natural. | Não fazer |  | Assistentes de IA do fornecedor |
| IA04 | BIA · Criar telas a partir de descrições em linguagem natural. | Não fazer |  | Assistentes de IA do fornecedor |
| IA05 | BIA · Sugerir produtos complementares a partir do histórico de compras. | Não fazer |  | Assistentes de IA do fornecedor |
| IA06 | Analytics AI · Criar e personalizar dashboards e relatórios com assistência de IA. | Não fazer |  | Assistentes de IA do fornecedor |
| IA07 | Analytics AI · Consolidar dados de diferentes áreas/fontes. | Não fazer |  | Assistentes de IA do fornecedor |
| IA08 | Analytics AI · Usar modelos de indicadores para pessoas, vendas e financeiro. | Não fazer |  | Assistentes de IA do fornecedor |
| IA09 | Analytics AI · Explorar gráficos interativos e análises automatizadas. | Não fazer |  | Assistentes de IA do fornecedor |
| IA10 | Analytics AI · Projetar receita, churn e tendências, segundo a descrição comercial. | Não fazer |  | Assistentes de IA do fornecedor |
| IA11 | Deploy Agent · Configurar processos essenciais com base em dados e XMLs da empresa. | Não fazer |  | Assistentes de IA do fornecedor |
| IN01 | Modelar processos no Sankhya Flow · Diagramas BPMN para representar e executar fluxos de negócio. | Não fazer |  | BPMN |
| IN02 | Distribuir e acompanhar tarefas de usuários · Participação humana no fluxo e acompanhamento das atividades. | Fazer simplificado | 17 | Tarefas com SLA no Lean |
| IN03 | Usar telas nativas dentro do Flow · O manual informa consumo de licença do Flow e do módulo da tela utilizada. | Não fazer |  | Personalização do ERP do fornecedor |
| IN04 | Chamar serviços internos do ERP pelo Flow · Reutilizar serviços do Om nas tarefas de processo. | Não fazer |  | Personalização do ERP do fornecedor |
| IN05 | Chamar serviços externos pelo Flow · Integração por tarefas de serviço com web services externos. | Não fazer |  | Personalização do ERP do fornecedor |
| IN06 | Configurar eventos de processo e tarefa · Rotinas e chamadas adicionais em momentos do fluxo. | Não fazer |  | Personalização do ERP do fornecedor |
| IN07 | Construir telas e campos adicionais · Personalização conforme modelo de dados e permissões. | Não fazer |  | Personalização do ERP do fornecedor |
| IN08 | Criar botões de ação · Acionar rotinas específicas a partir das telas. | Não fazer |  | Personalização do ERP do fornecedor |
| IN09 | Agendar rotinas de processamento · Execução automática e periódica conforme configuração. | Não fazer |  | Personalização do ERP do fornecedor |
| IN10 | Programar eventos sobre entidades · Reagir a operações de dados com regras personalizadas. | Não fazer |  | Personalização do ERP do fornecedor |
| IN11 | Criar e distribuir add-ons · Pacotes de funcionalidades por ferramentas oficiais de desenvolvimento. | Não fazer |  | Personalização do ERP do fornecedor |
| IN12 | Estender regras em pontos do ciclo documental · Add-on Studio documenta callbacks, regras de negócio e listeners. | Não fazer |  | Personalização do ERP do fornecedor |
| IN13 | Trocar arquivos por EDI · Integrações baseadas em layouts, inclusive processos bancários. | Fazer simplificado | 13 | Troca de arquivo bancário (CNAB/OFX) |
| IN14 | Consolidar dados para análise · Tabelas de consolidação usadas como base para dashboards. | Não fazer |  | Integração com o Sankhya: não será usada |
| IN15 | Integrar outros sistemas por API · Consultas, cadastros e operações expostas pelos serviços públicos. | Não fazer |  | Integração com o Sankhya: não será usada |
| IN16 | Usar serviços comerciais pelo Gateway · A documentação contempla movimentações como pedidos de compra e venda. | Não fazer |  | Integração com o Sankhya: não será usada |
| IN17 | Consultar estoque de vários produtos por API · O endpoint consultado informa que não considera os estoques do WMS. | Não fazer |  | Integração com o Sankhya: não será usada |
| IN18 | Autenticar integrações com OAuth 2.0 · Fluxo Client Credentials com Client ID, Client Secret e X-Token. | Não fazer |  | Integração com o Sankhya: não será usada |
| IN19 | Administrar soluções, componentes e acessos de integração · Portal do Desenvolvedor e configurações do Gateway. | Não fazer |  | Integração com o Sankhya: não será usada |
| IN20 | Ativar conexões com produtos do grupo em uma central · Requer versão/permissões compatíveis; não substitui contratação dos produtos. | Não fazer |  | Integração com o Sankhya: não será usada |
| AT01 | Reunir WhatsApp, chat, voz, redes sociais e e-mail em uma operação de atendimento. | Não fazer |  | Atendimento omnichannel |
| AT02 | Encaminhar solicitações a atendentes conforme regras e histórico. | Não fazer |  | Atendimento omnichannel |
| AT03 | Atender automaticamente por chatbots, inclusive fora do expediente. | Não fazer |  | Atendimento omnichannel |
| AT04 | Usar IA para responder dúvidas e qualificar leads durante conversas. | Não fazer |  | Atendimento omnichannel |
| AT05 | Executar réguas de cobrança conectadas aos dados financeiros do ERP. | Não fazer |  | Atendimento omnichannel |
| AT06 | Automatizar acompanhamento de orçamentos e ativação de clientes. | Não fazer |  | Atendimento omnichannel |
| AT07 | Apoiar fechamento de pedidos pelo WhatsApp com rastreabilidade. | Não fazer |  | Atendimento omnichannel |
| AT08 | Acompanhar NPS, tempo de atendimento e satisfação. | Não fazer |  | Atendimento omnichannel |
| SV01 | Hospedagem gerenciada Sankhya Cloud · Infraestrutura, banco de dados, rede e administração do ambiente em nuvem. | Não fazer |  | Serviços do fornecedor (a TAF usa Supabase e Vercel) |
| SV02 | Monitoramento e backups do ambiente Cloud · Frequência e atendimento descritos na documentação; retenção, recuperação e SLA precisam ser conferidos no contrato  | Não fazer |  | Serviços do fornecedor (a TAF usa Supabase e Vercel) |
| SV03 | Implantação e parametrização dos processos · Serviço com divisão de responsabilidades entre fornecedor, unidade/parceiro e cliente. | Não fazer |  | Serviços do fornecedor (a TAF usa Supabase e Vercel) |
| SV04 | Suporte e Central de Ajuda · Artigos, manuais e atendimento contextual acessível pelo ERP. | Não fazer |  | Serviços do fornecedor (a TAF usa Supabase e Vercel) |
| SV05 | Formação e certificação · Universidade e programas de capacitação em uso, consultoria e desenvolvimento. | Não fazer |  | Serviços do fornecedor (a TAF usa Supabase e Vercel) |
| SV06 | Acesso a parceiros e soluções adicionais · Diretório de parceiros, Marketplace e ambiente de distribuição de add-ons. | Não fazer |  | Serviços do fornecedor (a TAF usa Supabase e Vercel) |
