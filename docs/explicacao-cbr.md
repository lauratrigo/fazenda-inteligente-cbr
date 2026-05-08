# Explicação do CBR no jogo

## O que é Raciocínio Baseado em Casos

Raciocínio Baseado em Casos, ou CBR, é uma abordagem de Inteligência Artificial em que um problema novo é resolvido a partir de experiências anteriores semelhantes.

A ideia central é: se o sistema já viu uma situação parecida antes, ele pode reaproveitar a solução que funcionou e adaptá-la ao novo contexto.

## Como o jogo representa um caso

Em Fazendinha CBR, cada caso representa uma situação agrícola de um canteiro. Um caso descreve o estado do ambiente e da planta:

- clima;
- tipo de solo;
- umidade;
- nível de pragas;
- crescimento;
- saúde da planta;
- estágio da planta;
- ação aplicada;
- resultado observado;
- explicação.

Exemplo de caso:

```json
{
  "clima": "seco",
  "solo": "seco",
  "umidade": "baixa",
  "pragas": "nenhuma",
  "crescimento": "broto",
  "saude": "murcha",
  "estagioPlanta": "crescendo",
  "acaoAplicada": "regar",
  "resultado": "melhorou"
}
```

## Como o assistente recupera casos semelhantes

Quando o jogador pressiona `Q` perto de um canteiro, o Assistente CBR cria um caso atual com os dados daquele canteiro e do clima do dia.

Depois, o sistema compara o caso atual com todos os casos da base. A similaridade é calculada por pontos:

- clima igual: +10;
- solo igual: +20;
- umidade igual: +15;
- pragas iguais: +20;
- crescimento igual: +10;
- saúde igual: +15;
- estágio da planta igual: +10.

O caso com maior pontuação é recuperado. Em caso de empate, o sistema prefere o caso com melhor resultado anterior.

## Como reutiliza uma solução

Depois de recuperar o caso mais parecido, o assistente reutiliza a ação aplicada no caso antigo. Essa ação pode ser, por exemplo, regar, adubar, tratar pragas, plantar, colher ou esperar.

Essa etapa corresponde ao Reuse do ciclo CBR.

## Como adapta a solução

A solução antiga nem sempre é perfeita para o novo contexto. Por isso, o jogo aplica regras de revisão:

- canteiro vazio: preparar solo;
- solo preparado: plantar;
- planta pronta: colher;
- pragas altas: tratar pragas;
- solo seco ou baixa umidade: regar;
- solo pobre e planta amarelada: adubar;
- solo encharcado: evitar regar.

Essa adaptação corresponde ao Revise.

## Como salva novas experiências

Quando o jogador usa uma ferramenta em um canteiro, o jogo guarda o caso atual e a ação aplicada. Ao avançar o dia, a plantação cresce, melhora ou piora. O sistema avalia o resultado e salva uma nova experiência no LocalStorage.

Essa etapa corresponde ao Retain. Com isso, a base de casos aprendidos cresce com o tempo.

## Por que isso é IA simbólica/baseada em conhecimento

O projeto é uma aplicação simples de IA simbólica porque as decisões são feitas com regras explícitas, atributos compreensíveis e comparação entre casos conhecidos.

O sistema não usa redes neurais nem machine learning estatístico. Ele raciocina comparando situações agrícolas e reutilizando soluções de experiências anteriores.

## Limitações do projeto

- A similaridade usa comparação exata de atributos.
- Os pesos de similaridade foram definidos manualmente.
- A avaliação de resultado é simplificada.
- O clima é sorteado de forma simples.
- O LocalStorage salva dados apenas no navegador do jogador.
- O sistema não considera tipo de cultura, estação do ano ou nutrientes em escala numérica.
