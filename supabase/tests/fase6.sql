-- Fase 6: plano de contas, título a pagar, medição e resultado. Rodar após migrações 0001-0003 + seeds.
begin;
update obra set linha_base_congelada = true;
do $$
declare it record; oc uuid; r record;
begin
  assert conta_padrao('MAT','FOFO') = '4.2.01' and conta_padrao('ADM','CANT') = '4.5.02' and conta_padrao('MO','X') = '4.1.01', 'conta_padrao';
  assert (select count(*) from conta where codigo = '4.2.01') = 1, 'plano de contas semeado';
  select i.id, i.obra_id, i.qtd, i.meta_total, i.preco_venda_total into it from item_eap i where i.eh_item and i.qtd = 10 limit 1;
  if it.id is null then select i.id, i.obra_id, i.qtd, i.meta_total, i.preco_venda_total into it from item_eap i where i.eh_item and i.qtd > 1 limit 1; end if;
  -- OC aprovada gera título; cancelar cancela o título
  insert into ordem_compra(obra_id,item_id,qtd,preco_unit,status) values (it.obra_id,it.id,1,100,'aprovada') returning id into oc;
  assert (select valor from titulo_pagar where oc_id = oc) = 100, 'título nasce da OC aprovada';
  update ordem_compra set status = 'cancelada' where id = oc;
  assert (select status from titulo_pagar where oc_id = oc) = 'cancelado', 'título cancelado';
  -- medição: não passa do orçado; atestar exige outra pessoa
  begin insert into medicao(obra_id,item_id,qtd) values (it.obra_id,it.id,it.qtd + 1); raise exception 'deveria falhar';
  exception when others then assert sqlerrm like 'Medido acima%', sqlerrm; end;
  insert into medicao(obra_id,item_id,qtd,status,lancado_por,atestado_por) values (it.obra_id,it.id,it.qtd/2,'atestada','Marko','Tiago');
  select * into r from v_resultado_item where item_id = it.id;
  assert abs(r.receita_medida - it.preco_venda_total/2) < 0.01, 'receita medida = 50% do licitado';
  assert abs(r.valor_agregado - it.meta_total/2) < 0.01, 'VA = 50% da meta';
  -- custo realizado via nota rateada -> IDC e resultado
  insert into nota_fiscal(id,valor,status) values (gen_random_uuid(), 100, 'lancada');
  insert into rateio_nota(nota_id,obra_id,item_id,natureza,valor,conta_codigo) select id,it.obra_id,it.id,'MAT',100,'4.2.01' from nota_fiscal limit 1;
  select * into r from v_resultado_item where item_id = it.id;
  assert r.realizado = 100 and r.idc = round(it.meta_total/2/100, 3), 'IDC = VA / realizado';
  assert r.resultado = round(it.preco_venda_total/2 - 100, 2), 'resultado = receita - custo';
end $$;
rollback;
select 'OK: fase 6 passou' as resultado;
