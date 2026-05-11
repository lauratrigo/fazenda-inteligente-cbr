# Changelog

## [2.8.0] - 2026-05-11
### Corrigido
- Campo de nome do personagem passa a aceitar letras usadas pelos atalhos do jogo, como A, W, S, D, E, Q, N e TAB, quando o foco está no formulário.
- Solo encharcado agora drena em dias sem chuva, evitando canteiros travados por muitos dias.
- Crescimento da cenoura ajustado para ficar pronta em poucos dias quando recebe água e solo equilibrado.
- Regras do CBR reforçadas para evitar tratar pragas inexistentes e adubar canteiros já saudáveis e adubados.

### Adicionado
- Nome oficial "Vale dos Causos".
- Animação de abertura com título, fazenda ao fundo, folhas e opção de pular com clique, Enter ou Espaço.
- Trajetória contínua de sol e lua em arco, com nascer pela esquerda e pôr pela direita.
- Melhorias visuais nas culturas prontas para colher, com formas mais distintas para cenoura, milho, tomate e morango.

### Alterado
- Identidade visual e textos principais atualizados para "Vale dos Causos".
- Ciclo visual de céu e paleta ajustado para transições mais suaves entre dia, tarde, noite e amanhecer.
- README, documentação e roteiro atualizados com o trocadilho causos/casos, novo nome e ajustes de crescimento/CBR.

## [2.7.0] - 2026-05-09
### Corrigido
- Ciclo visual de dia/noite ajustado para uma transição mais lenta e gradual.
- Sol, lua e brilho do fundo reposicionados para ficarem mais visíveis na área do céu.
- NPC da loja reposicionado atrás do balcão e com indicador de interação mais claro.
- Balão visual bugado do NPC removido.
- Placa da loja revisada para evitar textos "LOJA" sobrepostos.
- Menu interno sem duplicação da explicação "Como o CBR funciona neste jogo".

### Adicionado
- Piscada sutil no personagem do jogador.
- Piscada sutil no NPC vendedor.
- Vitórias-régias com tamanhos, posições e movimento de boiar mais variados.
- Mais variações visuais de grama, matinhos, flores e árvores.

### Alterado
- CBR passa a consultar casos aprendidos antes da base inicial, dando mais peso à memória recente do jogador.
- Regras de segurança do CBR reforçadas para evitar recomendações impossíveis, como plantar sem semente, colher antes da hora ou regar solo encharcado.
- Vento, lagoa, vegetação e árvores receberam ajustes para parecerem mais naturais e menos repetitivos.
- README, documentação e capturas atualizados para refletir o estado atual do jogo.

## [2.6.0] - 2026-05-09
### Corrigido
- Botão "Menu" reposicionado para dentro do quadro do jogo.
- Painel fixo de controles removido da lateral principal.
- Seletor nativo de cor substituído por paletas próprias, evitando abertura acidental.
- Texto "Seu fazendeiro" ajustado para "Seu personagem".
- Camadas do mapa revisadas para evitar árvores invadindo visualmente a casa.

### Adicionado
- Prints do menu, fazenda, loja, pesca, casa e CBR na documentação.
- Novos estilos de cabelo, incluindo trança simples e chapéu de palha.
- Novos estilos de roupa, incluindo roupa longa, camiseta com alça e roupa de fazenda.
- Botões de paleta de cor com destaque visual da seleção atual.
- Movimento visual de sol/lua e paleta automática de noite durante sessões longas.

### Alterado
- Explicação "Como o CBR funciona neste jogo" reposicionada logo abaixo do jogo.
- Personagem com rosto e variações visuais mais claras de cabelo, roupa e acessórios.
- Loja, NPC vendedor, cerca, caminhos e sinalização visual receberam polimento.
- README atualizado para refletir a UX atual e incluir capturas do jogo.

## [2.5.0] - 2026-05-08
### Corrigido
- Seletor de cor recebendo blur ao clicar fora ou apertar `ESC`.
- Textos de controles incompletos para `E`, `Espaço`, clique esquerdo e clique direito.
- Pesca instantânea e fácil de spammar.
- Linha de pesca desalinhada, agora saindo do personagem até a água.
- Ferramenta "Pragas" renomeada para "Inseticida".
- Placas sem função, agora com dicas contextuais.
- Bug visual de árvores invadindo a área da casa.
- Cerca vertical usando o mesmo visual da cerca horizontal.

