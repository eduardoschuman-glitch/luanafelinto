# Beauty Bank · Luana Felinto

Página do programa de membros da clínica: a mensalidade vira saldo para usar em qualquer procedimento, com preço de membro e saldo que não expira.

Endereço: https://eduardoschuman-glitch.github.io/luanafelinto/beauty-bank/

## De onde veio o modelo

Inspirado no Beauty Bank da Ever/Body (Nova York), estudado em 05/10/2026:

- Página do programa: https://home.everbody.com/beauty-bank
- Loja de assinatura (Zenoti): três planos de US$ 149, 249 e 349 por mês

O que a Ever/Body faz: 100% da mensalidade vira crédito que não expira, desconto de 10% a 15% por categoria (20% em preenchimento e bioestimulador no plano mais alto), 2% de volta em pontos no que passa do saldo, crédito no mês do aniversário, fidelidade de 6 meses, aviso de 4 semanas para cancelar, taxa de adesão de US$ 49 e devolução dos descontos se cancelar antes dos 6 meses.

## O que mudou na adaptação para o Brasil

- Uma página só, sem escolha de filial.
- Sem taxa de adesão.
- A Ever/Body cobra os descontos de volta e mais uma mensalidade em quem sai antes de 6 meses. Aqui ficou só a devolução dos descontos, que é mais fácil de defender pelo Código de Defesa do Consumidor.
- Pagamento recorrente no cartão de crédito.
- Sem loja online: os botões abrem o WhatsApp da clínica (5551993734545) com o plano escolhido já escrito na mensagem.
- Os pontos de fidelidade viraram "2% de volta como saldo".

## Antes de ir ao ar: validar com a Luana

Os preços dos procedimentos vêm da `Tabela de Procedimentos e Valores.md`. **Tudo o que é oferta é proposta** e fica num bloco só no começo do `<script>` (`PLANOS`, `CASHBACK`, `PROCEDIMENTOS`):

1. **Valor dos planos:** Essencial R$ 350, Signature R$ 590, Prestige R$ 990. O Essencial foi pensado para cobrir um Botox Terço Superior (R$ 1.400) a cada 4 meses.
2. **Descontos:** 10% / 15% / 15% (20% em preenchimento e bioestimulador no Prestige). A comissão da profissional é de 70% nos injetáveis, então o desconto sai quase todo da parte da clínica. Rodar na calculadora de viabilidade antes de fechar, junto com a pendência de quem compra a toxina.
3. **2% de volta:** precisa de alguém controlando o saldo. Para tirar, troque `CASHBACK` para 0 e a vantagem some da página.
4. **Mimo de aniversário, convites para eventos e prioridade na agenda (Prestige):** confirmar se a clínica consegue cumprir.
5. **Pagamento:** confirmar se o sistema da clínica faz cobrança recorrente no cartão. Se fizer Pix Automático, dá para incluir.
6. **Como a cliente vê o saldo:** a página diz que é pelo WhatsApp e na recepção, antes de cada atendimento. Confirmar se o sistema de agenda guarda esse saldo.

## Fotos

Ficam em `beauty-bank/assets/` (também copiadas em `luanafelinto-midia/fotos/beauty-bank/`; o deploy daquele repositório travou na fila do GitHub em 05/10/2026, então a página usa a cópia local). Ensaio da Luana, ambiente da clínica e procedimentos sem rosto identificável de paciente (Ultraformer e marcação vindos da pasta Procedimentos do Drive da clínica). As fotos e vídeos de avaliação de Botox do Drive mostram o rosto de pacientes e ficaram de fora até existir termo de imagem.
