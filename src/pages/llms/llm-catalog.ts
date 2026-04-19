export type LlmModelOption = {
  value: string;
  label: string;
};

export type LlmProviderCatalogItem = {
  value: string;
  label: string;
  models: LlmModelOption[];
};

// Fonte única para providers e modelos disponíveis no formulário de LLMs.
// Para manter a lista, basta adicionar/remover itens deste array.
export const LLM_PROVIDER_CATALOG: LlmProviderCatalogItem[] = [
  {
    value: 'OPENAI',
    label: 'OpenAI',
    models: [
      { value: 'gpt-4.1', label: 'GPT-4.1' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
  },
  {
    value: 'GOOGLE',
    label: 'Google',
    models: [
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-3.1-fast', label: 'Gemini 3.1 Fast' },
    ],
  },
  // {
  //   value: 'ANTHROPIC',
  //   label: 'Anthropic',
  //   models: [
  //     { value: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet' },
  //     { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  //     { value: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku' },
  //   ],
  // },
  // {
  //   value: 'META',
  //   label: 'Meta',
  //   models: [
  //     { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
  //     { value: 'llama-3.1-405b', label: 'Llama 3.1 405B' },
  //     { value: 'llama-3.1-70b', label: 'Llama 3.1 70B' },
  //   ],
  // },
  // {
  //   value: 'MISTRAL',
  //   label: 'Mistral',
  //   models: [
  //     { value: 'mistral-large', label: 'Mistral Large' },
  //     { value: 'mistral-small', label: 'Mistral Small' },
  //     { value: 'codestral', label: 'Codestral' },
  //   ],
  // },
  // {
  //   value: 'DEEPSEEK',
  //   label: 'DeepSeek',
  //   models: [
  //     { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  //     { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  //   ],
  // },
  // {
  //   value: 'GROQ',
  //   label: 'Groq',
  //   models: [
  //     { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
  //     { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B 32K' },
  //     { value: 'gemma2-9b-it', label: 'Gemma 2 9B IT' },
  //   ],
  // },
];

export function getProviderLabel(provider: string) {
  return (
    LLM_PROVIDER_CATALOG.find((item) => item.value === provider)?.label ??
    provider ??
    'Provider'
  );
}

export function getModelOptionsByProvider(provider: string) {
  return LLM_PROVIDER_CATALOG.find((item) => item.value === provider)?.models ?? [];
}
