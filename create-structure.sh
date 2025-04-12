#!/bin/bash

mkdir -p backend/alembic/versions
mkdir -p backend/app/{core,db,models,schemas,api/api_v1/endpoints,services,utils}
mkdir -p backend/tests/{test_api,test_services}
mkdir -p frontend/public/assets
mkdir -p frontend/src/{assets/{styles,images},components/{common,layout,budget,transactions},pages,hooks,services,store/slices,utils,types}

touch README.md .gitignore docker-compose.yml .env.example
touch backend/{alembic.ini,pyproject.toml,poetry.lock,Dockerfile,.env}
touch backend/app/{main.py,__init__.py}
touch backend/app/core/{__init__.py,config.py,security.py,dependencies.py}
touch backend/app/db/{__init__.py,base.py,session.py}
touch backend/app/models/{__init__.py,user.py,budget.py,category.py,transaction.py}
touch backend/app/schemas/{__init__.py,user.py,budget.py,category.py,transaction.py}
touch backend/app/api/{__init__.py,deps.py,api.py}
touch backend/app/api/api_v1/{__init__.py,router.py}
touch backend/app/api/api_v1/endpoints/{__init__.py,login.py,users.py,budgets.py,categories.py,transactions.py}
touch backend/app/services/{__init__.py,budget_engine.py,auth.py}
touch backend/app/utils/{__init__.py,currency.py}
touch backend/tests/{__init__.py,conftest.py}
touch backend/tests/test_api/{__init__.py,test_budgets.py,test_transactions.py}
touch backend/tests/test_services/{__init__.py,test_budget_engine.py}
touch frontend/{package.json,tsconfig.json,vite.config.ts,.eslintrc.js,.prettierrc,Dockerfile,.env}
touch frontend/src/index.tsx frontend/src/App.tsx
touch frontend/src/components/common/{Button.tsx,Input.tsx,Card.tsx}
touch frontend/src/components/layout/{Header.tsx,Sidebar.tsx,Footer.tsx}
touch frontend/src/components/budget/{BudgetList.tsx,BudgetForm.tsx,CategoryGroup.tsx}
touch frontend/src/components/transactions/{TransactionList.tsx,TransactionForm.tsx}
touch frontend/src/pages/{Dashboard.tsx,Budget.tsx,Transactions.tsx,Reports.tsx,Settings.tsx}
touch frontend/src/hooks/{useAuth.ts,useBudget.ts}
touch frontend/src/services/{api.ts,budgetService.ts,transactionService.ts}
touch frontend/src/store/{index.ts,middleware.ts}
touch frontend/src/store/slices/{authSlice.ts,budgetSlice.ts,transactionSlice.ts}
touch frontend/src/utils/{formatters.ts,validators.ts}
touch frontend/src/types/{index.ts,budget.ts,transaction.ts}

echo "✅ Structure created."
