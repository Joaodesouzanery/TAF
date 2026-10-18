-- Fase 18: endurecimento. A função de gatilho não deve ser chamável pela API (RPC); o gatilho continua funcionando.
revoke execute on function public.trg_competencia_fechada() from public, anon, authenticated;
-- Mantidos de propósito (usados pelas políticas RLS e pelo app): meu_papel, tem_papel, pode_escrever, reservar_numeros, importar_obra (todas exigem usuário autenticado e verificam o papel por dentro).
