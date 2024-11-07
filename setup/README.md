# Guia para Criação Manual dos Recursos no Azure
Este guia orienta sobre a criação manual de cada recurso definido no template ARM, diretamente no Azure Portal.

## Pré-requisitos
 - Acesse o Azure Portal.
 - Verifique se você tem as permissões necessárias para criar recursos na sua assinatura e grupo de recursos desejado.

### Passo 1: Criar o Workspace Databricks
 - No Azure Portal, vá para Criar um recurso > Databricks > Azure Databricks.
 - Selecione a Assinatura e o Grupo de recursos.
 - Nomeie o workspace como azdbdino001.
 - Escolha a Localização como "East US".
 - Em Plano de preço, escolha Premium.
 - Clique em Revisar e criar e, em seguida, em Criar.
 - Habilite o Unity Catalog (https://learn.microsoft.com/pt-br/azure/databricks/data-governance/unity-catalog/get-started)
 - Habilite o Serverless Compute (https://learn.microsoft.com/en-us/azure/databricks/admin/workspace-settings/serverless)
 - Criar o diretório "dino_workspace"
 - Subir o arquivo DINO.dbc no diretório "dino_workspace"

### Passo 2: Criar o Key Vault
 - Vá para Criar um recurso > Segurança > Key Vault.
 - Nomeie o Key Vault como azkvdino001.
 - Escolha a Assinatura, Grupo de recursos e Localização "East US".
 - Em Preço, escolha Standard.
 - No painel de rede, configure Acesso à rede pública como Habilitado.
 - Clique em Revisar e criar e em Criar.
 - Adicionar Políticas de Acesso

Após a criação:

 - Vá para Políticas de acesso.
 - Clique em Adicionar política de acesso.
 - Conceda permissões de Listar e Obter para Segredos.
 - Clique em Adicionar e depois em Salvar.

### Passo 3: Criar as Contas de Armazenamento
 - Conta de Armazenamento 1 (azstadino002)
 - Vá para Criar um recurso > Armazenamento > Conta de Armazenamento.
 - Nomeie a conta de armazenamento como azstadino002.
 - Escolha Localização como "East US" e o Desempenho como Standard.
 - Em Redundância, escolha LRS (Locally-redundant storage).
 - Em Configurações Avançadas, habilite Hierarchical Namespace (HNS) para suporte ao Azure Data Lake Gen2.
 - Clique em Revisar e criar e depois em Criar.

### Passo 4: Criar Containers nas Contas de Armazenamento
 - Criar Containers na Conta azstadino002
 - Acesse a conta de armazenamento azstadino002.
 - Vá para Serviços de dados > Containers.
 - Crie os seguintes containers:
  - databases
  - stage

### Passo 5: Criar o Static Web App
 - Vá para Criar um recurso > Estático > Aplicativo Web Estático.
 - Nomeie o aplicativo como dino.
 - Selecione o Plano Gratuito.
 - Em Fonte de Código, selecione GitHub e forneça o URL do repositório (https://github.com/ramosbrunno/dino_data_master).
 - Escolha o Branch como main.
 - Clique em Revisar e criar e depois em Criar.
 - Configuração de Autenticação Básica (opcional)
 - Acesse o Static Web App criado.
 - Em Configurações, habilite a autenticação básica se desejado.
 - Em Configurações>Variaveis de Ambiente, adicione as seguintes variáveis:
   - AZURE_ADLS_ACCOUNT_KEY = <your_azure_adls_account_key>
   - AZURE_ADLS_ACCOUNT_KEY = <your_azure_adls_account_key>
   - AZURE_ADLS_CONTAINER_NAME = stage
   - AZURE_CLIENT_ID = <your_azure_client_id>
   - AZURE_CLIENT_SECRET = <your_azure_client_secret>
   - AZURE_RESOURCE_GROUP_NAME = <your_azure_resource_group_name>
   - AZURE_SUBSCRIPTION_ID = <your_azure_subscription_id>
   - DATABRICKS_INSTANCE = <your_databricks_instance>
   - DATABRICKS_TOKEN = <your_databricks_token>



# Guia para Criação Automatizada dos Recursos no Azure

 - Este guia fornece um passo a passo para criar e configurar os recursos no Azure utilizando o template ARM fornecido.

## Pré-requisitos

 - **Azure CLI**: Certifique-se de que a Azure CLI está instalada e autenticada.
 - **Assinatura do Azure**: Uma assinatura ativa do Azure.
 - **Permissões**: Permissões suficientes para criar recursos no grupo de recursos especificado.

## Como Usar este Template

 - Clone este repositório ou baixe o template ARM.
 - Abra o terminal e navegue até o diretório onde o template JSON está localizado.
 - Execute o comando abaixo para implantar o template no Azure:

   ```bash
   az deployment group create --resource-group <Nome-do-Grupo-de-Recursos> --template-file setup/setup_dino.json

## Após a finalização do script

 - Habilite o Unity Catalog (https://learn.microsoft.com/pt-br/azure/databricks/data-governance/unity-catalog/get-started)
 - Habilite o Serverless Compute (https://learn.microsoft.com/en-us/azure/databricks/admin/workspace-settings/serverless)
 - Criar o diretório "dino_workspace"
 - Subir o arquivo DINO.dbc no diretório "dino_workspace"
 - Acesse o Static Web App criado.
 - Em Configurações, habilite a autenticação básica se desejado.
 - Em Configurações>Variaveis de Ambiente, adicione as seguintes variáveis:
   - AZURE_ADLS_ACCOUNT_KEY = <your_azure_adls_account_key>
   - AZURE_ADLS_ACCOUNT_KEY = <your_azure_adls_account_key>
   - AZURE_ADLS_CONTAINER_NAME = stage
   - AZURE_CLIENT_ID = <your_azure_client_id>
   - AZURE_CLIENT_SECRET = <your_azure_client_secret>
   - AZURE_RESOURCE_GROUP_NAME = <your_azure_resource_group_name>
   - AZURE_SUBSCRIPTION_ID = <your_azure_subscription_id>
   - DATABRICKS_INSTANCE = <your_databricks_instance>
   - DATABRICKS_TOKEN = <your_databricks_token>
