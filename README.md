# Fazendinha CBR

Fazendinha CBR é um jogo 2D top-down de fazenda feito com HTML5, CSS3, JavaScript puro e Canvas 2D. O jogador anda pelo mapa, prepara canteiros, planta sementes, rega, aduba, trata pragas, colhe alimentos e recebe recomendações de um assistente agrícola baseado em Raciocínio Baseado em Casos.

## Objetivo acadêmico

O objetivo do projeto é demonstrar o paradigma de Raciocínio Baseado em Casos, ou CBR, dentro de uma experiência jogável. A IA não aparece como um formulário principal, mas como uma mecânica de apoio ao jogador durante o cuidado da plantação.

Disciplina: Inteligência Artificial  
Tema: Raciocínio Baseado em Casos  
Autores: _preencher com os nomes do grupo_

## Como executar

Abra o arquivo `index.html` diretamente no navegador.

O projeto não precisa de servidor, backend, instalação de dependências ou frameworks.

## Controles

- `WASD` ou `setas`: mover o personagem.
- `1`: selecionar enxada.
- `2`: selecionar semente.
- `3`: selecionar regador.
- `4`: selecionar adubo.
- `5`: selecionar controle de pragas.
- `6`: selecionar colher.
- `E` ou `Espaço`: usar a ferramenta no canteiro atual ou no canteiro à frente.
- `Q`: pedir recomendação ao Assistente CBR.
- `N`: dormir e avançar para o próximo dia.

## Mecânicas do jogo

O jogador começa com 10 sementes, 0 colheitas e 0 moedas.

O mapa possui grama, caminho, casa, árvores, cerca, espantalho inteligente e uma área de plantio. Os canteiros podem passar por estados visuais diferentes:

- vazio;
- solo preparado;
- semente;
- broto;
- planta média;
- planta adulta;
- planta com problema;
- pronta para colher.

As ferramentas permitem:

- preparar solo com a enxada;
- plantar sementes;
- regar para aumentar a umidade;
- adubar para recuperar solo pobre;
- aplicar controle de pragas;
- colher plantas prontas e ganhar moedas.

O jogo tem sistema de dias e clima. Chuva ajuda a regar, clima seco reduz umidade, clima nublado é mais neutro e sol pode secar o solo aos poucos.

## Como o CBR aparece no gameplay

O CBR é representado pelo Assistente CBR, um espantalho inteligente no mapa e em um painel compacto lateral. Quando o jogador fica perto de um canteiro e pressiona `Q`, o assistente analisa a situação agrícola daquele canteiro.

O caso atual contém:

```json
{
  "clima": "seco",
  "solo": "seco",
  "umidade": "baixa",
  "pragas": "nenhuma",
  "crescimento": "broto",
  "saude": "murcha",
  "estagioPlanta": "crescendo"
}
```

O assistente compara esse caso com a base de casos e recomenda uma ação como regar, adubar, tratar pragas, plantar, colher ou esperar.

## Ciclo CBR no jogo

### Retrieve

Ao pressionar `Q`, o assistente monta o caso atual do canteiro e recupera o caso mais parecido da memória.

### Reuse

A ação aplicada no caso recuperado é usada como solução inicial.

### Revise

A solução é adaptada por regras fortes do jogo. Por exemplo:

- se o canteiro estiver vazio, recomendar preparar solo;
- se o solo estiver preparado, recomendar plantar;
- se a planta estiver pronta, recomendar colher;
- se houver pragas altas, priorizar tratar pragas;
- se o solo estiver seco ou a umidade estiver baixa, recomendar regar;
- se o solo estiver pobre e a planta amarelada, recomendar adubar;
- se o solo estiver encharcado, evitar regar.

### Retain

Depois que o jogador aplica uma ferramenta e avança o dia, o sistema avalia o resultado e salva o novo caso no LocalStorage. Assim, a memória do assistente cresce durante o jogo.

## Fórmula de similaridade

A similaridade é calculada por pontos:

- clima igual: +10;
- solo igual: +20;
- umidade igual: +15;
- pragas iguais: +20;
- crescimento igual: +10;
- saúde igual: +15;
- estágio da planta igual: +10.

A pontuação máxima é 100 pontos. O painel do assistente mostra a porcentagem do caso recuperado de forma discreta.

## Estrutura de arquivos

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── player.js
│   ├── map.js
│   ├── crops.js
│   ├── cbr.js
│   ├── storage.js
│   └── ui.js
├── docs/
│   ├── explicacao-cbr.md
│   └── roteiro-apresentacao.md
├── README.md
├── CHANGELOG.md
└── .gitignore
```

## Responsabilidade dos scripts

- `main.js`: inicializa o jogo.
- `game.js`: controla loop principal, atualização, renderização, input e passagem de dia.
- `player.js`: movimentação, direção e interação do jogador.
- `map.js`: mapa, tiles, colisões, decoração e área de plantio.
- `crops.js`: regras das plantações, ferramentas, crescimento e resultados.
- `cbr.js`: base de casos, similaridade, Retrieve, Reuse, Revise e Retain.
- `storage.js`: progresso e casos aprendidos no LocalStorage.
- `ui.js`: HUD, painel do assistente e mensagens do jogo.

## Possíveis melhorias futuras

- Adicionar loja de sementes e upgrades de ferramentas.
- Criar diferentes culturas com tempos de crescimento próprios.
- Implementar sons e música ambiente.
- Adicionar missões ou metas por semana.
- Criar mais animações para o personagem.
- Exportar e importar a base de casos aprendidos.
- Adicionar tela de vitória ou objetivos acadêmicos guiados.
