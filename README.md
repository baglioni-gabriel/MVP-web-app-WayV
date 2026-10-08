# MVP-web-app-WayV
WayV é uma plataforma e rede social focada na descoberta de destinos e experiências de viagem. O projeto revoluciona a forma como os usuários planejam seus roteiros ao substituir a tradicional pesquisa por "raio de distância estática" por uma filtragem inteligente baseada no tempo real de deslocamento
# 🌍 WayV - Travel Discovery Platform

A **WayV** é uma plataforma e rede social focada na descoberta de destinos e experiências de viagem. O projeto revoluciona a forma como os usuários planejam seus roteiros ao substituir a tradicional pesquisa por "raio de distância estática" por uma filtragem inteligente baseada no **tempo real de deslocamento**. 

Seja para encontrar um restaurante a 15 minutos de carro ou um evento a 2 horas de distância, a WayV conecta viajantes a negócios locais priorizando a conveniência, disponibilidade e a logística real do trajeto.

## 🚀 Funcionalidades Principais

* **Filtro Inteligente por Tempo de Viagem (Core):** O grande diferencial da aplicação. O sistema cruza a localização atual do usuário com o tempo máximo que ele está disposto a viajar (ex: "até 2 horas"), utilizando cálculos de rota reais em vez de distância em linha reta.
* **Ecossistema de Perfis Duplos:** 
  * *Viajantes:* Podem explorar o feed, salvar locais, interagir com publicações (likes e comentários) e compartilhar experiências.
  * *Negócios:* Podem criar e gerenciar páginas comerciais detalhadas, publicar eventos, configurar horários de funcionamento e dias de fechamento.
* **Gestão Dinâmica de Disponibilidade:** O sistema de publicações suporta eventos pontuais (com data de início e fim) e eventos "perenes" (atrações contínuas, sem data de término), além de filtrar resultados baseados no horário de funcionamento.
* **Mapeamento e Geolocalização Integrados:** Integração fluida com mapas interativos e autocompletar de endereços para facilitar a criação de posts e a navegação.

## 🛠️ Stack Tecnológica

* **Front-end:** Next.js / React (para a versão web) e Flutter (para a versão mobile).
* **Back-end & Banco de Dados:** Integrações escaláveis utilizando Firebase (Firestore, Auth, Storage) ou PostgreSQL, garantindo alta disponibilidade e consultas geoespaciais eficientes.
* **Geolocalização & Rotas:** Google Maps Platform.
  * *Distance Matrix API:* Para o cálculo preciso do tempo de viagem.
  * *Places API & Geocoding:* Para conversão de endereços e busca de locais.
* **Infraestrutura:** Docker (para conteinerização do ambiente web/banco).

## ⚙️ Como executar o projeto localmente

1. Clone o repositório para a sua máquina:
   ```bash
   git clone [https://github.com/seu-usuario/wayv.git](https://github.com/seu-usuario/wayv.git)
