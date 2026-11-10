# 📄 ResumAI ATS - Otimizador de Currículo para Triagem Automática

> Aplicação web desenvolvida no Lovable.dev para comparar currículos contra descrições de vagas, identificar lacunas de palavras-chave e gerar versões otimizadas para sistemas ATS (Applicant Tracking Systems).

---

## 🔗 Acesso ao Projeto
- **Aplicação Publicada:** https://curriculumotimizado.lovable.app
- **Repositório:** 

---

## 🎯 O Problema
Sistemas ATS (Applicant Tracking Systems) filtram currículos automaticamente antes da avaliação humana por meio de varredura semântica e correspondência de palavras-chave. Bons profissionais são descartados prematuramente por:
1. Utilizarem layouts incompatíveis com parsers (tabelas, colunas complexas, ícones ou caixas de texto).
2. Ausência dos termos técnicos exatos exigidos na vaga, mesmo possuindo a competência prática.
3. Má estruturação de títulos de seções e verbos de ação.

Esta aplicação resolve essa barreira reorganizando o currículo real do candidato de acordo com a vaga visada, sem jamais inventar qualificações fictícias.

---

## 🛠️ Tecnologias Utilizadas
- **Plataforma No-Code / Low-Code:** [Lovable.dev](https://lovable.dev)
- **Framework Front-End:** React + TypeScript + Vite
- **Estilização & Componentes:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- **Ícones:** Lucide React

---

## ⚙️ Como a Análise Funciona
1. **Entrada de Dados:** O usuário insere a descrição da vaga e o texto do currículo nos campos correspondentes.
2. **Extração de Termos:** A aplicação varre a descrição da vaga identificando hard skills, ferramentas, métodos ágeis e competências centrais.
3. **Cálculo de Match:** O algoritmo cruza o vocabulário da vaga com o texto do currículo original, gerando uma nota percentual de compatibilidade.
4. **Mapeamento de Lacunas:** Exibe visualmente badges com termos coincidentes (verde) e termos ausentes (amarelo).
5. **Reescrita ATS-Friendly:** O currículo é reorganizado em formato linear, com cabeçalhos padrão (`RESUMO`, `EXPERIÊNCIA`, `HABILIDADES`, `FORMAÇÃO`), sem elementos gráficos obstrutivos e com opção de exportação limpa.

---

## 🧠 Mega Prompt Original
Prompt estruturado utilizado na geração da aplicação via Lovable:

# Projeto: ResumAI ATS - Otimizador de Currículos para Triagem Automática

Crie uma aplicação web moderna, responsiva e acessível focada em adequar currículos para sistemas ATS (Applicant Tracking Systems), comparando a descrição da vaga com o currículo do candidato e gerando uma versão otimizada pronta para exportação.

---

## 1. Diretriz Ética Inviolável
- A aplicação deve **apenas reorganizar, reescrever e destacar experiências reais** fornecidas pelo usuário.
- **Nunca inventar competências, cargos, métricas ou cursos** inexistentes no texto original.
- Exibir com destaque visual (banner/aviso com ícone de escudo): *"Princípio Ético: Otimizamos seu currículo sem inventar nenhuma experiência. A transparência garante seu sucesso na entrevista."*

---

## 2. Design System & Identidade Visual
- **UI Framework**: Componentes do `shadcn/ui` (Card, Button, Textarea, Progress, Badge, Tabs, Alert, Dialog, Separator, Tooltip).
- **Ícones**: `lucide-react` (CheckCircle, AlertTriangle, FileText, ArrowRight, Download, Copy, Sparkles, ShieldCheck).
- **Paleta de Cores**:
  - *Fundo*: Slate-50 (#F8FAFC) com áreas de trabalho em Branco puro (#FFFFFF).
  - *Tipografia*: Slate-900 (#0F172A) para títulos, Slate-600 (#475569) para apoio.
  - *Cor Primária / Ação*: Indigo-600 (#4F46E5) com hover em Indigo-700.
  - *Sucessos / Match Alto*: Emerald-600 (#059669) e Emerald-100 para badges.
  - *Alerta / Palavras Faltantes*: Amber-600 (#D97706) e Amber-100 para badges.
  - *Bordas*: Slate-200 (#E2E8F0).
- **Tipografia**: Sans-serif limpa (Inter ou padrão do sistema), foco em legibilidade e hierarquia estrita.

---

## 3. Estrutura e Telas da Aplicação

### A. Cabeçalho (Header)
- Logotipo com ícone de documento estilizado e texto: **ResumAI ATS**.
- Badge discreto: "100% ATS Friendly".
- Botão/Link para limpar campos e começar nova análise.

### B. Seção de Entrada (Input Section)
Layout em duas colunas (lado a lado no desktop, empilhado no mobile):
1. **Coluna 1 (Vaga Desejada)**:
   - Título: "1. Descrição da Vaga".
   - Textarea expansível com placeholder: "Cole aqui os requisitos, responsabilidades e qualificações da vaga...".
   - Contador de caracteres/palavras.
   - Botão para preencher com exemplo de vaga (para teste rápido).
2. **Coluna 2 (Seu Currículo Atual)**:
   - Título: "2. Seu Currículo Atual".
   - Textarea expansível com placeholder: "Cole o texto completo do seu currículo atual...".
   - Contador de caracteres/palavras.
   - Botão para preencher com currículo de exemplo.
3. **Barra de Ação Central**:
   - Botão primário destacado: "Analisar e Otimizar Currículo" com animação de carregamento (spinner) ao clicar.

### C. Seção de Resultados (Exibida após a análise)
Painel dividido em três abas ou cartões bem definidos:

1. **Dashboard de Compatibilidade (Match Score)**:
   - Indicador circular ou barra de progresso mostrando o **Match Score** (0% a 100%).
   - Classificação textual (ex: "Baixa compatibilidade", "Boa aderência", "Excelente aderência").
   - Diagnóstico resumido: 3 pontos fortes e 3 gargalos identificados para o ATS.

2. **Auditoria de Palavras-chave (Keywords Tracker)**:
   - **Palavras-chave encontradas** (Badges em Emerald com ícone de check): termos técnicos, hard skills e soft skills que já coincidem.
   - **Palavras-chave ausentes / recomendadas** (Badges em Amber com ícone de alerta): competências da vaga que não aparecem no currículo original e precisam ser consideradas.

3. **Currículo ATS-Friendly Gerado**:
   - Formatação estruturada em padrão ATS: títulos lineares em caixa alta (RESUMO PROFISSIONAL, EXPERIÊNCIA, HABILIDADES, FORMAÇÃO), sem tabelas, colunas duplas ou caixas de texto que quebram parsers.
   - Verbos de ação fortes e realinhamento das sentenças com os termos da vaga.
   - Toolbar de exportação:
     - Botão "Copiar Texto" (com feedback de toast/check).
     - Botão "Baixar TXT".
     - Botão "Exportar PDF Formatado para ATS".

---

## 4. Lógica de Processamento (Simulação Frontend Inteligente)
- Extrair termos-chave (hard skills, cargos, ferramentas e metodologias) da vaga informada.
- Verificar quais aparecem no texto do currículo do usuário.
- Calcular a pontuação: `(termos_encontrados / total_termos_relevantes) * 100`.
- Montar o texto ajustado organizando o conteúdo original nas seções padrão de um currículo ATS, inserindo as palavras-chave ausentes de forma contextualizada apenas onde for pedagogicamente plausível dentro do contexto profissional do usuário.
\`\`\`

---

## 🔄 Ajustes e Refinamentos Pós-Geração
Após a versão inicial gerada pela IA, foram solicitados os seguintes ajustes:
1. **Exportação Funcional para Impressão/PDF:** A versão inicial apenas exibia o texto em tela. Foi solicitado o ajuste com regras `@media print` para exportar um PDF com margens limpas de 2cm, texto mono-coluna e compatível com parsers ATS.
2. **Aviso de Ética & Transparência:** Reforço do banner explicativo alertando que a IA apenas reestrutura experiências existentes, evitando distorções no perfil do candidato.
3. **Botões de Exemplo (Quick Test):** Adição de botões para popular a vaga e o currículo com dados de teste em 1 clique, facilitando a demonstração imediata do sistema.

---

## 📸 Demonstração da Aplicação

### 1. Tela Inicial e Inserção de Dados
<img width="1829" height="858" alt="image" src="https://github.com/user-attachments/assets/be7f165e-4733-4c66-8fc9-c1c2e3c7338c" />


### 2. Diagnóstico de Compatibilidade e Palavras-chave

<img width="1783" height="838" alt="image" src="https://github.com/user-attachments/assets/a89f99ea-cd9e-4ee1-ab78-c2c18b1f4074" />

### 3. Currículo Otimizado Pronto para Exportar

<img width="1829" height="847" alt="image" src="https://github.com/user-attachments/assets/c2b807be-fe13-4c66-a045-3a8d50224579" />



---

## 🛡️ Princípio de Integridade
A ferramenta atua estritamente como um formatador estratégico de perfil. Toda e qualquer competência sugerida deve ser revisada e confirmada pelo próprio candidato antes do envio ao RH.
