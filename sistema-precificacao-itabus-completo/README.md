# Sistema de Precificação Itabus

Sistema completo de precificação para empresa de adesivos, desenvolvido com React.js (frontend) e Flask (backend).

## Funcionalidades

- **Autenticação de usuários** com diferentes níveis de acesso (Admin, Usuário)
- **Hierarquia de itens** em 3 níveis (Categoria, Subcategoria, Especificação)
- **Gestão de taxas globais** (margem mínima e ideal de lucro)
- **Criação de projetos de precificação** com cálculo automático
- **Histórico de projetos** salvos
- **Interface responsiva** e intuitiva

## Credenciais Padrão

- **Email:** admin@itabus.com
- **Senha:** admin123

## Estrutura do Projeto

```
/
├── itabus-pricing-system/     # Backend Flask
│   ├── src/
│   │   ├── main.py           # Arquivo principal
│   │   ├── models/           # Modelos de dados
│   │   ├── routes/           # Rotas da API
│   │   └── database/         # Banco de dados SQLite
│   ├── venv/                 # Ambiente virtual Python
│   └── requirements.txt      # Dependências Python
│
└── itabus-frontend/          # Frontend React
    ├── src/                  # Código fonte React
    ├── dist/                 # Build de produção
    └── package.json          # Dependências Node.js
```

## Tecnologias Utilizadas

- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Flask, SQLAlchemy, Flask-CORS
- **Banco de Dados:** SQLite
- **Autenticação:** JWT (JSON Web Tokens)

## Como Executar Localmente

### Backend
```bash
cd itabus-pricing-system
source venv/bin/activate
python src/main.py
```

### Frontend (Desenvolvimento)
```bash
cd itabus-frontend
pnpm install
pnpm run dev
```

### Frontend (Produção)
```bash
cd itabus-frontend
pnpm run build
# Os arquivos estarão em dist/
```

## Implantação

O sistema está preparado para implantação em plataformas gratuitas como:
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Railway, Render, Heroku (plano gratuito)

Consulte o guia de instalação detalhado para instruções específicas.

