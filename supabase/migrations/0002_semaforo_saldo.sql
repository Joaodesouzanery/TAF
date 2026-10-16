-- Semáforo pelo saldo acumulado do item (doc, seção 3 e 6):
-- bloqueado: item inexistente, grupo ou sem meta | vermelho: comprometido+realizado+compra > teto
-- verde: compra cabe no saldo livre (meta - comprometido - realizado) | amarelo: acima da meta, até o teto
create or replace function calc_semaforo(p_item uuid, p_qtd numeric, p_preco numeric)
returns semaforo language plpgsql stable as $$
declare s record; total numeric := p_qtd * p_preco;
begin
  select * into s from v_saldo_item where item_id = p_item;
  if not found or s.meta_total is null then return 'bloqueado'; end if;
  if s.teto_total is not null and s.comprometido + s.realizado + total > s.teto_total then return 'vermelho'; end if;
  if total <= s.saldo_livre then return 'verde'; end if;
  return 'amarelo';
end $$;

-- Obra sem linha de base congelada não abre compra (E01)
create or replace function exige_linha_base() returns trigger language plpgsql as $$
begin
  if not (select linha_base_congelada from obra where id = new.obra_id) then
    raise exception 'Obra sem linha de base congelada não abre compra';
  end if;
  return new;
end $$;
create trigger t_lb_sol before insert on solicitacao for each row execute function exige_linha_base();
create trigger t_lb_oc  before insert on ordem_compra for each row execute function exige_linha_base();

-- Nota: só passa de 'lancada' com rateio fechando 100% e todas as linhas com obra+item
create or replace function valida_nota() returns trigger language plpgsql as $$
declare soma numeric;
begin
  if new.status in ('rateada','conferida','liberada','paga') then
    select coalesce(sum(valor),0) into soma from rateio_nota where nota_id = new.id;
    if round(soma,2) <> round(new.valor,2) then
      raise exception 'Rateio (%) não fecha 100%% da nota (%)', soma, new.valor;
    end if;
  end if;
  return new;
end $$;
create trigger t_valida_nota before update on nota_fiscal for each row execute function valida_nota();
