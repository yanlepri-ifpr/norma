export type Task = {
  id: number;
  title: string;
  phaseId: number;
};

export type Phase = {
  id: number;
  name: string;
  subtitle: string;
};

export const PHASES: Phase[] = [
  { id: 1, name: "Fase 1", subtitle: "Origem e Triagem" },
  { id: 2, name: "Fase 2", subtitle: "Documentos Técnicos" },
  { id: 3, name: "Fase 3", subtitle: "Pesquisa e Fiscalização" },
  { id: 4, name: "Fase 4", subtitle: "Orçamento e Validação" },
];

export const TASKS: Task[] = [
  { id: 1, phaseId: 1, title: "Início do processo pela Autarquia (Origem)" },
  { id: 2, phaseId: 1, title: "Inserir demanda no Cadastro de Intenções do Município" },
  { id: 3, phaseId: 1, title: "Análise e validação pela Central de Compras" },
  { id: 4, phaseId: 1, title: "Verificação de Catálogo Eletrônico (Portaria 107/2023)" },
  { id: 5, phaseId: 2, title: "Construir Documento de Formalização de Demanda (DFD)" },
  { id: 6, phaseId: 2, title: "Construir Matriz de Gerenciamento de Riscos" },
  { id: 7, phaseId: 2, title: "Construir Estudo Técnico Preliminar (ETP)" },
  { id: 8, phaseId: 2, title: "Construir Termo de Referência (TR)" },
  { id: 9, phaseId: 3, title: "Fazer Portaria de Nomeação de Fiscais" },
  { id: 10, phaseId: 3, title: "Construir Mapa Comparativo de Preços" },
  { id: 11, phaseId: 3, title: "Construir Documento de Responsável de Pesquisa de Mercado" },
  { id: 12, phaseId: 3, title: "Fazer o Anexo de Orçamentos" },
  { id: 13, phaseId: 4, title: "Construir Nota de Reserva de Dotação Orçamentária" },
  { id: 14, phaseId: 4, title: "Fazer Minuta do Edital" },
  { id: 15, phaseId: 4, title: "Enviar ao Departamento Jurídico" },
  { id: 16, phaseId: 4, title: "Validação do Jurídico (Aprovar ou Retornar)" },
];

export const FINAL_TASK_ID = 16;

/**
 * Modelo (.docx) fictício de cada etapa, apenas para demonstração do protótipo.
 * O download gera um arquivo de conteúdo simulado com esse nome.
 */
export const TASK_TEMPLATES: Record<number, string> = {
  1: "modelo-origem-processo.docx",
  2: "modelo-cadastro-intencoes.docx",
  3: "modelo-analise-central-compras.docx",
  4: "modelo-verificacao-catmat.docx",
  5: "modelo-formalizacao-demanda-dfd.docx",
  6: "modelo-matriz-gerenciamento-riscos.docx",
  7: "modelo-estudo-tecnico-preliminar-etp.docx",
  8: "modelo-termo-referencia-tr.docx",
  9: "modelo-portaria-fiscais.docx",
  10: "modelo-mapa-comparativo-precos.docx",
  11: "modelo-pesquisa-mercado.docx",
  12: "modelo-anexo-orcamentos.docx",
  13: "modelo-reserva-dotacao-orcamentaria.docx",
  14: "modelo-minuta-edital.docx",
  15: "modelo-protocolo-departamento-juridico.docx",
  16: "modelo-parecer-juridico.docx",
};

export const DEFAULT_REPLY =
  "Boa pergunta! Para esta etapa, informe o objeto da contratação, fundamentos legais e anexe o documento correspondente no campo indicado. Posso detalhar um passo específico quando quiser.";

/**
 * Resposta padrão de cada botão "O que preencho aqui?" por id da tarefa.
 * Custom phases usavam DEFAULT_REPLY.
 */
export const TASK_REPLIES: Record<number, string> = {
  1: "Descreva aqui a unidade demandante, o objeto pretendido, a justificativa resumida da necessidade e a autorização do dirigente da autarquia para abertura do processo.",
  2: "Registre a demanda no Cadastro de Intenções do Município com os dados da necessidade, a estimativa de quantidade e o período pretendido, conforme o modelo da Central de Compras.",
  3: "Documente a análise da Central de Compras sobre a viabilidade da demanda, incluindo o despacho/parecer que aprove o prosseguimento do processo.",
  4: "Consulte o catálogo eletrônico e registre se existe item padronizado (CATMAT) para o objeto, anexando o print da consulta e a referência do código, conforme a Portaria 107/2023.",
  5: "Preencha o DFD com a justificativa da contratação, o detalhamento do objeto, a estimativa preliminar e o vínculo com a demanda registrada no sistema.",
  6: "Identifique os riscos da contratação (probabilidade x impacto) e proponha medidas de mitigação com o responsável por cada um.",
  7: "Estruture o ETP com a necessidade, os requisitos, as estimativas, o levantamento de mercado e a conclusão pela viabilidade do objeto.",
  8: "Detalhe o TR com o objeto, especificações, quantidades, critérios de aceitação, obrigações das partes e sanções aplicáveis.",
  9: "Indique o número da portaria que designa os fiscais da contratação e anexe o documento publicado em diário oficial.",
  10: "Liste os fornecedores consultados e os preços levantados para compor o mapa comparativo e fundamentar a estimativa de preço.",
  11: "Registre o responsável pela pesquisa de mercado, a metodologia adotada e as fontes consultadas para embasar a estimativa.",
  12: "Anexe os orçamentos coletados junto aos fornecedores para fundamentar a formação do preço de referência.",
  13: "Informe o número da nota de reserva de dotação orçamentária que garante os recursos para a despesa.",
  14: "Elabore a minuta do edital com base no TR aprovado, conferindo cláusulas, condições de participação, prazos e itens obrigatórios.",
  15: "Remeta o processo completo ao Departamento Jurídico com todos os documentos encadeados e registre o protocolo/envio.",
  16: "Registre o parecer jurídico final: a aprovação do edital para publicação ou os apontamentos para correção e reenvio.",
};
