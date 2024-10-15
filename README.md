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
  <a href="https://www.npmjs.com/package/@docusaurus/core"><img src="https://img.shields.io/npm/v/@docusaurus/core.svg?style=flat" alt="npm version"></a>
</p>

## Introdução

DINO é um projeto de plataforma de ingestão de arquivos manuais. O projeto foi idealizado para atender ao Case do Programa Data Master, trazendo uma solução para um problema real das áreas de negócio do banco.


## Contexto

Em alguns projetos do banco, há a necessidade de ingestão de arquivos gerados pela área de negócios e/ou por algum fornecedor, cujos dados não necessariamente ocorrem com uma periodicidade ou frequência pré-definida. Ou seja, podem ocorrer uma vez por mês ou cinco vezes por dia.
No contexto atual desses projetos, os arquivos são disponibilizados em diretórios na rede. Uma rotina realiza a movimentação para um servidor intermediário, e outra rotina envia esse arquivo para o ambiente de big data, onde o dado é utilizado. Nem sempre ele é utilizado como uma tabela, podendo ser usado apenas como um arquivo de parâmetro para uma rotina específica.

## Proposta

Para atender à necessidade da área de negócios, deverá ser criado um portal no qual o usuário poderá realizar o upload de arquivos. Neste primeiro momento será apresentado apenas uma tela, que possibilitará o upload dos arquivos e acompanhamento dos custos atrelados.
Outras funcionalidades serão adicionadas posteriormente, conforme a demanda.

## Arquitetura
![image](https://github.com/user-attachments/assets/07e846b5-8efe-496f-b61c-702fa3eab4cc)



