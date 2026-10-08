# Ciclo de estudos — cronômetro, histórico e sincronização

## Atualizar o GitHub Pages

Extraia o ZIP e envie todos os arquivos para a raiz da branch que publica seu site. Substitua `index.html` e `app.js` e inclua também `study-core.js`, `tracker.js`, `tracker.css`, `reviews.js`, `reviews.css`, `colors.js`, `diagram.png` e `favicon.ico`. Não publique o ZIP inteiro como se fosse a página.

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

O ícone diagram.png aparece na aba e nos favoritos. Se o navegador ainda mostrar o ícone antigo, recarregue a página e recrie o favorito. Matérias têm cores próprias, fases têm cores distintas e os cabeçalhos dos dias usam azul.
