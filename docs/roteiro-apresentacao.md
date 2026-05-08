# Roteiro de Apresentação

## 1. O problema

"Queríamos demonstrar Raciocínio Baseado em Casos de uma forma prática, visual e jogável. Em vez de criar apenas um formulário de recomendação, transformamos o projeto em um jogo de fazendinha."

## 2. A ideia do jogo

"O jogador controla um personagem em uma fazenda vista de cima. Ele anda pelo mapa, usa ferramentas, prepara canteiros, planta sementes, rega, aduba, trata pragas e colhe alimentos."

## 3. O que o jogador faz

"O jogador começa com 10 sementes e 0 moedas. Para produzir, precisa preparar o solo com a enxada, plantar, cuidar da umidade, controlar pragas e colher quando a planta estiver pronta."

## 4. Onde está a IA

"A IA aparece dentro do jogo como o Assistente CBR, representado por um espantalho inteligente. Ela não domina a tela. Ela ajuda o jogador quando ele pressiona Q perto de um canteiro."

## 5. Como o CBR funciona no jogo

"Quando pedimos uma recomendação, o assistente monta o caso atual do canteiro. Esse caso possui clima, solo, umidade, pragas, crescimento, saúde e estágio da planta."

## 6. Demonstração prática

"Agora vamos aproximar o personagem de um canteiro com problema. Pressionamos Q. O assistente recupera um caso parecido da base, mostra a similaridade e recomenda uma ação. Por exemplo, se o solo estiver seco e a planta murcha, ele recomenda regar."

## 7. Retrieve, Reuse, Revise e Retain

"No Retrieve, o sistema recupera o caso mais parecido. No Reuse, reaproveita a ação usada anteriormente. No Revise, adapta a ação com regras fortes, como priorizar tratar pragas altas ou colher planta pronta. No Retain, salva o novo caso depois que o jogador age e passa o dia."

## 8. Como a base aprende

"Depois que usamos uma ferramenta e avançamos para o próximo dia, o jogo avalia se a ação melhorou, melhorou parcialmente, piorou, não teve efeito ou gerou colheita. Esse novo caso é salvo no LocalStorage e passa a fazer parte da memória do assistente."

## 9. Conclusão

"O projeto mostra uma aplicação de IA simbólica baseada em conhecimento. O sistema não usa machine learning complexo. Ele usa comparação entre casos, regras de adaptação e armazenamento de novas experiências para melhorar as próximas recomendações."
