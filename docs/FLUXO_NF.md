# Fluxo da nota fiscal (do pedido à medição)

```mermaid
flowchart TD
  A[Solicitação de compra\nEngenheiro escolhe o item da EAP] --> B{Semáforo\npreço × meta/teto do item}
  B -->|bloqueado| B1[Sem linha de base ou item sem meta:\nnão abre compra]
  B -->|verde| C
  B -->|amarelo| B2[Gerente de contrato aprova\ncom justificativa] --> C
  B -->|vermelho| B3[Só a Diretoria aprova] --> C
  C[Mapa de cotação\n3 propostas, escolha] --> D[Ordem de compra]
  D --> E[OC aprovada gera TÍTULO a pagar\ncusto comprometido no item]
  E --> F[Recebimento do material/serviço\nAlmoxarife confere]
  F --> G[Nota fiscal\nXML importado ou lançada à mão]
  G --> H{Rateio manual\nsoma = 100% da nota?}
  H -->|não| H1[Fica em 'sem rateio'\nnão entra no custo]
  H -->|sim, cada linha com item e conta| I[Conferência\nnota × recebido, tolerância]
  I -->|divergente| I1[Volta para Compras]
  I --> J[Financeiro libera e paga\nsó com recebimento confirmado]
  J --> K[Conciliação bancária\nextrato × pagamento]
  J --> L[Custo REALIZADO no item\ne na conta do plano de contas]
  M[Campo: apontamento aprovado\n% físico, HH, produção] --> N
  O[Medição atestada\nquantidade × preço licitado] --> N
  L --> N[Resultado por item\nreceita × custo, VA, IDC → lucro ou prejuízo]
  O --> P[Boletim ao cliente → aprovação\ncom glosa → NF de serviço → recebimento]
  P --> Q[DRE da obra e caixa]
  L --> Q
  L --> R[Fechamento mensal\narquivo do contador / Sankhya]
```

Regras que o sistema trava: obra sem linha de base não compra (E01); nota sem rateio não vira custo; rateio ≠ 100% não grava; chave de NF-e repetida é recusada; pagamento só com recebimento; quem lança não aprova; medido não passa do orçado; tudo fica na auditoria.
