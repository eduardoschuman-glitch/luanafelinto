# Clube do Botox · página de lançamento

Endereço: https://eduardoschuman-glitch.github.io/luanafelinto/clube-do-botox/

Feita a partir de `Clube do Botox/Clube do Botox - Plano de Lancamento.pdf`: 3 aplicações de Botox **só no terço superior** em 12 meses, 12x R$ 199 no cartão (InfinitePay), assinaturas de 26 a 30/10 até 20h, entrada pela palavra CLUBE no WhatsApp.

## Como a página vende

1. **Topo:** gancho ("O Botox dura em média quatro meses. O problema é quando você só lembra de voltar no sexto."), headline "Botox em dia, sempre", preço com âncora (R$ 796 por sessão contra R$ 1.400 avulsa) e contador.
2. **Segunda dobra:** espaço do vídeo em formato story (9:16), já com cara de vídeo pronto.
3. Gráfico do intervalo (avulso deixa a ruga voltar, Clube reaplica a cada 4 meses), o que inclui, as três áreas, as contas, o ano em três sessões, resultado natural, segurança do pagamento, os 5 passos, curadoria, condição de lançamento com contador e dúvidas.

## Para subir o vídeo

1. Coloque o arquivo em `clube-do-botox/assets/video-clube.mp4` (vertical, 9:16).
2. No `index.html`, no bloco de configuração do começo do `<script>`, troque `const VIDEO = '';` por `const VIDEO = 'assets/video-clube.mp4';`.
3. A capa continua sendo `assets/video-capa.jpg`. Para usar um quadro do próprio vídeo, troque esse arquivo.

Enquanto `VIDEO` estiver vazio, o clique mostra o aviso "O vídeo da Luana chega em breve por aqui."

## Antes de divulgar

- **Bônus de lançamento** e **número de vagas** ainda não foram definidos no plano. Preencha `BONUS` e `VAGAS` na configuração. Vazios, a página fala em "bônus exclusivo" e "vagas limitadas" sem detalhar.
- **Âncora de preço:** a página compara com R$ 1.400 por sessão (Botox Terço Superior à vista, da tabela), ou seja, R$ 4.200 nas três. O PDF do plano usava R$ 4.800, que é o preço parcelado (R$ 1.600). Optei pelo à vista porque é o número que a cliente vê primeiro na clínica.
- **Preço aparece na página.** O plano revela o valor só no dia 26/10, no grupo. Se o link for compartilhado antes disso, o preço fica exposto.
- **Regras de fidelidade e cancelamento:** a página só diz que são 12 meses e que as regras estão no termo, porque o termo ainda depende do advogado.
- **Quem aplica:** ainda em aberto no plano, então a página não cita nome.
- Os concorrentes encontrados incluem retorno de 15 dias ou retoque (Clube a R$ 220/mês com 3 retoques; Botofoz a R$ 208/mês com retorno de 15 dias e bônus). Se a Luana quiser incluir retoque, ele pode virar o bônus.

## Imagens

- `retrato.jpg`, `tercosup.jpg`, `aplicacao.jpg` e `still.jpg` foram geradas no Kairogen (Seedream 5 Pro, 2k) em 05/10/2026. São ilustrativas, não são pacientes, e o rodapé avisa "Imagens ilustrativas". Nenhuma delas é antes e depois.
- `video-capa.jpg` é foto real da Luana (Branding/Luana Felinto). `clinica-recepcao.jpg` é foto real da clínica.
