# Pesquisa: o que o Sankhya faz e como o TAF Obras se encaixa

Data: 18/10/2026. Método: leitura do repositório indicado e buscas na web. **Limite**: a central de ajuda oficial (`ajuda.sankhya.com.br`) não abre a partir do ambiente de desenvolvimento, então o conteúdo veio de resultados de busca (trechos públicos) e de páginas de terceiros, marcadas como tal. Antes de integrar, valide cada ponto com o administrador do Sankhya da TAF.

## 1. O repositório `DevSkillsIT/Skills-MCP-Sankhya-Ajuda`
- É um **servidor MCP** (licença MIT, versão 1.5.6) que torna pesquisáveis a central de ajuda do Sankhya (~6.125 artigos, 14 categorias, 230 seções) e a comunidade (~7.619 posts, 33 espaços). Busca vetorial (pgvector) junto com busca de texto em português, combinadas por Reciprocal Rank Fusion.
- Duas partes: **ETL** em Python 3.13 (coleta diária da ajuda e da comunidade, gera embeddings, grava no PostgreSQL) e **servidor MCP** em Node 22 + TypeScript (HTTP, porta 3105, token Bearer).
- Ferramentas (somente leitura): busca unificada ajuda+comunidade, detalhe de artigo, listar categorias e seções, post da comunidade, listar espaços, resources `sankhya-ajuda://…` e 4 prompts (`sankhya_troubleshoot`, `sankhya_quick_lookup`, `sankhya_explain_module`, `sankhya_compare_articles`).
- **O repositório não traz a documentação**: ela é coletada pelo ETL. Para usar: clonar, subir o `docker-compose.yml` (PostgreSQL com pgvector), configurar `.env` (provedor de embeddings), rodar o ETL e registrar o servidor no cliente MCP (Claude Code, Claude Desktop, Cursor) com o token. Passos detalhados no `README.md` e em `docs/INSTALL.md` do próprio repositório.
- **Não foi executado aqui** (sem acesso ao site do Sankhya e sem banco com embeddings). Quando o usuário o instalar na máquina dele, qualquer Claude poderá consultar a ajuda inteira por busca, e este documento pode ser expandido com citações de artigos.

