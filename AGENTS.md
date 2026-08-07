# Instruções do Usuário

- **Script do Google Colab**: Quando for necessário modificar o script do Google Colab (lógica de backend que roda no Colab), o agente NÃO deve modificar o arquivo local (`colabScript.ts`). Em vez disso, o agente deve gerar e fornecer um "prompt" detalhado para que o usuário copie e cole na IA do Google Colab para que ela mesma atualize o script no notebook.
