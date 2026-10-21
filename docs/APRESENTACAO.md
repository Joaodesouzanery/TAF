# Roteiro para apresentar o sistema a outra empresa

## Antes
1. Abra o link (Vercel ou Artifact) e escolha o tema (ícones sol/lua no fim da barra lateral).
2. Na barra lateral, clique em **Apresentação** e ligue o que precisar:
   - **Ocultar nome da obra**: some nome da obra, cliente e município (fica "Obra 342", "Cliente").
   - **Ocultar fornecedores e parceiros**: vira "Fornecedor 01, 02…".
   - **Ocultar valores (R$)**: mostra `R$ •••`; percentuais e contagens continuam.
   A faixa "Modo apresentação" aparece no topo. O modo só mascara a tela e as cópias (CSV/Excel); não altera nem protege os dados gravados.
3. A marca da barra lateral é "Grupo Nery" (`marca` em `web/config.js`).

## Roteiro de 10 minutos
1. **Início**: filtros (Empresa, Gerente, Vendedor, Tipo, Situação, Nº do contrato), 8 cartões e a barra de composição por obra. Clique em **Gasto** para ver naturezas e, numa natureza, os lançamentos. Mostre "Colunas", "Σ Estatísticas" e "Baixar Excel".
2. **Suprimentos → Dashboard de compras**: pedido × entregue × pendente, atrasados, fornecedores. **Consulta de pedidos**: a grade completa, escolha de colunas e planilha.
3. **Obra → Orçamento (EAP)**: meta e teto por item; **Compras**: semáforo e alçadas; **Notas e rateio**: fecha 100 %.
4. **Contratos**: lista de contratos de obra; abra a ficha (Geral, Responsáveis, Anexos, Extrato, Produtos/Serviços, Provisões, Pedidos/Notas).
5. **Financeiro / Medição**: títulos, faturamento e resultado.

## Cuidados
- Sem login, quem tiver o link vê os dados da obra 342. Para uma apresentação com dados reais, prefira projetar a tela com o Modo apresentação ligado.
- O link sem login grava no navegador de cada pessoa; ninguém altera os dados dos outros.