### Adicionado
- Pesca com estados de lançamento, espera, aproximação, fisgada, captura e falha.
- Bolhas, boia, ondulações e tempo de reação na pesca.
- Ícones SVG simples para sementes, colheitas, peixes, clima, ferramentas e loja.
- Indicadores de interação sobre casa, loja, lago, placas e Assistente CBR.
- NPC vendedor e placa visual da loja.
- Interior de casa mais completo, com cama, tapete, mesa, janela, baú e calendário.
- Menu interno do jogo com dormir, som, salvar, resetar, controles e explicação CBR.
- Ciclo visual de noite ao dormir, com lua e paleta mais fria.
- Vento dinâmico com folhas leves e mais movimento ambiental.
- CBR com comentários de economia e pesca.

### Alterado
- Melhorias visuais no lago, casa, loja, cercas, árvores, grama, flores, espantalho e HUD.
- Economia da loja continua dinâmica e agora é comentada pelo Assistente CBR.
- Trocar sementes com `TAB` ou pelo painel passa a equipar automaticamente a ferramenta Semente.
- Customização do personagem ampliada com estilos de cabelo e roupa.
- Interface lateral mais limpa, com ações gerais movidas para o menu interno.

## [2.4.0] - 2026-05-08
### Adicionado
- Menu principal com customização de personagem.
- Personagem segurando ferramentas visualmente.
- Tipos diferentes de sementes e culturas.
- Loja com compra, venda e economia dinâmica.
- Lago vivo com animação de água.
- Sistema simples de pesca.
- Mapa maior com câmera seguindo o personagem.
- Casa interativa para dormir e avançar o dia.
- Interação com canteiros por clique.
- Céu e efeitos visuais de clima.
- Árvores maiores com animação de vento.
- Melhorias visuais na casa, cerca e mapa.
- CBR considerando tipo de cultura.
- UI inspirada em jogos web casuais, com botões, ícones, feedbacks e menus mais amigáveis.

### Alterado
- Melhorias gerais no visual e no game feel.
- HUD, mensagens, ícones e feedbacks mais amigáveis.
- Canteiros, plantas, árvores, casa, cerca e mapa com visual mais vivo.
- Interface menos acadêmica e mais próxima de um jogo web casual.
- Documentação atualizada para loja, pesca, culturas, customização e CBR por cultura.

## [2.2.0] - 2026-05-08
### Adicionado
- Estados visuais para solo seco, normal, molhado, encharcado e adubado.
- Partículas e efeitos para ferramentas.
- Animações ambientais e feedback visual do CBR.
- Sons simples de ações e botão mute.
- Destaque visual no canteiro analisado pelo Assistente CBR.

### Alterado
- Melhorias gráficas no mapa, canteiros, plantas, HUD e assistente.
- Versão do projeto atualizada para refletir o polimento visual e de game feel.

## [2.1.0] - 2026-05-08
### Adicionado
- Repositório organizado para publicar a versão final em Phaser 3 pela branch `main`.
- Workflow ajustado para deploy pela `main`.
- Migração do jogo para Vite, TypeScript e Phaser 3.
- Arquitetura modular com Scenes, Systems, Entities, Data e UI.
- Configuração de deploy automático no GitHub Pages.
- Workflow GitHub Actions para build e publicação.
- Base path do Vite ajustado para `/fazenda-inteligente-cbr/`.

### Alterado
- O jogo passou a usar Phaser como runtime de Canvas/WebGL.
- A documentação foi atualizada com arquitetura, execução local e deploy.

## [2.0.0] - 2026-05-08
### Adicionado
- Transformação do projeto de simulador/formulário para jogo 2D de fazendinha.
- Adicionado mapa em Canvas.
- Adicionado personagem jogável.
- Adicionado sistema de plantio, rega, adubo, pragas e colheita.
- Adicionado assistente CBR integrado ao gameplay.
- Adicionado sistema de dias, clima, moedas e inventário.
- Adicionada persistência com LocalStorage.
- Atualizada documentação.

## [1.0.0] - 2026-05-07
### Adicionado
- Estrutura inicial do projeto.
- Primeira versão acadêmica do projeto de fazenda com CBR.
- Base inicial de casos.
- Cálculo de similaridade.
- Ciclo Retrieve, Reuse, Revise e Retain.
- Persistência com LocalStorage.
- Documentação do projeto.
