<div align="center">
  <h1 align="center">
    DINO - Data Ingestion Non Optimized
    <br />
    <br />
    <a href="">
      <img src="https://github.com/user-attachments/assets/4e5bd449-aedb-479c-b54b-0b013f9eaf0d" alt="DINO">
    </a>
  </h1>
</div>

<p align="center">
  <a href="#status" alt="Estado do Projeto"><img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=flat" /></a>
   <a href=""><img src="https://img.shields.io/badge/npm-10.8.2-blue" alt="python version"></a>
  <a href=""><img src="https://img.shields.io/badge/python-3.12.6-green" alt="python version"></a>
</p>

## Introdução

DINO é uma plataforma para ingestão de arquivos manuais, criada para solucionar um problema recorrente em áreas de negócio. O objetivo principal é otimizar o processo de upload e integração de arquivos em ambientes de big data cloud, oferecendo uma solução escalável e amigável.


## Contexto

Alguns projetos necessitam da ingestão de arquivos gerados pela área de negócios e/ou por algum fornecedor sem uma periodicidade definida, podendo variar de uma vez por mês a várias vezes por dia. Atualmente, esse processo envolve a movimentação manual de arquivos para diretórios de rede e sua posterior carga em ambientes de big data. Nem todos esses dados são usados como tabelas, alguns são utilizados apenas como parâmetros.


## Proposta

A solução proposta é a criação de um portal web que permite o upload de arquivos diretamente pelos usuários. Inicialmente, o sistema terá uma tela para upload e acompanhamento de custos. Futuramente, outras funcionalidades serão adicionadas de acordo com as necessidades do projeto.


## Arquitetura

A arquitetura do sistema é baseada em tecnologias cloud, utilizando Databricks para processamento de dados e Azure para armazenamento e análise de custos.
![image](https://github.com/user-attachments/assets/07e846b5-8efe-496f-b61c-702fa3eab4cc)


## Requisitos Funcionais

- `Ingestão de Arquivos CSV`: Permitir que o usuário faça o upload de arquivos CSV e especifique o banco de dados e a tabela de destino.
- `Monitoramento de Custos`: Exibir indicadores como custo total, quantidade de arquivos e o tamanho total dos dados ingeridos.


## Requisitos Não Funcionais

- `Sistema Web`: Interface intuitiva para usuários realizarem uploads e acompanharem as ingestões.
- `Arquitetura Cloud`: Implementação escalável, com alta disponibilidade e resiliência, utilizando serviços da Azure e Databricks.

## Requisitos Técnicos
Os requisitos englobam o desenvolvimento de rotinas para atender aos requisitos funcionais propostos utilizando uma arquitetura cloud e desenvolvimento de rotinas utilizando Python, Spark, SQL, assim como o desenvolvimento de um portal web para interação do usuário.

### Camada de Apresentação
Para atender aos requisitos funcionais, deverá ser criado um portal web, onde seja possível a interação do usuário de forma simples e possibilite que seja feito as ingestões contempladas nesse projeto apenas fornecendo algumas informações pertinentes.
Nesse portal também deverá haver KPIs fornecendo informações sobre execuções, consumo e custos estimados das ingestões feitas pelo usuário.

- `Portal`:
  ![image](https://github.com/user-attachments/assets/9bb110f8-5d56-437d-909a-2beacd5c8c5b)

### Camada de Negócio

#### Camada de Dados
- `Armazenamento dos Arquivos`: Os arquivos serão armazenados no Storage Account até que o processo de ingestão seja finalizado.
- `Lakehouse`: Os dados ingeridos na tabela serão armazenados no Storage Account no formato Delta.
- `KPI`: As informações de KPIs serão recuperadas do Azure Cost Analysis e armazenadas numa tabela do Azure SQL Database.
- `Log`: O log das ingestões serão armazenados numa tabela do Azure SQL Database.

## Fora de Escopo

- `Tela de Login`: No momento, não será implementada uma tela de login.
- `Controle de Acesso`: Somente o owner e admin da workspace serão capazes de utilizar os dados ingeridos.

## Melhorias

- `Suporte a Vários Formatos de Arquivo`:
Atualmente, o sistema suporta apenas ingestão de arquivos CSV. No futuro, pode-se expandir o suporte para outros formatos de dados, como JSON, XML e Parquet, atendendo a uma maior variedade de casos de uso.

- `Validação de Arquivos no Upload`:
Adicionar uma funcionalidade de validação automática dos arquivos antes do upload, como checagem de integridade e estrutura correta dos dados, para evitar falhas no processo de ingestão.

- `Autenticação e Controle de Acesso (SSO)`:
A implementação de autenticação via Single Sign-On (SSO) e controle de acesso granular pode melhorar a segurança, permitindo que apenas usuários autorizados acessem e façam uploads de arquivos.

- `Relatórios e Dashboards Interativos`:
Oferecer dashboards interativos com visualizações dos KPIs (como ingestões realizadas, custo total, consumo de dados) pode agregar valor, permitindo que os usuários acompanhem o desempenho e o uso da plataforma de forma mais intuitiva.

- `Integração com APIs Externas`:
Permitir que o sistema aceite arquivos diretamente via API, facilitando integrações com outras plataformas e sistemas externos que necessitem realizar uploads de dados automaticamente.

- `Automatização de Processos Repetitivos`:
Incluir agendamento de tarefas (scheduler) para permitir que ingestões repetitivas sejam automatizadas, economizando tempo e reduzindo a intervenção manual.

- `Logs Avançados e Alertas`:
Melhorar o sistema de logs com um painel detalhado de falhas e sucesso nas operações de ingestão, além de implementar alertas automáticos para o time de suporte em caso de erros críticos.

- `Suporte Multilíngue` :
Adicionar suporte a múltiplos idiomas no portal web para atender equipes internacionais, melhorando a experiência do usuário.

## Considerações Finais
O projeto DINO visa fornecer uma solução robusta e escalável para a ingestão de arquivos manuais em ambientes de big data, resolvendo um problema crítico nas operações de ingestão de dados de forma eficiente. O desenvolvimento futuro focará na expansão das funcionalidades e na otimização de processos, garantindo uma experiência de usuário fluida e oferecendo insights claros através de monitoramento de custos e KPIs.

Com a adição das features mencionadas, o sistema pode se tornar ainda mais poderoso e flexível, atendendo a uma gama mais ampla de necessidades e proporcionando maior automação e controle às áreas de negócio.

## Técnicas e tecnologias utilizadas

- **Linguagens:** ``Python``, ``TypeScript``, ``React``
- **Ferramentas:** ``Visual Studio Code``, ``Databricks``
- **Tecnologias:** ``Spark``, ``Azure (Storage Account, SQL Database, Cost Analysis, DevOps)``