## 2. O que o Sankhya faz (resumo com fontes)
| Área | O que existe | Fonte |
|---|---|---|
| ERP | Sankhya Om: gestão comercial, financeira, fiscal, suprimentos, estoque e produção em plataforma web | [sankhya.com.br](https://www.sankhya.com.br/software-de-gestao-erp/erp-para-gestao-empresarial/produtos/sankhya/) |
| Compras | Central de Compras e Portal de Compras; **Solicitação de Compra** (gerada por regras de produto/TOP), **Cotação** (cabeçalho com Empresa, Projeto, Centro de Resultado e Natureza; aprovada gera Pedidos), **Pedido de Compra** por TOP (tipo de operação); pedido de serviços com Natureza obrigatória | [Solicitação de Compra](https://ajuda.sankhya.com.br/hc/pt-br/articles/360045111053-Solicita%C3%A7%C3%A3o-de-Compra), [Cotação](https://ajuda.sankhya.com.br/hc/pt-br/articles/360045113993-Cota%C3%A7%C3%A3o), [Pedido de serviços](https://ajuda.sankhya.com.br/hc/pt-br/articles/37639995661207-Como-lan%C3%A7ar-um-pedido-de-compra-de-servi%C3%A7os) |
| Financeiro | Movimentação financeira, baixa automática, conciliação bancária, renegociação de dívidas; fluxo de caixa e DRE, margem de contribuição, inadimplência, multimoeda, ponto de equilíbrio | [sankhya.com.br/industria](https://www.sankhya.com.br/industria/), [guia de contas a pagar (terceiro)](https://pt.scribd.com/document/1053898341/Sankhya) |
| Centros de Resultado | Subdivisões da empresa (departamentos, **obras**, filiais) com receitas e despesas analisadas à parte | [Centros de Resultado](https://ajuda.sankhya.com.br/hc/pt-br/articles/360044606754-Centros-de-Resultado) |
| Projetos | Agrupam receitas e despesas para apurar resultado, junto com naturezas e centros de resultado | [Projetos](https://ajuda.sankhya.com.br/hc/pt-br/articles/360045109073-Projetos) |
| Orçamento | Planejamento orçamentário (previsto × realizado), estrutura de metas, **liberação de limites orçamentários** | [Planejamento](https://ajuda.sankhya.com.br/hc/pt-br/articles/360044609874-Planejamento-Or%C3%A7ament%C3%A1rio), [Limites](https://ajuda.sankhya.com.br/hc/pt-br/articles/360044609834-Libera%C3%A7%C3%A3o-de-Limites-Or%C3%A7ament%C3%A1rios) |
| Fiscal e contábil | Escrituração fiscal, SPED Fiscal e Contábil, ECD/ECF, NF-e, NFC-e, CT-e, eSocial, Bloco K, controle patrimonial | [b2bstack (terceiro)](https://www.b2bstack.com.br/product/sankhya-erp), [Planning (terceiro)](https://planning.com.br/contabilidade-erp-sankhya/) |
| Sankhya Tax | Apuração e obrigações acessórias; **API que importa NFS-e de serviços tomados para a Central de Compras** | [Parametrização NFSe](https://ajuda.sankhya.com.br/hc/pt-br/articles/30446587263767-Sankhya-Tax-Parametriza%C3%A7%C3%A3o-para-Integra%C3%A7%C3%A3o-NFSe-Captura-e-Integra%C3%A7%C3%A3o-de-NFS-e-de-Servi%C3%A7os-Tomados) |
| Estoque e WMS | Entradas, saídas, transferências, inventário, lotes, endereçamento | [sankhya.com.br/industria](https://www.sankhya.com.br/industria/) |
| Pessoas | Pessoas+ (folha) e Mindsight (talentos); CRM; BI com painéis | [sankhya.com.br](https://sankhya.com.br/software-de-gestao-erp/), [GetApp](https://www.getapp.com/operations-management-software/a/erp-sankhya/) |
| Construção civil | **Não encontrei** módulo nativo de medição de obra, composição de insumos ou cronograma físico | busca sem resultado |

## 3. API de integração
- Portal do Desenvolvedor: <https://developer.sankhya.com.br>.
- **Autenticação**: fluxo novo OAuth 2.0 (`/authenticate`, com `client_id` e `client_secret` gerados por componente de integração; o token continua vindo de *Configurações Gateway* no Sankhya Om) e fluxo antigo `/login` (usuário, senha, appkey e token), mantido só por compatibilidade. Fontes: [changelog OAuth 2.0](https://developer.sankhya.com.br/changelog/novo-fluxo-de-autenticacao-com-oauth-20), [login legado](https://developer.sankhya.com.br/reference/post_login-1).
- **Consultas**: serviço `CRUDServiceProvider.loadRecords` / `loadView` em `gateway/v1/mge/service.sbr` ([exemplo na comunidade](https://community.sankhya.com.br/developers/conectividade/post/tutorial-obter-dados-api-via-power-query-power-bi-lrGYfQ1yiCW20Nf)). Relato de usuário (não oficial): `loadRecords` não faz junções.
- **Autorização**: com a camada de autorização ativa, o usuário de integração precisa de acesso aos serviços usados ([ajuda](https://ajuda.sankhya.com.br/hc/pt-br/articles/11244652964119-Camada-de-autoriza%C3%A7%C3%A3o-para-API)). Hospedagem e IP do integrador precisam estar liberados.
- Nomes exatos de entidades e campos (naturezas, centros de resultado, movimento financeiro) **não foram confirmados**: ficam em arquivo de mapeamento configurável para validar com o administrador.

## 4. Sankhya × TAF Obras
| Tema | Sankhya | TAF Obras | Relação |
|---|---|---|---|
| Solicitação → cotação → pedido | Sim, por TOP | Sim, com semáforo meta/teto por **item da planilha** | TAF decide o preço contra a meta; Sankhya registra o movimento |
| Centro de resultado / projeto | Sim | Obra = centro de custo; item da EAP = menor nível | Mapear obra → centro de resultado |
| Natureza | Sim | Conta do plano (38 contas) derivada da natureza do insumo | Mapear conta do plano → natureza |
| Limite orçamentário e liberação | Sim, por departamento/natureza | Meta e teto **por item**, alçada por cor e por valor | TAF é mais fino (item), Sankhya é agregado |
| Medição, composição, produção | Não encontrado | Sim: medição, resultado por item, apontamento, Lean | Diferencial do TAF |
| Faturamento ao cliente, DRE | Financeiro/DRE gerais | BM, NF de serviço, recebimento, DRE da obra, caixa | Complementar |
| Fiscal (SPED, apuração completa) | Sim | Estimativa de tributos e arquivo do contador | Sankhya continua sendo o sistema fiscal |
| NFS-e tomadas | Sankhya Tax importa para a Central de Compras | Importa XML de NF-e e aceita rateio por item | Pode vir do Sankhya no futuro |
| Folha, estoque/WMS, contábil, CRM | Sim | Não | Fora do escopo |

## 5. Mapeamento de integração (proposta)
- Obra 342 → Centro de resultado (código a informar).
- Conta do plano (ex. 4.2.01) → Natureza do Sankhya (tabela editável no app).
- Nota rateada (linha por item) → lançamento financeiro com parceiro (CNPJ), natureza, centro de resultado e valor.
- OC aprovada → pedido de compra na TOP definida pela TAF (a decidir).
- Sentido: TAF Obras decide e aloca; Sankhya recebe o resultado do fechamento e devolve naturezas e centros de resultado para conferência.

## 6. Perguntas para o administrador do Sankhya
1. Versão do Sankhya e se a licença inclui **Cotação**, **Sankhya Tax** e a API de integração.
2. Quais TOPs de compra e de serviço a TAF usa; se há TOP exclusiva para obras.
3. Lista de naturezas e centros de resultado atuais (e o código da obra 342).
4. Pode criar um **usuário de integração** com acesso mínimo e gerar `client_id`/`client_secret`? Há restrição de IP?
5. Prefere receber lançamentos por API ou por arquivo de importação (qual layout)?
6. Como as NFS-e tomadas entram hoje (Sankhya Tax, digitação)?
