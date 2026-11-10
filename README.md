# 📄 ResumAI ATS - Otimizador de Currículo para Triagem Automática

> Aplicação web desenvolvida no Lovable.dev para comparar currículos contra descrições de vagas, identificar lacunas de palavras-chave e gerar versões otimizadas para sistemas ATS (Applicant Tracking Systems).

---

## 🔗 Acesso ao Projeto
- **Aplicação Publicada:** [SEU_LINK_DO_LOVABLE_AQUI](https://sua-url.lovable.app)
- **Repositório:** [https://github.com/SEU_USUARIO/SEU_REPOSITORIO](https://github.com/SEU_USUARIO/SEU_REPOSITORIO)

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

\`\`\`markdown
[COLE AQUI O MEGA PROMPT DO TÓPICO 1 DESTA RESPOSTA]
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
![Tela Inicial](./docs/screenshot-home.png)

### 2. Diagnóstico de Compatibilidade e Palavras-chave
![Resultado da Análise](./docs/screenshot-match.png)

### 3. Currículo Otimizado Pronto para Exportar
![Versão ATS](./docs/screenshot-ats.png)

*(Dica: Suba os prints na pasta `/docs` do repositório para exibi-los acima)*

---

## 🛡️ Princípio de Integridade
A ferramenta atua estritamente como um formatador estratégico de perfil. Toda e qualquer competência sugerida deve ser revisada e confirmada pelo próprio candidato antes do envio ao RH.
