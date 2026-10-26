# Acompanhamento de Veículos · PremieRpet

Painel de notas carregadas e veículos emitidos por transportadora e CD (VET e Venda Direta), com histórico desde janeiro/2026, frota disponível, lançamento manual por CD e simulação de projeção.

- **Site:** `index.html` (página única, sem build)
- **API:** `api/` (funções da Vercel)
- **Banco:** Upstash Redis

## Estrutura

```
index.html        painel (Visão Geral e Relatórios)
api/data.js       GET: lê todos os dados · POST: grava ou remove um registro (exige senha)
api/auth.js       confere a senha de edição
api/restore.js    restaura um backup (exige senha)
lib/redis.js      conexão com o Upstash
vercel.json       cabeçalhos e URLs limpas
.env.example      variáveis de ambiente necessárias
```

## Publicação (uma vez)

### 1. GitHub
1. Crie um repositório **privado** chamado `acompanhamento-veiculos`.
2. Envie todos os arquivos desta pasta (em *Add file → Upload files*, arraste o conteúdo da pasta).

### 2. Vercel
1. Em vercel.com, clique em *Add New → Project* e importe o repositório.
2. Mantenha o nome do projeto **`acompanhamento-veiculos`**. Framework: **Other**. Não precisa de comando de build.
3. Clique em *Deploy*.

### 3. Upstash (banco)
1. No projeto da Vercel, abra a aba **Storage → Create Database → Upstash for Redis** (o plano gratuito atende).
2. Região: **São Paulo (gru1)**, se disponível.
3. Conecte o banco ao projeto. A Vercel cria sozinha as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.

> Se preferir criar o banco direto em upstash.com, copie a *REST URL* e o *REST Token* para as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.

### 4. Senha de edição
1. Em *Settings → Environment Variables*, crie `ADMIN_KEY` com uma senha forte.
2. Só quem tem essa senha pode adicionar romaneios, CDs, frota e lançamentos. Quem só abre o link apenas visualiza e simula projeções.
3. Faça um novo deploy (*Deployments → ⋯ → Redeploy*) para as variáveis valerem.

### 5. Carregar o histórico
1. Abra o site, clique em **Entrar para editar** e digite a senha.
2. Na aba **Relatórios → Backup**, clique em **Restaurar backup** e escolha `backup-inicial-acompanhamento-veiculos.json`. Esse arquivo é entregue separado e **não vai para o GitHub**.

## Endereço do site

- **Padrão:** `https://acompanhamento-veiculos.vercel.app`. Se o nome estiver ocupado, a Vercel adiciona um sufixo; nesse caso, em *Settings → Domains*, cadastre outro endereço `.vercel.app` livre, por exemplo `premierpet-veiculos.vercel.app`.
- **Domínio da empresa (recomendado):** `veiculos.premierpet.com.br`
  1. Em *Settings → Domains*, adicione `veiculos.premierpet.com.br`.
  2. Peça à TI um registro DNS **CNAME** de `veiculos` apontando para `cname.vercel-dns.com`.
  3. O certificado HTTPS é emitido automaticamente.

## O que o painel mostra

- **Filtros (valem para Visão Geral e Frota):**
  - CD
  - Modalidade
  - Transportadora (para ver uma só)
  - Período: mês, semana/intervalo com data inicial e final, ou período completo
- **Visão Geral:** notas carregadas, saídas de veículos, participação por transportadora, veículos por modelo e gráfico por dia. Acima de 45 dias, o gráfico passa a ser por semana.
- **Adicionar dados:** informe transportadora, modelo, veículos e notas de qualquer CD.
  - *Simular* mostra os números só na tela de quem está vendo.
  - *Salvar no histórico* exige a senha.
  - O card abre sozinho quando o CD escolhido ainda não tem dados.
- **Simular projeção:** passa uma parte das notas da Descalvado para a Pet Supplies ou edita os números de cada transportadora.
- **Comparação com o período anterior:** os cards da Visão Geral mostram a variação em relação ao mês anterior, ou ao intervalo de mesmo tamanho imediatamente anterior.
- **Custos por transportadora:** quem edita informa o custo médio mensal por CD e transportadora. O painel rateia o custo pelas saídas do período e da modalidade e mostra o custo por saída, por nota e por kg, além da economia estimada da Pet Supplies em relação à Descalvado.
- **Evolução:**
  - Curva semanal da participação Pet Supplies × Descalvado desde janeiro, por notas ou por saídas, com a marca de 07/07 e a linha de 50%.
  - Saídas por dia da semana.
  - Desempenho por placa, com avisos de pouco uso, poucas notas e baixa ocupação.
- **Frota:**
  - Cadastro da frota disponível por CD, transportadora e modelo.
  - Utilização média, pico, veículos ociosos e utilização por dia.
  - **Calculadora de frota:** veículos necessários para uma meta de participação e projeção de quando a Pet Supplies passa a Descalvado.
- **Avisos no topo:**
  - Romaneio do dia ainda não adicionado.
  - Frota acima de 100% ou com pouco uso.
  - Variação da participação da Pet Supplies em relação à semana anterior.

## Rotina diária

Na aba **Relatórios**:

1. **Romaneio VET:** escolha o CD e arraste o relatório de romaneio do Lincros (.csv ou .xlsx).
2. **Romaneio Venda Direta:** mesma coisa na outra caixa.
3. Um novo arquivo da mesma data, modalidade e CD substitui o anterior.

**Leitura dos arquivos:** o painel lê só a seção de veículos do romaneio e ignora placas fictícias. A data vem da coluna *Data Roteiro*; se o arquivo não trouxer data, usa a data do campo. As rotas da Pet Supplies anteriores a 07/07/2026 contam como Expresso Descalvado, e Enzo aparece como Alltop.

**Outros CDs:** crie o CD (botão *+ Novo CD*) e use o **Lançamento manual**, ou anexe o romaneio escolhendo esse CD.

**Backup:** use *Baixar backup* de vez em quando para guardar uma cópia.

## Privacidade

- O endereço não aparece em buscadores (`noindex`).
- Qualquer pessoa com o link consegue ver os dados.
- Para restringir quem pode abrir o site, use *Settings → Deployment Protection* da Vercel.
