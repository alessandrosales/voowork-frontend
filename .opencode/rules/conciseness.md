# Conciseness (CRITICAL)

Saídas do agente devem ser curtas e objetivas. Verbosidade desperdiça tokens e atrapalha a revisão humana.

## Regras

1. **Relatório final ≤ 10 linhas** — apenas: o que foi feito, resultado (pass/fail), e riscos/blockers se existirem.
2. **Sem narrativa** — não reconte passos, não descreva o que "foi analisado".
3. **Sem re-colar diffs ou conteúdo de arquivos** a menos que pedido explicitamente.
4. **Sem seções prolixas** ("Summary", "Evidence", "Notes", "Checklist results" longas) — uma linha no máximo, só quando muda a decisão.
5. **Bullets, não parágrafos.** Omita detalhes óbvios.
6. **Riscos só se reais** — se não há risco, não invente uma seção de riscos.
7. Responda no idioma do usuário.
