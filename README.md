# Ciclo de estudos — cronômetro, histórico e sincronização

## Atualizar o GitHub Pages

Extraia o ZIP e envie todos os arquivos para a raiz da branch que publica seu site. Substitua `index.html` e `app.js` e inclua também `study-core.js`, `tracker.js`, `tracker.css`, `reviews.js`, `reviews.css`, `colors.js`, `eagle.svg`, `eagle.png` e `favicon.ico`. Não publique o ZIP inteiro como se fosse a página.

O site é estático: não precisa instalar dependências nem compilar. Os caminhos dos arquivos são relativos e funcionam em `usuario.github.io/nome-do-repositorio/`.

Se estiver começando: em **Settings → Pages**, selecione **Deploy from a branch**, a branch `main` e `/ (root)`.

## Salvar os dados no GitHub

1. Crie um repositório para os dados, de preferência **privado e separado** do repositório público do site. Marque a opção de criar um README para que a branch exista.
2. Em https://github.com/settings/personal-access-tokens/new, crie um **fine-grained personal access token**, com validade e acesso somente ao repositório de dados.
3. Em **Repository permissions → Contents**, selecione **Read and write**.
4. No site, abra **Salvar no GitHub**, informe `usuario/repositorio`, cole o token e clique em **Conectar e sincronizar**. O campo de branch pode ficar vazio: ele usará a branch padrão.
5. O site lê ou cria `ciclo-estudos/dados.json`. Matérias, planejamento, sessões, correções e exclusões são sincronizados. Cada gravação gera um commit, permitindo consultar versões pelo histórico do GitHub.

O token fica apenas na memória da aba: não é inserido no código, exportado no backup ou armazenado no navegador. Ao fechar/reabrir ou recarregar a página, cole o token novamente para continuar sincronizando. Não envie o token em conversas, arquivos ou commits.

Sem conexão, as alterações ficam na cópia local e são enviadas quando você conectar ou sincronizar novamente. A interface diferencia registros pendentes de gravações concluídas. Uma branch que exige pull requests pode impedir gravações diretas. Prefira um repositório de dados dedicado.

## Cronômetro e horas líquidas

Abra **Estudo e histórico**, selecione uma matéria e use **Iniciar**, **Pausar**, **Parar** e **Salvar sessão**. As pausas são excluídas. Um cronômetro iniciado continua contando quando a aba está em segundo plano; pause quando interromper o estudo. Uma sessão que cruza a meia-noite é distribuída entre as datas locais.

Para corrigir uma sessão, use **Editar** no histórico. Também é possível adicionar sessões manualmente no formato `h:mm`, com data, matéria e observação. Os gráficos diário, semanal e mensal e os totais são recalculados. As semanas começam na segunda-feira, usando o calendário local do dispositivo.

## Levar os dados para outro endereço

No endereço antigo, abra **Salvar no GitHub → Backup e mudança de endereço → Baixar backup dos dados**. No endereço novo, importe o arquivo ou conecte ao mesmo repositório de dados. Importar combina os registros pelos seus identificadores; não duplica o mesmo registro.

Dados no navegador pertencem ao endereço em que foram criados. Se você nunca conectou o site antigo ao GitHub, ele não terá como recuperar automaticamente aqueles dados pelo endereço novo.

## Limites e verificação

A sincronização foi testada com respostas simuladas do GitHub: gravação, recuperação, erros de rede, conflitos, edição durante uma gravação e exclusões. A conexão real precisa ser concluída com sua conta, repositório e token. O arquivo de dados é limitado a aproximadamente 950 KB nesta versão; exporte backups periodicamente para preservar uma cópia independente.

A mesma sessão editada em dois dispositivos usa a alteração mais recente. Para o planejamento, prevalece a configuração alterada por último. Evite estudar com o mesmo cronômetro aberto simultaneamente em várias abas.

## Revisões por assunto

Na aba Revisões, escolha a matéria, escreva o assunto, a data estudada e as observações. O sistema agenda D+1, D+7, D+14, D+30, D+90 e D+120 a partir da data original. Revisões que cairiam no domingo passam para segunda-feira. Filtre por matéria, assunto ou situação: vencida, agendada e finalizada.

