# TODO
- [ ] Autenticação
    - pegar os dados do usuário
    - validar acesso ao modulo
- [ ] Notificações
    - 

# Modelagem de dados

## Administradores (admins)
- `id`
- `name`
- `email`
- `password`

* manage subscriptions
* manage users


## Assinaturas (subscription)
- `id`
- `name`
- `max_agents`
- `max_contacts`
- `price`

## User
- `id`
- `name`
- `email`
- `password`
- `enabled`

## Workspaces
- `id`
- `user_id`
- `name`
- `subscription_id`

## Modelos de Linguagem (llm)
- `id`
- `name`
- `provider` (Anthropic, OpenAI, Google, MetaAi)
- `model` (claude, gpt4, etc )
- `apiKey`

## Agente (agent)
- `id`
- `name`
- `llm_id`
- `business_name`
- `business_description`
- `can_transfer_to_human`
- `can_send_emojis`
    ## Agent Training
    - `agent_id`
    - `training_type` (text, website, doc)
    - `training_text`

    ## Agent Intents
    - `agent_id`
    - `description`
    - `intent` (gerar_boleto, imprimir_fatura, falar_com_suporte)

## Canal (channel)
- `id`
- `name`
- `platform` (WhatsAppBusiness, WhatsApp)
- `provider` (360dialog, gupshup)
- `agent_id`

## Contato (contact)
- `id`
- `name`
- `email`
- `whatsapp_number`
- `instagram_user`