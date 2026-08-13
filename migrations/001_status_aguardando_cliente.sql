-- Novo valor de status do painel: aguardando_cliente. `conversas.status` é TEXT (sem CHECK
-- constraint hoje), então não há enum para alterar — este arquivo documenta o novo valor
-- válido e faz o backfill de linhas antigas, anteriores à atualização do workflow do n8n,
-- que ficaram em aguardando_humano mas já tinham o comprovante validado pelo bot.

UPDATE felipe_system.conversas
SET status = 'aguardando_financeiro'
WHERE estado = 'finalizado' AND status = 'aguardando_humano';