O cronômetro de revisão registra horas líquidas no mesmo histórico, identificado como Revisão. Iniciar um cronômetro pausa o outro. As horas podem ser corrigidas no histórico; os gráficos separam Estudos e Revisões. Concluir uma revisão sem cronômetro não inventa horas estudadas.

Ao passar para Consolidação, use os controles manuais para editar um plano, deslocar as revisões pendentes ou excluir as pendentes daquela matéria. As horas realizadas são preservadas; a exclusão de pendentes também preserva as revisões finalizadas. Nenhum plano é apagado automaticamente por mudar a fase.

Os lembretes aparecem ao abrir a página. Notificações do navegador dependem de autorização e da página aberta. Para lembretes fora do site, exporte o calendário ICS e importe no seu aplicativo de calendário. Essa exportação é uma fotografia do planejamento: alterações posteriores exigem atualizar o calendário.

Planos e revisões são incluídos na sincronização com GitHub e nos backups. Dados da versão anterior são migrados automaticamente; sessões antigas são classificadas como Estudos.

## Ícone e cores

O ícone eagle.svg aparece na aba e nos favoritos. Se o navegador ainda mostrar o ícone antigo, recarregue a página e recrie o favorito. Matérias têm cores próprias, fases têm cores distintas e os cabeçalhos dos dias usam azul.

Os dois cronômetros possuem Reiniciar: ele descarta apenas o tempo não salvo após confirmação, mantendo os campos selecionados. O aviso informativo do modo automático pode ser ocultado pelo ×; permanece oculto nesta aba para a mesma mensagem.

## Planejamento ligado ao histórico

O símbolo verde indica presença de estudo, mesmo abaixo do tempo planejado. Só sessões de Estudos contam (cronômetro ou registro manual). Sessões de Revisões ficam separadas. Várias sessões da mesma matéria no mesmo dia contam como uma presença. O sistema primeiro liga o registro ao bloco de mesma matéria e data; estudos fora do dia preenchem um único bloco restante daquela matéria na semana, começando pelo mais antigo.

Os símbolos usam a semana de segunda a domingo e são recalculados quando as horas são corrigidas ou excluídas. Na próxima segunda começa uma semana sem os símbolos anteriores; o histórico permanece. Todos os cabeçalhos dos dias mantêm o azul padrão. Os relógios aparecem apenas nos blocos de hoje ainda não estudados e abrem o estudo com a matéria selecionada, sem iniciar o cronômetro automaticamente.

Para uma mudança no meio da semana, os blocos dos dias passados ficam preservados a partir desta versão; hoje e os próximos dias seguem a distribuição normal. Os indicadores pertencem à matéria e data, nunca à posição da caixa. Uma matéria nova não herda o símbolo da anterior. No primeiro uso, a semana inicial é registrada a partir do cronograma disponível, pois a versão anterior não guardava snapshots diários.

Em dias passados sem presença, o ícone de anotação abre Notas com data e matéria preenchidas. Registre motivo e próximo ajuste; é possível editar ou excluir e filtrar o histórico por mês e matéria. Notas não registram horas nem marcam a tarefa como cumprida. Elas e os registros diários do planejamento entram no backup e na sincronização com GitHub.

Ao atualizar, envie também progress.js e progress.css, além dos demais arquivos do ZIP.

## Agenda compacta de revisões

A agenda principal mostra apenas revisões pendentes de hoje e atrasadas. A seção “Ver revisões programadas e finalizadas” inicia fechada, com filtros próprios de disciplina, assunto e situação. Ambas as listas usam páginas de 10 registros, com Anterior/Próxima e contagem. Alterar filtros volta à primeira página. Ao finalizar uma revisão, ela sai das pendentes e fica disponível no filtro Finalizadas da seção expansível.

Planos por assunto mostra até os três planos mais recentes. Os demais ficam em seção expansível, com filtros próprios de disciplina, assunto e presença de revisões pendentes. A paginação mostra dez planos por página, com Anterior/Próxima e contagem. Os três destacados não se repetem na lista expansível.

## Atualização v10

Esta versão usa reviews-v10.js para impedir que um script antigo em cache mostre todos os planos. Envie todos os arquivos do pacote, especialmente index.html e reviews-v10.js. A lista principal mostra no máximo três planos; a expansível contém os restantes.
