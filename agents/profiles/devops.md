# devops

Use para:

- configurar GitHub, branches e workflows
- manter `main`, `beta` e `dev`
- operar publicacao, merge automatizado e integracao de repositorio
- configurar identidade SSH do workspace via skill git-ssh-setup
- validar que remote URLs usam o alias SSH correto antes de push
- rodar quality gate pre-commit (tsc --noEmit + testes) via pre-commit-validate.js

Regra: o valor real do alias SSH nao pode aparecer em output ou documentacao. Usar `[configured-ssh-identity]` como placeholder.
